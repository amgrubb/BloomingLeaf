//Defining local scope
var analysis = {};

analysis.analysisResult;
analysis.elements = [];
analysis.currentState;

//This merge the attributes of old page and new page
analysis.page = jQuery.extend({}, window.opener.document);

//Executing scripts only when page is fully loaded
window.onload = function(){
    init();
    renderNavigationSidebar();
}

function init(){
    //Page objects
    analysis.graph = new joint.dia.Graph();
    analysis.paper;
    analysis.paperScroller;

    //Objects from parent page
    analysis.parentResults = jQuery.extend({}, window.opener.global_analysisResult);



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
        analysis.analysisResult = analysis.parentResults;
    }
}

function renderNavigationSidebar(currentPage = 0){
    clear_pagination_values();

    var currentPageIn = document.getElementById("currentPage");
    var num_states_lbl = document.getElementById("num_states_lbl");
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

var tempResults;

function add_filter(){
    tempResults = $.extend(true,{}, analysis.parentResults);

    for(var i_element = 0; i_element < document.getElementsByClassName("filter_checkbox").length; i_element++){
        checkbox = document.getElementsByClassName("filter_checkbox")[i_element]

        if((checkbox.id == "conflictFl") && (checkbox.checked)){
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
        }

        if((checkbox.id == "ttFl") && (checkbox.checked)){
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
        }


        if ((checkbox.id == "leastTasksSatisfied") && (checkbox.checked)){
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
        }

        if ((checkbox.id == "leastResource") && (checkbox.checked)){
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
        }

        if ((checkbox.id == "mostGoalSatisfied") && (checkbox.checked)){
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
        }

        if ((checkbox.id == "LeastActor") && (checkbox.checked)) {
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
                    if ((value !== "0100" || value !== "1000")){
                        actors[tempResults.allSolution[solution_index].intentionElements[element_index].actorId] ++;
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
                index_to_rm.sort(function(a, b){return a-b});
                for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                    tempResults.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                }
            }
        }

    }

    analysis.analysisResult = tempResults;

    renderNavigationSidebar();
}

//This function should get the current state in the screen and save in the original path
function save_current_state(){
    var modal = document.getElementById("modal_save_next_state");
    modal.style.visibility = (modal.style.visibility == "visible") ? "hidden" : "visible";

    modal.content = document.getElementById("modal-content");
    analysis.storage = jQuery.extend({}, window.opener.storage);
    modal.content.append("<p>" + JSON.stringify(analysis.storage, null, "\t") + "<\p>");
}

//This function should get the current state and generate a new window with the next possible states
function generate_next_states(){

}
