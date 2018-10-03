/**
 * This class contains information about Intention constraints
 * from the analysisInspector
 * (both absolute and relative intention constraints)
 */
class InputConstraint {
	constructor(constraintType, constraintSrcID, constraintSrcEB, absoluteValue, constraintDestID, constraintDestEB) {
		this.constraintType = constraintType;  	// "<" "=" "A"
		this.constraintSrcID = constraintSrcID;
		this.constraintSrcEB = constraintSrcEB;		// "REL" for relationships
		this.absoluteValue = absoluteValue;			// If "A" integer value else -1
		this.constraintDestID = constraintDestID;
		this.constraintDestEB = constraintDestEB;		// "REL" for relationships
	}
}

/**
 * Returns an array of InputConstraints, each containing information
 * about an Absolute Intention constraint or a Relative Intention constraint. 
 * for the graph. 
 * 
 * @returns {Array.<InputConstraints>}
 */
function getConstraints(){
	var constraints = [];
	var links = graph.constraintValues;//graph.intensionConstraints;
	if(links != null){
		for (var i = 0; i < links.length; i++){
			var c = links[i];
			var type = c.constraintType;
			var source = c.constraintSrcID;
			var target = c.constraintDestID;
			var absoluteValue = parseInt(c.absoluteValue);
			var sourceVar = c.constraintSrcEB;
			var targetVar = c.constraintDestEB;
			var constraint = new InputConstraint(
					type,
					source,
					sourceVar,
					absoluteValue,		//TODO: The integer value of the absolute value of intenetion constraints must be added.
					target,
					targetVar);
			constraints.push(constraint);
		};
	}

	return constraints;

}
