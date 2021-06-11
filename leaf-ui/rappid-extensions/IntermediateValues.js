/**
	 * Displays the Intermediate Values modal for the user
	 *
	 * This function is called on click for #btn-view-intermediate
	 */

 template: [
    //This is the intermediate values table modal
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
    '<hr>',
'</script>'].join(''),

function loadIntermediate(e) {
    $('#interm-list').find("tr:gt(1)").remove();
    $('#header').find("th:gt(1)").remove();
    $('#intentionRows').find("th:gt(1)").remove();

    var intermTDialog = document.getElementById('intermediateTable');
    intermTDialog.style.display = "block";

    var absTimeValues = analysisRequest.absTimePtsArr;
    var constraints = model.constraints;
    //Adding assigned time to absTimeValues
    for (var i = 0; i < constraints.length; i++) {
        var aTime = constraints[i].absoluteValue;
        aTime = aTime.toString();
        if (!absTimeValues.includes(aTime) && aTime !== "-1") {
            absTimeValues.push(aTime);
        }
    }
    absTimeValues.sort(function(a,b) {return a-b});
    if (absTimeValues[0] === ""){
        absTimeValues.splice(0,1)
    }
    console.log("absTimeLength = " + absTimeValues.length);
    for (var s = 0; s < absTimeValues.length; s++) {
        $('#header-row').append('<th>Absolute</th>');
        $('#intentionRows').append('<th>' + absTimeValues[s] + '</th>');
    }

    //Loop over intentions to get initial values and funcType
    for (var i = 0; i < model.intentions.length; i++) {
        var intention = model.intentions[i];
        var initValue = intention.getInitialSatValue();
        var func = intention.dynamicFunction.stringDynVis;

        var row = $('<tr></tr>');
        row.addClass('intention-row');
        var name = $('<td></td>');
        var sat = $('<td></td>');

        name.text(intention.nodeName);
        sat.text('Denied');
        row.append(name);
        row.append(satisfactionValuesDict[initValue].satValue);

        for (j = 0; j < absTimeValues.length; j++) {
            var options = ``;

            // Add select tags for each absolute time point
            var selectTd = $('<td></td>');
            var selectElement = $('<select></select>');
            selectElement.attr('nodeID', intention.nodeID);
            selectElement.attr('absTime', absTimeValues[j]);


            if (func === "I" || func === "D" || func === "C" || func === "R") {
                switch (func) {
                    case "I":
                        options = this.increasing(initValue,'noFinal');
                        break;
                    case "D":
                        options = this.decreasing(initValue,'noFinal');
                        break;
                    case "C":
                        options = this.constant(initValue);
                        break;
                    case "R":
                        options = this.stochastic();
                        break;
                }
            }
            else if (func === "MP" || func === "MN" || func === "CR" || func === "RC" || func === "SD" || func === "DS") {
                //check for every node if there is assigned time
                for (var k = 0; k < constraints.length; k++) {
                    if (constraints[k].constraintSrcID === intention.nodeID) {
                        var c = k
                    }
                }
                if (constraints[c].absoluteValue !== -1) {
                    var ti = constraints[c].absoluteValue;
                    var absVal = absTimeValues[j];

                    if (func === "MP") {
                        if (absVal < ti) {
                            var finalValue = intention.dynamicFunction.functionSegList[0].funcX;
                            options = this.increasing(initValue, finalValue);
                        } else {
                            if (intention.dynamicFunction.functionSegList[1].funcX === '0010') {
                                options = this.convertToOptions(['0010']);
                            } else {
                                options = this.convertToOptions(['0011']);
                            }
                        }
                    } else if (func === "MN") {
                        if (absVal < ti) {
                            var finalValue = intention.dynamicFunction.functionSegList[0].funcX;
                            options = this.decreasing(initValue, finalValue);
                        } else {
                            if (intention.dynamicFunction.functionSegList[1].funcX === '0100') {
                                options = this.convertToOptions(['0100']);
                            } else {
                                options = this.convertToOptions(['1100']);
                            }
                        }

                    } else if (func === "RC") {
                        if (absVal < ti) {
                            var possibleValueList = ['0000', '0011', '0010', '1100', '0100', 'empty', 'no value'];
                            options = this.convertToOptions(possibleValueList);
                        } else {
                            var funcX = intention.dynamicFunction.functionSegList[1].funcX;
                            switch (funcX) {
                                case '0000':
                                    options = this.convertToOptions(['0000']);
                                    break;
                                case '0011':
                                    options = this.convertToOptions(['0011']);
                                    break;
                                case '0100':
                                    options = this.convertToOptions(['0100']);
                                    break;
                                case '1100':
                                    options = this.convertToOptions(['1100']);
                                    break;
                                case '0010':
                                    options = this.convertToOptions(['0010']);
                                    break;
                            }
                        }
                    } else if (func === "CR") {
                        if (absVal < ti) {
                            var funcX = intention.dynamicFunction.functionSegList[1].funcX;
                            switch (funcX) {
                                case '0000':
                                    options = this.convertToOptions(['0000']);
                                    break;
                                case '0011':
                                    options = this.convertToOptions(['0011']);
                                    break;
                                case '0100':
                                    options = this.convertToOptions(['0100']);
                                    break;
                                case '1100':
                                    options = this.convertToOptions(['1100']);
                                    break;
                                case '0010':
                                    options = this.convertToOptions(['0010']);
                                    break;
                            }
                        } else {
                            var possibleValueList = ['0000', '0011', '0010', '1100', '0100', 'empty', 'no value'];
                            options = this.convertToOptions(possibleValueList);
                        }
                    } else if (func === "SD") {

                        if (absVal < ti) {
                            options = this.convertToOptions(['0011']);
                        } else {
                            options = this.convertToOptions(['1100']);
                        }

                    } else if (func === "DS") {
                        if (absVal < ti) {
                            options = this.convertToOptions(["1100"]);
                        } else {
                            options = this.convertToOptions(['0011']);
                        }
                    } else {
                        console.log("calling empty from compound functions")
                        var list = ['empty'];
                        options = this.convertToOptions(list);
                    }
                }
            }

            else if (func === "UD") {
                var time_list = [];
                for (var y = 0; y < constraints.length; y++) {
                    if (constraints[y].constraintSrcID === intention.nodeID) {
                        time_list.push(constraints[y].absoluteValue);
                    }
                }

                var assigned = true;
                if (time_list.length === 0 ){
                    assigned = false;
                }


                else {
                    for (var z = 0; z < time_list.length; z++) {
                        if (time_list[z] === -1) {
                            assigned = false;
                            break;
                        }
                    }
                }

                if (assigned === true) {
                    var func_list = intention.dynamicFunction.functionSegList;
                    for (var x = 0; x < func_list.length; x++) {
                        var funcType = func_list[x].funcType;
                        var funcX = func_list[x].funcX;
                        console.log(funcType);
                        switch (funcType) {
                            case "I":
                                options = this.increasing(funcX,'noFinal');
                                break;
                            case "D":
                                options = this.decreasing(funcX,'noFinal');
                                break;
                            case "C":
                                options = this.constant(funcX);
                                break;
                            case "R":
                                options = this.stochastic();
                                break;
                        }
                        
                    }
                }
                else {
                    options = this.convertToOptions(['empty']);
                }
            }
            else {
                var possibleValueList = ['0000', '0011', '0010', '1100', '0100', 'empty', 'no value'];
                options = this.convertToOptions(possibleValueList);
            }
            selectElement.append(options);
            selectTd.append(selectElement);
            row.append(selectTd);
            }
        $('#interm-list').append(row);
    }
    // Needed after looping through and appending rows to avoid voiding the select
    $('.intention-row').each(function () {
        $(this).find('select').each(function () {
            var nodeID = $(this).attr('nodeID');
            var absTime = $(this).attr('absTime');
            var intEval = analysisRequest.getUserEvaluationByID(nodeID, absTime);
            if (intEval != null) {
                $(this).val(intEval.evaluationValue);
            }
        });
    });
}


function dismissInterm(e){
    var intermT = document.getElementById('intermediateTable');
    intermT.style.display = "none";
}

/**
 * Save the intermediate table values into analysisRequest
 */
function saveInterm() {

    // Clear all intention evaluations with the exception
    // of the evaluations on the initial time point
    analysisRequest.clearUserEvaluations();
    
    // for each row of the table
    $('.intention-row').each(function () {
        // for each column of the current row
        $(this).find('select').each(function () {
            var nodeID = $(this).attr('nodeID');
            var absTime = $(this).attr('absTime');
            var evalLabel = $(this).find(":selected").val();

            if (evalLabel === 'empty') {
                return;
            }

            analysisRequest.userAssignmentsList.push(new UserEvaluation(nodeID, absTime, evalLabel));
        });
    });

    this.dismissIntermTable();
}