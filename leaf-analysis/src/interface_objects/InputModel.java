package interface_objects;

import java.util.List;

/**
 * Class that represents the model got from the frontend.
 * This class must be processed to the backend model for the analysis.
 * @author marcel
 *
 */
public class InputModel {
	private List<InputActor> actors;
	private List<InputIntention> intentions;
	private List<InputLink> links;
	private List<InputDynamic> dynamics;
	private List<InputConstraint> constraints;
    private List<IOStateModel> allStatesModel;
	
	public List<InputActor> getActors() {
		return actors;
	}
	
	public void setActors(List<InputActor> actors) {
		this.actors = actors;
	}
	
	public List<InputIntention> getIntentions() {
		return intentions;
	}
	
	public void setIntentions(List<InputIntention> intentions) {
		this.intentions = intentions;
	}
	
	public List<InputLink> getLinks() {
		return links;
	}
	
	public void setLinks(List<InputLink> links) {
		this.links = links;
	}
	
	public List<InputDynamic> getDynamics() {
		return dynamics;
	}
	
	public void setDynamics(List<InputDynamic> dynamics) {
		this.dynamics = dynamics;
	}
	
	public List<InputConstraint> getConstraints() {
		return constraints;
	}
	
	public void setConstraints(List<InputConstraint> constraints) {
		this.constraints = constraints;
	}

	public List<IOStateModel> getAllStatesModel() {
		return allStatesModel;
	}

	public void setAllStatesModel(List<IOStateModel> allStatesModel) {
		this.allStatesModel = allStatesModel;
	}
	
}
