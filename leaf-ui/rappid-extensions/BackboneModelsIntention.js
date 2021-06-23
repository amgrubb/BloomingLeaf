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
        // Removed stopTP variable - stopTP is one letter after startTP or A is startTP is 0
        this.startAT = options.startAT; // Assigned/Absolute Time - Integer time value. If not set defaults to undefined
    }
});

/** 
 * Backbone Model of Evolving Functions
 *      TODO: Finish migration from modelObjects.js
 */
var EvolvingFunctionBBM = Backbone.Model.extend({
    //initialize: function() { 
    //}, 
 
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
     * EvolvingFunction's nth last function segment's
     * marked value value. If there are no function segments, the function
     * does not return anything.
     */
    getNthRefEvidencePair: function(n) { 
        var len = this.functionSegList.length; 
        if (len > 0 && index <= len) {  
            return this.functionSegList[len - n].get('refEvidencePair'); 
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
    // TODO fix this function
    // I think we should set it so that the repeating function starts at time 1 and ends at 
    // time 2
    setRepeatingFunction: function(start, stopRep, count, absTime) {

        this.removeRepFuncSegments();
        hasRepeat = true;                        
        
        repStart = start;
        repStop = stopRep;
        repCount = count;
        repAbsTime = absTime;


        
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
     * Deleted Functions in EvolvingFunctionBBM
     * All of these functions were either never used or are now not needed b/c of refactor
     * 
     * getRepeatAbsTime: function() {},
     * getRepeatRepNum: function() {},
     * hasRepeat: function() {}, 
     * setAbsoluteTime: function(time) {},
     * setRepNum: function(num) {},
     * getFuncSegmentIterable: function() {},
     * getRepFuncSegmentIndex: function() {},  
     * getLastStopValue: function() {},
     * getMarkedVal: function(i) {},  
     * findSegmentByStartTime: function(time) {}, 
     * getStartRepeatEpoch
     * getEndRepeatEpoch
     */


});

var IntentionBBM = Backbone.Model.extend({
    initialize: function(options) { 
        _.extend({}, this.defaults, options) 
    }, 
    defaults: { 
        nodeName: 'untitled',
        nodeActorID: null,                     // Assigned on release operation.
        evolvingFunction: null, 
        nodeActorID: null,                     // Assigned on release operation.
        initialValue: '(no value)'
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
    },
 
    //will likely have to change this function 
    changeInitialSatValue: function(initValue) {
        var intentionEval = graph.get('userEvaluationList').set('id', '0');
        intentionEval.get('assignedEvidencePair') = initValue;
 
        // if there is only one function segment, and its constant, then we need to
        // change the function segment's marked value
 
        var funcSegList = this.getFuncSegments();
        
        if (this.evolvingFunction.get('type') == 'C' || 
            (this.evolvingFunction.get('type') == 'UD' && funcSegList[0].get('type') == 'C')) { 
                functionSegList[0].set('refEvidencePair', initValue); 
            }
        this.evolvingFunction.set('type', 'NT');
        this.evolvingFunction.set('functionSegList', []);
    }, 
 
    /**
     * Sets the initial satisfaction value for this Intention to '(no value)'
     */
    removeInitialSatValue: function() {
        this.changeInitialSatValue('(no value)');
    },    

    /**
     * Sets newID as the new ID for this intention
     */
    // TODO - update this function
    // if we are using the automatically generated 'id', then we can just call 
    // it whenever we need?? and would we be not allowed to change it??
    setNewID: function(newID) {
        var oldID = this.get('id');   
        this.set('id', newID); 
        this.evolvingFunction.set('id', newID); 
 
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
        //var intentionEval = graph.getUserEvaluationByID(this.get('id'), '0');
        //TODO: Fix this 
        var intentionEval = graph.get('userEvaluationList').set('id', '0');
        if (typeof intentionEval == 'undefined'){
            return '(no value)';
        } else {
            return intentionEval.get('assignedEvidencePair');
        }
    }, 
 
    /**
     * Resets dynamic function
     */
    removeFunction: function() {
        this.removeAbsConstraint();
        this.evolvingFunction = new EvolvingFunctionBBM(); 
        // Set evolving function id to intention's id 
        this.evolvingFunction.get('id') = this.get('id'); 
    }, 
 
    /**
     * Clears all FuncSegments for this Intention's
     * EvolvingFunction and adds new FuncSegments according to the current
     * function type.
     */
    setEvolvingFunction: function(funcType) {
        this.evolvingFunction.set('type', funcType);
        this.evolvingFunction.set('functionSegList', []);

        // Since function changed, remove all current absolute constraints related to this intention
        this.removeAbsConstraint();
 
        // Add new absolute constraints if required
        this.addAbsConstraint(funcType);
 
        var initValue = graph.get('userEvaluationList').set('id', '0').get('assignedEvidencePair');
 
        // All instances of FuncSegment have been changed to FunctionSegmentBBM and the initialization process has 
        // also been changed accordingly 
        if (funcType == 'C' || funcType == 'R' || funcType == 'I' || funcType == 'D' || funcType == 'UD') {
            if (funcType == 'C') {
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: initValue, startTP: '0', startAT: 0});  
            } else if (funcType == 'R') {
                // the marked value for a Stochastic function is always 0000
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: '0000', startTP: '0', startAT: 0}); 
            } else if (funcType == 'I' || funcType == 'D') {
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: null, startTP: '0', startAT: 'Infinity'}); 
            } else if (funcType == 'UD') {
                var seg =  new FunctionSegmentBBM({type: 'C', refEvidencePair: initValue, startTP: '0', startAT: 'A'}); 
            }
            this.getFuncSegments().push(seg);
        } else if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' || funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            if (funcType == 'RC') {
                // Stochastic and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'R', refEvidencePair: '0000', startTP: '0', startAT: 'A'}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: null, startTP: 'A', startAT: 'Infinity'}); 
            } else if (funcType == 'CR') {
                // Constant and Stochastic
                var seg1 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: initValue, startTP: '0', startAT: 'A'}); 
                var seg2 =  new FunctionSegmentBBM({type: 'R', refEvidencePair: '0000', startTP: 'A', startAT: 'Infinity'}); 
            } else if (funcType == 'MP') {
                // Increase and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'I', refEvidencePair: null, startTP: '0', startAT: 'A'}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: null, startTP: 'A', startAT: 'Infinity'}); 
            } else if (funcType == 'MN') {
                // Decrease and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'D', refEvidencePair: null, startTP: '0', startAT: 'A'}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: null, startTP: 'A', startAT: 'Infinity'}); 
            } else if (funcType == 'SD') {
                // Constant and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '0011', startTP: '0', startAT: 'A'}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '1100', startTP: 'A', startAT: 'Infinity'}); 
                analysisRequest.getUserEvaluationByID(this.get('id'), "0").evaluationValue = '0011';
            } else if (funcType == 'DS') {
                // Constant and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '1100', startTP: '0', startAT: 'A'}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '0011', startTP: 'A', startAT: 'Infinity'}); 
                graph.getUserEvaluationByID(this.get('id'), "0").get('assignedEvidencePair') = '1100';
            }
            this.getFuncSegments().push(seg1, seg2);
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
    addAbsConstraint: function(funcType) {
        if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' ||
            funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            graph.constraints.push(new ConstraintBBM({type: 'A', srcID: this.get('id'), srcRefTP: 'A', destID: null, destRefTP: null}));
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

    removeAbsConstraint: function() {
        var i = 0;
        while (i < graph.constraints.length) {
            var constraint = graph.constraints.models[i];
            if (constraint.get('type') == 'A' && constraint.get('srcID') === this.get('id')) {
                graph.constraints.splice(i, 1);
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
    addUserDefinedSeg: function(funcType, satValue, startTime){
 
        var len = this.getFuncSegments().length;
        var startCheck = this.evolvingFunction.getFuncSegments()[len - 1].get('startTP');
        if (startCheck == '0') {
            var start = 'A';
        }        
        else {
            var start = String.fromCharCode(startCheck.charCodeAt(0) + 1);
        }
 
        //create new funcsegment model 
        var new_model = new FunctionSegmentBBM({type: funcType, refEvidencePair: satValue, startTP: start, startAT: startTime}); 
        this.getFuncSegments().push(new_model); 
 
        graph.get('constraints').push(new ConstraintBBM({type: 'A', srcID: this.get('id'), srcRefTP: start, destID: null, destRefTP: null}));
 
    }, 
    /**
     * Sets the marked value for the FuncSegments in the
     * EvolvingFunction for this Intention
     *
     * This function will only be called for I, D, RC, MP, MN functions
     */
    setMarkedValueToFunction: function(satValue) {
        var funcType = this.evolvingFunction.get('type');
 
        var len = this.getFuncSegments().length;
        this.getFuncSegments()[len - 1].set('refevidencePair', satValue);
 
        if (funcType == 'MP' || funcType == 'MN') {
            this.getFuncSegments()[0].set('refEvidencePair', satValue);
        }
    }, 
 
    /**
     * Sets the function type and marked value for the
     * last FuncSegment for this Intention's EvolvingFunction
     *
     * @param {String} funcValue
     */
    setUserDefinedSegment: function(funcValue) {
        var funcSegLen = this.getFuncSegments().length;
        var functionSegment = this.getFuncSegments()[funcSegLen - 1];
        functionSegment.set('type', funcValue); 
        if (funcValue == 'C' || funcValue =='R') {
            funcSeg.set('refEvidencePair', '0000');
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
        var funcSegList = this.getFuncSegments();
        var funcSegLen = this.getFuncSegments().length;
 
        var lastObj = funcSegList[funcSegLen - 1];
        lastObj.set('refEvidencePair', satVal);
 
        // If instance of funcsegment backbone model 
        /*
        if (lastObj instanceof FunctionSegmentBBM) {
            // used to be .funcX
            lastObj.set('refEvidencePair', satVal); 
        } 
        else {
            // the last segment is inside of the repeat range and is
            // stored inside of the RepFuncSegment object
            var repSegList = lastObj.funcSegList;
            var repSegLen = repSegList.length;
            // used to be .funcX
            repSegList[repSegLen - 1].set('refEvidencePair', satVal); 
        }
        */
    }, 
    /**
     * Deleted Functions
     * createID() 
     */
});


