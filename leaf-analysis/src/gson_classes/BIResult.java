package gson_classes;

public class BIResult { 
	private Attributes attributes;
	
	private class Attributes {
		String analysisResult; // The type is AnalysisResult
		String name;
        Boolean selected;
	}
}
