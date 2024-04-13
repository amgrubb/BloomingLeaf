myNull = null;
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
    initialize: function (options) {
        _.extend({}, this.defaults, options);
    },

    defaults: function () {
        return {
            type: 'A',
            actorName: 'Actor',
            isHidden: false,
            intervals:[],
        }
    },
});



/** 
 * Backbone Model of Link.
 */
var LinkBBM = Backbone.Model.extend({
    initialize: function (options) {
        _.extend({}, this.defaults, options);
    },

    defaults: function () {
        return {
            displayType: 'element',     // TODO: should this be changed to 'link'?
            linkType: 'and',
            postType: null,
            absTime: myNull,
            evolving: false,
        }
    },

});

//TODO: Determine if we still need this.
/** 
 * Backbone Model of Constraints
 */
var ConstraintBBM = Backbone.Model.extend({
    initialize: function (options) {
        _.extend({}, this.defaults, options)
    },

    defaults: function () {
        return {
            type: null,           // Options are '=', '<', and '<='
            srcID: null,
            destID: null,
            srcRefTP: null,       // Reference Time Point A,B,C, etc.
            destRefTP: null,      // Reference Time Point A,B,C, etc.
        }
    },

    /**
     * Checks if type of constraint is null
     * If so, constraint has not been fully assigned
     */
    isComplete: function () {
        return (!(this.get('type') == null) &&
            !(this.get('srcID') == null) &&
            !(this.get('destID') == null));
    },

});

var ConstraintCollection = Backbone.Collection.extend({
    model: ConstraintBBM
});