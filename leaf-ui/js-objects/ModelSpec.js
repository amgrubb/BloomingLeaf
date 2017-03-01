var ModelSpec = function(){
	this.intElements = []; //IntentionalElement
	this.actors = []; //Actor
	this.evolutionLink = []; //EvolutionLink
	this.contribution = []; //Contribution
	this.decomposition = []; //Decomposition
	this.dependency = []; //Dependency
	this.precondition = []; //Precondition
	this.strategyCollection = []; //EvaluationStrategy;
	this.constraintsBetweenEpochs = []; //EpochConstraint
	this.simulationType = 0;
	this.maxTime = 5;
	this.maxEpoch = 5;
	this.history; //int[][][] history;
	this.relativeTimePoints = 0;
	this.absoluteTimePoints = [];
}
