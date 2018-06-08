
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

/**
 * Rappid setup
 * 
 */
var element_counter = 0;
var max_font = 20;
var min_font = 6;
var current_font = 10;

// Whenever an element is added to the graph
graph.on("add", function(cell){
	if (cell instanceof joint.dia.Link){
		if (graph.getCell(cell.get("source").id) instanceof joint.shapes.basic.Actor){
			cell.prop("linktype", "actorlink");
		cell.label(0,{attrs:{text:{text:"is-a"}}});

		}
	} // Don't do anything for links
	// Give element a unique default
	cell.attr(".name/text", cell.attr(".name/text") + "_" + element_counter);
	element_counter++;

	// Add Functions and sat values to added types
	if (cell instanceof joint.shapes.basic.Intention){
		cell.attr('.funcvalue/text', ' ');
	}

	// Send actors to background so elements are placed on top
	if (cell instanceof joint.shapes.basic.Actor){
		cell.toBack();
	}

	paper.trigger("cell:pointerup", cell.findView(paper));
});

// Auto-save the cookie whenever the graph is changed.
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

	// Unembed cell so you can move it out of actor
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

// Link equivalent of the element editor
paper.on("link:options", function(evt, cell){
	if(mode == "Analysis")
		return

	linkInspector.clear();
	constraintsInspector.clear();
	elementInspector.clear();
	linkInspector.render(cell);

});

/**
 * Check the relationship in the link. If the relationship is between
 * an Actor and anything other than an Actor then display the label as
 * "error". Otherwise, display it as "is-a" and prop "is-a" in the link-type
 * dropdown menu.
 *
 * @param {joint.dia.Link} link
 */
function basicActorLink(link){
    if (link.getSourceElement() != null) {
        var sourceCell = link.getSourceElement().attributes.type;

    }
    // Check if link is valid or not
    if (link.getTargetElement()) {
        var targetCell = link.getTargetElement().attributes.type;

        // Links of actors must be paired with other actors
        if (((sourceCell == "basic.Actor") && (targetCell != "basic.Actor")) ||
            ((sourceCell != "basic.Actor") && (targetCell == "basic.Actor"))) {
            link.label(0, {position: 0.5, attrs: {text: {text: 'error'}}});
        } else if ((sourceCell == "basic.Actor") && (targetCell == "basic.Actor")) {
            if (!link.prop("link-type")) {
                link.label(0 ,{position: 0.5, attrs: {text: {text: 'is-a'}}});
                link.prop("link-type", "is-a");
            } else {
                link.label(0, {position: 0.5, attrs: {text: {text: link.prop("link-type")}}});
            }
        }
    }
}

/**
 * Create a halo around the element that was just created
 *
 * @param {joint.shapes} cellView
 * @returns {joint.ui.Halo} halo
 */
function createHalo(cellView){
	var halo = new joint.ui.Halo({
        graph: graph,
        paper: paper,
        cellView: cellView,
        type: 'toolbar'
    });

    halo.removeHandle('unlink');
    halo.removeHandle('clone');
    halo.removeHandle('fork');
    halo.removeHandle('rotate');
    halo.render();
    return halo;
}

/**
 * Remove the highlight around all elements
 *
 * @param  {Array.<joint.dia.shapes>} elements
 */
function removeHighlight(elements){
	var cell;
    // Unhighlight everything
    for (var i = 0; i < elements.length; i++) {
        cell = elements[i].findView(paper);
        cell.unhighlight();
    }
}

/**
 * Function for single click on cell
 * 
 */
paper.on('cell:pointerup', function(cellView, evt) {
	if(mode == "Modelling") {
		// Link
        if (cellView.model instanceof joint.dia.Link) {
            var link = cellView.model;
            basicActorLink(link);
            // Element is selected
			return
        }
		selection.reset();
		selection.add(cellView.model);
		var cell = cellView.model;
		var elements = graph.getElements();
		// Remove highlight of other elements
		removeHighlight(elements);

		// Highlight when cell is clicked
		cellView.highlight();

		currentHalo = createHalo(cellView);

		embedBasicActor(cellView, cell);
    }
});

/**
 * Embed an element into an actor boundary
 * 
 */
function embedBasicActor(cellView, cell){
	// Embed an element into an actor boundary, if necessary
	if (!(cellView.model instanceof joint.shapes.basic.Actor)) {
		var ActorsBelow = paper.findViewsFromPoint(cell.getBBox().center());

		if (ActorsBelow.length) {
			for (var a = 0; a < ActorsBelow.length; a++) {
				if (ActorsBelow[a].model instanceof joint.shapes.basic.Actor) {
					ActorsBelow[a].model.embed(cell);
				}
			}
		}
	}

	linkInspector.clear();
	constraintsInspector.clear();
	elementInspector.render(cellView);
	
}


graph.on('change:size', function(cell, size){
	cell.attr(".label/cx", 0.25 * size.width);

	// Calculate point on actor boundary for label (to always remain on boundary)
	var b = size.height;
	var c = -(size.height/2 + (size.height/2) * (size.height/2) * (1 - (-0.75 * size.width/2) * (-0.75 * size.width/2)  / ((size.width/2) * (size.width/2)) ));
	var y_cord = (-b + Math.sqrt(b*b - 4*c)) / 2;

	cell.attr(".label/cy", y_cord);
});


graph.on('remove', function(cell, collection, opt) {
	if (cell.isLink() && (cell.prop("link-type") == 'NBT' || cell.prop("link-type") == 'NBD')) {

		// Verify if is a Not both type. If it is remove labels from source and target node
		var link = cell;
		var source = link.prop("source");
		var target = link.prop("target");

	    for (var i = 0; i < graph.getElements().length; i++ ) {
			if (graph.getElements()[i].prop("id") == source["id"]) {
				source = graph.getElements()[i];
		   	}
		  	if (graph.getElements()[i].prop("id") == target["id"]) {
			   target = graph.getElements()[i];
		   	}
	   	}

		// Verify if it is possible to remove the NB tag from source and target
		if (!checkForMultipleNB(source)) {
			source.attr(".funcvalue/text", "");
		}
		if (!checkForMultipleNB(target)) {
			target.attr(".funcvalue/text", "");
		}
	}
});


/**
 * Returns true iff node has 1 or more NBT or NBD relationship
 *
 * @param {joint.dia.element} node
 * @returns {Boolean}
 */
function checkForMultipleNB(node) {
	var num = 0;
	var localLinks = graph.getLinks();

	for (var i = 0; i < localLinks.length; i++){
        if (localLinks[i].prop("link-type") == 'NBT' || localLinks[i].prop("link-type") == 'NBD'){
            if (localLinks[i].getSourceElement().prop("id") == node["id"] || localLinks[i].getTargetElement().prop("id") == node["id"]){
                num += 1;            
            }
        }
	}

	return num >= 1;
}

