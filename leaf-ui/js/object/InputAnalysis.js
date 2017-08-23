function InputAnalysis(){
	
	this.maxAbsTime;
	this.conflictLevel;
	this.numRelTime;
	this.absTimePts;
	this.currentState = "0";
	this.solveSinglePath;
	this.getNextState;
	this.initialAssignedEpoch = "0";
	this.initialValueTimePoints = "0";
	this.elementList;
}

function AO_getValues(analysisInterface){
	analysisInterface.maxAbsTime = $('#max-abs-time').val();
	analysisInterface.conflictLevel = $('#conflict-level').val();
	analysisInterface.numRelTime = $('#num-rel-time').val();
	if($('#abs-time-pts').val()){
		analysisInterface.absTimePts = $('#abs-time-pts').val();		
	}
	analysisInterface.elementList = getElementList();
	return analysisInterface;
}

function AO_btnSolveSinglePath(analysisInterface){
	analysisInterface.solveSinglePath = true;
	analysisInterface.getNextState = false;
}

function AO_btnGetNextState(analysisInterface){
	if($('#finalAssigneEpoch').val()){
		analysisInterface.initialAssignedEpoch = $('#finalAssigneEpoch').val();		
	}
	if($('#finalValueTimePoints').val()){
		analysisInterface.initialValueTimePoints = $('#finalValueTimePoints').val();		
	}
	if($('#sliderValue').text()){
		analysis.currentState = $('#sliderValue').text();		
	}
	analysisInterface.numRelTime = $('#num-rel-time').val();
	analysisInterface.getNextState = true;
	analysisInterface.solveSinglePath = false;
}

function getElementList(){
	var elementList = [];
	var intentionsCount = 0;
	for(var i = 0; i < this.graph.getElements().length; i++){
		var element= {};
		/**
		 * INITIAL VALUE
		 */
		var satValueDict = {
				"unknown": "0000",
				"satisfied": "0011",
				"partiallysatisfied": "0010",
				"partiallydenied": "0100",
				"denied": "1100",
				"none": "0000"
			}

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
	return elementList;
}
