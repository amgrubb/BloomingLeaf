/**
 * 
 */
package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import gson_classes.BIConstraint;
import gson_classes.IOSolution;

/**
 * Hold the complete specification of the model.
 * @author amgrubb
 */
public class ModelSpec {
	// Model Elements
	private List<Actor> actors = new ArrayList<Actor>();
	private List<Intention> intentions = new ArrayList<Intention>();
	private List<ContributionLink> contributionLinks = new ArrayList<ContributionLink>();
	private List<DecompositionLink> decompositionLinks = new ArrayList<DecompositionLink>();
	private List<NotBothLink> notBothLink = new ArrayList<NotBothLink>();
	private List<ActorLink> actorLinks = new ArrayList<ActorLink>();

	// Cross-Element Model Variables
    private int maxTime = 5;
    private HashMap<String, Integer> absTP = new HashMap<String, Integer>();
    private List<TPConstraint> ltTPconstraints = new ArrayList<TPConstraint>();
    
	// Analysis Parameters
	private String analysisType = null;
	private char conflictAvoidLevel = 'N'; 			// Should have the value S/M/W/N for Strong, Medium, Weak, None.
    private int numRelativeTimePoints = 0;
    private IOSolution prevResult;
    
	// Store the names of any time point names that are changed for reference.
	//		Original -> MergedTP/Element
	private HashMap<String, String> changedTPNames  = new HashMap<String, String>();
	private HashMap<String, AbstractElement> changedTPElements = new HashMap<String, AbstractElement>();

	// Constructor of the Model
    public ModelSpec(){
    }
    
    // ************* INTERESTING GETTERS/SETTERS ************* 
    
	/**
	 * Returns the time point selected with the slider in the front end.
	 * This determines how next state and partial path analysis works.
	 * @return	The selected time point.
	 */
	public Integer getPrevSelectedTP() {
		if(this.prevResult != null && this.prevResult.getSelectedTimePoint() != null) 
			return this.prevResult.getSelectedTimePoint();
		return 0;
	}
	
    
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
    		//Note: '<' is now 'lt' and '=' is now 'eq'
    		if (item.getType().equals("=") || item.getType().equals("eq"))
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
			this.ltTPconstraints.add(new TPConstraint(refTP1, refTP2));
    	}
    }   
    
    
    // ************* OTHER FUNCTIONS ************* 
    public List<List<String>> getUDTimePointOrder(){
    	List<List<String>> orderedTimePoints = new ArrayList<List<String>>();
    	for (Intention node : intentions) {
    		FunctionSegment[] segList = node.getEvolvingFunctions();
    		if (segList.length > 2) {
    			List<String> segTPList = new ArrayList<String>();
    			for (int i = 0; i < segList.length; i++)
    				segTPList.add(segList[i].getStartTP());
    			orderedTimePoints.add(segTPList);
    		}
    	}
    	return orderedTimePoints;
    }
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

	
	// ************* START OF GENERIC GETTERS AND SETTERS ************* 

	public List<Intention> getIntentions() {
		return intentions;
	}
	
	public void setIntentions(List<Intention> intentions) {
		this.intentions = intentions;
	}
	
	public IOSolution getPrevResult() {
		return prevResult;
	}

	public void setPrevResult(IOSolution prevResult) {
		this.prevResult = prevResult;
	}

	public HashMap<String, String> getChangedTPNames() {
		return changedTPNames;
	}
	
	public void setChangedTPNames(HashMap<String, String> changedTPNames) {
		this.changedTPNames = changedTPNames;
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
	
	public List<NotBothLink> getNotBothLinks() {
		return notBothLink;
	}

	public void setNotBothLinks(List<NotBothLink> notBothLinks) {
		this.notBothLink = notBothLinks;
	}
	
	public List<NotBothLink> getNotBothLink() {
		return notBothLink;
	}

	public void setNotBothLink(List<NotBothLink> notBothLinks) {
		this.notBothLink = notBothLinks;
	}

	public List<TPConstraint> getLtTPconstraints() {
		return ltTPconstraints;
	}
	
	public void setLtTPconstraints(List<TPConstraint> ltTPconstraints) {
		this.ltTPconstraints = ltTPconstraints;
	}

	public char getConflictAvoidLevel() {
		return conflictAvoidLevel;
	}

	public int getMaxTime() {
		return maxTime;
	}

	public void setMaxTime(int maxTime) {
		this.maxTime = maxTime;
	}
	
	public HashMap<String, Integer> getAbsTP(){
		return this.absTP;
	}
	
	public void incrementAbsTP(Integer delta) {
		for (String key: absTP.keySet()) {
			absTP.put(key, absTP.get(key) + delta);
		}
	}
	
	public int getNumRelativeTimePoints() {
		return numRelativeTimePoints;
	}

	public List<Actor> getActors() {
		return actors;
	}

	public void setActors(List<Actor> actors) {
		this.actors = actors;
	}
	
	public List<ActorLink> getActorLinks() {
		return actorLinks;
	}

	public void setActorLinks(List<ActorLink> actorLinks) {
		this.actorLinks = actorLinks;
	}

	public void setNumRelativeTimePoints(int numRelativeTimePoints) {
		this.numRelativeTimePoints = numRelativeTimePoints;
	}

	public void setConflictAvoidLevel(char conflictAvoidLevel) {
		this.conflictAvoidLevel = conflictAvoidLevel;
	}

	public String getAnalysisType() {
		return analysisType;
	}

	public void setAnalysisType(String analysisType) {
		this.analysisType = analysisType;
	}
	
	/**
	 * get all the intentions at level 0
	 * @return
	 */
	public List<Intention> getActorlessIntentions(){
		List<Intention> actorlessIntentions = new ArrayList<Intention>();
		for(Intention intention: this.intentions) {
			if(!intention.hasActor()) actorlessIntentions.add(intention);
			else System.out.println(intention.getActor().getName());
		}
		return actorlessIntentions;
	}
	
}
