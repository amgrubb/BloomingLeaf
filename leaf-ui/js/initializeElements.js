/**
 * This file contains code that will initialize and setup
 * the necessary Rappid, JointJS and noUiSlider elements.
 */
var graph;
var paper;
var stencil;
var mode;

var model = new Model();
var analysisRequest = new AnalysisRequest();
var analysisResult = new AnalysisResult();

var linkInspector = new LinkInspector();
var elementInspector = new ElementInspector();
var analysisInspector = new AnalysisInspector();
var actorInspector =  new ActorInspector();

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

// To delete
var satvalues = {
	"satisfied": 2, "partiallysatisfied": 1, "partiallydenied": -1, "denied": -2, "unknown": 4, "conflict":3, "none": 0,
	"2": "satisfied", "1": "partiallysatisfied", "-1": "partiallydenied", "-2": "denied", "4": "unknown", "3": "conflict", "0": "none"
};

// To delete
var satValueDict = {
	"satisfied": "0011",
	"partiallysatisfied": "0010",
	"partiallydenied": "0100",
	"denied": "1100",
	"none": "0000",
	"(no value)": "(no value)"
};

// maps value to display text
var linkValText = {
	'no': 'No Relationship',
    'and': 'and',
    'or': 'or',
    '++': '++',
    '--': '--',
    '+': '+',
    '-': '-',
    '+S': '+S',
    '++S': '++S',
    '-S': '-S',
    '--S': '--S',
    '+D': '+D',
    '++D': '++D',
    '-D': '-D',
    '--D': '--D',
    'NBT': 'NBN',
    'NBD': 'NBD'
};
// Satisfaction text values corresponding to the binary representation.
// This is used in updateNodeValues in displayAnalysis
var satisfactionValuesDict = {
	"0000": {
	    name: "none",
		satValue: "(⊥, ⊥)",
		color: "black",
		chartVal: 0
	},
	"0010": {
	    name: "partiallysatisfied",
		satValue: "(P, ⊥)",
		color: "black",
		chartVal: 1
	},
	"0011": {
	    name: "satisfied",
		satValue: "(F, ⊥)",
		color: "black",
		chartVal: 2
	},
	"0100": {
	    name: "partiallydenied",
		satValue: "(⊥, P)",
		color: "black",
		chartVal: -1
	},
	"0110": {
	    name: "conflict",
        satValue: "(P, P)",
        color: "red",
		chartVal: 3
    },
	"0111": {
        name: "conflict",
		satValue: "(F, P)",
		color: "red",
		chartVal: 3
	},
	"1100": {
	    name: "denied",
		satValue: "(⊥, F)",
		color: "black",
		chartVal: -2
	},
	"1110": {
        name: "conflict",
        satValue: "(P, F)",
        color: "red",
		chartVal: 3
    },
	"1111": {
        name: "conflict",
		satValue: "(F, F)",
		color: "red",
		chartVal: 3
	},
	"(no value)": {
		name: "(no value)",
		satValue: '(no value)',
		chartVal: 0
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

var commandManager = new joint.dia.CommandManager({ graph: graph });

// A simple element editor.
$('.inspector').append(elementInspector.el);
$('.inspector').append(actorInspector.el);

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

