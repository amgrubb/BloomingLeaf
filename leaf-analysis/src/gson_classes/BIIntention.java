package gson_classes;

import java.util.List;

public class BIIntention {
    private Attributes attributes;

    private class Attributes {
    	BIEvolvingFunction evolvingFunction; 
        String nodeActorID;
        String nodeName;
        String nodetype;
        List<BIUserEvaluation> userEvaluationList; 
    }
}
