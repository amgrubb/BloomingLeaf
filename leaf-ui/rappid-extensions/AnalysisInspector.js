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
		'<font size="2">(e.g. 5 8 22)</font>',
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
		      	    '<th>Epoch Boundary Name</th>',
		      	    '<th>Function</th>',
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
		'<button id="btn-single-path" class="analysis-btns inspector-btn sub-label green-btn">1. Simulate Single Path</button>',
		'<button id="btn-all-next-state" class="analysis-btns inspector-btn sub-label green-btn">2. Explore Possible Next States</button>'
	].join(''),

	events: {
		'click #btn-view-assignment': 'loadModalBox',
		'click .close': 'dismissModalBox',
		'click .unassign-btn': 'unassignValue',
		'click #btn-save-assignment': 'saveAssignment',
		'click #btn-single-path': 'singlePath',
		'click #btn-all-next-state': 'getAllNextStates',
	},

	render: function(analysisFunctions) {
		// These functions are used to communicate between analysisInspector and Main.js
		this._analysisFunctions = analysisFunctions;
		this.$el.html(_.template(this.template)());
		$('head').append('<script src="./scripts/js-objects/analysis.js"></script>');
	},
	// Function called by Simulate Single Path.
	singlePath: function(){
		//Create the object and fill the JSON file to be sent to backend.
		//Get the AnalysisInspector view information
		var analysis = new InputAnalysis();
		//Set the type of analysis
		analysis.action = "solveSinglePath";
		//Prepare and send data to backend
		this.sendToBackend(analysis);
	},
	// Function called by get All Next States.
	getAllNextStates: function(){
		//Create the object and fill the JSON file to be sent to backend.
		//Get the AnalysisInspector view information
		var analysis = new InputAnalysis();
		//Set the type of analysis
		analysis.action = "allNextStates";
		//Prepare and send data to backend
		this.sendToBackend(analysis);
	},
	sendtoBackend: function(analysis){
		var js_object = {};
		js_object.analysis = getAnalysisValues(analysis);
		//Get the Graph Model
		js_object.model = getFrontendModel(false);
		
		saveElementsInGlobalVariable();
		
		if(js_object.model == null){
			return null;
		}

		//Send data to backend
		backendComm(js_object);
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
			if(func != 'UD' && func != 'D' && func != 'I' && func != 'C' && func != 'R' && func != "" && func != 'NB'){
				// If no assigned_time in the node, save 'None' into the node
				if (!assigned_time){
					cell.attr('.assigned_time', {0: 'None'});

				}
				assigned_time = cell.attr('.assigned_time')[0];

				$('#node-list').append('<tr><td>' + name + ': A' + '</td><td>' + func + '</td>' +
					'<td><input type="text" name="sth" value="' + assigned_time + '"></td>' + btn_html +
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
					$('#node-list').append('<tr><td>' + name +': '+ current_something + '</td><td>' + func + '</td>'  +
						'<td><input type="text" name="sth" value=' +assigned_time[j] + '></td>' + btn_html +
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

	}
});

function saveElementsInGlobalVariable(){
	var elements = [];
	for (var i = 0; i < graph.getElements().length; i++){
		if (!(graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
			elements.push(graph.getElements()[i]);
		}
	}
	graph.allElements = elements;
	graph.elementsBeforeAnalysis = elements;
}



