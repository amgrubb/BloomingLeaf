package interface_objects;

import java.util.ArrayList;

public class InputActor{
	
	private String nodeID;
	private String nodeName;
	private String nodeType;
	private ArrayList<String> intentions;
	
	public String getNodeId() {
		return nodeID;
	}
	
	public void setNodeId(String nodeId) {
		this.nodeID = nodeId;
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

	public ArrayList<String> getIntentions() {
		return this.intentions;
	}
}