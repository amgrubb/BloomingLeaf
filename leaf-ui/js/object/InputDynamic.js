function InputDynamic(intentionID, dynamicType, markedValue, line = null){
	
	this.intentionID = intentionID;
	this.dynamicType = dynamicType;
	this.markedValue = markedValue;
	//attribute for User defined contraints
	this.line = line;

}
