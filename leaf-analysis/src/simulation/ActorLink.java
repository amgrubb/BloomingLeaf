package simulation;

import gson_classes.BILink;


public class ActorLink extends AbstractElementLink {
	private ActorLinkType linkType = null;

	public ActorLink(AbstractLinkableElement s, AbstractLinkableElement d, ActorLinkType r1, String uniqueID) {
		super(new AbstractLinkableElement[]{s}, d, uniqueID);
		this.linkType = r1;
	}
	
	public ActorLinkType getType() {
		return linkType;
	}
	public void setType(ActorLinkType alt){
		linkType = alt;
	}
	
}




