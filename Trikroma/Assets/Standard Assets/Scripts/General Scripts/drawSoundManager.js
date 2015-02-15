#pragma strict

// Do we draw the manager when the scene loads ?
public  var drawByDefault:boolean;

// The sound manager for the level
private var manager:soundManager;
// Should we draw the manager
private var drawManager:boolean;

function Start () 
{
	// Initialize the draw manager variable
	drawManager = drawByDefault;
	var soundManagers:soundManager[] = FindObjectsOfType(soundManager);
	// If a sound manager exists
	if (soundManagers.Length > 0)
	{
		// Retrieve it	
		manager = soundManagers[0];
		// If this object has a button component
		var button:Button = gameObject.GetComponent(Button);
		if(button != null)
		{
			// Tell it to act as a toggle for drawing the sound manager
			button.onClick.AddListener(function(){ drawManager = !drawManager;  manager.drawManagerScreen(drawManager);});
		}
	}
}

function Update () 
{
	
}