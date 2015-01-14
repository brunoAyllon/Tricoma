#pragma strict

/* The GameObject to which we are sending the message. By making it a generic game object as opposed to a 
specific script, we can reuse this for any kind of game (even 3D), so long as the ResetLevel function exists 
in the corresponding gameplay script
*/
public var puzzleToReset:GameObject = null;

public function ResetLevel() :void
{
	Debug.Log("ResetLevel ?");
	// Asks the selected game object to execute the given function name (ResetLevel, in this case)	
	puzzleToReset.SendMessage("ResetLevel");
}