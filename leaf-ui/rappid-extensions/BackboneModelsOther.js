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
        _.extend({}, this.defaults, options);
    },

    defaults: {
        type: 'A',
        actorName: 'Actor'
    },
});


/** 
 * Backbone Model of Link.
 */
 var LinkBBM = Backbone.Model.extend({  
    initialize: function(options){
        _.extend({}, this.defaults, options);
    },

    defaults: {
        displayType: 'element',     // TODO: should this be changed to 'link'?
        linkType:  'and',
        postType: null,
        absTime: -1,
        evolving: false,
    },

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
        return (!(this.get('type') == null) && 
                !(this.get('srcID') == null) &&
                !(this.get('destID') == null));
    },

});

var ConstraintCollection = Backbone.Collection.extend({
    model: ConstraintBBM
});


