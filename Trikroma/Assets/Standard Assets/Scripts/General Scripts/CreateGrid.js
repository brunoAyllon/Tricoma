#pragma strict

// File from which we read the level
public var dataInputFile: TextAsset = null;

// Object we are going to create (tri, quad, hex, etc)
public var objectToReplicate:GameObject;

/*																													________
 Do we have one turned up and one turned down in an alternating pattern ? For example, for triangles we would have /\/\/\/\/\  
  
 */
public var isAlternating:boolean = true;

// Do we draw the upject upright or upside-down ?
public var startWithUprightObj:boolean = true;

private var numberOfRows = 8;
private var numberOfColumns = 10;

// The color of all the objects in RGB format, stored as a matrix
var objectColors: Color[,];

// Base color, for testing
public var defaultColor = Color.green;

// Material of the object
public var defaultMaterial :Material;

// The individual rederers for each of the created objects, in matrix format
private var objectRenderer : Renderer[,];

/* Reads the grid from file

Format:
<number of rows>, <number of columns>
<hex color value of object in position [0][0]>, <hex color value of object in position [0][1]>, <hex color value of object in position [0][2]>.....
<hex color value of object in position [1][0]>, <hex color value of object in position [1][1]>, <hex color value of object in position [1][2]>.....
.......

Observation: ALL values of the declared grid size must be EXPLICITLY written int the file
*/
function ReadDataFromFile():void
{ 
	// First read all the data
	var allTheText = dataInputFile.text.Split("\n"[0]);
	
	// First we read the number of rows and columns
	var rowAndColumn = allTheText[0].Replace(" ", "").Split(','[0]);
	numberOfRows = int.Parse(rowAndColumn[0]);
	numberOfColumns = int.Parse(rowAndColumn[1]);
	
	// Initialize the color vector
	objectColors = new Color[numberOfRows, numberOfColumns];
	for(var color in objectColors)
	{
		// Initialize the color to the default color, such as transparent, white, black, etc
		color = defaultColor;
	}
	
	// Now read the color values from file
	var currentRow =  new Array();
	
	for (var i = 0.0; i < numberOfRows; ++i)
	{
		currentRow = allTheText[i + 1.0].Replace(" ", "").Split(','[0]);
		for(var j = 0.0; j < numberOfColumns; ++j)
		{
			// Trnasform the strings into RGB format
			var rgbColor = HexValueToRGB(currentRow[j].ToString());
			// And store them
			objectColors[i, j] = rgbColor;
		}
	}
}

// Takes a hex value (as a char) and return its corresponding RGB value (as an int)
function HexToInt(hexVal:char):int
{
	// Observation: Could not make one liners with a return statement or the missing break statement would cause Unity to think some code was 
	// "unreachable", so did a longer function to cater to that quirk
	var returnVal:int;
	
	// Default value just in case
	returnVal = 0;
	
	// Choose the appropriate output for the given char
	var hex : char = hexVal;
	switch (hex) 
	{
		case "0":
		
			returnVal = 0;
			break;
		
		case "1":
		
			returnVal = 1;
			break;
		
		case "2":
		
			returnVal = 2;
			break;
		 
		case "3":
		
			returnVal = 3;
			break;
		
		case "4":
		
			returnVal = 4;
			break;
		 
		case "5":
		
			returnVal = 5;
			break;
		 
		case "6":
		
			returnVal = 6;
			break;
		
		case "7":
		
			returnVal = 7;
			break;
		 
		case "8":
		
			returnVal = 8;
			break;
		
		case "9": 
		
			returnVal = 9;
			break;
	 
		case "A":
		
			returnVal = 10;
			break;
		 
		case "B":
		
			returnVal = 11;
			break;
		 
		case "C":
		
			returnVal = 12;
			break;
		 
		case "D": 
		
			returnVal = 13;
			break;
		 
		case "E":
		
			returnVal = 14;
			break;
		 
		case "F":
		
			returnVal = 15;
			break;
		 
	}
	return returnVal;
}

// Transforms a hex value (passed as a string) to an RGB color value
function HexValueToRGB(hexVal:String):Color
{
	var rgbVal: Color;
	
	// We must divide the values by 255 to clamp them to valid web safe values
	
	// First 2 chars are the R value 
	rgbVal.r = (HexToInt(hexVal[0]) + HexToInt(hexVal[1]) * 16.000)/255.0;
	// Next 2 are the G value
	rgbVal.g = (HexToInt(hexVal[2]) + HexToInt(hexVal[3]) * 16.000)/255.0;
	// Last 2 are the B value
	rgbVal.b = (HexToInt(hexVal[4]) + HexToInt(hexVal[5]) * 16.000)/255.0;
	
	// Alpha value of 1 by default
	rgbVal.a = 1.0;
	
	return rgbVal;
}

// Creates a grid read from an input file, therefore ReadDataFromFile needs to be called at least once before this can execute
function CreateGrid()
{
	// Do we need to flip the object upside-down ?
	var isUpright:boolean = startWithUprightObj;

	// Basic initialization
	objectRenderer = new Renderer[numberOfRows, numberOfColumns];
	
	// Some helper values
	var objectWidth = objectToReplicate.renderer.bounds.size.x;
	var objectHeight = objectToReplicate.renderer.bounds.size.y;
	
	var startingX = gameObject.transform.position.x -( numberOfColumns * objectToReplicate.transform.localScale.x)/2.0;
	var startingY = gameObject.transform.position.y + ( numberOfRows * objectToReplicate.transform.localScale.y)/2.0;
	
	var currentPosition = Vector3(startingX, startingY, 0.0);
	var rotationAngle:Quaternion;
	
	// Go through every object
	for (var i = 0; i < numberOfRows; ++i)
	{
		for(var j = 0; j < numberOfColumns; ++j)
		{
			// Decide if we need to flip it upside-down
			if(isUpright)
			{
				rotationAngle = Quaternion.identity;
			}
			else
			{
				rotationAngle =  Quaternion.AngleAxis(180, Vector3.right);
			}
			
			// Create it
			var newObject = Instantiate(objectToReplicate, currentPosition, rotationAngle) as GameObject;
			
			// Give it the appropriate color and store the renderer so we can change it later
			objectRenderer[i, j] = newObject.renderer;
			objectRenderer[i, j].material.color = objectColors[i, j];
			
			// And setup the position of the next object
			if(isAlternating)
			{
				currentPosition.x += objectToReplicate.transform.localScale.x * objectWidth/2.0;
				isUpright = !isUpright;
			}
			else
			{
				currentPosition.x += objectToReplicate.transform.localScale.x * objectWidth;
			}
		}
		// Reset the x position (we are drawing a new line)
		currentPosition.x = startingX;
		// Fill from bottom to top (height/2, since the interval is [-width, width] and [-height, height])
		currentPosition.y -= objectToReplicate.transform.localScale.y * objectHeight;
	}
}

// Happens only once, when the  script initializes
function Start () 
{
	// Self explanatory
	ReadDataFromFile();
	CreateGrid();
}

// Might be useful in the future, dunno, no harm in keeping it though
function Update () 
{

}