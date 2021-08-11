package gson_classes;

public class BIUserEvaluation {
    private Attributes attributes;
	public String getAssignedEvidencePair() {
		return attributes.assignedEvidencePair;
	}
	public Integer getAbsTime() {
		return attributes.absTime;
	}
    private class Attributes {
        String assignedEvidencePair;
        Integer absTime;
    }
}
