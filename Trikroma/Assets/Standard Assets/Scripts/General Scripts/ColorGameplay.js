#pragma strict

//
// What file should we read the victory coditions from ?
public var victoryInputFile:TextAsset = null;
// Stores type and color of the victory node
private var victoryGrid:VictoryNode[,];

// File to load save data from
public var saveDataInputFile:TextAsset;

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

private var levelManager:GameObject;


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

public function LoadSaveFile(dataFile:TextAsset):boolean
{
	var allTheText = saveDataInputFile.text.Split("\n"[0]);
	if(allTheText.Length == 0)
	{
		return false;
	}
	
	currentCorrectTiles = int.Parse(allTheText[0]);
	
	var i:int = 0;
	for (var colorRenderer in gridScript.objectRenderer)
	{
		 var data = allTheText[i].Replace(" ", "").Replace("(", "").Replace(")", "").Split(','[0]);
		 colorRenderer.material.color = Color(int.Parse(data[0]), int.Parse(data[1]), int.Parse(data[2]), int.Parse(data[3]));
		 
		 i+= 3;
	}
	
	return true;
}

public function SaveGameToFile(dataFile:TextAsset):void
{
	var path:String =  AssetDatabase.GetAssetPath(saveDataInputFile);
	Debug.Log("The File: " + path);
	
	var data:String = currentCorrectTiles+"\n";
	
	for (var colorRenderer in gridScript.objectRenderer)
	{
		var colorToSave:Color = colorRenderer.material.color;
		data+= " ( "+colorToSave.r+" , "+colorToSave.g+" , "+colorToSave.b+" , "+colorToSave.a +" )\n";
	}
	
	System.IO.File.WriteAllText(path, data);
	
	AssetDatabase.SaveAssets();
}

public function RegisterLevelManager(theLevelManager:GameObject)
{
	Debug.Log("Hello level manager");
	levelManager = theLevelManager;
}

public function BroadcastVictory():void
{
	levelManager.SendMessage("CompleteLevel", Application.loadedLevel, SendMessageOptions.DontRequireReceiver);
	levelManager.SendMessage("GoBackToMenu", SendMessageOptions.DontRequireReceiver);
}

// Called by the instantiated object's collider 
public function StartColorManip(colliderName:String)
{
	// Register which node we are taking the color from
	colorManipFrom = colliderName;
	Debug.Log("From: "+colorManipFrom);
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
		
		/*if(!gridScript.adjList.ContainsKey(To))
		{
			Debug.Log("No key here");
		}
		
		// If the adjacency list exists and the nodes are neighbors
		if((gridScript.isNeighbor(From, To)) && gridScript.adjList.ContainsKey(To))
		{
			Debug.Log("Hello Mr. Key");
			// Find the edge and its type
			for(var edge:Edge in gridScript.adjList[To])
			{
				if(edge.isConnectedTo(From))
				{
					isConnected = true;
					operationType = edge.type;
				}
			}
			
		}*/
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
	
	// For testing
	//Debug.Log(currentCorrectTiles+" / "+desiredCorrectTiles);
	if(isVictorious())
	{
		Debug.Log("I win");
		BroadcastVictory();
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
		
		initialCorrectTiles = currentCorrectTiles;
	}
	
	// For my own paranoia's sake, I am keeping the old version of the code around
	
	/*
	// First read all the data
	var allTheText = victoryInputFile.text.Split("\n"[0]);
	
	// Initialize the node vector
	victoryGrid = new VictoryNode[gridScript.numberOfRows, gridScript.numberOfColumns];
	for(var node in victoryGrid)
	{
		// Initialize the color to the default color, such as transparent, white, black, etc
		node.typeOfNode = VictoryNodeType.Node_Invalid;
		node.desiredColor= gridScript.defaultColor;
	}
	
	// Now read the color values from file
	var currentRow =  new Array();
	
	for (var i = 0.0; i < gridScript.numberOfRows; ++i)
	{
		currentRow = allTheText[i + 1.0].Replace(" ", "").Split(','[0]);
		for(var j = 0.0; j < gridScript.numberOfColumns; ++j)
		{
			// Transform the strings into RGB format
			var rgbColor = gridScript.HexValueToRGB(currentRow[j].ToString());
			// And store them
			victoryGrid[i, j].desiredColor = rgbColor;
			if( rgbColor != gridScript.defaultColor)
			{
				victoryGrid[i, j].typeOfNode = VictoryNodeType.Node_Normal;
				++desiredCorrectTiles;
				if(victoryGrid[i, j].isDesiredColor(gridScript.objectRenderer[i, j].material.color))
				{
					++currentCorrectTiles;
				}
			}
		}
	}
	
	initialCorrectTiles = currentCorrectTiles;*/
}


function Start () 
{	
	numberOfUndos = 0;
	numberOfRedos = 0;

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
		LoadSaveFile(saveDataInputFile);
	}
	else
	{
		Debug.LogError("ColorGameplay could not find an instance of CreateGrid or perhaps victoryInputFile");
	}
	
}

function OnDestroy()
{
	if(saveDataInputFile != null)
	{
		SaveGameToFile(saveDataInputFile);
	}
}

function Update () 
{
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