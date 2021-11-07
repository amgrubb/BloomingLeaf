package gson_classes;

public class BILink {
    private Attributes attributes;
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
        // add String displayType; as well?
	}
}
