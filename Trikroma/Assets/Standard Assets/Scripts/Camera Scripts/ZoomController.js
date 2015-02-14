#pragma strict

public var minZoom:float;
public var maxZoom:float;
public var zoomRatio:float;


// Receives the mouse position in world coordinates and moves towards / away from it at a given ratio
public function MouseCameraZoom(zoomPoint:Vector3, zoomRate:float)
{
	// New position = (desired position - current position)/ half-size when in orthographic mode   * zoomRate
	transform.position += (zoomPoint - transform.position)/gameObject.camera.orthographicSize * zoomRate;
	
	// Since this is an orthographic camera, the zoom effect is achieved by changing its orthographic size
	// Observation, the min value is a sanity check so we don't go outside the view frustum if the user passes in a negative value
	gameObject.camera.orthographicSize = Mathf.Clamp(gameObject.camera.orthographicSize -zoomRate , Mathf.Max(minZoom, 1.0), maxZoom);
}

public function PinchZoom(zoomRate:float)
{
	// Store both touches.
	var touchZero = Input.GetTouch(0);
	var touchOne = Input.GetTouch(1);

	// Find the position in the previous frame of each touch.
	var touchZeroPrevPos = touchZero.position - touchZero.deltaPosition;
	var touchOnePrevPos = touchOne.position - touchOne.deltaPosition;

	// Find the magnitude of the vector (the distance) between the touches in each frame.
	var prevTouchDeltaMag = (touchZeroPrevPos - touchOnePrevPos).magnitude;
	var touchDeltaMag = (touchZero.position - touchOne.position).magnitude;

	// Find the difference in the distances between each frame.
	var deltaMagnitudeDiff = prevTouchDeltaMag - touchDeltaMag;

	// If the camera is orthographic...
	if (camera.isOrthoGraphic)
	{
	    // ... change the orthographic size based on the change in distance between the touches.
	    gameObject.camera.orthographicSize += deltaMagnitudeDiff * zoomRate;

	    // Make sure the orthographic size never drops below zero.
	   gameObject. camera.orthographicSize = Mathf.Clamp(camera.orthographicSize, Mathf.Max(minZoom, 1.0), maxZoom);
	}
	else
	{
	    // Otherwise change the field of view based on the change in distance between the touches.
	    camera.fieldOfView += deltaMagnitudeDiff * zoomRate;

	    // Clamp the field of view to make sure it's between 0 and 180.
	    camera.fieldOfView = Mathf.Clamp(camera.fieldOfView, 0.1f, 179.9f);
	} 
}

function Start () 
{
	
}

function Update () 
{
	 // Pinch zoom
	 if (Input.touchCount == 2)
	 {
		PinchZoom(zoomRatio);
	 }
	// Zoom in
	else if( Input.GetAxis("Mouse ScrollWheel") > 0)
	{
		MouseCameraZoom(gameObject.camera.ScreenToWorldPoint(Input.mousePosition), zoomRatio);
	}
	// Zoom out
	else if ( Input.GetAxis("Mouse ScrollWheel") < 0)
	{
		MouseCameraZoom(gameObject.camera.ScreenToWorldPoint(Input.mousePosition), -zoomRatio);	
	}
}