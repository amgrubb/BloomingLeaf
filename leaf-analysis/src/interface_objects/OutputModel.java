package interface_objects;

import java.util.ArrayList;
import java.util.List;

public class OutputModel {

	private List<String> timePoints = new ArrayList<>();
	private List<String> unsolvedTimePoints = new ArrayList<>();
	private List<OutputElement> elementList = new ArrayList<>();
	
	public List<String> getTimePoints() {
		return timePoints;
	}

	public void setTimePoints(List<String> timePoints) {
		this.timePoints = timePoints;
	}

	public List<String> getUnsolvedTimePoints() {
		return unsolvedTimePoints;
	}

	public void setUnsolvedTimePoints(List<String> unsolvedTimePoints) {
		this.unsolvedTimePoints = unsolvedTimePoints;
	}

	public void setElementList(List<OutputElement> elementList) {
		this.elementList = elementList;
	}

	public List<OutputElement> getElementList() {
		return this.elementList;
	}

}
