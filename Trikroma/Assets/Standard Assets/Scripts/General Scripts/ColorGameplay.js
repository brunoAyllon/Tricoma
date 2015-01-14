#pragma strict

// What file should we read the victory coditions from ?
public var victoryInputFile:TextAsset = null;
// Stores type and color of the victory node
private var victoryGrid:VictoryNode[,];

// This script RERQUIRES being attached to an object with a CreateGrid component
private var gridScript:CreateGrid  = null;
// Adjacency list, work in progress
private var adjList:Array[,]; 

// How many correct tiles did the grid have once we created it ?
private var initialCorrectTiles:int;
// How many tiles are correct at the moment ?
private var currentCorrectTiles: int;
// How many tiles must have the correct color 
private var desiredCorrectTiles:int;

// Node Type, invalid nodes will not be considered as changeable
enum NodeType{Node_Invalid, Node_Normal};

// Which object are we getting the color from ?
private var colorManipFrom:String = String.Empty; 
// Which object are we giving the color to ?
private var colorManipTo:String = String.Empty;  

// Holds node information
class VictoryNode extends System.ValueType
{
	// Self explanatory
	public var typeOfNode:NodeType;
	public var desiredColor:Color;
	
	// Node constructor
	public function VictoryNode( nodeType:NodeType, nodeColor:Color)
	{
		typeOfNode = nodeType;
		desiredColor = nodeColor;
	}
	
	// Was it initialized ?
	public function isValid():boolean
	{
		return typeOfNode != NodeType.Node_Invalid;
	}
	
	// Is the given color the one we need to consider this node correct ?
	public function isDesiredColor(colorToCheck:Color)
	{
		return colorToCheck == desiredColor;
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
		// Take color from one and add it to the other
		AddColor(colorManipFrom, colorManipTo);
	}
	
	// Reset the values
	colorManipFrom = String.Empty;
	colorManipTo = String.Empty;
}

// Check if 2 nodes are neighbors of a triangle, unfortunately this is the only function that is tri specific, but can be adapted in the future to support more, if needed
public function isNeighbor(potentialNeighborPos:Vector2, objectPos:Vector2)
{
	// Each tri has 3 neighbors 2 neighbors are always constant, the left and right one
	// Third one is below for an upright tri and below for an upside-down one
	var lastNeighborY = 1.0;
	
	/*
		There are 3 scenarios in which our last neighbor lies in the node below
		
		1- We start drawing upright and our x position is zero
		2- We start drawing upright and are in an even x position
		3- We start drawing upside down tris and  our x position is odd
	
	*/
	if( gridScript.startWithUprightObj && ( !(objectPos.x % 2) || (objectPos.x == 0) )|| 
	  (!gridScript.startWithUprightObj && (objectPos.x % 2)) )
	{	
			lastNeighborY = -1.0;	
	}

	Debug.Log("A: "+ objectPos.x+ " "+ objectPos.y);
	Debug.Log("B: "+ );
	Debug.Log ( "Neighbor: " + ( objectPos == (potentialNeighborPos + Vector2(-1.0, 0.0) ) ) || 
			 ( objectPos == (potentialNeighborPos + Vector2( 1.0, 0.0) ) ) || 
			 ( objectPos == (potentialNeighborPos + Vector2( 0.0, lastNeighborY) ) ) );
	
	// Check if at least one of them is a neighbor
	return ( ( objectPos == (potentialNeighborPos + Vector2(-1.0, 0.0) ) ) || 
			 ( objectPos == (potentialNeighborPos + Vector2( 1.0, 0.0) ) ) || 
			 ( objectPos == (potentialNeighborPos + Vector2( 0.0, lastNeighborY) ) ) );
}

// Changes the node color, updates metrics and checks for victory condition
public function UpdateNodeColor(nodePosition:Vector2, newColor:Color):void
{
	Debug.Log(currentCorrectTiles+" / "+desiredCorrectTiles);
	// Check for same color
	if(gridScript.objectRenderer[nodePosition.x, nodePosition.y].material.color != newColor)
	{
		Debug.Log("Different color");
		
		// First we check if the color has changed in any way that will affect the number of correct nodes
		
		// From correct to incorrect
		if(victoryGrid[nodePosition.x, nodePosition.y].isDesiredColor(gridScript.objectRenderer[nodePosition.x, nodePosition.y].material.color))
		{
			Debug.Log("Becomes INcorrect");
			Undo.RecordObject(this, "Tile Number Change");
			currentCorrectTiles = Mathf.Max(0.0, currentCorrectTiles - 1.0);
		}
		// From incorrect to correct
		else if(victoryGrid[nodePosition.x, nodePosition.y].isDesiredColor(newColor))
		{
			Debug.Log("Becomes correct");
			Undo.RecordObject(this, "Tile Number Change");
			currentCorrectTiles = Mathf.Min(desiredCorrectTiles, currentCorrectTiles + 1.0);
		}
		
		// Work in progress: undo functionality
		Undo.RecordObject(gridScript.objectRenderer[nodePosition.x, nodePosition.y].material, "Color Change");
		
		
		// Finally, we change the object's color
		gridScript.objectRenderer[nodePosition.x, nodePosition.y].material.color = newColor;	
	}
	
	// For testing
	Debug.Log(currentCorrectTiles+" / "+desiredCorrectTiles);
	if(isVictorious())
	{
		Debug.Log("I win");
	}
}

// Adds color from one node to the other
public function AddColor(from:String, to:String)
{
	// Get the obejct's position on the grid
	var From:Vector2 = gridScript.getObjectPositionFromName(from);
	var To:Vector2   = gridScript.getObjectPositionFromName(to);
	
	// If they are neighbors
	if(isNeighbor(From, To))
	{	
//		Debug.Log(gridScript.objectRenderer[From.x, From.y].material.color.r+ " "+gridScript.objectRenderer[From.x, From.y].material.color.g+" "+gridScript.objectRenderer[From.x, From.y].material.color.b);
//		Debug.Log(gridScript.objectRenderer[To.x, To.y].material.color.r+ " "+gridScript.objectRenderer[To.x, To.y].material.color.g+" "+gridScript.objectRenderer[To.x, To.y].material.color.b);
		
		// Calculate the new color
		var newColor:Color = Color(
		Mathf.Min(1.0, Mathf.Round( (gridScript.objectRenderer[From.x, From.y].material.color.r + gridScript.objectRenderer[To.x, To.y].material.color.r) * 100f) / 100f ),
		Mathf.Min(1.0, Mathf.Round( (gridScript.objectRenderer[From.x, From.y].material.color.g + gridScript.objectRenderer[To.x, To.y].material.color.g) * 100f) / 100f ),
		Mathf.Min(1.0, Mathf.Round( (gridScript.objectRenderer[From.x, From.y].material.color.b + gridScript.objectRenderer[To.x, To.y].material.color.b) * 100f) / 100f ) );
		
		// And update the node's color
		UpdateNodeColor(To, newColor);
	}
}

// Suntracts color from 2 nodes
public function SubColor(from:String, to:String)
{	
	// Get the obejct's position on the grid
	var From:Vector2   = gridScript.getObjectPositionFromName(from);
	var To:  Vector2   = gridScript.getObjectPositionFromName(to);

	// If they are neighbors
	if(isNeighbor(From, To))
	{
		// Calculate the new color
		var newColor:Color = Color(
		Mathf.Max(0.0, gridScript.objectRenderer[From.x, From.y].material.color.r - gridScript.objectRenderer[To.x, To.y].material.color.r),
		Mathf.Max(0.0, gridScript.objectRenderer[From.x, From.y].material.color.g - gridScript.objectRenderer[To.x, To.y].material.color.g),
		Mathf.Max(0.0, gridScript.objectRenderer[From.x, From.y].material.color.b - gridScript.objectRenderer[To.x, To.y].material.color.b) );
		
		// And update the node's color
		UpdateNodeColor(To, newColor);
	}
}

// Did we win the game ?
public function isVictorious():boolean
{
	return currentCorrectTiles == desiredCorrectTiles;
}

public function ReadVictoryDataFromFile()
{
	// First read all the data
	var allTheText = victoryInputFile.text.Split("\n"[0]);
	
	// Initialize the node vector
	victoryGrid = new VictoryNode[gridScript.numberOfRows, gridScript.numberOfColumns];
	for(var node in victoryGrid)
	{
		// Initialize the color to the default color, such as transparent, white, black, etc
		node.typeOfNode = NodeType.Node_Invalid;
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
				victoryGrid[i, j].typeOfNode = NodeType.Node_Normal;
				++desiredCorrectTiles;
				if(victoryGrid[i, j].isDesiredColor(gridScript.objectRenderer[i, j].material.color))
				{
					++currentCorrectTiles;
				}
			}
		}
	}
	
	initialCorrectTiles = currentCorrectTiles;
}


function Start () 
{	
	// Check if we have the required script
	gridScript = transform.GetComponent(CreateGrid);
	// If so and we have an input file
	if(gridScript && victoryInputFile)
	{
		// First get some info from the grid
		var numRows:int = gridScript.numberOfRows;
		var numCols:int = gridScript.numberOfColumns;
		// Then build the adjacency list
		adjList = new Array[numRows, numCols];
		
		// Never leave a variable without a default values
		currentCorrectTiles = 0;
		desiredCorrectTiles = 0;
		
		// Now read the victory file
		ReadVictoryDataFromFile();
	}
	else
	{
		Debug.LogError("ColorGameplay could not find an instance of CreateGrid or perhaps victoryInputFile");
	}
	
}

function Update () 
{
	// If we haven't finished the level
	if(!isVictorious())
	{
		// Helper variables
		var hitInfo:RaycastHit2D;
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
			hitInfo = Physics2D.Raycast(ray, Vector2.zero, Mathf.Infinity);
			// If we hit an object and it has  a collider
			if (hitInfo != null && hitInfo.collider != null)
			{
				Debug.Log("Message down");
				// Send it the mouse down message
				hitInfo.collider.gameObject.SendMessage("MouseDown", SendMessageOptions.DontRequireReceiver);
			}
		}
		
		// If the player let go of the left mouse button
		else if(Input.GetMouseButtonUp(0))
		{
			// Get the mouse's position in world space
			mousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
			ray = Vector2(mousePos.x, mousePos.y);
			// Cast a ray to it
			hitInfo = Physics2D.Raycast(ray, Vector2.zero, Mathf.Infinity);
			// If we hit an object and it has  a collider
			if (hitInfo != null && hitInfo.collider != null)
			{
				Debug.Log("Message up");
				// Send it the mouse up message
				hitInfo.collider.gameObject.SendMessage("MouseUp", SendMessageOptions.DontRequireReceiver);
			}
		}
	}
}