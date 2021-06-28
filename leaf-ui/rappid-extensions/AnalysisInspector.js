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
	model: AnalysisParametersBBM,
	
	template: [
		'<script type="text/template" id="item-template">',
        //'<div class="left-panel-a" id="analysisID>',
		'<div class="container-sidebar" >',
		'<div id="analysis-sidebar";>',
		'<h3 style="text-align:left; color:#181b1fe3; margin-left: 10px;">Analysis Parameters</h3>',
		'<div class="inspector-views">',
		//'<h4 style="text-align:center; width:100%;margin-top:6px;margin-bottom:0px; margin-right:20px">Analysis</h4>',
		'<hr>',
		//'<h4> Simulation Start: 0 </h4>',
		'<label class="sub-label"> Conflict Prevention Level </label>',
		'<select id="conflict-level" class="sub-label" style="height:30px;">', 
			'<option value=S <% if (conflictLevel === "S") { %> selected <%} %>> Strong </option>',
			'<option value=M <% if (conflictLevel === "M") { %> selected <%} %>> Medium </option>',
			'<option value=W <% if (conflictLevel === "W") { %> selected <%} %>> Weak </option>',
			'<option value=N <% if (conflictLevel === "N") { %> selected <%} %>> None </option>',
		'</select>',
		//'<hr>',
		'<p><label class="sub-label";> Num Relative Time Points </label></p>',
		'<input id="num-rel-time" class="analysis-input" type="number" min="0" max="20" step="1" value="<%= numRelTime %>"/> </input>',
		'<hr>',
		'</div>',
		'</div>',
		//'</div>',
		'</script>'].join(''),		
	
	events: {
		'click #btn-view-intermediate': 'openIntermediateValuesTable',
		'click .closeIntermT': 'dismissIntermTable',
		'click #btn-single-path': 'singlePath',	
		'click #btn-all-next-state': 'getAllNextStates',
		'click #btn-save-intermT': 'saveIntermTable',
		'change #num-rel-time': 'addRelTime', 
		'change #conflict-level': 'changeConflictLevel',
		'clearInspector .inspector-views' : 'removeView'
	},

	/** Sets template and injects model parameters */
	render: function () { 
		console.log(this.model);
		this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
		// These functions are used to communicate between analysisInspector and Main.js
		$('head').append('<script src="./js/analysis.js"></script>');
		return this;
	},

	/** 
     * Called for all events that require re-rendering of the template 
     * after the first render call
	 */ 
	rerender: function(){
		this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
		console.log("manar lazem tsht8le l2na ra7 e6rdok :( kman abde tet3alme lebnane");
		console.log(this.model);
        return this;
	},

	/**
	 * Removes the view from the DOM. 
	 * This also automatically calls stopListening() on all listenTo() events
	 */
	removeView: function(){
		this.remove();
	},

	/********************** Modal box related ****************************/
	
	/** Updates the model's conflict level based on dropdown element value*/
	changeConflictLevel: function() {
		
		console.log("manar lazem tcht8le l2na ra7 e6rdoke :( kman abde tet3alme lebnane");
		console.log(this.model);
		this.model.set('conflictLevel', $('#conflict-level').val());
	},

	/**
	 * Updates the numRelTime parameter of the model
	 * If the inputted value is empty, reset input value to model value
	 */
	addRelTime: function () {
		var numRel = $('#num-rel-time');
		if (numRel.val() !== "") {
			this.model.set('numRelTime', numRel.val());
		} else {
			numRel.val(this.model.get('numRelTime'));
		}
	},

	/**
	 * Creates, attaches, and renders view for the IVT
	 */
	openIntermediateValuesTable: function(){
		var intermediateValuesTable = new IntermediateValuesTable();
		this.$('.container-sidebar').append(intermediateValuesTable.el);
		intermediateValuesTable.render();

	},

	/**
	 * Simulate Single Path - Step 1 - Set up analysis request object. 
	 * Retrieves information about the current model and sends to the backend
	 * to do single path analysis.
	 * This function is called on click for #btn-single-path
	 */
	singlePath: function () {
		// Create the object and fill the JSON file to be sent to backend.
		// Get the AnalysisInspector view information

		this.model.set('action', 'singlePath')
		this.model.set('currentState', '0|0')
		console.log("hello");
		// Prepare and send data to backend
		this.sendToBackend();
	},

	/**
	 * Explore Possible Next States - Step 1 - Set up analysis request object.
	 * Retrieves information about the current model and sends to the backend
	 * to get all next possible states.
	 *
	 * This function is called on click for #btn-all-next-state
	 * 
	 * TODO: Replace analysisRequest with config
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
	 * Simulate Single Path - Step 2 
	 * Explore Possible Next States - Step 2 
	 * Creates an object to send to the backend and calls
	 * a backendComm() to send to backend
	 *
	 * @param {Object} analysis
	 *   InputAnalysis() object
	 * 
	 * TODO: Replace with graph + config
	 */
	sendToBackend: function () {
		// Object to be sent to the backend
		var jsObject = {};
		jsObject.analysisRequest = analysisRequest;

		//Get the Graph Model
		jsObject.model = model;

		//Send data to backend
		backendComm(jsObject);		//TODO: Need to add parameter for Node Server.
		;

	},
});