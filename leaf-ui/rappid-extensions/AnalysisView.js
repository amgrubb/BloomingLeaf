var AnalysisInspector = Backbone.View.extend({
    model: ConfigModel,

    initialize: function(){
        //TODO: anything here??
    },

    template: [
		'<h2 style="text-align:center; width:100%;margin-top:6px;margin-bottom:0px">Analysis</h2>',
		'<hr>',
		'<h3> Simulation Start: 0 </h3>',
		'<label class="sub-label">Conflict Prevention Level</label>',
		'<select id="conflict-level" class="sub-label" style="height:30px;">',
		'<option value=S> Strong</option>',
		'<option value=M> Medium</option>',
		'<option value=W> Weak</option>',
		'<option value=N> None</option>',
		'</select>',
		'<label class="sub-label">Num Relative Time Points</label>',
		'<input id="num-rel-time" class="analysis-input" type="number" min="0" max="20" step="1" value="<%- numRelTime %>"/>',
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

		this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.
		$('head').append('<script src="./js/analysis.js"></script>');

		// Set config value for conflict level
        // can't do in template because value cannot be defined for select html element
		$('#conflict-level').val(this.model.get('conflictLevel'));
	},

    /**
	 * Retrieves information about the current model and sends to the backend
	 * to do single path analysis.
	 *
	 * This function is called on click for #btn-single-path
	 */
	singlePath: function () {
        //TODO
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
        //TODO
		if(analysisRequest.action != null) { //path has been simulated
			if (analysisResult.selectedTimePoint != analysisResult.timeScale) { //last timepoint is not selected
			$("body").addClass("waiting"); ////Adds "waiting" spinner under cursor 
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
        //TODO
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

    /********************** Changes to Config Model ****************************/

    addRelTime: function () {
        var numRel = $('#num-rel-time'); 
		if (numRel.val() !== "") {
            this.model.set({numRelTime: numRel.val()});
			analysisRequest.numRelTime = numRel.val();
		} else {
			numRel.val(analysisRequest.numRelTime);
		}
	},

    changeConflictLevel: function () {
        this.model.set({conflictLevel: $('#conflict-level').val()[0]});
		analysisRequest.conflictLevel = $('#conflict-level').val()[0];
	},
});

//TODO: intermediate value table stuff