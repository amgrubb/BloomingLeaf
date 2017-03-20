package interface_object;

import java.util.List;

public class StateModel {
	List<IntentionElements> intentionElements;
	int time;
	
	public List<IntentionElements> getIntentionElements() {
		return intentionElements;
	}
	
	public void setIntentionElements(List<IntentionElements> intentionElements) {
		this.intentionElements = intentionElements;
	}
	
	public int getTime() {
		return time;
	}
	
	public void setTime(int time) {
		this.time = time;
	}
	
}
	