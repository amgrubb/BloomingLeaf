/** This file contains backbone model representations of the original model objects - WIP */
// FunctionSegmentModel from FunctionSegment class in modelObjects.js
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

//RepFunctionSegmentMOdel from RepFunctionSegment class in modelObjects.js
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
   
// Backbone Model of Evolving Function Class on modelObjects.js
var EvolvingFunctionBBM = Backbone.Model.extend({
    idAttribute: "uid",

    initialize: function(options) { 
        //this.intentionID = options.intentionID; 
        this.nodeID = options.nodeID;  
        // Not Sure if calling the other models inside this one is done correctly
        var FunctionSegmentBBM = new FunctionSegmentBBM({}); // Eventually add all of the FunctionSegment parameters here
        var RepFunctionSegment = new RepFunctionSegmentModel({}); // Eventually add all of the RepFunctionSegment parameters here
        
    }, 

    defaults: { 
        stringDynVis: 'NT',  
        // There can only be one RepFunctionSegment
        // If there is a RepFunctionSegment, input a RepFunctionSegment model into this parameter
        RepFunctionSegment: null,
        // Array functionSegList contains all of the FunctionSegment models (and only FunctionSegment models)
        functionSegList: [], 
    }, 

    // Currently, any functions that iterate over functionSegmentList do not iterate over 
    // The RepFunctionSegment if there is one


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
     * Creates a new RepFunctionSegment object containing function
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

        this.removeRepFunctionSegments();

        // find the index of the FunctionSegment with start time time 1
        var startIndex = 0;
        while (this.functionSegList[startIndex].get('startTP') !== time1) {
            startIndex++;
        }

        // TODO (??)
        var repFunctionSegments = [];

        // push and remove, until we see a segment with our desired FuncEnd time
        while (this.functionSegList[startIndex].get('stopTP') !== time2) {
            repFunctionSegments.push(this.functionSegList[startIndex]);
            this.functionSegList.splice(startIndex, 1);
        }

        // push and remove the last segment
        repFunctionSegments.push(this.functionSegList[startIndex]);
        this.functionSegList.splice(startIndex, 1);


        // create and add a new RepFunctionSegment
        // TODO this should be a backbone model
        var repFunctionSegment = new RepFunctionSegment(repFunctionSegments);
        this.functionSegList.splice(startIndex, 0, repFunctionSegment);
    }, 

    /**
     * Returns the FunctionSegmentBBM in this EvolvingFunction's
     * functionSegList, with the relative start time time
     *
     * @param {String} time
     * @returns {FunctionSegmentBBM}
     */
    // TODO update this function
    // Currently, this function does not iterate over the FunctionSegmentBBMs in RepFunctionSegments
    findSegmentByStartTime: function(time) {
        for (var i = 0; i < this.functionSegList; i++) {
            if (this.functionSegList[i].get('startTP') === time) {
                return this.functionSegList[i];
            }
        }
    }, 

    /**
     * If a RepFunctionSegment exists in this EvolvingFunction's
     * functionSegList, retrieve the FunctionSegmentBBMs in the RepFunctionSegmentBBM,
     * remove the RepFunctionSegment and add the retrieved FunctionSegmentBBMs back
     * into their correct positions in functionSegList
     *
     * Id a RepFunctionSegment does not exist in functionSegList, this function
     * does nothing
     */
    // TODO update this function so it's right
    // unsure abt this function
    removeRepFunctionSegments: function() {
        if (RepFunctionSegment != null) {
            this.getFunctionSegmentIterable();
            RepFunctionSegment = null;   
        }   
        // Original function
        // var repIndex = this.getRepFunctionSegmentIndex();
        // if (repIndex === -1) {
        //     return;
        // }

        // var repFunctionSegment = this.functionSegList[repIndex];
        // // remove RepFunctionSegment object from array
        // this.functionSegList.splice(repIndex, 1);

        // // add the FunctionSegments back into the array
        // var j = repIndex;
        // for (var i = 0; i < repFunctionSegment.functionSegList.length; i++) {
        //     this.functionSegList.splice(j, 0, repFunctionSegment.functionSegList[i]);
        //     j++;
        // }
    }, 

    /**
     * Sets the repNum for the RepFunctionSegment inside of this
     * EvolvingFunction's functionSegList, to count
     *
     * If there is no RepFunctionSegment object in functionSegList
     * this function does nothing
     *
     * @param {Number} count
     */
    setRepNum: function(num) {
        if (RepFunctionSegment != null) {
            this.RepFunctionSegment.set('repNum', num);    
        }   
        // Original function
        // var repIndex = this.getRepFunctionSegmentIndex();
        // if (repIndex === -1) {
        //     return;
        // }
        // this.functionSegList[repIndex].repNum = num;
    }, 


    /**
     * Sets the absTime for the RepFunctionSegment inside of this
     * EvolvingFunction's functionSegList, to time
     *
     * If there is no RepFunctionSegment object in functionSegList
     * this function does nothing
     *
     * @param {Number} time
     */
    setAbsoluteTime: function(time) {
        if (RepFunctionSegment != null) {
            this.RepFunctionSegment.set('absRepTime', time);    
        }   
        // Original function
        // var repIndex = this.getRepFunctionSegmentIndex();
        // if (repIndex === -1) {
        //     return;
        // }
        // this.functionSegList[repIndex].get('absRepTime') = time;
    }, 



    /**
     * Returns the index of the RepFunctionSegment object
     * in this EvolvingFunction's functionSegList
     *
     * Returns -1 if there is no RepFunctionSegment object
     * in functionSegList
     *
     * @returns {Number}
     */
    // TODO update this function
    // There will not be a repFunctionSegmentIndex inside this.functionSegLis
    // It's poosible we can just delete this
    getRepFunctionSegmentIndex: function() {
        // Find the index where the RepFunctionSegment is located
        var repIndex = 0;
        while (repIndex < this.functionSegList.length && (!(this.functionSegList[repIndex] instanceof RepFunctionSegmentModel))) {
            repIndex++;
        }

        // RepFunctionSegment did not exist in functionSegList
        if (repIndex >= this.functionSegList.length) {
            return - 1;
        }

        return repIndex;
    }, 

    /**
     * Returns an array containing FunctionSegmentBBM objects, for the
     * purpose of easy iteration. This function is useful when
     * the functionSegList contains both FunctionSegmentBBMs and
     * repFunctionSegments.
     *
     * For example, if functionSegList contains a FunctionSegmentBBM
     * and a repFunctionSegmentBBM containing three FunctionSegmentBBMs inside of it,
     * this function returns an array of size 4, containing all the
     * function segments in chronological order.
     *
     * Every FunctionSegmentBBM in the returned array will be a deep copy of the
     * origin FunctionSegmentBBMs.
     *
     * Each FunctionSegmentBBM in the returned array will have a inRepeat attribute
     * which evaluates to true if the FunctionSegmentBBM was part of a
     * repFunctionSegmentBBM
     *
     * @returns {Array.<FunctionSegment>}
     */
    // TODO update this function - very unsure abt code/logic here
    // Add all FunctionSegmentBBMs to array and all FunctionSegmentBBMs in RepFunctionSegmentBBM
    // To the same array in chronilogical order
    getFunctionSegmentIterable: function() {
        var res [];
        var repFunctionSegmentList = this.RepFunctionSegment.get('functionSegList');
        var repStartTime = repFunctionSegmentList[0].get('startTP');
        // iterates over all of the FunctionSegmentBBMs and adds them to new array
        for (var i = 0; i < this.functionSegList.length; i++) {
            var obj = this.functionSegList[i].clone();
            // if the start the current functionSegmentBBM's start time is before the first 
            // start time of the RepFunctionSegmentBBMs, add it to array
            if (this.functionSegList[i].get('startTP') <= repStartTime) {
            res.push(obj);
            }
            // if its larger, add all of the FunctionSegementBBMs in the RepFunctionSegmentBBM
            // to the array first
            else {
                if (RepFunctionSegment != null) {
                    for (var i = 0; i < this.RepFunctionSegment.get('functionSegList').length; i++) {
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
        //     if (obj instanceof FunctionSegmentModel) {
        //         var clone = Object.assign(new FunctionSegment, obj); // deep copy
        //         clone.isRepeat = false;
        //         res.push(obj);
        //     } else {
        //         var segList = obj.functionSegList;
        //         for (var j = 0; j < segList.length; j++) {
        //             var clone = Object.assign(new FunctionSegment, segList[j]);
        //             clone.isRepeat = true;
        //             res.push(clone);
        //         }
        //     }
        // }
        // return res;
    }, 

    /**
     * Returns true if this EvolvingFunction contains
     * a repeating segment (ie, contains a RepFunctionSegment)
     *
     * @returns {Boolean}
     */
    hasRepeat: function() {
        return (RepFunctionSegment != null)
        // Original function
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     //convert instanceof to backbone version 
        //     if (this.functionSegList[i] instanceof RepFunctionSegmentModel) {
        //         return true;
        //     }
        // }
        // return false;
    }, 

    /**
     * Returns the epoch boundary where the repeat segment
     * starts
     *
     * Precondition: This EvolvingFunction must contain a RepFunctionSegment
     *
     * @returns {String}
     *   ex: 'A'
     */
    getStartRepeatEpoch: function() {
        if (RepFunctionSegment != null) {
            var RepFunctionSegmentList = this.RepFunctionSegment.get('functionSegList');
            return RepFunctionSegmentList[0].get('startTP');
        }  
        // Original function        
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     if (this.functionSegList[i] instanceof RepFunctionSegmentModel) {
        //         return this.functionSegList[i].functionSegList[0].get('startTP');
        //     }
        // }
    }, 

    /**
     * Returns the epoch boundary where the repeat segment
     * ends
     *
     * Precondition: This EvolvingFunction must contain a RepFunctionSegment
     *
     * @returns {String}
     *   ex: 'C'
     */
    // TODO update this function - is this its intended behavior?
    getEndRepeatEpoch: function() {
        if (RepFunctionSegment != null) {
            var RepFunctionSegmentList = this.RepFunctionSegment.get('functionSegList');
            var len = RepFunctionSegmentList.length;
            return RepFunctionSegmentList[len - 1].get('stopTP');
        }  
        // Original function
        // for (var i = 0; i < this.functionSegList.length; i++) { 
        //     if (this.functionSegList[i] instanceof RepFunctionSegmentModel) {
        //         var len = this.functionSegList[i].functionSegList.length;
        //         return this.functionSegList[i].functionSegList[len - 1].stopTP;
        //     }
        // }
    }, 

    /**
     * Returns the repNum attribute for this EvolvingFunction's
     * RepFunctionSegment
     *
     * Precondition: This EvolvingFunction must contain a RepFunctionSegment
     *
     * @returns {Number}
     */
    getRepeatRepNum: function() {
        if (RepFunctionSegment != null) {
            return this.RepFunctionSegment.get('repNum');
        }        
        // Original function
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     //convert instanceof to backbone version 
        //     if (this.functionSegList[i] instanceof RepFunctionSegmentModel) {
        //         return this.functionSegList[i].repNum;
        //     }
        // }
    }, 

    /**
     * Returns the absRepTime attribute for this EvolvingFunction's
     * RepFunctionSegment
     *
     * Precondition: This EvolvingFunction must contain a RepFunctionSegment
     *
     * @returns {Number}
     */
    getRepeatAbsTime: function() {
        if (RepFunctionSegment != null) {
            return this.RepFunctionSegment.get('absRepTime');
        }
        // Original function
        // for (var i = 0; i < this.functionSegList.length; i++) {
        //     //convert instanceof to backbone version 
        //     if (this.functionSegList[i] instanceof RepFunctionSegmentModel) {
        //         return this.functionSegList[i].absTime;
        //     }
        // }
    }, 
}); 