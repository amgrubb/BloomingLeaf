package frontend;

import java.util.List;

public class FrontendModel {
	int maxTime;
	int maxEpoch;
	int relativePoints;
	int[] absolutePoinsts;
	List<DataActor> actors;
	List<DataIntention> intentions;
	List<DataLink> links;
	List<DataDynamic> dynamics;
	List<DataConstraint> constraints;
	List<DataQuery> queries;
	List<DataHistory> histories;
	
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
	
	public int getRelativePoints() {
		return relativePoints;
	}
	
	public void setRelativePoints(int relativePoints) {
		this.relativePoints = relativePoints;
	}
	
	public int[] getAbsolutePoinsts() {
		return absolutePoinsts;
	}
	
	public void setAbsolutePoinsts(int[] absolutePoinsts) {
		this.absolutePoinsts = absolutePoinsts;
	}
	
	public List<DataActor> getActors() {
		return actors;
	}
	
	public void setActors(List<DataActor> actors) {
		this.actors = actors;
	}
	
	public List<DataIntention> getIntentions() {
		return intentions;
	}
	
	public void setIntentions(List<DataIntention> intentions) {
		this.intentions = intentions;
	}
	
	public List<DataLink> getLinks() {
		return links;
	}
	
	public void setLinks(List<DataLink> links) {
		this.links = links;
	}
	
	public List<DataDynamic> getDynamics() {
		return dynamics;
	}
	
	public void setDynamics(List<DataDynamic> dynamics) {
		this.dynamics = dynamics;
	}
	
	public List<DataConstraint> getConstraints() {
		return constraints;
	}
	
	public void setConstraints(List<DataConstraint> constraints) {
		this.constraints = constraints;
	}
	
	public List<DataQuery> getQueries() {
		return queries;
	}
	
	public void setQueries(List<DataQuery> queries) {
		this.queries = queries;
	}
	
	public List<DataHistory> getHistories() {
		return histories;
	}
	
	public void setHistories(List<DataHistory> histories) {
		this.histories = histories;
	}
	
}
