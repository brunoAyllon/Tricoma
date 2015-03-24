#pragma strict
import UnityEditor;

// The objectv we draw when the puzzle is completed
public var completionObject:GameObject;
public var timeToreturnToMenu:float;

// What file should we read the victory coditions from ?
public var victoryInputFile:TextAsset = null;
// Stores type and color of the victory node
private var victoryGrid:VictoryNode[,];
// All the hint nodes that will be displayed
private var hintGrid:HintNode[,];

// File to load save data from
public var saveDataInputFile:TextAsset;

// File to load hint data from
public var hintDataInputFile:TextAsset;
// The prefab of the hint object we are going to use
public var hintObjectToReplicate:GameObject;
// Should we show the hints by default ?
public var drawHintsByDefault:boolean;
// Should we draw the hints ? Used for the draw hint toggle
private var drawHint:boolean;

// The particle system used to show the results of adding and subtracting colors
public var particleSystemObject:GameObject;

// Added to the particle color to distinguish it from the tile itself
public var particleColorAdjustment:Color;

// This script RERQUIRES being attached to an object with a CreateGrid component
private var gridScript:CreateGrid  = null;

// How many correct tiles did the grid have once we created it ?
private var initialCorrectTiles:int;

// How many tiles are correct at the moment ?
/* Observation: The Perform Undo function documentation states: "This performs a undo operation. It is the same as clicking on the Edit->Undo menu."
   However, what they don't tell you is that if the variable cannot be altered in the editor, it will not be recorded. Therefore, we make it editable (public)
   and hide that from the Editor. In summary, sometimes, Unity can be beyond stupid. 
*/
@HideInInspector public var currentCorrectTiles: int;
// How many tiles must have the correct color 
private var desiredCorrectTiles:int;

// Node Type, invalid nodes will not be considered as changeable
enum VictoryNodeType{Node_Invalid, Node_Normal};

// Which object are we getting the color from ?
private var colorManipFrom:String = String.Empty; 
// Which object are we giving the color to ?
private var colorManipTo:String = String.Empty;  

// How many undos and redos we can still perform
private var numberOfUndos:int;
private var numberOfRedos:int;

// Stores a reference to the level manager
private var levelManager:GameObject;

// Should we load the current state of the game from the file
private var shouldLoadSave:boolean;

// Are we manipulating a valid node 
private var insideValidNode:boolean;
private var validNodeName:String;

// Stores data of hint nodes
class HintNode extends System.ValueType
{
	// The game object that represents the node
	public var hintObject:GameObject;
}

// Holds node information
class VictoryNode extends System.ValueType
{
	// Self explanatory
	public var typeOfNode:VictoryNodeType;
	public var desiredColor:Color;
	
	// Node constructor
	public function VictoryNode( nodeType:VictoryNodeType, nodeColor:Color)
	{
		typeOfNode = nodeType;
		desiredColor = nodeColor;
	}
	
	// Was it initialized ?
	public function isValid():boolean
	{
		return typeOfNode != VictoryNodeType.Node_Invalid;
	}
	
	// Is the given color the one we need to consider this node correct ?
	public function isDesiredColor(colorToCheck:Color)
	{
		return colorToCheck == desiredColor;
	}
}

// Activated by message, undoes a player move
public function UndoMove():void
{
	// If there are still undos left
	if(numberOfUndos)
	{
		Undo.PerformUndo();
		--numberOfUndos;
		++numberOfRedos;
	}
}

// Activated by message, redoes a player move
public function RedoMove():void
{
	// If there are still redos left
	if(numberOfRedos)
	{
		Undo.PerformRedo();
		--numberOfRedos;
		++numberOfUndos;
	}
}


// Called when we receive a message from a reset button
public function ResetLevel()
{
	Debug.Log("ResetLevel");
	// Restore all nodes to their default color
	for (var i:int = 0; i < gridScript.numberOfRows; ++i)
	{
		for(var j:int = 0; j < gridScript.numberOfColumns; ++j)
		{
			gridScript.objectRenderer[i, j].material.color = gridScript.startingColors[i, j];
		}
	}
	// reset correct node count
	currentCorrectTiles = initialCorrectTiles;
}

public function LevelIsComplete(value:boolean):void
{
	// If the level is complete, draw the completion object
	if(completionObject)
	{
		completionObject.SetActive(value);
	}
}

public function LoadSaveFile(dataFile:TextAsset):boolean
{
	// If we have a valid save file
	if ( saveDataInputFile != null )
	{
		// Check if it is not empty
		var allTheText:String[] = saveDataInputFile.text.Split("\n"[0]);
		if(allTheText.Length == 0)
		{
			return false;
		}
		
		// Now read the data from the files
		currentCorrectTiles = int.Parse(allTheText[0]);
		
		var i:int = 1;
		for (var colorRenderer in gridScript.objectRenderer)
		{
			 var data:String[] = allTheText[i].Replace(" ", "").Replace("(", "").Replace(")", "").Split(','[0]);
			 Debug.Log(int.Parse(data[0])+" , "+data[1]+" , "+data[2]+" , "+data[3]);
			 colorRenderer.material.color = Color(int.Parse(data[0]), int.Parse(data[1]), int.Parse(data[2]), int.Parse(data[3]));
			 
			 ++i;
		}
		
		return true;
	}
	return false;
}

// Called by the hint button
public function ToggleDrawHint():void
{
	// Toggle the button state
	drawHint = !drawHint;
	// Draws the button or makes it invisible
	DrawHintTiles(drawHint);
}

public function DrawHintTiles(value:boolean):void
{
	// Make the hint tiles visible
	for (var node:HintNode in hintGrid)
	{
		node.hintObject.SetActive(value);
	}
}

public function LoadHintFile():void
{
	// If we have a valid hint file and hint object
	if ( hintDataInputFile && hintObjectToReplicate)
	{
		// If the hint grid was not initialized, do so
		if (hintGrid == null)
		{
			hintGrid = new HintNode[gridScript.numberOfRows, gridScript.numberOfColumns];
		}
			
		// Now go through the grid
		for(var currentRow = 0.0; currentRow < gridScript.numberOfRows; ++currentRow)
		{
			// Now read the color values from file
			for(var currentColumn = 0.0; currentColumn < gridScript.numberOfColumns; ++currentColumn)
			{	
				Debug.Log(currentRow+" , "+currentColumn);
				
				// Draw the hint object in the same position as the parent
				var positionToDraw:Vector3 = Vector3(0.0, 0.0, 0.0);
				// Now create the object
				hintGrid[currentRow, currentColumn].hintObject = Instantiate(hintObjectToReplicate, positionToDraw, Quaternion.identity) as GameObject;
				// And make it a child of the respective tile
				hintGrid[currentRow, currentColumn].hintObject.transform.SetParent( gridScript.objectRenderer[currentRow, currentColumn].gameObject.transform, false);
				// And give it a name so it is easy to find it in the inspector
				hintGrid[currentRow, currentColumn].hintObject.name = "Desired Color";
			}
		}
		
		// Start parsing the data
		var dataParseMode:DataParse = DataParse.None;
		
		var allTheText = hintDataInputFile.text.Split("\n"[0]);
		
		var currentRoadRead:int = 0;
		
		// For each line
		for (currentLine in allTheText)
		{	
			var data:String[] = currentLine.ToUpper().Replace(" ", "").Replace("(", "").Replace(")", "").Split(','[0]);
			
			// Choose parse mode
			if(data[0].Contains("COLORMATRIX:"))
			{
				dataParseMode = DataParse.nodeColor;
			}
			
			// In case the user did not switch what kind of data he is parsing in
			else
			{
				switch (dataParseMode)
				{
					// Invalid line
					case DataParse.None:
						Debug.Log("Invalid file format");
						break;
					
					// 	If we already have the number of rows and columns in the grid, read the data 
					case DataParse.nodeColor:
						if(gridScript.numberOfRows < 0 ||  gridScript.numberOfColumns < 0)
						{
							Debug.Log("Matrix size not established");
						}
						
						else
						{
							
							// Now read the color values from file
							for(var j:int = 0.0; j < gridScript.numberOfColumns; ++j)
							{
								// Trasform the strings into RGB format
								var rgbColor = gridScript.HexValueToRGB(data[j]);
								// And store them
								var renderer:SpriteRenderer = hintGrid[currentRoadRead, j].hintObject.GetComponent(SpriteRenderer);
								if(renderer)
								{
									renderer.color = rgbColor;
								}
							}
						}
						++currentRoadRead;
						break;
				}
			}			
		}
		
		DrawHintTiles(drawHintsByDefault);
	}
}

public function SaveGameToFile(dataFile:TextAsset):void
{
	// If we have a valid file
	if ( saveDataInputFile != null )
	{
		// Get the path to it
		var path:String =  AssetDatabase.GetAssetPath(saveDataInputFile);
		// Record the number of correct tiles
		var data:String = currentCorrectTiles+"\n";
		// And their colors
		for (var colorRenderer in gridScript.objectRenderer)
		{
			var colorToSave:Color = colorRenderer.material.color;
			data+= " ( "+colorToSave.r+" , "+colorToSave.g+" , "+colorToSave.b+" , "+colorToSave.a +" )\n";
		}
		// And write them all to the file
		System.IO.File.WriteAllText(path, data);	
	}
}

public function RegisterLevelManager(theLevelManager:GameObject)
{
	Debug.Log("Hello level manager");
	levelManager = theLevelManager;
}

public function LoadSave(value:boolean):void
{
		shouldLoadSave = value;
}

public function NotifyVictory()
{
	// Tell the level manager that the level is complete
	if(levelManager != null)
	{
		levelManager.SendMessage("CompleteLevel", Application.loadedLevel, SendMessageOptions.DontRequireReceiver);
		yield WaitForSeconds(timeToreturnToMenu);
		levelManager.SendMessage("GoBackToMenu", SendMessageOptions.DontRequireReceiver);
	}
	Debug.Log("COMPLETE");
	// And draw the level complete object
	LevelIsComplete(true);
}

public function NotifyLevelIncomplete():void
{
	// Tell the level manager that the level is not completed yet
	if(levelManager != null)
	{
		levelManager.SendMessage("ContinueLevel", Application.loadedLevel, SendMessageOptions.DontRequireReceiver);	
	}
}

// Called by the instantiated object's collider 
public function StartColorManip(colliderName:String)
{
	// Register which node we are taking the color from
	colorManipFrom = colliderName;
	Debug.Log("From: "+colorManipFrom);
	if(particleSystemObject != null)
	{
		particleSystemObject.SetActive(true);
	}
}

// Called by the instantiated object's collider 
public function EndColorManip(colliderName:String)
{
	// Register which node we are taking the color to
	colorManipTo = colliderName;
	// If they are not the same and they are both valid 
	if(colorManipTo != colorManipFrom && colorManipTo!=String.Empty && colorManipFrom!=String.Empty)
	{
		// Used to check if the edge is valid
		//var isConnected:boolean = false;
		// What kind of operation is done by that edge ?
		//var operationType:EdgeType;
		
		// Get the obejct's position on the grid
		var From:Vector2   = gridScript.getObjectPositionFromName(colorManipFrom);
		var To:  Vector2   = gridScript.getObjectPositionFromName(colorManipTo);
		
		var edgeFound:Edge = gridScript.getEdge(To, From);
		
		// If the edge is not connected, we have an error
		if(!edgeFound.isValid())
		{
			Debug.Log("Invalid edge");
		}
		else
		{
			// Finally, call the appropriate color operation
			switch (edgeFound.type)
			{	
				case EdgeType.edgePlus:
					AddColor(From, To);
					break;
					
				case EdgeType.edgeMinus:
					SubColor(From, To);
					break;
			}
			
		}
		
		
	}
	
	// Reset the values
	colorManipFrom = String.Empty;
	colorManipTo = String.Empty;
	
	if(particleSystemObject != null)
	{
		particleSystemObject.SetActive(false);
		SetParticlesColor(Color.black);
	}
}

// Getter for the particle color
public function GetParticlesColor():Color
{
	if(particleSystemObject != null)
	{
		return particleSystemObject.GetComponent (ParticleSystem).startColor;
	}
	
	return Color.black;
}

// Setter for the particle color
public function SetParticlesColor(newColor:Color):void
{
	if(particleSystemObject != null)
	{
		var newParticleColor = newColor;
		// Make sure the values are in a valid color range
		newParticleColor.r = Mathf.Clamp(newParticleColor.r, 0.0, 1.0);
		newParticleColor.g = Mathf.Clamp(newParticleColor.g, 0.0, 1.0);
		newParticleColor.b = Mathf.Clamp(newParticleColor.b, 0.0, 1.0);
		// And assign the new color
		particleSystemObject.GetComponent (ParticleSystem).startColor = newParticleColor;
	}
}

public function StartParticleManipulation(nodeName:String):void
{
	Debug.Log("From "+colorManipFrom);
	Debug.Log("Hello "+nodeName);
	var position:Vector2 = gridScript.getObjectPositionFromName(nodeName);
	if(particleSystemObject != null && !gridScript.isEmptyTile(position))
	{
		if (nodeName == colorManipFrom)
		{
			Debug.Log("Hello particles begin");
			SetParticlesColor(gridScript.objectRenderer[position.x, position.y].material.color);
		}
		else
		{
			Debug.Log("Hello particles neighbor");
			var From:Vector2   = gridScript.getObjectPositionFromName(colorManipFrom);
			var To:  Vector2   = gridScript.getObjectPositionFromName(nodeName);
		
			var edgeFound:Edge = gridScript.getEdge(To, From);
			
			if(edgeFound.isValid())
			{
				// Set the particle manipulation as active
				insideValidNode = true;
				validNodeName = nodeName;
				
				// Finally, call the appropriate color operation
				switch (edgeFound.type)
				{	
					case EdgeType.edgePlus:
						SetParticlesColor(GetParticlesColor() + gridScript.objectRenderer[position.x, position.y].material.color);
						break;
						
					case EdgeType.edgeMinus:
						SetParticlesColor(GetParticlesColor() - gridScript.objectRenderer[position.x, position.y].material.color);
						break;
				}
			}
		}
	}
}

public function EndParticleManipulation(nodeName:String):void
{
	if(particleSystemObject != null && insideValidNode && validNodeName == nodeName )
	{
		// Set the particle manipulation as inactive
		insideValidNode = false;
		
		// Check if there is a valid edge to the node
		var From:Vector2   = gridScript.getObjectPositionFromName(colorManipFrom);
		var To:  Vector2   = gridScript.getObjectPositionFromName(nodeName);
		var edgeFound:Edge = gridScript.getEdge(To, From);
			
		if(edgeFound.isValid())
		{	
			// Call the appropriate color reversal operation
			switch (edgeFound.type)
			{	
				case EdgeType.edgePlus:
					SetParticlesColor(GetParticlesColor() - gridScript.objectRenderer[To.x, To.y].material.color);
					break;
					
				case EdgeType.edgeMinus:
					SetParticlesColor(GetParticlesColor() + gridScript.objectRenderer[To.x, To.y].material.color);
					break;
			}
		}
		
		
	}
}

// Changes the node color, updates metrics and checks for victory condition
public function UpdateNodeColor(nodePosition:Vector2, newColor:Color):void
{
	Debug.Log(currentCorrectTiles+" / "+desiredCorrectTiles);
	// Check for same color
	if(gridScript.objectRenderer[nodePosition.x, nodePosition.y].material.color != newColor)
	{
		Undo.RecordObject(this, "Tile Number Change");
		// First we check if the color has changed in any way that will affect the number of correct nodes
		++numberOfUndos;		
		// From correct to incorrect
		if(victoryGrid[nodePosition.x, nodePosition.y].isDesiredColor(gridScript.objectRenderer[nodePosition.x, nodePosition.y].material.color))
		{
			//Debug.Log("Becomes INcorrect");
			currentCorrectTiles = Mathf.Max(0.0, currentCorrectTiles - 1.0);
		}
		// From incorrect to correct
		else if(victoryGrid[nodePosition.x, nodePosition.y].isDesiredColor(newColor))
		{
			//Debug.Log("Becomes correct");
			currentCorrectTiles = Mathf.Min(desiredCorrectTiles, currentCorrectTiles + 1.0);
		}
		
		EditorUtility.SetDirty(this);
		Undo.RecordObject(gridScript.objectRenderer[nodePosition.x, nodePosition.y].material, "Color Change");
		
		// Finally, we change the object's color
		gridScript.objectRenderer[nodePosition.x, nodePosition.y].material.color = newColor;	
		EditorUtility.SetDirty(gridScript.objectRenderer[nodePosition.x, nodePosition.y].material);

	}
	
	if(isVictorious())
	{
		Debug.Log("I win");
		NotifyVictory();
	}
}

// Adds color from one node to the other
public function AddColor(from:Vector2, to:Vector2)
{	
	if(gridScript.objectRenderer[from.x,from.y].material.color != Color(1.0, 1.0, 1.0))
	{
		// Calculate the new color
		var newColor:Color = Color(
		Mathf.Min(1.0, Mathf.Round( (gridScript.objectRenderer[to.x, to.y].material.color.r + gridScript.objectRenderer[from.x, from.y].material.color.r ) * 100f) / 100f ),
		Mathf.Min(1.0, Mathf.Round( (gridScript.objectRenderer[to.x, to.y].material.color.g + gridScript.objectRenderer[from.x, from.y].material.color.g ) * 100f) / 100f ),
		Mathf.Min(1.0, Mathf.Round( (gridScript.objectRenderer[to.x, to.y].material.color.b + gridScript.objectRenderer[from.x, from.y].material.color.b ) * 100f) / 100f ) );
		
		// And update the node's color
		UpdateNodeColor(to, newColor);
	}
}

// Suntracts color from 2 nodes
public function SubColor(from:Vector2, to:Vector2)
{	
	if(gridScript.objectRenderer[from.x,from.y].material.color != Color(0.0, 0.0, 0.0))
	{
		// Calculate the new color
		var newColor:Color = Color(
		Mathf.Max(0.0, gridScript.objectRenderer[to.x, to.y].material.color.r - gridScript.objectRenderer[from.x,from.y].material.color.r),
		Mathf.Max(0.0, gridScript.objectRenderer[to.x, to.y].material.color.g - gridScript.objectRenderer[from.x, from.y].material.color.g),
		Mathf.Max(0.0, gridScript.objectRenderer[to.x, to.y].material.color.b - gridScript.objectRenderer[from.x, from.y].material.color.b) );
		
		// And update the node's color
		UpdateNodeColor(to, newColor);
	}
}

// Did we win the game ?
public function isVictorious():boolean
{
	return currentCorrectTiles == desiredCorrectTiles;
}

public function ReadVictoryDataFromFile()
{
	var dataParseMode:DataParse = DataParse.None;
	var colorMatrixLine:int = -1.0;
	
	var allTheText = victoryInputFile.text.Split("\n"[0]);
	
	// For each line
	for (currentLine in allTheText)
	{
		
		var data:String[] = currentLine.ToUpper().Replace(" ", "").Replace("(", "").Replace(")", "").Split(','[0]);
		
		// Choose parse mode
		if(data[0].Contains("COLORMATRIX:"))
		{
			dataParseMode = DataParse.nodeColor;
		}
		
		// In case the user did not switch what kind of data he is parsing in
		else
		{
			switch (dataParseMode)
			{
				// Invalid line
				case DataParse.None:
					Debug.Log("Invalid file format");
					break;
				
				// 	If we already have the number of rows and columns in the grid, read the data 
				case DataParse.nodeColor:
					if(gridScript.numberOfRows < 0 ||  gridScript.numberOfColumns < 0)
					{
						Debug.Log("Matrix size not established");
					}
					
					// Before reading the first line (colorMatrixLine has a value of -1), we initialize the color matrix
					if(colorMatrixLine < 0)
					{
						// Initialize the node vector
						victoryGrid = new VictoryNode[gridScript.numberOfRows, gridScript.numberOfColumns];
						for(var node in victoryGrid)
						{
							// Initialize the color to the default color, such as transparent, white, black, etc
							node.typeOfNode = VictoryNodeType.Node_Invalid;
							node.desiredColor= gridScript.defaultColor;
						}
						++colorMatrixLine;
					}
					
					// Now read the color values from file
					if(colorMatrixLine < gridScript.numberOfRows)
					{
						for(var j = 0.0; j < gridScript.numberOfColumns; ++j)
						{
							// Trasform the strings into RGB format
							var rgbColor = gridScript.HexValueToRGB(data[j]);
							// And store them
							victoryGrid[colorMatrixLine, j].desiredColor = rgbColor;
							++desiredCorrectTiles;
							if(victoryGrid[colorMatrixLine, j].isDesiredColor(gridScript.objectRenderer[colorMatrixLine, j].material.color))
							{
								++currentCorrectTiles;
							}
						}
						// Next line
						++colorMatrixLine;
					}
					
					break;
			}
		}
		
		// Now set the number of tiles that are currently correct
		initialCorrectTiles = currentCorrectTiles;
	}
}


function Start () 
{	
	// Initialize variables
	numberOfUndos = 0;
	numberOfRedos = 0;
	drawHint = drawHintsByDefault;
	
	if(particleSystemObject!= null)
	{
		particleSystemObject.SetActive(false);
	}
	
	/*if(particleLineDrawer == null)
	{
		particleLineDrawer = Instantiate(particleLinePrefab, Vector3.zero, Quaternion.identity) as GameObject;
	}
	
	particleLineDrawer.SetActive(false);*/

	// Check if we have the required script
	gridScript = transform.GetComponent(CreateGrid);
	// If so and we have an input file
	if(gridScript && victoryInputFile)
	{	
		// Never leave a variable without a default values
		currentCorrectTiles = 0;
		desiredCorrectTiles = 0;
		
		// Now read the victory file
		ReadVictoryDataFromFile();
		
		// Now load the hint file
		LoadHintFile();
		
		// Then load the save file, if the option is selected
		if(shouldLoadSave)
		{
			LoadSaveFile(saveDataInputFile);
		}
	}
	else
	{
		Debug.LogError("ColorGameplay could not find an instance of CreateGrid or perhaps victoryInputFile");
	}
	
}

// When this object is destroyed
function OnDestroy()
{
	// If the player has not completed the level
	if(!isVictorious() && saveDataInputFile != null)
	{
		// Save the current state of the level
		SaveGameToFile(saveDataInputFile);
		//And tell the level manager we haven't completed the level
		NotifyLevelIncomplete();
	}
}

function Update () 
{
	// If the particle system is assigned
	if(particleSystemObject != null)
	{
		// Move the particle system to the mouse's position
		particleSystemObject.transform.position = Camera.main.ScreenToWorldPoint(Input.mousePosition);
	}
	
	// If we haven't finished the level
	if(!isVictorious())
	{
		// Helper variables
		var hitInfo:RaycastHit2D[];
	    var ray: Vector2;
	    var mousePos:Vector3;

		// Observation: We only do raycasts (kinda expensive) if the mouse buttons was pressed or let go, as opposed to doing it each frame, which keeps costs to a minimum
		// Observation 2: OnMouseDown and OnMouseUp will does not support drag and drop, so this function implements a workaround

		// If the player clicked the left mouse button
		if(Input.GetMouseButtonDown(0))
		{
			// Get the mouse's position in world space
			mousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
			// Cast a ray to it
			ray = Vector2(mousePos.x, mousePos.y);
			hitInfo = Physics2D.RaycastAll(ray, Vector2.zero, Mathf.Infinity);
			// If we hit an object and it has  a collider
			//if (hitInfo != null && hitInfo.collider != null)
			for(hit in hitInfo)
			{
				//Debug.Log("Message down");
				// Send it the mouse down message
				if(hit.collider != null)
				{
					hit.collider.gameObject.SendMessage("MouseDown", SendMessageOptions.DontRequireReceiver);
				}
			}
		}
		
		// If the player let go of the left mouse button
		else if(Input.GetMouseButtonUp(0))
		{
			// Get the mouse's position in world space
			mousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
			ray = Vector2(mousePos.x, mousePos.y);
			// Cast a ray to it
			hitInfo = Physics2D.RaycastAll(ray, Vector2.zero, Mathf.Infinity);
			
			if(hitInfo.Length == 0)
			{
				particleSystemObject.SetActive(false);
			}
			else
			{
				// If we hit an object and it has  a collider
				for(hit in hitInfo)
				{
					//Debug.Log("Message up");
					// Send it the mouse up message
					if(hit.collider != null)
					{
						hit.collider.gameObject.SendMessage("MouseUp", SendMessageOptions.DontRequireReceiver);
					}
				}
			}
		}
	}
}