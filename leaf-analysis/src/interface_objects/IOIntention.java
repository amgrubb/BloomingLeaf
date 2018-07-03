package interface_objects;

import simulation.IntentionalElementType;

public class IOIntention {

	String id;
	String[] status;
	IntentionalElementType type;
	String actorId;
	
	public String getActorId() {
		return actorId;
	}

	public void setActorId(String actorId) {
		this.actorId = actorId;
	}

	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public String[] getStatus() {
		return status;
	}
	
	public void setStatus(String[] status) {
		this.status = status;
	}

	public IntentionalElementType getType() {
		return type;
	}

	public void setType(IntentionalElementType type) {
		this.type = type;
	}
	
}
