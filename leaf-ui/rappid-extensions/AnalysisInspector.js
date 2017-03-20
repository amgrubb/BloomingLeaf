var AnalysisInspector = Backbone.View.extend({

	className: 'analysis-inspector',
	template: [
		'<label>Analysis</label>',
		'<h3> Simulation Start: 0 </h3>',
		'<label class="sub-label">Max Absolute Time</label>',
		'<input id="max-abs-time" class="sub-label" type="number" min="1" step="1" value="100"/>',
		'<br>',
		'<label class="sub-label">Conflict Prevention Level</label>',
		'<select id="conflict-level" class="sub-label">',
			'<option value=default disabled selected> List Conflict</option>',
	        '<option value=S> Strong</option>',
	        '<option value=M> Medium</option>',
	        '<option value=W> Weak</option>',
	        '<option value=N> None</option>',
		'</select>',
		'<br>',
		'<label class="sub-label">Num Relative Time Points</label>',
		'<input id="num-rel-time" class="sub-label" type="number" min="0" max="20" step="1" value="0"/>',
		'<br>',
		'<label class="sub-label">Absolute Time Points</label>',
		'<input id="abs-time-pts" class="sub-label" type="text"/>',
		'<br>',
		'<hr>',
		'<label class="sub-label">Absolute Values</label>',
		'<select id="abs-vals" class="sub-label">',
			'<option value=default disabled selected> List Absolute Values</option>',
	        '<option value=S> A</option>',
	        '<option value=M> B</option>',
	        '<option value=W> C</option>',
	        '<option value=N> D</option>',
		'</select>',
		'<label class="sub-label"> Time </label>',
		'<input id="num-time" class="sub-label sub-input" type="number" min="0" max="20" step="1" value="0" width="100px"/>',
		'<button id="btn-assign-time" class="green-btn sub-btn"> Assign </button>',
		'<label class="sub-label">Assigned Values</label>',
		'<select id="assigned-vals" class="sub-label" multiple="yes">',
	        '<option value=S> A</option>',
	        '<option value=M> B</option>',
	        '<option value=W> C</option>',
	        '<option value=N> D</option>',
		'</select>',

		'<br>',
		'<hr>',
		'<button id="btn-solve-single-path" class="analysis-btns inspector-btn sub-label green-btn">Solve Single Path</button>',
		'<button id="btn-get-next-state" class="analysis-btns inspector-btn sub-label green-btn">Get Possible Next States</button>'
	].join(''),

	events: {
		'change select': 'updateCell',
		'click #load-analysis': 'loadFile',
		'click #concatenate-btn': 'concatenateSlider',
		'click input.delayedprop': 'checkboxHandler',
		'click #btn-solve-single-path': 'solveSinglePath',
		'click #btn-get-next-state': 'getNextStates',
	},

	render: function(analysisFunctions) {
		// These functions are used to communicate between analysisInspector and Main.js
		this._analysisFunctions = analysisFunctions;
		this.$el.html(_.template(this.template)());
		
		//this.$('#btn-get-next-state').prop('disabled', 'disabled');
		//this.$('#btn-get-next-state').css("background","gray");
		//this.$('#btn-get-next-state').css("box-shadow","none");
	},
	solveSinglePath: function(){
		//Getting data from the Analysis Inspector
		var analysisObject = new AnalysisObject();
		AO_getValues(analysisObject);
		AO_btnSolveSinglePath(analysisObject);
		//Getting data from the model
		var frontModel = getFrontendModel();
		var js_object = {};
		js_object.analysis = analysisObject;
		js_object.model = frontModel;
		//Send data to backend
		backendCom(js_object);
		
	},
	getNextStates: function(){
		//Getting data from the Analysis Inspector
		var analysisObject = new AnalysisObject();
		AO_getValues(analysisObject);
		AO_btnGetNextState(analysisObject);
		//Getting data from the model
		var frontModel = getFrontendModel();
		var js_object = {};
		js_object.analysis = analysisObject;
		js_object.model = frontModel;
		console.log(JSON.stringify(js_object));
		//Send data to backend
		backendCom(js_object);
	},
	loadFile: function(e){
		this._analysisFunctions.loadAnalysisFile();
	},
	concatenateSlider: function(e){
		this._analysisFunctions.concatenateSlider();
	},

	// Queries
	checkQuery: function(e){
		$("#query-cell1").html('<option class="select-placeholder" selected disabled value="">Select</option>');
		$("#query-cell2").html('<option class="select-placeholder" selected disabled value="">Select</option>');

		// Error case
		var cells = this._analysisFunctions.loadQueryObject();
		if (!cells[0] || !cells[1]){
			$("#query-error").text("Please select two intentions");
			this.$("#query-cell1").hide();
			this.$("#query-cell2").hide();
			return
		}

		// Error case
		var funcA = cells[0].model.attr(".funcvalue").text;
		var funcB = cells[1].model.attr(".funcvalue").text;
		var noTimeVariabled = ["R", "C", "I", "D", " "];
		if ((noTimeVariabled.indexOf(funcA) != -1) || (noTimeVariabled.indexOf(funcB) != -1)){
			$("#query-error").text("The constraint type can not be queried");
			this.$("#query-cell1").hide();
			this.$("#query-cell2").hide();
			return
		}

		// Rendering select options
		this.$("#query-cell1").show("fast");
		this.$("#query-cell2").show("fast");
		this.renderSelectOptions(cells[0].model, $("#query-cell1"));
		this.renderSelectOptions(cells[1].model, $("#query-cell2"));

		$("#cell1").text(cells[0].model.attr(".name").text);
		$("#cell2").text(cells[1].model.attr(".name").text);
		$("#query-error").text("");
	},

	// Generating available options from dropdown
	renderSelectOptions: function(cell, select){
		var f = cell.attr(".funcvalue/text");
		var singleVarFuncs = ["RC", "CR", "SD", "DS", "MP", "MN"];

		if(singleVarFuncs.indexOf(f) != -1){
			 select.append($('<option></option>').val("A").html("A"));
			 select.val("A")
		}else if (f == "UD"){
			var begin = cell.attr(".constraints/beginLetter");
			for (var i = 1; i < begin.length; i++)
				select.append($('<option></option>').val(begin[i]).html(begin[i]));
		}
	},

	// Clear selected objects
	clearQuery: function(e){
		this._analysisFunctions.clearQueryObject();
		this.checkQuery();
		$("#query-error").text("");
		$("#cell1").text("");
		$("#cell2").text("");
	},

	//Displays the additional options when delayed propagation is checked.
	checkboxHandler: function(e){
		if (e.currentTarget.checked){
			document.getElementById("hidden").removeAttribute("style");
		}
		else{
			document.getElementById("hidden").setAttribute("style", "display:none");
		}
	},

	clear: function(e){
		this.$el.html('');
	}
});
