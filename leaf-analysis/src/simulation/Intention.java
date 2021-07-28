package simulation;

import java.util.HashMap;
import java.util.List;

import org.jacop.core.IntVar;

import gson_classes.BIEvolvingFunction;
import gson_classes.BIFunctionSegment;
import gson_classes.BIUserEvaluation;
import gson_classes.ICell;

public class Intention extends LinkableElement {
	private static int idcounter = 0;
	
	@SuppressWarnings("unused")
	private Actor actor = null;
	@SuppressWarnings("unused")
	private IntentionalElementType type = IntentionalElementType.GOAL; 
	
	private HashMap<Integer, String> userEvals;
	private FunctionSegment[] evolvingFunctions;
	
	public Intention(String uniqueID, String nodeName, Actor nodeActor, String nodeType,
			BIEvolvingFunction nodeFunctions, HashMap<Integer, String> nodeEvals){
		super(Intention.getNewBackendID(), nodeName, uniqueID);
		this.actor = nodeActor;
		this.type = IntentionalElementType.getByBBMName(nodeType);
		this.userEvals = nodeEvals;
		this.evolvingFunctions = unrollBIEvolvingFunction(nodeFunctions);
	}
	
	private static String getNewBackendID() {
		String backID = String.format("%04d", idcounter);
		idcounter++;
		return backID;
	}
	
	private FunctionSegment[] unrollBIEvolvingFunction(BIEvolvingFunction inFunc) {
		if (!inFunc.getHasRepeat()) {
			BIFunctionSegment[] biList = inFunc.getFunctionSegList();
			FunctionSegment[] list = new FunctionSegment[biList.length];
			for (int i = 0; i < list.length; i++) {
				BIFunctionSegment seg = biList[i];
				list[i] = new FunctionSegment(seg.getType(),seg.getRefEvidencePair(), 
						seg.getStartTP(), seg.getStartAT(), this.id);
			}
		} else {	// Has repeat!
			//TODO unroll repeat
//	        Integer repAbsTime;
//	        Integer repCount;
//	        String repStart;
//	        String repStop;
			
			
		}
		
		return null;
	}
	
	
	
	
	/** Creates an intention to be added to the mode.
	 *		Note: Assumes Actors have already been read into the model. 
	 * @param iNode the input node to be added
	 * @param modelSpec	the initial model specification containing actors
	 * @return	the new intention
	 */
	public static Intention createIntention(ICell iNode, ModelSpec modelSpec) {
		// Determine if intention has an actor.
		Actor nodeActor = null;
		if (iNode.getParent() != null) {
			for(Actor actor : modelSpec.getActors()){
				if(iNode.getParent().equals(actor.getUniqueID())){
					nodeActor = actor;
					break;
				}
			}
		}
		HashMap<Integer, String> userEvaluations = new HashMap<Integer, String>();
		for (BIUserEvaluation eval : iNode.getIntention().getUserEvaluationList()) 
			userEvaluations.put(eval.getAbsTime(), eval.getAssignedEvidencePair());
		
		Intention element = new Intention(iNode.getId(), iNode.getIntention().getNodeName(), 
				nodeActor, iNode.getType(), iNode.getIntention().getEvolvingFunction(), 
				userEvaluations);
		
		return element;
	}
	
	private class FunctionSegment {
		String startTP;
		Integer startAT;
		String type;
		String refEvidencePair;
		private FunctionSegment(String type, String refEvidencePair, String startTimePoint, Integer startAbsTime, String intentionID) {
			this.startTP = "ETP" + intentionID + startTimePoint;
			this.startAT = startAbsTime;
			this.type = type;
			this.refEvidencePair = refEvidencePair;
		} 
		
	}
	
}
