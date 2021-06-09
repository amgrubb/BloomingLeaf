package interface_objects;

import java.util.ArrayList;
import java.util.List;

public class OutputModel {

	private List<OutputElement> elementList = new ArrayList<>();
	private List<IOStateModel> allSolution = new ArrayList<>();
	private List<String> assignedEpoch = new ArrayList<>();
	private List<String> timePointPath = new ArrayList<>();
	@SuppressWarnings("unused")
	private int timePointPathSize;
	
	public void setElementList(List<OutputElement> elementList) {
		this.elementList = elementList;
	}

	public List<OutputElement> getElementList() {
		return this.elementList;
	}

	public List<String> getAssignedEpoch() {
		return assignedEpoch;
	}

	public void setAssignedEpoch(List<String> assignedEpoch) {
		this.assignedEpoch = assignedEpoch;
	}

	public List<String> getTimePointPath() {
		return timePointPath;
	}

	public void setTimePointPath(List<String> timePointPath) {
		this.timePointPath = timePointPath;
	}


	public List<IOStateModel> getAllSolution() {
		return allSolution;
	}

	public void setAllSolution(List<IOStateModel> allSolution) {
		this.allSolution = allSolution;
	}
	
}
