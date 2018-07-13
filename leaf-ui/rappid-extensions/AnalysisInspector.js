var epochLists = [];
var nameIdMapper = {};
var constraintID = 0;
var rx = /Goal_\d+/g; // MATCH goal name Goal_x
var extractEB = /[A-Z]+$/;
var saveIntermValues = {};
var absoluteTimeValues;
var saveIVT;
var AnalysisInspector = Backbone.View.extend({

	className: 'analysis-inspector',
	template: [
		'<h2 style="text-align:center; width:100%;margin-top:6px;margin-bottom:0px">Analysis</h2>',
		'<hr>',
		'<h3> Simulation Start: 0 </h3>',
		'<label class="sub-label">Max Absolute Time</label>',
		'<input id="max-abs-time" class="sub-label" type="number" min="1" step="1" value="100"/>',
		'<br>',
		'<label class="sub-label">Conflict Prevention Level</label>',
		'<select id="conflict-level" class="sub-label" style="height:30px;">',
			'<option value=S selected> Strong</option>',
	        '<option value=M> Medium</option>',
	        '<option value=W> Weak</option>',
	        '<option value=N> None</option>',
		'</select>',
		'<br>',
		'<label class="sub-label">Num Relative Time Points</label>',
		'<input id="num-rel-time" class="sub-label" type="number" min="0" max="20" step="1" value="1"/>',
		'<br>',
		'<label class="sub-label">Absolute Time Points</label>',
		'<font size="2">(e.g. 5 8 22)</font>',
		'<input id="abs-time-pts" class="sub-label" type="text"/>',
		'<br>',
		'<hr>',
		'<button id="btn-view-assignment" class="analysis-btns inspector-btn sub-label green-btn">View List of Assignments</button>',
		'<button id="btn-view-intermediate" class="analysis-btns inspector-btn sub-label green-btn">View Intermediate Values</button>',

		// This is the modal box of assignments
		'<div id="myModal" class="modal">',
		  '<div class="modal-content">',
		    '<div class="modal-header">',
		      '<span class="close">&times;</span>',
		      '<h2>Absolute and Relative Assignments</h2>',
		    '</div>',
		    '<div class="modal-body">',
		      '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px;">Absolute Intention Assignments</h3>',
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
								'<div class="addIntention" style="display:inline">',
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
		'<div id="intermediateTable" class="intermT">',
			'<div class="intermContent">',
				'<div class="intermHeader">',
					'<span class="closeIntermT">&times;</span>',
					'<h2>Intermediate Values Table</h2>',
				'</div>',
				'<div class="intermBody">',
						'<table id="interm-list" class="interm-table">',
							'<thead id = "header">',
								'<tr id="header-row">',
									'<th style="width:110px"></th>',
									'<th>  Initial Value  </th>',
								'</tr>',
							'</thead>',
							'<tr id="intentionRows">',
							'<th>',
									'<div class="divisionLine"></div>',
									'<div class="intentionPlace"><b>Intention</b></div>',
									'<div class="timePlace"><b>Timeline</b></div>',
									'<div class="outerdivslant borderdraw2">',
									'</div>',
									'<div class = "innerdivslant borderdraw2">',
									'</div>',
								'</th>',
								'<th>0</th>',
							'</tr>',
					'</table>',
					'<button id="btn-save-intermT" class="analysis-btns inspector-btn sub-label green-btn" style="border-radius:40px;">Save</button>',
				'</div>',
			'</div>',
		'</div>',
		'<br>',
		'<hr>',
		'<button id="btn-single-path" class="analysis-btns inspector-btn sub-label green-btn">Simulate Single Path</button>',
		//'<button id="btn-single-path" class="analysis-btns inspector-btn sub-label green-btn">1. Simulate Single Path</button>',
		'<button id="btn-all-next-state" class="analysis-btns inspector-btn sub-label ice-btn">Explore Possible Next States</button>'
	].join(''),

	events: {
		'click #btn-view-assignment': 'loadListOfAssignments',
		'click #btn-view-intermediate': 'loadIntermediateValues',
		'click .close': 'dismissModalBox',
		'click .closeIntermT':'dismissIntermTable',
		'click .unassign-abs-intent-btn': 'unassignAbsIntentValue',
		'click .unassign-abs-rel-btn': 'unassignAbsRelValue',
		'click #btn-save-assignment': 'saveAssignment',
		'click #btn-single-path': 'singlePath',
		'click #btn-all-next-state': 'getAllNextStates',
		'click .addIntention' : 'addRelAssignmentRow',
		'click #btn-save-intermT' : 'saveIntermTable',
		'change #num-rel-time' : 'addRelTime',
		'change #conflict-level': 'changeConflictLevel',
		'change #abs-time-pts': 'changeAbsTimePts',
		'change #max-abs-time': 'changeMaxAbsTime'
	},

	render: function() {

		// These functions are used to communicate between analysisInspector and Main.js
		this.$el.html(_.template(this.template)());
		$('head').append('<script src="./scripts/js-objects/analysis.js"></script>');


		this.setDeleteRelAssignmentListener();
	},

	/**
	 * Retrieves information about the current model and sends to the backend
	 * to do single path analysis.
	 *
	 * This function is called on click for #btn-single-path
	 */
	singlePath: function() {
		//Create the object and fill the JSON file to be sent to backend.
		//Get the AnalysisInspector view information
		var analysis = new InputAnalysis("singlePath");

		//Prepare and send data to backend
		this.sendToBackend(analysis);
	},

	/**
	 * Retrieves information about the current model and sends to the backend
	 * to get all next possible states.
	 *
	 * This function is called on click for #btn-all-next-state
	 */
	getAllNextStates: function() {
		//Create the object and fill the JSON file to be sent to backend.
		//Get the AnalysisInspector view information
		var analysis = new InputAnalysis("allNextStates");

		//Prepare and send data to backend
		this.sendToBackend(analysis);
	},

	/**
	 * Creates an object to send to the backend and calls
	 * a backendComm() to send to backend
	 *  
	 * @param {Object} analysisz
	 *   InputAnalysis() object
	 */
	sendToBackend: function(analysis){

		// Object to be sent to the backend
		var jsObject = {};
		jsObject.analysis = analysis;

		//Get the Graph Model
		jsObject.model = getFrontendModel(false);

		this.saveElementsInGraphVariable();

		if(jsObject.model == null) {
			return null;
		}

		//Send data to backend
		backendComm(jsObject);
	},

	/**
	 * Removes all html for this inspector
	 */
	clear: function(e){
		this.$el.html('');
	},
	/********************** Modal box related ****************************/

	/**
     * Displays the absolute and relative assignments modal for the user.
     *
     * This function is called on click for #btn-view-assignment.
	 */
	loadListOfAssignments: function(event) {
		epochLists = [];
		graph.constraintValues = [];
		var modal = document.getElementById('myModal');

		// Clear all previous table entries
		$(".abs-table").find("tr:gt(0)").remove();
		
		// Display the modal by setting it to block display
		modal.style.display = "block";


		this.displayAbsoluteIntentionAssignments();
		this.displayAbsoluteRelationshipAssignments();

	},

	/**
	 * Displays the links for the Absolute Relationship Assignments for
	 * the Absolute and Relative Assignments modal
	 */
	displayAbsoluteRelationshipAssignments: function(e) {
		var btnHtml = '<td><button class="unassign-abs-rel-btn" > Unassign </button></td>';
		// Get a list of links
		var links = graph.getLinks();

		for (var i = 0; i < model.links.length; i++) {
			var link = model.links[i];
			var sourceID = link.linkSrcID;
			var targetID = link.linkDestID;

			// If this link does not have a source and a target
			if (sourceID == null || targetID == null) {
				continue;
			}

			var sourceName = model.getUserIntentionByID(sourceID).nodeName;
			var targetName = model.getUserIntentionByID(targetID).nodeName;
			

			if (link.linkType == 'NBD' || link.linkType == 'NBT' || link.isEvolvingRelationship()) {
				var linkAbsTime = link.absoluteValue;
				var defaultValue = linkAbsTime == -1 ? '' : linkAbsTime;

				$('#link-list').append('<tr linkID = ' + link.linkID + '><td>' + link.linkType + '</td><td>' + sourceName + '</td><td>' + targetName +
					'</td><td><input type="number" name="sth" value=' + defaultValue + '></td>' + btnHtml +
					'</tr>');
			}

		}
	},

	addRelTime: function(event) {

		var numRel = $('#num-rel-time');
		if (numRel.val() !== ""){
            analysisRequest.numRelTime = numRel.val()
        }
        else {
			numRel.val(analysisRequest.numRelTime);
		}
	},

	changeConflictLevel: function(event) {
		analysisRequest.conflictLevel = $('#conflict-level').val()[0];
	},

	changeAbsTimePts: function(event) {
 	    var regex = new RegExp("^(([0-9])+\\s+)*[0-9]*$");

        var absTime = $('#abs-time-pts');
		if (regex.test(absTime.val())){
			analysisRequest.absTimePts = absTime.val().trim();
			analysisRequest.absTimePtsArr = this.getAbsoluteTimePoints();
			analysisRequest.clearIntentionEvaluations();
		}
		else {
			absTime.val(analysisRequest.absTimePts);
		}
	},

    changeMaxAbsTime : function(event) {
        var maxTime = $('#max-abs-time');
        if (maxTime.val() !== ""){
            model.maxAbsTime = maxTime.val()
        }
        else {
            maxTime.val(model.maxAbsTime);
        }
	},


	/**
	 * Displays the nodes for the Absolute Intention Assignments for 
	 * the Absolute and Relative Assignments modal
	 */
	displayAbsoluteIntentionAssignments: function(e) {

		var btnHtml = '<td><button class="unassign-abs-intent-btn" > Unassign </button></td>';

		for (var i = 0; i < model.intentions.length; i++) {
			var intention = model.intentions[i];
			var funcType = intention.dynamicFunction.stringDynVis;
			var intentionName = intention.nodeName;

			// nameIdMapper[name] = intention.nodeID;
			if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' || 
				funcType == 'MN' || funcType == 'SD' || funcType =='DS') {

				
				var absTime = intention.getAbsConstTime('A');
				// default value to display.
				// -1 means abs time does not exist. So display empty string instead.
				var defaultVal = absTime === -1 ? '' : absTime;

				$('#node-list').append('<tr nodeID = '+intention.nodeID+' srcEB = A><td>' + intentionName + ': A' + '</td><td>' + funcType + '</td>' +
					'<td><input type="number" name="sth" value="' + defaultVal + '"></td>' + btnHtml + '</tr>');
			} else if (funcType == 'UD') {

				// the number of function transitions, is the number of functions minus one
				var funcTransitions = intention.dynamicFunction.functionSegList.length - 1;
				var currBound = 'A';
				for (var j = 0; j < funcTransitions; j++) {

					// default value to display
					var absTime = intention.getAbsConstTime(currBound);
					var defaultVal = absTime === -1 ? '' : absTime;

					$('#node-list').append('<tr nodeID = ' + intention.nodeID + ' srcEB = ' + currBound + '><td>' + intentionName +': '+ currBound + '</td><td>' + funcType + '</td>' +
						'<td><input type="number" name="sth" value=' + defaultVal + '></td>' + btnHtml + '</tr>');
					currBound = String.fromCharCode(currBound.charCodeAt(0) + 1);
				}
			}
		}

	},

	/**
	 * Returns an array of numbers containing numbers that the 
	 * user has inputed in the Absolute Time Points input box.
	 * @returns {Array.<Number>}
	 */
	getAbsoluteTimePoints() {
		var absValues = document.getElementById('abs-time-pts').value;
		var absTimeValues;

		if (absValues != '') {
			absTimeValues = absValues.split(' ');
			absTimeValues.map(function(i) {
				if (i != '') {
					return parseInt(i, 10);
				}
			});

			//Sort into ascending order
			absTimeValues.sort(function(a, b){return a - b});
		} else {
			absTimeValues = [];
		}

		return absTimeValues
	},

	/**
	 * Displays the Intermediate Values modal for the user
	 *
	 * This function is called on click for #btn-view-intermediate
	 */
	loadIntermediateValues: function(e) {
		var timeValues = {};
		$('#interm-list').find("tr:gt(1)").remove();
		$('#header').find("th:gt(1)").remove();
		$('#intentionRows').find("th:gt(1)").remove();

		var intermTDialog = document.getElementById('intermediateTable');
		intermTDialog.style.display = "block";
		var elements = graph.getElements();
		var intermTable = document.querySelector('.interm-table');

		var absTimeValues = analysisRequest.absTimePtsArr;

		for (var i = 0; i < absTimeValues.length; i++) {
			$('#header-row').append('<th>Absolute</th>');
			$('#intentionRows').append('<th>' + absTimeValues[i] + '</th>');
		}
		
		var options = `<option value="empty"> </option>
						<option value="(no value)">(no value)</option>
						<option value="0000">None (⊥, ⊥) </option>
						<option value="0011">Satisfied (FS, ⊥) </option>
						<option value="0010">Partially Satisfied (PS, ⊥) </option>
						<option value="1100">Denied (⊥, FD) </option>
						<option value="0100">Partially Denied (⊥, PD)</option>`;

		for (var i = 0; i < model.intentions.length; i++) {
			var intention = model.intentions[i];
			var initValue = intention.getInitialSatValue(); // ex, '0000'
			var name = intention.nodeName;

			// If user put no absolute time points
			if ($.isEmptyObject(absTimeValues)) {
				$('#interm-list').append('<tr><td>' + name + '</td><td>' + satisfactionValuesDict[initValue].satValue + '</td></tr>');
			} else {

				// TODO, display previously saved options
				var appendList = '<tr class="intention-row"><td>' + name + '</td><td>'+satisfactionValuesDict[initValue].satValue+'</td>';

				for (j = 0; j < absTimeValues.length; j++) {

					// Add select tags for each absolute time point
					var selectTag = '<select id="evalID" nodeID = ' + intention.nodeID + ' absTime = '+ absTimeValues[j] +'>' + options + '</select>'
					appendList += '<td>' + selectTag + '</td>';
				}
				appendList += '</tr>';
				$('#interm-list').append(appendList);

			}
		}
	},
	// Dismiss modal box
	dismissModalBox: function(e){
		var modal = document.getElementById('myModal');
		modal.style.display = "none";

	},
	dismissIntermTable: function(e){
		var intermT = document.getElementById('intermediateTable');
		intermT.style.display = "none";
	},

	// Trigger when unassign button is pressed. Change the assigned time of the node/link in the same row to none
	unassignAbsRelValue: function(e){
		var button = e.target;
		var row = $(button).closest('tr');
		var assignedTime = row.find('input[type=number]');
		$(assignedTime).val('');

		var linkID = row.attr('linkID');
		var link = model.getLinkByID(linkID);
		link.absoluteValue = -1;
	},

	unassignAbsIntentValue: function(e) {
		var button = e.target;
		var row = $(button).closest('tr');
		var assignedTime = row.find('input[type=number]');
		$(assignedTime).val('');

		var nodeID = row.attr('nodeID');
		var srcEB = row.attr('srcEB');
		var constraint = model.getAbsConstBySrcID(nodeID, srcEB);
		constraint.absoluteValue = -1;
	},

	/**
	 * Saves the Relative Intention Assignments from the 
	 * Absolute and Relative Assignments into the graph object
	 */
	saveRelativeIntentionAssignments: function() {
		$('.rel-intent-table tr').each(function () {
	        var nodeID1 = $(this).find('#epoch1List select option:checked').attr('nodeID');
        	var epoch1 = $(this).find('#epoch1List select option:checked').attr('epoch');
        	var type = $(this).find('#relationshipLists select option:checked').text();
	    	var nodeID2 = $(this).find('#epoch2List select option:checked').attr('nodeID');
	    	var epoch2 = $(this).find('#epoch2List select option:checked').attr('epoch');

	    	if (!nodeID1 || !epoch1 || !type || !nodeID2 || !epoch2) {
	    		return;
	    	}

	    	// create constraints object
	    	var constraint = new Constraint(type, nodeID1, epoch1, nodeID2, epoch2);

	    	if (!model.existsConstraint(constraint)) {
	    		model.constraints.push(new Constraint(type, nodeID1, epoch1, nodeID2, epoch2));
	    	}
	    });

	},

	/**
	 * Saves the Absolute Intention Assignments from the 
	 * Absolute and Relative Assignments to the graph object
	 */
	saveAbsoluteIntentionAssignments() {
		// Save absolute intention assignments
		$.each($('#node-list').find("tr input[type=number]"), function(){
			var newTime = parseInt($(this).val()); // ex 15
			if (isNaN(newTime)) {
				return;
			}
			var row = $(this).closest('tr');
			var srcEB = row.attr('srcEB'); // ex. 'A'
			var funcValue = row.find('td:nth-child(2)').html(); // ex. 'MP'
			var nodeID = row.attr('nodeID'); // ex. '0000'

			model.setAbsConstBySrcID(nodeID, srcEB, newTime);

		});
	},

	/**
	 * Saves the Absolute Relationship Assignments from the 
	 * Absolute and Relative Assignments into the graph object
	 */
	saveAbsoluteRelationshipAssignments() {
		// Save absolute relationship assignment
		$.each($('#link-list').find("tr input[type=number]"), function() {
			var newTime = parseInt($(this).val());
			if (isNaN(newTime)) {
				return;
			}
			var row = $(this).closest('tr');
			var linkID = row.attr('linkID');
			var link = model.getLinkByID(linkID);
			link.absoluteValue = newTime;

		});
	},

	// TODO: Check if the times users put in are valid
	/**
	 * Saves absolute intention and relationship assignments to the graph object
	 *
	 * This function is called on click for #btn-save-assignment
	 */
	saveAssignment: function(e){

		this.saveRelativeIntentionAssignments();
		this.saveAbsoluteIntentionAssignments();
		this.saveAbsoluteRelationshipAssignments();

		// Dismiss the modal
		var modal = document.getElementById('myModal');
		modal.style.display = "none";
		$("#epoch1List select").val();
	},

	/**
	 * Save the intermediate table values into analysisRequest
	 */
	saveIntermTable: function(){
		
		// for each row of the table
		$('.intention-row').each(function () {
			// for each column of the current row
			$(this).find('select').each(function () {
				var nodeID = $(this).attr('nodeID');
				var absTime = $(this).attr('absTime');
				var evalLabel = $(this).find(":selected").val();

				if (evalLabel === 'empty') {
					return;
				}

				analysisRequest.userAssignmentsList.push(new IntentionEvaluation(nodeID, absTime, evalLabel));

			});
		});


		this.dismissIntermTable();
	},

	/**
	 * Save elements in the respective graph attributes
	 */
	saveElementsInGraphVariable: function(){
		var elements = [];
		for (var i = 0; i < graph.getElements().length; i++){
			if (!(graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
				elements.push(graph.getElements()[i]);
			}
		}
		graph.allElements = elements;
		graph.elementsBeforeAnalysis = elements;
	},
	
	
	/**
	 * This function is called on click .addIntention (the plus icon)
	 */
	addRelAssignmentRow: function() {

		var intentions = model.intentions;
		var epochHtml1 = '<div class="epochLists" id="epoch1List"><select><option selected>...</option>';
		var epochHtml2 =  '<div class="epochLists" id="epoch2List"><select><option selected>...</option>';
		for (var i = 0; i < intentions.length; i++) {

			// if number of function segments >= 2, we have at least one transition
			if (intentions[i].getNumOfFuncSegements() >= 2) {
				var funcSegments = intentions[i].dynamicFunction.getFuncSegmentIterable();
				for (var j = 0; j < funcSegments.length - 1; j++) {
					var epoch = funcSegments[j].funcStop;
					var newEpochHtml = '<option nodeID=' + intentions[i].nodeID + ' epoch=' + epoch + '>' + intentions[i].nodeName + ': ' + epoch + '</option>';
					epochHtml1 += newEpochHtml;
					epochHtml2 += newEpochHtml;
				}
			}
		}

		epochHtml1 += '</select></div>';
		epochHtml2 += '</select></div>';


		var relationship = '<div class="epochLists" id="relationshipLists"><select><option selected>...'+
		'</option><option value="eq">=</option><option value="lt"><</option></select></div>'

		$('#rel-intention-assignents').append('<tr><td>' + epochHtml1 + '</td><td>' + relationship +
		 '</td><td>'+ epochHtml2 +'</td><td><i class="fa fa-trash-o fa-2x" id="removeIntention" aria-hidden="true"></i></td></tr>');
		// $("#removeIntention").prop('onclick', function() {
		// 	console.log('hello');
		// });
	},

	setDeleteRelAssignmentListener: function() {

		$(document.body).on('click', '#removeIntention', function(){
			var row = $(this).parent().parent();
			var nodeID1 = row.find('#epoch1List select option:checked').attr('nodeID');
			var epoch1 = row.find('#epoch1List select option:checked').attr('epoch');
        	var type = row.find('#relationshipLists select option:checked').text();
	    	var nodeID2 = row.find('#epoch2List select option:checked').attr('nodeID');
	    	var epoch2 = row.find('#epoch2List select option:checked').attr('epoch');
	    	var constraint = new Constraint(type, nodeID1, epoch1, nodeID2, epoch2);

			model.removeConstraint(constraint);
			row.remove();
		});
	}
	

});
