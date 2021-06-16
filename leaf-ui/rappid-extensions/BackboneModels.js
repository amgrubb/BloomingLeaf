/** This file contains backbone model representations of the original model objects - WIP */


// FuncSegmentModel from FuncSegment class in modelObjects.js
var FuncSegmentModel = Backbone.Model.extend({
    idAttribute: "uid",

    // initialize function - could also save all of the input parameters into one variable 
    // 'options' and then use that like Yesuegen 
    initialize: function (options) {
        this.funcType = options.funcType;
        this.funcX = options.funcX;
        this.funcStart = options.funcStart;
        this.funcStop = options.funcStop;
    },
});

//RepFuncSegmentMOdel from RepFuncSegment class in modelObjects.js
var RepFuncSegmentModel = Backbone.Model.extend({
    idAttribute: "uid",

    initialize: function(options) { 
        this.functionSegList = options.functionSegList; 
        this.repNum = options.repNum; 
        this.absTime = options.absTime; 
    }

});     

