package premerge;

import java.util.HashMap;
import java.util.List;

public class TIntention {
	private String intention;
	private List<String> currentTimesA;
	private List<String> newTimesA;
	private List<String> currentTimesB;
	private List<String> newTimesB;
	private List<String> newTimeOrder;
	private HashMap<String, String> renameA;
	private HashMap<String, String> renameB;
	
	/**************************************************************
	 * For using timing info to rename evolving function timepoints
	 **************************************************************/
	public void setRenameMaps() {
		// map current time to new time
		renameA = new HashMap<>();
		for (int i=0; i<currentTimesA.size(); i++) {
			renameA.put(currentTimesA.get(i), newTimesA.get(i));
		}
		renameB = new HashMap<>();
		for (int i=0; i<currentTimesB.size(); i++) {
			renameB.put(currentTimesB.get(i), newTimesB.get(i));
		}
	}
	public HashMap<String, String> getRenameA(){
		return renameA;
	}
	public HashMap<String, String> getRenameB(){
		return renameB;
	}
	
	/**********
	 * Getters
	 **********/
	public String getIntention() {
		return intention;
	}
	public List<String> getCurrentTimesA() {
		return currentTimesA;
	}
	public List<String> getCurrentTimesB() {
		return currentTimesB;
	}
	public List<String> getNewTimesA() {
		return newTimesA;
	}
	public List<String> getNewTimesB() {
		return newTimesB;
	}
	public List<String> getNewTimeOrder() {
		return newTimeOrder;
	}
}
