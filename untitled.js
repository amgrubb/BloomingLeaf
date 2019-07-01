loadIntermediateValues: function(e) {
        $('#interm-list').find("tr:gt(1)").remove();
        $('#header').find("th:gt(1)").remove();
        $('#intentionRows').find("th:gt(1)").remove();

        var intermTDialog = document.getElementById('intermediateTable');
        intermTDialog.style.display = "block";

        var absTimeValues = analysisRequest.absTimePtsArr;
        var constraints = model.constraints;

        //Adding assigned time to absTimeValues
        for ( var i = 0; i < constraints.length; i ++){
        		var aTime = constraints[i].absoluteValue
        		aTime = aTime.toString()
        		if (!absTimeValues.includes(aTime) && aTime !== "-1"){
        			absTimeValues.push(aTime); 
        		}
        		
        	}
        }
        absTimeValues.sort();
        console.log(absTimeValues);

        for (var i = 0; i < absTimeValues.length; i++) {
            $('#header-row').append('<th>Absolute</th>');
            $('#intentionRows').append('<th>' + absTimeValues[i] + '</th>');
        }


        //loop over intentions to get intial values and funcType 
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

                    	// Add select tags for each absolute time point
                    	var selectTd = $('<td></td>');
                    	var selectElement = $('<select></select>');
                    	selectElement.attr('nodeID', intention.nodeID);
                    	selectElement.attr('absTime', absTimeValues[j]);



            		if (func === "I"|| func === "D"|| func === "C"|| func === "R"){
                        switch(func){
                            case "I":
                                options = this.increasing(initValue);
                                break;
                            case "D":
                                options = this.decreasing(initValue);
                                break;
                            case "C":
                                options = this.constant(initValue);
                                break;
                            case "R":
                                options = this.stochastic();
                                break;
                            }
            		}

            		else if (func === "MP"|| func === "MN"|| func === "CR"|| func === "RC" || func === "SD" || func === "DS"){
            		//check for every node if there is assigned time 
            			for ( var k = 0; k < constraints.length;  k++){
            				if (constraints[k].constranintSrcID === intention.nodeID){
            					var c = k 
            				}
            			}
            				if (constraints[c].absoluteValue !== -1){
            					var ti = constraints[c].absoluteValue; 
                    			var absVal = absTimeValues[j];

            					if (func === "MP"){
 									if (absVal < ti) {
 										options = this.convertToOptions({'no value'});		
 									}
 									else{
 										if (intention.dynamicFunction.functionSegList[1].funcX  === '0010'){
 											options = this.convertToOptions({'0010'});	
 										}
 										else{
 											options = this.convertToOptions({'0011'});	
 											}
 									}
                	 			}

                	 			else if (func === "MN"){
 									if (absVal < ti) {
 										options = this.convertToOptions({'no value'});		
 									}
 									else{
 										if (intention.dynamicFunction.functionSegList[1].funcX  === '0100'){
 											options = this.convertToOptions({'0100'});	
 										}
 										else{
 										options = this.convertToOptions({'1100'});	
 										}
 									}
                	 	
            					}

            					else if(func === "RC"){
                        			if(absVal < ti){
                                        var possibleValueList = {'0000','0011','0010','1100','0100','empty','no value'};
                        				options = this.convertToOptions(possibleValueList);
                       				}
	                       			else{
										var funcX = intention.dynamicFunction.functionSegList[1].funcX;
                                        switch(funcX){
                                            case '0000':
                                            options = this.convertToOptions({'0000'});
                                            break;
                                            case '0011':
                                            options = this.convertToOptions({'0011'});
                                            break;
                                            case '0100':
                                            options = this.convertToOptions({'0100'});
                                             break;
                                            case '1100':
                                            options = this.convertToOptions({'1100'});
                                            break;
                                            case '0010':
                                            options = this.convertToOptions({'0010'});
                                            break;
                                        }
	                       			}
                     			}

                    			else if(func === "CR"){
                    				if(absVal < ti){
                        				var funcX = intention.dynamicFunction.functionSegList[1].funcX;
                           				switch(funcX){
		                               		case '0000':
		                                  	options = this.convertToOptions({'0000'});
		                                    break;
		                               		case '0011':
		                                   	options = this.convertToOptions({'0011'});
		                                    break;
		                               		case '0100':
		                                   	options = this.convertToOptions({'0100'});
		                                     break;
		                               		case '1100':
		                                   	options = this.convertToOptions({'1100'});
		                                    break;
		                               		case '0010':
		                                    options = this.convertToOptions({'0010'});
		                                    break;
                           				}
                        			}
			                       	else{
                                       var possibleValueList = {'0000','0011','0010','1100','0100','empty','no value'};
			                           options = this.convertToOptions(possibleValueList);
			                       	}
                     			}

			                    else if(func === "SD"){

			                    	if (absVal < ti) {
			                    		options = this.convertToOptions({'0011'});	
			                    	}
			                    	else{
			                    		options = this.convertToOptions({'1100'});
			                    	}
			                    	
			                    }

			                    else if(func === "DS"){
			                    	if (absVal < ti) {
			                    		options = this.convertToOptions({"1100"});		
			                    	}
			                    	else{
			                    		options = this.convertToOptions({'0011'});	
			                    	}
			                    }
			                else{
			                	options = this.convertToOptions({'no value'});
			                }
			        }

            		else if (func = "UD"){}
            	}
            	
        }			
         
        
}


comparisonSwitch: function(valueToEncode){
   var tempInput;
   switch(valueToEncode){
       case '0000':
           tempInput = 0;
           break;
       case '0011':
           tempInput = -2;
           break;
       case '0010':
           tempInput = -1;
           break;
       case '0100':
           tempInput = 1;
           break;
       case '1100':
           tempInput = 2;
           break;
   }
   return tempInput;
},

isIncreasing: function(inputValue, valueToCompare){
   var tempInput = this.comparisonSwitch(inputValue);
   var tempCompare = this.comparisonSwitch(valueToCompare);
   if (tempInput < tempCompare){
       return false;
   }
   else{
       return true;
   }
},

isDecreasing: function(inputValue, valueToCompare){
   var tempInput = this.comparisonSwitch(inputValue);
   var tempCompare = this.comparisonSwitch(valueToCompare);
   if(tempInput <= tempCompare){
       return true;
   }
   else{
       return false;
   }
},

increasing: function(initValue){
    var possibleValueList = {'0000','0011','0010','1100','0100'};
    var valueForOptions = {};
    for(var i = 0; i <possibleValueList.length();i++){
        if(isIncreasing(possibleValueList[i],initialValue)){
            valueForOptions.push(possibleValueList[i]);
        }
    }
    return this.convertToOptions(valueForOptions);
},

decreasing: function(initValue){
    var possibleValueList = {'0000','0011','0010','1100','0100'};
    var valueForOptions = {};
    for(var i = 0; i <possibleValueList.length();i++){
        if(isDecreasing(possibleValueList[i],initialValue)){
            valueForOptions.push(possibleValueList[i]);
        }
    }
    return this.convertToOptions(valueForOptions);
},

constant: function(initValue){
    return this.convertToOptions({initValue});
},

stochastic: function(){
    var possibleValueList = {'0000','0011','0010','1100','0100', 'no value'};
    return this.convertToOptions(possibleValueList);
},

binaryToOption: function(binaryString){
    var optionString = '';
    switch(binaryString){
        case "0000":
            optionString = `<option value="0000">None (⊥, ⊥) </option>`;
            break;
        case "0011":
            optionString = `<option value="0011">Satisfied (F, ⊥) </option>`;
            break;
        case "0010":
            optionString = `<option value="0010">Partially Satisfied (P, ⊥) </option>`;
            break;
        case "0100":
            optionString = `<option value="0100">Partially Denied (⊥, P)</option>`;
            break;
        case "1100":
            optionString = `<option value="1100">Denied (⊥, F) </option>`;
            break;
        case 'empty':
            optionString = `<option value="empty"> --- </option>`;
            break;
        case 'no value':
            optionString = `<option value="(no value)">(no value)</option>`;
            break; 
    }
    return optionString;
},

convertToOptions: function(choiceList){
    var theOptionString = ``;
    for(var i = 0; i < choiceList.length; i++){
        var curString = this.binaryToOption(choiceList[i]);
        theOptionString += curString;
    }
    return convertToOptions;
},
