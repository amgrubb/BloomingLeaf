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
};

// When read is performed, if successful, load that file.
reader.onload = function() {

	// If JSON is not recognized as a BloomingLeaf model, just return
	if (!reader.result || mode != 'Modelling') {
		return;
	}

	var result = JSON.parse(reader.result);

	// If JSON is from the old version of BloomingLeaf
	if (!result.graph) {
		model = new Model();
		analysisRequest = new AnalysisRequest();

		var cells = result.cells;

		// Actors
		for (var i = 0; i < cells.length; i++) {
			if (cells[i].type == 'basic.Actor') {
				var actorName = cells[i].attrs['.name'].text;
				var newActor = new Actor(actorName);
				cells[i]["nodeID"]  = newActor.nodeID;
				model.actors.push(newActor);
			}
           
				
		}

		// Intention
		for (var i = 0; i < cells.length; i++) {
		    if (isIntention(cells[i])) {
		        var cellName = cells[i].attrs['.name'].text;
		        var cellType = cells[i].type;
		        var actorID = getActorID(cells[i].parent, cells);
		        // create new intention here
		    	var intention = new Intention(actorID, cellType, cellName);
		    	cells[i]["nodeID"]  = intention.nodeID;

		    	if (actorID !== '-') {
		    		model.getActorByID(actorID).intentionIDs.push(intention.nodeID);
		    	} 

		        // create intention evaluation
		        var initSat = cells[i].attrs['.satvalue'].text;
		        initSat = (initSat !== ' ' && initSat !== '')  ?  oldSatValToBinary[initSat] : '0000';
			    var intentionEval = new UserEvaluation(intention.nodeID, '0', initSat);
			    analysisRequest.userAssignmentsList.push(intentionEval);
		    
		        // make the T upside down
		        var satValText = cells[i].attrs['.satvalue'].text;
		        cells[i].attrs['.satvalue'].text = updateSatValueTextToNew(satValText);
		    
		        // create the evolving function
		        if (cells[i].attrs['.funcvalue'] != null) {

			        var stringDynVis = cells[i].attrs['.funcvalue'].text;
			    
			        if (stringDynVis == 'UD') {
			            var funcSegArr = [];
			            var funcVisArr = cells[i].attrs['.constraints'].function;
			            var markedValArr = cells[i].attrs['.constraints'].lastval; // denied, satisfied
			            var beginLetterArr = cells[i].attrs['.constraints'].beginLetter;
			            var endLetterArr = cells[i].attrs['.constraints'].endLetter;
			            
			            for (var j = 0; j < funcVisArr.length; j++) {
			                funcSegArr.push(new FuncSegment(funcVisArr[j], satValueDict[markedValArr[j]], beginLetterArr[j], endLetterArr[j]));

			                // Add empty absolute constraints
			                if (j != 0) {
			                	model.constraints.push(new Constraint('A', intention.nodeID, beginLetterArr[j], null, null));
			                }
			            }

			            intention.dynamicFunction.stringDynVis = stringDynVis;
			        	intention.dynamicFunction.functionSegList = funcSegArr;


			        	// If there is a repeat
			        	var beginRepeat = cells[i].attrs['.constraints'].beginRepeat;
			        	var endRepeat = cells[i].attrs['.constraints'].endRepeat; 
			        	if (beginRepeat && endRepeat) {
			        		var repeatCount = cells[i].attrs['.constraints'].repeatCount;
			        		var absoluteLen = cells[i].attrs['.constraints'].absoluteLen;

			        		// If repeatCount is null, set to 2 for default
			        		repeatCount = repeatCount ? repeatCount : 2;

			        		intention.dynamicFunction.setRepeatingFunction(beginRepeat, endRepeat);
			        		intention.dynamicFunction.setRepNum(repeatCount);
			        		intention.dynamicFunction.setAbsoluteTime(absoluteLen);
			        	}

			        } else {
			        	// Non user defined functions
			        	intention.dynamicFunction.stringDynVis = stringDynVis;
			        	var markedVal = satValueDict[cells[i].attrs['.constraints'].lastval];

			        	if (stringDynVis == 'C' || stringDynVis == 'R') {
			        		
			        		intention.dynamicFunction.functionSegList = [new FuncSegment(stringDynVis, initSat, '0', 'Infinity')];
			        	} else if (stringDynVis == 'I' || stringDynVis == 'D') {
			        		
			        		intention.dynamicFunction.functionSegList = [new FuncSegment(stringDynVis, markedVal, '0', 'Infinity')];
			        	} else if (stringDynVis == 'RC') {
			        		model.constraints.push(new Constraint('A', intention.nodeID, beginLetterArr[j], null, null));
			        		intention.dynamicFunction.functionSegList = [
			        			new FuncSegment('R', initSat, '0', 'A'),
			        			new FuncSegment('C', markedVal, 'A', 'Infinity')
			        		];
			        	} else if (stringDynVis == 'CR') {
			        		model.constraints.push(new Constraint('A', intention.nodeID, 'A', null, null));
			        		intention.dynamicFunction.functionSegList = [
			        			new FuncSegment('C', initSat, '0', 'A'),
			        			new FuncSegment('R', '0000', 'A', 'Infinity')
			        		];
			        	} else if (stringDynVis == 'MP') {
			        		model.constraints.push(new Constraint('A', intention.nodeID, 'A', null, null));
			        		intention.dynamicFunction.functionSegList = [
			        			new FuncSegment('I', markedVal, '0', 'A'),
			        			new FuncSegment('C', markedVal, 'A', 'Infinity')
			        		];
			        	} else if (stringDynVis == 'MN') {
			        		model.constraints.push(new Constraint('A', intention.nodeID, 'A', null, null));
			        		intention.dynamicFunction.functionSegList = [
			        			new FuncSegment('D', markedVal, '0', 'A'),
			        			new FuncSegment('C', markedVal, 'A', 'Infinity')
			        		];
			        	} else if (stringDynVis == 'SD') {
			        		model.constraints.push(new Constraint('A', intention.nodeID, 'A', null, null));
			        		intention.dynamicFunction.functionSegList = [
			        			new FuncSegment('C', '0011', '0', 'A'),
			        			new FuncSegment('C', '1100', 'A', 'Infinity')
			        		];
			        	} else {
			        		model.constraints.push(new Constraint('A', intention.nodeID, 'A', null, null));
			        		intention.dynamicFunction.functionSegList = [
			        			new FuncSegment('C', '1100', '0', 'A'),
			        			new FuncSegment('C', '0011', 'A', 'Infinity')
			        		];
			        	}
			        }

			        // Assign absolute constraint's absolute values
		        	var assignedTimes = cells[i].attrs['.assigned_time'];
		        	if (assignedTimes) {
		        		var curr = 'A';

		        		Object.keys(assignedTimes).forEach(function(key) {
		              	if (assignedTimes[key]) {
			        			model.setAbsConstBySrcID(intention.nodeID, curr, parseInt(assignedTimes[key]));
			        			curr = String.fromCharCode(curr.charCodeAt(0) + 1);
		        			}
		        		});
		        	}
			    }
		        model.intentions.push(intention);
		    } 
		}

		// Links
		for (var i = 0; i < cells.length; i++) {
			 if (cells[i].type == 'link') {
				var type = cells[i].labels[0].attrs.text.text.toUpperCase();


				if (type.indexOf('|') > -1) {
					// If this is an evolving link
					var linkType = type.split('|')[0].trim();
					var postType = type.split('|')[1].trim();
				} else {
					var linkType = type.trim();
					var postType = null;
                }
                var absolute = cells[i].attrs[".assigned_time"];
                if (!absolute) {
                    absoluteValue = -1;
                } else {
                    absoluteValue = absolute["0"];
                    if (!absoluteValue) {
                        absoluteValue = -1;
                    } else {
                        absoluteValue = parseInt(absoluteValue);
                    }
                }

				var sourceID = cells[i].source.id;
				var targetID = cells[i].target.id;
								
				// add absoluteValue and postType
			    var newLink = new Link(linkType, getNodeID(sourceID, cells), absoluteValue);
				newLink.linkDestID = getNodeID(targetID, cells);
				newLink.postType = postType;
		
				// add linkID
				cells[i]["linkID"]  = newLink.linkID;
				model.links.push(newLink);
			}
		}
		
		graph.fromJSON(result);
	} else {
		// If the JSON is from the current version of BloomingLeaf
		loadFromObject(result);
	}
    var graphtext = JSON.stringify(graph.toJSON());
    document.cookie = "graph=" + graphtext;
}

/**
 * Returns the new representation of satisfaction values
 *
 * Examples:
 * (old -> new)
 * '' -> (⊥, ⊥)
 * (T, FD) -> (⊥, F)
 * (PS, T) -> (P, ⊥)
 *
 * @param {String} oldText
 *   old representation 
 */
function updateSatValueTextToNew(oldText) {

	// If empty, return string representation for none
	if (oldText == '' || oldText == ' ') {
		return '(⊥, ⊥)'
	}
	
	// Replace all T's with ⊥'s
	oldText = oldText.replace(/T/g, '⊥');

	// Remove all S's and D's
	oldText = oldText.replace(/S|D/g, '');
	return oldText;
}

/**
 * Given an object obj containing a model, graph and analysisRequest, 
 * updates the global variables: model, graph and analysisRequest
 * to the objects from obj
 *
 * @param {Object} obj
 */
function loadFromObject(obj) {
	model = new Model();
	model.actors = getActorsArr(obj.model.actors);
	model.intentions = getIntentionsArr(obj.model.intentions);
	model.links = getLinksArr(obj.model.links);
	model.constraints = getConstArr(obj.model.constraints);
	model.maxAbsTime = obj.model.maxAbsTime;

	analysisRequest = Object.assign(new AnalysisRequest, obj.analysisRequest);
	graph.fromJSON(obj.graph);
}

/**
 * Returns an array of Constraint objects with information from 
 * arr
 *
 * @param {Array.<Object>} arr
 * @returns {Array.<Constraint>}
 */
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
 */
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
 */
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
 */
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
 */
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
 */
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


/**
 * Returns an Actor nodeID for the Actor with Rappid ID rapID
 * Returns '-' if does not exist 
 *
 * @param {String} rapID
 *   This is a Rappid ID, which is 36 characters long
 * @returns {String}
 *   An actor nodeID of length 4, or '-' if does not exist
 */
function getActorID(rapID, cells) {
	for (var i = 0; i < cells.length; i++) {
		if (cells[i].id === rapID) {
			return cells[i].nodeID;
		}
	}

	return '-';
}

/**
 * Returns a nodeID for the Intention with Rappid ID rapID
 * Returns '-' if does not exist 
 *
 * @param {String} rapID
 *   This is a Rappid ID, which is 36 characters long
 * @returns {String}
 *   A nodeID of length 4, or '-' if does not exist
 */
function getNodeID(rapID, cells) {
    for (var i = 0; i < cells.length; i++) {
        if (cells[i].id == rapID) {
            return cells[i].nodeID;
        }
    }

    return "-";
}

/**
 * Returns an object that contains the current graph, model and analysisRequest.
 * This return object is what the user would download when clicking the Save button
 * in the top menu bar.
 *
 * @returns {Object}
 */
function getFullJson() {
	var obj = {};
	obj.graph = graph.toJSON();
	obj.model = model;
	obj.analysisRequest = analysisRequest;
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
 * Returns true iff cell represents an intention
 */
function isIntention(cell) {
  return cell.type == 'basic.Goal' ||
         cell.type == 'basic.Task' ||
         cell.type == 'basic.Softgoal' ||
         cell.type == 'basic.Resource';
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
