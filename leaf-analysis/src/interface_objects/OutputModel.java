package interface_objects;

import java.util.ArrayList;
import java.util.List;

public class OutputModel {

	private List<OutputElement> elementList = new ArrayList<>();
	private List<IOStateModel> allSolution = new ArrayList<>();
	private List<String> finalAssignedEpoch = new ArrayList<>();
	private List<String> finalValueTimePoints = new ArrayList<>();	
	private int relativeTimePoints;
    private int[] absoluteTimePoints;
	
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

	public List<IOStateModel> getAllSolution() {
		return allSolution;
	}

	public void setAllSolution(List<IOStateModel> allSolution) {
		this.allSolution = allSolution;
	}
	
}
