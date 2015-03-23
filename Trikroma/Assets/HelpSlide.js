#pragma strict
import UnityEngine.UI;

@HideInInspector var index: int = 0;
@HideInInspector var currentSlide : Image;
var slide1: Sprite;
var slide2: Sprite;
var slide3: Sprite;
var slide4: Sprite;
var slide5: Sprite;
var slide6: Sprite;

function Start()
{
	currentSlide = this.GetComponent(Image);
}

public function ChangeIndex(replace: int)
{
	index = replace;
}

function Update()
{
	switch(index)
	{
		case 0:
		currentSlide.sprite = slide1;
			break;
		case 1:
		currentSlide.sprite = slide2;
			break;
		case 2:
		currentSlide.sprite = slide3;
			break;
		case 3:
		currentSlide.sprite = slide4;
			break;
		case 4:
		currentSlide.sprite = slide5;
			break;
		case 5:
		currentSlide.sprite = slide6;
			break;
		default:
		currentSlide.sprite = slide1;
			break;
	}
}