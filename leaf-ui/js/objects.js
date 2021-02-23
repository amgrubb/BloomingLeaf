/**
 * This file contains declarations for various objects used in the frontend processes.
 */

// Used to manipulate slider during analysis
var sliderObject = function(){
	this.sliderElement;
	this.sliderValueElement;
	this.pastAnalysisValues = [];
}


// Used to control past analysis values through the history log
var historyObject = function(){
	this.allHistory = [];
	this.nextStep = 1;			//Used to denote last analysis appended
	this.currentStep = null;	//Used to signal current step shown with history log
}

// Individual logs on the history log
var logObject = function(analysis){
	this.analysis = analysis;
};

// Used to save analysis results
function analysisObject () {
    this.type;
    this.elements;
    this.numOfElements;
    this.timeScale;
    this.relativeTime;
}

// Parse results from backend
analysisObject.initFromBackEnd = function(analysisResults){
	this.elements = [];
	this.numOfElements = Number(analysisResults.elementList.length);
	this.timeScale = Number(analysisResults.timePointPath.length) - 1;
	this.relativeTime = [];

	for(var i = 0; i < analysisResults.timePointPath.length; i++){
		var aux = analysisResults.timePointPath[i];
		this.relativeTime.push(aux);
	}

	for (var i = 0; i < this.numOfElements ; i++){
		//strips first element since it is already shown on graph
		var results = analysisResults.elementList[i];
		//results.pop(0);
		this.elements.push(results)
	}
	return this;
};


analysisObject.nextStates = function(analysisResults){
	this.elements = [];
	this.numOfElements = Number(analysisResults.elementList.length);
	this.timeScale = Number(analysisResults.elementList[0].status.length) - 1;
	this.relativeTime = [];

	for(var i = 0; i < this.timeScale; i++){
		this.relativeTime.push(i);
	}

	for (var i = 0; i < this.numOfElements ; i++){
		//strips first element since it is already shown on graph
		var results = analysisResults.elementList[i].status;
		results.pop(0);
		this.elements.push(results)
	}
	return this;
}

//analysisObject.initFromBackEnd = function(analysisResults, analysisType){
//	this.type = analysisType;
//	this.elements = [];
//	this.numOfElements = Number(analysisResults[0]);
//	this.timeScale = Number(analysisResults[1]) - 1;
//
//	for (var i = 2; i < this.numOfElements + 2; i++){
//		//strips first element since it is already shown on graph
//		var results = analysisResults[i].split('\t');
//		results.pop(0)
//		this.elements.push(results)
//	}
//	return this;
//}

// Load results from a file
// This is done through loading analysis on the analysis inspector
analysisObject.initFromMain = function(elements, num, time){
    this.type = "Compiled";
    this.elements = elements;
    this.numOfElements = num;
    this.timeScale = time;

    return this;
}

// Within intension constraints template
// used to model element functions in element inspector
var constraintsObject = function(){
	

	//for user defined constraints
	this.currentUserIndex = 0;
	this.userFunctions = [];
	this.userValues = [];
	this.beginLetter = ["0"];
	this.endLetter = ["A"];
	this.repeatBegin = null;
	this.repeatEnd = null;
}


class ChartObj {

	constructor() {
		
		this.labels;
		this.dataSets = [];
		this.options = {
			// animation: false,
			scaleOverride : true,
			scaleSteps : 4,
			scaleStepWidth : 1,
			scaleStartValue : -2,
			scaleFontSize: 10,
			pointHitDetectionRadius : 5,
			tooltipTemplate: "",
			multiTooltipTemplate: "",
			scales: {
				yAxes: [{
					ticks: {
						min: -2.1,
						max: 2.1,
						callback: function(value, index, values) {
							if (value == 2){return '(F, ⊥)'};
							if (value == 1){return '(P, ⊥)'};
							if (value == 0){return '(⊥, ⊥)'};
							if (value == -1){return '(⊥, P)'};
							if (value == -2){return '(⊥, F)'};
						}
					}
				}]
			},
			legend: {
				display: false
			},

			tooltips: {
				enabled: false,
			}
		};
	}

	reset() {
		this.labels = null;
		this.dataSets = [];
	}

	addDataSet(xValue, yValues, dashed, coloured = false) {
		var data = Array(xValue).fill(null).concat(yValues);
		var dataSet = {
			label: "Source",
			fill: false, // no colouring underneath the line
			borderColor: coloured ? "rgba(255, 110, 80, 1)" : "rgba(220,220,220,1)",
			borderDash: dashed ? [5, 5] : null,
			pointBackgroundColor: coloured ? "rgba(255, 110, 80, 1)" : "rgba(220,220,220,1)",
			pointRadius: 4,
			pointBorderColor: "rgba(220,220,220,1)",
			lineTension: 0, // set to 0 for straight lines
			data: data
		};

		this.dataSets.push(dataSet);
	}

	display(context) {
		this.chartObj = new Chart(context, {
			type: 'line',
			data: {
				labels: this.labels,
				datasets: this.dataSets
			},
			options: this.options
		});
	}
}

class AnalysisConfiguration {
	/**
	 * This class is used to hold analysis configuration specifications and results 
	 * for view in the analysis configuration & results sidebar. 
	 * The object is initialized by passing in an AnalysisRequest object into the constructor.
	 * 
	 * @param {String} id
	 * @param {AnalysisRequest} analysisRequest
     * @param {String} action
     * @param {String} conflictLevel
     * @param {String} numRelTime
     * @param {String} absTimePts
     * @param {String} currentState
     * @param {Array.<UserEvaluation>} userAssignmentsList
     * @param {Array.<AnalysisResult>} analysisResults
	 */

	constructor(id, analysisRequest) {
		this.id = id;
		this.analysisRequest = analysisRequest;
		this.action = analysisRequest.action;
        this.conflictLevel = analysisRequest.conflictLevel;
        this.numRelTime = analysisRequest.numRelTime;
        this.absTimePts = analysisRequest.absTimePts;
        this.absTimePtsArr = analysisRequest.absTimePts;
        this.currentState = analysisRequest.currentState;
        this.userAssignmentsList = analysisRequest.userAssignmentsList;
        this.analysisResults = [];
	}

	/**
	 * Add a new AnalysisResult to the analysisResults array.
	 * @param {AnalysisResult} analysisResult 
	 */
	addResult(analysisResult) {
		this.analysisResults.push(analysisResult);
	}

	/**
	 * Set the AnalysisResults param
	 * @param {Array.<AnalysisResult>} analysisResults 
	 */
	setResults(analysisResults) {
		this.analysisResults = analysisResults;
	}

	/**
	 * Updates Config Values from AnalysisRequest
	 */
	updateAnalysis(analysisRequest){
		this.analysisRequest = analysisRequest;
		this.action = analysisRequest.action;
        this.conflictLevel = analysisRequest.conflictLevel;
        this.numRelTime = analysisRequest.numRelTime;
        this.absTimePts = analysisRequest.absTimePts;
        this.absTimePtsArr = analysisRequest.absTimePts;
        this.currentState = analysisRequest.currentState;
		this.userAssignmentsList = analysisRequest.userAssignmentsList;
	}

	updateId(id){
		this.id = id;
	}

	/**
	 * Returns AnalysisRequest object associated with this Config
	 * This is currently used to streamline getting request from currentAnalysisConfig
	 * TODO: Consider/switch to a more efficient way to return 
	 * since this is duplicate data being held in the Config 
	 */
	getAnalysisRequest(){
		return this.analysisRequest;
	}

	/**
	 * Returns a JSON representation of the AnalysisConfig object
	 */
	stringify(){
		return JSON.stringify(this);
	}
}