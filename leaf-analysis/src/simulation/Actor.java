/**
 * 
 */
package simulation;

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
	 * Return ids of intentions embedded in the actor
	 */
	public String[] getEmbeds() {
		return embeds;
	}
	
	/**
	 * Find the intention objects that the actor contains
	 * @param myModel - the model the actor belongs to 
	 * @return the intention objects that the actor contains in an array
	 */
	public Intention[] getEmbedObjects(ModelSpec myModel) {
		Intention[] myIntentions = new Intention[embeds.length];
		for(Intention intention: myModel.getIntentions()) {
			for(int i = 0; i < embeds.length; i++) {
				if(intention.getId().equals(embeds[i])) myIntentions[i] = intention;
			}
			
		}
		
		return myIntentions;
	}
}
