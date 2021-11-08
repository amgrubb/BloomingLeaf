package gson_classes;

public class BIFunctionSegment {
	private Attributes attributes;
	
	public BIFunctionSegment(String refEvidencePair, Integer startAT, String startTP, String type) {
		this.attributes = new Attributes(refEvidencePair, startAT, startTP, type);
	}
	
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
        
        public Attributes(String refEvidencePair, Integer startAT, String startTP, String type) {
        	this.refEvidencePair = refEvidencePair;
        	this.startAT = startAT;
        	this.startTP = startTP;
        	this.type = type;
        }
	}
}
