#pragma strict


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
	Debug.Log("Undo");
	// Simply calls the undo functionality in Unity
	Undo.PerformUndo();
}