package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jacop.constraints.*;
import org.jacop.core.*;
import org.jacop.satwrapper.SatTranslation;
import org.jacop.search.*;

import gson_classes.IOSolution;

public class BICSPState {
    
	// Elements needed for the CSP Solver
	private Store store;									// CSP Store
	private List<Constraint> constraints;					// Holds the constraints to be added to the Store
	private SatTranslation sat;								// Enables a SAT solver to be incorporated into CSP
	
	private ModelSpec spec;									// Holds the model information.
	private int maxTime;									// duplicated from spec to create shortcut for code.
	private IntVar zero;									// (0) Initial Values time point.
	private IntVar infinity;								// (maxTime + 1) Infinity used for intention functions, not a solved point.

	// Problem Size: (numIntentions x numTimePoints x 4) + numTimePoints
	private int numTimePoints;										// Total number of time points in the path (to be calculated).
	private int numIntentions;								// Number of intentions in the model.
	
	// Problem Variables:
	private BooleanVar[][][] values;						// ** Holds the evaluations for each [this.numIntentions][this.numTP][FS/PS/PD/FD Predicates]
	private IntVar[] timePoints;							// Holds the list of time points to be solved.
	
	// Mappings for problem variables
	private HashMap<IntVar, List<String>> timePointMap = new HashMap<IntVar, List<String>>(); // IntVar to list of unique time points from the model.
//	private HashMap<String, List<String>> nextStateTPHash = new HashMap<String, List<String>>(); 	// Holds the time points in the next state analysis.
	private HashMap<String, Integer> uniqueIDToValueIndex = new HashMap<String, Integer>();
	private String[] valueIndexToUniqueID;
	
	public BICSPState(ModelSpec spec, 
			String selectedNextStateName,
			List<List<String>> pathTPNames, 			// Do Not Edit, only Copy.
			HashMap<String, List<String>> newTPHash,	// Do Not Edit, only Copy.
			List<String> prunedTimePoints				// Do Not Edit, only Copy.
			) throws Exception {
       	if (Main.DEBUG) System.out.println("Starting: Explore All Next States");
		// Initialize Model Elements
		this.spec = spec;
		this.maxTime = spec.getMaxTime();
				
    	// Initialize Store
		this.store = new Store();
		this.sat = new SatTranslation(this.store); 
		this.sat.impose();	
		this.constraints = new ArrayList<Constraint>();
		if (Main.DEBUG)	this.sat.debug = true;			// This prints that SAT commands.
		this.zero = new IntVar(this.store, "Zero", 0, 0);
		this.infinity = new IntVar(this.store, "Infinity", this.maxTime + 1, this.maxTime + 1);

   		IOSolution prev = spec.getPrevResult();
   		if (prev == null)
   			throw new RuntimeException("\n Previous results required, but null.");
   		
		// **************  Create time point path.   ***************
   		// Note: `createNextStateTimePoint` has already been called.
   		// Add previous time point path.
		Integer[] prevTP = prev.getSelectedTimePointPath();
		this.timePoints = new IntVar[prevTP.length + 1];
		int i = 0;
		while (i < timePoints.length - 1) {
			this.timePoints[i] = new IntVar(store, "TL" + i, prevTP[i], prevTP[i]);
			this.timePointMap.put(this.timePoints[i], pathTPNames.get(i));
			i ++;
		}
		
		// Add next state values.
		int iNext = prev.getSelectedAbsTime() + 1;
		int iMin = iNext + 1;
		int iMax = iNext + newTPHash.size() - 1;
		if (iMax > maxTime)
			throw new RuntimeException("\n The number of remaining time points won't fit in maxTime.");
		for	(Map.Entry<String, List<String>> entry : newTPHash.entrySet()) {
			if (entry.getKey() == selectedNextStateName) {
				this.timePoints[i] = new IntVar(store, entry.getKey(), iNext, iNext);
				this.timePointMap.put(this.timePoints[i], entry.getValue());
			}else {
				IntVar newTP = new IntVar(store, entry.getKey(), iMin, iMax);
				this.timePointMap.put(newTP, entry.getValue());
			}
		}
		for	(String item : prunedTimePoints) {
			IntVar newTP = new IntVar(store, item, iMax + 1, spec.getMaxTime());
			List<String> newItem = new ArrayList<String>();
			newItem.add(item);
			this.timePointMap.put(newTP, newItem);
    		//nextStateTPHash.put(entry.getKey(), entry.getValue());
		}
		
		this.numTimePoints = this.timePoints.length;
		this.constraints.add(new Alldifferent(this.timePoints));
		if (Main.DEBUG) System.out.println("\n Num TP is: " + this.numTimePoints);       	
		///// ******** End of Time Point Initialization ********
		
    	// Initialise Values Array.
    	if (Main.DEBUG) System.out.println("\nMethod: initializeNodeVariables");
    	this.numIntentions = this.spec.getNumIntentions();
		this.values = new BooleanVar[this.numIntentions][this.numTimePoints][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS
    	this.valueIndexToUniqueID = new String[this.numIntentions];
    	int indexCounter = 0;
    	for (Intention element : this.spec.getIntentions()) {
    		this.uniqueIDToValueIndex.put(element.uniqueID, indexCounter);
    		this.valueIndexToUniqueID[indexCounter] = element.uniqueID;
			for (int t = 0; t < this.numTimePoints; t++) {
				// Creates IntVars and adds the FS -> PS invariant.
				CSPNode.initializeNodeVariables(this.store, this.sat, this.values[indexCounter][t], element.getId() + "_" + t);
			}
			indexCounter++;
    	}
	}
	
	private void finishInitialization() {
		CSPNode.initializeConflictPrevention(this.spec, this.sat, this.values, this.zero);
   		CSPNode.initializePrevResults(this.spec, this.constraints, this.timePoints, this.values, this.uniqueIDToValueIndex, this.timePointMap);
    	CSPLinks.initializeLinkConstraints(this.constraints, this.spec, this.values, 
    			this.uniqueIDToValueIndex, this.timePoints, this.timePointMap);
    	CSPIntentions.initializeEvolvingFunctionsForIntentions(this.constraints, this.spec, this.values, 
    			this.uniqueIDToValueIndex, this.timePoints, this.timePointMap, this.infinity);
    	CSPIntentions.initializeUserEvaluationsForIntentions(this.constraints, this.spec, this.values, 
    			this.uniqueIDToValueIndex, this.timePoints); 
    	CSPIntentions.addNBFunctions(this.constraints, this.spec, this.values, 
    			this.uniqueIDToValueIndex, this.timePoints, this.timePointMap, this.infinity);
    	CSPPath.createLTConstraintsBetweenTimePoint(this.constraints, this.spec, 
    			this.timePoints, this.timePointMap);
    	if (Main.DEBUG)	System.out.println("\nEnd of Init Procedure");	
	}

	
	/*********************************************************************************************************
	 * 
	 * 			FINDING SOLUTION
	 * 
	 *********************************************************************************************************/
	public static IOSolution solveModel(ModelSpec spec) throws Exception {
		HashMap<String, String[][]> allSolutions = new HashMap<String, String[][]>();
		
		List<List<String>> pathTPNames = new ArrayList<List<String>>();
		HashMap<String, List<String>> nextStateTPHash = new HashMap<String, List<String>>();
		List<String> prunedTimePoints = new ArrayList<String>();
		
		Integer minKey = createNextStateTimePoint(spec, pathTPNames, nextStateTPHash, prunedTimePoints);

		// Iterate over each selected state.
		for (String nextStateItems : nextStateTPHash.keySet()) {
			BICSPState algo = new BICSPState(spec, nextStateItems, pathTPNames, nextStateTPHash, prunedTimePoints);
			algo.finishInitialization();
			CSPSolve.addConstraints(algo.store, algo.constraints);
			
			IntVar[] varList = algo.createNextStateVarList();
			Search<IntVar> stateLabel = CSPSolve.findSolution(algo.store, varList, true);
			String[][] answer = algo.getNextStateData(stateLabel);
			allSolutions.put(algo.timePoints[algo.timePoints.length - 1].id, answer);
		}
		return spec.getPrevResult().getNewIOSolutionFromSelected(allSolutions, nextStateTPHash, minKey, spec.getMaxTime());
		
	}

/**
 * 
 * @param spec
 * @param pathTPNames
 * @param newTPHash
 * @param prunedTimePoints
 */
	private static Integer createNextStateTimePoint(ModelSpec spec, //Store store, 
			List<List<String>> pathTPNames, 
			HashMap<String, List<String>> newTPHash,
			List<String> prunedTimePoints) {
		
   		IOSolution prev = spec.getPrevResult();
   		if (prev == null)	throw new RuntimeException("\n Previous results required, but null.");
		
		// Get the Unique Set of Time Point from the Model
		HashMap<Integer, List<String>> modelAbsTime = spec.getAbsTimePoints();
		List<String> unassignedTimePoint = modelAbsTime.get(-1);
		modelAbsTime.remove(-1);
		
//		int numRelTP = spec.getNumRelativeTimePoints(); 
		HashMap<String, Integer> prevTPAssignments = prev.getSelectedTPAssignments();
		Integer[] prevTP = prev.getSelectedTimePointPath();
				
		Integer tpCounter = 0;
		for (Integer i : prevTP) {		// Last Time Points
    		List<String> affectedKeys = new ArrayList<String>();
			for	(Map.Entry<String, Integer> entry : prevTPAssignments.entrySet()) {
				if (entry.getValue().equals(i))  
					affectedKeys.add(entry.getKey());
			}
			for (String key : affectedKeys)		// Removes no longer needed entires. 
				prevTPAssignments.remove(key);
			if (modelAbsTime.containsKey(i)) {
				List<String> absVal = modelAbsTime.get(i);
				for (String v : absVal)
					if (!affectedKeys.contains(v))
						affectedKeys.add(v);
				modelAbsTime.remove(i);			// Removes no longer needed entries.
			}
			for (String key : affectedKeys)
				if (unassignedTimePoint.contains(key)) 
					unassignedTimePoint.remove(key);
			if (affectedKeys.isEmpty()) {
//				affectedKeys.add("TR" + tpCounter);
//				numRelTP--;
				throw new RuntimeException("\n ERROR: createNextStateTimePoint has code that is not dead code.");
			}
    		pathTPNames.add(affectedKeys);
    		tpCounter++;
		}
		
		
		@SuppressWarnings("unused")
		boolean guarenteeNextAbs = false;
		// TODO: If the current time is 19 and the next absTime is 20, then we only 
		// want to generate states for the absTime point.
		// Update algorithm so if guarenteeNextAbs == true then other time points
		// will be pruned.
		
		// Add next absolute time point.
		Integer minKey = null;
		int maxTime = spec.getMaxTime();
		if (modelAbsTime.size() > 0) {
			minKey = maxTime + 1;
			for	(Integer key : modelAbsTime.keySet()) 
				if (key < minKey)  
					minKey = key;
			if (minKey != maxTime + 1) {
	    		List<String> toAdd = modelAbsTime.get(minKey);
	    		newTPHash.put("TNS-A", toAdd);
	    		if (minKey == prevTP[prevTP.length-1] + 1)
	    			guarenteeNextAbs = true;
			}
		}
		
		// Add a relative time point if available.
		if (spec.getNumRelativeTimePoints() > 0) {
			int numRelTP = spec.getNumRelativeTimePoints();
			prevTPAssignments = prev.getSelectedTPAssignments();
			for (int i = 0; i < numRelTP; i ++)
				if (!prevTPAssignments.containsKey("TR"+i)) {
					// Find random time point that does not have an assigned value.
		    		List<String> toAdd = new ArrayList<String>();
		    		toAdd.add("TR"+i);
		    		newTPHash.put("TR"+i, toAdd);
		    		break;
				}    		
		}
		
		List<String> prunedList = pruneExtraUDTPforNextState(spec, unassignedTimePoint);
		for (String item : prunedList)
			prunedTimePoints.add(item);
		
		if (unassignedTimePoint.size() > 0) {		
			int c = 0; 
			for (String newVal: unassignedTimePoint) {
	    		List<String> toAdd = new ArrayList<String>();
	    		toAdd.add(newVal);
	    		newTPHash.put("TNS-" + c, toAdd);
	    		c++;
			}
		}
		return minKey;
	}

	private static List<String> pruneExtraUDTPforNextState(
			ModelSpec spec, List<String> initialList){
		List<String> prunedList = new ArrayList<String>();
		List<List<String>> orderedTimePoints = spec.getUDTimePointOrder();
    	for (List<String> subList : orderedTimePoints) {
    		boolean found = false;
    		for (int i = 0; i < subList.size(); i++) {
    			if (found) {
    				if (initialList.contains(subList.get(i))) {
    					prunedList.add(subList.get(i));
    					initialList.remove(subList.get(i));
    				}
    			} else if (!found && initialList.contains(subList.get(i))) 
    				found = true;
    		}	
    	}
		return prunedList;
	}
	
	
	
	
	
	
	
	/**
	 * Creates the var list with:
	 * - select state
	 * - next possible states (based on possible time points)
	 * - time points for those states
	 * @return
	 */
	private IntVar[] createNextStateVarList(){
		// Solve only the next state variables.
		int currentStateIndex = this.timePoints.length - 2;
		int nextStateIndex = this.timePoints.length - 1;
		IntVar[] fullList = new IntVar[this.numIntentions * 2 * 4];
		int fullListIndex = 0;
		for (int i = 0; i < this.values.length; i++)
			for (int v = 0; v < this.values[i][0].length; v++){
				fullList[fullListIndex] = this.values[i][currentStateIndex][v];
				fullListIndex++;
			}
		for (int i = 0; i < this.values.length; i++)
			for (int v = 0; v < this.values[i][0].length; v++){
				fullList[fullListIndex] = this.values[i][nextStateIndex][v];
				fullListIndex++;
			}	
		return fullList;
	}
	
	private String[][] getNextStateData(Search<IntVar> label) {		
		int totalSolution = label.getSolutionListener().solutionsNo();	
		if(Main.DEBUG){

			for (int s = 1; s <= totalSolution; s++){	/// NOTE: Solution number starts at 1 not 0!!!
				for (int v = 0; v < label.getSolution(s).length; v++) {
					if (v % 4 == 0) System.out.print(" ");
					System.out.print(label.getSolution(s)[v]);
				}	
				System.out.println();
			}
			System.out.println(totalSolution + "next state solution found.");
		}
		
		String[][] finalValues = new String[totalSolution][this.numIntentions];
		int startIndex = label.getSolution(1).length - (this.numIntentions * 4);
		for (int s = 1; s <= totalSolution; s++){	/// NOTE: Solution number starts at 1 not 0!!!		
			int solIndex = startIndex;
			for (int i = 0; i < this.numIntentions; i++) {
				String outVal = label.getSolution(s)[solIndex].toString() + 
						label.getSolution(s)[solIndex + 1].toString() + 
						label.getSolution(s)[solIndex + 2].toString() +
						label.getSolution(s)[solIndex + 3].toString();
				finalValues[s-1][i] = outVal;
				solIndex += 4;
			}
		}
		return finalValues;
	}
}