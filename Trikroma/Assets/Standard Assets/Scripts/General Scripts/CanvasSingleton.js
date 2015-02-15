#pragma strict

// Observation: This is a perfect example of how to do singleton in general

// The singleton instance
private static var instance:GameObject;

function Start () 
{
	// If the singleton was not instantiated
	if(instance == null)
	{
		// We become the singleton
		instance = gameObject;
	}
	// And we are not the singleton
	else if (instance != gameObject)
	{
		Destroy(gameObject);
		return;
	}
	
	// Make sure this object isn't unloaded, otherwise it could wipe out the settings for the sound manager
	DontDestroyOnLoad(gameObject);
}

function Update () 
{

}