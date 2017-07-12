package interface_objects;

public class InputLink{
	private String linkType;
	private String linkSrcID;
	private String linkDestID;
	String postType;
	
	public String getLinkSrcID() {
		return linkSrcID;
	}
	
	public void setLinkSrcID(String linkSrcID) {
		this.linkSrcID = linkSrcID;
	}
	
	public String getLinkDestID() {
		return linkDestID;
	}
	
	public void setLinkDestID(String linkDestID) {
		this.linkDestID = linkDestID;
	}
	
	public String getLinkType() {
		return linkType;
	}
	
	public void setLinkType(String linkType) {
		this.linkType = linkType;
	}
	
}