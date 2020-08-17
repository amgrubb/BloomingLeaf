/**
 * This file contains functions assessable to both the main window and Next State window, associated with html elements.
 */

 
// navigation bar functions:

var max_font = 20;
var min_font = 6;
var current_font = 10;

function zoomIn(pPaperScroller) {
    pPaperScroller.zoom(0.2, { max: 3 });
}

function zoomOut(pPaperScroller) {
pPaperScroller.zoom(-0.2, { min: 0.2 });
}

function fontUp(pPaper) {
    var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
        var cellView = elements[i].findView(pPaper); 
        
        if (cellView.model.attr(".name/font-size") < max_font){
			cellView.model.attr(".name/font-size", cellView.model.attr(".name/font-size") + 1);
		}
	}
}

function fontDown(pPaper) {
    var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
        var cellView = elements[i].findView(pPaper); 
        if (cellView.model.attr(".name/font-size") > min_font){
			cellView.model.attr(".name/font-size", cellView.model.attr(".name/font-size") - 1);
		}
	}
}

function defaultFont(pPaper) {
    var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
        var cellView = elements[i].findView(pPaper); 
        cellView.model.attr(".name/font-size", 10);
	}
}

//end nav bar functions
