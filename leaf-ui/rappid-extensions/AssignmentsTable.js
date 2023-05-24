myNull = null;
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
        '<div id="assignmentsModal" class="popup_frame">',
        '<div id="page-mask"></div>',
        '<div class="popup_content">',
        '<div class="popup_header">',
        '<span class="close">&times;</span>',
        '<h2>Absolute and Relative Assignments</h2>',
        '</div>',
        '<div class="popup_body">',
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
        '<th>Epoch Boundary Name 2</th>',
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
        '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px;">Presence Conditions Assignment</h3>',
        '<table id="link-list" class="abs-table">',
        '<tr>',
        '<th>Actor Name</th>',
        '<th>Actor Type</th>',
        '<th>Actor ID</th>',
        '</tr>',
        '</table>',
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
    render: function () {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.loadRelativeIntentions();
        this.displayAbsoluteIntentionAssignments();
        this.displayAbsoluteRelationshipAssignments();
        return this;
    },

    /**
     * Sets Max Absolute Time
     */
    updateMaxAbsTime: function () {
        var maxTimeElement = this.$('#max-abs-time');
        if (maxTimeElement.val() !== "") {
            this.model.set('maxAbsTime', maxTimeElement.val());
        } else {
            maxTimeElement.val(this.model.prop('maxAbsTime'));
        }
    },

    /** 
     * Sets Absolute time points
     */
    updateAbsTimePts: function () {
        // TODO: We could split at spaces + commas with: /[ ,]+/) 
        // but would need to fix the regex.test var first
        var regex = new RegExp("^(([1-9]0*)+\\s+)*([1-9]+0*)*$");
        var absTimeElement = $('#abs-time-pts');
        if (regex.test(absTimeElement.val())) {
            this.model.set('absTimePtsArr', absTimeElement.val().split(" ").map(i => Number(i)));
        } else {
            absTimeElement.val(this.model.get('absTimePtsArr').join(" "));
        }
    },

    /**
     * Iterates through each constraint in the graph constraint list
     * Creates and appends a new view with each constraint as a model
     */
    // TODO: Implement view to take in already selected constraint
    loadRelativeIntentions: function () {
        this.model.get('constraints').forEach(constraint => {
            var relIntentionRow = new RelativeIntentionView({ model: constraint });
            $('#rel-intention-assigments').append(relIntentionRow.el);
            relIntentionRow.render();
        });
    },

    /**
     * Adds new default relative intention to constraints list
     * And attatches representative view to the Assignments table
     */
    addRelIntentionRow: function () {
        var newConstraint = new ConstraintBBM({});
        graph.get('constraints').push(newConstraint);
        var relIntentionRow = new RelativeIntentionView({ model: newConstraint });
        $('#rel-intention-assigments').append(relIntentionRow.el);
        relIntentionRow.render();
    },

    /**
     * Creates and attaches a new IntentionRelationshipView 
     * For each function segment transition in the graph
     */
    displayAbsoluteIntentionAssignments: function () {
        this.model.getIntentions().forEach(intentionBbm => {
            var evolvingFunction = intentionBbm.get('evolvingFunction');
            if (evolvingFunction != null) {
                var funcSegList = evolvingFunction.get('functionSegList');
                if (funcSegList != undefined) {
                    // TODO: Check with @amgrubb about how this is being sliced
                    for (let funcSeg of funcSegList.slice(1)) {
                        var intentionRelationshipView = new IntentionRelationshipView({
                            model: funcSeg, funcType: intentionBbm.get('evolvingFunction').get('type'),
                            intentionName: intentionBbm.get('nodeName')
                        });
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
    displayAbsoluteRelationshipAssignments: function () {
        this.model.getLinks().forEach(linkCell => {
            if (linkCell.isValidAbsoluteRelationship()) {
                var linkRelationshipView = new LinkRelationshipView({ model: linkCell.get('link'), linkSrc: linkCell.getSourceElement().get('intention').get('nodeName'), linkDest: linkCell.getTargetElement().get('intention').get('nodeName') });
                $('#link-list').append(linkRelationshipView.el);
                linkRelationshipView.render()
            }
        })
    },

    /**
     * Removes all empty constraints from constraints array on graph object
     * Before closing modal box
     */
    closeView: function () {
        this.model.get('constraints').slice().forEach(constraint => {
            if (!constraint.isComplete()) {
                constraint.destroy()
            }
        });
        this.remove();
    },
});

/**
 * Backbone View for the Relative Intentions, where each instance of the view
 * Represents a constraint in the graph's constraint list
 */
var RelativeIntentionView = Backbone.View.extend({
    model: ConstraintBBM,
    tagName: 'tr',

    initialize: function (options) {
        this.listenTo(this.model, 'destroy', this.remove, this);
    },

    template: ['<script type="text/template" id="assignments-template">',
        '<td> <div class="epochLists"><select class="epoch1List"><option disabled <% if (srcID === null) { %> selected <%} %> hidden>...</option></select></div></td>',
        '<td> <div class="epochLists"><select id="relationshipLists">',
        '<option disabled <% if (type === null) { %> selected <%} %> hidden>...</option>',
        '<option value="eq" <% if (type === "eq") { %> selected <%} %>>=</option><option value="lt" <% if (type === "lt") { %> selected <%} %>><</option></select></div></td>',
        '<td> <div class="epochLists"><select class="epoch2List"><option <% if (destID === null) { %> selected <%} %> hidden>...</option></select></div></td>',
        '<td><i class="fa fa-trash-o fa-2x" id="removeConstraint" aria-hidden="true"></i></td>',
        '</script>'
    ].join(''),

    events: {
        'change .epoch1List': 'changeEpoch1',
        'change .epoch2List': 'changeEpoch2',
        'change #relationshipLists': 'changeRelationship',
        'click #removeConstraint': 'removeConstraint',

    },

    /**
     * Renders the correct template into the html element 
     * Based on whether or not it is a new default constraint of a loaded constraint
     */
    render: function () {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.loadOptions();
        return this;
    },

    /**
     * Loads all function segment transitions into the options dropdown menu
     */
    loadOptions: function () {
        graph.getElements().filter(element => element instanceof joint.shapes.basic.Intention).forEach(intentionCell => {
            var intentionBBM = intentionCell.get('intention');
            if (intentionBBM.get('evolvingFunction') != null) {
                for (let funcSegment of intentionBBM.getFuncSegments().slice(1)) {
                    var srcOptionTag = this.getOptionTag(intentionCell.get('id'), intentionBBM.get('nodeName'), funcSegment.get('startTP'), 'src');
                    var destOptionTag = this.getOptionTag(intentionCell.get('id'), intentionBBM.get('nodeName'), funcSegment.get('startTP'), 'dest');
                    this.$('.epoch1List').append(srcOptionTag);
                    this.$('.epoch2List').append(destOptionTag);
                }
            }
        })
        graph.getLinks().forEach(linkCell => {
            var linkBBM = linkCell.get('link');
            if (linkBBM.get('evolving')) {
                var srcOptionTag = this.getLinkOptionTag(linkCell.get('id'), linkBBM.get('linkType') + '|' + linkBBM.get('postType'), null, 'src');
                var destOptionTag = this.getLinkOptionTag(linkCell.get('id'), linkBBM.get('linkType') + '|' + linkBBM.get('postType'), null, 'dest');
                this.$('.epoch1List').append(srcOptionTag);
                this.$('.epoch2List').append(destOptionTag);
            }
        })
    },

    /**
     * Updates the constraint model's source id and reference time point 
     * To match the selected option
     */
    changeEpoch1: function () {
        selectedOption = this.$('.epoch1List option:selected');
        this.model.set('srcID', selectedOption.attr('class'));
        this.model.set('srcRefTP', selectedOption.attr('epoch'));
    },

    /**
     * Updates the constraint model's destination id and reference time point 
     * To match the selected option
     */
    changeEpoch2: function () {
        selectedOption = this.$('.epoch2List option:selected');
        this.model.set('destID', selectedOption.attr('class'));
        this.model.set('destRefTP', selectedOption.attr('epoch'));
    },

    /**
     * Updates the constraint model's relationship type
     * To match the selected option
     */
    changeRelationship: function () {
        this.model.set('type', this.$('#relationshipLists').val());
    },

    /**
     * Deletes the model, removing it from the graph's constraints list 
     * And triggering a removal of the view
     */
    removeConstraint: function () {
        this.model.destroy();
    },

    /**
     * Helper function to create individual option dropdown elements
     */
    getOptionTag(Id, nodeName, epoch, position) {
        var option;
        if (position === 'src') {
            if (this.model.get('srcID') === Id && this.model.get('srcRefTP') === epoch) {
                option = '<option class=' + Id + ' epoch="' + epoch + '" selected>' + nodeName + ': ' + epoch + '</option>';
            } else {
                option = '<option class=' + Id + ' epoch=' + epoch + '>' + nodeName + ': ' + epoch + '</option>';
            }
        } else {
            if (this.model.get('destID') === Id && this.model.get('destRefTP') === epoch) {
                option = '<option class=' + Id + ' epoch="' + epoch + '" selected>' + nodeName + ': ' + epoch + '</option>';
            } else {
                option = '<option class=' + Id + ' epoch=' + epoch + '>' + nodeName + ': ' + epoch + '</option>';
            }
        }
        return option;
    },

    getLinkOptionTag(Id, nodeName, epoch, position) {
        var option;
        if (position === 'src') {
            if (this.model.get('srcID') === Id) {
                option = '<option class=' + Id + ' epoch="' + epoch + '" selected>' + nodeName + '</option>';
            } else {
                option = '<option class=' + Id + ' epoch=' + epoch + '>' + nodeName + '</option>';
            }
        } else {
            if (this.model.get('destID') === Id) {
                option = '<option class=' + Id + ' epoch="' + epoch + '" selected>' + nodeName + '</option>';
            } else {
                option = '<option class=' + Id + ' epoch=' + epoch + '>' + nodeName + '</option>';
            }
        }
        return option;
    },
});

/**
 * Backbone View for the Absolute Intention Assignments, where each instance of the view
 * Represents a function segment transition of an IntentionBBM
 */
var IntentionRelationshipView = Backbone.View.extend({
    model: FunctionSegmentBBM,
    tagName: 'tr',

    initialize: function (options) {
        this.funcType = options.funcType;
        // console.log(funcType);
        this.intentionName = options.intentionName;
    },

    template: [
        '<script type="text/template" id="item-template">',
        '<td class= "namestartTP"></td>',
        '<td class= "func-type"></td>',
        '<td><input class="absFuncSegValue" type="number" name="sth" value="<%- startAT %>"></td>',
        '<td><button class="unassign-abs-intent-btn"> Unassign </button></td>',
        '</script>'
    ].join(''),

    events: {
        'change .absFuncSegValue': 'updateAbsFuncSegValue',
        'click .unassign-abs-intent-btn': 'unassignAbsIntention'
    },

    render: function () {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.$('.namestartTP').text(this.intentionName + " : " + this.model.get('startTP'));
        this.$('.func-type').text(this.funcType);
        return this;
    },

    /**
     * Sets model startAT to the new time point 
     * After checking if it is a number
     */
    updateAbsFuncSegValue: function () {
        var newTime = parseInt(this.$('.absFuncSegValue').val());
        if (isNaN(newTime)) {
            return;
        }
        this.model.set('startAT', newTime);
    },

    /**
     * Resets model start AT to -1, and resets UI input to be empty
     */
    unassignAbsIntention: function () {
        this.$('.absFuncSegValue').val('');
        this.model.set('startAT', null);
        // Clear all previous UserEvaluations
        this.model.set('userEvaluationList', []);
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

    initialize: function (options) {
        this.linkSrc = options.linkSrc,
            this.linkDest = options.linkDest
    },

    template: [
        '<script type="text/template" id="item-template">',
        '<td><%= linkType %><%if (evolving){%> | <%}%> <%=postType %></td>',
        '<td class= "link-source"></td>',
        '<td class= "link-dest"></td>',
        '<td><input class="linkAbsRelation" type="number" name="sth" value= <%- absTime %> > </td>',
        '<td><button class="unassign-abs-rel-btn" > Unassign </button></td>',
        '</script>'
    ].join(''),

    events: {
        'change .linkAbsRelation': 'updateLinkAbsRelation',
        'click .unassign-abs-rel-btn': 'unassignAbsRelation'
    },

    render: function () {
        
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        // TODO: Write statement to handle this case in script
        // Or if absTime default changed to null just remove if statement
        if (this.model.get('absTime') == myNull) {
            this.$('.linkAbsRelation').val('');
        }
        this.$('.link-source').text(this.linkSrc);
        this.$('.link-dest').text(this.linkDest);
        return this;
    },

    /**
     * Sets model linkAbsTime to the new time point 
     * After checking if it is a number
     */
    updateLinkAbsRelation: function () {
        var newTime = parseInt(this.$('.linkAbsRelation').val());
        if (isNaN(newTime)) {
            return;
        }
        this.model.set('absTime', newTime);
    },

    /**
     * Resets model startAT to myNull, and resets UI input to be empty
     */
    unassignAbsRelation: function () {
        this.$('.linkAbsRelation').val('');
        this.model.set('absTime', myNull);
    },
});

