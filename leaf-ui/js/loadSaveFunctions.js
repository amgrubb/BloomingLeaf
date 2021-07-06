/**
 * Read and load a saved JSON file
 *
 */
// Simulator
loader = document.getElementById("loader");
reader = new FileReader();

// Whenever the input is changed, read the file.
loader.onchange = function() {
	reader.readAsText(loader.files.item(0));
	// Resets loader value so that the onchange event will still be triggered 
	// if the same file is cleared and then loaded again
	loader.value = "";
};

// When read is performed, if successful, load that file.
reader.onload = function() {

	// If JSON is not recognized as a BloomingLeaf model, just return
	if (!reader.result || mode != 'Modelling') {
		return;
	}
	//console.log(reader.result);
	var result = JSON.parse(reader.result);
	console.log(result);
	loadFromObject(result);
    var graphtext = JSON.stringify(graph.toJSON(), function(key, value) {
		if(key == 'models') {
			//console.log(value)
		  return value[0].attributes;
		} else if (key == '_byId'){
			return undefined
		} else{
			//console.log(key+ " " + value)
		  return value;
		}
	  });
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
	console.log("read graph")
	console.log(obj.cells)
	graph.fromJSON(obj);
	var cells = graph.getCells();
	console.log(cells[1])
	for (var i = 0; i < cells.length; i++) {
		cell = cells[i];
		if (cell.get('type') == "basic.Actor"){
			//console.log("A")
			createBBActor(cell)
		}else if (cell.get('type') == "basic.CellLink") {
			createBBLink(cell)
			//console.log("L")

		}else{
			var userEval = obj.cells[i].intention.attributes.userEvaluationList.models;
			//console.log(userEval)
			createBBElement(cell, userEval)
			//console.log("I")
		}
	}
	
}

/**
 * Returns an array of Constraint objects with information from 
 * arr
 *
 * @param {Array.<Object>} arr
 * @returns {Array.<Constraint>}
 */
/*
function getConstArr(arr) {
	var res = [];

	for (var i = 0; i < arr.length; i++) {
		var constraint = Object.assign(new Constraint, arr[i]);
		constraint.absoluteValue = arr[i].absoluteValue;
		res.push(constraint);
	}
	return res;
}

/**
 * Returns an array of Actor objects with information from 
 * arr
 *
 * @param {Array.<Object>} arr
 * @returns {Array.<Actor>}
 *//*
function getActorsArr(arr) {
    var res = [];
    var maxID = 0;
    
    for (var i = 0; i < arr.length; i++) {
        res.push(Object.assign(new Actor, arr[i]));
        maxID = Math.max(maxID, parseInt(arr[i].nodeID));
    }
    Actor.numOfCreatedInstances = maxID + 1;
    return res;
    
}

/**
 * Returns an array of Link objects with information from 
 * arr
 *
 * @param {Array.<Object>} arr
 * @returns {Array.<Link>}
 *//*
function getLinksArr(arr) {
	var res = [];
	var maxID = 0;

	for (var i = 0; i < arr.length; i++) {
		var link = new Link(arr[i].linkType, arr[i].linkSrcID, arr[i].absoluteValue);
		link.linkID = arr[i].linkID;
		link.postType = arr[i].postType;
		link.linkDestID = arr[i].linkDestID;
		maxID = Math.max(maxID, parseInt(arr[i].linkID));
		res.push(link);
	}
	Link.numOfCreatedInstances = maxID + 1;

	return res;
}

/**
 * Returns an array of Intention objects with information from 
 * arr
 *
 * @param {Array.<Object>} arr
 * @returns {Array.<Intention>}
 *//*
function getIntentionsArr(arr) {
    var res = [];
    var maxID = 0;

    for (var i = 0; i < arr.length; i++) {
    	var intention = new Intention(arr[i].nodeActorID, arr[i].nodeType, arr[i].nodeName);
    	intention.nodeID = arr[i].nodeID;
    	maxID = Math.max(maxID, parseInt(arr[i].nodeID));
    	intention.dynamicFunction = getEvolvingFunction(arr[i].dynamicFunction);
    	res.push(intention);
    }
    Intention.numOfCreatedInstances = maxID + 1;
    return res;
}

/**
 * Given an object containing information about an EvolvingFunction,
 * returns a corresponding EvolvingFunction object
 *
 * @param {Object} obj
 * @returns {EvolvingFunction}
 *//*
function getEvolvingFunction(obj) {
	var func = new EvolvingFunction(obj.intentionID);
	func.stringDynVis = obj.stringDynVis;
	func.functionSegList = getFuncSegList(obj.functionSegList);
	return func;
}

/**
 * Returns an array of FuncSegment or RepFuncSegment objects with 
 * information from arr
 *
 * @param {Array.<Object>} arr
 * @returns {Array.<FuncSegment|RepFuncSegment>}
 *//*
function getFuncSegList(arr) {
	var res = [];
	for (var i = 0; i < arr.length; i++) {
		
		if (arr[i].repNum) {
			// If this segment is a repeating segment
			var repFunc = new RepFuncSegment();
			repFunc.functionSegList = getFuncSegList(arr[i].functionSegList);
			repFunc.repNum = arr[i].repNum;
			repFunc.absTime = arr[i].absTime;
			res.push(repFunc);
		} else {
			// If this segment is not a repeating segment
			res.push(new FuncSegment(arr[i].funcType, arr[i].funcX, arr[i].funcStart, arr[i].funcStop));
		}
	}
	return res;
}

*/

function createBBActor(cell){
	var actor = cell.get('actor');
	var actorbbm = new ActorBBM({type: actor.type, actorName: actor.attributes.actorName});
	cell.set('actor', actorbbm)
}

function createBBLink(cell){
	var link = cell.get('link').attributes;
	var linkbbm = new LinkBBM({displayType: link.displayType, linkType: link.linkType, postType: link.postType, absTime: link.absTime, evolving: link.evolving});
	cell.set('link', linkbbm)
}

function createBBElement(cell, userEval){
	//console.log(cell)
	var intention = cell.get('intention');
	console.log(intention)
	var evol = intention.attributes.evolvingFunction;
	//console.log(evol)
	var intentionbbm = new IntentionBBM({nodeName: intention.nodeName, nodeType: intention.nodeType});
	//console.log(intention)
	var evolving = new EvolvingFunctionBBM({type: evol.type, functionSegList: evol.functionSegList, hasRepeat: evol.hasRepeat, repStart: evol.repStart, repStop: evol.repStop, repCount: evol.repCount, repAbsTime: evol.repAbsTime});
	//console.log(evolving)
	console.log(userEval)
	intentionbbm.get('userEvaluationList').push(new UserEvaluationBBM({assignedEvidencePair: userEval.assignedEvidencePair, absTime: userEval.absTime}))
	intentionbbm.set('evolvingFunction', evolving)

	cell.set('intention', intentionbbm)
	//console.log(cell)
}


/**
 * Returns an object that contains the current graph, model, and analysis request.
 * This return object is what the user would download when clicking the Save button
 * in the top menu bar.
 *
 * @returns {Object}
 */
function getModelJson() {
	var obj = graph.toJSON();
	//TODO: Make it so that the download takes the entire userevaluationlist instead of the last one
	obj = JSON.stringify(obj, function(key, value) {
		if(key == 'models') {
			//console.log(value)
		  return value[0].attributes;
		} else if (key == '_byId'){
			return undefined
		} else{
			//console.log(key+ " " + value)
		  return value;
		}
	  })
	return obj;
}

/**
 * Returns an object that contains the current graph, model, and analysis configurations
 * and REMOVES results from the analysisConfigurations map.
 * This return object is what the user would download when clicking the Save button
 * in the top menu bar.
 *
 * @returns {Object}
 */
function getModelAnalysisJson() {
	var obj = {};
	// obj.analysis = true;
	obj.graph = graph.toJSON();
	//obj.model = model;
	// Remove analysis results then convert to array tuple for JSON.stringify() functionality
	obj.analysisMap = Object.fromEntries(removeAnalysisResults(analysisMap));

	return obj;
}

/**
 * Returns an object that contains the current graph, model and analysis configurations.
 * This return object is what the user would download when clicking the Save button
 * in the top menu bar.
 *
 * @returns {Object}
 */
function getFullJson() {
	var obj = {};
	obj.graph = graph.toJSON();
	console.log(graph.toJSON());
	//obj.model = model;
	// Convert to array tuple for JSON.stringify() functionality
	// obj.analysisMap = Array.from(analysisMap.entries());
	obj.analysisMap = Object.fromEntries(analysisMap);

	return obj;
}

/**
 * Helper function to return a copy of the analysisMap with no
 * analysisResults in each analysisConfig
 */
function removeAnalysisResults(analysisMap) {
	// Deep copy the map: stringify, then parse to new Map
	let tempJSON = JSON.stringify(Object.fromEntries(analysisMap));
	var analysisMapNoResults = new Map(Object.entries(JSON.parse(tempJSON)));
	
	// for each AnalysisConfiguration obj
	for(let config of analysisMapNoResults.values()) {
		// put empty array into the analysisResults field
		config.deleteResults();
	}

	return analysisMapNoResults;
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
if (document.cookie && document.cookie.indexOf('all=') !== -1){

	var obj = JSON.parse(document.cookie.substr(4));

	try {
		loadFromObject(obj);
	} catch (e) {
		// This should never happen, but just in case
		alert('Previously stored cookies contains invalid JSON data. Please clear your cookies.');
	}
}
