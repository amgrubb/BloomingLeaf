package gson_classes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class OMain {
	private List<OutputElement> elementList = new ArrayList<>();
	@SuppressWarnings("unused")
	private HashMap<String, Integer> timePointAssignments;
	@SuppressWarnings("unused")
	private Integer[] timePointPath;
	@SuppressWarnings("unused")
	private int timePointPathSize;
	//private List<IOStateModel> allSolution = new ArrayList<>();
	
	public OMain(Integer[] timePointPath, HashMap<String, Integer> timePointAssignments) {
		this.timePointAssignments = timePointAssignments;
		this.timePointPath = timePointPath;
		this.timePointPathSize = timePointPath.length;
	}
	public void addElement(String id, String[] status) {
		elementList.add(new OutputElement(id, status));
	}


	private class OutputElement {
		@SuppressWarnings("unused")
		private String id;
		@SuppressWarnings("unused")
		private String[] status;
		public OutputElement(String id, String[] status) {
			this.id = id;
			this.status = status;
		}
		
	}	
	
}
