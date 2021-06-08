/**
 * This file contains functions related to buttons/webpage elements only assessable in the Next State window. 
 * This is to prevent errors in the main window caused by rendering functions associated with elements only initialized in analysis.html.
 * 
 */

// var sliderNextState = document.getElementById("colorResetNextState");
// sliderNextState.oninput = function() { //changes slider mode and refreshes 
//     EVONextState.setSliderOption(this.value);
// }

//Only event listeners
$('#btn-zoom-in').on('click', function(){ zoomIn(analysis.paperScroller); });
$('#btn-zoom-out').on('click', function(){ zoomOut(analysis.paperScroller); });
$('#btn-fnt').on('click', function(){ defaultFont(analysis.paper);});
$('#btn-fnt-up').on('click', function(){  fontUp(analysis.paper);});
$('#btn-fnt-down').on('click', function(){ fontDown(analysis.paper);});
$('#inspector-btn-small').on('click', function(){ goToState(); });
$('#conflictFl').on('click', function(){ add_filter();});
$('#leastTasksSatisfied').on('click', function(){ add_filter();});
$('#mostTasksSatisfied').on('click', function(){ add_filter();});
$('#leastResource').on('click', function(){ add_filter();});
$('#mostResource').on('click', function(){ add_filter();});
$('#leastGoalSatisfied').on('click', function(){ add_filter();});
$('#mostGoalSatisfied').on('click', function(){ add_filter();});
$('#LeastActor').on('click', function(){ add_filter();});
$('#mostActor').on('click', function(){ add_filter();});
$('#mostConstraintSatisfaction').on('click', function(){ add_filter();});

$("#saveClose").on('click', function() { save_current_state();});
$("#exploreNextSates").on('click', function() { generate_next_states();});
$("#close").on('click', function() { window.close();});