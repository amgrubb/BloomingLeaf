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
	model: ConfigModel,
	
	//TO-DO anywhere analysrequest is updated -> this.model
	//TO-DO connect configs and sidebar
	template: ['<script type="text/template" id="item-template">', 
		'<h2 style="text-align:center; width:100%;margin-top:6px;margin-bottom:0px">Analysis</h2>',
		'<hr>',
		'<h3> Simulation Start: 0 </h3>',
		'<label class="sub-label"> Conflict Prevention Level </label>',
		'<select id="conflict-level" class="sub-label" style="height:30px;">', 
			'<% if (conflictLevel == "S") { %> <option value=S selected> Strong </option>',
			'if (conflictLevel == "M") { %> <option value=M> Medium </option>',
			'if (conflictLevel == "W") { %> <option value=W> Weak </option>}',
			'if (conflictLevel == "N") { %> <option value=N> None </option> <%} %>',
		'</select>',
		'<label class="sub-label"> Num Relative Time Points </label>',
		'<input id="num-rel-time" class="analysis-input" type="number" min="0" max="20" step="1" value="1"/> </input>',
		'<button id="btn-view-intermediate" class="analysis-btns inspector-btn sub-label green-btn">View Intermediate Values</button>',
		'<button id="btn-single-path" class="analysis-btns inspector-btn sub-label green-btn">Simulate Single Path</button>',
		'<button id="btn-all-next-state" class="analysis-btns inspector-btn sub-label ice-btn">Explore Possible Next States</button>',
		'<hr>',
		'</script>'].join(''),		
	
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
		this.model = new ConfigModel; 
		this.$el.html(_.template($(this.template).html())(this.model.toJSON()));

		// These functions are used to communicate between analysisInspector and Main.js
		$('head').append('<script src="./js/analysis.js"></script>');
	},

	rerender: function(){
		this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        return this;
	},

	switchModel: function(model){
		this.model = model; 
		this.model.on('change', this.rerender, this);
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
			if (analysisResult.selectedTimePoint != analysisResult.timeScale) { //last timepoint is not selected
			$("body").addClass("waiting"); //Adds "waiting" spinner under cursor 
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

	/**Intermediate Values
	 * Should call from IntermediateValues.js
	 */
	loadIntermediateValues: function (e){
		loadIntermediate (e);
	},

	dismissIntermTable: function (e){
		dismissInterm (e);
	},

	saveIntermTable: function (e){
		saveInterm(e);
	},
});