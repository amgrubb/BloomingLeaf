/** Models for the Analysis Mode AnalysisInspector.js and Analysis Configuration Sidebars */

/**
 * Model for results
 * 
 * Attributes:
 * {String} name
 * {AnalysisResult} analysisResult
 * 
 */
// TODO: Break AnalysisResult into params
var ResultModel = Backbone.Model.extend({
    idAttribute: "uid",

    defaults: {
        name:"Default Result",
        analysisResult: new AnalysisResult(),
    },
});

/**
 * Collection that holds results for analysis configurations
 * 
 * {ResultModel} model
 */
var ResultCollection = Backbone.Collection.extend({
    model: ResultModel,
    
    /** Used for eventually storing and accessing collection on server */
    url: "/results",
});

/**
 * Model for analysis configurations
 * 
 * Attributes:
 * {String} action
 * {String} conflictLevel
 * {String} numRelTime
 * {String} absTimePts
 * {String} currentState
 * {Array.<UserEvaluation>} userAssignmentsList
 * {AnalysisResult} previousAnalysis
 * 
 */
var ConfigModel = Backbone.Model.extend({
    initialize : function(){
        this.results = new ResultCollection([]);
    },

    idAttribute: "uid",

    defaults: {
        name:"Default Config",
        action: null,
        conflictLevel: "S",
        numRelTime: "1",
        absTimePts: "",
        absTimePtsArr: [],
        currentState: "0",
        userAssignmentsList : [],
        previousAnalysis: null,
        selected: true,
        results : new ResultCollection([])
    },

    // Will be called to add a new result model to the results param
    // when the backend returns an AnalysisResult
    addResult : function(result){
        var newResultModel = new ResultModel({name: this.attributes.results.length+1, analysisResult : result, selected: true});
        this.get("results").add(newResultModel);
    },
});

/**
 * Collection that holds analysis configurations
 * 
 * {ConfigModel} model
 */
var ConfigCollection = Backbone.Collection.extend({
    model: ConfigModel,

    /** Used for eventually storing and accessing collection on server */
    url: "/configurations",

    initialize: function(){
        this.on('add', this.onSelectedChanged, this);
    },

    // When config is clicked/selected, find previously selected config and unselect it. 
    onSelectedChanged : function(changedConfig){
        this.filter(configModel => configModel.get('selected') == true && changedConfig != configModel)
            .forEach(model => model.set('selected', false));
    },
});
