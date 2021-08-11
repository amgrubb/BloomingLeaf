package gson_classes;

public class BIFunctionSegment {
	private Attributes attributes;
	
	public String getRefEvidencePair() {
		return attributes.refEvidencePair;
	}
	public Integer getStartAT() {
		return attributes.startAT;
	}
	public String getStartTP() {
		return attributes.startTP;
	}
	public String getType() {
		return attributes.type;
	}
	
	private class Attributes {
		String refEvidencePair;
        Integer startAT;
        String startTP;
        String type;        
	}
}
