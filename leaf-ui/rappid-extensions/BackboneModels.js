/** This file contains backbone model representations of the original model objects - WIP */
var Intention = Backbone.Model.extend({
    idAttribute: "uid", 
    //not sure if this is correct(?)
    nodeID: this.createID(), 

    //might have to change these two 
    initialize: function(options) { 
        this.nodeActorID = options.nodeActorID; 
        this.nodeType = options.nodeType; 
        this.nodeName = options.nodeName; 
        var dynamicFunction =  new EvolvingFunction(); 
        var evolvingFunctionOptions = ''; 
        dynamicFunction.initialize(evolvingFunctionOptions);  
    }, 

    /**
     * Changes the initial satisfaction value for this Intention
     * to initValue and clears the this Intention's EvolvingFunction's
     * functionSegmentList
     *
     * @param {String} initValue
     */
    changeInitialSatValue: function(initValue) {
        var intentionEval = analysisRequest.getUserEvaluationByID(this.nodeID, '0');
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
        //may have to change this 
        var id = Intention.numOfCreatedInstances.toString();
        Intention.numOfCreatedInstances += 1;
        while (id.length < 4){
                id = '0' + id;
        }
        return id;
    }, 

    /**
     * Sets newID as the new nodeID for this intention
     */
    setNewID: function(newID) {
        var oldID = this.nodeID;
        this.nodeID = newID;
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
        var intentionEval = analysisRequest.getUserEvaluationByID(this.nodeID, '0');
        if (typeof intentionEval == 'undefined'){
            return "(no value)";
        } else {
            return intentionEval.evaluationValue;
        }
    }, 

    /**
     * Resets dynamic function
     */
    removeFunction: function() {
        this.removeAbsCosnt();
        this.dynamicFunction = new EvolvingFunction(this.nodeID);
    }, 

    /**
     * Returns the number of function segments for this
     * Intention
     *
     * @returns {Number}
     */
    getNumOfFuncSegements: function() {
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

        var initValue = analysisRequest.getUserEvaluationByID(this.nodeID, '0').evaluationValue;

        if (funcType == 'C' || funcType == 'R' || funcType == 'I' || funcType == 'D' || funcType == 'UD') {
            if (funcType == 'C') {
                var seg = new FuncSegment(funcType, initValue, '0', 'Infinity');
            } else if (funcType == 'R') {
                // the marked value for a Stochastic function is always 0000
                var seg = new FuncSegment(funcType, '0000', '0', 'Infinity');
            } else if (funcType == 'I' || funcType == 'D') {
                var seg = new FuncSegment(funcType, null, '0', 'Infinity');
            } else if (funcType == 'UD') {
                var seg = new FuncSegment('C', initValue, '0', 'A');
            }
            this.dynamicFunction.functionSegList.push(seg);
        } else if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' || funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            if (funcType == 'RC') {
                // Stochastic and Constant
                var seg1 = new FuncSegment('R', '0000', '0', 'A');
                var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
            } else if (funcType == 'CR') {
                // Constant and Stochastic
                var seg1 = new FuncSegment('C', initValue, '0', 'A');
                var seg2 = new FuncSegment('R', '0000', 'A', 'Infinity');
            } else if (funcType == 'MP') {
                // Increase and Constant
                var seg1 = new FuncSegment('I', null, '0', 'A');
                var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
            } else if (funcType == 'MN') {
                // Decrease and Constant
                var seg1 = new FuncSegment('D', null, '0', 'A');
                var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
            } else if (funcType == 'SD') {
                // Constant and Constant
                var seg1 = new FuncSegment('C', '0011', '0', 'A');
                var seg2 = new FuncSegment('C', '1100', 'A', 'Infinity');
                analysisRequest.getUserEvaluationByID(this.nodeID, "0").evaluationValue = '0011';
            } else if (funcType == 'DS') {
                // Constant and Constant
                var seg1 = new FuncSegment('C', '1100', '0', 'A');
                var seg2 = new FuncSegment('C', '0011', 'A', 'Infinity');
                analysisRequest.getUserEvaluationByID(this.nodeID, "0").evaluationValue = '1100';
            }
            this.dynamicFunction.functionSegList.push(seg1, seg2);
        }
    }, 

    /**
     * Adds a new Constraint object int the global model variable,
     * representing an absolute constraint, if requried.
     *
     * If funcType is RC, CR, MP, MN, SD, DS  a Constraint object
     * representin an absolute constraint will be added. If not, this
     * function does not do anything
     *
     * @param {String} funcType
     *   ex: 'RC'
     */
    addAbsConst: function(funcType) {
        if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' ||
            funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            model.constraints.push(new Constraint('A', this.nodeID, 'A', null, null));
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
        return model.getAbsConstBySrcID(this.nodeID, source).absoluteValue;
    }, 

    /**
     * Removes the absolute Constraint object(s) for this Intention from
     * the global model variable, if such absolute Constraint object(s) exists
     */
    removeAbsCosnt: function() {
        var i = 0;
        while (i < model.constraints.length) {
            var constraint = model.constraints[i];
            if (constraint.constraintType == 'A' && constraint.constraintSrcID === this.nodeID) {
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
        this.dynamicFunction.functionSegList.push(new FuncSegment(funcType, satValue, start, stop));
        model.constraints.push(new Constraint('A', this.nodeID, start, null, null));

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

        if (lastObj instanceof FuncSegment) {
            lastObj.funcX = satVal;

        } else {
            // the last segment is inside of the repeat range and is
            // stored inside of the RepFuncSegment object
            var repSegList = lastObj.functionSegList;
            var repSegLen = repSegList.length;
            repSegList[repSegLen - 1].funcX = satVal;
        }
    }, 
})
Intention.numOfCreatedInstances = 0; // static variable to keep track of number of instances
