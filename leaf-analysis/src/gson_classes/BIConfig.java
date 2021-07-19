package gson_classes;

public class BIConfig {
	private Attributes attributes;
	
	private class Attributes {
		String absTimePts;
        String action;
        String conflictLevel;
        String currentState;
        String name;
        String numRelTime;
        String previousAnalysis; //The type is AnalysisResult
        String results; //The type is ResultCollection
        Boolean selected;
        String userAssignmentsList; // The type is Array.<UserEvaluation>
	}
}
