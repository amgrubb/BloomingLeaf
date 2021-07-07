package gson_classes;

import java.util.ArrayList;

/**
 * This class is responsible to receive the frontend JSON, so it doesn't have any behavior (POJO).
 * It is split in two attributes, the data required for the type of analysis and the graph model.
 * IMPORTANT: The attributes in this class must be correlated (same name and type) with the JSON attributes.
 * @author marcel
 * @email marcel.serikawa@gmail.com
 */
public class InputGraph {
	
	private String maxAbsTime;
	private ArrayList<String> absTimePtsArr;
	private ArrayList<String> constraints;
	
//	InputModel model = new InputModel();
	

	
}
