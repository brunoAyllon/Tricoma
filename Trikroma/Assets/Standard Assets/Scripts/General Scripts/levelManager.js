#pragma strict

// Allows to leverage .NET functionality, which permits the use of C# data structures in Java Script
import System.Collections.Generic;

// If this is not included, you can't make anything GUI related from script, kinda dumb its not part of the standard package
import UnityEngine.UI;

// Used to implement a very simple (yet perfectly suitable to the scope of this script) singleton pattern
// In other words, there can be only one. Only one version of the game object that contains this script can exist at a time
@HideInInspector static public var singletonInstance:GameObject;

public var loadManagerStateFromFile:boolean;
public var managerSaveFile:TextAsset;

// The default background for the GUI
public var GUIBackgroundObject:GameObject;

// The name of the tab that will be drawn by default
public var initialTabName:String;

// Used internally so the GUI only draws itself in the scene it was originilally instanciated to
private var originalLevel:int;
// The tab we have currently selected
private var currentTab:String;

// The object that will be used as the background for the display
public var displayBackground:GameObject;

// The object that will be used as the display screen
public var displayScreen:GameObject;

// The object that will be drawn upon completion of a level
public var displayCompleted:GameObject;

// The object that will be used as a level select button
/* 
Observation: If you drop in an object that does not have a button and level select component by default, like an image,
the script is smart enough to add one 
*/
public var levelSelectButton:GameObject;

public var levelContinueButton:GameObject;
private var continueLevel:boolean;

// What button are currently displaying
private var displayedButton:GameObject;

public var completionSlider:GameObject;
public var completionText:String;
private var sliderTextComponent:Text;


// Enum used to determine the current state of a puzzle
enum PuzzleState
{
	Puzzle_Locked,
	Puzzle_Unlocked,
	Puzzle_Hidden,
	Puzzle_Completed
};

// Used to specify a receiver to a message sent inside the script 
class Receiver
{
	public var tabName:String;
	public var sceneItLoads:int;
}

class MenuTab
{
	// The gameobject that will be used as a tab	
	public var tab:GameObject;
	// The 
	public var tabName:String;
	// Background sprite for this tab
	public var tabBackground:Sprite;
	// Display background sprite for this tab
	public var displayBackground:Sprite;
	// All the buttons in the current tab
	// Observation 1: The data will be associated to the buttons in the order they were declared in the guiButtons variable
	// Observation 2: The data number of buttons MUST me the same as the size of the gui buttons variable
	public var guiButtons:MenuButton[];
	// Button that is displayed by default as the tab is loaded
	public var defaultDisplayedButton:GameObject;
	
	
	// These act as different ways to access the same data
	
	// Stores GUI tabs by their ID
	@HideInInspector public var buttons:Dictionary.<int, MenuButton>; 
	// Allows us to obtain the button's data by passing in the object it is bound to
	@HideInInspector public var objectToButton:Dictionary.<GameObject, MenuButton>; 
}

class MenuButton 
{

	// Current state of the puzzle
	public var puzzleState:PuzzleState;
	// Indicates which puzzles in which tabs must be unlocked in order to make this button unlocked ONLY IF ITS CURRENT STATE IS HIDDEN
	public var completeToUnlock:Receiver[];
	
	// What textures will be displayed in the button when they are in the correspondent state
	public var unlockedTexture:Sprite;
	public var lockTexture:Sprite;
	public var completedTexture:Sprite;
	public var hiddenTexture:Sprite;
	
	// What textures will be displayed in the screen when they are in the correspondent state
	public var displayUnlockedTexture:Sprite;
	public var displayLockTexture:Sprite;
	public var displayCompletedTexture:Sprite;
	public var displayHiddenTexture:Sprite;
	
	// The text component of the button
	public var buttonText:Text;
	// The name of the puzzle
	public var puzzleName:String;
	// The ID of the puzzle the button will load on click
	public var sceneToLoad:int;
	// Refrence to the gameobject that represents the button
	@HideInInspector public var button:GameObject;
	// Used to list all objects
	@HideInInspector public var listenForCompletion:ArrayList;
	 
	// How many stages must still be finished to change button state from hidden to unlocked
	@HideInInspector public var leftToUnlock:int;
	
	
	@HideInInspector public var continueLevel:boolean;
	
	// Message sent when completing a stage needed to unlock the button 
	public function CompleteRequirement()
	{
		// Remove one item from the total
		leftToUnlock = Mathf.Max(leftToUnlock-1.0, 0.0);
		Debug.Log(puzzleName+" , "+puzzleState+" , "+leftToUnlock);
		// If all requirements are met
		if(puzzleState == PuzzleState.Puzzle_Hidden && leftToUnlock == 0)
		{
			// Unlock the button
			puzzleState = PuzzleState.Puzzle_Unlocked;
			button.GetComponent(Image).sprite = unlockedTexture;
		}
	}
}



// The buttons that will be used for all tabs
// Observation: Buttons will be binded IN THE ORDER THEY ARE DECLARED (for example, guiButton[0] will be affected by the data in currentTab.guibutton[0]
public var guiTabs:MenuTab[];
// Stores all existing tabs by name
private var tabs:Dictionary.<String, MenuTab>; 

// Interface for reading all the input data, Unity will not display dictionaries because reasons
public var guiButtons:GameObject[];

// The total number of levels to finish in order to achieve 100% completion status
private var levelsToComplete:int;
// How many levels have we completed so far ?
private var levelsCompleted:int;

// Load manager data from file
public function LoadManagerState():boolean
{
	if (loadManagerStateFromFile && managerSaveFile)
	{
		// Get all the data in the file and split it by lines
		var allTheText:String[] = managerSaveFile.text.Split("\n"[0]);
		// If the file is empty, return false
		if(allTheText.Length == 0)
		{
			return false;
		}
		
		// Otherwise, get the current tab being displayed
		currentTab = allTheText[0];
		var i:int = 1;
		
		// And read all the data for each tab
		for (tab in guiTabs)
		{
			for(button in tab.guiButtons)
			{
				var data:String[] = allTheText[i].Replace(" ", "").Replace("(", "").Replace(")", "").Split(','[0]);
				var tabName:String = data[0];
				var sceneNumber:int = int.Parse(data[1]);
				var state:PuzzleState = System.Enum.Parse( typeof( PuzzleState ), data[2]);
				var leftToUnlock:int = int.Parse(data[3]);
				var continueLevel:boolean = boolean.Parse(data[4]);
				
				Debug.Log("Tab to update: "+tabName);
				tabs[tabName].buttons[sceneNumber].puzzleState = state;
				tabs[tabName].buttons[sceneNumber].leftToUnlock = leftToUnlock;
				tabs[tabName].buttons[sceneNumber].continueLevel = continueLevel;
				++i;
			}
		}
	}
	return true;
}

public function SaveManagerState():void
{	
	// If we have a valid save file
	if(managerSaveFile)
	{
		// Get the file path
		var path:String =  AssetDatabase.GetAssetPath(managerSaveFile);
		// Write the current string
		var data:String = currentTab+"\n";
		
		/*
		 And store data on each file in the format (name of the tab the button belongs to, scene the button loads, state of the puzzle, how many levels left to unlock it, 
		 did the user finish it or do we need to continue it? 
		*/
		
		for (tab in guiTabs)
		{
			for(button in tab.guiButtons)
			{
				data+= " ( "+tab.tabName+" , "+button.sceneToLoad+" , "+button.puzzleState+" , "+button.leftToUnlock +" , "+button.continueLevel+" )\n";
			}
		}
		
		// And write all the data to the file
		System.IO.File.WriteAllText(path, data);
	}
}

// Count how many levels are completed so far
function CheckLevelsCompleted():int
{
	var howManyCompleted:int = 0.0;
	for(var tab in tabs)
	{
		for(button in tab.Value.guiButtons)
		{
			if(button.puzzleState == PuzzleState.Puzzle_Completed)
			{
				++howManyCompleted;
			}
		}
	}
	return howManyCompleted;
}

private function UpdateCompletionText()
{
	if(sliderTextComponent)
	{
		Debug.Log(levelsCompleted+" / "+levelsToComplete);
		sliderTextComponent.text = completionText +" "+ (levelsCompleted / levelsToComplete)+"%";
	}
}

// Makes the GUI visible or invisible
function VisibleGUI(value:boolean):void
{
	// We get all the child objects
	for(var i:int = 0; i < gameObject.transform.childCount; ++i)
	{
		// And make them all draw
	    var child:GameObject = gameObject.transform.GetChild(i).gameObject;
	    if(child != null)
	    {
	        	child.SetActive(value);
	    }
	}
	// If we are making the GUI visible
	if (value == true)
	{
		// Update the button display
		DrawButtonDisplay(displayedButton);
	}
}

public function DrawLevelSelectButton():boolean
{
	var currentPuzzleState:PuzzleState = tabs[currentTab].objectToButton[displayedButton].puzzleState;
	// If the button we are currently displaying is not unlocked or completed
	if(currentPuzzleState != PuzzleState.Puzzle_Unlocked && currentPuzzleState != PuzzleState.Puzzle_Completed)
	{
		// Disable the button
		levelSelectButton.SetActive(false);
		return false;
	}
	// Otherwise, enable it
	else
	{
		levelSelectButton.SetActive(true);
	}
	return true;
	
}

// If the selected level was not finished, draw the continue button
// Observation: Continue might be drawn on a completed puzzle if the user replayed it and stopped half-way
public function DrawLevelContinueButton():boolean
{
	
	if(tabs[currentTab].objectToButton[displayedButton].continueLevel)
	{
		levelContinueButton.SetActive(true);
		return true;
	}
	else
	{
		levelContinueButton.SetActive(false);
		return false;
	}
}

// Draw the level complete image if the puzzle was completed
public function DrawLevelCompletedImage():void
{
	// If the level is complete
	if(tabs[currentTab].objectToButton[displayedButton].puzzleState == PuzzleState.Puzzle_Completed)
	{
		// Make the image visible
		displayCompleted.SetActive(true);
	}
	else
	{
		// Otherwise, make it invisible
		displayCompleted.SetActive(false);
	}
}

public function DrawTab(tabName:String):void
{
	Debug.Log("Tab to draw: "+tabName);
	
	// Error if the tab we asked to draw doesn't exist
	if(!tabs.ContainsKey(tabName))
	{
		Debug.Log("Draw Tab error, "+ tabName+" is not a valid tab name");
	}
	// Or if the size of buttons to bind is different than buttons in the tab
	else if(guiButtons.Length != tabs[tabName].guiButtons.Length)
	{
		Debug.Log("Invalid Tab: The tab "+tabName+" has "+tabs[tabName].guiButtons.Length+ " tabs while the GUI has "+guiButtons.Length+" buttons");
	}
	else 
	{
		// Go through every button in the tab
		for (var button in tabs[tabName].buttons)
		{
			// And update its sprite and text components
			switch (button.Value.puzzleState)
			{
				case PuzzleState.Puzzle_Locked:
				button.Value.button.GetComponent(Image).sprite = button.Value.lockTexture;
				break;
				
				case PuzzleState.Puzzle_Unlocked:
				button.Value.button.GetComponent(Image).sprite = button.Value.unlockedTexture;
				break;
				
				case PuzzleState.Puzzle_Hidden:
				Debug.Log("I am hidden");
				button.Value.button.GetComponent(Image).sprite = button.Value.hiddenTexture;
				break;
				
				case PuzzleState.Puzzle_Completed:
				button.Value.button.GetComponent(Image).sprite = button.Value.completedTexture;
				break;
			}
			
			// And draw its associated text, if any exists
			var buttonText:Text = button.Value.button.GetComponent(Text);
			if(buttonText != null)
			{
				buttonText = button.Value.buttonText;
			}
		}
		
		// Now update the display background to render the current tab's background
		var displayBackground:Image = displayBackground.GetComponent(Image);
		if(displayBackground != null)
		{
			displayBackground.sprite = tabs[tabName].displayBackground;
		}
		// And do the same for the gui background
		var guiBackground:Image = GUIBackgroundObject.GetComponent(Image);
		if(displayBackground != null)
		{
			guiBackground.sprite = tabs[tabName].tabBackground;
		}
		
		// And set it as our current tab being displayed
		currentTab = tabName;
		
		// Lastly, draw the button display
		DrawButtonDisplay(tabs[tabName].defaultDisplayedButton);
	}
}

public function DrawButtonDisplay(button:GameObject)
{
	// If the button we will display exists
	if(button != null)
	{
		displayedButton = button;
		
		// And if it has a text component
		var displayText:Text = displayScreen.GetComponentInChildren(Text);
		var puzzleState:PuzzleState = tabs[currentTab].objectToButton[button].puzzleState;
		if(displayText != null)
		{
			// Display the puzzle's name
			displayText.text = tabs[currentTab].objectToButton[button].puzzleName;
		}
		
		// If it is completed, draw the level complete image
		DrawLevelCompletedImage();
		
		
		// Now choose what image to display based on the puzzle's current state
		var buttonData:MenuButton = tabs[currentTab].objectToButton[button];
		switch (puzzleState)
		{
			case PuzzleState.Puzzle_Locked:
			displayScreen.GetComponent(Image).sprite = buttonData.displayLockTexture;
			break;
			
			case PuzzleState.Puzzle_Unlocked:
			displayScreen.GetComponent(Image).sprite = buttonData.displayUnlockedTexture;
			break;
			
			case PuzzleState.Puzzle_Hidden:
			displayScreen.GetComponent(Image).sprite = buttonData.displayHiddenTexture;
			break;
			
			case PuzzleState.Puzzle_Completed:
			displayScreen.GetComponent(Image).sprite = buttonData.displayCompletedTexture;
			break;
		}
		// If the puzzle is unlocked or completed
		if ( DrawLevelSelectButton() )
		{
			// Update what scene will be loaded
			var levelLoader:LoadLevel = levelSelectButton.GetComponent(LoadLevel);
			levelLoader.levelToLoad = tabs[currentTab].objectToButton[button].sceneToLoad;
		}
		
		if(DrawLevelContinueButton())
		{
			// Update what scene will be loaded
			var continueLoader:LoadLevel = levelContinueButton.GetComponent(LoadLevel);
			continueLoader.levelToLoad = tabs[currentTab].objectToButton[button].sceneToLoad;
		}
		
	}
}

// Notify all gameplay controllers of the existance of the level manager
public function BroadcastLevelManagersExistance():void
{
	var listeners : ColorGameplay[] = FindObjectsOfType(ColorGameplay) as ColorGameplay[];
	for (var listener : ColorGameplay in listeners) 
	{
		listener.gameObject.SendMessage("RegisterLevelManager", gameObject, SendMessageOptions.DontRequireReceiver);
	}
}

// Tells the gameplay controller if we are continuing a level or not
public function LoadSaveFile()
{
	var listeners : ColorGameplay[] = FindObjectsOfType(ColorGameplay) as ColorGameplay[];
	for (var listener : ColorGameplay in listeners) 
	{
		listener.gameObject.SendMessage("LoadSave", continueLevel, SendMessageOptions.DontRequireReceiver);
	}
}


public function NotifyCompletion(level:int)
{
	// Notify the gameplay controllers if this scene was previously completed
	var listeners : ColorGameplay[] = FindObjectsOfType(ColorGameplay) as ColorGameplay[];
	for (var listener : ColorGameplay in listeners) 
	{		
		listener.LevelIsComplete((tabs[currentTab].buttons[level].puzzleState == PuzzleState.Puzzle_Completed));
	}
}

// Load the scene in which the main menu was originally created
public function GoBackToMenu()
{
	Application.LoadLevel(originalLevel);
}

// Functions to update the current button's image and state, expected to be called from other scripts
public function UnlockLevel(sceneID:int):void
{
	tabs[currentTab].buttons[sceneID].puzzleState = PuzzleState.Puzzle_Unlocked;
	tabs[currentTab].buttons[sceneID].button.GetComponent(Image).sprite = tabs[currentTab].buttons[sceneID].unlockedTexture;
}

public function LockLevel(sceneID:int):void
{
	tabs[currentTab].buttons[sceneID].puzzleState = PuzzleState.Puzzle_Locked;
	tabs[currentTab].buttons[sceneID].button.GetComponent(Image).sprite = tabs[currentTab].buttons[sceneID].lockTexture;
}

public function HideLevel(sceneID:int)
{
	tabs[currentTab].buttons[sceneID].puzzleState = PuzzleState.Puzzle_Hidden;
	tabs[currentTab].buttons[sceneID].button.GetComponent(Image).sprite = tabs[currentTab].buttons[sceneID].hiddenTexture;
}

// Called by the gameplay controller to notify the level manager that a puzzle was complete
public function CompleteLevel(sceneID:int):void
{	
	tabs[currentTab].buttons[sceneID].puzzleState = PuzzleState.Puzzle_Completed;
	tabs[currentTab].buttons[sceneID].button.GetComponent(Image).sprite = tabs[currentTab].buttons[sceneID].completedTexture;
	tabs[currentTab].buttons[sceneID].continueLevel = false;
	for( var listener:Receiver in tabs[currentTab].buttons[sceneID].listenForCompletion)
	{
		tabs[listener.tabName].buttons[listener.sceneItLoads].CompleteRequirement();
	}
	
	++levelsCompleted;
	completionSlider.GetComponent(Slider).value = levelsCompleted;
	UpdateCompletionText();
	DrawTab(currentTab);
}

// Setter for the continue level variable of a scene
public function ContinueLevel(sceneID:int):void
{
	tabs[currentTab].buttons[sceneID].continueLevel = true;
}

// Used in order to make a button draw a specific tab
public function BindGUITab(tabButton:Button, tabToDraw:String):void
{
	tabButton.onClick.AddListener (function(){DrawTab(tabToDraw);});
}

// Used in order to make a button draw a specific button display
public function BindGUIButton(button:GameObject):void
{
	button.GetComponent(Button).onClick.AddListener (function(){DrawButtonDisplay(button);}) ;
}

// Binds the buttons of a specific tab
public function BindGUITabButtons(tabName:String):void
{
	// Fill the button's dictionary
	for (var i:int = 0; i < tabs[tabName].guiButtons.Length; ++i)
	{
		// Bind them to the correct button
		tabs[tabName].guiButtons[i].button = guiButtons[i];
		tabs[tabName].guiButtons[i].continueLevel = false;
		// And add them to the dictionaries
		tabs[tabName].buttons.Add(tabs[tabName].guiButtons[i].sceneToLoad, tabs[tabName].guiButtons[i]);
		tabs[tabName].objectToButton.Add(guiButtons[i], tabs[tabName].guiButtons[i]);
	}
}

// Activates when a new scene is loaded
function OnLevelWasLoaded (level : int) 
{
		// If it is the main menu's original scene, we draw it
		if (level == originalLevel) 
		{
			Debug.Log("GUI enabled");
			VisibleGUI(true);
		}
		// Otherwise hide the menu
		else
		{
			Debug.Log("GUI disabled");
			// And inform the gameplay controller of our existence
			BroadcastLevelManagersExistance();
			// Make the GUI invisible
			VisibleGUI(false);
			// Tell the gameplay controller if we are continuing a level or not
			LoadSaveFile();
			// And set the continue button not to draw
			continueLevel = false; 
		}
		// And notify the gameplay controller if the level was previously completed
		NotifyCompletion(level);
}

function OnDestroy()
{
	// Save the game's current state
	SaveManagerState();
}

function Awake () 
{
	// Enforces the singleton patters
	// If the singleton was not registered yet, do so
	if(singletonInstance == null)
	{
		singletonInstance = gameObject;
	}
	// Otherwise, destroy this instance
	/* 
		Observation: There are better ways to enforce the singleton pattern, but time was an issue at the time this code was written.
		Therefore, this solution was adopted as it was swift to implement an generates little overhead, given the intended use of the script
	*/
	else
	{
		Destroy(gameObject);
		return;
	}
	
	// Make sure the level manager is still around to receive messages from scenes
	DontDestroyOnLoad (gameObject);
	
	// Set the tab to draw
	currentTab = initialTabName;
	// Initialize the tab dictionary
	tabs = new Dictionary.<String, MenuTab >();
	
	 sliderTextComponent = GetComponentInChildren(Text);
	
	/*
	Observation: int order to bind the on click behavior to a certain button , we must pass in a function with no parameters, so in order to tell a button to call DrawButtonDisplay with a
	specific scene ID, for example, we must wrap the callback inside a lambda. Since we are inside a loop, instead of passing the scene id by value, Javascript decides to keep the temporary
	variable around and pass a reference to it for all the lambdas, so by the end of the loop, all of them would have a reference to the same scene id, so all would only draw the display
	of the last scene. In order for each callback to record its own parameter, we wrap it again inside a function with parameters, thus ensuring each input is passed in by value. So to
	reiterate, in order to bind a function with parameters to a button in the script side, we need a callback wrapped inside a a function wrapped inside a lamda. -_-'
	
	Who tough this was clever language architecture in the first place ?
	*/
	
	// Go through every tab
	for (var i:int = 0; i < guiTabs.Length; ++i)
	{
	
		// Except for duplicates
		if(!tabs.ContainsKey(guiTabs[i].tabName))
		{
			var tabName:String = guiTabs[i].tabName;
			// Initialize its internal variables
			guiTabs[i].buttons = new Dictionary.<int, MenuButton>();
			guiTabs[i].objectToButton = new Dictionary.<GameObject, MenuButton>();
			
			// Bind the buttons to the correct data structures
			var tabButton:Button = guiTabs[i].tab.GetComponent(Button);
			if(tabButton == null)
			{
				tabButton = guiTabs[i].tab.AddComponent(Button);
			}
			// And tell them to draw their displays when they are clicked on
			BindGUITab(tabButton, tabName); 
			// And add them to the dictionaries
			tabs.Add(tabName, guiTabs[i]);
			
			BindGUITabButtons(tabName);
		}
		Debug.Log(tabName);
		
		// Make sure all tabs are children of our canvas
		guiTabs[i].tab.transform.SetParent(this.transform, false);
	}
	
	// For every button
	for(button in guiButtons)
	{
		// Make them a child of this canvas to avoid problems when calling GUI Visible 
		button.transform.SetParent(this.transform, false);
		// If they don't have a button component, add it
		var buttonComponent:Button = button.GetComponent(Button);
		if(buttonComponent == null)
		{
			buttonComponent = button.AddComponent(Button);
		}
		BindGUIButton(button);	
	}
	
	// If the level select button doesn't have a button component, add it
	var selectButton:Button = levelSelectButton.GetComponent(Button);
	if(selectButton == null)
	{
		selectButton = levelSelectButton.AddComponent(Button);
	}
	
	// Also add a level loader component in case none can be found
	var levelLoader:LoadLevel = levelSelectButton.GetComponent(LoadLevel);
	if(levelLoader == null)
	{
		levelLoader = levelSelectButton.AddComponent(LoadLevel);
	}
	// And tell the script to load a new scene on click
	selectButton.onClick.AddListener(function(){levelLoader.LoadLevel();});
	
	
	// Add a button component to the continue button if none can be found
	var continueButton:Button = levelContinueButton.GetComponent(Button);
	if(continueButton == null)
	{
		continueButton = levelContinueButton.AddComponent(Button);
	}
	
	// Also add a level loader component in case none can be found
	var continueLoader:LoadLevel = levelContinueButton.GetComponent(LoadLevel);
	if(continueLoader == null)
	{
		continueLoader = levelContinueButton.AddComponent(LoadLevel);
	}
	// And tell the script to load a new scene on click
	continueButton.onClick.AddListener(function(){continueLevel = true; continueLoader.LoadLevel();});
	continueLevel = false;
	
	// Now load the current state of the game
	LoadManagerState();
	
	// Now draw the current tab and make the GUI visible
	DrawTab(currentTab);
	VisibleGUI(true);
	
	originalLevel = Application.loadedLevel;
	
	// Now that all tabs are initialized
	for (var tab in tabs)
	{
		for(var button in tab.Value.buttons)
		{
			for (var buttonToRegister:Receiver in button.Value.completeToUnlock)
			{
				// We register all the listeners to the buttons they are listening to
				var newReceiver:Receiver = new Receiver ();
				newReceiver.tabName = tab.Value.tabName;
				newReceiver.sceneItLoads = button.Value.sceneToLoad;
				Debug.Log(buttonToRegister.tabName+" , "+buttonToRegister.sceneItLoads);
				if (tabs[buttonToRegister.tabName].buttons[buttonToRegister.sceneItLoads].listenForCompletion == null )
				{
					tabs[buttonToRegister.tabName].buttons[buttonToRegister.sceneItLoads].listenForCompletion = new ArrayList();
				}
				
				tabs[buttonToRegister.tabName].buttons[buttonToRegister.sceneItLoads].listenForCompletion.Add(newReceiver);
			}
		}
	}
	
	// Count the number of levels to complete
	levelsToComplete = 0.0;
	for(var tab in guiTabs)
	{
		for(button in tab.guiButtons)
		{
			++levelsToComplete;
		}
	}
	
	// And the number of levels completed
	levelsCompleted = CheckLevelsCompleted();
	
	// Lastly, initialize the completion slider
	var slider:Slider = completionSlider.GetComponent(Slider);
	slider.minValue = 0;
	slider.maxValue = levelsToComplete;
	slider.value = levelsCompleted;
	
	UpdateCompletionText();
}

function Update () 
{

}