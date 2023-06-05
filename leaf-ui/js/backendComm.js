/**
 * backendComm.js Overview
 * This file contains the communication between the front and back end of Bloomingleaf.
 * When an analysis is run, the analysisRequest, model, and graph are bundled into an object, 
 * converted to JSON format, and sent to the backend,
 * which returns the analysisResult.
 */

// export{ timing_list };

var url = "http://localhost:8080/untitled.html";	// Hardcoded URL for Node calls. 
var globalAnalysisResult; 
var globalTiming;

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

function backendLayoutRequest(model) {
	// TODO: create javascript object with analysisRequest = "layout", then stringify and send result to backend
	var jsObject = {};
	jsObject.analysisRequest = "layout";
	jsObject.model = model;
	var data = backendStringifyCirc(jsObject);

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
	xhr.send(data);
}


// Call premerge and get the timing file back
function backendPreMergeRequest(model1, model2, timing_offset) {
	var jsObject = {};
	jsObject.analysisRequest = "premerge";
	jsObject.model1 = model1;
	jsObject.model2 = model2;
	jsObject.timingOffset = timing_offset;
	var data = backendStringifyCirc(jsObject);

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		// This function get called when the response is received.
		console.log("PreMerge: Reading the response");
		if (xhr.readyState == XMLHttpRequest.DONE) {
			var response = xhr.responseText;
			// console.log(response[130] + response[131] + response[132]);
			// console.log("Response: ", response)
			var new_response = response.replace(/\n/g, " ")
			// console.log("new_response: ", new_response)
			var result = JSON.parse(new_response);
			// console.log("Result1 : ", result);
			dealWithTimingObject(result);
		}
	}
	xhr.send(data);
	// xhr.send(updatedData);
}


function dealWithTimingObject(timing) {
	// Detmermine if further user input is required
	
	if(Object.keys(timing.timingList[0]).length == 0) {
		// No changes required 
		console.log("Noooooooooo changes");
		backendMergeRequest(timing);
	}
	else {
		var input_required = false;
		var timing_list = timing.timingList;
		var indexes_to_modify = [];
		for(var i = 0; i < timing_list.length - 1; i++) {
			var intention = timing_list[i]; //recording every intention that need to be altered
			// console.log(timing_list);
			// console.log(intention);
			if(intention.itemsToAdd.length != 0) {
				input_required = true;
				indexes_to_modify.push(i);
			}
		}


		// TODO
		console.log("timing modifications required");
		// console.log("input_required: ",  input_required)
		if(input_required) {
			// call merge
			// var isFinished = false;
			globalTiming = timing_list;
			// timing_list.indexes_to_modify = indexes_to_modify;
			globalTiming.indexes_to_modify = indexes_to_modify;
			// console.log("index to change: ", globalTiming.indexes_to_modify)
			console.log("index to change: ", globalTiming.indexes_to_modify);
			displayTimingInputWindow(timing);
			// while (!isFinished) {
			// 	console.log('User is not finished.');
			// }
		}
		// timing_list = globalTiming;
		// console.log("new Timing: ", timing);
		// backendMergeRequest(timing);
	}
	console.log("new Timing: ", timing);
	// backendMergeRequest(timing);
}

function displayTimingInputWindow(timing) {
	$('#timing-input-window').css('display', '');

	let indexes = globalTiming.indexes_to_modify;
	let intention_list = $('#timing-input-intention-list');
	console.log("timing in display: ", timing);
	// timing_list = timing.timingList;
	// let indexes = timing_list.indexes_to_modify;
	// globalTiming.indexes_to_modify;
	// let intention_list = $('#timing-input-intention-list');
	
	// var isFinished = false;

	// while (!isFinished) {
	// 	console.log('User is not finished.');
	// }

	for(i in indexes) {
		// console.log("Intention: ", globalTiming[i].intention);

		let inputId = "#timing-input-order-" + i;
		
		intention_list.append(
			"<div>" +
			"<h3>" + globalTiming[i].intention + "</h3>" +
			"<input type=\"text\" style=\"width:80%\" id=\"" + inputId + "\" value=\"" + globalTiming[i].newTimeOrder +  "\"> " +
			"<span>New Time Order</span><br>" +
			"<h4>Relative time points to add: <span id=\"timing-input-toAdd-" + i + "\">" + globalTiming[i].itemsToAdd + "</span></h4>" +
			"</div>"
		)
	}
	
	merge_button_timing = document.getElementById("merge-button-timing");

	merge_button_timing.onclick = function(){
		let editedInputValues = [];

		var intentions_list = document.getElementById('timing-input-intention-list');
		timeOrders = intentions_list.getElementsByTagName("input");
		
		// const { timing_list } = require('backendComm.js');

		for (let i = 0; i < timeOrders.length; i++){
			timeOrder = timeOrders[i].value;
			editedInputValues.push(timeOrder);
			// console.log("edits: ", editedInputValues);
			// timing_list[i].newTimeOrder = timeOrder;
			globalTiming[i].newTimeOrder = timeOrder;
			
			// console.log("globalTiming:", i," ", globalTiming[i].newTimeOrder);
		}
		timing_input.style.display = "none";
		// isFinished = true;
		// backendMergeRequest(timing);
		// console.log("new time Order: ", editedInputValues);
		// console.log("globalTiming : ", globalTiming);

		// module.exports = { timing.timingList };
		backendMergeRequest(timing);
	}
}
function backendMergeRequest(timing) {
	var jsObject = {};
	jsObject.analysisRequest = "merge";
	jsObject.timing = timing;
	var data = backendStringifyCirc(jsObject);

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	console.log("Timing in Merge: ", timing);

	xhr.onload = function () {
		// This function get called when the response is received.
		console.log("Merge: Reading the response");
		if (xhr.readyState == XMLHttpRequest.DONE) {
			var response = xhr.responseText;
			var result = JSON.parse(response);
			console.log("Result2 : ", result);
			loadFromObject(result);
		}
	}
	xhr.send(data);
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