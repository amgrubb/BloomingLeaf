function backendCom(){
	var js_object = dataToBackend();

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

function dataToBackend(){
	var model = ModelSpec(
			selectIntElements(), 
			selectActors(), 
			evolutionLink, 
			contribution, 
			decomposition, 
			dependency, 
			constraintsBetweenEpochs, 
			maxTime = "5", 
			maxEpoch = "5", 
			history, 
			relativeTimePoints = "0", 
			absoluteTimePoints);	
	return model;
}

function selectIntElements(){
	var intElements = [];
	return intElements;
}

function selectActors(){
	var actors = [];
	for (var i = 0; i < graph.getElements().length; i++){
		if (graph.getElements()[i] instanceof joint.shapes.basic.Actor){
		
			var actorId = i.toString()
			while (actorId.length < 3){ actorId = "0" + actorId;}
				
			var actor = new Actor(
					name = graph.getElements()[i].attr(".name/text"), 
					id= actorId, 
					linksSrc = "", 
					linksDest = "", 
					actorType = (graph.getElements()[i].prop("actortype") || "A")
					);
			
			actors.push(actor);
		}
	}
	
	return actors;
}
	
function selectEvolutionLink(){
	var evolutionLink = [];
	return evolutionLink;
}

function selectContribution(){
	
}; 

function selectDecomposition(){
	
};

function selectDependency(){
	
};

function selectConstraintsBetweenEpochs(){
	
};

function selectMaxTime(){
	
}; 

function selectMaxEpoch(){
	
}; 

function selectHistory(){
	
}; 

function selectRelativeTimePoints(){
	
};

function selectAbsoluteTimePoints(){
	
};	

//Generates file needed for backend analysis
function generateLeafFile(){

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

	var datastring = actors.length + "\n";
	//print each actor in the model
	for (var a = 0; a < actors.length; a++){
		var actorId = a.toString();
		while (actorId.length < 3){ actorId = "0" + actorId;}
		actorId = "a" + actorId;
		actors[a].prop("elementid", actorId);
		datastring += ("A\t" + actorId + "\t" + actors[a].attr(".name/text") + "\t" + (actors[a].prop("actortype") || "A") + "\n");
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
	datastring += elements.length + "\n";
	for (var e = 0; e < elements.length; e++){
		//var id = e.toString();
		//while (id.length < 4){ id = "0" + id;}
		//elements[e].prop("elementid", id);
		var elementID = e.toString();
		while (elementID.length < 4){ elementID = "0" + elementID;}
		elements[e].prop("elementid", elementID);

		var actorid = '-';
		if (elements[e].get("parent")){
			actorid = (graph.getCell(elements[e].get("parent")).prop("elementid") || "-");
		}
		console.log(actorid);

	// Print NT in "core" of tool where time does not exist.
	//datastring += ("I\t" + actorid + "\t" + elementID + "\t" + (functions[elements[e].attr(".funcvalue/text")] || "NT") + "\t");

	  datastring += ("I\t" + actorid + "\t" + elementID + "\t");
		if (elements[e] instanceof joint.shapes.basic.Goal)
		  	datastring += "G\t";
		else if (elements[e] instanceof joint.shapes.basic.Task)
		  	datastring += "T\t";
		else if (elements[e] instanceof joint.shapes.basic.Softgoal)
		  	datastring += "S\t";
		else if (elements[e] instanceof joint.shapes.basic.Resource)
		  	datastring += "R\t";
		else
	  		datastring += "I\t";

	  	var v = elements[e].attr(".satvalue/value")

	  	// treat satvalue as unknown if it is not yet defined
	  	if((!v) || (v == "none"))
			v = "none";

		datastring += satValueDict[v];
		datastring += "\t" + elements[e].attr(".name/text").replace(/\n/g, " ") + "\n";
	}


	//Step 3: Print each link in the model
	for (var l = 0; l < savedLinks.length; l++){
		var current = savedLinks[l];
		var relationship = current.label(0).attrs.text.text.toUpperCase()
		var source = "-";
		var target = "-";

		if (current.get("source").id)
			source = graph.getCell(current.get("source").id).prop("elementid");
		if (current.get("target").id)
			target = graph.getCell(current.get("target").id).prop("elementid");

		if (relationship.indexOf("|") > -1){
			evolvRelationships = relationship.replace(/\s/g, '').split("|");
			datastring += 'L\t' + evolvRelationships[0] + '\t' + source + '\t' + target + '\t' + evolvRelationships[1] + "\n";
		}else{
			datastring += 'L\t' + relationship + '\t' + source + '\t' + target + "\n";
		}
	}

	//Step 4: Print the dynamics of the intentions.
	for (var e = 0; e < elements.length; e++){
	    var elementID = e.toString();
	    while (elementID.length < 4){ elementID = "0" + elementID;}
	    elements[e].prop("elementid", elementID);

	    //datastring += ("I\t" + actorid + "\t" + elementID + "\t" + (functions[elements[e].attr(".funcvalue/text")] || "NT") + "\t");
	    var f = elements[e].attr(".funcvalue/text");
	    var funcType = elements[e].attr(".constraints/function");
	    var funcTypeVal = elements[e].attr(".constraints/lastval");
	    if  (f == " "){
	    	datastring += ("D\t" + elementID + "\tNT\n");
	    }else if (f != "UD"){
	    	datastring += ("D\t" + elementID + "\t" + f + "\t" + satValueDict[funcTypeVal] + "\n");

	    // user defined constraints
	    }else{
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
			}
	}

	//Step 5: Print constraints between intensions.
	for (var e = 0; e < savedConstraints.length; e++){
		var c = savedConstraints[e];
		var type = c.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
		var source = c.getSourceElement().attributes.elementid;
		var target = c.getTargetElement().attributes.elementid;
		var sourceVar = c.attr('.constraintvar/src');
		var targetVar = c.attr('.constraintvar/tar');

		datastring += ("C\t" + type + "\t" + source + "\t" + sourceVar + "\t" + target + "\t" + targetVar + "\n");
	}

	console.log(datastring);
	return datastring
}
