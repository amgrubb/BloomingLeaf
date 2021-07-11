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
	private class Attributes {
		Integer absTime;
        //Boolean evolving;
        String linkType;
        String postType;       
	}
}
