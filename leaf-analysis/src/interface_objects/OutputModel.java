package interface_objects;

import java.util.ArrayList;
import java.util.List;

public class OutputModel {

	private List<OutputElement> elementList = new ArrayList<>();
	private List<String> finalAssignedEpoch = new ArrayList<>();
	private List<String> finalValueTimePoints = new ArrayList<>();	
	
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
