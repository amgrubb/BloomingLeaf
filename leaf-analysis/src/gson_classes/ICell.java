package gson_classes;

public class ICell {
	private String type;
	private String id;
	private String parent;
	private BIActor actor;
	private BIIntention intention;
	private BILink link;
	private LinkEnds source;
	private LinkEnds target;
	
	public String getType() {
		return type;
	}
	public String getId() {
		return id;
	}
	public String getParent() {
		return parent;
	}	
	public BIActor getActor() {
		return actor;
	}
	public BIIntention getIntention() {
		return intention;
	}
	public BILink getLink() {
		return link;
	}
	
	public String getSourceID() {
		return source.id;
	}
	public String getTargetID() {
		return target.id;
	}
	private class LinkEnds {
		String id;
	}
	
}
