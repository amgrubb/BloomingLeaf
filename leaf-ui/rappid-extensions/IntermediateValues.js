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
        '</div>',
        '</div>',
        '</div>',
        '<br>',
        '</script>'].join(''),
    
    events:{
        'click .closeIntermT': 'dismissInterm',
    },

    render: function(){
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.loadIntermediate();
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
        // TODO: Hate this, can we make it better?
        for (var s = 0; s < absoluteTimePointsList.length; s++) {
            $('#header-row').append('<th>Absolute</th>');
            $('#intentionRows').append('<th>' + absoluteTimePointsList[s] + '</th>');
        }

        /**
         * Make row for each intention
         */
        for (let intentionCell of this.model.getElements().filter(element => element instanceof joint.shapes.basic.Intention)){
            var userEvaluations = this.model.get('userEvaluationList').filter(userEvals => userEvals.get('intentionID') == intentionCell.id);
            var intentionUserEvaluationsView = new IntentionUserEvaluationsView({model: intentionCell.get('intention'), 
                                                                                 intentionID: intentionCell.id, 
                                                                                 allAbsoluteTimePoints: absoluteTimePointsList,
                                                                                 userEvals: userEvaluations,
                                                                                 maxAbsTime: this.model.get('maxAbsTime')});
            this.$('#interm-list').append(intentionUserEvaluationsView.el);
            intentionUserEvaluationsView.render();
        }
    },

    dismissInterm: function (){
        this.remove();
    },

    getAllAbsoluteTimePoints: function(){
        var absTimeValues = this.model.get('absTimePtsArr');
        var constraintTimes = this.model.get('constraints').map(constraint => constraint.get('absTP'));
        var linkTimes = this.model.getLinks().map(linkCell => linkCell.get('link').get('absTP'));
        var intentionTimes = [];
        // TODO: Messy, can we clean up?
        this.model.getIntentions().forEach(intentionBBM => intentionBBM.getFuncSegments()?.forEach(funcSegmentsList => {
            if (funcSegmentsList != null){
                for (let funcSeg of funcSegmentsList){
                    funcSegTP = funcSeg.get('startAT')
                    if (funcSegTP != -1){
                        intentionTimes.push(funcSegTP);
                    }
                }
            }
        }));
                                                        
        var allTimes = absTimeValues.concat(constraintTimes).concat(linkTimes).concat(intentionTimes);
        var absoluteTimePointsList = Array.from(new Set(allTimes));
        absoluteTimePointsList.sort(function(a,b) {return a-b})
        return absoluteTimePointsList;
    }
});

var IntentionUserEvaluationsView = Backbone.View.extend({
    model: IntentionBBM,

    tagName: 'tr',

    className: 'intention-row',

    initialize: function(options){
        this.intentionID = options.intentionID;
        this.userEvals = options.userEvals;
        this.allAbsoluteTimePoints = options.allAbsoluteTimePoints;
    },

    template: [
        '<script type="text/template" id="intention-user-eval-template">',
            '<td class="intention-name"> "<%= nodeName %>" </td>',
        '</script>'
    ].join(''),

    render: function(){
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        this.$el.append(satisfactionValuesDict[this.model.get('initialValue')].satValue);
        this.loadSelect();
        return this;
    },

    loadSelect: function(){
        myNull = null;

        // Iterate through all time points
        for (let absTime of this.allAbsoluteTimePoints){
            funcType = null;
            refPair = null;
            initValue = null;
            
            var userEval = null;
            if (this.userEvals.filter(userEval => userEval.get('absTP') == absTime).length != 0){
                userEval = currentUserEvals[0];
            }

            for (let i=0; i < this.model.getFuncSegments()?.length; i++){
                funcSeg1 = this.functionSegmentList[i];
                startAT1 = funcSeg1.get('startAT');
                
                // If i is not the last index in the function segments list
                if (i != this.model.getFuncSegments()?.length-1){
                    // Get the next function segment and it's startAT
                    funcSeg2 = this.functionSegmentList[i+1];
                    startAT2 = funcSeg2.get('startAT')
                    // If both startATs are valid and the absTime falls between them
                    // Stop iterating through function segments
                    if (startAT1 != myNull && startAT2 != myNull && 
                        startAT1 <= absTime && startAT2 > absTime){
                        funcType = funcSeg1.get('type');
                        refPair = funcSeg1.get('refEvidencePair');
                        break;
                    }
                // If this is both the last index and the first index
                // Set an initial value (used for I and D functions) 
                // And stop iterating through function segments
                } else if (i == 0){
                    funcType = funcSeg1.get('type');
                    refPair = funcSeg1.get('refEvidencePair');
                    initValue = this.model.get('initialValue');
                    break;
                }
            } 

            // Get funcType from above, and use it to set optionsList
            switch (funcType) {
                case "I":
                    var optionsList = this.increasingOrDecreasing(initValue, refPair, true);
                case "D":
                    var optionsList = this.increasingOrDecreasing(initValue,refPair, false);
                case "C":
                    var optionsList = [refPair];
                default:
                    var optionsList = ['0000', '0011', '0010', '1100', '0100']

            }

            // Create a select menu for each time point on each intention
            var selectUserEvaluationView = new SelectUserEvaluationView
                                                ({intentionID: this.intentionID,
                                                  absTimePt: absTime, 
                                                  optionsList: optionsList,
                                                  userEval: userEval});
                this.$el.append(selectUserEvaluationView.el);
                selectUserEvaluationView.render();
        }
    },

    /**
     * This function takes in an initial value
     * And returns a list of options with values 
     * That are either larger or smaller than the initial value
     * Depending on the increasing boolean parameter
     * 
     * @param {String} initValue 
     * @param {String} finalValue 
     * @param {Boolean} increasing If true - increasing, if false, decreasing
     * @returns Array of binary string options that fit the parameters
     */
    increasingOrDecreasing: function(initValue, finalValue, increasing){
        if (increasing){
            // IMPORTANT: This list must stay in order from least satisfied to most satisfied for this function to work
            var possibleValueList = ['0011','0010','0000','0100','1100'];
        } else {
            // IMPORTANT: This list must stay in order from most satisfied to least satisfied for this function to work
            var possibleValueList = ['1100','0100','0000','0010','0011'];
        }

        if(finalValue == null) {
            return possibleValueList.slice(possibleValueList.indexOf(initValue));
        } else if (initValue == null){
            return possibleValueList.slice(0,possibleValueList.indexOf(finalValue)+1);
        } else{
            return possibleValueList.slice(
            possibleValueList.indexOf(initValue),
            possibleValueList.indexOf(finalValue)+1);
        }
    },
});

var SelectUserEvaluationView = Backbone.View.extend({
    tagName: 'td',

    template: [
        '<select class="evaluation-value"></select>'
    ].join(''),

    events: {
        'change .evaluation-value':'updateEvaluationValue'
    },

    initialize: function(options){
        this.absTimePt = options.absTimePt;
        this.intentionID = options.intentionID;
        this.userEvaluation = options.userEval;
        this.optionsList = options.optionsList;    
    },

    render: function(){
        this.$el.html(_.template(this.template)());
        this.$('select').append(this.convertToOptions(this.optionsList));
        if (this.userEvaluation != null){
            this.$('select').val(this.userEvaluation.get('assignedEvidencePair'));
        } else {
            this.$('select').val('empty');
        }
    },

    updateEvaluationValue: function(){
        var evaluationValue = this.$('.evaluation-value').val();
        if (this.userEvaluation != null){
            if (evaluationValue == 'empty'){
                this.userEvaluation.destroy();
            } else {
                this.userEvaluation.set('assignedEvidencePair', evaluationValue);
            }
        } else {
            this.userEvaluation = new UserEvaluationBBM({intentionID: this.intentionID, 
                                                     absTP: this.absTimePt, 
                                                     assignedEvidencePair: evaluationValue});
        }
        // TODO: add new value to graph collection
    },

    /**
     *
     * @param choiceList: A list that contains binary strings of valid values
     * @returns {List that contains strings that are the string encoding of the binary strings in the choiceList}
     */
    convertToOptions: function(choiceList){
        var theOptionString = this.binaryToOption('empty');
        for(var i = 0; i < choiceList.length; i++){
            var curString = this.binaryToOption(choiceList[i]);
            theOptionString += curString;
        }
        return theOptionString;
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
        }
        return null;
    }
});