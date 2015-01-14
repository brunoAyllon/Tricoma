#pragma strict

/*
	Loads the scene with the corresponding ID, to add a new ID:
	1- File -> New Scene
	2- Save Scene as <Scene name> 
	3- Open the new scene
	4- File -> Build Settings -> Add current
	5- Still in the same 
	6- Pass the ID to the given script instance (In a button, Sprite, etc)
	
	Observation 1: Please be sure to save new scenes inside the appropriate folder
	Observation 2: There is already a load level button prefab available int the appropriate folder
*/
public function LoadLevel (levelID:int) :void
{
	Application.LoadLevel(levelID);
}