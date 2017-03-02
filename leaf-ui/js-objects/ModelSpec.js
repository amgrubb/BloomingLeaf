function ModelSpec(intElements, actors, evolutionLink, contribution, decomposition, dependency, constraintsBetweenEpochs, maxTime = "5", maxEpoch = "5", history, relativeTimePoints = "0", absoluteTimePoints){
	this.intElements = intElements;
	this.actors = actors;
	this.evolutionLink = evolutionLink; 
	this.contribution = contribution;
	this.decomposition = decomposition;
	this.dependency = dependency;
	this.constraintsBetweenEpochs = constraintsBetweenEpochs;
	this.maxTime = maxTime;
	this.maxEpoch = maxEpoch;
	this.history = history;
	this.relativeTimePoints = relativeTimePoints;
	this.absoluteTimePoints = absoluteTimePoints;
}
