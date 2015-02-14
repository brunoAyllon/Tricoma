#pragma strict

private var instance:GameObject;

function Start () 
{
	if(instance == null)
	{
		instance = gameObject;
	}
	else
	{
		Destroy(gameObject);
		return;
	}
	
	DontDestroyOnLoad(gameObject);
}

function Update () 
{

}