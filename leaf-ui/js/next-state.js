/**
 * New file for Next State Window.
 */

{ // LOCAL GLOBAL VARIABLES
    var analysis = {};
    analysis.intentions = []; // Array of all of the intentions on the graph

    var filterOrderQueue = [];

    // Analysis objects from original window
    var myInputJSObject;
    myInputJSObject.request; // configBBM of the selected configuration 
    myInputJSObject.results; // resultBBM of results from the backend

    var originalResults; // Copy of the original results to save as a reference

    // An array of all of the solutions and every element is another array 
    // with all of the refEvidencePairs for the intentions at that solution
    var allSolutionArray = [];
    // Hashmap to keep track of at which index each array from allSolutions starts and ends once they 
    // are combined into allSolutionArray
    var allSolutionIndex;

    // Object to keep track of all of the applied intention filters
    var filterIntentionList = [];
    var selectedIntention;

    //Executing scripts only when page is fully loaded
    window.onload = function () {
        analysis.page = jQuery.extend({}, window.opener.document);
        init();
        renderNavigationSidebar();
    }

    /**
     * Initializes all of the components needed for the popup window
     */
    function init() {
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
            highlighting: {
                default: {
                    name: 'stroke',
                    options: {
                        padding: 10,
                        rx: 5,
                        ry: 5,
                        attrs: {
                            'stroke-width': 3,
                            stroke: 'red'
                        }
                    }
                }
            }
        });

        // Add scroll feature to the paper.
        analysis.paperScroller = new joint.ui.PaperScroller({
            autoResizePaper: true,
            paper: analysis.paper
        });
        $('#filter-apply').prop('disabled', true);
        $('#filter-apply').addClass('disabled-filter-clicked')
        $("#noteApply").show("fast");
        $('#paper').css("right", "0px");
        $('#paper').append(analysis.paperScroller.render().el);
        
        // Unable to interact with textboxes
        $('.cell-attrs-text').addClass('disabled-textbox');
        $('.cell-attrs-text2').addClass('disabled-textbox');
        analysis.paperScroller.center();

        // Make a copy of the graph and add it to the window.
        analysis.graph.fromJSON(JSON.parse(backendStringifyCirc(window.opener.graph.toJSON())));

        // These object hold the request and results for the object.
        // console.log("Request:" + JSON.stringify(myInputJSObject.request.toJSON()));
        // console.log("Result:" + JSON.stringify(myInputJSObject.results.toJSON()));
        // console.log(myInputJSObject.request);
        // console.log(myInputJSObject.results);

        // Filter out Actors and save all intentions into an array
        for (var i = 0; i < analysis.graph.getElements().length; i++) {
            if (!(analysis.graph.getElements()[i] instanceof joint.shapes.basic.Actor))
                analysis.intentions.push(analysis.graph.getElements()[i]);
        }
        // Turns the hashmap allSolutions into an array so the sidebar can be rendered
        combineAllSolutions();

        // Sets originalResults as a deep copy of myInputJSObject.results 
        // So originalResults does not contain references to myInputJSObject.results
        originalResults = $.extend(true, {}, myInputJSObject.results);

        setInteraction(false, analysis.paper)
    }

    function combineAllSolutions() {
        // Clear array and create blank hashmap
        allSolutionArray = [];
        allSolutionIndex = new Map();
        var i = 0;
        // Iterates over the hashmap allSolutions and combines all of the solutions into one array
        for (var key in myInputJSObject.results.get('allSolutions')) {

            // Finds the index of the first element that will be added to allSolution
            if (i != 0) {
                i++;
            }
            // Adds the starting index and its key to hashmap
            allSolutionIndex[key] = i;

            // Adds every element (which are arrays) in the old array to the new array
            myInputJSObject.results.get('allSolutions')[key].forEach(
                solution => {
                    allSolutionArray.push(solution);
                })
            // Finds the index of the last element added to allSolution
            i = allSolutionArray.length - 1;

            // Adds the ending index and its key to hashmap - TODO: Do we need the end?
            //allSolutionIndex.set(key + "End", i);
        }
    }

    /**
     * Updates the satisfaction values of the elements based on which page is selected
     * 
     * @param {Integer} currentPage 
     * The number of the page that is selected in the next State window
     */
    function updateNodesValues(currentPage) {
        if (currentPage == "")
            currentPage = 0;

        //Set the currentState variable so it can be sent back to the original path
        for (var i = 0; i < analysis.intentions.length; i++) {
            satValue = allSolutionArray[currentPage][i];
            element = analysis.intentions[i];
            element.attr(".satvalue").value = satValue;
            // Update the current sat value in the intention filter whenever page changes
            if (element.attributes.id == selectedIntention) {
                updateSatValueInfo(element, elementNum, originalResults);
            }

            // Sets attributes of element from the refEvidence pair from resultBBM
            if ((satValue == "0001") || (satValue == "0011")) {
                element.attr(".satvalue/text", "(F, ⊥)");
                element.attr({ text: { fill: 'black' } });
            } else if (satValue == "0010") {
                element.attr(".satvalue/text", "(P, ⊥)");
                element.attr({ text: { fill: 'black' } });
            } else if ((satValue == "1000") || (satValue == "1100")) {
                element.attr(".satvalue/text", "(⊥, F)");
                element.attr({ text: { fill: 'black' } });
            } else if (satValue == "0100") {
                element.attr(".satvalue/text", "(⊥, P)");
                element.attr({ text: { fill: 'black' } });
            } else if (satValue == "0110") {
                element.attr(".satvalue/text", "(P, P)");
                element.attr({ text: { fill: 'red' } });
            } else if ((satValue == "1110") || (satValue == "1010")) {
                element.attr(".satvalue/text", "(P, F)");
                element.attr({ text: { fill: 'red' } });
            } else if ((satValue == "0111") || (satValue == "0101")) {
                element.attr(".satvalue/text", "(F, P)");
                element.attr({ text: { fill: 'red' } });
            } else if ((satValue == "1111") || (satValue == "1001") || (satValue == "1101") || (satValue == "1011")) {
                element.attr(".satvalue/text", "(F, F)");
                element.attr({ text: { fill: 'red' } });
            } else if (satValue == "0000") {
                element.attr(".satvalue/text", "(⊥,⊥)");
                element.attr({ text: { fill: 'black' } });
            } else {
                element.removeAttr(".satvalue/d");
            }
        }
    }

    /**
     * Renders sidebar on left side of next State
     * 
     * @param {Integer} currentPage 
     * The number of the page that is selected in the next State window
     */
    function renderNavigationSidebar(currentPage = 0) {
        var pagination = document.getElementById("pagination");
        var num_states_lbl = document.getElementById("num_states_lbl");
        var currentPageIn = document.getElementById("currentPage");

        // disable Explore Next States button if last time point
        var exploreNextStatesBtn = document.getElementById("exploreNextStates");
        if (myInputJSObject.results.get('timePointPath').length == myInputJSObject.results.totalNumTimePoints.length - 1) {
            exploreNextStatesBtn.disabled = true;
            exploreNextStatesBtn.classList.add('disabled');
        }

        // Clear any previous pages by reseting page values
        pagination.innerHTML = "";
        num_states_lbl.innerHTML = "";
        currentPageIn.value = "";

        num_states_lbl.innerHTML += (allSolutionArray.length);

        currentPageIn.value = currentPage.toString();

        updatePagination(currentPage);
        updateNodesValues(currentPage);

        renderEVO();

        document.getElementById("thisState").textContent = myInputJSObject.results.get('timePointPath').length;
        document.getElementById("totalStates").textContent = myInputJSObject.results.totalNumTimePoints.length - 1;
    }

    /**
     * Disable link interaction
     * @param {Boolean} interactionValue
     * @param {Object} paper
    */
    function setInteraction(interactionValue, paper) {
        _.each(analysis.graph.getCells().filter(cell => (cell.get('type') == "basic.CellLink")), function (cell) {
            cell.findView(paper).options.interactive = interactionValue;
            $('.link-tools').css("display", "none");
        });
    }

    /**
     * Is called whenever the slider changes and when the sidebar is rendered.
     */
    function renderEVO() {
        EVONextState.setColorBlindFromPrevWindow();
        EVONextState.setColorPaletteFromPrevWindow();
        EVONextState.setSliderOptionNextState();
    }

    /**
     * Updates which page is selected 
     * 
     * @param {Integer} currentPage
     * The number of the page that is selected in the next State window 
     */
    function updatePagination(currentPage) { 
        var currentDigits = currentPage.toString().length; // number of digits in the selected page number
        var pagination = document.getElementById("pagination");
        var nextSteps_array_size = allSolutionArray.length;
        var numBefore = Math.ceil((7 - currentDigits)/2); // number of digits displayed to the left of the selected page number
        var numAfter = Math.ceil((8 - currentDigits)/2); // number of digits displayed to the right of and including the selected page number
        if (nextSteps_array_size > 7) {
            renderPreviousBtn(pagination, currentPage);
            if (currentPage - 3 < 0) { // if current page number is low cannot be the middle number
                for (var i = 0; i < 7; i++) {
                    render_pagination_values(currentPage, i);
                }
            } else if (currentPage > nextSteps_array_size - numBefore) { // if current page number is high cannot be the middle number
                for (i = (nextSteps_array_size) - (numBefore + numAfter); i < nextSteps_array_size; i++){
                    render_pagination_values(currentPage, i); //if current page is beyond the possible amount of page it would set the page the user is on as the last possible page
                }
            } else {
                if (numAfter < 1) { // must show at least one digit
                    numAfter = 1;
                }
                if (currentPage + numBefore < nextSteps_array_size) { // show the numbers less than the current page number
                    for (i = currentPage - numBefore; i < currentPage + numAfter; i++) {
                        render_pagination_values(currentPage, i);
                    }
                } else {
                    for (i = currentPage - numAfter; i < nextSteps_array_size; i++) { // show the numbers equal to and greater than the current page number
                        render_pagination_values(currentPage, i);
                    }
                }
            }
            renderForwardBtn(pagination, currentPage)
        } else {
            renderPreviousBtn(pagination, currentPage);
            for (var i = 0; i < nextSteps_array_size; i++) {
                render_pagination_values(currentPage, i);
            }
            renderForwardBtn(pagination, currentPage)
        }
    }

    /**
     * Renders the 'previous' button on the next State sidebar
     */
    function renderPreviousBtn(pagination, currentPage) {
        var value;
        if (currentPage == 0) {
            value = 0;
        } else {
            value = currentPage - 1;
        }
        pagination.innerHTML += '<div><a href="#" onclick="renderNavigationSidebar(' + value.toString() + ')">&laquo;</a></div>';
    }

    /**
     * Renders the 'next' button on the next State sidebar
     */
    function renderForwardBtn(pagination, currentPage) {
        var value;
        var nextSteps_array_size = allSolutionArray.length;

        if (currentPage == nextSteps_array_size - 1) {
            value = currentPage;
        } else {
            value = currentPage + 1;
        }
        pagination.innerHTML += '<div><a href="#" onclick="renderNavigationSidebar(' + value.toString() + ')">&raquo;</a></div>';
    }

    /**
     * Renders the correct pages values you can select in next state based on the current selected state
     */
    function render_pagination_values(currentPage, i) {
        var pagination = document.getElementById("pagination");
        if (currentPage == i) {
            pagination.innerHTML += '<div><a href="#" class="active" onclick="renderNavigationSidebar(' + i.toString() + ')">' + i.toString() + '</a></div>';
        } else {
            pagination.innerHTML += '<div><a href="#" onclick="renderNavigationSidebar(' + i.toString() + ')">' + i.toString() + '</a></div>';
        }
    }

    /**
     * Selects entered state based on user input 
     */
    function goToState() {
        var requiredState = parseInt(document.getElementById("requiredState").value);
        var nextSteps_array_size = allSolutionArray.length;

        if ((requiredState != "NaN") && (requiredState > 0)) {
            if (requiredState > nextSteps_array_size - 1) {
                renderNavigationSidebar(nextSteps_array_size - 1); //makes sure required states is always within the possible maximum value of pages
            } else {
                renderNavigationSidebar(requiredState);
            }
        }
    }

    /**
     * This function checks which boxes in next State have been checked/unchecked and shows the correct results
     * based on this. The first switch case has been documented with comments.
     */
    function add_filter(tempResults2) {
        console.log("clicked");
        console.log(filterOrderQueue);
        tempResults = tempResults2;

        // Iterates over all of the boxes that have been checked
        for (var i = 0; i < filterOrderQueue.length; i++) {
            switch (filterOrderQueue[i]) {
                case "conflictFl":
                    console.log("conflictFl");
                    // Iterates over every key/value pair in the hashmap
                    for (var solutionArray in tempResults.get('allSolutions')) {
                        // Empty array to that will contain all of the indices of the solutions we want
                        var index_to_rm = [];
                        // Iterates over all of the solutions in the key/value pair 
                        for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                            // Iterates over all of the elements in the solution
                            for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                // Checks the value of each itention and if the value satisfyies the conditions then the
                                // Index is pushed to the index array
                                var value = tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                                if ((value == "0110") ||
                                    (value == "0111") ||
                                    (value == "0101") ||
                                    (value == "1110") ||
                                    (value == "1010") ||
                                    (value == "1111") ||
                                    (value == "1001") ||
                                    (value == "1101") ||
                                    (value == "1011")) {
                                    index_to_rm.push(solution_index);
                                    break;
                                }
                            }
                        }
                        // Iterates over the array with all of the indexes that satisfy the condition
                        for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                            // Adds only the indexes that satisfy the condition to the array inside the hashmap
                            tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                        }
                    }
                    break;
                case "ttFl":
                    console.log("ttFl");

                    for (var solutionArray in tempResults.get('allSolutions')) {
                        var index_to_rm = [];
                        for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                            for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                var value = tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                                if (value == "0000") {
                                    index_to_rm.push(solution_index);
                                    break;
                                }
                            }
                        }
                        for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                            tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                        }
                    }
                    break;
                case "leastTasksSatisfied":
                    console.log("leastTasksSatisfied");
                    var LSchecksexistence = 0;
                    for (var j = 0; j < analysis.intentions.length; j++) {
                        if (analysis.intentions[j].get('type') === 'basic.Task') {
                            LSchecksexistence = 1
                            break;
                        }
                    }
                    if (filterOrderQueue.includes("mostTasksSatisfied")) {
                        swal("Error: Cannot apply this filter when Most Task Satisfied is applied", "", "error");
                        $('#mostTasksSatisfied').prop('checked', false);
                        $('#leastTasksSatisfied').prop('checked', false);
                    }
                    if (LSchecksexistence == 0) {
                        swal("Error: Cannot apply this filter with no tasks.", "", "error");
                        $('#leastTasksSatisfied').prop('checked', false);
                    }
                    else {
                        for (var solutionArray in tempResults.get('allSolutions')) {
                            var index_to_keep = [];
                            var index_to_rm = [];

                            var least_t_s = tempResults.get('allSolutions')[solutionArray].length;
                            for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                                var num_t_s = 0;
                                for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                    if (analysis.intentions[element_index].get('type') === 'basic.Task') {
                                        var value = tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                                        if ((value == "0010" || value == "0011")) {
                                            num_t_s++;
                                        }
                                    }
                                }
                                if (least_t_s > num_t_s) {
                                    least_t_s = num_t_s;
                                    index_to_rm = index_to_rm.concat(index_to_keep);
                                    index_to_keep = [];
                                }
                                if (num_t_s == least_t_s) {
                                    index_to_keep.push(solution_index);
                                }
                                if (num_t_s > least_t_s) {
                                    index_to_rm.push(solution_index);
                                }
                            }
                            index_to_rm.sort(function (a, b) { return a - b });
                            for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                                tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                            }
                        }
                    }
                    break;
                case "mostTasksSatisfied":
                    console.log('mostTasksSatisfied');
                    var MSchecksexistence = 0;
                    for (var j = 0; j < analysis.intentions.length; j++) {
                        if (analysis.intentions[j].get('type') === 'basic.Task') { 
                            MSchecksexistence = 1
                            break;
                        }  
                    } 
                    if (filterOrderQueue.includes("leastTasksSatisfied")) {
                        swal("Error: Cannot apply this filter when Least Task Satisfied is applied", "", "error");
                        $('#mostTasksSatisfied').prop('checked', false);
                        $('#leastTasksSatisfied').prop('checked', false);
                    } 
                    if (MSchecksexistence == 0) {
                        swal("Error: Cannot apply this filter with no tasks.", "", "error");
                        $('#mostTasksSatisfied').prop('checked', false);
                    }
                    else {
                        for (var solutionArray in tempResults.get('allSolutions')) {
                            var index_to_keep = [];
                            var index_to_rm = [];

                            var most_t_s = 0;
                            for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                                var num_t_s = 0;
                                for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                    if (analysis.intentions[element_index].get('type') === 'basic.Task') {
                                        var value = tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                                        if ((value == "0010" || value == "0011")) {
                                            num_t_s++;
                                        }
                                    }
                                }
                                if (most_t_s < num_t_s) {
                                    most_t_s = num_t_s;
                                    index_to_rm = index_to_rm.concat(index_to_keep);
                                    index_to_keep = [];
                                }
                                if (num_t_s == most_t_s) {
                                    index_to_keep.push(solution_index);
                                }
                                if (num_t_s < most_t_s) {
                                    index_to_rm.push(solution_index);
                                }
                            }
                            index_to_rm.sort(function (a, b) { return a - b });
                            for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                                tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                            }
                        }
                    }
                    break;
                case "leastResource":
                    console.log("leastResource");
                    var LRchecksexistence = 0;
                    for (var j = 0; j < analysis.intentions.length; j++) {
                        if (analysis.intentions[j].get('type') === 'basic.Resource') { 
                            LRchecksexistence = 1;
                            break;
                        } 
                    } 
                    if (filterOrderQueue.includes("mostResource")) {
                        swal("Error: Cannot apply this filter when Most Resource is applied", "", "error");
                        $('#mostResource').prop('checked', false);
                        $('#leastResource').prop('checked', false);
                    } 
                    if (LRchecksexistence == 0) {
                        swal("Error: Cannot apply this filter with no resources.", "", "error");
                        $('#leastResource').prop('checked', false);
                    }
                    else {
                        for (var solutionArray in tempResults.get('allSolutions')) {
                            var index_to_keep = [];
                            var index_to_rm = [];

                            var least_r_s = tempResults.get('allSolutions')[solutionArray].length;
                            for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                                var num_r_s = 0;
                                for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                    if (analysis.intentions[element_index].get('type') === 'basic.Resource') {
                                        // if (selectedResult.allSolution[solution_index].intentionElements[element_index].type === "RESOURCE"){
                                        var value = tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                                        if ((value == "0010" || value == "0011")) {
                                            num_r_s++;
                                        }
                                    }
                                }
                                if (least_r_s > num_r_s) {
                                    least_r_s = num_r_s;
                                    index_to_rm = index_to_rm.concat(index_to_keep);
                                    index_to_keep = [];
                                }
                                if (num_r_s == least_r_s) {
                                    index_to_keep.push(solution_index);
                                }
                                if (num_r_s > least_r_s) {
                                    index_to_rm.push(solution_index);
                                }
                            }
                            index_to_rm.sort(function (a, b) { return a - b });
                            for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                                tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                            }
                        }
                    }
                    break;
                case "mostResource":
                    console.log("mostResource");
                    var MRchecksexistence = 0;
                    for (var j = 0; j < analysis.intentions.length; j++) {
                        if (analysis.intentions[j].get('type') === 'basic.Resource') {  
                            MRchecksexistence = 1;
                            break;
                        }
                    } 
                    if (filterOrderQueue.includes("leastResource")) {
                        swal("Error: Cannot apply this filter when Least Resource is applied", "", "error");
                        $('#mostResource').prop('checked', false);
                        $('#leastResource').prop('checked', false);
                    } 
                    if (MRchecksexistence == 0) {
                        swal("Error: Cannot apply this filter with no resources.", "", "error");
                        $('#mostResource').prop('checked', false);
                    }
                    else {
                        for (var solutionArray in tempResults.get('allSolutions')) {
                            var index_to_keep = [];
                            var index_to_rm = [];

                            var most_r_s = 0;
                            for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                                var num_r_s = 0;
                                for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                    if (analysis.intentions[element_index].get('type') === 'basic.Resource') {
                                        var value = tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                                        if ((value == "0010" || value == "0011")) {
                                            num_r_s++;
                                        }
                                    }
                                }
                                if (most_r_s < num_r_s) {
                                    most_r_s = num_r_s;
                                    index_to_rm = index_to_rm.concat(index_to_keep);
                                    index_to_keep = [];
                                }
                                if (num_r_s == most_r_s) {
                                    index_to_keep.push(solution_index);
                                }
                                if (num_r_s < most_r_s) {
                                    index_to_rm.push(solution_index);
                                }
                            }
                            index_to_rm.sort(function (a, b) { return a - b });
                            for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                                tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                            }
                        }
                    }
                    break;
                case "leastGoalSatisfied":
                    console.log("leastGoalSatisfied");
                    var LGSchecksexistence = 0;
                    for (var j = 0; j < analysis.intentions.length; j++) {
                        if (analysis.intentions[j].get('type') === 'basic.Goal') { 
                            LGSchecksexistence = 1;
                            break;
                        } 
                    } 
                    if (filterOrderQueue.includes("mostGoalSatisfied")) {
                        swal("Error: Cannot apply this filter when Most Goal Satisfied is applied", "", "error");
                        $('#mostGoalSatisfied').prop('checked', false);
                        $('#leastGoalSatisfied').prop('checked', false);
                    } 
                    if (LGSchecksexistence == 0) {
                        swal("Error: Cannot apply this filter with no goals.", "", "error");
                        $('#leastGoalSatisfied').prop('checked', false);
                    }
                    else {
                        for (var solutionArray in tempResults.get('allSolutions')) {
                            var index_to_keep = [];
                            var index_to_rm = [];

                            var least_goal_s = tempResults.get('allSolutions')[solutionArray].length;
                            for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                                var num_g_s = 0;
                                for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                    if (analysis.intentions[element_index].get('type') === 'basic.Goal') {
                                        var value = tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                                        if ((value == "0010" || value == "0011")) {
                                            num_g_s++;
                                        }
                                    }
                                }
                                if (least_goal_s > num_g_s) {
                                    least_goal_s = num_g_s;
                                    index_to_rm = index_to_rm.concat(index_to_keep);
                                    index_to_keep = [];
                                }
                                if (num_g_s == least_goal_s) {
                                    index_to_keep.push(solution_index);
                                }
                                if (num_g_s > least_goal_s) {
                                    index_to_rm.push(solution_index);
                                }
                            }
                            index_to_rm.sort(function (a, b) { return a - b });
                            for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                                tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                            }
                        }
                    }
                    break;
                case "mostGoalSatisfied":
                    console.log("mostGoalSatisfied");
                    var MGSchecksexistence = 0;
                    for (var j = 0; j < analysis.intentions.length; j++) {
                        if (analysis.intentions[j].get('type') === 'basic.Goal') {  
                            MGSchecksexistence = 1;
                            break;
                        }
                    } 
                    if (filterOrderQueue.includes("leastGoalSatisfied")) {
                        swal("Error: Cannot apply this filter when Least Goal Satisfied is applied", "", "error");
                        $('#mostGoalSatisfied').prop('checked', false);
                        $('#leastGoalSatisfied').prop('checked', false);
                    } 
                    if (MGSchecksexistence == 0) {
                        swal("Error: Cannot apply this filter with no goals.", "", "error");
                        $('#mostGoalSatisfied').prop('checked', false);
                    }
                    else {
                        for (var solutionArray in tempResults.get('allSolutions')) {
                            var index_to_keep = [];
                            var index_to_rm = [];

                            var most_goal_s = 0;
                            for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                                var num_g_s = 0;
                                for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                    if (analysis.intentions[element_index].get('type') === 'basic.Goal') {
                                        var value = tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                                        if ((value == "0010" || value == "0011")) {
                                            num_g_s++;
                                        }
                                    }
                                }
                                if (most_goal_s < num_g_s) {
                                    most_goal_s = num_g_s;
                                    index_to_rm = index_to_rm.concat(index_to_keep);
                                    index_to_keep = [];
                                }
                                if (num_g_s == most_goal_s) {
                                    index_to_keep.push(solution_index);
                                }
                                if (num_g_s < most_goal_s) {
                                    index_to_rm.push(solution_index);
                                }
                            }
                            index_to_rm.sort(function (a, b) { return a - b });
                            for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                                tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                            }
                        }
                    }
                    break;
                case "LeastActor":
                    console.log("LeastActor");
                    if (analysis.intentions.length === analysis.graph.getElements().length) {
                        swal("Error: Cannot apply this filter with no actors.", "", "error");
                        $('#LeastActor').prop('checked', false);
                    } else if (filterOrderQueue.includes("mostActor")) {
                        swal("Error: Cannot apply this filter when Most Actor is applied", "", "error");
                        $('#LeastActor').prop('checked', false);
                        $('#mostActor').prop('checked', false);
                    } else {
                        for (var solutionArray in tempResults.get('allSolutions')) {
                            var index_to_keep = [];
                            var index_to_rm = [];
                            var least_actor = tempResults.get('allSolutions')[solutionArray].length;
                            for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                                var actors = {};
                                for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                    if (!actors[analysis.intentions[element_index].actorId]) {
                                        console.log(analysis.intentions[element_index]);
                                        actors[analysis.intentions[element_index].actorId] = 0;
                                    }
                                    var value = tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                                    if ((value == "0010" || value == "0011" || (value == "0110") ||
                                        (value == "0111") ||
                                        (value == "0101") ||
                                        (value == "1110") ||
                                        (value == "1010") ||
                                        (value == "1111") ||
                                        (value == "1001") ||
                                        (value == "1101") ||
                                        (value == "1011"))) {
                                        actors[analysis.intentions[element_index].actorId] = 1;
                                    }
                                }
                                console.log(actors);
                                var int_sat = Object.values(actors).reduce((a, b) => a + b);
                                console.log(int_sat)
                                if (least_actor > int_sat) {
                                    least_actor = int_sat;
                                    index_to_rm = index_to_rm.concat(index_to_keep);
                                    index_to_keep = [];
                                }
                                if (int_sat == least_actor) {
                                    index_to_keep.push(solution_index);
                                }
                                if (int_sat > least_actor) {
                                    index_to_rm.push(solution_index);
                                }

                            }
                            index_to_rm.sort(function (a, b) { return a - b });
                            for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                                tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                            }
                        }
                    }
                    break;
                case "mostActor":
                    console.log("mostActor");
                    if (analysis.intentions.length === analysis.graph.getElements().length) {
                        swal("Error: Cannot apply this filter with no actors.", "", "error");
                        $('#mostActor').prop('checked', false);
                    } else if (filterOrderQueue.includes("LeastActor")) {
                        swal("Error: Cannot apply this filter when Least Actor is applied", "", "error");
                        $('#LeastActor').prop('checked', false);
                        $('#mostActor').prop('checked', false); 
                    } else {
                        for (var solutionArray in tempResults.get('allSolutions')) {
                            var most_actor = 0;
                            var index_to_keep = [];
                            var index_to_rm = [];
                            for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                                var actors = {};
                                for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                    if (!actors[analysis.intentions[element_index].actorId]) {
                                        console.log(analysis.intentions[element_index]);
                                        actors[analysis.intentions[element_index].actorId] = 0;
                                    }
                                    var value = tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                                    if ((value == "0010" || value == "0011" || (value == "0110") ||
                                        (value == "0111") ||
                                        (value == "0101") ||
                                        (value == "1110") ||
                                        (value == "1010") ||
                                        (value == "1111") ||
                                        (value == "1001") ||
                                        (value == "1101") ||
                                        (value == "1011"))) {
                                        actors[analysis.intentions[element_index].actorId] = 1;
                                    }
                                }
                                var int_sat = Object.values(actors).reduce((a, b) => a + b);
                                if (most_actor < int_sat) {
                                    most_actor = int_sat;
                                    index_to_rm = index_to_rm.concat(index_to_keep);
                                    index_to_keep = [];
                                }
                                if (int_sat == most_actor) {
                                    index_to_keep.push(solution_index);
                                }
                                if (int_sat < most_actor) {
                                    index_to_rm.push(solution_index);
                                }

                            }
                            index_to_rm.sort(function (a, b) { return a - b });
                            for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                                tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                            }
                        }
                    }
                    break;
                case "mostConstraintSatisfaction":

                    for (var solutionArray in tempResults.get('allSolutions')) {
                        console.log(solutionArray);
                        var domains = {};
                        for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                            for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                console.log(analysis.intentions[element_index].get('intention').cid)
                                if (!domains[analysis.intentions[element_index].get('intention').cid]) {
                                    domains[analysis.intentions[element_index].get('intention').cid] = [tempResults.get('allSolutions')[solutionArray][solution_index][element_index]];
                                } else {
                                    if (domains[analysis.intentions[element_index].get('intention').cid].indexOf(tempResults.get('allSolutions')[solutionArray][solution_index][element_index]) == -1) {
                                        domains[analysis.intentions[element_index].get('intention').cid].push(tempResults.get('allSolutions')[solutionArray][solution_index][element_index])
                                    }
                                }
                            }
                        }
                        console.log(domains);
                        var length_domain = {};
                        var least_domain = 9;
                        var int_with_smallest_domain = [];
                        Object.keys(domains).forEach(function (key) {
                            length_domain[key] = domains[key].length;
                            if (length_domain[key] < least_domain) {
                                least_domain = length_domain[key];
                                int_with_smallest_domain = [];
                            }
                            if (length_domain[key] == least_domain) {
                                int_with_smallest_domain.push(key);
                            }
                        });
                        var index_to_rm = [];
                        for (var solution_index = 0; solution_index < tempResults.get('allSolutions')[solutionArray].length; solution_index++) {
                            for (var element_index = 0; element_index < tempResults.get('allSolutions')[solutionArray][solution_index].length; element_index++) {
                                if (int_with_smallest_domain.indexOf(analysis.intentions[element_index].get('intention').cid) != -1) {
                                    if (tempResults.get('allSolutions')[solutionArray][solution_index][element_index] !== "0011") {
                                        index_to_rm.push(solution_index);
                                        break;
                                    }
                                }
                            }
                        }
                        for (var to_rm = 0; to_rm < index_to_rm.length; to_rm++) {
                            tempResults.get('allSolutions')[solutionArray].splice(index_to_rm[to_rm] - to_rm, 1);
                        }
                        console.log(domains);
                    }
                    break;
                default:
                    console.log("default");
                    break;
            }
        }
        $("body").removeClass("spinning"); // Remove spinner from cursor
        // Set the new results with filters as the analysis object
        myInputJSObject.results = tempResults;
        // Creates array with all Solutions from new hashmap
        combineAllSolutions();
        renderNavigationSidebar();
    }

    /**
     * This function allows you to filter the next state solutions
     * by specific satisfacion values for specific intentions
     */
    function intentionFilter(tempResults2) {
        console.log("Intention filter clicked");

        // Clears previous html table entries
        $(".inspectorFilterTable tr").remove();
        // Appends the headings back to the table
        $(".inspectorFilterTable").append('<tr class ="tableHeading"><th class="tableHeading">Intention Name</th><th class="tableHeading">Satisfaction Value</th><th class="tableHeading">Remove</th></tr>');

        // Sets the solution array to empty so only correct solutions can be added
        for (var solutionArray in originalResults.get('allSolutions')) {
            tempResults2.get('allSolutions')[solutionArray] = [];
        }
  
        // Iterates over every key/value pair in the hashmap
        for (var solutionArray in originalResults.get('allSolutions')) {
            // Iterates over all of the solutions in the key/value pair 
            for (var solution_index = 0; solution_index < originalResults.get('allSolutions')[solutionArray].length; solution_index++) {
                // Iterate over array of filters
                for (var i = 0; i < filterIntentionList.length; i++) {
                    // Finds the element index of the intention by comparing intention id
                    for (var element_index = 0; element_index < analysis.intentions.length; element_index++) {
                        if (analysis.intentions[element_index].attributes.id == filterIntentionList[i][0]) {
                            var elementNum = element_index;
                        }
                    }
                    // Find the sat value of the solution at that element index 
                    var value = originalResults.get('allSolutions')[solutionArray][solution_index][elementNum];
                    
                    // If the solution value is in the array of sat values and
                    // This is the last filter in the array (AKA the solution is true for every filter)
                    if (filterIntentionList[i][1].includes(value) && i == filterIntentionList.length-1) {
                        
                        // Push the solution to tempResults2
                        tempResults2.get('allSolutions')[solutionArray].push(originalResults.get('allSolutions')[solutionArray][solution_index])
                                       
                    } else if (!filterIntentionList[i][1].includes(value)) {
                        // If the solution value is not in the array of sat values break for loop
                        break;
                    }
                }
            }

        $("body").removeClass("spinning"); // Remove spinner from cursor              

        }

        // Adds the filter information to html
        for (var i = 0; i < filterIntentionList.length; i++) {
            for (var j = 0; j < filterIntentionList[i][1].length; j++) {

                // Finds corrects text sat value for table
                switch (filterIntentionList[i][1][j]) {
                    case "0000":
                        var tableSatVal = "None (⊥, ⊥)";
                        break;
                    case "0011":
                        var tableSatVal = "Satisfied (F, ⊥)";
                        break;
                    case "0010":
                        var tableSatVal = "Partially Satisfied (P, ⊥)";
                        break;
                    case "0100":
                        var tableSatVal = "Partially Denied (⊥, P)";
                        break;
                    case "1100":
                        var tableSatVal = "Denied (⊥, F)";
                        break;
                    case "unknown":
                        var tableSatVal = "(no value)";
                        break;
                    default:
                        var tableSatVal =  "error";   
                        break;
                }
                // Appends filter information to the intention filter table

                var name; 
                // Finds the element name of all the intentions
                for (var k = 0; k < analysis.intentions.length; k++) {
                    if (analysis.intentions[k].attributes.id == filterIntentionList[i][0]) {
                        name = analysis.intentions[k].attr(".name").text
                    }
                }

                // $(".inspectorFilterTable").append('<tr class="tableData"><td class="tableData">' + name + '</td><td class="tableData">' + tableSatVal + '</td><td id = ' + selectedIntention + ' class="tableData remove-btn"><button class="table-btn-small" style="font-size:15px"><i class="fa fa-trash" style="color:white"></i></button></td>'); 
                $(".inspectorFilterTable").append('<tr class="tableData" id=' + filterIntentionList[i][0] + '><td class="tableData">' + name + '</td><td class="tableData">' + tableSatVal + '</td><td class="tableData remove-btn"><button class="table-btn-small" style="font-size:15px"><i class="fa fa-trash" style="color:white"></i></button></td>'); 
        }    
    }

    // Set the new results with filters as the analysis object
    myInputJSObject.results = tempResults2;
    // Creates array with all Solutions from new hashmap
    combineAllSolutions();
    renderNavigationSidebar();
    }

    /*
    * This function allows you to remove an intention's filter from the list
    * of intention filters when the remove button is clicked
    */
    function removeIntentionFilter(intentionToBeRemoved) {
        console.log("Remove button clicked");
        // Find the intention id for the filter that should be removed
        var selectedId = intentionToBeRemoved.attr('id');
        // Find the satisfaction for the filter that should be removed
        var desiredSatVal = intentionToBeRemoved.find('td:eq(1)').text();

        // Finds corrects binary value for the satisfaction value
        switch (desiredSatVal) {
            case "None (⊥, ⊥)":
                desiredSatVal = "0000";
                break;
            case "Satisfied (F, ⊥)":
                desiredSatVal = "0011";
                break;
            case "Partially Satisfied (P, ⊥)":
                desiredSatVal = "0010";
                break;
            case "Partially Denied (⊥, P)":
                desiredSatVal = "0100";
                break;
            case "Denied (⊥, F)":
                desiredSatVal = "1100";
                break;
            case "(no value)":
                desiredSatVal = "unknown";
                break;
            default:
                desiredSatVal =  "error";   
                break;
        }

        // filterIntentionList = [[id, [sat vals]], [id, [sat vals]], ...]
        for (var i = 0; i < filterIntentionList.length; i++) {
            if (selectedId == filterIntentionList[i][0]) {
                // If there is only one filter applied to intention, delete whole entry
                if (filterIntentionList[i][1].length == 1) {
                    filterIntentionList.splice(i, 1);
                } else { // If there is more than one filter for that intention only remove the deleted filter
                    var index = filterIntentionList[i][1].indexOf(desiredSatVal);
                    filterIntentionList[i][1].splice(index, 1);
                }
                break;
            }
        }
    }

    /**
     * Helper function so the two filtering functions are integrated together
     * @param {Boolean} intention Whether the function is called from the intention filter button or not
     */
    function filter_helper(intention) {
        // Everytime a filter is applied the results are reset
        myInputJSObject.results = originalResults;
        // Deep copy of results so it doesn't contain references to the original object
        tempResults2 = $.extend(true, {}, myInputJSObject.results);
        
        // Figures out which model filters are checked
        var checkboxes = document.getElementsByClassName("filter_checkbox");
        for (var i = 0; i < checkboxes.length; i++) {
            var checkbox = checkboxes[i];
            // check if something is just checked
            if (checkbox.checked) {
                if (filterOrderQueue.indexOf(checkbox.id) == -1) {
                    filterOrderQueue.push(checkbox.id);
                }
            }
            // check if something is just unchecked
            else {
                if (filterOrderQueue.indexOf(checkbox.id) != -1) {
                    filterOrderQueue.splice(filterOrderQueue.indexOf(checkbox.id), 1);
                }
            }
        }

        // If the function is called from intention filter, add filter to array 
        if (intention) {
            // 4 digit sat value code selected from dropdown menu
            var desiredSatVal = $("#sat-value").val();

            // filterIntentionArray = [[id, [sat vals]], [id, [sat vals]], ...]
            // If empty, create new array and push filter
            if (filterIntentionList.length != 0) {
                // Iterate over the filters and check if the selected intention already has a filter applied
                for (var i = 0; i < filterIntentionList.length; i++) {
                    if (filterIntentionList[i][0].includes(selectedIntention)) {
                        if (filterIntentionList[i][1].includes(desiredSatVal)) { // If same filter being applied to one intention
                            break;
                        }
                        // Push new filter sat value to already existing array of filter sat vals
                        filterIntentionList[i][1].push(desiredSatVal);
                        // Break once added so else if is not run
                        break;
                    } else if (i == filterIntentionList.length-1) {
                        // If the selected intention does not have a filter applied push new entry to array
                        filterIntentionList.push([selectedIntention, [desiredSatVal]]);
                        // Break once added so for loop does not iterate over new entry 
                        break; 
                    }
                }
            } else { // If the array doesn't exist, create array and push first filter
                filterIntentionList = [];
                filterIntentionList.push([selectedIntention, [desiredSatVal]]);
            }
            // Call function that finds correct solutions
            intentionFilter(tempResults2);
        }
        // If function is called from model filter see if there are any intention filters that should be applied 
        else if (filterIntentionList.length != 0) {
            intentionFilter(tempResults2);
        }
        // If there are any model filters, run function that finds correct solutions
        if (filterOrderQueue.length != 0) {
            add_filter(tempResults2);
        } 
        // If there are no filters applied, reset to original results and render it
        if (filterOrderQueue.length == 0 && filterIntentionList.length == 0) {
            $("body").removeClass("spinning"); // Remove spinner from cursor
            // Creates array with all Solutions from new hashmap
            combineAllSolutions();
            renderNavigationSidebar();
        }
    }

    /*  This function should get the current state in the screen and 
    *   save in the original path, as well as generate the remainder
    *   of the simulation path.
    */
    function save_current_state() {
        console.log('saveCurrentState');
        console.log(myInputJSObject.request);
        updateAnalysisRequestWithCurrentState();
        myInputJSObject.request.set('action', "updatePath");
        window.opener.backendSimulationRequest(myInputJSObject.request);
        window.close();
    }

    /*This function should get the current state in the screen and 
    *   save in the original path, as well as generates
    *   all possible next states.
    */
    function generate_next_states() {
        console.log(myInputJSObject.results);
        console.log(myInputJSObject.request.get('numRelTime'));
        console.log(myInputJSObject.results.get('selectedTimePoint'));
        // Prevent user from exploring next state beyond allowed time points
        if (myInputJSObject.results.get('timePointPath').length == myInputJSObject.results.totalNumTimePoints.length - 1) {   
            swal("Path Complete", "You've already completed the path and will be returned will your simulation result.", "success");
            save_current_state()
        } else {
            $("body").addClass("spinning"); // Adds spinner animation to page
            updateAnalysisRequestWithCurrentState();
            window.opener.backendSimulationRequest(myInputJSObject.request);
            window.close();
        }
    }

    /**
     * This function should update the analysis request with the state that is currently selected
     */
    function updateAnalysisRequestWithCurrentState() {
        console.log('updateAnalysisRequestwithCurrentState');
        console.log(myInputJSObject.request);
        // Create temporary variable for previous results.
        var newPreviousAnalysis = myInputJSObject.results;
        // Increment selected time point, because the user selected the values for this state.
        newPreviousAnalysis.set('selectedTimePoint', newPreviousAnalysis.get('selectedTimePoint') + 1);

        // Get the page number currently selected on the interface.
        var currentPage = document.getElementById("currentPage").value;     // Page number associated with the selected state.

        // Get the name associated with the selected state.
        var stateName;
        for (var key in allSolutionIndex) {
            if (allSolutionIndex[key] <= currentPage) {
                stateName = key;
            }
        }

        // Determine the next time point.
        var timePointPath = newPreviousAnalysis.get('timePointPath');
        var nextTimePointAbsVal;
        if (stateName == 'TNS-A' && newPreviousAnalysis.get('nextPossibleAbsValue') != null) {
            nextTimePointAbsVal = newPreviousAnalysis.get('nextPossibleAbsValue');
        } else {
            nextTimePointAbsVal = newPreviousAnalysis.get('nextPossibleRndValue');
        }
        timePointPath.push(nextTimePointAbsVal);

        // Iterates over each of the time point values and get them an assignment to the next time point.
        var listStateTPs = newPreviousAnalysis.get('nextStateTPs')[stateName];
        listStateTPs.forEach(
            solution => {
                newPreviousAnalysis.get('timePointAssignments')[solution] = nextTimePointAbsVal;
            })

        // Update the elementList with the new states satisfaction values.
        var elementList = newPreviousAnalysis.get('elementList');
        for (let i = 0; i < elementList.length; i++) {
            elementList[i].status.push(allSolutionArray[currentPage][i]);
        }

        // Update values that are no longer needed.        
        newPreviousAnalysis.set('name', null);
        newPreviousAnalysis.set('colorVis', null);
        newPreviousAnalysis.set('nextStateTPs', null);
        newPreviousAnalysis.set('allSolutions', null);
        newPreviousAnalysis.set('nextPossibleAbsValue', null);
        newPreviousAnalysis.set('nextPossibleRndValue', null);

        // Assign back to request.
        myInputJSObject.request.set('previousAnalysis', newPreviousAnalysis);
        // myInputJSObject.request.set('results', null);
        console.log("New Request:" + JSON.stringify(myInputJSObject.request.toJSON()));
    }
} // End of LOCAL GLOBAL VARIABLES