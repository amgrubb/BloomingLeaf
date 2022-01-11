package simulation;

import java.util.HashMap;

import gson_classes.BIEvolvingFunction;
import gson_classes.BIFunctionSegment;
import gson_classes.BIUserEvaluation;
import gson_classes.ICell;

public class Intention extends AbstractLinkableElement {
	private static int idcounter = 0;
	
	@SuppressWarnings("unused")
	private Actor actor = null;
	
	//private IntentionalElementType type = IntentionalElementType.GOAL; 
	
	private HashMap<Integer, String> userEvals;
	private FunctionSegment[] evolvingFunctions;
	private String type;
	
	public Intention(String uniqueID, String nodeName, Actor nodeActor, String nodeType,
			BIEvolvingFunction nodeFunctions, HashMap<Integer, String> nodeEvals){
		super(Intention.getNewBackendID(), nodeName, uniqueID);
		this.actor = nodeActor;
		this.type = nodeType;
		this.userEvals = nodeEvals;
		this.evolvingFunctions = unrollBIEvolvingFunction(nodeFunctions);
	}
	
	private static String getNewBackendID() {
		String backID = String.format("%03d", idcounter);
		idcounter++;
		return backID;
	}
	
	public String getRealFuncSegTP(String initialTP) {
		char letter = initialTP.charAt(0);
		int segNum = letter - 'A' + 1;
		if (evolvingFunctions.length > (segNum + 1))
			return null;
		else
			return evolvingFunctions[segNum].getStartTP();
	}
	public boolean updateRealFuncSegTP(String oldSegTP, String newSegTP) {
		for (FunctionSegment seg : evolvingFunctions) 
			if (seg.getStartTP().equals(oldSegTP)){
				seg.updateStartTP(newSegTP);
				return true;
			}
		return false;
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
			return list;
		} else {	// Has repeat!
			int repStartIndex = -1;
			int repStopIndex = -1;
			BIFunctionSegment[] biList = inFunc.getFunctionSegList();
			for (int i = 0; i < biList.length; i++) {
				if (biList[i].getStartTP().equals(inFunc.getRepStart()))
						repStartIndex = i;
				if (biList[i].getStartTP().equals(inFunc.getRepStop()))
						repStopIndex = i;
			}
			if (repStartIndex == -1) 
				repStartIndex = 0;
			if (repStopIndex == -1)
				repStopIndex = biList.length;
			int repLength = repStopIndex - repStartIndex; 
			int realStopIndex = repStartIndex + (repLength * inFunc.getRepCount());
			int totalNumSegment = biList.length + ((inFunc.getRepCount() - 1) * repLength);

			// Check to make sure if there is a repeating segment that it has a start time.
			Integer repATLength = inFunc.getRepAbsTime();
			Integer repAT = biList[repStartIndex].getStartAT();
			if (repATLength != null && repAT == null)
				throw new RuntimeException("Intention has repeating segment with absTime, but repStartAT is null.");

			FunctionSegment[] list = new FunctionSegment[totalNumSegment];

			int i = 0; // Corresponds to the list index for the new FunctionSegment[]
			int s = 0; // Corresponds to the input segment index.
			while(i < repStartIndex){
				BIFunctionSegment seg = biList[s];
				list[i] = new FunctionSegment(seg.getType(),seg.getRefEvidencePair(), 
						seg.getStartTP(), seg.getStartAT(), this.id);
				i++;
				s++;
			}
			int rNum = 1;
			while(i < realStopIndex){				
				BIFunctionSegment seg = biList[s];
				String repTP = "E" + this.id + ":R" + rNum + seg.getStartTP();
				list[i] = new FunctionSegment(seg.getType(),seg.getRefEvidencePair(), 
						repTP, repAT);
				i++;
				s++;
				if (s == repStopIndex) {
					rNum++;
					s = repStartIndex;		
				}
				if (repATLength != null && repAT != null)
					repAT += repATLength;
			}
			s = repStopIndex;
			while(i < list.length) { 
				BIFunctionSegment seg = biList[s];
				list[i] = new FunctionSegment(seg.getType(),seg.getRefEvidencePair(), 
						seg.getStartTP(), seg.getStartAT(), this.id);
				i++;
				s++;
			}
			return list;
		}
	}
	
	
	public void assignNBFunction(String transitionTP, Integer transitionAT) {
		this.evolvingFunctions = new FunctionSegment[2];
		this.evolvingFunctions[0] = new FunctionSegment("C", "0000", "Initial", 0);
		this.evolvingFunctions[1] = new FunctionSegment("R", "0000", transitionTP, transitionAT);
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

	public FunctionSegment[] getEvolvingFunctions() {
		return evolvingFunctions;
	}

	public HashMap<Integer, String> getUserEvals() {
		return userEvals;
	}
	
	public String getType() {
		return type;
	}
	
	public String getParentID() {
		if (actor != null) {
			return actor.getUniqueID();
		} else {
			return null;
		}
	}
	
}
