class Model {

    /**
     *
     * @param {Array.<Actor>} actors
     * @param {Array.<InputIntention>} intentions
     * @param {Array.<Link>} links
     * @param {Array.<Constraint>} constraints
     * @param {String} maxAbsTime
     */
    constructor(actors, intentions, links, constraints, maxAbsTime) {
        this.actors = actors;
        this.intentions = intentions;
        this.links = links;
        this.maxAbsTime = maxAbsTime;
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

class InputIntention {

	/**
	 * @param {String} nodeActorID
	 * @param {String} nodeID
	 * @param {String} nodeType
	 * @param {String} nodeName
	 * @param {EvolvingFunction} dynamicFunction
	 */
	constructor(nodeActorID, nodeID, nodeType, nodeName, dynamicFunction) {
		this.nodeActorID = nodeActorID;
		this.nodeID = nodeID;
		this.nodeType = nodeType;
		this.nodeName = nodeName;
		this.dynamicFunction = dynamicFunction;
	}

}

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
     * @param {Array.<IntentionEvaluation>} userAssignment
     * @param {AnalysisResult} previousAnalysis
     */
	constructor(action, conflictLevel, numRelTime, absTimePts, currentState, userAssignment, previousAnalysis) {
		this.action = action;
		this.conflictLevel = conflictLevel;
		this.numRelTime = numRelTime;
		this.absTimePts = absTimePts;
		this.currentState = currentState;
		this.userAssignment = userAssignment;
		this.previousAnalysis = previousAnalysis;
	}
}
