package simulation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jacop.constraints.*;
import org.jacop.core.BooleanVar;
import org.jacop.core.IntVar;

public class CSPLinks {
	private final static boolean DEBUG = true;
	
	/**
	 * Add the constraints across the links in the model.
	 * Includes forward and backwards analysis rules.
	 * Considers single and evolving intentions. 
	 */
	public static void initializeLinkConstraints(List<Constraint> constraints, 
			ModelSpec spec, Intention[] intentions, 
			BooleanVar[][][] values, HashMap<String, Integer> uniqueIDToValueIndex,
			IntVar[] timePoints, HashMap<IntVar, List<String>> timePointMap) {
				
		addForwardContribution(constraints, spec.getContributionLinks(), 
				values, uniqueIDToValueIndex, timePoints, timePointMap); 
		//addForwardDecomposition(constraints, spec.getDecompositionLinks(), 
		//		values, uniqueIDToValueIndex, timePoints, timePointMap); 
		
		//addBackward
	}
	
	
	/** Gets the CSP IntVar associated with a time point in the model. 
	 * @param timePointMap	Map between IntVar time points and a collection of named time points from the model
	 * @param name 	The time point name to fine.
	 * @return	The found CSP IntVar Time Point
	 */
	private static IntVar getTimePoint(HashMap<IntVar, List<String>> timePointMap, String name) {
		for (Map.Entry<IntVar, List<String>> entry : timePointMap.entrySet()) {
			for (String item : entry.getValue()) {
				if (item.equals(name))
					return entry.getKey();
			}
		}
		throw new RuntimeException("CSPLinks: getTimePoint - cannot find timepoint for " + name);
	}

	/*********************************************************************************************
	 * Forward Analysis
	 *********************************************************************************************/  
	private static void addForwardContribution(
			List<Constraint> constraints,
			List<ContributionLink> contributionLinks,
			BooleanVar[][][] values,  
			HashMap<String, Integer> uniqueIDToValueIndex,
			IntVar[] timePoints,
			HashMap<IntVar, List<String>> timePointMap) {

		for(ContributionLink link : contributionLinks) {
			int sourceID = uniqueIDToValueIndex.get(link.getZeroSrc().getUniqueID());
			int targetID = uniqueIDToValueIndex.get(link.getDest().getUniqueID());
			ContributionType pre = link.getPreContribution();
			if (!link.isEvolving()) {
				// No Evolution in Link. - Contribution without Evolution
				for (int t = 0; t < values[targetID].length; t++){
					constraints.add(createForwardContributionConstraint(pre, 
						values[sourceID][t], values[targetID][t]));
				}
			} else {
				// Evolving Contributions - must use time points.
				ContributionType post = link.getPostContribution();
				IntVar refTP = getTimePoint(timePointMap, link.getLinkTP());
	   			for (int t = 0; t < values[targetID].length; t++){
	   				PrimitiveConstraint preConstraint = null;
	   				if(pre != null)
	   					preConstraint = createForwardContributionConstraint(pre, values[sourceID][t], values[targetID][t]);
	   				PrimitiveConstraint postConstraint = null;
	   				if(post != null)
	   					postConstraint = createForwardContributionConstraint(post, values[sourceID][t], values[targetID][t]);
	   				if((pre != null) && (post != null))
	   					constraints.add(new IfThenElse(new XgtY(refTP, timePoints[t]), preConstraint, postConstraint));
	   				else if (pre != null)
	   					constraints.add(new IfThen(new XgtY(refTP, timePoints[t]), preConstraint));
	   				else if (post != null)	
	   					constraints.add(new IfThen(new XlteqY(refTP, timePoints[t]), postConstraint));
	   			}
				
				
			}
		}


		
	}

	private static void addForwardDecomposition(
			List<Constraint> constraints,
			List<ContributionLink> contributionLinks,
			BooleanVar[][][] values,  
			HashMap<String, Integer> uniqueIDToValueIndex,
			IntVar[] timePoints,
			HashMap<IntVar, List<String>> timePointMap) {
		
    	// Repeat process (forward and backward constraints) for each intention.

/*
    		Intention element = intentions[e];
    		
    		int targetID = element.getIdNum();

    		if (element.getLinksDest().size() == 0) 
    			continue;    		
    		
    		Decomposition decompositionLink = null;  
    		EvolvingDecomposition eDecompositionLink = null;
    		List<EvolvingContribution> eContributionLinks = new ArrayList<EvolvingContribution>();
    		List<Intentions> contributionElements = new ArrayList<Intentions>();  
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
*/
		
/*

    		// Step 1: Decomposition
    		// (a) Decomposition without Evolution
    		if (decompositionLink != null){
    			LinkableElement[] linkEle = decompositionLink.getSrc();
    			int numLinks = linkEle.length;
       			for (int t = 0; t < values[targetID].length; t++){
    				BooleanVar[][] sourceValue = new BooleanVar[4][numLinks];
    				for (int s = 0; s < numLinks; s++){
    					sourceValue[3][s] = values[linkEle[s].getIdNum()][t][3];
    					sourceValue[2][s] = values[linkEle[s].getIdNum()][t][2];
    					sourceValue[1][s] = values[linkEle[s].getIdNum()][t][1];
    					sourceValue[0][s] = values[linkEle[s].getIdNum()][t][0];
    				}
    				if (decompositionLink.getDecomposition() == DecompositionType.AND){	//And Rules
    					constraints.add(new AndBool(sourceValue[3], values[targetID][t][3]));
    					constraints.add(new AndBool(sourceValue[2], values[targetID][t][2]));
    					constraints.add(new OrBool(sourceValue[1], values[targetID][t][1]));
    					constraints.add(new OrBool(sourceValue[0], values[targetID][t][0]));
    				}else{  // Or Rules
    					constraints.add(new OrBool(sourceValue[3], values[targetID][t][3]));
    					constraints.add(new OrBool(sourceValue[2], values[targetID][t][2]));
    					constraints.add(new AndBool(sourceValue[1], values[targetID][t][1]));
    					constraints.add(new AndBool(sourceValue[0], values[targetID][t][0]));
    				}
    			}
    		// (b) Evolving Decomposition
    		}else if (eDecompositionLink != null){
    			LinkableElement[] linkEle = eDecompositionLink.getSrc();
    			int numLinks = linkEle.length;
    			DecompositionType pre = eDecompositionLink.getPreDecomposition();
    			DecompositionType post = eDecompositionLink.getPostDecomposition();
    			IntVar dempEB = this.decompEBCollection.get(eDecompositionLink);
    			for (int t = 0; t < values[targetID].length; t++){
    				BooleanVar[][] sourceValue = new BooleanVar[4][numLinks];
    				for (int s = 0; s < numLinks; s++){
    					sourceValue[3][s] = values[linkEle[s].getIdNum()][t][3];
    					sourceValue[2][s] = values[linkEle[s].getIdNum()][t][2];
    					sourceValue[1][s] = values[linkEle[s].getIdNum()][t][1];
    					sourceValue[0][s] = values[linkEle[s].getIdNum()][t][0];
    				}          			    			

    				PrimitiveConstraint and3 = new AndBoolVector(sourceValue[3], values[targetID][t][3]);
    				PrimitiveConstraint and2 = new AndBoolVector(sourceValue[2], values[targetID][t][2]);
    				PrimitiveConstraint and1 = new OrBoolVector(sourceValue[1], values[targetID][t][1]);
    				PrimitiveConstraint and0 = new OrBoolVector(sourceValue[0], values[targetID][t][0]);
    				PrimitiveConstraint or3 = new OrBoolVector(sourceValue[3], values[targetID][t][3]);
    				PrimitiveConstraint or2 = new OrBoolVector(sourceValue[2], values[targetID][t][2]);
    				PrimitiveConstraint or1 = new AndBoolVector(sourceValue[1], values[targetID][t][1]);
    				PrimitiveConstraint or0 = new AndBoolVector(sourceValue[0], values[targetID][t][0]);


    				if (pre == DecompositionType.AND && post == DecompositionType.OR){
    					constraints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), and3, or3));
    					constraints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), and2, or2));
    					constraints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), and1, or1));
    					constraints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), and0, or0));
    				} else if (pre == DecompositionType.OR && post == DecompositionType.AND){
    					constraints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), or3, and3));
    					constraints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), or2, and2));
    					constraints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), or1, and1));
    					constraints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), or0, and0));
    				} else if (pre == DecompositionType.AND && post == null){
    					constraints.add(new IfThen(new XgtY(dempEB, timePoints[t]), and3));
    					constraints.add(new IfThen(new XgtY(dempEB, timePoints[t]), and2));
    					constraints.add(new IfThen(new XgtY(dempEB, timePoints[t]), and1));
    					constraints.add(new IfThen(new XgtY(dempEB, timePoints[t]), and0));
    				} else if (pre == DecompositionType.OR && post == null){
    					constraints.add(new IfThen(new XgtY(dempEB, timePoints[t]), or3));
    					constraints.add(new IfThen(new XgtY(dempEB, timePoints[t]), or2));
    					constraints.add(new IfThen(new XgtY(dempEB, timePoints[t]), or1));
    					constraints.add(new IfThen(new XgtY(dempEB, timePoints[t]), or0));
    				} else if (pre == null && post == DecompositionType.AND){
    					constraints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), and3));
    					constraints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), and2));
    					constraints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), and1));
    					constraints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), and0));
    				} else if (pre == null && post == DecompositionType.OR){
    					constraints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), or3));
    					constraints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), or2));
    					constraints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), or1));
    					constraints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), or0));
    				}	    	
    			}
    		}

*/    		

	}
	
	
	
	/**
	 * Helper Method to create constraints for contribution links.
	 * @param cType	ContributionType of the link
	 * @param src	Source time-point
	 * @param tgt	Target time-point
	 * @return		The resulting constraint.
	 */
	private static PrimitiveConstraint createForwardContributionConstraint(ContributionType cType, BooleanVar[] src, BooleanVar[] tgt){
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
	
	

	
	
	
	
	
	/*********************************************************************************************
	 * Backward Analysis
	 *********************************************************************************************/
	public static void doBackward() {
		
/*
//		for (int e = 0; e < intentions.length; e++){
    		// Iterate over each time step.
    		for (int t = 0; t < values[targetID].length; t++){
    			ArrayList<PrimitiveConstraint> FSConstaints = new ArrayList<PrimitiveConstraint>();
    			ArrayList<PrimitiveConstraint> PSConstaints = new ArrayList<PrimitiveConstraint>();
    			ArrayList<PrimitiveConstraint> PDConstaints = new ArrayList<PrimitiveConstraint>();
    			ArrayList<PrimitiveConstraint> FDConstaints = new ArrayList<PrimitiveConstraint>();

    			if (decompositionLink != null){
        			LinkableElement[] linkEle = decompositionLink.getSrc();
        			int numLinks = linkEle.length;
    				PrimitiveConstraint[][] sourceValue = new PrimitiveConstraint[4][numLinks];
    				for (int s = 0; s < numLinks; s++){
    					sourceValue[3][s] = new XeqC(values[linkEle[s].getIdNum()][t][3], 1);
    					sourceValue[2][s] = new XeqC(values[linkEle[s].getIdNum()][t][2], 1);
    					sourceValue[1][s] = new XeqC(values[linkEle[s].getIdNum()][t][1], 1);
    					sourceValue[0][s] = new XeqC(values[linkEle[s].getIdNum()][t][0], 1);
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
    					sourceValue[3][s] = new XeqC(values[linkEle[s].getIdNum()][t][3], 1);
    					sourceValue[2][s] = new XeqC(values[linkEle[s].getIdNum()][t][2], 1);
    					sourceValue[1][s] = new XeqC(values[linkEle[s].getIdNum()][t][1], 1);
    					sourceValue[0][s] = new XeqC(values[linkEle[s].getIdNum()][t][0], 1);
    				}
    				if (pre == DecompositionType.AND && post == DecompositionType.OR){
    					//constraints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), andC, orC));
    					FSConstaints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), new And(sourceValue[3]), new Or(sourceValue[3])));
        				PSConstaints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), new And(sourceValue[2]), new Or(sourceValue[2])));
        				PDConstaints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), new Or(sourceValue[1]), new And(sourceValue[1])));
        				FDConstaints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), new Or(sourceValue[0]), new And(sourceValue[0])));
    				} else if (pre == DecompositionType.OR && post == DecompositionType.AND){
    					//constraints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), orC, andC));
    					FSConstaints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), new Or(sourceValue[3]), new And(sourceValue[3])));
        				PSConstaints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), new Or(sourceValue[2]), new And(sourceValue[2])));
        				PDConstaints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), new And(sourceValue[1]), new Or(sourceValue[1])));
        				FDConstaints.add(new IfThenElse(new XgtY(dempEB, timePoints[t]), new And(sourceValue[0]), new Or(sourceValue[0])));
    				} else if (pre == DecompositionType.AND && post == null){
    					//constraints.add(new IfThen(new XgtY(dempEB, timePoints[t]), andC));
    					FSConstaints.add(new IfThen(new XgtY(dempEB, timePoints[t]), new And(sourceValue[3])));
        				PSConstaints.add(new IfThen(new XgtY(dempEB, timePoints[t]), new And(sourceValue[2])));
        				PDConstaints.add(new IfThen(new XgtY(dempEB, timePoints[t]), new Or(sourceValue[1])));
        				FDConstaints.add(new IfThen(new XgtY(dempEB, timePoints[t]), new Or(sourceValue[0])));
    				} else if (pre == DecompositionType.OR && post == null){
    					//constraints.add(new IfThen(new XgtY(dempEB, timePoints[t]), orC));
    					FSConstaints.add(new IfThen(new XgtY(dempEB, timePoints[t]), new Or(sourceValue[3])));
        				PSConstaints.add(new IfThen(new XgtY(dempEB, timePoints[t]), new Or(sourceValue[2])));
        				PDConstaints.add(new IfThen(new XgtY(dempEB, timePoints[t]), new And(sourceValue[1])));
        				FDConstaints.add(new IfThen(new XgtY(dempEB, timePoints[t]), new And(sourceValue[0])));    					
    				} else if (pre == null && post == DecompositionType.AND){
    					//constraints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), andC));
    					FSConstaints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), new And(sourceValue[3])));
        				PSConstaints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), new And(sourceValue[2])));
        				PDConstaints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), new Or(sourceValue[1])));
        				FDConstaints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), new Or(sourceValue[0])));
    				}else if (pre == null && post == DecompositionType.OR){
    					//constraints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), orC));
    					FSConstaints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), new Or(sourceValue[3])));
        				PSConstaints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), new Or(sourceValue[2])));
        				PDConstaints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), new And(sourceValue[1])));
        				FDConstaints.add(new IfThen(new XlteqY(dempEB, timePoints[t]), new And(sourceValue[0])));
    				}
    			}
    			
    			if (contributionElements.size() != 0) { 
    				int numLinks = contributionElements.size();	
    				for (int i = 0; i < numLinks; i++) {
    					int sourceID = contributionElements.get(i).getIdNum();
    					PrimitiveConstraint[] newConts = createBackwardContributionConstraint(contributionTypes.get(i), values[sourceID][t]);
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
    						preConstraint = createBackwardContributionConstraint(pre, values[sourceID][t]);
    					PrimitiveConstraint[] postConstraint = null;
    					if(post != null)
    						postConstraint = createBackwardContributionConstraint(post, values[sourceID][t]);
   
    					// Note: I implemented this as a two if statements rather than and if->else if. The case of a pre and a post link might now work 
    					//		as two separate constraints. This depends on how the "IfThen" are treated in the "Or(FSConstaints)" below.
    					//		If no information is propagated for these links they might need to be written as Not(A) or (B). or all combinations in the IfThen. 
    					if (pre != null){
        					if (preConstraint[3] != null)
        						FSConstaints.add(new IfThen(new XgtY(contEB, timePoints[t]), preConstraint[3]));
        					if (preConstraint[2] != null)
        						PSConstaints.add(new IfThen(new XgtY(contEB, timePoints[t]), preConstraint[2]));
        					if (preConstraint[1] != null)
        						PDConstaints.add(new IfThen(new XgtY(contEB, timePoints[t]), preConstraint[1]));
        					if (preConstraint[0] != null)
        						FDConstaints.add(new IfThen(new XgtY(contEB, timePoints[t]), preConstraint[0]));
    					}
    					if (post != null){	
        					if (postConstraint[3] != null)
        						FSConstaints.add(new IfThen(new XlteqY(contEB, timePoints[t]), postConstraint[3]));
        					if (postConstraint[2] != null)
        						PSConstaints.add(new IfThen(new XlteqY(contEB, timePoints[t]), postConstraint[2]));
        					if (postConstraint[1] != null)
        						PDConstaints.add(new IfThen(new XlteqY(contEB, timePoints[t]), postConstraint[1]));
        					if (postConstraint[0] != null)
        						FDConstaints.add(new IfThen(new XlteqY(contEB, timePoints[t]), postConstraint[0]));
    					}
    				}   			
        		}
    			if (FSConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(values[targetID][t][3], 1), new Or(FSConstaints)));
    			if (PSConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(values[targetID][t][2], 1), new Or(PSConstaints)));
    			if (PDConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(values[targetID][t][1], 1), new Or(PDConstaints)));
    			if (FDConstaints.size() > 0)
    				constraints.add(new IfThen(new XeqC(values[targetID][t][0], 1), new Or(FDConstaints)));
    		}

		}
*/ 
	}
	
	
	@SuppressWarnings("unused")
	private static PrimitiveConstraint[] createBackwardContributionConstraint(ContributionType cType, BooleanVar[] src){
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

	
}
