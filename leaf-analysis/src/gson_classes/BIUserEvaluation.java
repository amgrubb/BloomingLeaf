package gson_classes;

public class BIUserEvaluation {
    private Attributes attributes;
    
    public BIUserEvaluation(String assignedEvidencePair, Integer absTime) {
    	this.attributes = new Attributes(assignedEvidencePair, absTime);
    }
    
	public String getAssignedEvidencePair() {
		return attributes.assignedEvidencePair;
	}
	public Integer getAbsTime() {
		return attributes.absTime;
	}
    private class Attributes {
        String assignedEvidencePair;
        Integer absTime;
        
        public Attributes(String assignedEvidencePair, Integer absTime) {
        	this.assignedEvidencePair = assignedEvidencePair;
        	this.absTime = absTime;
        }
    }
}
