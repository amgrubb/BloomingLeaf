package interface_objects;


/**
 * This class is responsible to receive the frontend JSON, so it doesn't have any behavior (POJO).
 * It is split in two attributes, the data required for the type of analysis and the graph model.
 * IMPORTANT: The attributes in this class must be correlated (same name and type) with the JSON attributes.
 * @author marcel
 * @email marcel.serikawa@gmail.com
 */
public class InputObject {
	
	InputAnalysis analysis = new InputAnalysis();
	InputModel model = new InputModel();
	
	public InputAnalysis getAnalysis() {
		return analysis;
	}
	
	public void setAnalysis(InputAnalysis analysis) {
		this.analysis = analysis;
	}
	
	public InputModel getModel() {
		return model;
	}
	
	public void setModel(InputModel model) {
		this.model = model;
	}
	
}
