package gson_classes;

import com.google.gson.annotations.SerializedName;

public class ICell {
	private String type;
	private String id;
	private Integer z; // unique counter of cells
	private Attrs attrs;
	
	// one contains info, rest are null
	private BIActor actor;
	private BIIntention intention;
	private BILink link;
	
	// actors and intentions
	private BISize size;
	private BIPosition position;
	
	// intentions
	private String parent;
	
	// actors
	private String[] embeds;
	
	// links
	private LinkEnds source;
	private LinkEnds target;
	private Label[] labels;
	
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
		
		// display agent/role
		if (actor.getType().equals("G") || actor.getType().equals("R")) {
			this.attrs.addHat(actor.getType());
		}
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
	
	/**
	 * Link constructor
	 */
	public ICell(BILink newLink, String type, String id, Integer z, String source, String target) {
		this.link = newLink;
		this.type = type;
		this.id = id;
		this.z = z;
		
		this.source = new LinkEnds(source);
		this.target = new LinkEnds(target);
		
		// add arrow towards target
		this.attrs = new Attrs();
		this.attrs.addArrow();
		
		// label with link type
		this.labels = new Label[1];  // make label array
		String label;
		if (newLink.getEvolving()) {
			// evolving link labeled w/ pre + post types
			label = newLink.getLinkType() + " | " + newLink.getPostType();
		} else {
			// non-evolving just labeled with link type
			label = newLink.getLinkType();
		}
		this.labels[0] = new Label(label);  // initialize 1st element of labels[]
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
		private LinkEnds(String id) {
			this.id = id;
		}
	}
	/*
	 * For adding label info to links
	 */
	private class Label{
		Double position;
		Attrs attrs;
		
		private Label(String label) {
			this.position = 0.5;
			this.attrs = new Attrs();
			this.attrs.addLinkText(label);
		}
	}
	private class Attrs {
		// nested classes to achieve the JSON format "attrs":{".name":{"text":nodeName}}
		@SerializedName(".name")  // outputs name as ".name" in JSON
		
		// intentions
		TextField name;
		@SerializedName(".satvalue")
		TextField satvalue;  // (D, S) pairs on bottom right of intention
		@SerializedName(".funcvalue")
		TextField funcvalue;  // evolving function type on bottom left of intention
		
		TextField text;
		
		// links
		@SerializedName(".marker-target")
		Path markerTarget;  // shows link arrow to dest
		
		// actors
		@SerializedName(".line")
		ActorHat line;
		
		private Attrs() {
		}
		
		private Attrs(String name) {
			this.name = new TextField(name);
			this.text = new TextField();
		}
		
		private Attrs(String name, String satvalue) {
			this.name = new TextField(name);
			this.satvalue = new TextField(satvalue);
			this.text = new TextField();
		}
		
		private Attrs(String name, String satvalue, String funcvalue) {
			this.name = new TextField(name);
			this.satvalue = new TextField(satvalue);
			this.funcvalue = new TextField(funcvalue);
			this.text = new TextField();
		}
		
		/**
		 * For filling in text field w/ link label
		 * @param label
		 */
		private void addLinkText(String label) {
			this.text = new TextField(label);
		}
		
		/**
		 * For adding link arrow to target
		 */
		private void addArrow() {
			this.markerTarget = new Path();
		}
		
		/**
		 * For adding agent/role actor decoration ("hats")
		 */
		private void addHat(String type) {
			this.line = new ActorHat(type);
		}
		
		/**
		 * For format "text":{"text": "linkLabel"} in link label attrs
		 * Or for font info on actors/intentions
		 */
		
		private class TextField {
			String text;
			String fill;
			String stroke;
			@SerializedName("font-weight")
			String fontWeight;
			@SerializedName("font-size")
			Integer fontSize;
			
			/**
			 * For actors and intentions, show font info
			 */
			private TextField() {
				this.fill = "black";
				this.stroke = "none";
				this.fontWeight = "normal";
				this.fontSize = 10;
			}
			
			/**
			 * For links, show link label
			 * And anywhere else that needs {"text": "foo"}
			 */
			private TextField(String text) {
				this.text = text;
			}
		}
		
		/**
		 * Arrow path on links
		 */
		private class Path {
			String d;
			
			private Path() {
				this.d = "M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5";
			}
		}
		
		/**
		 * Agent/Role markings on actors
		 */
		private class ActorHat {
			String ref;
			@SerializedName("ref-x")
			Integer refx;
			@SerializedName("ref-y")
			Double refy;
			String d;
			@SerializedName("stroke-width")
			Integer strokewidth;
			String stroke;
			
			private ActorHat(String type) {
				this.ref = ".label";
				this.refx = 0;
				if (type.equals("G")) {  // agent hat
					this.refy = 0.08;
					this.d = "M 5 10 L 55 10";
				} else {  // role hat
					this.refy = 0.6;
					this.d = "M 5 10 Q 30 20 55 10 Q 30 20 5 10";
				}
				this.strokewidth = 1;
				this.stroke = "black";
			}
		}
		
	}
	
}
