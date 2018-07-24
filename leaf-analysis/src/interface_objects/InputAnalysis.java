package interface_objects;

import java.util.ArrayList;
import java.util.List;

/**
 * Class responsible to receive data to execute the analysis
 * IMPORTANT:The attributes in this class must be correlated (same name and type) with the JSON attributes.
 * @author marcel
 * @email marcel.serikawa@gmail.com
 */
public class InputAnalysis {
	private String action;
	private String conflictLevel;
	private String numRelTime;
	private String absTimePts;
	private ArrayList<String> absTimePtsArr;
	private String currentState;
	private IntentionEvaluation[] userAssignmentsList;
	private AnalysisResult previousAnalysis;


	private List<IOIntention> elementList;
	
	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public String getCurrentState() {
		return currentState;
	}

	public void setCurrentState(String currentState) {
		this.currentState = currentState;
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


	public List<IOIntention> getElementList() {
		return elementList;
	}

	public void setElementList(List<IOIntention> elementList) {
		this.elementList = elementList;
	}

	public IntentionEvaluation[] getUserAssignmentsList() {
		return this.userAssignmentsList;
	}
	
}

