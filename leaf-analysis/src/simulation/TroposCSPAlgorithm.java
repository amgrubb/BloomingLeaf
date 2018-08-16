package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;
import org.jacop.constraints.Alldifferent;
import org.jacop.constraints.And;
import org.jacop.constraints.AndBool;
import org.jacop.constraints.AndBoolVector;
import org.jacop.constraints.Constraint;
import org.jacop.constraints.IfThen;
import org.jacop.constraints.IfThenElse;
import org.jacop.constraints.Min;
import org.jacop.constraints.Not;
import org.jacop.constraints.Or;
import org.jacop.constraints.OrBool;
import org.jacop.constraints.OrBoolVector;
import org.jacop.constraints.PrimitiveConstraint;
import org.jacop.constraints.XeqC;
import org.jacop.constraints.XeqY;
import org.jacop.constraints.XgtC;
import org.jacop.constraints.XgtY;
import org.jacop.constraints.XltY;
import org.jacop.constraints.XlteqY;
import org.jacop.constraints.XplusCeqZ;
import org.jacop.core.BooleanVar;
import org.jacop.core.IntVar;
import org.jacop.core.Store;
import org.jacop.core.Var;
import org.jacop.satwrapper.SatTranslation;
import org.jacop.search.DepthFirstSearch;
import org.jacop.search.IndomainSimpleRandom;
import org.jacop.search.MostConstrainedDynamic;
import org.jacop.search.Search;
import org.jacop.search.SelectChoicePoint;
import org.jacop.search.SimpleSelect;

public class TroposCSPAlgorithm {
	private Store store;									// CSP Store
	private SatTranslation sat;								// Enables a SAT solver to be incorporated into CSP
	private boolean searchAll = false;						// Flag for the solver to return the first solution or all solutions.
	private enum SearchType { PATH, NEXT_STATE, CURRENT_STATE};
	private SearchType problemType = SearchType.PATH;
//	private boolean searchPath = true;						// Flag for creating the store. 
//															//		true: Creates the whole path.
//															//		false: Creates the last state in the initial path and add a new state.
    private List<Constraint> constraints;
	private ModelSpec spec;											// Holds the model information.
	private int numIntentions;								// Number of intentions in the model.
	private IntentionalElement[] intentions;				// array of intention elements in the model
    private int maxTime;									// maxTime entered by the user
    private int numTimePoints;								// Total number of time points in the path.
    private IntVar[] timePoints;							// Holds the list of time points to be solved. Names at T<A,R,E><Index>
    private IntVar[] epochs;								// Array of EB to be solved.
    private HashMap<IntentionalElement, IntVar[]> functionEBCollection;	
    														// Holds the EBs that are associated with a dynamic function for an intention.
    private HashMap<EvolvingDecomposition, IntVar> decompEBCollection;	
    private HashMap<EvolvingContribution, IntVar> contribEBCollection;	
    														// Holds the EBs that are associated with a dynamic relationship.
    private HashMap<NotBothLink, IntVar> notBothEBCollection;	
															// Holds the EBs that are associated with a Not Both Link and dynamic relationship.    
    private HashMap<IntVar, IntVar> epochToTimePoint;				// Mapping between assignedEBs and other constrained values. Used in initializeDynamicFunctions for unknown constants UD functions.
    private BooleanVar[][][] values;						// ** Holds the evaluations for each [this.numIntentions][this.numTimePoints][FS/PS/PD/FD Predicates]
    private IntVar zero;									// (0) Initial Values time point.
	private IntVar infinity;								// (maxTime + 1) Infinity used for intention functions, not a solved point.
    private IntVar[] unsolvedTimePoints;					// Holds the list of time points without an absolute assignment. 
    private IntVar[] nextTimePoints;						// Holds the list of next possible time points. Does not include multiple stochastic or absolute. Used for finding state.
    private IntVar nextTimePoint;							// Holds the single int value that will map to a value of nextTimePoints, to be solve by the solve if next state is used.
    private IntVar minTimePoint;									// Is assigned the minimum time of nextTimePoints.
    
    private boolean[] boolFD = new boolean[] {true, true, false, false};
    private boolean[] boolPD = new boolean[] {false, true, false, false};
    private boolean[] boolPS = new boolean[] {false, false, true, false};
    private boolean[] boolFS = new boolean[] {false, false, true, true};
    private boolean[] boolTT = new boolean[] {false, false, false, false};
    private boolean[] boolFSFD = new boolean[] {true, true, true, true};
    private boolean[] boolPSPD = new boolean[] {false, true, true, false};
    private boolean[] boolFSPD = new boolean[] {false, true, true, true};
    private boolean[] boolPSFD = new boolean[] {true, true, true, false};
    
    private final static boolean DEBUG = false;								// Whether to print debug statements.
    /* New in ModelSpec
     *     	private int relativeTimePoints = 4;
    		private int[] absoluteTimePoints = new int[] {5, 10, 15, 20};
    		private boolean[][][] initialValues;		// Holds the initial values whether they are single or multiple.
    											//[this.numIntentions][this.numTimePoints][FD - index 0 / PD - index 1 / PS - index 2 / FS - index 3]
												// Note if model only has initial values then it will be [numintentions][1][4].
    		private int[] initialValueTimePoints = new int[] {0};		// Hold the assigned times for each of the initial Values. Should be same length of second paramater of initialValues; 
    		private HashMap<String, Integer> assignedEpochs; //Hash map to hold the epochs with assigned values.
    		private char conflictAvoidLevel = 'S'; 			// Should have the value S/M/W/N for Strong, Medium, Weak, None.

     */
    
	/**
	 * Constructor: Creates the CSP problem from the ModelSpec.
	 * @param spec	input model
	 */
	public TroposCSPAlgorithm(ModelSpec spec) throws Exception {
    	if (DEBUG)
			System.out.println("Starting: TroposCSPAlgorithm");
		// Initialise Store
		this.store = new Store();
		this.sat = new SatTranslation(this.store); 
		this.sat.impose();	
		if (DEBUG)
			this.sat.debug = true;			// This prints that SAT commands.
        this.constraints = new ArrayList<Constraint>();
		this.zero = new IntVar(this.store, "Zero", 0, 0);
		
		// Initialise Model Elements
		this.spec = spec;
		this.numIntentions = this.spec.getNumIntentions();
		this.intentions = new IntentionalElement[this.numIntentions];
		List<IntentionalElement> elementList = this.spec.getIntElements();
		for (int i = 0; i < this.intentions.length; i++)
			this.intentions[i] = elementList.get(i);
    	this.maxTime = spec.getMaxTime();
		this.infinity = new IntVar(this.store, "Infinity", this.maxTime + 1, this.maxTime + 1);
    	this.functionEBCollection = new HashMap<IntentionalElement, IntVar[]>();
    	this.decompEBCollection = new HashMap<EvolvingDecomposition, IntVar>();
    	this.contribEBCollection = new HashMap<EvolvingContribution, IntVar>();
    	this.notBothEBCollection = new HashMap<NotBothLink, IntVar>();
    	this.epochToTimePoint = new HashMap<IntVar, IntVar>(); 

    	//Set flags depending on analysis type.
    	switch (spec.getAnalysisType()) {	
    	/* Usage: 
    	 * 		For "singlePath" from timepoint zero.
    	 * 			Length of initialValueTimePoints: 1
		 *			Length of initialValues()[0]: 1
    	 */
    	//private enum problemType { PATH, NEXT_STATE, CURRENT_STATE};

    	case "singlePath":
    		searchAll = false;
    		problemType = SearchType.PATH;
        	if (DEBUG)
    			System.out.println("Analysis selected: singlePath");
    		break;
    	case "allPath":
    		searchAll = true;
    		problemType = SearchType.PATH;
    		throw new Exception("Backend Incomplete: User requested \'allPath\', but this scenario has not been implemented. ");
    	case "allNextStates":
    		searchAll = true;
    		problemType = SearchType.NEXT_STATE;
        	if (DEBUG)
    			System.out.println("Analysis selected: allNextStates");
    		break;
    	case "singleNextStates":
    		searchAll = false;
    		problemType = SearchType.NEXT_STATE;
    		throw new Exception("Backend Incomplete: User requested \'singleNextStates\', but this scenario has not been implemented. ");
    	case "allCurrentState":
    		searchAll = true;
    		problemType = SearchType.CURRENT_STATE;
    		throw new Exception("Backend Incomplete: User requested \'allCurrentState\', but this scenario has not been implemented. ");
    	case "singleCurrentState":
    		searchAll = false;
    		problemType = SearchType.CURRENT_STATE;
    		throw new Exception("Backend Incomplete: User requested \'singleCurrentState\', but this scenario has not been implemented. ");
    	default:
    		throw new Exception("User Error: User requested \'" + spec.getAnalysisType() + "\', no such scenario exists. ");
    	}

    	//System.out.println(this.spec.getInitialValueTimePoints());
    	//System.out.println(this.spec.getInitialValues());
    	if (DEBUG)
			System.out.println("Length of initialValueTimePoints: " + this.spec.getInitialValueTimePoints().length + 
					"\nLength of initialValues()[0]: " + this.spec.getInitialValues()[0].length);
    	if (this.spec.getInitialValueTimePoints().length != this.spec.getInitialValues()[0].length)
    		throw new Exception("Input Error: The length of initialValueTimePoints and initialValues[0] do not match.");

		// Determine the number of observation steps.
		// Add constraints between Intention EBs.
    	calculateSampleSizeAndCreateEBsAndTimePoints(this.spec.getAbsoluteTimePoints(), 
    			this.spec.getRelativeTimePoints(), this.spec.getInitialValueTimePoints(), 
    			this.spec.getInitialAssignedEpochs());
    	
    	// Initialise Values Array.
    	int lengthOfInitial = this.spec.getInitialValueTimePoints().length;
    	if (problemType == SearchType.PATH)
    		this.values = new BooleanVar[this.numIntentions][this.numTimePoints][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS
    	else if (problemType == SearchType.NEXT_STATE)
    		this.values = new BooleanVar[this.numIntentions][lengthOfInitial + 1][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS;
    	else if (problemType == SearchType.CURRENT_STATE)
    		this.values = new BooleanVar[this.numIntentions][1][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS;

    	if (DEBUG)
    		System.out.println("\nMethod: initializeBooleanVarForValues();");
    	
    	// Initialise values.
    	// Add F->P invariant.
    	initializeBooleanVarForValues();

    	if (DEBUG)
    		System.out.println("\nMethod: initializeConflictPrevention();");
    	
    	// Prevent Conflict
   		initializeConflictPrevention();

   		if (DEBUG)
   			System.out.println("\nMethod: genericAddLinkConstraints(this.sat, this.constraints, this.intentions, this.values);");
		
   		// Add constraints for the links and structure of the graph.
   		initializeLinkConstraints();
   		
        if (problemType == SearchType.PATH){
    		nextTimePoint = null;
    		minTimePoint = null;
        	if (DEBUG)
        		System.out.println("\nMethod: initialize dynmaics");
    		initializePathDynamicFunctions();
    	}else if (problemType == SearchType.NEXT_STATE){
        	if (DEBUG)
        		System.out.println("\nMethod: initialize next time point for path");
    		initializeNextTimeConstraints();
        	if (DEBUG)
        		System.out.println("\nMethod: initialize dynmaics");
			initializeStateDynamicFunctions(this.constraints, this.intentions, this.values, 
				this.functionEBCollection, this.spec.getInitialValueTimePoints()[lengthOfInitial - 1], lengthOfInitial - 1, this.minTimePoint);

		}else if (problemType == SearchType.CURRENT_STATE)
			throw new RuntimeException("\n ERROR/TODO What happens with the timepoint in current state?");
        

        //TODO: Add User Evaluations.
        if (DEBUG)
    		System.out.println("\nMethod: initialize User Evaluations");
        initializeUserEvaluations();
        
    	if (DEBUG)
    		System.out.println("\nEnd of Init Procedure");
	}	
	
	private void initializeUserEvaluations() {
		// Adds the user evaluations from the Intermediate Values Table.
		List<UserEvaluation> userEvaluations = this.spec.getUserEvaluations();
		for (UserEvaluation eval : userEvaluations){
			if (DEBUG)
				System.out.println("Eval exists for goal " + eval.getGoal().id + " at time " + eval.getAbsTime());

			// A: Get index of the Intention.
			int goalIndex = -1;
			for(int i=0; i < intentions.length; i++)
				if(eval.goal.equals(intentions[i])){
					goalIndex = i;
					break;
				}
			
			// B: Get index of the timepoint.
			int timeIndex = -1;
			for (int i=0; i < timePoints.length; i++)
				if (eval.getAbsTime() == timePoints[i].value()){
					timeIndex = i;
					break;
				}
		
			// C: Add constraint.
			boolean[] userValue = eval.getEvaluationValue();
			if((goalIndex != -1) && (timeIndex != -1)){
				this.constraints.add(new XeqC(this.values[goalIndex][timeIndex][0], boolToInt(userValue[0])));
				this.constraints.add(new XeqC(this.values[goalIndex][timeIndex][1], boolToInt(userValue[1])));
				this.constraints.add(new XeqC(this.values[goalIndex][timeIndex][2], boolToInt(userValue[2])));
				this.constraints.add(new XeqC(this.values[goalIndex][timeIndex][3], boolToInt(userValue[3])));
			}else
				throw new RuntimeException("\n ERROR: User evaluations were not able to be added.");
		}
	}

	private void initializeNextTimeConstraints() {
		nextTimePoint = new IntVar(this.store, "Next_Time", 0, nextTimePoints.length - 1);
		minTimePoint = new IntVar(this.store, "Min_Time", 0, this.maxTime);
		this.constraints.add(new Min(nextTimePoints, minTimePoint));		//Should this be nextTimePoint or nextTimePoints??
		for (int i = 0; i < nextTimePoints.length; i++){
			this.constraints.add(new IfThen(new XeqC(this.nextTimePoint, i), new XeqY(this.nextTimePoints[i], minTimePoint)));
		}
	}
	
	/** 
	 *	Calculates the number of time points.
	 *	- Created EBs for all time points.
	 *	- Creates constraints between EBs. 
	 * @param absoluteTimePoint			integer array of time points with absolute values
	 * @param numStochasticTimePoints	number of random time points to evaluate the model over
	 * @param initialValueTimePoints	any initial time values for the path
	 * @param assignedEpochs			any epochs assigned in a previous solution to the model
	 * @param singleState				whether we will solve for a single state or solve the whole path
	 */
	private void calculateSampleSizeAndCreateEBsAndTimePoints(int[] absoluteTimePoint, int numStochasticTimePoints, 
			int[] initialValueTimePoints, HashMap<String, Integer> assignedEpochs) {

		int numEpochs = 0;
		
	    List<IntVar> assignedEBs = new ArrayList<IntVar>();	//Holds the EB that have been assigned to an element in the absolute collection.
															//Holds EBs with associated absolute time.
		
    	// Step 0: Create IntVars for absoluteTimePoints.
		// The absoluteCollection is added to assignedEB at a later step.
    	HashMap<Integer, IntVar> absoluteCollection = new HashMap<Integer, IntVar>();	// Time -> EB.
    	int absoluteCounter;
    	if (absoluteTimePoint == null)
    		absoluteCounter = 1;
    	else{
    		for (int i = 0; i < absoluteTimePoint.length; i++){
    			absoluteCollection.put(new Integer(absoluteTimePoint[i]), new IntVar(store, "TA" + (i+1), absoluteTimePoint[i], absoluteTimePoint[i]));
    		}
    		absoluteCounter = absoluteTimePoint.length + 1;	//To add Zero.
    	}
    	
		// Step 1A: Collect and create all the EB associated with dynamic functions.
    	// Count the number of EBs for numEpochs.
    	//	Add all EBs to this.epochCollection
		numEpochs = 0;
    	for (int i = 0; i < this.intentions.length; i++){
    		IntentionalElement element = this.intentions[i];
    		  		
        	if ((element.dynamicType == IntentionalElementDynamicType.NT) || (element.dynamicType == IntentionalElementDynamicType.CONST) ||
        			(element.dynamicType == IntentionalElementDynamicType.INC) || (element.dynamicType == IntentionalElementDynamicType.DEC) ||
        			(element.dynamicType == IntentionalElementDynamicType.RND) || (element.dynamicType == IntentionalElementDynamicType.NB))	// Dynamic function contains no EB.
        		continue;
        	else if ((element.dynamicType == IntentionalElementDynamicType.SD) || (element.dynamicType == IntentionalElementDynamicType.DS) ||
        			(element.dynamicType == IntentionalElementDynamicType.CR) || (element.dynamicType == IntentionalElementDynamicType.RC) ||
        			(element.dynamicType == IntentionalElementDynamicType.MONP) || (element.dynamicType == IntentionalElementDynamicType.MONN)) {
        		numEpochs ++;
        		IntVar newEpoch = new IntVar(store, "E" + element.getId(), 1, maxTime);	
        		this.functionEBCollection.put(element, new IntVar[]{newEpoch});	
        		
        	} else if (element.dynamicType == IntentionalElementDynamicType.UD){
        		// Create EBs for UD function and add them to this.epochCollection.
        		// Also, add constraint that each EB_i < EB_i+1
        		UDFunctionCSP funcUD = element.getCspUDFunct();
        		char[] charEB = funcUD.getElementEBs();
        		IntVar[] epochsUD = new IntVar[charEB.length - 1];
        		numEpochs += epochsUD.length;
        		for (int u = 0; u < epochsUD.length; u++)
        			epochsUD[u] = new IntVar(store, "E" + element.getId() + "_" + charEB[u+1], 1, maxTime);
        		this.functionEBCollection.put(element, epochsUD);
        		for (int u = 1; u < epochsUD.length; u++)
        			constraints.add(new XltY(epochsUD[u-1], epochsUD[u]));       			

        		// Add the constraints between repeating segments parts of the epoch.
        		int[] absoluteDifferences = funcUD.absoluteEpochLengths; 	
        		if (absoluteDifferences != null){
        			int count = 0;
        			for (int u = funcUD.getMapStart() - 1; u < funcUD.getMapEnd() - 1; u++){
        				if (u < 0)
        					constraints.add(new XplusCeqZ(this.zero, absoluteDifferences[count % absoluteDifferences.length], epochsUD[u+1]));
        				else if ((u+1) < epochsUD.length)
        					constraints.add(new XplusCeqZ(epochsUD[u], absoluteDifferences[count % absoluteDifferences.length], epochsUD[u+1]));
        				else if ((u+1) == epochsUD.length)
        					constraints.add(new XeqC(epochsUD[u], this.maxTime - absoluteDifferences[count % absoluteDifferences.length]));
        				count++;
        			}      			        			
        		}
        		
        	} else
        		throw new RuntimeException("TroposCSPAlgorithm: Dynamic type not found for " + element.name);
    	}
    	
    	// Step 1B: Count the number of EBs for numEpochs associated with EvolvingLinks and NotBothLinks.
    	numEpochs += this.spec.getEvolvingContribution().size();
    	numEpochs += this.spec.getEvolvingDecomposition().size();
    	numEpochs += this.spec.getNotBothLink().size();
    	
    	// Step 2A: Create constraints between epochs.
    	List<EpochConstraint> eConstraints = this.spec.getConstraintsBetweenEpochs();
    	//System.out.println(eConstraints.size());
    	// (i) Get Absolute Assignments
    	for(ListIterator<EpochConstraint> ec = eConstraints.listIterator(); ec.hasNext(); ){		
    		EpochConstraint etmp = ec.next();
    		String eCont = etmp.getType();
    		if (eCont.equals("A")) {	//Absolute Time Point
    			IntVar src = getEBFromEpochCollection(etmp.src, etmp.getSrcEB());
    			if (src == null)
    				throw new RuntimeException("Error: Null found in " + etmp.toString());
    			//Check if absolute value already exists.
    			int etmpTime = etmp.getAbsoluteTime();
    			IntVar absTemp = absoluteCollection.get(new Integer(etmpTime));
    			if (absTemp == null){
    				absTemp = new IntVar(store, "TAE" + absoluteCounter, etmpTime, etmpTime);
    				absoluteCollection.put(new Integer(etmpTime), absTemp);
    				absoluteCounter++;
    			}
    			constraints.add(new XeqY(src, absTemp));
    			epochToTimePoint.put(src, absTemp);
    			assignedEBs.add(src);     			
    		}
    	}
    	
    	// (ii) Get Equals Statements
    	for(ListIterator<EpochConstraint> ec = eConstraints.listIterator(); ec.hasNext(); ){		
    		EpochConstraint etmp = ec.next();
    		String eCont = etmp.getType();
    		if (eCont.equals("=")){
    			IntVar src = getEBFromEpochCollection(etmp.src, etmp.getSrcEB());
    			IntVar dest = getEBFromEpochCollection(etmp.dest, etmp.getDestEB());

    			if ((src != null) && (dest != null)){
    				if (assignedEBs.contains(src) && assignedEBs.contains(dest))
    					throw new RuntimeException("Cannot have two absolute EBs assigned to each other.");
    				else if (assignedEBs.contains(src)){
    					//Add dest to assigned EB
    					assignedEBs.add(dest); 
        				constraints.add(new XeqY(dest, src));
        				epochToTimePoint.put(dest, src);
    				} else if (assignedEBs.contains(dest)){
    					//Add src to assigned EB
    					assignedEBs.add(src); 
        				constraints.add(new XeqY(src, dest));
        				epochToTimePoint.put(src, dest);
    				} else {
    					//Add one to assigned EB 
    					assignedEBs.add(src); 
        				constraints.add(new XeqY(src, dest));
        				epochToTimePoint.put(src, dest);
    				}	
    			} else
    				throw new RuntimeException("Error: Null found in " + etmp.toString());
    		}
       	}
    	
    	// (iii) Get Less Than Statements
    	for(ListIterator<EpochConstraint> ec = eConstraints.listIterator(); ec.hasNext(); ){		
    		EpochConstraint etmp = ec.next();
    		String eCont = etmp.getType();
			if (eCont.equals("<")){
    			IntVar src = getEBFromEpochCollection(etmp.src, etmp.getSrcEB());
    			IntVar dest = getEBFromEpochCollection(etmp.dest, etmp.getDestEB());
    			
    			if ((src != null) && (dest != null)){
    					constraints.add(new XltY(src, dest));
    			} else
    				throw new RuntimeException("Error: Null found in " + etmp.toString());
			}
    	}
    	
    	// Step 2B: Create time points for unassigned EBs.
    	// (i) Iterate over hash map and check if EB assigned.
    	List<IntVar> EBTimePoint = new ArrayList<IntVar>();			//Holds the time points for unassgned EBs for functions and relationships (used in step 3 & 4)
    	this.epochs = new IntVar[numEpochs]; 
    	int addEBCount = 0;
    	for (int i = 0; i < this.intentions.length; i++){
    		IntentionalElement element = this.intentions[i];
    		IntVar[] elementEBs = functionEBCollection.get(element);
    		if (elementEBs == null)
    			continue;
    		else 
    			for (int j = 0; j < elementEBs.length; j++){
    				IntVar temp = elementEBs[j];
    				this.epochs[addEBCount] = temp;
    				addEBCount++;
    				if (!assignedEBs.contains(temp)){
    					IntVar newEB = new IntVar(store, "TE" + absoluteCounter, 1, maxTime);
    					EBTimePoint.add(newEB);
    					absoluteCounter++;
    					constraints.add(new XeqY(temp, newEB));
    					epochToTimePoint.put(temp, newEB);
    				}
    			}
    	}
    	
    	
    	// Step 3: Add time points for Evolving Links and NotBoth Relationships.
    	// (i) Evolving Links    	
    	List<EvolvingDecomposition> eLinks = this.spec.getEvolvingDecomposition();
    	int lCount = 0; 
    	for(ListIterator<EvolvingDecomposition> ec = eLinks.listIterator(); ec.hasNext(); ){
    		EvolvingDecomposition etmp = ec.next();
    		IntVar newEpoch = new IntVar(store, "L" + lCount, 1, maxTime);
    		lCount ++;
    		this.epochs[addEBCount] = newEpoch;
    		addEBCount++;
    		this.decompEBCollection.put(etmp, newEpoch);
    		IntVar newTimePoint;
    		int etmpTime = etmp.getAbsTime();
    		if (etmpTime > 0){
    			// Absolute Time Assignment Exists.
    			if (etmpTime > this.maxTime)
    				throw new RuntimeException("Absolute time selected for EBs cannot be greater than maxTime.");
    			
    			newTimePoint = absoluteCollection.get(new Integer(etmpTime));
    			if (newTimePoint == null){
    				newTimePoint = new IntVar(store, "TAL" + absoluteCounter, etmpTime, etmpTime);
    				absoluteCollection.put(new Integer(etmpTime), newTimePoint);
    				absoluteCounter++;
    			}
    		}else{
    			// NO Absolute Time Listed.
    			newTimePoint = new IntVar(store, "TL" + absoluteCounter, 1, maxTime);
				EBTimePoint.add(newTimePoint);
				absoluteCounter++;
    		}
    		constraints.add(new XeqY(newEpoch, newTimePoint));
    	}
    	List<EvolvingContribution> eCLinks = this.spec.getEvolvingContribution();
    	for(ListIterator<EvolvingContribution> ec = eCLinks.listIterator(); ec.hasNext(); ){
    		EvolvingContribution etmp = ec.next();
    		IntVar newEpoch = new IntVar(store, "L" + lCount, 1, maxTime);
    		lCount ++;
    		this.epochs[addEBCount] = newEpoch;
    		addEBCount++;
    		this.contribEBCollection.put(etmp, newEpoch);
    		IntVar newTimePoint;
    		int etmpTime = etmp.getAbsTime();
    		if (etmpTime > 0){
    			// Absolute Time Assignment Exists.
    			if (etmpTime > this.maxTime)
    				throw new RuntimeException("Absolute time selected for EBs cannot be greater than maxTime.");
    			
    			newTimePoint = absoluteCollection.get(new Integer(etmpTime));
    			if (newTimePoint == null){
    				newTimePoint = new IntVar(store, "TAL" + absoluteCounter, etmpTime, etmpTime);
    				absoluteCollection.put(new Integer(etmpTime), newTimePoint);
    				absoluteCounter++;
    			}
    		}else{
    			// NO Absolute Time Listed.
    			newTimePoint = new IntVar(store, "TL" + absoluteCounter, 1, maxTime);
				EBTimePoint.add(newTimePoint);
				absoluteCounter++;
    		}
    		constraints.add(new XeqY(newEpoch, newTimePoint));
    	}   	
    	// (ii) Not Both Relationships
    	List<NotBothLink> eNotBoth = this.spec.getNotBothLink();
    	for(ListIterator<NotBothLink> ec = eNotBoth.listIterator(); ec.hasNext(); ){
    		NotBothLink etmp = ec.next();
    		IntVar newEpoch = new IntVar(store, "L" + lCount, 1, maxTime);
    		lCount ++;
    		this.epochs[addEBCount] = newEpoch;
    		addEBCount++;
    		this.notBothEBCollection.put(etmp, newEpoch);
    		IntVar newTimePoint;
    		int etmpTime = etmp.getAbsTime();
    		if (etmpTime > 0){
    			// Absolute Time Assignment Exists.
    			if (etmpTime > this.maxTime)
    				throw new RuntimeException("Absolute time selected for EBs cannot be greater than maxTime.");
    			
    			newTimePoint = absoluteCollection.get(new Integer(etmpTime));
    			if (newTimePoint == null){
    				newTimePoint = new IntVar(store, "TA" + absoluteCounter, etmpTime, etmpTime);
    				absoluteCollection.put(new Integer(etmpTime), newTimePoint);
    				absoluteCounter++;
    			}
    			//assignedEBs.add(newEpoch);  
    		}else{
    			// NO Absolute Time Listed.
    			newTimePoint = new IntVar(store, "TL" + absoluteCounter, 1, maxTime);
				EBTimePoint.add(newTimePoint);
				absoluteCounter++;
    		}
    		constraints.add(new XeqY(newEpoch, newTimePoint));
    	}
    	    	
    	// Step 4A: Make list of previous names.
    	int countTotalPreviousT = 0;	// Count the number of previous assignedEpochs that are Time Points.
    	int countTotalPreviousE = 0;
    	String[] exisitingNamedTimePoints = new String[initialValueTimePoints.length];
    	int[] exisitingNamedTimes = new int[initialValueTimePoints.length];
    	int maxPreviousTime = initialValueTimePoints[initialValueTimePoints.length - 1];
    	// Creates EB for Time Point 0.
    	if (initialValueTimePoints.length == 1){		
    		exisitingNamedTimePoints[0] = "TA0";
    		exisitingNamedTimes[0] = 0;
    	// Creates EB from initialAssignedEpoch HashMap of times.
		}else if (initialValueTimePoints.length > 1){
    		for (HashMap.Entry<String, Integer> entry : assignedEpochs.entrySet()) {
    		    String key = entry.getKey();
    		    Integer value = entry.getValue();
    		    if (key.charAt(0) == 'T'){
    		    	countTotalPreviousT++;		
    		    	if (value <= maxPreviousTime){
    		    		// Add to exisitingNamedTimePoints.
    		    		for(int e = 0; e < exisitingNamedTimePoints.length; e++)
    		    			if (value == initialValueTimePoints[e]){
    		    				exisitingNamedTimePoints[e] = key;
    		    				exisitingNamedTimes[e] = value;
    		    				break;
    		    			}
    		    	}
    		    }else if (key.charAt(0) == 'E'){
    		    	countTotalPreviousE++;
    		    }
    		}
    	}else
    		throw new RuntimeException("Invalid Input for initialValueTimePoints and initialValues.");
    	
    	if (DEBUG){
    		System.out.print("Previous Times are: \t");
    		for(int e = 0; e < exisitingNamedTimePoints.length; e++)
    			System.out.print(exisitingNamedTimePoints[e] + ":" + exisitingNamedTimes[e] + "\t");
    		System.out.println("\n Max Previous is: " + maxPreviousTime);	
    	}
    	
    	// Step 4B: Create List of Time Points
    	this.numTimePoints = 1 + absoluteCollection.size() + EBTimePoint.size() + numStochasticTimePoints;

    	if (DEBUG){
    		System.out.println("Previous Time Points: " + countTotalPreviousT + "  New Time Points: " + this.numTimePoints);
    		System.out.println("Previous Epoch Number: " + countTotalPreviousE + " New Epoch Number: " + this.epochs.length);
    		System.out.println("absolute collection: " + absoluteCollection.size() + " EBTimePoint: " + EBTimePoint.size() + " numStochasticTimePoints: " + numStochasticTimePoints);
    	}

    	/*if(countTotalPreviousT != this.numTimePoints && countTotalPreviousT > 0)
    		throw new RuntimeException("Error: Previous and Current Time Points do no match.");
    	if(countTotalPreviousE != this.epochs.length && countTotalPreviousE > 0)
    		throw new RuntimeException("Error: Previous and Current Epoch Number do no match.");
    	*/
    	// Create Time Points
    	this.timePoints = new IntVar[this.numTimePoints];

    	// Add Zero
    	this.timePoints[0] = new IntVar(store, exisitingNamedTimePoints[0], 0, 0); 
    	
    	// Add previousCollection from initial Value Time Points
    	//System.out.println("exisitingNamedTimePoints.length: " + exisitingNamedTimePoints.length);
    	for(int e = 1; e < exisitingNamedTimePoints.length; e++){
    		// Absolute Value -> already has an assignment. 
    		if (exisitingNamedTimePoints[e].charAt(1) == 'A'){
    	    	this.timePoints[e] = absoluteCollection.get(initialValueTimePoints[e]);
    	    // Epoch Values -> remove from list and assign value.
    		} else if (exisitingNamedTimePoints[e].charAt(1) == 'E'){
    	    	for (IntVar value : EBTimePoint) 
    	    		if (value.id.equals(exisitingNamedTimePoints[e])){
    	    			this.timePoints[e] = value;
    	    			EBTimePoint.remove(value);
    	    			this.timePoints[e].setDomain(initialValueTimePoints[e], initialValueTimePoints[e]);
    	    			break;
    	    		}
    	    // Relative Values -> remove 1 from count and assign value.
    		} else if (exisitingNamedTimePoints[e].charAt(1) == 'R'){
        		this.timePoints[e] = new IntVar(store, "TR" + absoluteCounter, initialValueTimePoints[e], initialValueTimePoints[e]);
        		absoluteCounter++;
    			numStochasticTimePoints--;
    		}
    		
    	}  	
    	int tCount = exisitingNamedTimePoints.length;
    	
    	this.unsolvedTimePoints = new IntVar[this.numTimePoints - tCount];
    	int uCount = 0;
    	List<IntVar> nextTimePoint = new ArrayList<IntVar>();
    	
    	Integer maxKey = this.maxTime + 1;
    	// Add absoluteCollection   
		for (HashMap.Entry<Integer, IntVar> entry : absoluteCollection.entrySet()) {
		    Integer key = entry.getKey();
		    IntVar value = entry.getValue();
		    if(key > maxPreviousTime){
    			this.timePoints[tCount] = value;
    			this.unsolvedTimePoints[uCount] = value;
    			tCount++;
    			uCount++;
    		    if(key < maxKey)
    		    	maxKey = key;
		    }
		}
		if(absoluteCollection != null && absoluteCollection.size() > 0){
			nextTimePoint.add(absoluteCollection.get(maxKey));		
		}
		
    	// Add EBs
    	for (IntVar value : EBTimePoint){
    		this.timePoints[tCount] = value;
			this.unsolvedTimePoints[uCount] = value;
			tCount++;
			uCount++;
    		constraints.add(new XgtC(value, maxPreviousTime));
    		nextTimePoint.add(value);
    	}
    	// Add relative.
    	for (int i = 0; i < numStochasticTimePoints; i++){
    		//System.out.println("adding relative points, tCount: " + tCount + " this.timePoints.length: " + this.timePoints.length);
    		if (tCount == this.timePoints.length)
    			throw new RuntimeException("ERROR: Relative time points could not be added.");
    		IntVar value = new IntVar(store, "TR" + absoluteCounter, maxPreviousTime + 1, maxTime);
			this.timePoints[tCount] = value;
			this.unsolvedTimePoints[uCount] = value;
			tCount++;
			uCount++;
    		absoluteCounter++;
    		if (i == 0)
    			nextTimePoint.add(value);
    	}
    	this.constraints.add(new Alldifferent(this.timePoints));
    	

    	this.nextTimePoints = new IntVar[nextTimePoint.size()];
    	for (int i = 0; i < this.nextTimePoints.length; i ++)
    		this.nextTimePoints[i] = nextTimePoint.get(i);

    	if(DEBUG){
    		System.out.print("Unsolved Time Points: ");
    		for (int i = 0; i < this.unsolvedTimePoints.length; i ++){
    			System.out.print(this.unsolvedTimePoints[i] + "  ");
    		}
    		System.out.println();

    		System.out.print("Next Time Points: ");
    		for (int i = 0; i < this.nextTimePoints.length; i ++){
    			System.out.print(this.nextTimePoints[i] + "  ");
    		}
    		System.out.println();
    	}
   
    }
	
	/**
	 * Helper function used by calculateSampleSizeAndCreateEBsAndTimePoints to get an EB IntVar from this.epochCollection.
	 * Note: Only considers A, B, C values, repeating EB values a, b, c should not be in constraints.
	 * @param element	The element you want to get from the epochCollection. 
	 * @param charEB	The letter associated with the EB.
	 * @return	The IntVar associated with the EB or null.
	 */
	private IntVar getEBFromEpochCollection(IntentionalElement element, String charEB){
		IntVar[] srcArray = this.functionEBCollection.get(element);
		
		if (srcArray.length == 1) 
			return srcArray[0];
		else{
			int val = (int)charEB.charAt(0);	
			return srcArray[val - 65];
		}
	}
	
	/**
	 * Initialises the initialValues given. Adds the FS -> PS invariant.
	 * 		this.values = new BooleanVar[this.numIntentions][this.spec.getInitialValueTimePoints().length + 1][4];	// For Next State
	 * 		this.values = new BooleanVar[this.numIntentions][this.numTimePoints][4];								// For Path
	 */
	private void initializeBooleanVarForValues() {	
		boolean[][][] initialValues = this.spec.getInitialValues();		
    	for (int i = 0; i < this.intentions.length; i++){
    		IntentionalElement element = this.intentions[i];
    		if(element.getIdNum() != i)
    			throw new RuntimeException("Intention ID does not match orderied ID in TroposCSP");

    		for (int t = 0; t < this.values[i].length; t++){
    			// Creates IntVars and adds the FS -> PS invariant.
    			initializeNodeVariables(this.store, this.sat, this.values[i][t], element.getId() + "_" + t);
    			
    			if (problemType == SearchType.PATH){
        			// Initial initialValues.   
        			if ((t == 0) && (initialValues[i].length == 1) && 
        					(!initialValues[i][t][0] && !initialValues[i][t][1] && !initialValues[i][t][2] && !initialValues[i][t][3]))
        				continue;
        			else if (t < initialValues[i].length){
        				this.constraints.add(new XeqC(this.values[i][t][0], boolToInt(initialValues[i][t][0])));
        				this.constraints.add(new XeqC(this.values[i][t][1], boolToInt(initialValues[i][t][1])));
        				this.constraints.add(new XeqC(this.values[i][t][2], boolToInt(initialValues[i][t][2])));
        				this.constraints.add(new XeqC(this.values[i][t][3], boolToInt(initialValues[i][t][3])));
        			}
        		} else if (problemType == SearchType.NEXT_STATE){
        			if (t < initialValues[i].length){
        				this.constraints.add(new XeqC(this.values[i][t][0], boolToInt(initialValues[i][t][0])));
        				this.constraints.add(new XeqC(this.values[i][t][1], boolToInt(initialValues[i][t][1])));
        				this.constraints.add(new XeqC(this.values[i][t][2], boolToInt(initialValues[i][t][2])));
        				this.constraints.add(new XeqC(this.values[i][t][3], boolToInt(initialValues[i][t][3])));
        			}        		 	
        		} else if (problemType == SearchType.CURRENT_STATE){
        			if ((initialValues[i].length == 1) && 
        				!(!initialValues[i][t][0] && !initialValues[i][t][1] && !initialValues[i][t][2] && !initialValues[i][t][3])){
        				this.constraints.add(new XeqC(this.values[i][t][0], boolToInt(initialValues[i][t][0])));
        				this.constraints.add(new XeqC(this.values[i][t][1], boolToInt(initialValues[i][t][1])));
        				this.constraints.add(new XeqC(this.values[i][t][2], boolToInt(initialValues[i][t][2])));
        				this.constraints.add(new XeqC(this.values[i][t][3], boolToInt(initialValues[i][t][3])));
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
	 *  Helper function to call one of the generic conflict preventions levels.
	 */
	private void initializeConflictPrevention(){	//Full Model
		char level = this.spec.getConflictAvoidLevel();
		if (level == 'N' || level == 'n')
			return;
		for (int i = 0; i < this.values.length; i++)
    		for (int t = 0; t < this.values[i].length; t++)
    			if (level == 'S' || level == 's')
    				strongConflictPrevention(this.sat, this.values[i][t], this.zero);
    			else if (level == 'M' || level == 'm')
    				mediumConflictPrevention(this.sat, this.values[i][t], this.zero);
    			else if (level == 'W' || level == 'w')
    				weakConflictPrevention(this.sat, this.values[i][t], this.zero);
	}
	

	/**
	 *  Creates the dynamic function constraints for the full path.
	 *  NotBoth constraints created at the end of the function.
	 */
	private void initializePathDynamicFunctions() {		//Full Model and Full Path, over all time points.
    	for (int i = 0; i < this.intentions.length; i++){
    		IntentionalElement element = this.intentions[i];
    		if (DEBUG)
    			System.out.println("Dyn #" + element.id);
    		IntentionalElementDynamicType tempType = element.dynamicType;
        	if ((tempType == IntentionalElementDynamicType.NT) || (element.dynamicType == IntentionalElementDynamicType.RND) || 
        		(tempType == IntentionalElementDynamicType.NB))
        		continue;
 
    		IntVar[] epochs = this.functionEBCollection.get(element);
    		boolean[] dynFVal = element.getDynamicFunctionMarkedValue();    		
    		
    		if (tempType == IntentionalElementDynamicType.CONST){
    			for (int t = 1; t < this.values[i].length; t++){
    				constraints.add(new And(createXeqY(this.values[i][t], this.values[i][0])));
    			}
    		} else if ((tempType == IntentionalElementDynamicType.INC) || (tempType == IntentionalElementDynamicType.MONP)){
    			System.out.println("initializePathDynamicFunctions: increase");
    			System.out.println("intention id i: " +i + " this.values[i].length: " + this.values[i].length);
    			for (int t = 0; t < this.values[i].length; t++){
    				for (int s = 0; s < this.values[i].length; s++){
    					if (t==s)
    						continue;
    					PrimitiveConstraint timeCondition = new XltY(this.timePoints[t], this.timePoints[s]);
    					initializePathIncreaseHelper(i, t, s, timeCondition, false);
    				}
    				if (tempType == IntentionalElementDynamicType.MONP){
    					PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][t], dynFVal);
    					constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), new And(tempDynValue)));
    				} else 
    					initializePathIncreaseMaxValueHelper(i, t, dynFVal, null);
    			}
        	} else if ((tempType == IntentionalElementDynamicType.DEC) || (tempType == IntentionalElementDynamicType.MONN)){
        		for (int t = 0; t < this.values[i].length; t++){
        			for (int s = 0; s < this.values[i].length; s++){
        				if (t==s)
        					continue;
    					PrimitiveConstraint timeCondition = new XltY(this.timePoints[t], this.timePoints[s]);
        				initializePathDecreaseHelper(i, t, s, timeCondition, false);
        			}
        			if (tempType == IntentionalElementDynamicType.MONN){
        				PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][t], dynFVal);
        				constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), new And(tempDynValue)));
        			} else  
        				initializePathDecreaseMaxValueHelper(i, t, dynFVal, null);
        		}
        	} else if (tempType == IntentionalElementDynamicType.SD){
      			for (int t = 0; t < this.values[i].length; t++){
            		constraints.add(new IfThenElse(new XgtY(epochs[0], this.timePoints[t]), 
            				new And(createXeqC(this.values[i][t], boolFS)),
            				new And(createXeqC(this.values[i][t], boolFD))));
            	}
        	} else if (tempType == IntentionalElementDynamicType.DS){
      			for (int t = 0; t < this.values[i].length; t++){
            		constraints.add(new IfThenElse(new XgtY(epochs[0], this.timePoints[t]), 
            				new And(createXeqC(this.values[i][t], boolFD)),
            				new And(createXeqC(this.values[i][t], boolFS))));
            	}    		
        	} else if (tempType == IntentionalElementDynamicType.RC){
      			for (int t = 0; t < this.values[i].length; t++){
					PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][t], dynFVal);
            		constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), 
            				new And(tempDynValue)));
            	}    		
        	} else if (tempType == IntentionalElementDynamicType.CR){
      			for (int t = 0; t < this.values[i].length; t++){
					PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][t], dynFVal);
            		constraints.add(new IfThen(new XgtY(epochs[0], this.timePoints[t]), 
            				new And(tempDynValue)));
            	}    	
      		/************ UD Functions *******************/	
        	} else if (tempType == IntentionalElementDynamicType.UD){
        		// Repeat has been unrolled.
        		if (epochs == null){	// Assume at least one EB.
					throw new RuntimeException("UD functions must have at least one EB. Fix node: " + element.getId());
				}
        		
				UDFunctionCSP funcUD = element.getCspUDFunct();
				String[] segmentDynamic = funcUD.getFunctions();
				boolean[][] segmentDynamicValue = funcUD.getDynamicValues();
				int numSegments = segmentDynamic.length;		//Segments not EBs
				IntVar segmentStart = null;
				IntVar segmentEnd = null;
				for (int nS = 0; nS < numSegments; nS ++){
					if (nS == 0){
						segmentStart = this.timePoints[0];//ths.zero;
						segmentEnd = epochs[0];
					} else if (nS == numSegments - 1) {
						segmentStart = epochs[nS - 1];
						segmentEnd = this.infinity;
					} else {
						segmentStart = epochs[nS - 1];
						segmentEnd = epochs[nS];
					}
					if (segmentDynamic[nS].equals(IntentionalElementDynamicType.CONST.getCode())){
						// Case: Constant - Unknown
						if (!segmentDynamicValue[nS][0] && !segmentDynamicValue[nS][1] && !segmentDynamicValue[nS][2] && !segmentDynamicValue[nS][3]){
							// For Constant-Unknown, we First find the timePoint index of the start of the segment.
							int startIndex = -1;
							if (nS == 0)
								startIndex = 0;
							else{
								IntVar startTime = epochToTimePoint.get(segmentStart);
								while((startTime != null) && (startTime.id.charAt(0) != 'T')){
									startTime = epochToTimePoint.get(startTime);
								}
								if (startTime == null){
									throw new RuntimeException("UD Function not correct " + element.getId() + " has missing EB.");
								}
								for (int p = 0; p < timePoints.length; p++){
									if (timePoints[p] == startTime){
										startIndex = p;
										break;
									}
								}
								if (startIndex == -1){
									throw new RuntimeException("UD Function not correct " + element.getId() + " has missing EB.");
								}
							}
							for (int t = 0; t < this.values[i].length; t++){
								PrimitiveConstraint[] tempConstant = createXeqY(this.values[i][t], this.values[i][startIndex]);
								constraints.add(new IfThen(
										new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
										new And(tempConstant)));
							}
						}else{
							// Case: Constant FS, PS, PD, FD.
							for (int t = 0; t < this.values[i].length; t++){
								PrimitiveConstraint[] tempConstant = createXeqC(this.values[i][t], segmentDynamicValue[nS]);
								constraints.add(new IfThen(
										new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
										new And(tempConstant)));
							}
						}
	
					} else if (segmentDynamic[nS].equals(IntentionalElementDynamicType.INC.getCode())){	
						//INCREASING
		    			for (int t = 0; t < this.values[i].length; t++){
		    				for (int s = 0; s < this.values[i].length; s++){
		    					if (t==s)
		    						continue;
		                		PrimitiveConstraint timeCondition = new And(new XltY(this.timePoints[t], this.timePoints[s]),
	                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
	                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))));
		    					initializePathIncreaseHelper(i, t, s, timeCondition, false);
		    				}
	                		PrimitiveConstraint timeCondition = new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t]));
		    				initializePathIncreaseMaxValueHelper(i, t, segmentDynamicValue[nS], timeCondition);
		    			}
					} else if (segmentDynamic[nS].equals(IntentionalElementDynamicType.DEC.getCode())){
						//DECREASING
						for (int t = 0; t < this.values[i].length; t++){
		        			for (int s = 0; s < this.values[i].length; s++){
		        				if (t==s)
		        					continue;
		                		PrimitiveConstraint timeCondition = new And(new XltY(this.timePoints[t], this.timePoints[s]),
	                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
	                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))));
		        				initializePathDecreaseHelper(i, t, s, timeCondition, false);
		        			}
	                		PrimitiveConstraint timeCondition = new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t]));
	        				initializePathDecreaseMaxValueHelper(i, t, segmentDynamicValue[nS], timeCondition);
		        		}
					}
				}
        	}
    	}
    	// Not Both Dynamic Functions.
    	List<NotBothLink> notBothLinkList = this.spec.getNotBothLink();	
    	for(ListIterator<NotBothLink> ec = notBothLinkList.listIterator(); ec.hasNext(); ){		
    		NotBothLink link = ec.next();
            IntVar epoch = this.notBothEBCollection.get(link);
            int ele1 = link.getElement1().getIdNum();
            int ele2 = link.getElement2().getIdNum();
            for (int t = 0; t < this.values[ele1].length; t++){
            	if(link.isFinalDenied())
            		constraints.add(new IfThenElse(new XgtY(epoch, this.timePoints[t]), 
            				new And(new And(createXeqC(this.values[ele1][t], boolTT)), new And(createXeqC(this.values[ele2][t], boolTT))),
            				new Or(new And(new And(createXeqC(this.values[ele1][t], boolFS)), new And(createXeqC(this.values[ele2][t], boolFD))),
            					   new And(new And(createXeqC(this.values[ele1][t], boolFD)), new And(createXeqC(this.values[ele2][t], boolFS))))));
            	else
            		constraints.add(new IfThenElse(new XgtY(epoch, this.timePoints[t]), 
            				new And(new And(createXeqC(this.values[ele1][t], boolTT)), new And(createXeqC(this.values[ele2][t], boolTT))),
            				new Or(new And(new And(createXeqC(this.values[ele1][t], boolFS)), new And(createXeqC(this.values[ele2][t], boolTT))),
            					   new And(new And(createXeqC(this.values[ele1][t], boolTT)), new And(createXeqC(this.values[ele2][t], boolFS))))));            		
            }
    	}
	}
	
	private void initializePathIncreaseHelper(int i, int t, int s, PrimitiveConstraint timeCondition, boolean stateUDFunction){
		// stateUDFunction : Only set to true when calling from a UD function where we get next state.
		// Add just increasing constraints.

		PrimitiveConstraint[] tFS = createXeqC(this.values[i][t], boolFS);
		PrimitiveConstraint[] tPS = createXeqC(this.values[i][t], boolPS);
		PrimitiveConstraint[] tFSPD = createXeqC(this.values[i][t], boolFSPD);
		PrimitiveConstraint[] tTT = createXeqC(this.values[i][t], boolTT);
		PrimitiveConstraint[] tFSFD = createXeqC(this.values[i][t], boolFSFD);
		PrimitiveConstraint[] tPSPD = createXeqC(this.values[i][t], boolPSPD);
		PrimitiveConstraint[] tPD = createXeqC(this.values[i][t], boolPD);
		PrimitiveConstraint[] tPSFD = createXeqC(this.values[i][t], boolPSFD);
		
		PrimitiveConstraint[] sFS = createXeqC(this.values[i][s], boolFS);
		PrimitiveConstraint[] sPS = createXeqC(this.values[i][s], boolPS);
		PrimitiveConstraint[] sFSPD = createXeqC(this.values[i][s], boolFSPD);
		PrimitiveConstraint[] sTT = createXeqC(this.values[i][s], boolTT);
		PrimitiveConstraint[] sFSFD = createXeqC(this.values[i][s], boolFSFD);
		PrimitiveConstraint[] sPSPD = createXeqC(this.values[i][s], boolPSPD);
		PrimitiveConstraint[] sFD = createXeqC(this.values[i][s], boolFD);

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
	
	private void initializePathIncreaseMaxValueHelper(int i, int t, boolean[] dynFVal, PrimitiveConstraint timeCondition){
		// Add constraints over the maximum value.

		PrimitiveConstraint[] tFS = createXeqC(this.values[i][t], boolFS);
		PrimitiveConstraint[] tPS = createXeqC(this.values[i][t], boolPS);
		PrimitiveConstraint[] tFSPD = createXeqC(this.values[i][t], boolFSPD);
		PrimitiveConstraint[] tTT = createXeqC(this.values[i][t], boolTT);
		PrimitiveConstraint[] tFSFD = createXeqC(this.values[i][t], boolFSFD);
		PrimitiveConstraint[] tPSPD = createXeqC(this.values[i][t], boolPSPD);
		PrimitiveConstraint[] tFD = createXeqC(this.values[i][t], boolFD);		

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
	

	
	private void initializePathDecreaseHelper(int i, int t, int s, PrimitiveConstraint timeCondition, boolean stateUDFunction){
		// Add just decreasing constraints.

		PrimitiveConstraint[] tPS = createXeqC(this.values[i][t], boolPS);
		PrimitiveConstraint[] tFSPD = createXeqC(this.values[i][t], boolFSPD);
		PrimitiveConstraint[] tTT = createXeqC(this.values[i][t], boolTT);
		PrimitiveConstraint[] tFSFD = createXeqC(this.values[i][t], boolFSFD);
		PrimitiveConstraint[] tPSPD = createXeqC(this.values[i][t], boolPSPD);
		PrimitiveConstraint[] tPD = createXeqC(this.values[i][t], boolPD);
		PrimitiveConstraint[] tPSFD = createXeqC(this.values[i][t], boolPSFD);
		PrimitiveConstraint[] tFD = createXeqC(this.values[i][t], boolFD);
		
		PrimitiveConstraint[] sFS = createXeqC(this.values[i][s], boolFS);
		PrimitiveConstraint[] sTT = createXeqC(this.values[i][s], boolTT);
		PrimitiveConstraint[] sFSFD = createXeqC(this.values[i][s], boolFSFD);
		PrimitiveConstraint[] sPSPD = createXeqC(this.values[i][s], boolPSPD);
		PrimitiveConstraint[] sPD = createXeqC(this.values[i][s], boolPD);
		PrimitiveConstraint[] sPSFD = createXeqC(this.values[i][s], boolPSFD);
		PrimitiveConstraint[] sFD = createXeqC(this.values[i][s], boolFD);
			
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

	private void initializePathDecreaseMaxValueHelper(int i, int t, boolean[] dynFVal, PrimitiveConstraint timeCondition){
		// Add constraints over the minimum value.

		PrimitiveConstraint[] tFS = createXeqC(this.values[i][t], boolFS);
		PrimitiveConstraint[] tTT = createXeqC(this.values[i][t], boolTT);
		PrimitiveConstraint[] tFSFD = createXeqC(this.values[i][t], boolFSFD);
		PrimitiveConstraint[] tPSPD = createXeqC(this.values[i][t], boolPSPD);
		PrimitiveConstraint[] tPD = createXeqC(this.values[i][t], boolPD);
		PrimitiveConstraint[] tPSFD = createXeqC(this.values[i][t], boolPSFD);
		PrimitiveConstraint[] tFD = createXeqC(this.values[i][t], boolFD);		

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
	
	
	
	private static PrimitiveConstraint[] createXeqY(BooleanVar[] val1, BooleanVar[] val2){
		return new PrimitiveConstraint[]{
				new XeqY(val1[3], val2[3]),
				new XeqY(val1[2], val2[2]),
				new XeqY(val1[1], val2[1]),
				new XeqY(val1[0], val2[0])};
	}	
	private static PrimitiveConstraint[] createXeqC(BooleanVar[] val1, boolean[] val2){
		return new PrimitiveConstraint[]{
				new XeqC(val1[3], boolToInt(val2[3])),
				new XeqC(val1[2], boolToInt(val2[2])),
				new XeqC(val1[1], boolToInt(val2[1])),
				new XeqC(val1[0], boolToInt(val2[0]))};
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
	 * Add the constraints across the links in the model.
	 * Includes forward and backwards analysis rules.
	 * Considers single and evolving intentions. 
	 */
	private void initializeLinkConstraints() {
    	// Repeat process for each intention.
		for (int e = 0; e < this.intentions.length; e++){
    		IntentionalElement element = this.intentions[e];
    		int targetID = element.getIdNum();

    		if (element.getLinksDest().size() == 0) 
    			continue;    		
    		
    		Decomposition decompositionLink = null;  
    		EvolvingDecomposition eDecompositionLink = null;
    		List<EvolvingContribution> eContributionLinks = new ArrayList<EvolvingContribution>();
    		List<IntentionalElement> contributionElements = new ArrayList<IntentionalElement>();  
    		List<ContributionType> contributionTypes = new ArrayList<ContributionType>();
    		
    		for (ListIterator<ElementLink> linksIteratorDest = element.getLinksDest().listIterator(); linksIteratorDest.hasNext();){
    			ElementLink link = (ElementLink) linksIteratorDest.next();
    				if (link instanceof Decomposition){
    					if ((decompositionLink != null)||(eDecompositionLink != null))
    						throw new RuntimeException("Error: Node ID: " + element.getId() + " has more than one decomposition link as it's destination.");    						
    					decompositionLink = (Decomposition) link;	
    				} else if (link instanceof EvolvingDecomposition) {
    					if ((decompositionLink != null)||(eDecompositionLink != null))
    						throw new RuntimeException("Error: Node ID: " + element.getId() + " has more than one decomposition link as it's destination.");
    					eDecompositionLink = (EvolvingDecomposition) link;	    					
    				} else if (link instanceof Contribution) {
    					contributionElements.add((IntentionalElement) link.getZeroSrc());
    					contributionTypes.add(((Contribution) link).getContribution());
    				} else if (link instanceof EvolvingContribution) {
    					eContributionLinks.add((EvolvingContribution) link);
    				}
    		}

    		/*********************************************************************************************
    		 * Forward Analysis
    		 *********************************************************************************************/  		
    		// Step 1: Decomposition
    		// (a) Decomposition without Evolution
    		if (decompositionLink != null){
    			LinkableElement[] linkEle = decompositionLink.getSrc();
    			int numLinks = linkEle.length;
       			for (int t = 0; t < this.values[targetID].length; t++){
    				BooleanVar[][] sourceValue = new BooleanVar[4][numLinks];
    				for (int s = 0; s < numLinks; s++){
    					sourceValue[3][s] = this.values[linkEle[s].getIdNum()][t][3];
    					sourceValue[2][s] = this.values[linkEle[s].getIdNum()][t][2];
    					sourceValue[1][s] = this.values[linkEle[s].getIdNum()][t][1];
    					sourceValue[0][s] = this.values[linkEle[s].getIdNum()][t][0];
    				}
    				if (decompositionLink.getDecomposition() == DecompositionType.AND){	//And Rules
    					constraints.add(new AndBool(sourceValue[3], this.values[targetID][t][3]));
    					constraints.add(new AndBool(sourceValue[2], this.values[targetID][t][2]));
    					constraints.add(new OrBool(sourceValue[1], this.values[targetID][t][1]));
    					constraints.add(new OrBool(sourceValue[0], this.values[targetID][t][0]));
    				}else{  // Or Rules
    					constraints.add(new OrBool(sourceValue[3], this.values[targetID][t][3]));
    					constraints.add(new OrBool(sourceValue[2], this.values[targetID][t][2]));
    					constraints.add(new AndBool(sourceValue[1], this.values[targetID][t][1]));
    					constraints.add(new AndBool(sourceValue[0], this.values[targetID][t][0]));
    				}
    			}
    		// (b) Evolving Decomposition
    		}else if (eDecompositionLink != null){
    			LinkableElement[] linkEle = eDecompositionLink.getSrc();
    			int numLinks = linkEle.length;
    			DecompositionType pre = eDecompositionLink.getPreDecomposition();
    			DecompositionType post = eDecompositionLink.getPostDecomposition();
    			IntVar dempEB = this.decompEBCollection.get(eDecompositionLink);
    			for (int t = 0; t < this.values[targetID].length; t++){
    				BooleanVar[][] sourceValue = new BooleanVar[4][numLinks];
    				for (int s = 0; s < numLinks; s++){
    					sourceValue[3][s] = this.values[linkEle[s].getIdNum()][t][3];
    					sourceValue[2][s] = this.values[linkEle[s].getIdNum()][t][2];
    					sourceValue[1][s] = this.values[linkEle[s].getIdNum()][t][1];
    					sourceValue[0][s] = this.values[linkEle[s].getIdNum()][t][0];
    				}          			    			

    				PrimitiveConstraint and3 = new AndBoolVector(sourceValue[3], this.values[targetID][t][3]);
    				PrimitiveConstraint and2 = new AndBoolVector(sourceValue[2], this.values[targetID][t][2]);
    				PrimitiveConstraint and1 = new OrBoolVector(sourceValue[1], this.values[targetID][t][1]);
    				PrimitiveConstraint and0 = new OrBoolVector(sourceValue[0], this.values[targetID][t][0]);
    				PrimitiveConstraint or3 = new OrBoolVector(sourceValue[3], this.values[targetID][t][3]);
    				PrimitiveConstraint or2 = new OrBoolVector(sourceValue[2], this.values[targetID][t][2]);
    				PrimitiveConstraint or1 = new AndBoolVector(sourceValue[1], this.values[targetID][t][1]);
    				PrimitiveConstraint or0 = new AndBoolVector(sourceValue[0], this.values[targetID][t][0]);


    				if (pre == DecompositionType.AND && post == DecompositionType.OR){
    					constraints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), and3, or3));
    					constraints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), and2, or2));
    					constraints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), and1, or1));
    					constraints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), and0, or0));
    				} else if (pre == DecompositionType.OR && post == DecompositionType.AND){
    					constraints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), or3, and3));
    					constraints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), or2, and2));
    					constraints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), or1, and1));
    					constraints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), or0, and0));
    				} else if (pre == DecompositionType.AND && post == null){
    					constraints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), and3));
    					constraints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), and2));
    					constraints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), and1));
    					constraints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), and0));
    				} else if (pre == DecompositionType.OR && post == null){
    					constraints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), or3));
    					constraints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), or2));
    					constraints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), or1));
    					constraints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), or0));
    				} else if (pre == null && post == DecompositionType.AND){
    					constraints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), and3));
    					constraints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), and2));
    					constraints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), and1));
    					constraints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), and0));
    				} else if (pre == null && post == DecompositionType.OR){
    					constraints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), or3));
    					constraints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), or2));
    					constraints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), or1));
    					constraints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), or0));
    				}	    	
    			}
    		}


    		// Step 2: Contribution 
    		// (a) Contribution without Evolution
    		if (contributionElements.size() != 0) { 
    			int numLinks = contributionElements.size();	
    			for (int t = 0; t < this.values[targetID].length; t++){
    				for (int i = 0; i < numLinks; i++) {
    					int sourceID = contributionElements.get(i).getIdNum();    					
    					constraints.add(createForwardContributionConstraint(contributionTypes.get(i), this.values[sourceID][t], this.values[targetID][t]));
    				}
    			}
    		}
    		if (eContributionLinks.size() != 0) {	
    			// (b) Evolving Contributions
    			int numLinks = eContributionLinks.size();
    			for (int i = 0; i < numLinks; i++) {
    				EvolvingContribution eLink = eContributionLinks.get(i);
    				int sourceID = ((IntentionalElement)eLink.getZeroSrc()).getIdNum();
    				ContributionType pre = eLink.getPreContribution();
    				ContributionType post = eLink.getPostContribution();
    				IntVar contEB = this.contribEBCollection.get(eLink);
    	   			for (int t = 0; t < this.values[targetID].length; t++){
    	   				PrimitiveConstraint preConstraint = null;
    	   				if(pre != null)
    	   					preConstraint = createForwardContributionConstraint(pre, this.values[sourceID][t], this.values[targetID][t]);
    	   				PrimitiveConstraint postConstraint = null;
    	   				if(post != null)
    	   					postConstraint = createForwardContributionConstraint(post, this.values[sourceID][t], this.values[targetID][t]);
    	   				if((pre != null) && (post != null))
    	   					constraints.add(new IfThenElse(new XgtY(contEB, this.timePoints[t]), preConstraint, postConstraint));
    	   				else if (pre != null)
    	   					constraints.add(new IfThen(new XgtY(contEB, this.timePoints[t]), preConstraint));
    	   				else if (post != null)	
    	   					constraints.add(new IfThen(new XlteqY(contEB, this.timePoints[t]), postConstraint));
    	   			}
    			}   			
    		}
    		
    		
    		/*********************************************************************************************
    		 * Backward Analysis
    		 *********************************************************************************************/
    		// Iterate over each time step.
    		for (int t = 0; t < this.values[targetID].length; t++){
    			ArrayList<PrimitiveConstraint> FSConstaints = new ArrayList<PrimitiveConstraint>();
    			ArrayList<PrimitiveConstraint> PSConstaints = new ArrayList<PrimitiveConstraint>();
    			ArrayList<PrimitiveConstraint> PDConstaints = new ArrayList<PrimitiveConstraint>();
    			ArrayList<PrimitiveConstraint> FDConstaints = new ArrayList<PrimitiveConstraint>();

    			if (decompositionLink != null){
        			LinkableElement[] linkEle = decompositionLink.getSrc();
        			int numLinks = linkEle.length;
    				PrimitiveConstraint[][] sourceValue = new PrimitiveConstraint[4][numLinks];
    				for (int s = 0; s < numLinks; s++){
    					sourceValue[3][s] = new XeqC(this.values[linkEle[s].getIdNum()][t][3], 1);
    					sourceValue[2][s] = new XeqC(this.values[linkEle[s].getIdNum()][t][2], 1);
    					sourceValue[1][s] = new XeqC(this.values[linkEle[s].getIdNum()][t][1], 1);
    					sourceValue[0][s] = new XeqC(this.values[linkEle[s].getIdNum()][t][0], 1);
    				}
    				if (decompositionLink.getDecomposition() == DecompositionType.AND){	//And Rules
        				FSConstaints.add(new And(sourceValue[3]));
        				PSConstaints.add(new And(sourceValue[2]));
        				PDConstaints.add(new Or(sourceValue[1]));
        				FDConstaints.add(new Or(sourceValue[0]));
    				}else{  // Or Rules
        				FSConstaints.add(new Or(sourceValue[3]));
        				PSConstaints.add(new Or(sourceValue[2]));
        				PDConstaints.add(new And(sourceValue[1]));
        				FDConstaints.add(new And(sourceValue[0]));
    				}
    			}else if (eDecompositionLink != null){
    				// Evolving Decomposition
        			LinkableElement[] linkEle = eDecompositionLink.getSrc();
        			int numLinks = linkEle.length;
    				DecompositionType pre = eDecompositionLink.getPreDecomposition();
    				DecompositionType post = eDecompositionLink.getPostDecomposition();
    				IntVar dempEB = this.decompEBCollection.get(eDecompositionLink);
    				PrimitiveConstraint[][] sourceValue = new PrimitiveConstraint[4][numLinks];
    				for (int s = 0; s < numLinks; s++){
    					sourceValue[3][s] = new XeqC(this.values[linkEle[s].getIdNum()][t][3], 1);
    					sourceValue[2][s] = new XeqC(this.values[linkEle[s].getIdNum()][t][2], 1);
    					sourceValue[1][s] = new XeqC(this.values[linkEle[s].getIdNum()][t][1], 1);
    					sourceValue[0][s] = new XeqC(this.values[linkEle[s].getIdNum()][t][0], 1);
    				}
    				if (pre == DecompositionType.AND && post == DecompositionType.OR){
    					//constraints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), andC, orC));
    					FSConstaints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), new And(sourceValue[3]), new Or(sourceValue[3])));
        				PSConstaints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), new And(sourceValue[2]), new Or(sourceValue[2])));
        				PDConstaints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), new Or(sourceValue[1]), new And(sourceValue[1])));
        				FDConstaints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), new Or(sourceValue[0]), new And(sourceValue[0])));
    				} else if (pre == DecompositionType.OR && post == DecompositionType.AND){
    					//constraints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), orC, andC));
    					FSConstaints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), new Or(sourceValue[3]), new And(sourceValue[3])));
        				PSConstaints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), new Or(sourceValue[2]), new And(sourceValue[2])));
        				PDConstaints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), new And(sourceValue[1]), new Or(sourceValue[1])));
        				FDConstaints.add(new IfThenElse(new XgtY(dempEB, this.timePoints[t]), new And(sourceValue[0]), new Or(sourceValue[0])));
    				} else if (pre == DecompositionType.AND && post == null){
    					//constraints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), andC));
    					FSConstaints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), new And(sourceValue[3])));
        				PSConstaints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), new And(sourceValue[2])));
        				PDConstaints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), new Or(sourceValue[1])));
        				FDConstaints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), new Or(sourceValue[0])));
    				} else if (pre == DecompositionType.OR && post == null){
    					//constraints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), orC));
    					FSConstaints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), new Or(sourceValue[3])));
        				PSConstaints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), new Or(sourceValue[2])));
        				PDConstaints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), new And(sourceValue[1])));
        				FDConstaints.add(new IfThen(new XgtY(dempEB, this.timePoints[t]), new And(sourceValue[0])));    					
    				} else if (pre == null && post == DecompositionType.AND){
    					//constraints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), andC));
    					FSConstaints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), new And(sourceValue[3])));
        				PSConstaints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), new And(sourceValue[2])));
        				PDConstaints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), new Or(sourceValue[1])));
        				FDConstaints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), new Or(sourceValue[0])));
    				}else if (pre == null && post == DecompositionType.OR){
    					//constraints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), orC));
    					FSConstaints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), new Or(sourceValue[3])));
        				PSConstaints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), new Or(sourceValue[2])));
        				PDConstaints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), new And(sourceValue[1])));
        				FDConstaints.add(new IfThen(new XlteqY(dempEB, this.timePoints[t]), new And(sourceValue[0])));
    				}
    			}
    			
    			if (contributionElements.size() != 0) { 
    				int numLinks = contributionElements.size();	
    				for (int i = 0; i < numLinks; i++) {
    					int sourceID = contributionElements.get(i).getIdNum();
    					PrimitiveConstraint[] newConts = createBackwardContributionConstraint(contributionTypes.get(i), this.values[sourceID][t]);
    					if (newConts[3] != null)
    						FSConstaints.add(newConts[3]);
    					if (newConts[2] != null)
    						PSConstaints.add(newConts[2]);
    					if (newConts[1] != null)
    						PDConstaints.add(newConts[1]);
    					if (newConts[0] != null)
    						FDConstaints.add(newConts[0]); 
    				}

    			}
    			if (eContributionLinks.size() != 0) {	
    				// (b) Evolving Contributions
    				int numLinks = eContributionLinks.size();
    				for (int i = 0; i < numLinks; i++) {
    					EvolvingContribution eLink = eContributionLinks.get(i);
    					int sourceID = ((IntentionalElement)eLink.getZeroSrc()).getIdNum();
    					ContributionType pre = eLink.getPreContribution();
    					ContributionType post = eLink.getPostContribution();
    					IntVar contEB = this.contribEBCollection.get(eLink);
    					PrimitiveConstraint[] preConstraint = null;
    					if(pre != null)
    						preConstraint = createBackwardContributionConstraint(pre, this.values[sourceID][t]);
    					PrimitiveConstraint[] postConstraint = null;
    					if(post != null)
    						postConstraint = createBackwardContributionConstraint(post, this.values[sourceID][t]);
   
    					// Note: I implemented this as a two if statements rather than and if->else if. The case of a pre and a post link might now work 
    					//		as two separate constraints. This depends on how the "IfThen" are treated in the "Or(FSConstaints)" below.
    					//		If no information is propagated for these links they might need to be written as Not(A) or (B). or all combinations in the IfThen. 
    					if (pre != null){
        					if (preConstraint[3] != null)
        						FSConstaints.add(new IfThen(new XgtY(contEB, this.timePoints[t]), preConstraint[3]));
        					if (preConstraint[2] != null)
        						PSConstaints.add(new IfThen(new XgtY(contEB, this.timePoints[t]), preConstraint[2]));
        					if (preConstraint[1] != null)
        						PDConstaints.add(new IfThen(new XgtY(contEB, this.timePoints[t]), preConstraint[1]));
        					if (preConstraint[0] != null)
        						FDConstaints.add(new IfThen(new XgtY(contEB, this.timePoints[t]), preConstraint[0]));
    					}
    					if (post != null){	
        					if (postConstraint[3] != null)
        						FSConstaints.add(new IfThen(new XlteqY(contEB, this.timePoints[t]), postConstraint[3]));
        					if (postConstraint[2] != null)
        						PSConstaints.add(new IfThen(new XlteqY(contEB, this.timePoints[t]), postConstraint[2]));
        					if (postConstraint[1] != null)
        						PDConstaints.add(new IfThen(new XlteqY(contEB, this.timePoints[t]), postConstraint[1]));
        					if (postConstraint[0] != null)
        						FDConstaints.add(new IfThen(new XlteqY(contEB, this.timePoints[t]), postConstraint[0]));
    					}
    				}   			
        		}
    			if (FSConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(this.values[targetID][t][3], 1), new Or(FSConstaints)));
    			if (PSConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(this.values[targetID][t][2], 1), new Or(PSConstaints)));
    			if (PDConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(this.values[targetID][t][1], 1), new Or(PDConstaints)));
    			if (FDConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(this.values[targetID][t][0], 1), new Or(FDConstaints)));
    		} 
		}
	}
	
	/**
	 * Helper Method to create constraints for contribution links.
	 * @param cType	ContributionType of the link
	 * @param src	Source time-point
	 * @param tgt	Target time-point
	 * @return		The resulting constraint.
	 */
	private PrimitiveConstraint createForwardContributionConstraint(ContributionType cType, BooleanVar[] src, BooleanVar[] tgt){
		PrimitiveConstraint result = null;
		if (cType == ContributionType.PP){ 					//++ 
			result = new And(new And(new Or(new XeqC(src[3], 0), new XeqC(tgt[3], 1)), new Or(new XeqC(src[2], 0), new XeqC(tgt[2], 1))), 
					         new And(new Or(new XeqC(src[1], 0), new XeqC(tgt[1], 1)), new Or(new XeqC(src[0], 0), new XeqC(tgt[0], 1))));
		}else if (cType == ContributionType.P){				//+
			result = new And(new Or(new XeqC(src[2], 0), new XeqC(tgt[2], 1)), new Or(new XeqC(src[1], 0), new XeqC(tgt[1], 1)));
		}else if (cType == ContributionType.M){				//-
			result = new And(new Or(new XeqC(src[2], 0), new XeqC(tgt[1], 1)), new Or(new XeqC(src[1], 0), new XeqC(tgt[2], 1)));
		}else if (cType == ContributionType.MM){				//--
			result = new And(new And(new Or(new XeqC(src[3], 0), new XeqC(tgt[0], 1)), new Or(new XeqC(src[2], 0), new XeqC(tgt[1], 1))), 
			                 new And(new Or(new XeqC(src[1], 0), new XeqC(tgt[2], 1)), new Or(new XeqC(src[0], 0), new XeqC(tgt[3], 1))));
		}else if (cType == ContributionType.SPP){ 			//++S 
			result = new And(new Or(new XeqC(src[3], 0), new XeqC(tgt[3], 1)), new Or(new XeqC(src[2], 0), new XeqC(tgt[2], 1)));
		}else if (cType == ContributionType.SP){			//+S
			result = new Or(new XeqC(src[2], 0), new XeqC(tgt[2], 1));
		}else if (cType == ContributionType.SM){			//-S
			result = new Or(new XeqC(src[2], 0), new XeqC(tgt[1], 1));
		}else if (cType == ContributionType.SMM){			//--S
			result = new And(new Or(new XeqC(src[3], 0), new XeqC(tgt[0], 1)), new Or(new XeqC(src[2], 0), new XeqC(tgt[1], 1)));
		}else if (cType == ContributionType.DPP){ 			//++D 
			result = new And(new Or(new XeqC(src[1], 0), new XeqC(tgt[1], 1)), new Or(new XeqC(src[0], 0), new XeqC(tgt[0], 1)));
		}else if (cType == ContributionType.DP){			//+D
			result = new Or(new XeqC(src[1], 0), new XeqC(tgt[1], 1));
		}else if (cType == ContributionType.DM){			//-D
			result = new Or(new XeqC(src[1], 0), new XeqC(tgt[2], 1));
		}else if (cType == ContributionType.DMM){			//--D
			result = new And(new Or(new XeqC(src[1], 0), new XeqC(tgt[2], 1)), new Or(new XeqC(src[0], 0), new XeqC(tgt[3], 1)));
		}else
			throw new RuntimeException("ERROR: No rule for " + cType.toString() + " link type.");	
		if (DEBUG)
			System.out.println("Link: " + result.toString());
		return result;
	}
	
	
	
	private PrimitiveConstraint[] createBackwardContributionConstraint(ContributionType cType, BooleanVar[] src){
		PrimitiveConstraint[] result = new PrimitiveConstraint[4];
		for (int i = 0; i < 4; i++)
			result[i] = null;
		
		if (cType == ContributionType.PP){ 					//++ 
			result[3] = new XeqC(src[3], 1);
			result[2] = new XeqC(src[2], 1);
			result[1] = new XeqC(src[1], 1);
			result[0] = new XeqC(src[0], 1);
		}else if (cType == ContributionType.P){				//+
			result[2] = new XeqC(src[2], 1);
			result[1] = new XeqC(src[1], 1);
		}else if (cType == ContributionType.M){				//-
			result[2] = new XeqC(src[1], 1);
			result[1] = new XeqC(src[2], 1);
		}else if (cType == ContributionType.MM){				//--
			result[3] = new XeqC(src[0], 1);
			result[2] = new XeqC(src[1], 1);
			result[1] = new XeqC(src[2], 1);
			result[0] = new XeqC(src[3], 1);
		}else if (cType == ContributionType.SPP){ 			//++S 
			result[3] = new XeqC(src[3], 1);
			result[2] = new XeqC(src[2], 1);
		}else if (cType == ContributionType.SP){			//+S
			result[2] = new XeqC(src[2], 1);
		}else if (cType == ContributionType.SM){			//-S
			result[1] = new XeqC(src[2], 1);
		}else if (cType == ContributionType.SMM){			//--S
			result[1] = new XeqC(src[2], 1);
			result[0] = new XeqC(src[3], 1);
		}else if (cType == ContributionType.DPP){ 			//++D 
			result[1] = new XeqC(src[1], 1);
			result[0] = new XeqC(src[0], 1);
		}else if (cType == ContributionType.DP){			//+D
			result[1] = new XeqC(src[1], 1);
		}else if (cType == ContributionType.DM){			//-D
			result[2] = new XeqC(src[1], 1);
		}else if (cType == ContributionType.DMM){			//--D
			result[3] = new XeqC(src[0], 1);
			result[2] = new XeqC(src[1], 1);
		}else
			throw new RuntimeException("ERROR: No rule for " + cType.toString() + " link type.");		
		return result;
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
	 * Adds the dynamic functions to solve the next state. Thus, only requires two time values. 
	 * Assume: All values except the last time-point in the "val" array are assigned initial values.
	 * Assume: Current 
	 * @param constraintList
	 * @param elementList
	 * @param val
	 * @param epochCollection
	 * @param currentAbsoluteTime
	 * @param initialIndex
	 */
	private void initializeStateDynamicFunctions(List<Constraint> constraintList, 
			IntentionalElement[] elementList, BooleanVar[][][] val, 
			HashMap<IntentionalElement, IntVar[]>  epochCollection, int currentAbsoluteTime,
			int initialIndex, IntVar minTimePoint){ 

		int nextIndex = initialIndex + 1;
		for (int i = 0; i < elementList.length; i++){
			IntentionalElement element = elementList[i];
			IntentionalElementDynamicType tempType = element.dynamicType;
			if ((tempType == IntentionalElementDynamicType.NT) || (element.dynamicType == IntentionalElementDynamicType.RND)  || 
					(tempType == IntentionalElementDynamicType.NB))
				continue;

			IntVar[] epochs = epochCollection.get(element);
			boolean[] dynFVal = element.getDynamicFunctionMarkedValue(); 

			if (tempType == IntentionalElementDynamicType.CONST){
				PrimitiveConstraint[] tempConstant = createXeqY(this.values[i][nextIndex], this.values[i][initialIndex]);
				constraints.add(new And(tempConstant)); 
			}else if ((tempType == IntentionalElementDynamicType.INC) || (tempType == IntentionalElementDynamicType.MONP)){
				PrimitiveConstraint timeCondition = new XeqC(this.zero, 0);
				initializePathIncreaseHelper(i, initialIndex, initialIndex+1, timeCondition, false);
				if (tempType == IntentionalElementDynamicType.MONP){
					if(this.spec.getInitialAssignedEpochs().get(epochs[0].id()) != null && epochs[0].value() <= currentAbsoluteTime){
						PrimitiveConstraint[] tempConstant = createXeqY(this.values[i][nextIndex], this.values[i][initialIndex]);
						constraints.add(new And(tempConstant));
						continue;
					} else {
						PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][nextIndex], dynFVal);
						constraints.add(new IfThen(new XeqY(epochs[0], minTimePoint), 
								new And(tempDynValue)));
					}
				} else
					initializePathIncreaseMaxValueHelper(i, initialIndex+1, dynFVal, null);				
			} else if ((tempType == IntentionalElementDynamicType.DEC) || (tempType == IntentionalElementDynamicType.MONN)){
				PrimitiveConstraint timeCondition = new XeqC(this.zero, 0);
				initializePathDecreaseHelper(i, initialIndex, initialIndex+1, timeCondition, false);
				if (tempType == IntentionalElementDynamicType.MONN){
					if(this.spec.getInitialAssignedEpochs().get(epochs[0].id()) != null && epochs[0].value() <= currentAbsoluteTime){
						PrimitiveConstraint[] tempConstant = createXeqY(this.values[i][nextIndex], this.values[i][initialIndex]);
						constraints.add(new And(tempConstant));
						continue;
					} else {
						PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][nextIndex], dynFVal);
						constraints.add(new IfThen(new XeqY(epochs[0], minTimePoint), 
								new And(tempDynValue)));
					}
				}else
					initializePathDecreaseMaxValueHelper(i, initialIndex+1, dynFVal, null);
			} else if (tempType == IntentionalElementDynamicType.SD){
				if(this.spec.getInitialAssignedEpochs().get(epochs[0].id()) != null && epochs[0].value() <= currentAbsoluteTime )
					constraints.add(new And(createXeqC(this.values[i][nextIndex], boolFD)));
				else{
					constraints.add(new IfThenElse(new XgtY(epochs[0], minTimePoint), 
							new And(createXeqC(this.values[i][nextIndex], boolFS)),
							new And(createXeqC(this.values[i][nextIndex], boolFD))));
				}
			} else if (tempType == IntentionalElementDynamicType.DS){
				if(this.spec.getInitialAssignedEpochs().get(epochs[0].id()) != null && epochs[0].value() <= currentAbsoluteTime)
					constraints.add(new And(createXeqC(this.values[i][nextIndex], boolFS)));
				else{
					constraints.add(new IfThenElse(new XgtY(epochs[0], minTimePoint), 
							new And(createXeqC(this.values[i][nextIndex], boolFD)),
							new And(createXeqC(this.values[i][nextIndex], boolFS))));
				} 		
			} else if (tempType == IntentionalElementDynamicType.RC){
				if(this.spec.getInitialAssignedEpochs().get(epochs[0].id()) != null && epochs[0].value() <= currentAbsoluteTime)
					constraints.add(new And(createXeqC(this.values[i][nextIndex], dynFVal)));
				else{
					constraints.add(new IfThen(new XlteqY(epochs[0], minTimePoint), 
							new And(createXeqC(this.values[i][nextIndex], dynFVal))));
				} 		
			} else if (tempType == IntentionalElementDynamicType.CR){
				if(this.spec.getInitialAssignedEpochs().get(epochs[0].id()) != null && epochs[0].value() <= currentAbsoluteTime)
					continue;
				else{
					constraints.add(new IfThen(new XgtY(epochs[0], minTimePoint), 
							new And(createXeqC(this.values[i][nextIndex], dynFVal))));
				} 
			/************ UD Functions *******************/	
			} else if (tempType == IntentionalElementDynamicType.UD){
				// Repeat has been unrolled.
				if (epochs == null){	// Assume at least one EB.
					throw new RuntimeException("UD functions must have at least one EB. Fix " + element.getId());
				}	
				// Find which epoch the part falls into.
				UDFunctionCSP funcUD = element.getCspUDFunct();
				String[] segmentDynamic = funcUD.getFunctions();
				int numSegments = segmentDynamic.length;		//Segments not EBs
				int nS = -1;
				for (int e = 0; e < epochs.length; e ++)
					if(currentAbsoluteTime < epochs[e].value()){
						nS = e;
						break;
					}
				int nextSegment = nS + 1;
				IntVar nextEpoch = epochs[nS];
				if (nS == -1){
					nS = numSegments - 1;
					nextSegment = nS;
					nextEpoch = this.infinity;
				}	
				String dynamic = segmentDynamic[nS];
				boolean[] dynamicValue = funcUD.getDynamicValues()[nS];
				PrimitiveConstraint epochCondition = new XgtY(nextEpoch, minTimePoint);
				initializeStateUDHelper(i, dynamic, dynamicValue, epochCondition, initialIndex);

				// Add next segment conditions.
				if (nextSegment == nS)
					continue;
				dynamic = segmentDynamic[nextSegment];
				dynamicValue = funcUD.getDynamicValues()[nextSegment];
				epochCondition = new XlteqY(nextEpoch, minTimePoint);
				initializeStateUDHelper(i, dynamic, dynamicValue, epochCondition, initialIndex);
			}
		}

    	// Not Both Dynamic Functions.
    	List<NotBothLink> notBothLinkList = this.spec.getNotBothLink();	
    	for(ListIterator<NotBothLink> ec = notBothLinkList.listIterator(); ec.hasNext(); ){		
    		NotBothLink link = ec.next();
            IntVar epoch = this.notBothEBCollection.get(link);
            int ele1 = link.getElement1().getIdNum();
            int ele2 = link.getElement2().getIdNum();            
			if(epoch.value() <= currentAbsoluteTime)
				if(link.isFinalDenied())
					constraints.add(new Or(new And(new And(createXeqC(this.values[ele1][nextIndex], boolFS)), new And(createXeqC(this.values[ele2][nextIndex], boolFD))),
     					   new And(new And(createXeqC(this.values[ele1][nextIndex], boolFD)), new And(createXeqC(this.values[ele2][nextIndex], boolFS)))));
				else
					constraints.add(new Or(new And(new And(createXeqC(this.values[ele1][nextIndex], boolFS)), new And(createXeqC(this.values[ele2][nextIndex], boolTT))),
	     					   new And(new And(createXeqC(this.values[ele1][nextIndex], boolTT)), new And(createXeqC(this.values[ele2][nextIndex], boolFS)))));
			else
            	if(link.isFinalDenied())
            		constraints.add(new IfThenElse(new XgtY(epoch, this.timePoints[nextIndex]), 
            				new And(new And(createXeqC(this.values[ele1][nextIndex], boolTT)), new And(createXeqC(this.values[ele2][nextIndex], boolTT))),
            				new Or(new And(new And(createXeqC(this.values[ele1][nextIndex], boolFS)), new And(createXeqC(this.values[ele2][nextIndex], boolFD))),
            					   new And(new And(createXeqC(this.values[ele1][nextIndex], boolFD)), new And(createXeqC(this.values[ele2][nextIndex], boolFS))))));
            	else
            		constraints.add(new IfThenElse(new XgtY(epoch, this.timePoints[nextIndex]), 
            				new And(new And(createXeqC(this.values[ele1][nextIndex], boolTT)), new And(createXeqC(this.values[ele2][nextIndex], boolTT))),
            				new Or(new And(new And(createXeqC(this.values[ele1][nextIndex], boolFS)), new And(createXeqC(this.values[ele2][nextIndex], boolTT))),
            					   new And(new And(createXeqC(this.values[ele1][nextIndex], boolTT)), new And(createXeqC(this.values[ele2][nextIndex], boolFS))))));            		
    	}
	}
	
	private void initializeStateUDHelper(int i, String dynamic, boolean[] dynFVal, PrimitiveConstraint epochCondition, int initialIndex){
		int nextIndex = initialIndex + 1;
		
		if (dynamic.equals(IntentionalElementDynamicType.CONST.getCode())){
			constraints.add(new IfThen(epochCondition, 
					new And(createXeqY(this.values[i][nextIndex], this.values[i][initialIndex]))));
		} else if (dynamic.equals(IntentionalElementDynamicType.INC.getCode())){
			initializePathIncreaseHelper(i, initialIndex, initialIndex+1, epochCondition, true);
			initializePathIncreaseMaxValueHelper(i, initialIndex+1, dynFVal, epochCondition);		
		} else if (dynamic.equals(IntentionalElementDynamicType.DEC.getCode())){
			initializePathDecreaseHelper(i, initialIndex, initialIndex+1, epochCondition, true);
			initializePathDecreaseMaxValueHelper(i, initialIndex+1, dynFVal, epochCondition);
		}
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
        
        // Test and Add Constraints
        if(DEBUG)
        	System.out.println("Constraints List:");
        for (int i = 0; i < constraints.size(); i++) {
            if(DEBUG)
            	System.out.println(constraints.get(i).toString());
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
        
        // Return Solution
        if(!solutionFound){
        	if (DEBUG) System.out.println("Found Solution = False");
        	throw new RuntimeException("There is no solution to this model. The solver may have reached a timeout.");
		} else {
	    	if (DEBUG) System.out.println("Found Solution = True");
			if (this.searchAll)
				this.saveAllSolution(label);				
			else
				this.saveSingleSolution(label);
			return true;
		}
	}
	
	// Methods for initial search.
	/**
	 * This method creates the variable list for the solver to solve. 
	 * @return
	 */
	private IntVar[] createVarList(){
    	if (problemType == SearchType.PATH){			
			// Add full path to variables.
			int fullListSize = (this.numIntentions * this.numTimePoints * 4) + this.timePoints.length + this.epochs.length; 
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
			for (int i = 0; i < this.epochs.length; i++){
				fullList[fullListIndex] = this.epochs[i];
				fullListIndex++;
			}
			return fullList;
		}else if (problemType == SearchType.NEXT_STATE){
			// Solve only the next state.
			int initial = this.spec.getInitialValueTimePoints().length - 1;
			//IntVar[] fullList = new IntVar[(this.numIntentions * 8) + 1];
			IntVar[] fullList = new IntVar[(this.numIntentions * 8)];
			int fullListIndex = 0;
			//fullList[fullListIndex] = this.minTimePoint;		// TODO: Should this be this.minTimePoint or this.nextTimePoint?
			//fullListIndex++;
			for (int i = 0; i < this.values.length; i++)
				for (int v = 0; v < this.values[i][0].length; v++){
					fullList[fullListIndex] = this.values[i][initial][v];
					fullListIndex++;
				}
			for (int i = 0; i < this.values.length; i++)
				for (int v = 0; v < this.values[i][0].length; v++){
					fullList[fullListIndex] = this.values[i][initial + 1][v];
					fullListIndex++;
				}			
			return fullList;
		}else if (problemType == SearchType.CURRENT_STATE){
			int initial = this.spec.getInitialValueTimePoints().length - 1;
			IntVar[] fullList = new IntVar[(this.numIntentions * 4)];
			int fullListIndex = 0;
			for (int i = 0; i < this.values.length; i++)
				for (int v = 0; v < this.values[i][0].length; v++){
					fullList[fullListIndex] = this.values[i][initial][v];
					fullListIndex++;
				}
			return fullList;
		}else
			return null;
	}
	
	private void saveSingleSolution(Search<IntVar> label) {
		if (problemType == SearchType.PATH){
			int[] timeOrder = this.createTimePointOrder();
			if (DEBUG)
				this.printSinglePathSolution(timeOrder);
			this.saveSinglePathSolution(timeOrder);
		}else if (problemType == SearchType.NEXT_STATE)	//TODO Implement Save/Print Single Next_State
    		throw new RuntimeException("ERROR: Save/Print Single Next_State not implemented.");
    	else if (problemType == SearchType.CURRENT_STATE) //TODO Implement Save/Print Single Current_State
    		throw new RuntimeException("ERROR: Save/Print Single Current_State not implemented.");
	}
	
	/**
	 * @param label
	 */
	private void saveAllSolution(Search<IntVar> label) {
		if (problemType == SearchType.PATH) //TODO Implement Save/Print All Paths
    		throw new RuntimeException("ERROR: Save/Print All Paths not implemented.");
        else if ((problemType == SearchType.NEXT_STATE) || (problemType == SearchType.CURRENT_STATE)){
			//TODO: Need a post-hoc way to figure out which time points apply to which solutions.
//			int[] finalValueTimePoints = new int[indexOrder.length];
//	    	for (int i = 0; i < indexOrder.length; i++)
//	    		finalValueTimePoints[i] = this.timePoints[indexOrder[i]].value();
//	   		this.spec.setTimePointPath(finalValueTimePoints);

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
				//TODO: Include the output of this.minTimePoint @ solIndex = 0.
				//System.out.println(label.getSolution(s)[0].toString());
				//int solIndex = 1;
				
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
			this.spec.setFinalAllSolutionsValues(finalValues);

			if(DEBUG)
				System.out.println("\n Finished Saving Solutions"); 
        }else if (problemType == SearchType.CURRENT_STATE){
        	// TODO: How do we save all the solutions when solving the current state?
        	throw new RuntimeException("Incomplete Implementation: We need to save all the solutions when solving the current state?");
        }
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
    	for (int i = 0; i < indexOrder.length; i++){
    		System.out.print(this.timePoints[indexOrder[i]].id + "-" + this.timePoints[indexOrder[i]].value() + "\t");
   		}
    	System.out.println();
		
    	// Print out times.
    	System.out.print("Time:\t");
    	for (int i = 0; i < indexOrder.length; i++){
    		System.out.print(i + "|" + this.timePoints[indexOrder[i]].value() + "\t");
   		}
    	System.out.println();
    	
    	// Print out Values.
    	for (int i = 0; i < this.intentions.length; i++){
    		IntentionalElement element = this.intentions[i];
    		System.out.print(element.id + ":\t");
    		for (int t = 0; t < this.values[i].length; t++){
        		for (int v = 0; v < this.values[i][t].length; v++)
        			System.out.print(this.values[i][indexOrder[t]][v].value());
        		System.out.print("\t");
    		}
    		System.out.println(element.name + "\t" + element.dynamicType.toString());
    	} 
    	
    	// Print out intention epoch values.
    	System.out.print("Epoch Points:\t");
   		for (int i = 0; i < this.epochs.length; i++){
    		System.out.print(this.epochs[i].id + "-" + this.epochs[i].value() + "\t");
   		}   		
	}	
	/**
	 * @param indexOrder
	 */
	private void saveSinglePathSolution(int[] indexOrder) {	
		int[] finalValueTimePoints = new int[indexOrder.length];
    	for (int i = 0; i < indexOrder.length; i++)
    		finalValueTimePoints[i] = this.timePoints[indexOrder[i]].value();
   		this.spec.setFinalValueTimePoints(finalValueTimePoints);
    	
   		boolean[][][] finalValues = new boolean[this.intentions.length][indexOrder.length][4];
    	for (int i = 0; i < this.intentions.length; i++){
    		for (int t = 0; t < this.values[i].length; t++){
        		for (int v = 0; v < this.values[i][t].length; v++)
        			if(this.values[i][indexOrder[t]][v].value() == 1)
        				finalValues[i][t][v] = true;
        			else
        				finalValues[i][t][v] = false;
    		}
    	} 
    	this.spec.setFinalValues(finalValues);
    	
    	HashMap<String, Integer> finalAssignedEpochs = new HashMap<String, Integer>();
    	for (int i = 0; i < this.epochs.length; i++)
    		finalAssignedEpochs.put(this.epochs[i].id, this.epochs[i].value());	
    	for (int i = 0; i < indexOrder.length; i++)
    		finalAssignedEpochs.put(this.timePoints[indexOrder[i]].id, this.timePoints[indexOrder[i]].value());
    	this.spec.setFinalAssignedEpochs(finalAssignedEpochs);
	}

	

	/**
	 * Returns the Model associated with this solver instance.
	 * @return	ModelSpec associated with this solver instance.
	 */
	public ModelSpec getSpec() {
		return spec;
	}
	
}	