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
                    '<div class="presConditions">',
                        '<div class=headings>',
                            '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px; margin-top:50px">Presence Condition Assignments',
                                '<div id="add-prescondition" style="display:inline">',
                                    '<i class="fa fa-plus" id="addIntent" style="font-size:30px; float:right; margin-right:20px;"></i>',
                                '</div>',
                            '</h3>',
                        '</div>',
                        '<div id=table-rows></div>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>',
        '</script>'].join(''),

    events: {
        'click #add-intention': 'addRelIntentionRow',
        'change #max-abs-time': 'updateMaxAbsTime',
        'change #abs-time-pts': 'updateAbsTimePts',
        'click #add-prescondition': 'addPresCondition',
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
        this.displayPresConditions();
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

        this.presConditionTableView.render();
        document.getElementById('add-prescondition').style.display = "";
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
     * Creates and attaches a new PresConditionEditView
     */
    addPresCondition: function() {
        document.getElementById('add-prescondition').style.display = "none";
        var presConditionEditView = new PresConditionEditView({table: this.presConditionTableView});
        $('#prescond-list').append(presConditionEditView.el);
        presConditionEditView.render();
    },

    /**
     * Creates the PresConditionTableView
     */
    displayPresConditions: function () {
        this.presConditionTableView = new PresConditionTableView({});
        $('#table-rows').append(this.presConditionTableView.el);
        this.presConditionTableView.render();
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

/**
 * Backbone View for the Presence Condition Assignments, which contains a row for each of the elements with restricted intervals
 */
var PresConditionTableView = Backbone.View.extend({
    template: [
        '<script type="text/template" id="item-template">',
            '<table id="prescond-list" class="abs-table">',
                '<tr>',
                    '<th>Element</th>',
                    '<th>Type</th>',
                    '<th>Available Interval</th>',
                    '<th></th>',
                '</tr>',
            '</table>',
        '</script>'
    ].join(''),

    /**
     * Creates rows of the table for each actor and intention with a modified interval
     */
    displayRows: function() {
        var actors = SliderObj.getActorsView();
        var cells = SliderObj.getIntentionsAndActorsView();
        for (var i = 0; i < actors.length; i++) {
            var element = [];
            var embeds = SliderObj.getEmbeddedElements(actors[i].id);

            // finds embedded intentions within the actor
            if (embeds) {
                for(var k = 0; k < cells.length; k++){
                    if (embeds.includes(cells[k].model.id) && cells[k].model.attributes.intention.attributes.intervals.length > 0)  {
                        element.push(cells[k]);
                        cells.splice(k, 1);
                        k--;
                    }
                }
            }

            // displays actors with changed intervals
            if (actors[i].model.attributes.actor.attributes.intervals.length > 0 || element.length > 0) { // if actor's interval is changed, display actor
                var presConditionActorView = new PresConditionActorView({model: actors[i].model, table: this});
                $('#prescond-list').append(presConditionActorView.el);
                presConditionActorView.render();

                // displays intentions with changed intervals inside their actor
                for(var j = 0; j < element.length; j++){
                    if (element[j].model.attributes.intention.attributes.intervals.length > 0) {
                        var presConditionIntentionView = new PresConditionIntentionView({model: element[j].model, actor: actors[i], table: this});
                        $('#prescond-list').append(presConditionIntentionView.el);
                        presConditionIntentionView.render();
                    }
                }
            }
        }
        
        // displays intentions with changed intervals that are not inside an actor
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].model.attributes.type != "basic.Actor" && cells[i].model.attributes.intention.attributes.intervals.length > 0) {
                var presConditionIntentionView = new PresConditionIntentionView({model: cells[i].model, table: this});
                $('#prescond-list').append(presConditionIntentionView.el);
                presConditionIntentionView.render();
            }
        }

        // do not display trash can if actor does not have a changed interval
        for (var i = 0; i < document.getElementsByClassName('pcRow').length; i++) {
            if (document.getElementsByClassName('pcRow')[i].getElementsByTagName('td')[2].innerHTML.length == 0) {
                document.getElementsByClassName('pcRow')[i].getElementsByTagName('td')[3].innerHTML = "";
            }
        } 
    },

    render: function() {
        this.$el.html(_.template($(this.template).html()));
        this.displayRows();
        document.getElementById("add-prescondition").style.display = "";
        return this;
    }
});

/**
 * Backbone View for an Actor
 * Represents one row of the table
 */
var PresConditionActorView = Backbone.View.extend({
    model: ActorBBM,

    initialize: function (options) {
        this.name = this.model.attributes.actor.attributes.actorName;
        this.intervals = this.convertIntervals();
        this.type = "Actor";
        this.table = options.table;
    },

    tagName: 'tr',
    className: 'pcRow',

    template: [
        '<script type="text/template" id="item-template">',
            '<td id=pc-name></td>',
            '<td id=pc-type></td>',
            '<td id=pc-interval></td>',
            '<td><i class="fa fa-trash-o fa-2x" id="remove-interval"</i></td>',
        '</script>'
    ].join(''),

    events: {
        'click #remove-interval': 'removeInterval',
    },

    /**
     * Changes exclusion intervals into displayable inclusion intervals
     */
    convertIntervals: function () {
        var exclusionIntervals = this.model.attributes.actor.attributes.intervals;
        var inclusionIntervals;
        if (exclusionIntervals[0]){ // not always available
            if(exclusionIntervals[1]){ // two exclusion intervals
                inclusionIntervals = `[${exclusionIntervals[0][1] + 1}, ${exclusionIntervals[1][0] - 1}]`;
            } else { // one exclusion interval
                if (exclusionIntervals[0][0] == 0){ // [0-#]
                    if (exclusionIntervals [0][1] == graph.get('maxAbsTime')) { // special case [0-max]
                        inclusionIntervals = `[${0}, ${0}]`;
                    } else {
                        inclusionIntervals = `[${exclusionIntervals[0][1] + 1}, ${graph.get('maxAbsTime')}]`;
                    }
                } else if(exclusionIntervals[0][1] == graph.get('maxAbsTime')){ // [#-max]
                    inclusionIntervals = `[${0}, ${exclusionIntervals[0][0] - 1}]`;
                } else { // [#-#]
                    inclusionIntervals = `[${0}, ${exclusionIntervals[0][0] - 1}], [${exclusionIntervals[0][1] + 1}, ${graph.get('maxAbsTime')}]`;
                }
            }
        }
        return inclusionIntervals;
    },

    /**
     * Deletes exclusion intervals, so actor is always available
     */
    removeInterval: function () {
        this.model.attributes.actor.attributes.intervals = [];
        this.table.render();
    },

    render: function () {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));

        this.$('#pc-name').text(this.name);
        this.$('#pc-type').text(this.type);
        this.$('#pc-interval').text(this.intervals);

        return this;
    },

});

/**
 * Backbone View for an Intention
 * Represents one row of the table
 */
var PresConditionIntentionView = Backbone.View.extend({
    model: IntentionBBM,
    tagName: 'tr',

    initialize: function (options) {
        this.name = this.model.attributes.intention.attributes.nodeName;
        this.actor = options.actor;
        this.intervals = this.convertIntentionIntervals();
        if(this.model.attributes.type == "basic.Goal"){
            this.type = "Goal";
        } else if (this.model.attributes.type == "basic.Task"){
            this.type = "Task";
        } else if (this.model.attributes.type == "basic.Softgoal"){
            this.type = "Soft Goal";
        } else if (this.model.attributes.type == "basic.Resource"){
            this.type = "Resource";
        } 
        this.table = options.table;
    },

    template: [
        '<script type="text/template" id="item-template">',
        '<td id=pc-name></td>',
        '<td id=pc-type></td>',
        '<td id=pc-interval></td>',
        '<td><i class="fa fa-trash-o fa-2x" id="remove-interval"></i></td>',
        '</script>'
    ].join(''),

    events: {
        'click #remove-interval': 'removeInterval',
    },

    /**
     * Changes exclusion intervals into displayable inclusion intervals
     */
    convertIntentionIntervals: function () {
        var exclusionIntervals = this.model.attributes.intention.attributes.intervals;

        var inclusionIntervals;

        var minRange = 0;
        var maxRange = graph.get('maxAbsTime');

        if (this.actor) {
            var actorExcIntervals = this.actor.model.attributes.actor.attributes.intervals;
            if (actorExcIntervals[0]) {
                if(actorExcIntervals[1]){ // two exclusion intervals
                    minRange = actorExcIntervals[0][1] + 1;
                    maxRange = actorExcIntervals[1][0] - 1;
                } else { // one exclusion interval
                    if (actorExcIntervals[0][0] == 0){ // [0-#]
                        if (actorExcIntervals [0][1] == graph.get('maxAbsTime')) { // special case [0-max]
                            minRange = 0;
                            maxRange = 0;
                        } else {
                            minRange = actorExcIntervals[0][1] + 1;
                        }
                    } else if(actorExcIntervals[0][1] == graph.get('maxAbsTime')){ // [#-max]
                        maxRange = actorExcIntervals[0][0] - 1;
                    } else { // [#-#]
                        inclusionIntervals = `[${0}, ${actorExcIntervals[0][0] - 1}], [${actorExcIntervals[0][1] + 1}, ${graph.get('maxAbsTime')}]`;
                    }
                }
            }
        }

        if(exclusionIntervals[0]){
            if(exclusionIntervals[1]){ // [[rangeMin, slider1],[slider2, rangeMax]] (two exclusion intervals)
                inclusionIntervals = `[${exclusionIntervals[0][1] + 1}, ${exclusionIntervals[1][0] - 1}]`;
            } else { // [slider1, slider2] (one exclusion interval)
                if (exclusionIntervals[0][0] == minRange){ // [0-#]
                    if (exclusionIntervals [0][1] == maxRange) { // special case [0-100]
                        inclusionIntervals = `[${0}, ${0}]`;
                    } else {
                        inclusionIntervals = `[${exclusionIntervals[0][1] + 1}, ${maxRange}]`;
                    }
                } else if(exclusionIntervals[0][1] == maxRange){ // [#-max]
                    inclusionIntervals = `[${minRange}, ${exclusionIntervals[0][0] - 1}]`;
                } else { // [#-#]
                    inclusionIntervals = `[${minRange}, ${exclusionIntervals[0][0] - 1}], [${exclusionIntervals[0][1] + 1}, ${maxRange}]`;
                }
            }
        } else { // always available
            if (!inclusionIntervals) {
                inclusionIntervals = `[${minRange}, ${maxRange}]`;
            }
        }
        return inclusionIntervals;
    },

    /**
     * Deletes exclusion intervals, so intention is always available
     */
    removeInterval: function () {
        this.model.attributes.intention.attributes.intervals = [];
        this.table.render();
    },

    render: function () {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));

        this.$('#pc-name').text(this.name);
        if (this.actor) {
            this.$('#pc-name').css("padding-left", "40px");
        }
        this.$('#pc-type').text(this.type);
        this.$('#pc-interval').text(this.intervals);

        return this;
    },

});

/**
 * Backbone View for adding a new presence condition
 * Represents the last row of the table while a new presence condition is being created by the user
 */
var PresConditionEditView = Backbone.View.extend({
    model: joint.dia.BloomingGraph,

    initialize: function (options) {
        this.table = options.table;

        var elements = SliderObj.getIntentionsAndActorsView();
        this.listElements = [];
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].model.attributes.type == "basic.Actor" && elements[i].model.attributes.actor.attributes.intervals.length == 0) {
                this.listElements.push(elements[i]);
            } else if (elements[i].model.attributes.type != "basic.Actor" && elements[i].model.attributes.intention.attributes.intervals.length == 0) {
                this.listElements.push(elements[i]);
            }
        }

        this.model = this.listElements[0].model;
        if (this.model.attributes.type == "basic.Actor") {
            this.type = "Actor";
        } else if (this.model.attributes.type == "basic.Goal") {
            this.type = "Goal";
        } else if (this.model.attributes.type == "basic.Task") {
            this.type = "Task";
        } else if (this.model.attributes.type == "basic.Softgoal") {
            this.type = "Soft Goal";
        } else if (this.model.attributes.type == "basic.Resource") {
            this.type = "Resource";
        }
    },

    tagName: 'tr',

    template: [
        '<script type="text/template" id="item-template">',
            '<td>',
                '<select id=edit-name class=epochLists>',
                '<% var j = 0 %>',
                '<% for (var i = 0; i < SliderObj.getIntentionsAndActorsView().length; i++) { %>',
                    '<% if (SliderObj.getIntentionsAndActorsView()[i].model.attributes.type == "basic.Actor" && SliderObj.getIntentionsAndActorsView()[i].model.attributes.actor.attributes.intervals.length == 0) { %>',
                        '<option value=<%= j %>><%= SliderObj.getIntentionsAndActorsView()[i].model.attributes.actor.attributes.actorName %></option>',
                        '<% j++ %>',
                    '<% } else if (SliderObj.getIntentionsAndActorsView()[i].model.attributes.type != "basic.Actor" && SliderObj.getIntentionsAndActorsView()[i].model.attributes.intention.attributes.intervals.length == 0) { %>',
                        '<option value=<%= j %>><%= SliderObj.getIntentionsAndActorsView()[i].model.attributes.intention.attributes.nodeName %></option>',
                        '<% j++ %>',
                    '<% } %>',
                '<% } %>',
                '</select>',
            '</td>',
            '<td id=edit-type></td>',
            '<td>',
                '<div id=not-flipped>',
                    '<input id=edit-interval1 class="new-interval" type="number" value="0" min="0" max=<%= graph.get("maxAbsTime") %>> - <input id=edit-interval2 class=new-interval type="number" value=<%= graph.get("maxAbsTime") %> min="0" max=<%= graph.get("maxAbsTime") %>>',
                '</div>',
                '<div id=flipped style="display:none">',
                    '0 - <input id=edit-interval1-flip type="number" value="0" min="0" max=<%= graph.get("maxAbsTime") %>>, <input id=edit-interval2-flip type="number" value=<%= graph.get("maxAbsTime") %> min="0" max=<%= graph.get("maxAbsTime") %>> - <%= graph.get("maxAbsTime") %>',
                '</div>',
                '</td>',
            '<td><button id=save>Add</button></td>',
        '</script>'
    ].join(''),

    events: {
        'change #edit-name': 'updateDefaults',
        'click #save': 'save',
    },

    /**
     * Updates Type column and Available Intervals column defaults when a new Element is selected
     */
    updateDefaults: function() {
        document.getElementById("not-flipped").style.display = "";
        document.getElementById("flipped").style.display = "none";

        this.model = this.listElements[$("#edit-name").val()].model;

        // type
        if (this.model.attributes.type == "basic.Actor") {
            this.type = "Actor";
        } else if (this.model.attributes.type == "basic.Goal") {
            this.type = "Goal";
        } else if (this.model.attributes.type == "basic.Task") {
            this.type = "Task";
        } else if (this.model.attributes.type == "basic.Softgoal") {
            this.type = "Soft Goal";
        } else if (this.model.attributes.type == "basic.Resource") {
            this.type = "Resource";
        } 
        this.$('#edit-type').text(this.type);

        // default intervals
        if (this.type != "Actor") {
            var box1 = document.getElementById('edit-interval1');
            var box2 = document.getElementById('edit-interval2');
            var rangeMin = 0;
            var rangeMax = graph.get('maxAbsTime');
            this.actor = this.findActor();
            if (this.actor) {
                var actorIntervals = this.actor.model.attributes.actor.attributes.intervals;
                if (actorIntervals.length > 0) { // if actor is not always available
                    if (actorIntervals[1]){ // actor has two exclusion intervals
                        rangeMin = actorIntervals[0][1] + 1;
                        rangeMax = actorIntervals[1][0] - 1;
                        box1.value = rangeMin;
                        box2.value = rangeMax;
                    } else { // actor has one exclusion interval
                        if (actorIntervals[0][0] == 0) { // [0-#] excluded
                            if (actorIntervals[0][1] == graph.get('maxAbsTime')) { // special case: [0-100] excluded
                            }
                            rangeMin = actorIntervals[0][1] + 1;
                            box1.value = rangeMin;
                        } else if (actorIntervals[0][1] >= graph.get('maxAbsTime')) { // [#-max] excluded
                            rangeMax = actorIntervals[0][0] - 1;
                            box2.value = rangeMax;
                        } else { // [#-#] excluded
                            document.getElementById("flipped").style.display = "";
                            document.getElementById("not-flipped").style.display = "none";
                            document.getElementById("edit-interval1-flip").value = actorIntervals[0][0] - 1;
                            document.getElementById("edit-interval2-flip").value = actorIntervals[0][1] + 1;
                            document.getElementById("edit-interval2-flip").min = actorIntervals[0][1] + 1;
                            document.getElementById("edit-interval2-flip").max = graph.get('maxAbsTime');
                            document.getElementById("edit-interval1-flip").min = 0;
                            document.getElementById("edit-interval1-flip").max = actorIntervals[0][0] - 1;
                        }
                    }
                }
                document.getElementById('edit-interval1').min = rangeMin;
                document.getElementById('edit-interval1').max = rangeMax;
                document.getElementById('edit-interval2').min = rangeMin;
                document.getElementById('edit-interval2').max = rangeMax;
            }
        } 
    },

    /*
     * Finds the actor associated with the intention
     */
    findActor: function() {
        var elements = graph.getElements();
        var actors = []
        for (var i = 0; i < elements.length; i++) {
            var cell = elements[i].findView(paper);
            if (cell.model.attributes.type == "basic.Actor") {
                actors.push(cell);
            }
        }
        for (var i = 0; i < actors.length; i++) {
            if (actors[i].model.attributes.embeds) {
                for (var j = 0; j < actors[i].model.attributes.embeds.length; j++) {
                    if (actors[i].model.attributes.embeds[j] == this.model.id) {
                        return actors[i];
                    }
                }
            }
        }
    },

    /*
     * Converts the Edit row to either an Actor row or Intention row
     * Updates the model with the new exclusion interval
     */
    save: function() {
        // find values of the input boxes
        if (document.getElementById('flipped').style.display == "none") {
            var value1 = parseInt(document.getElementById('edit-interval1').value);
            var value2 = parseInt(document.getElementById('edit-interval2').value);
        } else {
            var value1 = parseInt(document.getElementById('edit-interval1-flip').value);
            var value2 = parseInt(document.getElementById('edit-interval2-flip').value);
        }

        // check that the range is valid
        if (value1 > value2) {
            console.log("error");
            alert("ERROR: the second value should be bigger than the first.")
            return;
        }

        // default min and max of exclusion intervals
        var rangeMin = 0;
        var rangeMax = parseInt(graph.get('maxAbsTime'));
        if (this.model.attributes.type == "basic.Actor") {
            if (value1 != 0) {
                if (value2 != graph.get('maxAbsTime')) {
                    this.model.attributes.actor.attributes.intervals = [[rangeMin, value1 - 1], [value2 + 1, rangeMax]];
                } else {
                    this.model.attributes.actor.attributes.intervals = [[rangeMin, value1 - 1]];
                }
            } else if (value2 != graph.get('maxAbsTime')) {
                this.model.attributes.actor.attributes.intervals = [[value2 + 1, rangeMax]];
            }
            this.updateEmbeds();
        } else {
            this.actor = this.findActor();
            if (this.actor) { // 
                var actorIntervals = this.actor.model.attributes.actor.attributes.intervals;
                if (actorIntervals.length > 0) { // if actor is not always available
                    if (actorIntervals[1]){ // actor has two exclusion intervals
                        rangeMin = actorIntervals[0][1] + 1;
                        rangeMax = actorIntervals[1][0] - 1;
                    } else { // actor has one exclusion interval
                        if (actorIntervals[0][0] == 0) { // [0-#] excluded
                            if (actorIntervals[0][1] == graph.get('maxAbsTime')) { // special case: [0-100] excluded
                            }
                            rangeMin = actorIntervals[0][1] + 1;
                        } else if (actorIntervals[0][1] >= graph.get('maxAbsTime')) { // [#-max] excluded
                            rangeMax = actorIntervals[0][0] - 1;
                        } else { // [#-#] excluded
                            
                        }
                    }
                }
            }
            if (document.getElementById('flipped').style.display == "none") { //  not flipped
                if (value1 != rangeMin) {
                    if (value2 != rangeMax) {
                        this.model.attributes.intention.attributes.intervals = [[rangeMin, value1 - 1], [value2 + 1, rangeMax]];
                    } else {
                        this.model.attributes.intention.attributes.intervals = [[rangeMin, value1 - 1]];
                    }
                } else if (value2 != rangeMax) {
                    this.model.attributes.intention.attributes.intervals = [[value2 + 1, rangeMax]];
                }
            } else {
                if (value1 != this.actor.model.attributes.actor.attributes.intervals[0][0] - 1) {
                    if (value2 != this.actor.model.attributes.actor.attributes.intervals[0][1] + 1) {
                        this.model.attributes.intention.attributes.intervals = [[value1 + 1, value2 - 1]];
                    } else {
                        this.model.attributes.intention.attributes.intervals = [[value1 + 1, rangeMax]];
                    }
                } else if (value2 != this.actor.model.attributes.actor.attributes.intervals[0][1] + 1) {
                    this.model.attributes.intention.attributes.intervals = [[rangeMin, value2 - 1]];
                }
            }

            var presConditionIntentionView = new PresConditionIntentionView({model: this.model, table: this.table});
            $('#prescond-list').append(presConditionIntentionView.el);
            presConditionIntentionView.render();
        }

        if(value1 >= rangeMax+1 || value2 >= rangeMax+1){
            alert("ERROR: the values should be smaller or equal to their element's maximum time point.")
        } else {
            this.remove();
            document.getElementById('add-prescondition').style.display = "";
            this.table.render();
        }

    },

    /*
     * If the model is an actor with embedded intentions, updates embedded intentions based on the actor's intervals
     */
    updateEmbeds: function() {
        if (this.model.attributes.embeds) {
            var elements = graph.getElements();
            var intentions = []
            for (var i = 0; i < elements.length; i++) {
                var cell = elements[i].findView(paper);
                if (cell.model.attributes.type != "basic.Actor") {
                    intentions.push(cell);
                }
            }
            for (var i = 0; i < intentions.length; i++) {
                for (var j = 0; j < this.model.attributes.embeds.length; j++) {
                    if (this.model.attributes.embeds[j] == intentions[i].model.id) {
                        if (this.model.attributes.actor.attributes.intervals[0] && this.model.attributes.actor.attributes.intervals[0][0] == 0){ // slider1 has been moved in
                            if (intentions[i].model.attributes.intention.attributes.intervals[0] && intentions[i].model.attributes.intention.attributes.intervals[0][0] < this.model.attributes.actor.attributes.intervals[0][1]) {
                                intentions[i].model.attributes.intention.attributes.intervals.shift();
                            }
                        } else if (this.model.attributes.actor.attributes.intervals[0] && this.model.attributes.actor.attributes.intervals[0][1] == graph.get('maxAbsTime')){ // slider2 has been moved in
                            if (intentions[i].model.attributes.intention.attributes.intervals[0] && intentions[i].model.attributes.intention.attributes.intervals[0][1] > this.model.attributes.actor.attributes.intervals[0][0]) {
                                intentions[i].model.attributes.intention.attributes.intervals.pop();
                            }
                        } else if (this.model.attributes.actor.attributes.intervals[0] && !this.model.attributes.actor.attributes.intervals[1] && this.model.attributes.actor.attributes.intervals[0][0] != 0 && this.model.attributes.actor.attributes.intervals[0][1] != graph.get('maxAbsTime')) { // interval is flipped
                            if (intentions[i].model.attributes.intention.attributes.intervals[0] && intentions[i].model.attributes.intention.attributes.intervals[0][0] > this.model.attributes.actor.attributes.intervals[0][0]) {
                                intentions[i].model.attributes.intention.attributes.intervals.pop();
                            } else if (intentions[i].model.attributes.intention.attributes.intervals[0] && intentions[i].model.attributes.intention.attributes.intervals[0][1] < this.model.attributes.actor.attributes.intervals[0][1]) {
                                intentions[i].model.attributes.intention.attributes.intervals.pop();
                            }
                        }
                    }
                }
            }
        }
    },

    /*
     * Deletes the Edit view
     */
    remove: function() {
        this.$el.remove();
        this.stopListening();
        return this;
    },

    render: function () {
        this.$el.html(_.template($(this.template).html()));
        this.$('#edit-type').text(this.type);

        return this;
    },

});