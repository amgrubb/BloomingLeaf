/**
 * This file contains functions related to buttons/webpage elements only assessable in the Next State window. 
 * This is to prevent errors in the main window caused by rendering functions associated with elements only initialized in analysis.html.
 * 
 */

// Only event listeners
$("#paper").on('mousedown', function(){ cellHighlight(analysis.paper)});
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

/**
 * Highlight an individual cell upon clicking
 * @param {*} pPaper 
 */
 function cellHighlight(pPaper) {
    // Unhighlight cells that are not the cell to be targeted
    pPaper.on('cell:pointerup', function() {
        pPaper.findViewsInArea(pPaper.getArea()).forEach(cell => {
            cell.unhighlight();
        });
    });

    // Highlight the targeted cell upon clicking
    pPaper.on('cell:pointerclick', function(cellView) {
        if (cellView.model.attributes.intention) { // Only highlight intentions
            cellView.highlight();
            // Fills in nodeName text box with intention name
            $(".cell-attrs-text").val(cellView.model.attributes.intention.attributes.nodeName);
            // TODO: if the page is changed or filters are added it does not update
            // TODO: indexing by name "TNS-R" might be too brittle
            originalResults2 = $.extend(true, {}, myInputJSObject.results);
            
            // Finds the element number of the selected intention
            for (var element_index = 0; element_index < originalResults2.attributes.elementList.length; element_index++) {
                if (originalResults2.attributes.elementList[element_index].id == cellView.model.attributes.id) {
                    elementNum = element_index;
                }
            }
  
            // Fills in the current sat value text box
            switch (originalResults2.get('allSolutions')["TNS-R"][parseInt($("#currentPage").val())][elementNum]) {
                case "0000":
                    return $(".cell-attrs-text2").val("None (⊥, ⊥)");
                case "0011":
                    return $(".cell-attrs-text2").val("Satisfied (F, ⊥)");
                case "0010":
                    return $(".cell-attrs-text2").val("Partially Satisfied (P, ⊥)");
                case "0100":
                    return $(".cell-attrs-text2").val("Partially Denied (⊥, P)");
                case "1100":
                    return $(".cell-attrs-text2").val("Denied (⊥, F)");
                case "unknown":
                    return $(".cell-attrs-text2").val("(no value)");
                default:
                    return $(".cell-attrs-text2").val("conflict");   
            }

        }
    });

    // Unhighlight all cells when blank paper is clicked on
    pPaper.on('blank:pointerdown', function() {
        pPaper.findViewsInArea(pPaper.getArea()).forEach(cell => {
            cell.unhighlight();
        });
    });

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