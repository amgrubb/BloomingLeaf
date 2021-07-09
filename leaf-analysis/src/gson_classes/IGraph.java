package gson_classes;

import java.util.List;


/**
 * This class is responsible to receive the frontend JSON, so it doesn't have any behavior.
 * IMPORTANT: The attributes in this class must be correlated (same name and type) with 
 * the JSON attributes.
 */
public class IGraph {
	
	private String maxAbsTime;
	private String[] absTimePtsArr;
	private List<BIConstraint> constraints;
	private List<ICell> cells;


		
}