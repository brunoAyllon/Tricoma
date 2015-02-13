#pragma strict

public var hint:String;
private var hintText:Text;

function Start () 
{
	hintText = this.transform.parent.transform.Find("Text_Hint").GetComponent(Text);
	var thisButton:Button = gameObject.GetComponent(Button);
	if(hintText && thisButton)
	{
		thisButton.onClick.AddListener(function(){ hintText.text = hint;});
	}
}

function Update () 
{

}