/**
 * This file contains code that will initialize and setup
 * the necessary Rappid, JointJS and noUiSlider elements.
 */

function guid() {
    // local function to create alphanumeric strings
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    // return lots of alphanumeric strings as new GUID
    return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}

function showAlert(title, msg, width, promptMsgType, type) {
    var dialog;
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
    return dialog;
}

var graph;
var paper;
var stencil;
var mode;
var showEditingWarning = true;

var analysisResult = new AnalysisResult();

// Analysis variables
var sliderObject = new SliderObj();
var previousModel;

var loader;
var reader;

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

graph = new joint.dia.BloomingGraph();

// Create a paper and wrap it in a PaperScroller.
paper = new joint.dia.Paper({
    width: 1000,
    height: 1000,
    gridSize: 10,
    perpendicularLinks: false,
    model: graph,
    defaultLink: new joint.dia.CellLink({
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
// TODO: Not sure what this does.
paper.el.oncontextmenu = function(evt) { evt.preventDefault(); };


// Create and populate stencil.
stencil = new joint.ui.Stencil({
	graph: graph,
	paper: paper,
	label: 'hello',
	width: 200,
	height: 600
});

// TODO: Currently tied to the Undo/Redo buttons. 
// Once those are re-implemented need for this global variable can be revisited
var commandManager = new joint.dia.CommandManager({ graph: graph });

$('#stencil').append(stencil.render().el);

stencil.load([new joint.shapes.basic.Goal({ position: {x: 50, y: 20} }), 
              new joint.shapes.basic.Task({ position: {x: 50, y: 100} }),
              new joint.shapes.basic.Softgoal({ position: {x: 50, y: 170} }),
              new joint.shapes.basic.Resource({ position: {x: 50, y: 250} }),
              new joint.shapes.basic.Actor({ position: {x: 40, y: 355} })]);

$('#slider').width($('#paper').width() * 0.8);
$('#slider').css("margin-top", $(window).height() * 0.9);

// Adjust slider value position based on stencil width and paper width
var sliderValuePosition = 200 + $('#paper').width() * 0.1;
$('#sliderValue').css("top", '20px');
$('#sliderValue').css("left", sliderValuePosition.toString() + 'px');
$('#sliderValue').css("position", "relative");
