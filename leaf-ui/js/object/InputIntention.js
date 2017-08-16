function InputIntention(nodeActorID, nodeID, nodeType, initialValue, nodeName){
	this.nodeActorID = nodeActorID;
	this.nodeID = nodeID ;
	this.nodeType = nodeType;
	this.initialValue = initialValue;
	this.nodeName = nodeName;
}

function getIntentitonalElements(){
	
	var intentions = [];
	var intentionsCount = 0;
	for (var i = 0; i < graph.getElements().length; i++){		
		if (!(graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
			
			/**
			 * NODE ACTOR ID
			 */
			var actorid = '-';
			if (graph.getElements()[i].get("parent")){
				actorid = (graph.getCell(graph.getElements()[i].get("parent")).prop("elementid") || "-");
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
			graph.getElements()[i].prop("elementid", elementID);
			
			
			/**
			 * NODE TYPE
			 */
			var elementType;
			if (graph.getElements()[i] instanceof joint.shapes.basic.Goal)
				elementType = "G";
			else if (graph.getElements()[i] instanceof joint.shapes.basic.Task)
				elementType = "T";
			else if (graph.getElements()[i] instanceof joint.shapes.basic.Softgoal)
				elementType = "S";
			else if (graph.getElements()[i] instanceof joint.shapes.basic.Resource)
				elementType = "R";
			else
				elementType = "I";
			
			
			/**
			 * INITIAL VALUE
			 */
			//Getting the intentional element current satisfaction value
			//TODO: create a patter for the satisfaction values
			var satValueDict = {
					"unknown": "0000",
					"satisfied": "0011",
					"partiallysatisfied": "0010",
					"partiallydenied": "0100",
					"denied": "1100",
					"none": "0000"
				}

		  	var currentValue = (graph.getElements()[i].attr(".satvalue/value")||"none");
		  	//Making currentValue to numeric values like 0000, 0001, 0011...
		  	if(!$.isNumeric(currentValue))
		  		currentValue = satValueDict[currentValue];
			
		  	/**
		  	 * NODE NAME
		  	 */
		  	//Getting intentional element name
			var intentionalElementName = graph.getElements()[i].attr(".name/text").replace(/\n/g, " ");
			
			/**
			 * CREATING OBJECT
			 */
			var intentionalElement = new InputIntention(actorid, elementID, elementType, currentValue, intentionalElementName);		  	
			intentions.push(intentionalElement);

			//iterating the counter
			intentionsCount++;
		}	  	
	}
	return intentions;
}