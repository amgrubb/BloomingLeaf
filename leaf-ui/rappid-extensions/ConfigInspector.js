/** 
 * This file contains the views associated with 
 * the left hand Analysis Configuration side panel seen in Analysis Mode 
 */

/**
 * View for individual result buttons
 * 
 * {ResultBBM} model
 */
var ResultView = Backbone.View.extend({
    model: ResultBBM,

    /** Pass in config along with model so that view has reference to parent */
    initialize: function(options){
        this.config = options.config;
        this.model.on('change:selected', this.updateHighlight, this);
    },

    template: ['<script type="text/template" id="result-template">',
    '<a class="result-elements" id="<%= name %>" <% if (selected) { %> style="background-color:#A9A9A9;" <%} %>)>', "<%= name %>", '</a>',
    '</script>'].join(''),
    
    /** Render updates model values in template (name & selected) */
    render: function() {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        return this;
    },

    events: {
        'click .result-elements' : 'switchResult'
    },

    /** On click of view element, update result and associated config models
     * to set selected to be true, and trigger a switch event to notify views to re-render
     * 
     * Then, call displayAnalysis to display result in graph
     */
    switchResult : function(){
        this.model.set('selected',true);
        this.model.trigger('change:switchResults', this.model);
        this.config.set('selected',true);
        this.config.trigger('change:switchConfigs', this.config);
        displayAnalysis(this.model.get('analysisResult'), true);
    },

    /**
     * Called when model select value changes, re-renders element to show as correct selected value
     */
    updateHighlight : function(){
        this.render();
    },
});

/**
 * View for dropdown result menu under configurations
 * 
 * {ResultCollection} collection
 */
var ResultsDropdown = Backbone.View.extend({
    collection: ResultCollection,

    /** Pass in a reference to parent configuration on intialization */
    initialize: function(options){
        this.config = options.config;
    },

    template: [
    '<div class="dropdown-container">',
    '</div>'].join(''),

    /**
     * Resets listeners and resets template
     * Then adds all results associated with the configuration
     */
    render: function() {
        this.stopListening();
        this.listenTo(this.collection, 'add', this.loadResult, this);
        this.$el.html(_.template(this.template)());
        this.collection.forEach(result => {this.loadResult(result)});
        return this;
    },

    /** Adds new ResultView to dropdown container */
    loadResult : function(result) {
        var view = new ResultView({model: result, config: this.config});
        this.$('.dropdown-container').append(view.render().el);
    },
})

/**
 * View for each configuration in the analysis configuration sidebar
 * Also containers ResultsDropdown as a inner view
 * 
 * {ConfigBBM} model
 */
var Config = Backbone.View.extend({
    model: ConfigBBM,

    /** Create and render dropdown inner view, set listeners */
    initialize: function(){
        this.innerView = new ResultsDropdown({collection:this.model.get("results"), config: this.model});
        this.innerView.render();
        this.model.on('destroy', this.remove, this);
        this.model.on('change:selected', this.rerender, this);
        this.model.on('switch', this.showAnalysisInspector, this);
        this.model.on('change:name', this.renderName, this);
    },

    template: ['<script type="text/template" id="item-template">',
    '<div class="analysis-configuration" id="<%= name %>">',
        '<button class="config-elements" <% if (selected) { %> style="background-color:#A9A9A9;" <%} %> >',
        '<%= name %> </button>',
        '<input class="config-input" value="<%- name %>" style="display:none"></input>',
        '<div id="config-buttons" style="position:absolute; display:inline-block">',
        '<button class="deleteconfig-button">',
            '<i id="garbage-icon" class="fa fa-trash-o" aria-hidden="true"></i>' +
        '</button>',
        '<button class="dropdown-button">',
            '<i id="drop-icon" class="fa fa-caret-up fa-2x" style="cursor:pointer;"></i>',
        '</button>',
        '</div>',
       '</div>',
       '</script>'].join(''),

    events: {
        'click .config-elements': 'switchConfig',
        'click .dropdown-button' : 'toggleDropdown',
        'dblclick .config-elements': 'rename',
        'blur .config-input': 'setConfigName',
        'keyup .config-input': 'checkForEnter',
        'click .deleteconfig-button': 'removeConfig',
    },

    /** Sets template and appends inner view */
    render: function() {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.$('.analysis-configuration').append(this.innerView.$el);
        if (this.model.get('selected')){
            this.showAnalysisInspector();
        }
        return this;
    },

    /** 
     * Called for all events that require re-rendering of the template 
     * after the first render call
     * 
     * Detatches dropdown inner view in order to preserve events
     * Resets template, and then reattatches dropdown inner view
     * 
     */
    rerender: function() {
        this.innerView.$el.detach()
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.$('.analysis-configuration').append(this.innerView.$el);
        return this;
    },

    /**
     * Resets element name in UI to current name
     */
    renderName: function(){
        $('.config-elements', this.$el).html(this.model.get('name'));
        return this;
    },

    /** 
     * Destroys config model, removing it from configCollection 
     * and triggering a removal of its respective view 
     */
    removeConfig:function(){
        index = this.model.collection.indexOf(this.model);
        if (this.model.get('selected') == true && this.model.collection.length > 1){
           if (index > 0 ){
                this.model.collection.at(index - 1).set({selected:true});
                this.model.collection.at(index - 1).trigger('change:switchConfigs', this.model.collection.at(index-1)); 
           } else {
                this.model.collection.at(index + 1).set({selected:true});       
                this.model.collection.at(index + 1).trigger('change:switchConfigs', this.model.collection.at(index+1)); 
            }
       }
       this.model.destroy();  
    },

    /**
     * Updates currAnalysisConfig (TODO: Remove currAnalysisConfig) with current model
     * Sets selected value to true and triggers a switchConfig event to update highlight
     */
    switchConfig : function(){
        currAnalysisConfig = this.model;
        this.model.set({selected:true});
        this.showAnalysisInspector();
        this.model.trigger('change:switchConfigs', this.model);
        this.model.trigger('change:unselectResult', this.model);
    },

    /**
     * Clears previous AnalysisInspector view (if any) and renders new view with current model
     */
    showAnalysisInspector: function(){
        // If there is a previous sidebar view, clear it
        clearInspector();
        // Create and add new analysis sidebar view
        var analysisInspector = new AnalysisInspector({model: this.model});
        $('#analysisID').append(analysisInspector.el);
        analysisInspector.render();
    },

    /**
     * Hide/Show results dropdown 
     */
    toggleDropdown : function(){
        // Grab container and icon from dropdown Element
        dropdownContainer = this.$('.dropdown-container');
        dropdownIcon = this.$('#drop-icon');
        // Switch container display and icon orientation
        if (dropdownContainer.css('display') !== "none") {
            dropdownContainer.hide();
            dropdownIcon.attr('class', 'fa fa-caret-down fa-2x');
        } else {
            dropdownContainer.show();
            dropdownIcon.attr('class', 'fa fa-caret-up fa-2x');
        }
    },

    /**
     * Replace config button element with config input element
     */
    rename : function(){
        this.$el.addClass('editing');
        this.$('.config-elements').css("display", "none");
        this.$('.config-input').css("display", "inline-block");
		this.$('.config-input').focus();
    },

    /**
     * Check if user is currently editing name, and if name is unique
     * If both are true, update model name and replace input with button element
     */
    setConfigName: function(){
        // If user is not currently editing, return
        // Necessary so that we don't get duplicate calls while in function 
        // but before hiding config-input
        if (!this.$el.hasClass('editing')) {
            return;
        }
        this.$el.removeClass('editing');

        this.$('.config-input').css("display", "none");
        this.$('.config-elements').css("display", "inline-block");

        newName = this.$('.config-input').val().trim();
        // If name is already taken by other configs, show error message and reset input box
        if (newName != this.model.get('name') && configCollection.pluck('name').includes(newName)){
            alert("Sorry, this name is already in use. Please try another.");
            this.$('.config-input').val(this.model.get('name'));
        } else {
            this.model.set('name', newName);
        }
    },

    /**
     * Check for enter key to set name while in config input
     * 
     * @param {Event} e 
     */
    checkForEnter: function(e){
        if (e.key == "Enter"){
            this.setConfigName();
        }
    },
});

/**
 * View for the overall analysis configuration sidebar
 * 
 * {ConfigCollection} collection
 */
var ConfigInspector = Backbone.View.extend({
    className: 'configs',

    collection: ConfigCollection,

    template: [
        '<div id="config-sidebar" class="container-sidebar"><h3 style="text-align:left; color:#181b1fe3; margin-bottom:5px; margin-left: 10px;">Analysis',
        '<div id="addConfig" style="display:inline">',
            '<i class="fa fa-plus" id="addIntent" style="font-size:30px; float:right;  margin-bottom:5px; margin-right:20px;"></i>',
        '</div></h3>',
        '<div id="configurations" class="left-panel" style="margin-top:20px; overflow-y:auto; height:90%; box-shadow: none;"></div>',
    '</div>',

    ].join(''),

    events: {
        'click #addConfig': 'addNewConfig',
    },

    /** Set event listener for configs added to collection */
    initialize:function(){
        this.listenTo(this.collection,'add', this.loadConfig, this);
    },

    /** 
     * Check if collection already has configs, and load in if so
     * Otherwise, create a new config
     */
    render: function () {
        this.$el.html(_.template(this.template)());
        if(this.collection.length != 0){
            this.collection.each(this.loadConfig, this);
        } else {
           this.addNewConfig();
        }
        return this;
    },
    /**
     * Clears previous AnalysisInspector view (if any) and renders new view with current model
     */
     showAnalysisInspector: function(){
        // If there is a previous sidebar view, clear it
        clearInspector();
        // Create and add new analysis sidebar view
        var analysisInspector = new AnalysisInspector({model: this.model});
        $('#analysisID').append(analysisInspector.el);
        analysisInspector.render();
    },

    /** Add a new configuration view to the sidebar */
    loadConfig : function(config) {
        var view = new Config({model: config});
        $('#configurations').append(view.render().el);
    }, 

    /** Create and add a new config model to the collection */
    addNewConfig : function(){
        var configModel = new ConfigBBM({name: "Request " + (this.collection.length+1), results: new ResultCollection([])})
        configCollection.add(configModel);
    },
});
