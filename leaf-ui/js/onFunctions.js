/*
This file contains all the jQuery functions that are associated with buttons and elements.
It also contains the setup for Rappid elements.
*/

/*** Event listeners for index.html toolbar functions ***/
/**
* Set up tool bar button on click functions
*/

$('#btn-undo').on('click', _.bind(commandManager.undo, commandManager));
$('#btn-redo').on('click', _.bind(commandManager.redo, commandManager));
$('#btn-clear-all').on('click', function () { clearAll() });
// TODO: Reimplement with new backbone structure
$('#btn-clear-elabel').on('click', function () {
    for (let element of graph.getElements()) {
        var cellView = element.findView(paper);
        var cell = cellView.model;
        var intention = model.getIntentionByID(cellView.model.attributes.nodeID);

        if (intention != null && intention.getInitialSatValue() != '(no value)') {
            intention.removeInitialSatValue();

            cell.attr(".satvalue/text", "");
            cell.attr(".funcvalue/text", "");

            elementInspector.$('#init-sat-value').val('(no value)');
            elementInspector.$('.function-type').val('(no value)');
        }
    }
    IntentionColoring.refresh();
});
// TODO: Reimplement with new backbone structure
$('#btn-clear-flabel').on('click', function () {
    for (let element of graph.getElements()) {
        var cellView = element.findView(paper);
        var cell = cellView.model;
        var intention = model.getIntentionByID(cellView.model.attributes.nodeID);

        if (intention != null) {
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
$('#btn-clear-cycle').on('click', function () {
    clearCycleHighlighting();
});

$('#btn-clear-analysis').on('click', function () {
    // TODO: Re-Implement for backbone view - What does clearing analysis mean now?
    // reset graph to initial values
    revertNodeValuesToInitial();
});

// TODO: Re-implement for backbone view
$('#btn-clear-results').on('click', function () { });

// Open as SVG
$('#btn-svg').on('click', function () {
    paper.openAsSVG();
});

// Save the current graph to json file
$('#btn-save').on('click', function () {
    var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
    if (name) {
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
$('#btn-save-analysis').on('click', function () {
    var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
    if (name) {
        clearCycleHighlighting();
        EVO.deactivate();
        var fileName = name + ".json";
        var obj = getModelAnalysisJson();
        download(fileName, JSON.stringify(obj));
    }
});

// Save the current graph and analysis (with results) to json file
$('#btn-save-all').on('click', function () {
    var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
    if (name) {
        clearCycleHighlighting();
        EVO.deactivate();
        var fileName = name + ".json";
        var obj = getFullJson();
        download(fileName, JSON.stringify(obj));
    }
});

// Workaround for load, activates a hidden input element
$('#btn-load').on('click', function () {
    $('#loader').click();
});

$('#btn-debug').on('click', function () { console.log(graph.toJSON()) });
$('#btn-zoom-in').on('click', function () { zoomIn(paperScroller); });
$('#btn-zoom-out').on('click', function () { zoomOut(paperScroller); });
$('#btn-fnt').on('click', function () { defaultFont(paper); });
$('#btn-fnt-up').on('click', function () { fontUp(paper); });
$('#btn-fnt-down').on('click', function () { fontDown(paper); });
$('#legend').on('click', function () { window.open('./userguides/legend.html', 'newwindow', 'width=300, height=250'); return false; });
$('#evo-color-key').on('click', function () { window.open('./userguides/evo.html', 'newwindow', 'width=500, height=400'); return false; });

/**
 * Displays the absolute and relative assignments modal for the user.
 */
$('#btn-view-assignment').on('click', function () {
    var assignmentsModal = new AssignmentsTable({ model: graph });
    $('#assignments-list').append(assignmentsModal.el);
    assignmentsModal.render();
});

$('#btn-view-intermediate').on('click', function () {
    var intermediateValuesTable = new IntermediateValuesTable({ model: graph });
    $('#intermediate-table').append(intermediateValuesTable.el);
    intermediateValuesTable.render();
});

/**
 * Switches to Analysis view iff there are no cycles and no syntax errors.
 */
//TODO: Add back in cycle detection after backbone migration.
$('#analysis-btn').on('click', function () {
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

// Switches to modeling mode
$('#modeling-btn').on('click', function () {
    switchToModellingMode();

    savedAnalysisData.finalAssignedEpoch = "";
    savedAnalysisData.finalValueTimePoints = "";
});

/**
 * Source:https://www.w3schools.com/howto/howto_js_rangeslider.asp 
 * Two option modeling mode slider
 */
document.getElementById("colorReset").oninput = function () { //turns slider on/off and refreshes
    EVO.setSliderOption(this.value);
}
/**
 * Four option analysis mode slider
 */
document.getElementById("colorResetAnalysis").oninput = function () { //changes slider mode and refreshes
    EVO.setSliderOption(this.value);
}

$('#colorblind-mode-isOff').on('click', function () { //activates colorblind mode
    $('#colorblind-mode-isOff').css("display", "none");
    $('#colorblind-mode-isOn').css("display", "");

    IntentionColoring.toggleColorBlindMode(true);
});

$('#colorblind-mode-isOn').on('click', function () { //turns off colorblind mode
    $('#colorblind-mode-isOn').css("display", "none");
    $('#colorblind-mode-isOff').css("display", "");

    IntentionColoring.toggleColorBlindMode(false);
});

$(window).resize(function () {
    resizeWindow();
});

/*** Events for Rappid/JointJS objets ***/

/** Graph Events */

// Whenever an element is added to the graph
graph.on("add", function (cell) {
    // Find how many cells are created on the graph
    var createdInstance = paper.findViewsInArea(paper.getArea())

    if (cell instanceof joint.dia.Link) {
        if (graph.getCell(cell.get("source").id) instanceof joint.shapes.basic.Actor) {
            cell.prop("type", "Actor");
            cell.label(0, { attrs: { text: { text: "is-a" } } });
            cell.set('link', new LinkBBM({ linkType: 'is-a' }));
        } else {
            cell.prop("type", "element");
            cell.set('link', new LinkBBM({}));
        }
    } else if (cell instanceof joint.shapes.basic.Intention) {
        // Creates an instance of a IntentionBBM from the cell
        var newIntentionBBM = new IntentionBBM({})
        cell.set('intention', newIntentionBBM);
        cell.attr('.satvalue/text', '');
        cell.attr('.funcvalue/text', ' ');
        // Create intention evaluation object and add it to userEvaluationList 
        newIntentionBBM.get('userEvaluationList').push(new UserEvaluationBBM({}));
    } else if (cell instanceof joint.shapes.basic.Actor) {
        // Find how many instances of the actor is created out of all the cells
        createdInstance = createdInstance.filter(view => view.model instanceof joint.shapes.basic.Actor);

        // Create placeholder name based on the number of instances
        var name = cell.attr('.name/text') + "_" + (createdInstance.length - 1);
        cell.set('actor', new ActorBBM({ actorName: name }));
        cell.attr(".name/text", name);

        // Send actors to background so elements are placed on top
        cell.toBack();
    }

    // Trigger click on cell to highlight, activate inspector, etc. 
    paper.trigger("cell:pointerup", cell.findView(paper));
});

// Auto-save the cookie whenever the graph is changed.
graph.on("change", function () {
    var graphtext = graph.toJSON();
    document.cookie = "graph=" + graphtext;
});

graph.on('change:size', function (cell, size) {
    cell.attr(".label/cx", 0.25 * size.width);

    // Calculate point on actor boundary for label (to always remain on boundary)
    var b = size.height;
    var c = -(size.height / 2 + (size.height / 2) * (size.height / 2) * (1 - (-0.75 * size.width / 2) * (-0.75 * size.width / 2) / ((size.width / 2) * (size.width / 2))));
    var y_cord = (-b + Math.sqrt(b * b - 4 * c)) / 2;

    cell.attr(".label/cy", y_cord);
});


graph.on('remove', function (cell) {
    // Clear right inspector side panel
    clearInspector();

    if (cell.isLink() && !(cell.prop("link-type") == 'NBT' || cell.prop("link-type") == 'NBD')) {
        // To remove link
        var link = cell;
        model.removeLink(link.linkID);
    }

    else if ((!cell.isLink()) && (!(cell["attributes"]["type"] == "basic.Actor"))) {
        // To remove intentions
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
    else if ((!cell.isLink()) && (cell["attributes"]["type"] == "basic.Actor")) {
        // To remove actor
        model.removeActor(cell['attributes']['nodeID']);


    }

    else if (cell.isLink() && (cell.prop("link-type") == 'NBT' || cell.prop("link-type") == 'NBD')) {
        // Verify if is a Not both type. If it is remove labels from source and target node
        var link = cell;
        var source = link.prop("source");
        var target = link.prop("target");

        for (var i = 0; i < graph.getElements().length; i++) {
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

/** Paper Events **/

/**
 * Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
 * Otherwise, initiate paper pan.
 */
paper.on('blank:pointerdown', function (evt, x, y) {
    paperScroller.startPanning(evt, x, y);
});

/**
 * Specifies behavior for clicking on cells and moving intentions/links
 */
// TODO: Find better way to handle move instances than adding data to event and passing forward
paper.on({
    'cell:pointerdown': function (cellView, evt) {
        // pass data to pointermove and pointerup
        evt.data = { move: false };
    },
    'cell:pointermove': function (cellView, evt) {
        if (!evt.data.move) {
            // start of a click and drag
            evt.data.move = true;
        }
    },
    'cell:pointerup': function (cellView, evt) {
        // undefined event occurs due to paper.trigger("cell:pointerup"...
        // on adding new cell to paper
        if (evt == undefined) {
            // same highlighting, actor embedding, etc. behavior as dragging cell 
            evt = { data: { move: true, interact: true } };
        }
        // when interacting w/ cells on paper in modeling mode
        if (cellView.model.findView(paper).options.interactive) {
            var cell = cellView.model;
            // TODO: There is a link connect/link disconnect function that could be used here
            // https://resources.jointjs.com/docs/jointjs/v3.3/joint.html#dia.Paper.events
            // And then the cell:pointer events could be changed to element:pointer and links could be handled seperately
            if (cell instanceof joint.dia.Link) { // Link behavior
                if (evt.data.move) {
                    // If link moved, reparent
                    cell.reparent();
                }
            } else { // Non-Link behavior

                // Remove highlight of other elements
                removeHighlight();

                // Highlight when cell is clicked
                cellView.highlight();
                createHalo(cellView);

                clearInspector();

                // Render actor/element inspector
                if (cell instanceof joint.shapes.basic.Actor) {
                    var actorInspector = new ActorInspector({ model: cell });
                    $('.inspector').append(actorInspector.el);
                    actorInspector.render();
                } else {
                    var elementInspector = new ElementInspector({ model: cell });
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
paper.on('blank:pointerclick', function () {
    removeHighlight();
});

// Link equivalent of the element editor
paper.on("link:options", function (cell) {

    clearInspector();

    if (cell.model.get('type') == 'error') {
        alert('Sorry, this link is not valid. Links must be between two elements of the same type. Aka Actor->Actor or Intention->Intention');
        return;
    }

    var linkInspector = new LinkInspector({ model: cell.model });
    $('.inspector').append(linkInspector.el);
    linkInspector.render();

});

/*** Helper functions ***/

{
    /** Initialize configCollection within scope of brackets */
    let configCollection = new ConfigCollection([]);
    let configInspector = null;

    $('#simulate-single-path-btn').on('click', function() { 
        backendComm(configCollection.findWhere({selected: true}));
    }); 
    $('#next-state-btn').on('click', function() { getAllNextStates(); }); 
    
    /**
     * Helper function for switching to Analysis view.
     */
    function switchToAnalysisMode() {
        setInteraction(false);

        // Clear the right panel
        clearInspector();

        removeHighlight();

        configInspector = new ConfigInspector({ collection: configCollection });
        $('#configID').append(configInspector.el);
        configInspector.render();

        // Remove model only elements 
        $('.model-only').css("display", "none");

        // Show extra tools for analysis mode
        $('.analysis-only').css("display", "");

        // Show Analysis View tag
        $('#modeText').text("Analysis View");

        // Disable link settings
        $('.link-tools .tool-remove').css("display", "none");
        $('.link-tools .tool-options').css("display", "none");

        IntentionColoring.refresh();

        // TODO: Add check for model changes to potentially clear configCollection back in
    }

    {
        /** Initialize showEditingWarning within scope of brackets */
        let showEditingWarning = true;

        /**
         * Switches back to Modelling Mode from Analysis Mode
         * and resets the Nodes' satValues to the values prior to analysis
         * Display the modeling mode page
         */
        function switchToModellingMode() {
            setInteraction(true);

            // Reset to initial graph prior to analysis
            revertNodeValuesToInitial();

            // Remove analysis only elements 
            $('.analysis-only').css("display", "none");

            // Show extra tools for modelling mode
            $('.model-only').css("display", "");

            // Show Modelling View tag
            $('#modeText').text("Modeling View");

            // Reinstantiate link settings
            $('.link-tools .tool-remove').css("display", "");
            $('.link-tools .tool-options').css("display", "");

            EVO.switchToModelingMode();

            // Remove configInspector view
            configInspector.remove();
            // TODO: Determine if we should be setting action to null on all configs
            configCollection.findWhere({ selected: true }).set('action', null);

            // Popup to warn user that changing model will clear results
            // From analysis configuration sidebar
            // Defaults to showing each time if user clicks out of box instead of selecting option
            if (showEditingWarning) {
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
                document.querySelectorAll('.model-editing').forEach(function (button) {
                    button.addEventListener('click', function () { dialog.close(); if (button.id == 'singular') { showEditingWarning = false; }; });
                });
            }
        }
    } // End scope of showEditingWarning

    function clearAll() {
        graph.clear();
        configCollection.reset();
        // Delete cookie by setting expiry to past date
        document.cookie = 'graph={}; expires=Thu, 18 Dec 2013 12:00:00 UTC';
    }

} // End scope of configCollection and configInspector

/**
 * Create a halo around the element that was just created
 *
 * @param {joint.shapes} cellView
 * @returns {joint.ui.Halo} halo
 */
function createHalo(cellView) {
    var halo = new joint.ui.Halo({
        type: 'toolbar',
        boxContent: false,
        cellView: cellView,
    });

    halo.removeHandle('unlink');
    halo.removeHandle('clone');
    halo.removeHandle('fork');
    halo.removeHandle('rotate');


    halo.on('action:resize:pointermove', function () {
        cellView.unhighlight();
        cellView.highlight();
    });

    // Remove halo when cell is unhighlighted
    halo.options.cellView.on('removeHalo', function () {
        halo.remove();
    });

    halo.render();
    return halo;
}

/**
 * Remove the highlight around all elements
 */
function removeHighlight() {
    // Unhighlight everything
    for (let element of graph.getElements()) {
        element.findView(paper).unhighlight();
        element.findView(paper).trigger('removeHalo');
    }
}

/**
 * Clear any analysis sidebar views
 */
function clearInspector() {
    if ($('.inspector-views').length != 0) {
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

    for (var i = 0; i < localLinks.length; i++) {
        if (localLinks[i].prop("link-type") == 'NBT' || localLinks[i].prop("link-type") == 'NBD') {
            if (localLinks[i].getSourceElement().prop("id") == node["id"] || localLinks[i].getTargetElement().prop("id") == node["id"]) {
                num += 1;
            }
        }
    }

    return num >= 1;
}

/**
 * Creates and returns an alert dialog box
 * 
 * @param {String} title 
 * @param {String} msg 
 * @param {Number} width 
 * @param {String} promptMsgType 
 * @param {Sting} type 
 * @returns joint.ui.Dialog box
 */
function showAlert(title, msg, width, promptMsgType, type) {
    var dialog;
    var alertType = 'alert';
    if (type) {
        alertType = type;
    }
    dialog = new joint.ui.Dialog(
        {
            type: alertType,
            width: width,
            title: title,
            content: '<div class="creativity-dialog-wrapper" data-prompttype="' + promptMsgType + '">' + msg + '</div>',
            modal: false
        });

    dialog.open();
    return dialog;
}

/**
 * Sets interaction option on all elements in graph
 * 
 * @param {boolean} interactionValue 
 */
function setInteraction(interactionValue) {
    _.each(graph.getCells(), function (cell) {
        cell.findView(paper).options.interactive = interactionValue;
    });
}

/**
 * Sets each node/cellview in the paper to its initial 
 * satisfaction value and colours all text to black
 */
// TODO: Re-write with new models
function revertNodeValuesToInitial() {
    // var elements = graph.getElements();
    // var curr;
    // for (var i = 0; i < elements.length; i++) {
    // 	curr = elements[i].findView(paper).model;

    // 	if (curr.attributes.type !== 'basic.Goal' &&
    // 		curr.attributes.type !== 'basic.Task' &&
    // 		curr.attributes.type !== 'basic.Softgoal' &&
    // 		curr.attributes.type !== 'basic.Resource') {
    // 		continue;
    // 	}     
    // 	var intention = curr.get('intention');
    //     var initSatVal = intention.getUserEvaluationBBM(0).get('assignedEvidencePair'); 

    // 	if (initSatVal === '(no value)') {
    //         curr.attr('.satvalue/text', '');

    // 	} else {
    //         curr.attr('.satvalue/text', satisfactionValuesDict[initSatVal].satValue);
    // 	}
    //     //curr.attr({text: {fill: 'black'}});
    //     curr.attr({text: {fill: 'black',stroke:'none','font-weight' : 'normal','font-size': 10}});
    // }
    // // Remove slider
    // removeSlider();
}
