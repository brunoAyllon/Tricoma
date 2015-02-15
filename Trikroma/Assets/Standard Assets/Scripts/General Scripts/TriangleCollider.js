#pragma strict

// The 3 vertices that define the trianglecollider
private var leftVert:Vector2;
private var rightVert:Vector2;
private var topVert :Vector2;
private var isUpright:boolean;

// Whoever is responsible for handling the gameplay implications of a collision
private var gameplayController:ColorGameplay;

static private var colorManipulationActive:boolean;


// Defines a half plane based on two given vertices , then checks if a given point is inside it
function isInsideHalfPlane(point:Vector2, halfplaneFirstVert:Vector2, halfplaneSecondVert:Vector2):boolean
{
    return ( (point.x - halfplaneSecondVert.x) * (halfplaneFirstVert.y - halfplaneSecondVert.y) - (halfplaneFirstVert.x - halfplaneSecondVert.x) * (point.y - halfplaneSecondVert.y) )< 0.0;
}

// Checks if the mouse's current position is inside the collision traingle
function PointInsideTriangle():boolean
{
	// Gets mouse position in screen space and trasform it into world space (same one the collider's bounds utilize)
	var mousePosInLocalCoordinates:Vector3 = Camera.main.ScreenToWorldPoint(Input.mousePosition);
	// Now convert it to a 2D vector
	var collisionPoint:Vector2 = Vector2(mousePosInLocalCoordinates.x, mousePosInLocalCoordinates.y);
	
	// If we are inside all 3 half-planes, then we are inside the triangle
	// Observation: Checks must be done clockwise
	if(isUpright)
	{
		Debug.Log("Upright: "+gameObject.name);
		return (
		isInsideHalfPlane(collisionPoint, topVert, rightVert ) && 
		isInsideHalfPlane(collisionPoint, rightVert, leftVert ) &&
		isInsideHalfPlane(collisionPoint, leftVert,  topVert )
		);
	}
		
	return (
	isInsideHalfPlane(collisionPoint, leftVert, rightVert ) && 
	isInsideHalfPlane(collisionPoint, rightVert, topVert ) &&
	isInsideHalfPlane(collisionPoint, topVert, leftVert )
	);
}

// If the mouse is clicked on this object
function MouseDown()
{
	// If the point is inside the triangle
	if(PointInsideTriangle())
	{
		Debug.Log("Down: "+gameObject.name);
		// Tells the gameplay controller to start the logic for changing triangle collors, this phase represents selecting the triangle from which we will add / subtract color
		gameplayController.StartColorManip(gameObject.name);
		colorManipulationActive = true;
	}
}

function MouseUp() 
{
	// If the point is inside the triangle
	if(PointInsideTriangle())
	{
		// Tell the gameplay controller  to finish manipulating traingles, which means either giving up on manipulating the color or commiting to it
		Debug.Log("Up: "+gameObject.name);
		gameplayController.EndColorManip(gameObject.name);
		colorManipulationActive = false;
	}
}

// If the mouse hovering over this game object
function OnMouseOver():void
{
	// And we are manipulating colors
	if (colorManipulationActive)
	{
		// And we are inside the triangle
		if(PointInsideTriangle())
		{
			// Add this object's color to the paticles' being drawn
			gameplayController.StartParticleManipulation(gameObject.name);
		}
		// Otherwise, if we have left the triangle or are not inside it
		else
		{
			// Remove this object's color to the paticles' being drawn (or not add it at all, the gameplay controller will figure that out)
			gameplayController.EndParticleManipulation(gameObject.name);
		}
	}
}

// Happens only once, when the script is created. Essentially used to setup variables
function Start () 
{
	// We start with no gameplay going on
	colorManipulationActive = false;

	/* First we determine the vertices of the collision triangle
	
		Observation: For simplicity's sake , we assume the triangle's texture aligns with the collider's boundries
	*/
	
	var gridScript:CreateGrid = transform.parent.GetComponent(CreateGrid);
	var pos:Vector2 = gridScript.getObjectPositionFromName(gameObject.name);
	
	isUpright = gridScript.isUpright(pos);
	
	// Determine the traingle's vertices' positions based on whether it is upright or not
	if(isUpright)
	{
		leftVert = Vector2(collider2D.bounds.min.x, gameObject.collider2D.bounds.min.y);
		rightVert = Vector2(collider2D.bounds.max.x, gameObject.collider2D.bounds.min.y);
		topVert  = Vector2(collider2D.bounds.center.x, gameObject.collider2D.bounds.max.y);
	}
	else
	{
		leftVert = Vector2(collider2D.bounds.min.x, gameObject.collider2D.bounds.max.y);
		rightVert = Vector2(collider2D.bounds.max.x, gameObject.collider2D.bounds.max.y);
		topVert  = Vector2(collider2D.bounds.center.x, gameObject.collider2D.bounds.min.y);
	}
	
	
	// Upon creation, the game object that holds this script is made a child of the appropriate gameplay controller
		gameplayController = transform.parent.GetComponent(ColorGameplay);
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}