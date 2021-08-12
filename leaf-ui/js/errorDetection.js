/**
 * This file contains functions related to the syntax checking and 
 * cycle detection for the web
 * 
 * June 2021 - Temporary turned off during the backbone migration.
 */

// TODO: Find out if this line is necessary 
// const { connected } = require("process");


/**
 * Changes all intentions to their original colors
 * Note: if this is ever merged with the color-visualization branch, EVO will need to be refreshed here
 */
function clearCycleHighlighting() {
	var elements = graph.getElements();
	var cellView;
	// Remove all previous coloring
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
	// Remove all previous coloring, deactivate EVO
	clearCycleHighlighting();
	if (isACycle(cycleList)) {
		IntentionColoring.setColorMode("cycle");
		swal("Cycle in the graph", "", "error");
		var color_list = initColorList();
		var cycleIndex = 0; 
		// For each cycle
		for (var k = 0 ; k < cycleList.length; k++) { 
			cycleIndex = k % 5;
			var color = color_list[cycleIndex];
			// For each element inside of a particular cycle
			for (var l = 0 ; l < cycleList[k].length; l++) { 
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
 * @param {Array of InputLink} inputLinks
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
 * constraint: contraint types
 * linkView: linkView of the link
 * 
 * Interpretation:
 * If dest = 0, source[i] = 1, constraint[i] = AND,
 * this means that the i'th link is an AND constraint
 * link from node 1 to node 0
 * 
 */
function initializeDestSourceMapper(links) {

    let destSourceMapper = {};
    let linkView;
    let constraint;

    for (var j = 0; j < links.length; j++) {
        linkView  = links[j].findView(paper);
		if(!(links[j].getTargetElement().prop('id') in destSourceMapper)) {
            // Create empty object and arrays
            destSourceMapper[links[j].getTargetElement().prop('id')] = {};
            destSourceMapper[links[j].getTargetElement().prop('id')]["source"] = [];
            destSourceMapper[links[j].getTargetElement().prop('id')]["constraint"] = [];
            destSourceMapper[links[j].getTargetElement().prop('id')]["findview"] = [];
        }
		if (links[j].attributes.link.attributes.postType != null) {
			constraint = links[j].attributes.link.attributes.linkType + "|" + 
			links[j].attributes.link.attributes.postType; 
        } else {
			constraint = links[j].attributes.link.attributes.linkType; 
        }
		destSourceMapper[links[j].getTargetElement().prop('id')]["source"].push(links[j].getSourceElement().prop('id'));
        destSourceMapper[links[j].getTargetElement().prop('id')]["constraint"].push(constraint);
        destSourceMapper[links[j].getTargetElement().prop('id')]["findview"].push(linkView);
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
    // "Have all n-ary links from Task_1, Task_2 and Task_3 to Goal_0 as 'and' or 'no' or 'or'.""
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
    for (var i = 0; i < listNodes.length; i++) {
        var cellView  = listNodes[i].findView(paper);
		if (id == cellView.model.attributes.id) {
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
		if (constraints[i] == 'and' || constraints[i] == 'or' || constraints[i] == 'no') { 
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
 * Returns true iff the link has a source and a target node
 *
 * @param {joint.dia.Link} link
 * @param {Boolean}
 */
 function isLinkInvalid(link){
	return (!link.prop('source/id') || !link.prop('target/id'));
}

/**
 * Performs a syntax check on the current model, by checking if each destination
 * nodes with links, have valid constraints.
 * Returns true and displays an error popup iff a syntax error exists
 *
 * @returns {boolean}
 */
function syntaxCheck() {

    // Get all links in the form a basic.CellLink
    var links = graph.getLinks();

    // Create an object that represents the constraint links & its source and destinations
    let destSourceMapper = initializeDestSourceMapper(links);
    let errorText = '';

    for (var destID in destSourceMapper) {
    	var naryRelationships = getNaryRelationships(destSourceMapper, destID);
        // If there is a syntax error
        if (syntaxErrorExists(naryRelationships)) {
            errorText += generateSyntaxMessage(naryRelationships, destID);
            var linkViews = [];
            for (var i = 0; i < naryRelationships.length; i++) {
            	linkViews.push(naryRelationships[i].findview);
            }
            changeLinkColour(linkViews, 'red', 3);
        } else {
        	changeLinkColour(destSourceMapper[destID]['findview'], 'black', 1);
        }
    }

	// If errorText is not empty
    if (errorText) {
    	alertSyntaxError('We found invalid link combinations', errorText);
    	return true;
	}
	return false; 
}

/**
 * Return a list of non-actor elements in graph
 * @returns {Array} elementList
 */
function getElementList() { 
	var elementList = []; 
	var elements = graph.getElements(); 
	// Make sure to filter out actors from element list 
	for (var i = 0; i < elements.length; i++) { 
		if (!(elements[i] instanceof joint.shapes.basic.Actor)) { 
			elementList.push(elements[i]); 
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
	// If cycle list is empty, then false 
	return (cycleList != null);
}

/**
 * 
 * @param {HashMap.<String, Array<String>>} map 
 * @returns {Integer}
 */
function getMapSize(map) { 
	var len = 0;
	for (key in map) {
		len++;
	}
	return len;
}

/**
 * Uses Depth First Search to find cycles in the graph.
 * @returns {Array of Array<String>} cycleList if at least one cycle exists in the model
 * @returns {null} otherwise
 */
function cycleSearch() {
	var links = graph.getLinks();
	var vertices = getElementList();

	// Initialize LinkMap, a HashMap. Index = src ID, value = Array of dest nodes(?)
	var linkMap = initiateLinkGraph(vertices, links)
	// Search for cycles
	var cycleList = traverseGraphForCycles(linkMap); 
	// If there is a cycle 
	if (cycleList.length > 0) {
		return cycleList;
	}
	// If no cycles are present in model
	return null; 
}

/**
 * Creates a hash map representation of the graph.  
 * @param {Array.<Object>} vertices list of elements in the graph
 * @param {Array.<Object>} links list of links in the graph
 * @returns {HashMap.<String, Array<String>>} linkMap, a hash map where the first index corresponds to an element/src ID, 
 * and the corresponding child array contains each dest ID associated with it
 */
function initiateLinkGraph(vertices, links) {
	var linkMap = {}; 
	// Initiate a subarray for each index of linkMap that corresponds to an element ID
	vertices.forEach(function(vertex){
		var src = vertex.id;
		linkMap[src] = [];
	 });

	// Push each link's dest ID onto the index of linkMap that corresponds to the src ID
	links.forEach(function(link){
		// Get the element of the source ID and use that to get the element of the dest ID 
		var src = link.getSourceElement().prop('id'); 
		linkMap[src].push(link.getTargetElement().prop('id'));
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
	// Get a list of non-actor elements 
	var vertices = getElementList();
	var notVisited = [];
	var cycleList = [];

	// Create list of nodes to track which have not yet been visited
	vertices.forEach(function(element) { 
		notVisited.push(element.id);
	});

	// While all nodes haven't yet been visited
	while (notVisited.length > 0) { 
		// Get the first element (start) 
		var start = (notVisited.splice(0,1)).pop();
		var walkList = [];
		// Search for cycles
		traverseGraphRecursive(linkMap, start, walkList, notVisited, cycleList); 
	}
	return cycleList;
}

/**
 * Helper function for traverseGraphForCycles
 * @param {HashMap.<String, Array<String>>} linkMap Hash Map of dest nodes associated with each src node
 * @param {String} currNode Current node of the function call
 * @param {Array.<String>} walkList List of nodes in current walk
 * @param {Array.<String>} notVisited List of nodes that have not yet be visited, only used to determine start node for a new walk and to know when we're done traversing the graph
 * @param {Array of Array<String>} cycleList Double array that represents the cycles found in a graph. First index = separate cycle, child array = nodes in cycle
 */
function traverseGraphRecursive(linkMap, currNode, walkList, notVisited, cycleList) {
	// Since walk list is initialized to empty, it won't start here 
	if (walkList.includes(currNode)) {
		// Found a cycle
		var cycle = [];
		var prev = currNode;
		// The cycle is the part of the list from first instance of repeat node to now
		for (var i = walkList.indexOf(currNode); i < walkList.length; ++i) {
			cycle.push(walkList[i]);
			/**
			 * Get rid of cycle link from prev to curr node so graph traversal doesn't get stuck. 
			 * Problem: when multiple cycles share nodes, this inhibits others from being found. 
			 * Should we just start a new walk?
			 */
			var remove = linkMap[prev].indexOf(walkList[i]); 
			linkMap[prev].splice(remove, 1); 
			prev = walkList[i];
		}
		cycleList.push(cycle);
	}
	
	// Push current (start) node to walk list
	walkList.push(currNode);
	// If curr is still marked as unvisited, remove it from notVisited 
	if (notVisited.includes(currNode)) {
		notVisited.splice(notVisited.indexOf(currNode), 1);
	}
	// If we have unvisited dest nodes, go there
	if (getMapSize(linkMap) > 0) {
		// Go through destination nodes of current node 
		for (var i = 0; i < linkMap[currNode].length; ++i) {
		// Set next to a dest node that has currNode as its src
		var next = linkMap[currNode][i]; 
		traverseGraphRecursive(linkMap, next, walkList, notVisited, cycleList); 
	}
	}
	// Done with function call, so take a "step back" in the graph
	walkList.pop(); 
}