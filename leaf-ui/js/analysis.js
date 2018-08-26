//Defining local scope
var analysis = {};

analysis.analysisResult;
analysis.elements = [];
analysis.currentState;
var tempResults;
var filterOrderQueue = [];
var analysisRequest;
var analysisResult;
var savedAnalysisData;
var graph;
var current;

var model;

var satValueDict = {
    "unknown": "0000",
    "satisfied": "0011",
    "partiallysatisfied": "0010",
    "partiallydenied": "0100",
    "denied": "1100",
    "none": "0000"
};



//Executing scripts only when page is fully loaded
window.onload = function(){
    //This merge the attributes of old page and new page
    analysis.page = jQuery.extend({}, window.opener.document);
    init();
    renderNavigationSidebar();
}

function init(){
    //Page objects
    analysis.graph = new joint.dia.Graph();
    analysis.paper;
    analysis.paperScroller;

    //Objects from parent page
    //analysis.parentResults = jQuery.extend({}, window.opener.global_analysisResult);

    savedAnalysisData = _.clone(jQuery.extend(true, {}, window.opener.savedAnalysisData));
    //tempResults = jQuery.extend(true, {}, window.opener.savedAnalysisData.allNextStatesResult);
    analysisRequest =  jQuery.extend(true, {}, window.opener.analysisRequest);
    analysisResult = jQuery.extend(true, {}, window.opener.analysisResult);
    graph = jQuery.extend({}, window.opener.graph);
    var i = analysisRequest.currentState.indexOf('|', 0);
    current = parseInt(analysisRequest.currentState.substring(0, i));

    analysis.paper = new joint.dia.Paper({
        width: 1200,
        height: 600,
        gridSize: 10,
        perpendicularLinks: false,
        model: analysis.graph,
        defaultLink: new joint.dia.Link({
            'attrs': {
                '.connection': {stroke: '#000000'},
                '.marker-source': {'d': '0'},
                '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
            },
            'labels': [{position: 0.5, attrs: {text: {text: "and"}}}]
        })
    });

    analysis.paperScroller = new joint.ui.PaperScroller({
        autoResizePaper: true,
        paper: analysis.paper
    });

    $('#paper').append(analysis.paperScroller.render().el);
    analysis.paperScroller.center();

    //Load graph by the cookie
    if (analysis.page.cookie){
        var cookies = analysis.page.cookie.split(";");
        var prevgraph = "";
        for (var i = 0; i < cookies.length; i++){
            if (cookies[i].indexOf("graph=") >= 0){
                prevgraph = cookies[i].substr(6);
                break;
            }
        }
        if (prevgraph){
            analysis.graph.fromJSON(JSON.parse(prevgraph));
        }
    }

    //Filter out Actors
    for (var e = 0; e < analysis.graph.getElements().length; e++){
        if (!(analysis.graph.getElements()[e] instanceof joint.shapes.basic.Actor))
            analysis.elements.push(analysis.graph.getElements()[e]);
    }

    if(!analysis.analysisResult){
        analysis.analysisResult = savedAnalysisData.allNextStatesResult;
    }
    model =  jQuery.extend({}, window.opener.model);
}

function renderNavigationSidebar(currentPage = 0){
    clear_pagination_values();

    var currentPageIn = document.getElementById("currentPage");
    var num_states_lbl = document.getElementById("num_states_lbl");


        //analysis.parentResults = jQuery.extend({}, window.opener.global_analysisResult);

    //if(!analysis.analysisResult){
     //   analysis.analysisResult = analysis.parentResults;
    //}

    num_states_lbl.innerHTML += (analysis.analysisResult.allSolution.length);

    currentPageIn.value = currentPage.toString();

    updatePagination(currentPage);
    updateNodesValues(currentPage);
    //updateSliderValues(currentPage);
}

function updateNodesValues(currentPage, step = 0){
    if(currentPage == "")
        currentPage = 0;

    //Set the currentState variable so it can be sent back to the original path
    analysis.currentState = analysis.analysisResult.allSolution[currentPage];

    var cell;
    var value;
    for(var i = 0; i < analysis.elements.length; i++){
        cell = analysis.elements[i];
        value = analysis.analysisResult.allSolution[currentPage].intentionElements[i].status[step];
        cell.attributes.attrs[".satvalue"].value = value;

        //Change backend value to user friendly view
        if ((value == "0001") || (value == "0011")) {
            cell.attr(".satvalue/text", "(F, ⊥)");
            cell.attr({text:{fill:'black'}});
        }else if(value == "0010") {
            cell.attr(".satvalue/text", "(P, ⊥)");
            cell.attr({text:{fill:'black'}});
        }else if ((value == "1000") || (value == "1100")){
            cell.attr(".satvalue/text", "(⊥, F)");
            cell.attr({text:{fill:'black'}});
        }else if (value == "0100") {
            cell.attr(".satvalue/text", "(⊥, P)");
            cell.attr({text:{fill:'black'}});
        }else if (value == "0110") {
            cell.attr(".satvalue/text", "(P, P)");
            cell.attr({text:{fill:'red'}});
        }else if ((value == "1110") || (value == "1010")){
            cell.attr(".satvalue/text", "(P, F)");
            cell.attr({text:{fill:'red'}});
        }else if ((value == "0111") || (value == "0101")){
            cell.attr(".satvalue/text", "(F, P)");
            cell.attr({text:{fill:'red'}});
        }else if ((value == "1111") || (value == "1001") || (value == "1101") || (value == "1011") ){
            cell.attr(".satvalue/text", "(F, F)");
            cell.attr({text:{fill:'red'}});
        }else if (value == "0000") {
            cell.attr(".satvalue/text", "(⊥,⊥)");
            cell.attr({text:{fill:'black'}});
        }else {
            cell.removeAttr(".satvalue/d");
        }
    }

}

function updatePagination(currentPage){
    var pagination = document.getElementById("pagination");
    var nextSteps_array_size = analysis.analysisResult.allSolution.length;
    if(nextSteps_array_size > 6){
        renderPreviousBtn(pagination, currentPage);
        if(currentPage - 3 < 0){
            for(var i = 0; i < 6; i++){
                render_pagination_values(currentPage, i);
            }
        }else{
            if(currentPage + 3 < nextSteps_array_size){
                for(i = currentPage - 3; i < currentPage + 3; i++){
                    render_pagination_values(currentPage, i);
                }
            }else{
                for(i = currentPage - 3; i < nextSteps_array_size; i++){
                    render_pagination_values(currentPage, i);
                }
            }
        }
        renderForwardBtn(pagination, currentPage)
    }else{
        renderPreviousBtn(pagination, currentPage);
        for(var i = 0; i < nextSteps_array_size; i++){
            render_pagination_values(currentPage, i);
        }
        renderForwardBtn(pagination, currentPage)
    }
}

function renderPreviousBtn(pagination, currentPage){
    var value;
    if(currentPage == 0){
        value = 0;
    }else{
        value = currentPage - 1;
    }
    pagination.innerHTML += '<a href="#" onclick="renderNavigationSidebar('+value.toString()+')">&laquo;</a>';
}

function renderForwardBtn(pagination, currentPage){
    var value;
    var nextSteps_array_size = analysis.analysisResult.allSolution.length;

    if(currentPage == nextSteps_array_size-1){
        value = currentPage;
    }else{
        value = currentPage + 1;
    }
    pagination.innerHTML += '<a href="#" onclick="renderNavigationSidebar(' + value.toString() + ')">&raquo;</a>';
}

function render_pagination_values(currentPage, i){
    var pagination = document.getElementById("pagination");
    if(currentPage == i){
        pagination.innerHTML += '<a href="#" class="active" onclick="renderNavigationSidebar(' + i.toString() + ')">' + i.toString() + '</a>';
    }else{
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
    var nextSteps_array_size = analysis.analysisResult.allSolution.length;

    if((requiredState != "NaN") && (requiredState > 0)){
        if(requiredState > nextSteps_array_size){
            renderNavigationSidebar(nextSteps_array_size);
        }else{
            renderNavigationSidebar(requiredState);
        }
    }
}


function add_filter(){
    console.log("clicked");
    tempResults = jQuery.extend(true, {}, window.opener.savedAnalysisData.allNextStatesResult);
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
        else{
            if (filterOrderQueue.indexOf(checkbox.id) != -1){
                filterOrderQueue.splice(filterOrderQueue.indexOf(checkbox.id), 1);
            }
        }
    }
    console.log(filterOrderQueue);

    for(var i_element = 0; i_element <  filterOrderQueue.length; i_element++){
        switch(filterOrderQueue[i_element]){
            case "conflictFl":
                console.log("conflictFl");
                console.log(tempResults.allSolution.length);
                var index_to_rm = [];
                for (var solution_index=0; solution_index < tempResults.allSolution.length; solution_index++) {
                    for (var element_index=0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++){
                        var value = tempResults.allSolution[solution_index].intentionElements[element_index].status[0];
                        if (	(value == "0110") ||
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
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "ttFl":
                console.log("ttFl");
                console.log(tempResults.allSolution.length);

                var index_to_rm = [];
                for (var solution_index=0; solution_index < tempResults.allSolution.length; solution_index++) {
                    for (var element_index=0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++){
                        var value = tempResults.allSolution[solution_index].intentionElements[element_index].status[0];
                        if (	value == "0000"){
                            index_to_rm.push(solution_index);
                            break;
                        }
                    }
                }
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "leastTasksSatisfied":
                console.log("leastTasksSatisfied");
                console.log(tempResults.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var least_t_s = tempResults.allSolution.length;
                for (var solution_index=0; solution_index < tempResults.allSolution.length; solution_index++) {
                    var num_t_s = 0;
                    for (var element_index=0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++){
                        //
                        if (tempResults.allSolution[solution_index].intentionElements[element_index].type === "TASK"){
                            var value = tempResults.allSolution[solution_index].intentionElements[element_index].status[0];
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
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "mostTasksSatisfied":
                console.log("mostTasksSatisfied");
                console.log(tempResults.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var most_t_s = 0;
                for (var solution_index=0; solution_index < tempResults.allSolution.length; solution_index++) {
                    var num_t_s = 0;
                    for (var element_index=0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++){
                        //
                        if (tempResults.allSolution[solution_index].intentionElements[element_index].type === "TASK"){
                            var value = tempResults.allSolution[solution_index].intentionElements[element_index].status[0];
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
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "leastResource":
                console.log("leastResource");
                console.log(tempResults.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var least_r_s = tempResults.allSolution.length;
                for (var solution_index=0; solution_index < tempResults.allSolution.length; solution_index++) {
                    var num_r_s = 0;
                    for (var element_index=0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++){
                        if (tempResults.allSolution[solution_index].intentionElements[element_index].type === "RESOURCE"){
                            var value = tempResults.allSolution[solution_index].intentionElements[element_index].status[0];
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
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "mostResource":
                console.log("mostResource");
                console.log(tempResults.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var most_r_s = 0;
                for (var solution_index=0; solution_index < tempResults.allSolution.length; solution_index++) {
                    var num_r_s = 0;
                    for (var element_index=0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++){
                        if (tempResults.allSolution[solution_index].intentionElements[element_index].type === "RESOURCE"){
                            var value = tempResults.allSolution[solution_index].intentionElements[element_index].status[0];
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
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "leastGoalSatisfied":
                console.log("leastGoalSatisfied");
                console.log(tempResults.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var least_goal_s = tempResults.allSolution.length;
                for (var solution_index=0; solution_index < tempResults.allSolution.length; solution_index++) {
                    var num_g_s = 0;
                    for (var element_index=0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++){
                        if (tempResults.allSolution[solution_index].intentionElements[element_index].type === "GOAL"){
                            var value = tempResults.allSolution[solution_index].intentionElements[element_index].status[0];
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
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "mostGoalSatisfied":
                console.log("mostGoalSatisfied");
                console.log(tempResults.allSolution.length);

                var index_to_keep = [];
                var index_to_rm = [];

                var most_goal_s = 0;
                for (var solution_index=0; solution_index < tempResults.allSolution.length; solution_index++) {
                    var num_g_s = 0;
                    for (var element_index=0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++){
                        if (tempResults.allSolution[solution_index].intentionElements[element_index].type === "GOAL"){
                            var value = tempResults.allSolution[solution_index].intentionElements[element_index].status[0];
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
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "LeastActor":
                console.log("LeastActor");
                console.log(tempResults.allSolution.length);

                var least_actor = tempResults.allSolution.length;
                var index_to_keep = [];
                var index_to_rm = [];
                for (var solution_index = 0; solution_index < tempResults.allSolution.length; solution_index++) {
                    var actors = {};
                    for (var element_index = 0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++) {
                        if (! actors[tempResults.allSolution[solution_index].intentionElements[element_index].actorId]){
                            actors[tempResults.allSolution[solution_index].intentionElements[element_index].actorId] = 0;
                        }
                        var value = tempResults.allSolution[solution_index].intentionElements[element_index].status[0];
                        if ((value == "0010" || value == "0011" || (value == "0110") ||
                            (value == "0111") ||
                            (value == "0101") ||
                            (value == "1110") ||
                            (value == "1010") ||
                            (value == "1111") ||
                            (value == "1001") ||
                            (value == "1101") ||
                            (value == "1011"))){
                            actors[tempResults.allSolution[solution_index].intentionElements[element_index].actorId] =1;
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
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "mostActor":
                console.log("mostActor");
                console.log(tempResults.allSolution.length);

                var most_actor = 0;
                var index_to_keep = [];
                var index_to_rm = [];
                for (var solution_index = 0; solution_index < tempResults.allSolution.length; solution_index++) {
                    var actors = {};
                    for (var element_index = 0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++) {
                        if (! actors[tempResults.allSolution[solution_index].intentionElements[element_index].actorId]){
                            actors[tempResults.allSolution[solution_index].intentionElements[element_index].actorId] = 0;
                        }
                        var value = tempResults.allSolution[solution_index].intentionElements[element_index].status[0];
                        if ((value == "0010" || value == "0011" || (value == "0110") ||
                            (value == "0111") ||
                            (value == "0101") ||
                            (value == "1110") ||
                            (value == "1010") ||
                            (value == "1111") ||
                            (value == "1001") ||
                            (value == "1101") ||
                            (value == "1011"))){
                            actors[tempResults.allSolution[solution_index].intentionElements[element_index].actorId] =1;
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
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            case "mostConstraintSatisfaction":
                var domains = {};
                for (var solution_index = 0; solution_index < tempResults.allSolution.length; solution_index++) {
                    for (var element_index = 0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++) {
                        if (! domains[tempResults.allSolution[solution_index].intentionElements[element_index].id]){
                            domains[tempResults.allSolution[solution_index].intentionElements[element_index].id] = [tempResults.allSolution[solution_index].intentionElements[element_index].status[0]];
                        } else {
                            if (domains[tempResults.allSolution[solution_index].intentionElements[element_index].id].indexOf(tempResults.allSolution[solution_index].intentionElements[element_index].status[0]) == -1){
                                domains[tempResults.allSolution[solution_index].intentionElements[element_index].id].push(tempResults.allSolution[solution_index].intentionElements[element_index].status[0])
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
                for (var solution_index = 0; solution_index < tempResults.allSolution.length; solution_index++) {
                    for (var element_index = 0; element_index < tempResults.allSolution[solution_index].intentionElements.length; element_index++) {
                        if (int_with_smallest_domain.indexOf(tempResults.allSolution[solution_index].intentionElements[element_index].id) != -1){
                            if (tempResults.allSolution[solution_index].intentionElements[element_index].status[0] !== "0011"){
                                index_to_rm.push(solution_index);
                                break;
                            }
                        }
                    }
                }
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
                break;
            default:
                console.log("default");
                break;
        }
    }

    analysis.analysisResult = tempResults;

    renderNavigationSidebar();
}


function updateAnalysisRequestWithCurrentState(){
    analysisRequest =  jQuery.extend(true, {}, window.opener.analysisRequest);

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

    for (var i = 0; i < model.intentions.length ; i++){
        // more than one piece of functions involved
        if (!allEpochs[model.intentions[i].nodeID]){
            allEpochs[model.intentions[i].nodeID] = [];
        }

        if (model.intentions[i].dynamicFunction.stringDynVis === "NT" ||
            model.intentions[i].dynamicFunction.stringDynVis === "C" ||
            model.intentions[i].dynamicFunction.stringDynVis === "I" ||
            model.intentions[i].dynamicFunction.stringDynVis === "D" ||
            model.intentions[i].dynamicFunction.stringDynVis === "R" ||
            model.intentions[i].dynamicFunction.stringDynVis === "NB" ){
            continue;
        }
        else if (model.intentions[i].dynamicFunction.stringDynVis === "SD" ||
            model.intentions[i].dynamicFunction.stringDynVis === "DS" ||
            model.intentions[i].dynamicFunction.stringDynVis === "CR" ||
            model.intentions[i].dynamicFunction.stringDynVis === "RC" ||
            model.intentions[i].dynamicFunction.stringDynVis === "MP" ||
            model.intentions[i].dynamicFunction.stringDynVis === "MN" ){
            allEpochs[model.intentions[i].nodeID].push("E" + model.intentions[i].nodeID);
            num_epochs ++;
        }
        else if (model.intentions[i].dynamicFunction.stringDynVis === "UD"){
            // getting function charEB list
            var charEBs = [];
            for (var j = 0; j < model.intentions[i].dynamicFunction.functionSegList.length; j ++){
                if (charEBs.indexOf(model.intentions[i].dynamicFunction.functionSegList[j].funcStart === -1)){
                    charEBs.push(model.intentions[i].dynamicFunction.functionSegList[j].funcStart);
                }
                if (charEBs.indexOf(model.intentions[i].dynamicFunction.functionSegList[j].funcStop === -1)){
                    charEBs.push(model.intentions[i].dynamicFunction.functionSegList[j].funcStop);
                }

            }
            // ignoring 0 and infinity in charEBs
            for (var k = 1; k < charEBs.length-1; k ++){
                allEpochs[model.intentions[i].nodeID].push("E" + model.intentions[i].nodeID + "_" + charEBs[k]);
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
    for (var i = 0; i < model.intentions.length ; i++) {
        if (model.intentions[i].dynamicFunction.stringDynVis === "NT" ||
            model.intentions[i].dynamicFunction.stringDynVis === "C" ||
            model.intentions[i].dynamicFunction.stringDynVis === "I" ||
            model.intentions[i].dynamicFunction.stringDynVis === "D" ||
            model.intentions[i].dynamicFunction.stringDynVis === "R" ||
            model.intentions[i].dynamicFunction.stringDynVis === "NB") {
            continue;
        }

        // Satisfied Denied or Denied Satisfied
        if (model.intentions[i].dynamicFunction.stringDynVis === "SD" || model.intentions[i].dynamicFunction.stringDynVis === "DS") {
            // Epoch happens when previous is initial state and current is final state
            var startValue = model.intentions[i].dynamicFunction.functionSegList[0].funcX;
            var endValue = model.intentions[i].dynamicFunction.functionSegList[1].funcX;
            var previousStatus = analysisRequest.previousAnalysis.elementList[i].status[current];
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (previousStatus === startValue && curStatus === endValue) {
                definiteEpochs.push("E" + model.intentions[i].nodeID);
            }

        }

        // Stochastic Constant
        if (model.intentions[i].dynamicFunction.stringDynVis === "RC") {
            // check if epoch has happened already
            // check if obj["key"] != undefined
            if (previousEpochs.indexOf("E" + model.intentions[i].nodeID) > -1) {
                continue;
            }
            // check if current value is the final value
            // this goes into potential list
            var endValue = model.intentions[i].dynamicFunction.functionSegList[1].funcX;
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus === endValue) {
                potentialEpochs.push("E" + model.intentions[i].nodeID);
            }

        }

        // Constant Stochastic
        if (model.intentions[i].dynamicFunction.stringDynVis === "CR") {
            // check if epoch has happened already
            if (previousEpochs.indexOf("E" + model.intentions[i].nodeID) > -1) {
                break;
            }
            // TODO: add to potential epochs directly?
            // check if previous is constant value and current is not constant value
            var startValue = model.intentions[i].dynamicFunction.functionSegList[0].funcX;
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus !== startValue) {
                definiteEpochs.push("E" + model.intentions[i].nodeID) ;
            }

        }

        // Monotonic Positive or Monotonic Negative
        if (model.intentions[i].dynamicFunction.stringDynVis === "MP" || model.intentions[i].dynamicFunction.stringDynVis === "MN") {
            // check if epoch has happened already
            if (previousEpochs.indexOf("E" + model.intentions[i].nodeID) > -1) {
                console.log("found epoch");
                break;
            }
            // check if current value is the final value
            // this goes into potential list
            var endValue = model.intentions[i].dynamicFunction.functionSegList[1].funcX;
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus === endValue) {
                potentialEpochs.push("E" + model.intentions[i].nodeID);
            }

        }

        // User Defined TODO: need to fix UD functions
        if (model.intentions[i].dynamicFunction.stringDynVis === "UD") {
            var next_epoch = "";
            var cur_seg = -1;
            for (var j = 0; j < model.intentions[i].dynamicFunction.functionSegList.length; j++) {
                var start_epoch = "E" + model.intentions[i].nodeID + "_" + model.intentions[i].dynamicFunction.functionSegList[j].funcStart;
                var end_epoch = "E" + model.intentions[i].nodeID + "_" + model.intentions[i].dynamicFunction.functionSegList[j].funcStop;
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

            var endValue = model.intentions[i].dynamicFunction.functionSegList[cur_seg].funcX;
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];

            // if the next segment is random, the epoch goes to potential epochs
            var go_to_potentials = 0;
            if (cur_seg < model.intentions[i].dynamicFunction.functionSegList.length-1){
                if (model.intentions[i].dynamicFunction.functionSegList[cur_seg+1].funcType === "R"){
                    go_to_potentials = 1;
                }
            }
            switch (model.intentions[i].dynamicFunction.functionSegList[cur_seg].funcType) {
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
                    if ((cur_seg < model.intentions[i].dynamicFunction.functionSegList.length-1) && (model.intentions[i].dynamicFunction.functionSegList[cur_seg+1].funcType === "C")){
                        if (curStatus === model.intentions[i].dynamicFunction.functionSegList[cur_seg+1].funcX){
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

    var difference = parseInt(model.maxAbsTime) - nextTimePoint;
    console.log("difference: " + difference);
    if (numTPLeft > difference){
        var newRand = Math.floor(Math.random() *
            ( parseInt(model.maxAbsTime) - numTPLeft - parseInt(analysisRequest.previousAnalysis.timePointPath[current] + 1))
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
        for (var j = 1; j < parseInt(analysisRequest.numRelTime); j ++){
            if (prevRelativePoints.indexOf(j) == -1){
                newRel = j;
                break;
            }
        }

        // update time point path with TR?_tp
        analysisRequest.previousAnalysis.assignedEpoch.push("TR" + newRel + "_" + nextTimePoint);
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

    for (var i = 0; i < model.intentions.length ; i++){
        // more than one piece of functions involved
        if (!allEpochs[model.intentions[i].nodeID]){
            allEpochs[model.intentions[i].nodeID] = [];
        }

        if (model.intentions[i].dynamicFunction.stringDynVis === "NT" ||
            model.intentions[i].dynamicFunction.stringDynVis === "C" ||
            model.intentions[i].dynamicFunction.stringDynVis === "I" ||
            model.intentions[i].dynamicFunction.stringDynVis === "D" ||
            model.intentions[i].dynamicFunction.stringDynVis === "R" ||
            model.intentions[i].dynamicFunction.stringDynVis === "NB" ){
            continue;
        }
        else if (model.intentions[i].dynamicFunction.stringDynVis === "SD" ||
            model.intentions[i].dynamicFunction.stringDynVis === "DS" ||
            model.intentions[i].dynamicFunction.stringDynVis === "CR" ||
            model.intentions[i].dynamicFunction.stringDynVis === "RC" ||
            model.intentions[i].dynamicFunction.stringDynVis === "MP" ||
            model.intentions[i].dynamicFunction.stringDynVis === "MN" ){
            allEpochs[model.intentions[i].nodeID].push("E" + model.intentions[i].nodeID);
            num_epochs ++;
        }
        else if (model.intentions[i].dynamicFunction.stringDynVis === "UD"){
            //TODO: fix the name to be the inbetween start and end points
            // getting function charEB list
            var charEBs = [];
            for (var j = 0; j < model.intentions[i].dynamicFunction.functionSegList.length; j ++){
                if (charEBs.indexOf(model.intentions[i].dynamicFunction.functionSegList[j].funcStart === -1)){
                    charEBs.push(model.intentions[i].dynamicFunction.functionSegList[j].funcStart);
                }
                if (charEBs.indexOf(model.intentions[i].dynamicFunction.functionSegList[j].funcStop === -1)){
                    charEBs.push(model.intentions[i].dynamicFunction.functionSegList[j].funcStop);
                }

            }
            // ignoring 0 and infinity in charEBs
            for (var k = 1; k < charEBs.length-1; k ++){
                allEpochs[model.intentions[i].nodeID].push("E" + model.intentions[i].nodeID + "_" + charEBs[k]);
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
    for (var i = 0; i < model.intentions.length ; i++){
        if (model.intentions[i].dynamicFunction.stringDynVis === "NT" ||
            model.intentions[i].dynamicFunction.stringDynVis === "C" ||
            model.intentions[i].dynamicFunction.stringDynVis === "I" ||
            model.intentions[i].dynamicFunction.stringDynVis === "D" ||
            model.intentions[i].dynamicFunction.stringDynVis === "R" ||
            model.intentions[i].dynamicFunction.stringDynVis === "NB" ){
            continue;
        }

        // Satisfied Denied or Denied Satisfied
        if (model.intentions[i].dynamicFunction.stringDynVis === "SD" || model.intentions[i].dynamicFunction.stringDynVis === "DS"){
            // Epoch happens when previous is initial state and current is final state
            var startValue = model.intentions[i].dynamicFunction.functionSegList[0].funcX;
            var endValue = model.intentions[i].dynamicFunction.functionSegList[1].funcX;
            var previousStatus = analysisRequest.previousAnalysis.elementList[i].status[current];
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (previousStatus === startValue && curStatus === endValue){
                potentialEpoch = "E" + model.intentions[i].nodeID;
            }

        }

        // Stochastic Constant
        if (model.intentions[i].dynamicFunction.stringDynVis === "RC"){
            // check if epoch has happened already
            // check if obj["key"] != undefined
            if (previousEpochs.indexOf("E" + model.intentions[i].nodeID) > -1){
                continue;
            }
            // check if current value is the final value
            // this goes into potential list
            var endValue = model.intentions[i].dynamicFunction.functionSegList[1].funcX;
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus === endValue){
                potentialEpochs.push("E" + model.intentions[i].nodeID);
            }

        }

        // Constant Stochastic
        if (model.intentions[i].dynamicFunction.stringDynVis === "CR"){
            // check if epoch has happened already
            if (previousEpochs.indexOf("E" + model.intentions[i].nodeID) > -1){
                break;
            }
            // TODO: add to potential epochs directly?
            // check if previous is constant value and current is not constant value
            var startValue = model.intentions[i].dynamicFunction.functionSegList[0].funcX;
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus !== startValue){
                potentialEpoch = "E" + model.intentions[i].nodeID;
            }

        }

        // Monotonic Positive or Monotonic Negative
        if (model.intentions[i].dynamicFunction.stringDynVis === "MP" || model.intentions[i].dynamicFunction.stringDynVis === "MN") {
            // check if epoch has happened already
            if (previousEpochs.indexOf("E" + model.intentions[i].nodeID) > -1){
                console.log("found epoch");
                break;
            }
            // check if current value is the final value
            // this goes into potential list
            var endValue = model.intentions[i].dynamicFunction.functionSegList[1].funcX;
            var curStatus = savedAnalysisData.allNextStatesResult.allSolution[index_of_selected_state].intentionElements[i].status[0];
            if (curStatus === endValue){
                potentialEpochs.push("E" + model.intentions[i].nodeID);
            }

        }

        // User Defined TODO: need to fix UD functions
        if (model.intentions[i].dynamicFunction.stringDynVis === "UD"){
            var next_epoch_name = "";
            var next_funcseg_index = 0;
            for (var j = 0; j < model.intentions[i].dynamicFunction.functionSegList.length; j ++){
                var epoch_name = "E" + model.intentions[i].nodeID + "_" + model.intentions[i].dynamicFunction.functionSegList[j].funcType;
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

    var difference = parseInt(model.maxAbsTime) - parseInt(analysisRequest.previousAnalysis.timePointPath[currentState]);
    console.log("difference: " + difference);
    if (numTPLeft > difference){
        var newRand = Math.floor(Math.random() *
            ( parseInt(model.maxAbsTime) - numTPLeft - parseInt(analysisRequest.previousAnalysis.timePointPath[current] + 1))
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

    var jsObject = {};

    //Get the Graph Model
    jsObject.model = model;

    if(jsObject.model == null) {
        return null;
    }

    updateAnalysisRequestWithCurrentState();
    analysisRequest.action = "singlePath";

    jsObject.analysisRequest = analysisRequest;
    console.log(jsObject);


    window.opener.backendComm(jsObject);

}


//This function should get the current state and generate a new window with the next possible states
function generate_next_states(){

    // Object to be sent to the backend
    var jsObject = {};
    //Get the Graph Model
    jsObject.model = model;

    if(jsObject.model == null) {
        return null;
    }

    updateAnalysisRequestWithCurrentState();

    /*for (var i = 0; i < analysisRequest.previousAnalysis.elementList.length ; i++){
        analysisRequest.previousAnalysis.elementList[i].status.slice(0, current+2);
    }*/
    analysisRequest.action = "allNextStates";

    jsObject.analysisRequest = analysisRequest;
    console.log(analysisRequest);

    backendComm(jsObject);


}