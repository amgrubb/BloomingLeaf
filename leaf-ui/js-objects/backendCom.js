function backendCom(){
	var js_object = modelSpec();

	var pathToCGI = "./cgi-bin/backendCom.cgi";

	$.ajax({
		url: pathToCGI,
		type: "post",
		datatype: "json",
		data: JSON.stringify(js_object),
		success: function(response){
		//ADD HERE WHAT TO DO WITH THE RESPONSE OBJECT
		alert(response);
		console.log(response['data']);
		}
	})
	.fail(function(){
		msg = "Ops! Something went wrong";
		alert(msg);
	});
}

function modelSpec(){
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

			var dataActor = new DataActor();
				dataActor.nodeID = actorId;
				dataActor.nodeName = actors[a].attr(".name/text");
				dataActor.nodeType = (actors[a].prop("actortype") || "A")
			
			data_actors.push(dataActor);
		}

		// Step 2: Print each element in the model

		// conversion between values used in Element Inspector with values used in backend
		var satValueDict = {
			"unknown": 5,
			"satisfied": 3,
			"partiallysatisfied": 2,
			"partiallydenied": 1,
			"denied": 0,
			"conflict": 4,
			"none": 6
		}

		//INTENTIONAL ELEMENTS
		var data_intentions = [];
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
		  	if((!v) || (v == "none"))
				v = "none";

			var data_intention = new DataIntention();
				data_intention.nodeActorID = actorid;
				data_intention.nodeID = elementID;
				data_intention.nodeType = type_e;
				data_intention.initialValue = satValueDict[v];
				data_intention.nodeName = elements[e].attr(".name/text").replace(/\n/g, " ");
				
			data_intentions.push(data_intention);
			
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

			var data_link = new DataLink();
			
			if (relationship.indexOf("|") > -1){
				evolvRelationships = relationship.replace(/\s/g, '').split("|");
				data_link.linkType = evolvRelationships[0];
				data_link.linkSrcID = source;
				data_link.linkDestID = target;
				data_link.postType = evolvRelationships[1];
			}else{
				data_link.linkType = relationship;
				data_link.linkSrcID = source;
				data_link.linkDestID = target;
			}
			
			data_links.push(data_link);
		}

		//DYNAMICS
		var data_dynamics = [];
		
		for (var e = 0; e < elements.length; e++){
		    var elementID = e.toString();
		    while (elementID.length < 4){ elementID = "0" + elementID;}
		    elements[e].prop("elementid", elementID);

		    var f = elements[e].attr(".funcvalue/text");
		    var funcType = elements[e].attr(".constraints/function");
		    var funcTypeVal = elements[e].attr(".constraints/lastval");
		    
		    var data_dynamic = new DataDynamic();
		    
		    if  (f == " "){		    	
	    		data_dynamic.intentionID = elementID;
	    		data_dynamic.dynamicType = "NT";
		    }else if (f != "UD"){
		    	data_dynamic.intentionID = elementID;
	    		data_dynamic.dynamicType = f;
	    		data_dynamic.markedValue = satValueDict[funcTypeVal];
	    		// user defined constraints
		    }
		    
		    data_dynamics.push(data_dynamic);
		    
		    /*else{
				var begin = elements[e].attr(".constraints/beginLetter");
				var end = elements[e].attr(".constraints/endLetter");
				var rBegin = elements[e].attr(".constraints/beginRepeat");
				var rEnd = elements[e].attr(".constraints/endRepeat");
				datastring += "D\t" + elementID + "\t" + f + "\t" + String(funcTypeVal.length);

				for (var l = 0; l < funcTypeVal.length; l++){
					if(l == funcTypeVal.length - 1){
						datastring += "\t" + begin[l] + "\t1\t" + funcType[l] + "\t" + satValueDict[funcTypeVal[l]];
					}else{
						datastring += "\t" + begin[l] + "\t" + end[l] + "\t" + funcType[l] + "\t" + satValueDict[funcTypeVal[l]];
					}
				}

				// repeating
				if (elements[e].attr(".constraints/beginRepeat") && elements[e].attr(".constraints/endRepeat")){
					// to infinity
					if (rEnd == end[end.length - 1]){
						datastring += "\tR\t" + rBegin + "\t1";
					}else{
						datastring += "\tR\t" + rBegin + "\t" + rEnd;
					}
				}else{
					datastring += "\tN";
				}
					datastring += "\n";
				}*/
		}

		//CONSTRAINTS
		
		function DataConstraint(){
			var constraintType;
			var constraintSrcID;
			var constraintSrcEB;
			var absoluteValue;
			var constraintDestID;
			var constraintDestEB;
		}
		var data_constraints = [];
		
		for (var e = 0; e < savedConstraints.length; e++){
			var c = savedConstraints[e];
			var type = c.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
			var source = c.getSourceElement().attributes.elementid;
			var target = c.getTargetElement().attributes.elementid;
			var sourceVar = c.attr('.constraintvar/src');
			var targetVar = c.attr('.constraintvar/tar');

			var data_constraint = new DataConstraint();
			
			data_constraint.constraintType = type;
			data_constraint.constraintSrcID = source;
			data_constraint.constraintSrcEB = sourceVar;
			data_constraint.absoluteValue;
			data_constraint.constraintDestID = target;
			data_constraint.constraintDestEB = targetVar;	
			
			data_constraints.push(data_constraint);
		}

		var frontendModel = new FrontendModel();
		
			frontendModel.maxTime;
			frontendModel.maxEpoch;
			frontendModel.relativePoints;
			frontendModel.absolutePoints = [];
			frontendModel.actors = data_actors; //OK
			frontendModel.intentions = data_intentions; //OK
			frontendModel.links = data_links; //OK
			frontendModel.dynamics = data_dynamics; //OK
			frontendModel.constraints = data_constraints; //OK
//			frontendModel.queries = [];
//			frontendModel.histories = [];
		
		return frontendModel;	
}



