function AnalysisObject(){
	
	this.maxAbsTime;
	this.conflictLevel;
	this.numRelTime;
	this.absTimePts;
	this.absVal;
	this.solveSinglePath;
	this.getNextState;

}

function AO_getValues(analysisInterface){
	analysisInterface.maxAbsTime = $("#max-abs-time").val();
	analysisInterface.conflictLevel = $("#conflict-level").val();
	analysisInterface.numRelTime = $("#num-rel-time").val();
	analysisInterface.absTimePts = $("#abs-time-pts").val();
	analysisInterface.absVal = $("#abs-vals").val();
	//TODO: need to get the assigned-values
}

function AO_btnSolveSinglePath(analysisInterface){
	analysisInterface.solveSinglePath = true;
	analysisInterface.getNextState = false;
}

function AO_btnGetNextState(analysisInterface){
	analysisInterface.getNextState = true;
	analysisInterface.solveSinglePath = false;
}
