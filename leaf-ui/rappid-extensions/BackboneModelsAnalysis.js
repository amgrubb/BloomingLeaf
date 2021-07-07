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
var ResultBBM = Backbone.Model.extend({
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
 * {ResultBBM} model
 */
var ResultCollection = Backbone.Collection.extend({
    model: ResultBBM,
    
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
var ConfigBBM = Backbone.Model.extend({
    initialize : function(){
        this.results = new ResultCollection([]);
        this.listenTo(this, 'change:selected', this.updateSelected);
    },

    idAttribute: "uid",

    defaults: {
        name:"Default Config",
        action: null,
        conflictLevel: "S",
        numRelTime: "1",
        currentState: "0",
        userAssignmentsList : [],
        previousAnalysis: null,
        selected: true,
        results : new ResultCollection([]),
    },

    /**
     * Will be called to add a new result model to the results param
     * when the backend returns an AnalysisResult
     */
    addResult : function(result){
        var newResultModel = new ResultBBM({name: 'Result ' + (this.get('results').length+1), analysisResult : result, selected: true});
        this.get("results").add(newResultModel);
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
 * {ConfigBBM} model
 */
var ConfigCollection = Backbone.Collection.extend({
    model: ConfigBBM,

    /** Used for eventually storing and accessing collection on server */
    url: "/configurations",

    initialize: function(){
        this.on('change:switchConfigs', this.onSelectedChanged, this);
        this.on('change:unselectResult', this.unselectResults, this);
        this.on('add', this.onSelectedChanged, this);
    },

    /** 
     * When config is clicked/selected, find previously selected config and unselect it.
     */ 
    onSelectedChanged : function(changedConfig){
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