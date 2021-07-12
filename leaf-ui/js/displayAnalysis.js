/**
 * This file contains functions that help display the analysis
 * that the web application would receive from the back end.
 * It also contains functions for the analysis configuration sidebar
 */
// TODO: Update these functions to take in a ResultBBM instead of an AnalysisResult
{

let sliderObject = new SliderObj();

/**
 * Displays the analysis to the web app, by creating the slider display
 *
 * @param {ResultBBM} analysisResult
 *   AnalysisResult object returned from backend
 * @param {Boolean} isSwitch
 *   True if we are switching analysis results,
 *   false if new result from the back end
 */
function displayAnalysis(analysisResult, isSwitch){
    //analysisResult.setTimeScale();
    //analysisResult = "Single Path";

    // Save data for get possible next states
    savedAnalysisData.singlePathResult = analysisResult;

    // Check if slider has already been initialized
    if (sliderObject.sliderElement.hasOwnProperty('noUiSlider')) {
        sliderObject.sliderElement.noUiSlider.destroy();
    }
    createSlider(analysisResult, isSwitch);
}

/**
 * Creates a slider and displays it in the web app
 *
 * @param {ResultBBM} currentAnalysis
 *  an AnalysisResult object that contains data about the analysis that the back end performed
 * @param {number} currentValueLimit
 * @param {Boolean} isSwitch
 *   True if the slider is being created when we are switching analysis results,
 *   false if new result from the back end
 */
function createSlider(currentAnalysis, isSwitch) {

    var sliderMax = currentAnalysis.get('timePointPath').length - 1; // .timeScale;
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
 * @param {ResultBBM} currentAnalysis
 *  an ResultBBM object that contains data about the analysis that the back end performed
 */
function updateSliderValues(sliderValue, currentAnalysis){
    currentAnalysis.set('selectedTimePoint', sliderValue);

    $('#sliderValue').text(sliderValue);
    var tpPath = currentAnalysis.get('timePointPath');
    sliderObject.sliderValueElement.innerHTML = sliderValue + "|" + tpPath[sliderValue];
    // Update the analysisRequest current state.
    //analysisRequest.currentState = sliderObject.sliderValueElement.innerHTML;   //TODO: Perhalps this should be part of the call to simulate.
    
    currentAnalysis.get('elementList').forEach(element => 
        updateNodeValues(element, sliderValue));

    EVO.setCurTimePoint(sliderValue);
}

/**
 * @param {map} element
 *  Map between element id and result data. 
 *   Satisfaction value in string form. ie: '0011' for satisfied
 * @param {Number} sliderValue
 *   Current value of the slider
 */
function updateNodeValues(element, sliderValue) {
    var satValue = element.status[sliderValue];
    var cell = graph.getCell(element.id);
	if ((cell != null) && (satValue in satisfactionValuesDict)) {
        cell.attr(".satvalue/text", satisfactionValuesDict[satValue].satValue);
        cell.attr({text: {fill: 'white'}}); //satisfactionValuesDict[satValue].color        // TODO: Does this need updating?
    }
}

} // End of sliderObj scope