//Object related to backend object interface_object.FrontendModel
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

//Get only model information (nodes and links)
function getFrontendModel(isSinglePath = true){
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
	var actors = [];
	for (var e1 = 0; e1 < all_elements.length; e1++){
		if (!(all_elements[e1] instanceof joint.shapes.basic.Actor)){
			elements.push(all_elements[e1]);
		}
		else{
			actors.push(all_elements[e1]);
		}
	}

	//save elements in global variable for slider, used for toBackEnd funciton only
	graphObject.allElements = elements;
	graphObject.elementsBeforeAnalysis = elements;

	var data_actors = [];
	
	//ACTORS
	for (var a = 0; a < actors.length; a++){
		var actorId = a.toString();
		
		while (actorId.length < 3){ actorId = "0" + actorId;}
		actorId = "a" + actorId;
		actors[a].prop("elementid", actorId);

		var io_Actor = new IOActor(actorId, actors[a].attr(".name/text"), (actors[a].prop("actortype") || "A"));
			
		data_actors.push(io_Actor);
	}

	// Step 2: Print each element in the model

	// conversion between values used in Element Inspector with values used in backend
	var satValueDict = {
		"unknown": "0000",
		"satisfied": "1100",
		"partiallysatisfied": "0100",
		"partiallydenied": "0010",
		"denied": "0011"
	}

	//INTENTIONAL ELEMENTS
	var data_intentions = [];
	//Verify if has conflicts
	if(isSinglePath){
		for (var e = 0; e < elements.length; e++){
			var initValue = elements[e].attributes.attrs[".satvalue"].text;
			if ((initValue == "(PS, PD)") ||
				(initValue == "(PS, FD)") ||
				(initValue == "(FS, PD)") ||
				(initValue == "(FS, FD)") ){
			
				alert("The initial values must not be conflictant");
				return null;
			}
		}		
	}
	
	
	for (var e = 0; e < elements.length; e++){
		var elementID = e.toString();
		while (elementID.length < 4){ elementID = "0" + elementID;}
		elements[e].prop("elementid", elementID);

		var actorid = '-';
		if (elements[e].get("parent")){
			actorid = (graph.getCell(elements[e].get("parent")).prop("elementid") || "-");
		}
		
	  var type_e;
		if (elements[e] instanceof joint.shapes.basic.Goal)
			type_e = "G";
		else if (elements[e] instanceof joint.shapes.basic.Task)
			type_e = "T";
		else if (elements[e] instanceof joint.shapes.basic.Softgoal)
			type_e = "S";
		else if (elements[e] instanceof joint.shapes.basic.Resource)
			type_e = "R";
		else
			type_e = "I";

	  	var v = elements[e].attr(".satvalue/value")

	  	// treat satvalue as unknown if it is not yet defined
	  	if((!v) || (v == "unknown"))
			v = "unknown";

		var io_intention = new IOIntention(actorid, elementID, type_e, satValueDict[v], elements[e].attr(".name/text").replace(/\n/g, " "));
			
		data_intentions.push(io_intention);
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
			io_link = new IOLink(evolvRelationships[0], source, target, evolvRelationships[1]);
		}else{
			io_link = new IOLink(relationship, source, target);
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
	    
	    var io_dynamic;
	    if  (f == ""){		    	
    		io_dynamic = new IODynamic(elementID, "NT", initValue);
	    }else if(f == " "){
    		io_dynamic = new IODynamic(elementID, "NT", initValue);	    	
	    }else if (f != "UD"){
    		io_dynamic = new IODynamic(elementID, f, initValue);
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
					line += "\t" + begin[l] + "\t1\t" + funcType[l] + "\t" + initValue;
				}else{
					line += "\t" + begin[l] + "\t" + end[l] + "\t" + funcType[l] + "\t" + initValue;
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
			io_dynamic = new IODynamic(elementID, f, initValue, line);	
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

		var io_constraint = new IOConstraint(
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
		
		for(var i_intention = 0; i_intention < data_intentions.length; i_intention++){
			var intentionalElement = new IntentionElement();
			intentionalElement.id = data_intentions[i_intention].nodeID;
			intentionalElement.status.push(data_intentions[i_intention].initialValue);
			
			stateModel.intentionElements.push(intentionalElement);
		}
		allStatesModel.push(stateModel);
	}

	var frontendModel = new FrontendModel(
			data_actors,
			data_intentions,
			data_links,
			data_dynamics,
			data_constraints,
			allStatesModel
		)
	
	return frontendModel;	
}
