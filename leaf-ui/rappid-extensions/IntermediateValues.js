myNull = null;
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
        '<div class="editWarning" style="text-align:center; "> Note: Removing an Assigned Time from an Intention will clear its User Evaluations List </div>',
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
        for (var s = 0; s < absoluteTimePointsList.length; s++) {
            $('#header-row').append('<th>Absolute</th>');
            $('#intentionRows').append('<th>' + absoluteTimePointsList[s] + '</th>');
        }

        /**
         * Make row for each intention
         */
        for (let intentionBBM of this.model.getIntentions()){
            var intentionUserEvaluationsView = new IntentionUserEvaluationsView({model: intentionBBM,  
                                                                                 allAbsoluteTimePoints: absoluteTimePointsList});
            this.$('#interm-list').append(intentionUserEvaluationsView.el);
            intentionUserEvaluationsView.render();
        }
    },

    /**
     * Remove view
     */
    dismissInterm: function (){
        this.remove();
    },

    /**
     * Gets lists of all absolute time points from accross the graph object
     * And combines them into one list sorted in ascending order
     * 
     * @returns sorted list of all time points in model
     */
    getAllAbsoluteTimePoints: function(){
        var absTimeValues = this.model.get('absTimePtsArr');
        var constraintTimes = this.model.get('constraints').map(constraint => constraint.get('absTP'));
        var linkTimes = this.model.getLinks().map(linkCell => linkCell.get('link').get('absTime'));
        var intentionTimes = [];
        this.model.getIntentions().forEach(intentionBBM => intentionBBM.getFuncSegments()?.forEach(funcSeg => {
            funcSegTP = funcSeg.get('startAT')
            if (funcSegTP != myNull){
                intentionTimes.push(funcSegTP);
            }
        }));
                                                        
        var allTimes = absTimeValues.concat(constraintTimes).concat(linkTimes).concat(intentionTimes);
        var absoluteTimePointsList = Array.from(new Set(allTimes));
        absoluteTimePointsList.sort(function(a,b) {return a-b})
        return absoluteTimePointsList.filter(TP => TP != 0 && TP != -1);
    }
});

/**
 * Each instance of this view represents one Intention row in the IVT
 * 
 * It takes in an IntentionBBM as its model, and uses that and the allAbsoluteTimePoints list
 * In order to determine and create the appropriate select menu for each time point
 */
var IntentionUserEvaluationsView = Backbone.View.extend({
    model: IntentionBBM,

    tagName: 'tr',

    className: 'intention-row',

    initialize: function(options){
        this.allAbsoluteTimePoints = options.allAbsoluteTimePoints;
        this.functionSegmentList = this.model.getFuncSegments();
    },

    template: [
        '<script type="text/template" id="intention-user-eval-template">',
            '<td class="intention-name"> <%= nodeName %> </td>',
        '</script>'
    ].join(''),

    render: function(){
        this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        // Add in initial value for TP 0
        this.$el.append(satisfactionValuesDict[this.model.getUserEvaluationBBM(0).get('assignedEvidencePair')].satValue);
        // Load select dropdowns for all other TPs
        this.loadSelect();
        return this;
    },

    /**
     * Iterates through all absolute time points
     * And determines the appropriate range of value options
     * Then passes those options to a SelectUserEvaluationView
     * To be converted into a select dropdown and added to the table
     */
    loadSelect: function(){

        // Iterate through all time points
        for (let absTime of this.allAbsoluteTimePoints){
            funcType = null;
            refPair = null;
            initValue = null;

            // Iterate through all FuncSegBBMs
            for (let i=0; i < this.functionSegmentList.length; i++){
                // Get current FunSegBBM and its startAT
                funcSeg1 = this.functionSegmentList[i];
                startAT1 = funcSeg1.get('startAT');
                
                // If i is not the last index in the function segments list
                if (i != this.functionSegmentList.length-1){
                    // Get the next function segment and it's startAT
                    funcSeg2 = this.functionSegmentList[i+1];
                    startAT2 = funcSeg2.get('startAT');
                    // If both startATs are valid and the absTime falls between them
                    // Stop iterating through function segments
                    if (startAT1 != myNull && startAT2 != myNull && 
                        startAT1 <= absTime && startAT2 > absTime){
                        funcType = funcSeg1.get('type');
                        refPair = funcSeg1.get('refEvidencePair');
                        // If there is a user evaluation with a TP between (startAT1 inclusive) the two FuncSegments 
                        // Use that assigned evidence pair as initial value
                        lastUserEval = this.model.getLastUserEvaluationBetweenTPs(startAT1, startAT2);
                        if (lastUserEval != null){
                            initValue = lastUserEval.get('assignedEvidencePair');
                        }
                        break;
                    }
                // If this is both the last index and the first index
                // Set an initial value (used for I and D functions) 
                // And stop iterating through function segments
                } else if (i == 0){
                    funcType = funcSeg1.get('type');
                    refPair = funcSeg1.get('refEvidencePair');
                    initValue = this.model.getUserEvaluationBBM(0).get('assignedEvidencePair');
                    break;
                } else {
                    // If AT is not null and less than absTime
                    if (startAT1 != myNull &&
                        startAT1 <= absTime){
                        // Use last UserEvaluationBBM assigned evidence pair as initial value
                        // Since it is 0 inclusive there will always be at least one UserEval
                        initValue = this.model.getLastUserEvaluationBetweenTPs(0, startAT1)
                                                .get('assignedEvidencePair');
                        funcType = funcSeg1.get('type');
                        refPair = funcSeg1.get('refEvidencePair');
                        break;
                    }  
                }
            }
            // Get funcType from above, and use it to set optionsList
            switch (funcType) {
                case "I":
                    var optionsList = this.increasingOrDecreasing(initValue, refPair, true);
                    break;
                case "D":
                    var optionsList = this.increasingOrDecreasing(initValue,refPair, false);
                    break;
                case "C":
                    var optionsList = [refPair];
                    break;
                default:
                    var optionsList = ['0000', '0011', '0010', '1100', '0100']

            }

            // Create a select menu for each time point on each intention
            // And add it to row
            var selectUserEvaluationView = new SelectUserEvaluationView
                                                ({intention: this.model,
                                                  absTimePt: absTime, 
                                                  optionsList: optionsList});
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
            var possibleValueList = ['1100','0100','0000','0010','0011'];
        } else {
            // IMPORTANT: This list must stay in order from most satisfied to least satisfied for this function to work
            var possibleValueList = ['0011','0010','0000','0100','1100'];
        }

        // Return properly sliced list based on values passed in for init and final
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

/**
 * Each instance of this view maps to one select menu dropdown on the IVT
 * 
 * It takes in the list of predetermined options for the select menu
 * And converts it into option tags
 * Also takes in values needed to create/update UserEvaluationBBMs
 * And the logic associated with those actions
 */
var SelectUserEvaluationView = Backbone.View.extend({
    tagName: 'td',

    template: [
        '<select class="evaluation-value"></select>'
    ].join(''),

    events: {
        'change .evaluation-value':'updateEvaluationValue'
    },

    initialize: function(options){
        this.intention = options.intention;
        this.absTimePt = options.absTimePt;
        this.optionsList = options.optionsList;
        // Returns first user evaluation with absTP matching absTimePt
        // If none exist, it returns undefined
        this.userEval = this.intention.getUserEvaluationBBM(this.absTimePt);   
    },

    // TODO: Add check for if optionsList only contains 1 value
    // If so, automatically have that be the selected and only possible value
    // Potentially using a different template
    render: function(){
        this.$el.html(_.template(this.template)());

        // Add dropdown options to HTML select element
        this.$('select').append(this.convertToOptions(this.optionsList));

        // Set initial value if there is a userEvaluation matching the given TP
        // Else set initial value to empty
        if (this.userEval != undefined){
            this.$('select').val(this.userEval.get('assignedEvidencePair'));
        } else {
            this.$('select').val('empty');
        }
    },

    /**
     * Update user evaluation when select value changes
     */
    updateEvaluationValue: function(){
        // Get binary string evaluation value from html
        var evaluationValue = this.$('.evaluation-value').val();
        if (this.userEval != undefined){
            if (evaluationValue == 'empty'){
                // Triggers a destroy event in the UserEvaluationBBM collection
                // Thus removing UserEvaluationBBM from collection
                this.userEval.destroy();
                // Resets this.userEval to undefined
                this.userEval = undefined;
            } else {
                // Update evaluation value
                this.userEval.set('assignedEvidencePair', evaluationValue);
            }
        } else {
            // Create new UserEvaluationBBM and add it
            // To the intentionBBMs userEvaluationList
            this.userEval = new UserEvaluationBBM({absTime: this.absTimePt, 
                                                     assignedEvidencePair: evaluationValue});
            this.intention.get('userEvaluationList').push(this.userEval);
        }
    },

    /**
     * Converts list of binary values to list of html option strings
     * 
     * @param {Array<String>} choiceList: A list that contains binary strings of valid values
     * @returns List of html option strings corresponding to binary string input
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
            case 'empty':
                return `<option value="empty"> --- </option>`;
        }
        return null;
    }
});