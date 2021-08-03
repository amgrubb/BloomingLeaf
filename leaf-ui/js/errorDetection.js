/**
 * This file contains functions related to the syntax checking and 
 * cycle detection for the web
 * 
 * June 2021 - Temporary turned off during the backbone migration.
 */

//TODO: Add the code back into the analysis button click function.
//  $('#analysis-btn').on('click', function() {
// 	syntaxCheck();
//     var cycleList = cycleSearch();
//     cycleResponse(cycleList); //If there are cycles, then display error message. Otherwise, remove any "red" elements.
//     if(!isACycle(cycleList)) {
//         clearCycleHighlighting();
//         switchToAnalysisMode();
//     } 
// });

 /**
  * Changes all intentions to their original colors
  * Note: if this is ever merged with the color-visualization branch, EVO will need to be refreshed here
  */
function clearCycleHighlighting() {
	var elements = graph.getElements();
	var cellView;

	//remove all previous coloring
	for (var i = 0; i < elements.length; i++) {
		cellView  = elements[i].findView(paper);
		cellView.model.changeToOriginalColour();
	}
	IntentionColoring.setColorMode("EVO");
}

/**
 * Alert the user if there are any cycles and mark the elements in the cycle with obnoxious neon colors
 * Remove any previous cycle highlighting
 *
 * @param {Array of Array<String>} cycleList: list of cycles in current model
 */
function cycleResponse(cycleList) {

	//remove all previous coloring, deactivate EVO
	clearCycleHighlighting();

	if(isACycle(cycleList)) {
		IntentionColoring.setColorMode("cycle");
		swal("Cycle in the graph", "", "error");
		var color_list = initColorList();
		var cycleIndex = 0; 
		for (var k = 0 ; k < cycleList.length; k++){ //for each cycle
			cycleIndex = k % 5;
			var color = color_list[cycleIndex];
			for (var l = 0 ; l< cycleList[k].length; l++){ //for each element inside of a particular cycle
				var cycleNode = getElementById(cycleList[k][l]);
				cellView  = cycleNode.findView(paper);
				cellView.model.attr({'.outer': {'fill': color}});
			}
	}
	}
}

/**
 * Initializes cycle coloring list
 * @returns {array} color_list: list of cycle colors
 */
function initColorList() {
	var color_list = [];
	
	color_list.push('#ccff00'); //yellow-green
	color_list.push('#09fbd3'); //green blue 
	color_list.push('#ff00c0'); //pink
	color_list.push('#00ff00'); //green 
	color_list.push('#fffd5a'); //yellow 

	return color_list;
}

/**
 * Initializes and returns a 'DestSourceMapper' object which contains
 * information about links by indicating the source nodes to destination nodes
 *
 * @param {Array of joint.dia.Link} jointLinks
 * @param {Array of InputLink} inputlinks
 * @returns {Object}
 *
 * Example object:
 *
 * {linkDestID : {source: [],
 *		          constraint: [],
 *		          linkView: []
 *				 }
 * }
 *
 * linkDestID: id of a destination node for links
 * source: id of the source of the link
 * contraint: contraint types
 * linkView: linkView of the link
 * 
 * Interpretation:
 * If dest = 0, source[i] = 1, constraint[i] = AND,
 * this means that the i'th link is an AND constraint
 * link from node 1 to node 0
 * 
 */
function initializeDestSourceMapper(jointLinks, inputlinks) {
    let destSourceMapper = {};
    let linkView;
    let constraint;
    for(var j = 0; j < inputlinks.length; j++) {
        linkView  = jointLinks[j].findView(paper);

        if(!(inputlinks[j].linkDestID in destSourceMapper)) {
            // Create empty object and arrays
            destSourceMapper[inputlinks[j].linkDestID] = {};
            destSourceMapper[inputlinks[j].linkDestID]["source"] = [];
            destSourceMapper[inputlinks[j].linkDestID]["constraint"] = [];
            destSourceMapper[inputlinks[j].linkDestID]["findview"] = [];
        }

        if (inputlinks[j].postType != null) {
            constraint = inputlinks[j].linkType+"|"+inputlinks[j].postType;
        }else {
            constraint = inputlinks[j].linkType;
        }
        destSourceMapper[inputlinks[j].linkDestID]["source"].push(inputlinks[j].linkSrcID);
        destSourceMapper[inputlinks[j].linkDestID]["constraint"].push(constraint);
        destSourceMapper[inputlinks[j].linkDestID]["findview"].push(linkView);
    }
    return destSourceMapper;
}

/**
 * Returns a syntax error message.
 *
 * Prerequisite: There are links from each node with ids in sourceList
 * to the node with id destId, and there exists a syntax error for these links. 
 *
 * @param {Array of Object} naryRelationships
 *   array containing the objects that represent
 *   source nodes that participate in an n-ary relationship
 * @param {String} destId
 *   destination id
 * @returns {String}
 */
function generateSyntaxMessage(naryRelationships, destId){

	let sourceNodeText = '';
	let suggestionText = 'Have all n-ary links from ';
	var constraintsText = '';
	var constraintArr = [];

	// Determine which n-ary relationships are present
	for (var i = 0; i < naryRelationships.length; i++) {
		if (!constraintArr.includes(naryRelationships[i].constraint)) {
			constraintArr.push(naryRelationships[i].constraint);
		}
	}

	// Create a string for the n-ary relationships
	for (var i = 0; i < constraintArr.length - 1; i++) {
		constraintsText += constraintArr[i] + ' or ';
	}
	constraintsText += constraintArr[constraintArr.length - 1];

	// Create a string for the source nodes
    for (var i = 0; i < naryRelationships.length - 1; i++) {
    	sourceNodeText += getNodeName(naryRelationships[i].source);
    	if (i != naryRelationships.length -2) {
    		sourceNodeText += ', ';
    	} else {
    		sourceNodeText += ' ';
    	}
    }

    sourceNodeText += 'and ' + getNodeName(naryRelationships[naryRelationships.length - 1].source);
    suggestionText += sourceNodeText + ' to ' + getNodeName(destId) + ' as ' + constraintsText + '.';

    // As an example, suggestionText should now look something like:
    // "Have all n-ary links from Task_1, Task_2 and Task_3 to Goal_0 as AND or NO RELATIONSHIP or OR.""
    var s = '<p style="text-align:left"><b style="color:black"> Source nodes: </b>' + sourceNodeText + '<br>' +
    	'<b style="color:black"> Destination node: </b>' + getNodeName(destId) + 
    	'<br><b style="color:black"> Suggestion: </b>' + suggestionText + '<br></p>';

    return s;
}

/**
 * Returns the node name for the given element id
 *
 * @param {String} id
 * @Returns {String}
 */
function getNodeName(id){
    var listNodes = graph.getElements();
    for(var i = 0; i < listNodes.length; i++){
        var cellView  = listNodes[i].findView(paper);
        if(id == cellView.model.attributes.elementid){
            var nodeName = cellView.model.attr(".name");
            return nodeName.text;
        }
    }
}

/**
 * Returns true iff any two n-ary constraints in 
 * naryRelationships are different
 *
 * @param {Object} naryRelationships
 *   an array containing the objects that represent
 *   source nodes that participate in an n-ary relationship,
 *   (ie, AND, OR, NO RELATIONSHIP)
 * @returns {boolean} 
 */
function syntaxErrorExists(naryRelationships) {

	if (naryRelationships.length < 2) {
		return false;
	}
	for (var i = 1; i < naryRelationships.length; i++) {
		if (naryRelationships[0].constraint != naryRelationships[i].constraint) {
			return true;
		}
	}

	return false;
}

/**
 * Return an array containing the objects that represent
 * source nodes that participate in an n-ary relationship,
 * (ie, AND, OR, NO RELATIONSHIP), with the node with id destId
 *
 * Example return object:
 * [
 *     {source: 1, constraint: 'AND', findview: Object},
 *     {source: 2, constraint: 'OR', findview: Object}
 * ]
 *
 * @param {Object} destSourceMapper
 * @param {String} destId
 * @returns {Array of Object}
 */
function getNaryRelationships(destSourceMapper, destId) {
	var result = [];

	var constraints = destSourceMapper[destId].constraint;
	for (var i = 0; i < constraints.length; i++) {
		if (constraints[i] == 'AND' || 
			constraints[i] == 'OR' || 
			constraints[i] == 'NO RELATIONSHIP') {
			var obj = {
				source: destSourceMapper[destId].source[i],
				constraint: constraints[i],
				findview: destSourceMapper[destId].findview[i]
			};
			result.push(obj);
		}
	}

	return result;
}

/**
 * Changes the colour and stroke-width of all linkViews in 
 * linkViewArray
 *
 * @param {Array of joint.dia.LinkView} linkViewArray
 * @param {String} colour
 * @param {Number} strokeWidth
 */
function changeLinkColour(linkViewArray, colour, strokeWidth) {
	for (var i = 0; i < linkViewArray.length; i++) {
		linkViewArray[i].model.attr({'.connection': {'stroke': colour}});
        linkViewArray[i].model.attr({'.marker-target': {'stroke': colour}});
        linkViewArray[i].model.attr({'.connection': {'stroke-width': strokeWidth}});
        linkViewArray[i].model.attr({'.marker-target': {'stroke-width': strokeWidth}});
	}
}

/**
 * Displays error popup with title and message
 *
 * @param {String} title
 * @param {String} message
 */
function alertSyntaxError(title, message) {
	swal({
        	title: title,
            type: "warning",
            html: message,
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: "Ok",
            cancelButtonText: "Go back to Model View",
            cancelButtonClass: "backModel"
        }).then(function() {

        }, function(dismiss) {
            if (dismiss === 'cancel') {
                $("#modeling-btn").trigger("click");
            }
    });
}

/**
 * This class contains information about a link
 */
//  class InputLink {
// 	constructor(linkType, linkSrcID, linkDestID, postType = null, absVal = -1) {
// 		this.linkType = linkType;
// 		this.linkSrcID = linkSrcID;
// 		this.linkDestID = linkDestID;
// 		this.postType = postType;
// 		this.absoluteValue = absVal;
// 	}
// }

/**
 * Returns an array containing InputIntentions representing all 
 * intentions currently on the graph
 *
 * @returns {Array.<InputIntention>}
 */
//  function getIntentitonalElements() {
	
// 	var intentions = [];
// 	var intentionsCount = 0;
// 	for (var i = 0; i < this.graph.getElements().length; i++){		
// 		if (!(this.graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
			
// 			/**
// 			 * NODE ACTOR ID
// 			 */
// 			var actorid = '-';
// 			if (this.graph.getElements()[i].get("parent")){
// 				actorid = (this.graph.getCell(this.graph.getElements()[i].get("parent")).prop("elementid") || "-");
// 			}
			
// 			/**
// 			 * NODE ID
// 			 */
// 			//Making that the elementId has 4 digits
// 			var elementID = intentionsCount.toString();
// 			while (elementID.length < 4){ 
// 				elementID = "0" + elementID;
// 				}
// 			//Adding the new id to the UI graph element
// 			this.graph.getElements()[i].prop("elementid", elementID);
			
			
// 			/**
// 			 * NODE TYPE
// 			 */
// 			var elementType;
// 			if (this.graph.getElements()[i] instanceof joint.shapes.basic.Goal)
// 				elementType = "G";
// 			else if (this.graph.getElements()[i] instanceof joint.shapes.basic.Task)
// 				elementType = "T";
// 			else if (this.graph.getElements()[i] instanceof joint.shapes.basic.Softgoal)
// 				elementType = "S";
// 			else if (this.graph.getElements()[i] instanceof joint.shapes.basic.Resource)
// 				elementType = "R";
// 			else
// 				elementType = "I";
			
// 		  	/**
// 		  	 * NODE NAME
// 		  	 */
// 		  	//Getting intentional element name
// 			var intentionalElementName = this.graph.getElements()[i].attr(".name/text").replace(/\n/g, " ");
			
// 			/**
// 			 * CREATING OBJECT
// 			 */
// 			var intentionalElement = new InputIntention(actorid, elementID, elementType, intentionalElementName);		  	
// 			intentions.push(intentionalElement);

// 			//iterating the counter
// 			intentionsCount++;
// 		}	  	
// 	}
// 	return intentions;
// }

/**
 * Returns an array of InputLinks, of all links in the graph
 *
 * @returns {Array.<InputLinks>}
 */
function getLinks(){

	var links = [];
	// getIntentitonalElements();

	//Verifying if links are valid
	graph.getLinks().forEach(function(link){
	    if(isLinkInvalid(link))
	    		link.remove();
    });

	for (var i = 0; i < graph.getLinks().length; i++){

		var current = graph.getLinks()[i];
		var linkType = current.label(0).attrs.text.text.toUpperCase()
		var source = "-";
		var target = "-";
		var absValue = 0;

		if (graph.getLinks()[i].attr('.assigned_time') != undefined) {
			absValue = parseInt(graph.getLinks()[i].attr('.assigned_time')[0]);
		}

		if (current.get("source").id) { 
			source = graph.getCell(current.get("source").id).prop("elementid");
		}
			
		if (current.get("target").id) { 
			target = graph.getCell(current.get("target").id).prop("elementid");
		}
			
		var link;
		// displayType: 'element',     // TODO: should this be changed to 'link'?
		// linkType: 'and',
		// postType: null,
		// absTime: myNull,
		// evolving: false,
		// vs 
		// linkType, linkSrcID, linkDestID, postType = null, absVal = -1
		//Remove constraints links
		if (!(linkType.indexOf("=") > -1 || linkType.indexOf("<") > -1)) {
			// Adding links
			if (linkType.indexOf("|") > -1) {
				var evolvRelationships = linkType.replace(/\s/g, '').split("|");
				console.log(evolvRelationships) 
				// link = new InputLink(linkType: evolvRelationships[0], source, target, postType: evolvRelationships[1], absValue);
				link = new LinkBBM({displayType: source, linkType: evolvRelationships[0], postType: evolvRelationships[1], absTime: absValue}); 
			} else if (linkType == "NBT" || linkType == "NBD") {
				// link = new InputLink(linkType, source, target, null, absValue);
				link = new LinkBBM({displayType: source, linkType: linkType, postType: null, absTime: absValue});
			} else {
				//link = new InputLink(linkType, source, target);
				link = new LinkBBM({displayType: source, linkType: linkType}); 
			}
			links.push(link);
		}

	}

	return links;
}
/**
 * Performs a syntax check on the current model, by checking if each destination
 * nodes with links, have valid constraints.
 * Returns true and displays an error popup iff a syntax error exists
 *
 * @returns {boolean}
 */
function syntaxCheck() {

    // Get all links in the form of an InputLink
    var inputLinks = getLinks();

    // Get all links in the form of a joint.dia.Link
    var jointLinks = graph.getLinks();

    // Create an object that represents the constraint links and its sources and destination
    let destSourceMapper = initializeDestSourceMapper(jointLinks, inputLinks);
    let errorText = '';

    for (var destId in destSourceMapper){

    	var naryRelationships = getNaryRelationships(destSourceMapper, destId);

        // If there is a syntax error.
        if (syntaxErrorExists(naryRelationships)){

            errorText += generateSyntaxMessage(naryRelationships, destId);

            var linkViews = [];
            for (var i = 0; i < naryRelationships.length; i++) {
            	linkViews.push(naryRelationships[i].findview);
            }

            changeLinkColour(linkViews, 'red', 3);

        } else {
        	changeLinkColour(destSourceMapper[destId]['findview'], 'black', 1);
        }
    }

    if (errorText) {
    	alertSyntaxError('We found invalid link combinations', errorText);
    	return true;
    }
    return false;
}

function getElementList() {
    var elementList = [];
    var intentionsCount = 0;

	var satValueDict = {
		"unknown": "0000",
		"satisfied": "0011",
		"partiallysatisfied": "0010",
		"partiallydenied": "0100",
		"denied": "1100",
		"none": "0000",
		"(no value)": "(no value)"
	};

    for(var i = 0; i < this.graph.getElements().length; i++) {
        // If the element is NOT an actor 
        if (!(this.graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
            var element= {};
            var currentValue = (this.graph.getElements()[i].attr(".satvalue/value")||"none");
			console.log(currentValue); 
            // Making currentValue to numeric values like 0000, 0001, 0011...
            if(!$.isNumeric(currentValue)) { 
				currentValue = satValueDict[currentValue];
			}

            // Making sure that the elementId has 4 digits
            var elementID = intentionsCount.toString();
            while (elementID.length < 4){
                elementID = "0" + elementID;
            }

            // Adding the new id to the UI graph element
            this.graph.getElements()[i].prop("elementid", elementID);

            element.id = elementID;
            element.status = [];
            element.status.push(currentValue);

            intentionsCount++;

			// Add element to list 
            elementList.push(element);
        }
    }
    return elementList;
}

/**
 * Check is a cycle exists
 * @param {Array of Array<String>} cycleList 
 * @returns true if at least one cycle is present, false otherwise
 */
function isACycle(cycleList) {
	return (cycleList != null);
}

/**
 * Uses Depth First Search to find cycles in the graph.
 * @returns {Array of Array<String>} cycleList if at least one cycle exists in the model
 * @returns {null} otherwise
 */
function cycleSearch() {
	var links = getLinks();
	var vertices = getElementList();
	var isCycle = false;

	//initialize linkMap, a 2D array. 1st index = src nodeID. Subarray at index = dest nodes corresponding to the src
	var linkMap = initiateLinkGraph(vertices, links)
	//search for cycles
	var cycleList = traverseGraphForCycles(linkMap); 

	if(cycleList.length > 0) {
		return cycleList;
	}
	return null; //no cycles are present in model
}

/**
 * Creates an array representation of the graph.  
 * @param {Array.<Object>} vertices list of elements in the graph
 * @param {Array.<Object>} links list of links in the graph
 * @returns {Array of Array<String>} linkMap, a double array where the first index corresponds to an element/src ID, and the corresponding child array contains each dest ID associated with it
 */
function initiateLinkGraph(vertices, links) {
	var linkMap = [];

	//initiate a subarray for each index of linkMap that corresponds to an element ID
	vertices.forEach(function(element){
		var src = element.id;
		linkMap[src] = [];
	 });

	//push each link's dest ID onto the index of linkMap that corresponds to the src ID
	links.forEach(function(element){
		var src = element.linkSrcID;
		linkMap[src].push(element.linkDestID);
	});

	return linkMap;
}

/**
 * Finds cycles in the model via depth first search
 * Note: when two cycles share two or more nodes with each other, it only returns one of the cycles
 * @param {Array of Array<String>} linkMap 
 * @returns {Array of Array<String>} cycleList
 */
function traverseGraphForCycles(linkMap) {
	var vertices = getElementList();
	var notVisited = [];
	var cycleList = [];

	vertices.forEach(function(element){ //create list of nodes to track which have not yet been visited
		notVisited.push(element.id);
	 });

	while (notVisited.length > 0) { //while all nodes haven't yet been visited
	var start = (notVisited.splice(0,1)).pop();
	var walkList = [];
	traverseGraphRecursive(linkMap, start, walkList, notVisited, cycleList); //search for cycles
	}
	return cycleList;
}

/**
 * Helper function for traverseGraphForCycles
 * @param {Array of Array<String>} linkMap List of dest nodes associated with each src node
 * @param {String} currNode Current node of the function call
 * @param {Array.<String>} walkList List of nodes in current walk
 * @param {Array.<String>} notVisited List of nodes that have not yet be visited, only used to determine start node for a new walk and to know when we're done traversing the graph
 * @param {Array of Array<String>} cycleList Double array that represents the cycles found in a graph. First index = separate cycle, child array = nodes in cycle
 */
function traverseGraphRecursive(linkMap, currNode, walkList, notVisited, cycleList) {

	if(walkList.includes(currNode)) {
		//found a cycle
		var cycle = [];
		var prev = currNode;
		//the cycle is the part of the list from first instance of repeat node to now
		for(var i = walkList.indexOf(currNode); i < walkList.length; ++i) {
			cycle.push(walkList[i]);
			var remove = linkMap[prev].indexOf(walkList[i]); //get rid of cycle link from prev to curr node so graph traversal doesn't get stuck. problem: when multiple cycles share nodes, this inhibits others from being found. Should we just start a new walk?
			linkMap[prev].splice(remove, 1);
			prev = walkList[i];
		}
		cycleList.push(cycle);
	}
	
	//push current node to walk list
	walkList.push(currNode);

	//remove curr from notVisited list
	if(notVisited.includes(currNode)) {
		notVisited.splice(notVisited.indexOf(currNode), 1);
	}

	//if we have unvisited dest nodes, go there
	if(linkMap[currNode].length > 0) {
		for(var i = 0; i < linkMap[currNode].length; ++i) {
		var next = linkMap[currNode][i]; //set next to a dest node that has currNode as its src
		traverseGraphRecursive(linkMap, next, walkList, notVisited, cycleList); 
		}
	}
	walkList.pop(); //done with function call, so take a "step back" in the graph
}