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
	
	template: ['<script type="text/template" id="item-template">',
		'<div class="analysis-sidebar">',
		'<h2 style="text-align:center; width:100%;margin-top:6px;margin-bottom:0px">Analysis</h2>',
		'<hr>',
		'<h3> Simulation Start: 0 </h3>',
		'<label class="sub-label"> Conflict Prevention Level </label>',
		'<select id="conflict-level" class="sub-label" style="height:30px;">', 
			'<option value=S <% if (conflictLevel === "S") { %> selected <%} %>> Strong </option>',
			'<option value=M <% if (conflictLevel === "M") { %> selected <%} %>> Medium </option>',
			'<option value=W <% if (conflictLevel === "W") { %> selected <%} %>> Weak </option>',
			'<option value=N <% if (conflictLevel === "N") { %> selected <%} %>> None </option>',
		'</select>',
		'<label class="sub-label"> Num Relative Time Points </label>',
		'<input id="num-rel-time" class="analysis-input" type="number" min="0" max="20" step="1" value="<%= numRelTime %>"/> </input>',
		'<hr>',
		'<button id="btn-view-intermediate" class="analysis-btns inspector-btn sub-label green-btn">View Intermediate Values</button>',
		'<hr>',
		'<button id="btn-single-path" class="analysis-btns inspector-btn sub-label green-btn">Simulate Single Path</button>',
		'<button id="btn-all-next-state" class="analysis-btns inspector-btn sub-label ice-btn">Explore Possible Next States</button>',
		'<hr>',
		'</div>',
		'</script>'].join(''),		
	
	events: {
		'click #btn-view-intermediate': 'openIntermediateValuesTable',
		'click .closeIntermT': 'dismissIntermTable',
		'click #btn-single-path': 'singlePath',
		'click #btn-all-next-state': 'getAllNextStates',
		'click #btn-save-intermT': 'saveIntermTable',
		'change #num-rel-time': 'addRelTime', 
		'change #conflict-level': 'changeConflictLevel',
		'clearInspector .analysis-sidebar' : 'removeView'
	},

	/** Sets template and injects model parameters */
	render: function () { 
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
		this.$('.analysis-sidebar').append(intermediateValuesTable.el);
		intermediateValuesTable.render();

	},
	
	/**
	 * Sends to the backend to do single path analysis.
	 *
	 * This function is called on click for #btn-single-path
	 */
	singlePath: function () {
		// Create the object and fill the JSON file to be sent to backend.
		// Get the AnalysisInspector view information

		this.model.set('action', 'singlePath')
		this.model.set('currentState', '0|0')

		// Prepare and send data to backend
		this.sendToBackend();
	},

	/**
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
		console.log(jsObject);
		//Send data to backend
		backendComm(jsObject);		//TODO: Need to add parameter for Node Server.
		;

	},
});