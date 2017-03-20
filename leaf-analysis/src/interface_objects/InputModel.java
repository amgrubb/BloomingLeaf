package interface_object;

import java.util.List;

public class Model {
	private List<IOActor> actors;
	private List<IOIntention> intentions;
	private List<IOLink> links;
	private List<IODynamic> dynamics;
	private List<IOConstraint> constraints;
    private List<StateModel> allStatesModel;
	
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

	public List<StateModel> getAllStatesModel() {
		return allStatesModel;
	}

	public void setAllStatesModel(List<StateModel> allStatesModel) {
		this.allStatesModel = allStatesModel;
	}
	
}
