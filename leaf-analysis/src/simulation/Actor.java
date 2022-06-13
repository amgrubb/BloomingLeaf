/**
 * 
 */
package simulation;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import layout.LMain;

/**
 * @author A.M.Grubb
 *
 */
public class Actor extends AbstractLinkableElement {
	String actorType;
	String[] embeds;

	public Actor(String nodeID, String nodeName, String nodeType, String[] embeds){
		super(nodeID, nodeName);
		// nodeType indicates whether it is an Actor, Role, or Agent.
		actorType = nodeType;
		// store actor's embedded intentions for merge algorithm
		this.embeds = embeds;
	}
	public Actor(String nodeID, String nodeName, String nodeType, String[] embeds, String uniqueID){
		super(nodeID, nodeName, uniqueID);
		// nodeType indicates whether it is an Actor, Role, or Agent.
		actorType = nodeType;
		// store actor's embedded intentions for merge algorithm
		this.embeds = embeds;
	}

	public String getActorType() {
		return actorType;
	}
	
	/*
	 * Return *unique* ids of intentions embedded in the actor
	 */
	public String[] getEmbeds() {
		return embeds;
	}
	
	/**
	 * Find the intention objects that the actor contains
	 * @param myModel - the model the actor belongs to 
	 * @return the intention objects that the actor contains in an array
	 */
	public Intention[] getEmbedIntentions(ModelSpec myModel) {
		//if there are no embeds
		if (embeds == null) return new Intention[0];
		
		Intention[] myIntentions = new Intention[embeds.length];
		
		System.out.println(embeds.length);
		System.out.println(Arrays.toString(embeds));
		
		for(Intention intention: myModel.getIntentions()) {
			for(int i = 0; i < embeds.length; i++) {
				if(intention.getUniqueID().equals(embeds[i]) && intention.getUniqueID() != null) {	
					myIntentions[i] = intention;
					System.out.println(intention.getName());
				}
			}
		}
		
		List<Intention> listOfIntentions = new ArrayList<Intention>();
		for(Intention i: myIntentions) {
			if(i != null ) {
				listOfIntentions.add(i);
				System.out.println(listOfIntentions);
			}
		}
		myIntentions = listOfIntentions.toArray(new Intention[listOfIntentions.size()]);
	
		return myIntentions;
	}
}
