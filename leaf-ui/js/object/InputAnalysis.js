function AnalysisObject(){
	
	this.maxAbsTime;
	this.conflictLevel;
	this.numRelTime;
	this.absTimePts;
	this.currentState = 0;
	this.solveSinglePath;
	this.getNextState;
	this.initialAssignedEpoch = 0;
	this.initialValueTimePoints = 0;
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
	analysisInterface.elementList = $('#elementList').val();

	analysisInterface.getNextState = true;
	analysisInterface.solveSinglePath = false;
}
