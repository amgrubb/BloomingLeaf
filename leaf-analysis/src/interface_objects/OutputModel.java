package interface_objects;

import java.util.ArrayList;
import java.util.List;

public class OutputModel {

	private List<String> timePoints = new ArrayList<>();
	private List<String> times = new ArrayList<>();
	private List<OutputElement> elementList = new ArrayList<>();
	private List<String> epochPoints = new ArrayList<>();
	private List<String> finalAssignedEpoch = new ArrayList<>();
	private List<String> finalValueTimePoints = new ArrayList<>();
	
	
	public List<String> getEpochPoints() {
		return epochPoints;
	}

	public void setEpochPoints(List<String> epochPoints) {
		this.epochPoints = epochPoints;
	}

	public List<String> getTimes() {
		return times;
	}

	public void setTimes(List<String> times) {
		this.times = times;
	}

	public List<String> getTimePoints() {
		return timePoints;
	}

	public void setTimePoints(List<String> timePoints) {
		this.timePoints = timePoints;
	}

	public void setElementList(List<OutputElement> elementList) {
		this.elementList = elementList;
	}

	public List<OutputElement> getElementList() {
		return this.elementList;
	}

	public List<String> getFinalAssignedEpoch() {
		return finalAssignedEpoch;
	}

	public void setFinalAssignedEpoch(List<String> finalAssignedEpoch) {
		this.finalAssignedEpoch = finalAssignedEpoch;
	}

	public List<String> getFinalValueTimePoints() {
		return finalValueTimePoints;
	}

	public void setFinalValueTimePoints(List<String> finalValueTimePoints) {
		this.finalValueTimePoints = finalValueTimePoints;
	}

}
