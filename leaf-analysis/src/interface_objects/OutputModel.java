package interface_objects;

import java.util.ArrayList;
import java.util.List;

public class OutputModel {

	boolean foundSolution = false;
	int[] relativeTime;
	int[] absoluteTime;
	List<IOStateModel> statesModels = new ArrayList<>();
	
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

	public List<IOStateModel> getStateModels() {
		return statesModels;
	}

	public void setStateModels(List<IOStateModel> stateModels) {
		this.statesModels = stateModels;
	}
	
}
