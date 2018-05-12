function InputConstraint(constraintType, constraintSrcID, constraintSrcEB, absoluteValue, constraintDestID, constraintDestEB){
	this.constraintType = constraintType;  	// "<" "=" "A"
	this.constraintSrcID = constraintSrcID;
	this.constraintSrcEB = constraintSrcEB;		// "REL" for relationships
	this.absoluteValue = absoluteValue;			// If "A" integer value else -1
	this.constraintDestID = constraintDestID;
	this.constraintDestEB = constraintDestEB;		// "REL" for relationships
}

function getConstraints(){
	var constraints = [];
	//console.log(graph.constraintValues);
	//console.log(graph.getLinks());
	//console.log(graph.getElements());
	var links = graph.constraintValues;//graph.intensionConstraints;
	//console.log(graph.constraintValues.length);
	if(links != null){
		for (var i = 0; i < links.length; i++){
			//console.log(links[i]);
			var c = links[i];
			var type = c.constraintType;
			var source = c.constraintSrcID;
			var target = c.constraintDestID;
			var absoluteValue = parseInt(c.absoluteValue);
			var sourceVar = c.constraintSrcEB;
			var targetVar = c.constraintDestEB;
			//console.log(typeof parseInt(absoluteValue));
			var constraint = new InputConstraint(
					type,
					source,
					sourceVar,
					absoluteValue,		//TODO: The integer value of the absolute value of intenetion constraints must be added.
					target,
					targetVar);
			//console.log(constraint);
			constraints.push(constraint);
		};
	}

	return constraints;

}
