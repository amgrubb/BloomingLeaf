// var FuncSegmentModel = Backbone.Model.extend({
//     idAttribute: "uid",

//     initialize: function(options) { 
//         this.funcType = options.funcType;
//         this.funcX = options.funcX;
//         this.funcStart = options.funcStart;
//         this.funcStop = options.funcStop;
//     }

// });    

// var RepFuncSegmentModel = Backbone.Model.extend({
//     idAttribute: "uid",

//     initialize: function(options) { 
//         this.functionSegList = options.functionSegList; 
//         this.repNum = options.repNum; 
//         this.absTime = options.absTime; 
//     }

// });     

/** This file contains backbone model representations of the original model objects - WIP */
var EvolvingFunction = Backbone.Model.extend({
    initialize: function(options) { 
        //phase this out?
        //this.intentionID = options.intentionID; 
        //not completely sure about this line 
        this.nodeID = options.nodeID; 
        //perhaps create models for funcsegmentmodel and repfuncsegment here(?)
    }, 

    defaults: { 
        stringDynVis: 'NT',  
        functionSegList: [], 
    }, 

    /* Returns the 4 digit representation for this
     * EvolvingFunction's ith function segment's 
     * satisfaction value
     */ 
    getMarkedVal: function(i) { 
        return this.functionSegList[i].funcX; 
    }, 

     /**
     * Returns the 4 digit representation for this
     * EvolvingFunction's last function segment's
     * marked value value
     */
    getLastMarkedVal: function() { 
        var len = this.functionSegList.length; 
        if (len > 0) { 
            return this.functionSegList[len - 1].funcX; 
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
            return this.functionSegList[len - 2].funcX; 
        } else { 
            return this.getLastMarkedVal(); 
        }
    }, 

    /**
     * Returns the funcStop value for the last
     * function segment for this EvolvingFunction
     * Returns null if functionSegList is empty
     *
     * returns {String | null}
     */
    getLastStopValueL: function() {
        len = this.functionSegList.length
        if (len > 0) {
            return this.functionSegList[len - 1].funcStop;
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
    setRepeatingFunction: function(time1, time2) {

        this.removeRepFuncSegments();

        // find the index of the FuncSegment with start time time 1
        var startIndex = 0;
        while (this.functionSegList[startIndex].funcStart !== time1) {
            startIndex++;
        }

        var repFuncSegments = [];

        // push and remove, until we see a segment with our desired FuncEnd time
        while (this.functionSegList[startIndex].funcStop !== time2) {
            repFuncSegments.push(this.functionSegList[startIndex]);
            this.functionSegList.splice(startIndex, 1);
        }

        // push and remove the last segment
        repFuncSegments.push(this.functionSegList[startIndex]);
        this.functionSegList.splice(startIndex, 1);


        // create and add a new RepFuncSegment
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
    findSegmentByStartTime: function(time) {
        for (var i = 0; i < this.functionSegList; i++) {
            if (this.functionSegList[i].funcStart === time) {
                return this.functionSegList[i];
            }
        }
    }, 

    /**
     * If a RepFuncSegment exists in this EvolvingFunction's
     * functionSegList, retrieve the FuncSegments in the RepFuncSegment,
     * remove the RepFuncSEgment and add the retrieved FuncSegments back
     * into their correct positions in functionSegList
     *
     * Id a RepFuncSegment does not exist in functionSegList, this function
     * does nothing
     */
    removeRepFuncSegments: function() {

        var repIndex = this.getRepFuncSegmentIndex();
        if (repIndex === -1) {
            return;
        }

        var repFuncSegment = this.functionSegList[repIndex];
        // remove RepFuncSegment object from array
        this.functionSegList.splice(repIndex, 1);

        // add the FuncSegments back into the array
        var j = repIndex;
        for (var i = 0; i < repFuncSegment.functionSegList.length; i++) {
            this.functionSegList.splice(j, 0, repFuncSegment.functionSegList[i]);
            j++;
        }
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
        var repIndex = this.getRepFuncSegmentIndex();
        if (repIndex === -1) {
            return;
        }
        this.functionSegList[repIndex].repNum = num;
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
        var repIndex = this.getRepFuncSegmentIndex();
        if (repIndex === -1) {
            return;
        }
        this.functionSegList[repIndex].absTime = time;
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
     * Returns true iff this EvolvingFunction contains
     * a repeating segment (ie, contains a RepFuncSegment)
     *
     * @returns {Boolean}
     */
    hasRepeat: function() {
        for (var i = 0; i < this.functionSegList.length; i++) {
            //convert instanceof to backbone version 
            if (this.functionSegList[i] instanceof RepFuncSegment) {
                return true;
            }
        }
        return false;
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
        for (var i = 0; i < this.functionSegList.length; i++) {
            //convert instanceof to backbone version 
            if (this.functionSegList[i] instanceof RepFuncSegment) {
                return this.functionSegList[i].functionSegList[0].funcStart;
            }
        }
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
    getEndRepeatEpoch: function() {
        for (var i = 0; i < this.functionSegList.length; i++) {
            //convert instanceof to backbone version 
            if (this.functionSegList[i] instanceof RepFuncSegment) {
                var len = this.functionSegList[i].functionSegList.length;
                return this.functionSegList[i].functionSegList[len - 1].funcStop;
            }
        }
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
        for (var i = 0; i < this.functionSegList.length; i++) {
            //convert instanceof to backbone version 
            if (this.functionSegList[i] instanceof RepFuncSegment) {
                return this.functionSegList[i].repNum;
            }
        }
    }, 

    /**
     * Returns the absTime attribute for this EvolvingFunction's
     * RepFuncSegment
     *
     * Precondition: This EvolvingFunction must contain a RepFuncSegment
     *
     * @returns {Number}
     */
    getRepeatAbsTime: function() {
        for (var i = 0; i < this.functionSegList.length; i++) {
            //convert instanceof to backbone version 
            if (this.functionSegList[i] instanceof RepFuncSegment) {
                return this.functionSegList[i].absTime;
            }
        }
    }, 
}); 