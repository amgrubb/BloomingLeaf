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

	if (reader.result) {
		if (mode == "Modelling") {
			var obj = JSON.parse(reader.result);
 			var cells = obj.cells;
 			// Actors
			for (var i = 0; i < cells.length; i++) {
				if (cells[i].type == 'basic.Actor') {
					var actorName = cells[i].attrs['.name'].text;
					var newActor = new Actor(actorName);
					cells[i]["nodeID"]  = newActor.nodeID;
					model.actors.push(newActor);
				}
                if (cells[i].type == 'link') {
					var Type = cells[i]["link-type"].toUpperCase();
					var linkType = Type.replace(/\s/g, '').split("|")[0];
					var evolvRelationships = Type.replace(/\s/g, '').split("|")[1];
					
					var absolute = cells[i].attrs[".assigned_time"];
					if (!absolute){
						absoluteValue = 0;
					}
					else{
						absoluteValue = abosulte["0"];
					}

					var sourceID = cells[i].source.id;
					var targetID = cells[i].target.id;
					
					var source = getNodeID(sourceID, cells);
					var target = getNodeID(targetID, cells);
					
					// add absoluteValue and postType
				    var newLink = new Link(linkType,source,absoluteValue);
					newLink.linkDestID = target;
					newLink.postType = evolvRelationships;
			
					// add linkID
					cells[i]["linkID"]  = newLink.linkID;
					model.links.push(newLink);
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
			        var initSat = cells[i].attrs['.satvalue'];
			        initSat = initSat.text !== ' ' ?  satValueDict[initSat.value] : '0000';
				    var intentionEval = new UserEvaluation(intention.nodeID, '0', initSat);
				    analysisRequest.userAssignmentsList.push(intentionEval);
			    
			        // make the T upside down
			        var satValText = cells[i].attrs['.satvalue'].text;
			        satValText = satValText.replace(/T/g, '⊥');
			        cells[i].attrs['.satvalue'].text = satValText;
			    
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
			        			model.setAbsConstBySrcID(intention.nodeID, curr, parseInt(assignedTimes[key]));
			        			curr = String.fromCharCode(curr.charCodeAt(0) + 1);
			        		});
			        	}
				    }
			        model.intentions.push(intention);
			    } 

		
	
			}

			
			graph.fromJSON(obj);
			

		}
	}
}

function getActorID(parentID, cells) {
	for (var i = 0; i < cells.length; i++) {
		if (cells[i].id === parentID) {
			return cells[i].nodeID;
		}
	}

	return '-';
}

function getNodeID(nodeID, cells) {
    for (var i = 0; i < cells.length; i++) {
        if (cells[i].id == nodeID) {
            return cells[i].nodeID;
        }
    }

    return "-";
}


/**
 * Helper function to download saved graph in JSON format
 *
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

function isIntention(cell) {
  return cell.type == 'basic.Goal' ||
         cell.type == 'basic.Task' ||
         cell.type == 'basic.Softgoal' ||
         cell.type == 'basic.Resource';
}