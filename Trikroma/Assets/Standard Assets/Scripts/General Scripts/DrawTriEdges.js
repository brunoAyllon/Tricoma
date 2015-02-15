#pragma strict

// The textures for the plus and minus signs
public var plusTexture:Texture2D;
public var minusTexture:Texture2D;

// Absolute distance from the center to the draw boundries
public var toBottomBoundry:int;
public var toLeftBoundry:int;
public var toRightBoundry:int;

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
					var leftSprite:Sprite;
					var leftPos:Vector2 = Vector2(1.0f, 0.5f);
					if (leftEdgeFound.type == EdgeType.edgePlus)
					{
						leftSprite = Sprite.Create(plusTexture,  Rect(-toLeftBoundry, 0, plusTexture.width, plusTexture.height), leftPos);
					}
					else 
					{
						leftSprite = Sprite.Create(minusTexture,  Rect(-toLeftBoundry, 0, minusTexture.width, minusTexture.height), leftPos);
					}
					
					// Now initialize the left game object
					leftObj = new GameObject("Left "+pos.x+" "+pos.y);
					
					
					// Place it at the center of the current object
					// Observation: Sprite coordinates are relative to its parent game object, hence why we placed the object at the same center as the triangle
					leftObj.transform.position = transform.position;
					
					// Add a sprite renderer to it
					var leftRenderer:SpriteRenderer = leftObj.AddComponent(SpriteRenderer);
					leftRenderer.sortingOrder = gridScript.sortingOrderOfEdges;
					// And tell it to render the sprite we created
			   	 	leftRenderer.sprite = leftSprite;
				}
			
				// If it has a valid right edge
				var rightEdgeFound:Edge = gridScript.getEdge(pos, pos + Vector2(0.0, 1.0));
				if(rightEdgeFound.isValid() )
				{
					
					// Create the appropriate sprite for it based on edge type	
					var rightSprite:Sprite;
					var rightPos:Vector2 = Vector2(0.0f, 0.5f);
					if (rightEdgeFound.type == EdgeType.edgePlus)
					{
						rightSprite = Sprite.Create(plusTexture,  Rect(toRightBoundry, 0, plusTexture.width, plusTexture.height), rightPos);
					}
					else 
					{
						rightSprite = Sprite.Create(minusTexture,  Rect(toRightBoundry, 0, minusTexture.width, minusTexture.height), rightPos);
					}
					
					// Now initialize the right game object
					rightObj = new GameObject("right "+pos.x+" "+pos.y);
					
					// Place it at the center of the current object
					// Observation: Sprite coordinates are relative to its parent game object, hence why we placed the object at the same center as the triangle
					rightObj.transform.position = transform.position;
					
					// Add a sprite renderer to it
					var rightRenderer:SpriteRenderer = rightObj.AddComponent(SpriteRenderer);
					rightRenderer.sortingOrder = gridScript.sortingOrderOfEdges;
					
					// And tell it to render the sprite we created
			   	 	rightRenderer.sprite = rightSprite;
			   	 	
				}
		}
		
		// If this object has an edge with a node beneath it
		var bottomEdgeFound:Edge = gridScript.getEdge(pos, pos + Vector2(1.0, 0.0));
		if(gridScript.isUpright(pos) && bottomEdgeFound.isValid() )
		{
			
			var bottomSprite:Sprite;
			var bottomPos:Vector2 = Vector2(0.5f, 1.4f);
			
			// Create the appropriate sprite for it based on edge type		
			if (bottomEdgeFound.type == EdgeType.edgePlus)
			{
				bottomSprite = Sprite.Create(plusTexture,  Rect(0, -toBottomBoundry, plusTexture.width, plusTexture.height), bottomPos);
			}
			else 
			{
				bottomSprite = Sprite.Create(minusTexture,  Rect(0, -toBottomBoundry, minusTexture.width, minusTexture.height), bottomPos);
			}
			
			// Now initialize the bottom game object
			bottomObj = new GameObject("Bottom "+pos.x+" "+pos.y);
			
			// Place it at the center of the current object
			// Observation: Sprite coordinates are relative to its parent game object, hence why we placed the object at the same center as the triangle
			bottomObj.transform.position = transform.position;
			
			// Add a sprite renderer to it
			var bottomRenderer:SpriteRenderer = bottomObj.AddComponent(SpriteRenderer);
			bottomRenderer.sortingOrder =  gridScript.sortingOrderOfEdges;
			// And tell it to render the sprite we created
	   	 	bottomRenderer.sprite = bottomSprite;
		}
    }
    
   
    
    
   
	
}

function Update () 
{

}