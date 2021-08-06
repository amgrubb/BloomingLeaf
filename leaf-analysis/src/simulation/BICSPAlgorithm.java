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
    private final static boolean DEBUG = false;
    
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
	private HashMap<String, List<String>> nextStateTPHash = new HashMap<String, List<String>>(); 	// Holds the time points in the next state analysis.
	private HashMap<String, Integer> uniqueIDToValueIndex = new HashMap<String, Integer>();
	private String[] valueIndexToUniqueID;
	
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
    		problemType = SearchType.PATH;
        	if (DEBUG) System.out.println("Analysis selected: Full Single Path");
    		break;
    	case "allNextStates":
    		problemType = SearchType.NEXT_STATE;
        	if (DEBUG) System.out.println("Analysis selected: Explore All Next States");
    		break;
    	case "updatePath":
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
		this.infinity = new IntVar(this.store, "Infinity", this.maxTime + 1, this.maxTime + 1);
		
		// Create time point path.
		if (problemType == SearchType.PATH || problemType == SearchType.UPDATE_PATH) {
			this.timePoints = CSPPath.createPathTimePoint(this.spec, this.store, this.timePointMap, this.maxTime);
		}else if (problemType == SearchType.NEXT_STATE) {
			this.timePoints = CSPPath.createNextStateTimePoint(this.spec, this.store, this.timePointMap, this.nextStateTPHash, this.maxTime);
		}
		this.numTimePoints = this.timePoints.length;
		this.constraints.add(new Alldifferent(this.timePoints));
		if (DEBUG) System.out.println("\n Num TP is: " + this.numTimePoints);       	
    	
    	// Initialise Values Array.
    	if (DEBUG) System.out.println("\nMethod: initializeNodeVariables");
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
    	if (problemType == SearchType.NEXT_STATE || problemType == SearchType.UPDATE_PATH) { 
    		// Assign past values with initialization?
    		CSPNode.initializePrevResults(this.spec, this.constraints, this.timePoints, this.values, this.uniqueIDToValueIndex);
    	}
    	
    	CSPLinks.initializeLinkConstraints(this.constraints, this.spec, this.values, 
    			this.uniqueIDToValueIndex, this.timePoints, this.timePointMap);

    	CSPIntentions.initializeEvolvingFunctionsForIntentions(this.constraints, this.spec, this.values, 
    			this.uniqueIDToValueIndex, this.timePoints, this.timePointMap, this.infinity);
    	CSPIntentions.initializeUserEvaluationsForIntentions(this.constraints, this.spec, this.values, 
    			this.uniqueIDToValueIndex, this.timePoints); //, this.timePointMap, this.infinity);


    	//TODO: Implement NB Function.
    	CSPIntentions.addNBFunctions();

    	//TODO: Implement Constraints between time points???
    	//Note: '<' is now 'lt' and '=' is now 'eq'
    	
    	if (DEBUG)	System.out.println("\nEnd of Init Procedure");	
	}

	
	/*********************************************************************************************************
	 * 
	 * 			FINDING SOLUTION
	 * 
	 *********************************************************************************************************/
	public IOSolution solveModel() {
		addConstraints();

		if (problemType == SearchType.PATH || problemType == SearchType.UPDATE_PATH) {
			IntVar[] varList = createPathVarList();
			@SuppressWarnings("unused")
			Search<IntVar> pathLabel = findSolution(this.store, varList, false);
			return getPathSolutionOutModel();
		} else if (problemType == SearchType.NEXT_STATE) {
			int selectedTP = this.spec.getPrevResult().getSelectedTimePoint();
			HashMap<String, String[][]> allSolutions = new HashMap<String, String[][]>();
			for (int i = selectedTP + 1; i < this.timePoints.length; i++) {
				IntVar[] varList = createNextStateVarList(selectedTP, i);
				Search<IntVar> stateLabel = findSolution(this.store, varList, true);
				String[][] answer = getNextStateData(stateLabel);
				allSolutions.put(this.timePoints[i].id, answer);
			}
			return this.spec.getPrevResult().getNewIOSolutionFromSelected(allSolutions, this.nextStateTPHash);
		}		
		return null;
	}

	private String[][] getNextStateData(Search<IntVar> label) {		
		int totalSolution = label.getSolutionListener().solutionsNo();	
		if(DEBUG){
			System.out.println("\nThere are " + totalSolution + " possible next states.");
			for (int s = 1; s <= totalSolution; s++){	/// NOTE: Solution number starts at 1 not 0!!!
				for (int v = 0; v < label.getSolution(s).length; v++) {
					if (v % 4 == 0) System.out.print(" ");
					System.out.print(label.getSolution(s)[v]);
				}	
				System.out.println();
			}
			System.out.println("\nThere are " + totalSolution + " possible next states.");
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

	
	
	
	private void addConstraints() {
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
	}
	
	private static Search<IntVar> findSolution(Store store, IntVar[] varList, boolean searchAll){
		Search<IntVar> label = new DepthFirstSearch<IntVar>();
		label.getSolutionListener().recordSolutions(true);	// Record steps in search.
        label.setPrintInfo(false); 							// Set to false if you don't want the CSP to print the solution as you go.
        
        // Sets the timeout for colony to ensure long processes do not kill the server.
        SimpleTimeOut timeOutList = new SimpleTimeOut();
        label.setTimeOutListener(timeOutList);
        int timeOutValueInSeconds = 120;
        label.setTimeOut(timeOutValueInSeconds);
		
        // Create selection and find solution.
        SelectChoicePoint <IntVar> select = new SimpleSelect<IntVar>(varList, new MostConstrainedDynamic<IntVar>(), new IndomainSimpleRandom<IntVar>());//new MostConstrainedStatic<IntVar>(), new IndomainSimpleRandom<IntVar>()); 
        //label.setSolutionListener(new PrintOutListener<IntVar>());         
        label.getSolutionListener().searchAll(searchAll);  
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
	    	return label;
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
	private IntVar[] createNextStateVarList(int currentStateIndex, int nextStateIndex){
		// Solve only the next state variables.
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
	
	
	// ********************** Saving / Printing Path Solution ********************** 
	/**
	 * @param indexOrder
	 */
	private IOSolution getPathSolutionOutModel() {	
		int[] indexOrder = this.createTimePointOrder();
		//if (DEBUG) 
		this.printSinglePathSolution(indexOrder);

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
