#pragma strict

public var minZoom:float;
public var maxZoom:float;
public var zoomRatio:float;

// Receives the mouse position in world coordinates and moves towards / away from it at a given ratio
public function cameraZoom(zoomPoint:Vector3, zoomRate:float)
{
	// New position = (desired position - current position)/ half-size when in orthographic mode   * zoomRate
	transform.position += (zoomPoint - transform.position)/gameObject.camera.orthographicSize * zoomRate;
	
	// Since this is an orthographic camera, the zoom effect is achieved by changing its orthographic size
	// Observation, the min value is a sanity check so we don't go outside the view frustum if the user passes in a negative value
	gameObject.camera.orthographicSize = Mathf.Clamp(gameObject.camera.orthographicSize -zoomRate , Mathf.Max(minZoom, 1.0), maxZoom);
}

function Start () 
{
	
}

function Update () 
{
	 if (Input.touchCount == 2)
	 {
	 	// Store both touches.
        var touchZero:Touch = Input.GetTouch(0);
        var touchOne :Touch = Input.GetTouch(1);


	 }
	
	// Zoom in
	if( Input.GetAxis("Mouse ScrollWheel") > 0)
	{
		cameraZoom(gameObject.camera.ScreenToWorldPoint(Input.mousePosition), zoomRatio);
	}
	// Zoom out
	else if ( Input.GetAxis("Mouse ScrollWheel") < 0)
	{
		cameraZoom(gameObject.camera.ScreenToWorldPoint(Input.mousePosition), -zoomRatio);	
	}
}