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
graph.constraintValues = [];//store all the graph constraint values to be used
														// by InputConstraint

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
		if (cookies[i].indexOf("graph=") >= 0){
			prevgraph = cookies[i].substr(6);
			break;
		}
	}

	if (prevgraph){
		graph.fromJSON(JSON.parse(prevgraph));
	}
}



// ----------------------------------------------------------------- //
// Modelling link control
/*
$('#symbolic-btn').on('click', function(){
	saveLinks(linkMode);
	setLinks(linkMode);
});*/

// Set links or constraints
//Setlinks and savelinks may not needed.
function testMe(){
	console.log("tested me");
}
function setLinks(mode){
	if(mode == "View"){
		linkMode = "Constraints";
		$('#symbolic-btn').html("Model View");

		var restoredLinks = graph.intensionConstraints;
		paper.options.defaultLink.attributes.labels[0].attrs.text.text = " constraint ";
		paper.options.defaultLink.attr(".marker-target/d", 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5');

	}else if (mode == "Constraints"){
		linkMode = "View";
		$('#symbolic-btn').html("Model View");

		var restoredLinks = graph.links;
		paper.options.defaultLink.attributes.labels[0].attrs.text.text = "and";
		paper.options.defaultLink.attr(".marker-target/d", 'M 10 0 L 10 10 M 10 5 L 0 5');

	}

	$('#modeText').text("Modelling " + linkMode);

	// render preexisting links in new mode
	for (var l = 0; l < restoredLinks.length; l++){
		alert("never gets called")
		restoredLinks[l].attr('./display', '');
	}
}
function testMain(){
	alert("called in test main");
}
// Save links or constraints
function saveLinks(mode){
	console.log("called in saved links");
	// Hide all relationships that are not suppose to be dispalyed

	if(mode == "View"){
		var links = graph.getLinks();
		graph.links = [];
		links.forEach(function(link){
			if(!isLinkInvalid(link)){
				if(!link.attr('./display')){
					link.attr('./display', 'none');
					graph.links.push(link);
				}
			}else{link.remove();}
		});
	}else if (mode == "Constraints"){
		console.log("called in saved links constraints");
		var links = graph.getLinks();
		graph.intensionConstraints = [];
		links.forEach(function(link){
			var linkStatus = link.attributes.labels[0].attrs.text.text.replace(/\s/g, '');

			if(!isLinkInvalid(link) && (linkStatus != "constraint") && (linkStatus != "error")){
				console.log(linkStatus);
				console.log(isLinkInvalid(link));
				console.log(link.attr('./display'));
				//if(!link.attr('./display')){
				//	link.attr('./display', 'none');
				console.log(link);
				graph.intensionConstraints.push(link);
				//}
			}else{link.remove();}
		});
	}
}


// ----------------------------------------------------------------- //
// Analysis and modelling mode control

//Switch to analysis mode
$('#analysis-btn').on('click', function(){

	console.log(linkMode);
	/* Comment these for now.
	if (linkMode == "View")
		//$('#symbolic-btn').trigger( "click" );
		//setLinks(linkMode);
		testMe();*/
		//saveLinks(linkMode);

	//Adjust left and right panels
	elementInspector.clear();
	linkInspector.clear();
	constrainsInspector.clear();
	analysisInspector.render(analysisFunctions);

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
})

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

	$('#modeText').text("Modelling " + linkMode);
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

var analysisFunctions = {};
analysisFunctions.conductAnalysis = function(type, stepVal, epochVal, queryValA, queryValB){
	if(type == "btn-forward-analysis"){
		toBackEnd("2", stepVal, epochVal, queryValA, queryValB);
	}else if(type == "btn-rnd-sim"){
		toBackEnd("7", stepVal, epochVal, queryValA, queryValB);
	}else if(type == "btn-simulate"){
		toBackEnd("6", stepVal, epochVal, queryValA, queryValB);
	}else if(type == "btn-csp"){
		toBackEnd("11", stepVal, epochVal, queryValA, queryValB);
	}else if(type == "btn-csp-history"){
		toBackEnd("12", stepVal, epochVal, queryValA, queryValB);
	}
}

analysisFunctions.loadAnalysisFile = function(){
	var all_elements = graph.getElements();

	//Filter out Actors
	var elements = [];
	for (var e = 0; e < all_elements.length; e++){
		if (!(all_elements[e] instanceof joint.shapes.basic.Actor))
			elements.push(all_elements[e]);
	}

	//save elements in global variable for slider
	graph.allElements = elements;
	$('#loader').click();
}

analysisFunctions.concatenateSlider = function(){
	var newTime = 0;
	for (i = 0; i < historyObject.allHistory.length; i++){
		if (historyObject.allHistory[i].analysisLength){
			newTime = newTime + historyObject.allHistory[i].analysisLength;
		}else{
			newTime = newTime + historyObject.allHistory[i].analysis.timeScale
		}
	}
	var newElements = [];
	for (i = 0; i < graph.allElements.length; i++){
		var elementResults = [];
		for (j = 0; j < historyObject.allHistory.length; j++){
			var analysisObj = historyObject.allHistory[j].analysis;
			var subResults = analysisObj.elements[i].slice(0, historyObject.allHistory[j].analysisLength);
			elementResults = elementResults.concat(subResults);
		}
		newElements.push(elementResults);
	}

	clearHistoryLog();

	currentAnalysis = new analysisObject.initFromMain(newElements, graph.allElements.length, newTime);
	updateSlider(currentAnalysis, false);
}

analysisFunctions.loadQueryObject = function(){
	return [queryObject.cellA, queryObject.cellB]
}

analysisFunctions.clearQueryObject = function(){
	queryObject.clearCells();
}

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

//function loadAnalysis(analysisResults, analysisType, queryNum){
//	var type;
//	if (analysisType == "2"){
//		type = "Forward";
//  }else if (analysisType == "3"){
//		type = "Backward";
//	}else if (analysisType == "6"){
//		type = "Leaf Sim";
//	}else if (analysisType == "7"){
//		type = "Stochastic";
//	}else if (analysisType == "11"){
//		type = "CSP";
//  }else if (analysisType == "12"){
//		type = "CSP History";
//	}else if (analysisType == null){
//		type = "Unknown";
//	}
//
//	if(queryNum == 1){
//		type += " A<B";
//	}else if (queryNum == 2){
//		type += " B<A";
//	}else if (queryNum == 3){
//		type += " A=B";
//	}
//
//	currentAnalysis = new analysisObject.initFromBackEnd(analysisResults, type)
//	updateSlider(currentAnalysis, false);
//}


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

//Update the satisfaction value of a particular node in the graph
function updateValues(c, v, m){
	var cell;
	var value;

	//Update node based on values from cgi file
	if (m == "renderAnalysis"){
		//var satvalues = ["denied", "partiallydenied", "partiallysatisfied", "satisfied", "unknown", "none"];
		cell = graph.allElements[c];
		value = v;
		cell.attributes.attrs[".satvalue"].value = v;
		//cell.attr(".satvalue/value", v);

	//Update node based on values saved from graph prior to analysis
	}else if (m == "toInitModel"){
		cell = graph.allElements[c];
		value = cell.attributes.attrs[".satvalue"].value;
	}

	//Update images for properties
	// Navie: Changed satvalue from path to text
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

//	//Update images for properties
//	// Navie: Changed satvalue from path to text
//	if (value == "satisfied"){
//	  // cell.attr({ '.satvalue': {'d': 'M 0 10 L 5 20 L 20 0 L 5 20 L 0 10', 'stroke': '#00FF00', 'stroke-width':4}});
//	  cell.attr(".satvalue/text", "(FS, T)");
//	}else if(value == "partiallysatisfied") {
//	  // cell.attr({ '.satvalue': {'d': 'M 0 8 L 5 18 L 20 0 L 5 18 L 0 8 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#00FF00', 'stroke-width':3, 'fill': 'transparent'}});
//	  cell.attr(".satvalue/text", "(PS, T)");
//	}else if (value == "denied"){
//	  // cell.attr({ '.satvalue': {'d': 'M 0 20 L 20 0 M 10 10 L 0 0 L 20 20', 'stroke': '#FF0000', 'stroke-width': 4}});
//	  cell.attr(".satvalue/text", "(T, FD)");
//	}else if (value == "partiallydenied") {
//	  // cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
//	  cell.attr(".satvalue/text", "(T, PD)");
//	}else if (value == "unknown") {
//	  // cell.attr({ '.satvalue': {'d': 'M15.255,0c5.424,0,10.764,2.498,10.764,8.473c0,5.51-6.314,7.629-7.67,9.62c-1.018,1.481-0.678,3.562-3.475,3.562\
//	      // c-1.822,0-2.712-1.482-2.712-2.838c0-5.046,7.414-6.188,7.414-10.343c0-2.287-1.522-3.643-4.066-3.643\
//	      // c-5.424,0-3.306,5.592-7.414,5.592c-1.483,0-2.756-0.89-2.756-2.584C5.339,3.683,10.084,0,15.255,0z M15.044,24.406\
//	      // c1.904,0,3.475,1.566,3.475,3.476c0,1.91-1.568,3.476-3.475,3.476c-1.907,0-3.476-1.564-3.476-3.476\
//	      // C11.568,25.973,13.137,24.406,15.044,24.406z', 'stroke': '#222222', 'stroke-width': 1}});
//	      cell.attr(".satvalue/text", "?");
//	}else {
//	  cell.removeAttr(".satvalue/d");
//	}
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

			cell.attr({
				'.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
				'.marker-source': {'d': '0'},
				'.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
			});
			cell.prop("linktype", "actorlink");

			// Unable to model constraints for actors
			if(linkMode == "View"){
				cell.label(0, {attrs: {text: {text: "is-a"}}});
			}else if(linkMode == "Constraints"){
				cell.label(0, {attrs: {text: {text: "error"}}});
			}
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
	if (linkMode == "View"){
		linkInspector.render(cell);
	}else if (linkMode == "Constraints"){
		constrainsInspector.render(cell);
	}
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

$('#btn-zoom-in').on('click', function() {
	paperScroller.zoom(0.2, { max: 3 });
});
$('#btn-zoom-out').on('click', function() {
	paperScroller.zoom(-0.2, { min: 0.2 });
});

$('#btn-save').on('click', function() {
	// Always initalize files on modelling links for code simplicity
	if (linkMode == "Constraints")
		$('#symbolic-btn').trigger( "click" );

	var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
	if (name){
		var fileName = name + ".json";
		download(fileName, JSON.stringify(graph.toJSON()));
	}
});

//Workaround for load, activates a hidden input element
$('#btn-load').on('click', function(){
	if (linkMode == "Constraints")
		$('#symbolic-btn').trigger( "click" );
	$('#loader').click();
});

//Universally increase or decrease font size
$('#btn-fnt-up').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".name/font-size") < max_font){
			elements[i].attr(".name/font-size", elements[i].attr(".name/font-size") + 1);
		}
	}
});

$('#btn-fnt-down').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".name/font-size") > min_font){
			elements[i].attr(".name/font-size", elements[i].attr(".name/font-size") - 1);
		}
	}
});

//Default font size
$('#btn-fnt').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		elements[i].attr(".name/font-size", 10);
	}
});

//Save in .leaf format
$('#btn-save-leaf').on('click', saveLeaf);

//Simulator
loader = document.getElementById("loader");
reader = new FileReader();

//Whenever the input is changed, read the file.
loader.onchange = function(){
	reader.readAsText(loader.files.item(0));
};

//When read is performed, if successful, load that file.
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
			loadAnalysis(analysisResults, null, -1);
		}
	}
};


// ----------------------------------------------------------------- //
// Leaf file generation

// Sends current graph to backend for analysis
function toBackEnd(simulationType, stepVal, epochVal, queryValA, queryValB){
	var leafLines = simulationType + "\t" + stepVal + "\t" + epochVal + "\n";
	leafLines += generateLeafFile();

  var queryLines = []
	if(queryValA && queryValB){
		var cellA = queryObject.cellA.model.attributes.elementid;
		var cellB = queryObject.cellB.model.attributes.elementid;
		var l1 = "Q\t" + cellA + "\t" + queryValA + "\t<\t" + cellB + "\t" + queryValB + "\n";
		var l2 = "Q\t" + cellB + "\t" + queryValB + "\t<\t" + cellA + "\t" + queryValA + "\n";
		var l3 = "Q\t" + cellA + "\t" + queryValA + "\t=\t" + cellB + "\t" + queryValB + "\n";
		queryLines = [l1, l2, l3];
	}

  var cspHistoryLines = "";
	if (simulationType == "12"){
    var cspHistoryLines = "H\t1\t" + currentAnalysis.numOfElements + "\t" + currentAnalysis.timeScale + "\n";
    for (i = 0; i < currentAnalysis.elements.length; i++){
      for(j = 0; j < currentAnalysis.elements[i].length; j++)
        cspHistoryLines += currentAnalysis.elements[i][j] + "\t";
      cspHistoryLines += "\n";
    }
  }

  var queryNum
  (queryLines.length == 0) ? queryNum = -1 : queryNum = 0
  postData(simulationType, leafLines, queryLines, cspHistoryLines, queryNum)
}

function postData(simulationType, leafLines, queryLines, cspHistoryLines, queryNum){
	console.log("simulationType");
	console.log(simulationType);
	console.log("leafLines");
	console.log(leafLines);
	console.log("queryLines");
	console.log(queryLines);
	console.log("cspHistoryLines");
	console.log(cspHistoryLines);
	console.log("queryNum");
	console.log(queryNum);

	var data = {};
	if(queryNum == -1){
		data.toUpload = leafLines + cspHistoryLines;
		data.simgraph = JSON.stringify(graph.toJSON());
  }else{
		data.toUpload = leafLines + queryLines[queryNum] + cspHistoryLines;
		data.simgraph = JSON.stringify(graph.toJSON());
		queryNum++;
  }
  console.log('data');
  console.log(data);
	//Send data to backend for analysis
	$.post("./cgi-bin/handleupload2.cgi", data, function(results, status){
		if(status == "success"){
			analysisResults = results.split("\n");
			if (isNaN(parseInt(analysisResults[0]))){
				alert("Sorry Dave, We could not process your model")
				return
			}
			loadAnalysis(analysisResults, simulationType, queryNum);

			var currentValueLimit = parseInt(sliderObject.sliderElement.noUiSlider.get());
			var sliderMax = currentValueLimit + currentAnalysis.timeScale;
			sliderObject.sliderElement.noUiSlider.set(sliderMax);

			if ((queryNum != -1) && (queryNum < queryLines.length))
				postData(simulationType, leafLines, queryLines, cspHistoryLines, queryNum)
		}else{
			alert("Sorry Dave, We could not process your model")
		}
	});
}

//Save in a .leaf format
function saveLeaf(){
	var datastring = generateLeafFile();
	var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.leaf will be added as the file extension.", "<file name>");
	if (name){
		var fileName = name + ".leaf";
		download(fileName, datastring);
	}
}

//Helper function to download saved graph in JSON format
function download(filename, text) {
	var dl = document.createElement('a');
	dl.setAttribute('href', 'data:application/force-download;charset=utf-8,' + encodeURIComponent(text));
	dl.setAttribute('download', filename);

	dl.style.display = 'none';
	document.body.appendChild(dl);

	dl.click();
	document.body.removeChild(dl);
}


// Generates file needed for backend analysis
function generateLeafFile(){

	//Step 0: Get elements from graph.
	var all_elements = graph.getElements();
	var savedLinks = [];
	var savedConstraints = [];

	if (linkMode == "View"){
		savedConstraints = graph.intensionConstraints;
		var links = graph.getLinks();
	    links.forEach(function(link){
	        if(!isLinkInvalid(link)){
				if (link.attr('./display') != "none")
	        		savedLinks.push(link);
	        }
	        else{link.remove();}
	    });
	}else if (linkMode == "Constraints"){
		savedLinks = graph.links;
		var betweenIntensionConstraints = graph.getLinks();
	    betweenIntensionConstraints.forEach(function(link){
			var linkStatus = link.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
	        if(!isLinkInvalid(link) && (linkStatus != "constraint") && (linkStatus != "error")){
				if (link.attr('./display') != "none")
					savedConstraints.push(link);
	        }
	        else{link.remove();}
	    });
	}

	//Step 1: Filter out Actors
	var elements = [];
	var actors = [];
	for (var e1 = 0; e1 < all_elements.length; e1++){
		if (!(all_elements[e1] instanceof joint.shapes.basic.Actor)){
			elements.push(all_elements[e1]);
		}
		else{
			actors.push(all_elements[e1]);
		}
	}

	//save elements in global variable for slider, used for toBackEnd funciton only
	graph.allElements = elements;
	graph.elementsBeforeAnalysis = elements;

	var datastring = actors.length + "\n";
	//print each actor in the model
	for (var a = 0; a < actors.length; a++){
		var actorId = a.toString();
		while (actorId.length < 3){ actorId = "0" + actorId;}
		actorId = "a" + actorId;
		actors[a].prop("elementid", actorId);
		datastring += ("A\t" + actorId + "\t" + actors[a].attr(".name/text") + "\t" + (actors[a].prop("actortype") || "A") + "\n");
	}


	// Step 2: Print each element in the model

	// conversion between values used in Element Inspector with values used in backend
	var satValueDict = {
		"unknown": 5,
		"satisfied": 3,
		"partiallysatisfied": 2,
		"partiallydenied": 1,
		"denied": 0,
		"conflict": 4,
		"none": 6
	}
	datastring += elements.length + "\n";
	for (var e = 0; e < elements.length; e++){
		//var id = e.toString();
		//while (id.length < 4){ id = "0" + id;}
		//elements[e].prop("elementid", id);
		var elementID = e.toString();
		while (elementID.length < 4){ elementID = "0" + elementID;}
		elements[e].prop("elementid", elementID);

		var actorid = '-';
		if (elements[e].get("parent")){
			actorid = (graph.getCell(elements[e].get("parent")).prop("elementid") || "-");
		}
		console.log(actorid);

	// Print NT in "core" of tool where time does not exist.
	//datastring += ("I\t" + actorid + "\t" + elementID + "\t" + (functions[elements[e].attr(".funcvalue/text")] || "NT") + "\t");

	  datastring += ("I\t" + actorid + "\t" + elementID + "\t");
		if (elements[e] instanceof joint.shapes.basic.Goal)
		  	datastring += "G\t";
		else if (elements[e] instanceof joint.shapes.basic.Task)
		  	datastring += "T\t";
		else if (elements[e] instanceof joint.shapes.basic.Softgoal)
		  	datastring += "S\t";
		else if (elements[e] instanceof joint.shapes.basic.Resource)
		  	datastring += "R\t";
		else
	  		datastring += "I\t";

	  	var v = elements[e].attr(".satvalue/value")

	  	// treat satvalue as unknown if it is not yet defined
	  	if((!v) || (v == "none"))
			v = "none";

		datastring += satValueDict[v];
		datastring += "\t" + elements[e].attr(".name/text").replace(/\n/g, " ") + "\n";
	}


	//Step 3: Print each link in the model
	for (var l = 0; l < savedLinks.length; l++){
		var current = savedLinks[l];
		var relationship = current.label(0).attrs.text.text.toUpperCase()
		var source = "-";
		var target = "-";

		if (current.get("source").id)
			source = graph.getCell(current.get("source").id).prop("elementid");
		if (current.get("target").id)
			target = graph.getCell(current.get("target").id).prop("elementid");

		if (relationship.indexOf("|") > -1){
			evolvRelationships = relationship.replace(/\s/g, '').split("|");
			datastring += 'L\t' + evolvRelationships[0] + '\t' + source + '\t' + target + '\t' + evolvRelationships[1] + "\n";
		}else{
			datastring += 'L\t' + relationship + '\t' + source + '\t' + target + "\n";
		}
	}

	//Step 4: Print the dynamics of the intentions.
	for (var e = 0; e < elements.length; e++){
	    var elementID = e.toString();
	    while (elementID.length < 4){ elementID = "0" + elementID;}
	    elements[e].prop("elementid", elementID);

	    //datastring += ("I\t" + actorid + "\t" + elementID + "\t" + (functions[elements[e].attr(".funcvalue/text")] || "NT") + "\t");
	    var f = elements[e].attr(".funcvalue/text");
	    var funcType = elements[e].attr(".constraints/function");
	    var funcTypeVal = elements[e].attr(".constraints/lastval");
	    if  (f == " "){
	    	datastring += ("D\t" + elementID + "\tNT\n");
	    }else if (f != "UD"){
	    	datastring += ("D\t" + elementID + "\t" + f + "\t" + satValueDict[funcTypeVal] + "\n");

	    // user defined constraints
	    }else{
			var begin = elements[e].attr(".constraints/beginLetter");
			var end = elements[e].attr(".constraints/endLetter");
			var rBegin = elements[e].attr(".constraints/beginRepeat");
			var rEnd = elements[e].attr(".constraints/endRepeat");
			datastring += "D\t" + elementID + "\t" + f + "\t" + String(funcTypeVal.length);

			for (var l = 0; l < funcTypeVal.length; l++){
				if(l == funcTypeVal.length - 1){
					datastring += "\t" + begin[l] + "\t1\t" + funcType[l] + "\t" + satValueDict[funcTypeVal[l]];
				}else{
					datastring += "\t" + begin[l] + "\t" + end[l] + "\t" + funcType[l] + "\t" + satValueDict[funcTypeVal[l]];
				}
			}

			// repeating
			if (elements[e].attr(".constraints/beginRepeat") && elements[e].attr(".constraints/endRepeat")){
				// to infinity
				if (rEnd == end[end.length - 1]){
					datastring += "\tR\t" + rBegin + "\t1";
				}else{
					datastring += "\tR\t" + rBegin + "\t" + rEnd;
				}
			}else{
				datastring += "\tN";
			}
				datastring += "\n";
			}
	}

	//Step 5: Print constraints between intensions.
	for (var e = 0; e < savedConstraints.length; e++){
		var c = savedConstraints[e];
		var type = c.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
		var source = c.getSourceElement().attributes.elementid;
		var target = c.getTargetElement().attributes.elementid;
		var sourceVar = c.attr('.constraintvar/src');
		var targetVar = c.attr('.constraintvar/tar');

		datastring += ("C\t" + type + "\t" + source + "\t" + sourceVar + "\t" + target + "\t" + targetVar + "\n");
	}

	//console.log(datastring);
	return datastring
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
