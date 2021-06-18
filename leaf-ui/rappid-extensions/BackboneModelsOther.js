/** 
 * This file contains Backbone Models for:
 *  Actor
 *  Link
 *  UserEvaluation
 *  Constraint
 */


/** 
 * Backbone Model of Actor
 * */
 var ActorBBM = Backbone.Model.extend({
    initialize: function(options){ 
        this.type = options.type;       // Options are 'Actor', 'Agent', and 'Role'
        this.name = options.name;
    }
});


/** 
 * Backbone Model of Link.
 * */
 var LinkBBM = Backbone.Model.extend({  
    initialize: function(options){
        this.linkSrcID = options.linkSrcID;
    },    
    defaults: {
        linkDestID: null,
        linkType:  'AND',
        postType: null,
        absTime: -1
    }
});


/** 
 * Backbone Model of UserEvaluations 
 * */ 
var UserEvaluationBBM = Backbone.Model.extend({  
    initialize: function(options){      
        this.intentionID = options.intentionID; 
        // TODO: Is absTP a letter or a number? It may need to be renamed.
        this.absTP = options.absTP;             
        this.assignedEvidencePair = options.assignedEvidencePair; //Evidence Pair
    }
});

/** 
 * Backbone Model of Constraints
 * */
var ConstraintBBM = Backbone.Model.extend({
    initialize: function(options){ 
        this.type = options.type;               // Options are '=', '<', and '<='
        this.srcID = options.srcID;
        this.destID = options.destID;
        this.srcRefTP = options.srcRefTP;       // Reference Time Point A,B,C, etc.
        this.destRefTP = options.destRefTP;     // Reference Time Point A,B,C, etc.
        /* Absolute time points are only used with the '=' type of operator.
         *   If a timepoint is not given -1 should be assigned as the default value.
         * */   
        if (options.absTP == 'undefined') {
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

