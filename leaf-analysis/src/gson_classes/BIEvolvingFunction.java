package gson_classes;

public class BIEvolvingFunction {
	private Attributes attributes;
	
	public BIEvolvingFunction(BIFunctionSegment[] functionSegList, String type) {
		this.attributes = new Attributes(functionSegList, type);
	}
	
	public BIFunctionSegment[] getFunctionSegList() {
		return attributes.functionSegList;
	}
	public Boolean getHasRepeat() {
		return attributes.hasRepeat;
	}
	public Integer getRepAbsTime() {
		return attributes.repAbsTime;
	}
	public Integer getRepCount() {
		return attributes.repCount;
	}
	public String getRepStart() {
		return attributes.repStart;
	}
	public String getRepStop() {
		return attributes.repStop;
	}
	public String getType() {
		return attributes.type;
	}
	
	private class Attributes {  
		BIFunctionSegment[] functionSegList; 
        Boolean hasRepeat;
        Integer repAbsTime;
        Integer repCount;
        String repStart;
        String repStop;
        String type; 
        
        public Attributes(BIFunctionSegment[] functionSegList, String type) {
        	this.functionSegList = functionSegList;
        	this.type = type;
        	this.hasRepeat = false;
        	this.repAbsTime = null;
        	this.repCount = null;
        	this.repStart = null;
        	this.repStop = null;
        }
	}
}
