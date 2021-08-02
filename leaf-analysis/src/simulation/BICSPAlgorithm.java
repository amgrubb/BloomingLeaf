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

public class BICSPAlgorithm {
	// Elements needed for the CSP Solver
	private Store store;									// CSP Store
	private List<Constraint> constraints;					// Holds the constraints to be added to the Store
	private SatTranslation sat;								// Enables a SAT solver to be incorporated into CSP
	private boolean searchAll = false;						// Flag for the solver to return the first solution or all solutions.
	private Search<IntVar> searchLabel = null;
	
	private enum SearchType {PATH, NEXT_STATE, UPDATE_PATH};
	private SearchType problemType = SearchType.PATH;

	private ModelSpec spec;									// Holds the model information.
	private int maxTime;									// duplicated from spec to create shortcut for code.
	private IntVar zero;									// (0) Initial Values time point.
//	private IntVar infinity;								// (maxTime + 1) Infinity used for intention functions, not a solved point.
	private Intention[] intentions;							// array of intention elements in the model

	// Problem Size: (numIntentions x numTimePoints x 4) + numTimePoints
	private int numTimePoints;										// Total number of time points in the path (to be calculated).
	private int numIntentions;								// Number of intentions in the model.
	
	// Problem Variables:
	private IntVar[] timePoints;							// Holds the list of time points to be solved.
	private HashMap<IntVar, List<String>> timePointMap = new HashMap<IntVar, List<String>>(); // IntVar to list of unique time points from the model.
	private BooleanVar[][][] values;						// ** Holds the evaluations for each [this.numIntentions][this.numTP][FS/PS/PD/FD Predicates]	
	
//    private IntVar[] unsolvedTimePoints;					// Holds the list of time points without an absolute assignment. 
//    private IntVar[] nextTimePoints;						// Holds the list of next possible time points. Does not include multiple stochastic or absolute. Used for finding state.
//    private IntVar nextTimePoint;							// Holds the single int value that will map to a value of nextTimePoints, to be solve by the solve if next state is used.
//    private IntVar minTimePoint;									// Is assigned the minimum time of nextTimePoints.

//    private boolean[] boolFD = new boolean[] {true, true, false, false};
//    private boolean[] boolPD = new boolean[] {false, true, false, false};
//    private boolean[] boolPS = new boolean[] {false, false, true, false};
//    private boolean[] boolFS = new boolean[] {false, false, true, true};
//    private boolean[] boolTT = new boolean[] {false, false, false, false};
//    private boolean[] boolFSFD = new boolean[] {true, true, true, true};
//    private boolean[] boolPSPD = new boolean[] {false, true, true, false};
//    private boolean[] boolFSPD = new boolean[] {false, true, true, true};
//    private boolean[] boolPSFD = new boolean[] {true, true, true, false};
    
    private final static boolean DEBUG = true;	
    
	public BICSPAlgorithm(ModelSpec spec) throws Exception {
    	if (DEBUG)
			System.out.println("Starting: TroposCSPAlgorithm");
		// Initialize Store
		this.store = new Store();
		this.sat = new SatTranslation(this.store); 
		this.sat.impose();	
		if (DEBUG)	this.sat.debug = true;			// This prints that SAT commands.
		this.constraints = new ArrayList<Constraint>();	
		
		// Determine type of analysis
    	switch (spec.getAnalysisType()) {	
    	case "singlePath":
    		searchAll = false;
    		problemType = SearchType.PATH;
        	if (DEBUG) System.out.println("Analysis selected: Full Single Path");
    		break;
    	case "allNextStates":
    		searchAll = true;
    		problemType = SearchType.NEXT_STATE;
        	if (DEBUG) System.out.println("Analysis selected: Explore All Next States");
    		break;
    	case "updatePath":
    		searchAll = false;
    		problemType = SearchType.UPDATE_PATH;
        	if (DEBUG) System.out.println("Analysis selected: Update Current Path");
    		break;    		
    	default:
    		throw new Exception("User Error: User requested \'" + spec.getAnalysisType() + "\', no such scenario exists. ");
    	}
    	
		// Initialize Model Elements
		this.spec = spec;
		this.maxTime = spec.getMaxTime();
		this.zero = new IntVar(this.store, "Zero", 0, 0);
//		this.infinity = new IntVar(this.store, "Infinity", this.maxTime + 1, this.maxTime + 1);

    	// Initialize intentions and store them in array.
    	this.numIntentions = this.spec.getNumIntentions();
		this.intentions = new Intention[this.numIntentions];
		List<Intention> elementList = this.spec.getIntentions();
		for (int i = 0; i < this.intentions.length; i++)
			this.intentions[i] = elementList.get(i);

		// Get the Unique Set of Time Point from the Model
		HashMap<Integer, List<String>> modelAbstime = this.spec.getAbsTimePoints();
		List<String> unassignedTimePoint = modelAbstime.get(-1);
		modelAbstime.remove(-1);
		int numRelTP = this.spec.getNumRelativeTimePoints(); 
		this.numTimePoints = modelAbstime.size() + unassignedTimePoint.size() + numRelTP;
		
		// Create a IntVar for each Time Point
		this.timePoints = new IntVar[this.numTimePoints];
		int tpCounter = 0;
		// Absolute Time Points
    	for (Map.Entry<Integer, List<String>> set : modelAbstime.entrySet()) {
    		this.timePoints[tpCounter] = new IntVar(store, "TA" + tpCounter, set.getKey(), set.getKey());
    		timePointMap.put(this.timePoints[tpCounter], set.getValue());
    		tpCounter++;
    	}
    	
    	// Unassigned Time Points & Relative Time Points
    	HashMap<String, Integer> prevTPAssignments = this.spec.getPrevSelectedTPAssignments();
    	for (String item : unassignedTimePoint) {
    		Integer prevVal = null;
           	if (problemType == SearchType.NEXT_STATE || problemType == SearchType.UPDATE_PATH) { 
           		prevVal = prevTPAssignments.get(item);	           		
           	}
           	if (prevVal != null) 
           		this.timePoints[tpCounter] = new IntVar(store, "TP" + tpCounter, prevVal, prevVal);
	    	else
           		this.timePoints[tpCounter] = new IntVar(store, "TP" + tpCounter, 1, this.maxTime);	    		
    		List<String> toAdd = new ArrayList<String>();
    		toAdd.add(item);
    		timePointMap.put(this.timePoints[tpCounter], toAdd);
    		tpCounter++;    	
    	}
    	for (int i = 0; i < numRelTP; i++) {
    		Integer prevVal = null;
           	if (problemType == SearchType.NEXT_STATE || problemType == SearchType.UPDATE_PATH) { 
           		prevVal = prevTPAssignments.get("TR" + tpCounter);	           		
           	}
           	if (prevVal != null) 
           		this.timePoints[tpCounter] = new IntVar(store, "TR" + tpCounter, prevVal, prevVal);
	    	else
           		this.timePoints[tpCounter] = new IntVar(store, "TR" + tpCounter, 1, this.maxTime);	    		
    		List<String> toAdd = new ArrayList<String>();
    		toAdd.add("TR" + tpCounter);
    		timePointMap.put(this.timePoints[tpCounter], toAdd);
    		tpCounter++; 
    	}
    	if (DEBUG) System.out.println("\n Num TP is: " + this.numTimePoints);
		
       	
    	
    	// Initialise Values Array.
       	if (DEBUG) System.out.println("\nSetp: Initialize 'Value' Boolean Variables");
       	if (problemType == SearchType.PATH || problemType == SearchType.UPDATE_PATH)
    		this.values = new BooleanVar[this.numIntentions][this.numTimePoints][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS
    	else if (problemType == SearchType.NEXT_STATE) {
    		int lengthOfInitial = this.spec.getPrevSelectedTP();
    		this.values = new BooleanVar[this.numIntentions][lengthOfInitial + 1][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS;
    	}
    	
    	    	
    	if (DEBUG) System.out.println("\nMethod: initializeNodeVariables");
    	for (int i = 0; i < this.intentions.length; i++)
			for (int t = 0; t < this.values[i].length; t++) {
				// Creates IntVars and adds the FS -> PS invariant.
				initializeNodeVariables(this.store, this.sat, this.values[i][t], this.intentions[i].getId() + "_" + t);
			}
    	
 		initializeConflictPrevention(this.spec, this.sat, this.values, this.zero);

 		if (problemType == SearchType.NEXT_STATE || problemType == SearchType.UPDATE_PATH) 
       		funct(this.spec, this.constraints, this.timePoints, this.values, this.intentions);

 		
 		
 		
 		
//   		if (DEBUG)
//   			System.out.println("\nMethod: genericAddLinkConstraints(this.sat, this.constraints, this.intentions, this.values);");
//		
//   		// Add constraints for the links and structure of the graph.
//   		initializeLinkConstraints();
//   		
//        if (problemType == SearchType.PATH){
//    		nextTimePoint = null;
//    		minTimePoint = null;
//        	if (DEBUG)
//        		System.out.println("\nMethod: initialize dynmaics");
//    		initializePathDynamicFunctions();
//    	}else if (problemType == SearchType.NEXT_STATE){
//        	if (DEBUG)
//        		System.out.println("\nMethod: initialize next time point for path");
//    		initializeNextTimeConstraints();
//        	if (DEBUG)
//        		System.out.println("\nMethod: initialize dynmaics");
//			initializeStateDynamicFunctions(this.constraints, this.intentions, this.values, 
//				this.functionEBCollection, this.spec.getInitialValueTimePoints()[lengthOfInitial - 1], lengthOfInitial - 1, this.minTimePoint);
//
//		}else if (problemType == SearchType.CURRENT_STATE)
//			throw new RuntimeException("\n ERROR/TODO What happens with the timepoint in current state?");
//        
//
//        //TODO: Add User Evaluations.
//        if (DEBUG)
//    		System.out.println("\nMethod: initialize User Evaluations");
//        initializeUserEvaluations();

 		
 		// STAT HERE
 		// TODO: Add initial values from previous analysis. Assign values to the path as well.
 		// Need All variables in IOSolution...maybe not model spec.
 		//private IntVar[] timePoints;							// Holds the list of time points to be solved.
 		//private HashMap<IntVar, List<String>> timePointMap = new HashMap<IntVar, List<String>>(); // IntVar to list of unique time points from the model.
 		//private BooleanVar[][][] values;
 		
    	if (DEBUG)	System.out.println("\nEnd of Init Procedure");	
	}
	private static void funct(ModelSpec spec, List<Constraint> constraints, 
			IntVar[] timePoints, BooleanVar[][][] values, Intention[] intentions) {
		if (DEBUG) System.out.println("\nMethod: func");
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
   					for (int i = 0; i < intentions.length; i ++) {
   						boolean[][] toAssignVals = prevIntVal.get(intentions[i].getUniqueID());
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
	
	/**
	 * Creates BooleanVars for each intention/time-point combo.
	 * Adds the FS -> PS invariant.
	 * @param store		The CSP store.		
	 * @param satTrans	SAT Translator for CSP store.
	 * @param val		intention/time-point combo array
	 * @param nodeName	intention/time-point combo name
	 */
	private static void initializeNodeVariables(Store store, SatTranslation satTrans, BooleanVar[] val, String nodeName){
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
	private static void initializeConflictPrevention(ModelSpec spec, SatTranslation sat, BooleanVar[][][] values, IntVar zero){	//Full Model
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

	
	
	
	
	
	/*********************************************************************************************************
	 * 
	 * 			FINDING SOLUTION
	 * 
	 *********************************************************************************************************/
	/**
	 * @return
	 */
	public boolean solveModel(){
		Search<IntVar> label = new DepthFirstSearch<IntVar>();
		label.getSolutionListener().recordSolutions(true);	// Record steps in search.
        label.setPrintInfo(false); 							// Set to false if you don't want the CSP to print the solution as you go.
        
        // Sets the timeout for colony to ensure long processes do not kill the server.
        SimpleTimeOut timeOutList = new SimpleTimeOut();
        label.setTimeOutListener(timeOutList);
        int timeOutValueInSeconds = 120;
        label.setTimeOut(timeOutValueInSeconds);

        
        // Test and Add Constraints
        if(DEBUG)	
        	System.out.println("Constraints List:");
        for (int i = 0; i < constraints.size(); i++) {
            if(DEBUG)	System.out.println(constraints.get(i).toString());
            store.impose(constraints.get(i));
            if(!store.consistency()) {
            	Constraint errorConst = constraints.get(i);
            	ArrayList<Var> errorVarList = errorConst.arguments();
            	if(DEBUG){
            		for (Var temp : errorVarList) {
            			System.out.println(temp.id + "::" + temp.dom().toString());
            		}
            		System.out.println("Constraint: " + constraints.get(i).toString());
            		System.out.println("have conflicting constraints, not solvable");
            	}
            	throw new RuntimeException("ERROR: Model not solvable because of conflicting constraints.\n Constraint: " + constraints.get(i).toString());
            }
        }
        
        // Create Var List
		IntVar[] varList = this.createVarList();
		
        // Create selection and find solution.
        SelectChoicePoint <IntVar> select = new SimpleSelect<IntVar>(varList, new MostConstrainedDynamic<IntVar>(), new IndomainSimpleRandom<IntVar>());//new MostConstrainedStatic<IntVar>(), new IndomainSimpleRandom<IntVar>()); 
        //label.setSolutionListener(new PrintOutListener<IntVar>());         
        label.getSolutionListener().searchAll(this.searchAll);        
        boolean solutionFound = label.labeling(store, select);
        
        if (timeOutList.timeOutOccurred)
        	throw new RuntimeException("The solver timed out; thus, no solution was found. Current timeout is " + timeOutValueInSeconds + " seconds.");
        // Return Solution
        if(!solutionFound){
        	if (DEBUG) System.out.println("Found Solution = False");
        	throw new RuntimeException("There is no solution to this model. The solver may have reached a timeout.");
		} else {
	    	if (DEBUG) System.out.println("Found Solution = True");
	    	this.searchLabel = label;
			return true;
		}
	}
	
	// Methods for initial search.
	/**
	 * This method creates the variable list for the solver to solve. 
	 * @return
	 */
	private IntVar[] createVarList(){
    	if (problemType == SearchType.PATH || problemType == SearchType.UPDATE_PATH){			
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
		}else if (problemType == SearchType.NEXT_STATE){
			// Solve only the next state variables.
			int initialAbs = this.spec.getPrevResult().getSelectedAbsTime();
			
			Integer tRef = null;
			for (int t = 0; t < this.timePoints.length; t++) 
				if (initialAbs == timePoints[t].min() &&
						initialAbs == timePoints[t].max()) {
					tRef = t;
					break;
				}
			Integer unassignedTP = null;
			for (int t = 0; t < this.timePoints.length; t++) 
				if (timePoints[t].min() == 0 &&
						timePoints[t].max() == this.maxTime) {
					unassignedTP = t;
					break;
				}
			if (tRef == null || unassignedTP == null) 
				throw new RuntimeException("\n Reference Time Point not found in time point list.");
			
			if (DEBUG) System.out.println("RefTP: " + tRef + " Unassigned: " + unassignedTP + " Total: " + this.values.length);
					
			IntVar[] fullList = new IntVar[(this.numIntentions * 8)];
			int fullListIndex = 0;

			for (int i = 0; i < this.values.length; i++)
				for (int v = 0; v < this.values[i][0].length; v++){
					fullList[fullListIndex] = this.values[i][tRef][v];
					fullListIndex++;
				}
			for (int i = 0; i < this.values.length; i++)
				for (int v = 0; v < this.values[i][0].length; v++){
					fullList[fullListIndex] = this.values[i][unassignedTP][v];
					fullListIndex++;
				}			
			return fullList;
		}else
			return null;
	}
	
	
	// Methods for returning single path data.
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
    	for (int i = 0; i < indexOrder.length; i++)
    		System.out.println(this.timePoints[indexOrder[i]].id + "-" + this.timePoints[indexOrder[i]].value() + "\t");

		// Print out times.
    	System.out.print("Time:\t");
    	for (int i = 0; i < indexOrder.length; i++){
    		System.out.print(i + "|" + this.timePoints[indexOrder[i]].value() + "\t");
   		}
    	System.out.println();
    	
    	// Print out Values.
    	for (int i = 0; i < this.intentions.length; i++){
    		Intention element = this.intentions[i];
    		System.out.print(element.id + ":\t");
    		for (int t = 0; t < this.values[i].length; t++){
        		for (int v = 0; v < this.values[i][t].length; v++)
        			System.out.print(this.values[i][indexOrder[t]][v].value());
        		System.out.print("\t");
    		}
    		System.out.println(element.name); // + "\t" + element.dynamicType.toString());
    	} 
	}	
	
	
	
	
	
	// ********************** Saving Solution ********************** 
	/**
	 * @param indexOrder
	 */
	public IOSolution getSolutionOutModel() {	
		if (problemType == SearchType.PATH || problemType == SearchType.UPDATE_PATH){
			int[] indexOrder = this.createTimePointOrder();
			if (DEBUG) this.printSinglePathSolution(indexOrder);

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
	    	for (int i = 0; i < this.intentions.length; i++){
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
	    		oModel.addElement(this.intentions[i].getUniqueID(), nodeFinalValues);
	    	}  	
	    	return oModel; 	
		
		} else if (problemType == SearchType.NEXT_STATE) {
			Search<IntVar> label = this.searchLabel;
			int totalSolution = label.getSolutionListener().solutionsNo();

			//Get last time point starting index.
			int startIndex = label.getSolution(1).length - (this.intentions.length * 4);
			
			if(DEBUG){
				System.out.println("Saving all states");
				System.out.println("\nThere are " + totalSolution + " possible next states.");
				System.out.println("\n Solution: ");
				for (int s = 1; s <= totalSolution; s++){	/// NOTE: Solution number starts at 1 not 0!!!
					for (int v = 0; v < label.getSolution(s).length; v++)
						System.out.print(label.getSolution(s)[v]);
					System.out.println();
				}
				System.out.println("\n Finished Printing Solutions");
				System.out.println("\n Starting index to save is: " + startIndex);
			}
			
			boolean[][][][] finalValues = new boolean[totalSolution][this.intentions.length][1][4];
			for (int s = 1; s <= totalSolution; s++){	/// NOTE: Solution number starts at 1 not 0!!!				
				int solIndex = startIndex;
				for (int i = 0; i < this.intentions.length; i++)
					//for (int t = 0; t < 2; t++)
						for (int v = 0; v < 4; v++){
							if(label.getSolution(s)[solIndex].toString().equals("1"))
								finalValues[s-1][i][0][v] = true;
							else if(label.getSolution(s)[solIndex].toString().equals("0"))
								finalValues[s-1][i][0][v] = false;
							else
								throw new RuntimeException("Error: " + label.getSolution(s)[v] + " has non-binary value.");
							solIndex++;
						}

			}
//			this.spec.setFinalAllSolutionsValues(finalValues);

			if(DEBUG) System.out.println("\n Finished Saving Solutions"); 
			
		}
		return null;
	}

}
