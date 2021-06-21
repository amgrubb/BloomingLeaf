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
        '<div class=relIntention>',
            '<div class=headings>',
                '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px;">Relative Intention Assignments',
                        '<div id="add-intention" style="display:inline">',
                            '<i class="fa fa-plus" id="addIntent" style="font-size:30px; float:right; margin-right:20px;"></i>',
                        '</div>',
                '</h3>',
            '</div>',
                '<div>',
                    '<table id="rel-intention-assignents" class="rel-intent-table">',
                        '<tr>',
                            '<th>Epoch Boundary Name 1</th>',
                            '<th>Relationship</th>',
                            '<th>Epcoch Boundary Name 2</th>',
                            '<th></th>',
                        '</tr>',
                    '</table>',
                '</div>',
        '</div>',
        '<div class="modal-footer" style="margin-top: 10px;">',
            '<button id="btn-save-assignment" class="analysis-btns inspector-btn sub-label green-btn" style="border-radius:40px;">Save</button>',
        '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</script>'].join(''),

    events: {
        'change #max-abs-time': 'updateMaxAbsTime',
        'change #abs-time-pts': 'updateAbsTimePts',
        'click #add-intention': 'addRelIntentionRow'
    },

    render: function(){
        this.$el.html(_.template($(this.template).html())());
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
        console.log("in abs time pts")
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

    // var btnHtml = '<td><button class="unassign-abs-intent-btn"> Unassign </button></td>';

	// for (var i = 0; i < model.intentions.length; i++) {
	// 	var intention = model.intentions[i];
	// 	var funcType = intention.dynamicFunction.stringDynVis;
	// 	var intentionName = intention.nodeName;

	// 	// nameIdMapper[name] = intention.nodeID;
	// 	if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' ||
	// 		funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {

	// 		var absTime = intention.getAbsConstTime('A');
	// 		// default value to display.
	// 		// -1 means abs time does not exist. So display empty string instead.
	// 		var defaultVal = absTime === -1 ? '' : absTime;

	// 		$('#node-list').append('<tr nodeID = ' + intention.nodeID + ' srcEB = A><td>' + intentionName + ': A' + '</td><td>' + funcType + '</td>' +
	// 			'<td><input type="number" name="sth" value="' + defaultVal + '"></td>' + btnHtml + '</tr>');
	// 	} else if (funcType == 'UD') {

	// 		// the number of function transitions, is the number of functions minus one
	// 		var funcTransitions = intention.dynamicFunction.functionSegList.length - 1;
	// 		var currBound = 'A';
	// 		for (var j = 0; j < funcTransitions; j++) {

	// 			// default value to display
	// 			var absTime = intention.getAbsConstTime(currBound);
	// 			var defaultVal = absTime === -1 ? '' : absTime;

	// 			$('#node-list').append('<tr nodeID = ' + intention.nodeID + ' srcEB = ' + currBound + '><td>' + intentionName + ': ' + currBound + '</td><td>' + funcType + '</td>' +
	// 				'<td><input type="number" name="sth" value=' + defaultVal + '></td>' + btnHtml + '</tr>');
	// 			currBound = String.fromCharCode(currBound.charCodeAt(0) + 1);
    
    displayAbsoluteIntentionAssignments: function() {
        this.model.getIntentions().forEach(intentionCell => {
            var intentionBbm = intentionCell.get('intention');
            var funcType = intentionBbm.get('evolvingFunction')?.get('type');
                if ((funcType == 'RC' || funcType == 'CR' || funcType == 'MP' ||
                 	funcType == 'MN' || funcType == 'SD' || funcType == 'DS')){
                    // NEW VIEW
                } else if (funcType == 'UD'){
                    // Iterate through and then new view
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
    
    /**
     * Adds relative intention to constraints list
     */
    addRelIntentionRow: function(){
        console.log(this.model.getIntentions()[0].prop('intention'))
        /**
         * Add new constraint to 
         * this.model.getElements().filter(//filter for intentions with funcseg lists > 2)
         * add all func segs for all relevant intentions to selectdropdown (maybe make a function for this?)
         * Doesn't need to be dynamic yet
         */
    }

    

// /**
//  * Add relative intention row
//  */
// $('.addIntention').on('click', function(){
//     var intentions = model.intentions;
//         var epochHtml1 = '<div class="epochLists" id="epoch1List"><select><option selected>...</option>';
//         var epochHtml2 =  '<div class="epochLists" id="epoch2List"><select><option selected>...</option>';
//         for (var i = 0; i < intentions.length; i++) {

//             // if number of function segments >= 2, we have at least one transition
//             if (intentions[i].getNumOfFuncSegements() >= 2) {
//                 var funcSegments = intentions[i].dynamicFunction.getFuncSegmentIterable();
//                 for (var j = 0; j < funcSegments.length - 1; j++) {
//                     var epoch = funcSegments[j].funcStop;
//                     var newEpochHtml = '<option nodeID=' + intentions[i].nodeID + ' epoch=' + epoch + '>' + intentions[i].nodeName + ': ' + epoch + '</option>';
//                     epochHtml1 += newEpochHtml;
//                     epochHtml2 += newEpochHtml;
//                 }
//             }
//         }

//         epochHtml1 += '</select></div>';
//         epochHtml2 += '</select></div>';


//         var relationship = '<div class="epochLists" id="relationshipLists"><select><option selected>...'+
//             '</option><option value="eq">=</option><option value="lt"><</option></select></div>'

//         $('#rel-intention-assignents').append('<tr><td>' + epochHtml1 + '</td><td>' + relationship +
//             '</td><td>'+ epochHtml2 +'</td><td><i class="fa fa-trash-o fa-2x" id="removeIntention" aria-hidden="true"></i></td></tr>');
// });

// $(document.body).on('click', '#removeIntention', function(){
//     var row = $(this).parent().parent();
//     var nodeID1 = row.find('#epoch1List select option:checked').attr('nodeID');
//     var epoch1 = row.find('#epoch1List select option:checked').attr('epoch');
//     var type = row.find('#relationshipLists select option:checked').text();
//     var nodeID2 = row.find('#epoch2List select option:checked').attr('nodeID');
//     var epoch2 = row.find('#epoch2List select option:checked').attr('epoch');
//     var constraint = new Constraint(type, nodeID1, epoch1, nodeID2, epoch2);

//     model.removeConstraint(constraint);
//     row.remove();
// });



});

var IntentionRelationshipView = new Backbone.View.extend({
    model: IntentionBBM, // FunctionSegmentBBM
    template: [
        '<script type="text/template" id="item-template">',
        '<tr><td>' + intentionName + ': ' + currBound + '</td><td>' + funcType + '</td>',
        '<td><input id="absFuncSegValue" type="number" name="sth" value=' + defaultVal + '></td>' + btnHtml + '</tr>',
        '</script>'
    ].join(''),

    events: {
        'change #absIntentionValue' : 'updateAbsRelation',
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

var RelativeIntentionView = new Backbone.View.extend({
    model: Constraint,
    template: ['<script type="text/template" id="assignments-template">',
        '<tr><td> <div class="epochLists" id="epoch1List"><select><option selected>...</option> </td>',
        '<td> <div class="epochLists" id="relationshipLists"><select>',
            '<option selected>...</option>',
            '<option value="eq">=</option><option value="lt"><</option></select></div></td>',
        '<td> <div class="epochLists" id="epoch2List"><select><option selected>...</option> </td>',
        '<td><i class="fa fa-trash-o fa-2x" id="removeIntention" aria-hidden="true"></i></td></tr>',
        '</script>'
    ].join(""),

    initialize: function(){

    },

    render: function(){
        this.$el.html(_.template($(this.template).html())());
        this.loadOptions();
        return this;
    }



    // pass in intentions from above in order to grab all relevent func seg lists
    // class = id so that when you select one of the intention ids it removes that class

    /**
     * for intention in intention list:
     *        for intention.relevent func segs:
     *                  create new option tag html view (append to )
     * 
     */
});

// var OptionTagView = new Backbone.View.extend({
//     template:['<script type="text/template" id="assignments-template">',
//         '<option class=' + intentions[i].nodeID + ' epoch=' + epoch + '>' + intentions[i].nodeName + ': ' + epoch + '</option>',
//         '</script>'
//     ].join(""),
// });