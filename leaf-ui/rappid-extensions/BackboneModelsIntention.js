myNull = null;
/** 
 * This file contains Backbone Models for:
 *  FunctionSegment
 *  EvolvingFunction
 *  UserEvaluation
 *  UserEvaluationCollection
 *  Intention
 */

/** 
 * Backbone Model of UserEvaluations 
 */ 
 var UserEvaluationBBM = Backbone.Model.extend({  
    initialize: function(options){  
        _.extend({}, this.defaults, options)    
    },

    defaults: function(){ 
        return {
            assignedEvidencePair: '(no value)', //Evidence Pair
            absTime: 0, // Integer Value 
        }
    }
});

var UserEvaluationCollection = Backbone.Collection.extend({
    model: UserEvaluationBBM
});

/** 
 * Backbone Model of An Atomic Function Segment
 * 
 * @param {String} type
 * Atomic function types
 * @param {String} refEvidencePair
 * String of numbers that represents the satisfaction value
 * @param {String} startTP
 * Start time point (char) 0,A,B,C
 * @param {Integer} startAT
 * Assigned/Absolute Time - Integer time value
 * @param {Boolean} current
 * True if FunctionSegmentBBM is the most recent and enabled, false if not most recent and it becomes disabled
 * 
 */
var FunctionSegmentBBM = Backbone.Model.extend({

    initialize: function (options) {
        _.extend({}, this.defaults, options)
    },
    defaults: function(){ 
        return {
            type:'Constant',           // Atomic function types. 
            refEvidencePair: 0000,   //a.k.a. Evaluation Value
            startTP: 0,             // Start time point (char) 0,A,B,C
            // Removed stopTP variable - stopTP is one letter after startTP or A is startTP is 0
            startAT: myNull, // Assigned/Absolute Time - Integer time value. If not set defaults to undefined
            current: true
        }
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
 
    // The default function sets the default values for the EvolvingFunctionBBM
    defaults: function(){ 
        // The return resets the attributes if EvolvingFunctionBBM is recreated
        return {
            type: 'NT',                  // Named types on view list, was stringDynVis
            // Array functionSegList contains all of the FunctionSegment models (and only FunctionSegment models)
            functionSegList: [],        //of type FunctionSegmentBBM

            hasRepeat: false,
            repStart: null,         // 0, A, B, ..
            repStop: null,          // B, C, D, ..
            repCount: null,         // 2, 3, ..n
            repAbsTime: null,       // 0, 1, ..n
        }
       
    },

    /**
     * Returns the 4 digit representation for this
     * EvolvingFunctionBBM's nth last function segment's
     * refEvidencePair value. If there are no function segments, the function
     * does not return anything.
     */
    getNthRefEvidencePair: function(n) { 
        if (this.get('functionSegList') != null) {
            var len = this.get('functionSegList').length; 
            var funcSegList = this.get('functionSegList');
            if (len > 1) {    
                return funcSegList[len - n].get('refEvidencePair'); 
            }   
            else { // If the len is 1, can only return that FunctionSegmentBBM's refEvidencePair
                return funcSegList[0].get('refEvidencePair');
            }     
        }
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
        this.set('hasRepeat', true);                         
        this.set('repStart', start);
        this.set('repStop', stopRep);
        this.set('repCount', count);
        this.set('repAbsTime', absTime);
    },            

    /**
     * All of the parameters for a repeating segment are reset to the default,
     * which means there is no loner a repeating function segment in the EvolvingFunctionBBM     *  
     */ 
    removeRepFuncSegments: function() {
        this.set('hasRepeat', false);                         
        this.set('repStart', null);
        this.set('repStop', null);
        this.set('repCount', null);
        this.set('repAbsTime', null);
    },    

});

/**
 * Backbone Model of Intention
 * 
 * @param {String} nodeName
 * @param {EvolvingFunctionBBM} evolvingFunction
 * If there is an evolving function this will contain an EvolvingFunctionBBM
 * @param {Array} userEvaluationList
 * a collection of UserEvaluationBBMs
 */
var IntentionBBM = Backbone.Model.extend({

    initialize: function(options) { 
        _.extend({}, this.defaults, options) 
    }, 

    defaults: function(){ 
        return {
            nodeName: 'untitled',
            evolvingFunction: null, 
            userEvaluationList: []
        }
    }, 

    /**
     * Allows you to find the UserEvaluationBBM with the specified absTime
     * If there is no UserEvaluationBBM with that absTime, return null
     * 
     * @param {Integer} absTime 
     * Absolute Time - Integer time value
     * @returns an UserEvaluationBBM or null
     */
    getUserEvaluationBBM: function(absTime) {
        userEvals = this.get('userEvaluationList').filter(userEval => userEval.get('absTime') == absTime);
        if (userEvals.length > 0){
            return userEvals[userEvals.length-1]
        }
        return null;
    },

    /**
     * @param {Integer} TP1 
     * @param {Integer} TP2 
     * @returns Last UserEvaluationBBMs between TP1 and TP2, or null if there is none
     */
    getLastUserEvaluationBetweenTPs: function(TP1, TP2){
        var userEvals = this.get('userEvaluationList').filter(userEval => userEval.get('absTime') >= TP1 && userEval.get('absTime') < TP2);
        if (userEvals.length > 0){
            return userEvals[userEvals.length-1];
        }
        return null;
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
 
    /**
     * Called whenever the user changes or removes the Initial Satisfaction Value
     * in the Element Inspector. Called on Change for #init-sat-value 
     * 
     * Sets the refEvidence pair based on the chosen initValue
     * 
     * @param {String} initValue 
     */
    changeInitialSatValue: function(initValue) {
        // Set the the first element of userEvaluationList to the initValue
        this.getUserEvaluationBBM(0).set('assignedEvidencePair', initValue);
        
        if (this.get('evolvingFunction') != null) {
            var funcSegList = this.getFuncSegments();
            // If the function is C or UD & C set refEvidencePair to initValue
            if (this.get('evolvingFunction').get('type') == 'C') { 
                    funcSegList[0].set('refEvidencePair', initValue); // Set first index of funcSegList to given initValue 
            }
            else {
            // If the function is not C or UD & C, reset the function type and clear the functionSegList
            this.get('evolvingFunction').set('type', 'NT');
            this.get('evolvingFunction').set('functionSegList', []);
           }
        }     
    }, 
 
    /**
     * Sets the initial satisfaction value for this Intention to '(no value)'
     */
    removeInitialSatValue: function() {
        this.changeInitialSatValue('(no value)');
    },    
 
    /**
     * Resets evolving functions
     */
    // TODO: this function will need to be updated 
    removeFunction: function() {
        // this.removeAbsConstraint();
        this.set('evolvingFunction', null); // Set to null 
    }, 
 
    /**
     * Clears all FuncSegments for the Intention's
     * EvolvingFunction and adds new FuncSegments according to the current
     * function type.
     * Called when user changes the function type in Element Inspector 
     * @param {String} funcType
     */
    setEvolvingFunction: function(funcType) {
        this.set('evolvingFunction', new EvolvingFunctionBBM({type: funcType, functionSegList: []}));
        var initValue = this.getUserEvaluationBBM(0).get('assignedEvidencePair');



        var seg2 = null;
        // Creates the correct FunctionSegmentBBM(s) for the selected function type
        switch(funcType) {
            case 'NT': 
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: '(no value)', startTP: '0', startAT: 0});
                break;
            case 'C':
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: initValue, startTP: '0', startAT: 0});  
                break;
            case 'R':
                //The reference evidence pair for a Stochastic function is always 0000
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: '(no value)', startTP: '0', startAT: 0});
                break;
            case 'I':
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: '0011', startTP: '0', startAT: 0}); 
                break;
            case 'D':
                var seg =  new FunctionSegmentBBM({type: funcType, refEvidencePair: '1100', startTP: '0', startAT: 0}); 
                break;
            case 'UD':
                var seg =  new FunctionSegmentBBM({type: 'C', refEvidencePair: initValue, startTP: '0', startAT: 0}); 
                break;
            case'RC':
                // Stochastic and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'R', refEvidencePair: '(no value)', startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: initValue, startTP: 'A', startAT: myNull}); 
                break;
            case 'CR':
                // Constant and Stochastic
                var seg1 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: initValue, startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'R', refEvidencePair: '(no value)', startTP: 'A', startAT: myNull}); 
                break;
            case 'MP':
                // Increase and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'I', refEvidencePair: '0011', startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '0011', startTP: 'A', startAT: myNull}); 
                break;
            case 'MN':
                // Decrease and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'D', refEvidencePair: '1100', startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '1100', startTP: 'A', startAT: myNull}); 
                break;
            case 'SD':
                // Constant and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '0011', startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '1100', startTP: 'A', startAT: myNull}); 
                this.getUserEvaluationBBM(0).set('assignedEvidencePair', '0011');
                break;
            case 'DS':
                // Constant and Constant
                var seg1 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '1100', startTP: '0', startAT: 0}); 
                var seg2 =  new FunctionSegmentBBM({type: 'C', refEvidencePair: '0011', startTP: 'A', startAT: myNull}); 
                this.getUserEvaluationBBM(0).set('assignedEvidencePair', '1100');
                break;
        }
        // Pushes the FunctionSegmentBBM(s) to functionSegList
        if (seg2 == null) {
            this.getFuncSegments().push(seg);
        }
        else {
            this.getFuncSegments().push(seg1, seg2);
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
    addUserDefinedSeg: function(funcType, refEvidencePair){
        var len = this.getFuncSegments().length;
        var startCheck = this.getFuncSegments()[len - 1].get('startTP'); // Get last value in list 
        if (startCheck == '0') { // If previous segment is at 0 then next one is at A
            var start = 'A';
        } else { // Otherwise, for following segment increase letter by one 
            var start = String.fromCharCode(startCheck.charCodeAt(0) + 1); 
        }
 
        // Create new FunctionSegmentBBM and adds it to functionSegList 
        this.getFuncSegments().push(new FunctionSegmentBBM({type: funcType, refEvidencePair: refEvidencePair, startTP: start, startAT: myNull})); 
 
    }, 
    /**
     * Sets the refEvidencePair for the FunctionSegmentBBMs in the
     * EvolvingFunction for the Intention
     *
     * @param {String} satValue
     * ex: '0000'
     */
    // TODO: i think we are going to have to change this function when we add views for the FunctionSegmentBBMs
    setMarkedValueToFunction: function(satValue) {
        if (this.get('evolvingFunction') != null) {
            var funcType = this.get('evolvingFunction').get('type'); 
        } else { 
            var funcType = null; 
        }
 
        var len = this.getFuncSegments().length;
        this.getFuncSegments()[len - 1].set('refEvidencePair', satValue); // Set refEvidencePair for last value 
 
        if (funcType == 'MP' || funcType == 'MN') {
            this.getFuncSegments()[0].set('refEvidencePair', satValue); // Set refEvidencePair for initial value 
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
            var functionSegment = this.getFuncSegments()[funcSegLen - 1];
            functionSegment.set('type', funcValue); // Set type 
            if (funcValue == 'C' || funcValue =='R') {
                functionSegment.set('refEvidencePair', '0000'); // Set refEvidencePair
            }
        }     
    },
});

