package interface_object;

import java.util.ArrayList;
import java.util.List;

public class IONode {

	int id;
	List<String> states = new ArrayList<>();

	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public List<String> getStates() {
		return states;
	}
	public void setStates(List<String> states) {
		this.states = states;
	}
		
}
