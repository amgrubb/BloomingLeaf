function InputConstraint(constraintType, constraintSrcID, constraintSrcEB, absoluteValue, constraintDestID, constraintDestEB){
	this.constraintType = constraintType;  	// "<" "=" "A"
	this.constraintSrcID = constraintSrcID;
	this.constraintSrcEB = constraintSrcEB;		// "REL" for relationships
	this.absoluteValue = absoluteValue;			// If "A" integer value
	this.constraintDestID = constraintDestID;
	this.constraintDestEB = constraintDestEB;		// "REL" for relationships
}

function getConstraints(){
	//TODO: get relationships constrains from Model Constraints view (BUG:Constraints in this view are not being saved)
	//TODO: get constrains from view List of Assignment
	var constraints = [];

	var savedConstraints = [];
	for (var e = 0; e < savedConstraints.length; e++){
		var c = savedConstraints[e];
		var type = c.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
		var source = c.getSourceElement().attributes.elementid;
		var target = c.getTargetElement().attributes.elementid;
		var sourceVar = c.attr('.constraintvar/src');
		var targetVar = c.attr('.constraintvar/tar');

		var constraint = new InputConstraint(
				type,
				source,
				sourceVar,
				null,
				target,
				targetVar);

		constraints.push(constraint);
	}
	
	return constraints;
	
}