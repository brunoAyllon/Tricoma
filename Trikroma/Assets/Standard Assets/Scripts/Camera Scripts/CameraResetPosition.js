#pragma strict

private var initialPosition:Vector3;
private var initialOrthoSize:float;

public function ResetPosition()
{
	transform.position = initialPosition;
	camera.orthographicSize = initialOrthoSize;
}

function Start () 
{
	initialPosition = transform.position;
	initialOrthoSize = camera.orthographicSize;
}

function Update () 
{

}