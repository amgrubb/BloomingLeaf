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
        this.startTP = options.startTP;
        this.stopTP = options.stopTP;
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
    
    // TODO update all of the function descriptions

        /**
     * Returns the 4 digit representation for this
     * EvolvingFunction's ith function segment's 
     * satisfaction value
     *
     * @param {Number} i
     * @returns {String}
     */
    getMarkedVal: function(i) {
        return this.functionSegList[i].get('refEvidencePair');
        // Original Function
        // return this.functionSegList[i].funcX;
    },

    /**
     * Returns the 4 digit representation for this
     * EvolvingFunction's last function segment's
     * marked value value
     */
    getLastMarkedVal: function() {
        var len = this.functionSegList.length;
        if (len > 0) {
            return this.functionSegList[len - 1].get('refEvidencePair');
        }
        // Original Function
        // if (len > 0) {
        //     return this.functionSegList[len - 1].funcX;
        // }
    },

    /**
     * Returns the 4 digit representation for this
     * EvolvingFunction's second last function segment's
     * marked value value. If there is no second last function
     * segment, this function returns the 4 digit representation of 
     * the only ffunction segment's marked value
     */
    getSecondLastMarkedVal: function() {
        var len = this.functionSegList.length;
        if (len > 1) {
            return this.functionSegList[len - 2].get('refEvidencePair');
        } else {
            return this.getLastMarkedVal();
        }
        // Original Function
        // if (len > 1) {
        //     return this.functionSegList[len - 2].funcX;
        // } else {
        //     return this.getLastMarkedVal();
        // }
    },    

    /**
     * Returns the funcStop value for the last
     * function segment for this EvolvingFunction
     * Returns null if functionSegList is empty
     *
     * returns {String | null}
     */
    getLastStopValue: function() {
        len = this.functionSegList.length;
        if (len > 0) {
            return this.functionSegList[len - 1].get('stopTP');
        }
        // Original Function
        // len = this.functionSegList.length
        // if (len > 0) {
        //     return this.functionSegList[len - 1].funcStop;
        // }
    },  

    /**
     * Creates a new RepFuncSegment object containing function
     * segments in the relative time interval [time1, time2], and add it to this
     * EvolvingFunction's functionSegList, in place of the function
     * segements in the time interval [time1, time2]
     *
     * @param {String} time1
     *   first relative time point
     * @param {String} time2
     *   second relative time point
     */
    // TODO fix this function
    // I think we should set it so that the repeating function starts at time 1 and ends at 
    // time 2
    setRepeatingFunction: function(time1, time2) {

        this.removeRepFuncSegments();
        hasRepeat = true;                        
        repAbsTime =  time2 - time1;

        var startIndex = 0;
        while (this.functionSegList[startIndex].get('startTP') !== time1) {
            startIndex++;
        }
        repStart = String.fromCharCode(this.functionSegList[startIndex] + 64);

        var stopIndex = 0;
        while (this.functionSegList[stopIndex].get('stopTP') !== time1) {
            stopIndex++;
        }
        repStop = String.fromCharCode(this.functionSegList[stopIndex] + 64);

        repCount = stopIndex - startIndex;

        // Original Function
        // this.removeRepFuncSegments();
        // // find the index of the FuncSegment with start time time 1
        // var startIndex = 0;
        // while (this.functionSegList[startIndex].funcStart !== time1) {
        //     startIndex++;
        // }

        // var repFuncSegments = [];

        // // push and remove, until we see a segment with our desired FuncEnd time
        // while (this.functionSegList[startIndex].funcStop !== time2) {
        //     repFuncSegments.push(this.functionSegList[startIndex]);
        //     this.functionSegList.splice(startIndex, 1);
        // }

        // // push and remove the last segment
        // repFuncSegments.push(this.functionSegList[startIndex]);
        // this.functionSegList.splice(startIndex, 1);


        // // create and add a new RepFuncSegment
        // var repFuncSegment = new RepFuncSegment(repFuncSegments);
        // this.functionSegList.splice(startIndex, 0, repFuncSegment);        
    },         

    /**
     * Returns the FuncSegment in this EvolvingFunction's
     * functionSegList, with the relative start time time
     *
     * @param {String} time
     * @returns {FuncSegment}
     */
     findSegmentByStartTime: function(time) {
        for (var i = 0; i < this.functionSegList.length; i++) {
            if (this.functionSegList[i].get('startTP') === time) {
                return this.functionSegList[i];
            }
        }
        // Original Function
        // for (var i = 0; i < this.functionSegList; i++) {
        //     if (this.functionSegList[i].funcStart === time) {
        //         return this.functionSegList[i];
        //     }
        // }
    },    

    /**
     * If a RepFuncSegment exists in this EvolvingFunction's
     * functionSegList, retrieve the FuncSegments in the RepFuncSegment,
     * remove the RepFuncSEgment and add the retrieved FuncSegments back
     * into their correct positions in functionSegList
     * 
     * Updated: All of the parameters for a repeating segment are reset to the default,
     * which means there is no loner a repeating function segment in the EvolvingFunctionBBM     *  
     *
     * If a RepFuncSegment does not exist in functionSegList, this function
     * does nothing
     */
    removeRepFuncSegments: function() {
        hasRepeat = false;
        repStart = null;
        repStop = null;          
        repCount = null;         
        repAbsTime = null;  
        // Original Function
        // var repIndex = this.getRepFuncSegmentIndex();
        // if (repIndex === -1) {
        //     return;
        // }

        // var repFuncSegment = this.functionSegList[repIndex];
        // // remove RepFuncSegment object from array
        // this.functionSegList.splice(repIndex, 1);

        // // add the FuncSegments back into the array
        // var j = repIndex;
        // for (var i = 0; i < repFuncSegment.functionSegList.length; i++) {
        //     this.functionSegList.splice(j, 0, repFuncSegment.functionSegList[i]);
        //     j++;
        // }
    },    
    
    /**
     * Returns the epoch boundary where the repeat segment
     * starts
     *
     * Precondition: This EvolvingFunction must contain a RepFuncSegment
     *
     * @returns {String}
     *   ex: 'A'
     */
    // TODO - fix this function 
    getStartRepeatEpoch: function() {
        if (this.repStart != 0) {
            var repStartIndex = this.repStart.charCodeAt() - 64; // this should be the index of the first repeating segment
            return this.functionSegList[repStartIndex].get('startTP');
        }
        else return this.functionSegList[0].get('startTP');

        // Original Function
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     if (this.functionSegList[i] instanceof RepFuncSegment) {
        //         return this.functionSegList[i].functionSegList[0].funcStart;
        //     }
        // }
    },

    /**
     * Returns the epoch boundary where the repeat segment
     * ends
     *
     * Precondition: This EvolvingFunction must contain a RepFuncSegment
     *
     * @returns {String}
     *   ex: 'C'
     */
    // TODO - fix this function
     getEndRepeatEpoch: function() {
        var repStopIndex = this.repStop.charCodeAt() - 64; // this should be the index of the last repeating segment
        return this.functionSegList[repStopIndex].get(stopTP);
        // Original Function
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     if (this.functionSegList[i] instanceof RepFuncSegment) {
        //         var len = this.functionSegList[i].functionSegList.length;
        //         return this.functionSegList[i].functionSegList[len - 1].funcStop;
        //     }
        // }
    },

    /**
     * Deleted Functions
     * getRepeatAbsTime: function() {},
     * getRepeatRepNum: function() {},
     * hasRepeat: function() {}, 
     * setAbsoluteTime: function(time) {},
     * setRepNum: function(num) {},
     * getFuncSegmentIterable: function() {},
     * getRepFuncSegmentIndex: function() {},  
     */


});

var IntentionBBM = Backbone.Model.extend({
    initialize: function(options) { 
        this.nodeType = options.nodeType;  
    }, 
    defaults: { 
        nodeName: "untitled",
        nodeActorID: null,                     // Assigned on release operation.
        evolvingFunction: null, 
        initialValue: '(no value)'
    }
});
