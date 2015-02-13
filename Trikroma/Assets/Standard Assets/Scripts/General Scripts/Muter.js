#pragma strict

import UnityEngine.UI;

private var mute:boolean;

public function isMute():boolean
{
	return mute;
}

function Start () 
{
	mute = false;
	var button:Button = gameObject.GetComponent(Button);
	if(button != null)
	{
		button.onClick.AddListener(function(){mute = !mute;});
	}
}

function Update () 
{

}