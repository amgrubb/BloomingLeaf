//Class for the element properties tab that appears when an element is clicked
var ENTER_KEY = 13;
var alphaOnly = /[A-Z]/;

// All valid initial value and function combination
var validPair = {
    "none": {
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied", "(no value)"],
        "defaultValue": ["none"]
    },
    "C":{
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied", "unknown"],
        "defaultValue": ["none"]
    },
    "R":{
        "validInitValue": ["none", "satisfied", "partiallysatisfied", "denied", "partiallydenied", "(no value)"],
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
Updating variables and render preexisting values often uses the same functions.
Functions like updateChart, and updateCell are always called whenever changes are made
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
                '<option value="(no value)"> (no value) </option>',
                '<option value=none> None (⊥, ⊥)</option>',
				'<option value=satisfied> Satisfied (F, ⊥)</option>',
                '<option value=partiallysatisfied> Partially Satisfied (P, ⊥) </option>',
                '<option value=partiallydenied> Partially Denied (⊥, P)</option>',
                '<option value=denied> Denied (⊥, F)</option>',
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
                '<select id="markedValue" class="function-sat-value">',
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
                                '<option value=none selected> None (⊥, ⊥) </option>',
                                '<option value=satisfied> Satisfied (F, ⊥) </option>',
                                '<option value=partiallysatisfied> Partially Satisfied (P, ⊥) </option>',
                                '<option value=partiallydenied> Partially Denied (⊥, P)</option>',
                                '<option value=denied> Denied (⊥, F)</option>',
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
                    '<label style="float:left; font-size:0.8em;" id="repeat-begin2" class="repeat-select2">Repeat counts</label>',
                    '<input style="float:right;"class="repeat-select2" id="repeat-end2" type="number" value="2">',
                    '<label style="float:left; font-size:0.8em;" id="repeat-begin3" class="repeat-select3">Absolute Length</label>',
                    '<input style="float:right;"class="repeat-select3" id="repeat-end3" type="number" value="0">',
                    '<p id="noteRepeat" style="text-align:left; float:left; color:red; font-size:0.7em;">Note: Leave Absolute Length as 0 for unknown length. If Absolute Length is less than 0 or Repeat Count is less than 2, they will be set to 0 or 2 respectively.</p>',
            // change to blue or change color to green
                    '<button style="margin-top:10px;" id="constraint-add" class="inspector-btn small-btn green-btn">Add</button>',
                    '<button id="constraint-repeat" class="inspector-btn small-btn blue-btn">Set Repeats</button>',
                    '<button id="constraint-restart" class="inspector-btn small-btn red-btn">Clear</button>',
                '</div>',
            '</div>',
            '<br>',
            '<canvas id="chart" width="240" height="240"></canvas>',

    ].join(''),

    events: {
        'change #init-sat-value':'initSatValueChanged',

        'change .function-type':'funcTypeChanged',
        'change .function-sat-value':'funcSatValChanged',

        'change .user-function-type':'userFuncTypeChanged',
        'change .user-sat-value':'userSatValChanged',
        'change .repeat-select':'selectRepeatValues',
        'change .repeat-select2':'selectNumRepeatValues',
        'change .repeat-select3':'selectAbsoluteLength',

        'click #constraint-add': 'addConstraint',
        'click #constraint-repeat': 'repeatConstraintControl',
        'click #constraint-restart': 'removeUserConstraints',
        'keyup .cell-attrs-text': 'nameAction'
    },

    /**
     * Initializes the element inspector using previously defined templates
     */
    render: function(cell) {

        this.cell = cell; // Save the clicked node's backbone model

        // Save the UserIntention object from the global model variable to
        // this.intention
        this.intention = model.getUserIntentionByID(this.cell.attributes.nodeID);

        this.$el.html(_.template(this.template)());

        // Attributes
        this.chart = new ChartObj();
        this.constraintsObject = new constraintsObject();

        // Genernate all available selection options based on selected function type
        this.satValueOptions = this.initializeSatValueOptions();

        // Save html template to dynamically render more
        this.userConstraintsHTML = $("#new-user-constraints").last().clone();

        // Load initial value and node name
        this.$('.cell-attrs-text').val(this.intention.nodeName);
        this.$('#init-sat-value').val(satisfactionValuesDict[this.intention.getInitialSatValue()].name);
        this.checkInitialSatValue();

        if (!cell.attr(".satvalue/value") && cell.attr(".funcvalue/text") != "NB"){
            cell.attr(".satvalue/value", 'none');
            cell.attr(".funcvalue/text", ' ');
        }

        // Turn off repeating by default
        this.repeatOptionsDisplay = false;
        // TODO what does this do?
        this.setRepeatConstraintMode("TurnOff");

        // Load initial value for function type in the html select element
        var functionType = this.intention.dynamicFunction.stringDynVis;
        if ((functionType == '') || (functionType == ' ') || (functionType == 'NB')) {
            this.$('.function-type').val('none');
            this.updateHTML(null);
        } else if (functionType != 'UD') {
            this.$('.function-type').val(functionType);
            this.updateHTML(null);
        } else {
            // loading user defined constraint
            this.$('.function-type').val(functionType);
            this.renderUserDefined(cell);
        }

    },

    /**
     * Checks the initial satisfaction value for a (no value).
     * If the initial satisfaction value is (no value), then set the
     * availible function options to be No Function, Stochastic and UserDefined
     * If not, set the function options so that all options are availible
     */
    checkInitialSatValue() {
        if (this.intention.getInitialSatValue() == '(no value)') {
            // remove current options, add 3 options
            this.$('.function-type').empty();
            this.$('.function-type').append('<option value=none> No Function </option>');
            this.$('.function-type').append('<option value=R> Stochastic </option>');
            this.$('.function-type').append('<option value=UD> User Defined </option>');
        } else {
            this.$('.function-type').empty();
            this.$('.function-type').append('<option value=none> No Function </option>');
            this.$('.function-type').append('<option value=C> Constant </option>');
            this.$('.function-type').append('<option value=R> Stochastic </option>');
            this.$('.function-type').append('<option value=I> Increase </option>');
            this.$('.function-type').append('<option value=D> Decrease </option>');
            this.$('.function-type').append('<option value=RC> Stochastic-Constant </option>');
            this.$('.function-type').append('<option value=CR> Constant-Stochastic </option>');
            this.$('.function-type').append('<option value=MP> Montonic Positive </option>');
            this.$('.function-type').append('<option value=MN> Montonic Negative </option>');
            this.$('.function-type').append('<option value=SD> Satisfied Denied </option>');
            this.$('.function-type').append('<option value=DS> Denied Satisfied </option>');
            this.$('.function-type').append('<option value=UD> User Defined </option>');
        }
    },

    nameAction: function(event) {
      if (event.which === ENTER_KEY) {
          event.preventDefault();
      }

      var text = this.$('.cell-attrs-text').val();

      text = text.replace(/[^\w\n-]/g, ' ');

      this.cell.attr({'.name': {text: text} });
      this.intention.nodeName = text;
    },

    /**
     * Returns an object used for providing option tags for valid satisfaction values for
     * functions.
     *
     * @returns {Object}
     */
    initializeSatValueOptions: function() {
        var satValueOptions = {};

        var none = '<option value=none selected> None (⊥, ⊥) </option>';
        var satisfied = '<option value=satisfied> Satisfied (F, ⊥) </option>';
        var partiallysatisfied = '<option value=partiallysatisfied> Partially Satisfied (P, ⊥) </option>';
        var partiallydenied = '<option value=partiallydenied> Partially Denied (⊥, P) </option>';
        var denied = '<option value=denied> Denied (⊥, F) </option>';
        var unknown = '<option value=unknown> Unknown </option>';
        satValueOptions.all = none + satisfied + partiallysatisfied + partiallydenied + denied + unknown;
        satValueOptions.noRandom = satisfied + partiallysatisfied + partiallydenied + denied;

        /**TODO
         * Returns
         */
        satValueOptions.positiveOnly = function(currentVal){
            currentVal = satvalues[currentVal];
            result = '';
            for (var i = satvalues['satisfied'] ; i >= currentVal + 1 ; i--){
                // Find text by value eg. given i = -1, we want to find partiallydenied as satvalues[partiallydenied] = -1
                var text = satvalues[i];
                result += eval(text);
            }
            return result;
        };

        /**TODO
         * Returns
         */
        satValueOptions.negativeOnly = function(currentVal){
            currentVal = satvalues[currentVal];
            result = '';
            for (var i = currentVal - 1; i >= satvalues['denied']; i--){
                // Find text by value eg. given i = -1, we want to find partiallydenied as satvalues[partiallydenied] = -1
                var text = satvalues[i];
                result += eval(text);
            }
            return result;
        };

        return satValueOptions;
    },


    /**
     * Initializes components to display user defined functions
     */
    renderUserDefined: function(cell){
        this.$('#markedValue').hide();

        // Load the user defined constraints
        var len = this.intention.getNumOfFuncSegements();
        var funcSegments = this.intention.dynamicFunction.getFuncSegmentIterable();


        for (var i = 0; i < len; i++) {

            // set the intial values
            $(".user-sat-value").last().val(satisfactionValuesDict[funcSegments[i].funcX].name);
            $(".user-function-type").last().val(funcSegments[i].funcType);

            if (i !== len - 1) {
                // if it is not the last function segment, clone the select tags,
                // and grey out the current select tags
                var html = this.userConstraintsHTML.clone();
                $(".user-sat-value").last().prop('disabled', true);
                $(".user-sat-value").last().css("background-color",'grey');
                $(".user-function-type").last().prop('disabled', true);
                $(".user-function-type").last().css("background-color", 'grey');
                html.appendTo(this.$('#all-user-constraints'));
            }
        }

        if (this.intention.dynamicFunction.hasRepeat()) {
            var repBegin = this.intention.dynamicFunction.getStartRepeatEpoch();
            var repEnd = this.intention.dynamicFunction.getEndRepeatEpoch();
            var repNum = this.intention.dynamicFunction.getRepeatRepNum();
            var absTime = this.intention.dynamicFunction.getRepeatAbsTime();

            this.repeatOptionsDisplay = true;

            this.setRepeatConstraintMode("TurnOn");
            this.setRepeatConstraintMode("Update");

            $("#repeat-begin").val(repBegin);
            $("#repeat-end").val(repEnd);
            $("#repeat-end2").val(repNum);
            $("#repeat-end3").val(absTime);
        }

        this.updateChartUserDefined(null);
    },

    /**
     * Saves the initial satisfaction value into the IntentionEvaluation
     * corresponding to this intention.
     *
     * This function is called on change for #init-sat-value,
     */
    initSatValueChanged: function(event) {
        var initValue = this.$('#init-sat-value').val();
        this.intention.changeInitialSatValue(satValueDict[initValue]);
        this.checkInitialSatValue();
        this.updateCell(null);
        this.updateHTML(event);
    },

    /**
     * Clears all FuncSegments for this intention's UserIntention object's
     * EvolvingFunction and adds new FuncSegments according to the current
     * function type.
     *
     * This function is called on change for .function-type.
     */
    funcTypeChanged: function(event) {
        var funcType = this.$('.function-type').val();
        this.intention.setEvolvingFunction(funcType);
        this.updateCell(null);
        this.updateHTML(event);
    },

    /**
     * Updates the FuncSegment for this intention's UserIntention object's
     * with the correct marked value and function type
     * This function is called on change for .user-function-type
     */
    userFuncTypeChanged: function(event) {
        var funcType = this.$('.user-function-type').last().val();
        this.intention.setUserDefinedSegment(funcType);
        this.updateHTML(event);
    },

    /**
     * This function is called on change for .user-sat-value
     */
    userSatValChanged: function(event) {
        var satVal = satValueDict[this.$('.user-sat-value').last().val()];
        this.intention.updateLastFuncSegSatVal(satVal);
        this.updateChartUserDefined(event);
    },

    /**
     * Sets the marked value
     */
    funcSatValChanged: function(event) {
        var satValue = satValueDict[this.$('#markedValue').val()]; // 4 digit representation
        this.intention.setMarkedValueToFunction(satValue);

        this.updateChart(event);
    },

    /**
     * Updates the possible satisfaction values and buttons selections based on current
     * function type.
     *
     * This function is called on change for .user-function-type
     */
    updateHTML: function(event) {

        // Check if selected init sat value and functionType pair is illegal
        this.validityCheck(event);

        var functionType = this.$('.function-type').val();
        var initValue = this.$('#init-sat-value').val();

        // All functions that have satisfaction valuen associated with it
        var funcWithSatValue = ["I", "D", "RC", "MP", "MN", "UD"];

        // Disable init value menu if functype is NB
        if (this.cell.attr('.funcvalue/text') == "NB") {
            $('#init-sat-value').prop('disabled', true);
        }

        if (functionType == 'UD') {
            // User defined function
            this.$('#markedValue').hide();
            this.$('#user-constraints').show("fast");
            this.addUDFunctionValues(null);
        } else {
            this.$('#user-constraints').hide();
            $('#init-sat-value').prop('disabled', false);

            if (funcWithSatValue.includes(functionType)) {
                // Function with an associated satisfaction value
                this.displayFunctionSatValue(null);
            } else {
                // Function without an associated satisfaction value
                this.$('#markedValue').hide();
            }
        }
        this.updateChart(null);
    },

    /**
     * Checks the validity of the initial satisfaction value function type
     * pair. If illegal, this function changes either the initial satisfaction
     * value or the function type accordingly.
     */
    validityCheck: function(event) {
        var functionType = this.$('.function-type').val();
        var initValue = this.$('#init-sat-value').val();

        // If an element gets clicked, don't bother checking
        if (event == null) {
            return;
        }

        // Check what triggered the validty check
        // Either init value changed, func type changed or simply an element gets clicked
        var initValueChanged = event.target.id == 'init-sat-value';
        var funcTypeChanged = event.target.className == 'function-type';

        // Perform check
        // If not UD, just do a regular check
        if (functionType != "UD") {
            // If not valid, 2 possible actions:
            // change to default init value if functTypeChanged
            // change to none function if initValueChanged
            if ($.inArray(initValue, validPair[functionType]['validInitValue']) == -1) {
                if (initValueChanged && initValue != "unknown"){this.$('.function-type').val('none');}
                if (initValueChanged && initValue == "unknown"){this.$('.function-type').val('C');}
                var newValue = validPair[functionType]['defaultValue'];
                if (funcTypeChanged){this.$('#init-sat-value').val(newValue);}

            }
        }
    },

    /**
     * Displays the select element (#function-type) for the function type for the current cell.
     * If the function type has an associated satisfaction value, displays another
     * select element (#markedValue) for the associated satisfaction value.
     */
    displayFunctionSatValue: function(event) {
        var functionType = this.$('.function-type').val();
        var initValue = this.$('#init-sat-value').val();
        var markedValue = this.intention.dynamicFunction.getLastMarkedVal();
        this.$('#markedValue').show("fast");
        if (functionType == 'RC') {
            this.$('#markedValue').html(this.satValueOptions.noRandom);
        } else if (functionType == 'I' || functionType == 'MP') {
            this.$('#markedValue').html(this.satValueOptions.positiveOnly(initValue));
        } else if (functionType == 'D' || functionType == 'MN') {
            this.$('#markedValue').html(this.satValueOptions.negativeOnly(initValue));
        }

        if (markedValue) {
            var value = satisfactionValuesDict[markedValue].name;
            this.$('#markedValue').val(value);
        }

        return;
    },

    /**
     * Adds appropriate satisfaction values option tags
     * for .user-sat-value, which is the select tag used to
     * indicate satisfaction values when creating a user defined function.
     */
    addUDFunctionValues: function(event) {
        var func = $(".user-function-type").last().val();
        var index = this.constraintsObject.currentUserIndex;

        // If initially disabled, enable it for now
        if ($('.user-sat-value').last().prop('disabled')) {
            $('.user-sat-value').last().prop('disabled', false);
            $('.user-sat-value').last().css('background-color','');
        }

        // Load available satisfaction values for user defined constraint type
        switch (func) {
            case "I":
                // May get last value of the graph in the future
                $(".user-sat-value").last().html(this.satValueOptions.positiveOnly('partiallysatisfied'));
                $(".user-sat-value").last().val("satisfied");
                break;

            case "D":
                $(".user-sat-value").last().html(this.satValueOptions.negativeOnly('partiallydenied'));
                $(".user-sat-value").last().val("denied");
                break;

            case "R":
                $(".user-sat-value").last().html(this.satValueOptions.all);
                $(".user-sat-value").last().val("unknown")
                $(".user-sat-value").last().prop('disabled', true);
                $(".user-sat-value").last().css("background-color",'grey');
                break;

            case "C":
                $(".user-sat-value").last().html(this.satValueOptions.all);
                // Restrict input if it is the first constraint
                if (index == 0) {
                    $(".user-sat-value").last().val(this.$('#init-sat-value').val())
                    $(".user-sat-value").last().prop('disabled', true);
                    $(".user-sat-value").last().css("background-color","grey");
                }
                break;
            default:
                break;
        }
        return;
    },

    /**
     * Modifies the passed in datasets with their default values
     * @param {Array.<Object>}
     */
    resetChartDatasets: function(datasets) {

        for (var i = 0; i < datasets.length; i++) {
            datasets[i].borderDash = [];
            datasets[i].data = [];
            datasets[i].pointBackgroundColor = ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"];
            datasets[i].pointBorderColor = ["rgba(220,220,220,1)", "rgba(220,220,220,1)", "rgba(220,220,220,1)"];
            datasets[i].borderColor = "rgba(220,220,220,1)";
        }
    },

    /**
     * Updates the chart to represent data related to the the current function and
     * satisfaction value(s)
     */
    updateChart: function(event) {
        var funcType = this.intention.dynamicFunction.stringDynVis;
        var initVal = satisfactionValuesDict[this.intention.getInitialSatValue()].chartVal;
        var satVal = satvalues[this.$('#markedValue').val()];
        this.chart.reset();
        // Get the chart canvas
        var context = $("#chart").get(0).getContext("2d");

        // Render preview for user defined function types
        if (funcType == "UD") {
            this.updateChartUserDefined(null);
            return;
        }


        // Change chart dataset(s), depending on the function type
        var threeLabelFunc = ['RC', 'CR', 'SD', 'DS', 'MP', 'MN'];

        if (threeLabelFunc.includes(funcType)) {
            this.chart.labels = ['0', 'A', 'Infinity'];

            if (funcType === 'RC') {
                this.chart.addDataSet(0, [initVal, initVal], true);
                this.chart.addDataSet(1, [satVal, satVal], false);
            } else if (funcType === 'CR') {
                this.chart.addDataSet(0, [initVal, initVal], false);
                this.chart.addDataSet(1, [initVal, initVal], true);
            } else if (funcType === 'SD') {
                this.chart.addDataSet(0, [2, 2], false);
                this.chart.addDataSet(1, [-2, -2], false);
            } else if (funcType === 'DS') {
                this.chart.addDataSet(0, [-2, -2], false);
                this.chart.addDataSet(1, [2, 2], false);
            } else if (funcType === 'MP' || funcType === 'MN') {
                this.chart.addDataSet(0, [initVal, satVal, satVal]);
            }
        } else {
            this.chart.labels = ['0', 'Infinity'];

            if (funcType === 'C') {
                this.chart.addDataSet(0, [initVal, initVal], false);
            } else if (funcType === 'R') {
                this.chart.addDataSet(0, [initVal, initVal], true);
            } else if (funcType === 'I' || funcType === 'D') {
                this.chart.addDataSet(0, [initVal, satVal], false);
            } else {
                // display a dot
                this.chart.addDataSet(0, [initVal], false);
            }
        }

        this.chart.display(context);
    },

    getUDChartLabel: function(num) {
        var res = ['0'];
        var curr = 'A'
        for (var i = 0; i < num; i++) {
            res.push(curr);
            curr = String.fromCharCode(curr.charCodeAt(0) + 1);
        }
        return res;
    },

    /**
     * Updates the chart to represent data related to the the current user
     * defined function and satisfaction value(s)
     */
    updateChartUserDefined: function(event) {
        var context = $("#chart").get(0).getContext("2d");
        var numFuncSegments = this.intention.getNumOfFuncSegements();

        // Reset chart datasets
        this.chart.reset();

        // Setting up the labels
        this.chart.labels = this.getUDChartLabel(numFuncSegments);



        // Get init sat value
        var initSatVal = satisfactionValuesDict[this.intention.getInitialSatValue()].chartVal;

        // Add datapoints to graph for each userfunction/uservalue pair
        var funcSegments = this.intention.dynamicFunction.getFuncSegmentIterable();

        for (var i = 0; i < funcSegments.length; i++) {
            var currFunc = funcSegments[i].funcType;
            var coloured = funcSegments[i].isRepeat;
            var data1; // first data point for this segment
            var data2 = satisfactionValuesDict[funcSegments[i].funcX].chartVal;
            if (i === 0) {
                if (currFunc !== 'R') {
                    data1 = initSatVal;
                } else {
                    data1 = 0;
                }
            } else {
                // If previous function is stochastic, set the starting point to be either FD or FS
                var prevFunc = funcSegments[i - 1].funcType;
                var prefVal = funcSegments[i - 1].funcX;
                if (prevFunc === 'R' && currFunc === 'I') {
                    data1 = -2;
                } else if (prevFunc === 'R' && currFunc === 'D') {
                    data1 = 2;
                } else if (currFunc === 'C'){
                    data1 = data2;
                } else {
                    // set to previous function's marked value
                    data1 = satisfactionValuesDict[prefVal].chartVal;
                }
            }
            this.chart.addDataSet(i, [data1, data2], currFunc === 'R', coloured);
        }

        this.chart.display(context);
    },

    /**
     * Adds new constraint for the user defined function.
     * This function is called on click for #constraint-add.
     * This function is also called when loading user defined
     * constraints from previously stored.
     */
    addConstraint: function(event) {

        // update html display for additional user inputs
        var html = this.userConstraintsHTML.clone();

        this.intention.addUserDefinedSeg("C", "0000");

        $(".user-sat-value").last().prop('disabled', true);
        $(".user-sat-value").last().css("background-color",'grey');
        $(".user-function-type").last().prop('disabled', true);
        $(".user-function-type").last().css("background-color", 'grey');

        html.appendTo(this.$('#all-user-constraints'));


        if (this.repeatOptionsDisplay) {
            this.setRepeatConstraintMode("Update");
        }

        this.updateChartUserDefined(null);

    },


    /**
     * Toggles the display for the user defined function's
     * repeat feature.
     * This function is called on click for #constraint-repeat.
     */
    repeatConstraintControl: function(e){
        if (!this.repeatOptionsDisplay){
            this.setRepeatConstraintMode("TurnOn");
            this.setRepeatConstraintMode("Update");
        } else if (this.repeatOptionsDisplay){
            this.setRepeatConstraintMode("TurnOff");
            this.intention.dynamicFunction.removeRepFuncSegments();
            this.updateChartUserDefined(null);
        }
    },

    /**
     * Handles the changes done for the select elements for the
     * repeat feature for user defined functions, by ensuring that
     * the begin and end range of repeated constraints are valid.
     * This function is called on change for .repeat-select
     * (the select elements for repeat begin and end)
     */
    selectRepeatValues: function(event){
        var begin = $("#repeat-begin").val();
        var end = $("#repeat-end").val();

        if (begin === null || end === null) {
            return;
        }

        var nextChar = String.fromCharCode(begin.charCodeAt(0) + 1);

        if (begin >= end) {
            $("#repeat-error").text("Repeated range must be chronological");
            $("#repeat-error").show("fast");
            this.constraintsObject.repeatBegin = null;
            this.constraintsObject.repeatEnd = null;

        } else if (nextChar == end) {
            $("#repeat-error").text("Repeated range must be at least two apart");
            $("#repeat-error").show("fast");
            this.constraintsObject.repeatBegin = null;
            this.constraintsObject.repeatEnd = null;

        } else {

            $("#repeat-error").hide();
            this.intention.dynamicFunction.setRepeatingFunction(begin, end);
            this.constraintsObject.repeatBegin = begin;
            this.constraintsObject.repeatEnd = end;
        }
        this.updateChartUserDefined(null);

    },

    /**
     * Ensures that the number of repeat counts is a valid number,
     * updates the constraintsObject with the new repeat count and
     * updates the chart in case there are constraint lines that need
     * to be coloured red.
     *
     * This function is called on change for #repeat-end2.
     */
    selectNumRepeatValues: function(event){
        var repVal = $("#repeat-end2").val();
        if (repVal < 2) {
            $('#repeat-end2').val(2);
        }
        this.intention.dynamicFunction.setRepNum(repVal);
        this.constraintsObject.repeat_count = repVal;
        this.updateChartUserDefined(null);
    },

    /**
     * Ensures that the absolute length is a non negative number and
     * updates the constraintsObject to have the new absolute length.
     *
     * This function is called on change for #repeat-end3.
     */
    selectAbsoluteLength: function(event){
        var absLength = $("#repeat-end3").val();
        if (absLength < 0) {
            $('#repeat-end3').val(0);
        }
        this.intention.dynamicFunction.setAbsoluteTime(absLength);
        this.constraintsObject.absoluteLength = absLength;
        this.updateChartUserDefined(null);
    },

    /**
     * Sets the mode for the user defined function's repeat feature.
     * Depending on the mode, this function controls the display
     * for repeat related elements and values.
     *
     * @param {String} mode
     */
    setRepeatConstraintMode: function(mode) {

        // Reset options for select everytime repeat is clicked
        $("#repeat-begin").html('<option class="select-placeholder" selected disabled value="">Begin</option>');
        $("#repeat-end").html('<option class="select-placeholder" selected disabled value="">End</option>');

        // Turn on all repeat related display and values
        if (mode == "TurnOn") {
            $("#repeat-begin").show("fast");
            $("#repeat-end").show("fast");
            $("#repeat-begin2").show("fast");
            $("#repeat-end2").show("fast");
            $("#repeat-begin3").show("fast");
            $("#repeat-end3").show("fast");
            $("#noteRepeat").show("fast");
            $("#constraint-repeat").text("Clear Repeats");
            this.repeatOptionsDisplay = true;

        // Turn off all repeat related display and values
        } else if (mode == "TurnOff") {
            $("#repeat-begin").hide();
            $("#repeat-end").hide();
            $("#constraint-repeat").text("Set Repeats");
            $("#repeat-error").hide();
            $("#repeat-begin2").hide();
            $("#repeat-end2").hide();
            $("#repeat-begin3").hide();
            $("#repeat-end3").hide();
            $("#noteRepeat").hide();
            this.repeatOptionsDisplay = false;

        // Update all repeat related display and values
        } else if (mode == "Update") {

            // Cannot repeat with only one constraint
            var numSegments = this.intention.getNumOfFuncSegements().length;
            if (numSegments < 2) {

                $("#repeat-error").text("More constraints are needed");
                $("#repeat-error").show("fast");
                $("#repeat-begin").prop('disabled', 'disabled');
                $("#repeat-begin").css("background-color","grey");
                $("#repeat-end").prop('disabled', 'disabled');
                $("#repeat-end").css("background-color","grey");

            // Update HTML
            } else {

                if ($("#repeat-begin").prop('disabled')) {
                    $("#repeat-error").hide();
                    $("#repeat-begin").prop('disabled', '');
                    $("#repeat-begin").css("background-color","");
                    $("#repeat-end").prop('disabled', '');
                    $("#repeat-end").css("background-color","");
                }

                var funcSegments = this.intention.dynamicFunction.getFuncSegmentIterable();

                // Set select options
                for (var i = 0; i < funcSegments.length - 1; i++) {
                    var beginVal = funcSegments[i].funcStart;
                    var endVal = funcSegments[i + 1].funcStop;

                    $("#repeat-begin").append(
                        $('<option></option>').val(beginVal).html(beginVal)
                    );
                    $("#repeat-end").append(
                        $('<option></option>').val(endVal).html(endVal)
                    );
                }
                var repNum = this.intention.dynamicFunction.getRepeatRepNum();
                var absTime = this.intention.dynamicFunction.getRepeatAbsTime;
                $("repeat-end2").val(repNum);
                $("repeat-end3").val(absTime);
            }
        }
    },

    // Reset user-define chart to default
    /**
     * Removes all user constraints for user defined functions
     * This function is called on click for #constraint-restart (red Clear button).
     */
    removeUserConstraints: function(e){
        $('#init-sat-value').prop('disabled', '');
        $('#init-sat-value').css("background-color","");

        this.constraintsObject.repeat_count = $("repeat-end2").val();
        this.constraintsObject.absoluteLength = $("repeat-end3").val();
        this.constraintsObject.beginLetter = ["0"];
        this.constraintsObject.endLetter = ["A"];
        this.constraintsObject.currentUserIndex = 0;
        this.constraintsObject.userFunctions = ["C"];
        this.constraintsObject.userValues = [$('#init-sat-value').val()];
        var html = this.userConstraintsHTML.clone();
        this.$('#all-user-constraints').html('');
        html.appendTo(this.$('#all-user-constraints'));

        if (this.repeatOptionsDisplay) {
            this.setRepeatConstraintMode("TurnOff");
        }

        this.funcTypeChanged(null);
    },

    /**
     * Makes corresponding changes for the cell attributes, according to the values in the
     * inspector. This function is always called alongside with updateChart
     * and updateChartUserDefined.
     */
    updateCell: function(event) {
        var funcType = this.intention.dynamicFunction.stringDynVis;
        var initSatVal = this.intention.getInitialSatValue();

        this.cell.attr(".funcvalue/text", funcType);
        this.cell.attr('.satvalue/text', satisfactionValuesDict[initSatVal].satValue);
    },

    clear: function(){
        this.$el.html('');
    }
}
);
