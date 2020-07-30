/**
 * This file contains functions that help display the analysis
 * that the web application would receive from the back end.
 */

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
    updateHistory(currentAnalysis);

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
        cell.attr({text: {fill: satisfactionValuesDict[satValue].color}});
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

    if (historyObject.allHistory.length == 0) {
        var log = new logObject(currentAnalysis, 0);
    } else {
        var l = historyObject.allHistory.length - 1;
        // historyObject.allHistory[l].sliderEnd = currentValueLimit;
        // historyObject.allHistory[l].analysisLength = currentValueLimit - historyObject.allHistory[l].sliderBegin;
        var log = new logObject(currentAnalysis, 0);
    }

    historyObject.allHistory.push(log);
}