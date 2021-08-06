/**
 * This file contains functions associated with the Next State window.
 */

{ // LOCAL GLOBAL VARIABLES
let analysis = {};
let filterOrderQueue = [];
let analysisRequest;
let analysisResult;
let allNextStatesResult; // we are replacing savedAnalysisData with allNextStatesResult
let selectedResult;
let graph;
let current;
let elements;
let oldGraph;

//Executing scripts only when page is fully loaded
window.onload = function(){
    //This merge the attributes of old page and new page
    // analysis.page = jQuery.extend({}, window.opener.document);
    page = jQuery.extend({}, window.opener.document);
    analysisRequest = JSON.parse(sessionStorage.getItem("Request"));
    console.log(analysisRequest);

    allNextStatesResult = JSON.parse(sessionStorage.getItem("Result"));
    console.log(allNextStatesResult);
  
    init();
    renderNavigationSidebar();
    //console.log(graph.toJSON());
    //console.log(JSON.stringify(graph));
}

function init(){
    // //Page objects
    // analysis.graph = new joint.dia.BloomingGraph();
    // analysis.paper;
    // analysis.paperScroller;

    // //Objects from parent page
    // analysis.parentResults = jQuery.extend({}, window.opener.global_analysisResult);

    // savedAnalysisData = _.clone(jQuery.extend(true, {}, window.opener.savedAnalysisData));
    //tempResults = jQuery.extend(true, {}, window.opener.savedAnalysisData.allNextStatesResult);

    analysisResult = analysisRequest.previousAnalysis;
    newGraph = new joint.dia.BloomingGraph();
    graph = jQuery.extend({}, window.opener.graph.toJSON());
    console.log("oldGraph: " + oldGraph)
    //loadFromObject();
    // for (let cell of analysis.graph.getElements()) {
    for (let result of analysisRequest.results) {
        if (result.selected == true) {
            selectedResult = result;
        }
    }
    console.log(selectedResult);
    current = parseInt(selectedResult.selectedTimePoint);

    paper = new joint.dia.Paper({
        width: 1200,
        height: 600,
        gridSize: 10,
        perpendicularLinks: false,
        model: newGraph,
        defaultLink: new joint.shapes.basic.CellLink({
            'attrs': {
                '.connection': {stroke: '#000000'},
                '.marker-source': {'d': '0'},
                '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
            },
            'labels': [{position: 0.5, attrs: {text: {text: "and"}}}]
        })
    });

    // paperScroller = new joint.ui.PaperScroller({
    //     autoResizePaper: true,
    //     paper: paper
    // });
  
    // $('#paper').append(paperScroller.render().el);
    // paperScroller.center();
    
    // $('#stencil').append(stencil.render().el);
    //elements = graph.getElements();
    /** TODO: reimplement this
    //Filter out Actors
    for (var i = 0; i < analysis.graph.getElements().length; i++){
        if (!(analysis.graph.getElements()[i] instanceof joint.shapes.basic.Actor))
            analysis.elements.push(analysis.graph.getElements()[i]);
    }
    */
    newGraph.fromJSON(JSON.parse(JSON.stringify(window.opener.graph.toJSON())));
    loadFromObject();
    // graph.fromJSON(oldGraph);
    // if(!analysis.analysisResult){
    //     analysis.analysisResult = analysisRequest.previousAnalysis;
    // }
    //console.log(graph.toJSON());
}

/**
 * Given an object obj containing a model, graph and analysis configurations and results, 
 * updates the global variables: model, graph and analysisMap
 * to the objects from obj
 * If the obj does not contain analysis information, do not update global vars
 *
 * @param {Object} obj
 */
 function loadFromObject() {
	//graph.fromJSON(obj.graph);
	var cells = newGraph.getCells();
	for (var i = 0; i < cells.length; i++) {
		cell = cells[i];
		if (cell.get('type') == "basic.Actor"){
			createBBActor(cell) //Create actor
		}else if (cell.get('type') == "basic.CellLink") {
			createBBLink(cell) //Create link
		}else{
			// Singled out functionSegList from obj as it doesn't show up in the graph after reading from JSON
            // TODO: check after this gets connected to the backend
			var funcseg = cell.get('intention').attributes.evolvingFunction.attributes.functionSegList;
			createBBElement(cell, funcseg) //Create element
		}
	}
}

/**
 * Returns a backbone model Actor with information from the obj
 *
 */
 function createBBActor(cell){
	var actor = cell.get('actor');
	var actorBBM = new ActorBBM({type: actor.attributes.type, actorName: actor.attributes.actorName});
	cell.set('actor', actorBBM)
}

$('#btn-debug').on('click', function(){ console.log(graph.toJSON()) });
/**
 * Returns a backbone model Link with information from the obj
 *
 */
function createBBLink(cell){
	var link = cell.get('link').attributes;
	var linkBBM = new LinkBBM({displayType: link.displayType, linkType: link.linkType, postType: link.postType, absTime: link.absTime, evolving: link.evolving});
	cell.set('link', linkBBM)
}

/**
 * Returns a backbone model Element with information from the obj
 *
 */
function createBBElement(cell, funcsegs){
	var intention = cell.get('intention');
	var evol = intention.attributes.evolvingFunction.attributes;
	var intentionBBM = new IntentionBBM({nodeName: intention.attributes.nodeName, nodeType: intention.attributes.nodeType});

	var evolving = new EvolvingFunctionBBM({type: evol.type, hasRepeat: evol.hasRepeat, repStart: evol.repStart, repStop: evol.repStop, repCount: evol.repCount, repAbsTime: evol.repAbsTime});
	for (let funcseg of funcsegs){
		var funcsegBBM = new FunctionSegmentBBM({type: funcseg.attributes.type, refEvidencePair: funcseg.attributes.refEvidencePair, startTP: funcseg.attributes.startTP, startAT: funcseg.attributes.startAT, current: funcseg.attributes.current});
		evolving.get('functionSegList').push(funcsegBBM);
	}
	var userEvals = intention.attributes.userEvaluationList;
	for (let userEval of userEvals){
		intentionBBM.get('userEvaluationList').push(new UserEvaluationBBM({assignedEvidencePair: userEval.attributes.assignedEvidencePair, absTime: userEval.attributes.absTime}));
	}
	intentionBBM.set('evolvingFunction', evolving);
	cell.set('intention', intentionBBM);
}

function renderNavigationSidebar(currentPage = 0){
    clear_pagination_values();

    var currentPageIn = document.getElementById("currentPage");
    var num_states_lbl = document.getElementById("num_states_lbl");

    console.log(allNextStatesResult.allSolutions); 
    // TODO: will indexing TNS-R always work like this??
    console.log(allNextStatesResult.allSolutions["TNS-R"].length);
    num_states_lbl.innerHTML += (allNextStatesResult.allSolutions["TNS-R"].length);

    currentPageIn.value = currentPage.toString();

    updatePagination(currentPage);
    updateNodesValues(currentPage);

    // EVONextState.setColorBlindFromPrevWindow();
    // EVONextState.refresh();
}

function updateNodesValues(currentPage, step = 0){
    if(currentPage == "")
        currentPage = 0;

    //Set the currentState variable so it can be sent back to the original path
    var i = 0;
    for (let element of newGraph.getElements()) {
        console.log(element);
        // cell = analysis.elements[i];
        // value = analysis.analysisResult.allSolution[currentPage].intentionElements[i].status[step];
        satValue = selectedResult.elementList[i].status[step];
        element.attr(".satvalue").value = satValue;

        //Change backend value to user friendly view
        if ((satValue == "0001") || (satValue == "0011")) {
            element.attr(".satvalue/text", "(F, ⊥)");
            element.attr({text:{fill:'black'}});
        } else if (satValue == "0010") {
            element.attr(".satvalue/text", "(P, ⊥)");
            element.attr({text:{fill:'black'}});
        } else if ((satValue == "1000") || (satValue == "1100")){
            element.attr(".satvalue/text", "(⊥, F)");
            element.attr({text:{fill:'black'}});
        } else if (satValue == "0100") {
            element.attr(".satvalue/text", "(⊥, P)");
            element.attr({text:{fill:'black'}});
        } else if (satValue == "0110") {
            element.attr(".satvalue/text", "(P, P)");
            element.attr({text:{fill:'red'}});
        } else if ((satValue == "1110") || (satValue == "1010")){
            element.attr(".satvalue/text", "(P, F)");
            element.attr({text:{fill:'red'}});
        } else if ((satValue == "0111") || (satValue == "0101")){
            element.attr(".satvalue/text", "(F, P)");
            element.attr({text:{fill:'red'}});
        } else if ((satValue == "1111") || (satValue == "1001") || (satValue == "1101") || (satValue == "1011") ){
            element.attr(".satvalue/text", "(F, F)");
            element.attr({text:{fill:'red'}});
        } else if (satValue == "0000") {
            element.attr(".satvalue/text", "(⊥,⊥)");
            element.attr({text:{fill:'black'}});
        } else {
            element.removeAttr(".satvalue/d");
        }
        i++;
    }
}

function updatePagination(currentPage){
    var pagination = document.getElementById("pagination");
    // var nextSteps_array_size = analysis.analysisResult.allSolution.length;
    var nextSteps_array_size = allNextStatesResult.allSolutions["TNS-R"].length;
    if (nextSteps_array_size > 6){
        renderPreviousBtn(pagination, currentPage);
        if (currentPage - 3 < 0){
            for(var i = 0; i < 6; i++){
                render_pagination_values(currentPage, i);
            }
        } else {
            if (currentPage + 3 < nextSteps_array_size){
                for (i = currentPage - 3; i < currentPage + 3; i++){
                    render_pagination_values(currentPage, i);
                }
            } else {
                for (i = currentPage - 3; i < nextSteps_array_size; i++){
                    render_pagination_values(currentPage, i);
                }
            }
        }
        renderForwardBtn(pagination, currentPage)
    } else {
        renderPreviousBtn(pagination, currentPage);
        for (var i = 0; i < nextSteps_array_size; i++){
            render_pagination_values(currentPage, i);
        }
        renderForwardBtn(pagination, currentPage)
    }
}

function renderPreviousBtn(pagination, currentPage){
    var value;
    if (currentPage == 0){
        value = 0;
    } else {
        value = currentPage - 1;
    }
    pagination.innerHTML += '<a href="#" onclick="renderNavigationSidebar('+value.toString()+')">&laquo;</a>';
}

function renderForwardBtn(pagination, currentPage){
    var value;
    // var nextSteps_array_size = analysis.analysisResult.allSolution.length;
    var nextSteps_array_size = allNextStatesResult.allSolutions["TNS-R"].length;

    if (currentPage == nextSteps_array_size-1){
        value = currentPage;
    } else {
        value = currentPage + 1;
    }
    pagination.innerHTML += '<a href="#" onclick="renderNavigationSidebar(' + value.toString() + ')">&raquo;</a>';
}

function render_pagination_values(currentPage, i){
    var pagination = document.getElementById("pagination");
    if (currentPage == i){
        pagination.innerHTML += '<a href="#" class="active" onclick="renderNavigationSidebar(' + i.toString() + ')">' + i.toString() + '</a>';
    } else {
        pagination.innerHTML += '<a href="#" onclick="renderNavigationSidebar(' + i.toString() + ')">' + i.toString() + '</a>';
    }
}

function clear_pagination_values(){
    var pagination = document.getElementById("pagination");
    var num_states_lbl = document.getElementById("num_states_lbl");
    var currentPageIn = document.getElementById("currentPage");

    pagination.innerHTML = "";
    num_states_lbl.innerHTML = "";
    currentPageIn.value = "";
}

function goToState(){
    var requiredState = parseInt(document.getElementById("requiredState").value);
    // var nextSteps_array_size = analysis.analysisResult.allSolution.length;
    var nextSteps_array_size = allNextStatesResult.allSolutions["TNS-R"].length;

    if ((requiredState != "NaN") && (requiredState > 0)){
        if (requiredState > nextSteps_array_size){
            renderNavigationSidebar(nextSteps_array_size);
        } else {
            renderNavigationSidebar(requiredState);
        }
    }
}

function add_filter(){
    console.log("clicked");
    // tempResults = jQuery.extend(true, {}, window.opener.savedAnalysisData.allNextStatesResult);
    var checkboxes = document.getElementsByClassName("filter_checkbox");
    for (var i_element = 0; i_element < checkboxes.length; i_element++){
        var checkbox = checkboxes[i_element];
        // check if something is just checked
        if (checkbox.checked){
            if (filterOrderQueue.indexOf(checkbox.id) == -1){
                filterOrderQueue.push(checkbox.id);
            }
        }
        // check if something is just unchecked
        else {
            if (filterOrderQueue.indexOf(checkbox.id) != -1){
                filterOrderQueue.splice(filterOrderQueue.indexOf(checkbox.id), 1);
            }
        }
    }
    console.log(filterOrderQueue);

    for (var i_element = 0; i_element <  filterOrderQueue.length; i_element++){
        switch (filterOrderQueue[i_element]){
            case "conflictFl":
                console.log("conflictFl");
                console.log(selectedResult.allSolution.length);
                var index_to_rm = [];
                for (var solution_index=0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    // TODO: what is intentionElements???
                    for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                        var value = selectedResult.allSolution[solution_index].intentionElements[element_index].status[0];
                        if ((value == "0110") ||
                            (value == "0111") ||
                            (value == "0101") ||
                            (value == "1110") ||
                            (value == "1010") ||
                            (value == "1111") ||
                            (value == "1001") ||
                            (value == "1101") ||
                            (value == "1011") ){
                            index_to_rm.push(solution_index);
                            break;
                        }
                    }
                }
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "ttFl":
                console.log("ttFl");
                console.log(selectedResult.allSolution.length);

                var index_to_rm = [];
                for (var solution_index=0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                        var value = selectedResult.allSolution[solution_index].intentionElements[element_index].status[0];
                        if (value == "0000"){
                            index_to_rm.push(solution_index);
                            break;
                        }
                    }
                }
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "leastTasksSatisfied":
                console.log("leastTasksSatisfied");
                console.log(selectedResult.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var least_t_s = selectedResult.allSolution.length;
                for (var solution_index=0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    var num_t_s = 0;
                    for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                        if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "TASK"){
                            var value = selectedResult.allSolution[solution_index].intentionElements[element_index].status[0];
                            if ((value == "0010" || value == "0011")){
                                num_t_s ++;
                            }
                        }
                    }
                    if (least_t_s > num_t_s){
                        least_t_s = num_t_s;
                        index_to_rm = index_to_rm.concat(index_to_keep);
                        index_to_keep = [];
                    }
                    if (num_t_s == least_t_s){
                        index_to_keep.push(solution_index);
                    }
                    if (num_t_s > least_t_s){
                        index_to_rm.push(solution_index);
                    }
                }
                index_to_rm.sort(function(a, b){return a-b});
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "mostTasksSatisfied":
                var index_to_keep = [];
                var index_to_rm = [];

                var most_t_s = 0;
                for (var solution_index=0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    var num_t_s = 0;
                    for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                        if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "TASK"){
                            var value = selectedResult.allSolution[solution_index].intentionElements[element_index].status[0];
                            if ((value == "0010" || value == "0011")){
                                num_t_s ++;
                            }
                        }
                    }
                    if (most_t_s < num_t_s){
                        most_t_s = num_t_s;
                        index_to_rm = index_to_rm.concat(index_to_keep);
                        index_to_keep = [];
                    }
                    if (num_t_s == most_t_s){
                        index_to_keep.push(solution_index);
                    }
                    if (num_t_s < most_t_s){
                        index_to_rm.push(solution_index);
                    }
                }
                index_to_rm.sort(function(a, b){return a-b});
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "leastResource":
                console.log("leastResource");
                console.log(selectedResult.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var least_r_s = selectedResult.allSolution.length;
                for (var solution_index=0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    var num_r_s = 0;
                    for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                        if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "RESOURCE"){
                            var value = selectedResult.allSolution[solution_index].intentionElements[element_index].status[0];
                            if ((value == "0010" || value == "0011")){
                                num_r_s ++;
                            }
                        }
                    }
                    if (least_r_s > num_r_s){
                        least_r_s = num_r_s;
                        index_to_rm = index_to_rm.concat(index_to_keep);
                        index_to_keep = [];
                    }
                    if (num_r_s == least_r_s){
                        index_to_keep.push(solution_index);
                    }
                    if (num_r_s > least_r_s){
                        index_to_rm.push(solution_index);
                    }
                }
                index_to_rm.sort(function(a, b){return a-b});
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "mostResource":
                console.log("mostResource");
                console.log(selectedResult.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var most_r_s = 0;
                for (var solution_index=0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    var num_r_s = 0;
                    for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                        if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "RESOURCE"){
                            var value = selectedResult.allSolution[solution_index].intentionElements[element_index].status[0];
                            if ((value == "0010" || value == "0011")){
                                num_r_s ++;
                            }
                        }
                    }
                    if (most_r_s < num_r_s){
                        most_r_s = num_r_s;
                        index_to_rm = index_to_rm.concat(index_to_keep);
                        index_to_keep = [];
                    }
                    if (num_r_s == most_r_s){
                        index_to_keep.push(solution_index);
                    }
                    if (num_r_s < most_r_s){
                        index_to_rm.push(solution_index);
                    }
                }
                index_to_rm.sort(function(a, b){return a-b});
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "leastGoalSatisfied":
                console.log("leastGoalSatisfied");
                console.log(selectedResult.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var least_goal_s = selectedResult.allSolution.length;
                for (var solution_index=0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    var num_g_s = 0;
                    for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                        if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "GOAL"){
                            var value = selectedResult.allSolution[solution_index].intentionElements[element_index].status[0];
                            if ((value == "0010" || value == "0011")){
                                num_g_s ++;
                            }
                        }
                    }
                    if (least_goal_s > num_g_s){
                        least_goal_s = num_g_s;
                        index_to_rm = index_to_rm.concat(index_to_keep);
                        index_to_keep = [];
                    }
                    if (num_g_s == least_goal_s){
                        index_to_keep.push(solution_index);
                    }
                    if (num_g_s > least_goal_s){
                        index_to_rm.push(solution_index);
                    }
                }
                index_to_rm.sort(function(a, b){return a-b});
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "mostGoalSatisfied":
                console.log("mostGoalSatisfied");
                console.log(selectedResult.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var most_goal_s = 0;
                for (var solution_index=0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    var num_g_s = 0;
                    for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                        if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "GOAL"){
                            var value = selectedResult.allSolution[solution_index].intentionElements[element_index].status[0];
                            if ((value == "0010" || value == "0011")){
                                num_g_s ++;
                            }
                        }
                    }
                    if (most_goal_s < num_g_s){
                        most_goal_s = num_g_s;
                        index_to_rm = index_to_rm.concat(index_to_keep);
                        index_to_keep = [];
                    }
                    if (num_g_s == most_goal_s){
                        index_to_keep.push(solution_index);
                    }
                    if (num_g_s < most_goal_s){
                        index_to_rm.push(solution_index);
                    }
                }
                index_to_rm.sort(function(a, b){return a-b});
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "LeastActor":
                console.log("LeastActor");
                console.log(selectedResult.allSolution.length);

                var least_actor = selectedResult.allSolution.length;
                var index_to_keep = [];
                var index_to_rm = [];
                for (var solution_index = 0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    var actors = {};
                    for (var element_index = 0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++) {
                        if (! actors[selectedResult.allSolution[solution_index].intentionElements[element_index].actorId]){
                            actors[selectedResult.allSolution[solution_index].intentionElements[element_index].actorId] = 0;
                        }
                        var value = selectedResult.allSolution[solution_index].intentionElements[element_index].status[0];
                        if ((value == "0010" || value == "0011" || (value == "0110") ||
                            (value == "0111") ||
                            (value == "0101") ||
                            (value == "1110") ||
                            (value == "1010") ||
                            (value == "1111") ||
                            (value == "1001") ||
                            (value == "1101") ||
                            (value == "1011"))){
                            actors[selectedResult.allSolution[solution_index].intentionElements[element_index].actorId] =1;
                        }
                    }
                    var int_sat = Object.values(actors).reduce((a, b) => a + b);
                    if (least_actor > int_sat){
                        least_actor = int_sat;
                        index_to_rm = index_to_rm.concat(index_to_keep);
                        index_to_keep = [];
                    }
                    if (int_sat == least_actor){
                        index_to_keep.push(solution_index);
                    }
                    if (int_sat > least_actor){
                        index_to_rm.push(solution_index);
                    }

                }
                index_to_rm.sort(function(a, b){return a-b});
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "mostActor":
                console.log("mostActor");
                console.log(selectedResult.allSolution.length);

                var most_actor = 0;
                var index_to_keep = [];
                var index_to_rm = [];
                for (var solution_index = 0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    var actors = {};
                    for (var element_index = 0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++) {
                        if (! actors[selectedResult.allSolution[solution_index].intentionElements[element_index].actorId]){
                            actors[selectedResult.allSolution[solution_index].intentionElements[element_index].actorId] = 0;
                        }
                        var value = selectedResult.allSolution[solution_index].intentionElements[element_index].status[0];
                        if ((value == "0010" || value == "0011" || (value == "0110") ||
                            (value == "0111") ||
                            (value == "0101") ||
                            (value == "1110") ||
                            (value == "1010") ||
                            (value == "1111") ||
                            (value == "1001") ||
                            (value == "1101") ||
                            (value == "1011"))){
                            actors[selectedResult.allSolution[solution_index].intentionElements[element_index].actorId] =1;
                        }
                    }
                    console.log(actors);
                    console.log(Object.values(actors).reduce((a, b) => a + b));
                    var int_sat = Object.values(actors).reduce((a, b) => a + b);
                    if (most_actor < int_sat){
                        most_actor = int_sat;
                        index_to_rm = index_to_rm.concat(index_to_keep);
                        index_to_keep = [];
                    }
                    if (int_sat == most_actor){
                        index_to_keep.push(solution_index);
                    }
                    if (int_sat < most_actor){
                        index_to_rm.push(solution_index);
                    }

                }
                index_to_rm.sort(function(a, b){return a-b});
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "mostConstraintSatisfaction":
                var domains = {};
                for (var solution_index = 0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    for (var element_index = 0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++) {
                        if (! domains[selectedResult.allSolution[solution_index].intentionElements[element_index].id]){
                            domains[selectedResult.allSolution[solution_index].intentionElements[element_index].id] = [selectedResult.allSolution[solution_index].intentionElements[element_index].status[0]];
                        } else {
                            if (domains[selectedResult.allSolution[solution_index].intentionElements[element_index].id].indexOf(selectedResult.allSolution[solution_index].intentionElements[element_index].status[0]) == -1){
                                domains[selectedResult.allSolution[solution_index].intentionElements[element_index].id].push(selectedResult.allSolution[solution_index].intentionElements[element_index].status[0])
                            }
                        }
                    }
                }
                var length_domain= {};
                var least_domain = 9;
                var int_with_smallest_domain = [];
                Object.keys(domains).forEach(function(key) {
                    length_domain[key] = domains[key].length;
                    if (length_domain[key] < least_domain){
                        least_domain = length_domain[key];
                        int_with_smallest_domain = [];
                    }
                    if (length_domain[key] == least_domain){
                        int_with_smallest_domain.push(key);
                    }
                });
                var index_to_rm = [];
                for (var solution_index = 0; solution_index < selectedResult.allSolution.length; solution_index++) {
                    for (var element_index = 0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++) {
                        if (int_with_smallest_domain.indexOf(selectedResult.allSolution[solution_index].intentionElements[element_index].id) != -1){
                            if (selectedResult.allSolution[solution_index].intentionElements[element_index].status[0] !== "0011"){
                                index_to_rm.push(solution_index);
                                break;
                            }
                        }
                    }
                }
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            default:
                console.log("default");
                break;
        }
    }

    // analysis.analysisResult = tempResults;
    for (let result of analysisRequest.results) {
        if (result.selected == true) {
            analysisRequest.result = selectedResult;
        }
    }
    renderNavigationSidebar();
}


function updateAnalysisRequestWithCurrentState(){
    // analysisRequest =  jQuery.extend(true, {}, window.opener.analysisRequest);

    // updating input analysis
    var index_of_selected_state = parseInt(document.getElementById("currentPage").value);

    // getting current state
    var currentState = current + 1;
    console.log(current);

    // update current state in the element list
    for (var element_index = 0; element_index < savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements.length; element_index++){
        analysisRequest.previousAnalysis.elementList[element_index].status[currentState] = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[element_index].status[0];
    }
    // getting next time point
    var nextTimePoint = savedAnalysisData.singlePathResult.timePointPath[currentState];
    console.log(nextTimePoint);
    
    // get the list of all epochs
    var allEpochs = {}; // intention id : list of epoch names
    var num_epochs = 0;

    for (var i = 0; i < elements[i].length ; i++){
        // more than one piece of functions involved
        if (!allEpochs[elements[i].get('intention').cid]){
            allEpochs[elements[i].get('intention').cid] = [];
        }

        if (elements[i].get('intention').get('evolvingFunction').get('type') === "NT" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "C" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "I" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "D" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "R" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "NB" ){
            continue;
        }
        else if (elements[i].get('intention').get('evolvingFunction').get('type') === "SD" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "DS" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "CR" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "RC" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "MP" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "MN" ){
            allEpochs[elements[i].nodeID].push("E" + elements[i].nodeID);
            num_epochs ++;
        }
        else if (elements[i].get('intention').get('evolvingFunction').get('type') === "UD"){
            // getting function charEB list
            var charEBs = [];
            for (var j = 0; j < elements[i].get('intention').get('evolvingFunction').get('functionSegList').length; j ++){
                if (charEBs.indexOf(elements[i].get('intention').get('evolvingFunction').get('functionSegList')[j].get('startTP') === -1)){
                    charEBs.push(elements[i].get('intention').get('evolvingFunction').get('functionSegList')[j].get('startTP'));
                }
            }
            // ignoring 0 and infinity in charEBs
            for (var k = 1; k < charEBs.length-1; k ++){
                allEpochs[elements[i].nodeID].push("E" + elements[i].get('intention').cid + "_" + charEBs[k]);
                num_epochs++;
            }
        }
    }

    console.log(allEpochs);
    console.log(num_epochs);

    // determine which epoch has happened
    // count absolute time points that occurs

    var previousEpochs = []; // {epoch name : index in assignedEpoch} includes both E0000 and TE1 etc
    var previousAbs = 0;
    var previousRel = 0;
    var AbsIntersction = 0;
    //var previousTP = [];
    for (var j = 0; j < analysisRequest.previousAnalysis.assignedEpoch.length; j ++){
        var regex = /(.*)_(.*)$/g;
        var match = regex.exec(analysisRequest.previousAnalysis.assignedEpoch[j]);
        //previousTP.push(analysisRequest.previousAnalysis.assignedEpoch[j]);
        if (analysisRequest.previousAnalysis.assignedEpoch[j].indexOf("T") > -1) {
            // check if it's an absolute time point - TA
            if (analysisRequest.previousAnalysis.assignedEpoch[j].indexOf("A") > -1){
                previousAbs ++;
            } else {
                // not TA but happen to be on an abs time point
                if (analysisRequest.absTimePtsArr.indexOf(match[1]) > -1){
                    AbsIntersction ++;
                }
                // count previous relative points - TR
                if (analysisRequest.previousAnalysis.assignedEpoch[j].indexOf("R") > -1){
                    previousRel ++;
                }
            }

        } else {
            if (analysisRequest.previousAnalysis.assignedEpoch[j].indexOf("E") > -1){
                console.log("found function epoch");
                previousEpochs.push(match[1]);
            }
        }
    }

    console.log(previousEpochs);
    console.log("previousAbs " + previousAbs);
    console.log("AbsIntersction " + AbsIntersction);
    console.log("previousRel " + previousRel);
    //console.log(previousTP);

    // determine the type of current time point
    var potentialEpochs = [];
    var definiteEpochs = [];
    for (var i = 0; i < elements[i].length ; i++) {
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "NT" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "C" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "I" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "D" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "R" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "NB") {
            continue;
        }

        // Satisfied Denied or Denied Satisfied
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "SD" || elements[i].get('intention').get('evolvingFunction').get('type') === "DS") {
            // Epoch happens when previous is initial state and current is final state
            var startValue =  elements[i].get('intention').get('evolvingFunction').get('functionSegList')[0].get('refEvidencePair');
            var endValue =  elements[i].get('intention').get('evolvingFunction').get('functionSegList')[1].get('refEvidencePair');
            var previousStatus = analysisRequest.previousAnalysis.elementList[i].status[current];
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (previousStatus === startValue && curStatus === endValue) {
                definiteEpochs.push("E" + elements[i].get('intention').cid);
            }
        }

        // Stochastic Constant
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "RC") {
            // check if epoch has happened already
            // check if obj["key"] != undefined
            if (previousEpochs.indexOf("E" + elements[i].get('intention').cid) > -1) {
                continue;
            }
            // check if current value is the final value
            // this goes into potential list
            var endValue = elements[i].get('intention').get('evolvingFunction').get('functionSegList')[1].get('refEvidencePair');
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus === endValue) {
                potentialEpochs.push("E" + elements[i].get('intention').cid);
            }
        }

        // Constant Stochastic
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "CR") {
            // check if epoch has happened already
            if (previousEpochs.indexOf("E" + elements[i].get('intention').cid) > -1) {
                break;
            }
            // TODO: add to potential epochs directly?
            // check if previous is constant value and current is not constant value
            var startValue = elements[i].get('intention').get('evolvingFunction').get('functionSegList')[0].get('refEvidencePair');
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus !== startValue) {
                definiteEpochs.push("E" + elements[i].get('intention').cid) ;
            }
        }

        // Monotonic Positive or Monotonic Negative
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "MP" || elements[i].get('intention').get('evolvingFunction').get('type') === "MN") {
            // check if epoch has happened already
            if (previousEpochs.indexOf("E" + elements[i].get('intention').cid) > -1) {
                console.log("found epoch");
                break;
            }
            // check if current value is the final value
            // this goes into potential list
            var endValue = elements[i].get('intention').get('evolvingFunction').get('functionSegList')[1].get('refEvidencePair');
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus === endValue) {
                potentialEpochs.push("E" + elements[i].get('intention').cid);
            }
        }

        // User Defined TODO: need to fix UD functions
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "UD") {
            var next_epoch = "";
            var cur_seg = -1;
            for (var j = 0; j < elements[i].get('intention').get('evolvingFunction').get('functionSegList').length; j++) {
                var start_epoch = "E" + elements[i].get('intention').cid + "_" + elements[i].get('intention').get('evolvingFunction').get('functionSegList')[j].get('startTP');
                if (elements[i].get('intention').get('evolvingFunction').get('functionSegList')[j].get('startTP') == '0') {
                    var end_epoch = "E" + elements[i].get('intention').cid + "_" + 'A';
                } else {
                    var end_epoch = "E" + elements[i].get('intention').cid + "_" + String.fromCharCode(elements[i].get('intention').get('evolvingFunction').get('functionSegList')[j].get('startTP').charCodeAt(0) + 1);;
                }
                if (previousEpochs.indexOf(end_epoch) == -1 && previousEpochs.indexOf(start_epoch) != -1){
                    //look for the seg that the start epoch happened and stop epoch hasn't
                    cur_seg = j;
                    next_epoch = end_epoch;
                }
            }

            console.log("next_epoch: " + next_epoch);
            console.log("cur_seg: " + cur_seg);
            if (cur_seg == -1){
                break;
            }
            var endValue = elements[i].get('intention').get('evolvingFunction').get('functionSegList')[cur_seg].get('refEvidencePair');
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];

            // if the next segment is random, the epoch goes to potential epochs
            var go_to_potentials = 0;
            if (cur_seg < elements[i].get('intention').get('evolvingFunction').get('functionSegList').length-1){
                if (elements[i].get('intention').get('evolvingFunction').get('functionSegList')[cur_seg+1].get('type') === "R"){
                    go_to_potentials = 1;
                }
            }
            switch (elements[i].get('intention').get('evolvingFunction').get('functionSegList')[cur_seg].get('type')) {
                case "C":
                    if (curStatus !== endValue){
                        if (go_to_potentials == 1){
                            potentialEpochs.push(next_epoch);
                        } else {
                            definiteEpochs.push(next_epoch);
                        }
                    }
                    break;
                case "I":
                    if (curStatus === endValue){
                        if (go_to_potentials == 1){
                            potentialEpochs.push(next_epoch);
                        } else {
                            definiteEpochs.push(next_epoch);
                        }
                    }
                    break;
                case "D":
                    if (curStatus === endValue){
                        if (go_to_potentials == 1){
                            potentialEpochs.push(next_epoch);
                        } else {
                            definiteEpochs.push(next_epoch);
                        }
                    }
                    break;
                case "R":
                    if ((cur_seg < elements[i].get('intention').get('evolvingFunction').get('functionSegList').length-1) && (elements[i].get('intention').get('evolvingFunction').get('functionSegList')[cur_seg+1].get('type') === "C")){
                        if (curStatus === elements[i].get('intention').get('evolvingFunction').get('functionSegList')[cur_seg+1].get('refEvidencePair')){
                            potentialEpochs.push(next_epoch);
                        }
                    } else {
                        if (Math.random() >= 0.5){
                            potentialEpochs.push(next_epoch);
                        }
                    }
                    break;
            }
        }
    }

    // update current
    // number of time points left = num_all_epochs + num_relative + num_absolute+1 + intersection - prevE - prevA - prevR
    // number of time points left >= max - cur time point
    // if <, cur time point = rand(prev tp, max - tp left)

    var numTPLeft = num_epochs + parseInt(analysisRequest.numRelTime) + analysisRequest.absTimePtsArr.length
        + AbsIntersction - previousEpochs.length - previousAbs - previousRel;

    console.log("numTPLeft " + numTPLeft);
    console.log(graph);
    var difference = parseInt(graph.get('maxAbsTime')) - nextTimePoint;
    console.log("difference: " + difference);
    if (numTPLeft > difference){
        var newRand = Math.floor(Math.random() *
            ( parseInt(graph.get('maxAbsTime')) - numTPLeft - parseInt(analysisRequest.previousAnalysis.timePointPath[current] + 1))
            + parseInt(analysisRequest.previousAnalysis.timePointPath[current]));
        console.log("newRand " + newRand);
        analysisRequest.previousAnalysis.timePointPath.push(newRand);
    } else {
        analysisRequest.previousAnalysis.timePointPath.push(nextTimePoint);
    }

    // find TE and E0000 and update the TP
    // if multiple potential and no definite, determine which one is selected as an epoch TODO: need to test this

    if (definiteEpochs.length == 0 && potentialEpochs.length > 0){
        var RandIndex = Math.floor(Math.random() *
            (potentialEpochs.length));
        definiteEpochs.push(potentialEpochs[RandIndex]) ;
    }
    if (definiteEpochs.length > 1){
        alert("more than one epoch in this state");
        return;
    }
    if (definiteEpochs.length == 1){
        var potentialEpoch = definiteEpochs[0];
        // it is an epoch
        var TPforPotentialEpoch = "";
        // update the time point for potentialEpoch E0000
        for (var i = 0; i < savedAnalysisData.singlePathResult.assignedEpoch.length; i++){
            var regex = /(.*)_(.*)$/g;
            var match = regex.exec(savedAnalysisData.singlePathResult.assignedEpoch[i]);
            if (match[1] === potentialEpoch){
                TPforPotentialEpoch = match[2];
                //analysisRequest.previousAnalysis.assignedEpoch[i] = match[1] + "_" + analysisRequest.previousAnalysis.timePointPath[currentState];
                analysisRequest.previousAnalysis.assignedEpoch.push(match[1] + "_" + nextTimePoint);
                break;
            }
        }
        // update the time point for the corresponding TE or TA
        for (var i = 0; i < savedAnalysisData.singlePathResult.assignedEpoch.length; i++){
            var regex = /(.*)_(.*)$/g;
            var match = regex.exec(savedAnalysisData.singlePathResult.assignedEpoch[i]);
            if (match[2] === TPforPotentialEpoch){
                if (match[1].indexOf("T") > -1){
                    //analysisRequest.previousAnalysis.assignedEpoch[i] = match[1] + "_" + analysisRequest.previousAnalysis.timePointPath[currentState];
                    analysisRequest.previousAnalysis.assignedEpoch.push(match[1] + "_" + nextTimePoint);
                    //break;
                }
            }
        }
    } else {
        // it is a relative/absolute time point
        if (analysisRequest.absTimePtsArr.indexOf(nextTimePoint) != -1){
            // it is an absolute time point
            var newAbs = analysisRequest.absTimePtsArr.indexOf(nextTimePoint)+1;

            //update time point path with TA?_tp
            analysisRequest.previousAnalysis.assignedEpoch.push("TA" + newAbs + "_" + nextTimePoint);

        } else {
            // it is a relative time point
            // decide which relative time points have not occurred yet
            var prevRelativePoints = [];
            for (var i = 0; i < analysisRequest.previousAnalysis.assignedEpoch.length; i++){
                var regex = /TR(.*)_.*/g;
                var match = regex.exec(analysisRequest.previousAnalysis.assignedEpoch[i]);
                if (match !== null){
                    prevRelativePoints.push(parseInt(match[1]));
                }
            }
            console.log(prevRelativePoints);

            var newRel = 1;
            // pick one
            for (var j = num_epochs+analysisRequest.absTimePtsArr.length+1; j <= parseInt(analysisRequest.numRelTime)+num_epochs+analysisRequest.absTimePtsArr.length; j ++){
                if (prevRelativePoints.indexOf(j) == -1){
                    newRel = j;
                    break;
                }
            }

            // update time point path with TR?_tp
            analysisRequest.previousAnalysis.assignedEpoch.push("TR" + newRel + "_" + nextTimePoint);
        }

    }
    // remove all the time points after
    //analysisRequest.previousAnalysis.assignedEpoch = previousTP;
    //analysisRequest.previousAnalysis.timePointPath = analysisRequest.previousAnalysis.timePointPath.slice(0, currentState+1);

    analysisRequest.currentState = currentState + "|" + analysisRequest.previousAnalysis.timePointPath[currentState];
}

function updateAnalysisRequestWithCurrentState_copy(){
    // update analysis type
    analysisRequest.action = "singlePath";
    analysisRequest.previousAnalysis = _.clone(savedAnalysisData.singlePathResult);

    // updating input analysis
    var index_of_selected_state = parseInt(document.getElementById("currentPage").value);

    // getting current state
    var currentState = current + 1;
    console.log(current);

    // update current state in the element list
    for (var element_index = 0; element_index < savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements.length; element_index++){
        analysisRequest.previousAnalysis.elementList[element_index].status[currentState] = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[element_index].status[0];
    }

    // getting next time point
    var nextTimePoint = analysisRequest.previousAnalysis.timePointPath[currentState];
    console.log(nextTimePoint);


    // get the list of all epochs
    var allEpochs = {}; // intention id : list of epoch names
    var num_epochs = 0;

    for (var i = 0; i < elements[i].get('intention').length ; i++){
        // more than one piece of functions involved
        if (!allEpochs[elements[i].get('intention').cid]){
            allEpochs[elements[i].get('intention').cid] = [];
        }

        if (elements[i].get('intention').get('evolvingFunction').get('type') === "NT" ||
            elements[i].get('intention').get('evolvingFunction').get('type')  === "C" ||
            elements[i].get('intention').get('evolvingFunction').get('type')  === "I" ||
            elements[i].get('intention').get('evolvingFunction').get('type')  === "D" ||
            elements[i].get('intention').get('evolvingFunction').get('type')  === "R" ||
            elements[i].get('intention').get('evolvingFunction').get('type')  === "NB" ){
            continue;
        }
        else if (elements[i].get('intention').get('evolvingFunction').get('type')  === "SD" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "DS" ||
            elements[i].get('intention').get('evolvingFunction').get('type')  === "CR" ||
            elements[i].get('intention').get('evolvingFunction').get('type')  === "RC" ||
            elements[i].get('intention').get('evolvingFunction').get('type')  === "MP" ||
            elements[i].get('intention').get('evolvingFunction').get('type')  === "MN" ){
            allEpochs[elements[i].get('intention').cid].push("E" + elements[i].get('intention').cid);
            num_epochs ++;
        }
        else if (elements[i].get('intention').get('evolvingFunction').get('type')  === "UD"){
            //TODO: fix the name to be the inbetween start and end points
            // getting function charEB list
            var charEBs = [];
            for (var j = 0; j < elements[i].get('intention').get('evolvingFunction').get('functionSegList').length; j ++){
                if (charEBs.indexOf(elements[i].get('intention').get('evolvingFunction').get('functionSegList')[j].get('startTP') === -1)){
                    charEBs.push(elements[i].get('intention').get('evolvingFunction').get('functionSegList')[j].get('startTP'));
                }
            }
            // ignoring 0 and infinity in charEBs
            for (var k = 1; k < charEBs.length-1; k ++){
                allEpochs[elements[i].get('intention').cid].push("E" + elements[i].get('intention').cid + "_" + charEBs[k]);
                num_epochs++;
            }
        }

    }

    console.log(allEpochs);
    console.log(num_epochs);

    // determine which epoch has happened
    // count absolute time points that occurs

    var previousEpochs = []; // {epoch name : index in assignedEpoch} includes both E0000 and TE1 etc
    var previousAbs = 0;
    var previousRel = 0;
    var AbsIntersction = 0;
    var previousTP = [];
    for (var i = 0; i < currentState; i ++){
        for (var j = 0; j < analysisRequest.previousAnalysis.assignedEpoch.length; j ++){
            var regex = /(.*)_(.*)$/g;
            var match = regex.exec(analysisRequest.previousAnalysis.assignedEpoch[j]);
            if (match[2] === analysisRequest.previousAnalysis.timePointPath[i]){
                previousTP.push(analysisRequest.previousAnalysis.assignedEpoch[j]);
                if (analysisRequest.previousAnalysis.assignedEpoch[j].indexOf("T") > -1) {
                    // check if it's an absolute time point - TA
                    if (analysisRequest.previousAnalysis.assignedEpoch[j].indexOf("A") > -1){
                        previousAbs ++;
                    } else {
                        // not TA but happen to be on an abs time point
                        if (analysisRequest.absTimePtsArr.indexOf(match[1]) > -1){
                            AbsIntersction ++;
                        }

                        // count previous relative points - TR
                        if (analysisRequest.previousAnalysis.assignedEpoch[j].indexOf("R") > -1){
                            previousRel ++;
                        }
                    }

                } else {
                    if (analysisRequest.previousAnalysis.assignedEpoch[j].indexOf("E") > -1){
                        console.log("found function epoch");
                        //var regex1 = /(.*)_.*/g;
                        //var match1 = regex1.exec(analysisRequest.previousAnalysis.assignedEpoch[j]);
                        previousEpochs.push(match[1]);
                    }
                }
                //continue;
                break;
            }
        }
    }
    console.log(previousEpochs);
    console.log("previousAbs " + previousAbs);
    console.log("AbsIntersction " + AbsIntersction);
    console.log("previousRel " + previousRel);
    console.log(previousTP);

    // determine the type of current time point
    var potentialEpochs = [];
    var potentialEpoch = "";
    for (var i = 0; i < elements[i].get('intention').length ; i++){
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "NT" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "C" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "I" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "D" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "R" ||
            elements[i].get('intention').get('evolvingFunction').get('type') === "NB" ){
            continue;
        }

        // Satisfied Denied or Denied Satisfied
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "SD" || elements[i].get('intention').get('evolvingFunction').get('type') === "DS"){
            // Epoch happens when previous is initial state and current is final state
            var startValue = elements[i].get('intention').get('evolvingFunction').get('functionSegList')[0].get('refEvidencePair');
            var endValue = elements[i].get('intention').get('evolvingFunction')[1].get('refEvidencePair');
            var previousStatus = analysisRequest.previousAnalysis.elementList[i].status[current];
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (previousStatus === startValue && curStatus === endValue){
                potentialEpoch = "E" + elements[i].get('intention').cid;
            }

        }

        // Stochastic Constant
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "RC"){
            // check if epoch has happened already
            // check if obj["key"] != undefined
            if (previousEpochs.indexOf("E" + elements[i].get('intention').cid) > -1){
                continue;
            }
            // check if current value is the final value
            // this goes into potential list
            var endValue = elements[i].get('intention').get('evolvingFunction').get('functionSegList')[1].get('refEvidencePair');
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus === endValue){
                potentialEpochs.push("E" + elements[i].get('intention').cid);
            }

        }

        // Constant Stochastic
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "CR"){
            // check if epoch has happened already
            if (previousEpochs.indexOf("E" + elements[i].get('intention').cid) > -1){
                break;
            }
            // TODO: add to potential epochs directly?
            // check if previous is constant value and current is not constant value
            var startValue = elements[i].get('intention').get('evolvingFunction').get('functionSegList')[0].get('refEvidencePair');
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus !== startValue){
                potentialEpoch = "E" + elements[i].get('intention').cid;
            }

        }

        // Monotonic Positive or Monotonic Negative
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "MP" || elements[i].get('intention').get('evolvingFunction').get('type') === "MN") {
            // check if epoch has happened already
            if (previousEpochs.indexOf("E" + elements[i].get('intention').cid) > -1){
                console.log("found epoch");
                break;
            }
            // check if current value is the final value
            // this goes into potential list
            var endValue = elements[i].get('intention').get('evolvingFunction').get('functionSegList[1]').get('refEvidencePair');
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus === endValue){
                potentialEpochs.push("E" + elements[i].get('intention').cid);
            }

        }

        // User Defined TODO: need to fix UD functions
        if (elements[i].get('intention').get('evolvingFunction').get('type') === "UD"){
            var next_epoch_name = "";
            var next_funcseg_index = 0;
            for (var j = 0; j < elements[i].get('intention').get('evolvingFunction').get('functionSegList').length; j ++){
                var epoch_name = "E" + elements[i].get('intention').cid + "_" + elements[i].get('intention').get('evolvingFunction').get('functionSegList')[j].get('type');
                if (previousEpochs.indexOf(epoch_name) == -1){
                    next_funcseg_index = j;
                    next_epoch_name = epoch_name;
                    console.log("found next epoch");
                    break;
                }
            }
            if (next_epoch_name === ""){
                continue;
            } else {
                console.log("next epoch name: " + next_epoch_name + " funcSeg index: " + j);


            }
        }
    }

    // update current
    // number of time points left = num_all_epochs + num_relative + num_absolute+1 + intersection - prevE - prevA - prevR
    // number of time points left >= max - cur time point
    // if <, cur time point = rand(prev tp, max - tp left)

    var numTPLeft = num_epochs + parseInt(analysisRequest.numRelTime) + analysisRequest.absTimePtsArr.length
        + AbsIntersction - previousEpochs.length - previousAbs - previousRel;

    console.log("numTPLeft " + numTPLeft);

    var difference = parseInt(graph.get('maxAbsTime')) - parseInt(analysisRequest.previousAnalysis.timePointPath[currentState]);
    console.log("difference: " + difference);
    if (numTPLeft > difference){
        var newRand = Math.floor(Math.random() *
            ( parseInt(graph.get('maxAbsTime')) - numTPLeft - parseInt(analysisRequest.previousAnalysis.timePointPath[current] + 1))
            + parseInt(analysisRequest.previousAnalysis.timePointPath[current]));
        console.log("newRand " + newRand);
    }
    // find TE and E0000 and update the TP
    // if multiple potential and no definite, determine which one is selected as an epoch TODO: need to test this

    if (potentialEpoch === "" && potentialEpochs.length > 0){
        var RandIndex = Math.floor(Math.random() *
            (potentialEpochs.length + 1));
        potentialEpoch = potentialEpochs[RandIndex];
    }
    if (potentialEpoch !== ""){
        // it is an epoch
        var TPforPotentialEpoch = "";
        // update the time point for potentialEpoch E0000
        for (var i = 0; i < analysisRequest.previousAnalysis.assignedEpoch.length; i++){
            var regex = /(.*)_(.*)$/g;
            var match = regex.exec(analysisRequest.previousAnalysis.assignedEpoch[i]);
            if (match[1] === potentialEpoch){
                TPforPotentialEpoch = match[2];
                //analysisRequest.previousAnalysis.assignedEpoch[i] = match[1] + "_" + analysisRequest.previousAnalysis.timePointPath[currentState];
                previousTP.push(match[1] + "_" + analysisRequest.previousAnalysis.timePointPath[currentState]);
                break;
            }
        }
        // update the time point for the corresponding TE or TA
        for (var i = 0; i < analysisRequest.previousAnalysis.assignedEpoch.length; i++){
            var regex = /(.*)_(.*)$/g;
            var match = regex.exec(analysisRequest.previousAnalysis.assignedEpoch[i]);
            if (match[2] === TPforPotentialEpoch){
                if (match[1].indexOf("T") > -1){
                    //analysisRequest.previousAnalysis.assignedEpoch[i] = match[1] + "_" + analysisRequest.previousAnalysis.timePointPath[currentState];
                    previousTP.push(match[1] + "_" + analysisRequest.previousAnalysis.timePointPath[currentState]);
                    break;
                }
            }
        }
    } else {
        // it is a relative time point

        // decide which relative time points have not occurred yet
        var prevRelativePoints = [];
        for (var i = 0; i < previousTP.length; i++){
            var regex = /TR(.*)_.*/g;
            var match = regex.exec(previousTP[i]);
            if (match !== null){
                prevRelativePoints.push(parseInt(match[1]));
            }
        }
        console.log(prevRelativePoints);

        var newRel = 1;
        // pick one
        for (var j = 1; j < parseInt(analysisRequest.numRelTime); j ++){
            if (prevRelativePoints.indexOf(j) == -1){
                newRel = j;
                break;
            }
        }

        // update time point path with TR?_tp
        previousTP.push("TR" + newRel + "_" + analysisRequest.previousAnalysis.timePointPath[currentState]);
    }

    // remove all the time points after
    analysisRequest.previousAnalysis.assignedEpoch = previousTP;
    analysisRequest.previousAnalysis.timePointPath = analysisRequest.previousAnalysis.timePointPath.slice(0, currentState+1);

    analysisRequest.currentState = currentState + "|" + analysisRequest.previousAnalysis.timePointPath[currentState];
}

//This function should get the current state in the screen and save in the original path
function save_current_state(){
    updateAnalysisRequestWithCurrentState();
    analysisRequest.action = "singlePath";

    jsObject.analysisRequest = analysisRequest;
    console.log(jsObject);

    // TODO Update call to backendComm.
    //console.log("TODO: Update Call to BackendComm");
    window.opener.backendSimulationRequest(analysisRequest);

    window.close();
}

//This function should get the current state and generate a new window with the next possible states
function generate_next_states(){
    
    $("body").addClass("waiting"); //Adds "waiting" spinner under cursor 
    // Object to be sent to the backend
    var jsObject = {};
    updateAnalysisRequestWithCurrentState();

    /*for (var i = 0; i < analysisRequest.previousAnalysis.elementList.length ; i++){
        analysisRequest.previousAnalysis.elementList[i].status.slice(0, current+2);
    }*/
    analysisRequest.action = "allNextStates";

    jsObject.analysisRequest = analysisRequest;
    console.log(analysisRequest);

    // TODO Update call to backendComm.
    //console.log("TODO: Update Call to BackendComm");
    //backendComm(jsObject);      
    backendSimulationRequest(analysisRequest);
}

} // End of scope of local global variables