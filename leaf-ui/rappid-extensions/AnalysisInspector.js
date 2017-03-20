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
		'<button id="btn-view-assignment" class="analysis-btns inspector-btn sub-label green-btn">View List of Assignments</button>',
		// This is the modal box of assignments
		'<div id="myModal" class="modal">',
		  '<div class="modal-content">',
		    '<div class="modal-header">',
		      '<span class="close">&times;</span>',
		      '<h2>Absolute Values</h2>',
		    '</div>',
		    '<div class="modal-body">',
		      '<p>Nodes</p>',
		      	'<table id="node-list" class="abs-table">',
		      	  '<tr>',
		      	    '<th>How do you call this?</th>',
		      	    '<th>Dynamics</th>',
		      	    '<th>Node name</th>',
		      	    '<th>Assigned Value</th>',
		      	    '<th>Action</th>',
		      	  '</tr>',
		      	  '<tr>',
		      	    '<td>A</td>',
		      	    '<td>RC</td>',
		      	    '<td>Go to school</td>',
		      	    '<td>None</td>',
		      	    '<td><button> Unassign </button></td>',
		      	  '</tr>',
		      	'</table>',
		      '<p>Relationships</p>',
		      	'<table id="link-list" class="abs-table">',
		      	  '<tr>',
		      	    '<th>How do you call this?</th>',
		      	    '<th>Link Type</th>',
		      	    '<th>Source Node name</th>',
		      	    '<th>Dest Node name</th>',
		      	    '<th>Assigned Value</th>',
		      	    '<th>Action</th>',
		      	  '</tr>',
		      	  '<tr>',
		      	    '<td>A</td>',
		      	    '<td>makes|breaks</td>',
		      	    '<td>Node name A</td>',
		      	    '<td>Node name B</td>',
		      	    '<td>5</td>',
		      	    '<td><button> Unassign </button></td>',
		      	  '</tr>',
		      	'</table>',
		    '</div>',
		    '<div class="modal-footer">',
		    	'<button id="btn-save-assignment" class="analysis-btns inspector-btn sub-label green-btn">Save Assignments</button>',
		    '</div>',
		  '</div>',

		'</div>',
		'<br>',

		// '<label class="sub-label">Absolute Values</label>',
		// '<select id="abs-vals" class="sub-label">',
		// 	'<option value=default disabled selected> List Absolute Values</option>',
	 //        '<option value=S> A</option>',
	 //        '<option value=M> B</option>',
	 //        '<option value=W> C</option>',
	 //        '<option value=N> D</option>',
		// '</select>',
		// '<label class="sub-label"> Time </label>',
		// '<input id="num-rel-time" class="sub-label sub-input" type="number" min="0" max="20" step="1" value="0" width="100px"/>',
		// '<button id="btn-assign-time" class="green-btn sub-btn"> Assign </button>',
		// '<label class="sub-label">Assigned Values</label>',
		// '<select id="assigned-vals" class="sub-label" multiple="yes">',
	 //        '<option value=S> A</option>',
	 //        '<option value=M> B</option>',
	 //        '<option value=W> C</option>',
	 //        '<option value=N> D</option>',
		// '</select>',
		// '<button id="btn-del-assignment" class="analysis-btns inspector-btn sub-label red-btn">Delete Selected Assignment</button>',
		'<br>',
		'<hr>',
		'<button id="btn-solve-single-path" class="analysis-btns inspector-btn sub-label green-btn">Solve Single Path</button>',
		'<button id="btn-get-next-state" class="analysis-btns inspector-btn sub-label green-btn">Get Possible Next States</button>'
		// ,
		// '<label>Queries</label>',
		// '<h5 id="query-error" class="inspector-error"></h5>',
		// '<div id="query-div">',
		// 	'<h5 id="cell1" class="cell-labels"></h5>',
		// 	'<select id="query-cell1" class="query-select relationship-select">',
		// 		'<option class="select-placeholder" selected disabled value="">Select</option>',
		// 	'</select>',
		// 	'<h5 id="cell2" class="cell-labels"></h5>',
		// 	'<select id="query-cell2" class="query-select relationship-select">',
		// 		'<option class="select-placeholder" selected disabled value="">Select</option>',
		// 	'</select>',
		// 	'<button id="clear-query-btn" class="inspector-btn sub-label red-btn">Clear Selected Intentions</button>',
		// 	'<button id="query-btn" class="inspector-btn sub-label blue-btn">Use Selected Intentions</button>',
		// '</div>',
	].join(''),

	events: {
		'change select': 'updateCell',
		'click .analysis-btns': 'conductAnalysis',
		'click #load-analysis': 'loadFile',
		'click #concatenate-btn': 'concatenateSlider',
		'click input.delayedprop': 'checkboxHandler',
		'click #query-btn': 'checkQuery',
		'click #clear-query-btn': 'clearQuery',
		'click #btn-view-assignment': 'loadModalBox',
		'click .close': 'dismissModalBox'

	},

	render: function(analysisFunctions) {

		// These functions are used to communicate between analysisInspector and Main.js
		this._analysisFunctions = analysisFunctions;
		this.$el.html(_.template(this.template)());
		$('head').append('<script src="./js-objects/analysis.js"></script>');

		this.$("#query-cell1").hide();
		this.$("#query-cell2").hide();

		this.$('#btn-csp-history').prop('disabled', 'disabled');
		this.$('#btn-csp-history').css("background","gray");
		this.$('#btn-csp-history').css("box-shadow","none");
	},

	//Call functions specified in main.js
	conductAnalysis: function(e) {

		// limit max and min on step values and epoch values
		var n1 = parseInt(this.$('#step-num').val())
		var n2 = parseInt(this.$('#epoch-num').val());
		if (n1 > 100){
			this.$('#step-num').val("100");
			n1 = "100";
		}else if (n1 < 1){
			this.$('#step-num').val("1");
			n1 = "1";
		}

		if (n2 > 100){
			this.$('#epoch-num').val("100");
			n2 = "100";
		}else if (n2 < 1){
			this.$('#epoch-num').val("1");
			n2 = "1";
		}

		// CSP History enable only if CSP is done
		if(e.currentTarget.id == "btn-csp"){
			this.$('#btn-csp-history').prop('disabled', '');
			this.$('#btn-csp-history').css("background","#27ae60");
			this.$('#btn-csp-history').css("box-shadow","inset 0 -2px #219d55");
		}else{
			this.$('#btn-csp-history').prop('disabled', 'disabled');
			this.$('#btn-csp-history').css("background","gray");
			this.$('#btn-csp-history').css("box-shadow","none");

			// epoch num and step num must be equal to prev CSP
			if(e.currentTarget.id == "btn-csp-history"){
				this.$('#step-num').val(this.prevStepNum);
				this.$('#epoch-num').val(this.prevEpochNum);
				n1 = this.prevStepNum;
				n2 = this.prevEpochNum;
			}
		}

		this.prevStepNum = n1;
		this.prevEpochNum = n2;
		this._analysisFunctions.conductAnalysis(e.currentTarget.id, n1, n2, $("#query-cell1").val(), $("#query-cell2").val());
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
	// Display modal box that has a list of absolute values
	loadModalBox: function(e){
		var modal = document.getElementById('myModal');
		modal.style.display = "block";


	},
	// Dismiss modal box
	dismissModalBox: function(e){
		var modal = document.getElementById('myModal');
		modal.style.display = "none";
	},

	clear: function(e){
		this.$el.html('');
	}
});
