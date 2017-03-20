package interface_objects;


/**
 * This class is responsible to get all required input for the analysis.
 * The model elements in the model attribute. Class related: InputModel.
 * The analysis information in the analysis attribute.Class related: InputAnalysis.
 * @author marcel
 *
 */
public class InputObject {
	InputModel model = new InputModel();
	InputAnalysis analysis = new InputAnalysis();
	
	public InputModel getModel() {
		return model;
	}
	
	public void setModel(InputModel model) {
		this.model = model;
	}
	
	public InputAnalysis getAnalysis() {
		return analysis;
	}
	
	public void setAnalysis(InputAnalysis analysis) {
		this.analysis = analysis;
	}

}
