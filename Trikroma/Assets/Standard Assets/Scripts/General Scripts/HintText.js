#pragma strict

// Text we are going to display
public var hint:String;
// The component that will display the text
private var hintText:Text;

function Start () 
{
	// Find the object in the hierarchy with the pre-established name
	hintText = this.transform.parent.transform.Find("Text_Hint").GetComponent(Text);
	var thisButton:Button = gameObject.GetComponent(Button);
	// If this object has a valid  button components and text hint has a valid text component
	if(hintText && thisButton)
	{
		// Set the button to display, on click, the given hint in the Text_Hint's text component
		thisButton.onClick.AddListener(function(){ hintText.text = hint;});
	}
}

function Update () 
{

}