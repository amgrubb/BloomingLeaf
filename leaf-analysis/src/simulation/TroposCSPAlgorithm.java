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
import org.jacop.constraints.XneqC;
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
    
    private final static boolean DEBUG = true;								// Whether to print debug statements.
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
	public TroposCSPAlgorithm(ModelSpec spec) {
/*		
		store = new Store();

		IntVar L0 = new IntVar(store, "L0", 1, 100);
		IntVar TA0 = new IntVar(store, "TA0", 0, 0);
		
		IntVar[] links = new IntVar[3];
		links[0] = new IntVar(store, "N0001_0_FS", 0, 0);
		links[1] = new IntVar(store, "N0002_0_FS", 0, 1);
		links[2] = new IntVar(store, "N0001_0_FS", 0, 1);
		
		IntVar N0000_0_FS = new IntVar(store, "N0000_0_FS", 0, 0);

		store.impose(new IfThen(
		            new XgtY(L0, TA0), 
		            new AndBool(links, N0000_0_FS)));

		boolean result = store.consistency();

		System.out.println("result = " + result);
		System.out.println(store);
*/		
		
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
    	
    	if (this.spec.getInitialValueTimePoints().length != this.spec.getInitialValues()[0].length)
    		System.err.println("Error: The length of initialValueTimePoints and initialValues[0] do not match.");

		// Determine the number of observation steps.
		// Add constraints between Intention EBs.
    	calculateSampleSizeAndCreateEBsAndTimePoints(this.spec.getAbsoluteTimePoints(), 
    			this.spec.getRelativeTimePoints(), this.spec.getInitialValueTimePoints(), 
    			this.spec.getInitialAssignedEpochs(), this.spec.isSolveNextState());
    	
    	// Initialise Values Array.
    	int lengthOfInitial = this.spec.getInitialValueTimePoints().length;
    	if(this.spec.isSolveNextState())
    		this.values = new BooleanVar[this.numIntentions][lengthOfInitial + 1][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS;
    	else
    		this.values = new BooleanVar[this.numIntentions][this.numTimePoints][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS

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

    	if (DEBUG)
    		System.out.println("\nMethod: initialize next time point for path");
    	
    	if(this.spec.isSolveNextState())
    		initializeNextTimeConstraints();
    	else{
    		nextTimePoint = null;
    		minTimePoint = null;
    	}
    	
    	if (DEBUG)
    		System.out.println("\nMethod: initialize dynmaics");
    	
    	// Create constraints for Dynamic Elements.
    	if(this.spec.isSolveNextState())
    		initializeStateDynamicFunctions(this.constraints, this.intentions, this.values, 
    				this.functionEBCollection, this.spec.getInitialValueTimePoints()[lengthOfInitial - 1], lengthOfInitial - 1, this.minTimePoint);
    	else
    		initializePathDynamicFunctions();
    	
    	if (DEBUG)
    		System.out.println("\nEnd of Init Procedure");
	}	
	

	private void initializeNextTimeConstraints() {
		nextTimePoint = new IntVar(this.store, "Next_Time", 0, nextTimePoints.length - 1);
		minTimePoint = new IntVar(this.store, "Min_Time", 0, this.maxTime);
		this.constraints.add(new Min(nextTimePoints, minTimePoint));
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
			int[] initialValueTimePoints, HashMap<String, Integer> assignedEpochs, boolean singleState) {

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
        			(element.dynamicType == IntentionalElementDynamicType.RND))	// Dynamic function contains no EB.
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
        		System.err.println("TroposCSPAlgorithm: Dynamic type not found for " + element.name);
    	}
    	
    	// Step 1B: Count the number of EBs for numEpochs associated with EvolvingLinks and NotBothLinks.
    	numEpochs += this.spec.getEvolvingContribution().size();
    	numEpochs += this.spec.getEvolvingDecomposition().size();
    	numEpochs += this.spec.getNotBothLink().size();
    	
    	// Step 2A: Create constraints between epochs.
    	List<EpochConstraint> eConstraints = this.spec.getConstraintsBetweenEpochs();
    	
    	// (i) Get Absolute Assignments
    	for(ListIterator<EpochConstraint> ec = eConstraints.listIterator(); ec.hasNext(); ){		
    		EpochConstraint etmp = ec.next();
    		String eCont = etmp.getType();
    		if (eCont.equals("A")) {	//Absolute Time Point
    			IntVar src = getEBFromEpochCollection(etmp.src, etmp.getSrcEB());
    			if (src == null)
    				System.err.println("Error: Null found in " + etmp.toString());
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
    					System.err.println("Cannot have two absolute EBs assigned to each other.");
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
    				System.err.println("Error: Null found in " + etmp.toString());
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
    				System.err.println("Error: Null found in " + etmp.toString());
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
    				System.err.println("Absolute time selected for EBs cannot be greater than maxTime.");
    			
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
    				System.err.println("Absolute time selected for EBs cannot be greater than maxTime.");
    			
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
    				System.err.println("Absolute time selected for EBs cannot be greater than maxTime.");
    			
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
    	int countTotalPreviousT = 0;
    	String[] exisitingNamedTimePoints = new String[initialValueTimePoints.length];
    	int maxPreviousTime = initialValueTimePoints[initialValueTimePoints.length - 1];
    	// Creates EB for Time Point 0.
    	if (initialValueTimePoints.length == 1)		
    		exisitingNamedTimePoints[0] = "TA0";
    	// Creates EB from initialAssignedEpoch HashMap of times.
    	else if (initialValueTimePoints.length > 1){
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
    		    				break;
    		    			}
    		    	}
    		    }
    		}
    	}else
    		System.err.println("Invalid Input for initialValueTimePoints and initialValues.");
    	
    	if (DEBUG){
    		System.out.print("Previous Times are: ");
    		for(int e = 0; e < exisitingNamedTimePoints.length; e++)
    			System.out.print(exisitingNamedTimePoints[e] + "\t");
    		System.out.println("\n Max Previous is: " + maxPreviousTime);	
    	}
    	
    	// Step 4B: Create List of Time Points
    	this.numTimePoints = 1 + absoluteCollection.size() + EBTimePoint.size() + numStochasticTimePoints;

    	if(countTotalPreviousT != this.numTimePoints && countTotalPreviousT > 0)
    		System.err.println("Error: Previous and Current Time Points do no match.");
    	
    	if (DEBUG)
    		System.out.println("Previous Time Points: " + countTotalPreviousT + "  New Time Points: " + this.numTimePoints);
    	
    	// Create Time Points
    	this.timePoints = new IntVar[this.numTimePoints];

    	// Add Zero
    	this.timePoints[0] = new IntVar(store, exisitingNamedTimePoints[0], 0, 0); 
    	
    	// Add previousCollection
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
    	    			constraints.add(new XeqC(value, initialValueTimePoints[e]));
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
		nextTimePoint.add(absoluteCollection.get(maxKey));
		
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
    		if (tCount == this.timePoints.length)
    			System.out.println("ERROR");
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
    			System.err.println("Intention ID does not match orderied ID in TroposCSP");

    		for (int t = 0; t < this.values[i].length; t++){
    			// Creates IntVars and adds the FS -> PS invariant.
    			initializeNodeVariables(this.store, this.sat, this.values[i][t], element.getId() + "_" + t);
    			
    			// Initial initialValues.
    			if ((t == 0) && (initialValues[i].length == 1) && (!initialValues[i][t][0] && !initialValues[i][t][1] && !initialValues[i][t][2] && !initialValues[i][t][3]))
    				continue;
    			else if (t < initialValues[i].length){
    				this.constraints.add(new XeqC(this.values[i][t][0], boolToInt(initialValues[i][t][0])));
    				this.constraints.add(new XeqC(this.values[i][t][1], boolToInt(initialValues[i][t][1])));
    				this.constraints.add(new XeqC(this.values[i][t][2], boolToInt(initialValues[i][t][2])));
    				this.constraints.add(new XeqC(this.values[i][t][3], boolToInt(initialValues[i][t][3])));
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
    			// Add increasing constraints.
    			for (int t = 0; t < this.values[i].length; t++)
    				for (int s = 0; s < this.values[i].length; s++){
    					if (t==s)
    						continue;
    					initializePathIncreaseHelper(i, t, s);
    				}
    			// If MP then constraints.
    			if (tempType == IntentionalElementDynamicType.MONP){
    				for (int t = 0; t < this.values[i].length; t++){
    					PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][t], dynFVal);
    					constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), new And(tempDynValue)));
    				}
    			// Else add max increasing constraints.
    			} else 
    				for (int t = 0; t < this.values[i].length; t++) 
    					initializePathIncreaseMaxValueHelper(i, t, dynFVal);
        	} else if ((tempType == IntentionalElementDynamicType.DEC) || (tempType == IntentionalElementDynamicType.MONN)){
        		if (tempType == IntentionalElementDynamicType.MONN){
            		for (int t = 0; t < this.values[i].length; t++){
    					PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][t], dynFVal);
                		constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), 
                				new And(tempDynValue)));
            		}
        		}
      			for (int t = 0; t < this.values[i].length; t++)
      				for (int s = 0; s < this.values[i].length; s++){
            			if (t==s)
            				continue;
            			
                		PrimitiveConstraint[] tFS = createXeqC(this.values[i][t], boolFS);
                		PrimitiveConstraint[] tPS = createXeqC(this.values[i][t], boolPS);
                		PrimitiveConstraint[] tPD = createXeqC(this.values[i][t], boolPD);
                		PrimitiveConstraint[] tFD = createXeqC(this.values[i][t], boolFD);
                		PrimitiveConstraint[] sFS = createXeqC(this.values[i][s], boolFS);
                		PrimitiveConstraint[] sPS = createXeqC(this.values[i][s], boolPS);
                		PrimitiveConstraint[] sPD = createXeqC(this.values[i][s], boolPD);
                		PrimitiveConstraint[] sFD = createXeqC(this.values[i][s], boolFD);

            			if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && dynFVal[3]) {		//case 3:
                    		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                    				new And(sFS)));
            			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && !dynFVal[3]) {		//case 2:
                    		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                    				new Or(new And(sFS), new And(sPS))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS)),
                					new And(sPS)));  
            			} else if (!dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//case 1:
                    		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                    				new Or(new And(sFS), new Or(new And(sPS), new And(sPD)))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS)),
                					new Or(new And(sPS), new And(sPD))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD)),
                					new And(sPD))); 
            			} else if (dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {				//case 0:
                    		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                    				new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS)),
                					new Or(new And(sFD), new Or(new And(sPS), new And(sPD)))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD)),
                					new Or(new And(sFD), new And(sPD))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD)),
                					new And(sFD)));
            			} else
            				System.err.println("DEC Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
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
					System.err.println("UD functions must have at least one EB. Fix node: " + element.getId());
					continue;
				}
        		
				UDFunctionCSP funcUD = element.getCspUDFunct();
				String[] segmentDynamic = funcUD.getFunctions();
				boolean[][] segmentDynamicValue = funcUD.getDynamicValues();
				int numSegments = segmentDynamic.length;		//Segments not EBs
				IntVar segmentStart = null;
				IntVar segmentEnd = null;
				for (int nS = 0; nS < numSegments; nS ++){
					if (nS == 0){
						segmentStart = this.timePoints[0];//this.zero;
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
									System.err.println("UD Function not correct " + element.getId() + " has missing EB.");
									continue;
								}
								for (int p = 0; p < timePoints.length; p++){
									if (timePoints[p] == startTime){
										startIndex = p;
										break;
									}
								}
								if (startIndex == -1){
									System.err.println("UD Function not correct " + element.getId() + " has missing EB.");
									continue;
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
						// INCREASING
		      			for (int t = 0; t < this.values[i].length; t++)
		      				for (int s = 0; s < this.values[i].length; s++){
		            			if (t==s)
		            				continue;

		            			PrimitiveConstraint[] tFS = createXeqC(this.values[i][t], boolFS);
		                		PrimitiveConstraint[] tPS = createXeqC(this.values[i][t], boolPS);
		                		PrimitiveConstraint[] tPD = createXeqC(this.values[i][t], boolPD);
		                		PrimitiveConstraint[] tFD = createXeqC(this.values[i][t], boolFD);
		                		PrimitiveConstraint[] sFS = createXeqC(this.values[i][s], boolFS);
		                		PrimitiveConstraint[] sPS = createXeqC(this.values[i][s], boolPS);
		                		PrimitiveConstraint[] sPD = createXeqC(this.values[i][s], boolPD);
		                		PrimitiveConstraint[] sFD = createXeqC(this.values[i][s], boolFD);
		                		
		                		if (segmentDynamicValue[nS][0] && segmentDynamicValue[nS][1] && !segmentDynamicValue[nS][2] && !segmentDynamicValue[nS][3]) {				//case 0:	
		                			constraints.add(new IfThen(new And(
		                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
		                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
		                					new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD))),
		                					new And(sFD)));
		                		} else if (!segmentDynamicValue[nS][0] && segmentDynamicValue[nS][1] && !segmentDynamicValue[nS][2] && !segmentDynamicValue[nS][3]) {		//case 1:
		                			constraints.add(new IfThen(new And(
		                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
		                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
		                					new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD))),
		                					new And(sPD)));
		                			constraints.add(new IfThen(new And(
		                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
		                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
		                					new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD))),
		                					new Or(new And(sPD), new And(sFD))));		                			
		                		} else if (!segmentDynamicValue[nS][0] && !segmentDynamicValue[nS][1] && segmentDynamicValue[nS][2] && !segmentDynamicValue[nS][3]) {		//case 2:
		                			constraints.add(new IfThen(new And(
		                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
		                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
		                					new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS))),
		                					new And(sPS)));
		                			constraints.add(new IfThen(new And(
		                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
		                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
		                					new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD))),
		                					new Or(new And(sPS), new And(sPD))));
		                			constraints.add(new IfThen(new And(
		                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
		                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
		                					new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD))),
		                					new Or(new And(sPS), new Or(new And(sPD), new And(sFD)))));
		                		} else if (!segmentDynamicValue[nS][0] && !segmentDynamicValue[nS][1] && segmentDynamicValue[nS][2] && segmentDynamicValue[nS][3]) {		//case 3:
		                			constraints.add(new IfThen(new And(
		                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
		                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
		                					new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS))),
		                					new And(sFS)));
		                			constraints.add(new IfThen(new And(
		                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
		                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
		                					new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS))),
		                					new Or(new And(sFS), new And(sPS))));
		                			constraints.add(new IfThen(new And(
		                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
		                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
		                					new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD))),
		                					new Or(new And(sFS), new Or(new And(sPS), new And(sPD)))));
		                			constraints.add(new IfThen(new And(
		                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
		                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
		                					new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD))),
		                					new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
		                		} else
		                			System.err.println("INC Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
		      				}
//						// If previous segement was constant carry value forward for first value.
//						if ((nS != 0) && (segmentDynamic[nS - 1].equals(IntentionalElementDynamicType.CONST.getCode()))){
//							for (int t = 0; t < this.values[i].length; t++){
//								PrimitiveConstraint[] tempConstant = genericCreateConstantCondition(segmentDynamicValue[nS - 1], this.values[i][t]);
//								if (tempConstant == null){
//									System.err.println("ns - 1 for UD Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
//									break;
//								}
//								constraints.add(new IfThen(
//										new XeqY(segmentStart, this.timePoints[t]),
//										new And(tempConstant)));
//							}
//						}
					} else if (segmentDynamic[nS].equals(IntentionalElementDynamicType.DEC.getCode())){
		      			//DECREASING
						for (int t = 0; t < this.values[i].length; t++)
		      				for (int s = 0; s < this.values[i].length; s++){
		            			if (t==s)
		            				continue;

		            			PrimitiveConstraint[] tFS = createXeqC(this.values[i][t], boolFS);
		                		PrimitiveConstraint[] tPS = createXeqC(this.values[i][t], boolPS);
		                		PrimitiveConstraint[] tPD = createXeqC(this.values[i][t], boolPD);
		                		PrimitiveConstraint[] tFD = createXeqC(this.values[i][t], boolFD);
		                		PrimitiveConstraint[] sFS = createXeqC(this.values[i][s], boolFS);
		                		PrimitiveConstraint[] sPS = createXeqC(this.values[i][s], boolPS);
		                		PrimitiveConstraint[] sPD = createXeqC(this.values[i][s], boolPD);
		                		PrimitiveConstraint[] sFD = createXeqC(this.values[i][s], boolFD);
		                		
		                		if (segmentDynamicValue[nS][0] && segmentDynamicValue[nS][1] && !segmentDynamicValue[nS][2] && !segmentDynamicValue[nS][3]) {				//case 0:	
									constraints.add(new IfThen(new And(
											new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
													new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
											new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS))),
											new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
									constraints.add(new IfThen(new And(
											new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
													new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
											new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS))),
											new Or(new And(sFD), new Or(new And(sPS), new And(sPD)))));
									constraints.add(new IfThen(new And(
											new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
													new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
											new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD))),
											new Or(new And(sFD), new And(sPD))));
									constraints.add(new IfThen(new And(
											new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
													new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
											new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD))),
											new And(sFD)));
								} else if (!segmentDynamicValue[nS][0] && segmentDynamicValue[nS][1] && !segmentDynamicValue[nS][2] && !segmentDynamicValue[nS][3]) {		//case 1:
									constraints.add(new IfThen(new And(
											new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
													new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
											new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS))),
											new Or(new And(sPD), new Or(new And(sPS), new And(sFS)))));
									constraints.add(new IfThen(new And(
											new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
													new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
											new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS))),
											new Or(new And(sPD), new And(sPS))));
									constraints.add(new IfThen(new And(
											new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
													new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
											new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD))),
											new And(sPD)));
		                		} else if (!segmentDynamicValue[nS][0] && !segmentDynamicValue[nS][1] && segmentDynamicValue[nS][2] && !segmentDynamicValue[nS][3]) {		//case 2:
									constraints.add(new IfThen(new And(
											new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
													new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
											new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS))),
											new Or(new And(sPS), new And(sFS))));
									constraints.add(new IfThen(new And(
											new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
													new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
											new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS))),
											new And(sPS)));	                			
		                		} else if (!segmentDynamicValue[nS][0] && !segmentDynamicValue[nS][1] && segmentDynamicValue[nS][2] && segmentDynamicValue[nS][3]) {		//case 3:
									constraints.add(new IfThen(new And(
											new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
													new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))),
											new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS))),
											new And(sFS)));
		                		} else
		                			System.err.println("DEC Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
		      				}
						
//						// If previous segement was constant carry value forward for first value.
//						if ((nS != 0) && (segmentDynamic[nS - 1].equals(IntentionalElementDynamicType.CONST.getCode()))){
//							for (int t = 0; t < this.values[i].length; t++){
//								PrimitiveConstraint[] tempConstant = genericCreateConstantCondition(segmentDynamicValue[nS - 1], this.values[i][t]);
//								if (tempConstant == null){
//									System.err.println("ns - 1 for UD Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
//									break;
//								}
//								constraints.add(new IfThen(
//										new XeqY(segmentStart, this.timePoints[t]),
//										new And(tempConstant)));
//							}
//						}        				
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
	
	private void initializePathIncreaseHelper(int i, int t, int s){
		// Add just increasing constraints.

		PrimitiveConstraint[] tFS = createXeqC(this.values[i][t], boolFS);
		PrimitiveConstraint[] tPS = createXeqC(this.values[i][t], boolPS);
		PrimitiveConstraint[] tFSPD = createXeqC(this.values[i][t], boolFSPD);
		PrimitiveConstraint[] tTT = createXeqC(this.values[i][t], boolTT);
		PrimitiveConstraint[] tFSFD = createXeqC(this.values[i][t], boolFSFD);
		PrimitiveConstraint[] tPSPD = createXeqC(this.values[i][t], boolPSPD);
		PrimitiveConstraint[] tPD = createXeqC(this.values[i][t], boolPD);
		PrimitiveConstraint[] tPSFD = createXeqC(this.values[i][t], boolPSFD);
		//PrimitiveConstraint[] tFD = createXeqC(this.values[i][t], boolFD);
		
		PrimitiveConstraint[] sFS = createXeqC(this.values[i][s], boolFS);
		PrimitiveConstraint[] sPS = createXeqC(this.values[i][s], boolPS);
		PrimitiveConstraint[] sFSPD = createXeqC(this.values[i][s], boolFSPD);
		PrimitiveConstraint[] sTT = createXeqC(this.values[i][s], boolTT);
		PrimitiveConstraint[] sFSFD = createXeqC(this.values[i][s], boolFSFD);
		PrimitiveConstraint[] sPSPD = createXeqC(this.values[i][s], boolPSPD);
		//PrimitiveConstraint[] sPD = createXeqC(this.values[i][s], boolPD);
		//PrimitiveConstraint[] sPSFD = createXeqC(this.values[i][s], boolPSFD);
		PrimitiveConstraint[] sFD = createXeqC(this.values[i][s], boolFD);
				
		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
				new And(sFS)));
		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new Or(new And(tPS), new And(tFSPD))),
				new Or(new And(sFS), new Or(new And(sPS), new And(sFSPD)))));
		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new Or(new And(tTT), new Or(new And(tFSFD), new And(tPSPD)))),
				new Or(
					new Or(new And(sFS), new And(sPS)), 
					new Or(
						new Or(new And(sFSPD), new And(sTT)), 
						new Or(new And(sFSFD), new And(sPSPD))))));
		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new Or(new And(tPD), new And(tPSFD))),
				new Not(new And(sFD))));
	}

	private void initializePathIncreaseMaxValueHelper(int i, int t, boolean[] dynFVal){
		// Add constraints over the maximum value.
		
		PrimitiveConstraint[] tFS = createXeqC(this.values[i][t], boolFS);
		PrimitiveConstraint[] tPS = createXeqC(this.values[i][t], boolPS);
		PrimitiveConstraint[] tFSPD = createXeqC(this.values[i][t], boolFSPD);
		PrimitiveConstraint[] tTT = createXeqC(this.values[i][t], boolTT);
		PrimitiveConstraint[] tFSFD = createXeqC(this.values[i][t], boolFSFD);
		PrimitiveConstraint[] tPSPD = createXeqC(this.values[i][t], boolPSPD);
		//PrimitiveConstraint[] tPD = createXeqC(this.values[i][t], boolPD);
		//PrimitiveConstraint[] tPSFD = createXeqC(this.values[i][t], boolPSFD);
		PrimitiveConstraint[] tFD = createXeqC(this.values[i][t], boolFD);		

		
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
			System.err.println("INC Dynamic Value for intention " + i + " Conflict value.");
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
    						System.err.println("Error: Node ID: " + element.getId() + " has more than one decomposition link as it's destination.");    						
    					decompositionLink = (Decomposition) link;	
    				} else if (link instanceof EvolvingDecomposition) {
    					if ((decompositionLink != null)||(eDecompositionLink != null))
    						System.err.println("Error: Node ID: " + element.getId() + " has more than one decomposition link as it's destination.");
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
    						postConstraint = createBackwardContributionConstraint(pre, this.values[sourceID][t]);
   
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
			System.out.println("ERROR: No rule for " + cType.toString() + " link type.");	
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
			System.out.println("ERROR: No rule for " + cType.toString() + " link type.");		
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

		boolean[] boolFD = new boolean[] {true, true, false, false};
		boolean[] boolFS = new boolean[] {false, false, true, true};
		boolean[] boolTT = new boolean[] {false, false, false, false};
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
				if (tempType == IntentionalElementDynamicType.MONP){
					if(epochs[0].value() <= currentAbsoluteTime){
						PrimitiveConstraint[] tempConstant = createXeqY(this.values[i][nextIndex], this.values[i][initialIndex]);
						constraints.add(new And(tempConstant));
						continue;
					} else {
						PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][nextIndex], dynFVal);
						constraints.add(new IfThen(new XeqY(epochs[0], minTimePoint), 
								new And(tempDynValue)));
					}
				}	
				initializeStateIncreaseHelper(i, initialIndex, dynFVal);
			} else if ((tempType == IntentionalElementDynamicType.DEC) || (tempType == IntentionalElementDynamicType.MONN)){
				if (tempType == IntentionalElementDynamicType.MONN){
					if(epochs[0].value() <= currentAbsoluteTime){
						PrimitiveConstraint[] tempConstant = createXeqY(this.values[i][nextIndex], this.values[i][initialIndex]);
						constraints.add(new And(tempConstant));
						continue;
					} else {
						PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][nextIndex], dynFVal);
						constraints.add(new IfThen(new XeqY(epochs[0], minTimePoint), 
								new And(tempDynValue)));
					}
				}
				initializeStateDecreaseHelper(i, initialIndex, dynFVal);

			} else if (tempType == IntentionalElementDynamicType.SD){
				if(epochs[0].value() <= currentAbsoluteTime)
					constraints.add(new And(createXeqC(this.values[i][nextIndex], boolFD)));
				else{
					constraints.add(new IfThenElse(new XgtY(epochs[0], minTimePoint), 
							new And(createXeqC(this.values[i][nextIndex], boolFS)),
							new And(createXeqC(this.values[i][nextIndex], boolFD))));
				}
			} else if (tempType == IntentionalElementDynamicType.DS){
				if(epochs[0].value() <= currentAbsoluteTime)
					constraints.add(new And(createXeqC(this.values[i][nextIndex], boolFS)));
				else{
					constraints.add(new IfThenElse(new XgtY(epochs[0], minTimePoint), 
							new And(createXeqC(this.values[i][nextIndex], boolFD)),
							new And(createXeqC(this.values[i][nextIndex], boolFS))));
				} 		
			} else if (tempType == IntentionalElementDynamicType.RC){
				if(epochs[0].value() <= currentAbsoluteTime)
					constraints.add(new And(createXeqC(this.values[i][nextIndex], dynFVal)));
				else{
					constraints.add(new IfThen(new XlteqY(epochs[0], minTimePoint), 
							new And(createXeqC(this.values[i][nextIndex], dynFVal))));
				} 		
			} else if (tempType == IntentionalElementDynamicType.CR){
				if(epochs[0].value() <= currentAbsoluteTime)
					continue;
				else{
					constraints.add(new IfThen(new XgtY(epochs[0], minTimePoint), 
							new And(createXeqC(this.values[i][nextIndex], dynFVal))));
				} 
			/************ UD Functions *******************/	
			} else if (tempType == IntentionalElementDynamicType.UD){
				// Repeat has been unrolled.
				if (epochs == null){	// Assume at least one EB.
					System.err.println("UD functions must have at least one EB. Fix " + element.getId());
					continue;
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
		boolean[] boolFD = new boolean[] {true, true, false, false};
		boolean[] boolPD = new boolean[] {false, true, false, false};
		boolean[] boolPS = new boolean[] {false, false, true, false};
		boolean[] boolFS = new boolean[] {false, false, true, true};
		
		if (dynamic.equals(IntentionalElementDynamicType.CONST.getCode())){
			constraints.add(new IfThen(epochCondition, 
					new And(createXeqY(this.values[i][nextIndex], this.values[i][initialIndex]))));
		} else if (dynamic.equals(IntentionalElementDynamicType.INC.getCode())){
			PrimitiveConstraint[] tFS = createXeqC(this.values[i][initialIndex], boolFS);
			PrimitiveConstraint[] tPS = createXeqC(this.values[i][initialIndex], boolPS);
			PrimitiveConstraint[] tPD = createXeqC(this.values[i][initialIndex], boolPD);
			PrimitiveConstraint[] tFD = createXeqC(this.values[i][initialIndex], boolFD);
			PrimitiveConstraint[] sFS = createXeqC(this.values[i][nextIndex], boolFS);
			PrimitiveConstraint[] sPS = createXeqC(this.values[i][nextIndex], boolPS);
			PrimitiveConstraint[] sPD = createXeqC(this.values[i][nextIndex], boolPD);
			PrimitiveConstraint[] sFD = createXeqC(this.values[i][nextIndex], boolFD);
			if (dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {				//case 0:	
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tFD),
						new And(sFD))));
			} else if (!dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//case 1:
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tPD),
						new And(sPD))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tFD),
						new Or(new And(sPD), new And(sFD)))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && !dynFVal[3]) {		//case 2:
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tPS),
						new And(sPS))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tPD),
						new Or(new And(sPS), new And(sPD)))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tFD),
						new Or(new And(sPS), new Or(new And(sPD), new And(sFD))))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && dynFVal[3]) {		//case 3:
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tFS),
						new And(sFS))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tPS),
						new Or(new And(sFS), new And(sPS)))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tPD),
						new Or(new And(sFS), new Or(new And(sPS), new And(sPD))))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tFD),
						new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD))))));
			} else
				System.err.println("INC Dynamic Value has Unknown/None/Conflict value.");
		} else if (dynamic.equals(IntentionalElementDynamicType.DEC.getCode())){
			PrimitiveConstraint[] tFS = createXeqC(this.values[i][initialIndex], boolFS);
			PrimitiveConstraint[] tPS = createXeqC(this.values[i][initialIndex], boolPS);
			PrimitiveConstraint[] tPD = createXeqC(this.values[i][initialIndex], boolPD);
			PrimitiveConstraint[] tFD = createXeqC(this.values[i][initialIndex], boolFD);
			PrimitiveConstraint[] sFS = createXeqC(this.values[i][nextIndex], boolFS);
			PrimitiveConstraint[] sPS = createXeqC(this.values[i][nextIndex], boolPS);
			PrimitiveConstraint[] sPD = createXeqC(this.values[i][nextIndex], boolPD);
			PrimitiveConstraint[] sFD = createXeqC(this.values[i][nextIndex], boolFD);
			if (dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {				//case 0:	
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tFS),
						new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD))))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tPS),
						new Or(new And(sFD), new Or(new And(sPS), new And(sPD))))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tPD),
						new Or(new And(sFD), new And(sPD)))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tFD),
						new And(sFD))));
			} else if (!dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//case 1:
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tFS),
						new Or(new And(sPD), new Or(new And(sPS), new And(sFS))))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tPS),
						new Or(new And(sPS), new And(sPD)))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tPD),
						new And(sPD))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && !dynFVal[3]) {		//case 2:
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tFS),
						new Or(new And(sPS), new And(sFS)))));
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tPS),
						new And(sPS))));
			} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && dynFVal[3]) {		//case 3:
				constraints.add(new IfThen(epochCondition, new IfThen(new And(tFS),
						new And(sFS))));
			} else
				System.err.println("DEC Dynamic Value has Unknown/None/Conflict value.");
		}
	}
	
	private void initializeStateIncreaseHelper(int i, int initialIndex, boolean[] dynFVal){
		int nextIndex = initialIndex + 1;
		boolean[] boolFD = new boolean[] {true, true, false, false};
		boolean[] boolPD = new boolean[] {false, true, false, false};
		boolean[] boolPS = new boolean[] {false, false, true, false};
		boolean[] boolFS = new boolean[] {false, false, true, true};
		PrimitiveConstraint[] tFS = createXeqC(this.values[i][initialIndex], boolFS);
		PrimitiveConstraint[] tPS = createXeqC(this.values[i][initialIndex], boolPS);
		PrimitiveConstraint[] tPD = createXeqC(this.values[i][initialIndex], boolPD);
		PrimitiveConstraint[] tFD = createXeqC(this.values[i][initialIndex], boolFD);
		PrimitiveConstraint[] sFS = createXeqC(this.values[i][nextIndex], boolFS);
		PrimitiveConstraint[] sPS = createXeqC(this.values[i][nextIndex], boolPS);
		PrimitiveConstraint[] sPD = createXeqC(this.values[i][nextIndex], boolPD);
		PrimitiveConstraint[] sFD = createXeqC(this.values[i][nextIndex], boolFD);
		if (dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {				//case 0:	
			constraints.add(new IfThen(new And(tFD),
					new And(sFD)));
		} else if (!dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//case 1:
			constraints.add(new IfThen(new And(tPD),
					new And(sPD)));
			constraints.add(new IfThen(new And(tFD),
					new Or(new And(sPD), new And(sFD))));
		} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && !dynFVal[3]) {		//case 2:
				constraints.add(new IfThen(new And(tPS),
					new And(sPS)));
			constraints.add(new IfThen(new And(tPD),
					new Or(new And(sPS), new And(sPD))));
			constraints.add(new IfThen(new And(tFD),
					new Or(new And(sPS), new Or(new And(sPD), new And(sFD)))));
		} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && dynFVal[3]) {		//case 3:
			constraints.add(new IfThen(new And(tFS),
					new And(sFS)));
			constraints.add(new IfThen(new And(tPS),
					new Or(new And(sFS), new And(sPS))));
			constraints.add(new IfThen(new And(tPD),
					new Or(new And(sFS), new Or(new And(sPS), new And(sPD)))));
			constraints.add(new IfThen(new And(tFD),
					new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
		} else
			System.err.println("INC Dynamic Value has Unknown/None/Conflict value.");
	}
	private void initializeStateDecreaseHelper(int i, int initialIndex, boolean[] dynFVal){
		int nextIndex = initialIndex + 1;
		boolean[] boolFD = new boolean[] {true, true, false, false};
		boolean[] boolPD = new boolean[] {false, true, false, false};
		boolean[] boolPS = new boolean[] {false, false, true, false};
		boolean[] boolFS = new boolean[] {false, false, true, true};
		PrimitiveConstraint[] tFS = createXeqC(this.values[i][initialIndex], boolFS);
		PrimitiveConstraint[] tPS = createXeqC(this.values[i][initialIndex], boolPS);
		PrimitiveConstraint[] tPD = createXeqC(this.values[i][initialIndex], boolPD);
		PrimitiveConstraint[] tFD = createXeqC(this.values[i][initialIndex], boolFD);
		PrimitiveConstraint[] sFS = createXeqC(this.values[i][nextIndex], boolFS);
		PrimitiveConstraint[] sPS = createXeqC(this.values[i][nextIndex], boolPS);
		PrimitiveConstraint[] sPD = createXeqC(this.values[i][nextIndex], boolPD);
		PrimitiveConstraint[] sFD = createXeqC(this.values[i][nextIndex], boolFD);
		if (dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {				//case 0:	
			constraints.add(new IfThen(new And(tFS),
					new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
			constraints.add(new IfThen(new And(tPS),
					new Or(new And(sFD), new Or(new And(sPS), new And(sPD)))));
			constraints.add(new IfThen(new And(tPD),
					new Or(new And(sFD), new And(sPD))));
			constraints.add(new IfThen(new And(tFD),
					new And(sFD)));
		} else if (!dynFVal[0] && dynFVal[1] && !dynFVal[2] && !dynFVal[3]) {		//case 1:
			constraints.add(new IfThen(new And(tFS),
					new Or(new And(sPD), new Or(new And(sPS), new And(sFS)))));
			constraints.add(new IfThen(new And(tPS),
					new Or(new And(sPS), new And(sPD))));
			constraints.add(new IfThen(new And(tPD),
					new And(sPD)));
		} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && !dynFVal[3]) {		//case 2:
			constraints.add(new IfThen(new And(tFS),
					new Or(new And(sPS), new And(sFS))));
			constraints.add(new IfThen(new And(tPS),
					new And(sPS)));
		} else if (!dynFVal[0] && !dynFVal[1] && dynFVal[2] && dynFVal[3]) {		//case 3:
			constraints.add(new IfThen(new And(tFS),
					new And(sFS)));
		} else
			System.err.println("DEC Dynamic Value has Unknown/None/Conflict value.");
		
	}
	
	
	
	
	/**
	 * @param allSolutions
	 * @param singleState
	 * @param store
	 * @param label
	 * @param constraints
	 * @param varList
	 * @return
	 */
	private static boolean findSolution(boolean allSolutions, boolean singleState, Store store, Search<IntVar> label, List<Constraint> constraints, IntVar[] varList) {
		label.getSolutionListener().recordSolutions(true);	// Record steps in search.
        label.setPrintInfo(false); 							// Set to false if you don't want the CSP to print the solution as you go.
        
        // Test and Add Constraints
        if(DEBUG)
        	System.out.println("Constraints List:");
        for (int i = 0; i < constraints.size(); i++) {
            if(DEBUG)
            	//System.out.println(constraints.get(i).toString());
            store.impose(constraints.get(i));
            if(!store.consistency()) {
            	Constraint errorConst = constraints.get(i);
            	ArrayList<Var> errorVarList = errorConst.arguments();
            	for (Var temp : errorVarList) {
        			System.out.println(temp.id + "::" + temp.dom().toString());
        		}
            	System.out.println("Constraint: " + constraints.get(i).toString());
                System.out.println("have conflicting constraints, not solvable");            
                return false;
            }
        }

        SelectChoicePoint <IntVar> select = new SimpleSelect<IntVar>(varList, new MostConstrainedDynamic<IntVar>(), new IndomainSimpleRandom<IntVar>());//new MostConstrainedStatic<IntVar>(), new IndomainSimpleRandom<IntVar>()); 
        
//        label.setSolutionListener(new PrintOutListener<IntVar>()); 

        if (allSolutions){
	        label.getSolutionListener().searchAll(true); 					
		}else{
	        label.getSolutionListener().searchAll(false); 		
		}
        
        return label.labeling(store, select);
	}
	
	// Methods for initial search.
	/**
	 * This method creates the variable list for the solver to solve. 
	 * @return
	 */
	private IntVar[] createVarList(){
		if (this.spec.isSolveNextState()){
			int initial = this.spec.getInitialValueTimePoints().length - 1;
			IntVar[] fullList = new IntVar[(this.numIntentions * 8) + 1];
			int fullListIndex = 0;
			fullList[fullListIndex] = this.minTimePoint;		// Should this be this.minTimePoint or this.nextTimePoint?
			fullListIndex++;
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
		}else{
			// Solve the whole path.
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
		}
	}
	/**
	 * @return
	 */
	private int[] createTimePointOrder() {
		if (this.spec.isSolveNextState()){
			//TODO: Actually make correct.
			// Any changes here will affect the print/save All Solutions functions.
			int[] indexOrder = new int[this.values[0].length];
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
		}else{
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
	}
	/**
	 * @param indexOrder
	 */
	private void printSingleSolution(int[] indexOrder) {
		//TODO: Deal with state? Print fullList[fullListIndex] = this.minTimePoint;?
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
	private void saveSingleSolution(int[] indexOrder) {	
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
	 * @return
	 */
	public boolean solveModel(){
		Search<IntVar> label = new DepthFirstSearch<IntVar>();

		if(!findSolution(!this.spec.isSolveSingleSolutions(), this.spec.isSolveNextState(), this.store, label, this.constraints, this.createVarList())){
			System.out.println("Found Solution = False");
			return false;
		} else {
	    	if (DEBUG)
	    		System.out.println("Found Solution = True");
			if (!this.spec.isSolveSingleSolutions()){
				this.saveAllSolution(label);				
			}else{
				int[] timeOrder = this.createTimePointOrder();
				if (DEBUG)
					this.printSingleSolution(timeOrder);
				this.saveSingleSolution(timeOrder);
			}
			return true;
		}
	}
	/**
	 * @param label
	 */
	private void saveAllSolution(Search<IntVar> label) {
		if (this.spec.isSolveNextState()){
			//TODO: Fix with proper code.
//			int[] finalValueTimePoints = new int[indexOrder.length];
//	    	for (int i = 0; i < indexOrder.length; i++)
//	    		finalValueTimePoints[i] = this.timePoints[indexOrder[i]].value();
//	   		this.spec.setFinalValueTimePoints(finalValueTimePoints);

			int totalSolution = label.getSolutionListener().solutionsNo();

			if(DEBUG){
				System.out.println("Saving all states");
				System.out.println("\nThere are " + totalSolution + " possible next states.");
				System.out.println("\n Solution: ");
				for (int s = 1; s <= totalSolution; s++){
					for (int v = 0; v < label.getSolution(s).length; v++)
						System.out.print(label.getSolution(s)[v]);
					System.out.println();
				}
				System.out.println("\n Finished Printing Solutions");
			}

			// int solNum = 1;	/// NOTE: Solution number starts at 1 not 0!!!
			boolean[][][][] finalValues = new boolean[totalSolution][this.intentions.length][this.values[0].length][4];
			for (int s = 1; s <= totalSolution; s++){
				//TODO: Include the output of this.minTimePoint @ solIndex = 0.
				int solIndex = 1;
				System.out.println(s);
				for (int i = 0; i < this.intentions.length; i++)
					for (int t = 0; t < this.values[0].length; t++)
						for (int v = 0; v < 4; v++){
							if(label.getSolution(s)[solIndex].toString().equals("1"))
								finalValues[s-1][i][t][v] = true;
							else if(label.getSolution(s)[solIndex].toString().equals("0"))
								finalValues[s-1][i][t][v] = false;
							else
								System.err.println("Error: " + label.getSolution(s)[v] + " has non-binary value.");
							solIndex++;
						}
			}
			this.spec.setFinalAllSolutionsValues(finalValues);
		}else{
			// TODO: How do we save all the solutions when solving the whole path.
		}
	}
	
	/**
	 * Returns the Model associated with this solver instance.
	 * @return	ModelSpec associated with this solver instance.
	 */
	public ModelSpec getSpec() {
		return spec;
	}
	
}	
	
/****************** END OF CLASS ***********************************	
	private void exploreState(int stateNum, int[] timeOrder){
		int nodeIndex = timeOrder[stateNum];
		Store storeExplore = new Store(); 
		SatTranslation satExplore = new SatTranslation(storeExplore); 
		satExplore.impose(); 		
		List<Constraint> constraintsExplore = new ArrayList<Constraint>();

		IntVar zero = new IntVar(storeExplore, "Zero", 0, 0);
		BooleanVar[][][] valuesExplore = new BooleanVar[this.values.length][2][4]; 	    
		int currentTime = this.timePoints[nodeIndex].value();

		//System.out.println("The current time is: " + currentTime);

		for (int i = 0; i < valuesExplore.length; i++){
			IntentionalElement element = this.intentions[i];
			genericInitialNodeValues(storeExplore, satExplore, valuesExplore[i][0], element.getId() + "_0");
			genericInitialNodeValues(storeExplore, satExplore, valuesExplore[i][1], element.getId() + "_1");

			genericWeakConflictPrevention(satExplore, valuesExplore[i][1], zero);
			for (int j = 0; j < 4; j ++)
				constraintsExplore.add(new XeqC(valuesExplore[i][0][j], this.values[i][nodeIndex][j].value()));
			
		}
		genericAddLinkConstraints(satExplore, constraintsExplore, this.spec, this.intentions, valuesExplore);
		genericInitialNextStateDynamics(constraintsExplore, this.intentions, valuesExplore, 
				this.functionEBCollection, currentTime, 0);

		storeExplore.print();

		//Create VarList
		IntVar[] fullList = new IntVar[valuesExplore.length * 8];
		int fullListIndex = 0;
		for (int i = 0; i < valuesExplore.length; i++)
				for (int v = 0; v < valuesExplore[i][0].length; v++){
					fullList[fullListIndex] = valuesExplore[i][0][v];
					fullListIndex++;
				}
		for (int i = 0; i < valuesExplore.length; i++)
			for (int v = 0; v < valuesExplore[i][1].length; v++){
				fullList[fullListIndex] = valuesExplore[i][1][v];
				fullListIndex++;
			}

		Search<IntVar> label = new DepthFirstSearch<IntVar>();
		if (!genericFindSolution(true, true, storeExplore, label, constraintsExplore, fullList))
			System.out.println("Found Solution = False");
		else{
			System.out.println("\nThere are " + label.getSolutionListener().solutionsNo() + " possible next states.");
			
			
			int solNum = 1;	/// NOTE: Solution number starts at 1 not 0!!!
			//IntVar[] variables = label.getVariables(); 
			//IntDomain[] solutions = (IntDomain[])label.getSolution(solNum);

			// Print Solution
			int solIndex = 0;
			// Print Original Model
			System.out.println("\nOriginal Model - Time: " + currentTime);
			for (int i = 0; i < this.intentions.length; i++){
				IntentionalElement element = this.intentions[i];
				System.out.print(element.id + ":\t");
				for (int v = 0; v < 4; v++){
					System.out.print(label.getSolution(solNum)[solIndex]);
					solIndex++;
				}
				System.out.println("\t" + element.name + "\t" + element.dynamicType.toString());
			}  	

			
			// Print Next State
			System.out.println("\nNext State");
			for (int i = 0; i < this.intentions.length; i++){
				IntentionalElement element = this.intentions[i];
				System.out.print(element.id + ":\t");
				for (int v = 0; v < 4; v++){
					System.out.print(label.getSolution(solNum)[solIndex]);
					solIndex++;
				}
				System.out.println("\t" + element.name + "\t" + element.dynamicType.toString());
			}  
    	}
	}
    
    public static void main(String[] args) {
		String FILENAME = "stored-models/single-node"; //stored-models/testEB-Values"; //stored-models/simple-AND"; //models/UD-fuc-repeat.leaf"; //city-tropos-2.leaf"; //backward-test-helps.leaf"; //city-tropos-2.leaf";	 //sebastiani-fig1.leaf";
		try {
			// Version 2
			String filename = "";
			ModelSpec model = null;

			filename = FILENAME;
			model = new ModelSpec(filename);
			if (model != null){
				model.setSolveSinglePath(true); 
				model.setSolveNextState(true);

				TroposCSPAlgorithm algo = new TroposCSPAlgorithm(model);
				if (algo.solveModel()){
					while(true){	
						System.out.println("\nEnter the time step number you would like to explore (or enter to exit):");
						BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(System.in));
						String selection = bufferedReader.readLine();
						if (selection.equals(""))
							return;
						else {
							int numChoice = Integer.parseInt(selection);

							// Update Values in the model.
							int[] newValueTimePoints = new int[numChoice + 1];
							boolean[][][] newValues = new boolean[model.getNumIntentions()][numChoice + 1][4];
							for (int i = 0; i < numChoice + 1; i++){
								newValueTimePoints[i] = model.getFinalValueTimePoints()[i];
								for(int j = 0; j < model.getNumIntentions(); j++)
									newValues[j][i] = model.getFinalValues()[j][i];
							}
							model.setInitialAssignedEpochs(model.getFinalAssignedEpochs());
							model.setInitialValueTimePoints(newValueTimePoints);
							model.setInitialValues(newValues);

							model.setFinalAssignedEpochs(null);
							model.setFinalValues(null);
							model.setFinalAssignedEpochs(null);

							// New conditions:
							model.setSolveSinglePath(false);
							model.setSolveNextState(true);

							// Get a new rest of the simulation.
							TroposCSPAlgorithm algo2 = new TroposCSPAlgorithm(model);
							Search<IntVar> label2 = new DepthFirstSearch<IntVar>();
							if(!genericFindSolution(model.isSolveSingleSolutions(), model.isSolveNextState(), algo2.store, label2, algo2.constraints, algo2.createVarList())){
								System.out.println("Found Solution = False");
								return;
							} else {
								System.out.println("Found Solution = True");
								int[] timeOrder2 = algo2.createTimePointOrder();
								algo2.printSingleSolution(timeOrder2);
								algo2.saveSingleSolution(timeOrder2);
							}

						}
					}
				}
			}
			
//			// Version 1
//			String filename = "";
//			ModelSpec model = null;
//
//			filename = FILENAME;
//			model = new ModelSpec(filename);
//			if (model != null){
//				TroposCSPAlgorithm algo = new TroposCSPAlgorithm(model);
//				Search<IntVar> label = new DepthFirstSearch<IntVar>();
//				if(!algo.genericFindSolution(false, algo.store, label, algo.constraints, algo.createFullModelVarList()))
//					System.out.println("Found Solution = False");
//				else {
//					System.out.println("Found Solution = True");
//					int[] timeOrder = algo.createTimePointOrder();
//					algo.printSingleSolution(timeOrder);
//					algo.saveSolution(timeOrder);
//					
//						System.out.println("\nEnter the time step number you would like to explore (or enter to exit):");
//						BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(System.in));
//						String selection = bufferedReader.readLine();
//
//						if (!selection.equals("")){
//							int numChoice = Integer.parseInt(selection);
//							algo.exploreState(numChoice, timeOrder);
//						}
//				}
//			}
		} catch (Exception e) {
				System.err.println("Unknown Exception: " + e.getMessage());
				System.err.println("Stack trace: ");
				e.printStackTrace(System.err);
		}
	}
	
//	private static void genericAddAssignmentConstraint(List<Constraint> constraintList, int initialEvaluation, BooleanVar[] this.values){
//		switch (initialEvaluation) {
//			case 0:	
//				constraints.add(new XeqC(val[3], 0));
//				constraints.add(new XeqC(val[2], 0));
//				constraints.add(new XeqC(val[1], 1));
//				constraints.add(new XeqC(val[0], 1));
//				break;
//			case 1:	
//				constraints.add(new XeqC(val[3], 0));
//				constraints.add(new XeqC(val[2], 0));
//				constraints.add(new XeqC(val[1], 1));
//				constraints.add(new XeqC(val[0], 0));
//				break;
//			case 2:	
//				constraints.add(new XeqC(val[3], 0));
//				constraints.add(new XeqC(val[2], 1));
//				constraints.add(new XeqC(val[1], 0));
//				constraints.add(new XeqC(val[0], 0));
//				break;
//			case 3:	
//				constraints.add(new XeqC(val[3], 1));
//				constraints.add(new XeqC(val[2], 1));
//				constraints.add(new XeqC(val[1], 0));
//				constraints.add(new XeqC(val[0], 0));
//				break;
//			case 4: case 5: case 6: //Not assigning initial evaluation labels for these values.
//				break;
//			default: 
//				break;
//		}
//	}

//	private static PrimitiveConstraint[] genericCreateConstantCondition(int evaluation, BooleanVar[] val){
//		switch (evaluation) {
//		case 0:	
//			PrimitiveConstraint[] tempFD = {new XeqC(val[3], 0), new XeqC(val[2], 0), new XeqC(val[1], 1), new XeqC(val[0], 1)};
//			return tempFD;
//		case 1:	
//			PrimitiveConstraint[] tempPD = {new XeqC(val[3], 0), new XeqC(val[2], 0), new XeqC(val[1], 1), new XeqC(val[0], 0)};
//			return tempPD;
//		case 2:	
//			PrimitiveConstraint[] tempPS = {new XeqC(val[3], 0), new XeqC(val[2], 1), new XeqC(val[1], 0), new XeqC(val[0], 0)};
//			return tempPS;
//		case 3:	
//			PrimitiveConstraint[] tempFS = {new XeqC(val[3], 1), new XeqC(val[2], 1), new XeqC(val[1], 0), new XeqC(val[0], 0)};
//			return tempFS;					
//		}
//		return null;
//	}
//	

	*/
