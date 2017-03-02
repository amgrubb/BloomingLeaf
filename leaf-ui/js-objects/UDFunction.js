function UDFunction(rand, hasRepeat = false, repeatFull = false, repeatStart = "-2", 
		repeatEnd = "-2", numRepeat = "1", repeatEpochBoundaries, 
		element, epochBasicFunction, epochMarkedValues, epochBoundaries, numSegment){
	this.rand = new Random();
	this.hasRepeat = false;
	this.repeatFull = false;
	this.repeatStart = -2;	//End of the first repeating interval.
	this.repeatEnd = -2;		//End of the last repeating interval.
	this.numRepeat = 1;
	this.repeatEpochBoundaries;
	this.element;
	this.epochBasicFunction;
	this.epochMarkedValues;
	this.epochBoundaries;	//Marks the end of the boundary.
	this.numSegment;
}
