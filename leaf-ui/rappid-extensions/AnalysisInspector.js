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
	model: ConfigBBM,
	
	template: ['<script type="text/template" id="item-template">',
		'<div class="inspector-views">',
		'<div id="container-sidebar">', 
		'<div id="analysis-sidebar">',
		'<h5 style="text-align:center; color:#181b1fe3; margin-left: 10px;">Analysis Parameters</h5>',
		'<p style="text-align:center; margin-top: -20px;";><label class = "sub-label">Conflict Prevention Level</label>', 
		'<select id="conflict-level" class="sub-label" style="height:20px; width: 170px";>', 
			'<option value=S <% if (conflictLevel === "S") { %> selected <%} %>> Strong </option>',
			'<option value=M <% if (conflictLevel === "M") { %> selected <%} %>> Medium </option>',
			'<option value=W <% if (conflictLevel === "W") { %> selected <%} %>> Weak </option>',
			'<option value=N <% if (conflictLevel === "N") { %> selected <%} %>> None </option>',
		'</select>',
		'<label class="sub-label">Num Relative Time Points</label>',
		'<input id="num-rel-time" class="analysis-input" type="number" min="0" max="20" step="1" value="<%= numRelTime %>"/> </input>',
		'</div>',
		'<hr>',
		'</div>',
		'</div>',
		'</script>'].join(''),		
	events: {
		'change #num-rel-time': 'addRelTime', 
		'change #conflict-level': 'changeConflictLevel',
		'clearInspector .inspector-views': 'removeView',
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
	}
});