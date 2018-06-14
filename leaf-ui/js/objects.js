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
	this.timeScale = Number(analysisResults.finalValueTimePoints.length) - 1;
	this.relativeTime = [];

	for(var i = 0; i < analysisResults.finalValueTimePoints.length; i++){
		var aux = analysisResults.finalValueTimePoints[i];
		this.relativeTime.push(aux);
	}

	for (var i = 0; i < this.numOfElements ; i++){
		//strips first element since it is already shown on graph
		var results = analysisResults.elementList[i];
		//results.pop(0);
		this.elements.push(results)
	}
	return this;
}


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
	this.chart;

	//for user defined constraints
	this.currentUserIndex = 0;
	this.userFunctions = [];
	this.userValues = [];
	this.beginLetter = ["0"];
	this.endLetter = ["A"];
	this.repeatBegin = null;
	this.repeatEnd = null;

	// used for normal functions
	this.chartData = {
		labels: ["0", "Infinity"],
		datasets: [{
			label: "Source",
			fill: false,
			borderColor: "rgba(220,220,220,1)",
			pointBackgroundColor: ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"],
			pointRadius: 4,
			pointBorderColor: ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"],
			lineTension: 0,
			data: [0, 0]

		},
		{
			label: "Source",
			fill: false,
			borderColor: "rgba(220,220,220,1)",
			pointBackgroundColor: ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"],
			pointRadius: 4,
			pointBorderColor: ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"],
			lineTension: 0,
			data: [0, 0]
		},
		{
			label: "Source",
			fill: false,
			borderColor: "rgba(220,220,220,1)",
			pointBackgroundColor: ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"],
			pointRadius: 4,
			pointBorderColor: ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"],
			lineTension: 0,
			data: []
		},
		{
			label: "Source",
			fill: false,
			borderColor: "rgba(220,220,220,1)",
			pointBackgroundColor: ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"],
			pointRadius: 4,
			pointBorderColor: ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"],
			lineTension: 0,
			data: []
		},
		{
			label: "Source",
			fill: false,
			borderColor: "rgba(220,220,220,1)",
			pointBackgroundColor: ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"],
			pointRadius: 4,
			pointBorderColor: ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"],
			lineTension: 0,
			data: []
		}
		]
	};
}


// Used for chart.js setup
var chartObject = function(){
	// the following three charts enables different colors for repeating values in user defined functions
	this.primaryChart = {
		labels: ["0", "A"],
		datasets: [{
			label: "Source",
			fill: false,
			borderColor: "rgba(220,220,220,1)",
			pointBackgroundColor: "rgba(220,220,220,1)",
			pointBorderColor: "#fff",
			lineTension: 0,
			data: []
		}]
	};

	this.secondaryChart = {
		labels: ["0", "A"],
		datasets: [{
			label: "Source",
			fill: false,
			borderColor: "rgba(220,220,220,1)",
			pointBackgroundColor: "rgba(220,220,220,1)",
			pointBorderColor: "#fff",
			lineTension: 0,
			data: []
		}]
	};

	this.teriaryChart = {
		labels: ["0", "A"],
		datasets: [{
			label: "Source",
			fill: false,
			borderColor: "rgba(220,220,220,1)",
			pointBackgroundColor: "rgba(220,220,220,1)",
			pointBorderColor: "#fff",
			lineTension: 0,
			data: []
		}]
	};

    // within constraint chart options
	this.chartOptions = {
		animationSteps: 15,
		scaleOverride : true,
		scaleSteps : 4,
		scaleStepWidth : 1,
		scaleStartValue : -2,
		scaleFontSize: 10,
		pointHitDetectionRadius : 5,
		tooltipTemplate: "",
		multiTooltipTemplate: "",
		// scaleLabel: "<%if (value == 2)%><%= '(FS, T)' %><%if (value == 1)%><%= '(PS, T)' %><%if (value == 0)%><%= '(T, T)' %><%if (value == -1)%><%= '(T, PD)' %><%if (value == -2)%><%= '(T, FD)' %>",

		scales: {
			yAxes: [{
				ticks: {
					min: -2.1,
					max: 2.1,
					callback: function(value, index, values){
						if (value == 2){return '(FS, T)'};
						if (value == 1){return '(PS, T)'};
						if (value == 0){return '(T, T)'};
						if (value == -1){return '(T, PD)'};
						if (value == -2){return '(T, FD)'};
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



		// The following two lings controls effects of hovering over an element on chart
		// tooltipTemplate: "<%if (value == 2)%><%= 'Satisfied' %><%if (value == 1)%><%= 'Partially Satisfied' %><%if (value == 0)%><%= 'Random' %><%if (value == -1)%><%= 'Partially Denied' %><%if (value == -2)%><%= 'Denied' %>",
		// multiTooltipTemplate: "<%if (value == 2)%><%= 'Satisfied' %><%if (value == 1)%><%= 'Partially Satisfied' %><%if (value == 0)%><%= 'Random' %><%if (value == -1)%><%= 'Partially Denied' %><%if (value == -2)%><%= 'Denied' %>",
	};


	// intension constraint chart options
	this.chartTwoIntensions = {
		animationSteps: 15,
		bezierCurve: false,
		scaleOverride : true,
		scaleSteps : 4,
		scaleStepWidth : 1,
		scaleStartValue : -2,
		scaleFontSize: 10,
		pointHitDetectionRadius : 5,
		tooltipTemplate: "<%if (value == 2)%><%= 'Satisfied' %><%if (value == 1)%><%= 'Partially Satisfied' %><%if (value == 0)%><%= 'Random' %><%if (value == -1)%><%= 'Partially Denied' %><%if (value == -2)%><%= 'Denied' %>",
		multiTooltipTemplate: "<%= datasetLabel %> - <%if (value == 2)%><%= 'Satisfied' %><%if (value == 1)%><%= 'Partially Satisfied' %><%if (value == 0)%><%= 'Random' %><%if (value == -1)%><%= 'Partially Denied' %><%if (value == -2)%><%= 'Denied' %>",
		scaleLabel: "<%if (value == 2)%><%= '(FS, T)' %><%if (value == 1)%><%= '(PS, T)' %><%if (value == 0)%><%= '(T, T)' %><%if (value == -1)%><%= '(T, PD)' %><%if (value == -2)%><%= '(T, FD)' %>",
	};
}