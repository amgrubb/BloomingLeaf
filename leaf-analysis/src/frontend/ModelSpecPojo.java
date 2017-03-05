package frontend;

import java.util.ArrayList;
import java.util.List;

import org.jacop.core.BooleanVar;

import simulation.Actor;
import simulation.Contribution;
import simulation.Decomposition;
import simulation.Dependency;
import simulation.EpochConstraint;
import simulation.EvolutionLink;
import simulation.IntentionalElement;

public class ModelSpecPojo {
	
	private List<IntentionalElement> intElements = new ArrayList<IntentionalElement>();
	private List<Actor> actors = new ArrayList<Actor>();
	private List<EvolutionLink> evolutionLink = new ArrayList<EvolutionLink>(); 
	private List<Contribution> contribution = new ArrayList<Contribution>();
	private List<Decomposition> decomposition = new ArrayList<Decomposition>();
	private List<Dependency> dependency = new ArrayList<Dependency>();
	//private List<EvaluationStrategy> strategyCollection = new ArrayList<EvaluationStrategy>(); //Collection
	private List<EpochConstraint> constraintsBetweenEpochs = new ArrayList<EpochConstraint>();
	private int maxTime = 5;
	private int maxEpoch = 5;
    private int[][][] history;
    private int relativeTimePoints = 0;
    private int[] absoluteTimePoints;
    private BooleanVar[][][] initialValues;		//[this.numIntentions][this.numTimePoints][FD - index 0 / PD - index 1 / PS - index 2 / FS - index 3]
    											// Note if model only has initial values then it will be [numintentions][1][4].
 
    
	public List<IntentionalElement> getIntElements() {
		return intElements;
	}
	
	public void setIntElements(List<IntentionalElement> intElements) {
		this.intElements = intElements;
	}
	
	public List<Actor> getActors() {
		return actors;
	}
	
	public void setActors(List<Actor> actors) {
		this.actors = actors;
	}
	
	public List<EvolutionLink> getEvolutionLink() {
		return evolutionLink;
	}
	
	public void setEvolutionLink(List<EvolutionLink> evolutionLink) {
		this.evolutionLink = evolutionLink;
	}
	
	public List<Contribution> getContribution() {
		return contribution;
	}
	
	public void setContribution(List<Contribution> contribution) {
		this.contribution = contribution;
	}
	
	public List<Decomposition> getDecomposition() {
		return decomposition;
	}
	
	public void setDecomposition(List<Decomposition> decomposition) {
		this.decomposition = decomposition;
	}
	
	public List<Dependency> getDependency() {
		return dependency;
	}
	
	public void setDependency(List<Dependency> dependency) {
		this.dependency = dependency;
	}
	
	public List<EpochConstraint> getConstraintsBetweenEpochs() {
		return constraintsBetweenEpochs;
	}
	
	public void setConstraintsBetweenEpochs(List<EpochConstraint> constraintsBetweenEpochs) {
		this.constraintsBetweenEpochs = constraintsBetweenEpochs;
	}
	
	public int getMaxTime() {
		return maxTime;
	}
	
	public void setMaxTime(int maxTime) {
		this.maxTime = maxTime;
	}
	
	public int getMaxEpoch() {
		return maxEpoch;
	}
	
	public void setMaxEpoch(int maxEpoch) {
		this.maxEpoch = maxEpoch;
	}
	
	public int[][][] getHistory() {
		return history;
	}
	
	public void setHistory(int[][][] history) {
		this.history = history;
	}
	
	public int getRelativeTimePoints() {
		return relativeTimePoints;
	}
	
	public void setRelativeTimePoints(int relativeTimePoints) {
		this.relativeTimePoints = relativeTimePoints;
	}
	
	public int[] getAbsoluteTimePoints() {
		return absoluteTimePoints;
	}
	
	public void setAbsoluteTimePoints(int[] absoluteTimePoints) {
		this.absoluteTimePoints = absoluteTimePoints;
	}

}
