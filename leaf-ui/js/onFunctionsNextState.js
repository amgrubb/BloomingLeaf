/**
 * This file contains functions related to buttons/webpage elements only assessable in the Next State window. 
 * This is to prevent errors in the main window caused by rendering functions associated with elements only initialized in analysis.html.
 * 
 */

//Only event listeners
$('#btn-zoom-in').on('click', function(){ zoomIn(analysis.paperScroller); });
$('#btn-zoom-out').on('click', function(){ zoomOut(analysis.paperScroller); });
$('#btn-fnt').on('click', function(){ defaultFont(analysis.paper);});
$('#btn-fnt-up').on('click', function(){  fontUp(analysis.paper);});
$('#btn-fnt-down').on('click', function(){ fontDown(analysis.paper);});
$('#inspector-btn-small').on('click', function(){ goToState(); });
$('.filter_checkbox').on('click', function(){add_filter()});
$("#saveClose").on('click', function() { save_current_state();});
$("#exploreNextSates").on('click', function() { generate_next_states();});
$("#close").on('click', function() { window.close();});
$(window).resize(function() {
	resizeWindow();
});