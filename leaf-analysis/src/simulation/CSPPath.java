package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jacop.constraints.Constraint;
import org.jacop.constraints.XltY;
import org.jacop.core.IntVar;
import org.jacop.core.Store;

public class CSPPath {
	/**
	 * Assigned this.numTimePoints and creates time point list (this.timePoints) then
	 * assigned the absolute, relative, and unassigned time points.
	 * @param modelAbstime
	 * @param unassignedTimePoint
	 * @param numRelTP
	 * @param prevTPAssignments
	 */
	public static IntVar[] createPathTimePoint(ModelSpec spec, Store store, List<Constraint> constraints, 
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
    	
    	// Add constraints for UD TimePoint ordering.
		List<List<String>> orderedTimePoints = spec.getUDTimePointOrder();
    	for (List<String> subList : orderedTimePoints) {
    		for (int i = 1; i < subList.size(); i++) {
    			IntVar prev = getTimePoint(timePointMap, subList.get(i-1));
    			IntVar curr = getTimePoint(timePointMap, subList.get(i));
    			constraints.add(new XltY(prev, curr));
    		}	
    	}
    	return timePoints;
		
	}
			
	public static void createLTConstraintsBetweenTimePoint(
			List<Constraint> constraints, ModelSpec spec,  
			IntVar[] timePoints, HashMap<IntVar, List<String>> timePointMap) {

		List<TPConstraint> ltTPconstraintsList = spec.getLtTPconstraints();	
    	for(TPConstraint tpCont : ltTPconstraintsList){		
    		IntVar refTP1 = getTimePoint(timePointMap, tpCont.getRefTP1());
    		IntVar refTP2 = getTimePoint(timePointMap, tpCont.getRefTP2());
    		constraints.add(new XltY(refTP1, refTP2));
    	}
    			
	}

	/** Gets the CSP IntVar associated with a time point in the model. 
	 * @param timePointMap	Map between IntVar time points and a collection of named time points from the model
	 * @param name 	The time point name to fine.
	 * @return	The found CSP IntVar Time Point
	 */
    public static IntVar getTimePoint(HashMap<IntVar, List<String>> timePointMap, String name) {
		for (Map.Entry<IntVar, List<String>> entry : timePointMap.entrySet()) {
			for (String item : entry.getValue()) {
				if (item.equals(name))
					return entry.getKey();
			}
		}
		throw new RuntimeException("CSPIntentions: getTimePoint - cannot find timepoint for " + name);
	}
}
