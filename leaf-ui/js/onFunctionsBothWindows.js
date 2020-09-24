/**
 * This file contains functions assessable to both the main window and Next State window, associated with html elements.
 */

 
// navigation bar functions:

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
    for (var i = 0; i < elements.length; i++){
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

    if(new_font <= max_font) {
        changeFont(new_font, pPaper)
    }
}

/**
 * Decreases font size by 1
 * @param {*} pPaper 
 */
function fontDown(pPaper) {
    var new_font = current_font - 1;

    if(new_font >= min_font) {
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

//end nav bar functions
