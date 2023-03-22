package gson_classes;

import java.util.List;

public class BIIntention {
    private Attributes attributes;
    
    public BIIntention(BIEvolvingFunction evolvingFunction, String nodeName, List<BIUserEvaluation> userEvalutationList) {
    	this.attributes = new Attributes(evolvingFunction, nodeName, userEvalutationList);
    }
    
	public BIEvolvingFunction getEvolvingFunction() {
		return attributes.evolvingFunction;
	}
	public String getNodeName() {
		return attributes.nodeName;
	}
	public List<BIUserEvaluation> getUserEvaluationList() {
		return attributes.userEvaluationList;
	} 
    
    private class Attributes {
    	BIEvolvingFunction evolvingFunction; 
        String nodeName;
        List<BIUserEvaluation> userEvaluationList;
        
        private Attributes(BIEvolvingFunction evolvingFunction, String nodeName, List<BIUserEvaluation> userEvalutationList) {
        	this.evolvingFunction = evolvingFunction;
        	this.nodeName = nodeName;
        	this.userEvaluationList = userEvalutationList;
        }
    }
}
