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
}
