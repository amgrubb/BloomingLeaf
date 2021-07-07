/*
This file contains all the jQuery functions that are associated with buttons and elements.
It also contains the setup for Rappid elements.
*/

/**
 * Event listeners for index.html toolbar functions
 */
 $('#btn-debug').on('click', function(){ console.log(graph.toJSON()) });
 $('#btn-zoom-in').on('click', function(){ zoomIn(paperScroller); });
 $('#btn-zoom-out').on('click', function(){ zoomOut(paperScroller); });
 $('#btn-fnt').on('click', function(){ defaultFont(paper);});
 $('#btn-fnt-up').on('click', function(){  fontUp(paper);});
 $('#btn-fnt-down').on('click', function(){ fontDown(paper);}); 
 $('#legend').on('click', function(){ window.open('./userguides/legend.html', 'newwindow', 'width=300, height=250'); return false;});
 $('#evo-color-key').on('click', function(){ window.open('./userguides/evo.html', 'newwindow', 'width=500, height=400'); return false;});
 $('#simulate-single-path-btn').on('click', function() { backendComm(); }); 
 $('#next-state-btn').on('click', function() { getAllNextStates(); }); 


/**
 * Displays the absolute and relative assignments modal for the user.
 */
$('#btn-view-assignment').on('click', function() {
    var assignmentsModal = new AssignmentsTable({model: graph});
    $('#assignments-list').append(assignmentsModal.el);
    assignmentsModal.render();
});

$('#btn-view-intermediate').on('click', function() {
    var intermediateValuesTable = new IntermediateValuesTable({model: graph});
	$('#intermediate-table').append(intermediateValuesTable.el);
	intermediateValuesTable.render();
});

/**
 * Switches to Analysis view iff there are no cycles and no syntax errors.
 */
$('#analysis-btn').on('click', function() {
    //TODO: Add back in cycle detection after backbone migration.
    switchToAnalysisMode();
});

/** For Load Sample Model button */

/** 
$('#load-sample').on('click', function() {

    $.getJSON('http://www.cs.toronto.edu/~amgrubb/archive/REJ-Supplement/S1Frag.json', function(myData){		
        var response = JSON.stringify(myData);
        var newModel = new Blob([response], {type : 'application/json'});
        reader.readAsText(newModel);  	
    });
});
*/

/**
 * Reassigned IDs if required.
 * If there are currently n intentions, and the nodeIDs of the intentions
 * are not exactly between 0000 and n - 1 inclusive, this function reassigns IDs 
 * so that the nodeIDs are all exactly between 0000 and n - 1 inclusive.
 *
 * For example: 
 * There are 2 intentions. The first intention has nodeID 0000 and the
 * second intention has nodeID 0002. This function will cause the 
 * the first intention to keep nodeID 0000 and the 
 * second intention to be assigned assigned nodeID 0001.
 */
function reassignIntentionIDs() {
	var elements = graph.getElements();
	var intentions = model.intentions;
 	var currID = 0;
	var currIDStr;
	for (var i = 0; i < intentions.length; i++) {
		var intention = intentions[i];
 		if (parseInt(intention.nodeID) !== currID) {
 			// The current intention's ID must be reassigned
			// Find the intention's cell
			var cell;
			for (var j = 0; j < elements.length; j++) {
				if (elements[j].attributes.nodeID === intention.nodeID) {
					cell = elements[j];
				}
            }

 			currIDStr = currID.toString();
 			while (currIDStr.length < 4){
	                currIDStr = '0' + currIDStr;
	        }
			cell.attributes.nodeID = currIDStr;
			intention.setNewID(currIDStr);
		}
 		currID += 1;
	}
 	Intention.numOfCreatedInstances = currID;
	Link.numOfCreatedInstances = currID;
}


/**
 * Helper function for switching to Analysis view.
 */
function switchToAnalysisMode() {
    setInteraction(false);
	reassignIntentionIDs();

	// Clear the right panel
	clearInspector();
	
	removeHighlight();
    
    $('#configID').append(configInspector.el);
    configInspector.render();

    // Disappear
    $('#stencil').css("display", "none");
    $('#btn-view-intermediate').css("display","none");
    $('#btn-view-assignment').css("display","none"); 
    $('#analysis-btn').css("display", "none");
	$('#symbolic-btn').css("display", "none");
	$('#cycledetect-btn').css("display", "none");
    $('#model-toolbar').css("display", "none");
    $('.model-clears').css("display", "none");
    $('#on-off').css("display", "none");

    // Disable link settings
	$('.link-tools .tool-remove').css("display", "none");
    $('.link-tools .tool-options').css("display", "none");
    
    // Appear 
    $('#dropdown-model').css("display", "");
    $('#simulate-single-path-btn').css("display", "");
    $('#next-state-btn').css("display", "");
    $('#configID').css("display", ""); 
    $('#on-off').css("display", "");

    // Hide extra tools from modelling mode
    $('.analysis-clears').css("display", "");

    // Show Analysis View tag
	$('#modeText').text("Analysis View");

	if (currentHalo) {
		currentHalo.remove();
	}
    mode = "Analysis";
    
    IntentionColoring.refresh();
}

// Switches to modeling mode
$('#model-cur-btn').on('click', function() {
	switchToModellingMode();

	// Cleaning the previous analysis data for new execution
	//globalAnalysisResult.elementList = "";
	savedAnalysisData.finalAssignedEpoch="";
    savedAnalysisData.finalValueTimePoints="";
    
    analysisRequest.action = null;

});


/**
 * Sets each node/cellview in the paper to its initial 
 * satisfaction value and colours all text to black
 */
function revertNodeValuesToInitial() {
    //reset values
    for (var i = 0; i < graph.elementsBeforeAnalysis.length; i++) {
		var value = graph.elementsBeforeAnalysis[i]
		updateNodeValues(i, value, "toInitModel");
	}

	var elements = graph.getElements();
	var curr;
	for (var i = 0; i < elements.length; i++) {
		curr = elements[i].findView(paper).model;

		if (curr.attributes.type !== 'basic.Goal' &&
			curr.attributes.type !== 'basic.Task' &&
			curr.attributes.type !== 'basic.Softgoal' &&
			curr.attributes.type !== 'basic.Resource') {
			continue;
		}     
		var intention = curr.get('intention');
        var initSatVal = intention.getUserEvaluationBBM(0).get('assignedEvidencePair'); 

		if (initSatVal === '(no value)') {
            curr.attr('.satvalue/text', '');

		} else {
            curr.attr('.satvalue/text', satisfactionValuesDict[initSatVal].satValue);
		}
        //curr.attr({text: {fill: 'black'}});
        curr.attr({text: {fill: 'black',stroke:'none','font-weight' : 'normal','font-size': 10}});
	}
    // Remove slider
    removeSlider();
}

/**
 * Switches back to Modelling Mode from Analysis Mode
 * and resets the Nodes' satValues to the values prior to analysis
 * Display the modeling mode page
 */
function switchToModellingMode() {
    setInteraction(true);
    analysisResult.isPathSim = false; //reset isPathSim for color visualization slider
	analysisRequest.previousAnalysis = null;
	
    clearInspector();
    
	// Reset to initial graph prior to analysis
	revertNodeValuesToInitial();

	graph.elementsBeforeAnalysis = [];

    // store deep copy of model for detecting model changes
    // switchToAnalysisMode compares the current model to previousModel
    // and clears results if model changed during modelling mode
    // previousModel is NOT of type Model
    previousModel = JSON.parse(JSON.stringify(model));
    

    // Disappear 
    $('#analysis-sidebar').css("display","none");
    $('#dropdown-model').css("display","none");
    $('#simulate-single-path-btn').css("display", "none");
    $('#configID').css("display", "none"); 
    $('#next-state-btn').css("display", "none");
    $('.analysis-clears').css("display", "none");
    
    // Appear 
    $('#stencil').css("display","");
    $('#btn-view-assignment').css("display","");
    $('#btn-view-intermediate').css("display","");
    $('#analysis-btn').css("display","");
	$('#symbolic-btn').css("display","");
	$('#cycledetect-btn').css("display","");

    // Show extra tools for modelling mode
    $('#model-toolbar').css("display","");
    $('.model-clears').css("display", "");

    analysisResult.colorVis = [];

    // Show Modelling View tag
    $('#modeText').text("Modeling View");

	// Reinstantiate link settings
	$('.link-tools .tool-remove').css("display","");
	$('.link-tools .tool-options').css("display","");

	graph.allElements = null;
    mode = "Modelling";
    EVO.switchToModelingMode();

    // Popup to warn user that changing model will clear results
    // From analysis configuration sidebar
    // Defaults to showing each time if user clicks out of box instead of selecting option
    if (showEditingWarning){
        const dialog = showAlert('Warning',
        '<p>Changing the model will clear all ' +
        'results from all configurations.</p><p>Do you wish to proceed?</p>' +
        '<p><button type="button" class="model-editing"' +
        ' id="repeat" style="width:100%">Yes' +
        '</button><button type="button" ' +
        'class="model-editing" id="singular" style="width:100%">Yes, please do not show this warning again ' +
        '</button> <button type="button" class="model-editing"' +
        ' id="decline" onclick="switchToAnalysisMode()" style="width:100%"> No, please return to analysis mode' +
        '</button></p>',
        window.innerWidth * 0.3, 'alert', 'warning');
        document.querySelectorAll('.model-editing').forEach(function(button){
            button.addEventListener('click', function(){dialog.close(); if(button.id == 'singular'){showEditingWarning = false;};});
        });
    }
}

/**
 * Source:https://www.w3schools.com/howto/howto_js_rangeslider.asp 
 * Two option modeling mode slider
 */
var sliderModeling = document.getElementById("colorReset");
//var sliderOption = sliderModeling.value;
sliderModeling.oninput = function() { //turns slider on/off and refreshes
  EVO.setSliderOption(this.value);
}
/**
 * Four option analysis mode slider
 */
var sliderAnalysis = document.getElementById("colorResetAnalysis");
sliderAnalysis.oninput = function() { //changes slider mode and refreshes
    EVO.setSliderOption(this.value);
}

/**
 * Set up tool bar button on click functions
 */
$('#btn-undo').on('click', _.bind(commandManager.undo, commandManager));
$('#btn-redo').on('click', _.bind(commandManager.redo, commandManager));
$('#btn-clear-all').on('click', function(){
    graph.clear();
    // reset to default analysisRequest
    model.removeAnalysis();
    // remove all configs from analysisMap
    analysisMap.clear();
	// Delete cookie by setting expiry to past date
	document.cookie='graph={}; expires=Thu, 18 Dec 2013 12:00:00 UTC';
});

$('#btn-clear-elabel').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
        var cellView = elements[i].findView(paper); 
        var cell = cellView.model;
        var intention = model.getIntentionByID(cellView.model.attributes.nodeID);

        if(intention != null && intention.getInitialSatValue() != '(no value)') {
            intention.removeInitialSatValue();
     
            cell.attr(".satvalue/text", "");
            cell.attr(".funcvalue/text", "");
     
            elementInspector.$('#init-sat-value').val('(no value)');
            elementInspector.$('.function-type').val('(no value)');
        }
    }
    IntentionColoring.refresh();
});

$('#btn-clear-flabel').on('click', function(){
    var elements = graph.getElements();
    
	for (var i = 0; i < elements.length; i++){
        var cellView = elements[i].findView(paper); 
        var cell = cellView.model;
        var intention = model.getIntentionByID(cellView.model.attributes.nodeID);

        if(intention != null) {
            intention.removeFunction();
            cell.attr(".funcvalue/text", "");
            elementInspector.$('.function-type').val('(no value)');
        }
	}
});

/**
 * This is an option under clear button to clear red-highlight from
 * cycle detection function
 */
$('#btn-clear-cycle').on('click',function(){
    clearCycleHighlighting();
});

$('#btn-clear-analysis').on('click', function() {
    // TODO: Re-Implement for backbone view
    
    // reset to default analysisRequest while preserving userAssignmentsList
    resetToDefault();
    // reset graph to initial values
    revertNodeValuesToInitial();
});

$('#btn-clear-results').on('click', function() {
    // TODO: Re-implement for backbone view
});

// Open as SVG
$('#btn-svg').on('click', function() {
	paper.openAsSVG();
});

// Save the current graph to json file
$('#btn-save').on('click', function() {
	var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
	if (name){
        clearCycleHighlighting();
        EVO.deactivate();
       // EVO.returnAllColors(graph.getElements(), paper);
       // EVO.revertIntentionsText(graph.getElements(), paper);    
		var fileName = name + ".json";
		var obj = getModelJson();
        download(fileName, JSON.stringify(obj));
        //IntentionColoring.refresh();
	}
});

// Save the current graph and analysis (without results) to json file
$('#btn-save-analysis').on('click', function() {
	var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
	if (name){
        clearCycleHighlighting();
        EVO.deactivate();   
		var fileName = name + ".json";
		var obj = getModelAnalysisJson();
        download(fileName, JSON.stringify(obj));
	}
});

// Save the current graph and analysis (with results) to json file
$('#btn-save-all').on('click', function() {
	var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
	if (name){
        clearCycleHighlighting();
        EVO.deactivate();   
		var fileName = name + ".json";
		var obj = getFullJson();
        download(fileName, JSON.stringify(obj));
	}
});

// Workaround for load, activates a hidden input element
$('#btn-load').on('click', function(){
	$('#loader').click();
});

$('#colorblind-mode-isOff').on('click', function(){ //activates colorblind mode
    $('#colorblind-mode-isOff').css("display", "none");
    $('#colorblind-mode-isOn').css("display", "");

    IntentionColoring.toggleColorBlindMode(true);
});

$('#colorblind-mode-isOn').on('click', function(){ //turns off colorblind mode
    $('#colorblind-mode-isOn').css("display", "none");
    $('#colorblind-mode-isOff').css("display", "");

    IntentionColoring.toggleColorBlindMode(false);
});

/**
 * Set up on events for Rappid/JointJS objets
 */
var element_counter = 0;

// Whenever an element is added to the graph
graph.on("add", function(cell) {
    // Find how many cells are created on the graph
    var createdInstance = paper.findViewsInArea(paper.getArea())  

	if (cell instanceof joint.dia.Link){
        if (graph.getCell(cell.get("source").id) instanceof joint.shapes.basic.Actor){
            cell.prop("type", "Actor");
            cell.label(0,{attrs:{text:{text:"is-a"}}});
            cell.set('link', new LinkBBM({linkType: 'is-a'}));
		} else{
            cell.prop("type", "element");
            cell.set('link', new LinkBBM({}));
        }
    } else if (cell instanceof joint.shapes.basic.Intention){
        // Creates an instance of a IntentionBBM from the cell
        var newIntentionBBM = new IntentionBBM({})
        cell.set('intention', newIntentionBBM);
        cell.attr('.satvalue/text', '');
        cell.attr('.funcvalue/text', ' ');
        // create intention evaluation object and add it to userEvaluationList 
        newIntentionBBM.get('userEvaluationList').push(new UserEvaluationBBM({}));
	} else if (cell instanceof joint.shapes.basic.Actor) {
        // Find how many instances of the actor is created out of all the cells
        createdInstance = createdInstance.filter(view => view.model instanceof joint.shapes.basic.Actor);

        // Create placeholder name based on the number of instances
		var name = cell.attr('.name/text') + "_" + (createdInstance.length-1);
	    cell.set('actor', new ActorBBM({actorName: name}));
        cell.attr(".name/text", name);

		// Send actors to background so elements are placed on top
		cell.toBack();
	}

    // trigger click on cell to highlight, activate inspector, etc. 
    paper.trigger("cell:pointerup", cell.findView(paper));
});

// Auto-save the cookie whenever the graph is changed.
graph.on("change", function(){
	var graphtext = graph.toJSON();
	document.cookie = "graph=" + graphtext;
});

var selection = new Backbone.Collection();

var selectionView = new joint.ui.SelectionView({
	paper: paper,
	graph: graph,
	model: selection
});

/**
 * Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
 * Otherwise, initiate paper pan.
 */
paper.on('blank:pointerdown', function(evt, x, y) {
	paperScroller.startPanning(evt, x, y);
});

/**
 * Specifies behavior for clicking on cells and moving intentions/links
 */
paper.on({
    'cell:pointerdown': function(cellView, evt) {
        var interact = true;
        if(mode == "Analysis"){
            interact = false;
        }

        // pass data to pointermove and pointerup
        evt.data = {move: false, interact: interact};
    },
    'cell:pointermove': function(cellView, evt) {
        if (!evt.data.move && evt.data.interact){
            // start of a click and drag
            evt.data.move = true;
        }
      },
    'cell:pointerup': function(cellView, evt) {
        // undefined event occurs due to paper.trigger("cell:pointerup"...
        // on adding new cell to paper
        if (evt == undefined) {
            // same highlighting, actor embedding, etc. behavior as dragging cell 
            evt = {data: {move: true, interact: true}};
        }
        
        // when interacting w/ cells on paper in modeling mode
        if (evt.data.interact) {
            var cell = cellView.model;
            if (cell instanceof joint.dia.Link) { // Link behavior
                if (evt.data.move){
                    // if link moved, reparent
                    cell.reparent();
                }
            } else { // Non-Link behavior

                // Element is selected
                selection.reset();
                selection.add(cell);

                // Remove highlight of other elements
                removeHighlight();

                // Highlight when cell is clicked
                cellView.highlight();

                currentHalo = createHalo(cellView);

                clearInspector();

                // Render actor/element inspector
                if (cell instanceof joint.shapes.basic.Actor) {
                    var actorInspector =  new ActorInspector({model:cell});
                    $('.inspector').append(actorInspector.el);
                    actorInspector.render();
                } else {
                    var elementInspector = new ElementInspector({model: cell});
                    $('.inspector').append(elementInspector.el);
                    elementInspector.render();
                    // If user was dragging element
                    if (evt.data.move) {
                        // Unembed intention from old actor
                        if (cell.get('parent')) {
                            graph.getCell(cell.get('parent')).unembed(cell);
                        }
                        // Embed element in new actor
                        var overlapCells = paper.findViewsFromPoint(cell.getBBox().center());

                        // Find actors which overlap with cell
                        overlapCells = overlapCells.filter(view => view.model instanceof joint.shapes.basic.Actor);
                        if (overlapCells.length > 0) {
                            var actorCell = overlapCells[0].model;
                            actorCell.embed(cell);
                        }
                    }
                }
            }
        }
    }
});

// Unhighlight everything when blank is being clicked
paper.on('blank:pointerclick', function(){
	removeHighlight();
});

// Link equivalent of the element editor
paper.on("link:options", function(cell, evt){
	if(mode == "Analysis") {
		return;
	}

	clearInspector();
    
    if (cell.model.get('type') == 'error'){
        alert('Sorry, this link is not valid. Links must be between two elements of the same type. Aka Actor->Actor or Intention->Intention');
        return;
    }

    var linkInspector = new LinkInspector({model: cell.model});
    $('.inspector').append(linkInspector.el);
	linkInspector.render();
 
});

/**
 * Create a halo around the element that was just created
 *
 * @param {joint.shapes} cellView
 * @returns {joint.ui.Halo} halo
 */
function createHalo(cellView){
	// var halo = new joint.ui.Halo({
 //        graph: graph,
 //        paper: paper,
 //        cellView: cellView,
 //    });

    var halo = new joint.ui.Halo({
    	type: 'toolbar',
    	boxContent: false,
        cellView: cellView
    });

    halo.removeHandle('unlink');
    halo.removeHandle('clone');
    halo.removeHandle('fork');
    halo.removeHandle('rotate');


    halo.on('action:resize:pointermove', function(cell) {
    	cellView.unhighlight();
		cellView.highlight();
    });

    halo.render();
    return halo;
}

/**
 * Remove the highlight around all elements
 *
 * @param  {Array.<joint.dia.shapes>} elements
 */
function removeHighlight(){
	var cell;
	var elements = graph.getElements();
    // Unhighlight everything
    for (var i = 0; i < elements.length; i++) {
        cell = elements[i].findView(paper);
        cell.unhighlight();
    }
}

graph.on('change:size', function(cell, size) {
	cell.attr(".label/cx", 0.25 * size.width);

	// Calculate point on actor boundary for label (to always remain on boundary)
	var b = size.height;
	var c = -(size.height/2 + (size.height/2) * (size.height/2) * (1 - (-0.75 * size.width/2) * (-0.75 * size.width/2)  / ((size.width/2) * (size.width/2)) ));
	var y_cord = (-b + Math.sqrt(b*b - 4*c)) / 2;

	cell.attr(".label/cy", y_cord);
});


graph.on('remove', function(cell) {
    //TODO: What I have changed
    if(cell.isLink() && !(cell.prop("link-type") == 'NBT' || cell.prop("link-type") == 'NBD')){
        // To remove link
        var link = cell;
        clearInspector();
        model.removeLink(link.linkID);
    }

    else if((!cell.isLink()) && (!(cell["attributes"]["type"]=="basic.Actor"))){
        // To remove intentions
        clearInspector();
        var userIntention = model.getIntentionByID(cell.attributes.nodeID);
        // remove this intention from the model
        model.removedynamicFunction(userIntention.nodeID);
        model.removeIntentionLinks(userIntention.nodeID);
        // remove all intention evaluations associated with this intention
        analysisRequest.removeIntention(userIntention.nodeID);
        // if this intention has an actor, remove this intention's ID
        // from the actor
        if (userIntention.nodeActorID !== '-') {
            var actor = model.getActorByID(userIntention.nodeActorID);
            actor.removeIntentionID(userIntention.nodeID);
        }
        model.removeIntention(userIntention.nodeID);
    }
    else if((!cell.isLink()) && (cell["attributes"]["type"]=="basic.Actor")){
        // To remove actor
        model.removeActor(cell['attributes']['nodeID']);


    }
    
    //TODO: What I have changed finished
	else if (cell.isLink() && (cell.prop("link-type") == 'NBT' || cell.prop("link-type") == 'NBD')) {
		// Verify if is a Not both type. If it is remove labels from source and target node
		var link = cell;
		var source = link.prop("source");
		var target = link.prop("target");
		var sourceId;
		var targetId;

	    for (var i = 0; i < graph.getElements().length; i++ ) {
			if (graph.getElements()[i].prop("id") == source["id"]) {
				 source = graph.getElements()[i];
		   	}
		  	if (graph.getElements()[i].prop("id") == target["id"]) {
			   target = graph.getElements()[i];
		   	}
	   	}

		//Verify if it is possible to remove the NB tag from source and target
		if (source !== null && !checkForMultipleNB(source)) {
			source.attrs(".funcvalue/text", "");
		}
		if (target !== null && !checkForMultipleNB(target)) {
			target.attrs(".funcvalue/text", "");
		}
	}
});


/**
 * Clear any analysis sidebar views
 */
function clearInspector() {
    if($('.inspector-views').length != 0){
        $('.inspector-views').trigger('clearInspector');
    }
}


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
        if (localLinks[i].prop("link-type")   == 'NBT' || localLinks[i].prop("link-type") == 'NBD'){
            if (localLinks[i].getSourceElement().prop("id") == node["id"] || localLinks[i].getTargetElement().prop("id") == node["id"]){
                num += 1;            
            }
        }
	}

	return num >= 1;
}

/**
 * Sets interaction option on all elements in graph
 * 
 * @param {boolean} interactionValue 
 */
function setInteraction(interactionValue){
    _.each(graph.getCells(), function(cell) {
        cell.findView(paper).options.interactive = interactionValue;
    });
}
