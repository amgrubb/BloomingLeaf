/**
 * 
 */
package simulation;

import java.util.Random;

/**
 * @author A.M.Grubb
 *
 */
public class IntentionalElement extends LinkableElement {
    // OBJECT VARIABLES
	ModelSpec iStarSpec;
	Actor actor = null;
	IntentionalElementType type = IntentionalElementType.GOAL;
	IntentionalElementDynamicType dynamicType = IntentionalElementDynamicType.NT;
	DecompositionType decompositionType = DecompositionType.AND;
	
	boolean staticIntention = false;
	int dynamicFunctionMarkedValue = 6;
	int epochBoundary = 0;
	
	boolean userDefinedDynamicType = false;
	UDFunction intUDFunct = null;
	
	UDFunctionCSP cspUDFunct = null;
	
	public int getIdNum() {
		return Integer.parseInt(id);
	}
	
	public DecompositionType getDecompositionType() {
		return decompositionType;
	}
	public void setDecompositionType(DecompositionType decompositionType) {
		this.decompositionType = decompositionType;
	}	
	public Actor getActor() {
		return actor;
	}
	public IntentionalElementType getType() {
		return type;
	}
	public IntentionalElementDynamicType getDynamicType() {
		return dynamicType;
	}
	public boolean isStaticIntention() {
		return staticIntention;
	}
	public boolean isUserDefinedDynamicType() {
		return userDefinedDynamicType;
	}
	public UDFunction getIntUDFunct() {
		return intUDFunct;
	}
	
	public UDFunctionCSP getCspUDFunct() {
		return cspUDFunct;
	}

	public void setUserDefinedDynamicType(String inputLine, int maxEpoch) {
		this.userDefinedDynamicType = true;
		this.dynamicType = IntentionalElementDynamicType.UD;
		this.intUDFunct = new UDFunction(this, inputLine, maxEpoch);
		this.cspUDFunct = new UDFunctionCSP(this, inputLine);
	}
	
	public void setDynamicType(IntentionalElementDynamicType dynamicType) {
		this.dynamicType = dynamicType;
		if (iStarSpec.getMaxEpoch() > 1){
			Random rand = new Random();
			this.epochBoundary = rand.nextInt(iStarSpec.getMaxEpoch() - 1);
		}

	}
	public int getEpochBoundary() {
		if (userDefinedDynamicType)
			return -1;
		else
			return epochBoundary;
	}
	public void setEpochBoundary(int epochBoundary) {
		if (!userDefinedDynamicType)
			this.epochBoundary = epochBoundary;
		else
			System.out.println("Error Assigning User-Defined: unknown epoch boundary.");
	}
	public int getDynamicFunctionMarkedValue() {
		if (userDefinedDynamicType)
			return -1;
		else
			return dynamicFunctionMarkedValue;
	}
	public void setDynamicFunctionMarkedValue(int dynamicFunctionMarkedValue) {
		if (!userDefinedDynamicType)
			this.dynamicFunctionMarkedValue = dynamicFunctionMarkedValue;
		else
			System.out.println("Error Assigning User-Defined: unknown epoch boundary value.");
	}
	
	public IntentionalElement(ModelSpec iStarSpec, String nodeID, String nodeName, Actor nodeActor, String nodeType, String nodeDynamicType, boolean isStatic){
		super(nodeID, nodeName);
		this.actor = nodeActor;
		this.iStarSpec = iStarSpec;
		this.type = IntentionalElementType.getByName(nodeType); 
		this.dynamicType = IntentionalElementDynamicType.getByCode(nodeDynamicType);
		this.staticIntention = isStatic;
	}
	public IntentionalElement(ModelSpec iStarSpec, String nodeID, String nodeName, Actor nodeActor, String nodeType, boolean isStatic){
		super(nodeID, nodeName);
		this.actor = nodeActor;
		this.iStarSpec = iStarSpec;
		this.type = IntentionalElementType.getByName(nodeType); 
		this.staticIntention = isStatic;
	}

}
	    
	   
//	    public int getValue(){
//	        return value;
//	    }
//	    public String getType(){
//	        return "NT";
//	    }
//
//	    public boolean isSteadyState(){
//	        return steadyState;
//	    }
//	    public void setSteadyState(boolean newState){
//	        steadyState = newState;
//	    }
//   
//	    // FUNCTION METHODS
//	    // Updates values, returns true if value changed. Should be extended by time variant nodes.
//	    public boolean nextTimeValue(){     // Next must be assigned a value if overloading this function.
//	        return false;
//
//	    }
//	    /*Combinations of Links: Elements in i* are often the destination of multiple types of links. "Hard" links (Decomposition, Means-Ends and Dependency) are combined using an AND of the final results of each link type. If Contribution and Dependency links share the same destination, the result of the Dependency links are treated as a Make contribution, considered with the other contributions in the label bag.*/
//	    /* This means that they have the label being propegrated forward.*/
//	    /* TODO: Deal with Cycles: Detecting Cycles: Goal models often contain cycles, values which indirectly contribute to themselves and may cause fluctuating values. Experience has shown
//	     that the presence of cycles becomes apparent to the evaluator after a few iterations. */
//	    // Updates the Propagation of values among nodes. Should not need to be extended by time nodes, only by AND and OR.
//	    public boolean propagateValues(){
//	        //int prop = value;
//	        boolean sourceSteady = true;
//	        // Big Scary Forward Propagation Algorithm
//	        if(linksAsTgt.isEmpty())
//	            return false;
//	        List<IntentionLink> depLinks = new ArrayList<IntentionLink>();
//	        List<IntentionLink> conLinks = new ArrayList<IntentionLink>();
//	        int[] labelBag;
//	        int[] lC = new int[NUM_STATE];
//	        int labelBagCounter = 0;
//	        int orgVal = value;
//	        
//	        for(ListIterator<IntentionLink> li = linksAsTgt.listIterator(); li.hasNext(); ){
//	            IntentionLink link = li.next();
//	            if ((link instanceof Dependency) || (link instanceof Decomposition) || (link instanceof MeansEnd))
//	                depLinks.add(link);
//	            else if (link instanceof Contribution)
//	                conLinks.add(link);
//	            else
//	                System.err.println("Error: The " + link.getType() + " from " + link.getSrc().getName() + " to " + this.name + " is invalid.");
//	        }
//	        
//	        // Case 0: There are no labels.
//	        if(depLinks.isEmpty() && conLinks.isEmpty()){
//	            return false;
//	        }else{
//	            labelBag = new int[depLinks.size() + conLinks.size()];
//	        }
//
//	        if(!(depLinks.isEmpty())){
//	            for(ListIterator<IntentionLink> i = depLinks.listIterator(); i.hasNext(); ){
//	                IntentionLink link = i.next();
//	                labelBag[labelBagCounter] = link.getSrc().getValue();   //depVal = Math.min(depVal, link.getSrc().getValue());
//	                labelBagCounter++;
//	                if(!link.getSrc().isSteadyState())
//	                    sourceSteady = false;
//	            }
//	        }
//	        if(!(conLinks.isEmpty())){
//	            for(ListIterator<IntentionLink> i = conLinks.listIterator(); i.hasNext(); ){
//	                IntentionLink link = i.next();
//	                labelBag[labelBagCounter] = ((Contribution)link).propegatedNextValue();   //conVal = Math.min(conVal, ((Contribution)link).propegatedNextValue());
//	                labelBagCounter++;
//	                if(!link.getSrc().isSteadyState())
//	                    sourceSteady = false;
//	            }
//	        }
//	        
//	        if (sourceSteady && !timedIntention)
//	            this.steadyState = true;
//	        
//	        // Case 1: The bag has only one label : {<v, es>} -> the label: v.
//	        if (labelBag.length == 1)
//	            if (labelBag[0] != value){
//	                value = labelBag[0];
//	                return true;
//	            }else
//	                return false;
//	        
//	        for (int i = 0; i < lC.length; i++)
//	            lC[i] = 0;
//	        for (int i = 0; i < labelBag.length; i++)
//	            lC[labelBag[i]]++;
//	        
//	        
//	        // Case 2 and 3: The bag has multiple full labels of the same polarity, and no other labels. & All labels in the bag are of the same polarity, and a full label is present.
//	        // Note: Case 2 is a subset of case 3.
//	        // Note: Will need to change if the number of labels change.
//
//	        // All the labels are the same.
//	        if((lC[0] > 0) && (lC[1] == 0) && (lC[3] == 0) && (lC[4] == 0))
//	            value = 0;
//	        else if((lC[0] == 0) && (lC[1] > 0) && (lC[3] == 0) && (lC[4] == 0))
//	            value = 1;
//	        else if((lC[0] == 0) && (lC[1] == 0) && (lC[3] > 0) && (lC[4] == 0))
//	            value = 3;
//	        else if((lC[0] == 0) && (lC[1] == 0) && (lC[3] == 0) && (lC[4] > 0))
//	            value = 4;
//	        else if((lC[0] == 0) && (lC[1] == 0) && (lC[3] == 0) && (lC[4] == 0))
//	            value = 2;
//	        else if((lC[0] > 0) && (lC[3] == 0) && (lC[4] == 0))
//	            value = 0;
//	        else if((lC[0] == 0) && (lC[1] == 0) && (lC[4] > 0))
//	            value = 4;
//	        else
//	            value = 2;
//	        
//	        // TODO: Figure out how to deal with case 4.
//	        // Case 4: The previous human judgment produced FS or FD, and a new contribution is of the same polarity. Result: FS or FD.
//	        return orgVal != value;
//	            
//	    }

