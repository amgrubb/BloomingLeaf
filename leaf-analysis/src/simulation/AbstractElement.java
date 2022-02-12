package simulation;

public abstract class AbstractElement {
    protected String uniqueID = null;

	public AbstractElement(String uniqueID) {
		this.uniqueID = uniqueID;
	}
	public String getUniqueID() {
		return this.uniqueID;
	}
	public String getName() {
		return this.uniqueID;
	}
}
