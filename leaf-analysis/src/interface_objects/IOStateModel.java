package interface_objects;

import java.util.List;

/**
 * This class represents all states from the intentional elements.
 * @author marcel
 *
 */
public class IOStateModel {
	List<IOIntention> intentionElements;
	
	public List<IOIntention> getIntentionElements() {
		return intentionElements;
	}
	
	public void setIntentionElements(List<IOIntention> intentionElements) {
		this.intentionElements = intentionElements;
	}
		
}
	