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
        // TODO does functionSegList[i] access the element correctly if it is a BBM
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
    // TODO add this function
    setRepeatingFunction: function(time1, time2) {
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
     * Id a RepFuncSegment does not exist in functionSegList, this function
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
     * Sets the repCount for the RepFuncSegment inside of this
     * EvolvingFunction's functionSegList, to count
     *
     * If there is no RepFuncSegment object this function does nothing
     *
     * @param {Number} count
     */
    setRepNum: function(num) {
        this.repCount = num;
        // Original Function
        // var repIndex = this.getRepFuncSegmentIndex();
        // if (repIndex === -1) {
        //     return;
        // }
        // this.functionSegList[repIndex].repNum = num;
    },

    /**
     * Sets the absTime for the RepFuncSegment inside of this
     * EvolvingFunction's functionSegList, to time
     *
     * If there is no RepFuncSegment object in functionSegList
     * this function does nothing
     *
     * @param {Number} time
     */
    setAbsoluteTime: function(time) {
        this.repAbsTime = time;
        // Original Function
        // var repIndex = this.getRepFuncSegmentIndex();
        // if (repIndex === -1) {
        //     return;
        // }
        // this.functionSegList[repIndex].absTime = time;
    },

    /**
     * Returns the index of the RepFuncSegment object
     * in this EvolvingFunction's functionSegList
     *
     * Returns -1 if there is no RepFunccSegment object
     * in functionSegList
     *
     * @returns {Number}
     */
    // TODO update this function
    getRepFuncSegmentIndex: function() {
        // Find the index where the RepFuncSegment is located
        var repIndex = 0;
        while (repIndex < this.functionSegList.length && (!(this.functionSegList[repIndex] instanceof RepFuncSegment))) {
            repIndex++;
        }

        // RepFuncSegment did not exist in functionSegList
        if (repIndex >= this.functionSegList.length) {
            return - 1;
        }

        return repIndex;
    },    

    /**
     * Returns an array containing FuncSegment objects, for the
     * purpose of easy iteration. This function is useful when
     * the functionSegList contains both FuncSegments and
     * repFuncSegments.
     *
     * For example, if functionSegList contains a FuncSegment
     * and a repFuncSegment containing three FuncSegments inside of it,
     * this function returns an array of size 4, containing all the
     * function segments in chronological order.
     *
     * Every FuncSegment in the returned array will be a deep copy of the
     * origin FuncSegments.
     *
     * Each FuncSegment in the returned array will have a inRepeat attribute
     * which evaluates to true iff the FuncSegment was part of a
     * repFunctionSegment
     *
     * @returns {Array.<FuncSegment>}
     */
    // TODO ask abt this function, is it still neccessary 
    getFuncSegmentIterable: function() {
        var res = [];
        for (var i = 0; i < this.functionSegList.length; i++) {
            var obj = this.functionSegList[i];
            if (obj instanceof FuncSegment) {
                var clone = Object.assign(new FuncSegment, obj); // deep copy
                clone.isRepeat = false;
                res.push(obj);
            } else {
                var segList = obj.functionSegList;
                for (var j = 0; j < segList.length; j++) {
                    var clone = Object.assign(new FuncSegment, segList[j]);
                    clone.isRepeat = true;
                    res.push(clone);
                }
            }
        }
        return res;
    },
    
    /**
     * Returns true if this EvolvingFunction contains
     * a repeating segment (ie, contains a RepFuncSegment)
     *
     * @returns {Boolean}
     */
    // TODO if this.hasRepeat is a parameter, can we just use that instead of a function
    hasRepeat: function() {
        return this.hasRepeat;
        // // Original Function
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     if (this.functionSegList[i] instanceof RepFuncSegment) {
        //         return true;
        //     }
        // }
        // return false;
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
    // TODO unsure abt this 
    getStartRepeatEpoch: function() {
        // would it be '0' or 0???
        if (this.repStart != 0) {
            var repStartIndex = this.repStart.charCodeAt() - 64; // this should be the index of the first repeating segment
            return this.functionSegList[repStartIndex].get(startTP);
        }
        else return this.functionSegList[0].get(startTP);
        // this is probs wrong
        // return this.repStart;
        // Original Function
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     if (this.functionSegList[i] instanceof RepFuncSegment) {
        //         return this.functionSegList[i].functionSegList[0].funcStart;
        //     }
        // }
    },

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
