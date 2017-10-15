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

	var links = graph.intensionConstraints;
	if(links != null){
		for (var i = 0; i < links.length; i++){
			var c = links[i];
			var type = c.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
			var source = c.getSourceElement().attributes.elementid;
			var target = c.getTargetElement().attributes.elementid;
			var sourceVar = c.attr('.constraintvar/src');
			var targetVar = c.attr('.constraintvar/tar');

			var constraint = new InputConstraint(
					type,
					source,
					sourceVar,
					null,		//TODO: The integer value of the absolute value of intenetion constraints must be added.
					target,
					targetVar);

			constraints.push(constraint);
		};
	}

	return constraints;

}
