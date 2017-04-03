//Class for the element properties tab that appears when an element is clicked 
var ENTER_KEY = 13;
var alphaOnly = /[A-Z]/;

/*

Note:
The relationships between functions are extremely complex in this file.

Updating variables and render preexisting values often uses the same functions.
Functions like updateGraph, and updateCell are always called whenever changes are made 
on the inspector panel. 

This approach is necessary because Chart.js is built on top HTML5 Canvas. The entire 
canvas needs to be redrawn every time a variable is changed.  

When evaluating the functions calls of a particular action, use a top-down approach in
file naviagation. That is, the first function called is always near the top. The last 
function called, will always be near the bottom.
*/


var ElementInspector = Backbone.View.extend({
	
  className: 'element-inspector',

  template: [
      '<label>Node name</label>',
      '<textarea class="cell-attrs-text"></textarea>',
      '<label>Initial Satisfaction Value</label>',
      '<select id="init-sat-value">',
        '<option value=none> None (T, T)</option>',
        '<option value=satisfied> Satisfied (FS, T)</option>',
        '<option value=partiallysatisfied> Partially Satisfied (PS, T) </option>',
        '<option value=denied> Denied (T, FD)</option>',
        '<option value=partiallydenied> Partially Denied (T, FD)</option>',
        '<option value=unknown> Unknown </option>',
			'</select>',
      '<br>',
      '<div id="function-div">',
        '<label>Function Type</label>',
        '<select class="function-type">',
          '<option value=none> No Function </option>',
          '<option value=C> Constant </option>',
          '<option value=R> Stochastic </option>',
          '<option value=I> Increase </option>',
          '<option value=D> Decrease </option>',
          '<option value=RC> Stochastic-Constant </option>',
          '<option value=CR> Constant-Stochastic </option>',
          '<option value=MP> Montonic Positive </option>',
          '<option value=MN> Montonic Negative </option>',
          '<option value=SD> Satisfied Denied </option>',
          '<option value=DS> Denied Satisfied </option>',
          '<option value=UD> User Defined </option>',
        '</select>',
        '<select class="function-sat-value">',
          '<option value=satisfied> Satisfied </option>',
          '<option value=partiallysatisfied> Partially Satisfied </option>',
          '<option value=unknown selected> Random/Stochastic </option>',
          '<option value=partiallydenied> Partially Denied </option>',
          '<option value=denied> Denied </option>',
        '</select>',
        '<div id="user-constraints">',
          '<div id="all-user-constraints">',
            '<div id="new-user-constraints">',
              '<select class="user-function-type user-defined-select">',
                '<option value=C> Constant </option>',
                '<option value=R> Stochastic </option>',
                '<option value=I> Increase </option>',
                '<option value=D> Decrease </option>',
              '</select>',
              '<select class="user-sat-value user-defined-select">',
                '<option value=satisfied> Satisfied (FS, T) </option>',
                '<option value=partiallysatisfied> Partially Satisfied (PS, T) </option>',
                '<option value=unknown selected> Unknown </option>',
                '<option value=partiallydenied> Partially Denied (T, PD)</option>',
                '<option value=denied> Denied (T, FD)</option>',
              '</select>',
            '</div>',
          '</div>',
          '<br>',
          // Error message is controlled dynamically
          '<label id="repeat-error"></label>',
          '<select id="repeat-begin" class="repeat-select">',
            '<option class="select-placeholder" selected disabled value="">Begin</option>',
          '</select>',
          '<select id="repeat-end" class="repeat-select">',
            '<option class="select-placeholder" selected disabled value="">End</option>',
          '</select>',

          '<button id="constraint-add" class="inspector-btn small-btn green-btn">Add</button>',
          '<button id="constraint-repeat" class="inspector-btn small-btn blue-btn">Set Repeats</button>',
          '<button id="constraint-restart" class="inspector-btn small-btn red-btn">Clear</button>',
        '</div>',
      '</div>',
      '<br>',
      '<canvas id="chart" width="240" height="240"></canvas>',

  ].join(''),
  
  actor_template: [
    '<label>Actor name</label>',
    '<textarea class="cell-attrs-text" maxlength=100></textarea>',
    '<label> Actor type </label>',
    '<select class="actor-type">',
      '<option value=A> Actor </option>',
      '<option value=G> Agent </option>',
      '<option value=R> Role </option>',
    '</select>'
	].join(''),

  events: {
    'keyup .cell-attrs-text': 'nameAction',
    'change #init-sat-value':'updateHTML',

    'change .function-type':'updateHTML',
    'change .function-sat-value':'updateGraph',

    'change .user-function-type':'updateHTML',
    'change .user-sat-value':'updateGraphUserDefined',
    'change .repeat-select':'selectRepeatValues',

    'click #constraint-add': 'addConstraint',
    'click #constraint-repeat': 'repeatConstraintControl',
    'click #constraint-restart': 'restartConstraint',
  },
  
  //Initializing Element Inspector using the template.
  render: function(cellView) {
    this._cellView = cellView;
    var cell = this._cellView.model;
    if (cell instanceof joint.shapes.basic.Actor){
      this.$el.html(_.template(this.actor_template)());
      this.$('.cell-attrs-text').val(cell.attr(".name/text") || '');
      return
    }else{
      this.$el.html(_.template(this.template)());
    }

    cell.on('remove', function() {
        this.$el.html('');
    }, this);
    
    // Global variables
    this.chartObject = new chartObject();
    this.constraintsObject = new constraintsObject();

    // Genernate all available selection options based on selected function type
    this.chartHTML = {};
    this.chartHTML.all = '<option value=satisfied> Satisfied (FS, T) </option><option value=partiallysatisfied> Partially Satisfied (PS, T) </option><option value=unknown selected> Unknown </option><option value=partiallydenied> Partially Denied (T, PD)</option><option value=denied> Denied (T, FD)</option>';
    this.chartHTML.noRandom = '<option value=satisfied> Satisfied (FS, T) </option><option value=partiallysatisfied> Partially Satisfied (PS, T) </option><option value=-1> Partially Denied (T, PD) </option><option value=denied> Denied (T, FD) </option>';
    this.chartHTML.positiveOnly = '<option value=satisfied> Satisfied (FS, T) </option><option value=partiallysatisfied> Partially Satisfied (PS, T) </option>';
    this.chartHTML.negativeOnly = '<option value=denied> Denied (T, FD) </option><option value=partiallydenied> Partially Denied (T, PD) </option>';

    //save html template to dynamically render more
    this.userConstraintsHTML = $("#new-user-constraints").last().clone();

    // Load initial value
    this.$('.cell-attrs-text').val(cell.attr(".name/text") || '');
    this.$('#init-sat-value').val(cell.attr(".satvalue/value") || 'none');
    if (!cell.attr(".satvalue/value") && cell.attr(".funcvalue/text") != "NB"){
      cell.attr(".satvalue/value", 'none');
      cell.attr(".funcvalue/text", ' ');
    }

    // Turn off repeating by default
    this.repeatOptionsDisplay = false;
    this.repeatConstraint("TurnOff");

    // Load function type
    var functionType = cell.attr(".funcvalue/text");
    if((functionType == '') || (functionType == " ") || (functionType == "NB")){
      this.$('.function-type').val('none');
      this.updateHTML(null);
    }
    else if((functionType == "C") || (functionType == " ")){
      this.$('.function-type').val('C');
      this.updateHTML(null);

    }

    else if(functionType != "UD"){
      this.$('.function-type').val(functionType);
      this.updateHTML(null);
    // loading user defined constraint
    }else{
      this.$('.function-type').val(functionType);
      this.renderUserDefined(cell);
    }
  },

  // Rendering inspector panel from previously specified user-defined functions
  renderUserDefined: function(cell){
    this.$('.function-sat-value').hide();
    this.constraintsObject.userFunctions = cell.attr(".constraints/function");
    this.constraintsObject.userValues = cell.attr(".constraints/lastval");

    // Load HTML
    var index = cell.attr(".constraints/lastval").length - 1;
    if (index == 0){
      $(".user-sat-value").last().val(this.constraintsObject.userValues[index]);
      $(".user-function-type").last().val(this.constraintsObject.userFunctions[index]);
    }else{
      for (var i = 0; i < index; i++){
        var prevLetter = this.constraintsObject.endLetter[this.constraintsObject.endLetter.length - 1];
        this.constraintsObject.beginLetter.push(prevLetter);
        this.constraintsObject.endLetter.push(String.fromCharCode(prevLetter.charCodeAt(0) + 1));

        this.addConstraint(null, "render");
      }
      $(".user-sat-value").last().val(this.constraintsObject.userValues[i]);
      $(".user-function-type").last().val(this.constraintsObject.userFunctions[i]);
    }

    // Render repeat if necessary
    var repeatBegin = cell.attr(".constraints/beginRepeat");
    var repeatEnd = cell.attr(".constraints/endRepeat");
    if (repeatBegin && repeatEnd){
      this.repeatOptionsDisplay = true;
      this.constraintsObject.repeatBegin = repeatBegin;
      this.constraintsObject.repeatEnd = repeatEnd;

      this.repeatConstraint("TurnOn");
      this.repeatConstraint("Update");
      $("#repeat-begin").val(repeatBegin);
      $("#repeat-end").val(repeatEnd);
    }

    this.updateGraphUserDefined(null);
  },

  // update cell name
  nameAction: function(event){
    //Prevent the ENTER key from being recorded when naming nodes.
		if (event.which === ENTER_KEY){
			event.preventDefault();
    }

    var cell = this._cellView.model;
    var text = this.$('.cell-attrs-text').val()
    // Do not allow special characters in names, replace them with spaces.

    text = text.replace(/[^\w\n]/g, ' ');
    cell.attr({ '.name': { text: text } });
  },

  // update satisfaction value and buttons selection based on function type selection
  updateHTML: function(event){
    var cell = this._cellView.model;
    var functionType = this.$('.function-type').val();
    var initValue = this.$('#init-sat-value').val();
    // Disable init value menu if functype is NB
    if (cell.attr('.funcvalue/text') == "NB"){
      $('#init-sat-value').prop('disabled', 'disabled');
    }
    else {
      // $('#init-sat-value').prop('disabled', false); 
      // console.log('F');
    }



    // display based on inital value
    if((initValue == "none") || (initValue == "conflict")){
      this.$('#function-div').hide();
      $('.function-type').prop('disabled', false);
      this.updateCell(null);
      return
    }
    else if(initValue == "unknown"){
      this.$('.function-type').val("C");
      functionType = "C";
      $('.function-type').prop('disabled', 'disabled');
      this.$('#function-div').show("fast");
    }
    else{
      $('.function-type').prop('disabled', false);
      this.$('#function-div').show("fast");
    }

    // display based on function type
    if ((functionType == "R") || (functionType == "C") || (functionType == "SD") || (functionType == "DS") || (functionType == "CR") || (functionType == "none")){
      this.$('.function-sat-value').hide();
      this.$('#user-constraints').hide();
    }else if (functionType == "UD"){
      this.$('.function-sat-value').hide();
      this.$('#user-constraints').show("fast");
    }else{
      this.$('.function-sat-value').show("fast");
      this.$('#user-constraints').hide();
    }

    // load available satisfaction values based on function selection
    if(functionType == "RC"){
      this.$('.function-sat-value').html(this.chartHTML.noRandom);
    }else if((functionType == "I") || (functionType == "MP")){
      this.$('.function-sat-value').html(this.chartHTML.positiveOnly);
    }else if((functionType == "D") || (functionType == "MN")){
      this.$('.function-sat-value').html(this.chartHTML.negativeOnly);
    }else if(functionType == "UD"){

      var func = $(".user-function-type").last().val();
      var index = this.constraintsObject.currentUserIndex;

      // Free value selection if it was blocked
      if ($('.user-sat-value').last().prop( "disabled")){
        $('.user-sat-value').last().prop('disabled', '');
        $('.user-sat-value').last().css("background-color","");
      }

      // load available satisfaction values for user defined constraint type
      if(func == "I"){
        $(".user-sat-value").last().html(this.chartHTML.positiveOnly);
        $(".user-sat-value").last().val("satisfied");
      }else if(func == "D"){
        $(".user-sat-value").last().html(this.chartHTML.negativeOnly);
        $(".user-sat-value").last().val("denied");
      }else if(func == "R"){
        $(".user-sat-value").last().html(this.chartHTML.all);

        $(".user-sat-value").last().val("unknown")
        $(".user-sat-value").last().prop('disabled', 'disabled');
        $(".user-sat-value").last().css("background-color","grey");
      }else if(func == "C"){
        $(".user-sat-value").last().html(this.chartHTML.all);

        // Restrict input if it is the first constraint
        if (index == 0){
          $(".user-sat-value").last().val(this.$('#init-sat-value').val())
          $(".user-sat-value").last().prop('disabled', 'disabled');
          $(".user-sat-value").last().css("background-color","grey");
        }
      }
    }
    this.updateGraph(null);
  },

  // update chart based on function type selection
  updateGraph: function(event){
    var text = this.$('.function-type').val();
    var initVal = satvalues[this.$('#init-sat-value').val()];
    var val = satvalues[this.$('.function-sat-value').val()];
    // Rerender chart canvas
    var data = this.constraintsObject.chartData;
    var context = $("#chart").get(0).getContext("2d");
    // Show the chart if previously hidden
    $('#chart').show();

    if(this.constraintsObject.chart != null)
      this.constraintsObject.chart.destroy();

    // If there is preexisting user-defined functions, clear it
    if ((text!= "UD") && (this.constraintsObject.currentUserIndex > 0))
      this.restartConstraint(null);

    
    // change chart based on function type
    if(text == "R"){
      this.constraintsObject.chartData.labels = ["0", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [initVal, 0];
      this.constraintsObject.chartData.datasets[1].data = [null, null];
      $('#init-sat-value').prop('disabled', '');
      $('#init-sat-value').css("background-color","");
      
    }else if(text == "C"){
      this.constraintsObject.chartData.labels = ["0", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [initVal, initVal];
      this.constraintsObject.chartData.datasets[1].data = [null, null];
      $('#init-sat-value').prop('disabled', '');
      $('#init-sat-value').css("background-color","");

    }else if((text == "I") || (text == "D")){
      this.constraintsObject.chartData.labels = ["0", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [initVal, val];
      this.constraintsObject.chartData.datasets[1].data = [null, null];
      $('#init-sat-value').prop('disabled', '');
      $('#init-sat-value').css("background-color","");

    }else if(text == "RC"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [0, 0, null];
      this.constraintsObject.chartData.datasets[1].data = [null, val, val];
      this.$('#init-sat-value').val("unknown");
      $('#init-sat-value').prop('disabled', 'disabled');
      $('#init-sat-value').css("background-color","grey");

    }else if(text == "CR"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [initVal, initVal, null];
      this.constraintsObject.chartData.datasets[1].data = [null, 0, 0];
      $('#init-sat-value').prop('disabled', '');
      $('#init-sat-value').css("background-color","");

    }else if(text == "SD"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [2, 2, null];
      this.constraintsObject.chartData.datasets[1].data = [null, -2, -2];
      this.$('#init-sat-value').val("satisfied");  
      $('#init-sat-value').prop('disabled', 'disabled');
      $('#init-sat-value').css("background-color","grey");

    }else if(text == "DS"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [-2, -2, null];
      this.constraintsObject.chartData.datasets[1].data = [null, 2, 2];
      this.$('#init-sat-value').val("denied");
      $('#init-sat-value').prop('disabled', 'disabled');
      $('#init-sat-value').css("background-color","grey");

    }else if(text == "MP"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [-2, val, val];
      this.constraintsObject.chartData.datasets[1].data = [];
      this.$('#init-sat-value').val("denied");
      $('#init-sat-value').prop('disabled', 'disabled');
      $('#init-sat-value').css("background-color","grey");

    }else if(text == "MN"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [2, val, val];
      this.constraintsObject.chartData.datasets[1].data = [];
      this.$('#init-sat-value').val("satisfied");
      $('#init-sat-value').prop('disabled', 'disabled');
      $('#init-sat-value').css("background-color","grey");

    // render preview for user defined function types
    }else if(text == "UD"){
      this.updateGraphUserDefined(null);
      return
    // If text = none, no chart
    }else{
      console.log('ayy its me');
      $('#chart').hide();
    }


    this.constraintsObject.chart = new Chart(context).Line(data, this.chartObject.chartOptions);
    this.updateCell(null);
  },

  // update chart for user defined constraints
  updateGraphUserDefined: function(cell){
    var context = $("#chart").get(0).getContext("2d");
    var func = $(".user-function-type").last().val();
    var index = this.constraintsObject.currentUserIndex;
    if(this.constraintsObject.chart != null)
      this.constraintsObject.chart.destroy();

    // save values in user defined functions
    this.constraintsObject.userFunctions[index] = func;
    this.constraintsObject.userValues[index] = $(".user-sat-value").last().val();

    // Clone chart template
    var data = jQuery.extend(true, {}, this.chartObject.primaryChart);
    var datasetsTemplatePrimary = jQuery.extend(true, {}, data.datasets[0]);
    var datasetsTemplateSecondary = jQuery.extend(true, {}, this.chartObject.secondaryChart.datasets[0]);

    // Setting up the labels
    data.labels = this.constraintsObject.beginLetter.slice(0);
    data.labels.push(this.constraintsObject.endLetter[this.constraintsObject.endLetter.length - 1]);

    // Setting repeating variables
    var repeat = this.repeatOptionsDisplay;
    var repeatBegin = this.constraintsObject.repeatBegin;
    var repeatEnd = this.constraintsObject.repeatEnd;

    // Since ChartJS does not allow multiple points on the same Y-axis we must duplicate the date sets
    // whenever there is a disconnect. This occurs when Constant is selected.
    data.datasets[0].data = [satvalues[this.$('#init-sat-value').val()]];
    for (var i = 0; i < data.labels.length - 1; i++){

      // setting up empty data set
      datasetsTemplatePrimary.data.push(null);
      if (repeat)
        datasetsTemplateSecondary.data.push(null);

      for (var j = 0; j < data.datasets.length; j++){
        data.datasets[j].data.push(null);
      }

      // switch to the empty data set if necessary
      var f = this.constraintsObject.userFunctions[i];
      if ((f == "C") || (data.labels[i] == repeatBegin) || (data.labels[i] == repeatEnd)){

        // Switch color schemes during the repeated range
        if (repeat && (data.labels[i] >= repeatBegin) && (data.labels[i] < repeatEnd)){
          var newSet = jQuery.extend(true, {}, datasetsTemplateSecondary);
        }else{
          var newSet = jQuery.extend(true, {}, datasetsTemplatePrimary);
        }

        data.datasets.push(newSet);
        data.datasets[data.datasets.length - 1].data[i] = satvalues[this.constraintsObject.userValues[i]];
        data.datasets[data.datasets.length - 1].data[i + 1] = satvalues[this.constraintsObject.userValues[i]];
      }else{
        data.datasets[data.datasets.length - 1].data[i + 1] = satvalues[this.constraintsObject.userValues[i]];
      }
    }

    // data.datasets[0].data = data.datasets[0].data.concat(this.constraintsObject.userValues);
    this.constraintsObject.chart = new Chart(context).Line(data, this.chartObject.chartOptions);
    this.updateCell(null);
  },


  // add new constraint in used defined function
  addConstraint: function(e, mode){
    // update html display for additional user inputs
    var html = this.userConstraintsHTML.clone();
    var i = this.constraintsObject.currentUserIndex;

    // load user defined constraints from saved data
    if(mode == "render"){
      $(".user-sat-value").last().val(this.constraintsObject.userValues[i]);
      $(".user-function-type").last().val(this.constraintsObject.userFunctions[i]);
    }

    $('#init-sat-value').prop('disabled', 'disabled');
    $('#init-sat-value').css("background-color","grey");

    $(".user-sat-value").last().prop('disabled', 'disabled');
    $(".user-sat-value").last().css("background-color","grey");
    $(".user-function-type").last().prop('disabled', 'disabled');
    $(".user-function-type").last().css("background-color","grey");
    html.appendTo(this.$('#all-user-constraints'));

    this.constraintsObject.currentUserIndex += 1;

    // generate graph only if constraints are manually added
    if (mode != "render"){
      var prevLetter = this.constraintsObject.endLetter[this.constraintsObject.currentUserIndex - 1];
      this.constraintsObject.beginLetter.push(prevLetter);
      this.constraintsObject.endLetter.push(String.fromCharCode(prevLetter.charCodeAt(0) + 1));
      
      if (this.repeatOptionsDisplay){
        this.repeatConstraint("Update");
        this.constraintsObject.repeatBegin = null;
        this.constraintsObject.repeatEnd = null;
      }
      this.updateGraphUserDefined(null);
    }
  },

  // Toggle repeat button for user defined constraints
  repeatConstraintControl: function(e){
    if (!this.repeatOptionsDisplay){
      this.repeatConstraint("TurnOn");
      this.repeatConstraint("Update");
    }else if (this.repeatOptionsDisplay){
      this.repeatConstraint("TurnOff");

      this.constraintsObject.repeatBegin = null;
      this.constraintsObject.repeatEnd = null;
      this.updateGraphUserDefined(null);
    }
  },

  // Begin and end range of repeated constraints must logically make sense
  selectRepeatValues: function(e){
    var begin = $("#repeat-begin").val();
    var end = $("#repeat-end").val();
  
    var nextChar = String.fromCharCode(begin.charCodeAt(0) + 1);

    if (begin >= end){
      $("#repeat-error").text("Repeated range must be chronological");
      $("#repeat-error").show("fast");
      this.constraintsObject.repeatBegin = null;
      this.constraintsObject.repeatEnd = null;

    }else if (nextChar == end){
      $("#repeat-error").text("Repeated range must be at least two apart");
      $("#repeat-error").show("fast");
      this.constraintsObject.repeatBegin = null;
      this.constraintsObject.repeatEnd = null;

    }else{
      $("#repeat-error").hide();
      this.constraintsObject.repeatBegin = begin;
      this.constraintsObject.repeatEnd = end;
    }
    this.updateGraphUserDefined(null);

  },

  repeatConstraint: function(mode){

    // Reset options for select everytime repeat is clicked
    $("#repeat-begin").html('<option class="select-placeholder" selected disabled value="">Begin</option>');
    $("#repeat-end").html('<option class="select-placeholder" selected disabled value="">End</option>');

    // turn on all repeat related display and values
    if (mode == "TurnOn"){
      $("#repeat-begin").show("fast");
      $("#repeat-end").show("fast");
      $("#constraint-repeat").text("Clear Repeats");
      this.repeatOptionsDisplay = true;

    // turn off all repeat related display and values
    }else if (mode == "TurnOff"){
      $("#repeat-begin").hide();
      $("#repeat-end").hide();
      $("#constraint-repeat").text("Set Repeats");
      $("#repeat-error").hide();
      this.repeatOptionsDisplay = false;

    // update all repeat related display and values
    }else if (mode == "Update"){

      // Cannot repeat with only one constraint
      if (this.constraintsObject.currentUserIndex == 0){

        $("#repeat-error").text("More constraints are needed");

        $("#repeat-error").show("fast");
        $("#repeat-begin").prop('disabled', 'disabled');
        $("#repeat-begin").css("background-color","grey");
        $("#repeat-end").prop('disabled', 'disabled');
        $("#repeat-end").css("background-color","grey");

      // Update HTML
      }else{

        if ($("#repeat-begin").prop('disabled')){
          $("#repeat-error").hide();
          $("#repeat-begin").prop('disabled', '');
          $("#repeat-begin").css("background-color","");
          $("#repeat-end").prop('disabled', '');
          $("#repeat-end").css("background-color","");
        }

        // Set select options
        for (var i = 0; i < this.constraintsObject.currentUserIndex; i++){
          var beginVal = this.constraintsObject.beginLetter[i];
          var endVal = this.constraintsObject.endLetter[i + 1];
          $("#repeat-begin").append(
            $('<option></option>').val(beginVal).html(beginVal)
          );
          $("#repeat-end").append(
            $('<option></option>').val(endVal).html(endVal)
          );
        }
      }
    }
  },

  // Reset user-define chart to default
  restartConstraint: function(e){
    $('#init-sat-value').prop('disabled', '');
    $('#init-sat-value').css("background-color","");

    this.constraintsObject.beginLetter = ["0"];
    this.constraintsObject.endLetter = ["A"];
    this.constraintsObject.currentUserIndex = 0;
    this.constraintsObject.userFunctions = ["C"];
    this.constraintsObject.userValues = [$('#init-sat-value').val()];
    var html = this.userConstraintsHTML.clone();
    this.$('#all-user-constraints').html('');
    html.appendTo(this.$('#all-user-constraints'));
    
    if (this.repeatOptionsDisplay)
      this.repeatConstraint("TurnOff");

    this.updateHTML(null);
  },

  //Make corresponding changes in the inspector to the actual element in the chart
  updateCell: function(event) {
		var cell = this._cellView.model;
    // Cease operation if selected is Actor
  	if (cell instanceof joint.shapes.basic.Actor){ 
    	cell.prop("actortype", this.$('.actor-type').val());
    	if (cell.prop("actortype") == 'G'){
    		cell.attr({ '.line':
    					{'ref': '.label',
            			 'ref-x': 0,
            			 'ref-y': 0.08,
            			 'd': 'M 5 10 L 55 10',
            			 'stroke-width': 1,
            			 'stroke': 'black'}});
    	}else if (cell.prop("actortype") == 'R'){
    		cell.attr({ '.line':
    					{'ref': '.label',
            			 'ref-x': 0,
            			 'ref-y': 0.6,
            			 'd': 'M 5 10 Q 30 20 55 10 Q 30 20 5 10' ,
            			 'stroke-width': 1,
            			 'stroke': 'black'}});
    	}else {
    		cell.attr({'.line': {'stroke-width': 0}});
    	}
    	return;
  	}

    // save cell data
    var funcType = this.$('.function-type').val();
    cell.attr(".satvalue/value", this.$('#init-sat-value').val());
    // If funcvalue == NB, do not update anything to the cell
    if(cell.attr(".funcvalue/text") == 'NB'){
    }
    else if (funcType != 'none'){
      cell.attr(".funcvalue/text", funcType);
    }

    else {
      cell.attr(".funcvalue/text", ""); 
    }
    cell.attr(".constraints/lastval", this.$('.function-type').val());


    if (funcType == "UD"){

      // for some reason directly calling .attr does not update
      cell.attr(".constraints/function", null);
      cell.attr(".constraints/lastval", null);
      cell.attr(".constraints/beginLetter", null);
      cell.attr(".constraints/endLetter", null);

      cell.attr(".constraints/function", this.constraintsObject.userFunctions);
      cell.attr(".constraints/lastval", this.constraintsObject.userValues);
      cell.attr(".constraints/beginLetter", this.constraintsObject.beginLetter);
      cell.attr(".constraints/endLetter", this.constraintsObject.endLetter);

      // update repeat values
      if (this.repeatOptionsDisplay){
        cell.attr(".constraints/beginRepeat", this.constraintsObject.repeatBegin);
        cell.attr(".constraints/endRepeat", this.constraintsObject.repeatEnd);
      }else{
        cell.attr(".constraints/beginRepeat", null);
        cell.attr(".constraints/endRepeat", null);  
      }

    }else if (funcType == "R"){
      cell.attr(".constraints/lastval", "unknown");
    }else if ((funcType == "C") || (funcType == "CR")){
      cell.attr(".constraints/lastval", this.$('#init-sat-value').val());
    }else if (funcType == "SD"){
      cell.attr(".constraints/lastval", "denied");
    }else if (funcType == "DS"){
      cell.attr(".constraints/lastval", "satisfied");
    }else {
      cell.attr(".constraints/function", this.$('.function-type').val());
      cell.attr(".constraints/lastval", this.$('.function-sat-value').val());
    }

    //Update node display based on function and values
    var value = this.$('#init-sat-value').val();

    if (value == "none"){ 
      cell.attr(".satvalue/text", "");
      // If functype is NB, dont clear it
      if(cell.attr(".funcvalue/text") != 'NB'){
        cell.attr(".funcvalue/text", " ");
      }

    }

    // Navie: Changed satvalue from path to text
    if (value == "satisfied"){
      // cell.attr({ '.satvalue': {'d': 'M 0 10 L 5 20 L 20 0 L 5 20 L 0 10', 'stroke': '#00FF00', 'stroke-width':4}});      
      cell.attr(".satvalue/text", "(FS, T)");
    }else if(value == "partiallysatisfied") {
      // cell.attr({ '.satvalue': {'d': 'M 0 8 L 5 18 L 20 0 L 5 18 L 0 8 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#00FF00', 'stroke-width':3, 'fill': 'transparent'}});
      cell.attr(".satvalue/text", "(PS, T)");
    }else if (value == "denied"){
      // cell.attr({ '.satvalue': {'d': 'M 0 20 L 20 0 M 10 10 L 0 0 L 20 20', 'stroke': '#FF0000', 'stroke-width': 4}});
      cell.attr(".satvalue/text", "(T, FD)");
    }else if (value == "partiallydenied") {
      // cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
      cell.attr(".satvalue/text", "(T, PD)");
    }else if (value == "unknown") {
      // cell.attr({ '.satvalue': {'d': 'M15.255,0c5.424,0,10.764,2.498,10.764,8.473c0,5.51-6.314,7.629-7.67,9.62c-1.018,1.481-0.678,3.562-3.475,3.562\
          // c-1.822,0-2.712-1.482-2.712-2.838c0-5.046,7.414-6.188,7.414-10.343c0-2.287-1.522-3.643-4.066-3.643\
          // c-5.424,0-3.306,5.592-7.414,5.592c-1.483,0-2.756-0.89-2.756-2.584C5.339,3.683,10.084,0,15.255,0z M15.044,24.406\
          // c1.904,0,3.475,1.566,3.475,3.476c0,1.91-1.568,3.476-3.475,3.476c-1.907,0-3.476-1.564-3.476-3.476\
          // C11.568,25.973,13.137,24.406,15.044,24.406z', 'stroke': '#222222', 'stroke-width': 1}});
          cell.attr(".satvalue/text", "?");
    }else {
      // cell.removeAttr(".satvalue/text");
    }
  },
  
  clear: function(){
    this.$el.html('');
  }
});
