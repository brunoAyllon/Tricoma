/*#pragma strict

// Allows to leverage .NET functionality, which permits the use of C# data structures in Java Script
import System.Collections.Generic;

// If this is not included, you can't make anything GUI related from script, kinda dump its not part of the standard package
import UnityEngine.UI;

// The canvas that will be used to hold all GUI elements, GUI elements without a canvas are not even created
private var buttonCanvas:GameObject;

// The camera the canvas draws to
public var mainCamera:Camera;


public var guiWidth:int;
public var guiHeight:int;
public var horizontalGuiWidth;
public var tabWidth:int;
public var tabHeight:int;
public var tabs:MenuTab[];
public var defaultResolution:Vector2;
public var wTohScaling:float;

private var tabDrawn:String;


enum PuzzleState
{
	Puzzle_Locked,
	Puzzle_Unlocked,
	Puzzle_Hidden,
	Puzzle_Completed
};

class MenuButton extends System.ValueType
{

	public var puzzleState:PuzzleState;
	
	public var normalTexture:Sprite;
	public var lockTexture:Sprite;
	public var completedTexture:Sprite;
	public var hiddenTexture:Sprite;
	
	public var levelToLoad:int;
	public var puzzleName:String;
	public var sceneNumber:int;
	@HideInInspector public var button:GameObject;
	
}

class ButtonArray
{
	public var buttons:MenuButton[];
}

class VerticalBox extends System.ValueType
{
	public var position:Vector2;
	public var tabWidth:int;
	public var tabHeight:int;
}

class HorizontalBox extends System.ValueType
{
	public var position:Vector2;
	public var boxWidth:int;
	public var boxHeight:int;
	public var boxTexture:Texture2D;
	public var buttonMatrix:ButtonArray[];
	public var spaceBetweenLines:int;
	public var spaceBetweenButtons:int;
}

class MenuTab extends System.ValueType
{
	public  var tabName:String;
	public  var tabImage:Sprite;
	public  var tabFont:Font;
	public  var tabTextColor:Color;
	public  var levelSelect: HorizontalBox[];
	public  var levelDisplay: VerticalBox;
	public  var theTab:GameObject;
	private var backgroundBox:GameObject;
	public var backgroundSprite:Sprite;
	public  var tabBackgroundColor:Color;
	@HideInInspector public var tabInitialized:boolean;
	@HideInInspector public var tabText:GameObject;
}

// Stores GUI tabs by their name
private var tabsByName:Dictionary.<String, MenuTab >; 


// Functions to be used by the buttons themselves
//-----------------------------------------------------------
// Loads the scene with the given ID
public function LoadPuzzle (levelID:int) :void
{
	//loadingImage.SetActive(true);
	Application.LoadLevel(levelID);
}

//-----------------------------------------------------------


// Make a tab visible/invisible
public function EnableTab(tabName:String, value:boolean):void
{
	// If the tab exists
	if(tabName!= null && tabsByName.ContainsKey(tabName) )
	{
		// We get all the child objects
		for(var i:int = 0; i < tabsByName[tabName].theTab.transform.childCount; ++i)
		{
		    var child:GameObject = tabsByName[tabName].theTab.transform.GetChild(i).gameObject;
		    if(child != null && child != tabsByName[tabName].tabText)
		    {
		        child.SetActive(value);
		    }
		}
	}
}

// Draws the GUI for the tab with the given ID
public function DrawTab(tabName:String):void
{
	// Check if we have a valid tab
	if(tabsByName != null && tabsByName.ContainsKey(tabName) )
	{
		// Stop drawing the current tab
		// Why recreate all the components from scratch when we can just make them invisible and save news and deletes ?
		EnableTab(tabDrawn, false);
		
		// We know the tab exists , so get the reference to it
		var tab:MenuTab = tabsByName[tabName];
		//Debug.Log(tab.tabInitialized );
		
		// If the tab was never initialize, do so here. If the user, never selects the tab, we waste no time or memory creating components for it
		if(tab.tabInitialized == false)
		{
			// Choose the tab we are going to draw	
			tabDrawn = tabName;
			// Mark it as initialized
			//Debug.Log(tab.tabInitialized );
			tab.tabInitialized = true;
			//Debug.Log(tab.tabInitialized );
			
			// Now create the content for it
			
			// First, we create the box to contain the tabs
			var tabBox:GameObject = new GameObject ();
			tabBox.name = "Background";
			
			// Create the box and add it to the tab
			tabBox.transform.parent = tab.theTab.transform;
			tabBox.AddComponent(CanvasRenderer);
			
			// Now we add the background image 
		    var imageDisplayed:Image = tabBox.AddComponent(Image);
            imageDisplayed.sprite = tab.backgroundSprite;
            imageDisplayed.color = tab.tabBackgroundColor;
            imageDisplayed.type = Image.Type.Sliced;
			
			// Now we adjust the position of the box
			var boxTransform:RectTransform =  tabBox.GetComponent(RectTransform);
		    boxTransform.sizeDelta = new Vector2 (tabWidth, Mathf.Abs(guiHeight - tabHeight) );
	        boxTransform.localPosition = new Vector3 ( 0 ,  0, 0);
	        var leftBoundry:float = buttonCanvas.transform.position.x - Mathf.Ceil(guiWidth/8.0);
	        boxTransform.anchoredPosition = new Vector2(leftBoundry - tab.theTab.transform.position.x , -( tabHeight + guiHeight)/2.0 );
			boxTransform.anchorMin = new Vector2(0.0, 0.0);
			boxTransform.anchorMax = new Vector2(1.0, 1.0);
			boxTransform.pivot     = new Vector2(0.5, 0.5);
		//	boxTransform.rect.Set (tabWidth, guiHeight - tabHeight, guiWidth, guiHeight);
			boxTransform.localScale= new Vector3(1.0, 1.0, 1.0);
	      
			tabsByName[tabName] = tab;
		}
		
		// Update the tab we have currently selected
		tabDrawn = tabName;
		// Now draw draw it
		EnableTab(tabDrawn, true);
	}
}

function Start () 
{
	tabsByName= new Dictionary.<String, MenuTab >();

	// First we create the menu object
	buttonCanvas = new GameObject ("Main Menu", Canvas);
	// Make it a child of this object
	buttonCanvas.transform.SetParent(this.transform, false);
	buttonCanvas.transform.position = this.transform.position;
	// Add a canvas
	// TODO: This seems to be related to screen resolution, must research later
	var scaler:UI.CanvasScaler = buttonCanvas.AddComponent(CanvasScaler);
	buttonCanvas.AddComponent(GraphicRaycaster);
	
	var canvas:Canvas = buttonCanvas.GetComponent(Canvas);
	var canvasTransform = buttonCanvas.GetComponent(RectTransform);
	canvasTransform.localPosition = transform.position;
	canvas.renderMode = RenderMode.ScreenSpaceCamera;
	canvas.worldCamera = mainCamera;
	scaler.uiScaleMode = UI.CanvasScaler.ScaleMode.ScaleWithScreenSize;
	scaler.referenceResolution = defaultResolution;
	scaler.matchWidthOrHeight = wTohScaling;
	
	var tabNum:int = 0;
	// Now draw the tabs
	for(var tab in tabs)
	{
		// Set the tab as having no components
		 tab.tabInitialized = false;
         var newTab:GameObject = new GameObject ();
         newTab.name = tab.tabName;
         newTab.transform.parent = canvas.transform;
         var tabTransform:RectTransform =  newTab.AddComponent(RectTransform);
	     tabTransform.sizeDelta = new Vector2 (tabWidth,tabHeight);
         tabTransform.localPosition = new Vector3 ( Mathf.Ceil(-guiWidth/2.0) + tabNum * tabWidth, guiHeight - tabHeight, canvasTransform.localPosition.z);
         var toggleComponent:Button = newTab.AddComponent(Button);
         toggleComponent.transition = Selectable.Transition.None;
         toggleComponent.onClick.AddListener (function(){DrawTab(tab.tabName);}); 
         var imageDisplayed:Image = newTab.AddComponent(Image);
         imageDisplayed.sprite = tab.tabImage;
         imageDisplayed.type = Image.Type.Sliced;
		 ++tabNum;
		 
		 // Now create the text for the tab
		 var tabText:GameObject = new GameObject ();
		 tabText.name = "Text";
		 tabText.transform.parent = newTab.transform;
		 var textTransform:RectTransform =  tabText.AddComponent(RectTransform);
		 textTransform.anchoredPosition = new Vector2(0.0, 0.0);
		 textTransform.anchorMin = new Vector2(0.0, 0.0);
		 textTransform.anchorMax = new Vector2(1.0, 1.0);
		 textTransform.pivot     = new Vector2(0.5, 0.5);
		 textTransform.rect.Set (0.0, 0.0, 0.0, 0.0);
		 
		 var textString: Text = tabText.AddComponent(Text);
		 textString.text = tab.tabName;
		 textString.alignment = TextAnchor.MiddleCenter;
		 textString.color = tab.tabTextColor;
		 textString.font = tab.tabFont;
		 
		 tab.tabText = tabText;
		 tab.theTab = newTab;
		 
		 // Add the tab to the reference list
		 if(!tabsByName.ContainsKey(tab.tabName))
		 {
		 	tabsByName.Add(tab.tabName, tab);
		 }
	}
		 
}

function Update () 
{

}*/