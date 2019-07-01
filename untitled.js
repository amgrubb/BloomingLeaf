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
                                options = this.selfincreasing(initValue);
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
 										options = `<option value="(no value)">(no value)</option>`;		
 									}
 									else{
 										if (intention.dynamicFunction.functionSegList[1].funcX  === '0010'){
 											options = `<option value="0010">Partially Satisfied (P, ⊥) </option>`;	
 										}
 										else{
 											options = `<option value="0011">Satisfied (F, ⊥) </option>`;	
 											}
 									}
                	 			}

                	 			else if (func === "MN"){
 									if (absVal < ti) {
 										options = `<option value="(no value)">(no value)</option>`;		
 									}
 									else{
 										if (intention.dynamicFunction.functionSegList[1].funcX  === '0100'){
 											options = `<option value="0100">Partially Denied (⊥, P) </option>`;	
 										}
 										else{
 										options = `<option value="1100">Denied (⊥, F) </option>`;	
 										}
 									}
                	 	
            					}

            					else if(func === "RC"){
                        			if(absVal < ti){
                        				options = `<option value="empty"> </option>
                           				<option value="(no value)">(no value)</option>
                           				<option value="0000">None (⊥, ⊥) </option>
                           				<option value="0011">Satisfied (F, ⊥) </option>
                           				<option value="0010">Partially Satisfied (P, ⊥) </option>
                           				<option value="1100">Denied (⊥, F) </option>
                           				<option value="0100">Partially Denied (⊥, P)</option>`;
                       				}
	                       			else{
										var funcX = intention.dynamicFunction.functionSegList[1].funcX;
	                           			switch(funcX){
		                               		case '0000':
		                                  	options = `<option value="0000">None (⊥, ⊥) </option>`;
		                                    break;
		                               		case '0011':
		                                   	options = `<option value="0011">Satisfied (F, ⊥) </option>`;
		                                    break;
		                               		case '0100':
		                                   	options = `<option value="0100">Partially Denied (⊥, P)</option>`;
		                                     break;
		                               		case '1100':
		                                   	options = `<option value="1100">Denied (⊥, F) </option>`;
		                                    break;
		                               		case '0010':
		                                    options = `<option value="0010">Partially Satisfied (P, ⊥) </option>`;
		                                   	break;
	                           			}
	                       			}
                     			}

                    			else if(func === "CR"){
                    				if(absVal < ti){
                        				var funcX = intention.dynamicFunction.functionSegList[1].funcX;
                           				switch(funcX){
		                               		case '0000':
		                                  	options = `<option value="0000">None (⊥, ⊥) </option>`;
		                                    break;
		                               		case '0011':
		                                   	options = `<option value="0011">Satisfied (F, ⊥) </option>`;
		                                    break;
		                               		case '0100':
		                                   	options = `<option value="0100">Partially Denied (⊥, P)</option>`;
		                                     break;
		                               		case '1100':
		                                   	options = `<option value="1100">Denied (⊥, F) </option>`;
		                                    break;
		                               		case '0010':
		                                    options = `<option value="0010">Partially Satisfied (P, ⊥) </option>`;
		                                    break;
                           				}
                        			}
			                       	else{
			                           options = `<option value="empty"> </option>
			                           <option value="(no value)">(no value)</option>
			                           <option value="0000">None (⊥, ⊥) </option>
			                           <option value="0011">Satisfied (F, ⊥) </option>
			                           <option value="0010">Partially Satisfied (P, ⊥) </option>
			                           <option value="1100">Denied (⊥, F) </option>
			                           <option value="0100">Partially Denied (⊥, P)</option>`;
			                       	}
                     			}

			                    else if(func === "SD"){

			                    	if (absVal < ti) {
			                    		options = `<option value="0011">Satisfied (F, ⊥) </option>`	
			                    	}
			                    	else{
			                    		options = `<option value="1100">Denied (⊥, F) </option>`	
			                    	}
			                    	
			                    }

			                    else if(func === "DS"){
			                    	if (absVal < ti) {
			                    		options = `<option value="1100">Denied (⊥, F) </option>`		
			                    	}
			                    	else{
			                    		options =`<option value="0011">Satisfied (F, ⊥) </option>`	
			                    	}
			                    }
			                else{
			                	options = `<option value="(no value)">---</option>`	
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
    var valueForOptions = {};
    for(var i = 0; i <possibleValueList.length();i++){
        if(isIncreasing(possibleValueList[i],initialValue)){
            valueForOptions.push(possibleValueList[i]);
        }
    }
    return this.convertToOptions(valueForOptions);
},

decreasing: function(initValue){
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
}
