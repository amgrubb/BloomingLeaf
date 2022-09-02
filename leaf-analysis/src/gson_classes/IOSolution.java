package gson_classes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class IOSolution {
	// Outputs of simulation paths (inputs for 'next state' and 'update path'.
	private List<ElementData> elementList = new ArrayList<>();
	private HashMap<String, Integer> timePointAssignments;
	private Integer[] timePointPath;
	
	// Input for 'next state' or 'update path'
	private Integer selectedTimePoint;
	
	// Outputs for 'next state'
	private HashMap<String, List<String>> nextStateTPs;
	@SuppressWarnings("unused")			// Used by front end.
	private HashMap<String, String[][]> allSolutions;
	@SuppressWarnings("unused")			// Used by front end.
	private Integer nextPossibleAbsValue;
	@SuppressWarnings("unused")			// Used by front end.
	private Integer nextPossibleRndValue;
	
	// *********** Start of Returning The Solution *********** 
	public IOSolution(Integer[] timePointPath, HashMap<String, Integer> timePointAssignments) {
		this.timePointAssignments = timePointAssignments;
		this.timePointPath = timePointPath;
	}
	public void addElement(String id, String[] status) {
		elementList.add(new ElementData(id, status));
	}
	public IOSolution getNewIOSolutionFromSelected(
			HashMap<String, String[][]> allSolutions, 
			HashMap<String, List<String>> nextStateTPs, 
			Integer nextAbsVal, int maxTime) {
		IOSolution newObj = new IOSolution(getSelectedTimePointPath(), getSelectedTPAssignments());
		newObj.selectedTimePoint = this.selectedTimePoint;
		newObj.nextStateTPs = nextStateTPs;
		newObj.allSolutions = allSolutions;
		for (ElementData e : this.elementList) {
			String[] newStatus = new String[this.selectedTimePoint + 1];
			for (int t = 0; t < selectedTimePoint+1; t++) {
				newStatus[t] = e.status[t];
			}
			newObj.addElement(e.id, newStatus);
		}
		int lower = newObj.timePointPath[newObj.timePointPath.length - 1] + 1;
		int numMissingStates = this.timePointPath.length - newObj.timePointPath.length; 
		int upper = maxTime - numMissingStates;
		if (newObj.nextStateTPs.containsKey("TNS-A") && nextAbsVal != null) {
			//Contains an AbsTimeValue
			newObj.nextPossibleAbsValue = nextAbsVal; //this.timePointAssignments.get(newObj.nextStateTPs.get("TNS-A").get(0));
			upper = Math.min(upper, nextAbsVal);
		} 
		if (upper != nextAbsVal)
			newObj.nextPossibleRndValue = (int)Math.floor(Math.random()*(upper - lower + 1) + lower);
		return newObj;	
	}
	
	// *********** End of Returning The Solution *********** 
	
	// *** Start Input DATA ***
	public Integer getSelectedTimePoint() {
		return selectedTimePoint;
	}
	
	public HashMap<String, Integer> getSelectedTPAssignments() {
		if (timePointAssignments == null || selectedTimePoint == null)
			return null;
		HashMap<String, Integer> newHash = new HashMap<String, Integer>();
		for (Map.Entry<String, Integer> entry : timePointAssignments.entrySet()) 
			if (entry.getValue() <= timePointPath[selectedTimePoint])
				newHash.put(entry.getKey(), entry.getValue());
		return newHash;
	}

    public Integer[] getSelectedTimePointPath() {
    	if (timePointPath == null || selectedTimePoint == null)
    		return null;
    	if (selectedTimePoint >= timePointPath.length)
    		return null;
    	Integer[] path = new Integer[selectedTimePoint + 1];
    	for (int i = 0; i < selectedTimePoint + 1; i++)
    		path[i] = timePointPath[i];
    	return path;
    }
    public Integer getSelectedAbsTime() {
    	if (timePointPath == null || selectedTimePoint == null)
    		return null;
    	if (selectedTimePoint >= timePointPath.length)
    		return null;
    	return timePointPath[selectedTimePoint];
    }
    
	public HashMap<String, boolean[][]> getSelectedPreviousValues(){
		if (elementList == null || selectedTimePoint == null)
			return null;
		HashMap<String, boolean[][]> previousValuesMap = new HashMap<>();
		for (ElementData e : elementList) {
			boolean[][] prevVal = new boolean[selectedTimePoint+1][4];
			if (selectedTimePoint >= prevVal.length)
				return null;
			for (int t = 0; t < selectedTimePoint+1; t++) {
				String value = e.status[t];
				for (int i = 0; i < 4; i++){
					if (value.charAt(i) == '1'){
						prevVal[t][i] = true;
					} else {
						prevVal[t][i] = false;
					}
				}
			}
			previousValuesMap.put(e.id, prevVal);
		}		
		return previousValuesMap;	
	}	
	

	
	
	
	
	
	// *** End Input DATA ***
	/**
	 * Holds the mapping between the unique ID for each intention and 
	 * the simulation path results.
	 */
	private class ElementData {
		private String id;
		private String[] status;
		public ElementData(String id, String[] status) {
			this.id = id;
			this.status = status;
		}
		
	}	
	
}
