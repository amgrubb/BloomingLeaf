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
        selected: true,
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

    initialize : function(){
        this.on('add', this.onSelectedChanged, this);
        this.on('change:switchResults', this.onSelectedChanged, this);
    },

    /** When result is clicked/selected, find previously selected result and unselect it */ 
    onSelectedChanged : function(changedResult){
        this.filter(resultModel => resultModel.get('selected') == true && changedResult != resultModel)
            .forEach(model => model.set('selected', false));
    },
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
        this.results = new ResultCollection([]); //why do we need []????
        this.listenTo(this, 'change:selected', this.updateSelected);
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
        results : new ResultCollection([]) //line 60 and 77 the same????
    },

    /**
     * Will be called to add a new result model to the results param
     * when the backend returns an AnalysisResult
     */
    addResult : function(result){ //if result is passed here, why have line 17????
        var newResultModel = new ResultModel({name: 'Result ' + (this.get('results').length+1), analysisResult : result, selected: true});
        this.get("results").add(newResultModel); //assuming add is specified in the this.o in line 34????
    },

    /** If a config was previously selected and now no longer is, unselect any selected results */
    updateSelected : function(){
        if (!this.get('selected')){
            this.get('results').filter(result => result.get('selected')).forEach(result=> result.set('selected', false));
        }
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
        this.on('change:switchConfigs', this.onSelectedChanged, this);
        this.on('change:unselectResult', this.unselectResults, this); //shouldn't it be switchConfigs?
        this.on('add', this.onSelectedChanged, this);
    },

    /** 
     * When config is clicked/selected, find previously selected config and unselect it.
     */ 
    onSelectedChanged : function(changedConfig){ //where did the changed Config come from?
        this.filter(configModel => configModel.get('selected') == true && changedConfig != configModel)
            .forEach(model =>
                model.set('selected', false));
    },

    /** 
     * When config is clicked, unselect any results that may have been selected under it.
     */ 
     unselectResults : function(changedConfig){
        changedConfig.get('results').forEach(result => result.set('selected', false));
    },
});
