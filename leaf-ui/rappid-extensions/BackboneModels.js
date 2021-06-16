/** This file contains backbone model representations of the original model objects - WIP */


// FuncSegmentModel from FuncSegment class in modelObjects.js
var FunctionSegmentBBM = Backbone.Model.extend({
    idAttribute: "uid",

    // initialize function - could also save all of the input parameters into one variable 
    // 'options' and then use that like Yesuegen 
    initialize: function (options) {
        this.type = options.type;
        this.refEvaluationValue = options.refEvaluationValue;
        this.startTP = options.startTP;
        this.stopTP = options.stopTP;
    },
});

//RepFuncSegmentMOdel from RepFuncSegment class in modelObjects.js
var RepFuncSegmentModel = Backbone.Model.extend({
    idAttribute: "uid",

    initialize: function(options) { 
        this.functionSegList = options.functionSegList; 
        this.repNum = options.repNum; 
        this.absRepTime = options.absRepTime; 
    }

});     

