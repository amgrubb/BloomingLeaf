function AnalysisObject(){
	
	this.maxAbsTime;
	this.conflictLevel;
	this.numRelTime;
	this.absTimePts;
	this.currentState = 0;
	this.solveSinglePath;
	this.getNextState;
	this.initialAssignedEpoch;
	this.initialValueTimePoints;
	this.elementList;
}

function AO_getValues(analysisInterface){
	analysisInterface.maxAbsTime = $('#max-abs-time').val();
	analysisInterface.conflictLevel = $('#conflict-level').val();
	analysisInterface.numRelTime = $('#num-rel-time').val();
	analysisInterface.absTimePts = $('#abs-time-pts').val();
	return analysisInterface;
}

function AO_btnSolveSinglePath(analysisInterface){
	analysisInterface.solveSinglePath = true;
	analysisInterface.getNextState = false;
}

function AO_btnGetNextState(analysisInterface){

	analysisInterface.initialAssignedEpoch = $('#finalAssigneEpoch').val();
	analysisInterface.initialValueTimePoints = $('#finalValueTimePoints').val();
	analysisInterface.numRelTime = $('#num-rel-time').val();
	analysisInterface.absTimePts = $('#abs-time-pts').val();
	$("#absoluteTimePoints").val(analysisResults.absoluteTimePoints);
	
	analysisInterface.elementList = elementList;

	analysisInterface.getNextState = true;
	analysisInterface.solveSinglePath = false;
}
