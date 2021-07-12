/**
 * backendComm.js Overview
 * This file contains the communication between the front and back end of Bloomingleaf.
 * When an analysis is run, the analysisRequest, model, and graph are bundled into an object, 
 * converted to JSON format, and sent to the backend,
 * which returns the analysisResult.
 * 
 * This is:
 * Simulate Single Path - Step 3
 * Explore Possible Next States - Step 3
 */

var url = "http://localhost:8080/untitled.html";	// Hardcoded URL for Node calls. 

/**
 * Explore Possible Next States - Step 1 - Set up analysis request object.
 * Retrieves information about the current model and sends to the backend
 * to get all next possible states.
 *
 * This function is called on click for #btn-all-next-state
 * 
 * TODO: Replace analysisRequest with config
 */
 function getAllNextStates() {
    console.log("TODO: Implement Next States") 
    /*
    if (analysisRequest.action != null) { //path has been simulated
        if (analysisResult.selectedTimePoint != analysisResult.timeScale) { //last timepoint is not selected
            $("body").addClass("waiting"); //Adds "waiting" spinner under cursor 
            //Create the object and fill the JSON file to be sent to backend.
            //Get the AnalysisInspector view information

            analysisRequest.action = "allNextStates";

            analysisRequest.previousAnalysis = _.clone(savedAnalysisData.singlePathResult);
            // need to remove TPs after current point from previous solution?
            // update the time point for potentialEpoch
            var previousTP = [];
            var i = analysisRequest.currentState.indexOf('|', 0);
            var currentState = parseInt(analysisRequest.currentState.substring(0, i));
            for (var i = 0; i < currentState + 1; i++) {
                for (var j = 0; j < analysisRequest.previousAnalysis.assignedEpoch.length; j++) {
                    var regex = /(.*)_(.*)$/g;
                    var match = regex.exec(analysisRequest.previousAnalysis.assignedEpoch[j]);
                    if (match[2] === analysisRequest.previousAnalysis.timePointPath[i]) {
                        previousTP.push(analysisRequest.previousAnalysis.assignedEpoch[j]);
                        continue;
                    }
                }
            }

            console.log(previousTP);
            // update current time point in the path if necessary (if epoch)
            // remove all the time points after
            analysisRequest.previousAnalysis.assignedEpoch = previousTP;
            analysisRequest.previousAnalysis.timePointPath = analysisRequest.previousAnalysis.timePointPath.slice(0, currentState + 1);


            console.log(analysisRequest);

            // Object to be sent to the backend
            var jsObject = {};
            jsObject.analysisRequest = analysisRequest;

            //Get the Graph Model
            jsObject.model = model;

            //Send data to backend
            //backendComm(jsObject);		//TODO: Need to add parameter for Node Server.
            // Temporary Disabled to updated calls to backend.
            // TODO: Reconnect All Paths Analysis

        } else {
            swal("Error: Cannot explore next states with last time point selected.", "", "error");
        }
    } else {
        swal("Error: Cannot explore next states before simulating a single path.", "", "error");
    }
    */
}

/** Makes a request for the backend and calls the response function.
 * {ConfigBBM} analysisRequest
 * Note: function was originally called `backendComm`.
 */
function backendSimulationRequest(analysisRequest) {
	var jsObject = {};
	jsObject.analysisRequest = analysisRequest;
	jsObject.graph = graph;

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	var data = JSON.stringify(jsObject);
	console.log(data)
	xhr.onreadystatechange = function () {
		// This function get called when the response is received.
		console.log("Reading the response");
		if (xhr.readyState == XMLHttpRequest.DONE) {
			var response = xhr.responseText;
			responseFunc(analysisRequest, response);
		}
	}
	xhr.send(data);	// Why is this sent down here? What is this send function.
}

/** Handles the response from the server.
 * {ConfigBBM} analysisRequest
 * Note: function was originally called `backendComm`.
 */
function responseFunc(analysisRequest, response) {
	$("body").removeClass("waiting"); //Remove spinner under cursor 
	var results = JSON.parse(response);
	if (errorExists(results)) {
		var msg = getErrorMessage(results.errorMessage);
		alert(msg);
	} else {
		console.log(analysisRequest.get('action'))
		if (results == "") {
			alert("Error while reading the response file from server. This can be due an error in executing java application.");
			return;
		} else if (analysisRequest.get('action') == 'allNextStates') {
				console.log("All Paths Results (responseFunc):")
				// console.log(JSON.stringify(results));
				// savedAnalysisData.allNextStatesResult = results;
				// console.log("in backendcomm, saving all next state results");
				// open_analysis_viewer();
		} else if (analysisRequest.get('action') == 'singlePath') {
				savedAnalysisData.singlePathResult = results;	//TODO What is this?
				console.log(JSON.stringify(results));			// Print the results of the analysis to the console.
				var analysisResult = convertToAnalysisResult(results); //Type ResultBBM
				displayAnalysis(analysisResult, false);

				// Get the currently selected configuration's results list
				// .where returns an array, but there should only ever be one selected so we just grab the first element
				//currConfig = configCollection.where({ selected: true })[0];
				analysisRequest.addResult(analysisResult);
				// // Save result to the corresponding analysis configuration object
				// currAnalysisConfig.addResult(analysisResult);
				// // Add the analysisConfiguration to the analysisMap for access in the analysis config sidebar
				// analysisMap.set(currAnalysisConfig.id, currAnalysisConfig);
		} else {
			alert("Error: Unknown analysis request type.");
			return;
		}
	}
}

/** Handles the response from the server.
 * {json structure} results
 * Note: function was originally called `backendComm`.
 */
function convertToAnalysisResult(results){
	var tempResult = new ResultBBM();
	tempResult.set('assignedEpoch', results.assignedEpoch);
	tempResult.set('timePointPath', results.timePointPath);
	tempResult.set('timePointPathSize', results.timePointPathSize);
	tempResult.set('elementList', results.elementList);
	tempResult.set('allSolution', results.allSolution);
	//tempResult.previousAnalysis = analysisResult;	//TODO Do we need to add this? (Potentially deprecated)
	tempResult.set('isPathSim', true);
	var evoView = new EVO(results.elementList)
	tempResult.set('colorVis', evoView);
	evoView.singlePathResponse(results.elementList);
	//tempResult.colorVis.singlePathResponse(results.elementList);	//TODO Update Evo.
	return tempResult;
}





function open_analysis_viewer(){
    var urlBase = document.URL.substring(0, document.URL.lastIndexOf('/')+1);
    var url = urlBase+"analysis.html";
    var w = window.open(url, Date.now(), "status=0,title=0,height=600,width=1200,scrollbars=1");

    if (!w) {
        alert('You must allow popups for this map to work.');
    }

}

/*
 * Returns true iff analysisResults indicates that there is
 * an error message.
 *
 * @param {Object} analysisResults
 *   results from backend java code
 * @returns {boolean}
 */
function errorExists(analysisResults) {
	return analysisResults.errorMessage != null;
}

/*
 * Returns a user-readable error message, containing
 * user-defined node names instead of node ids.
 *
 * Example message:
 * The model is not solvable because of conflicting constraints
 * involving nodes: mouse, keyboard, and pizza.
 *
 * @param {String} backendErrorMsg
 *   error message from backend
 * @returns {boolean}
 */
function getErrorMessage(backendErrorMsg) {

	// If node ids does not exist, just return the original error message for now
	if (!nodeIDsExists(backendErrorMsg)) {
		return backendErrorMsg;
	}

	var ids = getIDs(backendErrorMsg);
	var names = [];
	var actorNames = [];
	for (var i = 0; i < ids.length; i++) {
		names.push(getNodeName(ids[i]));
		actorNames.push(getParentActorNameById(ids[i]));
	}

	var s = 'The model is not solvable because of conflicting constraints involving nodes (with associated actors): ';
	var numOfNames = names.length;

	for (var i = 0; i < numOfNames - 1; i++) {
		s += names[i] + ' (' + actorNames[i] + ')';
		if (i < numOfNames - 2) {
			s += ', ';
		} else {
			s += ' ';
		}
	}

	s += 'and ' + names[numOfNames - 1] + ' (' + actorNames[numOfNames - 1] + ').';
	s += '\n\nOriginal Error: ' + backendErrorMsg;
	return s;
}

/*
 * Returns the actor name for an actor
 * that embeds an element with element id id.
 * If element with element id id is not embedded within an actor
 * returns 'no actor'.
 *
 * @param {String} id
 *   element id for the element of interest
 * @returns {String}
 */
function getParentActorNameById(id) {
	var actor = getParentActor(getElementById(id));
	if (actor) {
		return actor.attributes.attrs['.name'].text;
	}
	return 'no actor';
}

/*
 * Returns the actor which embeds the element of interest.
 * Returns null if there is no actor that embeds the element.
 * (If an actor embeds an element, the actor is the element's parent)
 *
 * @param {dia.Element} element
 * @returns {dia.Element | null}
 */
function getParentActor(element) {
	// get call the ancestors for the element
	var ancestors = element.getAncestors();
	if (ancestors.length == 0) {
		return null;
	}
	// if there is an ancestor, there would only be one
	return ancestors[0];
}

/*
 * Returns the element with element id id.
 * Returns null if no element with that element id exists.
 *
 * @param {String} id
 *   element id of the element of interest
 * @returns {dia.Element | null}
 */
function getElementById(id) {
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++) {
		if (id == elements[i].attributes.nodeID) {
			return elements[i];
		}
	}
}

/**
 * Returns true iff node ids exists in msg
 *
 * @param {String} msg
 * @returns {Boolean}
 */
function nodeIDsExists(msg) {
	var pattern = /N\d{4}/g;
	return msg.match(pattern) != null;
}

/*
 * Returns an array of all node ids that are mentioned in
 * the backendErrorMsg, in the order they appear.
 *
 * @param {String} backendErrorMsg
 *   error message from backend
 * @returns {Array of String}
 */
function getIDs(backendErrorMsg) {
	// this regex matches for an N, followed by 4 digits
	var pattern = /N\d{4}/g;
	var arr = backendErrorMsg.match(pattern);

	// remove the preceding N's to get each id
	for (var i = 0; i < arr.length; i++) {
		arr[i] = arr[i].substring(1);
	}

	return arr;
}



