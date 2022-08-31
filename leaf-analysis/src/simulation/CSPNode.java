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

	
	
	/**
	 * Called on both the state and path. 
	 * 	TODO: After updated for path, make sure it still works for state.
	 * @param spec
	 * @param constraints
	 * @param timePoints
	 * @param values
	 * @param uniqueIDToValueIndex
	 * @param timePointMap
	 */
	public static void initializePrevResults(ModelSpec spec, List<Constraint> constraints, 
			IntVar[] timePoints, BooleanVar[][][] values,
			HashMap<String, Integer> uniqueIDToValueIndex,
			HashMap<IntVar, List<String>> timePointMap) {
		
		
		if (Main.DEBUG) System.out.println("\nMethod: func");
   		IOSolution prev = spec.getPrevResult();
   		if (prev == null)
   			throw new RuntimeException("\n Previous results required, but null.");
   		
   		//The logic in this function is broken.
   		Integer[] prevTPPath = prev.getSelectedTimePointPath();		//These time points are already assigned. [0,11,26]
   		HashMap<String, Integer> prevTPMap = prev.getSelectedTPAssignments();
   		HashMap<String, boolean[][]> prevIntVal = prev.getSelectedPreviousValues(); 
   		
   		if (prevTPPath.length != prevTPMap.size())
   			throw new RuntimeException("\n The length of the previous time point path and the number of assigned time points, do not match.");

   		if (spec.getAnalysisType().equals("allNextStates")) {
	   		for (int tp = 0; tp < timePoints.length; tp ++) {
	
	   			if (timePoints[tp].min() == timePoints[tp].max()) {	// This condition is incorrect.
	
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
		} else {
	   		// This may be specifically for paths.
	   		for (Map.Entry<String,Integer> mapElement : prevTPMap.entrySet()) {
	   			String key = mapElement.getKey();
	   			int value = mapElement.getValue();
	   			boolean extraRandomFound = false;
	   			if (key.equals("TNS-R")) {
	   				extraRandomFound = true;	//TODO: Need to account for the new random time point.
	   				//TODO: Fix Me!!! HERE
	   				continue;
	   			} 
	   			IntVar refTP = CSPPath.getTimePoint(timePointMap, key);	//Does not contain TNS-R
	   			
	   			// Update the range of the timepoint that has already be assigned.
	   			if (refTP.min() != refTP.max()) {
	   				refTP.setDomain(value, value);
	   			} else if ((refTP.min() == refTP.max()) && refTP.min() != value)
	   				throw new RuntimeException("\n In initializePrevResults, a previous time point cannot be set.");
	   				
	   			
	   			// Assign the intention valuations associated with this time point.
	   			for (int indexAbsVal = 0; indexAbsVal < prevTPPath.length; indexAbsVal++) {
	   				if (prevTPPath[indexAbsVal] == value) {
	   					
	   					int tp = -1;
	   			   		for (int t = 0; t < timePoints.length; t ++) {
	   			   			if (timePoints[t] == refTP)
	   			   				tp = t;
	   			   		}
	   			   		if (tp == -1)
	   			   			throw new RuntimeException("\n In initializePrevResults, a time point IntVar was not found.");
	   					
	   					// Update individual values.
	   					for	(Map.Entry<String, Integer> entry : uniqueIDToValueIndex.entrySet()) {
	   						int i = entry.getValue();
	   						boolean[][] toAssignVals = prevIntVal.get(entry.getKey());
	   						if (toAssignVals != null) {
	   							constraints.add(new XeqC(values[i][tp][0], boolToInt(toAssignVals[indexAbsVal][0])));
	   							constraints.add(new XeqC(values[i][tp][1], boolToInt(toAssignVals[indexAbsVal][1])));
	   							constraints.add(new XeqC(values[i][tp][2], boolToInt(toAssignVals[indexAbsVal][2])));
	   							constraints.add(new XeqC(values[i][tp][3], boolToInt(toAssignVals[indexAbsVal][3])));
	   						}
	   					}		
	   					break;
	   				}
	   			}	
	   		}	
   		}
   		System.out.print("Test");   		


   		
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
