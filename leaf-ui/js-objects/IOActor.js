function IOActor(nodeId, nodeName, nodeType){
	this.nodeId = nodeId;
	this.nodeName = nodeName;
	this.nodeType = nodeType;
}

//This method gets all actors elements from the graph and return all them in an array of IOActor class
function selectAllActors(){
	var all_actors = [];
	for(var i = 0; i < graph.getElements().length; i++){
		if(graph.getElements()[i] instanceof joint.shapes.basic.Actor){
			
			var actorId = i.toString();
			while (actorId.length < 3){ actorId = "0" + actorId;}
			actorId = actorId;
			graph.getElements()[i].prop("elementid", actorId);
			var nodeName = graph.getElements()[i].attr(".name/text");
			var nodeType = (graph.getElements()[i].prop("actortype") || "A");
			
			var ioActor = new IOActor(actorId, nodeName, nodeType);
			
			all_actors.push(ioActor);
		}
			
	}
	
	return all_actors;
}

function selectActorById(id){
	var all_actors = selectAllActors();
	for(var i = 0; i < all_actors.length; i++){
		if(all_actor[i].nodeId === id){
			return all_actor[i];
		}
	}
	return null;
}