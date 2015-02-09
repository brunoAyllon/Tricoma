//#pragma strict

public var levelToLoad:int;

function LoadLevel ()
{
	Debug.Log("Loading");
	Application.LoadLevel(levelToLoad);
}

/*public function LoadLevel (levelID:int) :void
{
	//loadingImage.SetActive(true);
	Application.LoadLevel(levelID);
}*/