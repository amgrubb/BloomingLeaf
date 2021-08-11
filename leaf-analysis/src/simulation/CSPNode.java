package simulation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jacop.constraints.Constraint;
import org.jacop.constraints.XeqC;
import org.jacop.core.BooleanVar;
import org.jacop.core.IntVar;
import org.jacop.core.Store;
import org.jacop.satwrapper.SatTranslation;

import gson_classes.IOSolution;

public class CSPNode {
	/**
	 * Creates BooleanVars for each intention/time-point combo.
	 * Adds the FS -> PS invariant.
	 * @param store		The CSP store.		
	 * @param satTrans	SAT Translator for CSP store.
	 * @param val		intention/time-point combo array
	 * @param nodeName	intention/time-point combo name
	 */
	public static void initializeNodeVariables(Store store, SatTranslation satTrans, BooleanVar[] val, String nodeName){
		// Initialise BooleanVar
		val[0] = new BooleanVar(store, "N" + nodeName + "_FD");
		val[1] = new BooleanVar(store, "N" + nodeName + "_PD");
		val[2] = new BooleanVar(store, "N" + nodeName + "_PS");
		val[3] = new BooleanVar(store, "N" + nodeName + "_FS");
		
		// Create Invariant
		satTrans.generate_implication(val[3], val[2]);
		satTrans.generate_implication(val[0], val[1]);	
	}
	
	
	
	/**
	 *  Helper function to call one of the generic conflict preventions levels.
	 */
	public static void initializeConflictPrevention(ModelSpec spec, SatTranslation sat, BooleanVar[][][] values, IntVar zero){	//Full Model
		if (Main.DEBUG) System.out.println("\nMethod: initializeConflictPrevention();");
		char level = spec.getConflictAvoidLevel();
		if (Main.DEBUG)	System.out.println("\nConflict Prevention level is: " + level + "\n");
		if (level == 'N' || level == 'n')
			return;
		for (int i = 0; i < values.length; i++)
    		for (int t = 0; t < values[i].length; t++)
    			if (level == 'S' || level == 's')
    				strongConflictPrevention(sat, values[i][t], zero);
    			else if (level == 'M' || level == 'm')
    				mediumConflictPrevention(sat, values[i][t], zero);
    			else if (level == 'W' || level == 'w')
    				weakConflictPrevention(sat, values[i][t], zero);
	}	
	// Generic Functions
	/**
	 * Prevents Strong Conflicts from occurring.
	 * @param satTrans	SAT Translator for CSP
	 * @param val		time point to assign conflict prevention to
	 * @param zero		zero IntVar
	 */
	private static void strongConflictPrevention(SatTranslation satTrans, BooleanVar[] val, IntVar zero){
		BooleanVar[] sConflict = {val[0], val[3]};
		satTrans.generate_and(sConflict, zero);	        					
	}
	/**
	 * Prevents Medium Conflicts from occurring.
	 * @param satTrans	SAT Translator for CSP
	 * @param val		time point to assign conflict prevention to
	 * @param zero		zero IntVar
	 */
	private static void mediumConflictPrevention(SatTranslation satTrans, BooleanVar[] val, IntVar zero){
		BooleanVar[] mConflict1 = {val[0], val[2]};
		BooleanVar[] mConflict2 = {val[1], val[3]};
		satTrans.generate_and(mConflict1, zero);	
		satTrans.generate_and(mConflict2, zero);	
	}
	/**
	 * Prevents Weak Conflicts from occurring.
	 * @param satTrans	SAT Translator for CSP
	 * @param val		time point to assign conflict prevention to
	 * @param zero		zero IntVar
	 */
	private static void weakConflictPrevention(SatTranslation satTrans, BooleanVar[] val, IntVar zero){
		BooleanVar[] wConflict = {val[1], val[2]};
		satTrans.generate_and(wConflict, zero);	        					
	}

	
	public static void initializePrevResults(ModelSpec spec, List<Constraint> constraints, 
			IntVar[] timePoints, BooleanVar[][][] values,
			HashMap<String, Integer> uniqueIDToValueIndex) {
		if (Main.DEBUG) System.out.println("\nMethod: func");
   		IOSolution prev = spec.getPrevResult();
   		if (prev == null)
   			throw new RuntimeException("\n Previous results required, but null.");
   		
   		Integer[] prevTPPath = prev.getSelectedTimePointPath();
   		HashMap<String, boolean[][]> prevIntVal = prev.getSelectedPreviousValues();
   		
   		for (int tp = 0; tp < timePoints.length; tp ++) {
   			if (timePoints[tp].min() == timePoints[tp].max()) {
   				// time point is already assigned.
   				// get tIndexVal
   				Integer tRef = null;
   				for (int t = 0; t < prevTPPath.length; t++) 
   					if (prevTPPath[t] == timePoints[tp].min()) {
   						tRef = t;
   						break;
   					}
   				if (tRef != null) {
   					// Loop through intentions and assign.
   					for	(Map.Entry<String, Integer> entry : uniqueIDToValueIndex.entrySet()) {
   						int i = entry.getValue();
   						boolean[][] toAssignVals = prevIntVal.get(entry.getKey());
   						if (toAssignVals != null) {
   							constraints.add(new XeqC(values[i][tp][0], boolToInt(toAssignVals[tRef][0])));
   							constraints.add(new XeqC(values[i][tp][1], boolToInt(toAssignVals[tRef][1])));
   							constraints.add(new XeqC(values[i][tp][2], boolToInt(toAssignVals[tRef][2])));
   							constraints.add(new XeqC(values[i][tp][3], boolToInt(toAssignVals[tRef][3])));
   						}
   					}
   				}
   			}
   		}
	}

	/**
	 * Helper Function: Converts a boolean to an int. 
	 * @param b	boolean value.
	 * @return	int value of b.
	 */
	private static int boolToInt(boolean b) {
	    return b ? 1 : 0;
	}
	

	
	
	
	
	
	
	
}
