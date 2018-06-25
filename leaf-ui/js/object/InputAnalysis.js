class InputAnalysis {
	constructor(action) {
		this.action = action; //'singlePath' or 'allNextStates'
		this.maxAbsTime = $('#max-abs-time').val();
		this.conflictLevel = $('#conflict-level').val();
		this.absTimePts = $('#abs-time-pts').val();
		this.currentState = $('#sliderValue').text();
		this.initialAssignedEpoch = savedAnalysisData.finalAssignedEpoch ? savedAnalysisData.finalAssignedEpoch : ['0'];
		this.initialValueTimePoints = savedAnalysisData.finalValueTimePoints ? savedAnalysisData.finalValueTimePoints:
			['0'];
		this.elementList = getElementsForAnalysis();
        this.numRelTime = $('#num-rel-time').val();
	}
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
