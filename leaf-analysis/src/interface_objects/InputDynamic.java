package interface_objects;

public class InputDynamic{
	private String intentionID;
	private String dynamicType;
	private String markedValue;
	private String line;
	
	public String getIntentionID() {
		return intentionID;
	}
	
	public void setIntentionID(String intentionID) {
		this.intentionID = intentionID;
	}
	
	public String getDynamicType() {
		return dynamicType;
	}
	
	public void setDynamicType(String dynamicType) {
		this.dynamicType = dynamicType;
	}

	public String getMarkedValue() {
		return markedValue;
	}
	
	public void setMarkedValue(String markedValue) {
		this.markedValue = markedValue;
	}

	public String getLine() {
		return line;
	}

	public void setLine(String line) {
		this.line = line;
	}
	
}