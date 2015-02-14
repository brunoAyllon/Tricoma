#pragma strict

enum AudioType{ Sound_Effect, Music};
public var componentType:AudioType;

private var soundComponent:AudioSource;
private var soundData:soundManager;

private var drawSoundMenu:boolean;

public function DrawSoundOptions()
{
	if(soundData)
	{
		drawSoundMenu = !drawSoundMenu;
		soundData.drawManagerScreen(drawSoundMenu);
	}
}

function Start () 
{
	soundComponent = gameObject.GetComponent(AudioSource);
	var soundManagers:soundManager[] = FindObjectsOfType(soundManager);
	if(soundManagers.Length > 0)
	{
		soundData = FindObjectsOfType(soundManager)[0];
	}
	audio.Play();
}

function Update () 
{
	drawSoundMenu = false;
	if(soundData != null)
	{
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