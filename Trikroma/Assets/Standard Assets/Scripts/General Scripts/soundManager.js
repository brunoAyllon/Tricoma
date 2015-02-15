#pragma strict

import UnityEngine.UI;

private static var instance:GameObject;

public var invisibleByDefault:boolean;

public var musicVolume:float;
public var soundEffectVolume:float;
public var muteMusic:boolean;
public var muteSoundEffects:boolean;

public var LoadSoundSettingsFromFile:boolean;
public var soundSettingsInputFile:TextAsset;

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

private function LoadSoundSettings():void
{
	if(LoadSoundSettingsFromFile && soundSettingsInputFile)
	{
		var allTheText:String[] = soundSettingsInputFile.text.Split("\n"[0]);
		musicSlider.value = float.Parse(allTheText[1]);
		musicMuter.mute = boolean.Parse(allTheText[3]);
		soundEffectsSlider.value = float.Parse(allTheText[5]);	
		soundEffectsMuter.mute = boolean.Parse(allTheText[7]);
	}
}

private function SaveSoundSettingsToFile():void
{
	if(soundSettingsInputFile)
	{
		var path:String =  AssetDatabase.GetAssetPath(soundSettingsInputFile);
		
		var data:String = "Music Volume: \n";
		data+= musicSlider.value+"\n";
		data+="Music Mute: \n";
		data+= musicMuter.isMute()+"\n";
		data+="Sound Effects Volume: \n";
		data+= soundEffectsSlider.value+"\n";
		data+="Sound Effects Mute: \n";
		data+= soundEffectsMuter.isMute();
		
		System.IO.File.WriteAllText(path, data);
	}
}

function OnDestroy()
{
	SaveSoundSettingsToFile();
}

function Start () 
{
	if(instance == null)
	{
		instance = gameObject;
	}
	else if (instance != gameObject)
	{
		Destroy(gameObject);
		return;
	}
	
	DontDestroyOnLoad(gameObject);
	
	musicMuter               = MusicMuteButton.GetComponent(Muter);
	soundEffectsMuter        = SoundEffectsMuteButton.GetComponent(Muter);
	musicSlider              = MusicVolumeSlider.GetComponent(Slider);
	soundEffectsSlider       = SoundEffectsVolumeSlider.GetComponent(Slider);
	
	LoadSoundSettings();
	drawManagerScreen(!invisibleByDefault);
}

function Update () 
{
	musicVolume       = musicSlider.value;
	soundEffectVolume = soundEffectsSlider.value;
	muteMusic = musicMuter.isMute();
	muteSoundEffects = soundEffectsMuter.isMute();
}