package gson_classes;

import java.util.List;

public class BIEvolvingFunction {
	private Attributes attributes;
	public List<BIFunctionSegment> getFunctionSegList() {
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
		List<BIFunctionSegment> functionSegList; 
        Boolean hasRepeat;
        Integer repAbsTime;
        Integer repCount;
        String repStart;
        String repStop;
        String type;        
	}
}
