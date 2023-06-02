// All valid initial value and function combination
var validPair = {
    "NT": {
        "validInitValue": ["0000", "0011", "0010", "1100", "0100", "(no value)"],
        "defaultValue": ["0000"]
    },
    "C": {
        "validInitValue": ["0000", "0011", "0010", "1100", "0100", "(no value)"],
        "defaultValue": ["0000"]
    },
    "R": {
        "validInitValue": ["0000", "0011", "0010", "1100", "0100", "(no value)"],
        // Default value changed to (no value)
        "defaultValue": ["(no value)"]
    },
    "I": {
        "validInitValue": ["0000", "0011", "0010", "1100", "0100"],
        "defaultValue": ["1100"]
    },
    "D": {
        "validInitValue": ["0000", "0011", "0010", "1100", "0100"],
        "defaultValue": ["0011"]
    },
    "RC": {
        "validInitValue": ["0000", "0011", "0010", "1100", "0100"],
        "defaultValue": ["0000"]
    },
    "CR": {
        "validInitValue": ["0000", "0011", "0010", "1100", "0100"],
        "defaultValue": ["0000"]
    },
    "MP": {
        "validInitValue": ["0000", "0011", "0010", "1100", "0100"],
        "defaultValue": ["1100"]
    },
    "MN": {
        "validInitValue": ["0000", "0011", "0010", "1100", "0100"],
        "defaultValue": ["0011"]
    },
    "SD": {
        "validInitValue": ["0011"],
        "defaultValue": ["0011"]
    },
    "DS": {
        "validInitValue": ["1100"],
        "defaultValue": ["1100"]
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
    model: joint.shapes.basic.Intention,

    initialize: function () { // Listens for changes in the intentions
        this.listenTo(this, 'change:intention', this.initSatValueChanged);
        // Saves this.model.get('intention) as a local variable to access it more easily
        this.intention = this.model.get('intention');
        this.isNewSegment = false;
    },

    template: ['<script type="text/template" id="item-template">',
        '<div class="inspector-views" id="right-inspector">',
        '<label>Node Name:</label>',
        '<textarea class="cell-attrs-text"></textarea>',
        '<label>Initial Satisfaction Value:</label>',
        '<select id="init-sat-value">',
        '<option value="(no value)"> (no value) </option>',
        '<option value="0000"> None (⊥, ⊥)</option>',
        '<option value="0011"> Satisfied (F, ⊥)</option>',
        '<option value="0010"> Partially Satisfied (P, ⊥) </option>',
        '<option value="0100"> Partially Denied (⊥, P)</option>',
        '<option value="1100"> Denied (⊥, F)</option>',
        '</select>',
        '<div id="function-div">',
        '<label>Function Type:</label>',
        '<select class="function-type">',
        '<option value=NT class="B"> No Function </option>',
        '<option value=C class="B"> Constant </option>',
        '<option value=R class="A"> Stochastic </option>',
        '<option value=I class="B"> Increase </option>',
        '<option value=D class="B"> Decrease </option>',
        '<option value=RC class="B"> Stochastic-Constant </option>',
        '<option value=CR class="B"> Constant-Stochastic </option>',
        '<option value=MP class="B"> Monotonic Positive </option>',
        '<option value=MN class="B"> Monotonic Negative </option>',
        '<option value=SD class="B"> Satisfied Denied </option>',
        '<option value=DS class="B"> Denied Satisfied </option>',
        '<option value=UD class="B"> User Defined </option>',
        '</select>',
        '<label style="font-size:0.8em" class="text-label">absTime</label>',
        '<div id = segment-functions>',
        '</div>',
        '<div id="user-constraints">',
        '<br>',
        // Error message is controlled dynamically
        '<label id="repeat-error"></label>',
        '<select id="repeat-begin" class="repeat-select-begin" style = "position:relative; left:38px; width: 93px">',
        '<option class="select-placeholder" selected disabled value="">Begin</option>',
        '</select>',
        '<select id="repeat-end" class="repeat-select-end" style= "position:relative; right:18px; width: 93px">',
        '<option class="select-placeholder" selected disabled value="">End</option>',
        '</select>',
        '<label style="float:left; font-size:0.8em;" id="repeat-begin2" class="repeat-select2">Repeat counts:</label>',
        '<input style="float:right;"class="repeat-select2" id="repeat-end2" type="number" value="2">',
        '<label style="float:left; font-size:0.8em;" id="repeat-begin3" class="repeat-select3">Absolute Length:</label>',
        '<input style="float:right;"class="repeat-select3" id="repeat-end3" type="number" value="0">',
        '<p id="noteRepeat" style="text-align:left; float:left; color:red; font-size:0.7em;">Note: Leave Absolute Length as 0 for unknown length. If Absolute Length is less than 0 or Repeat Count is less than 2, they will be set to 0 or 2 respectively.</p>',
        // change to blue or change color to green
        '<button style="margin-top:10px;" id="segment-add" class="inspector-btn small-btn blue-btn">Add</button>',
        '<button id="constraint-repeat" class="inspector-btn small-btn blue-btn">Set Repeats</button>',
        '<button id="constraint-restart" class="inspector-btn small-btn red-btn">Clear</button>',
        '</div>',
        '</div>',
        '<br>',
        '<canvas id="chart" width="240" height="240"></canvas>',

        '<label for="interval"> Intervals </label>',
        '<div id = max-time>',
        '</div>',
        '<button type="button" id="intervals-flip-btn" onclick="flipIntervals()" name="hidden" value="true">Flip interval</button><br><br>',
        '<script src="js/actorDoubleSlider.js"></script>', // should be generalized?
        '</script>'].join(''),

    events: {
        'change #init-sat-value': 'initSatValueChanged',
        'change .function-type': 'funcTypeChanged',
        'change .segment-functions': 'updateHTML',

        'change .repeat-select-begin': 'selectRepeatValues',
        'change .repeat-select-end': 'selectRepeatValues',
        'change .repeat-select2': 'selectNumRepeatValues',
        'change .repeat-select3': 'selectAbsoluteLength',

        'click #segment-add': 'addSegment',
        'click #constraint-repeat': 'repeatConstraintControl',
        'click #constraint-restart': 'removeUserConstraints',
        'keyup .cell-attrs-text': 'nameAction',
        'clearInspector .inspector-views': 'removeView',

        'change #max-time': 'updateTimePointsSet',
        'click #intervals-flip-btn': 'updateTimePointsSet',
    },

    /**
     * Initializes the element inspector using previously defined templates
     */
    render: function () {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()))

        // Attributes
        this.chart = new ChartObj();

        // Save html template to dynamically render more
        this.userConstraintsHTML = $("#new-user-constraints").last().clone();


        // Load initial value and node name
        this.$('.cell-attrs-text').val(this.intention.get('nodeName'));
        this.$('#init-sat-value').val(this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair'));
        // Checks which function types are available based on initial satisfaction values
        this.checkInitialSatValue();

        if (!this.model.attr(".satvalue/value") && this.model.attr(".funcvalue/text") != "NB") {
            this.model.attr(".satvalue/value", 'none');
            this.model.attr(".funcvalue/text", ' ');
        }

        
        // Turn off repeating by default
        this.repeatOptionsDisplay = false;
        // Turn off display for repeat related elements and values
        this.setRepeatConstraintMode("TurnOff");

        // Load initial value for function type in the html select element
        if (this.intention.get('evolvingFunction') != null) {
            var functionType = this.intention.get('evolvingFunction').get('type');

            if (functionType == 'UD') {
                this.renderUserDefined();
                if (this.intention.get('evolvingFunction').get('hasRepeat') == true) {
                    this.selectRepeatValues();
                }
            } else {
                this.updateHTML();
            }

        }
        this.updateCell();

        this.displayIntervals(this.findActor());
    },

    /**
    * Removes the view so we don't have multiple ones in the sidebar
    */
    removeView: function () {
        this.remove();
    },

    /**
     * Checks the initial satisfaction value for a (no value).
     * If the initial satisfaction value is (no value), then set the
     * availible function options to be Stochastic
     * If not, set the function options so that all options are availible
    */
    checkInitialSatValue: function () {
        // Set correct dropdown options for function type based on initial satisfaction value
        $('option').show(); // Clear the previous selection
        // Initialize evolvingFunction so the function type can be set as 'NT'
        if (this.intention.get('evolvingFunction') == null) {
            this.intention.set('evolvingFunction', new EvolvingFunctionBBM({}));
        }
        if (this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') == '(no value)') {
            // Hide all of the function options except for Stochastic is initial satisfaction value is '(no value)'
            $('option.B').hide();
            this.$('#user-constraints').hide();
        } else {
            this.$('#user-constraints').show();
            this.$('option[value=I]').prop('disabled', this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') === '0011');
            this.$('option[value=D]').prop('disabled', this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') === '1100');
            this.$('option[value=MP]').prop('disabled', this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') === '0011');
            this.$('option[value=MN]').prop('disabled', this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') === '1100');
        }    
    },

    /**
     * Sets the name in model attributes and in the cell's intention
     */
    nameAction: function (event) {
        // 13 corresponds to the Enter key so when Enter is pressed the name is updated
        if (event.which === 13) {
            event.preventDefault();
        }

        var text = this.$('.cell-attrs-text').val();

        text = text.replace(/[^\w\n-]/g, ' ');

        this.model.attr({ '.name': { text: text } });
        this.intention.set('nodeName', text);

    },

    /**
     * Initializes components to display user defined functions
     */
    renderUserDefined: function () {
        $(".function-type").val('UD');
        this.rerender();

        if (this.intention.get('evolvingFunction').get('hasRepeat')) {
            this.repeatOptionsDisplay = true;

            this.setRepeatConstraintMode("TurnOn");
            this.setRepeatConstraintMode("Update");

            $("#repeat-begin").val(this.intention.get('evolvingFunction').get('repStart'));
            $("#repeat-end").val(this.intention.get('evolvingFunction').get('repStop'));
            $("#repeat-end2").val(this.intention.get('evolvingFunction').get('repCount'));
            $("#repeat-end3").val(this.intention.get('evolvingFunction').get('repAbsTime'));
        }
    },

    /**
     * Saves the initial satisfaction value into the UserEvaluation
     * corresponding to this intention.
     *
     * This function is called on change for #init-sat-value,
     */
    initSatValueChanged: function (event) {
        var initValue = this.$('#init-sat-value').val();
        this.intention.changeInitialSatValue(initValue);
        this.checkInitialSatValue();
        this.updateCell();
        this.updateHTML(event);
        this.checkConstraints();
        resetConfig();
    },

    /**
     * Clears all FuncSegments for this intention's
     * EvolvingFunction and adds new FuncSegments according to the current
     * function type.
     *
     * This function is called on change for .function-type.
     */
    funcTypeChanged: function (event) {
        var evolvingTypes = ["RC", "CR", "MP", "MN", "SD", "DS", "UD"];
    
        if (evolvingTypes.includes(this.intention.get('evolvingFunction').get('type'))) { // If the previous function is evolving
            this.checkConstraints(); //Check for associated contraints
        };

        this.intention.setEvolvingFunction(this.$('.function-type').val());
        this.updateCell();
        // Disabling invalid function types are needed here b/c selecting a function type can change the init sat value
        this.$('option[value=I]').prop('disabled', this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') === '0011');
        this.$('option[value=D]').prop('disabled', this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') === '1100');
        this.$('option[value=MP]').prop('disabled', this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') === '0011');
        this.$('option[value=MN]').prop('disabled', this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') === '1100');
        this.updateHTML(event);
    },

    /**
     * Check the constraints to see if there are any associated with the current intention and
     * destroy the contraint if it is found
     *
     * This function is called in funcTypeChanged
     */
    checkConstraints: function () {
        var indices = [];
        var index = 0;
        var constraints = graph.get('constraints');

        // Finding the contraints that need to be deleted
        constraints.forEach(
            constraint => {
                // If the contraints source or destination ID is the current intention's ID
                if (constraint.get('srcID')===this.model.get('id') || constraint.get('destID')===this.model.get('id')){
                    indices.push(index); // Record the index
                };
                index++;
            });
        for(var i = indices.length-1; i >=0 ; i--) { // Go through the indices backward to not disrupt the sequence
            constraints.at(indices[i]).destroy(); // Destroy the contraint
        }
    },

    /**
     * Updates the possible satisfaction values and buttons selections based on current
     * function type.
     *
     * This function is called on change for .user-function-type
     */
    updateHTML: function (event) {
        // Check if selected init sat value and functionType pair is illegal
        // Only runs if evolvingFunction is defined and therefore there is a function type
        this.validityCheck(event);

        if (this.intention.get('evolvingFunction') != null) {
            var functionType = this.intention.get('evolvingFunction').get('type');
        }
        else { var functionType = null; }

        // Load initial value for function type in the html select element
        if (functionType == 'UD') {
            this.$('.function-type').val(functionType);
            this.$('#user-constraints').show("fast");
        } else {
            if (functionType == 'NB') {
                $('#init-sat-value').prop('disabled', true);
                $('#init-sat-value').css('background-color', 'grey');
                $('.function-type').prop('disabled', true);
                $('.function-type').css('background-color', 'grey');
            } else {
                this.$('.function-type').val(functionType);
                this.$('#user-constraints').hide();
                this.$('#init-sat-value').prop('disabled', false);
            }
        }

        //Changes initial satisfaction value to no value for stochastic and stochastic constant functions
        if (functionType == 'RC' || functionType == 'R') {
            this.$('#init-sat-value').val('(no value)');
        } 
        this.rerender();
    },

    /**
     * Checks the validity of the initial satisfaction value function type
     * pair. If illegal, this function changes either the initial satisfaction
     * value or the function type accordingly.
     */
    validityCheck: function (event) {
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

        if (functionType !== null && initValue !== null) {
            // Perform check
            // If not UD, just do a regular check
            if (functionType != "UD") {
                // If not valid, 2 possible actions:
                // change to default init value if functTypeChanged
                // change to none function if initValueChanged
                if ($.inArray(initValue, validPair[functionType]['validInitValue']) == -1) {
                    if (initValueChanged && initValue != "(no value)") { this.$('.function-type').val('none'); }
                    if (initValueChanged && initValue == "(no value)") { this.$('.function-type').val('C'); }
                    var newValue = validPair[functionType]['defaultValue'];
                    if (funcTypeChanged) { this.$('#init-sat-value').val(newValue); }
                }
            }
        }
    },



    /**
     * Adds new FunctionSegmentBBM for the user defined function and renders a new FunctionSegmentView.
     * This function is called on click for #segment-add.
     * This function is also called when loading user defined
     * constraints from previously stored.
     */
    addSegment: function () {
        this.isNewSegment = true;
        // Adds a new FunctionSegmentBBM to the functionSegList
        this.intention.addUserDefinedSeg("C", "0000");
        var funcSegList = this.intention.getFuncSegments();

        // Sets current to false so it becomes disabled for the previous FunctionSegmentBBM to 
        if (funcSegList.length > 1) {
            funcSegList[funcSegList.length - 2].set('current', false);
        }
        this.renderFunctionSegments();

        if (this.repeatOptionsDisplay) {
            this.setRepeatConstraintMode("Update");
            this.$('#repeat-end3').val('0');
            this.$("#repeat-error").hide();
        }
    },

    /**
     * Toggles the display for the user defined function's
     * repeat feature.
     * This function is called on click for #constraint-repeat.
     */
    repeatConstraintControl: function () {
        if (!this.repeatOptionsDisplay) {
            this.setRepeatConstraintMode("TurnOn");
            this.setRepeatConstraintMode("Update");
        } else if (this.repeatOptionsDisplay) {
            this.setRepeatConstraintMode("TurnOff");
            this.intention.get('evolvingFunction').removeRepFuncSegments();
            this.$("#repeat-end2").val('2');
            this.$("#repeat-end3").val('0');
        }
    },

    /**
     * Handles the changes done for the select elements for the
     * repeat feature for user defined functions, by ensuring that
     * the begin and end range of repeated constraints are valid.
     * This function is called on change for .repeat-select-begin and .repeat-select-end
     * (the select elements for repeat begin and end)
     */
    selectRepeatValues: function () {
        // If some of the repeat select values were previously disabled, enable them
        this.$("option").prop('disabled', '');

        var begin = this.$("#repeat-begin").val();
        var string1 = 'A'
        var minimumInt = string1.charCodeAt(0);
        var nextChar = String.fromCharCode(begin.charCodeAt(0) + 1);

        // If the begining repeating segment is after or equal to the end repeating segment reset the end segment
        if (this.$("#repeat-begin").val() >= this.$("#repeat-end").val()) {
            this.$("#repeat-end").val('');
        }

        // Disable repeat end values from 'A' to one value after the repeat beginning value
        // Because repeating segments must be two or more segments apart 
        for (var i = (minimumInt); i < nextChar.charCodeAt(0); i++) {
            valOption = String.fromCharCode(i);
            var disabledOpt = 'option[value=' + valOption + ']'
            this.$(disabledOpt).prop('disabled', 'disabled');
        }
        this.$("option.repeat-select-begin").prop('disabled', false);

        var end = this.$("#repeat-end").val();
        var count = this.$("#repeat-end2").val();
        var absTime = this.$("#repeat-end3").val();

        // find the startAT value for the starting repeating function segment
        for (var i = 0; i < this.intention.getFuncSegments().length; i++) {
            if (this.intention.getFuncSegments()[i].get('startTP') == begin) {
                var repStartTimeVal = this.intention.getFuncSegments()[i].get('startAT');
            }
        }

        // If there is an absolute length and the starting repeating segment doesn't have an startAT, show error message
        if ((begin !== null) && (absTime > 0)) {
            if (repStartTimeVal === null) {
                this.$("#repeat-error").text("Enter an absTime value for function segment " + begin);
                this.$("#repeat-error").show("fast");
            } else {
                this.$("#repeat-error").hide();
            }
        } else {
            this.$("#repeat-error").hide();
        }

        // Once a repeating start value is selected, rerender function segments to disable absTime
        if ($("#repeat-begin").val() != null) {
            this.rerender();
        }

        if (begin === null || end === null) {
            return;
        }

        this.intention.get('evolvingFunction').setRepeatingFunction(begin, end, count, absTime);

    },

    /**
     * Ensures that the number of repeat counts is a valid number,
     * updates the constraintsObject with the new repeat count and
     * updates the chart in case there are constraint lines that need
     * to be coloured red.
     *
     * This function is called on change for #repeat-end2.
     */
    selectNumRepeatValues: function () {
        var repVal = $("#repeat-end2").val();
        if (repVal < 2) {
            $('#repeat-end2').val(2);
        }
        this.intention.get('evolvingFunction').set('repCount', repVal);
    },

    /**
     * Ensures that the absolute length is a non negative number and
     * updates the constraintsObject to have the new absolute length.
     *
     * This function is called on change for #repeat-end3.
     */
    selectAbsoluteLength: function () {
        var absLength = $("#repeat-end3").val();
        var begin = this.$("#repeat-begin").val();
        if (absLength < 0) {
            $('#repeat-end3').val(0);
        }
        this.intention.get('evolvingFunction').set('repAbsTime', absLength);

        // For when user selects starting repeat value prior to adding absolute length
        // find the startAT value for the starting repeating function segment
        for (var i = 0; i < this.intention.getFuncSegments().length; i++) {
            if (this.intention.getFuncSegments()[i].get('startTP') == begin) {
                var repStartTimeVal = this.intention.getFuncSegments()[i].get('startAT');
            }
        }

        // If there is an absolute length and the starting repeating segment doesn't have an startAT, show error message
        if ((begin !== null) && (absLength > 0)) {
            if (repStartTimeVal === null) {
                this.$("#repeat-error").text("Enter an absTime value for function segment " + begin);
                this.$("#repeat-error").show("fast");
            }
        } else {
            this.$("#repeat-error").hide();
        }
    },

    /**
     * Sets the mode for the user defined function's repeat feature.
     * Depending on the mode, this function controls the display
     * for repeat related elements and values.
     *
     * @param {String} mode
     */
    setRepeatConstraintMode: function (mode) {
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
            $("#repeat-begin2").hide();
            $("#repeat-end2").hide();
            $("#repeat-begin3").hide();
            $("#repeat-end3").hide();
            $("#noteRepeat").hide();
            this.$("#repeat-error").hide();
            this.repeatOptionsDisplay = false;

            // Update all repeat related display and values
        } else if (mode == "Update") {

            // Cannot repeat with only one constraint
            var numSegments = this.intention.getFuncSegments().length;
            if (numSegments < 2) {

                $("#repeat-error").text("More constraints are needed");
                $("#repeat-error").show("fast");
                $("#repeat-begin").prop('disabled', 'disabled');
                $("#repeat-begin").css("background-color", "grey");
                $("#repeat-end").prop('disabled', 'disabled');
                $("#repeat-end").css("background-color", "grey");

                // Update HTML
            } else {

                if ($("#repeat-begin").prop('disabled')) {
                    $("#repeat-error").hide();
                    $("#repeat-begin").prop('disabled', '');
                    $("#repeat-begin").css("background-color", "");
                    $("#repeat-end").prop('disabled', '');
                    $("#repeat-end").css("background-color", "");
                }

                var funcSegments = this.intention.getFuncSegments();

                // Set select options
                for (var i = 0; i < funcSegments.length; i++) {
                    var beginVal = funcSegments[i].get('startTP');

                    var startCheck = this.intention.getFuncSegments()[i].get('startTP');
                    if (startCheck == '0') {
                        var endVal = 'A';
                    }
                    else {
                        var endVal = String.fromCharCode(startCheck.charCodeAt(0) + 1);
                    }

                    $("#repeat-begin").append(
                        $('<option class = "repeat-select-begin"></option>').val(beginVal).html(beginVal)
                    );
                    $("#repeat-end").append(
                        $('<option></option>').val(endVal).html(endVal)
                    );
                }
                $("repeat-end2").val(this.intention.get('evolvingFunction').get('repCount'));
                $("repeat-end3").val(this.intention.get('evolvingFunction').get('repAbsTime'));
            }
        }
    },

    // Reset user-define chart to default
    /**
     * Removes all user constraints for user defined functions
     * This function is called on click for #constraint-restart (red Clear button).
     */
    removeUserConstraints: function () {
        $('#init-sat-value').prop('disabled', '');
        $('#init-sat-value').css("background-color", "");

        var html = this.userConstraintsHTML.clone();
        this.$('#all-user-constraints').html('');
        html.appendTo(this.$('#all-user-constraints'));

        if (this.repeatOptionsDisplay) {
            this.setRepeatConstraintMode("TurnOff");
            this.intention.get('evolvingFunction').removeRepFuncSegments();
            this.$("#repeat-end2").val('2');
            this.$("#repeat-end3").val('0');
        }
        this.funcTypeChanged(null);
    },

    /**
     * Makes corresponding changes for the cell attributes, according to the values in the
     * inspector. This function is always called alongside with updateChart
     * and updateChartUserDefined.
     */
    updateCell: function () {
        EVO.refresh(undefined);

        changeFont(current_font, paper);
        if (this.intention.get('evolvingFunction') != null) {
            if (this.intention.get('evolvingFunction').get('type') == 'NT') {
                this.model.attr(".funcvalue/text", '');
            } else {
                this.model.attr(".funcvalue/text", this.intention.get('evolvingFunction').get('type'));
            }
        }

        if (this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') == '(no value)') {
            this.model.attr('.satvalue/text', '');
        } else {
            this.model.attr('.satvalue/text', satisfactionValuesDict[this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair')].satValue);
        }
    },

    /**
     * Clears the element's html
     */
    clear: function () {
        this.$el.html('');
    },

     /**
     * Renders a view for all of the existing FunctionSegmentBBMs that are part of the element
     */
    renderFunctionSegments: function () {
        // Removes functions segments that are currently displayed
        $('#segment-functions').empty();
        if (this.intention.get('evolvingFunction').get('type') == 'NT') {
            $(".text-label").css("visibility", "hidden");
        }
        // Only creates the FunctionSegmentView if there is a function segment
        if (this.intention.get('evolvingFunction') != null && this.intention.get('evolvingFunction').get('type') != 'NT') {
            var funcSegList = this.intention.getFuncSegments();
            var i = 0;
            // Creates a FuncSegView for each of the function segment in the functionSegList
            funcSegList.forEach(
                funcSeg => {
                    var functionSegView = new FuncSegView({ model: funcSeg, intention: this.intention, index: i, initSatValue: this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair'), chart: this.chart, isNewSegment: this.isNewSegment });
                    $('#segment-functions').append(functionSegView.el);
                    functionSegView.render();
                    i++;
                })
        // Renders the chart if there is only an initial satisfaction value 
    } else if (this.intention.get('evolvingFunction') != null && this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') !== null && this.intention.get('evolvingFunction').get('type') === 'NT') {
        // Clear previous chart values
        this.chart.reset();
        // Gets the chart canvas
        var context = $("#chart").get(0).getContext("2d");
        // Adds the initial satisfaction as a single point to the chart
        this.chart.addDataSet(0, [satisfactionValuesDict[this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair')].chartVal], false);
        // Renders the chart
        this.chart.display(context);
        }
    },

    /**
     * Called whenever the html is updated. Renders the views for the FunctionSegmentBBMs and adds an absTime label
     */
    rerender: function () {
        this.isNewSegment = false;
        // Adds absTime label
        if (this.intention.getFuncSegments().length != 0) {
            $(".text-label").css("visibility", "visible");
        }
        // Renders all of the FuncSegViews
        this.renderFunctionSegments();
        return this;
    },

    findActor: function() {
        var elements = graph.getElements();
        var actors = []
        for (var i = 0; i < elements.length; i++) {
            var cell = elements[i].findView(paper);
            if (cell.model.attributes.type == "basic.Actor") {
                actors.push(cell);
            }
        }
        for (var i = 0; i < actors.length; i++) {
            if (actors[i].model.attributes.embeds) {
                for (var j = 0; j < actors[i].model.attributes.embeds.length; j++) {
                    if (actors[i].model.attributes.embeds[j] == this.model.id) {
                        return actors[i];
                    }
                }
            }
        }
    },

    displayIntervals: function (actor) {
        var intervalsView = new IntervalsView({actor: actor, intention: this.intention});
        $('#max-time').append(intervalsView.el);
        intervalsView.render();
    },

    updateTimePointsSet: function () {  
        var minRange = parseInt(document.getElementById('slider-1').min);
        var maxRange = parseInt(document.getElementById('slider-1').max);  
        var timePoints = parseInt(document.getElementById('slider-1').value);
        var timePoints2 = parseInt(document.getElementById('slider-2').value);
        var flipBool = document.getElementById('intervals-flip-btn').value;

        var timePointsArray = [];
        if (flipBool == "true") { // not flipped
            if (timePoints != minRange) { // first slider is moved
                timePointsArray.push([minRange, timePoints - 1]);
            }
            if (timePoints2 != maxRange) { // second slider is moved
                timePointsArray.push([timePoints2 + 1, maxRange]);
            }
        } else { // flipped
            if (timePoints != minRange) { 
                timePoints += 1;
            }
            if (timePoints2 != maxRange) {
                timePoints2 -= 1;
            }
            timePointsArray.push([timePoints, timePoints2]);
        }

        this.intention.set('intervals', timePointsArray);
    },
});

/************************************************** FunctionSegmentBBM View **************************************************/

var FuncSegView = Backbone.View.extend({
    model: FunctionSegmentBBM,

    initialize: function (options) {
        // Reference to the chart in the ElementInspector view 
        this.chart = options.chart;
        // Reference to the parent intention
        this.intention = options.intention;

        // Sets the stopTP to be one step after the startTP
        if (this.model.get('startTP') != '0') {
            this.stopTP = String.fromCharCode(this.model.get('startTP').charCodeAt(0) + 1);
        } else {
            this.stopTP = 'A';
        }
        // Boolean if the function segment is a part of a UD function
        if (this.intention.get('evolvingFunction').get('type') == 'UD') {
            this.hasUD = true;
        } else {
            this.hasUD = false;
        }
        this.index = options.index;
        this.initSatValue = options.initSatValue;
        this.isNewSegment = options.isNewSegment;

        // Listens to if the current parameter in the FunctionSegmentBBMs changes
        this.listenTo(this.model, 'change:refEvidencePair', this.updateNextFuncSeg);

        // Updates the chart whenever there is a change to the model
        this.listenTo(this.model, 'change:refEvidencePair', this.hasUD ? this.updateChartUserDefined : this.updateChart);
        this.listenTo(this.intention.getUserEvaluationBBM(0), 'change:assignedEvidencePair', this.hasUD ? this.updateChartUserDefined : this.updateChart);
    },
    template: ['<script type="text/template" id="item-template">',
        '<input class="seg-time" > </input>',
        '<output id = "startTP-out" class = "seg-class" style="position:relative; left:14px; width:15px"> <%= startTP %> </output>',
        '<select id="seg-function-type" class = "seg-class" style=" position:relative; left:10px; width: 95px">',
        '<option value="C" <% if (type === "C") { %> selected <%} %>> Constant </option>',
        '<option value="R" <% if (type === "R") { %> selected <%} %>> Stochastic </option>',
        '<option value="I" <% if (type === "I") { %> selected <%} %>> Increase </option>',
        '<option value="D" <% if (type === "D") { %> selected <%} %>> Decrease </option>',
        '</select>',
        '<select id="seg-sat-value" class = "seg-class" style=" position:relative; left:10px; width: 96px">',
        '<option value="0000" <% if (refEvidencePair === "0000") { %> selected <%} %>> None (⊥, ⊥) </option>',
        '<option value="0011" <% if (refEvidencePair === "0011") { %> selected <%} %>> Satisfied (F, ⊥) </option>',
        '<option value="0010" <% if (refEvidencePair === "0010") { %> selected <%} %>> Partially Satisfied (P, ⊥) </option>',
        '<option value="0100" <% if (refEvidencePair === "0100") { %> selected <%} %>> Partially Denied (⊥, P)</option>',
        '<option value="1100" <% if (refEvidencePair === "1100") { %> selected <%} %>> Denied (⊥, F)</option>',
        '</select>',
        '<output id = "stopTP-out" class = "seg-class" style="position:relative; left:8px; width:15px"> end </output>',
        '</div>',
        '</script>'].join(''),

    events: {
        'change #seg-sat-value': 'setFuncSatValue',
        'change #seg-function-type': 'checkFuncValue',
        'keyup .seg-time': 'setAbsTime',
    },

    render: function () {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));

        if (!this.hasUD) {
            this.updateChart()
        }
        else {
            this.updateChartUserDefined()
        }

        // Disable the absTime parameter and set it to zero if its the first function segment
        if (this.index == 0) {
            this.$('.seg-time').val(0);
            this.$('.seg-time').prop('disabled', true);
        } else if (this.index != 0 && this.model.get('startAT') != null) {
            this.$('.seg-time').val(this.model.get('startAT'));
        }

        // If there is a repeating segment, disable/delete absTime values from one after the starting segment to the ending segment
        if ($("#repeat-begin").val() != null) {
            // If there is no end function segment selected, just disable the rest of the function segments
            if ($("#repeat-end").val() === null || $("#repeat-end").val() === '') {
                if ((this.model.get('startTP').charCodeAt(0) > $("#repeat-begin").val().charCodeAt(0))) {
                    this.$('.seg-time').val('');
                    this.model.set('startAT', null);
                    this.$('.seg-time').prop('disabled', true);
                }
            } else {
                if ((this.model.get('startTP').charCodeAt(0) > $("#repeat-begin").val().charCodeAt(0)) && (this.stopTP.charCodeAt(0) < ($("#repeat-end").val().charCodeAt(0) + 1))) {
                    this.$('.seg-time').val('');
                    this.model.set('startAT', null);
                    this.$('.seg-time').prop('disabled', true);
                }
            }
        }

        this.checkFuncValue();

        // For all function types except for UD disable the ability to select the function 
        this.$('#seg-function-type').prop('disabled', 'disabled');
        if ((this.hasUD === true) && (this.model.get('current') === true)) {
            this.$('#seg-function-type').prop('disabled', '');
        }
        // Have to manually add stopTP to html because it is not in the FunctionSegmentBBM
        this.$('#stopTP-out').val(this.stopTP);
        return this;
    },

    /**
     * Sets the absTime parameter of the current FunctionSegmentBBM. Called whenever a value is entered in 
     * the absTime box in the view.
     */
    setAbsTime: function (event) {
        // 13 corresponds to the Enter key so when Enter is pressed the name is updated
        if (event.which === 13) {
            event.preventDefault();
        }

        // If the absTime is deleted, set absTime to null
        if (this.$('.seg-time').val() !== '') {
            var absTime = Number(this.$('.seg-time').val());
        } else {
            var absTime = null;
        }
        this.model.set('startAT', absTime);

        // If the start of the repeating segment has an absolute time value, hide error message
        if ((absTime !== null && this.model.get('startTP') === $("#repeat-begin").val()) || $("#repeat-end3").val() === '0') {
            $("#repeat-error").hide();
        } else if (absTime === null && (this.model.get('startTP') == $("#repeat-begin").val())) {
            var begin = $("#repeat-begin").val();
            $("#repeat-error").text("Enter an absTime value for function segment " + begin);
            $("#repeat-error").show("fast");
        }
    },

    /**
     * Sets the FunctionSegmentBBM's refEvidencePair to the value selected by the html
     */
    setFuncSatValue: function () {
        this.model.set('refEvidencePair', this.$('#seg-sat-value').val()); // 4 digit representation

        // For MP, MN, RC, and CR functions sets the second refEvidencePair to the value selected by the html 
        if (this.intention.getFuncSegments().length >= 2 && this.hasUD == false) {
            if (this.intention.get('evolvingFunction').get('type') !== 'SD' && this.intention.get('evolvingFunction').get('type') !== 'DS') {
                this.intention.getFuncSegments()[1].set('refEvidencePair', this.$('#seg-sat-value').val());
            }
        }
    },
    /**
     * Sets the FunctionSegmentBBM's function type to the type selected in the html.
     * Also sets the satisfaction value depending on the different function types.
     */
    checkFuncValue: function () {
        // set the function type to the type selected in the html
        this.model.set('type', this.$('#seg-function-type').val());
        // Disable the function satisfaction dropdown for constant and stochastic functions
        if (this.model.get('type') == 'C' || this.model.get('type') == 'R') {
            this.$('#seg-sat-value').prop('disabled', 'disabled');
            if (this.intention.get('evolvingFunction').get('type') !== 'MP' && this.intention.get('evolvingFunction').get('type') !== 'MN' && (this.model.get('type') == 'C')) {
                if (this.intention.get('evolvingFunction').get('type') == 'SD' || this.intention.get('evolvingFunction').get('type') == 'DS') {
                    this.$("#seg-sat-value").val(this.model.get('refEvidencePair'));
                }
            }
        } else {
            this.$('#seg-sat-value').prop('disabled', '');
        }
        
        // Disable the satisfaction value for the constant segment of RC functions
        if (this.intention.get('evolvingFunction').get('type') == 'RC' && this.model.get('type') == 'C') {
            this.$('#seg-sat-value').prop('disabled', '');
            // Sets the satisfaction value for the constant segment of CR functions
        } else if (this.intention.get('evolvingFunction').get('type') == 'CR' && this.model.get('type') == 'C') {
            this.$("#seg-sat-value").val(this.initSatValue);
            this.model.set('refEvidencePair', this.initSatValue);
        }

        if (this.hasUD == true) {
            if (this.model.get('current')) {
                var len = this.intention.getFuncSegments().length;
                if (len != 1) {
                    // If the satisfaction value of the previous FunctionSegmentBBM is satisfied you can't select increasing
                    this.$('option[value=I]').prop('disabled', this.intention.getFuncSegments()[len - 2].get('refEvidencePair') === '0011');
                    // If the satisfaction value of the previos FunctionSegmentBBM is denied you can't select decreasing
                    this.$('option[value=D]').prop('disabled', this.intention.getFuncSegments()[len - 2].get('refEvidencePair') === '1100');
                } else {
                    // If the initial satisfaction value is satisfied you can't select increasing
                    this.$('option[value=I]').prop('disabled', this.initSatValue === '0011');
                    // If the initial satisfaction value is denied you can't select decreasing
                    this.$('option[value=D]').prop('disabled', this.initSatValue === '1100');
                }
                this.checkUDFunctionValues(this.isNewSegment);
            } else { // If the model is not the most recent model disable the function type and satisfaction value selectors 
                this.$("#seg-function-type").prop('disabled', true);
                this.$("#seg-sat-value").prop('disabled', true);
                // If the function is UD, stochastic, and not current set html to (no value) 
                if (this.model.get('type') == 'R') {
                    this.$("#seg-sat-value").last().html(this.satValueOptionsAll());
                    this.$("#seg-sat-value").val("(no value)");
                }
            }
        }
        else {
           this.checkSatValue();
        }
    },

    /**
     * This function checks the initial satisfaction value and function type
     * and determines which function satisfaction values should be selectable 
     * 
     */
    checkSatValue: function () {
        var functionType = this.$('#seg-function-type').val();
        var initValue = this.initSatValue;

        // Set stochastic functions to (no value)
        if (functionType == 'R') {
            this.$("#seg-sat-value").last().html(this.satValueOptionsAll());
            this.$("#seg-sat-value").val("(no value)");
        } else if (this.intention.get('evolvingFunction').get('type') == 'CR' && this.intention.get('evolvingFunction').get('type') == 'C' && functionType == 'C') {
            this.$("#seg-sat-value").val(this.initSatValue);
            this.model.set('refEvidencePair', this.initSatValue);
            // Set correct dropdown values for an increasing function depending on the initial sat value    
        } else if (functionType == 'I') {
            this.$('#seg-sat-value').html(this.satValueOptionsPositiveOrNegative(initValue, true));
            // Set correct dropdown values for a decreasing function depending on the initial sat value 
        } else if (functionType == 'D') {
            this.$('#seg-sat-value').html(this.satValueOptionsPositiveOrNegative(initValue, false));
        }
        this.$('#seg-sat-value').val(this.model.get('refEvidencePair'));      
        return;
    },

    /**
    * Adds appropriate satisfaction values option tags
    * for .user-sat-value, which is the select tag used to
    * indicate satisfaction values when creating a user defined function.
    * 
    * If the UD Segment is newly added, set the evidence pair to the function type's default:
    * Increasing -> Fully Satisfied, Decreasing -> Fully Denied, Stocastic -> (no value), Constant -> initial sat val if first segment, none otherwise
    */
    checkUDFunctionValues: function (isNewSegment) {
        var func = this.$("#seg-function-type").val();

        if (func == 'I' || func == 'D') {
            var prevVal = this.intention.get('evolvingFunction').getNthRefEvidencePair(2);
            if (func == 'I') {
                this.$("#seg-sat-value").html(this.satValueOptionsPositiveOrNegative(prevVal, true));
                if(isNewSegment) {
                    this.model.set('refEvidencePair', "0011");
                }
            } else {
                this.$("#seg-sat-value").html(this.satValueOptionsPositiveOrNegative(prevVal, false));
                if(isNewSegment) {
                    this.model.set('refEvidencePair', "1100");
                }
            }
        } else if (func == 'R') {
            this.$("#seg-sat-value").last().html(this.satValueOptionsAll());
            this.$("#seg-sat-value").prop('disabled', true);
            if(isNewSegment) {
                this.model.set('refEvidencePair', '(no value)');
            }
        } else if (func == 'C') {
            this.$("#seg-sat-value").last().html(this.satValueOptionsNoRandom());
            // Restrict input to initial satisfaction value if it is the first constraint
            if (this.index == 0) {
                if(isNewSegment) {
                    this.model.set('refEvidencePair', this.initSatValue);
                }
            } else if (this.index != 0 && this.model.get('current')) {
                this.$("#seg-sat-value").prop('disabled', '');
                if(isNewSegment) {
                    this.model.set('refEvidencePair', "0000");
                }
                // TODO:Delete. - Remove during merge conflict.
                //this.model.set('refEvidencePair', "0000");
                //this.$("#seg-sat-value").val(this.model.get('refEvidencePair'));

            } else {
                this.$("#seg-sat-value").prop('disabled', true);
            }
        }
        // Update the dropdown to display the UD segment's satisfaction value
        this.$("#seg-sat-value").val(this.model.get('refEvidencePair')); 
        return;
    },

    /**
     * This function takes in an initial value
     * And returns an html string options with values 
     * That are either larger or smaller than the initial value
     * Depending on the positive boolean parameter
     * 
     * @param {String} currentValue 
     * @param {Boolean} positive If true - increasing, if false, decreasing
     * @returns HTML string of options with values
     */
    satValueOptionsPositiveOrNegative: function (currentVal, positive) {
        var satVals = ["0011", "0010", "0000", "0100", "1100"];
        var result = '';

        if (positive) {
            var valuesList = satVals.slice(0, satVals.indexOf(currentVal));
        } else {
            var valuesList = satVals.slice(satVals.indexOf(currentVal) + 1);
        }

        for (let value of valuesList) {
            result += this.binaryToOption(value);
        }
        return result;
    },

    /**
    * This function returns an html string with all of the satisfaction value options
    */
    satValueOptionsAll: function () {
        var result = '';
        for (let value of ["0011", "0010", "0000", "0100", "1100", "unknown"]) {
            result += this.binaryToOption(value);
        }
        return result;
    },

    /**
    * This function returns an html string with all of the satisfaction value options
    * except for "None" and "(no value)"
    */
    satValueOptionsNoRandom: function () {
        var result = '';
        for (let value of ["0011", "0010", "0000", "0100", "1100"]) {
            result += this.binaryToOption(value);
        }
        return result;
    },

    /**
     * Helper function to convert binary strings to option tags 
     * 
     * @param binaryString: This is the binary string stands for the value
     * @returns a string decode of that binary value
     */
    binaryToOption: function (binaryString) {
        switch (binaryString) {
            case "0000":
                return `<option value="0000">None (⊥, ⊥) </option>`;
            case "0011":
                return `<option value="0011">Satisfied (F, ⊥) </option>`;
            case "0010":
                return `<option value="0010">Partially Satisfied (P, ⊥) </option>`;
            case "0100":
                return `<option value="0100">Partially Denied (⊥, P)</option>`;
            case "1100":
                return `<option value="1100">Denied (⊥, F) </option>`;
            case "unknown":
                return `'<option value="(no value)"> (no value) </option>'`;
        }
        return null;
    },

    /**
     * Sets the correct refEvidencePair for the second segment of MP and MN functions
     */
    updateNextFuncSeg: function () {
        if (!this.hasUD && (this.intention.get('evolvingFunction').get('type') == 'MP' || this.intention.get('evolvingFunction').get('type') == 'MN') && this.index == 1) {
            this.$('#seg-sat-value').val(this.intention.getFuncSegments()[1].get('refEvidencePair'));
        }
    },

    /**
     * Updates the chart to represent data related to the the current function and
     * satisfaction value(s)
     */
    updateChart: function () {
        if (this.intention.get('evolvingFunction') != null) {
            var funcType = this.intention.get('evolvingFunction').get('type');
            var initVal = satisfactionValuesDict[this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair')].chartVal;
            this.chart.reset();
            // Get the chart canvas
            var context = $("#chart").get(0).getContext("2d");

            // Render preview for user defined function types
            if (funcType == "UD") {
                this.updateChartUserDefined();
                return;
            }

            // Change chart dataset(s), depending on the function type
            var threeLabelFunc = ['RC', 'CR', 'SD', 'DS', 'MP', 'MN'];

            if (threeLabelFunc.includes(funcType)) {
                this.chart.labels = ['0', 'A', 'Infinity'];
                if (funcType === 'RC') {
                    var satVal = satisfactionValuesDict[this.model.get('refEvidencePair')].chartVal;
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
                    var satVal = satisfactionValuesDict[this.intention.getFuncSegments()[0].get('refEvidencePair')].chartVal;
                    this.chart.addDataSet(0, [initVal, satVal, satVal]);
                }
            } else {
                this.chart.labels = ['0', 'Infinity'];
                if (funcType === 'C') {
                    this.chart.addDataSet(0, [initVal, initVal], false);
                } else if (funcType === 'R') {
                    this.chart.addDataSet(0, [initVal, initVal], true);
                } else if (funcType === 'I' || funcType === 'D') {
                    var satVal = satisfactionValuesDict[this.intention.getFuncSegments()[0].get('refEvidencePair')].chartVal;
                    this.chart.addDataSet(0, [initVal, satVal], false);
                } else {
                    // display a dot
                    this.chart.addDataSet(0, [initVal], false);
                }
            }
            this.chart.display(context);
        }
    },

    /**
     * Updates the chart to represent data related to the the current user
     * defined function and satisfaction value(s)
     */
    updateChartUserDefined: function () {
        var context = $("#chart").get(0).getContext("2d");
        // This will never be undefined because at least one 
        // FunctionSegmentBBM will be in functionSegList at this point
        var numFuncSegments = this.intention.getFuncSegments().length;

        // Reset chart datasets
        this.chart.reset();

        // Setting up the labels
        this.chart.labels = this.getUDChartLabel(numFuncSegments);

        // Get init sat value
        var initSatVal = satisfactionValuesDict[this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair')].chartVal;

        // Add datapoints to graph for each userfunction/uservalue pair
        var funcSegments = this.intention.getFuncSegments();

        for (var i = 0; i < funcSegments.length; i++) {
            var currFunc = funcSegments[i].get('type');
            var currVal = funcSegments[i].get('refEvidencePair');
            var coloured = funcSegments[i].isRepeat;
            var data1; // first data point for this segment
            var data2 = satisfactionValuesDict[currVal].chartVal;
            if (i === 0) {
                if (currFunc !== 'R') {
                    data1 = initSatVal;
                } else {
                    data1 = 0;
                }
            } else {
                // If previous function is stochastic, set the starting point to be either FD or FS
                var prevFunc = funcSegments[i - 1].get('type');
                var prevVal = funcSegments[i - 1].get('refEvidencePair');
                if (prevFunc === 'R' && currFunc === 'I') {
                    data1 = -2;
                } else if (prevFunc === 'R' && currFunc === 'D') {
                    data1 = 2;
                } else if (currFunc == 'R') {
                    data1 = 0;
                } else if (currFunc === 'C') {
                    data1 = data2;
                } else {
                    // set to previous function's marked value
                    data1 = satisfactionValuesDict[prevVal].chartVal;
                }
            }
            this.chart.addDataSet(i, [data1, data2], currFunc === 'R' || currVal === '(no value)', coloured);
        }
        this.chart.display(context);
    },

    /**
     * Returns all of the start and stop time points of the existing fucntion segments for UD functions
     */
    getUDChartLabel: function (num) {
        var res = ['0'];
        var curr = 'A'
        for (var i = 0; i < num; i++) {
            res.push(curr);
            curr = String.fromCharCode(curr.charCodeAt(0) + 1);
        }
        return res;
    },
});

var IntervalsView = Backbone.View.extend({
    model: joint.dia.BloomingGraph,

    initialize: function (options) {
        this.actor = options.actor;
        this.intention = options.intention;
    },

    template: ['<script type="text/template" id="item-template">',
    '<div class="container">',
        '<div class="slider-track">',
        '</div>',
        '<input style="display:none" id="limit1" value=<%= graph.get("maxAbsTime") %>>',
        '<input style="display:none" id="limit2" value="0">',
        '<input type="range" min="0" max=<%= graph.get("maxAbsTime") %> value="0" id="slider-1" oninput="slideOne()">',
        '<input type="range" min="0" max=<%= graph.get("maxAbsTime") %> value=<%= graph.get("maxAbsTime") %> id="slider-2" oninput="slideTwo()">',
    '</div>',
    '<label for="range1">Available: </label>',
    '<div id="not-flipped">',
        '<span id="range1">',
        '0',
        '</span>',
        '<span> &dash; </span>',
        '<span id="range2">',
        '<%= graph.get("maxAbsTime") %>',
        '</span><br>',
    '</div>',
    '<div id="flipped" style="display:none">',
        '<span id="flipped-min">',
            '0',
        '</span>',
        '<span> &dash; </span>',
        '<span id="range1-flipped">',
        '0',
        '</span>',
        ', ',
        '<span id="range2-flipped">',
        '<%= graph.get("maxAbsTime") %>',
        '</span>',
        '<span> &dash; </span>',
        '<span id="flipped-max">',
            '<%= graph.get("maxAbsTime") %>',
        '</span>',
    '</div>',
    '</script>'
    ].join(''),

    render: function () {
        this.$el.html(_.template($(this.template).html())(graph.toJSON()));

        var intervals = this.intention.attributes.intervals;
        var slider1 = document.getElementById('slider-1'); // left slider
        var slider2 = document.getElementById('slider-2'); // right slider

        var rangeMin = slider1.min;
        var rangeMax = slider1.max;

        if (this.actor) { // if intention is within an actor
            var actorIntervals = this.actor.model.attributes.actor.attributes.intervals;
            if (actorIntervals.length > 0) { // if actor is not always available
                if (actorIntervals[1]){ // actor has two exclusion intervals
                    rangeMin = actorIntervals[0][1] + 1;
                    rangeMax = actorIntervals[1][0] - 1;
                    slider1.value = rangeMin;
                    slider2.value = rangeMax;
                } else { // actor has one exclusion interval
                    if (actorIntervals[0][0] == 0) { // [0-#] excluded
                        rangeMin = actorIntervals[0][1] + 1;
                        slider1.value = rangeMin;
                    } else if (actorIntervals[0][1] == graph.get('maxAbsTime')) { // [#-max] excluded
                        rangeMax = actorIntervals[0][0] - 1;
                        slider2.value = rangeMax;
                    } else { // [#-#] excluded
                        document.getElementById('intervals-flip-btn').value = "false";
                        document.getElementById('intervals-flip-btn').style.display = "none";
                        slider1.value = actorIntervals[0][0] - 1;
                        slider2.value = actorIntervals[0][1] + 1;
                        document.getElementById('limit1').value = actorIntervals[0][0] - 1;
                        document.getElementById('limit2').value = actorIntervals[0][1] + 1;
                        document.getElementById('flipped').style.display = "";
                        document.getElementById('not-flipped').style.display = "none";
                    }
                }
            }
        }

        if (intervals.length > 0) { // if intention is not always available
            if (intervals[1]){ // two exclusion intervals
                slider1.value = intervals[0][1] + 1;
                slider2.value = intervals[1][0] - 1;
            } else { // one exclusion interval
                if (intervals[0][0] == rangeMin) { // [min-#] excluded
                    slider1.value = intervals[0][1] + 1;
                    slider2.value = rangeMax;
                } else if (intervals[0][1] == rangeMax) { // [#-max] excluded
                    slider1.value = rangeMin;
                    slider2.value = intervals[0][0] - 1;
                } else { // [#-#] excluded
                    document.getElementById('intervals-flip-btn').value = "false";
                    slider1.value = intervals[0][0] - 1;
                    slider2.value = intervals[0][1] + 1;
                    document.getElementById('flipped').style.display = "";
                    document.getElementById('not-flipped').style.display = "none";
                }
            }
        }

        document.getElementById('range1').textContent = slider1.value;
        document.getElementById('range2').textContent = slider2.value;
        document.getElementById('range1-flipped').textContent = slider1.value;
        document.getElementById('range2-flipped').textContent = slider2.value;

        slider1.min = rangeMin;
        slider2.min = rangeMin;
        slider1.max = rangeMax;
        slider2.max = rangeMax;

        return this;
    },

});