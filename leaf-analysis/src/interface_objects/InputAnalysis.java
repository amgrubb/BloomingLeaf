package interface_objects;

import java.util.List;

/**
 * Class responsible to receive data to execute the analysis
 * IMPORTANT:The attributes in this class must be correlated (same name and type) with the JSON attributes.
 * @author marcel
 * @email marcel.serikawa@gmail.com
 */
public class InputAnalysis {
	private String currentState;
	private String initialAssignedEpoch;
	private String initialValueTimePoints;
	//TODO: merge this to variable into one "typeOfAnalysis"
	private String solveSinglePath;
	private String getNextState;
	private String maxAbsTime;
	private String conflictLevel;
	private String numRelTime;
	private String absTimePts;
	private List<IOIntention> elementList;
	
	public String getCurrentState() {
		return currentState;
	}

	public void setCurrentState(String currentState) {
		this.currentState = currentState;
	}

	public String getMaxAbsTime() {
		return maxAbsTime;
	}
	
	public void setMaxAbsTime(String maxAbsTime) {
		this.maxAbsTime = maxAbsTime;
	}
	
	public String getConflictLevel() {
		return conflictLevel;
	}
	
	public void setConflictLevel(String conflictLevel) {
		this.conflictLevel = conflictLevel;
	}
	
	public String getNumRelTime() {
		return numRelTime;
	}
	
	public void setNumRelTime(String numRelTime) {
		this.numRelTime = numRelTime;
	}
	
	public String getAbsTimePts() {
		return absTimePts;
	}
	
	public void setAbsTimePts(String absTimePts) {
		this.absTimePts = absTimePts;
	}
	
	public String getSolveSinglePath() {
		return solveSinglePath;
	}
	
	public void setSolveSinglePath(String solveSinglePath) {
		this.solveSinglePath = solveSinglePath;
	}
	
	public String getGetNextState() {
		return getNextState;
	}
	
	public void setGetNextState(String getNextState) {
		this.getNextState = getNextState;
	}

	public String getInitialAssignedEpoch() {
		return initialAssignedEpoch;
	}

	public void setInitialAssignedEpoch(String initialAssignedEpoch) {
		this.initialAssignedEpoch = initialAssignedEpoch;
	}

	public String getInitialValueTimePoints() {
		return initialValueTimePoints;
	}

	public void setInitialValueTimePoints(String initialValueTimePoints) {
		this.initialValueTimePoints = initialValueTimePoints;
	}

	public List<IOIntention> getElementList() {
		return elementList;
	}

	public void setElementList(List<IOIntention> elementList) {
		this.elementList = elementList;
	}
	
}

