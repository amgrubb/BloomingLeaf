package gson_classes;

public class IAnalysisRequest {
	@SuppressWarnings("unused")
	private String name;					// Request X
	private String action;					// "singlePath" or "allNextStates" or "updatePath"
	private String conflictLevel;	
	private String numRelTime;
	private IOSolution previousAnalysis;	// For "singlePath" from time point zero, previous analysis is assumed to be null;

	public String getAction() {
		return action;
	}
	public String getConflictLevel() {
		return conflictLevel;
	}
	public String getNumRelTime() {
		return numRelTime;
	}
	public IOSolution getPreviousAnalysis() {
		return previousAnalysis;
	}
}
