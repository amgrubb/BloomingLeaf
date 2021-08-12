/**
 * New file for Next State Window.
 */

 { // LOCAL GLOBAL VARIABLES
    var analysis = {};
    // analysis.analysisResult;
    // analysis.elements = [];
    // analysis.currentState;

    var filterOrderQueue = [];
    
    // Analysis objects from original window
    var myInputJSObject;
    myInputJSObject.request; // configBBM of the selected configuration 
    myInputJSObject.results; // resultBBM of results from the backend

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
        analysis.page = jQuery.extend({}, window.opener.document);
        init();
        renderNavigationSidebar();
    }
    
    /**
     * Initializes all of the components needed for the popup window
     */
    function init(){
        //Page objects
        analysis.graph = new joint.dia.BloomingGraph();
        analysis.paper;
        analysis.paperScroller;

        // Create Paper object
        analysis.paper = new joint.dia.Paper({
            width: 1200,
            height: 600,
            gridSize: 10,
            perpendicularLinks: false,
            model: analysis.graph,
            defaultLink: new joint.shapes.basic.CellLink({ //new joint.dia.Link({
                'attrs': {
                    '.connection': {stroke: '#000000'},
                    '.marker-source': {'d': '0'},
                    '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
                },
                'labels': [{position: 0.5, attrs: {text: {text: "and"}}}]
            })
        });
    
        // Add scroll feature to the paper.
        analysis.paperScroller = new joint.ui.PaperScroller({
            autoResizePaper: true,
            paper: analysis.paper
        });
        $('#paper').append(analysis.paperScroller.render().el);
        analysis.paperScroller.center();

        // Make a copy of the graph and add it to the window.
        analysis.graph.fromJSON(JSON.parse(backendStringifyCirc(window.opener.graph.toJSON())));

        //These object hold the request and results for the object.
        console.log("Request:" + JSON.stringify(myInputJSObject.request.toJSON()));
        console.log("Result:" + JSON.stringify(myInputJSObject.results.toJSON()));
        console.log(myInputJSObject.request);
        console.log(myInputJSObject.results);
        
    }

    /**
     * Updates the satisfaction values of the elements based on which page is selected
     * 
     * @param {Integer} currentPage 
     * The number of the page that is selected in the next State window
     */
    function updateNodesValues(currentPage){
        if(currentPage == "")
            currentPage = 0;
    
        //Set the currentState variable so it can be sent back to the original path
        var i = 0;
        for (let element of analysis.graph.getElements()) {         
            // TODO: fix this line below
            // TODO: allSolutions is a hshmap and will have more than one element
            satValue = myInputJSObject.results.get('allSolutions')["TNS-R"][currentPage][i];
            element.attr(".satvalue").value = satValue;
    
            // Sets attributes of element from the refEvidence pair from resultBBM
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

    /**
     * Renders sidebar on left side of next State
     * 
     * @param {Integer} currentPage 
     * The number of the page that is selected in the next State window
     */
    function renderNavigationSidebar(currentPage = 0){
        clear_pagination_values();
    
        var currentPageIn = document.getElementById("currentPage");
        var num_states_lbl = document.getElementById("num_states_lbl");
    
        // TODO: have to update this, allSolutions is a hashmap
        num_states_lbl.innerHTML += (myInputJSObject.results.get('allSolutions')["TNS-R"].length);
    
        currentPageIn.value = currentPage.toString();
    
        updatePagination(currentPage);
        updateNodesValues(currentPage);
    
        // TODO: implement this back in eventually
        // EVONextState.setColorBlindFromPrevWindow();
        // EVONextState.refresh();
    }

    /**
     * Updates which page is selected 
     * 
     * @param {Integer} currentPage
     * The number of the page that is selected in the next State window 
     */
    function updatePagination(currentPage){
        var pagination = document.getElementById("pagination");
        // TODO: have to update this, allSolutions is a hashmap
        var nextSteps_array_size = myInputJSObject.results.get('allSolutions')["TNS-R"].length;
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
        // TODO: have to update this, allSolutions is a hashmap
        var nextSteps_array_size = myInputJSObject.results.get('allSolutions')["TNS-R"].length;
    
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
        // TODO: have to update this, allSolutions is a hashmap
        var nextSteps_array_size = myInputJSObject.results.get('allSolutions')["TNS-R"].length;
    
        if ((requiredState != "NaN") && (requiredState > 0)){
            if (requiredState > nextSteps_array_size){
                renderNavigationSidebar(nextSteps_array_size);
            } else {
                renderNavigationSidebar(requiredState);
            }
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
        var nextSteps_array_size = myInputJSObject.results.get('allSolutions')["TNS-R"].length;
    
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
        tempResults = myInputJSObject.results
        var checkboxes = document.getElementsByClassName("filter_checkbox");
        for (var i = 0; i < checkboxes.length; i++){
            var checkbox = checkboxes[i];
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
    
        for (var i = 0; i <  filterOrderQueue.length; i++){
            switch (filterOrderQueue[i]){
                case "conflictFl":
                    console.log("conflictFl");
                    var index_to_rm = [];
                    for (var solution_index=0; solution_index < tempResults.get('allSolutions')["TNS-R"].length; solution_index++) {
                        for (var element_index=0; element_index < tempResults.get('allSolutions')["TNS-R"][solution_index].length; element_index++){
                            var value = tempResults.get('allSolutions')["TNS-R"][solution_index][element_index];
                            console.log(value);
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
                        // selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                case "ttFl":
                    console.log("ttFl");
                    console.log(tempResults.get('allSolutions')["TNS-R"]);
    
                    var index_to_rm = [];
                    for (var solution_index=0; solution_index < tempResults.get('allSolutions')["TNS-R"].length; solution_index++) {
                        for (var element_index=0; element_index < tempResults.get('allSolutions')["TNS-R"][solution_index].length; element_index++){
                            var value = tempResults.get('allSolutions')["TNS-R"][solution_index][element_index];
                            if (value == "0000"){
                                index_to_rm.push(solution_index);
                                break;
                            }
                        }
                    }
                    for (var to_rm = 0; to_rm < index_to_rm.length; to_rm ++){
                        // selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                case "leastTasksSatisfied":
                    console.log("leastTasksSatisfied");
                    //console.log(selectedResult.allSolution.length);
    
                    var index_to_keep = [];
                    var index_to_rm = [];
                    console.log(analysis.graph.getElements());
                    console.log(analysis.graph.getElements().attr('type'));
    
                    var least_t_s = tempResults.get('allSolutions')["TNS-R"].length;
                    for (var solution_index=0; solution_index < tempResults.get('allSolutions')["TNS-R"].length; solution_index++) {
                        var num_t_s = 0;
                        for (var element_index=0; element_index < tempResults.get('allSolutions')["TNS-R"][solution_index].length; element_index++){
                            if (analysis.graph.getElements()[solution_index]) {
                            // if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "TASK"){
                                var value = tempResults.get('allSolutions')["TNS-R"][solution_index][element_index];
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
                        //selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                case "mostTasksSatisfied":
                    var index_to_keep = [];
                    var index_to_rm = [];
    
                    var most_t_s = 0;
                    for (var solution_index=0; solution_index < tempResults.get('allSolutions')["TNS-R"]; solution_index++) {
                        var num_t_s = 0;
                        for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                            if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "TASK"){
                                var value = tempResults.get('allSolutions')["TNS-R"][solution_index][element_index];
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
                        //selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                case "leastResource":
                    console.log("leastResource");
                    //console.log(selectedResult.allSolution.length);
    
                    var index_to_keep = [];
                    var index_to_rm = [];
    
                    var least_r_s = tempResults.get('allSolutions')["TNS-R"];
                    for (var solution_index=0; solution_index < tempResults.get('allSolutions')["TNS-R"]; solution_index++) {
                        var num_r_s = 0;
                        for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                            if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "RESOURCE"){
                                var value = tempResults.get('allSolutions')["TNS-R"][solution_index][element_index];
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
                        //selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                case "mostResource":
                    console.log("mostResource");
                    //console.log(selectedResult.allSolution.length);
    
                    var index_to_keep = [];
                    var index_to_rm = [];
    
                    var most_r_s = 0;
                    for (var solution_index=0; solution_index < tempResults.get('allSolutions')["TNS-R"]; solution_index++) {
                        var num_r_s = 0;
                        for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                            if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "RESOURCE"){
                                var value = tempResults.get('allSolutions')["TNS-R"][solution_index][element_index];
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
                        //selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                case "leastGoalSatisfied":
                    console.log("leastGoalSatisfied");
                    //console.log(selectedResult.allSolution.length);
    
                    var index_to_keep = [];
                    var index_to_rm = [];
    
                    var least_goal_s = tempResults.get('allSolutions')["TNS-R"].length;
                    for (var solution_index=0; solution_index < tempResults.get('allSolutions')["TNS-R"].length; solution_index++) {
                        var num_g_s = 0;
                        for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                            if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "GOAL"){
                                var value = tempResults.get('allSolutions')["TNS-R"][solution_index][element_index];
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
                        //selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                case "mostGoalSatisfied":
                    console.log("mostGoalSatisfied");
                    //console.log(selectedResult.allSolution.length);
    
                    var index_to_keep = [];
                    var index_to_rm = [];
    
                    var most_goal_s = 0;
                    for (var solution_index=0; solution_index < tempResults.get('allSolutions')["TNS-R"].length; solution_index++) {
                        var num_g_s = 0;
                        for (var element_index=0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++){
                            if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "GOAL"){
                                var value = tempResults.get('allSolutions')["TNS-R"][solution_index][element_index];
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
                        //selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                case "LeastActor":
                    console.log("LeastActor");
                    //console.log(selectedResult.allSolution.length);
    
                    var least_actor = tempResults.get('allSolutions')["TNS-R"].length;
                    var index_to_keep = [];
                    var index_to_rm = [];
                    for (var solution_index = 0; solution_index < tempResults.get('allSolutions')["TNS-R"].length; solution_index++) {
                        var actors = {};
                        for (var element_index = 0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++) {
                            if (! actors[selectedResult.allSolution[solution_index].intentionElements[element_index].actorId]){
                                actors[selectedResult.allSolution[solution_index].intentionElements[element_index].actorId] = 0;
                            }
                            var value = tempResults.get('allSolutions')["TNS-R"][solution_index][element_index];
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
                        //selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                case "mostActor":
                    console.log("mostActor");
                    //console.log(selectedResult.allSolution.length);
    
                    var most_actor = 0;
                    var index_to_keep = [];
                    var index_to_rm = [];
                    for (var solution_index = 0; solution_index < tempResults.get('allSolutions')["TNS-R"].length; solution_index++) {
                        var actors = {};
                        for (var element_index = 0; element_index < selectedResult.allSolution[solution_index].intentionElements.length; element_index++) {
                            if (! actors[selectedResult.allSolution[solution_index].intentionElements[element_index].actorId]){
                                actors[selectedResult.allSolution[solution_index].intentionElements[element_index].actorId] = 0;
                            }
                            var value = tempResults.get('allSolutions')["TNS-R"][solution_index][element_index];
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
                        //selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                case "mostConstraintSatisfaction":
                    var domains = {};
                    for (var solution_index = 0; solution_index < tempResults.get('allSolutions')["TNS-R"].length; solution_index++) {
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
                    for (var solution_index = 0; solution_index < tempResults.get('allSolutions')["TNS-R"].length; solution_index++) {
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
                        //selectedResult.allSolution.splice(index_to_rm[to_rm]-to_rm,1);
                        tempResults.get('allSolutions')["TNS-R"].splice(index_to_rm[to_rm]-to_rm,1);
                    }
                    break;
                default:
                    console.log("default");
                    break;
            }
        }
    
        // analysis.analysisResult = tempResults;
        myInputJSObject.results = tempResults;

        renderNavigationSidebar();
    }

}