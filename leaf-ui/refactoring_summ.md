# BloomingLeaf Refactoring Changes
Previously the BloomingLeaf front-end source code contained irrelavent functions, style inconsistencies and minimal documentation for existing functions. This document will outline the major refactoring changes that took place and will summarize how BloomingLeaf's front-end code works.

# How it works
When the website is loaded up, one of the first files Javascript files that are loaded is ```Class.js```.
This file contains the class definitions for the Classes listed in [this]() UML diagram.
Then all of the Javascript files in the ```rappid-extensions``` folder are loaded. These files contain definitions for Backbone views for the website's inspector (the panel on the right hand side). 
Finally, the website loads six more Javascript files, containing code that handles interactions that are not related to the website's insepector. Previously these six files were part of a large ```main.js``` file, which does not exist anymore. The six Javascript files are loaded in the following order:
![Loading diagram](./loading_diagram.png?raw=true "Title")

There is a reason why these files are loaded in that pariculiar order. In general files that are loaded later, have some sort of dependecy to files loaded earlier. The purpose of these six files will now be explained in more detail.

### initializeElements.js
This file contains code that initializes and sets up the necessary Rappid, JointJS and noUISlider elements.

Here is where we initialize variables for the  joint.Graph, joint.Paper, rappid.Stencil, Backbone views and custom shapes for the goals, tasks, soft-goals etc. In addition, Javascript objects that are used to map one string to another (ex. ```satValueDict``` and ```linkValText```) are initialized here as well.

Most notably, two important global variables, ```model``` and ```analysisRequest``` are initialized here as well. ```model``` is a ```Model``` object and ```analysisRequest``` is an ```AnalysisRequest``` object (see UML).

```model``` would contain up-to-date information about the current model displayed on the canvas. It is continually maintained so that it is up-to-date.

```analysisRequest``` contains analysis information, which is also well maintained so it can be up-to-date.

Since ```model``` and ```analysisRequest``` are global, it is easy to maintain them anywhere in the code if required.

Together, ```model``` and ```analysisRequest``` are the two Javascript objects that will be sent to the back-end, when performing analysis (Simulate Single Path/Explore Possible Next States). 

### displayAnalysis.js
This file contains functions that help display Simulate Single Path analysis results, after Simulate Single Path analysis has been performed. The functions in this file will read the analysis results and present them to the user by displaying each intention evaluation in the corresponding intentions, dispaying a history log (for when the user performs more than one Single Path analysis) and by displaying an adjustable slider. 

After the back-end is done computing the Single Path analysis results, the back-end sends the front-end a Javascript object, which is the parameter for ```displayAnalysis()```. Then ```displayAnalysis()``` will call necessary functions within ```displayAnalysis.js``` in order to display the analysis results onto the website.

### errorDetection.js
This file contains functions that peform syntax checking, cycle detection and displays error messages with SweetAlert.

### keyboardFunctions.js
This file contains functions defining behaviour when using keyboard shortcuts such as Ctrl-C.

### loadSaveFunctions.js
This file contains functions required to save and load the model on the canvas.

When the user decides to download the current model in the canvas as a JSON file, the user would click the save button in the modelling view. The user is then prompted to enter a filename for the JSON file to be downloaded. The download for the JSON file will proceed to start. The JSON file that the user downloads contains three attributes, a ```graph```, ```model``` and ```analysisRequest```. The two attributes ```model``` and ```analysisRequest``` contain the ```model``` and ```analysisRequest``` global variables for the current state of the model. The ```graph``` attribute contains the return value of ```graph.toJSON()```. Click [here](https://resources.jointjs.com/docs/jointjs/v2.1/joint.html#dia.Graph.prototype.toJSON) to learn about the ```toJSON()``` function used.

The ```reader.onload()``` function is called when the user clicks the load button in the modelling view. This function is able to load JSON files that were downloaded from the current version of BloomingLeaf and JSON files that were generated before the BloomingLeaf refactoring has been done.

### onFunctions.js
This file contains functions that will be called as a result of an "on-event" (ex. on-click events, on-add events, on-change events etc.).

Every button in the top menu bar in the modelling view has a corresponding on-click function in this file. 

Three functions, ```createIntention()```, ```createActor()``` and ```createLink()``` are called when the user creates a new intention, actor or link onto the canvas respectively. These functions serve important duties, because these functions are responsible to update the global ```model``` variable so that the ```model``` variable contains information up-to-date infomation about the current intentions, actors and links on the canvas.

This is how ```createIntention()``` works in detail.
The functions ```createActor()``` and ```createLink()``` work very similiarly.
1. A user drags an intention from the stencil onto the canvas, thereby creating an intention in the current model. 
2. In order to update our global ```model``` variable, a new instance of an ```Intention``` object is created and added into the ```model.intentions``` array. This new instance represents the new intention that the user had just created. Whenever a new ```Intention``` object is created, a nodeID (ex.0000) is automatically assigned to that ```Intention``` object. It is guaranteed that there are no two ```Intention``` objects with the same nodeID. 
3. The nodeID that was assigned to the ```Intention``` object that was created, will also be stored in ```cell.attributes.nodeID```.
In the context of this function, ```cell``` refers to a Backbone model for the intention that the user just dragged onto the canvas. For example, if the user dragged three intentions onto the canvas, there will be three ```cell``` varaibles, one for each intention on the canvas. These ```cell``` variables can be accessed by calling ```graph.getElements()[i].findView(paper)```, where `i` an index for the desired intention in ```graph.getElements()```.
Within a ```cell``` variable, a developer is able to change the specific intention's colour, displayed text, and a lot more. Essentially, every ```cell``` variable that represents an intention, will contain a nodeID for the corresponding ```Intention``` object that was created and inserted into the global ```model``` variable.

But why do we need to store an intention's nodeID in the intention's ```cell``` variable? This is done in order to maintain a connection between the ```cell``` variable and the ```Intention``` object in ```model.intentions```. Therefore, if we have a ```cell``` variable for an intention, we can use the nodeID stored in ```cell.attributes.nodeID```, and find the corresponding ```Intention``` object in ```model.intentions```.

This is useful in ```ElementInspector.js```. When the user clicks an intention, the ```render()``` function in ```ElementInspector.js``` has access to the ```cell``` variable as a parameter. Using ```model.getIntentionByID()```, we can find the corresponding ```Intention``` object, and update the ```Intention``` object if the user changes the intention in the element inspector (by changing the initial satisfaction value, for example).

For this reason, ```cell``` variables that represent links, have linkIDs and ```cell``` variables that represent actors, have nodeIDs.


In the modelling view, when the green Analysis button is clicked, a function called ```reassignIntentionIDs()``` is eventually called. This may seem strange, but this function essentially ensures that intentions has nodeIDs from ```0``` to ```current num of intentions - 1```. Currently, this function is required for the back-end to work properly. 





