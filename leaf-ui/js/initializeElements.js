/**
 * This file contains code that will initialize and setup
 * the necessary Rappid, JointJS and noUiSlider elements.
 */
var graph;
var paper;
var stencil;
var mode;

var linkInspector = new LinkInspector();
var elementInspector = new ElementInspector();
var analysisInspector = new AnalysisInspector();

var currentHalo;
var currentAnalysis;
var elementList;

// Analysis variables
var historyObject = new historyObject();
var sliderObject = new sliderObject();

var loader;
var reader;
var recursiveStack = {};
var constraintHolder = {};
// This object will be created to save necessary data for following analysis
var savedAnalysisData = {};

// Properties for both core and simulator.
// TODO: merge this two arrays in order to make use the same name for all
var satvalues = {
	"satisfied": 2, "partiallysatisfied": 1, "partiallydenied": -1, "denied": -2, "unknown": 4, "conflict":3, "none": 0,
	"2": "satisfied", "1": "partiallysatisfied", "-1": "partiallydenied", "-2": "denied", "4": "unknown", "3": "conflict", "0": "none"
};

var satValueDict = {
	"unknown": "0000",
	"satisfied": "0011",
	"partiallysatisfied": "0010",
	"partiallydenied": "0100",
	"denied": "1100",
	"none": "0000"
};
// Satisfaction text values corresponding to the binary representation.
// This is used in updateNodeValues in displayAnalysis
var satisfacationValuesDict = {
	"0000": {
		satValue: "(T, T)",
		color: "black"
	},
	"0010": {
		satValue: "(PS, T)",
		color: "black"
	},
	"0011": {
		satValue: "(FS, T)",
		color: "black"
	},
	"0100": {
		satValue: "(T, PD)",
		color: "black"
	},
	"0110": {
        satValue: "(PS, PD)",
        color: "red"
    },
	"0111": {
		satValue: "(FS, PD)",
		color: "red"
	},
	"1100": {
		satValue: "(T, FD)",
		color: "black"
	},
	"1110": {
        satValue: "(PS, FD)",
        color: "red"
    },
	"1111": {
		satValue: "(FS, FD)",
		color: "red"
	}
};

// Mode is used specify layout
mode = "Modelling";		// 'Analysis' or 'Modelling'
linkMode = "View";	// 'Relationships' or 'Constraints'

graph = new joint.dia.Graph();

graph.links = [];
graph.intensionConstraints = [];
graph.linksNum;
graph.constraintsNum;
graph.allElements = [];
graph.elementsBeforeAnalysis = [];
graph.constraintValues = [];//store all the graph constraint values to be used

var commandManager = new joint.dia.CommandManager({ graph: graph });

// Create a paper and wrap it in a PaperScroller.
paper = new joint.dia.Paper({
    width: 1000,
    height: 1000,
    gridSize: 10,
    perpendicularLinks: false,
    model: graph,
    defaultLink: new joint.dia.Link({
		'attrs': {
			'.connection': {stroke: '#000000'},
			'.marker-source': {'d': '0'},
			'.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
			},
		'labels': [{position: 0.5, attrs: {text: {text: "and"}}}]
	})
});

var paperScroller = new joint.ui.PaperScroller({
	autoResizePaper: true,
	paper: paper
});

$('#paper').append(paperScroller.render().el);
paperScroller.center();

// Disable context menu inside the paper.
//TODO: Not sure what this does.
paper.el.oncontextmenu = function(evt) { evt.preventDefault(); };


// Create and populate stencil.
stencil = new joint.ui.Stencil({
	graph: graph,
	paper: paper,
	width: 200,
	height: 600
});

// A simple element editor.
$('.inspector').append(elementInspector.el);

$('#stencil').append(stencil.render().el);

var goal = new joint.shapes.basic.Goal({ position: {x: 50, y: 20} });
var task = new joint.shapes.basic.Task({ position: {x: 50, y: 100} });
var sgoal = new joint.shapes.basic.Softgoal({ position: {x: 50, y: 170} });
var res = new joint.shapes.basic.Resource({ position: {x: 50, y: 250} });
var act = new joint.shapes.basic.Actor({ position: {x: 40, y: 400} });

stencil.load([goal, task, sgoal, res, act]);

// Setup LinkInspector
$('.inspector').append(linkInspector.el);

// Interface set up for modelling mode on startup
$('#dropdown-model').css("display","none");
$('#history').css("display","none");

// Initialize Slider setup
sliderObject.sliderElement = document.getElementById('slider');
sliderObject.sliderValueElement = document.getElementById('sliderValue');

$('#slider').width($('#paper').width() * 0.8);
$('#slider').css("margin-top", $(window).height() * 0.9);

// Adjust slider value position based on stencil width and paper width
var sliderValuePosition = 200 + $('#paper').width() * 0.1;
$('#sliderValue').css("top", '20px');
$('#sliderValue').css("left", sliderValuePosition.toString() + 'px');
$('#sliderValue').css("position", "relative");

$(window).resize(function() {
	$('#slider').css("margin-top", $(this).height() * 0.9);
	$('#slider').width($('#paper').width() * 0.8);
});

/**
 * If a cookie exists, process it as a previously created graph and load it.
 */
if (document.cookie){
	var cookies = document.cookie.split(";");
	var prevgraph = "";

	// Loop through the cookies to find the one representing the graph, if it exists
	for (var i = 0; i < cookies.length; i++){
		if (cookies[i].indexOf("graph=") !== -1){ // If substring exists
			prevgraph = cookies[i].substr(cookies[i].indexOf("graph=") + 6); // Get the substring after graph=
			break;
		}
	}

	if (prevgraph){
		try {
			graph.fromJSON(JSON.parse(prevgraph));
		} catch (e) {
			// This should never happen, but just in case
			alert('Previously stored cookies contains invalid JSON data. Please clear your cookies.');
		}
	}
}