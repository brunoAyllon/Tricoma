#pragma strict

private var initialPosition:Vector3;

public function ResetPosition()
{
	transform.position = initialPosition;
}

function Start () 
{
	initialPosition = transform.position;
}

function Update () 
{

}