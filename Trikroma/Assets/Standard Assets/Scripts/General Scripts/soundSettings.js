#pragma strict

enum AudioType{ Sound_Effect, Music};
public var componentType:AudioType;

private var soundComponent:AudioSource;
private var soundData:soundManager;



function Start () 
{
	soundComponent = gameObject.GetComponent(AudioSource);
	soundData = FindObjectsOfType(soundManager)[0];
}

function Update () 
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