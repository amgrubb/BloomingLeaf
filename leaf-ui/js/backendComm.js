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

function backendLayoutRequest(model) {
	// TODO: create javascript object with analysisRequest = "layout", then stringify and send result to backend
	var jsObject = {};
	jsObject.analysisRequest = "layout";
	jsObject.model = model;
	var data = backendStringifyCirc(jsObject);
	console.log("data in layout backendComm: ", data);

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = function () {
		// This function get called when the response is received.
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
		if (xhr.readyState == XMLHttpRequest.DONE) {
			var response = xhr.responseText;
			//console.log("Response: ", response);
			var new_response = response.replace(/\n/g, " ");
			var result = JSON.parse(new_response);
			console.log("result: ", result);
			dealWithTimingObject(result);
		}
	}
	xhr.send(data);
}


function dealWithTimingObject(timing) {
	// Detmermine if further user input is required
	var input_required = false;
	var timing_list = timing.timingList;
	var indexes_to_modify = [];
	for (var i = 0; i < timing_list.length - 1; i++) {
		var intention = timing_list[i]; //recording every intention that need to be altered
		if (intention.itemsToAdd.length != 0) {
			console.log("input is required");
			input_required = true;
			indexes_to_modify.push(i);
		}
	}
	if (!input_required) {
		console.log("Noooooooooo changes");
		backendMergeRequest(timing);
	}
	else {
		console.log("timing modifications required");
		timing_list.indexes_to_modify = indexes_to_modify;
		displayTimingInputWindow(timing);
	}
}

function displayTimingInputWindow(timing) {
	$('#timing-input-window').css('display', '');
	var timing_list = timing.timingList;
	let indexes = timing_list.indexes_to_modify;
	let intention_list = $('#timing-input-intention-list');
	console.log("timing in display: ", timing);

	for (i in indexes) {
		let inputId = "#timing-input-order-" + i;

		intention_list.append(
			"<div>" +
			"<h3>" + timing_list[i].intention + "</h3><table class='timelisttable'><tr id='tablerow_" + i + "'></tr></table>"
		)
		
		// row of absolute time points into which relative time points can be dragged
		var row = $('#tablerow_' + i);
		for (var j = 0; j < timing_list[i].newTimeOrder.length; j ++) {
			if (j == 0) {
				row.append(
					'<td class="dropbox" style="border:none" id="dropbox_'+ i + '_' + j + '">' +
					timing_list[i].newTimeOrder[j] + "</td>"
				)
			} else if (j == timing_list[i].newTimeOrder.length - 1) {
				row.append(
					'<td ondrop="drop(event)" ondragover="dragover(event)" ondragleave="dragleave(event)" class="between" id="between_' + i + '_' + (2*j-1)+ '"></td>' +
					'<td style="border:none" class="dropbox" id="dropbox_'+ i + '_' + (2*j) + '">' +
					timing_list[i].newTimeOrder[j] + "</td>"
				)
			} else {
				row.append(
					'<td ondrop="drop(event)" ondragover="dragover(event)" ondragleave="dragleave(event)" class="between" id="between_' + i + '_' + (2*j-1)+ '"></td>' +
					'<td ondrop="drop(event)" ondragover="dragover(event)" ondragleave="dragleave(event)" class="dropbox" id="dropbox_'+ i + '_' + (2*j) + '">' +
					timing_list[i].newTimeOrder[j] + "</td>"
				)
			}
		}

		intention_list.append(
			"<br/><h4>Relative time points to add: </h4>" +
			"<div id='startBox_" + i + "'></div>"
		)

		// relative time point tiles to be dragged
		var start = $('#startBox_' + i);
		for (var j = 0; j < timing_list[i].itemsToAdd.length; j ++) {
			start.append(
				"<button draggable = 'true' class='popup_button_timing' ondragstart='dragStart(event)' ondragend='dragEnd(event)' id=\"timing-input-toAdd_" + i + "\">" +
				timing_list[i].itemsToAdd[j] + "</button>" + 
				'</div>'
			)
		}
	}

	merge_button_timing = document.getElementById("merge-button-timing");

	merge_button_timing.onclick = function () {

		// checks that all time points have been placed
		for (var i = 0; i < timing.timingList.indexes_to_modify.length-1; i++) {
			if (document.getElementById('startBox_' + i).children.length != 0) {
				console.log("You must place all time points.");
				return;
			}
		}

		// creates a list of lists showing time points in sequential order
		// equivalent time points are in same inner list
		for (var i = 0; i < timing.timingList.indexes_to_modify.length; i++) {
			timing.timingList[i].newTimeOrder = [];
			var row = document.getElementById("tablerow_" + i);
			for (var j = 0; j < row.getElementsByTagName("td").length; j++) {
				var array = [];
				if (row.getElementsByTagName("td")[j].innerHTML.length > 0) {
					var timePointsString = row.getElementsByTagName("td")[j].innerHTML.split(/[><]/);
					for (var k = 0; k < timePointsString.length; k++) {
						if (k%2 == 0 && timePointsString[k].length > 0) {
							array.push(timePointsString[k]);
						}
					}
					timing.timingList[i].newTimeOrder.push(array);
				}
			}
			for (var j = 0; j < timing.timingList[i].newTimeOrder.length; j++) {
				if (timing.timingList[i].newTimeOrder[j].length == 1) {
					timing.timingList[i].newTimeOrder[j] = timing.timingList[i].newTimeOrder[j][0];
				}
				else {
					timing.timingList[i].newTimeOrder[j] = timing.timingList[i].newTimeOrder[j].join("$");
				}
			}
		}
		

		// var intentions_list = document.getElementById('timing-input-intention-list');
		// console.log("Intentions_list: ", intention_list);
		// timeOrders = intentions_list.getElementsByTagName("input");
		// console.log("timeOrder before for loop: ", timeOrders);
		// inputsToAdd = intention_list.getElementsByTagName("button");
		// console.log("timeOrder before for loop: ", inputsToAdd);
		// for (let i = 0; i < timeOrders.length; i++) {
		// 	timeOrder = timeOrders[i].value;
		// 	timeOrder = timeOrder.split(",");
		// 	timing_list[i].newTimeOrder = timeOrder;
		// }
		timing_input.style.display = "none";
		backendMergeRequest(timing);
	}
}
function backendMergeRequest(timing) {
	console.log("timing type: ", typeof timing);
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
			//var new_response = response.replace(/\n/g, " ")
			console.log("xhr response text: ", xhr.responseText);
			console.log("response: ", response);
			var result = JSON.parse(response);
			console.log("Result2 : ", result);
			//console.log("you are going to load from object");
			backendLayoutRequest(result);
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
		if (elements[i].get('type') !== 'basic.Actor') {
			count++;
			if (count == num) {
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

// var buttons = document.querySelectorAll('.popup_button');
//     let draggedButton = null;

//     buttons.forEach(button => {
//       button.addEventListener('dragstart', dragStart);
//       button.addEventListener('dragend', dragEnd);
//     });

//     function dragStart(event) {
//       draggedButton = event.target;
// 	  console.log("dragged button 1:", draggedButton);
//       event.dataTransfer.effectAllowed = 'move';
//       event.dataTransfer.setData('text/html', draggedButton.innerHTML);
// 	  console.log("dragged button 2:", draggedButton);
//     }

//     function dragEnd(event) {
// 		console.log(draggedButton.innerHTML);
// 		event.target.insert('<div class="dropbox" id="dropbox'+ i + '_' + j + '"><li class=fixedtime>' + draggedButton.innerHTML + '</li></div>');
// 		draggedButton = null;
//     }

//     function dragover(event) {
//       event.preventDefault();
//     }

//     function drop(event) {
// 		event.preventDefault();
// 		if (event.target.classList.contains('draggables')) {
// 			var container = event.target;
// 			container.appendChild(draggedButton);
// 		}
// 		console.log("dragged butotn", draggedButton.innerHTML);
// 		$().insert('<div class="dropbox"><li class=fixedtime>' + draggedButton.innerHTML + '</li></div>');
//     }