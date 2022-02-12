package simulation;

import gson_classes.BILink;


public class ActorLink extends AbstractElementLink {
	private ActorLinkType prelinkType = null;

	public ActorLink(AbstractLinkableElement s, AbstractLinkableElement d, ActorLinkType r1, String uniqueID) {
		super(new AbstractLinkableElement[]{s}, d, uniqueID);
		this.prelinkType = r1;
	}
	
	public ActorLinkType getType() {
		return prelinkType;
	}
	public void setType(ActorLinkType alt){
		prelinkType = alt;
	}
	public String getName() {
		return super.getZeroSrc().getName() + " --" + prelinkType.getCode() + "--> " + super.getDest().getName();
	}
	
}




