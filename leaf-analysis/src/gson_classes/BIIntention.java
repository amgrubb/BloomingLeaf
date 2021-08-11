package gson_classes;

import java.util.List;

public class BIIntention {
    private Attributes attributes;
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
    }
}
