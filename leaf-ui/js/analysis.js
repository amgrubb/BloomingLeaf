//Defining local scope
var analysis = {};

analysis.analysisResult;
analysis.elements = [];
analysis.currentState;
var tempResults;
var filterOrderQueue = [];
var savedAnalysisData = {};
var globalAnalysisResult;

var graph;

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

    globalAnalysisResult = jQuery.extend({}, window.opener.globalAnalysisResult);


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

        //Loop through the cookies to find the one representing the graph, if it exists
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
        analysis.analysisResult = globalAnalysisResult;
    }
    savedAnalysisData = jQuery.extend({}, window.opener.savedAnalysisData);
    graph =  jQuery.extend({}, window.opener.graph);
    tempResults = $.extend(true,{}, globalAnalysisResult);
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
            cell.attr(".satvalue/text", "(FS, T)");
            cell.attr({text:{fill:'black'}});
        }else if(value == "0010") {
            cell.attr(".satvalue/text", "(PS, T)");
            cell.attr({text:{fill:'black'}});
        }else if ((value == "1000") || (value == "1100")){
            cell.attr(".satvalue/text", "(T, FD)");
            cell.attr({text:{fill:'black'}});
        }else if (value == "0100") {
            cell.attr(".satvalue/text", "(T, PD)");
            cell.attr({text:{fill:'black'}});
        }else if (value == "0110") {
            cell.attr(".satvalue/text", "(PS, PD)");
            cell.attr({text:{fill:'red'}});
        }else if ((value == "1110") || (value == "1010")){
            cell.attr(".satvalue/text", "(PS, FD)");
            cell.attr({text:{fill:'red'}});
        }else if ((value == "0111") || (value == "0101")){
            cell.attr(".satvalue/text", "(FS, PD)");
            cell.attr({text:{fill:'red'}});
        }else if ((value == "1111") || (value == "1001") || (value == "1101") || (value == "1011") ){
            cell.attr(".satvalue/text", "(FS, FD)");
            cell.attr({text:{fill:'red'}});
        }else if (value == "0000") {
            cell.attr(".satvalue/text", "(T,T)");
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
    tempResults = $.extend(true,{}, globalAnalysisResult);
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

//This function should get the current state in the screen and save in the original path
function save_current_state(){

    var jsObject = {};

    //Get the Graph Model
    jsObject.model = getFrontendModel(false);

    //this.saveElementsInGraphVariable();
    var elements = [];
    for (var i = 0; i < graph.getElements().length; i++){
        if (!(graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
            elements.push(graph.getElements()[i]);
        }
    }
    graph.allElements = elements;
    graph.elementsBeforeAnalysis = elements;

    if(jsObject.model == null) {
        return null;
    }

    // updating input analysis
    var index_of_selected_state = parseInt(document.getElementById("currentPage").value);


    // getting current state
    var i = savedAnalysisData.allNextStatesAnalysis.currentState.indexOf('|', 0);
    var current = parseInt(savedAnalysisData.allNextStatesAnalysis.currentState.substring(0, i));


    // add the previous solution path to the element lists
    for (var element_index = 0; element_index < savedAnalysisData.singlePathSolution.elementList.length; element_index++){
        savedAnalysisData.singlePathAnalysis.elementList[element_index].status = [];
        for (var state_index = 0; state_index < current; state_index++){
            savedAnalysisData.singlePathAnalysis.elementList[element_index].status.push(savedAnalysisData.singlePathSolution.elementList[element_index].status[state_index]);
        }
    }


    for (var element_index = 0; element_index < tempResults.allSolution[index_of_selected_state].intentionElements.length; element_index++){
        savedAnalysisData.singlePathAnalysis.elementList[element_index].status[current] = tempResults.allSolution[index_of_selected_state].intentionElements[element_index].status[0];
    }


    var nextTimePoint = savedAnalysisData.allNextStatesAnalysis.initialValueTimePoints[current+1];

    // update initialValueTimePoints from next states analysis
    // all the time points from initial to and including current
    savedAnalysisData.singlePathAnalysis.initialValueTimePoints = savedAnalysisData.allNextStatesAnalysis.initialValueTimePoints.slice(0,current);

    // TODO : need to make sure it works with absolute time points as well
    // current only works with relative time points

    // update initialAssignedEpoch
    var assignedRelTP = 1;
    var prev_assigned_epochs = [];
    for (var i = 0; i < savedAnalysisData.allNextStatesAnalysis.initialAssignedEpoch.length; i++){
        var regex = /.*_(.*)/g;
        var match = regex.exec(savedAnalysisData.allNextStatesAnalysis.initialAssignedEpoch[i]);
        if (savedAnalysisData.singlePathAnalysis.initialValueTimePoints.indexOf(match[1]) > -1){
            // change the index of the relative points so they make sense?
            if (savedAnalysisData.allNextStatesAnalysis.initialAssignedEpoch[i].indexOf("R") > -1){
                console.log("relative time point");
                prev_assigned_epochs.push("TR" + assignedRelTP + "_" + match[1]);
                assignedRelTP ++;
            } else{
                prev_assigned_epochs.push(savedAnalysisData.allNextStatesAnalysis.initialAssignedEpoch[i]);
            }
        }
    }
    savedAnalysisData.singlePathAnalysis.initialAssignedEpoch = prev_assigned_epochs;

    // if (max - next time point < #time points left){  time points left -> epochs left  + absolute time points left
    //       next time point = rand(cur time point, max - # time point left);
    // }

    savedAnalysisData.singlePathAnalysis.initialValueTimePoints.push(nextTimePoint);


    // determine the type of the current time point
    // relative for now

    // get the list of all epochs
    var allEpochs = {}; // intention id : list of epoch names
    for (var i = 0; i < jsObject.model.dynamics.length; i ++){
        if (!allEpochs[jsObject.model.dynamics[i].intentionID]){
            allEpochs[jsObject.model.dynamics[i].intentionID] = [];
        }
        if (jsObject.model.dynamics[i].dynamicType === "NT" ||
            jsObject.model.dynamics[i].dynamicType === "C" ||
            jsObject.model.dynamics[i].dynamicType === "I" ||
            jsObject.model.dynamics[i].dynamicType === "D" ||
            jsObject.model.dynamics[i].dynamicType === "R" ||
            jsObject.model.dynamics[i].dynamicType === "NB" ){
            continue;
        }
        else if (jsObject.model.dynamics[i].dynamicType === "SD" ||
            jsObject.model.dynamics[i].dynamicType === "DS" ||
            jsObject.model.dynamics[i].dynamicType === "CR" ||
            jsObject.model.dynamics[i].dynamicType === "RC" ||
            jsObject.model.dynamics[i].dynamicType === "MP" ||
            jsObject.model.dynamics[i].dynamicType === "MN" ){
            allEpochs[jsObject.model.dynamics[i].intentionID].push("E" + jsObject.model.dynamics[i].intentionID);
        }
        else if (jsObject.model.dynamics[i].dynamicType === "UD"){
            // TODO : after merge with refactoring -> problem with model spec building with user defined functions
        }
    }
    console.log(allEpochs);

    // need to know if an epoch happens on a absolute time point

    // collect possible current epoch (name)
    var potentialEpoch = [];
    if (potentialEpoch.length == 0){
        // if no epoch possible, make it a relative time point
        // unless it's absolute
        savedAnalysisData.singlePathAnalysis.initialAssignedEpoch.push("TR" + current + "_" + savedAnalysisData.singlePathAnalysis.initialValueTimePoints[current]);
    } else {
        // make a random choice

    }




    // update numRelTime [MAYBE]
    //savedAnalysisData.singlePathAnalysis.numRelTime -= assignedRelTP;

    jsObject.analysis = savedAnalysisData.singlePathAnalysis;
    console.log(jsObject.analysis);

    savedAnalysisData.singlePathAnalysis.currentState = current + "|" + savedAnalysisData.singlePathAnalysis.initialValueTimePoints[current];


    //Send data to backend
    //window.opener.backendComm(jsObject);
    console.log(savedAnalysisData.singlePathAnalysis);
}


//This function should get the current state and generate a new window with the next possible states
function generate_next_states(){

    // Object to be sent to the backend
    var jsObject = {};
    var index_of_selected_state = parseInt(document.getElementById("currentPage").value);

    var newInputAnalysis = _.clone(savedAnalysisData.allNextStatesAnalysis);
    console.log(savedAnalysisData.allNextStatesAnalysis);
    // update InputAnalysis with the current selected state
    for (var element_index = 0; element_index < tempResults.allSolution[index_of_selected_state].intentionElements.length; element_index++){
        newInputAnalysis.elementList[element_index].status.push(tempResults.allSolution[index_of_selected_state].intentionElements[element_index].status[0]);
    }

    var i = newInputAnalysis.currentState.indexOf('|', 0);
    var current = parseInt(newInputAnalysis.currentState.substring(0, i));
    current ++;

    //update currentSate in InputAnalysis
    newInputAnalysis.currentState = current + "|" + newInputAnalysis.initialValueTimePoints[current];
    jsObject.analysis = newInputAnalysis;

    //Get the Graph Model
    jsObject.model = getFrontendModel(false);

    //this.saveElementsInGraphVariable();
    var elements = [];
    for (var i = 0; i < graph.getElements().length; i++){
        if (!(graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
            elements.push(graph.getElements()[i]);
        }
    }
    graph.allElements = elements;
    graph.elementsBeforeAnalysis = elements;

    if(jsObject.model == null) {
        return null;
    }

    //Send data to backend
    backendComm(jsObject);

}