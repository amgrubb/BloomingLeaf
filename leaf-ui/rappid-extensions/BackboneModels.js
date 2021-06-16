/** This file contains backbone model representations of the original model objects - WIP */


// FuncSegmentModel from FuncSegment class in modelObjects.js
var FuncSegmentModel = Backbone.Model.extend({
    idAttribute: "uid",

    // initialize function - could also save all of the input parameters into one variable 
    // 'options' and then use that like Yesuegen 
    initialize: function (funcType, funcX, funcStart, funcStop) {
        this.funcType = options.funcType;
        this.funcX = options.funcX;
        this.funcStart = options.funcStart;
        this.funcStop = options.funcStop;
    },
});

var RepFuncSegmentModel = Backbone.Model.extend({
    idAttribute: "uid",

    initialize: function(functionSegList, repNum, absTime) { 
        this.functionSegList = functionSegList; 
        this.repNum = repNum; 
        this.absTime = absTime; 
    }

});     
