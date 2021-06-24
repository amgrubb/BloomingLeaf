/** 
 * This file contains Backbone Models for:
 *  FunctionSegment
 *  EvolvingFunction
 *  Intention
 */

/** 
 * Backbone Model of An Atomic Function Segment
 */
var FunctionSegmentBBM = Backbone.Model.extend({
    initialize: function (options) {
        this.type = options.type;           // Atomic function types. 
        this.refEvidencePair = options.refEvidencePair;   //a.k.a. Evaluation Value
        this.startTP = options.startTP; // Start time point (char) 0,A,B,C
        this.startAT = options.startAT; // Assigned/Absolute Time - Integer time value. If not set defaults to undefined
    }
});

/** 
 * Backbone Model of Evolving Functions
 *      TODO: Finish migration from modelObjects.js
 */
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

var IntentionBBM = Backbone.Model.extend({
    initialize: function(options) { 
        _.extend({}, this.defaults, options)
    }, 
    defaults: { 
        nodeName: "untitled",
        nodeType: null,
        nodeActorID: null,                     // Assigned on release operation.
        evolvingFunction: null, 
        functionType: 'NT',                    // I, D, C, R, MP, UD, etc
        initialValue: '(no value)',
    },

    /**
     * @returns Array of FunctionSegmentBBMs, or null if it is not an evolvingFunction
     */
    getFuncSegments: function(){
        evolvingFunc = this.get('evolvingFunction');
        if (evolvingFunc != null){
            return evolvingFunc.get('functionSegList');
        }
        return null;
    }
});
