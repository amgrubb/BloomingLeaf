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
    '<div class=relIntention>',
            '<div class=headings>',
                '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px;">Relative Intention Assignments',
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
        '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px;">Max Absolute Time</h3>',
                '<input style="float:left;"; id="max-abs-time" class="analysis-input" type="number" min="1" step="1" value="100"/>',
            '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px; margin-top: 30px;">Absolute Time Points</h3>',
            '<h5 style="text-align:left; color:#1E85F7; margin-bottom:5px; margin-top: -5px;">e.g. 5 8 22</h5>',
                '<input style="float:left;"; id="abs-time-pts" class="analysis-input" type="text"/>',
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
        '<div class="modal-footer" style="margin-top: 10px;">',
            '<button id="btn-save-assignment" class="analysis-btns inspector-btn sub-label green-btn" style="border-radius:40px;">Save</button>',
        '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</script>'].join(''),

    events: {
        'click #add-intention': 'addRelIntentionRow',
        'change #max-abs-time': 'updateMaxAbsTime',
        'change #abs-time-pts': 'updateAbsTimePts'
    },

    render: function(){
        this.$el.html(_.template($(this.template).html())());
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
        // TODO: We could split at spaces + commas: /[ ,]+/) 
        // but would need to fix the regex.test var first
        var regex = new RegExp("^(([1-9]0*)+\\s+)*([1-9]+0*)*$");
        var absTimeElement = $('#abs-time-pts');
        if (regex.test(absTimeElement.val())) {
            this.model.set('absTimePtsArr', absTimeElement.val().split(" "))
        } else {
            absTimeElement.val(this.model.get('absTimePtsArr'));
        }
    },

    // TODO: Implement view to take in already selected constraint
    loadRelativeIntentions: function(){
        for (let constraint in this.model.get('constraints')){
            var relIntentionRow = new RelativeIntentionView({model: constraint, new: false});
        $('#rel-intention-assigments').append(relIntentionRow.el);
        relIntentionRow.render();
        }
    },

    /**
     * Adds relative intention to constraints list
     */
    addRelIntentionRow: function(){
        var relIntentionRow = new RelativeIntentionView({model: new Constraint(), new: true});
        $('#rel-intention-assigments').append(relIntentionRow.el);
        relIntentionRow.render();
    },
    
    displayAbsoluteIntentionAssignments: function() {
        this.model.getIntentions().forEach(intentionCell => {
            var intentionBbm = intentionCell.get('intention');
            var funcSegList = intentionBbm.get('evolvingFunction')?.get('functionSegList');
            if (funcSegList != 'undefined'){
                // TODO: Check with @amgrubb about how this is being sliced
                for (let funcSeg of funcSegList.slice(1)){
                    var intentionRelationshipView = new IntentionRelationshipView({
                        model: funcSeg, funcType: intentionBbm.get('evolvingFunction').get('type'), 
                        intentionName: intentionBbm.get('nodeName')});
                    $('#node-list').append(intentionRelationshipView.el);
                    intentionRelationshipView.render();  
                }
            }
        });
    },

    displayAbsoluteRelationshipAssignments: function(){
        this.model.getLinks().forEach(linkCell => {
            linkBbm = linkCell.get('link');
            if(linkBbm.isValidAbsoluteRelationship()){
                var linkRelationshipView = new LinkRelationshipView({model: linkBbm});
                $('#link-list').append(linkRelationshipView.el);
                linkRelationshipView.render();
            }
        })
    },
});

var RelativeIntentionView = new Backbone.View.extend({
    model: Constraint,
    
    initialize: function(options){
        this.new = options.new;
        this.model.on('destroy', this.remove, this);
    },

    newConstraintTemplate: ['<script type="text/template" id="assignments-template">',
        '<tr><td> <div class="epochLists"><select id="epoch1List"><option selected>...</option></select></div></td>',
        '<td> <div class="epochLists"><select id="relationshipLists">',
            '<option selected>...</option>',
            '<option value="eq">=</option><option value="lt"><</option></select></div></td>',
        '<td> <div class="epochLists"><select id="epoch2List><option selected>...</option></select></div></td>',
        '<td><i class="fa fa-trash-o fa-2x" id="removeConstraint" aria-hidden="true"></i></td></tr>',
        '</script>'
    ].join(''),

    loadedConstraintTemplate: [].join(''),

    events: {
        'change #epoch1List' : 'changeEpoch1',
        'change #epoch2List' : 'changeEpoch2',
        'change #relationshipLists' : 'changeRelationship',
        'click #removeConstraint' : 'removeConstraint',

    },

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

    loadOptions: function(){
        this.model.getIntentions().forEach(intention => {
            if (intention.getFuncSegments()?.length >= 2){
                for (let funcSegment in intention.getFuncSegments()){
                    var optionTag = this.getOptionTag(intention.get('id'), intention.get('nodeName'), funcSegment.get('startTP'));
                    $('#epoch1List').append(optionTag);
                    $('#epoch2List').append(optionTag);
                }
            }
        })
    },

    changeEpoch1: function(){
        selectionOption = $('#epoch1List option:selected');
        this.model.set('srcID', selectedOption.attr('class'));
        this.model.set('srcRefTP', selectedOption.attr('epoch'));
    },

    changeEpoch2: function(){
        selectionOption = $('#epoch2List option:selected');
        this.model.set('srcID', selectedOption.attr('class'));
        this.model.set('srcRefTP', selectedOption.attr('epoch'));
    },

    changeRelationship: function(){
        this.model.set('type', $('#relationshipLists option:selected').text());
    },

    removeConstraint: function(){
        this.model.destroy();
    },

    getOptionTag(intentionId, nodeName, epoch){
        return '<option class='+ intentionId +' epoch='+ epoch +'>' + nodeName + ': ' + epoch + '</option>';
    },
});

var IntentionRelationshipView = new Backbone.View.extend({
    model: FunctionSegmentBBM,

    initialize: function(options){
        this.funcType = options.funcType;
        this.intentionName = options.intentionName;
    },

    template: [
        '<script type="text/template" id="item-template">',
        '<tr><td> "<%= intentionName %>" : "<%= startTP %>"</td><td> <%= funcType %> </td>',
        '<td><input id="absFuncSegValue" type="number" name="sth" value="<% if (startATP == -1) {%> "" <%} else { %> startATP <% } %>"></td>',
        '<td><button id="unassign-abs-intent-btn"> Unassign </button></td></tr>',
        '</script>'
    ].join(''),

    events: {
        'change #absFuncSegValue' : 'updateAbsFuncSegValue',
        'click #unassign-abs-intent-btn' : 'unassignAbsIntention'
    },

    render: function(){
        this.$el.html(_.template($(this.template).html())(Object.assign(this.model, this.funcType, this.intentionName).toJSON()));
        return this;
    },

    updateAbsFuncSegValue: function(){
        var newTime = parseInt($('#absFuncSegValue').val());
        if (isNaN(newTime)) {
            return;
        }
        this.model.set('startATP', newTime);
    },

    unassignAbsIntention: function(){
        $('#absFuncSegValue').val('');
        this.model.set('startATP', -1);
    },

});

var LinkRelationshipView = new Backbone.View.extend({
    model: LinkBBM,
    template: [
        '<script type="text/template" id="item-template">',
        '<tr><td> <%= linkType %> </td><td> <%= linkSrcID %> </td>',
        '<td> <%= linkDestID %> </td>',
        '<td><input id="linkAbsRelation" type="number" name="sth" value= "<% if (linkAbsTime === -1) {%> "" <%} else { %> linkAbsTime <% } %>" ></td>',
        '<td><button id="unassign-abs-rel-btn" > Unassign </button></td> </tr>',
        '</script>'
    ].join(''),

    events: {
        'change #linkAbsRelation' : 'updateLinkAbsRelation',
        'click #unassign-abs-rel-btn' : 'unassignAbsRelation'
    },

    render: function(){
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        return this;
    },

    updateLinkAbsRelation: function(){
        var newTime = parseInt($('#linkAbsRelation').val());
        if (isNaN(newTime)) {
            return;
        }
        this.model.set('linkAbsTime', newTime);
    },

    unassignAbsRelation: function(){
        $('#linkAbsRelation').val('');
        this.model.set('linkAbsTime', -1);
    },

});