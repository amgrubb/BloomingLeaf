/**
 * This file contains functions that help display the analysis
 * that the web application would receive from the back end.
 * It also contains functions for the analysis configuration sidebar
 */

// Analysis Configuration map (key: configId, value: analysisConfig object)
var analysisMap = new Map();
// Global variable to keep track of what analysis configuration is currently being used
var currAnalysisConfig;

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
    // TODO double check this still works
    savedAnalysisData.singlePathResult = analysisResults;

    // Check if slider has already been initialized
    if (sliderObject.sliderElement.hasOwnProperty('noUiSlider')) {
        sliderObject.sliderElement.noUiSlider.destroy();
    }
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

/**
 * Reset display to default, before result is displayed
 */
function hideAnalysis() {
    removeSlider();
    refreshAnalysisUI();
    revertNodeValuesToInitial();
    // TODO: make sure EVO goes back to analysis mode properly when clicking on result
    EVO.switchToModelingMode();
    //analysisResult.colorVis = [];
    // show modeling mode EVO slider
    $('#modelingSlider').css("display", "");
    $('#analysisSlider').css("display", "none");
}

/**
 * Removes the slider from the UI
 */
function removeSlider() {
    // if there's a slider, remove it
    if (sliderObject.sliderElement.hasOwnProperty('noUiSlider')) {
        sliderObject.sliderElement.noUiSlider.destroy();
    }
    $('#sliderValue').text("");
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
    $(".config-elements").css("background-color", "");
    $(".result-elements").css("background-color", "");
    var id = "Configuration1"
    currAnalysisConfig = new AnalysisConfiguration(id, analysisRequest);
    analysisMap.set(id, currAnalysisConfig);
    // Currently necessary for User Assignments List preservation
    defaultUAL = currAnalysisConfig.userAssignmentsList;
    // Add the empty first config to the UI
    addAnalysisConfig(currAnalysisConfig);
}

/**
 * Function to load analysis configurations and results from JSON into the config sidebar
 * TODO: before running, wipe all other variables and analysis sidebars 
 * so that we can load a new thing after running others
 */
function loadAnalysis(){
    // Loop through each configuration
	for(let config of analysisMap.values()) {
        // Add the config to the sidebar
        addAnalysisConfig(config);
        // Add the results (if any) to the sidebar
        loadResults(config);
    }
    firstConfigElement = document.getElementById('configurations').childNodes[0];
    currAnalysisConfig = analysisMap.get(firstConfigElement.id);
    // Set default UAL to preserve in future configs
    defaultUAL = currAnalysisConfig.userAssignmentsList;
    analysisRequest = currAnalysisConfig.analysisRequest;
    
    switchConfigs(firstConfigElement);
    // Refresh the sidebar to include the config vars
    refreshAnalysisUI();
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
    defaultUAL.forEach(userEval => newRequest.userAssignmentsList.push(userEval));

    var newConfig = new AnalysisConfiguration(id, newRequest);
    analysisMap.set(id, newConfig);

    // Update current config to be the new config, and update analysisRequest to match new config
    currAnalysisConfig = newConfig;
    analysisRequest = currAnalysisConfig.getAnalysisRequest();

    // Reset analysis view to default
    hideAnalysis();
    // Add the config to the sidebar
    addAnalysisConfig(currAnalysisConfig);
}

/**
 * Adds an analysis configuration to the UI (config sidebar)
 */
function addAnalysisConfig(config) {
    $(".config-elements").css("background-color", "");
    $(".result-elements").css("background-color", "");

    // Add config to config container
    $("#configurations").append(getConfigHtml(config.id));

    // Get main config element and add event listeners for all interactive components
    mainElement = document.getElementById(config.id);
    mainElement.querySelector('.config-elements').addEventListener('dblclick', function(){rename(this /** Config element */)});
    mainElement.querySelector('.config-elements').addEventListener('click', function(){switchConfigs(this.parentElement /** Config element */)});
    mainElement.querySelector('.dropdown-button').addEventListener('click', function(){toggleDropdown(this.parentElement.parentElement /** Config element */)})
}

/**
 * Removes an analysis configuration from the analysisMap and UI sidebar
 * TODO implement with a button
 */
function removeConfiguration() {
    // Remove full configuration div (includes results)
    var configDiv = document.getElementById(currAnalysisConfig.id);
    configDiv.remove();
    // Remove config from analysisMap
    analysisMap.delete(currAnalysisConfig.id);
}

/**
 * Clears the analysis config sidebar
 */
function clearAnalysisConfigSidebar() {
    // Remove all child elements of the configurations div
    $('#configurations').empty();
}

/**
 * Loads in results to the UI menu when file is being loaded into BloomingLeaf
 */
function loadResults(config){
    $(".result-elements").css("background-color", "");
    var id = config.id;

    var dropdownElement = document.getElementById(id).querySelector('.dropdown-container');
    // clear all results from dropdown (prevents duplication)
    dropdownElement.innerHTML = "";
    var resultCount = analysisMap.get(id).analysisResults.length;

    // Loop through and add all results
    for (var i=0; i < resultCount; i++) {
        dropdownElement.insertAdjacentHTML("beforeend","<a class='result-elements' id='"+i+"'>" + "Result " + (i+1) + "</a>");
    }
    const results = dropdownElement.querySelectorAll('.result-elements');
    results.forEach(function(result){

        result.addEventListener('click', function(){switchResults(result /** Result element */, result.parentElement.parentElement /** Config element */)});
    });

    // Highlight last result
    $(dropdownElement.lastChild).css("background-color", "#A9A9A9");

}
/**
 * Adds result to UI menu
 */
function updateResults(){
    $(".result-elements").css("background-color", "");
    var id = currAnalysisConfig.id;

    // Get dropdown element and current result count from current config
    var dropdownElement = document.getElementById(id).querySelector('.dropdown-container');
    var resultCount = analysisMap.get(currAnalysisConfig.id).analysisResults.length;
    
    // Add new result element to end of result list, and attatch event listener on click
    dropdownElement.insertAdjacentHTML("beforeend","<a class='result-elements' id='"+(resultCount-1)+"'>" + "Result " + (resultCount) + "</a>");
    dropdownElement.lastChild.addEventListener('click', function(){switchResults(this /** Result element */, this.parentElement.parentElement /** Config element */)});

    // highlight newest/last result
    $(dropdownElement.lastChild).css("background-color", "#A9A9A9");
    
}

/**
 * Refreshes analysisRequest values in the UI 
 * in places such as the right sidebar and absolute time points field
 */
function refreshAnalysisUI(){
    $('#abs-time-pts').val(analysisRequest.absTimePtsArr);
    $('#conflict-level').val(analysisRequest.conflictLevel);
    $('#num-rel-time').val(analysisRequest.numRelTime);
}

/**
 * Replaces config button with input box for users to update name
 * 
 * @param {HTMLElement} configElement 
 */
function rename(configElement){
    // Get past ID
    var configContainerElement = configElement.parentElement;
    var inputId = configContainerElement.id + "-input";
    // Grab JQuery config button element, and replace with new input element
    var element = $(configElement);
    var input = $('<input>').attr("class", "configInput").attr("id", inputId).val( element.text());
    element.replaceWith(input);
    input.focus();

    inputElement = document.getElementById(inputId)

    // Handler function to setConfigName on click
    handler = function(e){
        if (!$(e.target).is(input)){
            setConfigName(configContainerElement, configElement, inputElement);
        }
    };

    // Event listener for clicks outside input box
    document.addEventListener("click", handler);

    // Set event listener for enter key to set config name when user presses enter
    document.getElementById(inputId).addEventListener("keyup", function(e){
        if (e.key == "Enter"){
            setConfigName(configContainerElement, configElement, this);
        }
    }) 
}

/**
 * Updates configuration name in UI and analysisMap, 
 * and replaces input element with config button
 * 
 * Also checks to make sure name does not currently exist in system
 * 
 * TODO: Add popup when name currently exists in system
 * 
 * @param {HTMLElement} configContainerElement 
 * @param {HTMLElement} configElement 
 * @param {HTMLElement} inputElement 
 */
function setConfigName(configContainerElement, configElement, inputElement){
    // Remove event listener for clicks outside input box
    document.removeEventListener("click", handler);

    // Check for duplicate names
    if(analysisMap.has(inputElement.value) && inputElement.value != configContainerElement.id){
        console.log("Name taken error - add popup for this");
        // Currently this just resets to original name to stop UI from getting messy
        // TODO: Remove after adding popup
        inputElement.replaceWith(configElement);
        return;
    }

    // Get config from analysisMap, and delete previously associated entry
    config = analysisMap.get(configContainerElement.id);
    analysisMap.delete(configContainerElement.id);

    // Update config id, and add with new id as key to analysisMap
    config.updateId(inputElement.value);
    analysisMap.set(inputElement.value, config);

    // Replace input field with config button
    configContainerElement.id = inputElement.value;
    configElement.innerHTML = inputElement.value;
    inputElement.replaceWith(configElement);
}

/**
 * Switches to selected config and associated analysisRequest 
 * and updates UI accordly
 * 
 * @param {JQueryElement} configElement 
 */
function switchConfigs(configElement){
    // Update analysisMap with current config to perserve any changes
    currAnalysisConfig.updateAnalysis(analysisRequest);
    analysisMap.set(currAnalysisConfig.id, currAnalysisConfig);

    // Set current config and analysis to associated clicked element
    // and reset UI to reflect switch
    currAnalysisConfig = analysisMap.get(configElement.id);
    analysisRequest = currAnalysisConfig.getAnalysisRequest();
    
    // restore default analysis view
    hideAnalysis();
    
    $(".config-elements").css("background-color", "");
    $(".result-elements").css("background-color", "");
    $(configElement.querySelector('.config-elements')).css("background-color", "#A9A9A9");
}

/**
 * Ties Results to update UI and show associated results on click action
 */
function switchResults(resultElement, configElement){
    var currAnalysisId = configElement.id;
    currAnalysisConfig = analysisMap.get(currAnalysisId);
    var currAnalysisResults = currAnalysisConfig.analysisResults[resultElement.id];
    analysisRequest = currAnalysisConfig.getAnalysisRequest();

    // Update UI accordingly
    $(".result-elements").css("background-color", "");
    $(".config-elements").css("background-color", "");
    $(resultElement).css("background-color", "#A9A9A9");
    $(configElement.querySelector(".config-elements")).css("background-color","#A9A9A9");
    refreshAnalysisUI();
    displayAnalysis(currAnalysisResults);
    // show EVO analysis slider
    $('#modelingSlider').css("display", "none");
    $('#analysisSlider').css("display", "");

    // TODO: show current EVO
    // perhaps it would be more useful to refresh EVO every time displayAnalysis() is called?
    // since it switches to modeling mode every time hideAnalysis() is called
    EVO.refresh();
    // currAnalysisResults.colorVis.colorIntentionsAnalysis();
    //document.getElementById("colorReset").value = EVO.sliderOption;
    //document.getElementById("colorResetAnalysis").value = EVO.sliderOption;
}

/**
 * Ties dropdown bar to open or close on click action
 * Also updates dropdown icon to reflect if dropdown is open or closed
 * 
 * TODO: Currently could be a bit confusing when new config is added with dropdown in block display 
 * but no results yet - maybe add "no simulations run" message in place of first result for that case? 
 */
function toggleDropdown(dropdownElement){
    // Grab container and icon from dropdown Element
    dropdownContainer = dropdownElement.querySelector('.dropdown-container');
    dropdownIcon = dropdownElement.querySelector('.dropdown-button').firstChild;
    
    // Switch container display and icon orientation
    if (dropdownContainer.style.display !== "none") {
        dropdownContainer.style.display = "none";
        dropdownIcon.className = "fa fa-caret-down fa-2x";
    } else {
        dropdownContainer.style.display = "block";
        dropdownIcon.className = "fa fa-caret-up fa-2x";
        }
    
}

/**
 * Creates HTML string to be appended when adding configurations
 */
function getConfigHtml(id){
    return'<div class = "analysis-configuration" id="' + id + '">' +
            '<button class="config-elements" style="background-color:#A9A9A9;">' 
            + id + '</button>' +
            '<div style="position:absolute; display:inline-block">'+
            '<button class="dropdown-button">'+
                '<i id="drop-icon" class="fa fa-caret-up fa-2x" style="cursor:pointer;"></i>'+
            '</button>' +
            '</div>'+
            '<div class="dropdown-container"></div>' +
           '</div>';
}

/**
 * Adds a new AnalysisConfig
 */
$('.addConfig').on('click', function(){
    addNewAnalysisConfig();
});
