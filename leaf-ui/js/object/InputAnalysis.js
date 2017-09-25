function InputAnalysis(){
	this.action = null;
	this.maxAbsTime = null;
	this.conflictLevel = null;
	this.numRelTime = null;
	this.absTimePts = null;
	this.currentState = "0";
	this.initialAssignedEpoch = ["0"];
	this.initialValueTimePoints = ["0"];
	this.elementList = null;
}

function getAnalysisValues(analysisInterface){
	//Data required for 1. Simulate Single Path
	analysisInterface.maxAbsTime = $('#max-abs-time').val();
	analysisInterface.conflictLevel = $('#conflict-level').val();
	analysisInterface.numRelTime = $('#num-rel-time').val();
	if($('#abs-time-pts').val()){
		analysisInterface.absTimePts = $('#abs-time-pts').val();
	}
	analysisInterface.elementList = getElementList();

	//Data required for 2. Explore Possible Next States
	if(savedAnalysisData.finalAssigneEpoch){
		analysisInterface.initialAssignedEpoch = savedAnalysisData.finalAssigneEpoch;
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

function getElementList(){
	var elementList = [];
	var intentionsCount = 0;
	var satValueDict = {
			"unknown": "0000",
			"satisfied": "0011",
			"partiallysatisfied": "0010",
			"partiallydenied": "0100",
			"denied": "1100",
			"none": "0000"
		};

	if(!global_analysisResult.elementList){
		for(var i = 0; i < this.graph.getElements().length; i++){
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
		return elementList;
	}else{
		var element = {};
		var index = $('#sliderValue').text().split('|');
		var i_splice = parseInt(index[0])+1;
		global_analysisResult.elementList.forEach(function(currentEl){
				element.id = currentEl.id;
				element.status = currentEl.status.splice(0, i_splice);
				elementList.push(element);
			}
		);
		return elementList;
	}
}
