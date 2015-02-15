// ID of the level we will load
public var levelToLoad:int;

function LoadLevel ()
{
	Debug.Log("Loading");
	// Loads the level with the given ID, to check level IDs or add new levels, go to File->Build Settings
	Application.LoadLevel(levelToLoad);
}