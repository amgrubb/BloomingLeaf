package gson_classes;

import com.google.gson.annotations.SerializedName;

public class ICell {
	private String type;
	private String id;
	private Integer z; // unique counter of cells
	private Attrs attrs; // TODO: output attributes despite .varnames
	
	// one contains info, rest are null
	private BIActor actor;
	private BIIntention intention;
	private BILink link;
	
	// actors and intentions
	private BISize size;
	private BIPosition position;
	
	// links and intentions
	private String parent;
	
	// actors
	private String[] embeds;
	
	// links
	private LinkEnds source;
	private LinkEnds target;
	
	/**
	 * actor constructor
	 */
	public ICell(BIActor actor, String type, String id, Integer z, BISize size, BIPosition position, String[] embeds, String name) {
		this.actor = actor;
		this.type = type;
		this.id = id;
		this.z = z;
		this.size = size;
		this.position = position;
		this.embeds = embeds;
		this.attrs = new Attrs(name);
	}
	
	/**
	 * intention constructor
	 */
	public ICell(BIIntention intention, String type, String id, Integer z, BISize size, BIPosition position, String parent, String name) {
		this.intention = intention;
		this.type = type;
		this.id = id;
		this.z = z;
		this.size = size;
		this.position = position;
		this.parent = parent;

		// set display attributes based on initial sat values and evolving function types
		String satvalue = intention.getUserEvaluationList().get(0).getAssignedEvidencePair();
		String funcvalue = intention.getEvolvingFunction().getType();
		if (!satvalue.equals("(no value)") && !funcvalue.equals("NT")) {
			// display both initial sat value and func value (evolving function type)
			this.attrs = new Attrs(name, satvalue, funcvalue);
		} else if (!satvalue.equals("(no value)")) {
			// display just initial sat value
			this.attrs = new Attrs(name, satvalue);
		} else {
			// just display name
			this.attrs = new Attrs(name);
		}
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
	public BISize getSize() {
		return size;
	}
	public Integer getWidth() {
		return size.getWidth();
	}
	public Integer getHeight() {
		return size.getHeight();
	}
	public BIPosition getPosition() {
		return position;
	}
	public Integer getX() {
		return position.getX();
	}
	public Integer getY() {
		return position.getY();
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
	private class Attrs {
		// nested classes to achieve the JSON format "attrs":{".name":{"text":nodeName}}
		@SerializedName(".name")  // outputs name as ".name" in JSON
		TextField name;
		@SerializedName(".satvalue")
		TextField satvalue;  // (D, S) pairs on bottom right of intention
		@SerializedName(".funcvalue")
		TextField funcvalue;  // evolving function type on bottom left of intention
		
		private Attrs(String name) {
			this.name = new TextField(name);
		}
		
		private Attrs(String name, String satvalue) {
			this.name = new TextField(name);
			this.satvalue = new TextField(satvalue);
		}
		
		private Attrs(String name, String satvalue, String funcvalue) {
			this.name = new TextField(name);
			this.satvalue = new TextField(satvalue);
			this.funcvalue = new TextField(funcvalue);
		}
		
		private class TextField {
			String text;
			
			private TextField(String text) {
				this.text = text;
			}
		}
	}
	
}
