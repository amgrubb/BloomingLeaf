package gson_classes;

import java.util.List;


/**
 * This class is responsible to receive the frontend JSON, so it doesn't have any behavior.
 * IMPORTANT: The attributes in this class must be correlated (same name and type) with 
 * the JSON attributes.
 */
public class IGraph {
	private String maxAbsTime;
	private int[] absTimePtsArr;
	private BIConstraint[] constraints;
	private List<ICell> cells;
	
	public String getMaxAbsTime() {
		return maxAbsTime;
	}
	public int[] getAbsTimePtsArr() {
		return absTimePtsArr;
	}
	public BIConstraint[] getConstraints() {
		return constraints;
	}
	public List<ICell> getCells() {
		return cells;
	}		
}
