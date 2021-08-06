package simulation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jacop.constraints.*;
import org.jacop.core.BooleanVar;
import org.jacop.core.IntVar;

public class CSPIntentions {
	private final static boolean DEBUG = true;

	/** Gets the CSP IntVar associated with a time point in the model. 
	 * @param timePointMap	Map between IntVar time points and a collection of named time points from the model
	 * @param name 	The time point name to fine.
	 * @return	The found CSP IntVar Time Point
	 */
	private static IntVar getTimePoint(HashMap<IntVar, List<String>> timePointMap, String name) {
		for (Map.Entry<IntVar, List<String>> entry : timePointMap.entrySet()) {
			for (String item : entry.getValue()) {
				if (item.equals(name))
					return entry.getKey();
			}
		}
		throw new RuntimeException("CSPIntentions: getTimePoint - cannot find timepoint for " + name);
	}
		
	private static PrimitiveConstraint[] createXeqC(BooleanVar[] val1, boolean[] val2){
		return new PrimitiveConstraint[]{
				new XeqC(val1[3], boolToInt(val2[3])),
				new XeqC(val1[2], boolToInt(val2[2])),
				new XeqC(val1[1], boolToInt(val2[1])),
				new XeqC(val1[0], boolToInt(val2[0]))};
	}
	/**
	 * Helper Function: Converts a boolean to an int. 
	 * @param b	boolean value.
	 * @return	int value of b.
	 */
	private static int boolToInt(boolean b) {
	    return b ? 1 : 0;
	}
	
	/**
	 * Returns the evaluation array which is an array of length 4 which represents
	 * the evalValue
	 * @param evalValue
	 * evalValue of interest
	 * @return
	 * returns the evaluation array
	 */
	public static boolean[] convertEvalStringToEvidencePredicates(String evalValue) {
		if (evalValue.matches("[01]+") && evalValue.length() == 4) {
			boolean[] res = new boolean[4];
			for (int i = 0; i < 4; i++) {
				res[i] = (evalValue.charAt(i) == '1');
			}
			return res;
		} else if (evalValue.equals("(no value)")) 
			return null;
		throw new RuntimeException("CSPIntentions: Invalid value " + evalValue + " in getEvaluationArray ");
	}
	
	/**
	 *  Creates the dynamic function constraints for the full path.
	 *  NotBoth constraints created at the end of the function.
	 */
	public static void initializeEvolvingFunctionsForIntentions(
			List<Constraint> constraints, ModelSpec spec,  
			BooleanVar[][][] values, HashMap<String, Integer> uniqueIDToValueIndex,
			IntVar[] timePoints, HashMap<IntVar, List<String>> timePointMap,
			IntVar infinity) {
			
    	for (Intention element : spec.getIntentions()){
    		if (DEBUG) System.out.println("Evolving Intention for " + element.id);
    		
    		Integer i = uniqueIDToValueIndex.get(element.getUniqueID());
    		FunctionSegment[] segList = element.getEvolvingFunctions();
    		if (i == null || segList == null) continue;
    		
    		for (int f = 0; f < segList.length; f++) {
    			FunctionSegment seg = segList[f];
    			System.out.println(seg.getType() + "\t" + seg.getStartTP() + "\t" + seg.getRefEvidencePair());
    			
    			if (seg.getType().equals("R"))
    				continue;

    			IntVar segmentStart = getTimePoint(timePointMap, seg.getStartTP());
				IntVar segmentEnd = null;
				if (f == (segList.length - 1))
					segmentEnd = infinity;
				else
					segmentEnd = getTimePoint(timePointMap, segList[f+1].getStartTP());
				
				boolean[] refEvidence = convertEvalStringToEvidencePredicates(seg.getRefEvidencePair());	
				switch (seg.getType()) {
				case "C":	// CONSTANT
					for (int t = 0; t < values[i].length; t++){
						PrimitiveConstraint[] tempConstant = createXeqC(values[i][t], refEvidence);
						constraints.add(new IfThen(
								new And(new XlteqY(segmentStart, timePoints[t]), new XgtY(segmentEnd, timePoints[t])),
								new And(tempConstant)));
					}
					break;
				case "I":	//INCREASING
	    			for (int t = 0; t < values[i].length; t++){
	    				for (int s = 0; s < values[i].length; s++){
	    					if (t==s)
	    						continue;
	                		PrimitiveConstraint timeCondition = new And(new XltY(timePoints[t], timePoints[s]),
                					new And(new And(new XlteqY(segmentStart, timePoints[t]), new XgtY(segmentEnd, timePoints[t])),
                							new And(new XlteqY(segmentStart, timePoints[s]), new XgtY(segmentEnd, timePoints[s]))));
	    					initializePathIncreaseHelper(constraints, values, i, t, s, timeCondition, false);
	    				}
                		PrimitiveConstraint timeCondition = new And(new XlteqY(segmentStart, timePoints[t]), new XgtY(segmentEnd, timePoints[t]));
	    				initializePathIncreaseMaxValueHelper(constraints, values, i, t, refEvidence, timeCondition);
	    			}
					break;
				case "D":	//DECREASING
					for (int t = 0; t < values[i].length; t++){
	        			for (int s = 0; s < values[i].length; s++){
	        				if (t==s)
	        					continue;
	                		PrimitiveConstraint timeCondition = new And(new XltY(timePoints[t], timePoints[s]),
                					new And(new And(new XlteqY(segmentStart, timePoints[t]), new XgtY(segmentEnd, timePoints[t])),
                							new And(new XlteqY(segmentStart, timePoints[s]), new XgtY(segmentEnd, timePoints[s]))));
	        				initializePathDecreaseHelper(constraints, values, i, t, s, timeCondition, false);
	        			}
                		PrimitiveConstraint timeCondition = new And(new XlteqY(segmentStart, timePoints[t]), new XgtY(segmentEnd, timePoints[t]));
        				initializePathDecreaseMaxValueHelper(constraints, values, i, t, refEvidence, timeCondition);
	        		}
					break;
				default:
					throw new RuntimeException("CSPIntentions: initializeEvolvingFunctionsForIntentions - unknown function segment.");
				}	
    		}    		
    	}
	}
	
    private static final boolean[] boolFD = new boolean[] {true, true, false, false};
    private static final  boolean[] boolPD = new boolean[] {false, true, false, false};
    private static final  boolean[] boolPS = new boolean[] {false, false, true, false};
    private static final  boolean[] boolFS = new boolean[] {false, false, true, true};
    private static final  boolean[] boolTT = new boolean[] {false, false, false, false};
    private static final  boolean[] boolFSFD = new boolean[] {true, true, true, true};
    private static final  boolean[] boolPSPD = new boolean[] {false, true, true, false};
    private static final  boolean[] boolFSPD = new boolean[] {false, true, true, true};
    private static final  boolean[] boolPSFD = new boolean[] {true, true, true, false};
	
	private static void initializePathIncreaseHelper(List<Constraint> constraints, BooleanVar[][][] values,
			int i, int t, int s, PrimitiveConstraint timeCondition, boolean stateUDFunction){
		// stateUDFunction : Only set to true when calling from a UD function where we get next state.
		// Add just increasing constraints.

		PrimitiveConstraint[] tFS = createXeqC(values[i][t], boolFS);
		PrimitiveConstraint[] tPS = createXeqC(values[i][t], boolPS);
		PrimitiveConstraint[] tFSPD = createXeqC(values[i][t], boolFSPD);
		PrimitiveConstraint[] tTT = createXeqC(values[i][t], boolTT);
		PrimitiveConstraint[] tFSFD = createXeqC(values[i][t], boolFSFD);
		PrimitiveConstraint[] tPSPD = createXeqC(values[i][t], boolPSPD);
		PrimitiveConstraint[] tPD = createXeqC(values[i][t], boolPD);
		PrimitiveConstraint[] tPSFD = createXeqC(values[i][t], boolPSFD);
		
		PrimitiveConstraint[] sFS = createXeqC(values[i][s], boolFS);
		PrimitiveConstraint[] sPS = createXeqC(values[i][s], boolPS);
		PrimitiveConstraint[] sFSPD = createXeqC(values[i][s], boolFSPD);
		PrimitiveConstraint[] sTT = createXeqC(values[i][s], boolTT);
		PrimitiveConstraint[] sFSFD = createXeqC(values[i][s], boolFSFD);
		PrimitiveConstraint[] sPSPD = createXeqC(values[i][s], boolPSPD);
		PrimitiveConstraint[] sFD = createXeqC(values[i][s], boolFD);

		if(!stateUDFunction){
			constraints.add(new IfThen(new And(timeCondition, new And(tFS)),
					new And(sFS)));
			constraints.add(new IfThen(new And(timeCondition, new Or(new And(tPS), new And(tFSPD))),
					new Or(new And(sFS), new Or(new And(sPS), new And(sFSPD)))));
			constraints.add(new IfThen(new And(timeCondition, new Or(new And(tTT), new Or(new And(tFSFD), new And(tPSPD)))),
					new Or(
							new Or(new And(sFS), new And(sPS)), 
							new Or(
									new Or(new And(sFSPD), new And(sTT)), 
									new Or(new And(sFSFD), new And(sPSPD))))));
			constraints.add(new IfThen(new And(timeCondition, new Or(new And(tPD), new And(tPSFD))),
					new Not(new And(sFD))));
		} else {
			constraints.add(new IfThen(timeCondition, new IfThen(new And(tFS),
					new And(sFS))));
			constraints.add(new IfThen(timeCondition, new IfThen(new Or(new And(tPS), new And(tFSPD)),
					new Or(new And(sFS), new Or(new And(sPS), new And(sFSPD))))));
			constraints.add(new IfThen(timeCondition, new IfThen(new Or(new And(tTT), new Or(new And(tFSFD), new And(tPSPD))),
					new Or(
							new Or(new And(sFS), new And(sPS)), 
							new Or(
									new Or(new And(sFSPD), new And(sTT)), 
									new Or(new And(sFSFD), new And(sPSPD)))))));
			constraints.add(new IfThen(timeCondition, new IfThen(new Or(new And(tPD), new And(tPSFD)),
					new Not(new And(sFD)))));
		}
	}
	
	private static void initializePathIncreaseMaxValueHelper(List<Constraint> constraints, BooleanVar[][][] values,
			int i, int t, boolean[] dynFVal, PrimitiveConstraint timeCondition){
		// Add constraints over the maximum value.

		PrimitiveConstraint[] tFS = createXeqC(values[i][t], boolFS);
		PrimitiveConstraint[] tPS = createXeqC(values[i][t], boolPS);
		PrimitiveConstraint[] tFSPD = createXeqC(values[i][t], boolFSPD);
		PrimitiveConstraint[] tTT = createXeqC(values[i][t], boolTT);
		PrimitiveConstraint[] tFSFD = createXeqC(values[i][t], boolFSFD);
		PrimitiveConstraint[] tPSPD = createXeqC(values[i][t], boolPSPD);
		PrimitiveConstraint[] tFD = createXeqC(values[i][t], boolFD);		

		if(timeCondition != null){
			if (dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {				//Case <T,FD>	
				constraints.add(new IfThen(timeCondition, new And(tFD)));
			} else if (!dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//Case <T,PD>
				constraints.add(new IfThen(timeCondition, new And(new And(new Not(new And(tFS)), new Not(new And(tPS))),new And(new And(
						new Not(new And(tFSPD)), new Not(new And(tTT))),new And(new Not(new And(tFSFD)), new Not(new And(tPSPD)))))));
			} else if (!dynFVal[0] && !dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//Case <T,T>
				constraints.add(new IfThen(timeCondition, new And(new Not(new And(tFS)),new And(new Not(new And(tPS)),new Not(new And(tFSPD))))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && !dynFVal[3]) {		//Case <PS,T>
				constraints.add(new IfThen(timeCondition, new Not(new And(tFS))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && dynFVal[3]) {		//Case <FS,T>
				; //No constraints to be added.
			} else
				throw new RuntimeException("INC Dynamic Value for intention " + i + " Conflict value.");
		}else{
			if (dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {				//Case <T,FD>	
				constraints.add(new And(tFD));
			} else if (!dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//Case <T,PD>
				constraints.add(new And(new And(new Not(new And(tFS)), new Not(new And(tPS))),new And(new And(
						new Not(new And(tFSPD)), new Not(new And(tTT))),new And(new Not(new And(tFSFD)), new Not(new And(tPSPD))))));
			} else if (!dynFVal[0] && !dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//Case <T,T>
				constraints.add(new And(new Not(new And(tFS)),new And(new Not(new And(tPS)),new Not(new And(tFSPD)))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && !dynFVal[3]) {		//Case <PS,T>
				constraints.add(new Not(new And(tFS)));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && dynFVal[3]) {		//Case <FS,T>
				; //No constraints to be added.
			} else
				throw new RuntimeException("INC Dynamic Value for intention " + i + " Conflict value.");
		}
	}
	

	
	private static void initializePathDecreaseHelper(List<Constraint> constraints, BooleanVar[][][] values,
			int i, int t, int s, PrimitiveConstraint timeCondition, boolean stateUDFunction){
		// Add just decreasing constraints.

		PrimitiveConstraint[] tPS = createXeqC(values[i][t], boolPS);
		PrimitiveConstraint[] tFSPD = createXeqC(values[i][t], boolFSPD);
		PrimitiveConstraint[] tTT = createXeqC(values[i][t], boolTT);
		PrimitiveConstraint[] tFSFD = createXeqC(values[i][t], boolFSFD);
		PrimitiveConstraint[] tPSPD = createXeqC(values[i][t], boolPSPD);
		PrimitiveConstraint[] tPD = createXeqC(values[i][t], boolPD);
		PrimitiveConstraint[] tPSFD = createXeqC(values[i][t], boolPSFD);
		PrimitiveConstraint[] tFD = createXeqC(values[i][t], boolFD);
		
		PrimitiveConstraint[] sFS = createXeqC(values[i][s], boolFS);
		PrimitiveConstraint[] sTT = createXeqC(values[i][s], boolTT);
		PrimitiveConstraint[] sFSFD = createXeqC(values[i][s], boolFSFD);
		PrimitiveConstraint[] sPSPD = createXeqC(values[i][s], boolPSPD);
		PrimitiveConstraint[] sPD = createXeqC(values[i][s], boolPD);
		PrimitiveConstraint[] sPSFD = createXeqC(values[i][s], boolPSFD);
		PrimitiveConstraint[] sFD = createXeqC(values[i][s], boolFD);
			
		if(!stateUDFunction){
			constraints.add(new IfThen(new And(timeCondition, new Or(new And(tPS), new And(tFSPD))),
					new Not(new And(sFS))));
			constraints.add(new IfThen(new And(timeCondition, new Or(new And(tTT), new Or(new And(tFSFD), new And(tPSPD)))),
					new Or(
							new Or(new And(sFD), new And(sPD)), 
							new Or(
									new Or(new And(sPSFD), new And(sTT)), 
									new Or(new And(sFSFD), new And(sPSPD))))));
			constraints.add(new IfThen(new And(timeCondition, new Or(new And(tPD), new And(tPSFD))),
					new Or(new And(sFD), new Or(new And(sPD), new And(sPSFD)))));
			constraints.add(new IfThen(new And(timeCondition, new And(tFD)),
					new And(sFD)));
		} else {
			constraints.add(new IfThen(timeCondition, new IfThen(new Or(new And(tPS), new And(tFSPD)),
					new Not(new And(sFS)))));
			constraints.add(new IfThen(timeCondition, new IfThen(new Or(new And(tTT), new Or(new And(tFSFD), new And(tPSPD))),
					new Or(
							new Or(new And(sFD), new And(sPD)), 
							new Or(
									new Or(new And(sPSFD), new And(sTT)), 
									new Or(new And(sFSFD), new And(sPSPD)))))));
			constraints.add(new IfThen(timeCondition, new IfThen(new Or(new And(tPD), new And(tPSFD)),
					new Or(new And(sFD), new Or(new And(sPD), new And(sPSFD))))));
			constraints.add(new IfThen(timeCondition, new IfThen(new And(tFD),
					new And(sFD))));
		}
	}

	private static void initializePathDecreaseMaxValueHelper(List<Constraint> constraints, BooleanVar[][][] values,
			int i, int t, boolean[] dynFVal, PrimitiveConstraint timeCondition){
		// Add constraints over the minimum value.

		PrimitiveConstraint[] tFS = createXeqC(values[i][t], boolFS);
		PrimitiveConstraint[] tTT = createXeqC(values[i][t], boolTT);
		PrimitiveConstraint[] tFSFD = createXeqC(values[i][t], boolFSFD);
		PrimitiveConstraint[] tPSPD = createXeqC(values[i][t], boolPSPD);
		PrimitiveConstraint[] tPD = createXeqC(values[i][t], boolPD);
		PrimitiveConstraint[] tPSFD = createXeqC(values[i][t], boolPSFD);
		PrimitiveConstraint[] tFD = createXeqC(values[i][t], boolFD);		

		if(timeCondition != null){
			if (dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {				//Case <T,FD>	
				; //No constraints to be added.
			} else if (!dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//Case <T,PD>
				constraints.add(new IfThen(timeCondition, new Not(new And(tFD))));
			} else if (!dynFVal[0] && !dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//Case <T,T>
				constraints.add(new IfThen(timeCondition, new And(new Not(new And(tFD)),new And(new Not(new And(tPD)),new Not(new And(tPSFD))))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && !dynFVal[3]) {		//Case <PS,T>
				constraints.add(new IfThen(timeCondition, new And(new And(new Not(new And(tFD)), new Not(new And(tPD))),new And(new And(
						new Not(new And(tPSFD)), new Not(new And(tTT))),new And(new Not(new And(tFSFD)), new Not(new And(tPSPD)))))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && dynFVal[3]) {		//Case <FS,T>
				constraints.add(new IfThen(timeCondition, new And(tFS)));
			} else
				throw new RuntimeException("INC Dynamic Value for intention " + i + " Conflict value.");
		}else{
			if (dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {				//Case <T,FD>	
				; //No constraints to be added.
			} else if (!dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//Case <T,PD>
				constraints.add(new Not(new And(tFD)));
			} else if (!dynFVal[0] && !dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//Case <T,T>
				constraints.add(new And(new Not(new And(tFD)),new And(new Not(new And(tPD)),new Not(new And(tPSFD)))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && !dynFVal[3]) {		//Case <PS,T>
				constraints.add(new And(new And(new Not(new And(tFD)), new Not(new And(tPD))),new And(new And(
						new Not(new And(tPSFD)), new Not(new And(tTT))),new And(new Not(new And(tFSFD)), new Not(new And(tPSPD))))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && dynFVal[3]) {		//Case <FS,T>
				constraints.add(new And(tFS));
			} else
				throw new RuntimeException("INC Dynamic Value for intention " + i + " Conflict value.");
		}
	}
	
	/*********************************************************************************************************
	 * 
	 * 			USER EVALUATIONS
	 * 
	 *********************************************************************************************************/
	public static void initializeUserEvaluationsForIntentions(
			List<Constraint> constraints, ModelSpec spec,  
			BooleanVar[][][] values, HashMap<String, Integer> uniqueIDToValueIndex,
			IntVar[] timePoints) { //, HashMap<IntVar, List<String>> timePointMap,
			//IntVar infinity) {
	
    	for (Intention element : spec.getIntentions()){
    		if (DEBUG) System.out.println("User Evaluations for " + element.id);
    		
    		Integer i = uniqueIDToValueIndex.get(element.getUniqueID());
    		HashMap<Integer, String> evals = element.getUserEvals();
    		if (i == null || evals == null) continue;
    		
    		for (Map.Entry<Integer, String> entry : evals.entrySet()) {
    			if (DEBUG) System.out.println("User Eval: " + entry.getKey() + " - " + entry.getValue());
    			
    			boolean[] refEvidence = convertEvalStringToEvidencePredicates(entry.getValue());
    			if (refEvidence == null)
    				continue;
    			
    			Integer timeIndex = null;
    			for (int tp = 0; tp < timePoints.length; tp ++) 
    	   			if (timePoints[tp].min() == timePoints[tp].max() && timePoints[tp].min() == entry.getKey()) {
    	   				timeIndex = tp;
    	   				break;
    	   			}
    			if (timeIndex == null)
    				throw new RuntimeException("CSPIntentions: Inapprorpriate user value for element: " + element.id);  

    			constraints.add(new XeqC(values[i][timeIndex][0], boolToInt(refEvidence[0])));
				constraints.add(new XeqC(values[i][timeIndex][1], boolToInt(refEvidence[1])));
				constraints.add(new XeqC(values[i][timeIndex][2], boolToInt(refEvidence[2])));
				constraints.add(new XeqC(values[i][timeIndex][3], boolToInt(refEvidence[3])));
    		}
    	}
	}
	
	
	/*********************************************************************************************************
	 * 
	 * 			NOT BOTH
	 * 
	 *********************************************************************************************************/
	public static void addNBFunctions() {
//    	// Not Both Dynamic Functions.
//    	List<NotBothLink> notBothLinkList = this.spec.getNotBothLink();	
//    	for(ListIterator<NotBothLink> ec = notBothLinkList.listIterator(); ec.hasNext(); ){		
//    		NotBothLink link = ec.next();
//            IntVar epoch = this.notBothEBCollection.get(link);
//            int ele1 = link.getElement1().getIdNum();
//            int ele2 = link.getElement2().getIdNum();
//            for (int t = 0; t < values[ele1].length; t++){
//            	if(link.isFinalDenied())
//            		constraints.add(new IfThenElse(new XgtY(epoch, timePoints[t]), 
//            				new And(new And(createXeqC(values[ele1][t], boolTT)), new And(createXeqC(values[ele2][t], boolTT))),
//            				new Or(new And(new And(createXeqC(values[ele1][t], boolFS)), new And(createXeqC(values[ele2][t], boolFD))),
//            					   new And(new And(createXeqC(values[ele1][t], boolFD)), new And(createXeqC(values[ele2][t], boolFS))))));
//            	else
//            		constraints.add(new IfThenElse(new XgtY(epoch, timePoints[t]), 
//            				new And(new And(createXeqC(values[ele1][t], boolTT)), new And(createXeqC(values[ele2][t], boolTT))),
//            				new Or(new And(new And(createXeqC(values[ele1][t], boolFS)), new And(createXeqC(values[ele2][t], boolTT))),
//            					   new And(new And(createXeqC(values[ele1][t], boolTT)), new And(createXeqC(values[ele2][t], boolFS))))));            		
//            }
//    	}
		System.out.print("Add NB functions");
	}
	
}
