/** This file contains backbone model representations of the original model objects - WIP */


// FuncSegmentModel from FuncSegment class in modelObjects.js
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

//RepFuncSegmentMOdel from RepFuncSegment class in modelObjects.js
var RepFuncSegmentBBM = Backbone.Model.extend({
    idAttribute: "uid",

    initialize: function(options) { 
        // this functionSegList is an array of all of the FunctionSegmentBBMs in the RepFuncSegmentBBM
        this.functionSegList = options.functionSegList; 
        this.repNum = options.repNum; 
        this.absRepTime = options.absRepTime; 
    }

});     
