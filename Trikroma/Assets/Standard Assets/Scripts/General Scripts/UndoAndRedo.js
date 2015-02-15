#pragma strict

public var gameplayController:GameObject;

function Start () 
{
	
}

function Update () 
{

}

// Undoes the last move the player made
public function UndoMove():void
{
	gameplayController.SendMessage("UndoMove");
}

// Redoes the last move the player made
public function RedoMove():void
{
	gameplayController.SendMessage("RedoMove");
}