/**
 * Read and load a saved JSON file
 *
 */
// Simulator


// import { timing_list } from "backendComm.js";
// const { timing_list } = require('backendComm.js');

loader = document.getElementById("loader");
layout_loader = document.getElementById("layout-loader");
merge_button = document.getElementById("merge-button");
merge_without_layout = document.getElementById("merge-button-without-layout");
// merge_button_timing = document.getElementById("merge-button-timing");
timing_input = document.getElementById("timing-input-window");
merge_file_picker = document.getElementById("merge-file-picker");
reader = new FileReader();

// Whenever the input is changed, read the file.
loader.onchange = function () {
	reader.readAsText(loader.files.item(0));
	// Resets loader value so that the onchange event will still be triggered 
	// if the same file is cleared and then loaded again
	loader.value = "";
};

layout_loader.onchange = function () {
	var file = layout_loader.files.item(0);
	var reader_layout = new FileReader();

	reader_layout.onload = function() {
		var model = JSON.parse(reader_layout.result);
		backendLayoutRequest(model);
	}

	reader_layout.readAsText(file);

	reader_layout.onerror = function() {
		console.log(reader_layout.error);
	}
};

merge_button.onclick = function () {	
	// console.log("Additional input")
	var file1 = document.getElementById("merge-model1").files.item(0);
	var file2 = document.getElementById("merge-model2").files.item(0);
	var timingOffset = document.getElementById("merge-timingOffset").value;
	var isLayout = true; // true if the user wants to display layout and false otherwise

	var model1, model2;

	var reader_merge_file1 = new FileReader();
	var reader_merge_file2 = new FileReader();

	// Timing offset must be a number
	if (isNaN(timingOffset)){
		timingOffset = 0;
		swal("Error: Invalid Timing Offset. (Must be a number)", "", "error");
	}
	else if (file1 != null && file2 != null){ // two files must be uploaded
		reader_merge_file1.readAsText(file1);

		reader_merge_file1.onload = function() {
			model1 = JSON.parse(reader_merge_file1.result);
			reader_merge_file2.readAsText(file2);

			reader_merge_file2.onload = function() {
				model2 = JSON.parse(reader_merge_file2.result);
				backendPreMergeRequest(model1, model2, timingOffset, isLayout);
				merge_file_picker.style.display = "none";
			}

			reader_merge_file2.onerror = function() {
				console.log(reader_merge_file2.error);
			}
		}

		reader_merge_file1.onerror = function() {
			console.log(reader_merge_file1.error);
		}
	}
};

merge_without_layout.onclick = function () {	
	// console.log("Additional input")
	var file1 = document.getElementById("merge-model1").files.item(0);
	var file2 = document.getElementById("merge-model2").files.item(0);
	var timingOffset = document.getElementById("merge-timingOffset").value;
	var isLayout = false;

	var model1, model2;

	var reader_merge_file1 = new FileReader();
	var reader_merge_file2 = new FileReader();

	// Timing offset must be a number
	if (isNaN(timingOffset)){
		timingOffset = 0;
		swal("Error: Invalid Timing Offset. (Must be a number)", "", "error");
	}
	else if (file1 != null && file2 != null){ // two files must be uploaded
		reader_merge_file1.readAsText(file1);

		reader_merge_file1.onload = function() {
			model1 = JSON.parse(reader_merge_file1.result);
			reader_merge_file2.readAsText(file2);

			reader_merge_file2.onload = function() {
				model2 = JSON.parse(reader_merge_file2.result);
				backendPreMergeRequest(model1, model2, timingOffset, isLayout);
				merge_file_picker.style.display = "none";
			}

			reader_merge_file2.onerror = function() {
				console.log(reader_merge_file2.error);
			}
		}

		reader_merge_file1.onerror = function() {
			console.log(reader_merge_file1.error);
		}
	}
};

// When read is performed, if successful, load that file.
reader.onload = function () {

	// If JSON is not recognized as a BloomingLeaf model, just return
	if (!reader.result) {
		return;
	}
	clearInspector();
	var result = JSON.parse(reader.result);
	if ( result.graph.type != undefined) { // TODO: find a better way to distinguish the different versions
		loadFromObject(result);
	} else {
		// Replace the "link" in the type parameter with basic.CellLink so that the cell is later on read correctly as a link rather than element
		// This can't be done with the current version as there is a link parameter
		var text = reader.result.replaceAll('"link"', '"basic.CellLink"')
		result = JSON.parse(text); // Reread the file
		loadOldVersion(result)
	}
	
	var graphtext = JSON.stringify(graph.toJSON());
	document.cookie = "graph=" + graphtext;
}

/**
 * Given an object obj containing a model, graph and analysis configurations and results, 
 * updates the global variables: model, graph and analysisMap
 * to the objects from obj
 * If the obj does not contain analysis information, do not update global vars
 *
 * @param {Object} obj
 */
function loadFromObject(obj) {
	console.log("Inside loadFromObject");
	graph.fromJSON(obj.graph);
	var cells = graph.getCells();
	for (var i = 0; i < cells.length; i++) {
		cell = cells[i];
		if (cell.get('type') == "basic.Actor") {
			createBBActor(cell) //Create actor
		} else if (cell.get('type') == "basic.CellLink") {
			createBBLink(cell) //Create link
		} else {
			// Singled out functionSegList from obj as it doesn't show up in the graph after reading from JSON
			var funcseg = cell.attributes.intention.attributes.evolvingFunction.attributes.functionSegList;
			createBBElement(cell, funcseg) //Create element
		}
	}
	loadConstraints();
	// If the object contains configCollection, create configCollection fields from JSON
	if (obj.configCollection != undefined) {
		loadConfig(obj.configCollection)
	}
}

/** 
 * Loads old version of object obj by creating an actor, link, or element.
 * Updates maxAbsTime of old version.
 * 
 * @param {Object} obj 
 */
function loadOldVersion(obj) {
	graph.fromJSON(obj.graph);
	var cells = graph.getCells();
	for (var i = 0; i < cells.length; i++) {
		cell = cells[i];
		if (cell.get('type') == "basic.Actor") {
			loadOldActor(cell); // Create actor
		} else if (cell.get('type') == "basic.CellLink") {
			loadOldLinks(cell, obj.model.links); // Create link, need to pass in the array of links to find the link types
		} else {
			// Create element by passing in the cell, the intentions that have the types, and the constraints
			loadOldElement(cell, obj.model.intentions, obj.model.constraints, obj.analysisRequest.userAssignmentsList); 
		}
	}
	graph.set("maxAbsTime", obj.model.maxAbsTime);
	loadOldConfig(obj.analysisRequest)
}

/**
 * Load the old actors into ActorBBM
 */
function loadOldActor(cell) {
	// Doesn't have other actors bc previous version had a bug where actor types can't be changed
	var actorBBM = new ActorBBM({ type: 'basic.Actor', actorName: cell.attr(".name/text")});
	cell.attr({'.label': {'cx': 20, 'cy' : 20}}) // Adjust the labels to fit the round actors
	cell.set('actor', actorBBM)
}

/**
* Load the old links into LinkBBM
*/
function loadOldLinks(cell, arr) {
	var target = cell.getTargetElement().get('type');
	var source = cell.getSourceElement().get('type');
	var oldDisplayType;
	var oldEvolving;

	// Find the display type
    if (((source === 'basic.Actor') && (target !== 'basic.Actor')) || ((source !== 'basic.Actor') && (target === 'basic.Actor'))) { // If the link is between an intention and an actor
        oldDisplayType = 'error';
    } else if (source === "basic.Actor") {
        oldDisplayType = 'Actor';
    } else {
        oldDisplayType = 'element'; 
    }

	// Find the link type and whether it was an evolving link and has post type
	for (var i = 0; i < arr.length; i++) {
		if (cell.get('linkID') == arr[i].linkID){
			var oldLink = arr[i];
			if (oldLink.postType != null) {
				oldEvolving = true; 
				var oldPostType = oldLink.postType;
				if ((oldPostType == 'AND') || (oldPostType == 'OR') || (oldPostType == 'NO')) {
					oldPostType = oldLink.postType.toLowerCase();
				}
			 } else {
				 oldEvolving = false;
				}
		}
	}

	var oldLinkType = oldLink.linkType;
	// Modify the linktypes into formats that the current Linkinspector recognizes
	if ((oldLinkType == 'AND') || (oldLinkType == 'OR') || (oldLinkType == 'NO')){
		oldLinkType = oldLinkType.toLowerCase();
		if (oldLinkType == 'no') {
			cell.label(0, { position: 0.5, attrs: { text: { text: 'no' } } });
		}
	} else {
		cell.label(0, { position: 0.5, attrs: { text: { text: oldLinkType } } });
	}
	
	// Reassign linkBBM to cell
	var linkBBM = new LinkBBM({ displayType: oldDisplayType, linkType: oldLinkType, postType: oldPostType, absTime: oldLink.absoluteValue, evolving: oldEvolving }); 
	cell.set('link', linkBBM);
}

/**
* Loads old elements into BBM Models
*
*/
function loadOldElement(cell, oldElements, constraintList, userAssignmentsList) {
	var oldElement;
	var oldUserEval;
	var oldConstraints = [];

	for (var i = 0; i < oldElements.length; i++) {
		// Find the old intention information
		if (cell.get('nodeID') == oldElements[i].nodeID){
			oldElement = oldElements[i];
		}
	}

	// Find all the constraints relate with the intention
	for (var i = 0; i < constraintList.length; i++) {
		if (cell.get('nodeID') == constraintList[i].constraintSrcID){
			oldConstraints.push(constraintList[i]); 
		}
	}
	// Find the old userevaluation information
	for ( var i = 0; i < userAssignmentsList.length; i++) {
		if (cell.get('nodeID') == userAssignmentsList[i].intentionID){
			oldUserEval = userAssignmentsList[i];
		}
	}

	// Create the new intentionBBM after getting the evolvingFunction
	var intentionBBM = new IntentionBBM({ nodeName: oldElement.nodeName, evolvingFunction: getOldEvolvingFunction(oldElement, oldConstraints) });
	 // Create userEvaluationBBM for intentionBBM
	intentionBBM.get('userEvaluationList').push(new UserEvaluationBBM({assignedEvidencePair: oldUserEval.evaluationValue, absTime: oldUserEval.absTime}));

	cell.set('intention', intentionBBM);
}


/**
* Given an object containing information about the old EvolvingFunction 
* and an array of associated constraints,
* returns a corresponding EvolvingFunction BBM
* 
* @param {Object} obj @param {Array.<Object>} oldConstraint
* @returns {EvolvingFunction}
*/
function getOldEvolvingFunction(obj, oldConstraint) {
	var evolving;
	if (obj.dynamicFunction.functionSegList != undefined) {
		// Get information on function segment list with its associated constraints 
		var functionInfo = getFuncSegList(obj.dynamicFunction.functionSegList, oldConstraint);
		evolving = new EvolvingFunctionBBM({ type: obj.dynamicFunction.stringDynVis, hasRepeat: functionInfo.hasRepeat, repStart: functionInfo.repStart, repStop: functionInfo.repStop, repCount: functionInfo.repCount, repAbsTime: functionInfo.repAbsTime, functionSegList: functionInfo.functionList });
	} else {
		evolving = new EvolvingFunctionBBM({});
	}
	// Set repAbsTime here because somehow it doesn't get read if we intialize it
    evolving.set('repAbsTime', functionInfo.repabsTime)
   return evolving;
}

/**
* Returns an array of FuncSegment or RepFuncSegment objects with 
* information from arr
*
* @param {Array.<Object>} functionseg
* @returns {Array.<FuncSegment|RepFuncSegment>}
*/
function getFuncSegList(functionseg, oldConstraints) {
	var res = [];
	res.functionList = [];
	// Assume there is not repeats first
	res.hasRepeat = false;
	res.repStop = null;
	res.repCount = null;
	res.repabsTime = null;
	var AT = null;
	for (var i = 0; i < functionseg.length; i++) {
		// If there is a repeated segment
		if (functionseg[i].repNum) {
			res.hasRepeat = true;
			// Get the repeated functionSegList
			var repFuncSeg = functionseg[i].functionSegList;

			res.repStart = repFuncSeg[0].funcStart;
			for (var k = 0; k < repFuncSeg.length; k++) {
				if (oldConstraints.length > 0) {
					for (var j = 0; j < oldConstraints.length; j++) {
						if (repFuncSeg[k].funcStart === oldConstraints[j].constraintSrcEB) {
							AT =  oldConstraints[j].absoluteValue;
						}
					}
				}
				res.functionList.push(new FunctionSegmentBBM({ type: repFuncSeg[k].funcType, refEvidencePair: repFuncSeg[k].funcX, startTP: repFuncSeg[k].funcStart, startAT: AT, current: k == (repFuncSeg.length - 1) ? true : false }));
			}
			res.repStop = repFuncSeg[repFuncSeg.length-1].funcStop;
			res.repCount = parseInt(functionseg[i].repNum);
			res.repabsTime = parseInt(functionseg[i].absTime);

		} else {
			// If this segment is not a repeating segment
			// startAT = start absolute time (int), startTP = start time point (string)
			if (oldConstraints.length > 0) {
				for (var j = 0; j < oldConstraints.length; j++) {
					if (functionseg[i].funcStart === oldConstraints[j].constraintSrcEB) {
						AT =  oldConstraints[j].absoluteValue;
					}
				}
			} 	
			res.functionList.push(new FunctionSegmentBBM({ type: functionseg[i].funcType, refEvidencePair: functionseg[i].funcX, startTP: functionseg[i].funcStart, startAT: AT, current: i == (functionseg.length - 1) ? true : false }));
		}
	}
	return res;
}



/**
 * Returns a backbone model Actor with information from the obj
 *
 */
function createBBActor(cell) {
	var actor = cell.get('actor');
	var actorBBM = new ActorBBM({ type: actor.attributes.type, actorName: actor.attributes.actorName });
	cell.set('actor', actorBBM)
	cell.attr({'.label': {'cx': 20, 'cy' : 20}})
}

/**
 * Returns a backbone model Link with information from the obj
 *
 */
function createBBLink(cell) {
	var link = cell.get('link').attributes;
	var linkBBM = new LinkBBM({ displayType: link.displayType, linkType: link.linkType, postType: link.postType, absTime: link.absTime, evolving: link.evolving });
	cell.set('link', linkBBM)
}

/**
 * Returns a backbone model Element with information from the obj
 *
 */
function createBBElement(cell, funcsegs) {
	var intention = cell.get('intention');
	var evol = intention.attributes.evolvingFunction.attributes;
	var intentionBBM = new IntentionBBM({ nodeName: intention.attributes.nodeName });

	var evolving = new EvolvingFunctionBBM({ type: evol.type, hasRepeat: evol.hasRepeat, repStart: evol.repStart, repStop: evol.repStop, repCount: evol.repCount, repAbsTime: evol.repAbsTime });
	for (let funcseg of funcsegs) {
		var funcsegBBM = new FunctionSegmentBBM({ type: funcseg.attributes.type, refEvidencePair: funcseg.attributes.refEvidencePair, startTP: funcseg.attributes.startTP, startAT: funcseg.attributes.startAT, current: funcseg.attributes.current });
		evolving.get('functionSegList').push(funcsegBBM);
	}
	var userEvals = intention.attributes.userEvaluationList;
	for (let userEval of userEvals) {
		intentionBBM.get('userEvaluationList').push(new UserEvaluationBBM({ assignedEvidencePair: userEval.attributes.assignedEvidencePair, absTime: userEval.attributes.absTime }));
	}
	intentionBBM.set('evolvingFunction', evolving);
	cell.set('intention', intentionBBM);
}

/**
 * Loads the constraints of graph as contraintBBM in a constraintCollection
 */
function loadConstraints() {
	var constraints = graph.get('constraints');
	var constraintCollection = new ConstraintCollection([]);
	var constraintBBM;
	for (let constraint of constraints) {
		constraintBBM = new ConstraintBBM({ type: constraint.type, srcID: constraint.srcID, destID: constraint.destID, srcRefTP: constraint.srcRefTP, destRefTP: constraint.destRefTP, absTP: constraint.absTP });
		constraintCollection.push(constraintBBM);
	}
	graph.set('constraints', constraintCollection);
}

/**
 * Returns an object that contains the current graph, model, and analysis configurations
 * and REMOVES results from the analysisConfigurations map.
 * This return object is what the user would download when clicking the Save button
 * in the top menu bar.
 *
 * @returns {Object}
 */
function getModelAnalysisJson(configCollection) {
	var obj = {};
	obj.graph = graph.toJSON();
	// Clone to spearate the result removal from what is displayed in ConfigInspector 
	var newConfig = configCollection.clone();

	// Remove results
	for (var i = 0; i < newConfig.length; i++) {
		newConfig.at(i).set('results', new ResultCollection([]))
	}
	obj.configCollection = newConfig.toJSON();
	obj.version = "BloomingLeaf_2.0";

	return obj;
}

/**
 * Returns an object that contains the current graph, model and analysis configurations.
 * This return object is what the user would download when clicking the Save button
 * in the top menu bar.
 *
 * @returns {Object}
 */
function getFullJson(configCollection) {
	var obj = {};
	obj.graph = graph.toJSON();
	obj.configCollection = configCollection.toJSON();
	obj.version = "BloomingLeaf_2.0";

	return obj;
}

/**
 * Helper function to download saved graph in JSON format
 */
function download(filename, text) {
	var dl = document.createElement('a');
	dl.setAttribute('href', 'data:application/force-download;charset=utf-8,' + encodeURIComponent(text));
	dl.setAttribute('download', filename);

	dl.style.display = 'none';
	document.body.appendChild(dl);

	dl.click();
	document.body.removeChild(dl);
}

/**
 * If a cookie exists, process it as a previously created graph and load it.
 */
if (document.cookie && document.cookie.indexOf('all=') !== -1) {

	var obj = JSON.parse(document.cookie.substr(4));

	try {
		loadFromObject(obj);
	} catch (e) {
		// This should never happen, but just in case
		alert('Previously stored cookies contains invalid JSON data. Please clear your cookies.');
	}
}

var buttons = document.querySelectorAll('.popup_button');
    let draggedButton = null;

	/**
	 * Tile is dragged out of its previous container
	 */
    function dragStart(event) {
		draggedButton = event.target;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/html', draggedButton.innerHTML);
		setTimeout(function findAvailable() { // timeout was necessary to avoid a bug in Chrome in which dragend was sometimes called immediately
			var dropboxes = document.getElementsByClassName('dropbox');
			var betweens = document.getElementsByClassName('between');
			for (var i = 0; i < dropboxes.length; i++) {
				if (checkDroppability(dropboxes[i])) {
					dropboxes[i].classList.add('available');
				}
			}
			for (var i = 0; i < betweens.length; i++) {
				if (checkDroppability(betweens[i])) {
					betweens[i].classList.add('available');
				}
			}
			document.getElementById("startBox_" + draggedButton.id.split("_")[1]).classList.add('available');
		}, 10);
    }

	/**
	 * Tile is no longer being dragged
	 */
    function dragEnd(event) {
		draggedButton = null;

		var dropboxes = document.getElementsByClassName('dropbox');
		var betweens = document.getElementsByClassName('between');
		var startboxes = document.getElementsByClassName('startBox');
		for (var i = 0; i < dropboxes.length; i++) {
			dropboxes[i].classList.remove('available');
		}
		for (var i = 0; i < betweens.length; i++) {
			betweens[i].classList.remove('available');
		}
		for (var i = 0; i < startboxes.length; i++) {
			startboxes[i].classList.remove('available');
		}
    }

	/**
	 * Highlights the container that the tile is over
	 */
    function dragover(event) {
		event.preventDefault();

		if (checkDroppability(event.target)) {
			event.target.classList.add('draggedover');
		}
    }

	/**
	 * Unhighlights the container when the tile is no long over it
	 */
	function dragleave(event) {
		event.preventDefault();
    	event.target.classList.remove('draggedover');
	}

	/**
	 * Attaches tile to a new container and shifts ids of the row based on where the tile was dropped
	 */
    function drop(event) {
		event.preventDefault();
		event.target.classList.remove('draggedover');
		var container = event.target;

		// find position where the tile was dropped
		var rowIdx = parseInt(container.id.split("_")[1]);
		var colIdx = parseInt(container.id.split("_")[2]);

		if (checkDroppability(event.target)) { // if this is a valid place for the tile to be dropped
			if (container.id.split("_")[0] == "between") { // if dropped into a new place, add a new time and add places to drop future tiles on either side
				container.appendChild(draggedButton);
				var newLeftCell = document.getElementById("tablerow_" + rowIdx).insertCell(colIdx);
				newLeftCell.outerHTML = '<td ondrop="drop(event)" ondragover="dragover(event)" ondragleave="dragleave(event)" class="between"></td>'
				var newRightCell = document.getElementById("tablerow_" + rowIdx).insertCell(colIdx+2);
				newRightCell.outerHTML = '<td ondrop="drop(event)" ondragover="dragover(event)" ondragleave="dragleave(event)" class="between"></td>'
			} else if (container.id.split("_")[0] == "dropbox") { // if dropped into an existing time point, add tile to that time
				container.append(draggedButton);
			} else {
				console.log("there is a problem");
			}

			var row = document.getElementById("tablerow_" + rowIdx);
			var height = getLargestHeight(row);
			// reset the ids of the tiles based on their new order
			for (var i = 0; i < row.getElementsByTagName("td").length; i++) {
				if (i%2 == 0) {
					row.getElementsByTagName("td")[i].setAttribute('id', 'dropbox_'+ rowIdx + '_' + i);
					row.getElementsByTagName("td")[i].setAttribute('class', 'dropbox');
					row.getElementsByTagName("td")[i].setAttribute('style', 'height: ' + height + "px");
				} else {
					row.getElementsByTagName("td")[i].setAttribute('id', 'between_'+ rowIdx + '_' + i);
					row.getElementsByTagName("td")[i].setAttribute('class', 'between');
					row.getElementsByTagName("td")[i].setAttribute('style', 'height: ' + height + "px");
				}

				if (getInnerHTML(row.getElementsByTagName("td")[i]).length == 0 && getInnerHTML(row.getElementsByTagName("td")[i+1]).length == 0) {
					row.deleteCell(i);
					i--;
				}

				if (i == 0 || i == row.getElementsByTagName("td").length - 1) {
					row.getElementsByTagName("td")[i].setAttribute('style', 'border:none');
				}
			}
		}
    }

	/**
	 * Validates that the tile can be dropped into the box it is over
	 * 
	 * @param HTMLElement of the potential target to be dropped into
	 * @return boolean
	 */
	function checkDroppability(container) {
		var dragIdx = parseInt(draggedButton.id.split("_")[1])
		var rowIdx = parseInt(container.id.split("_")[1]);
		var colIdx = parseInt(container.id.split("_")[2]);

		// set min and max indexes for valid dropping based on first absolute time point and maxtime
		for (var i = document.getElementById("tablerow_" + rowIdx).getElementsByTagName("td").length - 1; i >= 0; i--) {
			var elements = getInnerHTML(document.getElementById("tablerow_" + rowIdx).getElementsByTagName("td")[i]).split(",");
			for (var j = 0; j < elements.length; j++) {
				if (elements[j] == draggedButton.innerHTML[0] + "-MaxTime") {
					var maxIdx = i;
				}
				if (elements[j][0] == draggedButton.innerHTML[0]) {
					var minIdx = i;
				}
			}
		}

		// further restrict min and max indexes (if applicable) based on the other relative timepoints from the same model
		var buttonTimes = splitRelTimeName(draggedButton.innerHTML);
		for (var k = 0; k < buttonTimes.length; k++) {
			var firstChars = buttonTimes[k].slice(0,6);
			var lastChar = buttonTimes[k].slice(buttonTimes[k].length-1);
			for (var i = minIdx; i < maxIdx; i++) {
				var compareStr = getInnerHTML(document.getElementById("tablerow_" + rowIdx).getElementsByTagName("td")[i]).split(",");
				for (var j = 0; j < compareStr.length; j++) {
					if (compareStr[j] != buttonTimes[k]) {
						// for repeated time points
						if (buttonTimes[k].split(":").length > 1) {
							// compare to another repeated
							if (compareStr[j].split(":")[0] == buttonTimes[k].split(":")[0]) {
								if (compareStr[j].slice(0,6) == firstChars) {
									var compareChars = compareStr[j].split(":")[1];
									if (compareChars < buttonTimes[k].split(":")[1] && i > minIdx) {
										minIdx = i;
									} else if (compareChars > buttonTimes[k].split(":")[1] && i < maxIdx) {
										maxIdx = i;
									}
								}
							} else {
								// compare to a nonrepeated
								if (compareStr[j].slice(0,6) == firstChars) {
									var compareChar = compareStr[j].slice(compareStr[j].length-1);
									if (compareChar < lastChar && i > minIdx) {
										minIdx = i;
									} else if (compareChar > lastChar && i < maxIdx) {
										maxIdx = i;
									}
								}
							}
						} else {
							// for nonrepeated time points
							if (compareStr[j].slice(0,6) == firstChars) {
								var compareChar = compareStr[j].slice(compareStr[j].length-1);
								if (compareChar < lastChar && i > minIdx) {
									minIdx = i;
								} else if (compareChar > lastChar && i < maxIdx) {
									maxIdx = i;
								}
							}
						}
					}
				}
			}
		}

		// further restrict if the timepoint exists in another model
		var dropboxes = document.getElementsByTagName('td');
		for (var i = 0; i < dropboxes.length; i++) {
			if (dropboxes[i].innerHTML.includes(draggedButton.innerHTML) && draggedButton.parentNode != dropboxes[i]) {
				var equivalents = getInnerHTML(dropboxes[i]).split(",").filter(x => !splitRelTimeName(draggedButton.innerHTML).includes(x));
				var equivRow = dropboxes[i].id.split("_")[1];
				var equivCol = dropboxes[i].id.split("_")[2];
				if (!equivalents[0] || equivalents[0].includes("E")) {
					for (var j = equivCol; j > 0; j--) {
						if (document.getElementById("dropbox_" + equivRow + "_" + j).innerHTML[0] != "<") {
							var beforeStr = getInnerHTML(document.getElementById("dropbox_" + equivRow + "_" + j)).split(",")[0];
							for (var k = 0; k < maxIdx; k++) {
								if (getInnerHTML(document.getElementById("dropbox_" + rowIdx + "_" + k)).includes(beforeStr)) {
									minIdx = k + 1;
									break;
								}
								k++;
							}
							break;
						}
						j--;
					}
					for (var j = equivCol; j < document.getElementById("tablerow_" + equivRow).cells.length; j++) {
						if (document.getElementById("dropbox_" + equivRow + "_" + j).innerHTML[0] != "<") {
							var afterStr = getInnerHTML(document.getElementById("dropbox_" + equivRow + "_" + j)).split(",")[0];
							for (var k = 0; k < maxIdx; k++) {
								if (getInnerHTML(document.getElementById("dropbox_" + rowIdx + "_" + k)).includes(afterStr)) {
									maxIdx = k - 1;
									break;
								}
								k++;
							}
							break;
						}
						j++;
					}
				} else {
					for (var j = 0; j < document.getElementById("tablerow_" + rowIdx).getElementsByTagName("td").length; j++) {
						var elements = getInnerHTML(document.getElementById("tablerow_" + rowIdx).getElementsByTagName("td")[j]).split(",");
						if (elements.includes(equivalents[0])) {
							minIdx = j;
							maxIdx = j;
						}
					}
				}
			}
		}

		if (colIdx < minIdx || colIdx > maxIdx) { // being dragged outside of its model's range
			return false;
		} else if (dragIdx != rowIdx) { // being dragged into a different intention
			return false;
		} else if (draggedButton.innerHTML[0] == getInnerHTML(container)[0]) { // being dragged into another timepoint of the same model
			return false;
		} else if (getInnerHTML(container).includes(',')) { // container is full
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Returns only the text inside of the box, separated by commas if more than one element
	 * Does not include button tags, if applicable
	 * 
	 * @return String of the text inside the box
	 */
	function getInnerHTML(td) {
		if (td.innerHTML[0] == "<") {
			var parts = td.innerHTML.split(/[><]/);
			var elements = "";
			for (var i = 0; i < parts.length; i++) {
				if (parts[i][0] == "A" | parts[i][0] == "B") {
					var toAdd = splitRelTimeName(parts[i]);
					for (var j = 0; j < toAdd.length; j++) {
						if (elements.length > 0) {
							elements = elements + ",";
						}
						elements = elements + toAdd[j];
					}
				}
			}
			return elements;
		} else {
			if (td.innerHTML.includes("<")) {
				var parts = td.innerHTML.split(/[><]/);
				var elements = "";
				for (var i = 0; i < parts.length; i++) {
					if (parts[i][0] == "A" | parts[i][0] == "B") {
						var toAdd = splitRelTimeName(parts[i]);
						for (var j = 0; j < toAdd.length; j++) {
							if (elements.length > 0) {
								elements = elements + ",";
							}
							elements = elements + toAdd[j];
						}
					}
				}
				return elements;
			} else {
				return td.innerHTML;
			}
		}
	}

	function splitRelTimeName(buttonText) {
		var model = buttonText.split("-")[0];
		var identifiers = buttonText.split("-").slice(1);
		for (var i = 0; i < identifiers.length; i++) {
			identifiers[i] = model + "-" + identifiers[i];
		}
		return identifiers;
	}

	/**
	 * Finds the height to be applied to the entire row, based on the maximum number of elements in any given column
	 * 
	 * @param HTMLElement of the row whose height is being found
	 * @return integer of the height of the tallest column
	 */
	function getLargestHeight(row) {
		for (var i = 0; i < row.getElementsByTagName("td").length; i++) {
			if (getInnerHTML(row.getElementsByTagName("td")[i]).split(",").length > 1) {
				return 45;
			}
		}
		return 25;
	}

	function dropOrigin(event) {
		var container = event.target;
		event.preventDefault();
		container.classList.remove('draggedover');
		console.log(container.classList[0]);
		if (container.classList[0] != ('popup_button_timing')) {
			container.appendChild(draggedButton);
		}

		var rowIdx = container.id.split("_")[1];
		var row = document.getElementById("tablerow_" + rowIdx);
		var height = getLargestHeight(row);
		// reset the ids of the tiles based on their new order
		for (var i = 0; i < row.getElementsByTagName("td").length; i++) {
			if (i%2 == 0) {
				row.getElementsByTagName("td")[i].setAttribute('id', 'dropbox_'+ rowIdx + '_' + i);
				row.getElementsByTagName("td")[i].setAttribute('class', 'dropbox');
				row.getElementsByTagName("td")[i].setAttribute('style', 'height: ' + height + "px");
			} else {
				row.getElementsByTagName("td")[i].setAttribute('id', 'between_'+ rowIdx + '_' + i);
				row.getElementsByTagName("td")[i].setAttribute('class', 'between');
				row.getElementsByTagName("td")[i].setAttribute('style', 'height: ' + height + "px");
			}

			if (getInnerHTML(row.getElementsByTagName("td")[i]).length == 0 && getInnerHTML(row.getElementsByTagName("td")[i+1]).length == 0) {
				row.deleteCell(i);
				i--;
			}

			if (i == 0 || i == row.getElementsByTagName("td").length - 1) {
				row.getElementsByTagName("td")[i].setAttribute('style', 'border:none');
			}
		}
	}

	function dragoverOrigin(event) {
		event.preventDefault();
		event.target.classList.add('draggedover');
	}

	function dragleaveOrigin(event) {
		event.preventDefault();
    	event.target.classList.remove('draggedover');	
	}