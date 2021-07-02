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
	console.log(reader.result);
	var result = JSON.parse(reader.result);
	loadFromObject(result);
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


	for (let cell of graph.getCells()) {
		if (cell.get('type') == "basic.Actor"){
			//console.log("A")
			createBBActor(cell)
		}else if (cell.get('type') == "Link") {
			createBBLink(cell)
			//console.log("L")

		}else{
			createBBElement(cell)
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
	console.log(cell);
	var actor = cell.get('actor');
	console.log(actor);
	//console.log(place)
	var actorbbm = new ActorBBM({type: actor.type, actorName: actor.attributes.actorName});
	//is cid important???
	//console.log(actorbbm)
	//var actor = new joint.shapes.basic.Actor({position: {x: obj.position.x, y: obj.position.y}, size: {height: obj.size.height, width: obj.size.width}})
	cell.set('actor', actorbbm)
	//console.log(place.cid)
	//actor.set('cid', place.cid)

	//console.log(obj.id)
	//actor.set('id', obj.id)

	//console.log(actor)

	
	

}

function createBBLink(obj){
	console.log(obj);
	var place = obj.link;
	console.log(place)
	var linkbbm = new LinkBBM({displayType: place.attributes.displayType, linkType: place.attributes.linkType, postType: place.attributes.postType, absTime: place.attributes.absTime, evolving: place.attributes.evolving});
	//is cid important???
	console.log(linkbbm)
	//var actor = joint.shapes.basic.Actor({actor: actorbbm})
	//console.log(actor)

}

function createBBElement(obj){
	console.log(obj);
	var place = obj.intention;
	console.log(place)
	var intentionbbm = new IntentionBBM({nodeName: place.attributes.nodeName, nodeType: place.attributes.nodeType, nodeActorID: place.attributes.nodeActorID, evolvingFunction: place.attributes.evolvingFunction, initialValue: place.attributes.initialValue});
	//is cid important???
	console.log(intentionbbm)
	//var actor = joint.shapes.basic.Actor({actor: actorbbm})
	//console.log(actor)

}


/**
 * Returns an object that contains the current graph, model, and analysis request.
 * This return object is what the user would download when clicking the Save button
 * in the top menu bar.
 *
 * @returns {Object}
 */
function getModelJson() {
	var obj = {};
	obj.graph = graph.toJSON();
	console.log(obj.graph);
	//obj.model = model;
	obj.analysisRequest = analysisRequest;
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
