myNull = null;
/** 
 * This file contains Backbone Models for:
 *  FunctionSegment
 *  EvolvingFunction
 *  Intention
 */

/** 
 * Backbone Model of An Atomic Function Segment
 * 
 * @param {String} type
 * Atomic function types
 * @param {String} refEvidencePair
 * Corresponds to....
 * @param {String} startTP
 * Start time point (char) 0,A,B,C
 * @param {Integer} startAT
 * Assigned/Absolute Time - Integer time value
 * 
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
 *  
 * @param {String} type
 * Named types on view list
 * @param {Array} functionSegList
 * Array containing FunctionSegmentBBMs
 * @param {Boolean} hasRepeat
 * true/false depending on if there is a repeating segment
 * @param {String} repStart
 * Start time point (char) 0,A,B,C
 * @param {String} repStop
 * Stop time point (char) A,B,C,D
 * @param {Integer} repCount
 * Number of times the repeating segment repeats
 * @param {Integer} repAbsTime
 * Assigned/Absolute Time of the repeating segment - Integer time value
 * 
 */
var EvolvingFunctionBBM = Backbone.Model.extend({
 
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

    /**
     * Returns the 4 digit representation for this
     * EvolvingFunctionBBM's nth last function segment's
     * refEvidencePair value. If there are no function segments, the function
     * does not return anything.
     */
    getNthRefEvidencePair: function(n) { 
        console.log(this.get('functionSegList'));
        if (this.get('functionSegList') != null) {
            var len = this.get('functionSegList').length; 
        if (len > 0) {  
            var funcSegList = this.get('functionSegList');
            return funcSegList[len - n].get('refEvidencePair'); 
        }
        
        }
            else {console.log("hi");}
    }, 

    /**
     * Creates a new RepFuncSegment object from the parameters start, stopRep, 
     * count, and absTime which are entered in the Element Inspector view. 
     * 
     * @param {String} start
     *  Start time point (char) 0,A,B,C
     * @param {String} stopRep
     *  Start time point (char) A,B,C,D
     * @param {Integer} count
     *  Number of times repeated segment is repeated 
     * @param {Integer} absTime
     *  Absolute time of repeating segment 
     */
    setRepeatingFunction: function(start, stopRep, count, absTime) {

        this.removeRepFuncSegments();
        hasRepeat = true;                        
        
        repStart = start;
        repStop = stopRep;
        repCount = count;
        repAbsTime = absTime;


        
    },            

    /**
     * All of the parameters for a repeating segment are reset to the default,
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
    },    

});

/**
 * Backbone Model of Intention
 * 
 * @param {String} nodeName
 * @param {String} nodeActorID
 * ID of the Actor the Intention belongs to
 * @param {String} nodeType
 * Type of node. Ex: task, goal
 * @param {EvolvingFunctionBBM} evolvingFunction
 * If there is an evolving function this will contain an EvolvingFunctionBBM
 * @param {String} initialValue
 * String of numbers that represents the initial satisfaction value
 */
var IntentionBBM = Backbone.Model.extend({
    initialize: function(options) { 
        _.extend({}, this.defaults, options) 
    }, 
    defaults: { 
        nodeName: 'untitled',
        nodeActorID: null,                     // Assigned on release operation.
        nodeType: null,
        evolvingFunction: null, 
        initialValue: '(no value)'
    }, 

    /**
    * @returns Array of FunctionSegmentBBMs, or null if it is not an evolvingFunction
    */
    getFuncSegments: function(){
        evolvingFunc = this.get('evolvingFunction');
        if (evolvingFunc != null){
            console.log(evolvingFunc.get('functionSegList'));
            return evolvingFunc.get('functionSegList');
        }
        return null;
    },
 
    /**
     * Called whenever the user changes or removes the Initial Satisfaction Value
     * in the Element Inspector. Called on Chnage for #init-sat-value 
     * 
     * Sets the refEvidence pair based on the chosen initValue
     * 
     * @param {*} initValue 
     */
    changeInitialSatValue: function(initValue) {
        // var intentionEval = graph.get('userEvaluationList').(this.get('cid'), '0');

        var intentionEval = graph.getUserEvaluationBBM(this.cid, '0');
        intentionEval.set('assignedEvidencePair', initValue);
        
 
        // if there is only one function segment, and its constant, then we need to
        // change the function segment's marked value
 
        var funcSegList = this.getFuncSegments();
        
        if (this.evolvingFunction != null) {
        if (this.evolvingFunction.get('type') == 'C' || 
            (this.evolvingFunction.get('type') == 'UD' && funcSegList[0].get('type') == 'C')) { 
                this.getFuncSegments().set('refEvidencePair', initValue); 
            }
        this.evolvingFunction.set('type', 'NT');
        this.evolvingFunction.set('functionSegList', []);
        }
        
    }, 
 
    /**
     * Sets the initial satisfaction value for this Intention to '(no value)'
     */
    removeInitialSatValue: function() {
        this.changeInitialSatValue('(no value)');
    },    
 
    /**
     * Returns the 4 digit representation for the
     * Intention's initial satisfaction value
     *
     * @returns {String}
     */
    getInitialSatValue: function() {

        var intentionEval = graph.getUserEvaluationBBM(this.cid, '0');
        if (typeof intentionEval == 'undefined'){
            return '(no value)';
        } else {
            console.log(intentionEval.get('assignedEvidencePair'));
            return intentionEval.get('assignedEvidencePair');
        }
    }, 
 
    /**
     * Resets evolving functions
     */
    removeFunction: function() {
        this.removeAbsConstraint();
        this.evolvingFunction = null; 
        // this.evolvingFunction.get('cid') = this.get('cid'); 
    }, 
 
    /**
     * Clears all FuncSegments for the Intention's
     * EvolvingFunction and adds new FuncSegments according to the current
     * function type.
     * Called when user changes the function type in Element Inspector 
     * @param {String} funcType
     */
    setEvolvingFunction: function(funcType) {
        // if (this.evolvingFunction != null) {
        //     this.evolvingFunction.set('functionSegList', []);
        // }
        this.set('evolvingFunction', new EvolvingFunctionBBM({type: funcType}));

        // Since function changed, remove all current absolute constraints related to this intention
        this.removeAbsConstraint();
 
        // Add new absolute constraints if required
        this.addAbsConstraint(funcType);
 
        // var initValue = graph.get('userEvaluationList').get(this.cid, '0').get('assignedEvidencePair');
        var initValue = graph.getUserEvaluationBBM(this.cid, '0').get('assignedEvidencePair');
        console.log(initValue);
 
        // All instances of FuncSegment have been changed to FunctionSegmentBBM and the initialization process has 
        // also been changed accordingly 
        if (funcType == 'C' || funcType == 'R' || funcType == 'I' || funcType == 'D' || funcType == 'UD') {
            if (funcType == 'C') {
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: initValue, startTP: '0', startAT: 0});  
            } else if (funcType == 'R') {
                // The reference evidence pair for a Stochastic function is always 0000
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: '(no value)', startTP: '0', startAT: 0}); 
            } else if (funcType == 'I' || funcType == 'D') {
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: null, startTP: '0', startAT: 0}); 
            } else if (funcType == 'UD') {
                var seg =  new FunctionSegmentBBM({type: 'C', refEvidencePair: initValue, startTP: '0', startAT: 0}); 
            }
            console.log(this.get('evolvingFunction').get('functionSegList'));

            this.getFuncSegments().push(seg);
            console.log(seg);
            console.log(this.get('evolvingFunction').get('functionSegList'));
        } else if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' || funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            if (funcType == 'RC') {
                // Stochastic and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'R', refEvidencePair: '(no value)', startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: null, startTP: 'A', startAT: myNull}); 
            } else if (funcType == 'CR') {
                // Constant and Stochastic
                var seg1 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: initValue, startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'R', refEvidencePair: '(no value)', startTP: 'A', startAT: myNull}); 
            } else if (funcType == 'MP') {
                // Increase and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'I', refEvidencePair: null, startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: null, startTP: 'A', startAT: myNull}); 
            } else if (funcType == 'MN') {
                // Decrease and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'D', refEvidencePair: null, startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: null, startTP: 'A', startAT: myNull}); 
            } else if (funcType == 'SD') {
                // Constant and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '0011', startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '1100', startTP: 'A', startAT: myNull}); 
                // graph.get('userEvaluationList').get(this.cid, "0").get('assignedEvidencePair') = '0011';
                graph.getUserEvaluationBBM(this.cid, '0').set('assignedEvidencePair', '0011');
            } else if (funcType == 'DS') {
                // Constant and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '1100', startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '0011', startTP: 'A', startAT: myNull}); 
                // graph.get('userEvaluationList').get(this.cid, "0").get('assignedEvidencePair') = '1100';
                graph.getUserEvaluationBBM(this.cid, '0').set('assignedEvidencePair', '1100');
            }
            this.getFuncSegments().push(seg1, seg2);
        }
    }, 
 
    /**
     * Adds a new Constraint object int the global graph variable,
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
            graph.get('constraints').push(new ConstraintBBM({type: 'A', srcID: this.cid, srcRefTP: 'A', destID: null, destRefTP: null}));
        }
    }, 
 
 
    /**
     * Returns the Intention's absolute start time at the starting epoch boundary
     * @param {String} source
     *  ex. 'A'
     */
    getAbsConstTime: function(source) {
        if (this.get('evolvingFunction').get('startTP') == source) {
            return this.get('evolvingFunction').get('startAT')
        }
    }, 
 
    /**
     * Removes the absolute Constraint object(s) for the Intention from
     * the global graph variable, if such absolute Constraint object(s) exists
     */

    removeAbsConstraint: function() {
        // TODO - this function works, but i don't think it works correctly 
        var i = 0;
        while (i < graph.get('constraints').length) {
            var constraint = graph.get('constraints');
            if (constraint.get('type') == 'A' && constraint.get('srcID') === this.cid) {
                graph.get('constraints').splice(i, 1);
            } else {
                i++;
            }
        }
    }, 
 
    /**
     * Adds a new FunctionSegmentBBM to the end of this Intention's EvolvingFunction's
     * function list.
 
     * Also adds a corresponding Constraint object reprenting an absolute constraint
     * into the global graph variable.
     *
     *This function should only be used to add new function
     * segments for user defined functions
     *
     * @param {String} funcType
     *   ex: 'C'
     * @param {String} refEvidencePair
     *   ex: '0000'
     * @param {Integer} startTime
     */
    addUserDefinedSeg: function(funcType, refEvidencePair, startTime){
 
        var len = this.getFuncSegments().length;
        var startCheck = this.getFuncSegments()[len - 1].get('startTP');
        if (startCheck == '0') {
            var start = 'A';
        }        
        else {
            var start = String.fromCharCode(startCheck.charCodeAt(0) + 1);
        }
 
        //create new funcsegment model 
        var new_model = new FunctionSegmentBBM({type: funcType, refEvidencePair: refEvidencePair, startTP: start, startAT: myNull}); 
        this.getFuncSegments().push(new_model); 
 
        //graph.get('constraints').push(new ConstraintBBM({type: 'A', srcID: this.get('cid'), srcRefTP: start, destID: null, destRefTP: null}));
 
    }, 
    /**
     * Sets the marked value for the FunctionSegmentBBMs in the
     * EvolvingFunction for the Intention
     *
     * This function will only be called for I, D, RC, MP, MN functions
     * @param {String} satValue
     * ex: '0000'
     */
    setMarkedValueToFunction: function(satValue) {
        if (this.evolvingFunction != null) {
            var funcType = this.evolvingFunction.get('type');
        }
        else { var funcType = null; }
 
        var len = this.getFuncSegments().length;
        this.getFuncSegments()[len - 1].set('refEvidencePair', satValue);
 
        if (funcType == 'MP' || funcType == 'MN') {
            this.getFuncSegments()[0].set('refEvidencePair', satValue);
        }
    }, 
 
    /**
     * Sets the function type and marked value for the
     * last FunctionSegmentBBM for the Intention's EvolvingFunction
     *
     * @param {String} funcValue
     */
    setUserDefinedSegment: function(funcValue) {
        if (this.getFuncSegments() != null) {
            var funcSegLen = this.getFuncSegments().length;
        }
        else {var funcSegLen = null;};
        console.log(funcSegLen);
        var functionSegment = this.getFuncSegments()[funcSegLen - 1];
        functionSegment.set('type', funcValue); 
        if (funcValue == 'C' || funcValue =='R') {
            functionSegment.set('refEvidencePair', '0000');
        } 
    }, 

        /**
     * Sets the satisfaction value for the last function segment
     * in this Intention's evolving function, to satVal
     *
     * @param {String} satVal
     *   ex: '0000'
     */
    updateLastFuncSegSatVal(satVal) {
        var funcSegList = this.getFuncSegments();
        var funcSegLen = this.getFuncSegments().length;
    
        var lastObj = funcSegList[funcSegLen - 1];
        lastObj.set('refEvidencePair', satVal);
    },
});


