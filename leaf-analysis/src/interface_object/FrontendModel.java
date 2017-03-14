package interface_object;

import java.util.List;

public class FrontendModel {
	String maxTime;
	private String maxEpoch;
	String relativePoints;
	String[] absolutePoinsts;
	private List<IOActor> actors;
	private List<IOIntention> intentions;
	private List<IOLink> links;
	private List<IODynamic> dynamics;
	private List<IOConstraint> constraints;
	private List<IOHistory> histories;
	
    private boolean solveAllSolutions = false;
    private boolean solveSingleState = false;
    
	public List<IOActor> getActors() {
		return actors;
	}
	
	public void setActors(List<IOActor> actors) {
		this.actors = actors;
	}
	
	public List<IOIntention> getIntentions() {
		return intentions;
	}
	
	public void setIntentions(List<IOIntention> intentions) {
		this.intentions = intentions;
	}
	
	public List<IOLink> getLinks() {
		return links;
	}
	
	public void setLinks(List<IOLink> links) {
		this.links = links;
	}
	
	public List<IODynamic> getDynamics() {
		return dynamics;
	}
	
	public void setDynamics(List<IODynamic> dynamics) {
		this.dynamics = dynamics;
	}
	
	public List<IOConstraint> getConstraints() {
		return constraints;
	}
	
	public void setConstraints(List<IOConstraint> constraints) {
		this.constraints = constraints;
	}
	
	public List<IOHistory> getHistories() {
		return histories;
	}
	
	public void setHistories(List<IOHistory> histories) {
		this.histories = histories;
	}
	
	public String getMaxEpoch() {
		return maxEpoch;
	}

	public void setMaxEpoch(String maxEpoch) {
		this.maxEpoch = maxEpoch;
	}

	public boolean isSolveAllSolutions() {
		return solveAllSolutions;
	}

	public void setSolveAllSolutions(boolean solveAllSolutions) {
		this.solveAllSolutions = solveAllSolutions;
	}

	public boolean isSolveSingleState() {
		return solveSingleState;
	}

	public void setSolveSingleState(boolean solveSingleState) {
		this.solveSingleState = solveSingleState;
	}
	
	
}
