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

	public IntentionEvaluation[] getUserAssignmentsList() {
		return this.userAssignmentsList;
	}

	public int[] getAbsTimePtsArr() {
		int[] arr = new int[this.absTimePtsArr.size()];
		for (int i = 0; i < this.absTimePtsArr.size(); i++) {
			arr[i] = Integer.parseInt(this.absTimePtsArr.get(i));
		}
		return arr;
	}

	public ArrayList<IntentionEvaluation> getInitialIntentionEvaluations() {
		ArrayList<IntentionEvaluation> res = new ArrayList<IntentionEvaluation>();
		for (IntentionEvaluation curr: userAssignmentsList) {
			if (curr.getAbsTime().equals("0")) {
				res.add(curr);
			}
		}
		return res;
	}

	public ArrayList<IntentionEvaluation> getNonInitialIntentionEvaluations() {
		ArrayList<IntentionEvaluation> res = new ArrayList<IntentionEvaluation>();
		for (IntentionEvaluation curr: userAssignmentsList) {
			if (!curr.getAbsTime().equals("0")) {
				res.add(curr);
			}
		}
		return res;
	}

	public AnalysisResult getPreviousAnalysis() {
		return this.previousAnalysis;
	}
	
}

