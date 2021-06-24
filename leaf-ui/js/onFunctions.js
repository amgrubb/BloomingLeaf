/*
This file contains all the jQuery functions that are associated with buttons and elements.
It also contains the setup for Rappid elements.
*/

/**
 * Event listeners for index.html toolbar functions
 */
 $('#btn-zoom-in').on('click', function(){ zoomIn(paperScroller); });
 $('#btn-zoom-out').on('click', function(){ zoomOut(paperScroller); });
 $('#btn-fnt').on('click', function(){ defaultFont(paper);});
 $('#btn-fnt-up').on('click', function(){  fontUp(paper);});
 $('#btn-fnt-down').on('click', function(){ fontDown(paper);}); 
 $('#legend').on('click', function(){ window.open('./userguides/legend.html', 'newwindow', 'width=300, height=250'); return false;});
 $('#evo-color-key').on('click', function(){ window.open('./userguides/evo.html', 'newwindow', 'width=500, height=400'); return false;});

/**
 * General javascript for user interaction
 * When the user clicks anywhere outside of the a pop up, close it
 */
// TODO: Permenently remove and figure out how to re-implement inside the respective views
window.onclick = function(event) {
	// var modal = document.getElementById('assignmentsModal');
	var intermT = document.getElementById('intermediateTable');
    // if (event.target == modal) {
  	//     modal.style.display = "none";
    // }
	if(event.target == intermT){
		intermT.style.display = "none";
	}
}

/**
 * Sets Max Absolute Time
 */
// $('#max-abs-time').on('change', function(){
//     var maxTime = $('#max-abs-time');
//     if (maxTime.val() !== "") {
//         model.maxAbsTime = maxTime.val()
//     } else {
//         maxTime.val(model.maxAbsTime);
//     }
// });

/**
 * Add relative intention row
 */
// $('.addIntention').on('click', function(){
    // var intentions = model.intentions;
    //     var epochHtml1 = '<div class="epochLists" id="epoch1List"><select><option selected>...</option>';
    //     var epochHtml2 =  '<div class="epochLists" id="epoch2List"><select><option selected>...</option>';
    //     for (var i = 0; i < intentions.length; i++) {

    //         // if number of function segments >= 2, we have at least one transition
    //         if (intentions[i].getNumOfFuncSegements() >= 2) {
    //             var funcSegments = intentions[i].dynamicFunction.getFuncSegmentIterable();
    //             for (var j = 0; j < funcSegments.length - 1; j++) {
    //                 var epoch = funcSegments[j].funcStop;
    //                 var newEpochHtml = '<option nodeID=' + intentions[i].nodeID + ' epoch=' + epoch + '>' + intentions[i].nodeName + ': ' + epoch + '</option>';
    //                 epochHtml1 += newEpochHtml;
    //                 epochHtml2 += newEpochHtml;
    //             }
    //         }
    //     }

    //     epochHtml1 += '</select></div>';
    //     epochHtml2 += '</select></div>';


    //     var relationship = '<div class="epochLists" id="relationshipLists"><select><option selected>...'+
    //         '</option><option value="eq">=</option><option value="lt"><</option></select></div>'

    //     $('#rel-intention-assignents').append('<tr><td>' + epochHtml1 + '</td><td>' + relationship +
    //         '</td><td>'+ epochHtml2 +'</td><td><i class="fa fa-trash-o fa-2x" id="removeIntention" aria-hidden="true"></i></td></tr>');
// });

// $(document.body).on('click', '#removeIntention', function(){
//     var row = $(this).parent().parent();
//     var nodeID1 = row.find('#epoch1List select option:checked').attr('nodeID');
//     var epoch1 = row.find('#epoch1List select option:checked').attr('epoch');
//     var type = row.find('#relationshipLists select option:checked').text();
//     var nodeID2 = row.find('#epoch2List select option:checked').attr('nodeID');
//     var epoch2 = row.find('#epoch2List select option:checked').attr('epoch');
//     var constraint = new Constraint(type, nodeID1, epoch1, nodeID2, epoch2);

//     model.removeConstraint(constraint);
//     row.remove();
// });

/**
 * Displays the absolute and relative assignments modal for the user.
 */
$('#btn-view-assignment').on('click', function() {
    var assignmentsModal = new AssignmentsTable({model: graph});
    $('#assignments-list').append(assignmentsModal.el);
    assignmentsModal.render();
	// epochLists = [];
	// graph.constraintValues = [];
	// var modal = document.getElementById('assignmentsModal');

	// // Clear all previous table entries
	// $(".abs-table").find("tr:gt(0)").remove();

	// // Display the modal by setting it to block display
	// modal.style.display = "block";


	// displayAbsoluteIntentionAssignments();
	// displayAbsoluteRelationshipAssignments();
});

/**
 * Saves absolute intention and relationship assignments to the graph object
 * TODO: Check if the times users put in are valid
 */
$('#btn-save-assignment').on('click', function() {
    saveAbsoluteTimePoints();
    saveAbsoluteIntentionAssignments();
    saveAbsoluteRelationshipAssignments();
    saveRelativeIntentionAssignments();

    // Dismiss the modal
    var modal = document.getElementById('assignmentsModal');
    modal.style.display = "none";
    $("#epoch1List select").val();
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
 * Trigger when unassign button is pressed. 
 * Change the assigned time of the node/link in the same row to none
 */ 
$(document).on('click', '.unassign-abs-rel-btn', function(e) {
    var button = e.target;
        var row = $(button).closest('tr');
        var assignedTime = row.find('input[type=number]');
        $(assignedTime).val('');

        var linkID = row.attr('linkID');
        var link = model.getLinkByID(linkID);
        link.absoluteValue = -1;
});

$(document).on('click', '.unassign-abs-intent-btn', function(e) {
    var button = e.target;
    var row = $(button).closest('tr');
    var assignedTime = row.find('input[type=number]');
    $(assignedTime).val('');

    var nodeID = row.attr('nodeID');
    var srcEB = row.attr('srcEB');
    var constraint = model.getAbsConstBySrcID(nodeID, srcEB);
    constraint.absoluteValue = -1;
});

/**
 * Returns an array of numbers containing numbers that the
 * user has inputed in the Absolute Time Points input box.
 * @returns {Array.<Number>}
 */
function getAbsoluteTimePoints() {
    var absValues = document.getElementById('abs-time-pts').value;
    var absTimeValues;
    console.log("get has these time points: " + absTimeValues);
    if (absValues != '') {
        absTimeValues = absValues.split(' ');
        absTimeValues.map(function (i) {
            if (i != '') {
                return parseInt(i, 10);
            }
        });

        //Sort into ascending order
        absTimeValues.sort(function (a, b) {
            return a - b
        });
    } else {
        absTimeValues = [];
    }

    return absTimeValues
}

/** 
 * Sets Absolute time points
 */
function saveAbsoluteTimePoints() {
    var regex = new RegExp("^(([1-9]0*)+\\s+)*([1-9]+0*)*$");
    var absTime = $('#abs-time-pts');
    if (regex.test(absTime.val())) {
        analysisRequest.absTimePts = absTime.val().trim();
        analysisRequest.changeTimePoints(getAbsoluteTimePoints());
    } else {
        absTime.val(analysisRequest.absTimePts);
    }
    
    // Updates the analysis request time points based on the saved assignments
    analysisRequest.changeTimePoints(getAbsoluteTimePoints());
}

/**
* Displays the links for the Absolute Relationship Assignments for
* the Absolute and Relative Assignments modal
*/
function displayAbsoluteRelationshipAssignments() {
	var btnHtml = '<td><button class="unassign-abs-rel-btn" > Unassign </button></td>';
	// Get a list of links
	var links = graph.getLinks();
	for (var i = 0; i < model.links.length; i++) {
		var link = model.links[i];
		var sourceID = link.linkSrcID;
		var targetID = link.linkDestID;

		// If this link does not have a source and a target
		if (sourceID == null || targetID == null) {
			continue;
		}

		var sourceName = model.getIntentionByID(sourceID).nodeName;
		var targetName = model.getIntentionByID(targetID).nodeName;


		if (link.linkType == 'NBD' || link.linkType == 'NBT' || link.isEvolvingRelationship()) {
			var linkAbsTime = link.absoluteValue;
			var defaultValue = linkAbsTime == -1 ? '' : linkAbsTime;

			$('#link-list').append('<tr linkID = ' + link.linkID + '><td>' + link.linkType + '</td><td>' + sourceName + '</td><td>' + targetName +
				'</td><td><input type="number" name="sth" value=' + defaultValue + '></td>' + btnHtml +
				'</tr>');
		}

	}
}
    
/**
* Displays the nodes for the Absolute Intention Assignments for
* the Absolute and Relative Assignments modal
*/
function displayAbsoluteIntentionAssignments() {

	var btnHtml = '<td><button class="unassign-abs-intent-btn"> Unassign </button></td>';

	for (var i = 0; i < model.intentions.length; i++) {
		var intention = model.intentions[i];
		var funcType = intention.dynamicFunction.stringDynVis;
		var intentionName = intention.nodeName;

		// nameIdMapper[name] = intention.nodeID;
		if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' ||
			funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {

			var absTime = intention.getAbsConstTime('A');
			// default value to display.
			// -1 means abs time does not exist. So display empty string instead.
			var defaultVal = absTime === -1 ? '' : absTime;

			$('#node-list').append('<tr nodeID = ' + intention.nodeID + ' srcEB = A><td>' + intentionName + ': A' + '</td><td>' + funcType + '</td>' +
				'<td><input type="number" name="sth" value="' + defaultVal + '"></td>' + btnHtml + '</tr>');
		} else if (funcType == 'UD') {

			// the number of function transitions, is the number of functions minus one
			var funcTransitions = intention.dynamicFunction.functionSegList.length - 1;
			var currBound = 'A';
			for (var j = 0; j < funcTransitions; j++) {

				// default value to display
				var absTime = intention.getAbsConstTime(currBound);
				var defaultVal = absTime === -1 ? '' : absTime;

				$('#node-list').append('<tr nodeID = ' + intention.nodeID + ' srcEB = ' + currBound + '><td>' + intentionName + ': ' + currBound + '</td><td>' + funcType + '</td>' +
					'<td><input type="number" name="sth" value=' + defaultVal + '></td>' + btnHtml + '</tr>');
				currBound = String.fromCharCode(currBound.charCodeAt(0) + 1);
			}
		}
	}
}

/**
* Saves the Relative Intention Assignments from the
* Absolute and Relative Assignments into the graph object
*/
function saveRelativeIntentionAssignments(){
    $('.rel-intent-table tr').each(function () {
        var nodeID1 = $(this).find('#epoch1List select option:checked').attr('nodeID');
        var epoch1 = $(this).find('#epoch1List select option:checked').attr('epoch');
        var type = $(this).find('#relationshipLists select option:checked').text();
        var nodeID2 = $(this).find('#epoch2List select option:checked').attr('nodeID');
        var epoch2 = $(this).find('#epoch2List select option:checked').attr('epoch');

        if (!nodeID1 || !epoch1 || !type || !nodeID2 || !epoch2) {
            return;
        }

        // create constraints object
        var constraint = new Constraint(type, nodeID1, epoch1, nodeID2, epoch2);

        if (!model.existsConstraint(constraint)) {
            model.saveRelIntAssignment(type, nodeID1, epoch1, nodeID2, epoch2);
        }
    });
}

/**
* Saves the Absolute Intention Assignments from the
* Absolute and Relative Assignments to the graph object
*/
function saveAbsoluteIntentionAssignments(){
    // Save absolute intention assignments
    $.each($('#node-list').find("tr input[type=number]"), function(){
        var newTime = parseInt($(this).val()); // ex 15
        if (isNaN(newTime)) {
            return;
        }
        var row = $(this).closest('tr');
        var srcEB = row.attr('srcEB'); // ex. 'A'
        var nodeID = row.attr('nodeID'); // ex. '0000'

        model.setAbsConstBySrcID(nodeID, srcEB, newTime);
    });
}

/**
* Saves the Absolute Relationship Assignments from the
* Absolute and Relative Assignments into the graph object
*/
function saveAbsoluteRelationshipAssignments(){
    // Save absolute relationship assignment
    $.each($('#link-list').find("tr input[type=number]"), function() {
        var newTime = parseInt($(this).val());
        if (isNaN(newTime)) {
            return;
        }
        var row = $(this).closest('tr');
        var linkID = row.attr('linkID');
        var link = model.getLinkByID(linkID);
        link.absoluteValue = newTime;
    });
}

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
var inAnalysis = false;
function switchToAnalysisMode() {
    setInteraction(false);
    inAnalysis = true;
	reassignIntentionIDs();
	
	// Clear the right panel
	clearInspector();
	
	removeHighlight();
    
    $('#config').append(configInspector.el);
    configInspector.render();
	$('#stencil').css("display", "none");

    $('#analysis-btn').css("display", "none");
	$('#symbolic-btn').css("display", "none");
	$('#cycledetect-btn').css("display", "none");
    $('#take-break').css("display", "");
    $('#dropdown-model').css("display", "");
    $('#analysis-dropdown').css("display",""); 
    $('#next-state').css("display",""); 
    $('#simulate-single-path').css("display",""); 
    //$('#on-off').css("display", "none");

    // hide extra tools from modelling mode
    $('#model-toolbar').css("display", "none");
    $('.model-clears').css("display", "none");
    $('.analysis-clears').css("display", "");

    // Show Analysis View tag
	$('#modeText').text("Analysis View");

	// Disable link settings
	$('.link-tools .tool-remove').css("display", "none");
    $('.link-tools .tool-options').css("display", "none");

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
    // reset values
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

		var intention = model.getIntentionByID(curr.attributes.nodeID);

		var initSatVal = intention.getInitialSatValue();
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

    $('#stencil').css("display","");
    $('#analysis-sidebar').css("display","none");
    $('#btn-view-assignment').css("display","");
    $('#analysis-btn').css("display","");
	$('#symbolic-btn').css("display","");
	$('#cycledetect-btn').css("display","");
    $('#take-break').css("display", "none");
    $('#dropdown-model').css("display","none");
    $('#analysis-dropdown').css("display","none"); 
    $('#next-state').css("display","none"); 
    $('#simulate-single-path').css("display","none"); 
    $('#on-off').css("display", "");

    // show extra tools for modelling mode
    $('#model-toolbar').css("display","");
    $('.model-clears').css("display", "");
    $('.analysis-clears').css("display", "none");

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
 * Creates an instance of a Link object and saves it in the global model
 * variable
 *
 * @param {joint.dia.Cell} cell
 */
function createLink(cell) {
	var link = new Link('AND', cell.getSourceElement().attributes.nodeID,  -1);
	cell.attributes.linkID = link.linkID;
    cell.prop('linkSrcID', cell.getSourceElement().attributes.nodeID);
    cell.on("change:target", function () {
    	var target = cell.getTargetElement();
    	if (target === null) {
    		link.linkDestID = null;
            cell.prop('linkDestID', null);
    	} else {
    		link.linkDestID = target.attributes.nodeID;
            cell.prop('linkDestID', target.attributes.nodeID);
    	}
    });
    cell.on("change:source", function () {
		var source = cell.getSourceElement();
		if (source === null) {
			link.linkSrcID = null;
		} else {
			link.linkSrcID = source.attributes.nodeID;
		}
    });
    model.links.push(link);
}

/**
 * Creates an instance of a Intention object and saves it in the
 * global model variable
 *
 * @param {joint.dia.Cell} cell
 */
function createIntention(cell) {

    var name = cell.attr(".name/text") + "_" + Intention.numOfCreatedInstances;
    cell.attr(".name/text", name);

    // create intention object
    var type = cell.attributes.type;
    var intention = new Intention('-', type, name);
    model.intentions.push(intention);

    // create intention evaluation object
    var intentionEval = new UserEvaluation(intention.nodeID, '0', '(no value)');
    analysisRequest.userAssignmentsList.push(intentionEval);

    cell.attributes.nodeID = intention.nodeID;

}

/**
 * Creates an instance of an Actor object and saves it in the
 * global model variable
 * 
 * @param {joint.dia.Cell} cell
 */
function createActor(cell) {//TODO: right now there are two parameters the actor model in the joint.extensions file that hold the same information (attrs.name & actorName), find a way for actor inspector to be able to access attrs.name in the template script so that actorName is not needed
	var name = cell.attr('.name/text') + "_" + Actor.numOfCreatedInstances;
	var actor = new Actor(name);
    cell.attr(".name/text", name);
    cell.set('actorName', name);
	cell.attributes.nodeID = actor.nodeID;
	model.actors.push(actor);
}

/**
 * Set up on events for Rappid/JointJS objets
 */
var element_counter = 0;

// Whenever an element is added to the graph
graph.on("add", function(cell) {

	if (cell instanceof joint.dia.Link){
        if (graph.getCell(cell.get("source").id) instanceof joint.shapes.basic.Actor){
            cell.prop("linktype", "actorlink");
            cell.label(0,{attrs:{text:{text:"is-a"}}});
            cell.set('link', new LinkBBM({linkType: 'is-a'}));
		} else{
            cell.prop("type", "element");
            cell.set('link', new LinkBBM({}));
        }
    } else if (cell instanceof joint.shapes.basic.Intention){
		cell.set('intention', new IntentionBBM({}));
		cell.attr('.funcvalue/text', ' ');

	} else if (cell instanceof joint.shapes.basic.Actor) {
		createActor(cell);

		// Send actors to background so elements are placed on top
		cell.toBack();
	}

    // trigger click on cell to highlight, activate inspector, etc. 
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
                    // check if link still valid
                    basicActorLink(cell);
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

                // render actor/element inspector
                if (cell instanceof joint.shapes.basic.Actor) {
                    var actorInspector =  new ActorInspector({model:cell});
                    $('.inspector').append(actorInspector.el);
                    actorInspector.render();
                } else {
                    elementInspector.render(cell);
                    // if user was dragging element
                    if (evt.data.move) {
                        // unembed intention from old actor
                        if (cell.get('parent')) {
                            graph.getCell(cell.get('parent')).unembed(cell);

                            // remove nodeID from actor intentionIDs list
                            var userIntention = model.getIntentionByID(cell.attributes.nodeID);
                            if (userIntention.nodeActorID !== '-') {
                                var actor = model.getActorByID(userIntention.nodeActorID);
                                actor.removeIntentionID(userIntention.nodeID);
                            }
                        }
                        // embed element in new actor
                        embedBasicActor(cell);
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
    
    var linkInspector = new LinkInspector({model: cell.model});
    $('.inspector').append(linkInspector.el);

	linkInspector.render();

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

/**
 * Embeds an element into an actor boundary
 *
 * @param {joint.dia.cell} cell
 */
function embedBasicActor(cell) {
    // returns actors, intentions, etc. which overlap with this cell
    // including the cell itself
    var overlapCells = paper.findViewsFromPoint(cell.getBBox().center());

    // find actors which overlap with cell
    overlapCells = overlapCells.filter(view => view.model instanceof joint.shapes.basic.Actor);

    // cell is over at least one actor
    if (overlapCells.length > 0) {
        for (var i = 0; i < overlapCells.length; i++) {
            // embed intention in each actor
            var actorCell = overlapCells[i].model;
            actorCell.embed(cell);
            var nodeID = cell.attributes.nodeID;
            var actorID = actorCell.attributes.nodeID
            model.getIntentionByID(nodeID).nodeActorID = actorID;
            model.getActorByID(actorID).addIntentionID(nodeID);
        }
    } else {
        // intention not over any actor
        var nodeID = cell.attributes.nodeID;
        model.getIntentionByID(nodeID).nodeActorID = "-";
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
 * Clear the .inspector div
 */
function clearInspector() {
	elementInspector.clear();
	linkInspector.clear();

    // Clear any analysis sidebar views
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
