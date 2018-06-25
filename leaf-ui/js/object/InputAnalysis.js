class InputAnalysis {
	constructor(action) {
		this.action = action; //'singlePath' or 'allNextStates'
		this.maxAbsTime = null;
		this.conflictLevel = null;
		this.numRelTime = null;
		this.absTimePts = null;
		this.currentState = '0';
		this.initialAssignedEpoch = ['0'];
		this.initialValueTimePoints = ['0'];
		this.elementList = null;

		// set attributes
		getAnalysisValues(this);
	}
}

/**
 * Modify analysisInterface by setting its attributes
 *
 * @param {InputAnalysis} analysisInterface
 */
function getAnalysisValues(analysisInterface) {
	//Data required for 1. Simulate Single Path
	analysisInterface.maxAbsTime = $('#max-abs-time').val();
	analysisInterface.conflictLevel = $('#conflict-level').val();
	analysisInterface.numRelTime = $('#num-rel-time').val();
	if($('#abs-time-pts').val()){
		analysisInterface.absTimePts = $('#abs-time-pts').val();
	}
	analysisInterface.elementList = getElementsForAnalysis();

	//Data required for 2. Explore Possible Next States
	if(savedAnalysisData.finalAssignedEpoch){
		analysisInterface.initialAssignedEpoch = savedAnalysisData.finalAssignedEpoch;
	}

	if(savedAnalysisData.finalValueTimePoints){
		analysisInterface.initialValueTimePoints = savedAnalysisData.finalValueTimePoints;
	}

	if($('#sliderValue').text()){
		analysisInterface.currentState = $('#sliderValue').text();
	}
	analysisInterface.numRelTime = $('#num-rel-time').val();

	return analysisInterface;
}

/**
 * Returns an array of objects representing each element in the graph.
 * Each object contains an id and a status array containing the 
 * initial status of the element.
 *
 * Example:
 * [{id: "0000", status: ["0000"]},
 *  {id: "0001", status: ["0000"]}
 * ]
 *
 * @returns {Array.<Object>}
 */
function getElementList() {
    var elementList = [];
    var intentionsCount = 0;
    for(var i = 0; i < this.graph.getElements().length; i++) {
        // Remove Actors from list.
        if (!(this.graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
            var element= {};

            var currentValue = (this.graph.getElements()[i].attr(".satvalue/value")||"none");
            //Making currentValue to numeric values like 0000, 0001, 0011...
            if(!$.isNumeric(currentValue))
                currentValue = satValueDict[currentValue];

            //Making that the elementId has 4 digits
            var elementID = intentionsCount.toString();
            while (elementID.length < 4){
                elementID = "0" + elementID;
            }
            //Adding the new id to the UI graph element
            this.graph.getElements()[i].prop("elementid", elementID);

            element.id = elementID;
            element.status = [];
            element.status.push(currentValue);

            intentionsCount++;
            elementList.push(element);
        }
    }
    return elementList;
}

/**
 * Return an array of objects representing elements.
 * Each element contains an id and an array of status.
 * This array will be used for analysis in the backend.
 * If it is the first analysis, status will be an array from the initial value.
 * Otherwise, status will be an array from the beginning to the slider value.
 *
 * Example:
 * [{id: "0000", status: ["0010", "1100", "1110"]},
 *  {id: "0001", status: ["0011", "0110", "0111']}]
 *
 * @returns {Array.<Object>}
 */
function getElementsForAnalysis() {
	var elementList = [];
	var historyIndex = historyObject.currentStep - 1;
	if(!historyObject.allHistory.length) {
		elementList =  getElementList();
	} else {
		var time = $('#sliderValue').text().split('|')[0];
		var index = parseInt(time) + 1;
		historyObject.allHistory[historyIndex].analysis.elements.forEach(function(currentElement) {
				var element = {};
				element.id = currentElement.id;
				element.status = currentElement.status.slice(0, index);
				elementList.push(element);
			}
		);
	}

	return elementList;
}
