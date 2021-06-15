/** This file contains backbone model representations of the original model objects - WIP */

/** 
 * Backbone for UserEvaluation 
 * */ 
var UserEvaluationModel = Backbone.Model.extend({  
    //Take in properties
    initialize: function(options){ //Named arguments and passes in parameter
        this.intentionID = options.intentionID; 
        this.absTime = options.absTime;
        this.evaluationValue = options.evaluationValue;
    }
});

/** 
 * Backbone for Constraint 
 * */
var ConstraintModel = Backbone.Model.extend({
    initialize: function(options){ //Named arguments and passes in parameter
        this.constraintType = options.constraintType;
        this.constraintSrcID = options.constraintSrcID;
        this.constraintSrcEB = options.constraintSrcEB;
        this.constraintDestID = options.constraintDestID;
        this.constraintDestEB = options.constraintDestEB;
        this.absoluteValue = -1;
    }
});

//var intentionEval = new UserEvaluationModel({intentionID:intention.nodeID},{absTime:'0'}, {evaluationValue:'(no value)'});
//var constraint = new ConstraintModel({constraintType:type},{constraintSrcID:nodeID1}, {constraintSrcEB:epoch1}, {constraintDestID: nodeID2}, {constraintDestEB:epoch2});