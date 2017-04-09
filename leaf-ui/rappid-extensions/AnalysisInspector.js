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
			'<option value=S selected> Strong</option>',
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
		      	    '<th>Epoch Boundary</th>',
		      	    '<th>Function</th>',
		      	    '<th>Node name</th>',
		      	    '<th>Assigned Time</th>',
		      	    '<th>Action</th>',
		      	  '</tr>',
		      	'</table>',
		      '<p>Relationships</p>',
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
		    '<div class="modal-footer">',
		    	'<button id="btn-save-assignment" class="analysis-btns inspector-btn sub-label green-btn">Save Assignments</button>',
		    '</div>',
		  '</div>',

		'</div>',
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
		'click .close': 'dismissModalBox',
		'click .unassign-btn': 'unassignValue',
		'click #btn-save-assignment': 'saveAssignment',
		'click #btn-solve-single-path': 'solvePath'

	},

	render: function(analysisFunctions) {

		// These functions are used to communicate between analysisInspector and Main.js
		this._analysisFunctions = analysisFunctions;
		this.$el.html(_.template(this.template)());
		$('head').append('<script src="./scripts/js-objects/analysis.js"></script>');

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

	clear: function(e){
		this.$el.html('');
	},
	/********************** Modal box related ****************************/

	// Display modal box that has a list of absolute values
	loadModalBox: function(e){
		var modal = document.getElementById('myModal');
		// Clear all previous table entries
		$(".abs-table").find("tr:gt(0)").remove();


		var btn_html = '<td><button class="unassign-btn" > Unassign </button></td>';
		modal.style.display = "block";
		// Get a list of nodes
		// Populate non UD element only
		var elements = graph.getElements();
		var links = graph.getLinks();

		for (var i = 0; i < elements.length; i ++){
			var cellView = elements[i].findView(paper);
			var cell = cellView.model;
			var func = cell.attr('.funcvalue').text;
			var name = cell.attr('.name').text;
			var assigned_time = cell.attr('.assigned_time');
			if(func != 'UD' && func != 'D' && func != 'I' && func != 'C' && func != 'R'){
				// If no assigned_time in the node, save 'None' into the node
				if (!assigned_time){
					cell.attr('.assigned_time', {0: 'None'});

				}
				assigned_time = cell.attr('.assigned_time')[0];

				$('#node-list').append('<tr><td>' + 'A' + '</td><td>' + func + '</td><td>' + name + 
					'</td><td><input type="text" name="sth" value="' + assigned_time + '"></td>' + btn_html + 
					'<input type="hidden" name="id" value="' + cell.id + '"> </td> </tr>');

			}
			console.log(cell);
		}
		// Populate UD element
		for (var i = 0; i < elements.length; i ++){
			var cellView = elements[i].findView(paper);
			var cell = cellView.model;
			var func = cell.attr('.funcvalue').text;
			var name = cell.attr('.name').text;
			var assigned_time = cell.attr('.assigned_time');

			if(func == 'UD'){
				var fun_len = cell.attr('.constraints').function.length - 1;
				var current_something = 'A';
				// If no assigned_time in the node, save 'None' into the node
				if (!assigned_time){
					cell.attr('.assigned_time', {0: 'None'});
					assigned_time = cell.attr('.assigned_time');
				}
				// If the length of assigned_time does not equal to the fun_len, add none until they are equal
				var k = 0;
				while (Object.keys(assigned_time).length < fun_len){
					cell.attr('.assigned_time')[k] = 'None';
					assigned_time = cell.attr('.assigned_time');
					k ++;
				}
				for (var j = 0; j < fun_len; j++){
					$('#node-list').append('<tr><td>' + current_something + '</td><td>' + func + '</td><td>' + name + 
						'</td><td><input type="text" name="sth" value=' +assigned_time[j] + '></td>' + btn_html + 
						'<input type="hidden" name="id" value="' + cell.id + '_' + j + '"> </td> </tr>');
					current_something = String.fromCharCode(current_something.charCodeAt(0) + 1);
				}

			}
		}

		// Get a list of links
		for (var i = 0; i < links.length; i ++){
			var link = links[i];
			var source = null;
			var target = null;
			if (link.get("source").id){
				source = graph.getCell(link.get("source").id);
			}
			if (link.get("target").id){
				target = graph.getCell(link.get("target").id);
			}
			if (source && target){
				var source_name = source.attr('.name').text;
				var target_name = target.attr('.name').text;
				var assigned_time = link.attr('.assigned_time');
				var link_type = link.get('labels')[0].attrs.text.text;
				// If no assigned_time in the link, save 'None' into the link
				if (!assigned_time){
					link.attr('.assigned_time', {0: 'None'});
					assigned_time = link.attr('.assigned_time');
				}
				if (link_type == 'NBD' || link_type == 'NBT' || link_type.indexOf('|') > -1){
					$('#link-list').append('<tr><td>' + link_type + '</td><td>' + source_name + '</td><td>' + target_name +
						'</td><td><input type="text" name="sth" value=' +assigned_time[0] + '></td>' + btn_html + 
						'<input type="hidden" name="id" value="' + link.id + '"> </td> </tr>'+ '</tr>');
				}
				console.log(link.id);
			}

		}		


	},
	// Dismiss modal box
	dismissModalBox: function(e){
		var modal = document.getElementById('myModal');
		modal.style.display = "none";

	},

	// Trigger when unassign button is pressed. Change the assigned time of the node/link in the same row to none
	unassignValue: function(e){
		var button = e.target;
		var row = $(button).closest('tr');
		var assigned_time = row.find('input[type=text]');
		$(assigned_time).val('None');
	},
	// Update all nodes with the updated assigned time
	// TODO: Check if the times users put in are valid
	saveAssignment: function(e){
		$.each($('#node-list').find("tr input[type=text]"), function(){
			var new_time = $(this).val();
			var row = $(this).closest('tr');
			var func_value = row.find('td:nth-child(2)').html();
			var id = row.find('input[type=hidden]').val();
			// If func is not UD, just find the cell and update it
			if (func_value != 'UD'){
				var cell = graph.getCell(id);
				cell.attr('.assigned_time')[0] = new_time;
			}
			// If func is UD, extract the index i from id, and update i-th assigned time of the node
			else {
				var index = id[id.length - 1];
				id = id.substring(0, id.length - 2);
				var cell = graph.getCell(id);
				cell.attr('.assigned_time')[index] = new_time;
			}


		});

		$.each($('#link-list').find("tr input[type=text]"), function(){
			var new_time = $(this).val();
			var row = $(this).closest('tr');
			var func_value = row.find('td:nth-child(2)').html();
			var id = row.find('input[type=hidden]').val();

			var links = graph.getLinks();
			for (var i = 0; i < links.length; i ++){
				if (links[i].id == id) {
					var link = links[i];
					break;
				}

			}
			
			link.attr('.assigned_time')[0] = new_time;



		});
		// After that dismiss the box
		var modal = document.getElementById('myModal');
		modal.style.display = "none";

	},

	/******************** Call backend *******************/
	solvePath: function(e){
		var max_abs_time = $('#max-abs-time').val();
		var conflict_level = $('#conflict-level').val();
		var num_rel_time = $('#num-rel-time').val();
		var abs_time_pts = $('#abs-time-pts').val();
		// A list of nodes
		var elements = graph.getElements();
		// A list of links
		var links = graph.getLinks();

		// Example to get fields in nodes:
		var cell = elements[0];
		var type = cell.attributes.type;
		var sat_value = cell.attr(".satvalue/value");
		// This return empty string if user set dynamic to no function
		var func_type = cell.attr('.funcvalue/text');
		var name = cell.attr('.name/text');
		// This will return undefined if user hasnt assigned a time
		var assigned_time = cell.attr('.assigned_time');

		// Example to get fields in links:
		var link = links[0];
		// Note this will get undefined by default. Has to manually change type through link inspector
		var link_type = link.prop('link-type');
		var source_node = link.get("source");
		var target_node = link.get("target");

		console.log(max_abs_time);
		console.log(conflict_level);
		console.log(num_rel_time);
		console.log(abs_time_pts);
		console.log(type);
		console.log(sat_value);
		console.log(func_type);
		console.log(name);
		console.log(assigned_time);

	}
});
