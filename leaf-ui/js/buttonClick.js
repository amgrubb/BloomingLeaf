
/**
 * Switch to Analysis view iff there are no cycles and no syntaxErrors.
 */
$('#analysis-btn').on('click', function() {
    var jsLinks;
    var cycle;
   	jsLinks = getLinks();
   	cycle = cycleCheck(jsLinks, getElementList());
	
	syntaxCheck();

    // If there are no cycles then switch view to Analysis
    if (!cycle) {
		switchToAnalysisMode(); 
    }
    // If there are cycles, then display error message. Otherwise, remove any "red" elements.
    cycleCheckForLinks(cycle);

});


/**
 *  Helper function for switching to Analysis view.
 */
function switchToAnalysisMode(){
	// Adjust left and right panels
	elementInspector.clear();
	linkInspector.clear();
	constraintsInspector.clear();
	analysisInspector.render();

	$('.inspector').append(analysisInspector.el);
	$('#stencil').css("display", "none");
	$('#history').css("display", "");

	$('#analysis-btn').css("display", "none");
	$('#symbolic-btn').css("display", "none");
	$('#cycledetect-btn').css("display", "none");
	$('#dropdown-model').css("display", "");

	$('#model-toolbar').css("display", "none");

	$('#modeText').text("Analysis");

	// Disable link settings
	$('.link-tools .tool-remove').css("display", "none");
	$('.link-tools .tool-options').css("display", "none");

	if (currentHalo) {
		currentHalo.remove();
	}
	
	mode = "Analysis";

}

// Switch to modeling mode
$('#model-cur-btn').on('click', function(){
	switchToModellingMode();
	// Cleaning the previous analysis data for new execution
	global_analysisResult.elementList = "";
	savedAnalysisData.finalAssigneEpoch="";
	savedAnalysisData.finalValueTimePoints="";
});


/**
 * Switch back to Modelling Mode from Analysis Mode
 * Reset the Nodes' satValues to the values prior to analysis
 * Display the modeling mode page
 *
 */
function switchToModellingMode(){
	// Reset to initial graph prior to analysis
	for (var i = 0; i < graph.elementsBeforeAnalysis.length; i++){
		var value = graph.elementsBeforeAnalysis[i]
		updateNodeValues(i, value, "toInitModel");
	}

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

	// Reinstantiate link settings
	$('.link-tools .tool-remove').css("display","");
	$('.link-tools .tool-options').css("display","");

	graph.allElements = null;

	// Clear previous slider setup
	clearHistoryLog();

	queryObject.clearCells();

	mode = "Modelling";
}



/**
 * Set up tool bar functions
 *  
 */
$('#btn-undo').on('click', _.bind(commandManager.undo, commandManager));
$('#btn-redo').on('click', _.bind(commandManager.redo, commandManager));
$('#btn-clear-all').on('click', function(){
	graph.clear();
	// Delete cookie by setting expiry to past date
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
