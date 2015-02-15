#pragma strict

// Float representing what percentage of the mouse or touch movement will be applied to the drag motion
public var dragRatio:float;

// Will we limit how much we can drag in each direction ?
public var defineDragLimits:boolean;

// Absolute distance we can move in each direction, only used if defineDragLimits is set to true
public var leftDistance:float;
public var bottomDistance:float;
public var topDistance:float;
public var rightDistance:float;

// Calculate the boundries so we don't need to recalculate them every time we do a drag motion
private var leftBoundry:float;
private var rightBoundry:float;
private var topBoundry:float;
private var bottomBoundry:float;

function Start () 
{
	// Calculates the boundries
	leftBoundry   = transform.position.x - leftDistance;
    rightBoundry  = transform.position.x + rightDistance;
    topBoundry    = transform.position.y + topDistance;
    bottomBoundry = transform.position.y - bottomDistance;
}

function Update () 
{
	// If the mouse is down or if the user is touching the screen
	if(Input.GetMouseButton(0))
	{
		// Get the mouse's position in world space
		var mousePos:Vector3 = Camera.main.ScreenToWorldPoint(Input.mousePosition);
		// Cast a ray to it
		 var ray: Vector2 = Vector2(mousePos.x, mousePos.y);
		var hitInfo:RaycastHit2D[] = Physics2D.RaycastAll(ray, Vector2.zero, Mathf.Infinity);
		// If we hit an object and it has  a collider
		for(hit in hitInfo)
		{
			// We cannot move the camera
			// Observation: This means that clicking over a button will drag the camera unless the button has a collider
			if(hit.collider != null)
			{
				return;
			}
		}
		
		// New position = (desired position - current position)/ half-size when in orthographic mode   * dragRatio
		transform.position += (mousePos - transform.position)/gameObject.camera.orthographicSize * dragRatio;
		
		if(defineDragLimits)
		{
			// Lastly, we place the resulting values between their respective lower and upper boundries
			transform.position.x = Mathf.Clamp(transform.position.x, leftBoundry, rightBoundry);
			transform.position.y = Mathf.Clamp(transform.position.y, bottomBoundry, topBoundry);
		}
	}
}

