/**
 * 
 */
package simulation_objects;

/**
 * @author A.M.Grubb
 *
 */
public class Actor extends LinkableElement {
	String actorType;

	public Actor(String nodeID, String nodeName, String nodeType){
		super(nodeID, nodeName);
		actorType = nodeType;
		// nodeType indicates whether it is an Actor, Role, or Agent.
	}

	public String getActorType() {
		return actorType;
	}
}
