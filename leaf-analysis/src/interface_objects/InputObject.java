package interface_object;

public class FrontendObject {
	Model model = new Model();
	Analysis analysis = new Analysis();
	
	public Model getModel() {
		return model;
	}
	
	public void setModel(Model model) {
		this.model = model;
	}
	
	public Analysis getAnalysis() {
		return analysis;
	}
	
	public void setAnalysis(Analysis analysis) {
		this.analysis = analysis;
	}

}
