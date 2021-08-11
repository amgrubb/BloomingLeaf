/**
 * New file for Next State Window.
 */

 { // LOCAL GLOBAL VARIABLES
    var analysis = {};
    // analysis.analysisResult;
    // analysis.elements = [];
    // analysis.currentState;
    
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


    function updateAnalysisRequestWithCurrentState(){
        // updating input analysis
        var index_of_selected_state = parseInt(document.getElementById("currentPage").value);
    
        // getting current state
        // var currentState = current + 1;
        // var currentState = myInputJSObject.analysisRequest.results
        for (let result of myInputJSObject.request.get('results')) {
            if (result.selected == true) {
                var currentState = result.selectedTimePoint;
            }
        }
        console.log(current);
        console.log(currentState);
    
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
}    