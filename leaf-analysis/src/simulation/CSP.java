package simulation;

import org.jacop.core.BooleanVar;
import org.jacop.core.IntVar;
import org.jacop.core.Store;
import org.jacop.satwrapper.SatTranslation;

public class CSP {
	private final static boolean DEBUG = false;
	
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
		if (DEBUG) System.out.println("\nMethod: initializeConflictPrevention();");
		char level = spec.getConflictAvoidLevel();
		if (DEBUG)	System.out.println("\nConflict Prevention level is: " + level + "\n");
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

	
	
	
	
	
	
}
