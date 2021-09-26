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
$('.inspector-btn-small').on('click', function () { goToState(); });
$('.filter_checkbox').on('mousedown', function () { $("body").addClass("spinning"); }); // Adds waiting spinner to cursor
$('.filter_checkbox').on('click', function () { add_filter() });
$("#saveClose").on('click', function () { save_current_state(); });
$("#exploreNextStates").on('click', function () { generate_next_states(); });
$("#close").on('click', function () { window.close(); });
$(window).resize(function () {
    resizeWindow();
});

// Navigation bar functions:
var max_font = 20;
var min_font = 6;
var current_font = 10;
var default_font = 10;
var graph = new joint.dia.BloomingGraph();

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

function resizeWindow(sliderMax) {
    $('#slider').css("margin-top", $(this).height() * 0.7);
    $('#slider').width($('#paper').width() * 0.8);
    SliderObj.adjustSliderWidth(sliderMax)
}