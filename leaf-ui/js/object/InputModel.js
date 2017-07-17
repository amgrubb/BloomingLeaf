//This is the object that contains all model information to be sent to backend
function FrontendModel(
		actors,
		intentions,
		links,
		dynamics,
		constraints,
		allStatesModel
	){
	this.actors = actors;// = [];
	this.intentions = intentions;// = [];
	this.links = links;// = [];
	this.dynamics = dynamics;// = [];
	this.constraints = constraints;// = [];
	this.allStatesModel = allStatesModel;
}

//This method is responsible to get all data from the UI and add in to a object to be sent to backend
function getFrontendModel(isSinglePath = true){
	
	//VERIFY IF THE MODEL IS CORRECT FOR ANALYSIS
	//In SINGLE PATH analysis, the initial values must not be conflictant
	if(isSinglePath)
		checkConflictValues();
	//Removing invalid links
	
	
	//GETTING DATA FROM UI

	/** ACTORS
	 * Calls InputActors.getActorsList(); 
	 * returns InputActor[] actors;
	 */
	var actors = getActorsList();

	/** INTENTIONAL ELEMENTS
	 * Calls InputIntentions.getIntentionsList();
	 * returns InputIntention[] intentions
	 */	
	var intentions = getIntentitonalElements();

	/**
	 * LINKS
	 */
	
	//Step 0: Get elements from graph.
	var all_elements = graph.getElements();
	var savedLinks = [];
	var savedConstraints = [];

	if (linkMode == "Relationships"){
		savedConstraints = graphObject.intensionConstraints;
		var links = graph.getLinks();
	    links.forEach(function(link){
	        if(!isLinkInvalid(link)){
				if (link.attr('./display') != "none")
	        		savedLinks.push(link);
	        }
	        else{link.remove();}
	    });
	}else if (linkMode == "Constraints"){
		savedLinks = graphObject.links;
		var betweenIntensionConstraints = graph.getLinks();
	    betweenIntensionConstraints.forEach(function(link){
			var linkStatus = link.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
	        if(!isLinkInvalid(link) && (linkStatus != "constraint") && (linkStatus != "error")){
				if (link.attr('./display') != "none")
					savedConstraints.push(link);
	        }
	        else{link.remove();}
	    });
	}
	
	//Step 1: Filter out Actors
	var elements = [];
	for (var e1 = 0; e1 < all_elements.length; e1++){
		if (!(all_elements[e1] instanceof joint.shapes.basic.Actor)){
			elements.push(all_elements[e1]);
		}
	}

	//save elements in global variable for slider, used for toBackEnd function only
	graphObject.allElements = elements;
	graphObject.elementsBeforeAnalysis = elements;

	// Step 2: Print each element in the model

	// conversion between values used in Element Inspector with values used in backend
	var satValueDict = {
		"unknown": "0000",
		"satisfied": "0011",
		"partiallysatisfied": "0010",
		"partiallydenied": "0100",
		"denied": "1100",
		"none": "0000"
	}

	//LINKS
	var data_links = [];
	for (var l = 0; l < savedLinks.length; l++){
		var current = savedLinks[l];
		var relationship = current.label(0).attrs.text.text.toUpperCase()
		var source = "-";
		var target = "-";

		if (current.get("source").id)
			source = graph.getCell(current.get("source").id).prop("elementid");
		if (current.get("target").id)
			target = graph.getCell(current.get("target").id).prop("elementid");

		var io_link;

		if (relationship.indexOf("|") > -1){
			evolvRelationships = relationship.replace(/\s/g, '').split("|");
			io_link = new InputLink(evolvRelationships[0], source, target, evolvRelationships[1]);
		}else{
			io_link = new InputLink(relationship, source, target);
		}

		data_links.push(io_link);
	}

	//DYNAMICS
	var data_dynamics = [];

	for (var e = 0; e < elements.length; e++){
	    var elementID = elements[e].prop("elementid");

	    var f = elements[e].attr(".funcvalue/text");
	    var funcType = elements[e].attr(".constraints/function");
	    var funcTypeVal = elements[e].attr(".constraints/lastval");
	    var initValue = elements[e].attributes.attrs[".satvalue"].value;
	    if (isNaN(parseInt(initValue))){
			initValue = satValueDict[initValue];		 
			}
			if (isNaN(parseInt(funcTypeVal))){
			funcTypeVal = satValueDict[funcTypeVal];
			}

	    var io_dynamic;
	    if  (f == ""){
    		io_dynamic = new InputDynamic(elementID, "NT", initValue);
	    }else if(f == " "){
    		io_dynamic = new InputDynamic(elementID, "NT", initValue);
	    }else if (f != "UD"){
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
					line += "\t" + begin[l] + "\t1\t" + funcType[l] + "\t" + String(initValue);
				}else{
					line += "\t" + begin[l] + "\t" + end[l] + "\t" + funcType[l] + "\t" + String(initValue);
				}
			}

			// repeating
			if (elements[e].attr(".constraints/beginRepeat") && elements[e].attr(".constraints/endRepeat")){
				// to infinity
				if (rEnd == end[end.length - 1]){
					line += "\tR\t" + rBegin + "\t1";
				}else{
					line += "\tR\t" + rBegin + "\t" + rEnd;
				}
			}else{
				line += "\tN";
			}
			io_dynamic = new InputDynamic(elementID, f, initValue, line);
	    }

	    data_dynamics.push(io_dynamic);

	}

	//CONSTRAINTS
	var data_constraints = [];

	for (var e = 0; e < savedConstraints.length; e++){
		var c = savedConstraints[e];
		var type = c.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
		var source = c.getSourceElement().attributes.elementid;
		var target = c.getTargetElement().attributes.elementid;
		var sourceVar = c.attr('.constraintvar/src');
		var targetVar = c.attr('.constraintvar/tar');

		var io_constraint = new InputConstraint(
				type,
				source,
				sourceVar,
				null,
				target,
				targetVar);

		data_constraints.push(io_constraint);
	}

	//INITIAL VALUES
	// [time][intentions][value]
	var time = 1;

	var allStatesModel = [];

	for(var i_time = 0; i_time < time; i_time++){
		var stateModel = new StatesModel();
		stateModel.time = i_time;

		for(var i_intention = 0; i_intention < intentions.length; i_intention++){
			var intentionalElement = new IntentionElement();
			intentionalElement.id = intentions[i_intention].nodeID;
			intentionalElement.status.push(intentions[i_intention].initialValue);
			stateModel.intentionElements.push(intentionalElement);
		}
		allStatesModel.push(stateModel);
	}

	var frontendModel = new FrontendModel(
			actors,
			intentions,
			data_links,
			data_dynamics,
			data_constraints,
			allStatesModel
		)

	return frontendModel;
}


function checkConflictValues(){
	for (var i = 0; i < graph.getElements().length; i++){
		if (!(graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
			var initValue = graph.getElements()[i].attributes.attrs[".satvalue"].text;
			if ((initValue == "(PS, PD)") ||
				(initValue == "(PS, FD)") ||
				(initValue == "(FS, PD)") ||
				(initValue == "(FS, FD)") ){
					alert("The initial values must not be conflictant");
				return null;
			}
		}
	}
}




