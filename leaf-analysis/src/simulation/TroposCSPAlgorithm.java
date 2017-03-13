package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;

import org.jacop.constraints.*;
import org.jacop.core.BooleanVar;
import org.jacop.core.IntVar;
import org.jacop.core.Store;
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
	
	private ModelSpec spec;									// Holds the model information.
	private int numIntentions;								// Number of intentions in the model.
	private IntentionalElement[] intentions;				// array of intention elements in the model
    
    private int maxTime;									// maxTime entered by the user
    private int numTimePoints;								// ??
    private int numEpochs = 0;								// ??
    private IntVar[] timePoints;							// Holds the list of time points to be solved. Names at T<A,R,E><Index>
    private IntVar[] epochs;								// ??
    private HashMap<IntentionalElement, IntVar[]> epochCollection;	// ??
    private HashMap<IntVar, IntVar> epochToTimePoint;				// ??
    private BooleanVar[][][] values;						// ** Holds the evaluations for each [this.numIntentions][this.numTimePoints][FS/PS/PD/FD Predicates]
    private IntVar zero;									// (0) Initial Values time point.
    private IntVar infinity;								// (maxTime + 1) Infinity used for intention functions, not a solved point.
    
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
    
	//Do not call this one directly. 
	public TroposCSPAlgorithm(ModelSpec spec) {
		// Initialise Store
		this.store = new Store();
		this.sat = new SatTranslation(this.store); 
		this.sat.impose();
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
    	this.epochCollection = new HashMap<IntentionalElement, IntVar[]>();
    	this.epochToTimePoint = new HashMap<IntVar, IntVar>(); 

		// Determine the number of observation steps.
		// Add constraints between Intention EBs.
    	calculateSampleSizeAndCreateEBsAndTimePoints(this.spec.getAbsoluteTimePoints(), this.spec.getRelativeTimePoints(), this.spec.getInitialValueTimePoints(), this.spec.getInitialAssignedEpochs());
    	
    	// Initialise Values Array
    	this.values = new BooleanVar[this.numIntentions][this.numTimePoints][4];	// 4 Predicates Values 0-FD, 1-PD, 2-PS, 3-FS

    	// Initialise values and add F->P invariant.
    	initializeBooleanVarForValues();

    	// Prevent Conflict
   		initializeConflictPrevention();

		// Add constraints for the links and structure of the graph.
    	genericAddLinkConstraints(this.sat, this.constraints, this.intentions, this.values);

    	// Create constraints for Dynamic Elements.
    	initializeDynamicFunctions();
	}	
	
	// Methods to create initial constraint model.
	private void calculateSampleSizeAndCreateEBsAndTimePoints(int[] absoluteTimePoint, int numStochasticTimePoints, int[] initialValueTimePoints, HashMap<String, Integer> assignedEpochs) {	//Full Model		
		List<IntVar> assignedEBs = new ArrayList<IntVar>();	//Holds the EB that have been assigned to an element in the absolute collection.
		
    	// Step 0: Create IntVars for absoluteTimePoints.
    	HashMap<Integer, IntVar> absoluteCollection = new HashMap<Integer, IntVar>();
    	int absoluteCounter;
    	if (absoluteTimePoint == null)
    		absoluteCounter = 1;
    	else{
    		for (int i = 0; i < absoluteTimePoint.length; i++){
    			absoluteCollection.put(new Integer(absoluteTimePoint[i]), new IntVar(store, "TA" + (i+1), absoluteTimePoint[i], absoluteTimePoint[i]));
    		}
    		absoluteCounter = absoluteTimePoint.length + 1;	//To add Zero.
    	}
		// Step 1: Collect and create all the Epoch IntVars.
		this.numEpochs = 0;
    	for (int i = 0; i < this.intentions.length; i++){
    		IntentionalElement element = this.intentions[i];
    		  		
        	if ((element.dynamicType == IntentionalElementDynamicType.NT) || (element.dynamicType == IntentionalElementDynamicType.CONST) ||
        			(element.dynamicType == IntentionalElementDynamicType.INC) || (element.dynamicType == IntentionalElementDynamicType.DEC) ||
        			(element.dynamicType == IntentionalElementDynamicType.RND))	// Dynamic function contains no EB.
        		continue;
        	else if ((element.dynamicType == IntentionalElementDynamicType.SD) || (element.dynamicType == IntentionalElementDynamicType.DS) ||
        			(element.dynamicType == IntentionalElementDynamicType.CR) || (element.dynamicType == IntentionalElementDynamicType.RC) ||
        			(element.dynamicType == IntentionalElementDynamicType.MONP) || (element.dynamicType == IntentionalElementDynamicType.MONN)) {
        		this.numEpochs ++;
        		IntVar newEpoch = new IntVar(store, "E" + element.getId(), 1, maxTime);	
        		this.epochCollection.put(element, new IntVar[]{newEpoch});
        	} else if (element.dynamicType == IntentionalElementDynamicType.UD){
        		UDFunctionCSP funcUD = element.getCspUDFunct();
        		char[] charEB = funcUD.getElementEBs();
        		IntVar[] epochsUD = new IntVar[charEB.length - 1];
        		this.numEpochs += epochsUD.length;
        		for (int u = 0; u < epochsUD.length; u++)
        			epochsUD[u] = new IntVar(store, "E" + element.getId() + "_" + charEB[u+1], 1, maxTime);
        		this.epochCollection.put(element, epochsUD);
        		for (int u = 1; u < epochsUD.length; u++)
        			constraints.add(new XltY(epochsUD[u-1], epochsUD[u]));       			

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
    	
    	// Step 2: Create constraints between epochs.
    	List<EpochConstraint> eConstraints = this.spec.getConstraintsBetweenEpochs();
    	
    	// (i) Get Absolute Assignments
    	for(ListIterator<EpochConstraint> ec = eConstraints.listIterator(); ec.hasNext(); ){		
    		EpochConstraint etmp = ec.next();
    		String eCont = etmp.getType();
    		if (eCont.equals("A")) {	//Absolute Time Point
    			IntVar[] srcArray = this.epochCollection.get(etmp.src);
    			IntVar src;
    			int etmpTime = etmp.getAbsoluteTime();
    			if (srcArray.length == 1)		//Could be helper function. TODO Deal with this helper function and UD functions!!!
    				src = srcArray[0];
    			else{
    				// TODO: Deal with Repeating UD Functions.
    				int val = (int)etmp.getSrcEB().charAt(0);	//Only considers A, B, C.. values.
   					src = srcArray[val - 65];
    			}
    			//Check if absolute value already exists.
    			IntVar absTemp = absoluteCollection.get(new Integer(etmpTime));
    			if (absTemp == null){
    				absTemp = new IntVar(store, "TA" + absoluteCounter, etmpTime, etmpTime);	//FIGURE OUT THIS LINE
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
    			IntVar[] srcArray = this.epochCollection.get(etmp.src);
    			IntVar[] destArray = this.epochCollection.get(etmp.dest);
    			IntVar src;
    			IntVar dest;
    			if (srcArray.length == 1)		//Could be helper function.
    				src = srcArray[0];
    			else{
    				// TODO: Deal with Repeating UD Functions.
    				int val = (int)etmp.getSrcEB().charAt(0);	//Only considers A, B, C.. values.
    				src = srcArray[val - 65];
    			}
    			if (destArray.length == 1)		//Could be helper function.
    				dest = destArray[0];
    			else{
    				// TODO: Deal with Repeating UD Functions.
    				int val = (int)etmp.getDestEB().charAt(0);	//Only considers A, B, C.. values.
    				dest = destArray[val - 65];
    			}

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
    				System.err.println("NULL FOUND....");
    		}
       	}
    	
    	// (iii) Get Less Than Statements
    	for(ListIterator<EpochConstraint> ec = eConstraints.listIterator(); ec.hasNext(); ){		
    		EpochConstraint etmp = ec.next();
    		String eCont = etmp.getType();
			if (eCont.equals("<")){
    			IntVar[] srcArray = this.epochCollection.get(etmp.src);
    			IntVar[] destArray = this.epochCollection.get(etmp.dest);
    			IntVar src;
    			IntVar dest;
    			if (srcArray.length == 1)		//Could be helper function.
    				src = srcArray[0];
    			else{
    				// TODO: Deal with Repeating UD Functions.
    				int val = (int)etmp.getSrcEB().charAt(0);	//Only considers A, B, C.. values.
   					src = srcArray[val - 65];
    			}
    			if (destArray.length == 1)		//Could be helper function.
    				dest = destArray[0];
    			else{
    				// TODO: Deal with Repeating UD Functions.
    				int val = (int)etmp.getDestEB().charAt(0);	//Only considers A, B, C.. values.
   					dest = destArray[val - 65];
    			}

    			if ((src != null) && (dest != null)){
    					constraints.add(new XltY(src, dest));
    			} else
    				System.err.println("NULL FOUND....");
			}
    	}
    	
    	// Step 3: Create time points for unassigned EBs.
    	// (i) Iterate over hash map and check if EB assigned.
    	// (i) TODO assign EB to epochs[]
    	List<IntVar> EBTimePoint = new ArrayList<IntVar>();	//Holds the time points for unassgned EBs.
    	this.epochs = new IntVar[this.numEpochs]; 
    	int addEBCount = 0;
    	for (int i = 0; i < this.intentions.length; i++){
    		IntentionalElement element = this.intentions[i];
    		IntVar[] elementEBs = epochCollection.get(element);
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
    	
    	// Step 4A: Make list of previous names.
    	// Double check the number of values added.
    	int countTotalPreviousT = 0;
    	String[] exisitingNamedTimePoints = new String[initialValueTimePoints.length];
    	int maxPreviousTime = initialValueTimePoints[initialValueTimePoints.length - 1];
    	if (initialValueTimePoints.length == 1)
    		exisitingNamedTimePoints[0] = "TA0";
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
    	System.out.print("Previous Times are: ");
    	for(int e = 0; e < exisitingNamedTimePoints.length; e++)
    		System.out.print(exisitingNamedTimePoints[e] + "\t");
    	System.out.println(" Max Previous is: " + maxPreviousTime);	
    	// Step 4B: Create List of Time Points
    	this.numTimePoints = 1 + absoluteCollection.size() + EBTimePoint.size() + numStochasticTimePoints;
    	
    	if(countTotalPreviousT != this.numTimePoints && countTotalPreviousT > 0)
    		System.err.println("Error: Previous and Current Time Points do no match.");
    	System.out.println("Previous Time Points: " + countTotalPreviousT + "  New Time Points: " + this.numTimePoints);
    	
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
    	// Add absoluteCollection   
		for (HashMap.Entry<Integer, IntVar> entry : absoluteCollection.entrySet()) {
		    Integer key = entry.getKey();
		    IntVar value = entry.getValue();
		    if(key > maxPreviousTime){
    			this.timePoints[tCount] = value;
    			tCount++;
		    }	    
		}
    	// Add EBs
    	for (IntVar value : EBTimePoint){
    		this.timePoints[tCount] = value;
    		tCount++;
    		constraints.add(new XgtC(value, maxPreviousTime));
    	}
    	// Add relative.
    	for (int i = 0; i < numStochasticTimePoints; i++){
    		if (tCount == this.timePoints.length)
    			System.out.println("ERROR");
    		this.timePoints[tCount] = new IntVar(store, "TR" + absoluteCounter, maxPreviousTime + 1, maxTime);
    		absoluteCounter++;
    		tCount++;
    	}
    	this.constraints.add(new Alldifferent(this.timePoints));
    }
	
	private void initializeBooleanVarForValues() {	//Full Model
		boolean[][][] initialValues = this.spec.getInitialValues();		
    	for (int i = 0; i < this.intentions.length; i++){
    		IntentionalElement element = this.intentions[i];
    		if(element.getIdNum() != i)
    			System.err.println("Intention ID does not match orderied ID in TroposCSP");

    		for (int t = 0; t < this.values[i].length; t++){
    			genericInitialNodeValues(this.store, this.sat, this.values[i][t], element.getId() + "_" + t);
    			// Initial initialValues.
    			if (t < initialValues[i].length){
    				this.constraints.add(new XeqC(this.values[i][t][0], boolToInt(initialValues[i][t][0])));
    				this.constraints.add(new XeqC(this.values[i][t][1], boolToInt(initialValues[i][t][1])));
    				this.constraints.add(new XeqC(this.values[i][t][2], boolToInt(initialValues[i][t][2])));
    				this.constraints.add(new XeqC(this.values[i][t][3], boolToInt(initialValues[i][t][3])));
    			}
    		}  
    	}
	}
	private int boolToInt(boolean b) {
	    return b ? 1 : 0;
	}
	
	private void initializeConflictPrevention(){	//Full Model
		char level = this.spec.getConflictAvoidLevel();
		if (level == 'N' || level == 'n')
			return;
		for (int i = 0; i < this.values.length; i++)
    		for (int t = 0; t < this.values[i].length; t++)
    			if (level == 'S' || level == 's')
    				genericStrongConflictPrevention(this.sat, this.values[i][t], this.zero);
    			else if (level == 'M' || level == 'm')
    				genericMediumConflictPrevention(this.sat, this.values[i][t], this.zero);
    			else if (level == 'W' || level == 'w')
    				genericWeakConflictPrevention(this.sat, this.values[i][t], this.zero);
	}
	
	private void initializeDynamicFunctions() {		//Full Model
    	for (int i = 0; i < this.intentions.length; i++){
    		IntentionalElement element = this.intentions[i];
    		IntentionalElementDynamicType tempType = element.dynamicType;
        	if ((tempType == IntentionalElementDynamicType.NT) || (element.dynamicType == IntentionalElementDynamicType.RND))
        		continue;
 
    		IntVar[] epochs = this.epochCollection.get(element);
    		//TODO: Fix this throughout algorithm.
    		int initialEvaluation;
    		boolean[] initialIntentionValues = this.spec.getInitialValues()[i][0];
    		if (initialIntentionValues[0] && initialIntentionValues[1] && !initialIntentionValues[2] && !initialIntentionValues[3])
    			initialEvaluation =  0;
    		else if (!initialIntentionValues[0] && initialIntentionValues[1] && !initialIntentionValues[2] && !initialIntentionValues[3])
    			initialEvaluation =  1; 
    		else if (!initialIntentionValues[0] && !initialIntentionValues[1] && initialIntentionValues[2] && !initialIntentionValues[3])
    			initialEvaluation =  2; 
    		else if (!initialIntentionValues[0] && !initialIntentionValues[1] && initialIntentionValues[2] && initialIntentionValues[3])
    			initialEvaluation =  3; 
    		else 
    			initialEvaluation =  5; 

    		int dynamicValue = element.oldGetDynamicFunctionMarkedValue();;

    		if (tempType == IntentionalElementDynamicType.CONST){
    			if (initialEvaluation == 5){
    				for (int t = 1; t < this.values[i].length; t++){
    					PrimitiveConstraint[] tempConstant = {
    							new XeqY(this.values[i][t][3], this.values[i][0][3]), 
    							new XeqY(this.values[i][t][2], this.values[i][0][2]),	
    							new XeqY(this.values[i][t][1], this.values[i][0][1]),
    							new XeqY(this.values[i][t][0], this.values[i][0][0])};
    					constraints.add(new And(tempConstant)); 
    				}
    			}else	// Has value between 0-3
    				for (int t = 0; t < this.values[i].length; t++)
    					genericAddAssignmentConstraint(this.constraints, initialEvaluation, this.values[i][t]);
    		} else if ((tempType == IntentionalElementDynamicType.INC) || (tempType == IntentionalElementDynamicType.MONP)){
    			if (tempType == IntentionalElementDynamicType.MONP){
    				for (int t = 0; t < this.values[i].length; t++){
    					PrimitiveConstraint[] tempDynValue = genericCreateConstantCondition(dynamicValue, this.values[i][t]);
    					if (tempDynValue == null){
    						System.err.println("MONP Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
            				break;
            			}
                		constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), 
                				new And(tempDynValue)));
            		}
            	}
      			for (int t = 0; t < this.values[i].length; t++)
      				for (int s = 0; s < this.values[i].length; s++){
      					if (t==s)
            				continue;
                		PrimitiveConstraint[] tFS = genericCreateConstantCondition(3, this.values[i][t]);
                		PrimitiveConstraint[] tPS = genericCreateConstantCondition(2, this.values[i][t]);
                		PrimitiveConstraint[] tPD = genericCreateConstantCondition(1, this.values[i][t]);
                		PrimitiveConstraint[] tFD = genericCreateConstantCondition(0, this.values[i][t]);
                		PrimitiveConstraint[] sFS = genericCreateConstantCondition(3, this.values[i][s]);
                		PrimitiveConstraint[] sPS = genericCreateConstantCondition(2, this.values[i][s]);
                		PrimitiveConstraint[] sPD = genericCreateConstantCondition(1, this.values[i][s]);
                		PrimitiveConstraint[] sFD = genericCreateConstantCondition(0, this.values[i][s]);
                		// Allow any next value.
            			// The dynamic function value is known at when creating solver equations.
                		switch (dynamicValue) {
            			case 0:	
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD)),
                					new And(sFD)));
            				break;
            			case 1:
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD)),
                					new And(sPD)));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD)),
                					new Or(new And(sPD), new And(sFD))));
                			break;
            			case 2:
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS)),
                					new And(sPS)));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD)),
                					new Or(new And(sPS), new And(sPD))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD)),
                					new Or(new And(sPS), new Or(new And(sPD), new And(sFD)))));
                			break;
            			case 3:
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                					new And(sFS)));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS)),
                					new Or(new And(sFS), new And(sPS))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD)),
                					new Or(new And(sFS), new Or(new And(sPS), new And(sPD)))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD)),
                					new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
                			break;
                		default:
                			System.err.println("INC Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                					new And(sFS)));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS)),
                					new Or(new And(sFS), new And(sPS))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD)),
                					new Or(new And(sFS), new Or(new And(sPS), new And(sPD)))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD)),
                					new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
                		}
            		}
        	} else if ((tempType == IntentionalElementDynamicType.DEC) || (tempType == IntentionalElementDynamicType.MONN)){
        		if (tempType == IntentionalElementDynamicType.MONN){
            		for (int t = 0; t < this.values[i].length; t++){
            			PrimitiveConstraint[] tempDynValue = genericCreateConstantCondition(dynamicValue, this.values[i][t]);
            			if (tempDynValue == null){
            				System.err.println("MONP Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
            				break;
            			}
                		constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), 
                				new And(tempDynValue)));
            		}
        		}
      			for (int t = 0; t < this.values[i].length; t++)
      				for (int s = 0; s < this.values[i].length; s++){
            			if (t==s)
            				continue;
                		PrimitiveConstraint[] tFS = genericCreateConstantCondition(3, this.values[i][t]);
                		PrimitiveConstraint[] tPS = genericCreateConstantCondition(2, this.values[i][t]);
                		PrimitiveConstraint[] tPD = genericCreateConstantCondition(1, this.values[i][t]);
                		PrimitiveConstraint[] tFD = genericCreateConstantCondition(0, this.values[i][t]);
                		PrimitiveConstraint[] sFS = genericCreateConstantCondition(3, this.values[i][s]);
                		PrimitiveConstraint[] sPS = genericCreateConstantCondition(2, this.values[i][s]);
                		PrimitiveConstraint[] sPD = genericCreateConstantCondition(1, this.values[i][s]);
                		PrimitiveConstraint[] sFD = genericCreateConstantCondition(0, this.values[i][s]);
                		// Allow any next value.
            			// The dynamic function value is known at when creating solver equations.
                		switch (dynamicValue) {
            			case 3:
                    		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                    				new And(sFS)));
                    		break;
            			case 2: 
                    		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                    				new Or(new And(sFS), new And(sPS))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS)),
                					new And(sPS)));            
                			break;
            			case 1:
                    		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                    				new Or(new And(sFS), new Or(new And(sPS), new And(sPD)))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS)),
                					new Or(new And(sPS), new And(sPD))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD)),
                					new And(sPD)));            				
            			case 0:
                    		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                    				new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS)),
                					new Or(new And(sFD), new Or(new And(sPS), new And(sPD)))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD)),
                					new Or(new And(sFD), new And(sPD))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD)),
                					new And(sFD)));
            				break;
                		default:
                			System.err.println("INC Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
                    		constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFS)),
                    				new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPS)),
                					new Or(new And(sFD), new Or(new And(sPS), new And(sPD)))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tPD)),
                					new Or(new And(sFD), new And(sPD))));
                			constraints.add(new IfThen(new And(new XltY(this.timePoints[t], this.timePoints[s]), new And(tFD)),
                					new And(sFD)));
                		}
            		}
        	} else if (tempType == IntentionalElementDynamicType.SD){
      			for (int t = 0; t < this.values[i].length; t++){
      				PrimitiveConstraint[] tempFS = genericCreateConstantCondition(3, this.values[i][t]);
      				PrimitiveConstraint[] tempFD = genericCreateConstantCondition(0, this.values[i][t]);
            		constraints.add(new IfThenElse(new XgtY(epochs[0], this.timePoints[t]), 
            				new And(tempFS),
            				new And(tempFD)));
            	}
        	} else if (tempType == IntentionalElementDynamicType.DS){
      			for (int t = 0; t < this.values[i].length; t++){
      				PrimitiveConstraint[] tempFS = genericCreateConstantCondition(3, this.values[i][t]);
      				PrimitiveConstraint[] tempFD = genericCreateConstantCondition(0, this.values[i][t]);
            		constraints.add(new IfThenElse(new XgtY(epochs[0], this.timePoints[t]), 
            				new And(tempFD),
            				new And(tempFS)));
            	}    		
        	} else if (tempType == IntentionalElementDynamicType.RC){
      			for (int t = 0; t < this.values[i].length; t++){	// TODO This could be a helper function reused with MONP and MONN and UD
      				PrimitiveConstraint[] tempConstant = genericCreateConstantCondition(dynamicValue, this.values[i][t]);
      				if (tempConstant == null){
      					System.err.println("RC Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
      					break;
      				}
            		constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), 
            				new And(tempConstant)));
            	}    		
        	} else if (tempType == IntentionalElementDynamicType.CR){
      			for (int t = 0; t < this.values[i].length; t++){
      				PrimitiveConstraint[] tempConstant = genericCreateConstantCondition(initialEvaluation, this.values[i][t]);
      				if (tempConstant == null){
      					System.err.println("CR Initial Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
      					break;
      				}
      				constraints.add(new IfThen(new XgtY(epochs[0], this.timePoints[t]), 
            				new And(tempConstant)));
            	}    	
        	} else if (tempType == IntentionalElementDynamicType.UD){
				if (epochs == null){	// Assume at least one EB.
					System.err.println("UD functions must have at least one EB. Fix " + element.getId());
					continue;
				}
				//TODO: Fix UD function for Increase and Decreasing with MAX/MIN values.
        		UDFunction funcUD = element.getIntUDFunct();
        		if (!funcUD.isHasRepeat()){
        			//function does not repeat.
        			int numSegments = funcUD.getNumSegment();		//Segments not EBs
        			//IntVar[] epochs
        			String[] segmentDynamic = funcUD.getEpochBasicFunction();
        			int[] segmentDynamicValue = funcUD.getEpochMarkedValues();
        			IntVar segmentStart = null;
        			IntVar segmentEnd = null;
        			for (int nS = 0; nS < numSegments; nS ++){
        				if (nS == 0){
          					segmentStart = this.zero;
          					segmentEnd = epochs[0];
        				} else if (nS == numSegments - 1) {
          					segmentStart = epochs[nS - 1];
          					segmentEnd = this.infinity;
        				} else {
          					segmentStart = epochs[nS - 1];
          					segmentEnd = epochs[nS];
        				}
        				if (segmentDynamic[nS].equals(IntentionalElementDynamicType.CONST.getCode())){
        					if (segmentDynamicValue[nS] == 5){
        						// Get the value index for the start of the segment.
        						int startIndex = -1;
        						if (segmentStart == this.zero)
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
        						// If the value falls within the segment index assign it to the first value in the segment, creating a constant function of unknown value.
        						for (int t = 0; t < this.values[i].length; t++){
        							PrimitiveConstraint[] tempConstant = {
        									new XeqY(this.values[i][t][3], this.values[i][startIndex][3]), 
        									new XeqY(this.values[i][t][2], this.values[i][startIndex][2]),	
        									new XeqY(this.values[i][t][1], this.values[i][startIndex][1]),
        									new XeqY(this.values[i][t][0], this.values[i][startIndex][0])};
        							constraints.add(new IfThen(
        									new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
        									new And(tempConstant)));        		
        						}
        					}else{
        						for (int t = 0; t < this.values[i].length; t++){
        							PrimitiveConstraint[] tempConstant = genericCreateConstantCondition(segmentDynamicValue[nS], this.values[i][t]);
        							if (tempConstant == null){
        								System.err.println("UD Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
        								break;
        							}
        							constraints.add(new IfThen(
        									new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
        									new And(tempConstant)));
        						}
        					}
        				} else if (segmentDynamic[nS].equals(IntentionalElementDynamicType.INC.getCode())){	
        	      			for (int t = 0; t < this.values[i].length; t++)
        	      				for (int s = 0; s < this.values[i].length; s++){
        	      					if (t==s)
        	            				continue;
        	                		PrimitiveConstraint[] tFS = genericCreateConstantCondition(3, this.values[i][t]);
        	                		PrimitiveConstraint[] tPS = genericCreateConstantCondition(2, this.values[i][t]);
        	                		PrimitiveConstraint[] tPD = genericCreateConstantCondition(1, this.values[i][t]);
        	                		PrimitiveConstraint[] tFD = genericCreateConstantCondition(0, this.values[i][t]);
        	                		PrimitiveConstraint[] sFS = genericCreateConstantCondition(3, this.values[i][s]);
        	                		PrimitiveConstraint[] sPS = genericCreateConstantCondition(2, this.values[i][s]);
        	                		PrimitiveConstraint[] sPD = genericCreateConstantCondition(1, this.values[i][s]);
        	                		PrimitiveConstraint[] sFD = genericCreateConstantCondition(0, this.values[i][s]);
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
        	            		}
        	      			// If previous segement was constant carry value forward for first value.
        	      			if ((nS != 0) && (segmentDynamic[nS - 1].equals(IntentionalElementDynamicType.CONST.getCode()))){
            	      			for (int t = 0; t < this.values[i].length; t++){
            	      				PrimitiveConstraint[] tempConstant = genericCreateConstantCondition(segmentDynamicValue[nS - 1], this.values[i][t]);
            	      				if (tempConstant == null){
            	      					System.err.println("ns - 1 for UD Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
            	      					break;
            	      				}
            	            		constraints.add(new IfThen(
            	            				new XeqY(segmentStart, this.timePoints[t]),
            	            				new And(tempConstant)));
            	            	}
        	      			}
        				} else if (segmentDynamic[nS].equals(IntentionalElementDynamicType.DEC.getCode())){
        	      			for (int t = 0; t < this.values[i].length; t++)
        	      				for (int s = 0; s < this.values[i].length; s++){
        	            			if (t==s)
        	            				continue;
        	                		PrimitiveConstraint[] tFS = genericCreateConstantCondition(3, this.values[i][t]);
        	                		PrimitiveConstraint[] tPS = genericCreateConstantCondition(2, this.values[i][t]);
        	                		PrimitiveConstraint[] tPD = genericCreateConstantCondition(1, this.values[i][t]);
        	                		PrimitiveConstraint[] tFD = genericCreateConstantCondition(0, this.values[i][t]);
        	                		PrimitiveConstraint[] sFS = genericCreateConstantCondition(3, this.values[i][s]);
        	                		PrimitiveConstraint[] sPS = genericCreateConstantCondition(2, this.values[i][s]);
        	                		PrimitiveConstraint[] sPD = genericCreateConstantCondition(1, this.values[i][s]);
        	                		PrimitiveConstraint[] sFD = genericCreateConstantCondition(0, this.values[i][s]);
        	                		// Allow any next value.
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
        	            		}
        	      			// If previous segement was constant carry value forward for first value.
        	      			if ((nS != 0) && (segmentDynamic[nS - 1].equals(IntentionalElementDynamicType.CONST.getCode()))){
            	      			for (int t = 0; t < this.values[i].length; t++){
            	      				PrimitiveConstraint[] tempConstant = genericCreateConstantCondition(segmentDynamicValue[nS - 1], this.values[i][t]);
            	      				if (tempConstant == null){
            	      					System.err.println("ns - 1 for UD Dynamic Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
            	      					break;
            	      				}
            	            		constraints.add(new IfThen(
            	            				new XeqY(segmentStart, this.timePoints[t]),
            	            				new And(tempConstant)));
            	            	}
        	      			}        				
        				}
        				
        			}
        		}else{
        			// TODO: Deal with repeating Functions.
        		}
        	}
    	}
	}
	
	// Generic Functions
	private static void genericStrongConflictPrevention(SatTranslation satTrans, BooleanVar[] val, IntVar zero){
		BooleanVar[] sConflict = {val[0], val[3]};
		satTrans.generate_and(sConflict, zero);	        					
	}
	private static void genericMediumConflictPrevention(SatTranslation satTrans, BooleanVar[] val, IntVar zero){
		BooleanVar[] mConflict1 = {val[0], val[2]};
		BooleanVar[] mConflict2 = {val[1], val[3]};
		satTrans.generate_and(mConflict1, zero);	
		satTrans.generate_and(mConflict2, zero);	
	}
	private static void genericWeakConflictPrevention(SatTranslation satTrans, BooleanVar[] val, IntVar zero){
		BooleanVar[] wConflict = {val[1], val[2]};
		satTrans.generate_and(wConflict, zero);	        					
	}
	private static PrimitiveConstraint[] genericCreateConstantCondition(int evaluation, BooleanVar[] val){
		switch (evaluation) {
		case 0:	
			PrimitiveConstraint[] tempFD = {new XeqC(val[3], 0), new XeqC(val[2], 0), new XeqC(val[1], 1), new XeqC(val[0], 1)};
			return tempFD;
		case 1:	
			PrimitiveConstraint[] tempPD = {new XeqC(val[3], 0), new XeqC(val[2], 0), new XeqC(val[1], 1), new XeqC(val[0], 0)};
			return tempPD;
		case 2:	
			PrimitiveConstraint[] tempPS = {new XeqC(val[3], 0), new XeqC(val[2], 1), new XeqC(val[1], 0), new XeqC(val[0], 0)};
			return tempPS;
		case 3:	
			PrimitiveConstraint[] tempFS = {new XeqC(val[3], 1), new XeqC(val[2], 1), new XeqC(val[1], 0), new XeqC(val[0], 0)};
			return tempFS;					
		}
		return null;
	}
	private static void genericAddAssignmentConstraint(List<Constraint> constraintList, int initialEvaluation, BooleanVar[] val){
		switch (initialEvaluation) {
			case 0:	
				constraintList.add(new XeqC(val[3], 0));
				constraintList.add(new XeqC(val[2], 0));
				constraintList.add(new XeqC(val[1], 1));
				constraintList.add(new XeqC(val[0], 1));
				break;
			case 1:	
				constraintList.add(new XeqC(val[3], 0));
				constraintList.add(new XeqC(val[2], 0));
				constraintList.add(new XeqC(val[1], 1));
				constraintList.add(new XeqC(val[0], 0));
				break;
			case 2:	
				constraintList.add(new XeqC(val[3], 0));
				constraintList.add(new XeqC(val[2], 1));
				constraintList.add(new XeqC(val[1], 0));
				constraintList.add(new XeqC(val[0], 0));
				break;
			case 3:	
				constraintList.add(new XeqC(val[3], 1));
				constraintList.add(new XeqC(val[2], 1));
				constraintList.add(new XeqC(val[1], 0));
				constraintList.add(new XeqC(val[0], 0));
				break;
			case 4: case 5: case 6: //Not assigning initial evaluation labels for these values.
				break;
			default: 
				break;
		}
	}
	private static void genericAddLinkConstraints(SatTranslation satTrans, List<Constraint> constraints, IntentionalElement[] intentionsList, BooleanVar[][][] val){
    	for (int e = 0; e < intentionsList.length; e++){
    		IntentionalElement element = intentionsList[e];
    		int targetID = element.getIdNum();

    		if (element.getLinksDest().size() == 0) 
    			continue;    		
    		
       		//  Divides links into ArrayLists of their types.
    		//  Collect elements by type of links into different collections(And, Or, Dependency, Contribution).
    		List<IntentionalElement> andDecompositionElements = new ArrayList<IntentionalElement>(); 
    		List<IntentionalElement> orDecompositionElements = new ArrayList<IntentionalElement>(); 
    		List<IntentionalElement> dependencyElements = new ArrayList<IntentionalElement>(); 
    		List<IntentionalElement> contributionElements = new ArrayList<IntentionalElement>();  
    		List<ContributionType> contributionTypes = new ArrayList<ContributionType>();
    		for (ListIterator<ElementLink> linksIteratorDest = element.getLinksDest().listIterator(); linksIteratorDest.hasNext();){   //Return the list of elementlink
    			ElementLink link = (ElementLink) linksIteratorDest.next();
    			if (link.isActiveLink()){
    				if (link instanceof Decomposition){
    					if (((Decomposition)link).getDecomposition() ==  DecompositionType.AND){//element.getDecompositionType() == DecompositionType.AND){
    						andDecompositionElements.add((IntentionalElement) link.getSrc());
    					} else {
    						orDecompositionElements.add((IntentionalElement) link.getSrc());
    					}
    				} else if (link instanceof Dependency) {		
    					if(link.getSrc() instanceof IntentionalElement)
    						dependencyElements.add((IntentionalElement) link.getSrc()); 
    					else if (link.getSrc() instanceof Actor)
    						System.out.println("Actor Link found and ignored.");
    					else
    						System.err.println("Error: Unknown element found.");
    				} else if (link instanceof Contribution) {
    					contributionElements.add((IntentionalElement) link.getSrc());
    					contributionTypes.add(((Contribution) link).getContribution());
    				}	
    			}
    		}

    		/*********************************************************************************************
    		 * Forward Analysis
    		 *********************************************************************************************/
    		// Error case where there is both AND and OR Decomposition.
    		if ((andDecompositionElements.size() != 0) && (orDecompositionElements.size() != 0))
    			System.err.println("Error: Both AND & OR Decomposition Found for element ID: " + element.getId());
    		else if ((andDecompositionElements.size() != 0) || (orDecompositionElements.size() != 0)){   			
    			List<IntentionalElement> decompositionElements;
    			if (andDecompositionElements.size() != 0)
    				decompositionElements = andDecompositionElements;
    			else
    				decompositionElements = orDecompositionElements;    			
				int numLinks = decompositionElements.size();
				for (int t = 0; t < val[targetID].length; t++){
					BooleanVar[][] sourceValue = new BooleanVar[4][numLinks];
					for (int s = 0; s < numLinks; s++){
						sourceValue[3][s] = val[decompositionElements.get(s).getIdNum()][t][3];
						sourceValue[2][s] = val[decompositionElements.get(s).getIdNum()][t][2];
						sourceValue[1][s] = val[decompositionElements.get(s).getIdNum()][t][1];
						sourceValue[0][s] = val[decompositionElements.get(s).getIdNum()][t][0];
					}
					//Forward Rules (implies backwards rules as well.)
					if (andDecompositionElements.size() != 0){	//And Rules
						constraints.add(new AndBool(sourceValue[3], val[targetID][t][3]));
						constraints.add(new AndBool(sourceValue[2], val[targetID][t][2]));
						constraints.add(new OrBool(sourceValue[1], val[targetID][t][1]));
						constraints.add(new OrBool(sourceValue[0], val[targetID][t][0]));
					}else{  // Or Rules
						constraints.add(new OrBool(sourceValue[3], val[targetID][t][3]));
						constraints.add(new OrBool(sourceValue[2], val[targetID][t][2]));
						constraints.add(new AndBool(sourceValue[1], val[targetID][t][1]));
						constraints.add(new AndBool(sourceValue[0], val[targetID][t][0]));
					}
				}
    		} 
    		if (contributionElements.size() != 0) { 
    			int numLinks = contributionElements.size();	
    			for (int t = 0; t < val[targetID].length; t++){
    				for (int i = 0; i < numLinks; i++) {
    					int sourceID = contributionElements.get(i).getIdNum();
    					if (contributionTypes.get(i) == ContributionType.MAKE){ 					//++ 
    						satTrans.generate_implication(val[sourceID][t][3], val[targetID][t][3]);
    						satTrans.generate_implication(val[sourceID][t][2], val[targetID][t][2]);
    						satTrans.generate_implication(val[sourceID][t][1], val[targetID][t][1]);
    						satTrans.generate_implication(val[sourceID][t][0], val[targetID][t][0]);
    					}else if (contributionTypes.get(i) == ContributionType.HELP){				//+
    						satTrans.generate_implication(val[sourceID][t][2], val[targetID][t][2]);
    						satTrans.generate_implication(val[sourceID][t][1], val[targetID][t][1]);
    					}else if (contributionTypes.get(i) == ContributionType.HURT){				//-
    						satTrans.generate_implication(val[sourceID][t][2], val[targetID][t][1]);
    						satTrans.generate_implication(val[sourceID][t][1], val[targetID][t][2]);
    					}else if (contributionTypes.get(i) == ContributionType.BREAK){				//--
    						satTrans.generate_implication(val[sourceID][t][3], val[targetID][t][0]);	
    						satTrans.generate_implication(val[sourceID][t][2], val[targetID][t][1]);
    						satTrans.generate_implication(val[sourceID][t][1], val[targetID][t][2]);
    						satTrans.generate_implication(val[sourceID][t][0], val[targetID][t][3]);
    					}else if (contributionTypes.get(i) == ContributionType.MAKESAT){ 			//++S 
    						satTrans.generate_implication(val[sourceID][t][3], val[targetID][t][3]);
    						satTrans.generate_implication(val[sourceID][t][2], val[targetID][t][2]);
    					}else if (contributionTypes.get(i) == ContributionType.HELPSAT){			//+S
    						satTrans.generate_implication(val[sourceID][t][2], val[targetID][t][2]);
    					}else if (contributionTypes.get(i) == ContributionType.HURTSAT){			//-S
    						satTrans.generate_implication(val[sourceID][t][2], val[targetID][t][1]);
    					}else if (contributionTypes.get(i) == ContributionType.BREAKSAT){			//--S
    						satTrans.generate_implication(val[sourceID][t][3], val[targetID][t][0]);	
    						satTrans.generate_implication(val[sourceID][t][2], val[targetID][t][1]);
    					}else if (contributionTypes.get(i) == ContributionType.MAKEDEN){ 			//++D 
    						satTrans.generate_implication(val[sourceID][t][1], val[targetID][t][1]);
    						satTrans.generate_implication(val[sourceID][t][0], val[targetID][t][0]);
    					}else if (contributionTypes.get(i) == ContributionType.HELPDEN){			//+D
    						satTrans.generate_implication(val[sourceID][t][1], val[targetID][t][1]);
    					}else if (contributionTypes.get(i) == ContributionType.HURTDEN){			//-D
    						satTrans.generate_implication(val[sourceID][t][1], val[targetID][t][2]);
    					}else if (contributionTypes.get(i) == ContributionType.BREAKDEN){			//--D
    						satTrans.generate_implication(val[sourceID][t][1], val[targetID][t][2]);
    						satTrans.generate_implication(val[sourceID][t][0], val[targetID][t][3]);
    					}else if (contributionTypes.get(i) == ContributionType.NOTBOTH){
    						// Link not (A and B)
    						constraints.add(new Not(new And(new XeqC(val[sourceID][t][3], 1), new XeqC(val[targetID][t][3], 1))));
    						constraints.add(new Not(new And(new XeqC(val[sourceID][t][2], 1), new XeqC(val[targetID][t][2], 1))));
    						constraints.add(new Not(new And(new XeqC(val[sourceID][t][2], 1), new XeqC(val[sourceID][t][1], 1)))); //Stops weak conflicts at the source.
    						constraints.add(new Not(new And(new XeqC(val[targetID][t][2], 1), new XeqC(val[targetID][t][1], 1)))); //Stops weak conflicts at the target.
    					}else
    						System.out.println("ERROR: No rule for " + contributionTypes.get(i).toString() + " link type.");
    				}
    			}
    		}
    		if (dependencyElements.size() != 0) { 
    			int numLinks = dependencyElements.size();
    			for (int t = 0; t < val[targetID].length; t++){
    				for (int i = 0; i < numLinks; i++) {
    					int sourceID = dependencyElements.get(i).getIdNum();
    					satTrans.generate_implication(val[sourceID][t][3], val[targetID][t][3]);
    					satTrans.generate_implication(val[sourceID][t][2], val[targetID][t][2]);
    					satTrans.generate_implication(val[sourceID][t][1], val[targetID][t][1]);
    					satTrans.generate_implication(val[sourceID][t][0], val[targetID][t][0]);
    				}
    			}
    		}
    		
    		
    		
    		/*********************************************************************************************
    		 * Backward Analysis
    		 *********************************************************************************************/
    		// Already collected values...
//    		List<IntentionalElement> andDecompositionElements = new ArrayList<IntentionalElement>(); 
//    		List<IntentionalElement> orDecompositionElements = new ArrayList<IntentionalElement>(); 
//    		List<IntentionalElement> dependencyElements = new ArrayList<IntentionalElement>(); 
//    		List<IntentionalElement> contributionElements = new ArrayList<IntentionalElement>();  
//    		List<ContributionType> contributionTypes = new ArrayList<ContributionType>();
    		    		
    		// Iterate over each time step.
    		for (int t = 0; t < val[targetID].length; t++){
    			ArrayList<PrimitiveConstraint> FSConstaints = new ArrayList<PrimitiveConstraint>();
    			ArrayList<PrimitiveConstraint> PSConstaints = new ArrayList<PrimitiveConstraint>();
    			ArrayList<PrimitiveConstraint> PDConstaints = new ArrayList<PrimitiveConstraint>();
    			ArrayList<PrimitiveConstraint> FDConstaints = new ArrayList<PrimitiveConstraint>();
    			
    			// Construct lists of AND elements and OR elements.
    			if (andDecompositionElements.size() != 0){   			
    				PrimitiveConstraint[][] sourceANDValue = new PrimitiveConstraint[4][andDecompositionElements.size()];
    				for (int s = 0; s < andDecompositionElements.size(); s++){
    					sourceANDValue[3][s] = new XeqC(val[andDecompositionElements.get(s).getIdNum()][t][3], 1);
    					sourceANDValue[2][s] = new XeqC(val[andDecompositionElements.get(s).getIdNum()][t][2], 1);
    					sourceANDValue[1][s] = new XeqC(val[andDecompositionElements.get(s).getIdNum()][t][1], 1);
    					sourceANDValue[0][s] = new XeqC(val[andDecompositionElements.get(s).getIdNum()][t][0], 1);
    				}
    				FSConstaints.add(new And(sourceANDValue[3]));
    				PSConstaints.add(new And(sourceANDValue[2]));
    				PDConstaints.add(new Or(sourceANDValue[1]));
    				FDConstaints.add(new Or(sourceANDValue[0]));
    			}
    			if (orDecompositionElements.size() != 0){   			
    				PrimitiveConstraint[][] sourceORValue = new PrimitiveConstraint[4][orDecompositionElements.size()];
    				for (int s = 0; s < orDecompositionElements.size(); s++){
    					sourceORValue[3][s] = new XeqC(val[orDecompositionElements.get(s).getIdNum()][t][3], 1);
    					sourceORValue[2][s] = new XeqC(val[orDecompositionElements.get(s).getIdNum()][t][2], 1);
    					sourceORValue[1][s] = new XeqC(val[orDecompositionElements.get(s).getIdNum()][t][1], 1);
    					sourceORValue[0][s] = new XeqC(val[orDecompositionElements.get(s).getIdNum()][t][0], 1);
    				}
    				FSConstaints.add(new Or(sourceORValue[3]));
    				PSConstaints.add(new Or(sourceORValue[2]));
    				PDConstaints.add(new And(sourceORValue[1]));
    				FDConstaints.add(new And(sourceORValue[0]));
    			}
    			if (contributionElements.size() != 0) { 
    				int numLinks = contributionElements.size();	
    				for (int i = 0; i < numLinks; i++) {
    					int sourceID = contributionElements.get(i).getIdNum();
    					if (contributionTypes.get(i) == ContributionType.MAKE){ 					//++ 
    	    				FSConstaints.add(new XeqC(val[sourceID][t][3], 1));
    	    				PSConstaints.add(new XeqC(val[sourceID][t][2], 1));
    	    				PDConstaints.add(new XeqC(val[sourceID][t][1], 1));
    	    				FDConstaints.add(new XeqC(val[sourceID][t][0], 1));
    					}else if (contributionTypes.get(i) == ContributionType.HELP){				//+
    	    				PSConstaints.add(new XeqC(val[sourceID][t][2], 1));
    	    				PDConstaints.add(new XeqC(val[sourceID][t][1], 1));
    					}else if (contributionTypes.get(i) == ContributionType.HURT){				//-
    	    				PSConstaints.add(new XeqC(val[sourceID][t][1], 1));
    	    				PDConstaints.add(new XeqC(val[sourceID][t][2], 1));
    					}else if (contributionTypes.get(i) == ContributionType.BREAK){				//--
    	    				FSConstaints.add(new XeqC(val[sourceID][t][0], 1));
    	    				PSConstaints.add(new XeqC(val[sourceID][t][1], 1));
    	    				PDConstaints.add(new XeqC(val[sourceID][t][2], 1));
    	    				FDConstaints.add(new XeqC(val[sourceID][t][3], 1));
    					}else if (contributionTypes.get(i) == ContributionType.MAKESAT){ 			//++S 
    	    				FSConstaints.add(new XeqC(val[sourceID][t][3], 1));
    	    				PSConstaints.add(new XeqC(val[sourceID][t][2], 1));
    					}else if (contributionTypes.get(i) == ContributionType.HELPSAT){			//+S
    	    				PSConstaints.add(new XeqC(val[sourceID][t][2], 1));
    					}else if (contributionTypes.get(i) == ContributionType.HURTSAT){			//-S
    	    				PDConstaints.add(new XeqC(val[sourceID][t][2], 1));
    					}else if (contributionTypes.get(i) == ContributionType.BREAKSAT){			//--S
    	    				PDConstaints.add(new XeqC(val[sourceID][t][2], 1));
    	    				FDConstaints.add(new XeqC(val[sourceID][t][3], 1));
    					}else if (contributionTypes.get(i) == ContributionType.MAKEDEN){ 			//++D 
    	    				PDConstaints.add(new XeqC(val[sourceID][t][1], 1));
    	    				FDConstaints.add(new XeqC(val[sourceID][t][0], 1));
    					}else if (contributionTypes.get(i) == ContributionType.HELPDEN){			//+D
    	    				PDConstaints.add(new XeqC(val[sourceID][t][1], 1));
    					}else if (contributionTypes.get(i) == ContributionType.HURTDEN){			//-D
    	    				PSConstaints.add(new XeqC(val[sourceID][t][1], 1));
    					}else if (contributionTypes.get(i) == ContributionType.BREAKDEN){			//--D
    	    				FSConstaints.add(new XeqC(val[sourceID][t][0], 1));
    	    				PSConstaints.add(new XeqC(val[sourceID][t][1], 1));
    					}else if (contributionTypes.get(i) == ContributionType.NOTBOTH){
//    						// Link not (A and B)
//    						constraints.add(new Not(new And(new XeqC(val[sourceID][t][3], 1), new XeqC(val[targetID][t][3], 1))));
//    						constraints.add(new Not(new And(new XeqC(val[sourceID][t][2], 1), new XeqC(val[targetID][t][2], 1))));
//    						constraints.add(new Not(new And(new XeqC(val[sourceID][t][2], 1), new XeqC(val[sourceID][t][1], 1)))); //Stops weak conflicts at the source.
//    						constraints.add(new Not(new And(new XeqC(val[targetID][t][2], 1), new XeqC(val[targetID][t][1], 1)))); //Stops weak conflicts at the target.
    					}else
    						System.out.println("ERROR: No rule for " + contributionTypes.get(i).toString() + " link type.");

    				}

    			}
    			if (dependencyElements.size() != 0) { 
    				int numLinks = dependencyElements.size();
    				for (int i = 0; i < numLinks; i++) {
    					int sourceID = dependencyElements.get(i).getIdNum();
	    				FSConstaints.add(new XeqC(val[sourceID][t][3], 1));
	    				PSConstaints.add(new XeqC(val[sourceID][t][2], 1));
	    				PDConstaints.add(new XeqC(val[sourceID][t][1], 1));
	    				FDConstaints.add(new XeqC(val[sourceID][t][0], 1));
    				}

    			}
    			if (FSConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(val[targetID][t][3], 1), new Or(FSConstaints)));
    			if (PSConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(val[targetID][t][2], 1), new Or(PSConstaints)));
    			if (PDConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(val[targetID][t][1], 1), new Or(PDConstaints)));
    			if (FDConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(val[targetID][t][0], 1), new Or(FDConstaints)));
    		}
		}
	}
	private static void genericInitialNodeValues(Store store, SatTranslation satTrans, BooleanVar[] val, String nodeName){
		// Initialise BooleanVar
		val[0] = new BooleanVar(store, "N" + nodeName + "_FD");
		val[1] = new BooleanVar(store, "N" + nodeName + "_PD");
		val[2] = new BooleanVar(store, "N" + nodeName + "_PS");
		val[3] = new BooleanVar(store, "N" + nodeName + "_FS");
		
		// Create Invariant
		satTrans.generate_implication(val[3], val[2]);
		satTrans.generate_implication(val[0], val[1]);	
	}
	private static void genericInitialNextStateDynamics(List<Constraint> constraintList, IntentionalElement[] elementList, BooleanVar[][][] val, 
			HashMap<IntentionalElement, IntVar[]>  epochCollection, int currentAbsoluteTime){ // Assume only two time steps.
		// Assume only two time points, current with set values, and next state.
		for (int i = 0; i < elementList.length; i++){
			IntentionalElement element = elementList[i];
			IntentionalElementDynamicType tempType = element.dynamicType;
			if ((tempType == IntentionalElementDynamicType.NT) || (element.dynamicType == IntentionalElementDynamicType.RND))
				continue;

			IntVar[] epochs = epochCollection.get(element);
			//int initialEvaluation = this.strategy.getEvaluation(element).getEvaluation();
			int dynamicValue = element.oldGetDynamicFunctionMarkedValue();;

			if (tempType == IntentionalElementDynamicType.CONST){
				PrimitiveConstraint[] tempConstant = {	//Possible Helper
						new XeqY(val[i][1][3], val[i][0][3]), 
						new XeqY(val[i][1][2], val[i][0][2]),	
						new XeqY(val[i][1][1], val[i][0][1]),
						new XeqY(val[i][1][0], val[i][0][0])};
				constraintList.add(new And(tempConstant)); 
			}else if ((tempType == IntentionalElementDynamicType.INC) || (tempType == IntentionalElementDynamicType.MONP)){
				if (tempType == IntentionalElementDynamicType.MONP){
					if(epochs[0].value() <= currentAbsoluteTime){
						PrimitiveConstraint[] tempConstant = {	//Possible Helper
								new XeqY(val[i][1][3], val[i][0][3]), 
								new XeqY(val[i][1][2], val[i][0][2]),	
								new XeqY(val[i][1][1], val[i][0][1]),
								new XeqY(val[i][1][0], val[i][0][0])};
						constraintList.add(new And(tempConstant));
						continue;
					}
				}
				PrimitiveConstraint[] tFS = genericCreateConstantCondition(3, val[i][0]);
				PrimitiveConstraint[] tPS = genericCreateConstantCondition(2, val[i][0]);
				PrimitiveConstraint[] tPD = genericCreateConstantCondition(1, val[i][0]);
				PrimitiveConstraint[] tFD = genericCreateConstantCondition(0, val[i][0]);
				PrimitiveConstraint[] sFS = genericCreateConstantCondition(3, val[i][1]);
				PrimitiveConstraint[] sPS = genericCreateConstantCondition(2, val[i][1]);
				PrimitiveConstraint[] sPD = genericCreateConstantCondition(1, val[i][1]);
				PrimitiveConstraint[] sFD = genericCreateConstantCondition(0, val[i][1]);
				constraintList.add(new IfThen(new And(tFS),
						new And(sFS)));
				constraintList.add(new IfThen(new And(tPS),
						new Or(new And(sFS), new And(sPS))));
				constraintList.add(new IfThen(new And(tPD),
						new Or(new And(sFS), new Or(new And(sPS), new And(sPD)))));
				constraintList.add(new IfThen(new And(tFD),
						new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
			} else if ((tempType == IntentionalElementDynamicType.DEC) || (tempType == IntentionalElementDynamicType.MONN)){
				if (tempType == IntentionalElementDynamicType.MONN){
					if(epochs[0].value() <= currentAbsoluteTime){
						PrimitiveConstraint[] tempConstant = {	//Possible Helper
								new XeqY(val[i][1][3], val[i][0][3]), 
								new XeqY(val[i][1][2], val[i][0][2]),	
								new XeqY(val[i][1][1], val[i][0][1]),
								new XeqY(val[i][1][0], val[i][0][0])};
						constraintList.add(new And(tempConstant));
						continue;
					}
				}
				PrimitiveConstraint[] tFS = genericCreateConstantCondition(3, val[i][0]);
				PrimitiveConstraint[] tPS = genericCreateConstantCondition(2, val[i][0]);
				PrimitiveConstraint[] tPD = genericCreateConstantCondition(1, val[i][0]);
				PrimitiveConstraint[] tFD = genericCreateConstantCondition(0, val[i][0]);
				PrimitiveConstraint[] sFS = genericCreateConstantCondition(3, val[i][1]);
				PrimitiveConstraint[] sPS = genericCreateConstantCondition(2, val[i][1]);
				PrimitiveConstraint[] sPD = genericCreateConstantCondition(1, val[i][1]);
				PrimitiveConstraint[] sFD = genericCreateConstantCondition(0, val[i][1]);
				constraintList.add(new IfThen(new And(tFS),
						new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
				constraintList.add(new IfThen(new And(tPS),
						new Or(new And(sFD), new Or(new And(sPS), new And(sPD)))));
				constraintList.add(new IfThen(new And(tPD),
						new Or(new And(sFD), new And(sPD))));
				constraintList.add(new IfThen(new And(tFD),
						new And(sFD)));

			} else if (tempType == IntentionalElementDynamicType.SD){
				PrimitiveConstraint[] tempFS = genericCreateConstantCondition(3, val[i][1]);
				PrimitiveConstraint[] tempFD = genericCreateConstantCondition(0, val[i][1]);
				if(epochs[0].value() <= currentAbsoluteTime)
					constraintList.add(new And(tempFD));
				else{
					// TODO: Make Correct Function.
					constraintList.add(new Or(new And(tempFS), new And(tempFD)));
				}
			} else if (tempType == IntentionalElementDynamicType.DS){
				PrimitiveConstraint[] tempFS = genericCreateConstantCondition(3, val[i][1]);
				PrimitiveConstraint[] tempFD = genericCreateConstantCondition(0, val[i][1]);
				if(epochs[0].value() <= currentAbsoluteTime)
					constraintList.add(new And(tempFS));
				else{
					// TODO: Make Correct Function.
					constraintList.add(new Or(new And(tempFS), new And(tempFD)));
				} 		
			} else if (tempType == IntentionalElementDynamicType.RC){
				PrimitiveConstraint[] tempConstant = genericCreateConstantCondition(dynamicValue, val[i][1]);
				if (tempConstant == null){
					System.err.println("CR Initial Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
					break;
				}
				if(epochs[0].value() <= currentAbsoluteTime)
					constraintList.add(new And(tempConstant));

			} else if (tempType == IntentionalElementDynamicType.CR){
				// TODO: How do we do this with Epochs Boundaries.
				//      			for (int t = 0; t < val[i].length; t++){
				//      				PrimitiveConstraint[] tempConstant = genericCreateConstantCondition(initialEvaluation, val[i][t]);
				//      				if (tempConstant == null){
				//      					System.err.println("CR Initial Value for intention " + element.getId() + " has Unknown/None/Conflict value.");
				//      					break;
				//      				}
				//      				constraintList.add(new IfThen(new XgtY(epochs[0], this.timePoints[t]), 
				//            				new And(tempConstant)));
				//            	}    	
			} else if (tempType == IntentionalElementDynamicType.UD){
				if (epochs == null){	// Assume at least one EB.
					System.err.println("UD functions must have at least one EB. Fix " + element.getId());
					continue;
				}	
				UDFunction funcUD = element.getIntUDFunct();
				if (!funcUD.isHasRepeat()){
					//function does not repeat.
					String[] segmentDynamic = funcUD.getEpochBasicFunction();
					//int numSegments = funcUD.getNumSegment();		//Segments not EBs
					//int[] segmentDynamicValue = funcUD.getEpochMarkedValues();
					int nS = 0;
					for (int w = epochs.length - 1; w > 0; w--)
						if(epochs[w].value() <= currentAbsoluteTime){
							nS = w + 1;
							break;
						}
					if (segmentDynamic[nS].equals(IntentionalElementDynamicType.CONST.getCode())){
						PrimitiveConstraint[] tempConstant = {	//Possible Helper
								new XeqY(val[i][1][3], val[i][0][3]), 
								new XeqY(val[i][1][2], val[i][0][2]),	
								new XeqY(val[i][1][1], val[i][0][1]),
								new XeqY(val[i][1][0], val[i][0][0])};
						constraintList.add(new And(tempConstant)); 
					} else if (segmentDynamic[nS].equals(IntentionalElementDynamicType.INC.getCode())){	
						PrimitiveConstraint[] tFS = genericCreateConstantCondition(3, val[i][0]);
						PrimitiveConstraint[] tPS = genericCreateConstantCondition(2, val[i][0]);
						PrimitiveConstraint[] tPD = genericCreateConstantCondition(1, val[i][0]);
						PrimitiveConstraint[] tFD = genericCreateConstantCondition(0, val[i][0]);
						PrimitiveConstraint[] sFS = genericCreateConstantCondition(3, val[i][1]);
						PrimitiveConstraint[] sPS = genericCreateConstantCondition(2, val[i][1]);
						PrimitiveConstraint[] sPD = genericCreateConstantCondition(1, val[i][1]);
						PrimitiveConstraint[] sFD = genericCreateConstantCondition(0, val[i][1]);
						constraintList.add(new IfThen(new And(tFS),
								new And(sFS)));
						constraintList.add(new IfThen(new And(tPS),
								new Or(new And(sFS), new And(sPS))));
						constraintList.add(new IfThen(new And(tPD),
								new Or(new And(sFS), new Or(new And(sPS), new And(sPD)))));
						constraintList.add(new IfThen(new And(tFD),
								new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
					} else if (segmentDynamic[nS].equals(IntentionalElementDynamicType.DEC.getCode())){
						PrimitiveConstraint[] tFS = genericCreateConstantCondition(3, val[i][0]);
						PrimitiveConstraint[] tPS = genericCreateConstantCondition(2, val[i][0]);
						PrimitiveConstraint[] tPD = genericCreateConstantCondition(1, val[i][0]);
						PrimitiveConstraint[] tFD = genericCreateConstantCondition(0, val[i][0]);
						PrimitiveConstraint[] sFS = genericCreateConstantCondition(3, val[i][1]);
						PrimitiveConstraint[] sPS = genericCreateConstantCondition(2, val[i][1]);
						PrimitiveConstraint[] sPD = genericCreateConstantCondition(1, val[i][1]);
						PrimitiveConstraint[] sFD = genericCreateConstantCondition(0, val[i][1]);
						constraintList.add(new IfThen(new And(tFS),
								new Or(new Or(new And(sFS), new And(sPS)), new Or(new And(sPD), new And(sFD)))));
						constraintList.add(new IfThen(new And(tPS),
								new Or(new And(sFD), new Or(new And(sPS), new And(sPD)))));
						constraintList.add(new IfThen(new And(tPD),
								new Or(new And(sFD), new And(sPD))));
						constraintList.add(new IfThen(new And(tFD),
								new And(sFD)));
					}else{
						// TODO: Deal with repeating Functions.
					}
				}
			}
		}
	
	}
	
	
	
	
	private boolean genericFindSolution(boolean allSolutions, boolean singleState, Store store, Search<IntVar> label, List<Constraint> constraints, IntVar[] varList) {
		boolean foundSolution = false;
		//label = new DepthFirstSearch<IntVar>();
		if (allSolutions){
	        label.getSolutionListener().searchAll(true); 		// Do not need to search the whole space.			
		}else{
	        label.getSolutionListener().searchAll(false); 		// Do not need to search the whole space.
		}
		label.getSolutionListener().recordSolutions(true);	// Record steps in search.
        label.setPrintInfo(false); 							// Set to false if you don't want the CSP to print the solution as you go.

        //store.print();
        
        // Test and Add Constraints
        for (int i = 0; i < constraints.size(); i++) {
        	System.out.println(constraints.get(i).toString());
            store.impose(constraints.get(i));
            if(!store.consistency()) {
            	System.out.println("Constraint: " + constraints.get(i).toString());
                System.out.println("have conflicting constraints, not solvable");            
                return false;
            }
        }
        //this.store.print();
        //System.out.println("Start Solver");

        SelectChoicePoint <IntVar> select = new SimpleSelect<IntVar>(varList, new MostConstrainedDynamic<IntVar>(), new IndomainSimpleRandom<IntVar>());//new MostConstrainedStatic<IntVar>(), new IndomainSimpleRandom<IntVar>()); 
        foundSolution = label.labeling(store, select);

        return foundSolution;
	}
	
	
	// Methods for initial search.
	private IntVar[] createFullModelVarList(){
		if (this.spec.isSolveSingleState()){
			// Solve a single state.
			
			
			//boolean[][][] initialValues = this.spec.getInitialValues();
			//int numStates = initialValues[0].length;

			// TODO Finish this part.
			return new IntVar[0];
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
	private int[] createTimePointOrder() {
    	//Sort Time Points.
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
	private void printSingleSolution(int[] indexOrder) {
		// Print out timepoint data.
    	for (int i = 0; i < this.timePoints.length; i++){
    		System.out.print(this.timePoints[indexOrder[i]].id + "-" + this.timePoints[indexOrder[i]].value() + "\t");
   		}
    	System.out.println();
		
    	// Print out times.
    	System.out.print("Time:\t");
    	for (int i = 0; i < this.timePoints.length; i++){
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
	private void saveSolution(int[] indexOrder) {	
		int[] finalValueTimePoints = new int[this.timePoints.length];
    	for (int i = 0; i < this.timePoints.length; i++)
    		finalValueTimePoints[i] = this.timePoints[indexOrder[i]].value();
   		this.spec.setFinalValueTimePoints(finalValueTimePoints);
    	
   		boolean[][][] finalValues = new boolean[this.intentions.length][this.timePoints.length][4];
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
    	for (int i = 0; i < this.timePoints.length; i++)
    		finalAssignedEpochs.put(this.timePoints[indexOrder[i]].id, this.timePoints[indexOrder[i]].value());
    	this.spec.setFinalAssignedEpochs(finalAssignedEpochs);
	}
	
	// Methods for secondary search.
	@SuppressWarnings("unused")
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

			genericWeakConflictPrevention(satExplore, valuesExplore[i][1], zero);		// TODO: Select Appropriate conflict level.
			for (int j = 0; j < 4; j ++)
				constraintsExplore.add(new XeqC(valuesExplore[i][0][j], this.values[i][nodeIndex][j].value()));
			
		}
		genericAddLinkConstraints(satExplore, constraintsExplore, this.intentions, valuesExplore);
		genericInitialNextStateDynamics(constraintsExplore, this.intentions, valuesExplore, 
				this.epochCollection, currentTime);

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
	
	
	
		
	private static final String FILENAME = "stored-models/simple-AND"; //stored-models/testEB-Values"; //stored-models/simple-AND"; //models/UD-fuc-repeat.leaf"; //city-tropos-2.leaf"; //backward-test-helps.leaf"; //city-tropos-2.leaf";	 //sebastiani-fig1.leaf"; 
	public static void main(String[] args) {
		try {
			// Version 3
			String filename = "";
			ModelSpec model = null;

			filename = FILENAME;
			model = new ModelSpec(filename);
			if (model != null){
				model.setSolveAllSolutions(false);		// 
				model.setSolveSingleState(false);		// false -> solve path
				
				TroposCSPAlgorithm algo = new TroposCSPAlgorithm(model);
				Search<IntVar> label = new DepthFirstSearch<IntVar>();
				if(!algo.genericFindSolution(model.isSolveAllSolutions(), model.isSolveSingleState(), algo.store, label, algo.constraints, algo.createFullModelVarList()))
					System.out.println("Found Solution = False");
				else{
					System.out.println("Found Solution = True");
					
					//TODO: What happens with output of each of the four cases.
					int[] timeOrder = algo.createTimePointOrder();
					algo.printSingleSolution(timeOrder);
					algo.saveSolution(timeOrder);
				}
			}			
			
//			// Version 2
//			String filename = "";
//			ModelSpec model = null;
//
//			filename = FILENAME;
//			model = new ModelSpec(filename);
//			if (model != null){
//				TroposCSPAlgorithm algo = new TroposCSPAlgorithm(model);
//				Search<IntVar> label = new DepthFirstSearch<IntVar>();
//				if(!algo.oldGenericFindSolution(false, algo.store, label, algo.constraints, algo.createFullModelVarList()))
//					System.out.println("Found Solution = False");
//				else {
//					System.out.println("Found Solution = True");
//					int[] timeOrder = algo.createTimePointOrder();
//					algo.printSingleSolution(timeOrder);
//					algo.saveSolution(timeOrder);
//					
//					if (allowExplore){
//						System.out.println("\nEnter the time step number you would like to explore (or enter to exit):");
//						BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(System.in));
//						String selection = bufferedReader.readLine();					
//						if (!selection.equals("")){
//							int numChoice = Integer.parseInt(selection);
//							
//							// Update Values in the model.
//							int[] newValueTimePoints = new int[numChoice + 1];
//							boolean[][][] newValues = new boolean[model.getNumIntentions()][numChoice + 1][4];
//							for (int i = 0; i < numChoice + 1; i++){
//								newValueTimePoints[i] = model.getFinalValueTimePoints()[i];
//								for(int j = 0; j < model.getNumIntentions(); j++)
//									newValues[j][i] = model.getFinalValues()[j][i];
//							}
//							model.setInitialAssignedEpochs(model.getFinalAssignedEpochs());
//							model.setInitialValueTimePoints(newValueTimePoints);
//							model.setInitialValues(newValues);
//
//							model.setFinalAssignedEpochs(null);
//							model.setFinalValues(null);
//							model.setFinalAssignedEpochs(null);
//
//							// Get a new rest of the simulation.
//							TroposCSPAlgorithm algo2 = new TroposCSPAlgorithm(model);
//							Search<IntVar> label2 = new DepthFirstSearch<IntVar>();
//							if(!algo2.oldGenericFindSolution(false, algo2.store, label2, algo2.constraints, algo2.createFullModelVarList()))
//								System.out.println("Found Solution = False");
//							else {
//								System.out.println("Found Solution = True");
//								int[] timeOrder2 = algo2.createTimePointOrder();
//								algo2.printSingleSolution(timeOrder2);
//								algo2.saveSolution(timeOrder2);
//							}
//							
//							//algo.exploreState(numChoice, timeOrder);
//						}
//					}
//				}
//			}
			
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
}
