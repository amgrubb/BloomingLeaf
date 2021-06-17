/** This file contains backbone model representations of the original model objects - WIP */
// FuncSegmentModel from FuncSegment class in modelObjects.js
var FunctionSegmentBBM = Backbone.Model.extend({
    idAttribute: "uid",

    // Initialize function - save all of the input parameters into 'option' variable
    // And then use 'option' when intitializing the function  
    initialize: function (options) {
        this.type = options.type;
        this.refEvaluationValue = options.refEvaluationValue;
        this.startTP = options.startTP;
        this.stopTP = options.stopTP;
    },
});

//RepFuncSegmentMOdel from RepFuncSegment class in modelObjects.js
var RepFunctionSegmentBBM = Backbone.Model.extend({
    idAttribute: "uid",

    initialize: function(options) { 
        // this functionSegList is an array of all of the FunctionSegmentBBMs in this BBM
        this.functionSegList = options.functionSegList; 
        this.repNum = options.repNum; 
        this.absRepTime = options.absRepTime; 
    }

});     

/** 
 * Backbone for UserEvaluation 
 * */ 
var UserEvaluationBBM = Backbone.Model.extend({  
    //Take in properties
    initialize: function(options){ //Named arguments and passes in parameter
        this.intentionID = options.intentionID; 
        this.absTP = options.absTP;
        this.assignedValue = options.assignedValue;
    }
});

/** 
 * Backbone for Constraint 
 * */
var ConstraintBBM = Backbone.Model.extend({
    initialize: function(options){ //Named arguments and passes in parameter
        this.type = options.type;       // Options are '=', '<', and '<='
        this.srcID = options.srcID;
        this.srcRefTP = options.srcRefTP;
        this.destID = options.destID;
        this.destRefTP = options.destRefTP;
        /* Absolute time points are only used with the '=' type of operator.
         *   If a timepoint is not given -1 should be assigned as the default value.
         * */   
        if (this.absTP != 'undefined') {
            if (this.type  == '<' || this.type == '<='){
                this.absTP = null; 
            }else{
                this.absTP = -1;
            }
        }else{
            this.absTP = this.absTP;
        }
 
    },
});

