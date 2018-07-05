class Model {

    /**
     * Attributes: 
     * {Array.<Actor>} actors
     * {Array.<UserIntention>} intentions
     * {Array.<Link>} links
     * {Array.<Constraint>} constraints
     * {String} maxAbsTime
     */
    constructor() {
        this.actors = []; 
        this.intentions = [];
        this.links = [];
        this.maxAbsTime;
    }

    /**
     * Remove the intention with node ID nodeID
     * from the intentions array
     *
     * @param {String} nodeID
     */
    removeIntention(nodeID) {
    	for (var i = 0; i < intentions.length; i++) {
    		if (intentions[i].nodeID = nodeID) {
    			intentions.splice(i, 1);
    			return;
    		}
    	}
    }
}

class Actor {

	/**
	 * @param {String} nodeID
	 *   ID of this node. ex: ('a0000')
	 * @param {String} nodeName
	 *   Name of this node. ex: ('Actor_0')
	 * @param {Array.<String>} intentions
	 *   Array of intention IDs, for the intentions
	 *   embedded inside this actor
	 */
	constructor(nodeID, nodeName, intentions) {
		this.nodeID = nodeID;
		this.nodeName = nodeName;
		this.intentions = intentions;
	}
}

class AnalysisResult {


	/**
	 * @param {Array.<String>} assignedEpoch
	 * @param {Array.<String>} timePointPath
     *   Each element represents a time point in the analysis
     *   ex: ['0', '7']
	 * @param {Number} timePointPathSize
     *   Size of the time point path. ex: 2
	 * @param {Object} values
     *   Maps an intention ID and time point to a string which
     *   represents the evaluation for that intention
     *   ex: {'0000': {'0': '0000', '7': 'DNE'}}
     *   (for nodeID 0000, time point 0, its satisfaction value is none)
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
	 * @param {String} linkSrcID
	 *   ID for the source of the link. ex: '0000'
	 * @param {String} linkDestID
	 *   ID for the destination of the link. ex: '0001'
	 * @param {String} absoluteValue
	 *   TODO ex. -1, 0,...,n
	 */
    constructor(linkType, linkSrcID, linkDestID, absoluteValue) {
    	this.linkType = linkType;
    	this.linkSrcID = linkSrcID;
    	this.linkDestID = linkDestID;
    	this.absoluteValue = absoluteValue;
    }
}


class UserIntention {

	/**
	 * @param {String} nodeActorID
	 *   The ID of the actor that this intention is embedded in
	 *   ex: 'a0000' (actor ID), '-' (if there is no actor) 
	 * @param {String} nodeType
	 *   Type of the intention. 
	 *   Will be one of these four: 'basic.Goal', 'basic.Task', 'basic.Softgoal', 'basic.Resource'
	 * @param {String} nodeName
	 */
	constructor(nodeActorID, nodeType, nodeName) {
		this.nodeActorID = nodeActorID;
		this.nodeID = this.createID();
		this.nodeType = this.getShortenedNodeType(nodeType);
		this.nodeName = nodeName;
		this.dynamicFunction = null;
	}

	/**
	 * Returns a shortened version of type
	 *
	 * @param {String} type
	 * @returns {String}
	 */
	getShortenedNodeType(type) {
		return type[6];
	}

	/**
	 * Creates and returns a 4 digit ID for this node
	 * 
	 * @returns {String}
	 */
	createID() {
		var id = UserIntention.numOfInstances.toString();
		UserIntention.numOfInstances += 1;
		while (id.length < 4){
                id = '0' + id;
        }
        return id;
	}

	/**
	 * Sets the function for this Intention
	 */
	setFunction(dynamicFunction) {
		this.dynamicFunction = dynamicFunction;
	}
}
UserIntention.numOfInstances = 0; // static variable to keep track of number of instances

class EvolvingFunction {

    /**
     * @param {String} intentionID
     * @param {String} stringDynVis
     * @param {Array.<FuncSegment|RepFuncSegment>} functionSegList
     */
	constructor(intentionID, stringDynVis, functionSegList) {
		this.intentionID = intentionID;
		this.stringDynVis = stringDynVis;
		this.functionSegList = functionSegList;
	}
}

class FuncSegment {


    /**
	 *
     * @param {String} funcType
     * @param {String} funcX
     * @param {String} funcStart
     * @param {String} funcStop
     */
	constructor(funcType , funcX, funcStart, funcStop) {
		this.funcType = funcType;
		this.funcX = funcX;
        this.funcStart = funcStart;
        this.funcStop = funcStop;
	}
}

class RepFuncSegment {

    /**
	 *
     * @param {Array.<FuncSegment>} functionSegList
     * @param {Number} repNum
     * @param {Number}absTime
     */
	constructor(functionSegList, repNum, absTime) {
		this.functionSegList = functionSegList;
		this.repNum = repNum;
		this.absTime = absTime;
	}
}

class Constraint {

    /**
	 *
     * @param {String} constraintType
     * @param {String} constraintSrcID
     * @param {String} constraintSrcEB
     * @param {String} constraintDestID
     * @param {String} constraintDestEB
     * @param {Number} absoluteValue
     */
	constructor(constraintType, constraintSrcID, constraintSrcEB, constraintDestID, constraintDestEB, absoluteValue) {
		this.constraintType = constraintType;
        this.constraintSrcID = constraintSrcID;
        this.constraintSrcEB = constraintSrcEB;
        this.constraintDestID = constraintDestID;
        this.constraintDestEB = constraintDestEB;
        this.absoluteValue = absoluteValue;
	}
}

class IntentionEvaluation {

    /**
	 *
     * @param {String} intentionID
     * @param {String} absTime
     * @param {String} evaluationValue
     */
	constructor(intentionID, absTime, evaluationValue) {
		this.intentionID = intentionID;
		this.absTime = absTime;
		this.evaluationValue = evaluationValue;
	}
}

class AnalysisRequest {

    /**
	 *
     * @param {String} action
     * @param {String} conflictLevel
     * @param {String} numRelTime
     * @param {String} absTimePts
     * @param {String} currentState
     * @param {Array.<IntentionEvaluation>} userAssignmentsList
     * @param {AnalysisResult} previousAnalysis
     */
	constructor() {
		this.action = null;
		this.conflictLevel = null;
		this.numRelTime = null;
		this.absTimePts = null;
		this.currentState = null;
		this.userAssignmentsList = [];
		this.previousAnalysis = null;
	}

	/**
	 * Removes all IntentionEvaluation objects in
	 * userAssignmentsList, with an intentionID equal to 
	 * nodeID
	 *
	 * @param {String}
	 */
	removeIntention(nodeID) {
		var i = 0;

		while (i < userAssignmentsList.length) {
			if (userAssignmentsList[i].intentionID == nodeID) {
				userAssignmentsList.splice(i, 1);
			} else {
				i++;
			}
		}
	}
}
