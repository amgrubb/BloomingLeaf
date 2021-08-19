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

public class BICSPPath {
    
	// Elements needed for the CSP Solver
	private Store store;									// CSP Store
	private List<Constraint> constraints;					// Holds the constraints to be added to the Store
	private SatTranslation sat;								// Enables a SAT solver to be incorporated into CSP
	
	private enum SearchType {PATH, NEXT_STATE, UPDATE_PATH};
	private SearchType problemType = SearchType.PATH;

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
	private HashMap<String, Integer> uniqueIDToValueIndex = new HashMap<String, Integer>();
	private String[] valueIndexToUniqueID;
	
	public BICSPPath(ModelSpec spec) throws Exception {
    	if (Main.DEBUG) System.out.println("Starting: TroposCSPAlgorithm");

    	// Initialize Store
		this.store = new Store();
		this.sat = new SatTranslation(this.store); 
		this.sat.impose();	
		if (Main.DEBUG)	this.sat.debug = true;			// This prints that SAT commands.
		this.constraints = new ArrayList<Constraint>();	
		
		// Determine type of analysis
    	switch (spec.getAnalysisType()) {	
    	case "singlePath":
    		problemType = SearchType.PATH;
        	if (Main.DEBUG) System.out.println("Analysis selected: Full Single Path");
    		break;
    	case "updatePath":
    		problemType = SearchType.UPDATE_PATH;
        	if (Main.DEBUG) System.out.println("Analysis selected: Update Current Path");
    		break;    		
    	default:
    		throw new Exception("User Error: User requested \'" + spec.getAnalysisType() + "\', no such scenario exists. ");
    	}
    	
		// Initialize Model Elements
		this.spec = spec;
		this.maxTime = spec.getMaxTime();
		this.zero = new IntVar(this.store, "Zero", 0, 0);
		this.infinity = new IntVar(this.store, "Infinity", this.maxTime + 1, this.maxTime + 1);
		
		// Create time point path.
		if (problemType == SearchType.PATH || problemType == SearchType.UPDATE_PATH) {
			this.timePoints = CSPPath.createPathTimePoint(this.spec, this.store, this.constraints, this.timePointMap, this.maxTime);
		}
		this.numTimePoints = this.timePoints.length;
		this.constraints.add(new Alldifferent(this.timePoints));
		if (Main.DEBUG) System.out.println("\n Num TP is: " + this.numTimePoints);       	
    	
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
		CSPNode.initializeConflictPrevention(this.spec, this.sat, this.values, this.zero);
    	if (problemType == SearchType.UPDATE_PATH) { 
    		// Assign past values with initialization?
    		CSPNode.initializePrevResults(this.spec, this.constraints, this.timePoints, this.values, this.uniqueIDToValueIndex);
    	}
    	
    	CSPLinks.initializeLinkConstraints(this.constraints, this.spec, this.values, 
    			this.uniqueIDToValueIndex, this.timePoints, this.timePointMap);
    	CSPIntentions.initializeEvolvingFunctionsForIntentions(this.constraints, this.spec, this.values, 
    			this.uniqueIDToValueIndex, this.timePoints, this.timePointMap, this.infinity);
    	CSPIntentions.initializeUserEvaluationsForIntentions(this.constraints, this.spec, this.values, 
    			this.uniqueIDToValueIndex, this.timePoints); //, this.timePointMap, this.infinity);
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
	public IOSolution solveModel() {
		CSPSolve.addConstraints(this.store, this.constraints);

		if (problemType == SearchType.PATH || problemType == SearchType.UPDATE_PATH) {
			IntVar[] varList = createPathVarList();
			@SuppressWarnings("unused")
			Search<IntVar> pathLabel = CSPSolve.findSolution(this.store, varList, false);
			return getPathSolutionOutModel();
		} 
		return null;
	}
	
	// Methods for initial search.
	/**
	 * This method creates the variable list for the solver to solve. 
	 * @return
	 */
	private IntVar[] createPathVarList(){
		// Add full path to variables.
		int fullListSize = (this.numIntentions * this.numTimePoints * 4) + this.timePoints.length;// + this.epochs.length; 
		IntVar[] fullList = new IntVar[fullListSize];
		int fullListIndex = 0;
		for (int i = 0; i < this.values.length; i++)
			for (int t = 0; t < this.values[i].length; t++)
				for (int v = 0; v < this.values[i][t].length; v++){
					fullList[fullListIndex] = this.values[i][t][v];
					fullListIndex++;

				}
		for (int i = 0; i < this.timePoints.length; i++){
			fullList[fullListIndex] = this.timePoints[i];
			fullListIndex++;
		}
		return fullList;
	}
	
	
	
	// ********************** Saving / Printing Path Solution ********************** 
	/**
	 * @param indexOrder
	 */
	private IOSolution getPathSolutionOutModel() {	
		int[] indexOrder = this.createTimePointOrder();
		if (Main.DEBUG) this.printSinglePathSolution(indexOrder);

		// Get Time Points (timePointAssignments)
		Integer[] finalTPPath = new Integer[indexOrder.length];
    	for (int i = 0; i < indexOrder.length; i++)
    		finalTPPath[i] = this.timePoints[indexOrder[i]].value();
   		
    	HashMap<String, Integer> finalTPAssignments = new HashMap<String, Integer>();
    	HashMap<String, String> duplicateNames = this.spec.getChangedTPNames(); 
    	for (int i = 0; i < indexOrder.length; i++) {
    		List<String> listTPNames = timePointMap.get(this.timePoints[indexOrder[i]]);
    		for (String name : listTPNames) {
    			finalTPAssignments.put(name, this.timePoints[indexOrder[i]].value());
    			if (duplicateNames.containsValue(name)) {
    		          for (Map.Entry<String, String> entry : duplicateNames.entrySet()) 
    		              if (entry.getValue().equals(name)) 
    		            	  finalTPAssignments.put(entry.getKey(), this.timePoints[indexOrder[i]].value());
    			}
    		}
    	}
    	
    	IOSolution oModel = new IOSolution(finalTPPath, finalTPAssignments);
    	
    	// Get assigned values (elementList)
    	for (int i = 0; i < this.values.length; i++){
    		String[] nodeFinalValues = new String[this.values[i].length];
    		for (int t = 0; t < this.values[i].length; t++){
    			StringBuilder value = new StringBuilder();
        		for (int v = 0; v < this.values[i][t].length; v++)
        			if(this.values[i][indexOrder[t]][v].value() == 1)
        				value.append("1");
        			else
        				value.append("0");
        		nodeFinalValues[t] = value.toString();
    		}
    		oModel.addElement(this.valueIndexToUniqueID[i], nodeFinalValues);
    	}  	
    	return oModel; 	
	}
	
	/**
	 * @return
	 */
	private int[] createTimePointOrder() {		
			//Sort Time Points.	 - Full Solution.
			int[] indexOrder = new int[this.timePoints.length];
			int biggestMin = -1;
			for (int i = 0; i < indexOrder.length; i++){
				int minVal = this.maxTime + 1;
				int curMin = -1;
				for (int j = 0; j < this.timePoints.length; j++){
					int temp = this.timePoints[j].value();
					if ((temp < minVal) && (temp > biggestMin)){
						curMin = j;
						minVal = temp;
					}
				}
				biggestMin = minVal;
				indexOrder[i] = curMin;
			}
			return indexOrder;
	}
	
	/**
	 * @param indexOrder
	 */
	private void printSinglePathSolution(int[] indexOrder) {
		// Print out timepoint data.
		System.out.println("\nSolution!");
    	for (int i = 0; i < indexOrder.length; i++) {
    		System.out.print(this.timePoints[indexOrder[i]].id + " : " + this.timePoints[indexOrder[i]].value() + "   \t");
    		System.out.println(timePointMap.get(this.timePoints[indexOrder[i]]));
    	}
    	
		// Print out times.
    	System.out.print("Time:\t");
    	for (int i = 0; i < indexOrder.length; i++){
    		System.out.print(i + "|" + this.timePoints[indexOrder[i]].value() + "\t");
   		}
    	System.out.println();
    	
    	// Print out Values.
    	for (int i = 0; i < this.numIntentions; i++){
    		System.out.print(String.format("%03d", i) + ":\t");
    		for (int t = 0; t < this.values[i].length; t++){
        		for (int v = 0; v < this.values[i][t].length; v++)
        			System.out.print(this.values[i][indexOrder[t]][v].value());
        		System.out.print("\t");
    		}
    		String name = this.spec.getIntentionByUniqueID(this.valueIndexToUniqueID[i]).getName();
    		System.out.println(name); // + "\t" + element.dynamicType.toString());
    	} 
	}	
	
}
