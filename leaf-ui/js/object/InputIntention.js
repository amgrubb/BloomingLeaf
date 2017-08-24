function InputIntention(nodeActorID, nodeID, nodeType, nodeName){
	this.nodeActorID = nodeActorID;
	this.nodeID = nodeID ;
	this.nodeType = nodeType;
	this.nodeName = nodeName;
}

function getIntentitonalElements(){
	
	var intentions = [];
	var intentionsCount = 0;
	for (var i = 0; i < this.graph.getElements().length; i++){		
		if (!(this.graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
			
			/**
			 * NODE ACTOR ID
			 */
			var actorid = '-';
			if (this.graph.getElements()[i].get("parent")){
				actorid = (this.graph.getCell(this.graph.getElements()[i].get("parent")).prop("elementid") || "-");
			}
			
			/**
			 * NODE ID
			 */
			//Making that the elementId has 4 digits
			var elementID = intentionsCount.toString();
			while (elementID.length < 4){ 
				elementID = "0" + elementID;
				}
			//Adding the new id to the UI graph element
			this.graph.getElements()[i].prop("elementid", elementID);
			
			
			/**
			 * NODE TYPE
			 */
			var elementType;
			if (this.graph.getElements()[i] instanceof joint.shapes.basic.Goal)
				elementType = "G";
			else if (this.graph.getElements()[i] instanceof joint.shapes.basic.Task)
				elementType = "T";
			else if (this.graph.getElements()[i] instanceof joint.shapes.basic.Softgoal)
				elementType = "S";
			else if (this.graph.getElements()[i] instanceof joint.shapes.basic.Resource)
				elementType = "R";
			else
				elementType = "I";
			
		  	/**
		  	 * NODE NAME
		  	 */
		  	//Getting intentional element name
			var intentionalElementName = this.graph.getElements()[i].attr(".name/text").replace(/\n/g, " ");
			
			/**
			 * CREATING OBJECT
			 */
			var intentionalElement = new InputIntention(actorid, elementID, elementType, intentionalElementName);		  	
			intentions.push(intentionalElement);

			//iterating the counter
			intentionsCount++;
		}	  	
	}
	return intentions;
}