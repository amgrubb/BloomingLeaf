/**
* Displays the Intermediate Values modal of the current Config for the user
*/
var IntermediateValuesTable = Backbone.View.extend({
    model: joint.dia.BloomingGraph,

    template: ['<script type="text/template" id="item-template">',
        '<div id="intermediateTable" class="intermT">',
        '<div class="intermContent">',
        '<div class="intermHeader">',
        '<span class="closeIntermT">&times;</span>',
        '<h2>Intermediate Values Table</h2>',
        '</div>',
        '<div class="intermBody">',
        '<table id="interm-list" class="interm-table">',
        '<thead id = "header">',
        '<tr id="header-row">',
        '<th style="width:110px"></th>',
        '<th>  Initial Value  </th>',
        '</tr>',
        '</thead>',
        '<tr id="intentionRows">',
        '<th>',
        '<div class="divisionLine"></div>',
        '<div class="intentionPlace"><b>Intention</b></div>',
        '<div class="timePlace"><b>Timeline</b></div>',
        '<div class="outerdivslant borderdraw2">',
        '</div>',
        '<div class = "innerdivslant borderdraw2">',
        '</div>',
        '</th>',
        '<th>0</th>',
        '</tr>',
        '</table>',
        '<button id="btn-save-intermT" class="analysis-btns inspector-btn sub-label green-btn" style="border-radius:40px;">Save</button>',
        '</div>',
        '</div>',
        '</div>',
        '<br>',
        '</script>'].join(''),
    
    events:{
        'click .closeIntermT': 'dismissInterm',
        'click #btn-save-intermT': 'saveInterm',
    },

    render: function(){
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        // this.loadIntermediate();
        return this;
    },

    rerender: function(){
		this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        return this;
    },

    /**
     * Function to load in correct rows and dropdowns for IVT
     */
    loadIntermediate: function() {
        var absoluteTimePointsList = this.getAllAbsoluteTimePoints();
        
        /** 
         * Add all time points to top of table  
         */
        for (var s = 0; s < absoluteTimePointsList.length; s++) {
            $('#header-row').append('<th>Absolute</th>');
            $('#intentionRows').append('<th>' + absTimeValues[s] + '</th>');
        }

        /**
         * Make row for each intention
         */
        for (let intentionCell in this.model.getElements().filter(element => element instanceof joint.shapes.basic.Intention)){
            var intentionUserEvaluationsView = new IntentionUserEvaluationsView({model: intentionCell.get('intention'), intentionID: intentionCell.id, allAbsoluteTimePoints: absoluteTimePointsList});
            $('#interm-list').append(intentionUserEvaluationsView.el);
            intentionUserEvaluationsView.render();
        }

        // Needed after looping through and appending rows to avoid voiding the select
        $('.intention-row').each(function () {
            $(this).find('select').each(function () {
                var nodeID = $(this).attr('nodeID');
                var absTime = $(this).attr('absTime');
                var intEval = this.model.getUserEvaluationByID(nodeID, absTime);
                if (intEval != null) {
                    $(this).val(intEval.evaluationValue);
                }
            });
        });
    },

    dismissInterm: function (){
        this.remove();
    },

    /**
     * Save the intermediate table values into model
     */
    saveInterm: function() {
        // Clear all intention evaluations with the exception
        // of the evaluations on the initial time point
        // this.model.clearUserEvaluations();
        
        // // for each row of the table
        // $('.intention-row').each(function () {
        //     // for each column of the current row
        //     $(this).find('select').each(function () {
        //         var nodeID = $(this).attr('nodeID');
        //         var absTime = $(this).attr('absTime');
        //         var evalLabel = $(this).find(":selected").val();

        //         if (evalLabel === 'empty') {
        //             return;
        //         }

        //         this.model.get('userAssignmentsList').push(new UserEvaluation(nodeID, absTime, evalLabel));
        //     });
        // });
        this.dismissInterm();
    },

    getAllAbsoluteTimePoints: function(){
        var absTimeValues = this.model.get('absTimePtsArr');
        var constraintTimes = this.model.get('constraints').map(constraint => constraint.get('absTP'));
        var linkTimes = this.model.getLinks().map(linkCell => linkCell.get('link').get('absTP'));
        var intentionTimes = [];
        this.model.getIntentions().forEach(intentionBBM => intentionBBM.getFuncSegments())
                                                        .forEach(funcSegmentsList => {
                                                            if (funcSegmentsList != null){
                                                                for (let funcSeg of funcSegmentsList){
                                                                    funcSegTP = funcSeg.get('startAT')
                                                                    if (funcSegTP != -1){
                                                                        intentionTimes.push(funcSegTP);
                                                                    }
                                                                }
                                                            }
                                                        });
        
        var allTimes = absTimeValues.concat(constraintTimes).concat(linkTimes).concat(intentionTimes);
        var absoluteTimePointsList = Array.from(new Set(allTimes));
        absoluteTimePointsList.sort(function(a,b) {return a-b})
        return absoluteTimePointsList;
    }
})

var IntentionUserEvaluationsView = Backbone.View.extend({
    model: IntentionBBM,

    initialize: function(options){
        this.intentionID = options.intentionID;
        this.allAbsoluteTimePoints = options.allAbsoluteTimePoints;
    },

    template: [
        '<script type="text/template" id="intention-user-eval-template">',
        '<tr class="intention-row>',
            '<td> "<%= nodeName %>" </td>',
            '<%= initialValue %>',
        '</tr>',
        '</script>'
    ].join(''),

    render: function(){
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.loadSelect();
    },

    loadSelect: function(){
        for (let absTimePt of this.allAbsoluteTimePoints){
            var selectUserEvaluationView = new SelectUserEvaluationView
                                                ({intentionID: this.intentionID,
                                                  absTimePt: absTimePt, 
                                                  functionSegmentList: this.model.getFuncSegments(),
                                                  funcType: this.model.get('functionType'),
                                                  initValue: this.model.get('initialSatValue')});
            $('.intention-row').append(selectUserEvaluationView.el);
            selectUserEvaluationView.render();
        }
    }

})

var SelectUserEvaluationView = Backbone.View.extend({
    template: [
        '<select class="evaluation-value"></select>'
    ].join(''),

    events: {
        'change .evaluation-value':'updateEvaluationValue'
    },

    initialize: function(options){
        this.funcType = options.funcType;
        this.absTimePt = options.absTimePt;
        this.intentionID = options.intentionID;
        this.initValue = options.initValue;
        this.functionSegmentList = options.functionSegmentList;
        this.allOptions = ['0000', '0011', '0010', '1100', '0100', 'empty', 'no value']
        this.userEvaluation = null;
    },

    render: function(){
        this.$el.html(_.template(this.template)());
        this.$('select').append(this.getOptionsByType());

    },

    updateEvaluationValue: function(){
        var evaluationValue = this.$('.evaluation-value').val();
        if (this.userEvaluation != null){
            this.userEvaluation.destroy();
        }
        // TODO: Check w/ Alicia for intended behavoir and handle null/no value
        this.userEvaluation = new UserEvaluationBBM({intentionID: this.intentionID, 
                                                     absTP: this.absTimePt, 
                                                     assignedEvidencePair: evaluationValue});
        // add new value to graph collection
    },

    getOptionsByType: function(){
        var lastTP = -1;
        var lastFuncSeg = this.intention.getFuncSegments()[-1];
        var finalValue = lastFuncSeg.get('refEvidencePair');
        var lastTP = lastFuncSeg.get('startAT');

        switch (func) {
            case 'I':
                options = this.increasing(this.initValue,'noFinal');
                break;
            case 'D':
                options = this.decreasing(this.initValue,'noFinal');
                break;
            case 'C':
                options = this.constant(this.initValue);
                break;
            case 'R':
                options = this.stochastic();
                break;
            case 'MP':
                /** 
                 * If the absoluteTP is less than the last constraints time point
                 * Use the evaluation value from the first function segment to determine options
                 */
                 if (this.absTimePt < lastTP) {
                    options = this.increasing(initValue, this.functionSegmentList[0].get('refEvidencePair'));
                /**
                 * Else use the evaluation value from the last function segment to determine options
                 */
                } else {
                    options = this.convertToOptions([finalValue]);
                }
                break;
            case 'MN':
                /** 
                 * If the absoluteTP is less than the last constraints time point
                 * Use the evaluation value from the first function segment to determine options
                 */
                if (this.absTimePt < lastTP) {
                    options = this.decreasing(initValue, this.functionSegmentList[0].get('refEvidencePair'));
                /**
                 * Else use the evaluation value from the last function segment to determine options
                 */
                } else {
                    options = this.convertToOptions([finalValue]);
                }
                break;
            case 'CR':
                /** 
                 * If the absoluteTP is less than the last constraints time point
                 * Use the evaluation value from the last function segment to determine options
                 */
                // TODO: I feel like this should be the first value but check with Alicia before changing
                if (this.absVal < lastTP){
                    options = this.convertToOptions([finalValue]);
                /**
                 * Else allow any options
                 */
                } else {
                    this.convertToOptions(this.allOptions);
                }
                break;
            case 'RC':
                /** 
                 * If the absoluteTP is less than the last constraints time point
                 * Allow any options
                 */
                if (this.absVal < lastTP){
                    this.convertToOptions(this.allOptions);
                /** 
                 * Else se the evaluation value from the last function segment 
                 * to determine options
                 */
                } else {
                    options = this.convertToOptions([finalValue]);
                }
                break;
            case 'SD':
                /** 
                 * If the absoluteTP is less than the last constraints time point
                 * Allow only Satisfied
                 */
                if (this.absVal < lastTP) {
                    options = this.convertToOptions(['0011']);
                /**
                 * Else allow only Denied
                 */
                } else {
                    options = this.convertToOptions(['1100']);
                }
                break;
            case 'DS':
                /** 
                 * If the absoluteTP is less than the last constraints time point
                 * Allow only Denied
                 */
                if (this.absVal < lastTP) {
                    options = this.convertToOptions(["1100"]);
                /**
                 * Else allow only Satisfied
                 */
                } else {
                    options = this.convertToOptions(['0011']);
                }
                break;
            case 'UD':
                // TODO
                // If the abs time pt falls between two consecutive func segments
                // We restrict based on type
                // Otherwise you can choose any values
                options = this.convertToOptions(this.allOptions);
                break;
            default:
                options = this.convertToOptions(this.allOptions);
                break;
        }
        return options;
    },
 
    /**
     *This function takes in an initial value and return a list of strings for options that contains values that are larger than the initial value
     */
    increasing: function(initValue, finalValue){
        // IMPORTANT: This list must stay in order from least satisfied to most satisfied for this function to work
        var possibleValueList = ['0011','0010','0000','0100','1100'];
        if(finalValue === 'noFinal') {
            return this.convertToOptions(possibleValueList.slice(possibleValueList.indexOf(initValue)));
        }
        else{
            return this.convertToOptions(possibleValueList.slice(
            possibleValueList.indexOf(initValue),
            possibleValueList.indexOf(finalValue)+1));
         }
    },
 
    /**
     *This function takes in an initial value and return a list of strings for options that contains values that are smaller than the initial value
     */
    decreasing: function(initValue,finalValue){
        // IMPORTANT: This list must stay in order from most satisfied to least satisfied for this function to work
        var possibleValueList = ['1100','0100','0000','0010','0011'];
        if(finalValue === 'noFinal') {
            return this.convertToOptions(possibleValueList.slice(possibleValueList.indexOf(initValue)));
        } else {
            return this.convertToOptions(possibleValueList.slice(
                possibleValueList.indexOf(initValue),
                possibleValueList.indexOf(finalValue)+1));
        }
    },
 
    /**
     *This function takes in an initial value and return a list of strings for options that contains values that are equal to the initial value
     */
    //TODO: Do we need constant? Can we just select the constant value on all and disable?
    constant: function(initValue){
        return this.convertToOptions([initValue]);
    },
 
 
    /**
     *
     * @returns {a list of strings for options that contains values that contains all possible values}
     */
    stochastic: function(){
        var possibleValueList = ['0000','0011','0010','1100','0100', 'no value'];
        return this.convertToOptions(possibleValueList);
    },
 
     /**
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
             case 'empty':
                 return `<option value="empty"> --- </option>`;
             case 'no value':
                 return `<option value="(no value)">(no value)</option>`;
         }
         return null;
    },
 
     /**
      *
      * @param choiceList: A list that contains binary strings of valid values
      * @returns {List that contains strings that are the string encoding of the binary strings in the choiceList}
      */
    convertToOptions: function(choiceList){
         var theOptionString = ``;
         for(var i = 0; i < choiceList.length; i++){
             var curString = this.binaryToOption(choiceList[i]);
             theOptionString += curString;
         }
         return theOptionString;
    },

});