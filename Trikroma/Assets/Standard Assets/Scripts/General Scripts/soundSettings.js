#pragma strict

// The type of component we are
enum AudioType{ Sound_Effect, Music};
public var componentType:AudioType;

// Our sound component
private var soundComponent:AudioSource;
// The sound manager
private var soundData:soundManager;

// Should we draw the sound menu ?
private var drawSoundMenu:boolean;

// Draw the sound options menu
public function DrawSoundOptions()
{
	// If a sound menu exists
	if(soundData)
	{
		// Toggle the state of this button
		drawSoundMenu = !drawSoundMenu;
		// And draw the menu
		soundData.drawManagerScreen(drawSoundMenu);
	}
}

function Start () 
{
	// Initialize the draw sound menu variable
	drawSoundMenu = false;
	soundComponent = gameObject.GetComponent(AudioSource);
	var soundManagers:soundManager[] = FindObjectsOfType(soundManager);
	// If a sound manager exists
	if(soundManagers.Length > 0)
	{
		// Record who it is
		soundData = FindObjectsOfType(soundManager)[0];
	}
	// And start playing the audi
	GetComponent.<AudioSource>().Play();
}

function Update () 
{
	// If we have a sound manager
	if(soundData != null)
	{
		// Update our sound setting based on what type of component we are
		switch(componentType)
		{
			case (AudioType.Sound_Effect): 
			
				soundComponent.mute   = soundData.muteSoundEffects;
				soundComponent.volume = soundData.soundEffectVolume;
				break;
				
			case (AudioType.Music):
				soundComponent.mute   = soundData.muteMusic;
				soundComponent.volume = soundData.musicVolume;
				break;
		}
	}
}