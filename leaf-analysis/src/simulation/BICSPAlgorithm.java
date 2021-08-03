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
    	if (DEBUG) System.out.println("Starting: TroposCSPAlgorithm");

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
		
		if (problemType == SearchType.PATH || problemType == SearchType.UPDATE_PATH) {
			this.timePoints = createPathTimePoint(this.spec, this.store, this.timePointMap, this.maxTime);
		}else if (problemType == SearchType.NEXT_STATE) {
			this.timePoints = createNextStateTimePoint(this.spec, this.store, this.timePointMap, this.maxTime);
		}
		this.numTimePoints = this.timePoints.length;
		this.constraints.add(new Alldifferent(this.timePoints));
		this.values = new BooleanVar[this.numIntentions][this.numTimePoints][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS
		if (DEBUG) System.out.println("\n Num TP is: " + this.numTimePoints);       	
    	
    	// Initialise Values Array.
    	if (DEBUG) System.out.println("\nMethod: initializeNodeVariables");

    	
    	for (int i = 0; i < this.intentions.length; i++)
			for (int t = 0; t < this.values[i].length; t++) {
				// Creates IntVars and adds the FS -> PS invariant.
				CSP.initializeNodeVariables(this.store, this.sat, this.values[i][t], this.intentions[i].getId() + "_" + t);
			}
 		CSP.initializeConflictPrevention(this.spec, this.sat, this.values, this.zero);
    	if (problemType == SearchType.NEXT_STATE || problemType == SearchType.UPDATE_PATH) { 
    		// Assign past values with initialization?
    		initializePrevResults(this.spec, this.constraints, this.timePoints, this.values, this.intentions);
    	}
    	
    	
    	
    	
 		//TODO: Add evolving functions, relationship, constraints, initial values.
    	if (DEBUG)	System.out.println("\nEnd of Init Procedure");	
	}
	
	
	/**
	 * Assigned this.numTimePoints and creates time point list (this.timePoints) then
	 * assigned the absolute, relative, and unassigned time points.
	 * @param modelAbstime
	 * @param unassignedTimePoint
	 * @param numRelTP
	 * @param prevTPAssignments
	 */
	private static IntVar[] createPathTimePoint(ModelSpec spec, Store store, 
			HashMap<IntVar, List<String>> timePointMap, int maxTime) {
		
		// Get the Unique Set of Time Point from the Model
		HashMap<Integer, List<String>> modelAbstime = spec.getAbsTimePoints();
		List<String> unassignedTimePoint = modelAbstime.get(-1);
		modelAbstime.remove(-1);
		int numRelTP = spec.getNumRelativeTimePoints(); 
		
		int numTimePoints = modelAbstime.size() + unassignedTimePoint.size() + numRelTP;
		
		// Create a IntVar for each Time Point
		IntVar[] timePoints = new IntVar[numTimePoints];
		int tpCounter = 0;
		
		// Absolute Time Points
    	for (Map.Entry<Integer, List<String>> set : modelAbstime.entrySet()) {
    		timePoints[tpCounter] = new IntVar(store, "TA" + tpCounter, set.getKey(), set.getKey());
    		timePointMap.put(timePoints[tpCounter], set.getValue());
    		tpCounter++;
    	}
    	
    	// Unassigned Time Points 
    	for (String item : unassignedTimePoint) {
        	timePoints[tpCounter] = new IntVar(store, "TU" + tpCounter, 1, maxTime);	    		
    		List<String> toAdd = new ArrayList<String>();
    		toAdd.add(item);
    		timePointMap.put(timePoints[tpCounter], toAdd);
    		tpCounter++;    	
    	}
    	
    	// Relative Time Points
    	for (int i = 0; i < numRelTP; i++) {
          	timePoints[tpCounter] = new IntVar(store, "TR" + tpCounter, 1, maxTime);	    		
    		List<String> toAdd = new ArrayList<String>();
    		toAdd.add("TR" + tpCounter);
    		timePointMap.put(timePoints[tpCounter], toAdd);
    		tpCounter++; 
    	}
    	
    	return timePoints;
		
	}
	
	private static IntVar[] createNextStateTimePoint(ModelSpec spec, Store store, 
			HashMap<IntVar, List<String>> timePointMap, int maxTime) {
		
   		IOSolution prev = spec.getPrevResult();
   		if (prev == null)
   			throw new RuntimeException("\n Previous results required, but null.");
		
		// Get the Unique Set of Time Point from the Model
		HashMap<Integer, List<String>> modelAbsTime = spec.getAbsTimePoints();
		List<String> unassignedTimePoint = modelAbsTime.get(-1);
		modelAbsTime.remove(-1);
		int numRelTP = spec.getNumRelativeTimePoints(); 
		HashMap<String, Integer> prevTPAssignments = prev.getSelectedTPAssignments();
		Integer[] prevTP = prev.getSelectedTimePointPath();
		
		List<IntVar> timePointList = new ArrayList<IntVar>();
		
		int tpCounter = 0;
		for (Integer i : prevTP) {		// Last Time Points
			IntVar newTP = new IntVar(store, "TL" + tpCounter, i, i);

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
				affectedKeys.add("TR" + tpCounter);
				numRelTP--;
			}
			timePointList.add(newTP);
    		timePointMap.put(newTP, affectedKeys);
    		tpCounter++;
		}

		HashMap<String, List<String>> newTPHash = new HashMap<String, List<String>>();  
		// Add a relative time point if available.
		if (numRelTP > 0) {
    		List<String> toAdd = new ArrayList<String>();
    		toAdd.add("TNS-R");
    		newTPHash.put("TNS-R", toAdd);
		}
		// TODO: Should this look for the min key, not max key???
		if (modelAbsTime.size() > 0) {
			int maxKey = -1;
			for	(Integer key : modelAbsTime.keySet()) 
				if (key > maxKey)  
					maxKey = key;
			if (maxKey != -1) {
	    		List<String> toAdd = modelAbsTime.get(maxKey);
	    		newTPHash.put("TNS-A", toAdd);
			}
		}
		if (unassignedTimePoint.size() > 0) {
			int c = 0; 
			for (String newVal: unassignedTimePoint) {
	    		List<String> toAdd = new ArrayList<String>();
	    		toAdd.add(newVal);
	    		newTPHash.put("TNS-" + c, toAdd);
	    		c++;
			}
		}
		int iMin = prev.getSelectedAbsTime() + 1;
		int iMax = iMin + newTPHash.size() - 1;
		if (iMax > maxTime)
			throw new RuntimeException("\n The number of remaining time points won't fit in maxTime.");
		for	(Map.Entry<String, List<String>> entry : newTPHash.entrySet()) {
			IntVar newTP = new IntVar(store, entry.getKey(), iMin, iMax);
			timePointList.add(newTP);
    		timePointMap.put(newTP, entry.getValue());
		}
		
		IntVar[] list = new IntVar[timePointList.size()];
		for (int i = 0; i < list.length; i ++)
			list[i] = timePointList.get(i);
		return list;
	}
	
	private void createUpdatePathTimePoint(HashMap<Integer, List<String>> modelAbstime,
			List<String> unassignedTimePoint, int numRelTP, HashMap<String, Integer> prevTPAssignments) {
		/*
		 * 
				// Get the Unique Set of Time Point from the Model
		HashMap<Integer, List<String>> modelAbstime = this.spec.getAbsTimePoints();
		List<String> unassignedTimePoint = modelAbstime.get(-1);
		modelAbstime.remove(-1);
		int numRelTP = this.spec.getNumRelativeTimePoints(); 
		HashMap<String, Integer> prevTPAssignments = this.spec.getPrevSelectedTPAssignments(); 
		  
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
    	for (String item : unassignedTimePoint) {
    		Integer prevVal = null;
           	if (problemType == SearchType.NEXT_STATE || problemType == SearchType.UPDATE_PATH) { 
           		prevVal = prevTPAssignments.get(item);	           		
           	}
           	if (prevVal != null) 
           		this.timePoints[tpCounter] = new IntVar(store, "TU" + tpCounter, prevVal, prevVal);
	    	else
           		this.timePoints[tpCounter] = new IntVar(store, "TU" + tpCounter, 1, this.maxTime);	    		
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
    	*/
		
	}
	
	private static void initializePrevResults(ModelSpec spec, List<Constraint> constraints, 
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
		IntVar[] varList = null;
		if (problemType == SearchType.PATH || problemType == SearchType.UPDATE_PATH)
			varList = createPathVarList();
		else if (problemType == SearchType.NEXT_STATE)
			varList = createNextStateVarList(); 
		
        // Create selection and find solution.
        SelectChoicePoint <IntVar> select = new SimpleSelect<IntVar>(varList, new MostConstrainedDynamic<IntVar>(), new IndomainSimpleRandom<IntVar>());//new MostConstrainedStatic<IntVar>(), new IndomainSimpleRandom<IntVar>()); 
        //label.setSolutionListener(new PrintOutListener<IntVar>());         
        label.getSolutionListener().searchAll(this.searchAll);  
        if(DEBUG)	System.out.println("\nRunning Solver\n");
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
	
	/**
	 * Creates the var list with:
	 * - select state
	 * - next possible states (based on possible time points)
	 * - time points for those states
	 * @return
	 */
	private IntVar[] createNextStateVarList(){
		// Solve only the next state variables.
		int selectedTP = this.spec.getPrevResult().getSelectedTimePoint();
		int numSelectTP =  this.numTimePoints - selectedTP;
		
		IntVar[] fullList = new IntVar[(this.numIntentions * numSelectTP * 4) + numSelectTP];
		int fullListIndex = 0;
		
		for (int t = selectedTP; t < this.timePoints.length; t++) 
			for (int i = 0; i < this.values.length; i++)	//Interate Over the Intentions
				for (int v = 0; v < this.values[i][0].length; v++){
					fullList[fullListIndex] = this.values[i][t][v];
					fullListIndex++;
				}
		for (int i = selectedTP; i < this.timePoints.length; i++){
			fullList[fullListIndex] = this.timePoints[i];
			fullListIndex++;
		}
		return fullList;
	}
	

	// ********************** Saving / Printing				   ********************** 
	
	public IOSolution getSolutionOutModel() {	
		if (problemType == SearchType.PATH || problemType == SearchType.UPDATE_PATH)
			return getPathSolutionOutModel();
		else if (problemType == SearchType.NEXT_STATE)
			return getNextStateSolutionOutModel();
		return null;
	}
	
	
	// ********************** Saving / Printing Path Solution ********************** 
	/**
	 * @param indexOrder
	 */
	private IOSolution getPathSolutionOutModel() {	
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
	
	
	// ********************** Saving / Printing NEXT STATE Solution ********************** 
	private IOSolution getNextStateSolutionOutModel() {		
		if (DEBUG) System.out.println("Saving All Path Solution");

		Search<IntVar> label = this.searchLabel;
		int totalSolution = label.getSolutionListener().solutionsNo();
				
		if(DEBUG){
			System.out.println("Saving all states");
			System.out.println("\nThere are " + totalSolution + " possible next states.");
			System.out.println("\n Solution: ");
//			for (int s = 1; s <= totalSolution; s++){	/// NOTE: Solution number starts at 1 not 0!!!
//				for (int v = 0; v < label.getSolution(s).length; v++) {
//					if (v % 4 == 0) 
//						System.out.print(" ");
//					System.out.print(label.getSolution(s)[v]);
//				}	
//				System.out.println();
//			}
			System.out.println("\n Finished Printing Solutions");
			System.out.println("\nThere are " + totalSolution + " possible next states.");
		}
		
		int selectedTP = this.spec.getPrevResult().getSelectedTimePoint();
		int numSelectTP =  this.numTimePoints - selectedTP;
		int indexOfSelectTP = (this.numIntentions * numSelectTP * 4);	// Correct
		
		
		//totalSolution = 10;		//TODO: Delete
		String[][] finalValues = new String[totalSolution][this.intentions.length];
		String[][] finalTP = new String[totalSolution][2];	// 0 is AbsTime, 1 is TPName

		
		for (int s = 1; s <= totalSolution; s++){	/// NOTE: Solution number starts at 1 not 0!!!
			
			System.out.println();
			for (int v = 0; v < label.getSolution(s).length; v++) {
				if (v % 4 == 0) 
					System.out.print(" ");
				System.out.print(label.getSolution(s)[v]);
			}	
			System.out.println();
			

			// Get Smallest Index of New TPs.
			int indexOfNextState = -1;
			if (numSelectTP > 2) {
				int min = maxTime;
				for (int z = indexOfSelectTP + 1; z < label.getSolution(s).length; z++) 
					if (Integer.parseInt(label.getSolution(s)[z].toString()) < min) {
						min = Integer.parseInt(label.getSolution(s)[z].toString());
						indexOfNextState = z;
					}
			} else
				indexOfNextState = indexOfSelectTP + 1;
			System.out.println("\nCurrent:" + indexOfSelectTP + "-" + label.getSolution(s)[indexOfSelectTP].toString() + "\tNext:" +
					indexOfNextState + "-" + label.getSolution(s)[indexOfNextState].toString());
			
			int startIndex = (this.numIntentions * 4) * (indexOfNextState - indexOfSelectTP);
			int solIndex = startIndex;
			for (int i = 0; i < this.intentions.length; i++) {
				String outVal = label.getSolution(s)[solIndex].toString() + 
						label.getSolution(s)[solIndex + 1].toString() + 
						label.getSolution(s)[solIndex + 2].toString() +
						label.getSolution(s)[solIndex + 3].toString();
				finalValues[s-1][i] = outVal;
				System.out.print(outVal + " ");
				
				solIndex += 4;
			}
			String tpID = this.timePoints[selectedTP + (indexOfNextState - indexOfSelectTP)].id;
			if (tpID.equals("TNS-R")) {
				//TODO: Update to get random time value.
				finalTP[s-1][0] = label.getSolution(s)[indexOfNextState].toString();
				finalTP[s-1][1] = tpID;	
			}else if (tpID.equals("TNS-A")) {
				//TODO: Update to get actual timepoint and value.
				finalTP[s-1][0] = label.getSolution(s)[indexOfNextState].toString();
				finalTP[s-1][1] = tpID;				
			}else if (tpID.contains("TNS-")) {
				//TODO: Update to get actual timepoint and value.
				finalTP[s-1][0] = label.getSolution(s)[indexOfNextState].toString();
				finalTP[s-1][1] = tpID;				
			}				
		}
	
		if(DEBUG) System.out.println("\n Finished Saving Solutions");

		return this.spec.getPrevResult().getNewIOSolutionFromSelected(finalValues, finalTP);
	}
}
