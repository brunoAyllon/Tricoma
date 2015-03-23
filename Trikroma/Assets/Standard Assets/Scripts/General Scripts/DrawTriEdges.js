#pragma strict

// The textures for the plus and minus signs
public var plusPrefab:GameObject;
public var minusPrefab:GameObject;

// Absolute distance from the center to the draw boundries
public var toBottomBoundry:float;
public var toLeftBoundry:float;
public var toRightBoundry:float;

// Used to keep track of the objects instantiated to draw the textures
private var bottomObj:GameObject;
private var leftObj:GameObject;
private var rightObj:GameObject;

function Start () 
{
	// Get a reference to the grid information
	var gridScript:CreateGrid = transform.parent.GetComponent(CreateGrid);
	
	// If we are drawing the edges
	if(gridScript.drawEdges)
	{
		// Get this object's position
		var pos:Vector2 = gridScript.getObjectPositionFromName(gameObject.name);
		
		// We only render objects in odd columns
		if(pos.y % 2)
		{   
				// If it has a valid left edge
			    var leftEdgeFound:Edge = gridScript.getEdge(pos, pos + Vector2(0.0, -1.0));
				if(leftEdgeFound.isValid() )
				{
					
					// Create the appropriate sprite for it based on edge type	
					if (leftEdgeFound.type == EdgeType.edgePlus)
					{
						leftObj = Instantiate(plusPrefab, transform.position + Vector3(-toLeftBoundry, 0, 0 ) , Quaternion.identity) as GameObject;
					}
					else 
					{
						leftObj = Instantiate(minusPrefab, transform.position, Quaternion.identity) as GameObject;
					}
					
					// Now give a name
					leftObj.name = "Left "+pos.x+" "+pos.y;
					
					
					//And give it the correct sorting order
					var leftRenderer:SpriteRenderer = leftObj.GetComponent(SpriteRenderer);
					leftRenderer.sortingOrder = gridScript.sortingOrderOfEdges;
				}
			
				// If it has a valid right edge
				var rightEdgeFound:Edge = gridScript.getEdge(pos, pos + Vector2(0.0, 1.0));
				if(rightEdgeFound.isValid() )
				{
					
					// Create the appropriate sprite for it based on edge type	
					if (rightEdgeFound.type == EdgeType.edgePlus)
					{
						rightObj = Instantiate(plusPrefab, transform.position + Vector3(toRightBoundry, 0, 0 ) , Quaternion.identity) as GameObject;
					}
					else 
					{
						rightObj = Instantiate(minusPrefab, transform.position + Vector3(toRightBoundry, 0, 0 ) , Quaternion.identity) as GameObject;
					}
					
					// Now give a name
					rightObj.name = "Right "+pos.x+" "+pos.y;
			   	 	
			   	 	//And give it the correct sorting order
					var rightRenderer:SpriteRenderer = rightObj.GetComponent(SpriteRenderer);
					rightRenderer.sortingOrder = gridScript.sortingOrderOfEdges;
				}
		}
		
		// If this object has an edge with a node beneath it
		var bottomEdgeFound:Edge = gridScript.getEdge(pos, pos + Vector2(1.0, 0.0));
		if(gridScript.isUpright(pos) && bottomEdgeFound.isValid() )
		{
			// Create the appropriate sprite for it based on edge type		
			if (bottomEdgeFound.type == EdgeType.edgePlus)
			{
				bottomObj = Instantiate(plusPrefab, transform.position + Vector3(0, -toBottomBoundry, 0 ) , Quaternion.identity) as GameObject;
			}
			else 
			{
				bottomObj = Instantiate(minusPrefab, transform.position + Vector3(0, -toBottomBoundry, 0 ) , Quaternion.identity) as GameObject;
			}
			
			// Now initialize the bottom game object
			bottomObj.name = "Bottom "+pos.x+" "+pos.y;
			
			//And give it the correct sorting order
			var bottomRenderer:SpriteRenderer = bottomObj.GetComponent(SpriteRenderer);
			bottomRenderer.sortingOrder = gridScript.sortingOrderOfEdges;
		}
    }
    
   
    
    
   
	
}

function Update () 
{

}