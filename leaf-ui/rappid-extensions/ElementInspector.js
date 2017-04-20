//Class for the element properties tab that appears when an element is clicked 
var ENTER_KEY = 13;
var alphaOnly = /[A-Z]/;
// All valid initvalue/function combination
var validPair = {
  "none": {
    "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
    "defaultValue": ["none"]
  },
  "C":{
    "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied", "unknown"],
    "defaultValue": ["none"]  
  },
  "R":{
    "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
    "defaultValue": ["none"]  
  },
  "I": {
    "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
    "defaultValue": ["denied"]
  },
  "D": {
    "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
    "defaultValue": ["satisfied"]
  },
  "RC": {
    "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
    "defaultValue": ["none"]
  },
  "CR": {
    "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
    "defaultValue": ["none"]
  },
  "MP": {
    "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
    "defaultValue": ["denied"]
  },
  "MN": {
    "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied"],
    "defaultValue": ["satisfied"]
  },
  "SD": {
    "validInitValue": ["satisfied"],
    "defaultValue": ["satisfied"]
  },
  "DS": {
    "validInitValue": ["denied"],
    "defaultValue": ["denied"]
  }

};
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
        '<option value=partiallydenied> Partially Denied (T, PD)</option>',
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
                '<option value=none selected> None (T, T) </option>',
                '<option value=satisfied> Satisfied (FS, T) </option>',
                '<option value=partiallysatisfied> Partially Satisfied (PS, T) </option>',
                '<option value=partiallydenied> Partially Denied (T, PD)</option>',
                '<option value=denied> Denied (T, FD)</option>',
                '<option value=unknown> Unknown </option>',
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
    none = '<option value=none selected> None (T, T) </option>';
    satisfied = '<option value=satisfied> Satisfied (FS, T) </option>';
    partiallysatisfied = '<option value=partiallysatisfied> Partially Satisfied (PS, T) </option>';
    partiallydenied = '<option value=partiallydenied> Partially Denied (T, PD) </option>';
    denied = '<option value=denied> Denied (T, FD) </option>';
    unknown = '<option value=unknown> Unknown </option>';
    this.chartHTML.all = none + satisfied + partiallysatisfied + partiallydenied + denied + unknown;
    this.chartHTML.noRandom = satisfied + partiallysatisfied + partiallydenied + denied;
    // This is a function that will list all satvalues that are greater than currentVal
    this.chartHTML.positiveOnly = function(currentVal){
      currentVal = satvalues[currentVal];
      result = '';
      for (var i = currentVal; i <= satvalues['satisfied']; i++){
        // Find text by value eg. given i = -1, we want to find partiallydenied as satvalues[partiallydenied] = -1
        var text = Object.keys(satvalues).find(key => satvalues[key] === i);
        result += eval(text);
      }
      return result;
    }
    this.chartHTML.negativeOnly = function(currentVal){
      currentVal = satvalues[currentVal];
      result = '';
      for (var i = currentVal; i >= satvalues['denied']; i--){
        // Find text by value eg. given i = -1, we want to find partiallydenied as satvalues[partiallydenied] = -1
        var text = Object.keys(satvalues).find(key => satvalues[key] === i);
        result += eval(text);
      }
      return result; 
    }

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
    // Check if selected initValue/functionType pair is illegal
    this.validityCheck(event);
    var cell = this._cellView.model;
    var functionType = this.$('.function-type').val();
    var initValue = this.$('#init-sat-value').val();
    // All functions that have satisfaction value
    var funct_with_sat_value = ["I", "D", "RC", "MP", "MN", "UD"];

    // Disable init value menu if functype is NB
    if (cell.attr('.funcvalue/text') == "NB"){
      $('#init-sat-value').prop('disabled', 'disabled');
    }

    // If UD function, show UD. Show function-sat-value for certain functions.
    // Else, hide user constraint
    if (functionType == "UD"){
      this.$('.function-sat-value').hide();
      this.$('#user-constraints').show("fast");
      this.loadUDFunction(null);
    }
    else if ($.inArray(functionType, funct_with_sat_value) > -1){
      this.showFunctionSatValue(null);
      this.$('#user-constraints').hide();
      $('#init-sat-value').prop('disabled', '');
    }
    else {
      this.$('.function-sat-value').hide();
      this.$('#user-constraints').hide();      
      $('#init-sat-value').prop('disabled', '');
    }
    this.updateGraph(null);

  },

  // Check validity of initValue/functionType pair
  // If not legal, change the initValue or functionType accordingly
  validityCheck: function(event){
    var cell = this._cellView.model;
    var functionType = this.$('.function-type').val();
    var initValue = this.$('#init-sat-value').val();
    // Check what triggered the validty check
    // Either init value changed, func type changed or simply an element gets clicked
    initValueChanged = false;
    funcTypeChanged = false;
    // If an element gets clicked, don't bother checking
    if (event == null){
      return;
    }
    else {
      if (event.target.id == 'init-sat-value'){
        initValueChanged = true;
      }
      else if (event.target.className == 'function-type'){
        funcTypeChanged = true;
      }
    }
    // Perform check
    // If not UD, just do a regular check
    if (functionType != "UD"){
      // If not valid, 2 possible actions: 
      // change to default init value if functTypeChanged
      // change to none function if initValueChanged
      if ($.inArray(initValue, validPair[functionType]['validInitValue']) == -1){
        if (initValueChanged && initValue != "unknown"){$('.function-type').val('none');}
        if (initValueChanged && initValue == "unknown"){$('.function-type').val('C');}
        if (funcTypeChanged){$('#init-sat-value').val(validPair[functionType]['defaultValue']);}

      }
    }
    // TODO: This may not be necessary. It is using the old code for now
    // Only need this when we have new chart code
    // If it is UD, just check the last row of the UD functions
    else {
      var userSatValue = $(".user-sat-value").last().val();
      var userFunctionType = $(".user-function-type").last().val();
    }
    return;
  },


  // This is only called if the node has funct_with_sat_value
  // Display func-sat-value menu and display options based on the fucntion
  showFunctionSatValue: function(event){
    var cell = this._cellView.model;
    var functionType = this.$('.function-type').val();
    var initValue = this.$('#init-sat-value').val();
    this.$('.function-sat-value').show("fast");
    switch (functionType) {
      case "RC":
        this.$('.function-sat-value').html(this.chartHTML.noRandom);
        break;

      case "I":
      case "MP":
        this.$('.function-sat-value').html(this.chartHTML.positiveOnly(initValue));
        break;

      case "D":
      case "MN":
        this.$('.function-sat-value').html(this.chartHTML.negativeOnly(initValue));
        break;

      default:
        break;
    }
    return;
  },

  // This function can only be called by updateHTML only when node is UD
  loadUDFunction: function(event){
    var func = $(".user-function-type").last().val();
    var index = this.constraintsObject.currentUserIndex;

    // Free value selection if it was blocked
    if ($('.user-sat-value').last().prop( "disabled")){
      $('.user-sat-value').last().prop('disabled', '');
      $('.user-sat-value').last().css("background-color","");
    } 
    // load available satisfaction values for user defined constraint type
    switch (func){
      case "I":
        // May get last value of the graph in the future
        $(".user-sat-value").last().html(this.chartHTML.positiveOnly('partiallysatisfied'));
        $(".user-sat-value").last().val("satisfied");
        break;

      case "D":
        $(".user-sat-value").last().html(this.chartHTML.negativeOnly('partiallydenied'));
        $(".user-sat-value").last().val("denied");
        break;

      case "R":
        $(".user-sat-value").last().html(this.chartHTML.all);
        $(".user-sat-value").last().val("unknown")
        $(".user-sat-value").last().prop('disabled', 'disabled');
        $(".user-sat-value").last().css("background-color","grey");        
        break;

      case "C":
        $(".user-sat-value").last().html(this.chartHTML.all);
        // Restrict input if it is the first constraint
        if (index == 0){
          $(".user-sat-value").last().val(this.$('#init-sat-value').val())
          $(".user-sat-value").last().prop('disabled', 'disabled');
          $(".user-sat-value").last().css("background-color","grey");
        }
        break;

      default:
        break;        
    }
    return;
  },
  // update chart based on function type selection
  updateGraph: function(event){
    var text = this.$('.function-type').val();
    var initVal = satvalues[this.$('#init-sat-value').val()];
    var val = satvalues[this.$('.function-sat-value').val()];

    // Rerender chart canvas
    var data = this.constraintsObject.chartData;
    var context = $("#chart").get(0).getContext("2d");
    // // Show the chart if previously hidden
    // $('#chart').show();

    // Reset the dataset 2,3,4 and make everything solid line
    for (var i = 0; i < this.constraintsObject.chartData.datasets.length; i++){
      this.constraintsObject.chartData.datasets[i].borderDash = [];  
      this.constraintsObject.chartData.datasets[i].data = [];  
      this.constraintsObject.chartData.datasets[i].pointBackgroundColor = ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"];  
      this.constraintsObject.chartData.datasets[i].pointBorderColor = ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"];  
      this.constraintsObject.chartData.datasets[i].borderColor = "rgba(220,220,220,1)";
    }


    if(this.constraintsObject.chart != null)
      this.constraintsObject.chart.destroy();

    // If there is preexisting user-defined functions, clear it
    if ((text!= "UD") && (this.constraintsObject.currentUserIndex > 0))
      this.restartConstraint(null);

    
    // change chart based on function type
    if(text == "R"){
      this.constraintsObject.chartData.labels = ["0", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [initVal, initVal];
      this.constraintsObject.chartData.datasets[0].borderDash = [5, 5];
      this.constraintsObject.chartData.datasets[0].pointBackgroundColor[1] = "rgba(220,220,220,0)";
      this.constraintsObject.chartData.datasets[0].pointBorderColor[1] = "rgba(220,220,220,0)";



      
    }else if(text == "C"){
      this.constraintsObject.chartData.labels = ["0", "Infinity"];
      // If not unknown, just display one line
      if (initVal != satvalues["unknown"]){
        this.constraintsObject.chartData.datasets[0].data = [initVal, initVal];
      }
      // If it is, then display 5 dotted lines
      else {
        value_to_add = -2;
        for (var i = 0; i < 5; i++){
          this.constraintsObject.chartData.datasets[i].data = [value_to_add, value_to_add];
          this.constraintsObject.chartData.datasets[i].borderDash = [5, 5];
          this.constraintsObject.chartData.datasets[i].pointBackgroundColor[1] = "rgba(220,220,220,0)";
          this.constraintsObject.chartData.datasets[i].pointBorderColor[1] = "rgba(220,220,220,0)";
          value_to_add ++;
        }
      }

    }else if((text == "I") || (text == "D")){
      this.constraintsObject.chartData.labels = ["0", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [initVal, val];

    }else if(text == "RC"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [initVal, initVal];
      this.constraintsObject.chartData.datasets[0].borderDash = [5, 5];
      this.constraintsObject.chartData.datasets[0].pointBackgroundColor[1] = "rgba(220,220,220,0)";
      this.constraintsObject.chartData.datasets[0].pointBorderColor[1] = "rgba(220,220,220,0)";
      this.constraintsObject.chartData.datasets[1].data = [null, val, val];

    }else if(text == "CR"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [initVal, initVal, null];
      this.constraintsObject.chartData.datasets[1].data = [null, initVal, initVal];
      this.constraintsObject.chartData.datasets[1].borderDash = [5, 5];
      this.constraintsObject.chartData.datasets[1].pointBackgroundColor[2] = "rgba(220,220,220,0)";
      this.constraintsObject.chartData.datasets[1].pointBorderColor[2] = "rgba(220,220,220,0)";

    }else if(text == "SD"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [2, 2, null];
      this.constraintsObject.chartData.datasets[1].data = [null, -2, -2];

    }else if(text == "DS"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [-2, -2, null];
      this.constraintsObject.chartData.datasets[1].data = [null, 2, 2];

    }else if(text == "MP"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [initVal, val, val];



    }else if(text == "MN"){
      this.constraintsObject.chartData.labels = ["0", "A", "Infinity"];
      this.constraintsObject.chartData.datasets[0].data = [initVal, val, val];

    // render preview for user defined function types
    }else if(text == "UD"){
      this.updateGraphUserDefined(null);
      return
    // If text = none, just place a dot
    }else{
      this.constraintsObject.chartData.labels = ["0", "Infinity"];
      // display one dot
      this.constraintsObject.chartData.datasets[0].data = [initVal];
    }

    this.constraintsObject.chart = new Chart(context, {
      type: 'line',
      data: data,
      options: this.chartObject.chartOptions
    });
    this.updateCell(null);
  },

  // update chart for user defined constraints
  updateGraphUserDefined: function(cell){
    var context = $("#chart").get(0).getContext("2d");
    var func = $(".user-function-type").last().val();
    var index = this.constraintsObject.currentUserIndex;
    if(this.constraintsObject.chart != null)
      this.constraintsObject.chart.destroy();

    // If unknown is selected
    if($(".user-sat-value").last().val() == 'unknown'){
      $(".user-sat-value").last().prop('disabled', 'disabled');
      $(".user-sat-value").last().css("background-color","grey");
    }
    else {
      $(".user-function-type").last().prop('disabled', ''); 
      $(".user-function-type").last().css("background-color",'');
    }

    // save values in user defined functions
    this.constraintsObject.userFunctions[index] = func;
    this.constraintsObject.userValues[index] = $(".user-sat-value").last().val();

    // Clone chart template
    // var data = jQuery.extend(true, {}, this.chartObject.primaryChart);
    var data = this.constraintsObject.chartData;
    var datasetsTemplatePrimary = jQuery.extend(true, {}, data.datasets[0]);
    var datasetsTemplateSecondary = jQuery.extend(true, {}, this.chartObject.secondaryChart.datasets[0]);

    // Setting up the labels
    data.labels = this.constraintsObject.beginLetter.slice(0);
    data.labels.push(this.constraintsObject.endLetter[this.constraintsObject.endLetter.length - 1]);

    // Setting repeating variables
    var repeat = this.repeatOptionsDisplay;
    var repeatBegin = this.constraintsObject.repeatBegin;
    var repeatEnd = this.constraintsObject.repeatEnd;

    // Reset the dataset 
    for (var i = 0; i < data.datasets.length; i++){
      data.datasets[i].borderDash = [];  
      data.datasets[i].data = [];
      data.datasets[i].borderColor = "rgba(220,220,220,1)";
    }

    // Add datapoints to graph for each userfunction/uservalue pair
    previousDatasetIndex = -1;
    currentDatasetIndex = 0;

    for (var i = 0; i < this.constraintsObject.userFunctions.length; i++){
      if (currentDatasetIndex >= data.datasets.length){
        data.datasets.push({
          label: "Source",
          fill: false,
          borderColor: "rgba(220,220,220,1)",
          pointRadius: 4,
          lineTension: 0,
          data: []
        });
      }

      previousDataset = data.datasets[previousDatasetIndex];
      currentDataset = data.datasets[currentDatasetIndex];
      currentFunc = this.constraintsObject.userFunctions[i];
      previousFunc = this.constraintsObject.userFunctions[i - 1];
      currentVal = this.constraintsObject.userValues[i];
      currentVal = currentVal == "unknown" ? 0 : satvalues[currentVal];
      previousVal = this.constraintsObject.userValues[i - 1];

      // First we need to find out how many nulls do we need
      var numNulls = []
      if (currentDatasetIndex != 0){
        for (var j = 0; j < previousDataset.data.length - 1; j++){
          numNulls.push(null);
        } 
      }

      // Add datapoint to dataset according to which function
      if (currentFunc == 'I' || currentFunc == 'D'){
        // If previous function is stochastic, set the starting point to be either FD or FS
        if ((previousFunc == 'R' || (previousFunc == 'C' && previousVal == 'unknown')) && currentFunc == 'I'){
          firstVal = satvalues['denied'];
        }
        else if ((previousFunc == 'R' || (previousFunc == 'C' && previousVal == 'unknown')) && currentFunc == 'D'){
          firstVal = satvalues['satisfied'];
        }
        else if (currentDatasetIndex != 0){
          // Use the last value of the previous dataset as the current dataset's first value
          firstVal = previousDataset.data[previousDataset.data.length - 1];
        }
        else {
          firstVal = satvalues[this.$('#init-sat-value').val()];
        }
        currentDataset.data = numNulls.concat([firstVal, currentVal]);
  
      }
      else if (currentFunc == 'C'){
        if (this.constraintsObject.userValues[i] != 'unknown'){
          currentDataset.data = numNulls.concat([currentVal, currentVal]);
        }
        // If it is unknown
        else {
          // Then we need 4 datasets in addition to the currentDataset
          // And we add datapoints into each dataset starting from FD
          var value_to_add = -2;
          for (var k = currentDatasetIndex; k < currentDatasetIndex + 5; k ++){
            // Make sure we have enough dataset availabe. If not add some
            if (k >= data.datasets.length){
              data.datasets.push({
                label: "Source",
                fill: false,
                borderColor: "rgba(220,220,220,1)",
                pointRadius: 4,
                lineTension: 0,
                data: []
              });
            }
            currentSubset = data.datasets[k];
            currentSubset.data = numNulls.concat([value_to_add, value_to_add]);

            // Update the style
            currentSubset.borderDash = [5, 5]
            currentSubset.pointBackgroundColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,0)"]);
            currentSubset.pointBorderColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,0)"]);
            if (this.inRepeatRange(repeat, repeatBegin, repeatEnd, currentSubset.data)){
              currentSubset.borderColor = "rgba(255, 110, 80, 1)";
            }
            value_to_add ++;
          }
        }

      }
      else if (currentFunc == 'R'){
         currentDataset.data = numNulls.concat([currentVal, currentVal]);
      }


      // Update the style of current dataset and advance indices
      // I, D and non unknown C function share the same style
      if (currentFunc == 'C' && this.constraintsObject.userValues[i] == 'unknown'){
        previousDatasetIndex += 5;
        currentDatasetIndex += 5;
      }
      else if (currentFunc == 'R'){
        currentDataset.borderDash = [5, 5]
        currentDataset.pointBackgroundColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,0)"]);
        currentDataset.pointBorderColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,0)"]);
        if (this.inRepeatRange(repeat, repeatBegin, repeatEnd, currentDataset.data)){
          currentDataset.borderColor = "rgba(255, 110, 80, 1)";
        }
        previousDatasetIndex ++;
        currentDatasetIndex ++;  
      }
      else {
        // If previous function is stochastic, or constant unknown, hide the first dot
        if (previousFunc == 'R' || (previousFunc == 'C' && previousVal == 'unknown')){
          currentDataset.pointBackgroundColor = numNulls.concat(["rgba(220,220,220,0)", "rgba(220,220,220,1)"])
          currentDataset.pointBorderColor = numNulls.concat(["rgba(220,220,220,0)", "rgba(220,220,220,1)"]);
        }
        // Else, both points should be solid
        else {
          currentDataset.pointBackgroundColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,1)"])
          currentDataset.pointBorderColor = numNulls.concat(["rgba(220,220,220,1)", "rgba(220,220,220,1)"]);
        }
        // If currentDataset is in repeat range, set red
        if (this.inRepeatRange(repeat, repeatBegin, repeatEnd, currentDataset.data)){
          currentDataset.borderColor = "rgba(255, 110, 80, 1)";
        }
        previousDatasetIndex ++;
        currentDatasetIndex ++;  

      }

    }


    // data.datasets[0].data = data.datasets[0].data.concat(this.constraintsObject.userValues);
    this.constraintsObject.chart = new Chart(context, {
      type: 'line',
      data: data,
      options: this.chartObject.chartOptions
    });

    this.updateCell(null);
  },

  // Given a data, check if it is in repeat range
  // Return boolean
  inRepeatRange: function(repeat, repeatBegin, repeatEnd, data){
    // If the repeat mode isnt on, return false
    if (!repeat || repeatBegin === undefined || repeatBegin === null || repeatEnd === undefined || repeatEnd === null){
      return false;
    }
    else {
      // Convert letter to index
      var repeatBegin = repeatBegin == '0'? 0 : repeatBegin.charCodeAt(0) - 65 + 1;
      var repeatEnd = repeatEnd.charCodeAt(0) - 65 + 1;
      // Find the index of start point and end point of data
      var dataBegin = data.length - 2;
      var dataEnd = data.length - 1;
      if (dataBegin >= repeatBegin && dataEnd <= repeatEnd){
        return true;
      }
    }

    return false;
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
      cell.attr(".satvalue/text", "(FS, T)");
    }else if(value == "partiallysatisfied") {
      cell.attr(".satvalue/text", "(PS, T)");
    }else if (value == "denied"){
      cell.attr(".satvalue/text", "(T, FD)");
    }else if (value == "partiallydenied") {
      cell.attr(".satvalue/text", "(T, PD)");
    }else if (value == "unknown") {
          cell.attr(".satvalue/text", "?");
    }else {
      // cell.removeAttr(".satvalue/text");
    }
  },
    
  clear: function(){
    this.$el.html('');
  }
}
);


