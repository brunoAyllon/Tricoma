#pragma strict

import UnityEngine.UI;

private var instance:soundManager;


public var musicVolume:int;
public var soundEffectVolume:int;
public var muteMusic:boolean;
public var muteSoundEffects:boolean;

public var MusicMuteButton:GameObject;
public var SoundEffectsMuteButton:GameObject;
public var MusicVolumeSlider:GameObject;
public var SoundEffectsVolumeSlider:GameObject;
public var ManagerBackground:GameObject;

private var musicMuter:Muter;
private var soundEffectsMuter:Muter;
private var musicSlider:Slider;
private var soundEffectsSlider:Slider;

function drawManagerScreen(value:boolean)
{
	MusicMuteButton.SetActive(value);
	SoundEffectsMuteButton.SetActive(value);
	MusicVolumeSlider.SetActive(value);
	SoundEffectsVolumeSlider.SetActive(value);
	ManagerBackground.SetActive(value);
}

function Start () 
{
	if(instance == null)
	{
		instance = this;
	}
	else
	{
		Destroy(gameObject);
		return;
	}
	
	DontDestroyOnLoad(this.gameObject);
	
	musicMuter               = MusicMuteButton.GetComponent(Muter);
	soundEffectsMuter        = SoundEffectsMuteButton.GetComponent(Muter);
	musicSlider              = MusicVolumeSlider.GetComponent(Slider);
	soundEffectsSlider       = SoundEffectsVolumeSlider.GetComponent(Slider);
}

function Update () 
{
	musicVolume       = musicSlider.value;
	soundEffectVolume = soundEffectsSlider.value;
	muteMusic = musicMuter.isMute();
	muteSoundEffects = soundEffectsMuter.isMute();
}