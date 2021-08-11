package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jacop.constraints.Constraint;
import org.jacop.constraints.XltY;
import org.jacop.core.IntVar;
import org.jacop.core.Store;

import gson_classes.IOSolution;

public class CSPPath {
	/**
	 * Assigned this.numTimePoints and creates time point list (this.timePoints) then
	 * assigned the absolute, relative, and unassigned time points.
	 * @param modelAbstime
	 * @param unassignedTimePoint
	 * @param numRelTP
	 * @param prevTPAssignments
	 */
	public static IntVar[] createPathTimePoint(ModelSpec spec, Store store, 
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
    	
    	return timePoints;
		
	}
	
	public static IntVar[] createNextStateTimePoint(ModelSpec spec, Store store, 
			HashMap<IntVar, List<String>> timePointMap, 
			HashMap<String, List<String>> nextStateTPHash, 
			int maxTime) {
		
   		IOSolution prev = spec.getPrevResult();
   		if (prev == null)
   			throw new RuntimeException("\n Previous results required, but null.");
		
		// Get the Unique Set of Time Point from the Model
		HashMap<Integer, List<String>> modelAbsTime = spec.getAbsTimePoints();
		List<String> unassignedTimePoint = modelAbsTime.get(-1);
		modelAbsTime.remove(-1);
		int numRelTP = spec.getNumRelativeTimePoints(); 
		HashMap<String, Integer> prevTPAssignments = prev.getSelectedTPAssignments();
		Integer[] prevTP = prev.getSelectedTimePointPath();
		
		List<IntVar> timePointList = new ArrayList<IntVar>();
		
		int tpCounter = 0;
		for (Integer i : prevTP) {		// Last Time Points
			IntVar newTP = new IntVar(store, "TL" + tpCounter, i, i);

    		List<String> affectedKeys = new ArrayList<String>();
			for	(Map.Entry<String, Integer> entry : prevTPAssignments.entrySet()) {
				if (entry.getValue().equals(i))  
					affectedKeys.add(entry.getKey());
			}
			for (String key : affectedKeys)		// Removes no longer needed entires. 
				prevTPAssignments.remove(key);
			if (modelAbsTime.containsKey(i)) {
				List<String> absVal = modelAbsTime.get(i);
				for (String v : absVal)
					if (!affectedKeys.contains(v))
						affectedKeys.add(v);
				modelAbsTime.remove(i);			// Removes no longer needed entries.
			}
			for (String key : affectedKeys)
				if (unassignedTimePoint.contains(key)) 
					unassignedTimePoint.remove(key);
			if (affectedKeys.isEmpty()) {
				affectedKeys.add("TR" + tpCounter);
				numRelTP--;
			}
			timePointList.add(newTP);
    		timePointMap.put(newTP, affectedKeys);
    		tpCounter++;
		}

		HashMap<String, List<String>> newTPHash = new HashMap<String, List<String>>();  
		// Add a relative time point if available.
		if (numRelTP > 0) {
    		List<String> toAdd = new ArrayList<String>();
    		toAdd.add("TNS-R");
    		newTPHash.put("TNS-R", toAdd);
		}
		if (modelAbsTime.size() > 0) {
			int minKey = maxTime + 1;
			for	(Integer key : modelAbsTime.keySet()) 
				if (key < minKey)  
					minKey = key;
			if (minKey != maxTime + 1) {
	    		List<String> toAdd = modelAbsTime.get(minKey);
	    		newTPHash.put("TNS-A", toAdd);
			}
		}
		if (unassignedTimePoint.size() > 0) {
			int c = 0; 
			for (String newVal: unassignedTimePoint) {
	    		List<String> toAdd = new ArrayList<String>();
	    		toAdd.add(newVal);
	    		newTPHash.put("TNS-" + c, toAdd);
	    		c++;
			}
		}
		int iMin = prev.getSelectedAbsTime() + 1;
		int iMax = iMin + newTPHash.size() - 1;
		if (iMax > maxTime)
			throw new RuntimeException("\n The number of remaining time points won't fit in maxTime.");
		for	(Map.Entry<String, List<String>> entry : newTPHash.entrySet()) {
			IntVar newTP = new IntVar(store, entry.getKey(), iMin, iMax);
			timePointList.add(newTP);
    		timePointMap.put(newTP, entry.getValue());
    		nextStateTPHash.put(entry.getKey(), entry.getValue());
		}
		
		IntVar[] list = new IntVar[timePointList.size()];
		for (int i = 0; i < list.length; i ++)
			list[i] = timePointList.get(i);
		return list;
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
