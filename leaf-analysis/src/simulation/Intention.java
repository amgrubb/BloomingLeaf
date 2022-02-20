package simulation;

import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

import gson_classes.BIEvolvingFunction;
import gson_classes.BIFunctionSegment;
import gson_classes.BIUserEvaluation;
import gson_classes.ICell;

import merge.MFunctionSegment;

public class Intention extends AbstractLinkableElement {
	private static int idcounter = 0;
	
	@SuppressWarnings("unused")
	private Actor actor = null;
	
	//private IntentionalElementType type = IntentionalElementType.GOAL; 
	
	private HashMap<Integer, String> userEvals;
	private FunctionSegment[] evolvingFunctions;
	private List<MFunctionSegment> mergedEvolvingFunctions;  // more complete function info
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
		
		System.out.println("-----------------------------------");
		System.out.println("Building user evaluation for " + iNode.getIntention().getNodeName());
		System.out.println(userEvaluations);
		System.out.println("-----------------------------------");
		
		Intention element = new Intention(iNode.getId(), iNode.getIntention().getNodeName(), 
				nodeActor, iNode.getType(), iNode.getIntention().getEvolvingFunction(), 
				userEvaluations);
		
		return element;
	}

	public FunctionSegment[] getEvolvingFunctions() {
		return evolvingFunctions;
	}
	
	public void setEvolvingFunctions(FunctionSegment[] segments) {
		evolvingFunctions = segments;
	}
	
	public List<MFunctionSegment> getMEvolvingFunctions() {
		return mergedEvolvingFunctions;
	}
	
	public void setMergedEvolvingFunctions(List<MFunctionSegment> segments) {
		mergedEvolvingFunctions = segments;
	}

	public HashMap<Integer, String> getUserEvals() {
		return userEvals;
	}
	
	public String getType() {
		return type;
	}

	public void setType(String t){
		type = t;
	}

	public Actor getActor() {
		return actor;
	}
	
	public void setActor(Actor actor) {
		this.actor = actor;
	}

	/** Compares types. If i's type is greater, then return will be less than 0.
	 */
	public int compareType(Intention i){
		HashMap<String, Integer> typeValues = new HashMap<String, Integer>();
		typeValues.put("basic.Goal", 0);
		typeValues.put("basic.Task", 1);
		typeValues.put("basic.Softgoal", 2);
		typeValues.put("basic.Resource", 3);
		return typeValues.get(type) - typeValues.get(i.getType());
	}
	
	public String getParentID() {
		if (actor != null) {
			return actor.getUniqueID();
		} else {
			return null;
		}
	}
	
	public List<String> getEvolvingFunctionStartTPs() {
		// TODO: handle compound timepoints from == constraints
		// System.out.println("starting geteftp");
		List<String> tps = new ArrayList<>();
		for (FunctionSegment func: this.getEvolvingFunctions()) {
			String startTP = func.getStartTP();
			// System.out.println(startTP);
			if (startTP.contains("TP")) {  // all but initial
				// format E{id}TP{tp}
				String[] timepoints = startTP.split("TP");
				/**
				System.out.println(this.getId());
				System.out.println(timepoints[0]);  // should be "E" + this.getId();
				System.out.println(timepoints[1]);
				*/
				startTP = timepoints[1];
			}
			tps.add(startTP);
		}
		// System.out.println(tps);
		return tps;
	}
	
	public List<Integer> getEvolvingFunctionStartATs() {
		List<Integer> tps = new ArrayList<>();
		for (FunctionSegment func: this.getEvolvingFunctions()) {
			tps.add(func.getStartAT());
		}
		return tps;
	}
	
	public List<String> getEvolvingFunctionStartTPsFull() {
		List<String> tps = new ArrayList<>();
		for (FunctionSegment func: this.getEvolvingFunctions()) {
			tps.add(func.getStartTP());
		}
		return tps;
	}
	
	public List<String> getEvolvingFunctionStartTimes() {
		List<String> tps = new ArrayList<>();
		for (FunctionSegment func: this.getEvolvingFunctions()) {
			tps.add(func.getStartTime());
		}
		return tps;
	}
	
	public List<String> getEvolvingFunctionStartTimesIncremented(Integer delta) {
		List<String> tps = new ArrayList<>();
		for (FunctionSegment func: this.getEvolvingFunctions()) {
			tps.add(func.getStartTimeIncremented(delta));
		}
		return tps;
	}
	
	public List<String> getEvolvingFunctionRefEvidencePairs() {
		List<String> tps = new ArrayList<>();
		for (FunctionSegment func: this.getEvolvingFunctions()) {
			tps.add(func.getRefEvidencePair());
		}
		return tps;
	}
	
	public String getInitialUserEval() {
		if (userEvals.containsKey(0)) {
			return userEvals.get(0);
		} else {
			return "(no value)";
		}
	}
	public String getUserEvalAt(Integer absTP) {
		if (userEvals.containsKey(absTP)) {
			return userEvals.get(absTP);
		} else {
			return "(no value)";
		}
	}
	// add delta to each absTP in userEvals
	public void incrementUserEvals(Integer delta) {
		HashMap<Integer, String> newUserEvaluations = new HashMap<>();
		for(Integer absTP: userEvals.keySet()) {
			newUserEvaluations.put(absTP + delta, getUserEvalAt(absTP));
		}
		userEvals = newUserEvaluations;
	}
	public void setUserEvals(HashMap<Integer, String> newUserEvals) {
		userEvals = newUserEvals;
	}
	
}
