/**
 * 
 */
package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import gson_classes.BIConstraint;
//import interface_objects.IOIntention;
//import interface_objects.IOStateModel;
//import interface_objects.OutputElement;
//import interface_objects.OutputModel;


/**
 * @author amgrubb
 *
 */
public class ModelSpec {
	private List<Actor> actors = new ArrayList<Actor>();
	private List<Intention> intentions = new ArrayList<Intention>();
	private List<ContributionLink> contributionLinks = new ArrayList<ContributionLink>();
	private List<DecompositionLink> decompositionLinks = new ArrayList<DecompositionLink>();
	private List<NotBothLink> notBothLink = new ArrayList<NotBothLink>();
	private List<Constraint> constraints = new ArrayList<Constraint>();
	
	// Store the names of any time point names that are changed for reference.
	//		Original -> MergedTP/Element
	private HashMap<String, String> changedTPNames  = new HashMap<String, String>();
	private HashMap<String, AbstractElement> changedTPElements = new HashMap<String, AbstractElement>();
	
	// To Be Removed
//	private List<IntentionalElement> intElements = new ArrayList<IntentionalElement>();
//	private List<Contribution> contribution = new ArrayList<Contribution>();
//	private List<Decomposition> decomposition = new ArrayList<Decomposition>();
//	private List<EvolvingContribution> evolvingContribution = new ArrayList<EvolvingContribution>();
//	private List<EvolvingDecomposition> evolvingDecomposition = new ArrayList<EvolvingDecomposition>();
//	private List<UserEvaluation> userEvaluations = new ArrayList<UserEvaluation>();
//	private List<EpochConstraint> constraintsBetweenEpochs = new ArrayList<EpochConstraint>();
 
	
	private String analysisType = null;
	private char conflictAvoidLevel = 'N'; 			// Should have the value S/M/W/N for Strong, Medium, Weak, None.
    private int maxTime = 5;
    private int relativeTimePoints = 0;
    //private int[] absoluteTimePoints = null;
    private HashMap<String, Integer> absTP = new HashMap<String, Integer>();
    

    //	private String inputFilename = "";
    //private int[][][] history;	//TODO: Is this used? Is it left over from GrowingLeaf?
    
   //TODO: Merge with initialTimePoint function.
    private HashMap<String, Integer> initialAssignedEpochs; //Hash map to hold the epochs with assigned values.
    
    
    private int[] initialValueTimePoints = new int[] {0};		// Hold the assigned times for each of the initial Values. Should be same length of second paramater of initialValues;
    private boolean[][][] initialValues;		// Holds the initial values whether they are single or multiple.
    											//[this.numIntentions][this.numTimePoints][FD - index 0 / PD - index 1 / PS - index 2 / FS - index 3]
												// Note if model only has initial values then it will be [numintentions][1][4].
    private HashMap<String, boolean[][]> initialValuesMap; //TODO: Temporary or full replacement of initialValues. 

//    private int[] finalValueTimePoints = null;
//    private HashMap<String, Integer> finalAssignedEpochs = null;	 
//    // One of these will be filled.
//    private boolean[][][] finalValues = null;	 // For single Solution    
//    private boolean[][][][] allSolutionsValues;	 // For all solutions.

    public ModelSpec(){
    }
    
    // ************* INTERESTING GETTERS/SETTERS ************* 
	public int getNumIntentions() {
		return this.intentions.size();
	}
    
    public void setAbsoluteTimePoints(int[] absoluteTimePoints) {
    	absTP.put("Initial", 0);		// Add Zero
    	for (int i = 0; i < absoluteTimePoints.length; i++) {
    		absTP.put("TA" + (i), absoluteTimePoints[i]);
    	}
	}

	/** 
	 * Return the first Intention by its unique element ID
	 * @param elementId The id of the required element
	 * @return returns the intentional element if exist or null
	 */
	public Intention getIntentionByUniqueID(String elementId) {
		for(Intention iElement : this.intentions){
			if(iElement.getUniqueID().equals(elementId))
				return iElement;
		}
		return null;
	}
	
	/**
	 * Returns a link (decomposition/contribution) associated with the
	 * unique id provided 
	 * @param elementId unique id for link
	 * @return returns the element if exist or null
	 */
	private AbstractElementLink getLinkByUniqueID(String elementId) {
		for (DecompositionLink link : decompositionLinks) 
			if(link.isIDInDecompositionLink(elementId))
				return link;
		for (ContributionLink link : contributionLinks) 
			if(link.getUniqueID().equals(elementId))
				return link;
		return null;	
	}
	
	/**
	 * Returns a Not Both Function link associated with the
	 * unique id provided 
	 * @param elementId unique id for link
	 * @return returns the element if exist or null
	 */
	private NotBothLink getNBLinkByUniqueID(String elementId) {
		for (NotBothLink link : notBothLink) 
			if(link.getUniqueID().equals(elementId))
				return link;
		return null;	
	}
	
	/**
	 * Generic function to return an element based on it's unique id.
	 * Iterates through each type of element.
	 * @param uniqueID unique id for element
	 * @return returns the element if exist or null
	 */
	private AbstractElement getElementByUniqueID(String uniqueID) {
		AbstractElement element = null;
		element = getIntentionByUniqueID(uniqueID);
		if (element != null) 
			return element;
		element = getLinkByUniqueID(uniqueID);
		if (element != null) 
			return element;
		element = getNBLinkByUniqueID(uniqueID);
		if (element != null) 
			return element;
		return null;	
	}
	/**
	 * Return the time point associated for a link or function segment 
	 * @param element the model element of the desired time point
	 * @param initialTP FunctionSegment start with a character 0,A,B,C,etc.
	 * @return	the full name of the time point
	 */
	private String getRefTP(AbstractElement element, String initialTP) {
		if (element instanceof Intention)
			return ((Intention) element).getRealFuncSegTP(initialTP);
		else if (element instanceof AbstractElementLink)
			return ((AbstractElementLink) element).getLinkTP();
		else if (element instanceof NotBothLink)
			return ((NotBothLink) element).getLinkTP();
		else
			return null;	
	}

	/**
	 * Update the time point name when time points are being merged
	 * @param element the model element of the desired time point
	 * @param oldTP	the old time point value
	 * @param newTP the new time point value
	 * @return whether the function was able to find the old value and update it
	 */
	private boolean updateRefTP(AbstractElement element, String oldTP, String newTP) {
		if (element instanceof Intention)
			return ((Intention) element).updateRealFuncSegTP(oldTP, newTP);
		else if (element instanceof AbstractElementLink) {
			((AbstractElementLink) element).updateLinkTP(newTP);
			return true;
		} else if (element instanceof NotBothLink) {
			((NotBothLink) element).updateLinkTP(newTP);
			return true;
		} else
			return false;	
	}
	

    /**
     * Applies the input constraints BBM to the model spec.
     * Note: Can only be executed after all intentions, relationship, 
     * and function have been establish, then apply constraints.
     * @param constraints 	list of input constraint objects
     */
    public void applyConstraints(BIConstraint[] constraints){
    	List<BIConstraint> equalList = new ArrayList<BIConstraint>();
    	List<BIConstraint> lessThanList = new ArrayList<BIConstraint>();
    	for (BIConstraint item : constraints) {
    		if (item.getType().equals("="))
    			equalList.add(item);
    		else {
    			lessThanList.add(item);
    		}   		
    	}
    	
    	// Update refTPs for '=' constraints.
    	for (BIConstraint item : equalList) {    		
    		// Maybe have already been updated.
    		AbstractElement refEle1 = this.getElementByUniqueID(item.getSrcID());
    		AbstractElement refEle2 = this.getElementByUniqueID(item.getDestID());
			String refTP1 = this.getRefTP(refEle1, item.getSrcRefTP());
			String refTP2 = this.getRefTP(refEle2, item.getDestRefTP());			
			String mergeTP = refTP1 + "-" + refTP2;
			// Update refTP1
			if (!changedTPNames.containsValue(refTP1)) {
				if (this.updateRefTP(refEle1, refTP1, mergeTP)) {
					this.changedTPElements.put(refTP1, refEle1);
					this.changedTPNames.put(refTP1, mergeTP);
				}else
					throw new RuntimeException(); 
			}else {
				List<String> affectedKeys = new ArrayList<String>();
				for	(Map.Entry<String,String> entry : changedTPNames.entrySet()) {
					if (entry.getValue().equals(refTP1)) 
						affectedKeys.add(entry.getKey());
				}
				for	(String key : affectedKeys) {
					if (this.updateRefTP(this.changedTPElements.get(key), this.changedTPNames.get(key), mergeTP)) {
						//this.changedTPNames.remove(key);
						this.changedTPNames.put(key, mergeTP);
					}else
						throw new RuntimeException(); 
	
				}
			}
			// Update refTP2
			if (!changedTPNames.containsValue(refTP2)) {
				if (this.updateRefTP(refEle2, refTP2, mergeTP)) {
					this.changedTPElements.put(refTP2, refEle2);
					this.changedTPNames.put(refTP2, mergeTP);
				}else
					throw new RuntimeException(); 
			}else {
				List<String> affectedKeys = new ArrayList<String>();
				for	(Map.Entry<String,String> entry : changedTPNames.entrySet()) {
					if (entry.getValue().equals(refTP2)) 
						affectedKeys.add(entry.getKey());
				}
				for	(String key : affectedKeys) {
					if (this.updateRefTP(this.changedTPElements.get(key), this.changedTPNames.get(key), mergeTP)) {
						//this.changedTPNames.remove(key);
						this.changedTPNames.put(key, mergeTP);
					}else
						throw new RuntimeException(); 
	
				}
			}
    	}
    	
    	// Create constraint objects for '<' constraints.
    	for (BIConstraint item : lessThanList) {  
    		AbstractElement refEle1 = this.getElementByUniqueID(item.getSrcID());
    		AbstractElement refEle2 = this.getElementByUniqueID(item.getDestID());
			String refTP1 = this.getRefTP(refEle1, item.getSrcRefTP());
			String refTP2 = this.getRefTP(refEle2, item.getDestRefTP());
			if (refTP1 == null || refTP2 == null)
				throw new RuntimeException();  
			if (changedTPNames.containsKey(refTP1)) 
				refTP1 = changedTPNames.get(refTP1);
			if (changedTPNames.containsKey(refTP2)) 
				refTP2 = changedTPNames.get(refTP2);
			this.constraints.add(new Constraint(item.getType(), refEle1, refTP1, refEle2, refTP2));
    	}
    }   
    
    
    // ************* OTHER FUNCTIONS ************* 
    public HashMap<Integer, List<String>> getAbsTimePoints(){
    	HashMap<String, Integer> tpHash = getModelTimePoints();
    	
    	
    	HashMap<Integer, List<String>> absTPHashList = new HashMap<Integer, List<String>>();
    	List<String> nullList = new ArrayList<>();
    	//
    	
    	for (Map.Entry<String, Integer> set : tpHash.entrySet()) {
    		if (set.getValue() == null) {
    			nullList.add(set.getKey());
    		} else if (absTPHashList.containsKey(set.getValue())){
    			List<String> iTPList = absTPHashList.get(set.getValue());
    			iTPList.add(set.getKey());
    			absTPHashList.put(set.getValue(), iTPList);
    		} else {
    			List<String> iTPList = new ArrayList<>();
    			iTPList.add(set.getKey());
    			absTPHashList.put(set.getValue(), iTPList);
    		}    			
    	}
    	absTPHashList.put(-1, nullList);
    	return absTPHashList;
    }
    
    private HashMap<String, Integer> getModelTimePoints(){
    	HashMap<String, Integer> tpHash = new HashMap<String, Integer>();
    	tpHash.putAll(absTP);

    	for (Intention node : intentions) {
    		FunctionSegment[] segList = node.getEvolvingFunctions();
    		for (int i = 0; i < segList.length; i++)
    			addItemToHash(tpHash, segList[i].getStartTP(), segList[i].getStartAT());
    	}
    	for (DecompositionLink link : decompositionLinks) 
    		if (link.isEvolving())
    			addItemToHash(tpHash, link.getLinkTP(), link.getAbsTime());
    	for (ContributionLink link : contributionLinks) 
    		if (link.isEvolving())
    			addItemToHash(tpHash, link.getLinkTP(), link.getAbsTime());  
    	for (NotBothLink link : notBothLink) 
   			addItemToHash(tpHash, link.getLinkTP(), link.getAbsTime()); 
    	return tpHash;
    }
    
    //Helper function for getModelTimePoints() to avoid duplicate code.
    private void addItemToHash(HashMap<String, Integer> hash, String key, Integer value) {
    	if (!hash.containsKey(key))
    		hash.put(key, value);
    	else {
    		Integer oldVal = hash.get(key);
    		if (oldVal != value)
    			throw new RuntimeException();    		
    	}
    }
    
    //TODO: Reimplement
//	public OutputModel getOutputModel() {
//		OutputModel output = new OutputModel();
//    	// Print out Single Path Solotions.
//		if(getFinalValues() != null){
//	    	int i = -1;
//	    	for (IntentionalElement element : getIntElements()){
//	    		i++;
//	    		OutputElement outputElement = new OutputElement();
//	    		
//	    		//outputElement.setId(element.getId());
//	    		outputElement.setId(element.getUniqueID());
//	    		for (int t = 0; t < getFinalValues()[i].length; t++){
//	    			StringBuilder value = new StringBuilder();
//	    			for (int v = 0; v < getFinalValues()[i][t].length; v++){
//	        			if(getFinalValues()[i][t][v]){
//	        				value.append("1");
//	        			}else{
//	        				value.append("0");
//	        			}
//	        		}
//	        			outputElement.getStatus().add(value.toString());
//	    		}
//	    		output.getElementList().add(outputElement);
//	    	} 			
//		}
//		//Print out All Next States
//		if(getAllSolutionsValues() != null){
//
//			for(int i_states = 0; i_states < getAllSolutionsValues().length; i_states++){
//				IOStateModel statesModel = new IOStateModel();
//				for(int i_elements = 0; i_elements < getAllSolutionsValues()[i_states].length; i_elements++){
//					IOIntention ioIntention = new IOIntention();
//					String[] values = new String[getAllSolutionsValues()[i_states][i_elements].length];
//					for(int i_steps = 0; i_steps < getAllSolutionsValues()[i_states][i_elements].length; i_steps++){
//						StringBuilder value = new StringBuilder();
//						for (int v = 0; v < getAllSolutionsValues()[i_states][i_elements][i_steps].length; v++){
//		        			if(getAllSolutionsValues()[i_states][i_elements][i_steps][v]){
//		        				value.append("1");
//		        			}else{
//		        				value.append("0");
//		        			}
//		        		}
//						values[i_steps] = value.toString();		
//
//					}						
//					ioIntention.setId(Integer.toString(i_elements));
//        			ioIntention.setStatus(values);
//        			ioIntention.setType(getIntElements().get(i_elements).getType());
//        			if (getIntElements().get(i_elements).getActor() != null){
//            			ioIntention.setActorId(getIntElements().get(i_elements).getActor().getId());
//        			} else{
//        				ioIntention.setActorId("-");
//        			}
//    				statesModel.getIntentionElements().add(ioIntention);
//				}
//				output.getAllSolution().add(statesModel);
//			}
//		}
//		
//    	
//   		//Get final assigned epoch
//		if(getFinalAssignedEpochs() != null){
//			for (Map.Entry<String,Integer> entry : getFinalAssignedEpochs().entrySet()) {
//				String key = entry.getKey();
//				Integer value = entry.getValue();
//				output.getAssignedEpoch().add(key+"_"+value);
//			}
//		}
//
//		if(getFinalValueTimePoints() != null){
//			for(int a = 0; a < getFinalValueTimePoints().length; a++){
//				output.getTimePointPath().add(Integer.toString(getFinalValueTimePoints()[a]));
//			}	
//		}
//
//
//		return output;
//	}

	
	// ************* START OF GENERIC GETTERS AND SETTERS ************* 
//	public void setConstraintsBetweenTPs(BIConstraint[] constraintsBetweenTPs) {
//		this.constraintsBetweenTPs = constraintsBetweenTPs;
//	}

	public List<Intention> getIntentions() {
		return intentions;
	}

	public List<ContributionLink> getContributionLinks() {
		return contributionLinks;
	}

	public void setContributionLinks(List<ContributionLink> contributionLinks) {
		this.contributionLinks = contributionLinks;
	}

	public List<DecompositionLink> getDecompositionLinks() {
		return decompositionLinks;
	}

	public void setDecompositionLinks(List<DecompositionLink> decompositionLinks) {
		this.decompositionLinks = decompositionLinks;
	}

	public HashMap<String, boolean[][]> getInitialValuesMap() {
		return initialValuesMap;
	}

	public void setInitialValuesMap(HashMap<String, boolean[][]> initialValuesMap) {
		this.initialValuesMap = initialValuesMap;
	}

//	public List<UserEvaluation> getUserEvaluations() {
//		return userEvaluations;
//	}

//	public boolean[][][] getFinalValues() {
//		return finalValues;
//	}
//
//	public int[] getFinalValueTimePoints() {
//		return finalValueTimePoints;
//	}
//
//	public HashMap<String, Integer> getFinalAssignedEpochs() {
//		return finalAssignedEpochs;
//	}
//
//	public void setFinalValues(boolean[][][] finalValues) {
//		this.finalValues = finalValues;
//	}
//
//	public void setFinalValueTimePoints(int[] finalValueTimePoints) {
//		this.finalValueTimePoints = finalValueTimePoints;
//	}
//
//	public void setFinalAssignedEpochs(HashMap<String, Integer> finalAssignedEpochs) {
//		this.finalAssignedEpochs = finalAssignedEpochs;
//	}

	public int[] getInitialValueTimePoints() {
		return initialValueTimePoints;
	}

	public HashMap<String, Integer> getInitialAssignedEpochs() {
		return initialAssignedEpochs;
	}

	public void setInitialAssignedEpochs(HashMap<String, Integer> initialAssignedEpochs) {
		this.initialAssignedEpochs = initialAssignedEpochs;
	}

	public void setInitialValues(boolean[][][] initialValues) {
		this.initialValues = initialValues;
	}

	public void setInitialValueTimePoints(int[] initialValueTimePoints) {
		this.initialValueTimePoints = initialValueTimePoints;
	}

	public char getConflictAvoidLevel() {
		return conflictAvoidLevel;
	}

	public boolean[][][] getInitialValues() {
		return initialValues;
	}

	public List<Intention> getIntentionList() {
		return intentions;
	}

	public int getMaxTime() {
		return maxTime;
	}

	public void setMaxTime(int maxTime) {
		this.maxTime = maxTime;
	}

//	public List<EpochConstraint> getConstraintsBetweenEpochs() {
//		return constraintsBetweenEpochs;
//	}

//	public String getInputFilename() {
//		return inputFilename;
//	}

	public int getRelativeTimePoints() {
		return relativeTimePoints;
	}

//	public int[] getAbsoluteTimePoints() {
//		return absoluteTimePoints;
//	}

	public List<Actor> getActors() {
		return actors;
	}

	public void setActors(List<Actor> actors) {
		this.actors = actors;
	}

//	public List<Contribution> getContribution() {
//		return contribution;
//	}
//
//	public void setContribution(List<Contribution> contribution) {
//		this.contribution = contribution;
//	}
//
//	public List<Decomposition> getDecomposition() {
//		return decomposition;
//	}
//
//	public void setDecomposition(List<Decomposition> decomposition) {
//		this.decomposition = decomposition;
//	}

//	public int getNumActors() {
//		return numActors;
//	}
//
//	public void setNumActors(int numActors) {
//		this.numActors = numActors;
//	}

//	public int[][][] getHistory() {
//		return history;
//	}
//
//	public void setHistory(int[][][] history) {
//		this.history = history;
//	}

//	public void setIntElements(List<IntentionalElement> intElements) {
//		this.intElements = intElements;
//	}
//
//	public void setConstraintsBetweenEpochs(List<EpochConstraint> constraintsBetweenEpochs) {
//		this.constraintsBetweenEpochs = constraintsBetweenEpochs;
//	}

//	public void setNumIntentions(int numIntentions) {
//		this.numIntentions = numIntentions;
//	}
//
//	public void setInputFilename(String inputFilename) {
//		this.inputFilename = inputFilename;
//	}

	public void setRelativeTimePoints(int relativeTimePoints) {
		this.relativeTimePoints = relativeTimePoints;
	}

//	public void setAbsoluteTimePoints(int[] absoluteTimePoints) {
//		this.absoluteTimePoints = absoluteTimePoints;
//	}

	public void setConflictAvoidLevel(char conflictAvoidLevel) {
		this.conflictAvoidLevel = conflictAvoidLevel;
	}

//	public boolean[][][][] getAllSolutionsValues() {
//		return allSolutionsValues;
//	}
//
//	public void setAllSolutionsValues(boolean[][][][] allSolutionsValues) {
//		this.allSolutionsValues = allSolutionsValues;
//	}
//
//	public void setFinalAllSolutionsValues(boolean[][][][] finalValues2) {
//		this.allSolutionsValues = finalValues2;
//	}

	public List<NotBothLink> getNotBothLink() {
		return notBothLink;
	}

	public void setNotBothLink(List<NotBothLink> notBothLink) {
		this.notBothLink = notBothLink;
	}

//	public List<EvolvingContribution> getEvolvingContribution() {
//		return evolvingContribution;
//	}
//
//	public void setEvolvingContribution(List<EvolvingContribution> evolvingContribution) {
//		this.evolvingContribution = evolvingContribution;
//	}
//
//	public List<EvolvingDecomposition> getEvolvingDecomposition() {
//		return evolvingDecomposition;
//	}
//
//	public void setEvolvingDecomposition(List<EvolvingDecomposition> evolvingDecomposition) {
//		this.evolvingDecomposition = evolvingDecomposition;
//	}

	public String getAnalysisType() {
		return analysisType;
	}

	public void setAnalysisType(String analysisType) {
		this.analysisType = analysisType;
	}
	
}
