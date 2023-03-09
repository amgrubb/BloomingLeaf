/**
 * Read and load a saved JSON file
 *
 */
// Simulator
loader = document.getElementById("loader");
reader = new FileReader();

// Whenever the input is changed, read the file.
loader.onchange = function () {
	reader.readAsText(loader.files.item(0));
	// Resets loader value so that the onchange event will still be triggered 
	// if the same file is cleared and then loaded again
	loader.value = "";
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