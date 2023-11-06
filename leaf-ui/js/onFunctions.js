/*
This file contains all the jQuery functions that are associated with buttons and elements.
It also contains the setup for Rappid elements.
*/

// Used to be onFunctionsBothWindows.js
// Navigation bar functions:
var max_font = 20;
var min_font = 6;
var current_font = 10;
var default_font = 10;

function zoomIn(pPaperScroller) {
    pPaperScroller.zoom(0.2, { max: 3 });
}

function zoomOut(pPaperScroller) {
    pPaperScroller.zoom(-0.2, { min: 0.2 });
}

/**
 * Helper function function for fontUp, fontDown, and defaultFont
 * @param {int} new_font 
 */
function changeFont(new_font, pPaper) {
    var elements = graph.getElements();
    for (var i = 0; i < elements.length; i++) {
        var cellView = elements[i].findView(pPaper);
        cellView.model.attr(".name/font-size", new_font);
    }
    current_font = new_font;
}

/**
 * Increases font size by 1
 * @param {*} pPaper 
 */
function fontUp(pPaper) {
    var new_font = current_font + 1;
    if (new_font <= max_font) {
        changeFont(new_font, pPaper)
    }
}

/**
 * Decreases font size by 1
 * @param {*} pPaper 
 */
function fontDown(pPaper) {
    var new_font = current_font - 1;
    if (new_font >= min_font) {
        changeFont(new_font, pPaper)
    }
}

/**
 * Changes font size to default (10)
 * @param {*} pPaper 
 */
function defaultFont(pPaper) {
    changeFont(default_font, pPaper)
}

function resizeWindow(sliderMax) {
    $('#slider').css("margin-top", $(this).height() * 0.7);
    $('#slider').width($('#paper').width() * 0.8);
    SliderObj.adjustSliderWidth(sliderMax);
}

// End nav bar functions

/**
 * Set up Ctrl+c and Ctrl+v shortcut for macOS
 *  
 */
{
    // TODO: Outstanding problem from develop - copy/paste pastes twice
    // Currently only one model can ever be selected at a time

    var clipboard = new joint.ui.Clipboard();
    var selection = new Backbone.Collection();

    var selectionView = new joint.ui.SelectionView({
        paper: paper,
        graph: graph,
        model: selection
    });
    // Check if the browser is on Mac
    var macOS = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;
    if (macOS) {
        KeyboardJS.on('command + c, ctrl + c', function () {
            getSelection();
            // Copy all selected elements and their associatedf links.
            clipboard.copyElements(selection, graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
        });
        KeyboardJS.on('command + v, ctrl + v', function () {
            clipboard.pasteCells(graph);

            selectionView.cancelSelection();

            clipboard.pasteCells(graph, { link: { z: -1 }, useLocalStorage: true });

            // Make sure pasted elements get selected immediately. This makes the UX better as
            // the user can immediately manipulate the pasted elements.
            clipboard.each(function (cell) {
                if (cell.get('type') === 'link') return;

                // Push to the selection not to the model from the clipboard but put the model into the graph.
                // Note that they are different models. There is no views associated with the models
                // in clipboard.
                selection.add(graph.get('cells').get(cell.id));
            });

            selection.each(function (cell) {
                selectionView.createSelectionBox(paper.findViewByModel(cell));
            });
        });

    } else {

        KeyboardJS.on('ctrl + c', function () {
            getSelection();
            // Copy all selected elements and their associatedf links.
            clipboard.copyElements(selection, graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
        });
        KeyboardJS.on('ctrl + v', function () {
            clipboard.pasteCells(graph);

            selectionView.cancelSelection();

            clipboard.pasteCells(graph, { link: { z: -1 }, useLocalStorage: true });

            // Make sure pasted elements get selected immediately. This makes the UX better as
            // the user can immediately manipulate the pasted elements.
            clipboard.each(function (cell) {
                if (cell.get('type') === 'link') return;

                // Push to the selection not to the model from the clipboard but put the model into the graph.
                // Note that they are different models. There is no views associated with the models
                // in clipboard.
                selection.add(graph.get('cells').get(cell.id));
            });

            selection.each(function (cell) {
                selectionView.createSelectionBox(paper.findViewByModel(cell));
            });
        });

    }

    function getSelection() {
        for (let element of graph.getElements()) {
            if (element.findView(paper).el.children.length == 2 &&
                element.findView(paper).el.children[1].className.baseVal
                == 'joint-highlight-stroke joint-theme-default') {
                selection.add(element);
            }
        }
    }
}
// End of onFunctionsBothWindows.js functions

/*** Event listeners for index.html toolbar functions ***/
/**
* Set up tool bar button on click functions
*/

$('#btn-undo').on('click', _.bind(commandManager.undo, commandManager));
$('#btn-redo').on('click', _.bind(commandManager.redo, commandManager));
$('#btn-clear-all').on('click', function () { clearAll() });
$('#btn-clear-flabel').on('click', function () {
    for (let element of graph.getElements()) {
        var cellView = element.findView(paper);
        var cell = cellView.model;
        var intention = cell.get('intention');

        if (intention != null && intention.get('evolvingFunction').get('type') != 'NT') {
            intention.setEvolvingFunction('NT');
            $(".function-type").val('NT');
            cell.attr(".funcvalue/text", "");

            if ($('.inspector-views').length != 0) {
                // Rerender elementInspector for clearing Dynamic Labels
                var elementInspector = new ElementInspector({ model: cell });
                elementInspector.render();
            }
        }
    }
});

// Open as SVG
$('#btn-svg').on('click', function () {
    paper.openAsSVG();
});

$('#btn-zoom-in').on('click', function () { zoomIn(paperScroller); });
$('#btn-zoom-out').on('click', function () { zoomOut(paperScroller); });
$('#btn-fnt').on('click', function () { defaultFont(paper); });
$('#btn-fnt-up').on('click', function () { fontUp(paper); });
$('#btn-fnt-down').on('click', function () { fontDown(paper); });
$('#legend').on('click', function () { window.open('./userguides/legend.html', 'newwindow', 'width=300, height=250'); return false; });
$('#evo-color-key').on('click', function () { window.open('./userguides/evo.html', 'newwindow', 'width=500, height=400'); return false; });

/**
 * Guide me instructions
*/
class GuideBox {

    static step = 0;

    constructor(idx, task, instructions, context) {
        this.idx = idx;
        this.task = task;
        this.instructions = instructions;
        this.context = context;
    }

    static tutorial = 0;

    static why = [
        new GuideBox(0, "Placeholder", "Placeholder", "Placeholder"),
        new GuideBox(1, "Placeholder", "Placeholder", "Placeholder"),
        new GuideBox(2, "Placeholder", "Placeholder", "Placeholder"),
    ];

    static build = [
        new GuideBox(0, "Add actor to model", "Actors are people, roles, or organizations who hold stake in the scenario being modeled. Consider what actors exist in your situation, and click and drag the actor icons from the toolbar on the left into the workspace. Once an actor is placed, you can drag it around again to relocate it, click the X icon to delete it, or drag the icon with four outward facing arrows to resize it.", "Placeholder"),
        new GuideBox(1, "Use actor inspector", "To add details to an actor, click on the given actor. The actor inspector window will show up on the right hand side of the page. Here, you can change the actor’s name or type. To learn more about actor types, see the documentation document in the documentation dropdown. ", "Placeholder"),
        new GuideBox(2, "Add intentions to the model", "Intentions are the pieces that make up a goal model. Drag an intention to the page and let go to place it. Once an intention is placed, you can drag it around again to relocate it, click the X icon to delete it, or drag the icon with four outward facing arrows to resize it. To learn more about each specific intention, see the documentation document in the documentation dropdown.", "Placeholder"),
        new GuideBox(3, "Use intention inspector", "When you click on an intention, a menu on the right panel will appear allowing you to change characteristics of your selected intention. In this inspector, you can change the name of your intention, set its initial satisfaction value, choose its function type, and determine satisfaction values over set time points. To learn more about satisfaction values and models that change over time, see the documentation document in the documentation dropdown.", "Placeholder"),
        new GuideBox(4, "Link intentions", "Links connect intentions to one another and specify their relationship. To create a link, click on an intention and then drag the right arrow to another intention to connect them. Once a link has been created, click on the link and select the gear icon to choose the link type, click on the red X icon to delete the link, or drag anywhere on the arrow to create joints in the arrow. To learn more about the different link types, see the documentation document in the documentation dropdown.", "Placeholder"),
    ];

    static analyze = [
        new GuideBox(0, "Analyze model", "Once you have created your model, click the analysis button to analyze potential outcomes over time. Analysis mode allows you to visualize potential outcomes of the model over time. Based on the number of timepoints and constraints you choose, analysis mode will assign satisfaction values to each intention for each timepoint.", "Placeholder"),
        new GuideBox(1, "Choose conflict prevention level", "Choose a level from the dropdown to determine how many conflicting satisfaction values can be present in the model. “Strong” indicates that the model will try to avoid any conflicting satisfaction values and “None” indicates that the model will not do anything to avoid conflicting satisfaction values. To see more information about conflicting satisfaction values, see the documentation document in the documentation dropdown.", "Placeholder"),
        new GuideBox(2, "Specify number of timepoints", "To specify the number of timepoints you would like to see in analysis, click the text box with “1” in it and then either type in your desired number of states or click the up and down arrows to increment the number of states by one. The number of states you select will determine the number of possible outcomes of your model you are presented with.", "Placeholder"),
        new GuideBox(3, "Simulate path", "Once you have chosen your conflict prevention level and number of time points, click the “Simulate Path” button to display the outcome of analysis. Once the path is simulated, you will be presented with your model at the final time point with randomly assigned satisfaction values. To see other potential outcomes, move the slider on the bottom of the page left to see previous outcomes and right to see the next potential outcomes.", "Placeholder"),
    ]

    showGuideBox() {
        var tutorial;
        if (GuideBox.tutorial == 0) {
            tutorial = GuideBox.build;
        } else if (GuideBox.tutorial == 1) {
            tutorial = GuideBox.why;
        } else if (GuideBox.tutorial == 2) {
            tutorial = GuideBox.analyze;
        }
        console.log(tutorial)
        $('#guide-name').children('option').remove();
        var dialog = new joint.ui.Dialog({
            type: "info",
            width: 600,
            title: this.idx+1 + ". " + this.task,
            content: this.instructions + `\n<button class="learn-more">Learn More</button> <div class="more" style='display:none'>` + this.context + `</div>`,
            buttons: [
                {action: "next", content: "Next", position: "right"},
                {action: "cancel", content: "Cancel", position: "center"},
                {action: "back", content: "Back", position: "left"}
            ],
            draggable: true,
            modal: false,
        });

        document.getElementById("guide-name").style.display = "";
        for (var i = 0; i < tutorial.length; i ++) {
            if (i == GuideBox.step) {
                $('#guide-name').append(`<option value="${tutorial[i].idx}" selected>${tutorial[i].idx + 1 + ". " + tutorial[i].task}</option>`)
            } else {
                $('#guide-name').append(`<option value="${tutorial[i].idx}">${tutorial[i].idx + 1 + ". " + tutorial[i].task}</option>`)
            }
        }

        dialog.on('action:cancel', function () {
            dialog.close();
            document.getElementById('guide-name').style.display = "none";
        });

        dialog.on('action:close', function () {
            dialog.close();
            document.getElementById('guide-name').style.display = "none";
        });
        
        dialog.open();
        if (this.idx < tutorial.length-1) {
            dialog.on('action:next', this.openNext, dialog);
        }
        if (this.idx > 0) {
            dialog.on('action:back', this.openLast, dialog);
        }

        $('#guide-name').on('change', function () {
            dialog.close();
            console.log("never goes away");
        });
        $('.learn-more').on('click', function () {
            if (document.getElementsByClassName("more")[0].style.display == "none") {
                document.getElementsByClassName("more")[0].style.display = "";
                document.getElementsByClassName("learn-more")[0].textContent = "Show Less";
            } else {
                document.getElementsByClassName("more")[0].style.display = "none";
                document.getElementsByClassName("learn-more")[0].textContent = "Learn More";
            }
        });
    }

    openNext() {
        var tutorial;
        if (GuideBox.tutorial == 0) {
            tutorial = GuideBox.build;
        } else if (GuideBox.tutorial == 1) {
            tutorial = GuideBox.why;
        } else if (GuideBox.tutorial == 2) {
            tutorial = GuideBox.analyze;
        }
        GuideBox.step++;
        this.close();
        tutorial[GuideBox.step].showGuideBox();
    }

    openLast() {
        var tutorial;
        if (GuideBox.tutorial == 0) {
            tutorial = GuideBox.build;
        } else if (GuideBox.tutorial == 1) {
            tutorial = GuideBox.why;
        } else if (GuideBox.tutorial == 2) {
            tutorial = GuideBox.analyze;
        }
        GuideBox.step--;
        this.close();
        tutorial[GuideBox.step].showGuideBox();
    }

    static skip() {
        GuideBox.step = document.getElementById('guide-name').value;
        tutorial[GuideBox.step].showGuideBox();
    }
}

$('#build-btn').on('click', function() {
    GuideBox.build[0].showGuideBox();
    GuideBox.tutorial = 0;
    GuideBox.step = 0;
});

$('#why-btn').on('click', function() {
    GuideBox.why[0].showGuideBox();
    GuideBox.tutorial = 1;
    GuideBox.step = 0;
});

$('#analyze-btn').on('click', function() {
    GuideBox.analyze[0].showGuideBox();
    GuideBox.tutorial = 2;
    GuideBox.step = 0;
});

$('#guide-name').on('change', function () {
    GuideBox.skip();
});

//     /** About BloomingLeaf button */
//     $('#about-BloomingLeaf').on('click', function () { 
//     const dialog1 = showAlert('About',
//         '<p> BloomingLeaf is a browser-based tool that uses precise semantics (with Tropos) to model goals and ' +
//         'relationships that evolve over time. Simulation techniques are used to enable stakeholders to choose between ' +
//         'design alternatives, ask what-if questions, and plan for software evolution in an ever-changing world. '+
//         'BloomingLeaf implements the Evolving Intentions framework.</p>',
//         window.innerWidth * 0.5, 'alert', 'warning');      
//     });
   
//     /** Model Creation button */
//    $('#help-model-creation').on('click', function () { 
//         const dialog2 = showAlert('Model Creation',
//         '<p> We recommend going through the documentation first to get yourself used to notions of actor, goal, soft goal, resource, and task. </p>' +
//         '<p> Once you have done that, click on next to go through the steps of model creation.</p>' +
//         '<div> <button type="button" class="help-buttons" style= "width:50%" id="next"> Next </button>' +
//         '<button type="button" style= "width:50%" class="help-buttons" > Cancel </button> </div>',
//         window.innerWidth * 0.5, 'alert', 'warning');
//         document.querySelectorAll('.help-buttons').forEach(function (button) {
//             button.addEventListener('click', function () { 
//                 dialog2.close(); 
//                 if (button.id=='next') {showDialog3();};
//             });
//         });
//     });
   

//     function showDialog3() {
//         const dialog3 = showAlert('Model Creation',
//         '<p> Now let us get you ....</p>' +
//         '<div> <button type="button" class="help-buttons" style= "width:50%" id="next"> Next </button>' +
//         '<button type="button" style= "width:50%" class="help-buttons"> Cancel </button> </div>',
//         window.innerWidth * 0.5, 'alert', 'warning');
//         document.querySelectorAll('.help-buttons').forEach(function (button) {
//             button.addEventListener('click', function () { 
//                 dialog3.close(); 
//             });
//         });
//     } 
   



//    $('#Other-help').on('click', function () { 
//     let question = prompt("Please enter your question here", "I need help with ...");
//     //register the question here 
//    });

/**
 * Displays the absolute and relative assignments modal for the user.
 */
$('#btn-view-assignment').on('click', function () {
    removeHighlight();
    clearInspector();
    var assignmentsModal = new AssignmentsTable({ model: graph });
    $('#assignments-list').append(assignmentsModal.el);
    assignmentsModal.render();
});

$('#btn-view-intermediate').on('click', function () {
    removeHighlight();
    clearInspector();
    var intermediateValuesTable = new IntermediateValuesTable({ model: graph });
    $('#intermediate-table').append(intermediateValuesTable.el);
    intermediateValuesTable.render();
    $('.intermT').height($('#paper').height() * 0.9);
});

// /**
//  *  Display BloomingLeaf help popups
//  */
//  $('#BL-help-1').on('click', function () {
//     const dialog = showAlert('Testing',
//                     'Testing',
//                     window.innerWidth * 0.3, 'alert', 'warning');
// });

// $('#BL-help-2').on('click', function () {
//     removeHighlight();
//     clearInspector();
//     var intermediateValuesTable = new IntermediateValuesTable({ model: graph });
//     $('#intermediate-table').append(intermediateValuesTable.el);
//     intermediateValuesTable.render();
// });

/**
 * Switches to Analysis view if there are no cycles and no syntax errors.
 */
$('#analysis-btn').on('click', function () {
    // Check if there are any syntax errors 
    var isError = syntaxCheck();
    /**
     * If there are cycles, then display error message.
     * Otherwise, remove any "red" elements.
     */
    var cycleList = cycleSearch();
    // Alerts user if there are any cycles 
    cycleResponse(cycleList);
    if (!isACycle(cycleList) && !isError && hasElements()) {
        clearCycleHighlighting();
        switchToAnalysisMode();
    }
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
$('#modeling-btn').on('click', function () { switchToModellingMode(); });

/*** Events for Rappid/JointJS objets ***/

/** Graph Events */

// Whenever an element is added to the graph
graph.on("add", function (cell) {
    // Find how many cells are created on the graph
    var createdInstance = paper.findViewsInArea(paper.getArea())

    if (cell instanceof joint.shapes.basic.CellLink) {
        if (graph.getCell(cell.get("source").id) instanceof joint.shapes.basic.Actor) {
            cell.label(0, { attrs: { text: { text: "is-a" } } });
            cell.set('link', new LinkBBM({ displayType: "actor", linkType: 'is-a' }));
        } else {
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
        var name;
        if (createdInstance.length >= 2) {
            var numList = "";
            for (let i = 2; i < createdInstance.length + 1; i++) {
                // Gets the number from an actor's name 
                var nameIndex = parseInt(createdInstance[createdInstance.length - i].model.attr('.name/text').split('_').pop());
                // If name has been changed 
                if (createdInstance[createdInstance.length - i].model.attr('.name/text').split('_').shift() == "Actor") {
                    numList += nameIndex + " ";
                };
            }
            numList = numList.split(" ");
            // Removes non-number values from array
            for (var i = numList.length - 1; i >= 0; i--) {
                if (isNaN(numList[i]) || numList[i] === 0 || numList[i] === false || numList[i] === "" || numList[i] === undefined || numList[i] === null) {
                    numList.splice(i, 1);
                }
            }
            // If all actor names have been changed
            if (numList.length == 0){
                name = cell.attr('.name/text') + "_0";
            } else {
                // Gets highest number from array
                name = cell.attr('.name/text') + "_" + (Math.max.apply(null, numList) + 1);
            }
        // Creates first actor name
        } else {
            name = cell.attr('.name/text') + "_0";
        }

        cell.set('actor', new ActorBBM({ actorName: name }));
        cell.attr(".name/text", name);

        // Send actors to background so elements are placed on top
        cell.toBack();
    }

    resetConfig()
    // Trigger click on cell to highlight, activate inspector, etc. 
   paper.trigger("cell:pointerup", cell.findView(paper));
});

// Auto-save the cookie whenever the graph is changed.
graph.on("change", function () {
    var graphtext = graph.toJSON();
    document.cookie = "graph=" + graphtext;
});

graph.on('remove', function (cell) {
    // Clear right inspector side panel
    clearInspector();
    // Clear Config view
    resetConfig();

    /**  TODO: Determine if we still need the rest of the code in this function. 
     *   Figure out how to make the element inspector automatically update after the function 
     *   label is changed to (no value) for the element. Currently the user needs to click the 
     *   element again for it to update. 
    */

    // if (cell.isLink() && !(cell.prop("link-type") == 'NBT' || cell.prop("link-type") == 'NBD')) {
    //     // To remove link
    //     var link = cell;
    //     // model.removeLink(link.linkID);
    // }

    if ((!cell.isLink()) && (!(cell.prop("type") == "basic.Actor"))) {
        if (cell.get('parent')) {
            graph.getCell(cell.get('parent')).unembed(cell);
        }
    }

    else if (cell.isLink()) {
        if (cell.get('link') !== null) {
            if (cell.get('link').get("linkType") == 'NBT' || cell.get('link').get("linkType") == 'NBD') {
                // Verify if is a Not both type. If it is remove labels from source and target node
                var source = graph.getCell(cell.get('source').id);
                var target = graph.getCell(cell.get('target').id);
                // Verify if it is possible to remove the NB tag from source and target
                if (source !== null && !checkForMultipleNB(source)) {
                    source.get('intention').get('evolvingFunction').set('type', 'NT');
                    source.get('intention').getUserEvaluationBBM(0).set('assignedEvidencePair', '(no value)');
                    source.attr('.funcvalue/text', '');
                    source.attr('.satvalue/text', '');
                }
                if (target !== null && !checkForMultipleNB(target)) {
                    target.get('intention').get('evolvingFunction').set('type', 'NT');
                    target.get('intention').getUserEvaluationBBM(0).set('assignedEvidencePair', '(no value)');
                    target.attr('.funcvalue/text', '');
                    target.attr('.satvalue/text', '');
                }
            }
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
            if (cell instanceof joint.shapes.basic.CellLink) { // Link behavior
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
                    // If user was dragging actor 
                    if (evt.data.move) {
                        // AND actor doesn't overlap with other actors
                        var overlapCells = paper.findViewsInArea(cell.getBBox());
                        var overlapActors = overlapCells.filter(view => view.model instanceof joint.shapes.basic.Actor);
                        if (overlapActors.length == 1){
                            // Embed each overlapping intention in actor
                            var actorCell = overlapActors[0].model;
                            var overlapIntentions = overlapCells.filter(view => view.model instanceof joint.shapes.basic.Intention);

                            for (var i=0; i < overlapIntentions.length; i++) {
                                var intention = overlapIntentions[i].model;
                                // Unembed intention from old actor
                                if (intention.get('parent')) {
                                    graph.getCell(intention.get('parent')).unembed(intention);
                                }
                                // Embed intention in new actor
                                actorCell.embed(intention);
                            }
                        }
                    }
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
                        
                        // Find overlapping cells
                        var overlapCells = paper.findViewsFromPoint(cell.getBBox().center());

                        // Find actors which overlap with cell
                        // Embed element in new actor
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
    if ($('.analysis-only').css("display") == "none") {
        clearInspector();
    } else {
        setName();
    }
});

// Link equivalent of the element editor
paper.on("link:options", function (cell) {

    clearInspector();

    if (cell.model.get('link').get('displayType') == 'error') {
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
    let selectResult = undefined;

    /** Simulate Single Path: 
     * Selects the current configuration and passes to backendSimulationRequest()  */
    $('#simulate-path-btn').on('click', function () {
        var curRequest = configCollection.findWhere({ selected: true });
        var numRel = $('#num-rel-time'); 
        //Can't simulate path when num-rel-time equals 0
        if (numRel.val() == 0) {
            swal("Num Relative Time Points cannot be 0", "", "error");
        } else {
            curRequest.set('action', 'singlePath');
            backendSimulationRequest(curRequest); }
    });
    /** All Next States:
     * Selects the current configuration and prior results and passes them to backendSimulationRequest()  */
    $('#next-state-btn').on('click', function () {
        var curRequest = configCollection.findWhere({ selected: true });
        // Checks to see if single path has been run by seeing if there are any results
        if (typeof curRequest.previousAttributes().results === 'undefined' || curRequest.previousAttributes().results.length == 0) {
            var singlePathRun = false;
        } else {
            var singlePathRun = true;
        }

        // If single path has been run backend analysis
        if (singlePathRun === true) {
            $("body").addClass("spinning"); // Adds spinner animation to page
            var curResult = curRequest.previousAttributes().results.findWhere({ selected: true });
            curRequest.set('action', 'allNextStates');
            curRequest.set('previousAnalysis', curResult);

            // If the last time point is selected, error message shows that you can't open Next State
            if (EVO.sliderOption==1 || EVO.sliderOption==2){ 
                swal("Error: Cannot explore next states with EVO in % or Time.", "", "error");
                $("body").removeClass("spinning"); // Remove spinner from page
            } else if ((curResult.get('timePointPath').length - 1) === curResult.get('selectedTimePoint')) {
                swal("Error: Cannot explore next states with last time point selected.", "", "error");
                $("body").removeClass("spinning"); // Remove spinner from page
            } else {
                backendSimulationRequest(curRequest);
            }
        } else { // If single path has not been run show error message
            swal("Error: Cannot explore next states before simulating a single path.", "", "error");
        }
    });

    function resetConfig() {
        var model;
        while (model = configCollection.first()) {
            model.destroy();
        }
    }

    /**
     * This is an option under clear button to clear red-highlight from
     * cycle detection function
     */

    $('#btn-clear-analysis').on('click', function () {
        resetConfig();
        // Updates EVO slider
        $('#modelingSlider').css("display", "");
        $('#analysisSlider').css("display", "none");
        EVO.switchToModelingMode(undefined);
        revertNodeValuesToInitial(selectResult);
        // Creates new config
        $('#configID').append(configInspector.el);
        configInspector.render();
    });

    $('#btn-clear-results').on('click', function () {
        var results;
        for (var i = 0; i < configCollection.length; i++) {
            while (results = configCollection.models[i].get('results').first()) {
                results.destroy();
            }
        }
        $('.result-elements').remove();
        // Updates EVO slider
        $('#modelingSlider').css("display", "");
        $('#analysisSlider').css("display", "none");
        EVO.switchToModelingMode(undefined);
        revertNodeValuesToInitial(selectResult);
    });

    /**
     * Helper function for switching to Analysis view.
     */
    function switchToAnalysisMode() {
        setInteraction(false);

        document.getElementById("colorResetAnalysis").value = 1;
        // Clear the right panel
        clearInspector();

        removeHighlight();
        configInspector = new ConfigInspector({ collection: configCollection });
        $('#configID').append(configInspector.el);
        configInspector.render();

        // Remove model only elements 
        $('.model-only').css("display", "none");
        $('#paper').css("right", "0px");

        // Show extra tools for analysis mode
        $('.analysis-only').css("display", "");

        // Disable link settings
        $('.link-tools').css("display", "none");

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
            if (selectResult !== undefined) {
                selectResult.set('selected', false);
            }

            // Reset to initial graph prior to analysis
            revertNodeValuesToInitial(selectResult);

            // Remove analysis only elements 
            $('.analysis-only').css("display", "none");

            // Show extra tools for modelling mode
            $('.model-only').css("display", "");
            $('#paper').css("right", "260px");

            // Reinstantiate link settings
            $('.link-tools').css("display", "");
            EVO.switchToModelingMode(selectResult);
            // Remove configInspector and analysis view
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

    // Load ConfigCollection for display 
    // TODO: modify it to read results after results can be shown
    function loadConfig(loadedConfig) {
        var selectedConfig;
        var selectedResult;
        // Clears current configCollection
        resetConfig();

        // Individually creates each ConfigBBM and add to collection
        for (let config of loadedConfig) {
            if (config.selected) { // If selected is true
                selectedConfig = config.name; // Record the name of config
            }
            var configBBM = new ConfigBBM({ name: config.name, action: config.action, conflictLevel: config.conflictLevel, numRelTime: config.numRelTime, currentState: config.currentState, previousAnalysis: config.previousAnalysis, selected: config.selected })
            if (config.results.length !== 0) { // Creates results if there applicable
                var results = configBBM.get('results'); // Grabs the coolection from the configBBM
                // Individually creates each ResultBBM and add to collection
                for (let result of config.results) {
                    if (result.selected) { // If selected is true
                        selectedResult = result.name; // Record the name of result
                    }
                    var resultsBBM = new ResultBBM({ name: result.name, assignedEpoch: result.assignedEpoch, timePointPath: result.timePointPath, elementList: result.elementList, allSolution: result.allSolution, colorVis: result.colorVis, selectedTimePoint: result.selectedTimePoint, selected: result.selected });
                    results.add(resultsBBM)
                }
                configCollection.add(configBBM);
            }
            configCollection.add(configBBM);
        }

        // Sets what the config/result the user was last on as selected
        var configGroup = configCollection.filter(Config => Config.get('name') == selectedConfig); //Find the config with the same name as the selected that is read in
        if (configGroup.length !== 0) {
            configGroup[0].set('selected', true); // Set the selected to true
        }

        var currResult;
        if (configGroup[0].get('results').length !== 0) { // Within that selected config
            // Set selected of the selected result as true
            currResult = configGroup[0].get('results').filter(selectedRes => selectedRes.get('name') == selectedResult)[0]
            currResult.set('selected', true);
        }
    }

    function loadOldConfig(oldAnalysisRequest) {
        var configBBM = new ConfigBBM({conflictLevel: oldAnalysisRequest.conflictLevel, numRelTime: oldAnalysisRequest.numRelTime, currentState: oldAnalysisRequest.currentState})
        configCollection.add(configBBM);
    }

    /**
     * 
     * Set selectResult from functions outside of the parenthesis
     * @param {*} result 
     */
    function setSelectResult(result) {
        selectResult = result;
    }

    // Save the current graph and analysis (without results) to json file
    $('#btn-save-analysis').on('click', function () {
        var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
        if (name) {
            clearCycleHighlighting(selectResult);
            EVO.deactivate();
            var fileName = name + ".json";
            var obj = getModelAnalysisJson(configCollection);
            download(fileName, stringifyCirc(obj));
        }
    });

    // Save the current graph and analysis (with results) to json file
    $('#btn-save-all').on('click', function () {
        var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
        if (name) {
            clearCycleHighlighting(selectResult);
            EVO.deactivate();
            var fileName = name + ".json";
            var obj = getFullJson(configCollection);
            download(fileName, stringifyCirc(obj));
        }
    });

    // Workaround for load, activates a hidden input element
    $('#btn-load').on('click', function () {
        $('#loader').click();
        // Sets EVO to off when you load a model
        EVO.setSliderOption(0);
        EVO.refreshSlider();
    });

    $(window).resize(function () {
        var config = configCollection.findWhere({ selected: true });
        if (config !== undefined) {
            var configResults = config.get('results').findWhere({ selected: true });
            if (configResults !== undefined) {
                resizeWindow(configResults.get('timePointPath').length - 1);
            }
        }
        $('.intermT').height($('#paper').height() * 0.9);
    });
    $('#btn-clear-cycle').on('click', function () {
        clearCycleHighlighting(selectResult);
    });

    // Save the current graph to json file
    $('#btn-save').on('click', function () {
        var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
        if (name) {
            clearCycleHighlighting(selectResult);
            EVO.deactivate();
            // EVO.returnAllColors(graph.getElements(), paper);
            // EVO.revertIntentionsText(graph.getElements(), paper);  
            var fileName = name + ".json";
            var obj = { graph: graph.toJSON() }; // Same structure as the other two save options
            obj.version = "BloomingLeaf_2.0";
            download(fileName, stringifyCirc(obj));
            EVO.refresh(selectResult);
        }
    });


    $('#btn-clear-elabel').on('click', function () {
        for (let element of graph.getElements()) {
            var cell = element.findView(paper).model;
            var intention = cell.get('intention');

            if (intention != null) {
                var initSatVal = intention.getUserEvaluationBBM(0).get('assignedEvidencePair');
                if (intention.get('evolvingFunction') != null) {
                    var funcType = intention.get('evolvingFunction').get('type');
                }
            }

            // If the initsatVal is not empty and if funcType empty
            if (intention != null && initSatVal != '(no value)' && funcType === 'NT') {
                intention.removeInitialSatValue();
                cell.attr(".satvalue/text", "");
                $('#init-sat-value').val('(no value)');
            }
        }
        EVO.refresh(selectResult);
    });

    $('#color-palette-1').on('click', function () { // Choose color palettes
        EVO.paletteOption = 1;
        highlightPalette(EVO.paletteOption);
        if ($('#analysisSlider').css("display") == "none") {
            EVO.refresh(undefined);
        } else {
            EVO.refresh(selectResult);
        }
    });

    $('#color-palette-2').on('click', function () { // Choose color palettes
        EVO.paletteOption = 2;
        highlightPalette(EVO.paletteOption);
        if ($('#analysisSlider').css("display") == "none") {
            EVO.refresh(undefined);
        } else {
            EVO.refresh(selectResult);
        }
    });
    $('#color-palette-3').on('click', function () { // Choose color palettes
        EVO.paletteOption = 3;
        highlightPalette(EVO.paletteOption);
        if ($('#analysisSlider').css("display") == "none") {
            EVO.refresh(undefined);
        } else {
            EVO.refresh(selectResult);
        }
    });

    $('#color-palette-4').on('click', function () { // Choose color palettes
        EVO.paletteOption = 4;
        highlightPalette(EVO.paletteOption);
        if ($('#analysisSlider').css("display") == "none") {
            EVO.refresh(undefined);
        } else {
            EVO.refresh(selectResult);
        }
    });

    $('#color-palette-5').on('click', function () { // Choose color palettes
        EVO.paletteOption = 5;
        highlightPalette(EVO.paletteOption);
        if ($('#analysisSlider').css("display") == "none") {
            EVO.refresh(undefined);
        } else {
            EVO.refresh(selectResult);
        }
    });

    $('#color-palette-6').on('click', function () { // Choose color palettes
        EVO.paletteOption = 6;
        highlightPalette(EVO.paletteOption);
        //render a table
        $('#color-input').css("display", "");
        if ($('#analysisSlider').css("display") == "none") {
            EVO.refresh(undefined);
        } else {
            EVO.refresh(selectResult);
        }
    });

    //Show warning messages if use input invalid color
    $('#submit-color').on('click', function () {

        if (Object.values(EVO.selfColorVisDict).some((v) => validateColor(v) == false)) { swal("Invalid Color", "", "error"); }
    });

    /**
     * Source:https://www.w3schools.com/howto/howto_js_rangeslider.asp 
     * Two option modeling mode slider
     */
    document.getElementById("colorReset").oninput = function () { // Turns slider on/off and refreshes
        EVO.setSliderOption(this.value, selectResult);
    }
    /**
     * Four option analysis mode slider
     */
    document.getElementById("colorResetAnalysis").oninput = function () { // Changes slider mode and refreshes
        var selectConfig;
        //TODO: Find out why the selectResult is empty before we reassign it
        if (configCollection.length !== 0) {
            selectConfig = configCollection.filter(Config => Config.get('selected') == true)[0];
            if (selectConfig.get('results') !== undefined) {
                selectResult = selectConfig.get('results').filter(resultModel => resultModel.get('selected') == true)[0];
            }
        }
        EVO.setSliderOption(this.value, selectResult);
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
 * Trigger setConfigName outside ConfigInspector 
 */
 function setName() {
    $('.config-input').trigger('outsideSetName');
}

/**
 * Returns true iff node has 1 or more NBT or NBD relationship
 *
 * @param {joint.dia.element} node
 * @returns {Boolean}
 */
function checkForMultipleNB(element) {
    var num = 0;
    var localLinks = graph.getConnectedLinks(element);
    if (localLinks != null) {
        for (var i = 0; i < localLinks.length; i++) {
            if (localLinks[i].get('link').get("linkType") == 'NBT' || localLinks[i].get('link').get("linkType") == 'NBD') {
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
 * @param {String} type 
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
function revertNodeValuesToInitial(analysisResult) {
    var elements = graph.getElements();
    var curr;
    for (var i = 0; i < elements.length; i++) {
        curr = elements[i].findView(paper).model;
        if (curr.get('type') !== 'basic.Goal' &&
            curr.get('type') !== 'basic.Task' &&
            curr.get('type') !== 'basic.Softgoal' &&
            curr.get('type') !== 'basic.Resource') {
            continue;
        }
        var intention = curr.get('intention');
        var initSatVal = intention.getUserEvaluationBBM(0).get('assignedEvidencePair');

        if (initSatVal === '(no value)') {
            curr.attr('.satvalue/text', '');

        } else {
            curr.attr('.satvalue/text', satisfactionValuesDict[initSatVal].satValue);
        }
        curr.attr({ text: { fill: 'black', stroke: 'none', 'font-weight': 'normal', 'font-size': 10 } });
    }
    // Remove slider
    if (analysisResult !== undefined) {
        SliderObj.removeSlider(analysisResult);
    }
}

/**
 * Stringifies the code but avoids the circular structured components
 */
function stringifyCirc(obj) {
    var skipKeys = ['_events', 'change:refEvidencePair', 'context', '_listeners']; // List of keys that contains circular structures
    var graphtext = JSON.stringify(obj, function (key, value) {
        if (skipKeys.includes(key)) { //if key is in the list
            return null; // Replace with null
        } else {
            return value; // Otherwise return the value
        }
    });

    return graphtext
}

/**
 * Highlights the chosen palette on the dropdown
 */
function highlightPalette(paletteOption) {
    for (var i = 1; i <= 5; i++) {
        var id = '#color-palette-'
        id = id + i;
        if (i == paletteOption) {
            $(id).css("background-color", "rgba(36, 150, 255, 1)"); //highlight the choice
        }
        else {
            $(id).css("background-color", "#f9f9f9");
        }
    }
}
/**
 * Validates if the input colors are hexcolor
 */
function validateColor(color) {
    const COLOR_PATTERN = new RegExp("^(#[a-fA-F0-9]{6})$");
    return COLOR_PATTERN.test(color);
}