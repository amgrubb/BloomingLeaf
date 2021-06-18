/** 
 * This file contains Backbone Models for:
 *  FunctionSegment
 *  EvolvingFunction
 *  Intention
 */

/** 
 * Backbone Model of An Atomic Function Segment
 * */
var FunctionSegmentBBM = Backbone.Model.extend({
    initialize: function (options) {
        this.type = options.type;           // Atomic function types. 
        this.refEvidencePair = options.refEvidencePair;   //a.k.a. Evaluation Value
        this.startTP = options.startTP;
        this.stopTP = options.stopTP;
    }
});

/** 
 * Backbone Model of Evolving Functions
 *      TODO: Finish migration from modelObjects.js
 * */
var EvolvingFunctionBBM = Backbone.Model.extend({
    initialize: function(options) { 
        this.intentionID = options.intentionID; 
    }, 
 
    defaults: { 
        type: 'NT',                  // Named types on view list, was stringDynVis
        // Array functionSegList contains all of the FunctionSegment models (and only FunctionSegment models)
        functionSegList: [],        //of type FunctionSegmentBBM

        hasRepeat: false,
        repStart: null,         // 0, A, B, ..
        repStop: null,          // B, C, D, ..
        repCount: null,         // 2, 3, ..n
        repAbsTime: null,       // 0, 1, ..n
       
    },
    
    //TODO: I think could have some helper functions for the constructor. 
});

/** This file contains backbone model representations of the original model objects - WIP */
var IntentionBBM = Backbone.Model.extend({
    idAttribute: "uid",    
 
    initialize: function(options) { 
        this.nodeType = options.nodeType; 
        this.nodeName = options.nodeName; 
    }, 
    defaults: { 
        nodeActorID: null,                     // Assigned on release operation.
        evolvingFunction: null, 
        initialValue: '(no value)'
    }
});
