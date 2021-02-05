/**
 * This file contains functions that help display the analysis
 * that the web application would receive from the back end.
 * It also contains functions for the analysis configuration sidebar
 */

// Analysis Configuration map (key: configId, value: analysisConfig object)
var analysisMap = new Map();
// Global variable to keep track of what analysis configuration is currently being used
var currAnalysisConfig;
// Count for number of analysis configurations
var configCount = 0;

/**
 * Displays the analysis to the web app, by displaying the slider and the
 * history log
 *
 * @param {Object} analysisResults
 *   Object which contains data gotten from back end
 */
function displayAnalysis(analysisResults){

    // Change the format of the analysis result from the back end
    var currentAnalysis = new analysisObject.initFromBackEnd(analysisResults);
    currentAnalysis.type = "Single Path";

    // Save data for get possible next states
    savedAnalysisData.singlePathResult.assignedEpoch = analysisResults.assignedEpoch;
    savedAnalysisData.singlePathResult.finalValueTimePoints = analysisResults.finalValueTimePoints;
    savedAnalysisData.singlePathResult = analysisResults;
    console.log("savedAnalysisData");

    // Check if slider has already been initialized
    if (sliderObject.sliderElement.hasOwnProperty('noUiSlider')) {
        sliderObject.sliderElement.noUiSlider.destroy();
    }

    // This might be unnecessary
    // ElementList = analysisResults.elementList;

    // Update history log
    // updateHistory(currentAnalysis);

    createSlider(currentAnalysis, false);
}

/**
 * Creates a slider and displays it in the web app
 *
 * @param {Object} currentAnalysis
 *   Contains data about the analysis that the back end performed
 * @param {number} currentValueLimit
 * @param {Boolean} isSwitch
 *   True if the slider is being created when we are switching analysis's
 *   with the history log, false otherwise
 */
function createSlider(currentAnalysis, isSwitch) {

    var sliderMax = currentAnalysis.timeScale;
    analysisResult.maxTimePoint = sliderMax;
    var density = (sliderMax < 25) ? (100 / sliderMax) : 4;

    noUiSlider.create(sliderObject.sliderElement, {
        start: 0,
        step: 1,
        behaviour: 'tap',
        connect: 'lower',
        direction: 'ltr',
        range: {
            'min': 0,
            'max': sliderMax
        },
        pips: {
            mode: 'values',
            values: [],
            density: density
        }
    });

    // Set initial value of the slider
    sliderObject.sliderElement.noUiSlider.set(isSwitch ? 0 : sliderMax);
    sliderObject.sliderElement.noUiSlider.on('update', function( values, handle ) {
        updateSliderValues(parseInt(values[handle]), currentAnalysis);
    });
    EVO.setCurTimePoint(sliderMax);
    adjustSliderWidth(sliderMax);
}

/*
 * Creates and displays new slider after the user clicks a different
 * analysis from the history log. This function is called when
 * the user clicks a different analysis from the history log.
 *
 * @param {Object} currentAnalysis
 *   Contains data about the analysis that the back end performed
 * @param {Number} historyIndex
 *   A valid index for the array historyObject.allHistory, indicating
 *   which analysis/history log that the user clicked on
 */
function switchHistory(currentAnalysis) {

    sliderObject.sliderElement.noUiSlider.destroy();
    createSlider(currentAnalysis, true);
}


/**
 * Adjusts the width of the slider depending on the width of the paper
 *
 * @param {Number} maxValue
 *   The maximum value for the current slider
 */
function adjustSliderWidth(maxValue){
    // Min width of slider is 15% of paper's width
    var min = $('#paper').width() * 0.1;
    // Max width of slider is 90% of paper's width
    var max = $('#paper').width() * 0.6;
    // This is the width based on maxvalue
    var new_width = $('#paper').width() * maxValue / 100;
    // new_width is too small or too large, adjust
    if (new_width < min){
        new_width = min;
    }
    if (new_width > max){
        new_width = max;
    }
    $('#slider').width(new_width);
}

/**
 * Updates the slider values at the bottom left hand side of the paper,
 * to represent the current slider's position.
 *
 * @param {Number} sliderValue
 *   Current value of the slider
 * @param {Number} currentValueLimit
 * @param {Object} currentAnalysis
 *   Contains data about the analysis that the back end performed
 */
function updateSliderValues(sliderValue, currentAnalysis){

    analysisResult.selectedTimePoint = sliderValue;

    var value = sliderValue;
    $('#sliderValue').text(value);
    sliderObject.sliderValueElement.innerHTML = value + "|" + currentAnalysis.relativeTime[value];
    // Update the analysisRequest current state.
    analysisRequest.currentState = sliderObject.sliderValueElement.innerHTML;

	for (var i = 0; i < currentAnalysis.numOfElements; i++) {
		var element = currentAnalysis.elements[i];
		updateNodeValues(element.id, element.status[value]);
    }
    
    EVO.setCurTimePoint(value);
}


/**
 * Updates the satisfaction value of a particular node in the graph.
 * Used to display analysis results on the nodes.
 *
 * @param {String} nodeID
 *   nodeID of the node of interest
 * @param {String} satValue
 *   Satisfaction value in string form. ie: '0011' for satisfied
 */
function updateNodeValues(nodeID, satValue) {
	var elements = graph.getElements();
	var curr;
	var cell;
	for (var i = 0; i < elements.length; i++) {
		curr = elements[i].findView(paper).model;
		if (curr.attributes.nodeID == nodeID) {
			cell = curr;
			break;
		}
	}

	if ((cell != null) && (satValue in satisfactionValuesDict)) {
        cell.attr(".satvalue/text", satisfactionValuesDict[satValue].satValue);
        cell.attr({text: {fill: 'white'}});//satisfactionValuesDict[satValue].color
    }
}


/**
 * Display history log
 *
 */
$('#history').on("click", ".log-elements", function(e){
    var txt = $(e.target).text();
    var step = parseInt(txt.split(":")[0].split(" ")[1]);
    var log = historyObject.allHistory[step - 1];
    var currentAnalysis = log.analysis;

    switchHistory(currentAnalysis);

    $(".log-elements:nth-of-type(" + historyObject.currentStep.toString() +")").css("background-color", "");
    $(e.target).css("background-color", "#E8E8E8");

    historyObject.currentStep = step;
});


/**
 * Clears the history log on the web application, and clears
 * historyObject to its inital state
 */
function clearHistoryLog(){

    $('.log-elements').remove();

    if (sliderObject.sliderElement.noUiSlider) {
        sliderObject.sliderElement.noUiSlider.destroy();
    }

    sliderObject.pastAnalysisValues = [];

    historyObject.allHistory = [];
    historyObject.currentStep = null;
    historyObject.nextStep = 1;
}


/**
 * Updates history log in order to display the new analysis,
 * and updates the historyObject to store information about
 * the new analysis.
 *
 * @param {Object} currentAnalysis
 *   Contains data about the analysis that the back end performed
 * @param {Number} currentValueLimit
 */
function updateHistory(currentAnalysis){
    var logMessage = "Step " + historyObject.nextStep.toString() + ": " + currentAnalysis.type;
    logMessage = logMessage.replace("<", "&lt");

    if ($(".log-elements")) {
        $(".log-elements").last().css("background-color", "");
    }

    $("#history").append("<a class='log-elements' style='background-color:#E8E8E8''>" + logMessage + "</a>");

    historyObject.currentStep = historyObject.nextStep;
    historyObject.nextStep++;

    var log = new logObject(currentAnalysis, 0);
    historyObject.allHistory.push(log);
}

/**
 * Function to set up the initial analysis configuration upon page load
 */
function addFirstAnalysisConfig(){
    $(".log-elements").css("background-color", "");
    $(".result-elements").css("background-color", "");
    var id = "Configuration1"
    currAnalysisConfig = new AnalysisConfiguration(id, analysisRequest);
    analysisMap.set(id, currAnalysisConfig);
    // TODO: Find better way to preserve original default from model
    // Currently necessary for User Assignments List preservation
    defaultUAL = currAnalysisConfig.userAssignmentsList;
    console.log(analysisRequest.userAssignmentsList);
    var buttonLabel = currAnalysisConfig.id + "-button";
    var label = currAnalysisConfig.id + "-dropdown";
    $("#analysis-sidebar").append(
        '<button class="log-elements" id="'+currAnalysisConfig.id+'" style="padding: 12px; font-size: 16px; border: none; outline: none; background-color:#A9A9A9">' + currAnalysisConfig.id + '</button><div style="position:absolute; display:inline-block"><button class="dropdown" id= "'+buttonLabel+'" style="padding: 12px; font-size: 16px; height: 42px; border: none; outline: none;"><i class="fa fa-caret-down fa-2x" style="cursor:pointer;"></i></button>'
        + '</div><div class = "dropdown-container" id="'+label+'"></div>'
      );

    console.log(analysisMap)
}

/**
 * Function to load analysis configurations and results from JSON into the config sidebar
 * TODO: before running, wipe all other variables and analysis sidebars 
 * so that we can load a new thing after running others
 */
function loadAnalysis(){
    // Loop through each configuration
	for(let config of analysisMap.values()) {
        console.log(config);
        currAnalysisConfig = config;
        analysisRequest = currAnalysisConfig.getAnalysisRequest();
        // Add the config to the sidebar
        addAnalysisConfig();
        // Add the results (if any) to the sidebar
        updateResults();
        console.log("analysis request:")
        console.log(analysisRequest);
        // Refresh the sidebar to include the config vars
        refreshAnalysisBar();
    }
    // TODO: figure out how to set it to the element of the map that will populate on top
    currAnalysisConfig = analysisMap.get("Configuration1");
    // Set default UAL to preserve in future configs
    defaultUAL = currAnalysisConfig.userAssignmentsList;
    analysisRequest = currAnalysisConfig.analysisRequest;
    console.log("analysis request:")
    console.log(analysisRequest);
    refreshAnalysisBar();
}

/**
 * Adds a new analysis configuration to the Config sidebar
 */
function addNewAnalysisConfig(){
    // Update current config with current analysisRequest and set the udpated config in map
    currAnalysisConfig.updateAnalysis(analysisRequest);
    analysisMap.set(currAnalysisConfig.id, currAnalysisConfig);

    // Figure out number of new config, name and create it, and then add it to the map
    var id = "Configuration" + (analysisMap.size+1).toString()
    
    // default Analysis Request needed for now for user assignments list
    // TODO: Look into perserving base UAL throughout analysisRequests
    var newRequest = new AnalysisRequest();
    newRequest.userAssignmentsList = defaultUAL;

    var newConfig = new AnalysisConfiguration(id, newRequest);
    analysisMap.set(id, newConfig);

    // Update current config to be the new config, and update analysisRequest to match new config
    currAnalysisConfig = newConfig;
    analysisRequest = currAnalysisConfig.getAnalysisRequest();

    // Reset analysis sidebar to default
    refreshAnalysisBar();
    // Add the config to the sidebar
    addAnalysisConfig();
}

/**
 * Adds an analysis configuration to the UI (config sidebar)
 */
function addAnalysisConfig() {
    console.log("add a new config to the UI");
    $(".log-elements").css("background-color", "");
    $(".result-elements").css("background-color", "");
    var buttonLabel = currAnalysisConfig.id + "-button";
    var label = currAnalysisConfig.id + "-dropdown";
    $("#analysis-sidebar").append(
        '<button class="log-elements" id="'+currAnalysisConfig.id+'" style="padding: 12px; font-size: 16px; border: none; outline: none; background-color:#A9A9A9">' + currAnalysisConfig.id + '</button><div style="position:absolute; display:inline-block"><button class="dropdown" id= "'+buttonLabel+'" style="padding: 12px; font-size: 16px; height: 42px; border: none; outline: none;"><i class="fa fa-caret-down fa-2x" style="cursor:pointer;"></i></button>'
        + '</div><div class = "dropdown-container" id="'+label+'"></div>'
      );
}

/**
 * Adds result to UI menu
 */
function updateResults(){
    console.log("add results to the UI");
    $(".result-elements").css("background-color", "");
    var label = currAnalysisConfig.id + "-dropdown";
    // clear all results from dropdown (prevents duplication)
    document.getElementById(label).innerHTML = "";

    var resultCount = analysisMap.get(currAnalysisConfig.id).analysisResults.length;
    // Loop through all results and populate dropdown
    for (var i=0; i < resultCount; i++) {
        var id = "Result " + (i+1);
        document.getElementById(label).insertAdjacentHTML("beforeend","<a class='result-elements'>" + id + "</a>");
    }

    // highlight newest/last result
    $(document.getElementById(label).lastChild).css("background-color", "#A9A9A9");
    
}

function refreshAnalysisBar(){
    console.log("refresh the analysis sidebar");
    $('#conflict-level').val(analysisRequest.conflictLevel);
    $('#num-rel-time').val(analysisRequest.numRelTime);
}

/**
 * Switches between analysis configurations
 */
$('#analysis-sidebar').on("click", ".log-elements", function(e){
    //Save and/or update past analysis config in map
    currAnalysisConfig.updateAnalysis(analysisRequest)
    analysisMap.set(currAnalysisConfig.id, currAnalysisConfig);
    var txt = $(e.target).text();

    currAnalysisConfig = analysisMap.get(txt);
    analysisRequest = currAnalysisConfig.getAnalysisRequest();
    refreshAnalysisBar();
    console.log(analysisRequest.userAssignmentsList);

    $(".log-elements").css("background-color", "");
    $(".result-elements").css("background-color", "");
    $(e.target).css("background-color", "#A9A9A9");
});

/**
 * Ties dropdown bar to open or close on click action
 */
$('#analysis-sidebar').on("click", ".dropdown", function(e){
    var id = e.currentTarget.id.split("-")[0]+"-dropdown";
    var dropdown = document.getElementById(id);
    if (dropdown.style.display === "block") {
            dropdown.style.display = "none";
            } else {
            dropdown.style.display = "block";
            }
    
});

/**
 * Ties Results to update UI and show associated results on click action
 */
$('#analysis-sidebar').on("click", ".result-elements", function(e){
    $(".result-elements").css("background-color", "");
    $(".log-elements").css("background-color", "");

    // Grab Config and result information
    var configId = e.currentTarget.parentElement.id.split("-")[0];
    var resultIndex = $(e.target).text().split(" ")[1];
    var currAnalysisConfig = analysisMap.get(configId)
    var currAnalysisResults = currAnalysisConfig.analysisResults[resultIndex-1];
    analysisRequest = currAnalysisConfig.getAnalysisRequest();

    // Update UI accordingly
    $(e.target).css("background-color", "#A9A9A9");
    $("#"+configId).css("background-color","#A9A9A9")
    refreshAnalysisBar()
    displayAnalysis(currAnalysisResults)
});

/**
 * Adds a new AnalysisConfig
 */
$('.addConfig').on('click', function(){
    addNewAnalysisConfig();
});

