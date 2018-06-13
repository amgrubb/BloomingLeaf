# Description of the files splitted from main.js:

## objects.js
This file contains all the objects that are used by the model

## initializeElements
This file contains code that initialize and set up the necessary rappid, jointjs and noUISlider elements.

## displayAnalysis.js
This file contains function that displays the analysis that the web application from the backed 
### Main functions in this file:
displayAnalysis\
createSlider\
switchHistory\
updateHistory\
updateNodeValues

## errorDetection.js
This file contains functions related to syntax checking, cycle detection and displaying error messages
### Main functions in this file:
cycleCheck\
syntaxCheck\
generateSyntaxMessage

## keyboardFunctions.js
This file contains functions that are associated with keyboard shortcuts.
### Main functions in this file:
ctrl-c <br >ctrl-v

## loadSaveFunctions.js
This file contains code associated with loading and saving a current model as a JSON file
### Main functions in this file:
download\
reader.onload functions

## onFunctions.js
This file contains all the on-click functions (and helper functions) that are associated HTML/Rappid elements.
