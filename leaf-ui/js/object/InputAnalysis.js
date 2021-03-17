/**
 * This class contains time-related information for the analysis
 */
class InputAnalysis {
	constructor(action) {
		this.action = action; //'singlePath' or 'allNextStates'
		this.maxAbsTime = $('#max-abs-time').val();
		this.conflictLevel = $('#conflict-level').val();
		this.numRelTime = $('#num-rel-time').val();
		this.absTimePts = $('#abs-time-pts').val() ? $('#abs-time-pts').val() : null;
		this.currentState = $('#sliderValue').text() ? $('#sliderValue').text() : '0';
		this.initialAssignedEpoch = savedAnalysisData.finalAssignedEpoch ? savedAnalysisData.finalAssignedEpoch : ['0'];
		this.initialValueTimePoints = savedAnalysisData.finalValueTimePoints ? savedAnalysisData.finalValueTimePoints:
			['0'];
	}
}