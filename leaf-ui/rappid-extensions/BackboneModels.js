/** This file contains backbone model representations of the original model objects - WIP */

// FuncSegment Backbone Model from FuncSegment class in modelObjects.js
var FunctionSegmentBBM = Backbone.Model.extend({
    idAttribute: "uid",

    // Initialize function - save all of the input parameters into one 'option' input
    // And then use 'option' when intitializing the function 
    initialize: function (options) {
        this.type = options.type;
        this.refEvaluationValue = options.refEvaluationValue;
        this.startTP = options.startTP;
        this.stopTP = options.stopTP;
    },
});

// RepFuncSegment Backbone Model from RepFuncSegment class in modelObjects.js
var RepFuncSegmentBBM = Backbone.Model.extend({
    idAttribute: "uid",

    initialize: function(options) { 
        // this functionSegList is an array of all of the FunctionSegmentBBMs in the RepFuncSegmentBBM
        this.functionSegList = options.functionSegList; 
        this.repNum = options.repNum; 
        this.absRepTime = options.absRepTime; 
    }

});   



// Backbone Model of Evolving Function Class on modelObjects.js
var EvolvingFunctionBBM = Backbone.Model.extend({
    idAttribute: "uid",

    initialize: function(options) { 
        //this.intentionID = options.intentionID; 
        this.nodeID = options.nodeID;  
        // Not Sure if calling the other models inside this one is done correctly
        var FuncSegment = new FuncSegmentModel();
        var FuncSegmentOptions = ; // Have to eventually add all of the FuncSegment parameters here
        FuncSegment.initialize(FuncSegmentOptions);
        var RepFuncSegment = new RepFuncSegmentModel();
        var RepFuncSegmentOptions = ; // Have to eventually add all of the RepFuncSegment parameters here
        RepFuncSegment.initialize(RepFuncSegmentOptions);
    }, 

    defaults: { 
        stringDynVis: 'NT',  
        // There can only be one RepFuncSegment
        // If there is a RepFuncSegment, input a RepFuncSegment model into this parameter
        RepFuncSegment: null,
        // Array functionSegList contains all of the FuncSegment models (and only FuncSegment models)
        functionSegList: [], 
    }, 

    // Currently, any functions that iterate over functionSegmentList do not iterate over 
    // The RepFuncSegment if there is one


    /* Returns the 4 digit representation for this
     * EvolvingFunction's ith function segment's 
     * satisfaction value
     */ 
    getMarkedVal: function(i) { 
        return this.functionSegList[i].get('refEvaluationValue'); 
    }, 

     /**
     * Returns the 4 digit representation for this
     * EvolvingFunction's last function segment's
     * marked value value
     */
    getLastMarkedVal: function() { 
        var len = this.functionSegList.length; 
        if (len > 0) { 
            return this.functionSegList[len - 1].get('refEvaluationValue'); 
        }
    }, 

    /**
     * Returns the 4 digit representation for this
     * EvolvingFunction's second last function segment's
     * marked value value. If there is no second last function
     * segment, this function returns the 4 digit representation of 
     * the only function segment's marked value
     */

    getSecondLastMarkedVal: function() { 
        var len = this.functionSegList.length; 
        if (len > 1) { 
            return this.functionSegList[len - 2].get('refEvaluationValue'); 
        } else { 
            return this.getLastMarkedVal(); 
        }
    }, 

    /**
     * Returns the stopTP value for the last
     * function segment for this EvolvingFunction
     * Returns null if functionSegList is empty
     *
     * returns {String | null}
     */
    getLastStopValueL: function() {
        len = this.functionSegList.length
        if (len > 0) {
            return this.functionSegList[len - 1].get('stopTP');
        }
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

    // TODO: edit function so it uses BB Models
    setRepeatingFunction: function(time1, time2) {

        this.removeRepFuncSegments();

        // find the index of the FuncSegment with start time time 1
        var startIndex = 0;
        while (this.functionSegList[startIndex].get('startTP') !== time1) {
            startIndex++;
        }

        // TODO (??)
        var repFuncSegments = [];

        // push and remove, until we see a segment with our desired FuncEnd time
        while (this.functionSegList[startIndex].get('stopTP') !== time2) {
            repFuncSegments.push(this.functionSegList[startIndex]);
            this.functionSegList.splice(startIndex, 1);
        }

        // push and remove the last segment
        repFuncSegments.push(this.functionSegList[startIndex]);
        this.functionSegList.splice(startIndex, 1);


        // create and add a new RepFuncSegment
        // TODO this should be a backbone model
        var repFuncSegment = new RepFuncSegment(repFuncSegments);
        this.functionSegList.splice(startIndex, 0, repFuncSegment);
    }, 

    /**
     * Returns the FuncSegment in this EvolvingFunction's
     * functionSegList, with the relative start time time
     *
     * @param {String} time
     * @returns {FuncSegment}
     */
    // TODO update this function
    // Currently, this function does not iterate over the FuncSegments in RepFuncSegments
    findSegmentByStartTime: function(time) {
        for (var i = 0; i < this.functionSegList; i++) {
            if (this.functionSegList[i].get('startTP') === time) {
                return this.functionSegList[i];
            }
        }
    }, 

    /**
     * If a RepFuncSegment exists in this EvolvingFunction's
     * functionSegList, retrieve the FuncSegments in the RepFuncSegment,
     * remove the RepFuncSegment and add the retrieved FuncSegments back
     * into their correct positions in functionSegList
     *
     * Id a RepFuncSegment does not exist in functionSegList, this function
     * does nothing
     */
    // TODO update this function so it's right
    // unsure abt this function
    removeRepFuncSegments: function() {
        if (RepFuncSegment != null) {
            this.getFuncSegmentIterable();
            RepFuncSegment = null;   
        }   
        // Original function
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
     * Sets the repNum for the RepFuncSegment inside of this
     * EvolvingFunction's functionSegList, to count
     *
     * If there is no RepFuncSegment object in functionSegList
     * this function does nothing
     *
     * @param {Number} count
     */
    setRepNum: function(num) {
        if (RepFuncSegment != null) {
            this.RepFuncSegment.set('repNum', num);    
        }   
        // Original function
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
        if (RepFuncSegment != null) {
            this.RepFuncSegment.set('absRepTime', time);    
        }   
        // Original function
        // var repIndex = this.getRepFuncSegmentIndex();
        // if (repIndex === -1) {
        //     return;
        // }
        // this.functionSegList[repIndex].get('absRepTime') = time;
    }, 



    /**
     * Returns the index of the RepFuncSegment object
     * in this EvolvingFunction's functionSegList
     *
     * Returns -1 if there is no RepFuncSegment object
     * in functionSegList
     *
     * @returns {Number}
     */
    // TODO update this function
    // There will not be a repFuncSegmentIndex inside this.functionSegLis
    // It's poosible we can just delete this
    getRepFuncSegmentIndex: function() {
        // Find the index where the RepFuncSegment is located
        var repIndex = 0;
        while (repIndex < this.functionSegList.length && (!(this.functionSegList[repIndex] instanceof RepFuncSegmentModel))) {
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
    // TODO update this function - very unsure abt code/logic here
    // Add all FuncSegmentBBMs to array and all FuncSegmentBBMs in RepFuncSegmentBBM
    // To the same array in chronilogical order
    getFuncSegmentIterable: function() {
        var res [];
        var repFuncSegmentList = this.RepFuncSegment.get('functionSegList');
        var repStartTime = repFuncSegmentList[0].get('startTP');
        // iterates over all of the FuncSegmentBBMs and adds them to new array
        for (var i = 0; i < this.functionSegList.length; i++) {
            var obj = this.functionSegList[i].clone();
            // if the start the current funcSegmentBBM's start time is before the first 
            // start time of the RepFuncSegmentBBMs, add it to array
            if (this.functionSegList[i].get('startTP') <= repStartTime) {
            res.push(obj);
            }
            // if its larger, add all of the FuncSegementBBMs in the RepFuncSegmentBBM
            // to the array first
            else {
                if (RepFuncSegment != null) {
                    for (var i = 0; i < this.RepFuncSegment.get('functionSegList').length; i++) {
                        var obj = this.functionSegList[i].clone();
                        res.push(obj);
                    }   
                }
                res.push(obj); 
            }
        }   
        return res;       
        // Original function
        // var res = [];
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     var obj = this.functionSegList[i];
        //     if (obj instanceof FuncSegmentModel) {
        //         var clone = Object.assign(new FuncSegment, obj); // deep copy
        //         clone.isRepeat = false;
        //         res.push(obj);
        //     } else {
        //         var segList = obj.functionSegList;
        //         for (var j = 0; j < segList.length; j++) {
        //             var clone = Object.assign(new FuncSegment, segList[j]);
        //             clone.isRepeat = true;
        //             res.push(clone);
        //         }
        //     }
        // }
        // return res;
    }, 

    /**
     * Returns true if this EvolvingFunction contains
     * a repeating segment (ie, contains a RepFuncSegment)
     *
     * @returns {Boolean}
     */
    hasRepeat: function() {
        if (RepFuncSegment != null) {
            return true;
        }
        return false; 
        // Original function
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     //convert instanceof to backbone version 
        //     if (this.functionSegList[i] instanceof RepFuncSegmentModel) {
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
    getStartRepeatEpoch: function() {
        if (RepFuncSegment != null) {
            var RepFuncSegmentList = this.RepFuncSegment.get('functionSegList');
            return RepFuncSegmentList[0].get('startTP');
        }  
        // Original function        
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     if (this.functionSegList[i] instanceof RepFuncSegmentModel) {
        //         return this.functionSegList[i].functionSegList[0].get('startTP');
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
    // TODO update this function - is this its intended behavior?
    getEndRepeatEpoch: function() {
        if (RepFuncSegment != null) {
            var RepFuncSegmentList = this.RepFuncSegment.get('functionSegList');
            var len = RepFuncSegmentList.length;
            return RepFuncSegmentList[len - 1].get('stopTP');
        }  
        // Original function
        // for (var i = 0; i < this.functionSegList.length; i++) { 
        //     if (this.functionSegList[i] instanceof RepFuncSegmentModel) {
        //         var len = this.functionSegList[i].functionSegList.length;
        //         return this.functionSegList[i].functionSegList[len - 1].stopTP;
        //     }
        // }
    }, 

    /**
     * Returns the repNum attribute for this EvolvingFunction's
     * RepFuncSegment
     *
     * Precondition: This EvolvingFunction must contain a RepFuncSegment
     *
     * @returns {Number}
     */
    getRepeatRepNum: function() {
        if (RepFuncSegment != null) {
            return this.RepFuncSegment.get('repNum');
        }        
        // Original function
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     //convert instanceof to backbone version 
        //     if (this.functionSegList[i] instanceof RepFuncSegmentModel) {
        //         return this.functionSegList[i].repNum;
        //     }
        // }
    }, 

    /**
     * Returns the absRepTime attribute for this EvolvingFunction's
     * RepFuncSegment
     *
     * Precondition: This EvolvingFunction must contain a RepFuncSegment
     *
     * @returns {Number}
     */
    getRepeatAbsTime: function() {
        if (RepFuncSegment != null) {
            return this.RepFuncSegment.get('absRepTime');
        }
        // Original function
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     //convert instanceof to backbone version 
        //     if (this.functionSegList[i] instanceof RepFuncSegmentModel) {
        //         return this.functionSegList[i].absTime;
        //     }
        // }
    }, 
}); 