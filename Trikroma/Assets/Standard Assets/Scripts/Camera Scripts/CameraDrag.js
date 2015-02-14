#pragma strict

public var dragRatio:float;

public var defineDragLimits:boolean;

public var leftDistance:float;
public var bottomDistance:float;
public var topDistance:float;
public var rightDistance:float;

private var leftBoundry:float;
private var rightBoundry:float;
private var topBoundry:float;
private var bottomBoundry:float;

function Start () 
{
	leftBoundry   = transform.position.x - leftDistance;
    rightBoundry  = transform.position.x + rightDistance;
    topBoundry    = transform.position.y + topDistance;
    bottomBoundry = transform.position.y - bottomDistance;
}

function Update () 
{
	if(Input.GetMouseButton(0))
	{
		// Get the mouse's position in world space
		var mousePos:Vector3 = Camera.main.ScreenToWorldPoint(Input.mousePosition);
		// Cast a ray to it
		 var ray: Vector2 = Vector2(mousePos.x, mousePos.y);
		var hitInfo:RaycastHit2D[] = Physics2D.RaycastAll(ray, Vector2.zero, Mathf.Infinity);
		// If we hit an object and it has  a collider
		//if (hitInfo != null && hitInfo.collider != null)
		for(hit in hitInfo)
		{
			// We cannot move the camera
			if(hit.collider != null)
			{
				return;
			}
		}
		
		// New position = (desired position - current position)/ half-size when in orthographic mode   * dragRatio
		transform.position += (mousePos - transform.position)/gameObject.camera.orthographicSize * dragRatio;
		
		if(defineDragLimits)
		{
			transform.position.x = Mathf.Clamp(transform.position.x, leftBoundry, rightBoundry);
			transform.position.y = Mathf.Clamp(transform.position.y, bottomBoundry, topBoundry);
		}
	}
}

