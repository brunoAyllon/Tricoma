#pragma strict

var anim: Animation;

function Start () 
{
	anim = GetComponent.<Animation>();
}

function Update () 
{
	anim.PlayQueued("test4", QueueMode.CompleteOthers);
}