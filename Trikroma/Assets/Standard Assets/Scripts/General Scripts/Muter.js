#pragma strict

// Load UI components
import UnityEngine.UI;

// Should we mute ?
public var mute:boolean;

// Getter
public function isMute():boolean
{
	return mute;
}

function Start () 
{
	// Do not mute by default
	mute = false;
	// If the object we are attached to has a valid button component
	var button:Button = gameObject.GetComponent(Button);
	if(button != null)
	{
		// Set it to toggle the value of mute on click	
		button.onClick.AddListener(function(){mute = !mute;});
	}
}

function Update () 
{

}