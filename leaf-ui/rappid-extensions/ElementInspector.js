// All valid initial value and function combination
var validPair = {
    "NT": {
        "validInitValue": ["0000", "0011", "0010", "1100", "0100", "(no value)"],
        "defaultValue": ["0000"]
    },
    "C":{
        "validInitValue": ["0000", "0011", "0010", "1100", "0100", "(no value)"],
        "defaultValue": ["0000"]
    },
    "R":{
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

    initialize: function() { // Listens for changes in the intentions
        this.listenTo(this, 'change: intention', this.initSatValueChanged); 
        // Saves this.model.get('intention) as a local variable to access it more easily
        this.intention = this.model.get('intention');
    },
     
    template: ['<script type="text/template" id="item-template">',
            '<div class="inspector-views">',
            '<label>Node Name:</label>',
            '<textarea class="cell-attrs-text"></textarea>',
            '<label>Initial Satisfaction Value:</label>',
            '<select id="init-sat-value">',
                '<option value="(no value)" disabled> (no value) </option>',
                '<option value="0000"> None (⊥, ⊥)</option>',
				'<option value="0011"> Satisfied (F, ⊥)</option>',
                '<option value="0010"> Partially Satisfied (P, ⊥) </option>',
                '<option value="0100"> Partially Denied (⊥, P)</option>',
                '<option value="1100"> Denied (⊥, F)</option>',
            '</select>',
            // '<br>',
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
                    '<select id="repeat-begin" class="repeat-select">',
                        '<option class="select-placeholder" selected disabled value="">Begin</option>',
                    '</select>',
                    '<select id="repeat-end" class="repeat-select">',
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
            
            '</script>'].join(''),

    events: {
        'change #init-sat-value':'initSatValueChanged',

        'change .function-type':'funcTypeChanged',
        'change .segment-functions':'updateHTML',
        
        'change .repeat-select':'selectRepeatValues',
        'change .repeat-select2':'selectNumRepeatValues',
        'change .repeat-select3':'selectAbsoluteLength',

        'click #segment-add': 'addSegment',
        'click #constraint-repeat': 'repeatConstraintControl',
        'click #constraint-restart': 'removeUserConstraints',
        'keyup .cell-attrs-text': 'nameAction',
        'clearInspector .inspector-views' : 'removeView',
    },

    /**
     * Initializes the element inspector using previously defined templates
     */
    render: function() {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()))
        
        // Attributes
        this.chart = new ChartObj();

        // Save html template to dynamically render more
        this.userConstraintsHTML = $("#new-user-constraints").last().clone();

        // Load initial value and node name
        this.$('.cell-attrs-text').val(this.intention.get('nodeName'));
        this.$('#init-sat-value').val(satisfactionValuesDict[this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair')].name);
              
        // Checks which function types are available based on initial satisfaction values
        this.checkInitialSatValue();

        if (!this.model.attr(".satvalue/value") && this.model.attr(".funcvalue/text") != "NB"){
            this.model.attr(".satvalue/value", 'none');
            this.model.attr(".funcvalue/text", ' ');
        }
        
        
        // Turn off repeating by default
        this.repeatOptionsDisplay = false;
        // Turn off display for repeat related elements and values
        this.setRepeatConstraintMode("TurnOff");

        // Load initial value for function type in the html select element
        if (this.intention.get('evolvingFunction') != null ) {
            var functionType = this.intention.get('evolvingFunction').get('type');

            if (functionType == 'UD') {
                this.renderUserDefined();
            } else {
                this.updateHTML();
            }
            
        }
        // this.$('.inspector-views').append(this.innerView.$el);
        this.updateCell();   
    },  
    
    /**
    * Removes the view so we don't have multiple ones in the sidebar
    */
     removeView: function(){
        this.remove();
    },

    /**
     * Checks the initial satisfaction value for a (no value).
     * If the initial satisfaction value is (no value), then set the
     * availible function options to be Stochastic
     * If not, set the function options so that all options are availible
    */
    checkInitialSatValue: function() {
        // Set correct dropdown options for function type based on initial satisfaction value
        $('option').show(); // Clear the previous selection
        // Initialize evolvingFunction so the function type can be set as 'NT'
        if (this.intention.get('evolvingFunction') == null) {
            this.intention.set('evolvingFunction', new EvolvingFunctionBBM({}));
        }
        if (this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair') == '(no value)'){
            // Hide all of the function options except for Stochastic is initial satisfaction value is '(no value)'
            $('option.B').hide(); 
            this.$('#user-constraints').hide();
        } else {
            this.$('#user-constraints').show();
        }
    },

    nameAction: function(event) {
        // 13 corresponds to the Enter key so when Enter is pressed the name is updated
        if (event.which === 13) {
            event.preventDefault();
        }

        var text = this.$('.cell-attrs-text').val();

        text = text.replace(/[^\w\n-]/g, ' ');

        this.model.attr({'.name': {text: text} });
        this.intention.set('nodeName', text); 

    },

    /**
     * Initializes components to display user defined functions
     */
    renderUserDefined: function(){  
        $(".function-type").val('UD');

        // TODO: do we need this??
        //     if (functionSegment !== funcSegments[len - 1]) {
        //         // if it is not the last function segment, clone the select tags,
        //         // and grey out the current select tags
        //         var html = this.userConstraintsHTML.clone();
        //         html.appendTo(this.$('#all-user-constraints'));
        //     }
        //     })

        if (this.intention.get('evolvingFunction').get('hasRepeat')) {
            this.repeatOptionsDisplay = true;

            this.setRepeatConstraintMode("TurnOn");
            this.setRepeatConstraintMode("Update");

            $("#repeat-begin").val(this.intention.get('evolvingFunction').get('repStart'));
            $("#repeat-end").val(this.intention.get('evolvingFunction').get('repStop'));
            $("#repeat-end2").val(this.intention.get('evolvingFunction').get('repCount'));
            $("#repeat-end3").val(this.intention.get('evolvingFunction').get('repAbsTime'));
        }

        this.updateChartUserDefined();  
    },

    /**
     * Saves the initial satisfaction value into the UserEvaluation
     * corresponding to this intention.
     *
     * This function is called on change for #init-sat-value,
     */
    initSatValueChanged: function(event) {
        var initValue = this.$('#init-sat-value').val();
        this.intention.changeInitialSatValue(initValue);
        this.checkInitialSatValue();
        this.updateCell();
        this.updateHTML(event);

    },

    /**
     * Clears all FuncSegments for this intention's
     * EvolvingFunction and adds new FuncSegments according to the current
     * function type.
     *
     * This function is called on change for .function-type.
     */
    funcTypeChanged: function(event) {
        this.intention.setEvolvingFunction(this.$('.function-type').val());
        this.updateCell();
        this.updateHTML(event);
    },

    /**
     * Updates the possible satisfaction values and buttons selections based on current
     * function type.
     *
     * This function is called on change for .user-function-type
     */
    updateHTML: function(event) {
        // Check if selected init sat value and functionType pair is illegal
        // Only runs if evolvingFunction is defined and therefore there is a function type
        this.validityCheck(event);

        if (this.intention.get('evolvingFunction') != null) {
            var functionType = this.intention.get('evolvingFunction').get('type');
            
        }
        else { var functionType = null;}

        // All functions that have satisfaction value associated with it
        var funcWithSatValue = ["I", "D", "RC", "MP", "MN", "UD"];

        
        // Load initial value for function type in the html select element
        if (functionType == 'UD') {
            this.$('.function-type').val(functionType);
            this.$('#user-constraints').show("fast");
        } else {

            if (functionType == 'NB') {
                $('#init-sat-value').prop('disabled', true);
                $('#init-sat-value').css('background-color','grey');
            } else {
                this.$('.function-type').val(functionType);
                this.$('#user-constraints').hide();
                this.$('#init-sat-value').prop('disabled', false);
            }
        }
        this.rerender();
        this.updateChart(); 
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
                if (initValueChanged && initValue != "(no value)"){this.$('.function-type').val('none');}
                if (initValueChanged && initValue == "(no value)"){this.$('.function-type').val('C');}
                var newValue = validPair[functionType]['defaultValue'];
                if (funcTypeChanged){this.$('#init-sat-value').val(newValue);}

            }
        }  
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
    updateChart: function() {
        /**
        console.log(this.intention.get('evolvingFunction'));
        // && this.intention.get('evolvingFunction').get('type') != 'NT'
        if (this.intention.get('evolvingFunction') != null) {
            var funcType = this.intention.get('evolvingFunction').get('type');
            var initVal = satisfactionValuesDict[this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair')].chartVal;
            if (this.intention.getFuncSegments()[0] != null) {
                var satVal = satisfactionValuesDict[this.intention.getFuncSegments()[0].get('refEvidencePair')].chartVal;
            }
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
        }
        */
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
    updateChartUserDefined: function() {
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
                } else if (currFunc === 'C'){
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
     * Adds new FunctionSegmentBBM for the user defined function and renders a new FunctionSegmentView.
     * This function is called on click for #segment-add.
     * This function is also called when loading user defined
     * constraints from previously stored.
     */
    addSegment: function() {
        // Adds a new FunctionSegmentBBM to the functionSegList
        this.intention.addUserDefinedSeg("C", "0000");
        var funcSegList = this.intention.getFuncSegments();
        // Sets current to false so it becomes disabled for the previous FunctionSegmentBBM to 
        if(funcSegList.length>1){
            funcSegList[funcSegList.length-2].set('current', false);
        }
        // creates a new FunctionSegmentView from the new FunctionSegmentBBM
        var newFuncSeg = funcSegList[funcSegList.length-1]
        var functionSegView = new FuncSegView({model: newFuncSeg, intention: this.intention, hasUD: true, index: funcSegList.length-1, initSatValue: this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair')});
        // Appends new FuncSegView to the html and renders it 
        $('#segment-functions').append(functionSegView.el);
        functionSegView.render(); 

        if (this.repeatOptionsDisplay) {
            this.setRepeatConstraintMode("Update");
        }
        this.updateChartUserDefined();
    },

    /**
     * Toggles the display for the user defined function's
     * repeat feature.
     * This function is called on click for #constraint-repeat.
     */
    repeatConstraintControl: function(){
        if (!this.repeatOptionsDisplay){
            this.setRepeatConstraintMode("TurnOn");
            this.setRepeatConstraintMode("Update");
        } else if (this.repeatOptionsDisplay){
            this.setRepeatConstraintMode("TurnOff");
            this.intention.get('evolvingFunction').removeRepFuncSegments();
            this.updateChartUserDefined();
        }
    },

    /**
     * Handles the changes done for the select elements for the
     * repeat feature for user defined functions, by ensuring that
     * the begin and end range of repeated constraints are valid.
     * This function is called on change for .repeat-select
     * (the select elements for repeat begin and end)
     */
    selectRepeatValues: function(){
        var begin = $("#repeat-begin").val();
        var end = $("#repeat-end").val();
        // TODO: Update template, eventually an absTime parameter will be added to the user input
        var start = $("").val();
        var stopRep = $("").val();
        var count = $("#repeat-end2").val();
        // var absTime = $("").val();
        var absTime = null;

        if (begin === null || end === null) {
            return;
        }

        var nextChar = String.fromCharCode(begin.charCodeAt(0) + 1);

        if (begin >= end) {
            $("#repeat-error").text("Repeated range must be chronological");
            $("#repeat-error").show("fast");

        } else if (nextChar == end) {
            $("#repeat-error").text("Repeated range must be at least two apart");
            $("#repeat-error").show("fast");

        } else {

            $("#repeat-error").hide();
            this.intention.get('evolvingFunction').setRepeatingFunction(begin, end, count, absTime);
        }
        this.updateChartUserDefined(); 
    },

    /**
     * Ensures that the number of repeat counts is a valid number,
     * updates the constraintsObject with the new repeat count and
     * updates the chart in case there are constraint lines that need
     * to be coloured red.
     *
     * This function is called on change for #repeat-end2.
     */
    selectNumRepeatValues: function(){
        var repVal = $("#repeat-end2").val();
        if (repVal < 2) {
            $('#repeat-end2').val(2);
        }
        this.intention.get('evolvingFunction').set('repCount', repVal);
        this.updateChartUserDefined(); 
    },

    /**
     * Ensures that the absolute length is a non negative number and
     * updates the constraintsObject to have the new absolute length.
     *
     * This function is called on change for #repeat-end3.
     */
    selectAbsoluteLength: function(){
        var absLength = $("#repeat-end3").val();
        if (absLength < 0) {
            $('#repeat-end3').val(0);
        }
        this.intention.get('evolvingFunction').set('repAbsTime', absLength);
        this.updateChartUserDefined();
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
            var numSegments = this.intention.getFuncSegments().length;
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

                var funcSegments = this.intention.getFuncSegments();

                // Set select options
                for (var i = 0; i < funcSegments.length - 1; i++) {
                    var beginVal = funcSegments[i].get('startTP');

                    var startCheck = this.intention.getFuncSegments()[i].get('startTP');
                    if (startCheck == '0') {
                        var endVal = 'B';
                    }        
                    else {
                        var endVal = String.fromCharCode(startCheck.charCodeAt(0) + 2);
                    }

                    $("#repeat-begin").append(
                        $('<option></option>').val(beginVal).html(beginVal)
                    );
                    $("#repeat-end").append(
                        $('<option></option>').val(endVal).html(endVal)
                    );
                }
                var repNum = this.intention.get('evolvingFunction').get('repCount');
                var absTime = this.intention.get('evolvingFunction').get('repAbsTime');
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
    removeUserConstraints: function(){
        $('#init-sat-value').prop('disabled', '');
        $('#init-sat-value').css("background-color","");

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
    updateCell: function() {     
        IntentionColoring.refresh();
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

    clear: function(){
        this.$el.html('');
    },

    renderFunctionSegments: function() { 
        // Removes functions segments that are currently displayed
        $('#segment-functions').empty();
        if (this.intention.get('evolvingFunction').get('type') == 'NT'){
            $(".text-label").css("visibility", "hidden");
        }
        // Only creates the FunctionSegmentView if there is a function segment
        if(this.intention.get('evolvingFunction') != null && this.intention.get('evolvingFunction').get('type') != 'NT'){
            var hasUD = false; 
            if (this.intention.get('evolvingFunction').get('type') === 'UD') {
                var hasUD = true;
            }
            var funcSegList = this.intention.getFuncSegments();
            var i = 0;
            // Creates a FuncSegView for each of the function segment in the functionSegList
            funcSegList.forEach(
                funcSeg => {
                    var functionSegView = new FuncSegView({model: funcSeg, intention: this.intention, hasUD: hasUD, index: i, initSatValue: this.intention.getUserEvaluationBBM(0).get('assignedEvidencePair')});
                    $('#segment-functions').append(functionSegView.el);
                    functionSegView.render(); 
                    i++; 
            })
        }
    },

    rerender: function() {
        // Ads absTime label
        if(this.intention.getFuncSegments().length != 0) {
            $(".text-label").css("visibility", "visible");
        }
        // Renders all of the FuncSegViews
        this.renderFunctionSegments();
        return this;
    },
});

/************************************************** FunctionSegmentBBM View **************************************************/

var FuncSegView = Backbone.View.extend({
     model: FunctionSegmentBBM, 

    initialize: function(options){ 
        // Reference to the parent intention
        this.intention = options.intention;
        // Sets the stopTP to be one step after the startTP
        if (this.model.get('startTP') != '0') {
            this.stopTP = String.fromCharCode(this.model.get('startTP').charCodeAt(0) + 1);
        }
        else {
            this.stopTP = 'A';
        }
        // Boolean if the function segment is a part of a UD function
        this.hasUD = options.hasUD;
        this.index = options.index;
        this.initSatValue = options.initSatValue;
        // 
        this.satValueDict = {
            "satisfied": "0011",
            "partiallysatisfied": "0010",
            "partiallydenied": "0100",
            "denied": "1100",
            "none": "0000",
            "(no value)": "(no value)"
        };
        // Listens to if the current parameter in the FunctionSegmentBBMs changes
        this.listenTo(this.model, 'change:current', this.checkCurr)
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
                    '<option value=none <% if (refEvidencePair === "0000") { %> selected <%} %>> None (⊥, ⊥) </option>',
                    '<option value=satisfied <% if (refEvidencePair === "0011") { %> selected <%} %>> Satisfied (F, ⊥) </option>',
                    '<option value=partiallysatisfied <% if (refEvidencePair === "0010") { %> selected <%} %>> Partially Satisfied (P, ⊥) </option>',
                    '<option value=partiallydenied <% if (refEvidencePair === "0100") { %> selected <%} %>> Partially Denied (⊥, P)</option>',
                    '<option value=denied <% if (refEvidencePair === "1100") { %> selected <%} %>> Denied (⊥, F)</option>',
                '</select>',
                    '<output id = "stopTP-out" class = "seg-class" style="position:relative; left:8px; width:15px"> end </output>',
                '</div>',
                '</script>'].join(''),
    
    events: {
        'change #seg-sat-value':'setFuncSatValue',
        'change #seg-function-type' : 'checkFuncValue', 
        'keyup .seg-time': 'setAbsTime',
    },

    render: function() {
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
      
        // TODO: also disable it if it is part of a repeating segment
        // Disable the absTime parameter and set it to zero if its the first function segment
        if (this.index == 0) {
            this.$('.seg-time').val(0);
            this.$('.seg-time').prop('disabled', true);
        } else if (this.index != 0 && this.model.get('startAT') != null) {
            this.$('.seg-time').val(this.model.get('startAT'));
        }

        this.checkFuncValue();

        // For all function types except for UD disable the ability to select the function 
        this.$('#seg-function-type').prop('disabled', 'disabled');
        if ((this.hasUD === true) & (this.model.get('current') === true)) {
            this.$('#seg-function-type').prop('disabled', '');
        }

        // Have to manually add stopTP to html because it is not in the FunctionSegmentBBM
        this.$('#stopTP-out').val(this.stopTP);

        return this;
    },

    setAbsTime: function(event) {
        // 13 corresponds to the Enter key so when Enter is pressed the name is updated
        if (event.which === 13) {
             event.preventDefault();
        }
        
        var absTime = Number((this.$('.seg-time').val()));
        this.model.set('startAT', absTime);         
    },    

    setFuncSatValue: function () {
        this.model.set('refEvidencePair', this.$('#seg-sat-value').val()) // 4 digit representation
        // TODO: make it so the chart updates too 
        // this.intention.updateChart();  
    },

    checkFuncValue: function () {
        // set the function type to the type selected in the html
        this.model.set('type', this.$('#seg-function-type').val());
        
        // Disable the function satisfaction dropdown for constant and stochastic functions
        if (this.model.get('type') == 'C' || this.model.get('type') == 'R') {
            this.$('#seg-sat-value').prop('disabled', 'disabled');
        }
        else if (this.model.get('type') == 'R') {
            this.$("#seg-sat-value").html(this.satValueOptionsAll());
            this.$("#seg-sat-value").val("(no value)");
        } else {
            this.$('#seg-sat-value').prop('disabled', '');
        }

        if (this.hasUD == true) {
            this.checkUDFunctionValues()
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
        var markedValue = this.intention.get('evolvingFunction').getNthRefEvidencePair(1);
      
        if (functionType == 'R') {
            this.$('#seg-sat-value').html(this.satValueOptionsNoRandom());
        } else if (functionType == 'I') {
            this.$('#seg-sat-value').html(this.satValueOptionsPositiveOrNegative(initValue, true));
        } else if (functionType == 'D') {
            this.$('#seg-sat-value').html(this.satValueOptionsPositiveOrNegative(initValue, false));
        }
        if (markedValue) {
            if (this.satValueDict[markedValue != null]){
                this.$('#seg-sat-value').val(this.satValueDict[markedValue]);
            }
        }
        this.$('#seg-sat-value').change();
        return;
    },

     /**
     * Adds appropriate satisfaction values option tags
     * for .user-sat-value, which is the select tag used to
     * indicate satisfaction values when creating a user defined function.
     */
      checkUDFunctionValues: function() {
        var func = this.$("#seg-function-type").last().val();

        if (func == 'I' || func == 'D') {
            var prevVal = this.intention.get('evolvingFunction').getNthRefEvidencePair(2);
            if (func == 'I') {
                this.$("#seg-sat-value").html(this.satValueOptionsPositiveOrNegative(prevVal, true));
                this.$("#seg-sat-value").val("satisfied"); 
            } else {
                this.$("#seg-sat-value").html(this.satValueOptionsPositiveOrNegative(prevVal, false));
                this.$("#seg-sat-value").val("denied");
            }
        } else if (func == 'R') {
            this.$("#seg-sat-value").html(this.satValueOptionsAll());
            this.$("#seg-sat-value").val("(no value)")
            this.$("#seg-sat-value").prop('disabled', true);
            
        } else if (func == 'C') {
            this.$("#seg-sat-value").last().html(this.satValueOptionsAll());
            // Restrict input to initial satisfaction value if it is the first constraint
            if (this.index == 0) {
                this.$("#seg-sat-value").val(this.initSatValue);
                this.model.set('refEvidencePair', this.initSatValue);
            }
            if (this.index != 0) {
                this.$("#seg-sat-value").prop('disabled', '');
            }
        }
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
    satValueOptionsPositiveOrNegative: function (currentVal, postive) {
        var satVals = ["0011", "0010", "0000", "0100", "1100"];
        var result = '';

        if (postive) {
            var valuesList = satVals.slice(0, satVals.indexOf(currentVal));
        } else {
            var valuesList = satVals.slice(satVals.indexOf(currentVal) + 1);
        }

        for (let value of valuesList) {
            result += this.binaryToOption(value);
        }
        return result;
    },

    satValueOptionsAll: function () {
        var result = '';
        for (let value of ["0011", "0010", "0000", "0100", "1100", "unknown"]) {
            result += this.binaryToOption(value);
        }
        return result;
    },

    satValueOptionsNoRandom: function () {
        var result = '';
        for (let value of ["0011", "0010", "0100", "1100"]) {
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
        binaryToOption: function(binaryString){
        switch(binaryString){
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

    checkCurr: function () {
        this.$('#seg-function-type').prop('disabled', true);
        this.$('#seg-sat-value').prop('disabled', true);
    }
});

