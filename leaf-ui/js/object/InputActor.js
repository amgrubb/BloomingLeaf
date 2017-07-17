function InputActor(nodeId, nodeName, nodeType){
	this.nodeId = nodeId;
	this.nodeName = nodeName;
	this.nodeType = nodeType;
}

function getActors(){
	var elements = graph.getElements();
	
	//Help variable to count the length of actors
	var actorCounter = 0;
	//List of actors to be sent to backend inside the InputModel object
	var actorsList = [];
	
	//Select only actors elements
	for (var i = 0; i < elements.length; i++){
		if ((elements[i] instanceof joint.shapes.basic.Actor)){
			var actorId = actorCounter.toString();
			//Making that the id has 4 digits
			while (actorId.length < 3){ 
				actorId = "0" + actorId;
				}
			actorId = "a" + actorId;
			//Adding the new id to the UI graph element
			elements[i].prop("elementid", actorId);
			
			//Creating the actor object to be sent to backend
			var inputActor = new InputActor(actorId, elements[i].attr(".name/text"), (elements[i].prop("actortype") || "A"));
			actorsList.push(inputActor);
			//iterating counter
			actorCounter++;
		}
	}
	return actorsList;
}
