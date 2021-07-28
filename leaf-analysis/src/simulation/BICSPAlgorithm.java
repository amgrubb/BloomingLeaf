package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.jacop.constraints.*;
import org.jacop.core.*;
import org.jacop.satwrapper.SatTranslation;
import org.jacop.search.*;

public class BICSPAlgorithm {
	// Elements needed for the CSP Solver
	private Store store;									// CSP Store
	private SatTranslation sat;								// Enables a SAT solver to be incorporated into CSP
	private boolean searchAll = false;						// Flag for the solver to return the first solution or all solutions.

	private enum SearchType {PATH, NEXT_STATE};
	private SearchType problemType = SearchType.PATH;

	private ModelSpec spec;									// Holds the model information.
	private int maxTime;									// duplicated from spec to create shortcut for code.
	private IntVar zero;									// (0) Initial Values time point.
	private IntVar infinity;								// (maxTime + 1) Infinity used for intention functions, not a solved point.
	private Intention[] intentions;							// array of intention elements in the model

	// Problem Size: (numIntentions x numTimePoints x 4) + numTimePoints
	private int numTP;										// Total number of time points in the path (to be calculated).
	private int numIntentions;								// Number of intentions in the model.
	
	// Problem Variables:
	private BooleanVar[][][] values;						// ** Holds the evaluations for each [this.numIntentions][this.numTimePoints][FS/PS/PD/FD Predicates]
	
	

//    private IntVar[] timePoints;							// Holds the list of time points to be solved. Names at T<A,R,E><Index>
//    private IntVar[] epochs;								// Array of EB to be solved.
//    private HashMap<IntentionalElement, IntVar[]> functionEBCollection;	
//    														// Holds the EBs that are associated with a dynamic function for an intention.
//    private HashMap<EvolvingDecomposition, IntVar> decompEBCollection;	
//    private HashMap<EvolvingContribution, IntVar> contribEBCollection;	
//    														// Holds the EBs that are associated with a dynamic relationship.
//    private HashMap<NotBothLink, IntVar> notBothEBCollection;	
//															// Holds the EBs that are associated with a Not Both Link and dynamic relationship.    
//    private HashMap<IntVar, IntVar> epochToTimePoint;				// Mapping between assignedEBs and other constrained values. Used in initializeDynamicFunctions for unknown constants UD functions.

//    private IntVar[] unsolvedTimePoints;					// Holds the list of time points without an absolute assignment. 
//    private IntVar[] nextTimePoints;						// Holds the list of next possible time points. Does not include multiple stochastic or absolute. Used for finding state.
//    private IntVar nextTimePoint;							// Holds the single int value that will map to a value of nextTimePoints, to be solve by the solve if next state is used.
//    private IntVar minTimePoint;									// Is assigned the minimum time of nextTimePoints.
//
//	  private List<Constraint> constraints;
//	
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
		
		// Determine type of analysis
    	switch (spec.getAnalysisType()) {	
    	case "singlePath":
    		searchAll = false;
    		problemType = SearchType.PATH;
        	if (DEBUG) System.out.println("Analysis selected: singlePath");
    		break;
    	case "allNextStates":
    		searchAll = true;
    		problemType = SearchType.NEXT_STATE;
        	if (DEBUG) System.out.println("Analysis selected: allNextStates");
    		break;
    	default:
    		throw new Exception("User Error: User requested \'" + spec.getAnalysisType() + "\', no such scenario exists. ");
    	}
    	
		// Initialize Model Elements
		this.spec = spec;
		this.maxTime = spec.getMaxTime();
		this.zero = new IntVar(this.store, "Zero", 0, 0);
		this.infinity = new IntVar(this.store, "Infinity", this.maxTime + 1, this.maxTime + 1);

    	// Initialize intentions and store them in array.
    	this.numIntentions = this.spec.getNumIntentions();
		this.intentions = new Intention[this.numIntentions];
		List<Intention> elementList = this.spec.getIntentions();
		for (int i = 0; i < this.intentions.length; i++)
			this.intentions[i] = elementList.get(i);

		
    	
//		this.constraints = new ArrayList<Constraint>();		
//    	this.functionEBCollection = new HashMap<IntentionalElement, IntVar[]>();
//    	this.decompEBCollection = new HashMap<EvolvingDecomposition, IntVar>();
//    	this.contribEBCollection = new HashMap<EvolvingContribution, IntVar>();
//    	this.notBothEBCollection = new HashMap<NotBothLink, IntVar>();
//    	this.epochToTimePoint = new HashMap<IntVar, IntVar>(); 



    	//System.out.println(this.spec.getInitialValueTimePoints());
    	//System.out.println(this.spec.getInitialValues());
    	//TODO: Start here!!
    	if (DEBUG)
			System.out.println("Length of initialValueTimePoints: " + this.spec.getInitialValueTimePoints().length + 
					"\nLength of initialValues()[0]: " + this.spec.getInitialValues()[0].length);
    	if (this.spec.getInitialValueTimePoints().length != this.spec.getInitialValues()[0].length)
    		throw new Exception("Input Error: The length of initialValueTimePoints and initialValues[0] do not match.");

		// Determine the number of observation steps.
		// Add constraints between Intention EBs.
//    	calculateSampleSizeAndCreateEBsAndTimePoints(this.spec.getAbsoluteTimePoints(), 
//    			this.spec.getRelativeTimePoints(), this.spec.getInitialValueTimePoints(), 
//    			this.spec.getInitialAssignedEpochs());
    	
//    	// Initialise Values Array.
//    	int lengthOfInitial = this.spec.getInitialValueTimePoints().length;
//    	if (problemType == SearchType.PATH)
//    		this.values = new BooleanVar[this.numIntentions][this.numTimePoints][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS
//    	else if (problemType == SearchType.NEXT_STATE)
//    		this.values = new BooleanVar[this.numIntentions][lengthOfInitial + 1][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS;
//    	else if (problemType == SearchType.CURRENT_STATE)
//    		this.values = new BooleanVar[this.numIntentions][1][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS;
//
//    	if (DEBUG)
//    		System.out.println("\nMethod: initializeBooleanVarForValues();");
//    	
//    	// Initialise values.
//    	// Add F->P invariant.
//    	initializeBooleanVarForValues();
//
//    	if (DEBUG)
//    		System.out.println("\nMethod: initializeConflictPrevention();");
//    	
//    	// Prevent Conflict
//   		initializeConflictPrevention();
//
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
//        
    	if (DEBUG)	System.out.println("\nEnd of Init Procedure");	
		
	}
	
	
	
}
