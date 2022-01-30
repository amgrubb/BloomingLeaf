/**
 * This file contains functions related to buttons/webpage elements only assessable in the Next State window. 
 * This is to prevent errors in the main window caused by rendering functions associated with elements only initialized in analysis.html.
 * 
 */

// Only event listeners
$('#btn-zoom-in').on('click', function () { zoomIn(analysis.paperScroller); });
$('#btn-zoom-out').on('click', function () { zoomOut(analysis.paperScroller); });
$('#btn-fnt').on('click', function () { defaultFont(analysis.paper); });
$('#btn-fnt-up').on('click', function () { fontUp(analysis.paper); });
$('#btn-fnt-down').on('click', function () { fontDown(analysis.paper); });
$('#nextStateSlider').on('mouseup', function () { renderEVO(); })
$('.inspector-btn-small').on('click', function () { goToState(); });
$('.filter_checkbox').on('mousedown', function () { $("body").addClass("spinning"); }); // Adds waiting spinner to cursor
$('.filter_checkbox').on('click', function () { add_filter() });
$("#saveClose").on('click', function () { save_current_state(); });
$("#exploreNextStates").on('click', function () { generate_next_states(); });
$("#close").on('click', function () { window.close(); });
$(window).resize(function () {
    resizeWindow();
});

$("#paper").on('click', function(){ cellHighlight(analysis.paper)});

/**
 * TODO: Be able to click on individual cell to highlight, not highlight all cells :o
 * @param {*} pPaper 
 */
 function cellHighlight(pPaper){
    var elements = analysis.graph.getElements();
    for (var i = 0; i < elements.length; i++) {
        var cellView = elements[i].findView(pPaper);
        cellView.highlight();
    }
}

// Navigation bar functions:
var max_font = 20;
var min_font = 6;
var current_font = 10;
var default_font = 10;
var graph = new joint.dia.BloomingGraph();

/**
 * 
 * @param {*} pPaperScroller 
 */
function zoomIn(pPaperScroller) {
    pPaperScroller.zoom(0.2, { max: 3 });
}

/**
 * 
 * @param {*} pPaperScroller 
 */
function zoomOut(pPaperScroller) {
    pPaperScroller.zoom(-0.2, { min: 0.2 });
}

/**
 * Helper function function for fontUp, fontDown, and defaultFont
 * @param {int} new_font 
 * @param {*} pPaper
 */
function changeFont(new_font, pPaper) {
    var elements = analysis.graph.getElements();

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

/**
 * 
 * @param {*} sliderMax 
 */
function resizeWindow(sliderMax) {
    $('#slider').css("margin-top", $(this).height() * 0.7);
    $('#slider').width($('#paper').width() * 0.8);
    SliderObj.adjustSliderWidth(sliderMax);
}

/** Paper Events **/

/**
 * Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
 * Otherwise, initiate paper pan.
 */
 analysis.paper.on('blank:pointerdown', function (evt, x, y) {
    paperScroller.startPanning(evt, x, y);
});

/**
 * Specifies behavior for clicking on cells and moving intentions/links
 */
// TODO: Find better way to handle move instances than adding data to event and passing forward
analysis.paper.on({
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
analysis.paper.on('blank:pointerclick', function () {
    removeHighlight();
    if ($('.analysis-only').css("display") == "none") {
        clearInspector();
    }
});

// Link equivalent of the element editor
analysis.paper.on("link:options", function (cell) {

    clearInspector();

    if (cell.model.get('link').get('displayType') == 'error') {
        alert('Sorry, this link is not valid. Links must be between two elements of the same type. Aka Actor->Actor or Intention->Intention');
        return;
    }

    var linkInspector = new LinkInspector({ model: cell.model });
    $('.inspector').append(linkInspector.el);
    linkInspector.render();

});