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

var IntentionBBM = Backbone.Model.extend({
    initialize: function(options) { 
        this.nodeType = options.nodeType;  
    }, 
    defaults: { 
        nodeName: 'untitled',
        nodeActorID: null,                     // Assigned on release operation.
        evolvingFunction: null, 
        initialValue: '(no value)'
    }, 
 
    //will likely have to change this function 
    changeInitialSatValue: function(initValue) {
        var intentionEval = analysisRequest.getUserEvaluationByID(this.get('id'), '0');
        intentionEval.evaluationValue = initValue;
 
        // if there is only one function segment, and its constant, then we need to
        // change the function segment's marked value
 
        var funcSegList = this.dynamicFunction.functionSegList;
        
        // if (this.dynamicFunction.stringDynVis == 'C' ||
        //     (this.dynamicFunction.stringDynVis == 'UD' && funcSegList[0].funcType == 'C')) {
        //     funcSegList[0].funcX = initValue;
        // }
 
        this.dynamicFunction.stringDynVis = 'NT';
        this.dynamicFunction.functionSegList = [];
    }, 
 
    /**
     * Sets the initial satisfaction value for this Intention to '(no value)'
     */
    removeInitialSatValue: function() {
        this.changeInitialSatValue('(no value)');
    }, 
 
    /**
     * Creates and returns a 4 digit ID for this node
     *
     * @returns {String}
     */
    createID: function() {
        var id = IntentionBBM.numOfCreatedInstances.toString();
        IntentionBBM.numOfCreatedInstances += 1;
        while (id.length < 4){
                id = '0' + id;
        }
        return id;
    }, 
 
    /**
     * Sets newID as the new ID for this intention
     */
    setNewID: function(newID) {
        var oldID = this.get('id');
        this.get('id') = newID;
        this.dynamicFunction.intentionID = newID;
 
        // UserAssignementsList
        var userAssignList = analysisRequest.userAssignmentsList;
        for (var i = 0; i < userAssignList.length; i++) {
            if (userAssignList[i].intentionID === oldID) {
                userAssignList[i].intentionID = newID;
            }
        }
 
        // Links
        var links = model.links;
        for (var i = 0; i < links.length; i++) {
            if (links[i].linkSrcID === oldID) {
                links[i].linkSrcID = newID;
            }
            if (links[i].linkDestID === oldID) {
                links[i].linkDestID = newID;
            }
        }
        
        // Constraints
        var consts = model.constraints;
        for (var i = 0; i < consts.length; i++) {
            if (consts[i].constraintSrcID === oldID) {
                consts[i].constraintSrcID = newID;
            }
            if (consts[i].constraintDestID === oldID) {
                consts[i].constraintDestID = newID;
            }
        }
 
    }, 
 
    /**
     * Returns the 4 digit representation for this
     * Intention's initial satisfaction value
     *
     * @returns {String}
     */
    getInitialSatValue: function() {
        var intentionEval = analysisRequest.getUserEvaluationByID(this.get('id'), '0');
        if (typeof intentionEval == 'undefined'){
            return '(no value)';
        } else {
            return intentionEval.evaluationValue;
        }
    }, 
 
    /**
     * Resets dynamic function
     */
    removeFunction: function() {
        this.removeAbsCosnt();
        //may have to update the parameter 
        this.dynamicFunction = new EvolvingFunctionBBM({nodeID: this.get('id')}); 
    }, 
 
    /**
     * Returns the number of function segments for this
     * Intention
     *
     * @returns {Number}
     */
    getNumOfFuncSegments: function() {
        return this.dynamicFunction.getFuncSegmentIterable().length;
    }, 
 
    /**
     * Clears all FuncSegments for this Intention's
     * EvolvingFunction and adds new FuncSegments according to the current
     * function type.
     */
    setEvolvingFunction: function(funcType) {
        this.dynamicFunction.stringDynVis = funcType;
        this.dynamicFunction.functionSegList = [];
 
        // Since function changed, remove all current absolute constraints related to this intention
        this.removeAbsCosnt();
 
        // Add new absolute constraints if required
        this.addAbsConst(funcType);
 
        var initValue = analysisRequest.getUserEvaluationByID(this.get('id'), '0').evaluationValue;
 
        // All instances of FuncSegment have been changed to FuncSegmentBBM and the initialization process has 
        // also been changed accordingly 
        if (funcType == 'C' || funcType == 'R' || funcType == 'I' || funcType == 'D' || funcType == 'UD') {
            if (funcType == 'C') {
                //var seg = new FuncSegment(funcType, initValue, '0', 'Infinity');
                var seg =  new FuncSegmentBBM({funcType: funcType, funcX: initValue, funcStart: 0, funcStop: Infinity});  
            } else if (funcType == 'R') {
                //var seg = new FuncSegment(funcType, '0000', '0', 'Infinity');
                var seg =  new FuncSegmentBBM({funcType: funcType, funcX: '0000', funcStart: '0', funcStop: Infinity}); 
                // the marked value for a Stochastic function is always 0000
            } else if (funcType == 'I' || funcType == 'D') {
                //var seg = new FuncSegment(funcType, null, '0', 'Infinity');
                var seg =  new FuncSegmentBBM({funcType: funcType, funcX: null, funcStart: '0', funcStop: 'Infinity'}); 
            } else if (funcType == 'UD') {
                //var seg = new FuncSegment('C', initValue, '0', 'A');
                var seg =  new FuncSegmentBBM({funcType: 'C', funcX: initValue, funcStart: '0', funcStop: 'A'}); 
            }
            this.dynamicFunction.functionSegList.push(seg);
        } else if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' || funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            if (funcType == 'RC') {
                // Stochastic and Constant
                // var seg1 = new FuncSegment('R', '0000', '0', 'A');
                var seg1 =  new FuncSegmentBBM({funcType: 'R', funcX: '0000', funcStart: '0', funcStop: 'A'}); 
                // var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
                var seg2 =  new FuncSegmentBBM({funcType: 'C', funcX: null, funcStart: 'A', funcStop: 'Infinity'}); 
            } else if (funcType == 'CR') {
                // Constant and Stochastic
                // var seg1 = new FuncSegment('C', initValue, '0', 'A');
                var seg1 =  new FuncSegmentBBM({funcType: 'C', funcX: initValue, funcStart: '0', funcStop: 'A'}); 
                // var seg2 = new FuncSegment('R', '0000', 'A', 'Infinity');
                var seg2 =  new FuncSegmentBBM({funcType: 'R', funcX: '0000', funcStart: 'A', funcStop: 'Infinity'}); 
            } else if (funcType == 'MP') {
                // Increase and Constant
                // var seg1 = new FuncSegment('I', null, '0', 'A');
                var seg1 =  new FuncSegmentBBM({funcType: 'I', funcX: null, funcStart: '0', funcStop: 'A'}); 
                // var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
                var seg2 =  new FuncSegmentBBM({funcType: 'C', funcX: null, funcStart: 'A', funcStop: 'Infinity'}); 
            } else if (funcType == 'MN') {
                // Decrease and Constant
                // var seg1 = new FuncSegment('D', null, '0', 'A');
                var seg1 =  new FuncSegmentBBM({funcType: 'D', funcX: null, funcStart: '0', funcStop: 'A'}); 
                // var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
                var seg2 =  new FuncSegmentBBM({funcType: 'C', funcX: null, funcStart: 'A', funcStop: 'Infinity'}); 
            } else if (funcType == 'SD') {
                // Constant and Constant
                // var seg1 = new FuncSegment('C', '0011', '0', 'A');
                var seg1 =  new FuncSegmentBBM({funcType: 'C', funcX: '0011', funcStart: '0', funcStop: 'A'}); 
                // var seg2 = new FuncSegment('C', '1100', 'A', 'Infinity');
                var seg2 =  new FuncSegmentBBM({funcType: 'C', funcX: '1100', funcStart: 'A', funcStop: 'Infinity'}); 
                analysisRequest.getUserEvaluationByID(this.get('id'), "0").evaluationValue = '0011';
            } else if (funcType == 'DS') {
                // Constant and Constant
                // var seg1 = new FuncSegment('C', '1100', '0', 'A');
                var seg1 =  new FuncSegmentBBM({funcType: 'C', funcX: '1100', funcStart: '0', funcStop: 'A'}); 
                // var seg2 = new FuncSegment('C', '0011', 'A', 'Infinity');
                var seg2 =  new FuncSegmentBBM({funcType: 'C', funcX: '0011', funcStart: 'A', funcStop: 'Infinity'}); 
                analysisRequest.getUserEvaluationByID(this.get('id'), "0").evaluationValue = '1100';
            }
            this.dynamicFunction.functionSegList.push(seg1, seg2);
        }
    }, 
 
    /**
     * Adds a new Constraint object int the global model variable,
     * representing an absolute constraint, if requried.
     *
     * If funcType is RC, CR, MP, MN, SD, DS  a Constraint object
     * representing an absolute constraint will be added. If not, this
     * function does not do anything
     *
     * @param {String} funcType
     *   ex: 'RC'
     */
    addAbsConst: function(funcType) {
        if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' ||
            funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            model.constraints.push(new ConstraintBBM({type: 'A', srcID: this.get('id'), srcRefTP: 'A', destID: null, destRefTP: null}));
        }
    }, 
 
 
    /**
     * Returns the absolute time for this Intention's absolute constraint at
     * the starting epoch boundary start
     *
     * @param {String} source
     *  ex. 'A'
     */
    getAbsConstTime: function(source) {
        return model.getAbsConstBySrcID(this.get('id'), source).absoluteValue;
    }, 
 
    /**
     * Removes the absolute Constraint object(s) for this Intention from
     * the global model variable, if such absolute Constraint object(s) exists
     */
    removeAbsCosnt: function() {
        var i = 0;
        while (i < model.constraints.length) {
            var constraint = model.constraints[i];
            if (constraint.constraintType == 'A' && constraint.constraintSrcID === this.get('id')) {
                model.constraints.splice(i, 1);
            } else {
                i++;
            }
        }
    }, 
 
    /**
     * Adds a new FuncSeg to the end of this Intention's EvolvingFunction's
     * function list.
 
     * Also adds a corresponding Constraint object reprenting an absolute constraint
     * into the global model variable.
     *
     *This function should only be used to add new function
     * segments for user defined functions
     *
     * @param {String} funcType
     *   ex: 'C'
     * @param {String} satValue
     *   ex: '0000'
     */
    addUserDefinedSeg: function(funcType, satValue){
 
        var len = this.dynamicFunction.functionSegList.length;
        var start = this.dynamicFunction.functionSegList[len - 1].funcStop;
        var code = start.charCodeAt(0) + 1;
        var stop = String.fromCharCode(code);
 
        //may have to revert this change 
        var new_model = new FuncSegmentBBM(); 
        var model_options = ({funcType: funcType, funcX: satValue, funcStart: start, funcStop: stop})
        new_model.initialize(model_options); 
        //this.dynamicFunction.functionSegList.push(new FuncSegment(funcType, satValue, start, stop));
        this.dynamicFunction.functionSegList.push(new_model); 
 
        model.constraints.push(new ConstraintBBM({type: 'A', srcID: this.get('id'), srcRefTP: start, destID: null, destRefTP: null}));
 
    }, 
    /**
     * Sets the marked value for the FuncSegments in the
     * EvolvingFunction for this Intention
     *
     * This function will only be called for I, D, RC, MP, MN functions
     */
    setMarkedValueToFunction: function(satValue) {
        var funcType = this.dynamicFunction.stringDynVis;
 
        var len = this.dynamicFunction.functionSegList.length;
        this.dynamicFunction.functionSegList[len - 1].funcX = satValue;
 
        if (funcType == 'MP' || funcType == 'MN') {
            this.dynamicFunction.functionSegList[0].funcX = satValue;
        }
    }, 
 
    /**
     * Sets the function type and marked value for the
     * last FuncSegment for this Intention's EvolvingFunction
     *
     * @param {String} funcValue
     */
    setUserDefinedSegment: function(funcValue) {
        var funcSegLen = this.dynamicFunction.functionSegList.length;
        var funcSeg = this.dynamicFunction.functionSegList[funcSegLen - 1];
        funcSeg.funcType = funcValue;
        if (funcValue == 'C') {
            funcSeg.funcX == '0000';
        } else if (funcValue == 'R') {
            // the marked value for a Stochastic function is always 0000
            funcSeg.funcX = '0000';
        }
    }, 
 
    /**
     * Sets the satisfaction value for the last function segment
     * in this Intention's evolving function, to satVal
     *
     * @param {String} satVal
     *   ex: '0000'
     */
    updateLastFuncSegSatVal: function(satVal) {
        var funcSegList = this.dynamicFunction.functionSegList;
        var funcSegLen = this.dynamicFunction.functionSegList.length;
 
        var lastObj = funcSegList[funcSegLen - 1];
 
        // If instance of funcsegment backbone model 
        if (lastObj instanceof FuncSegmentBBM) {
            lastObj.funcX = satVal;
 
        } else {
            // the last segment is inside of the repeat range and is
            // stored inside of the RepFuncSegment object
            var repSegList = lastObj.functionSegList;
            var repSegLen = repSegList.length;
            repSegList[repSegLen - 1].funcX = satVal;
        }
    }, 
});
IntentionBBM.numOfCreatedInstances = 0; // static variable to keep track of number of instances
 

