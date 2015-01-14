#pragma strict

var gameplayController:GameObject;

function Start () 
{
	
}

function Update () 
{

}

// Undoes the last move the player made
// TODO: Figure out a way to limit maximum amount of undos
public function UndoMove()
{
	gameplayController.SendMessage("UndoMove");
}

public function RedoMove()
{
	gameplayController.SendMessage("RedoMove");
}