function InputDynamic(intentionID, dynamicType, markedValue, line = null){

	this.intentionID = intentionID;
	this.dynamicType = dynamicType;
	this.markedValue = markedValue;
	//attribute for User defined contraints
	this.line = line;

}

function getDynamics(){
	var dynamics = [];

	var elements = [];

	for (var i = 0; i < graph.getElements().length; i++){
		if (!(graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
			elements.push(graph.getElements()[i]);
		}
	}

	for (var e = 0; e < elements.length; e++){
	    var elementID = elements[e].prop("elementid");

	    var f = elements[e].attr(".funcvalue/text");
	    var funcType = elements[e].attr(".constraints/function");
	    var funcTypeVal = elements[e].attr(".constraints/lastval");
	    var initValue = elements[e].attributes.attrs[".satvalue"].value;

	  if (isNaN(parseInt(initValue))){
			initValue = satValueDict[initValue];
		}else{
			initValue = "0000";
		}


	    var io_dynamic;
	    if(f == "NB" ){
	    	io_dynamic = new InputDynamic(elementID, "NB", "0000");
	    }else if (f == ""){
    		io_dynamic = new InputDynamic(elementID, "NT", initValue);
	    }else if(f == " "){
    		io_dynamic = new InputDynamic(elementID, "NT", initValue);
	    }else if (f != "UD"){
		if (isNaN(parseInt(funcTypeVal))){
		    funcTypeVal = satValueDict[funcTypeVal];
		}
    		io_dynamic = new InputDynamic(elementID, f, funcTypeVal);		//Passing Dynamic Values
    		// user defined constraints
	    }else{
	    	var line = "";
    		var begin = elements[e].attr(".constraints/beginLetter");
			var end = elements[e].attr(".constraints/endLetter");
			var rBegin = elements[e].attr(".constraints/beginRepeat");
			var rEnd = elements[e].attr(".constraints/endRepeat");
			line += "D\t" + elementID + "\t" + f + "\t" + String(funcTypeVal.length);

			for (var l = 0; l < funcTypeVal.length; l++){
				if(l == funcTypeVal.length - 1){
					line += "\t" + begin[l] + "\t1\t" + funcType[l] + "\t" + satValueDict[funcTypeVal[l]];
				}else{
					line += "\t" + begin[l] + "\t" + end[l] + "\t" + funcType[l] + "\t" + satValueDict[funcTypeVal[l]];
				}
			}
			//console.log(elements[e].attr(".constraints/beginRepeat"));
			// repeating
			if (elements[e].attr(".constraints/beginRepeat") && elements[e].attr(".constraints/endRepeat")){
				// to infinity
				if (rEnd == end[end.length - 1]){
					line += "\tR\t" + rBegin + "\t1";
				}else{
					line += "\tR\t" + rBegin + "\t" + rEnd;
				}
				// TODO Add the repeat count value and the absolute length value here
				//console.log(typeof $("#repeat-end2").val());
				line += "\t" + $("#repeat-end2").val() + "\t" + $("#repeat-end3").val();
				//console.log(line);
			}else{
				line += "\tN";
			}
			io_dynamic = new InputDynamic(elementID, f, initValue, line);
	    }

	    dynamics.push(io_dynamic);

	}
	return dynamics;

}
