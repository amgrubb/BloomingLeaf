package gson_classes;

public class IMain {
	private IAnalysisRequest analysisRequest;
	private IGraph graph;
	
	public IMain(IGraph graph) {
		this.graph = graph;
	}
	
	public IAnalysisRequest getAnalysisRequest() {
		return analysisRequest;
	}
	public IGraph getGraph() {
		return graph;
	}
	
}
