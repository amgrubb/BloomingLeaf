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
		'<input id="max-abs-time" class="analysis-input" type="number" min="1" step="1" value="100"/>',
		'<label class="sub-label">Conflict Prevention Level</label>',
		'<select id="conflict-level" class="sub-label" style="height:30px;">',
		'<option value=S selected> Strong</option>',
		'<option value=M> Medium</option>',
		'<option value=W> Weak</option>',
		'<option value=N> None</option>',
		'</select>',
		'<label class="sub-label">Num Relative Time Points</label>',
		'<input id="num-rel-time" class="analysis-input" type="number" min="0" max="20" step="1" value="1"/>',
		'<label class="sub-label">Absolute Time Points</label>',
		'<font size="2">(e.g. 5 8 22)</font>',
		'<input id="abs-time-pts" class="analysis-input" type="text"/>',
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
		'click .closeIntermT': 'dismissIntermTable',
		'click .unassign-abs-intent-btn': 'unassignAbsIntentValue',
		'click .unassign-abs-rel-btn': 'unassignAbsRelValue',
		'click #btn-save-assignment': 'saveAssignment',
		'click #btn-single-path': 'singlePath',
		'click #btn-all-next-state': 'getAllNextStates',
		'click .addIntention': 'addRelAssignmentRow',
		'click #btn-save-intermT': 'saveIntermTable',
		'change #num-rel-time': 'addRelTime',
		'change #conflict-level': 'changeConflictLevel',
		'change #abs-time-pts': 'changeAbsTimePts',
		'change #max-abs-time': 'changeMaxAbsTime'
	},

	render: function () {

		// These functions are used to communicate between analysisInspector and Main.js
		this.$el.html(_.template(this.template)());
		$('head').append('<script src="./js/analysis.js"></script>');

		// set default values for max abs time, conflict level,
		// relative time points and abs time points
		$('#max-abs-time').val(model.maxAbsTime);
		$('#conflict-level').val(analysisRequest.conflictLevel);
		$('#num-rel-time').val(analysisRequest.numRelTime);
		$('#abs-time-pts').val(analysisRequest.absTimePts);

		// This is needed to allow the user to delete relative assignments
		this.setDeleteRelAssignmentListener();
	},

	/**
	 * Retrieves information about the current model and sends to the backend
	 * to do single path analysis.
	 *
	 * This function is called on click for #btn-single-path
	 */
	singlePath: function () {
		//Create the object and fill the JSON file to be sent to backend.
		//Get the AnalysisInspector view information
		analysisRequest.action = "singlePath";
		analysisRequest.currentState = "0|0";

		//Prepare and send data to backend
		this.sendToBackend();
	},

	/**
	 * Retrieves information about the current model and sends to the backend
	 * to get all next possible states.
	 *
	 * This function is called on click for #btn-all-next-state
	 */
	getAllNextStates: function () {
		//Create the object and fill the JSON file to be sent to backend.
		//Get the AnalysisInspector view information
		analysisRequest.action = "allNextStates";
		analysisRequest.previousAnalysis = _.clone(savedAnalysisData.singlePathResult);
		// need to remove TPs after current point from previous solution?
		// update the time point for potentialEpoch
		var previousTP = [];
		var i = analysisRequest.currentState.indexOf('|', 0);
		var currentState = parseInt(analysisRequest.currentState.substring(0, i));
		for (var i = 0; i < currentState + 1; i++) {
			for (var j = 0; j < analysisRequest.previousAnalysis.assignedEpoch.length; j++) {
				var regex = /(.*)_(.*)$/g;
				var match = regex.exec(analysisRequest.previousAnalysis.assignedEpoch[j]);
				if (match[2] === analysisRequest.previousAnalysis.timePointPath[i]) {
					previousTP.push(analysisRequest.previousAnalysis.assignedEpoch[j]);
					continue;
				}
			}
		}

		console.log(previousTP);
		// update current time point in the path if necessary (if epoch)
		// remove all the time points after
		analysisRequest.previousAnalysis.assignedEpoch = previousTP;
		analysisRequest.previousAnalysis.timePointPath = analysisRequest.previousAnalysis.timePointPath.slice(0, currentState + 1);


		console.log(analysisRequest);

		//Prepare and send data to backend
		this.sendToBackend();
	},

	/**
	 * Creates an object to send to the backend and calls
	 * a backendComm() to send to backend
	 *
	 * @param {Object} analysis
	 *   InputAnalysis() object
	 */
	sendToBackend: function () {

		// Object to be sent to the backend
		var jsObject = {};
		jsObject.analysisRequest = analysisRequest;

		//Get the Graph Model
		jsObject.model = model;
		console.log(jsObject);
		//Send data to backend
		var isNodeServer = true;
		backendComm(isNodeServer, jsObject);
		;
	},

	/**
	 * Removes all html for this inspector
	 */
	clear: function (e) {
		this.$el.html('');
	},
	/********************** Modal box related ****************************/

	/**
	 * Displays the absolute and relative assignments modal for the user.
	 *
	 * This function is called on click for #btn-view-assignment.
	 */
	loadListOfAssignments: function (event) {
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
	displayAbsoluteRelationshipAssignments: function (e) {
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

			var sourceName = model.getIntentionByID(sourceID).nodeName;
			var targetName = model.getIntentionByID(targetID).nodeName;


			if (link.linkType == 'NBD' || link.linkType == 'NBT' || link.isEvolvingRelationship()) {
				var linkAbsTime = link.absoluteValue;
				var defaultValue = linkAbsTime == -1 ? '' : linkAbsTime;

				$('#link-list').append('<tr linkID = ' + link.linkID + '><td>' + link.linkType + '</td><td>' + sourceName + '</td><td>' + targetName +
					'</td><td><input type="number" name="sth" value=' + defaultValue + '></td>' + btnHtml +
					'</tr>');
			}

		}
	},

	addRelTime: function (event) {

		var numRel = $('#num-rel-time');
		if (numRel.val() !== "") {
			analysisRequest.numRelTime = numRel.val()
		} else {
			numRel.val(analysisRequest.numRelTime);
		}
	},

	changeConflictLevel: function (event) {
		analysisRequest.conflictLevel = $('#conflict-level').val()[0];
	},

	changeAbsTimePts: function (event) {
		var regex = new RegExp("^(([1-9]0*)+\\s+)*([1-9]+0*)*$");

		var absTime = $('#abs-time-pts');
		if (regex.test(absTime.val())) {
			analysisRequest.absTimePts = absTime.val().trim();
			analysisRequest.changeTimePoints(this.getAbsoluteTimePoints());
		} else {
			absTime.val(analysisRequest.absTimePts);
		}

	},

	changeMaxAbsTime: function (event) {
		var maxTime = $('#max-abs-time');
		if (maxTime.val() !== "") {
			model.maxAbsTime = maxTime.val()
		} else {
			maxTime.val(model.maxAbsTime);
		}
	},


	/**
	 * Displays the nodes for the Absolute Intention Assignments for
	 * the Absolute and Relative Assignments modal
	 */
	displayAbsoluteIntentionAssignments: function (e) {

		var btnHtml = '<td><button class="unassign-abs-intent-btn" > Unassign </button></td>';

		for (var i = 0; i < model.intentions.length; i++) {
			var intention = model.intentions[i];
			var funcType = intention.dynamicFunction.stringDynVis;
			var intentionName = intention.nodeName;
			//console.log(intentionName);

			// nameIdMapper[name] = intention.nodeID;
			if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' ||
				funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {


				var absTime = intention.getAbsConstTime('A');
				// default value to display.
				// -1 means abs time does not exist. So display empty string instead.
				var defaultVal = absTime === -1 ? '' : absTime;

				$('#node-list').append('<tr nodeID = ' + intention.nodeID + ' srcEB = A><td>' + intentionName + ': A' + '</td><td>' + funcType + '</td>' +
					'<td><input type="number" name="sth" value="' + defaultVal + '"></td>' + btnHtml + '</tr>');
			} else if (funcType == 'UD') {

				// the number of function transitions, is the number of functions minus one
				var funcTransitions = intention.dynamicFunction.functionSegList.length - 1;
				var currBound = 'A';
				for (var j = 0; j < funcTransitions; j++) {

					// default value to display
					var absTime = intention.getAbsConstTime(currBound);
					var defaultVal = absTime === -1 ? '' : absTime;

					$('#node-list').append('<tr nodeID = ' + intention.nodeID + ' srcEB = ' + currBound + '><td>' + intentionName + ': ' + currBound + '</td><td>' + funcType + '</td>' +
						'<td><input type="number" name="sth" value=' + defaultVal + '></td>' + btnHtml + '</tr>');
					currBound = String.fromCharCode(currBound.charCodeAt(0) + 1);
				}
			}
		}

		//loadIntermediateValues();
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
			absTimeValues.map(function (i) {
				if (i != '') {
					return parseInt(i, 10);
				}
			});

			//Sort into ascending order
			absTimeValues.sort(function (a, b) {
				return a - b
			});
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
	loadIntermediateValues: function (e) {
		$('#interm-list').find("tr:gt(1)").remove();
		$('#header').find("th:gt(1)").remove();
		$('#intentionRows').find("th:gt(1)").remove();

		var intermTDialog = document.getElementById('intermediateTable');
		intermTDialog.style.display = "block";

		var absTimeValues = analysisRequest.absTimePtsArr;
		var constraints = model.constraints;

		//Adding assigned time to absTimeValues
		for (var i = 0; i < constraints.length; i++) {
			var aTime = constraints[i].absoluteValue;
			aTime = aTime.toString();
			if (!absTimeValues.includes(aTime) && aTime !== "-1") {
				absTimeValues.push(aTime);
			}
		}
	absTimeValues.sort();
	console.log(absTimeValues);

	for (var s = 0; s < absTimeValues.length; s++) {
		$('#header-row').append('<th>Absolute</th>');
		$('#intentionRows').append('<th>' + absTimeValues[s] + '</th>');
	}


	//loop over intentions to get intial values and funcType
	for (var i = 0; i < model.intentions.length; i++) {
		var intention = model.intentions[i];
		var initValue = intention.getInitialSatValue();
		var func = intention.dynamicFunction.stringDynVis;

		var row = $('<tr></tr>');
		row.addClass('intention-row');
		var name = $('<td></td>');
		var sat = $('<td></td>');

		name.text(intention.nodeName);
		sat.text('Denied');
		row.append(name);
		row.append(satisfactionValuesDict[initValue].satValue);

		for (j = 0; j < absTimeValues.length; j++) {
			var options = ``;

			// Add select tags for each absolute time point
			var selectTd = $('<td></td>');
			var selectElement = $('<select></select>');
			selectElement.attr('nodeID', intention.nodeID);
			selectElement.attr('absTime', absTimeValues[j]);


			if (func === "I" || func === "D" || func === "C" || func === "R") {
				switch (func) {
					case "I":
						options = this.increasing(initValue);
						break;
					case "D":
						options = this.decreasing(initValue);
						break;
					case "C":
						options = this.constant(initValue);
						break;
					case "R":
						options = this.stochastic();
						break;
				}
			}
			else if (func === "MP" || func === "MN" || func === "CR" || func === "RC" || func === "SD" || func === "DS") {
				//check for every node if there is assigned time
				for (var k = 0; k < constraints.length; k++) {
					if (constraints[k].constraintSrcID === intention.nodeID) {
						var c = k
					}
				}
				if (constraints[c].absoluteValue !== -1) {
					var ti = constraints[c].absoluteValue;
					var absVal = absTimeValues[j];

					if (func === "MP") {
						if (absVal < ti) {
							options = this.convertToOptions(['no value']);
						} else {
							if (intention.dynamicFunction.functionSegList[1].funcX === '0010') {
								options = this.convertToOptions(['0010']);
							} else {
								options = this.convertToOptions(['0011']);
							}
						}
					} else if (func === "MN") {
						if (absVal < ti) {
							options = this.convertToOptions(['no value']);
						} else {
							if (intention.dynamicFunction.functionSegList[1].funcX === '0100') {
								options = this.convertToOptions(['0100']);
							} else {
								options = this.convertToOptions(['1100']);
							}
						}

					} else if (func === "RC") {
						if (absVal < ti) {
							var possibleValueList = ['0000', '0011', '0010', '1100', '0100', 'empty', 'no value'];
							options = this.convertToOptions(possibleValueList);
						} else {
							var funcX = intention.dynamicFunction.functionSegList[1].funcX;
							switch (funcX) {
								case '0000':
									options = this.convertToOptions(['0000']);
									break;
								case '0011':
									options = this.convertToOptions(['0011']);
									break;
								case '0100':
									options = this.convertToOptions(['0100']);
									break;
								case '1100':
									options = this.convertToOptions(['1100']);
									break;
								case '0010':
									options = this.convertToOptions(['0010']);
									break;
							}
						}
					} else if (func === "CR") {
						if (absVal < ti) {
							var funcX = intention.dynamicFunction.functionSegList[1].funcX;
							switch (funcX) {
								case '0000':
									options = this.convertToOptions(['0000']);
									break;
								case '0011':
									options = this.convertToOptions(['0011']);
									break;
								case '0100':
									options = this.convertToOptions(['0100']);
									break;
								case '1100':
									options = this.convertToOptions(['1100']);
									break;
								case '0010':
									options = this.convertToOptions(['0010']);
									break;
							}
						} else {
							var possibleValueList = ['0000', '0011', '0010', '1100', '0100', 'empty', 'no value'];
							options = this.convertToOptions(possibleValueList);
						}
					} else if (func === "SD") {

						if (absVal < ti) {
							options = this.convertToOptions(['0011']);
						} else {
							options = this.convertToOptions(['1100']);
						}

					} else if (func === "DS") {
						if (absVal < ti) {
							options = this.convertToOptions(["1100"]);
						} else {
							options = this.convertToOptions(['0011']);
						}
					} else {
						console.log("calling empty from compound functions")
						var list = ['empty'];
						options = this.convertToOptions(list);
					}
				}
			}

			else if (func === "UD") {
				var time_list = [];
				for (var i = 0; i < constraints.length; i++) {
					if (constraints[i].constraintSrcID === intention.nodeID) {
						time_list.push(constraints[i].absoluteValue);
					}
				}

				var assigned = true;
				if (time_list.length === 0 ){
					assigned = false;
				}


				else {
					for (var i = 0; i < time_list.length; i++) {
						if (time_list[i] === -1) {
							assigned = false;
							break;
						}
					}
				}

				if (assigned === true) {
					console.log("in assigned")
					var func_list = intention.dynamicFunction.functionSegList;
					for (var i = 0; i < func_list.length; i++) {
						var funcType = func_list[i].funcType;
						var funcX = func_list[i].funcX;
						console.log("in for loop" +funcType)
						switch (funcType) {
							case "I":
								options = this.increasing(funcX);
								break;
							case "D":
								options = this.decreasing(funcX);
								break;
							case "C":
								console.log("in constant")
								options = this.constant(funcX);
								break;
							case "R":
								options = this.stochastic();
								break;
						}
					}
				}
				else {
					options = this.convertToOptions(['empty']);
				}


			}

		var intEval = analysisRequest.getUserEvaluationByID(intention.nodeID, absTimeValues[j]);

		if (intEval != null) {
			selectElement.val(intEval.evaluationValue);
		}
		selectElement.append(options);
		selectTd.append(selectElement);
		row.append(selectTd);

		}
		$('#interm-list').append(row);
	}
},

	/**
	*This function takes in a binary string of value and return
	* a decimal encoding of that value
	* none has a value of 0
	* partially denied has a value of -1
	* fully denied has a value of -2
	* partially satisfied has a value of 1
	* fully satisfied has a value of 2
	*/
	comparisonSwitch: function(valueToEncode){
	   var tempInput;
	   switch(valueToEncode){
		   case '0000':
			   tempInput = 0;
			   break;
		   case '0011':
			   tempInput = 2;
			   break;
		   case '0010':
			   tempInput = 1;
			   break;
		   case '0100':
			   tempInput = -1;
			   break;
		   case '1100':
			   tempInput = -2;
			   break;
	   }
	   return tempInput;
	},

	/**
	*this function takes in two values the first one is the binary string of the input value
	* and the second one is the binary string of the value to compare.
	* This function will return a boolean value that whether the input value is greater than the value to compare
	 */
	isIncreasing: function(inputValue, valueToCompare){
	   var tempInput = this.comparisonSwitch(inputValue);
	   var tempCompare = this.comparisonSwitch(valueToCompare);
	   if (tempInput < tempCompare){
		   return false;
	   }
	   else{
		   return true;
	   }
	},

	/**
	*this function takes in two values the first one is the binary string of the input value
	* and the second one is the binary string of the value to compare.
	* This function will return a boolean value that whether the input value is smaller than the value to compare
	 */
	isDecreasing: function(inputValue, valueToCompare){
	   var tempInput = this.comparisonSwitch(inputValue);
	   var tempCompare = this.comparisonSwitch(valueToCompare);
	   if(tempInput <= tempCompare){
		   return true;
	   }
	   else{
		   return false;
	   }
	},

	/**
	*This function takes in an initial value and return a list of strings for options that contains values that are larger than the initial value
	 */
	increasing: function(initValue){
		var possibleValueList = ['0000','0011','0010','1100','0100'];
		var valueForOptions = [];
		for(var i = 0; i <possibleValueList.length;i++){
			if(this.isIncreasing(possibleValueList[i],initValue)){
				valueForOptions.push(possibleValueList[i]);
			}
		}
		return this.convertToOptions(valueForOptions);
	},

	/**
	*This function takes in an initial value and return a list of strings for options that contains values that are smaller than the initial value
	 */
	decreasing: function(initValue){
		var possibleValueList = ['0000','0011','0010','1100','0100'];
		var valueForOptions = [];
		for(var i = 0; i <possibleValueList.length;i++){
			if(this.isDecreasing(possibleValueList[i],initValue)){
				valueForOptions.push(possibleValueList[i]);
			}
		}
		return this.convertToOptions(valueForOptions);
	},

	/**
	*This function takes in an initial value and return a list of strings for options that contains values that are equal to the initial value
	 */
	constant: function(initValue){
		return this.convertToOptions({initValue});
	},

	stochastic: function(){
		var possibleValueList = ['0000','0011','0010','1100','0100', 'no value'];
		return this.convertToOptions(possibleValueList);
	},

	binaryToOption: function(binaryString){
		var optionString = '';
		switch(binaryString){
			case "0000":
				optionString = `<option value="0000">None (⊥, ⊥) </option>`;
				break;
			case "0011":
				optionString = `<option value="0011">Satisfied (F, ⊥) </option>`;
				break;
			case "0010":
				optionString = `<option value="0010">Partially Satisfied (P, ⊥) </option>`;
				break;
			case "0100":
				optionString = `<option value="0100">Partially Denied (⊥, P)</option>`;
				break;
			case "1100":
				optionString = `<option value="1100">Denied (⊥, F) </option>`;
				break;
			case 'empty':
				optionString = `<option value="empty"> --- </option>`;
				break;
			case 'no value':
				optionString = `<option value="(no value)">(no value)</option>`;
				break;
		}
		return optionString;
	},

	convertToOptions: function(choiceList){
		var theOptionString = ``;
		for(var i = 0; i < choiceList.length; i++){
			var curString = this.binaryToOption(choiceList[i]);
			theOptionString += curString;
		}
		return theOptionString;
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
                model.saveRelIntAssignment(type, nodeID1, epoch1, nodeID2, epoch2);
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
    saveIntermTable: function() {

        // Clear all intention evaluations with the exception
        // of the evaluations on the initial time point
        analysisRequest.clearUserEvaluations();

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

                analysisRequest.userAssignmentsList.push(new UserEvaluation(nodeID, absTime, evalLabel));
                console.log(analysisRequest.userAssignmentsList);

            });
        });


        this.dismissIntermTable();
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
