/**
 * Main view for the Assignments List Table
 * 
 * This view is a modal popup that contains:
 * Max Absolute Time (BloomingGraph param)
 * Absolute Time Points (BloomingGraph param)
 * Relative Intention Assignments (BloomingGraph constraints list param)
 * Absolute Intention Assignments (located on IntentionBBMs)
 * Absolute Relationship Assignments (located on ListBBMs)
 * 
 * It can currently be accessed by a "View Assignments List" button in the toolbar
 */
var AssignmentsTable = Backbone.View.extend({
    model: joint.dia.BloomingGraph,

    template: ['<script type="text/template" id="assignments-template">',
    '<div id="assignmentsModal" class="modal" style="margin-left:110px">',
    '<div class="modal-content">',
    '<div class="modal-header">',
    '<span class="close">&times;</span>',
    '<h2>Absolute and Relative Assignments</h2>',
    '</div>',
    '<div class="modal-body">',
        '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px;">Max Absolute Time</h3>',
                '<input style="float:left;"; id="max-abs-time" class="analysis-input" type="number" min="1" step="1" value="<%= maxAbsTime %>"/>',
            '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px; margin-top: 30px;">Absolute Time Points</h3>',
            '<h5 style="text-align:left; color:#1E85F7; margin-bottom:5px; margin-top: -5px;">e.g. 5 8 22</h5>',
                '<input style="float:left;"; id="abs-time-pts" class="analysis-input" type="text" value="<%= absTimePtsArr.join(" ") %>"/>',
        '<div class=relIntention>',
                '<div class=headings>',
                    '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px; margin-top:50px">Relative Intention Assignments',
                            '<div id="add-intention" style="display:inline">',
                                '<i class="fa fa-plus" id="addIntent" style="font-size:30px; float:right; margin-right:20px;"></i>',
                            '</div>',
                    '</h3>',
                '</div>',
                    '<div>',
                        '<table id="rel-intention-assigments" class="rel-intent-table">',
                            '<tr>',
                                '<th>Epoch Boundary Name 1</th>',
                                '<th>Relationship</th>',
                                '<th>Epcoch Boundary Name 2</th>',
                                '<th></th>',
                            '</tr>',
                        '</table>',
                    '</div>',
            '</div>',
        '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px; margin-top:50px">Absolute Intention Assignments</h3>',
       '<table id="node-list" class="abs-table">',
                '<tr>',
                    '<th>Epoch Boundary Name</th>',
                    '<th>Function</th>',
                    '<th>Assigned Time</th>',
                    '<th>Action</th>',
                '</tr>',
        '</table>',
        '<div class=absRelationship>',
            '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px;">Absolute Relationship Assignment</h3>',
            '<table id="link-list" class="abs-table">',
                '<tr>',
                    '<th>Link Type</th>',
                    '<th>Source Node name</th>',
                    '<th>Dest Node name</th>',
                    '<th>Assigned Time</th>',
                    '<th>Action</th>',
                '</tr>',
            '</table>',
        '</div>', 
    '</div>',
    '</div>',
    '</div>',
    '</script>'].join(''),

    events: {
        'click #add-intention': 'addRelIntentionRow',
        'change #max-abs-time': 'updateMaxAbsTime',
        'change #abs-time-pts': 'updateAbsTimePts',
        'click .close': 'closeView'
    },

    /**
     * Renders the template into the html element
     * Loads in any previously stored relative intentions
     * And displays options for absolute intentions and relationships
     */
    render: function(){
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.loadRelativeIntentions();
        this.displayAbsoluteIntentionAssignments();
        this.displayAbsoluteRelationshipAssignments();
        return this;
    },

    /**
     * Sets Max Absolute Time
     */
    updateMaxAbsTime: function(){
        var maxTimeElement = $('#max-abs-time');
        if (maxTimeElement.val() !== "") {
            this.model.set('maxAbsTime', maxTimeElement.val())
        } else {
            maxTimeElement.val(this.model.prop('maxAbsTime'));
        }
    },

    /** 
     * Sets Absolute time points
     */
    updateAbsTimePts: function() {
        // TODO: We could split at spaces + commas with: /[ ,]+/) 
        // but would need to fix the regex.test var first
        var regex = new RegExp("^(([1-9]0*)+\\s+)*([1-9]+0*)*$");
        var absTimeElement = $('#abs-time-pts');
        if (regex.test(absTimeElement.val())) {
            this.model.set('absTimePtsArr', absTimeElement.val().split(" "))
        } else {
            absTimeElement.val(this.model.get('absTimePtsArr').join(" "));
        }
    },

    /**
     * Iterates through each constraint in the graph constraint list
     * Creates and appends a new view with each constraint as a model
     */
    // TODO: Implement view to take in already selected constraint
    loadRelativeIntentions: function(){
        for (let constraint in this.model.get('constraints')){
            var relIntentionRow = new RelativeIntentionView({model: constraint, new: false});
            $('#rel-intention-assigments').append(relIntentionRow.el);
            relIntentionRow.render();
        }
    },

    /**
     * Adds new default relative intention to constraints list
     * And attatches representative view to the Assignments table
     */
    addRelIntentionRow: function(){
        var newConstraint = new ConstraintBBM({});
        graph.get('constraints').push(newConstraint);
        var relIntentionRow = new RelativeIntentionView({model: newConstraint, graph: this.model, new: true});
        $('#rel-intention-assigments').append(relIntentionRow.el);
        relIntentionRow.render();
    },
    
    /**
     * Creates and attaches a new IntentionRelationshipView 
     * For each function segment transition in the graph
     */
    displayAbsoluteIntentionAssignments: function() {
        this.model.getIntentions().forEach(intentionCell => {
            var evolvingFunction = intentionCell.get('evolvingFunction');
            console.log(funcSegList);
            if(evolvingFunction != null){
                var funcSegList = evolvingFunction.get('functionSegList');
                if (funcSegList != undefined){
                    // TODO: Check with @amgrubb about how this is being sliced
                    for (let funcSeg of funcSegList.slice(1)){
                        var intentionRelationshipView = new IntentionRelationshipView({
                            model: funcSeg, funcType: intentionBbm.get('evolvingFunction').get('type'), 
                            intentionName: intentionBbm.get('nodeName')});
                        $('#node-list').append(intentionRelationshipView.el);
                        intentionRelationshipView.render();  
                    }
                }
            }
        });
    },

    /**
     * Creates and attaches a new LinkRelationshipView
     * For each evolving link
     */
    displayAbsoluteRelationshipAssignments: function(){
        this.model.getLinks().forEach(linkCell => {
            linkBbm = linkCell.get('link');
            if(linkCell.isValidAbsoluteRelationship()){
                var linkRelationshipView = new LinkRelationshipView({model: linkBbm, linkSrc: linkCell.getSourceElement().get('intention').get('nodeName'), linkDest: linkCell.getTargetElement().get('intention').get('nodeName')});
                $('#link-list').append(linkRelationshipView.el);
                linkRelationshipView.render()
            }
        })
    },

    /**
     * Removes all empty constraints from constraints array on graph object
     * Before closing modal box
     */
    closeView: function(){
        this.model.get('constraints').slice().forEach(constraint => {
            if(!constraint.isComplete()){
            constraint.destroy()
        }});
        this.remove();
    },
});

/**
 * Backbone View for the Relative Intentions, where each instance of the view
 * Represents a constraint in the graph's constraint list
 */
var RelativeIntentionView = Backbone.View.extend({
    model: Constraint,
    tagName: 'tr',

    initialize: function(options){
        this.graph = options.graph;
        // If constraint is a new blank instance or a loaded constraint
        this.new = options.new;
        this.listenTo(this.model, 'destroy', this.remove, this);
    },

    newConstraintTemplate: ['<script type="text/template" id="assignments-template">',
        '<td> <div class="epochLists"><select id="epoch1List"><option selected>...</option></select></div></td>',
        '<td> <div class="epochLists"><select id="relationshipLists">',
            '<option selected>...</option>',
            '<option value="eq">=</option><option value="lt"><</option></select></div></td>',
        '<td> <div class="epochLists"><select id="epoch2List"><option selected>...</option></select></div></td>',
        '<td><i class="fa fa-trash-o fa-2x" id="removeConstraint" aria-hidden="true"></i></td>',
        '</script>'
    ].join(''),

    loadedConstraintTemplate: [].join(''),

    events: {
        'change #epoch1List' : 'changeEpoch1',
        'change #epoch2List' : 'changeEpoch2',
        'change #relationshipLists' : 'changeRelationship',
        'click #removeConstraint' : 'removeConstraint',

    },

    /**
     * Renders the correct template into the html element 
     * Based on whether or not it is a new default constraint of a loaded constraint
     */
    render: function(){
        if (this.new){
            this.$el.html(_.template($(this.newConstraintTemplate).html())());
            this.loadOptions();
        } else {
            // TODO: Implement
            this.$el.html(_.template($(this.loadedConstraintTemplate).html())());
        }
        return this;
    },

    /**
     * Loads all function segment transitions into the options dropdown menu
     */
    loadOptions: function(){
        this.graph.getIntentions().forEach(intention => {
            if (intention.get('evolvingFunction') != null){
                for (let funcSegment in intention.getFuncSegments().slice(1)){
                    var optionTag = this.getOptionTag(intention.get('id'), intention.get('nodeName'), funcSegment.get('startTP'));
                    $('#epoch1List').append(optionTag);
                    $('#epoch2List').append(optionTag);
                }
            }
        })
    },

    /**
     * Updates the constraint model's source id and reference time point 
     * To match the selected option
     */
    changeEpoch1: function(){
        selectionOption = $('#epoch1List option:selected');
        this.model.set('srcID', selectedOption.attr('class'));
        this.model.set('srcRefTP', selectedOption.attr('epoch'));
    },

    /**
     * Updates the constraint model's destination id and reference time point 
     * To match the selected option
     */
    changeEpoch2: function(){
        selectionOption = $('#epoch2List option:selected');
        this.model.set('destID', selectedOption.attr('class'));
        this.model.set('destRefTP', selectedOption.attr('epoch'));
    },

    /**
     * Updates the constraint model's relationship type
     * To match the selected option
     */
    changeRelationship: function(){
        this.model.set('type', $('#relationshipLists option:selected').text());
    },

    /**
     * Deletes the model, removing it from the graph's constraints list 
     * And triggering a removal of the view
     */
    removeConstraint: function(){
        this.model.destroy();
    },

    /**
     * Helper function to create individual option dropdown elements
     */
    getOptionTag(intentionId, nodeName, epoch){
        return '<option class='+ intentionId +' epoch='+ epoch +'>' + nodeName + ': ' + epoch + '</option>';
    },
});

/**
 * Backbone View for the Absolute Intention Assignments, where each instance of the view
 * Represents a function segment transition of an IntentionBBM
 */
var IntentionRelationshipView = Backbone.View.extend({
    model: FunctionSegmentBBM,
    tagName: 'tr',

    initialize: function(options){
        this.funcType = options.funcType;
        this.intentionName = options.intentionName;
    },

    template: [
        '<script type="text/template" id="item-template">',
        '<td class= "namestartTP"></td>',
        '<td class= "func-type"></td>',
        '<td><input id="absFuncSegValue" type="number" name="sth" value="<% if (startAT == -1) {%> "" <%} else { %> startAT <% } %>"></td>',
        '<td><button id="unassign-abs-intent-btn"> Unassign </button></td>',
        '</script>'
    ].join(''),

    events: {
        'change #absFuncSegValue' : 'updateAbsFuncSegValue',
        'click #unassign-abs-intent-btn' : 'unassignAbsIntention'
    },

    render: function(){
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.$('.namestartTP').text(this.intentionName + " : " + this.model.get('startTP'));
        this.$('.func-type').text(this.funcType);
        return this;
    },

    /**
     * Sets model startATP to the new time point 
     * After checking if it is a number
     */
    updateAbsFuncSegValue: function(){
        var newTime = parseInt($('#absFuncSegValue').val());
        if (isNaN(newTime)) {
            return;
        }
        this.model.set('startATP', newTime);
    },

    /**
     * Resets model startATP to -1, and resets UI input to be empty
     */
    unassignAbsIntention: function(){
        $('#absFuncSegValue').val('');
        this.model.set('startATP', -1);
    },

});

/**
 * Backbone View for the Absolute Relationship Assignments, where each instance of the view
 * Represents an evolving function transition of a LinkBBM
 */
// TODO: Get linkSrc name and linkDest name instead of ids
var LinkRelationshipView = Backbone.View.extend({
    model: LinkBBM,
    tagName: 'tr',

    initialize: function(options){
        this.linkSrc= options.linkSrc,
        this.linkDest= options.linkDest
    },

    template: [
        '<script type="text/template" id="item-template">',
        '<td><%= linkType %><%if (evolving){%> | <%}%> <%=postType %></td>',
        '<td class= "link-source"></td>',
        '<td class= "link-dest"></td>',
        '<td><input id="linkAbsRelation" type="number" name="sth" value= "<% if (absTime === -1) {%> "" <%} else { %> absTime <% } %>" > </td>',
        '<td><button id="unassign-abs-rel-btn" > Unassign </button></td>',
        '</script>'
    ].join(''),

    events: {
        'change #linkAbsRelation' : 'updateLinkAbsRelation',
        'click #unassign-abs-rel-btn' : 'unassignAbsRelation'
    },

    render: function(){
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.$('.link-source').text(this.linkSrc);
        this.$('.link-dest').text(this.linkDest);
        return this;
    },

    /**
     * Sets model linkAbsTime to the new time point 
     * After checking if it is a number
     */
    updateLinkAbsRelation: function(){
        var newTime = parseInt($('#linkAbsRelation').val());
        if (isNaN(newTime)) {
            return;
        }
        this.model.set('linkAbsTime', newTime);
    },

    /**
     * Resets model startATP to -1, and resets UI input to be empty
     */
    unassignAbsRelation: function(){
        $('#linkAbsRelation').val('');
        this.model.set('linkAbsTime', -1);
    },
});