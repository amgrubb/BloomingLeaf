package simulation;

import java.util.List;

import gson_classes.BIEvolvingFunction;
import gson_classes.BIUserEvaluation;
import gson_classes.ICell;

public class Intention extends LinkableElement {
	private static int idcounter;
	
	private Actor actor = null;
	private IntentionalElementType type = IntentionalElementType.GOAL;
	private BIEvolvingFunction evolvingFunction; 
	private List<BIUserEvaluation> userEvals;
	//public IntentionalElementDynamicType dynamicType = IntentionalElementDynamicType.NT;
	//boolean userDefinedDynamicType = false;	
	//UDFunctionCSP cspUDFunct = null;
	//boolean[] dynamicFunctionMarkedValue; 
	
	public Intention(String uniqueID, String nodeName, Actor nodeActor, String nodeType,
			BIEvolvingFunction nodeFunctions, List<BIUserEvaluation> nodeEvals){
		super(Intention.getNewBackendID(), nodeName, uniqueID);
		this.actor = nodeActor;
		this.type = IntentionalElementType.getByBBMName(nodeType);
		this.evolvingFunction = nodeFunctions;
		this.userEvals = nodeEvals;
	}
	
	private static String getNewBackendID() {
		String backID = String.format("%04d", idcounter);
		idcounter++;
		return backID;
	}
	
	
	
	
	
	
	//Assume Actors have already been read into the model.
	public static Intention createIntention(ICell iNode, ModelSpec modelSpec) {
		Actor nodeActor = null;
		if (iNode.getParent() != null) {
			for(Actor actor : modelSpec.getActors()){
				if(iNode.getParent().equals(actor.getUniqueID())){
					nodeActor = actor;
					break;
				}
			}
		}
		
		Intention element = new Intention(iNode.getId(), iNode.getIntention().getNodeName(), 
				nodeActor, iNode.getType(), iNode.getIntention().getEvolvingFunction(), 
				iNode.getIntention().getUserEvaluationList());
		
		return element;
	}
	
}
