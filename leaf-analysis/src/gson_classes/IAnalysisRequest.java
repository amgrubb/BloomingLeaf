package gson_classes;

public class IAnalysisRequest {
	@SuppressWarnings("unused")
	private String name;
	private String action;
	private String conflictLevel;
	private String numRelTime;
//	private String currentState;
	private IOSolution previousAnalysis;
	//"userAssignmentsList":[]
	//"previousAnalysis":null,
	//"selected":true,
	//"results":[]
	public String getAction() {
		return action;
	}
	public String getConflictLevel() {
		return conflictLevel;
	}
	public String getNumRelTime() {
		return numRelTime;
	}
//	public String getCurrentState() {
//		return currentState;
//	}
	public IOSolution getPreviousAnalysis() {
		return previousAnalysis;
	}
}
