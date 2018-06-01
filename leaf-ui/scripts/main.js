//Flag to turn on console log notification
var develop = false;

// Global variables
var graph;
var paper;
var stencil;
var mode;

var linkInspector = new LinkInspector();
var elementInspector = new ElementInspector();
var constrainsInspector = new ConstraintsInspector();
var analysisInspector = new AnalysisInspector();

var currentHalo;
var currentAnalysis;
var elementList;

// Analysis variables
var historyObject = new historyObject();
var sliderObject = new sliderObject();
var queryObject = new queryObject();

var loader;
var reader;
var recursiveStack = {};
var constraintHolder = {};
//Properties for both core and simulator.
//TODO: merge this two arrays in order to make use the same name for all
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
}

//var functions = {A: 'AI', O: 'OI', N: 'NT', M: 'MP', R: 'R', S: 'SP', MN: 'MN', SN: 'SN', U: 'UD'};

// ----------------------------------------------------------------- //
// Page setup

// Mode used specify layout and functionality of toolbars
mode = "Modelling";		// 'Analysis' or 'Modelling'
linkMode = "View";	// 'Relationships' or 'Constraints'

graph = new joint.dia.Graph();

graph.links = [];
graph.intensionConstraints = [];
graph.linksNum;
graph.constraintsNum;
graph.allElements = [];
graph.elementsBeforeAnalysis = [];
graph.constraintValues = [];//store all the graph constraint values to be used		 +var linkNum = 0;
														// by InputConstraint

var linkNum = 0;
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
console.log(linkNum);

var paperScroller = new joint.ui.PaperScroller({
	autoResizePaper: true,
	paper: paper
});

$('#paper').append(paperScroller.render().el);
paperScroller.center();


// Create and populate stencil.
stencil = new joint.ui.Stencil({
	graph: graph,
	paper: paper,
	width: 200,
	height: 600
});

$('#stencil').append(stencil.render().el);

var goal = new joint.shapes.basic.Goal({ position: {x: 50, y: 20} });
var task = new joint.shapes.basic.Task({ position: {x: 50, y: 100} });
var sgoal = new joint.shapes.basic.Softgoal({ position: {x: 50, y: 170} });
var res = new joint.shapes.basic.Resource({ position: {x: 50, y: 250} });
var act = new joint.shapes.basic.Actor({ position: {x: 40, y: 400} });

stencil.load([goal, task, sgoal, res, act]);

//Setup LinkInspector
$('.inspector').append(linkInspector.el);
$('.inspector').append(constrainsInspector.el);

//Interface set up for modelling mode on startup
$('#dropdown-model').css("display","none");
$('#history').css("display","none");

//Initialize Slider setup
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

//If a cookie exists, process it as a previously created graph and load it.
if (document.cookie){
	var cookies = document.cookie.split(";");
	var prevgraph = "";

	//Loop through the cookies to find the one representing the graph, if it exists
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
			// this should never happen, but just in case
			alert('Previously stored cookies contains invalid JSON data. Please clear your cookies.');
		}
	}

}






// ----------------------------------------------------------------- //
// Analysis and modelling mode control

//Switch to analysis mode
$('#analysis-btn').on('click', function(){
	syntaxCheck();

	//Adjust left and right panels
	elementInspector.clear();
	linkInspector.clear();
	constrainsInspector.clear();
	analysisInspector.render();

	$('.inspector').append(analysisInspector.el);
	$('#stencil').css("display","none");
	$('#history').css("display","");

	$('#analysis-btn').css("display","none");
	$('#symbolic-btn').css("display","none");
	$('#cycledetect-btn').css("display","none");
	$('#dropdown-model').css("display","");

	$('#model-toolbar').css("display","none");

	$('#modeText').text("Analysis");

	// disable link settings
	$('.link-tools .tool-remove').css("display","none");
	$('.link-tools .tool-options').css("display","none");

	if(currentHalo)
		currentHalo.remove();

	mode = "Analysis";
});

//Switch to modeling mode
$('#model-cur-btn').on('click', function(){
	switchToModellingMode(false);
	//Cleaning the previous analysis data for new execution
	global_analysisResult.elementList = "";
	savedAnalysisData.finalAssigneEpoch="";
	savedAnalysisData.finalValueTimePoints="";
});

//Cycle button onclick
$('#cycledetect-btn').on('click', function(e){
	//alert("cycle button clicked");
	var analysis = new InputAnalysis();
	var links = new InputLink();
	var js_object = {};
	var js_links = {};
	js_object.analysis = getAnalysisValues(analysis);
	jslinks = getLinks();

	if(jslinks.length == 0){
		swal("No cycle in the graph", "", "success");
	}
	else{
		var verticies = js_object.analysis.elementList;
		var links = jslinks;
		console.log(verticies)
		console.log(graph.getElements());
		console.log(links);
		//If there is no cycle, leave the color the way it was
		if (cycleCheck(links, verticies) == false){
			swal("No cycle in the graph", "", "success");
			var elements = graph.getElements();
			for (var i = 0; i < elements.length; i++){
				var cellView  = elements[i].findView(paper);
				if(cellView.model.attributes.type == "link"){
					console.log(cellView.model.attr);
				}
				if(cellView.model.attributes.type == "basic.Task"){
					cellView.model.attr({'.outer': {'fill': '#92E3B1'}});
				}
				if(cellView.model.attributes.type == "basic.Goal"){
					cellView.model.attr({'.outer': {'fill': '#FFCC66'}});
				}
				if(cellView.model.attributes.type == "basic.Resource"){
					cellView.model.attr({'.outer': {'fill': '#92C2FE'}});
				}
				if(cellView.model.attributes.type == "basic.Softgoal"){
					cellView.model.attr({'.outer': {'fill': '#FF984F'}});
				}
			}
		}
		else{
			swal("Cycle in the graph", "", "error");
			var elements = graph.getElements();
			for (var i = 0; i < elements.length; i++){
				var cellView  = elements[i].findView(paper);
				if (recursiveStack[cellView.model.attributes.elementid] == true){
					cellView.model.attr({'.outer': {'fill': 'red'}});
				}
				else{
					if(cellView.model.attributes.type == "basic.Task"){
						cellView.model.attr({'.outer': {'fill': '#92E3B1'}});
					}
					if(cellView.model.attributes.type == "basic.Goal"){
						cellView.model.attr({'.outer': {'fill': '#FFCC66'}});
					}
					if(cellView.model.attributes.type == "basic.Resource"){
						cellView.model.attr({'.outer': {'fill': '#92C2FE'}});
					}
					if(cellView.model.attributes.type == "basic.Softgoal"){
						cellView.model.attr({'.outer': {'fill': '#FF984F'}});
					}
				}
			}
		}
	}
	var elements = graph.getElements();

	js_object = null;
	jslinks = null;

});

/*
 * Initializes and returns a 'DestSourceMapper' object which contains
 * information about links by indicating the source nodes to destination nodes
 *
 * @param {Array of joint.dia.Link} jointLinks
 * @param {Array of InputLink} inputlinks
 * @returns {Object}
 *
 * Example object:
 *
 * {linkDestID : {source: [],
 *		          constraint: [],
 *		          linkView: []
 *				 }
 * }
 *
 * linkDestID: id of a destination node for links
 * source: id of the source of the link
 * contraint: contraint types
 * linkView: linkView of the link
 * 
 * Interpretation:
 * If dest = 0, source[i] = 1, constraint[i] = AND,
 * this means that the i'th link is an AND constraint
 * link from node 1 to node 0
 * 
 */
function initializeDestSourceMapper(jointLinks, inputlinks){
	console.log('elements ', jointLinks);
	console.log('jslinks', inputlinks);
    let destSourceMapper = {};
    let linkView;
    let constraint;
    for(var j = 0; j < inputlinks.length; j++){
        linkView  = jointLinks[j].findView(paper);

        if(!(inputlinks[j].linkDestID in destSourceMapper)){
            // create empty object and arrays
            destSourceMapper[inputlinks[j].linkDestID] = {};
            destSourceMapper[inputlinks[j].linkDestID]["source"] = [];
            destSourceMapper[inputlinks[j].linkDestID]["constraint"] = [];
            destSourceMapper[inputlinks[j].linkDestID]["findview"] = [];
        }

        if (inputlinks[j].postType != null){
            constraint = inputlinks[j].linkType+"|"+inputlinks[j].postType;
        }else{
            constraint = inputlinks[j].linkType;
        }
        destSourceMapper[inputlinks[j].linkDestID]["source"].push(inputlinks[j].linkSrcID);
        destSourceMapper[inputlinks[j].linkDestID]["constraint"].push(constraint);
        destSourceMapper[inputlinks[j].linkDestID]["findview"].push(linkView);
    }
    console.log('destSourceMapper ', destSourceMapper);
    return destSourceMapper;
}

/*
 * Returns a syntax error message.
 *
 * Prerequisite: There are links from each node with ids in sourceList
 * to the node with id destId, and there exists a syntax error for these links. 
 *
 * @param {Array of Object} naryRelationships
 *   array containing the objects that represent
 *   source nodes that participate in an n-ary relationship
 * @param {String} destId
 *   destination id
 * @returns {String}
 */
function generateSyntaxMessage(naryRelationships, destId){

	let sourceNodeText = '';
	let suggestionText = 'Have all n-ary links from ';
	var constraintsText = '';
	var constraintArr = [];

	// determine which n-ary relationships are present
	for (var i = 0; i < naryRelationships.length; i++) {
		if (!constraintArr.includes(naryRelationships[i].constraint)) {
			constraintArr.push(naryRelationships[i].constraint);
		}
	}

	// create a string for the n-ary relationships
	for (var i = 0; i < constraintArr.length - 1; i++) {
		constraintsText += constraintArr[i] + ' or ';
	}
	constraintsText += constraintArr[constraintArr.length - 1];

	// create a string for the source nodes
    for (var i = 0; i < naryRelationships.length - 1; i++) {
    	sourceNodeText += getNodeName(naryRelationships[i].source);
    	if (i != naryRelationships.length -2) {
    		sourceNodeText += ', ';
    	} else {
    		sourceNodeText += ' ';
    	}
    }

    sourceNodeText += 'and ' + getNodeName(naryRelationships[naryRelationships.length - 1].source);
    suggestionText += sourceNodeText + ' to ' + getNodeName(destId) + ' as ' + constraintsText + '.';

    // as an example, suggestionText should now look something like:
    // "Have all n-ary links from Task_1, Task_2 and Task_3 to Goal_0 as AND or NO RELATIONSHIP or OR.""
    var s = '<p style="text-align:left"><b style="color:black"> Source nodes: </b>' + sourceNodeText + '<br>' +
    	'<b style="color:black"> Destination node: </b>' + getNodeName(destId) + 
    	'<br><b style="color:black"> Suggestion: </b>' + suggestionText + '<br></p>';

    return s;
}

function getNodeName(id){
    var listNodes = graph.getElements();
    for(var i = 0; i < listNodes.length; i++){
        var cellView  = listNodes[i].findView(paper);
        if(id == cellView.model.attributes.elementid){
            var nodeName = cellView.model.attr(".name");
            return nodeName.text;
        }
    }
}

/*
 * Returns true iff any two n-ary constraints in 
 * naryRelationships are different
 *
 * @param {Object} naryRelationships
 *   an array containing the objects that represent
 *   source nodes that participate in an n-ary relationship,
 *   (ie, AND, OR, NO RELATIONSHIP)
 * @returns {boolean} 
 */
function syntaxErrorExists(naryRelationships) {

	if (naryRelationships.length < 2) {
		return false;
	}
	for (var i = 1; i < naryRelationships.length; i++) {
		if (naryRelationships[0].constraint != naryRelationships[i].constraint) {
			return true;
		}
	}

	return false;
}

/*
 * Return an array containing the objects that represent
 * source nodes that participate in an n-ary relationship,
 * (ie, AND, OR, NO RELATIONSHIP), with the node with id destId
 *
 * Example return object:
 * [
 *     {source: 1, constraint: 'AND', findview: Object},
 *     {source: 2, constraint: 'OR', findview: Object}
 * ]
 *
 * @param {Object} destSourceMapper
 * @param {String} destId
 * @returns {Array of Object}
 */
function getNaryRelationships(destSourceMapper, destId) {
	var result = [];

	var constraints = destSourceMapper[destId].constraint;
	for (var i = 0; i < constraints.length; i++) {
		if (constraints[i] == 'AND' || 
			constraints[i] == 'OR' || 
			constraints[i] == 'NO RELATIONSHIP') {
			console.log('destSourceMapper[destId]', destSourceMapper[destId]);
			var obj = {
				source: destSourceMapper[destId].source[i],
				constraint: constraints[i],
				findview: destSourceMapper[destId].findview[i]
			};
			result.push(obj);
		}
	}

	return result;
}

/*
 * Changes the colour and stroke-width of all linkViews in 
 * linkViewArray
 *
 * @param {Array of joint.dia.LinkView} linkViewArray
 * @param {String} colour
 * @param {Number} strokeWidth
 */
function changeLinkColour(linkViewArray, colour, strokeWidth) {
	for (var i = 0; i < linkViewArray.length; i++) {
		linkViewArray[i].model.attr({'.connection': {'stroke': colour}});
        linkViewArray[i].model.attr({'.marker-target': {'stroke': colour}});
        linkViewArray[i].model.attr({'.connection': {'stroke-width': strokeWidth}});
        linkViewArray[i].model.attr({'.marker-target': {'stroke-width': strokeWidth}});
	}
}

/*
 * Displays error popup with title and message
 *
 * @param {String} title
 * @param {String} message
 */
function displayErrorPopup(title, message) {
	swal({
        	title: title,
            type: "warning",
            html: message,
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: "Ok",
            cancelButtonText: "Go back to Model View",
            cancelButtonClass: "backModel"
        }).then(function() {

        }, function(dismiss) {
            if (dismiss === 'cancel') {
                $("#model-cur-btn").trigger("click");
            }
    });
}

/*
 * Performs a syntax check on the current model, by checking if each destination
 * nodes with links, have valid constraints.
 * Returns true and displays an error popup iff a syntax error exists
 *
 * @returns {boolean}
 */
function syntaxCheck() {

    // Get all links in the form of an InputLink
    var inputLinks = getLinks();

    // Get all links in the form of a joint.dia.Link
    var jointLinks = graph.getLinks();

    //Create an object that represents the constraint links and its sources and destination
    let destSourceMapper = initializeDestSourceMapper(jointLinks, inputLinks);
    let errorText = '';

    for (var destId in destSourceMapper){

    	var naryRelationships = getNaryRelationships(destSourceMapper, destId);

        // If there is a syntax error.
        if (syntaxErrorExists(naryRelationships)){

            errorText += generateSyntaxMessage(naryRelationships, destId);

            var linkViews = [];
            for (var i = 0; i < naryRelationships.length; i++) {
            	linkViews.push(naryRelationships[i].findview);
            }

            changeLinkColour(linkViews, 'red', 3);

        } else {
        	changeLinkColour(destSourceMapper[destId]['findview'], 'black', 1);
        }
    }

    if (errorText) {
    	displayErrorPopup('We found invalid link combinations', errorText);
    	return true;
    }
    return false;
}

//Cycle-deteciton algorithm
// The algorithm is referenced from Detect Cycle in a Directed Graph algorithm
// discussed at : http://www.geeksforgeeks.org/detect-cycle-in-a-graph/
function cycleCheck(links, verticies){
	var graphs = {};
	var visited = {};
	var cycle = false;
	//Iterate over links to create map between src node and dest node of each link
	links.forEach(function(element){
		var src = element.linkSrcID;
		if(src in graphs){
			graphs[src].push(element.linkDestID);
		}
		else{
			graphs[src] = [element.linkDestID];
		}
	})
	//Iterate over all verticies to initialize visited stack and recursive stack to false
	verticies.forEach(function(vertex){
		visited[vertex.id] = false;
		recursiveStack[vertex.id] = false;
	})

	verticies.forEach(function(vertex){
			if (visited[vertex.id] == false) {
				if (isCycle(vertex.id,visited,recursiveStack, graphs) == true){
					cycle = true;
				}
			}
	})
	cycleClear = cycle;
	return cycle;
}
//DepthFirstSearch
function isCycle(v, visited, recursiveStack, graphs){
	visited[v] = true;
	recursiveStack[v] = true;
	if(graphs[v] == null){
		recursiveStack[v] = false;
		return false;
	}
	else{
		for(var i = 0; i < graphs[v].length; i++){
			if (visited[graphs[v][i]] == false){
				if (isCycle(graphs[v][i], visited, recursiveStack, graphs) == true){
					return true;
				}
			}
			else if (recursiveStack[graphs[v][i]] == true){
				return true;
			}
		}
	}
	recursiveStack[v] = false;
	return false;
}

function switchToModellingMode(useInitState){
	//Reset to initial graph prior to analysis
	if(useInitState){
		for (var i = 0; i < graph.elementsBeforeAnalysis.length; i++){
			var value = graph.elementsBeforeAnalysis[i]
			updateValues(i, value, "toInitModel");
		}
	}
	// }else{
	// 	for (var i = 0; i < graph.elementsBeforeAnalysis.length; i++){
	// 		var value = graph.elementsBeforeAnalysis[i]
	// 	}
	// }

	graph.elementsBeforeAnalysis = [];

	analysisInspector.clear();
	$('#stencil').css("display","");
	$('#history').css("display","none");

	$('#analysis-btn').css("display","");
	$('#symbolic-btn').css("display","");
	$('#cycledetect-btn').css("display","");
	$('#dropdown-model').css("display","none");

	$('#model-toolbar').css("display","");

	$('#sliderValue').text("");

	// reinstantiate link settings
	$('.link-tools .tool-remove').css("display","");
	$('.link-tools .tool-options').css("display","");

	graph.allElements = null;

	// Clear previous slider setup
	clearHistoryLog();

	queryObject.clearCells();

	mode = "Modelling";
}



// ----------------------------------------------------------------- //
// Communication between server and front end
function loadAnalysis(analysisResults){
	currentAnalysis = new analysisObject.initFromBackEnd(analysisResults);
	savedAnalysisData.finalAssigneEpoch = analysisResults.finalAssignedEpoch;
	savedAnalysisData.finalValueTimePoints = analysisResults.finalValueTimePoints;
	$('#num-rel-time').val(analysisResults.relativeTimePoints);
	if(analysisResults.absoluteTimePoints){
		var absTimePoints = analysisResults.absoluteTimePoints.toString();
		$('#abs-time-pts').val(absTimePoints.replace(/,/g, " "));
	}

	elementList = analysisResults.elementList;
	updateSlider(currentAnalysis, false);
}




// ----------------------------------------------------------------- //
// Slider control

// Slider creation and update
function updateSlider(currentAnalysis, pastAnalysisStep){
	var analysisMarkers;

	if(!sliderObject.sliderElement){
		sliderObject.sliderElement = document.getElementById('slider');
		sliderObject.sliderValueElement = document.getElementById('sliderValue');
	}

	// First create slider
	if(!sliderObject.sliderElement.hasOwnProperty('noUiSlider')){
		var currentValueLimit = 0;
		var sliderMax = currentAnalysis.timeScale;

		updateHistory(currentAnalysis, currentValueLimit);
		analysisMarkers = sliderObject.pastAnalysisValues;

	// Clicking on element on history log
	}else if(typeof(pastAnalysisStep) == "number"){
		if (pastAnalysisStep == 0){
			var currentValueLimit = 0;
			var sliderMax = currentAnalysis.timeScale;
			analysisMarkers = [];
		}else{
			var currentValueLimit = historyObject.allHistory[pastAnalysisStep - 1].sliderEnd;
			var sliderMax = currentValueLimit + currentAnalysis.timeScale;
			analysisMarkers = sliderObject.pastAnalysisValues.slice(0, pastAnalysisStep);
		}

		sliderObject.sliderElement.noUiSlider.destroy();

	// Appending new analysis
	}else{
		var currentValueLimit = parseInt(sliderObject.sliderElement.noUiSlider.get());
		var sliderMax = currentValueLimit + currentAnalysis.timeScale;

		sliderObject.sliderElement.noUiSlider.destroy();

		//append to past analysis values only if value change
		var pastLength = sliderObject.pastAnalysisValues.length;
		if ((sliderObject.pastAnalysisValues[pastLength - 1] != currentValueLimit) && (currentValueLimit != 0)){
			sliderObject.pastAnalysisValues.push(currentValueLimit);
			updateHistory(currentAnalysis, currentValueLimit);
		}else{
			updateHistoryName(currentAnalysis);
		}

		analysisMarkers = sliderObject.pastAnalysisValues;
	}
	adjustSlider(sliderMax);
	if (sliderMax < 25){
		noUiSlider.create(sliderObject.sliderElement, {
		start: 0,
		step: 1,
		behaviour: 'tap',
		connect: 'lower',
		direction: 'ltr',
		range: {
			'min': 0,
			'max': sliderMax
		},
		pips: {
			mode: 'values',
			values: analysisMarkers,
			density: 100/sliderMax
		}
		});
	}
	else {
		noUiSlider.create(sliderObject.sliderElement, {
		start: 0,
		step: 1,
		behaviour: 'tap',
		connect: 'lower',
		direction: 'ltr',
		range: {
			'min': 0,
			'max': sliderMax
		},
		pips: {
			mode: 'values',
			values: analysisMarkers,
			density: 4
		}
		});
	}


	sliderObject.sliderElement.noUiSlider.on('update', function( values, handle ) {
		//Set slidable range based on previous analysis
		if(values[handle] < currentValueLimit){
			sliderObject.sliderElement.noUiSlider.set(currentValueLimit);
		}else{
			updateSliderValues(values[handle], currentValueLimit, currentAnalysis);
		}
	});
}
// Adjust slider's width based on the maxvalue of the slider
function adjustSlider(maxValue){
	// Min width of slider is 15% of paper's width
	var min = $('#paper').width() * 0.1;
	// Max width of slider is 90% of paper's width
	var max = $('#paper').width() * 0.8;
	// This is the width based on maxvalue
	var new_width = $('#paper').width() * maxValue / 100;
	// new_width is too small or too large, adjust
	if (new_width < min){
		new_width = min;
	}
	if (new_width > max){
		new_width = max;
	}
	$('#slider').width(new_width);


}

function updateSliderValues(valueString, currentValueLimit, currentAnalysis){
	var sliderValue = parseInt(valueString);
	var value = sliderValue - currentValueLimit;
	$('#sliderValue').text(value);
	sliderObject.sliderValueElement.innerHTML = value + "|" + currentAnalysis.relativeTime[value];

	for (var i = 0; i < currentAnalysis.numOfElements; i++){
		updateValues(i, currentAnalysis.elements[i][value], "renderAnalysis");
	}
}

// Update the satisfaction value of a particular node in the graph
function updateValues(c, v, m){
	var cell;
	var value;

	// Update node based on values from cgi file
	if (m == "renderAnalysis"){
		cell = graph.allElements[c];
		value = v;

	//Update node based on values saved from graph prior to analysis
	}else if (m == "toInitModel"){
		cell = graph.allElements[c];
		value = cell.attributes.attrs[".satvalue"].value;
	}

	// Update images for properties
	if ((value == "0001") || (value == "0011")) {
	  cell.attr(".satvalue/text", "(FS, T)");
	  cell.attr({text:{fill:'black'}});
	}else if(value == "0010") {
	  cell.attr(".satvalue/text", "(PS, T)");
	  cell.attr({text:{fill:'black'}});
	}else if ((value == "1000") || (value == "1100")){
	  cell.attr(".satvalue/text", "(T, FD)");
	  cell.attr({text:{fill:'black'}});
	}else if (value == "0100") {
	  cell.attr(".satvalue/text", "(T, PD)");
	  cell.attr({text:{fill:'black'}});
	}else if (value == "0110") {
		  cell.attr(".satvalue/text", "(PS, PD)");
		  cell.attr({text:{fill:'red'}});
	}else if ((value == "1110") || (value == "1010")){
		  cell.attr(".satvalue/text", "(PS, FD)");
		  cell.attr({text:{fill:'red'}});
	}else if ((value == "0111") || (value == "0101")){
		  cell.attr(".satvalue/text", "(FS, PD)");
		  cell.attr({text:{fill:'red'}});
	}else if ((value == "1111") || (value == "1001") || (value == "1101") || (value == "1011") ){
		  cell.attr(".satvalue/text", "(FS, FD)");
		  cell.attr({text:{fill:'red'}});
	}else if (value == "0000") {
	      cell.attr(".satvalue/text", "(T,T)");
	      cell.attr({text:{fill:'black'}});
	}else {
	  cell.removeAttr(".satvalue/d");
	}

}

// ----------------------------------------------------------------- //
// History log
$('#history').on("click", ".log-elements", function(e){
	var txt = $(e.target).text();
	var step = parseInt(txt.split(":")[0].split(" ")[1] - 1);
	var log = historyObject.allHistory[step];
	currentAnalysis = log.analysis;
	updateSlider(log.analysis, step);

	$(".log-elements:nth-of-type(" + historyObject.currentStep.toString() +")").css("background-color", "");
	$(e.target).css("background-color", "#E8E8E8");

	historyObject.currentStep = step + 1;
});

function clearHistoryLog(){
	$('.log-elements').remove();
	if(sliderObject.sliderElement.noUiSlider)
		sliderObject.sliderElement.noUiSlider.destroy();

	sliderObject.pastAnalysisValues = [];

	historyObject.allHistory = []
	historyObject.currentStep = null;
	historyObject.nextStep = 1;
}

// update history log and save file data
function updateHistory(currentAnalysis, currentValueLimit){
	var logMessage = "Step " + historyObject.nextStep.toString() + ": " + currentAnalysis.type;
	logMessage = logMessage.replace("<", "&lt");

	if($(".log-elements")){
		$(".log-elements").last().css("background-color", "");
	}

	$("#history").append("<a class='log-elements' style='background-color:#E8E8E8''>" + logMessage + "</a>");

	historyObject.currentStep = historyObject.nextStep;
	historyObject.nextStep++;

	if(historyObject.allHistory.length == 0){
		var log = new logObject(currentAnalysis, 0);
	}else{
		var l = historyObject.allHistory.length - 1;
		historyObject.allHistory[l].sliderEnd = currentValueLimit;
		historyObject.allHistory[l].analysisLength = currentValueLimit - historyObject.allHistory[l].sliderBegin;
		var log = new logObject(currentAnalysis, currentValueLimit);
	}

	historyObject.allHistory.push(log);
}

function updateHistoryName(currentAnalysis){
	var name = $(".log-elements").last().html().split(": ");
	var newName = name[0] + " " + currentAnalysis.type;
	$(".log-elements").last().html(newName);
}


// ----------------------------------------------------------------- //
// Rappid setup

var element_counter = 0;
var max_font = 20;
var min_font = 6;
var current_font = 10;

//Whenever an element is added to the graph
graph.on("add", function(cell){
	if (cell instanceof joint.dia.Link){
		if (graph.getCell(cell.get("source").id) instanceof joint.shapes.basic.Actor){
			cell.prop("linktype", "actorlink");
		cell.label(0,{attrs:{text:{text:"is-a"}}});

		}
	}	//Don't do anything for links
	//Give element a unique default
	cell.attr(".name/text", cell.attr(".name/text") + "_" + element_counter);
	element_counter++;

	//Add Functions and sat values to added types
	if (cell instanceof joint.shapes.basic.Intention){
		cell.attr('.funcvalue/text', ' ');
	}

	//Send actors to background so elements are placed on top
	if (cell instanceof joint.shapes.basic.Actor){
		cell.toBack();
	}

	paper.trigger("cell:pointerup", cell.findView(paper));
});

//Auto-save the cookie whenever the graph is changed.
graph.on("change", function(){
	var graphtext = JSON.stringify(graph.toJSON());
	document.cookie = "graph=" + graphtext;
});

var selection = new Backbone.Collection();

var selectionView = new joint.ui.SelectionView({
	paper: paper,
	graph: graph,
	model: selection
});


// Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
// Otherwise, initiate paper pan.
paper.on('blank:pointerdown', function(evt, x, y) {
    if (_.contains(KeyboardJS.activeKeys(), 'shift')) {
    	if(mode == "Analysis")
			return

        selectionView.startSelecting(evt, x, y);
    } else {
        paperScroller.startPanning(evt, x, y);
    }
});

paper.on('cell:pointerdown', function(cellView, evt, x, y){
	if(mode == "Analysis"){
		queryObject.addCell(cellView);
		return
	}

	var cell = cellView.model;
	if (cell instanceof joint.dia.Link){
		cell.reparent();
	}

	//Unembed cell so you can move it out of actor
	if (cell.get('parent') && !(cell instanceof joint.dia.Link)) {
		graph.getCell(cell.get('parent')).unembed(cell);
	}
});

// Unhighlight everything when blank is being clicked
paper.on('blank:pointerclick', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		var cellView  = elements[i].findView(paper);
		cellView.unhighlight();
	}
});



// Disable context menu inside the paper.
paper.el.oncontextmenu = function(evt) { evt.preventDefault(); };


// A simple element editor.
// --------------------------------------
$('.inspector').append(elementInspector.el);

//Link equivalent of the element editor
paper.on("link:options", function(evt, cell){
	if(mode == "Analysis")
		return

	linkInspector.clear();
	constrainsInspector.clear();
	elementInspector.clear();
	linkInspector.render(cell);

});

//Single click on cell
paper.on('cell:pointerup', function(cellView, evt) {
	if(mode == "Analysis")
		return

	// Link
	if (cellView.model instanceof joint.dia.Link){
		var link = cellView.model;

		if(link.getSourceElement()!=null)
			var sourceCell = link.getSourceElement().attributes.type;

		// Check if link is valid or not
		if (link.getTargetElement()){
			var targetCell = link.getTargetElement().attributes.type;

			// Links of actors must be paired with other actors
			if (((sourceCell == "basic.Actor") && (targetCell != "basic.Actor")) ||
				((sourceCell != "basic.Actor") && (targetCell == "basic.Actor"))){
				link.label(0 ,{position: 0.5, attrs: {text: {text: 'error'}}});
			}else if ((sourceCell == "basic.Actor") && (targetCell == "basic.Actor")){
				if(!link.prop("link-type")){
					link.label(0 ,{position: 0.5, attrs: {text: {text: 'is-a'}}});
					link.prop("link-type", "is-a");
				}else{
					link.label(0 ,{position: 0.5, attrs: {text: {text: link.prop("link-type")}}});
				}
			}
		}
		return

	// element is selected
	}else{
		selection.reset();
		selection.add(cellView.model);
		var cell = cellView.model;
		// Unhighlight everything
		var elements = graph.getElements();
		for (var i = 0; i < elements.length; i++){
			var cellview  = elements[i].findView(paper);
			cellview.unhighlight();
		}
		// Highlight when cell is clicked
		cellView.highlight();

		currentHalo = new joint.ui.Halo({
			graph: graph,
			paper: paper,
			cellView: cellView,
			type: 'toolbar'
		});

		currentHalo.removeHandle('unlink');
		currentHalo.removeHandle('clone');
		currentHalo.removeHandle('fork');
		currentHalo.removeHandle('rotate');
		currentHalo.render();

		//Embed an element into an actor boundary, if necessary
		if (!(cellView.model instanceof joint.shapes.basic.Actor)){
			var ActorsBelow = paper.findViewsFromPoint(cell.getBBox().center());

			if (ActorsBelow.length){
				for (var a = 0; a < ActorsBelow.length; a++){
					if (ActorsBelow[a].model instanceof joint.shapes.basic.Actor){
						ActorsBelow[a].model.embed(cell);
					}
				}
			}
		}

		linkInspector.clear();
		constrainsInspector.clear();
		elementInspector.render(cellView);
	}
});


graph.on('change:size', function(cell, size){
	cell.attr(".label/cx", 0.25 * size.width);

	//Calculate point on actor boundary for label (to always remain on boundary)
	var b = size.height;
	var c = -(size.height/2 + (size.height/2) * (size.height/2) * (1 - (-0.75 * size.width/2) * (-0.75 * size.width/2)  / ((size.width/2) * (size.width/2)) ));
	var y_cord = (-b + Math.sqrt(b*b - 4*c)) / 2;

	cell.attr(".label/cy", y_cord);
});


//Removing a link
this.graph.on('remove', function(cell, collection, opt) {
   if (cell.isLink()) {
	   if(cell.prop("link-type") == 'NBT' || cell.prop("link-type") == 'NBD'){

		   //Verify if is a Not both type. If it is remove labels from source and target node
		   var link = cell;
		   var source = link.prop("source");
		   var target = link.prop("target");

		   for(var i = 0; i < graph.getElements().length; i++ ){
			   if(graph.getElements()[i].prop("id") == source["id"]){
				   source = graph.getElements()[i];
			   }
			   if(graph.getElements()[i].prop("id") == target["id"]){
				   target = graph.getElements()[i];
			   }
		   }

		   //verify if node have any other link NBD or NBT
	 	  var sourceNBLink = function(){
	 		  var localLinks = graph.getLinks();
	 		  for(var i = 0; i < localLinks.length; i++){
	 			  if ((localLinks[i]!=link) && (localLinks[i].prop("link-type") == 'NBT' || localLinks[i].prop("link-type") == 'NBD')){
	     			  if(localLinks[i].getSourceElement().prop("id") == source["id"] || localLinks[i].getTargetElement().prop("id") == source["id"]){
	     				 return true;
	     			  }
	 			  }
	 		  }
	 		  return false;
	 	  }

	 	  //verify if target have any other link NBD or NBT
	 	  var targetNBLink = function(){
	 		  var localLinks = graph.getLinks();
	 		  for(var i = 0; i < localLinks.length; i++){
	 			  if ((localLinks[i]!=link) && (localLinks[i].prop("link-type") == 'NBT' || localLinks[i].prop("link-type") == 'NBD')){
	     			  if(localLinks[i].getTargetElement().prop("id") == target["id"] || localLinks[i].getSourceElement().prop("id") == target["id"]){
	     				 return true;
	     			  }
	 			  }
	 		  }
	 		  return false;
	 	  }

	 	  //Verify if it is possible to remove the NB tag from source and target
	 	  if(!sourceNBLink()){
	 		  source.attr(".funcvalue/text", "");
	 	  }
	 	  if(!targetNBLink()){
		          target.attr(".funcvalue/text", "");
	 	  }

	  }
   }
});



// ----------------------------------------------------------------- //
// Keyboard shortcuts


var clipboard = new joint.ui.Clipboard();
//Check if the browser is on Mac
var macOS = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)?true:false;
if(macOS){
	console.log("On mac");
	KeyboardJS.on('command + c, ctrl + c', function() {
		// Copy all selected elements and their associatedf links.
		clipboard.copyElements(selection, graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
	});
	KeyboardJS.on('command + v, ctrl + v', function() {
		clipboard.pasteCells(graph);

		selectionView.cancelSelection();

		clipboard.pasteCells(graph, { link: { z: -1 }, useLocalStorage: true });

		// Make sure pasted elements get selected immediately. This makes the UX better as
		// the user can immediately manipulate the pasted elements.
		clipboard.each(function(cell) {
			if (cell.get('type') === 'link') return;

			// Push to the selection not to the model from the clipboard but put the model into the graph.
			// Note that they are different models. There is no views associated with the models
			// in clipboard.
			selection.add(graph.get('cells').get(cell.id));
		});

		selection.each(function(cell) {
		selectionView.createSelectionBox(paper.findViewByModel(cell));
		});
	});

	//Delete selected nodes when the delete key is pressed.

	KeyboardJS.on('del', function(){
	// 	while (selection.length > 0){
	// 		selection.pop();
	// //		console.log(paper.findViewByModel(current));
	// //		selectionView.destroySelectionBox(paper.findViewByModel(current));
	// //		current.remove();
	// 	}
	});
	// Override browser's default action when backspace is pressed
	KeyboardJS.on('backspace', function(){

	});
}
else{
	KeyboardJS.on('ctrl + c', function() {
		// Copy all selected elements and their associatedf links.
		clipboard.copyElements(selection, graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
	});
	KeyboardJS.on('ctrl + v', function() {
		clipboard.pasteCells(graph);

		selectionView.cancelSelection();

		clipboard.pasteCells(graph, { link: { z: -1 }, useLocalStorage: true });

		// Make sure pasted elements get selected immediately. This makes the UX better as
		// the user can immediately manipulate the pasted elements.
		clipboard.each(function(cell) {
			if (cell.get('type') === 'link') return;

			// Push to the selection not to the model from the clipboard but put the model into the graph.
			// Note that they are different models. There is no views associated with the models
			// in clipboard.
			selection.add(graph.get('cells').get(cell.id));
		});

		selection.each(function(cell) {
		selectionView.createSelectionBox(paper.findViewByModel(cell));
		});
	});

}

// ----------------------------------------------------------------- //
// Toolbar

$('#btn-undo').on('click', _.bind(commandManager.undo, commandManager));
$('#btn-redo').on('click', _.bind(commandManager.redo, commandManager));
$('#btn-clear-all').on('click', function(){
	graph.clear();
	//Delete cookie by setting expiry to past date
	document.cookie='graph={}; expires=Thu, 18 Dec 2013 12:00:00 UTC';
});

$('#btn-clear-elabel').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		elements[i].removeAttr(".satvalue/d");
		elements[i].attr(".constraints/lastval", "none");
		elements[i].attr(".funcvalue/text", " ");
		var cellView  = elements[i].findView(paper);
		elementInspector.render(cellView);
		elementInspector.$('#init-sat-value').val("none");
		elementInspector.updateHTML(null);

	}

});
$('#btn-clear-flabel').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".constraints/lastval") != "none"){
			elements[i].attr(".funcvalue/text", "C");
		}
	}
});
// This is an option under clear button to clear red-highlight from
// cycle detection function
$('#btn-clear-cycle').on('click',function(){
	var cycleElements = graph.getElements();
	console.log(cycleElements);

	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
			var cellView  = elements[i].findView(paper);
			if(cellView.model.attributes.type == "basic.Task"){
				cellView.model.attr({'.outer': {'fill': '#92E3B1'}});
			}
			if(cellView.model.attributes.type == "basic.Goal"){
				cellView.model.attr({'.outer': {'fill': '#FFCC66'}});
			}
			if(cellView.model.attributes.type == "basic.Resource"){
				cellView.model.attr({'.outer': {'fill': '#92C2FE'}});
			}
			if(cellView.model.attributes.type == "basic.Softgoal"){
				cellView.model.attr({'.outer': {'fill': '#FF984F'}});
			}
	}
});

$('#btn-svg').on('click', function() {
	paper.openAsSVG();
});

// Zoom in
$('#btn-zoom-in').on('click', function() {
	paperScroller.zoom(0.2, { max: 3 });
});

// Zoom out
$('#btn-zoom-out').on('click', function() {
	paperScroller.zoom(-0.2, { min: 0.2 });
});

// Save the current graph to json file
$('#btn-save').on('click', function() {
	var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
	if (name){
		var fileName = name + ".json";
		download(fileName, JSON.stringify(graph.toJSON()));
	}
});

// Workaround for load, activates a hidden input element
$('#btn-load').on('click', function(){
	$('#loader').click();
});

// Increase font size
$('#btn-fnt-up').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".name/font-size") < max_font){
			elements[i].attr(".name/font-size", elements[i].attr(".name/font-size") + 1);
		}
	}
});

// Decrease font size
$('#btn-fnt-down').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".name/font-size") > min_font){
			elements[i].attr(".name/font-size", elements[i].attr(".name/font-size") - 1);
		}
	}
});

// Default font size
$('#btn-fnt').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		elements[i].attr(".name/font-size", 10);
	}
});


// Simulator
loader = document.getElementById("loader");
reader = new FileReader();

// Whenever the input is changed, read the file.
loader.onchange = function(){
	reader.readAsText(loader.files.item(0));
};

// When read is performed, if successful, load that file.
reader.onload = function(){
	if (reader.result){
		if (mode == "Modelling"){
			graph.fromJSON(JSON.parse(reader.result));

			// Load different links and intension constraints
			var allLinks = graph.getLinks();
			graph.links = [];
			graph.intensionConstraints = [];
			allLinks.forEach(function(link){
				if(link.attr('./display') == "none"){
					graph.intensionConstraints.push(link);
				}else{
					graph.links.push(link);
				}
			});
		}else{
			analysisResults = reader.result.split("\n");
			//loadAnalysis(analysisResults, null, -1);
			loadAnalysis(analysisResults);
		}
	}
};



// Helper function to download saved graph in JSON format
function download(filename, text) {
	var dl = document.createElement('a');
	dl.setAttribute('href', 'data:application/force-download;charset=utf-8,' + encodeURIComponent(text));
	dl.setAttribute('download', filename);

	dl.style.display = 'none';
	document.body.appendChild(dl);

	dl.click();
	document.body.removeChild(dl);
}



// ----------------------------------------------------------------- //
// General javascript for user interaction

// When the user clicks anywhere outside of the a pop up, close it
window.onclick = function(event) {
	var modal = document.getElementById('myModal');
	var intermT = document.getElementById('intermediateTable');
  if (event.target == modal) {
  	modal.style.display = "none";
  }
	if(event.target == intermT){
		intermT.style.display = "none";
	}
}