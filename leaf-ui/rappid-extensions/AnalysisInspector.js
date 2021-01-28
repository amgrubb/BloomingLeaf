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
		'<label class="sub-label">Conflict Prevention Level</label>',
		'<select id="conflict-level" class="sub-label" style="height:30px;">',
		'<option value=S selected> Strong</option>',
		'<option value=M> Medium</option>',
		'<option value=W> Weak</option>',
		'<option value=N> None</option>',
		'</select>',
		'<label class="sub-label">Num Relative Time Points</label>',
		'<input id="num-rel-time" class="analysis-input" type="number" min="0" max="20" step="1" value="1"/>',
		'<hr>',
		'<button id="btn-view-intermediate" class="analysis-btns inspector-btn sub-label green-btn">View Intermediate Values</button>',
		//This is the intermediate values table modal
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
		'click #btn-view-intermediate': 'loadIntermediateValues',
		'click .closeIntermT': 'dismissIntermTable',
		'click #btn-single-path': 'singlePath',
		'click #btn-all-next-state': 'getAllNextStates',
		'click #btn-save-intermT': 'saveIntermTable',
		'change #num-rel-time': 'addRelTime',
		'change #conflict-level': 'changeConflictLevel',
	},

	render: function () {

		// These functions are used to communicate between analysisInspector and Main.js
		this.$el.html(_.template(this.template)());
		$('head').append('<script src="./js/analysis.js"></script>');

		// set default values for max abs time, conflict level,
		// relative time points and abs time points
		$('#conflict-level').val(analysisRequest.conflictLevel);
		$('#num-rel-time').val(analysisRequest.numRelTime);
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
		if(analysisRequest.action != null) { //path has been simulated
			if(analysisResult.selectedTimePoint != analysisResult.maxTimePoint) { //last timepoint is not selected
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

		} else {
			swal("Error: Cannot explore next states with last time point selected.", "", "error");
		}
		} else {
			swal("Error: Cannot explore next states before simulating a single path.", "", "error");
		}


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
		backendComm(jsObject);		//TODO: Need to add parameter for Node Server.
		;

	},

	/**
	 * Removes all html for this inspector
	 */
	clear: function (e) {
		this.$el.html('');
	},
	/********************** Modal box related ****************************/

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
		absTimeValues.sort(function(a,b) {return a-b});
		if (absTimeValues[0] === ""){
			absTimeValues.splice(0,1)
		}
		console.log("absTimeLength = " + absTimeValues.length);
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
							options = this.increasing(initValue,'noFinal');
							break;
						case "D":
							options = this.decreasing(initValue,'noFinal');
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
								var finalValue = intention.dynamicFunction.functionSegList[0].funcX;
								options = this.increasing(initValue, finalValue);
							} else {
								if (intention.dynamicFunction.functionSegList[1].funcX === '0010') {
									options = this.convertToOptions(['0010']);
								} else {
									options = this.convertToOptions(['0011']);
								}
							}
						} else if (func === "MN") {
							if (absVal < ti) {
								var finalValue = intention.dynamicFunction.functionSegList[0].funcX;
								options = this.decreasing(initValue, finalValue);
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
					for (var y = 0; y < constraints.length; y++) {
						if (constraints[y].constraintSrcID === intention.nodeID) {
							time_list.push(constraints[y].absoluteValue);
						}
					}

					var assigned = true;
					if (time_list.length === 0 ){
						assigned = false;
					}


					else {
						for (var z = 0; z < time_list.length; z++) {
							if (time_list[z] === -1) {
								assigned = false;
								break;
							}
						}
					}

					if (assigned === true) {
						var func_list = intention.dynamicFunction.functionSegList;
						for (var x = 0; x < func_list.length; x++) {
							var funcType = func_list[x].funcType;
							var funcX = func_list[x].funcX;
							console.log(funcType);
							switch (funcType) {
								case "I":
									options = this.increasing(funcX,'noFinal');
									break;
								case "D":
									options = this.decreasing(funcX,'noFinal');
									break;
								case "C":
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
				else {
					var possibleValueList = ['0000', '0011', '0010', '1100', '0100', 'empty', 'no value'];
					options = this.convertToOptions(possibleValueList);
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
	increasing: function(initValue,finalValue){
		var possibleValueList = ['0000','0011','0010','1100','0100'];
		var valueForOptions = [];
		if(finalValue === 'noFinal') {
			for (var i = 0; i < possibleValueList.length; i++) {
				if (this.isIncreasing(possibleValueList[i], initValue)) {
					valueForOptions.push(possibleValueList[i]);
				}
			}
			return this.convertToOptions(valueForOptions);
		}
		else{
			var withFinal = [];
			var withFinalTwo =[];
			for (var i = 0; i < possibleValueList.length; i++) {
				if (this.isIncreasing(possibleValueList[i], initValue)) {
					valueForOptions.push(possibleValueList[i]);
				}
			}
			for(var i=0;i<valueForOptions.length;i++){
				if(this.isDecreasing(valueForOptions[i],finalValue)){
					withFinal.push(valueForOptions[i]);
				}
			}
			for(var i = 0; i < withFinal.length; i++){
				if(!(withFinal[i]===finalValue)){
					withFinalTwo.push(withFinal[i]);
				}
			}
			return this.convertToOptions(withFinalTwo);
		}
	},

	/**
	*This function takes in an initial value and return a list of strings for options that contains values that are smaller than the initial value
	 */
	decreasing: function(initValue,finalValue){
		var possibleValueList = ['0000','0011','0010','1100','0100'];
		var valueForOptions = [];
		if(finalValue === 'noFinal') {
			for (var i = 0; i < possibleValueList.length; i++) {
				if (this.isDecreasing(possibleValueList[i], initValue)) {
					valueForOptions.push(possibleValueList[i]);
				}
			}
			return this.convertToOptions(valueForOptions);
		}
		else {
			var withFinal = [];
			var withFinalTwo  = [];
			for (var i = 0; i < possibleValueList.length; i++) {
				if (this.isDecreasing(possibleValueList[i], initValue)) {
					valueForOptions.push(possibleValueList[i]);
				}
			}
			for(var i=0; i<valueForOptions.length;i++){
				if(this.isIncreasing(valueForOptions[i],finalValue)){
					withFinal.push(valueForOptions[i]);
				}
			}
			for(var i = 0; i< withFinal.length; i++){
				if(!(withFinal[i]===finalValue)){
					withFinalTwo.push(withFinal[i]);
				}
			}
			return this.convertToOptions(withFinalTwo);

		}
	},

	/**
	*This function takes in an initial value and return a list of strings for options that contains values that are equal to the initial value
	 */
	constant: function(initValue){
		return this.convertToOptions([initValue]);
	},


	/**
	 *
	 * @returns {a list of strings for options that contains values that contains all possible values}
	 */
	stochastic: function(){
		var possibleValueList = ['0000','0011','0010','1100','0100', 'no value'];
		return this.convertToOptions(possibleValueList);
	},

	/**
	 *
	 * @param binaryString: This is the binary string stands for the value
	 * @returns a string decode of that binary value
	 */
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

	/**
	 *
	 * @param choiceList: A list that contains binary strings of valid values
	 * @returns {List that contains strings that are the string encoding of the binary strings in the choiceList}
	 */
	convertToOptions: function(choiceList){
		var theOptionString = ``;
		for(var i = 0; i < choiceList.length; i++){
			var curString = this.binaryToOption(choiceList[i]);
			theOptionString += curString;
		}
		return theOptionString;
	},

    dismissIntermTable: function(e){
        var intermT = document.getElementById('intermediateTable');
        intermT.style.display = "none";
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
            });
        });


        this.dismissIntermTable();
    },
});
