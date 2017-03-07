package interface_object;

import java.util.ArrayList;
import java.util.List;

public class IOOutput {

	boolean foundSolution = false;
	int[] relativeTime;
	int[] absoluteTime;
	List<IONode> nodes = new ArrayList<>();
	
	public boolean isFoundSolution() {
		return foundSolution;
	}
	
	public void setFoundSolution(boolean foundSolution) {
		this.foundSolution = foundSolution;
	}
	
	public int[] getRelativeTime() {
		return relativeTime;
	}
	
	public void setRelativeTime(int[] relativeTime) {
		this.relativeTime = relativeTime;
	}
	
	public int[] getAbsoluteTime() {
		return absoluteTime;
	}
	
	public void setAbsoluteTime(int[] absoluteTime) {
		this.absoluteTime = absoluteTime;
	}
	
	public List<IONode> getNodes() {
		return nodes;
	}
	
	public void setNodes(List<IONode> nodes) {
		this.nodes = nodes;
	}
	
}
