class Actor {

	/**
	 * @param {String} nodeId
	 *   Id of this node. ex: ('a0000')
	 * @param {String} nodeName
	 *   Name of this node. ex: ('Actor_0')
	 * @param {Array.<String>} intentions
	 *   Array of intention Ids, for the intentions
	 *   embedded inside this actor
	 */
	constructor(nodeId, nodeName, intentions) {
		this.nodeId = nodeId;
		this.nodeName = nodeName;
		this.intentions = intentions;
	}
}

class AnalysisValues {


	/**
	 * @param {Array.<String>} assignedEpoch
	 * @param {Array.<String>} timePointPath
     *   Each element represents a time point in the analysis
     *   ex: ['0', '7']
	 * @param {Number} timePointPathSize
     *   Size of the time point path. ex: 2
	 * @param {Object} values
     *   Maps an intention Id and time point to a string which
     *   represents the evaluation for that intention
     *   ex: {'0000': {'0': '0000', '7': 'DNE'}}
     *   (for nodeId 0000, time point 0, its satisfaction value is none)
	 */
	constructor(assignedEpoch, timePointPath, timePointPathSize, values) {
        this.assignedEpoch = assignedEpoch;
        this.timePointPath = timePointPath;
        this.timePointPathSize = timePointPathSize;
	}
}

class Link {

	/**
	 * @param {String} linkType
	 *   Type of the link. ex: 'AND', 'OR', 'NO', etc.
	 * @param {String} linkSrcId
	 *   Id for the source of the link. ex: '0000'
	 * @param {String} linkDestId
	 *   Id for the destination of the link. ex: '0001'
	 * @param {String} absoluteValue
	 *   TODO ex. -1, 0,...,n
	 */
    constructor(linkType, linkSrcId, linkDestId, absoluteValue) {
    	this.linkType = linkType;
    	this.linkSrcId = linkSrcId;
    	this.linkDestId = linkDestId;
    	this.absoluteValue = absoluteValue;
    }
}

class InputIntention {

	/**
	 * @param {}
	 */
	constructor(nodeActorId, nodeId, nodeType, nodeName, dynamicFunction) { 
		this.nodeActorId = 
	}

}
