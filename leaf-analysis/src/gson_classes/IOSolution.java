package gson_classes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class IOSolution {
	private List<ElementData> elementList = new ArrayList<>();
	private HashMap<String, Integer> timePointAssignments;
	private Integer[] timePointPath;
	private Integer selectedTimePoint;
	
	//private List<IOStateModel> allSolution = new ArrayList<>();
	@SuppressWarnings("unused")
	private List<Integer> allSolution = new ArrayList<>();	//Tempary Place Holder

	// *********** Start of Returning The Solution *********** 
	public IOSolution(Integer[] timePointPath, HashMap<String, Integer> timePointAssignments) {
		this.timePointAssignments = timePointAssignments;
		this.timePointPath = timePointPath;
	}
	public void addElement(String id, String[] status) {
		elementList.add(new ElementData(id, status));
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
			if (entry.getValue() <= selectedTimePoint)
				newHash.put(entry.getKey(), entry.getValue());
		return newHash;
	}
	
	
//TODO: Add back in as required.


//	public Integer[] getTimePointPath() {
//		return timePointPath;
//	}
//    public Integer[] getSelectedTimePointPath() {
//    	if (timePointPath == null || selectedTimePoint == null)
//    		return null;
//    	Integer[] path = new Integer[selectedTimePoint + 1];
//    	for (int i = 0; i < selectedTimePoint + 1; i++)
//    		path[i] = timePointPath[i];
//    	return path;
//    }
    
	public HashMap<String, boolean[][]> getSelectedPreviousValues(){
		if (elementList == null || selectedTimePoint == null)
			return null;
		HashMap<String, boolean[][]> previousValuesMap = new HashMap<>();
		for (ElementData e : elementList) {
			boolean[][] prevVal = new boolean[selectedTimePoint+1][4];
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
