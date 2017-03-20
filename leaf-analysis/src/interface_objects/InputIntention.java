package interface_objects;

public class InputIntention{
	private String nodeActorID;
	private String nodeID;
	private String nodeType;
	int initialValue;
	private String nodeName;
	
	public String getNodeActorID() {
		return nodeActorID;
	}
	public void setNodeActorID(String nodeActorID) {
		this.nodeActorID = nodeActorID;
	}
	public String getNodeID() {
		return nodeID;
	}
	public void setNodeID(String nodeID) {
		this.nodeID = nodeID;
	}
	public String getNodeName() {
		return nodeName;
	}
	public void setNodeName(String nodeName) {
		this.nodeName = nodeName;
	}
	public String getNodeType() {
		return nodeType;
	}
	public void setNodeType(String nodeType) {
		this.nodeType = nodeType;
	}
}