#pragma strict

// Include so we can manipulate buttons and sliders
import UnityEngine.UI;

// Singleton instance
private static var instance:GameObject;

// Is the sound menu not drawn by default ?
public var invisibleByDefault:boolean;

// The initial seetings for the sound options menu
public var musicVolume:float;
public var soundEffectVolume:float;
public var muteMusic:boolean;
public var muteSoundEffects:boolean;

// Should we load sound settings from a file ?
public var LoadSoundSettingsFromFile:boolean;
// The file we are loading sound options from
public var soundSettingsInputFile:TextAsset;

// The game objects used for the menu
public var MusicMuteButton:GameObject;
public var SoundEffectsMuteButton:GameObject;
public var MusicVolumeSlider:GameObject;
public var SoundEffectsVolumeSlider:GameObject;
public var ManagerBackground:GameObject;

// Internal reference to the components so we don't have to call Get Component every update
private var musicMuter:Muter;
private var soundEffectsMuter:Muter;
private var musicSlider:Slider;
private var soundEffectsSlider:Slider;

// Support for drawing it as an exclusive scene
public var drawOnLoad:boolean;
public var originalLevel:int;

function OnLevelWasLoaded (level : int) 
{
		Debug.Log("THIS HAPPENED!");
		if (level == originalLevel && drawOnLoad) 
		{
			Debug.Log("SAM I AM!");
			drawManagerScreen(true);
		}
		else
		{
			Debug.Log("WUNDERBAR!");
			drawManagerScreen(false);
		}
}

function drawManagerScreen(value:boolean)
{
	// To draw the manager screen or make it invisible, we make its children invisible, that way the manager can continue to receive messages
	MusicMuteButton.SetActive(value);
	SoundEffectsMuteButton.SetActive(value);
	MusicVolumeSlider.SetActive(value);
	SoundEffectsVolumeSlider.SetActive(value);
	ManagerBackground.SetActive(value);
}

private function LoadSoundSettings():void
{
	// If we have a valid save file and we should load sound data from the file
	if(LoadSoundSettingsFromFile && soundSettingsInputFile)
	{
		// Desserialize the data based on the format
		var allTheText:String[] = soundSettingsInputFile.text.Split("\n"[0]);
		musicSlider.value = float.Parse(allTheText[1]);
		musicMuter.mute = boolean.Parse(allTheText[3]);
		soundEffectsSlider.value = float.Parse(allTheText[5]);	
		soundEffectsMuter.mute = boolean.Parse(allTheText[7]);
	}
}

private function SaveSoundSettingsToFile():void
{
	// If we have a valid save file
	if(soundSettingsInputFile)
	{
		var path:String =  AssetDatabase.GetAssetPath(soundSettingsInputFile);
		// Put the data in the correct format
		var data:String = "Music Volume: \n";
		data+= musicSlider.value+"\n";
		data+="Music Mute: \n";
		data+= musicMuter.isMute()+"\n";
		data+="Sound Effects Volume: \n";
		data+= soundEffectsSlider.value+"\n";
		data+="Sound Effects Mute: \n";
		data+= soundEffectsMuter.isMute();
		
		// And write the data to the file
		System.IO.File.WriteAllText(path, data);
	}
}

// When the game object is destroyed
function OnDestroy()
{
	// Save the sound preferences
	SaveSoundSettingsToFile();
}

function Start () 
{
	originalLevel = Application.loadedLevel;
	
	// If our singleton is not yet instantiated
	if(instance == null)
	{
		// Create the instance
		instance = gameObject;
	}
	// Otherwise, if we are not the singleton (remeber, this method is called every time a level is loaded)
	else if (instance != gameObject)
	{
		Destroy(gameObject);
		return;
	}
	// Make sure it is not destroyed when a new scene is loaded
	DontDestroyOnLoad(gameObject);
	
	// Initialize the variables
	musicMuter               = MusicMuteButton.GetComponent(Muter);
	soundEffectsMuter        = SoundEffectsMuteButton.GetComponent(Muter);
	musicSlider              = MusicVolumeSlider.GetComponent(Slider);
	soundEffectsSlider       = SoundEffectsVolumeSlider.GetComponent(Slider);
	
	// Load sound settings from file
	LoadSoundSettings();
	// And draw the sound options menu
	drawManagerScreen(!invisibleByDefault);
}

function Update () 
{
	// Simply update our variables based on the input from the sound options
	musicVolume       = musicSlider.value;
	soundEffectVolume = soundEffectsSlider.value;
	muteMusic = musicMuter.isMute();
	muteSoundEffects = soundEffectsMuter.isMute();
}