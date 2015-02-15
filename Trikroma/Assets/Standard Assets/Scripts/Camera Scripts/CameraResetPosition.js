#pragma strict

private var initialPosition:Vector3;
private var initialOrthoSize:float;

// Function to be called by messages or buttons
public function ResetPosition()
{
	// Restore the camera to its initial position and zoom
	transform.position = initialPosition;
	camera.orthographicSize = initialOrthoSize;
}

function Start () 
{
	// Record the initial camera position and zoom
	initialPosition = transform.position;
	initialOrthoSize = camera.orthographicSize;
}

function Update () 
{

}