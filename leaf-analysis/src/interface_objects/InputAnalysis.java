package interface_objects;

public class InputAnalysis {
	String maxAbsTime;
	String conflictLevel;
	String numRelTime;
	String absTimePts;
	String absVal;
	String solveSinglePath;
	String getNextState;
	String currentState;
	
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
	
	public String getAbsVal() {
		return absVal;
	}
	
	public void setAbsVal(String absVal) {
		this.absVal = absVal;
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
	
}

