package interface_objects;

public class InputLink{
	private String linkID;
	private String linkType;
	private String postType;
	private String linkSrcID;
	private String linkDestID;
	private int absoluteValue;
	
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

	public String getPostType() {
		return postType;
	}

	public void setPostType(String postType) {
		this.postType = postType;
	}

	public int getAbsoluteValue() {
		return absoluteValue;
	}

	public void setAbsoluteValue(int absoluteValue) {
		this.absoluteValue = absoluteValue;
	}

	
}