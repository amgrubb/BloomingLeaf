package gson_classes;

public class BILink {
    private Attributes attributes;
    /*
     * Non-Evolving Link constructor (no postType)
     */
    public BILink(Integer absTime, Boolean evolving, String linkType) {
    	this.attributes = new Attributes(absTime, evolving, linkType);
    }
    
    /*
     * Evolving Link constructor
     */
    public BILink(Integer absTime, Boolean evolving, String linkType, String postType) {
    	this.attributes = new Attributes(absTime, evolving, linkType, postType);
    }
    
	public Integer getAbsTime() {
		return attributes.absTime;
	}
	public String getLinkType() {
		return attributes.linkType;
	}
	public String getPostType() {
		return attributes.postType;
	}
	public Boolean getEvolving() {
		return attributes.evolving;
	}
	private class Attributes {
		Integer absTime;
        Boolean evolving;
        String linkType;
        String postType;
        String displayType;
        /*
         * Non-evolving link constructor (postType is null)
         * 
         */
        private Attributes(Integer absTime, Boolean evolving, String linkType) {
        	this.absTime = absTime;
        	this.evolving = evolving;
        	this.linkType = linkType;
        	this.displayType = "element";
        }
        /*
         * Evolving link constructor
         */
        private Attributes(Integer absTime, Boolean evolving, String linkType, String postType) {
        	this.absTime = absTime;
        	this.evolving = evolving;
        	this.linkType = linkType;
        	this.postType = postType;
        	this.displayType = "element";
        }
	}
}
