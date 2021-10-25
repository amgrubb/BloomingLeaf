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
	private Size size;
	private Position position;
	
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
	public Integer getWidth() {
		return size.width;
	}
	public Integer getHeight() {
		return size.height;
	}
	public Integer getX() {
		return position.x;
	}
	public Integer getY() {
		return position.y;
	}
	/**
	 * @return whether the ICell contains visual information
	 */
	public Boolean isVisual() {
		return (size != null && position != null);
	}
	
	private class LinkEnds {
		String id;
	}
	private class Size {
		Integer width;
		Integer height;
	}
	private class Position {
		Integer x;
		Integer y;
	}
}
