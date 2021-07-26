package gson_classes;

import java.util.HashMap;
import java.util.List;

public class IPreviousAnalysis {
	private String[] assignedEpoch;
	private String[] timePointPath;
	private int selectedTimePoint = -1;

    private List<ElementData> elementList;
    
    /* Converts the assignedEpoch array into a hash map and then returns it.
     */
    public HashMap<String, Integer> getInitialAssignedEpochs(){
    	if (assignedEpoch == null)
    		return null;
    	
		HashMap<String, Integer> initialAssignedEpochMap = new HashMap<>();
		for(int i = 0; i < assignedEpoch.length; i++){
			String[] aE = assignedEpoch[i].split("_");
			String key = aE[0].toString();
			for (int j = 1; j < aE.length-1 ; j ++){
				key += "_" + aE[j].toString();
			}
			Integer value = Integer.parseInt(aE[aE.length-1]);
			initialAssignedEpochMap.put(key, value);
		}
		return initialAssignedEpochMap;	
    }

    public int[] getFullTimePointPath() {
    	if (timePointPath == null)
    		return null;
    	int[] path = new int[timePointPath.length];
    	for (int i = 0; i < timePointPath.length; i++)
    		path[i] = Integer.parseInt(timePointPath[i]);
    	return path;
    }
    
    public int[] getSelectedTimePointPath() {
    	if (timePointPath == null || selectedTimePoint == -1)
    		return null;
    	int[] path = new int[selectedTimePoint + 1];
    	for (int i = 0; i < selectedTimePoint + 1; i++)
    		path[i] = Integer.parseInt(timePointPath[i]);
    	return path;
    }
    
	public int getSelectedTimePoint() {
		return selectedTimePoint;
	}	
	
	private class ElementData {
    	private String id;
    	private String[] status;
    }
	
	public HashMap<String, boolean[][]> getSelectedPreviousValues(){
		if (elementList == null || selectedTimePoint == -1)
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
	
	
}
