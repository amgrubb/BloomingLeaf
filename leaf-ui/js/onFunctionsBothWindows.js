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

function resizeWindow() {
    $('#slider').css("margin-top", $(this).height() * 0.9);
    $('#slider').width($('#paper').width() * 0.8);
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

