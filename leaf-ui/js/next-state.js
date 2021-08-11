/**
 * New file for Next State Window.
 */

 { // LOCAL GLOBAL VARIABLES
    var analysis = {};
    // analysis.analysisResult;
    // analysis.elements = [];
    // analysis.currentState;
    
    var myInputJSObject;
    myInputJSObject.request;
    myInputJSObject.results;

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


    function updateNodesValues(currentPage, step = 0){
        if(currentPage == "")
            currentPage = 0;
    
        //Set the currentState variable so it can be sent back to the original path
        var i = 0;
        for (let element of analysis.graph.getElements()) {
            console.log(element);
            // cell = analysis.elements[i];
            // value = analysis.analysisResult.allSolution[currentPage].intentionElements[i].status[step];
            // TODO: fix this line below
            satValue = myInputJSObject.results.get('elementList')[i].status[myInputJSObject.results.get('elementList')[i].status.length - 1];
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

}