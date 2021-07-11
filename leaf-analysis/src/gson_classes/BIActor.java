package gson_classes;

public class BIActor {
	private Attributes attributes;
	public String getActorName() {
		return attributes.actorName;
	}
	public String getType() {
		return attributes.type;
	}	

	private class Attributes {
		String actorName;
		String type;
	}
}
