/**
 * backendComm.js Overview
 * This file contains the communication between the front and back end of Bloomingleaf.
 * When an analysis is run, the analysisRequest, model, and graph are bundled into an object, 
 * converted to JSON format, and sent to the backend,
 * which returns the analysisResult.
 */

var url = "http://localhost:8080/untitled.html";	// Hardcoded URL for Node calls. 
var globalAnalysisResult; 

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

	var data = backendStringifyCirc(jsObject);
	console.log(data)
	xhr.onload = function () {
		// This function get called when the response is received.
		console.log("Reading the response");
		if (xhr.readyState == XMLHttpRequest.DONE) {
			var response = xhr.responseText;
			responseFunc(analysisRequest, response);
		}
	}
	xhr.send(data);	// Why is this sent down here? What is this send function.
}

function backendLayoutRequest(file) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		// This function get called when the response is received.
		console.log("Reading the response");
		if (xhr.readyState == XMLHttpRequest.DONE) {
			var response = xhr.responseText;
			var result = JSON.parse(response);
			loadFromObject(result);
		}
	}
	xhr.send(file);
}

function backendStringifyCirc(obj) {
	var skipKeys = ['_events', 'results', 'colorVis', 'change:refEvidencePair', 'context', '_listeners', '_previousAttributes']; // List of keys that contains circular structures
	var graphtext = JSON.stringify(obj, function (key, value) {
		if (skipKeys.includes(key)) { //if key is in the list
			return null; // Replace with null
		} else {
			return value; // Otherwise return the value
		}
	});
	return graphtext
}

/** Handles the response from the server.
 * {ConfigBBM} analysisRequest
 * Note: function was originally called `backendComm`.
 */
function responseFunc(analysisRequest, response) {
	$("body").removeClass("spinning"); // Remove spinner from page
	var results = JSON.parse(response);
	if (errorExists(results)) {
		var msg = getErrorMessage(results.errorMessage);
		alert(msg);
	} else {
		console.log(analysisRequest.get('action'));
		console.log(JSON.stringify(results));
		if (results == "") {
			alert("Error while reading the response file from server. This can be due an error in executing java application.");
			return;
		} else if (analysisRequest.get('action') == 'singlePath' || analysisRequest.get('action') == 'updatePath') {
			var analysisResult = convertToAnalysisResult(results); 	// {ResultBBM}
			// Copy of single path result to be able to access total slider time points in Next State 
			globalAnalysisResult = analysisResult;
			SliderObj.displayAnalysis(analysisResult, false);
			analysisRequest.addResult(analysisResult);
		} else if (analysisRequest.get('action') == 'allNextStates') {
			var allNextStatesResult = convertToAnalysisResult(results); 	// {ResultBBM}
			// New attribute: total time points in slider in original window 
			allNextStatesResult.totalNumTimePoints = globalAnalysisResult.get('timePointPath')
			open_next_state_viewer(analysisRequest, allNextStatesResult)
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
function convertToAnalysisResult(results) {
	var tempResult = new ResultBBM();
	tempResult.set('timePointAssignments', results.timePointAssignments);	// Was called: 'assignedEpoch'
	tempResult.set('timePointPath', results.timePointPath);
	tempResult.set('elementList', results.elementList);
	tempResult.set('allSolutions', results.allSolutions);			//Used for Next State
	tempResult.set('nextStateTPs', results.nextStateTPs);		//Used for Next State
	tempResult.set('selectedTimePoint', results.selectedTimePoint);
	tempResult.set('nextPossibleAbsValue', results.nextPossibleAbsValue);		//TODO: Add these values when other result BBMs are created.
	tempResult.set('nextPossibleRndValue', results.nextPossibleRndValue);		//TODO: Add these values when other result BBMs are created.
	var evoView = new EVO(results.elementList)
	var slider = new SliderObj()
	tempResult.set('colorVis', evoView);
	tempResult.set('slider', slider);
	evoView.singlePathResponse(results.elementList, tempResult, "analysis");
	return tempResult;
}

function open_next_state_viewer(analysisRequest, allNextStatesResult) {
	var urlBase = document.URL.substring(0, document.URL.lastIndexOf('/') + 1);
	var url = urlBase + "analysis.html";
	var w = window.open(url, Date.now(), "status=0,title=0,height=600,width=1200,scrollbars=1");

	if (!w) {
		alert('You must allow popups for this map to work.');
	} else {
		if (w != null && !w.closed) {
			var jsObject = {};
			jsObject.request = analysisRequest;
			jsObject.results = allNextStatesResult;
			w.myInputJSObject = jsObject;
			w.focus();
		} else {
			alert("Popup has been closed.");
		}
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
 * user-defined node names instead of node number.
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
	// If node number does not exist, just return the original error message for now
	if (!nodeNumsExists(backendErrorMsg)) {
		return backendErrorMsg;
	}

	var nums = getNums(backendErrorMsg);
	var names = [];
	var actorNames = [];
	var element;
	var parent;
	for (var i = 0; i < nums.length; i++) {
		element = getElementByNum(nums[i]);
		parent = element.getParentCell();
		names.push(element.attr('.name/text'));
		parent ? actorNames.push(parent.attr('.name/text')) : actorNames.push('no actor');
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

	s += numOfNames != 1 ? 'and ' : ' ' + names[numOfNames - 1] + ' (' + actorNames[numOfNames - 1] + ').';
	s += '\n\nOriginal Error: ' + backendErrorMsg;
	return s;
}

/*
 * Returns the element with that was created in the sequence of the num.
 * Returns null if no element with that sequence exists.
 *
 * @param {Integer} num
 *   element number sequence of the element of interest
 * @returns {dia.Element | null}
 */
function getElementByNum(num) {
	var count = -1;
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++) {
		if (elements[i].get('type')!== 'basic.Actor') {
			count++;
			if (count == num){
				return elements[i];
			}
		}
	}
	return null;
}

/**
 * Returns true if node number exists in msg
 *
 * @param {String} msg
 * @returns {Boolean}
 */
function nodeNumsExists(msg) {
	var pattern = /N\d{3}/g;
	return msg.match(pattern) != null;
}

/*
 * Returns an array of all node numbers that are mentioned in
 * the backendErrorMsg, in the order they appear.
 *
 * @param {String} backendErrorMsg
 *   error message from backend
 * @returns {Array of String}
 */
function getNums(backendErrorMsg) {
	// this regex matches for an N, followed by 3 digits
	var pattern = /N\d{3}/g;
	var arr = backendErrorMsg.match(pattern);

	// remove the preceding N's to get each number of sequence
	for (var i = 0; i < arr.length; i++) {
		arr[i] = arr[i].substring(1);
	}

	return arr;
}