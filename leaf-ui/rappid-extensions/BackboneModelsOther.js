/** 
 * This file contains Backbone Models for:
 *  Actor
 *  Link
 *  UserEvaluation
 *  Constraint
 */


/** 
 * Backbone Model of Actor
 */
 var ActorBBM = Backbone.Model.extend({
    initialize: function(options){ 
        this.type = options.type;       // Options are 'Actor', 'Agent', and 'Role'
        this.name = options.name;
    }
});


/** 
 * Backbone Model of Link.
 */
 var LinkBBM = Backbone.Model.extend({  
    initialize: function(options){
        _.extend({}, this.defaults, options);
    },

    defaults: {
        linkType:  'and',
        postType: null,
        absTime: -1,
        evolving: false,
    },

    /**
     * Checks if LinkBBM can have a valid absolute relationship
     * 
     * @returns Boolean
     */
    isValidAbsoluteRelationship: function(){
        // If relationship is of type evolving and has a target and source, return true
        if(this.linkType == 'NBD' || this.linkType == 'NBT' || this.postType != null){
            return (this.linkSrcID != null && this.linkDestID != null);
        }
        return false;
    },
});


/** 
 * Backbone Model of UserEvaluations 
 */ 
var UserEvaluationBBM = Backbone.Model.extend({  
    initialize: function(options){      
        this.intentionID = options.intentionID; 
        // TODO: Is absTP a letter or a number? It may need to be renamed.
        this.absTP = options.absTP;             
        this.assignedEvidencePair = options.assignedEvidencePair; //Evidence Pair
    }
});

var UserEvaluationCollection = Backbone.Collection.extend({
    model: UserEvaluationBBM

});

/** 
 * Backbone Model of Constraints
 */
var ConstraintBBM = Backbone.Model.extend({
    initialize: function(options){
        _.extend({}, this.defaults, options)
    },

    defaults: {
        type: null,           // Options are '=', '<', and '<='
        srcID: null,
        destID: null,
        srcRefTP: null,       // Reference Time Point A,B,C, etc.
        destRefTP: null,      // Reference Time Point A,B,C, etc.
        /** 
         * Absolute time points are only used with the '=' type of operator.
         *  If a timepoint is not given -1 should be assigned as the default value.
         */   
        absTP: -1,
    },

    /**
     * Checks if type of constraint is null
     * If so, constraint has not been fully assigned
     */
    isComplete: function(){
        return (!this.get('type') == null);
    },

});

var ConstraintCollection = Backbone.Collection.extend({
    model: ConstraintBBM
});


