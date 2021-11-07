package gson_classes;

public class BIActor {
	private Attributes attributes;
	
	public BIActor(String actorName, String type) {
		attributes = new Attributes(actorName, type);
	}
	
	public String getActorName() {
		return attributes.actorName;
	}
	public String getType() {
		return attributes.type;
	}

	private class Attributes {
		String actorName;
		String type;
		
		private Attributes(String actorName, String type) {
			this.actorName = actorName;
			this.type = type;
		}
	}
}
