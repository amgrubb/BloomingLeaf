/** Models for the Analysis Mode AnalysisInspector.js and Analysis Configuration Sidebars */

/**
 * Model for results
 * 
 * Attributes:
 * @param {String} name
 * @param {HashMap.<String, Integer>} timePointAssignments
 *   Hashmap between the symbolic names for time points and Absolute time point values
 *   Was called assignedEpoch and
 *   each element represents an epoch with its assigned value
 *   ex: ["TE2_2","TE1_32"]
 * @param {Array.<String>} timePointPath
 *   Each element represents a time point in the analysis
 *   ex: ['0', '7']
 * @param {Array.<Object>} elementList
 *   List of elements containing analysis results
 *   ex: [{id: "0001", status:["0010","0100"]}]
 *   (for nodeID 0001, time point 0, its satisfaction value is "0010", timd point 1, its satisfaction value is "0100")
 * @param {Array.<Object>} colorVis
 *   Color visualization for analysis mode
 *   ex: {numIntentions: 21, numTimePoints: 2, intentionListColorVis: Array(21), isColorBlind: false}
 * @param {Number} selectedTimePoint
 *   Finds where slider is initialized and sets timepoint in here
 *   Also place it in update function
 *   ex: 1
 * @param {Boolean} selected
 * Whether or not the ResultBBM is current selected to be shown
 *
 */
var ResultBBM = Backbone.Model.extend({
    initialize : function(options){
        _.extend({}, this.defaults, options);
    },

    defaults: function() {
        return {    
            name:"Default Result",
            timePointAssignments: null,
            timePointPath: null,        // changed type to list of int.
            elementList: null,
            allSolutions: null, 
            nextStateTPs: null,
            colorVis: null, // Color visualization for analysis mode
            selectedTimePoint: null, // Find where slider is initialized and set timepoint in here. Also place it in update function
            selected: true,
            nextPossibleAbsValue: null,
            nextPossibleRndValue: null
        }
    }
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
 */
var ConfigBBM = Backbone.Model.extend({
    initialize : function(options){
        this.results = new ResultCollection([]);
        this.listenTo(this, 'change:selected', this.updateSelected);
        _.extend({}, this.defaults, options);
    },

    idAttribute: "uid",

    defaults: function() {
        return {
        name:"Default Config",
        action: null,
        conflictLevel: "S",
        numRelTime: "1",
//        currentState: "0",        //TODO: Can we remove this?
//        previousAnalysis: null,
        selected: true,
        results : new ResultCollection([]),
        }
    },

    /**
     * Will be called to add a new result model to the results param
     * when the backend returns an AnalysisResult
     */
    addResult : function(result){
        result.set('name', 'Result ' + (this.get('results').length+1))
        this.get("results").add(result);
		$('#conflict-level').prop('disabled', true);
		$('#num-rel-time').prop('disabled', true);
    },

    /** If a config was previously selected and now no longer is, unselect any selected results */
    updateSelected : function(){
        if (!this.get('selected')){
            this.get('results').filter(result => result.get('selected')).forEach(result=> result.set('selected', false));
        }
    },

    returnSelectedResultBBM : function() {
        selectedResults = this.get('results').filter(result => result.get('selected') == true);
        if (selectedResults.length > 0){
            return selectedResults[selectedResults.length-1]
        }
        return null;
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
