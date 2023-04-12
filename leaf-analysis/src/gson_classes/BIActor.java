package gson_classes;

public class BIActor {
	private Attributes attributes;
	
	public BIActor(String actorName, String type, boolean isHidden) {
		attributes = new Attributes(actorName, type, isHidden);
	}
	
	public String getActorName() {
		return attributes.actorName;
	}
	public String getType() {
		return attributes.type;
	}

	public boolean getIsHidden() {
		return attributes.isHidden;
	}

	private class Attributes {
		String actorName;
		String type;
		boolean isHidden;

		private Attributes(String actorName, String type, boolean isHidden) {
			this.actorName = actorName;
			this.type = type;
			this.isHidden = isHidden;
		}
	}
}
