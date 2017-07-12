function InputConstraint(constraintType, constraintSrcID, constraintSrcEB, absoluteValue, constraintDestID, constraintDestEB){
	this.constraintType = constraintType;  	// "<" "=" "A"
	this.constraintSrcID = constraintSrcID;
	this.constraintSrcEB = constraintSrcEB;		// "REL" for relationships
	this.absoluteValue = absoluteValue;			// If "A" integer value
	this.constraintDestID = constraintDestID;
	this.constraintDestEB = constraintDestEB;		// "REL" for relationships
}
