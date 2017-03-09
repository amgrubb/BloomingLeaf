package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ModelSpecPojo {
	
	private List<IntentionalElement> intElements = new ArrayList<IntentionalElement>();
	private List<Actor> actors = new ArrayList<Actor>();
	private List<EvolutionLink> evolutionLink = new ArrayList<EvolutionLink>(); 
	private List<Contribution> contribution = new ArrayList<Contribution>();
	private List<Decomposition> decomposition = new ArrayList<Decomposition>();
	private List<Dependency> dependency = new ArrayList<Dependency>();
	private List<EpochConstraint> constraintsBetweenEpochs = new ArrayList<EpochConstraint>();
	private int maxTime = 5;
    private int[][][] history;
    private int relativeTimePoints = 0;
    private int[] absoluteTimePoints;
    private boolean[][][] initialValues;		// Holds the initial values whether they are single or multiple.
												//[this.numIntentions][this.numTimePoints][FD - index 0 / PD - index 1 / PS - index 2 / FS - index 3]
												// Note if model only has initial values then it will be [numintentions][1][4].
    private int[] initialValueTimePoints;		// Hold the assigned times for each of the initial Values. Should be same length of second paramater of initialValues; 
    private HashMap<String, Integer> assignedEpochs; //Hash map to hold the epochs with assigned values.
    private char conflictAvoidLevel; 			// Should have the value S/M/W/N for Strong, Medium, Weak, None.
    private boolean[][][] finalValues = null;	// Values assigned by the solver.
    private int[] finalValueTimePoints = null;	// Values assigned by the solver.
    private HashMap<String, Integer> finalAssignedEpochs = null; // Values assigned by the solver.
    
    
    
	public void setFinalValues(boolean[][][] finalValues) {
		this.finalValues = finalValues;
	}

	public void setFinalValueTimePoints(int[] finalValueTimePoints) {
		this.finalValueTimePoints = finalValueTimePoints;
	}

	public void setFinalAssignedEpochs(HashMap<String, Integer> finalAssignedEpochs) {
		this.finalAssignedEpochs = finalAssignedEpochs;
	}

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
