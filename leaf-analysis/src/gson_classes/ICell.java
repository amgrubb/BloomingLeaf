package gson_classes;

public class ICell {
	private String type;
	private String id;
	private Integer z; // unique counter of cells
	// private Attrs attrs; // TODO: output attributes despite .varnames
	
	// one contains info, rest are null
	private BIActor actor;
	private BIIntention intention;
	private BILink link;
	
	// actors and cells
	private Size size;
	private Position position;
	
	// links and cells
	private String parent;
	
	// actors
	private String[] embeds;
	
	// links
	private LinkEnds source;
	private LinkEnds target;
	
	/**
	 * actor constructor
	 */
	public ICell(String type, String id, Integer z, BIActor actor) { // add size/pos
		this.type = type;
		this.id = id;
		this.z = z;
		this.actor = actor;
	}
	
	
	// getters
	public String getType() {
		return type;
	}
	public String getId() {
		return id;
	}
	public Integer getZ() {
		return z;
	}
	public String getParent() {
		return parent;
	}
	public String[] getEmbeds() {
		return embeds;
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
