/**
 * This file contains functions that help display the analysis
 * that the web application would receive from the back end.
 * It also contains functions for the analysis configuration sidebar
 */

// Analysis Configuration map (key: configId, value: analysisConfig object)
var analysisMap = new Map();
// Global variable to keep track of what analysis configuration is currently being used
var currAnalysisConfig;
//Global variable to keep track of the highest initial position
//This acts like a global iterator to keep track of what the ID and initialPosition attribute of new configurations should be
var highestPosition = 1;

/**
 * Displays the analysis to the web app, by creating the slider display
 *
 * @param {AnalysisResult} analysisResult
 *   AnalysisResult object returned from backend
 * @param {Boolean} isSwitch
 *   True if we are switching analysis results,
 *   false if new result from the back end
 */
function displayAnalysis(analysisResult, isSwitch){
    var currentAnalysis = analysisResult;
    currentAnalysis.setTimeScale();
    currentAnalysis.type = "Single Path";

    // Save data for get possible next states
    savedAnalysisData.singlePathResult = analysisResult;

    // Check if slider has already been initialized
    if (sliderObject.sliderElement.hasOwnProperty('noUiSlider')) {
        sliderObject.sliderElement.noUiSlider.destroy();
    }
    createSlider(currentAnalysis, isSwitch);
}

/**
 * Creates a slider and displays it in the web app
 *
 * @param {AnalysisResult} currentAnalysis
 *  an AnalysisResult object that contains data about the analysis that the back end performed
 * @param {number} currentValueLimit
 * @param {Boolean} isSwitch
 *   True if the slider is being created when we are switching analysis results,
 *   false if new result from the back end
 */
function createSlider(currentAnalysis, isSwitch) {

    var sliderMax = currentAnalysis.timeScale;
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
    // 0 if switching between existing results; sliderMax if new result
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
    refreshAnalysisUI();
    revertNodeValuesToInitial();
    // TODO: make sure EVO goes back to analysis mode properly when clicking on result
    EVO.switchToModelingMode();
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
 * @param {AnalysisResult} currentAnalysis
 *  an AnalysisResult object that contains data about the analysis that the back end performed
 */
function updateSliderValues(sliderValue, currentAnalysis){

    analysisResult.selectedTimePoint = sliderValue;

    var value = sliderValue;
    $('#sliderValue').text(value);
    sliderObject.sliderValueElement.innerHTML = value + "|" + currentAnalysis.timePointPath[value];
    // Update the analysisRequest current state.
    analysisRequest.currentState = sliderObject.sliderValueElement.innerHTML;
    currentAnalysis.elementList.forEach(element => 
        updateNodeValues(element.id, element.status[value]));
    
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
 * Function to add first analysis configuration 
 * if no configs exist when switching to analysis mode
 * If the analysisMap contains configurations loaded from JSON, populate the sidebar
 * 
 */
 function loadAnalysisConfig(){
    // if there are no configs in the map
    if(analysisMap.size == 0){
        // Add a new, empty config to the map
        addFirstAnalysisConfig();
    }
    refreshAnalysisUI();
}

/**
 * Function to set up the initial analysis configuration upon page load
 */
function addFirstAnalysisConfig(){
    // reset to default analysisRequest while preserving userAssignmentsList
    defaultAnalysisRequest();
    // reset background colors
    $(".config-elements").css("background-color", "");
    $(".result-elements").css("background-color", "");
    // reset highest position to 1
    highestPosition = 1;
    // add config 1
    var id = ("Configuration" + highestPosition);
    currAnalysisConfig = new AnalysisConfiguration(id, analysisRequest, highestPosition);
    analysisMap.set(id, currAnalysisConfig);
    // Add the empty first config to the UI
    addAnalysisConfig(currAnalysisConfig);
    refreshAnalysisUI();
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
        // Whenever first or loaded configs are added, update the highest position 
        // Check if configuration added has higher initialPosition than current highest position, prevents naming duplicates
        if(config.initialPosition > highestPosition) {
            highestPosition = config.initialPosition;
        }
    }
    firstConfigElement = document.getElementById('configurations').childNodes[0];
    currAnalysisConfig = analysisMap.get(firstConfigElement.id);
    // Set default UAL to preserve in future configs
    // It is necessary to push each UAL seperately 
    // to avoid the defaultUAL variable updating along with currAnalysisConfig
    currAnalysisConfig.userAssignmentsList.forEach(uAL => defaultUAL.push(uAL));
    analysisRequest = currAnalysisConfig.getAnalysisRequest();
    switchConfigs(firstConfigElement);
    // Refresh the sidebar to include the config vars
    refreshAnalysisUI();
}

/**
 * Adds a new analysis configuration to the analysisMap and sidebar
 */
function addNewAnalysisConfig(){
    // Update current config with current analysisRequest and set the udpated config in map
    // Necessary for switching to the newly added config without losing analysisRequest info
    currAnalysisConfig.updateAnalysis(analysisRequest);
    analysisMap.set(currAnalysisConfig.id, currAnalysisConfig);

    // Figure out initial position of new config, name and create it, and then add it to the map
    highestPosition += 1;
    var id = "Configuration" + (highestPosition).toString();
    
    // default Analysis Request needed for now for user assignments list
    // TODO: Look into perserving base UAL throughout analysisRequests
    var newRequest = new AnalysisRequest();
    // give the new request the defaultUAL
    defaultUAL.forEach(userEval => newRequest.userAssignmentsList.push(userEval));

    var newConfig = new AnalysisConfiguration(id, newRequest, highestPosition);
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
}

/**
 * Removes an analysis configuration from the analysisMap and UI sidebar
 * @param {HTML Element} configElement
 */
function removeConfiguration(configElement) {
    // Access previous and next element in HTML div, check if they exist
    // If not, populate with new default configuration, reset highestPosition to 1
    prevElement = $(configElement).prev();
    nextElement = $(configElement).next();
    if ((!$(prevElement).length) && (!$(nextElement).length)) {
        // Remove full configuration div (includes results)
        configElement.remove();
        // Remove config from analysisMap
        // We have to do this here in case we are deleting a config with the name Configuration1, in order to avoid removing the new configuration from the analysisMap
        analysisMap.delete(configElement.id);
        addFirstAnalysisConfig();
        return;
    }else if(currAnalysisConfig.id == configElement.id){
       // If prev and next do exist, and the currently selected configuration is the one we are deleting, set currAnalysisConfig to prev element if available or next element if not
       // If the curreAnalysisConfig is not the one we are deleting, keep it
        if ($(prevElement).length){ currAnalysisConfig = analysisMap.get(prevElement.attr("id"));
        }else if ($(nextElement).length){ currAnalysisConfig = analysisMap.get(nextElement.attr("id"));} 
    }
    // Highlight the currAnalysisConfig in the UI
    newConfigElement = document.getElementById(currAnalysisConfig.id);
    $(".config-elements").css("background-color", "");
    $(".result-elements").css("background-color", "");
    $(newConfigElement.querySelector('.config-elements')).css("background-color", "#A9A9A9");
    // Remove full configuration div (includes results)
    configElement.remove();
    // Remove config from analysisMap
    analysisMap.delete(configElement.id);
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

    // highlight newest/last result
    $(dropdownElement.lastChild).css("background-color", "#A9A9A9");
    
    refreshAnalysisUI();
}

/**
 * Clear all results from all configs
 */
 function clearResults(){
    for(let config of analysisMap.values()) {
        // remove analysis results from each config
        config.deleteResults();
    }
    // remove all results from all config divs
    $('.result-elements').remove();
    // reset graph to initial values
    revertNodeValuesToInitial();
}

/**
 * Refreshes analysisRequest values in the UI 
 * in places such as the right sidebar and absolute time points field
 */
function refreshAnalysisUI(){
    $('#abs-time-pts').val(analysisRequest.absTimePtsArr);
    $('#conflict-level').val(analysisRequest.conflictLevel);
    $('#num-rel-time').val(analysisRequest.numRelTime);

    // conflict-level and num-rel-time only interactive
    // until results generated from configuration
    console.log(currAnalysisConfig);
    if (currAnalysisConfig.analysisResults.length > 0){
        $("#conflict-level").prop('disabled', true);
        $('#num-rel-time').prop('disabled', true);
    } else {
        $("#conflict-level").prop('disabled', false);
        $('#num-rel-time').prop('disabled', false);
    }
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
    var input = $('<input>').attr("class", "config-input").attr("id", inputId).attr("style", "width:60%").val( element.text());
    element.replaceWith(input);
    input.focus();

    inputElement = document.getElementById(inputId)

    // Handler function to setConfigName on click
    handler = function(e){
        if (!$(e.target).is(input)){
            setConfigName(configContainerElement, configElement, inputElement);
            // Check if click was on another config or result to trigger a switch
            if ($(e.target).hasClass('config-elements')){
                switchConfigs(e.target.closest('.analysis-configuration') /** Config element */);
            } else if ($(e.target).hasClass('result-elements')){
                switchResults(e.target /** Result element */, e.target.closest('.analysis-configuration') /** Config element */)
            }
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
 * @param {HTMLElement} configContainerElement 
 * @param {HTMLElement} configElement 
 * @param {HTMLElement} inputElement 
 */
function setConfigName(configContainerElement, configElement, inputElement){
    // Remove event listener for clicks outside input box
    document.removeEventListener("click", handler);

    // Check for duplicate names
    if(analysisMap.has(inputElement.value) && inputElement.value != configContainerElement.id){
        alert("Sorry, this name is already in use. Please try another.");
        // Reset to original name
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
    displayAnalysis(currAnalysisResults, true);
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
            '<div id="config-buttons" style="position:absolute; display:inline-block">' +
            '<button class="dropdown-button">'+
                '<i id="drop-icon" class="fa fa-caret-up fa-2x" style="cursor:pointer;"></i>'+
            '</button>' +
            '<button class="deleteconfig-button">' +
                '<i id="garbage-icon" class="fa fa-trash-o" aria-hidden="true"></i>' +
            '</button>' +
            '</div>' +
            '<div class="dropdown-container"></div>' +
           '</div>';
}

/**
 * Reset global analysisRequest to default analysisRequest settings
 * while preserving userAssignmentsList
 */
function defaultAnalysisRequest(){
    // restore initial userAssignmentsList - holds initial evals for each intention
    analysisRequest.clearUserEvaluations();
    // copy initial userAssignmentsList into otherwise default analysisRequest
    var defaultRequest = new AnalysisRequest();
    defaultRequest.userAssignmentsList = analysisRequest.userAssignmentsList;
    analysisRequest = defaultRequest;
}
