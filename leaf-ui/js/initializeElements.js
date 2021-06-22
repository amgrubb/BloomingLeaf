/**
 * This file contains code that will initialize and setup
 * the necessary Rappid, JointJS and noUiSlider elements.
 */

//Flag to turn on console log notification
var develop = false;
var session_id = Date.now();

function guid() {
    // local function to create alphanumeric strings
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    // return lots of alphanumeric strings as new GUID
    return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}


function checkForPromptType(promptType) {
    var pt = this._promptTypes.get(promptType);
    if(pt) {
        return true;
    }
    return false;
}

function addPromptType(promptType) {
    var pt = this._promptTypes.get(promptType);
    // only add the activity if not already there
    if(!pt) {
        this._promptTypes.add({
            id: promptType,
            // add name to the list for easier debugging
            name: CreativeLeaf.Helper.getKeyByValue(CreativeLeaf.PromptType, parseInt(promptType))
        });
    }
}

function showAlert(title, msg, width, promptMsgType, type, arrow) {
    var dialog;
    // store prompt type to avoid showing same message twice
    //if(!this.checkForPromptType(promptMsgType)) {
    //this.addPromptType(promptMsgType);
    var divId = guid();
    var alertType = 'alert';
    if(type) {
        alertType = type;
    }
    dialog = new joint.ui.Dialog(
        {
            type: alertType,
            width: width,
            title: title,
            content: '<div class="creativity-dialog-wrapper" id="' + divId + '" data-prompttype="' + promptMsgType + '">' + msg + '</div>',
            modal: false
        });

    dialog.open();

    /*if(arrow) {
        // track the arrow's source and target in the div
        $('#' + divId).attr('data-arrow-source', divId);
        $('#' + divId).attr('data-arrow-target', $(arrow.target).attr('id'));
        CreativeLeaf.PromptManager.drawArrow(divId, $('#' + divId), arrow.target);
    }*/
    //}
    return dialog;
}

var graph;
var paper;
var stencil;
var mode;
var showEditingWarning = true;

var model = new Model();
var analysisRequest = new AnalysisRequest();        //TODO: make not global!
var analysisResult = new AnalysisResult();


var elementInspector = new ElementInspector();
var configCollection = new ConfigCollection([]);
var configInspector = new ConfigInspector({collection:configCollection});

var currentHalo;
var currentAnalysis;
var elementList;
var defaultUAL = [];

// Analysis variables
var sliderObject = new SliderObj();
var previousModel;

var loader;
var reader;
var recursiveStack = {};
var constraintHolder = {};
// This object will be created to save necessary data for following analysis
var savedAnalysisData = {};

// Properties for both core and simulator.

var satvalues = {
	"satisfied": 2, "partiallysatisfied": 1, "partiallydenied": -1, "denied": -2, "unknown": 4, "conflict":3, "none": 0,
	"2": "satisfied", "1": "partiallysatisfied", "-1": "partiallydenied", "-2": "denied", "4": "unknown", "3": "conflict", "0": "none"
};

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
	'NO': 'No Relationship',
    'AND': 'and',
    'OR': 'or',
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
        color: "black",
		chartVal: 3
    },
	"0111": {
        name: "conflict",
		satValue: "(F, P)",
		color: "black",
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
        color: "black",
		chartVal: 3
    },
	"1111": {
        name: "conflict",
		satValue: "(F, F)",
		color: "black",
		chartVal: 3
	},
	"(no value)": {
		name: "(no value)",
        satValue: '(no value)',
        color:"black",
		chartVal: 0
	}
};

// Required to convert old JSON models into 
// new JSON models.
// loadSaveFunctions.js needs this
var oldSatValToBinary = {
    '(FS, T)': '0011',
    '(PS, T)': '0010',
    '(T, FD)': '1100',
    '(T, PD)': '0100',
    'FD': '1100',
    'FS': '0011',
    '(P,F)': '1110',
    '(F,P)': '0111',
    '(F,F)': '1111',
    '(P,P)': '0110',
    'PS': '0010',
    'PD': '0100'
}

// Mode is used specify layout
mode = "Modelling";		// 'Analysis' or 'Modelling'
linkMode = "View";	// 'Relationships' or 'Constraints'

graph = new joint.dia.BloomingGraph();

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
    defaultLink: new joint.dia.cellLink({
		'attrs': {
			'.connection': {stroke: '#000000'},
			'.marker-source': {'d': '0'},
			'.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
			},
		'labels': [{position: 0.5, attrs: {text: {text: "and"}}}]
	}),
	highlighting: {
        default: {
        	name: 'stroke',
	        options: {
	            padding: 10,
	            rx: 5,
	            ry: 5,
	            attrs: {
	                'stroke-width': 3,
	                stroke: 'red'
	            }
	        }
        }
    }
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
	label: 'hello',
	width: 200,
	height: 600
});

var commandManager = new joint.dia.CommandManager({ graph: graph });

// A simple element editor.
$('.inspector').append(elementInspector.el);

$('#stencil').append(stencil.render().el);

var goal = new joint.shapes.basic.Goal({ position: {x: 50, y: 20} });
var task = new joint.shapes.basic.Task({ position: {x: 50, y: 100} });
var sgoal = new joint.shapes.basic.Softgoal({ position: {x: 50, y: 170} });
var res = new joint.shapes.basic.Resource({ position: {x: 50, y: 250} });
var act = new joint.shapes.basic.Actor({ position: {x: 40, y: 355} });

stencil.load([goal, task, sgoal, res, act]);

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

