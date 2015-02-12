#pragma strict

public var plusTexture:Texture2D;
public var minusTexture:Texture2D;

public var toBottomBoundry:int;
public var toLeftBoundry:int;
public var toRightBoundry:int;

private var bottomObj:GameObject;
private var leftObj:GameObject;
private var rightObj:GameObject;

function Start () 
{
	var gridScript:CreateGrid = transform.parent.GetComponent(CreateGrid);
	
	
	if(gridScript.drawEdges)
	{
		var pos:Vector2 = gridScript.getObjectPositionFromName(gameObject.name);
		
		if(pos.y % 2)
		{   
			    var leftEdgeFound:Edge = gridScript.getEdge(pos, pos + Vector2(0.0, -1.0));
				if(leftEdgeFound.isValid() )
				{
					
					
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
					
					leftObj = new GameObject("Left "+pos.x+" "+pos.y);
					
					leftObj.transform.position = transform.position;
					
					leftObj.AddComponent(SpriteRenderer);
					
			   	 	leftObj.GetComponent(SpriteRenderer).sprite = leftSprite;
				}
			
				var rightEdgeFound:Edge = gridScript.getEdge(pos, pos + Vector2(0.0, 1.0));
				if(rightEdgeFound.isValid() )
				{
					
					
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
					
					rightObj = new GameObject("right "+pos.x+" "+pos.y);
					
					rightObj.transform.position = transform.position;
					
					rightObj.AddComponent(SpriteRenderer);
					
			   	 	rightObj.GetComponent(SpriteRenderer).sprite = rightSprite;
			   	 	
				}
		}
		
		var bottomEdgeFound:Edge = gridScript.getEdge(pos, pos + Vector2(1.0, 0.0));
		if(gridScript.isUpright(pos) && bottomEdgeFound.isValid() )
		{
			
			var bottomSprite:Sprite;
			var bottomPos:Vector2 = Vector2(0.5f, 1.4f);
			
			if (bottomEdgeFound.type == EdgeType.edgePlus)
			{
				bottomSprite = Sprite.Create(plusTexture,  Rect(0, -toBottomBoundry, plusTexture.width, plusTexture.height), bottomPos);
			}
			else 
			{
				bottomSprite = Sprite.Create(minusTexture,  Rect(0, -toBottomBoundry, minusTexture.width, minusTexture.height), bottomPos);
			}
			
			bottomObj = new GameObject("Bottom "+pos.x+" "+pos.y);
			
			bottomObj.transform.position = transform.position;
			
			bottomObj.AddComponent(SpriteRenderer);
			
	   	 	bottomObj.GetComponent(SpriteRenderer).sprite = bottomSprite;
		}
    }
    
   
    
    
   
	
}

function Update () 
{

}