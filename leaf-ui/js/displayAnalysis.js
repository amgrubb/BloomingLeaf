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
    revertNodeValuesToInitial();
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
 * Reset global analysisRequest to default analysisRequest settings
 * while preserving userAssignmentsList
 */
function resetToDefault(){
    // restore initial userAssignmentsList - holds initial evals for each intention
    analysisRequest.clearUserEvaluations();
    // copy initial userAssignmentsList into otherwise default analysisRequest
    var defaultRequest = new AnalysisRequest();
    defaultRequest.userAssignmentsList = analysisRequest.userAssignmentsList;
    analysisRequest = defaultRequest;
}