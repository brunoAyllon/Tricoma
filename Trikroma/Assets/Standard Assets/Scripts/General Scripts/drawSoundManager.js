#pragma strict

public  var drawByDefault:boolean;
private var manager:soundManager;
private var drawManager:boolean;

function Start () 
{
	drawManager = drawByDefault;
	manager = FindObjectsOfType(soundManager)[0];
}

function Update () 
{
	gameObject.GetComponent(Button).onClick.AddListener(function(){ drawManager = !drawManager;  manager.drawManagerScreen(drawManager);});
}