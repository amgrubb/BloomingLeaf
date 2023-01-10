package gson_classes;

public class BIFunctionSegment {
	private Attributes attributes;
	
	/*
	 * Standard function segment
	 */
	public BIFunctionSegment(String refEvidencePair, Integer startAT, String startTP, String type) {
		this.attributes = new Attributes(refEvidencePair, startAT, startTP, type);
	}
	
	/*
	 * Function segment with additional info (start evidence pair) from merge algorithm
	 */
	public BIFunctionSegment(String startEvidencePair, String endEvidencePair, String refEvidencePair,
								Integer startAT, String startTP, String type) {
		this.attributes = new Attributes(startEvidencePair, endEvidencePair, refEvidencePair, startAT, startTP, type);
	}
	
	public String getStartEvidencePair() {
		return attributes.startEvidencePair;
	}
	public String getEndEvidencePair() {
		return attributes.endEvidencePair;
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
		String startEvidencePair;
		String endEvidencePair;
		String refEvidencePair;  // same as end
        Integer startAT;
        String startTP;
        String type; 
        
        public Attributes(String refEvidencePair, Integer startAT, String startTP, String type) {
        	this.refEvidencePair = refEvidencePair;
        	this.startAT = startAT;
        	this.startTP = startTP;
        	this.type = type;
        }
        
        public Attributes(String startEvidencePair, String endEvidencePair, String refEvidencePair,
        				Integer startAT, String startTP, String type) {
        	this.startEvidencePair = startEvidencePair;
        	this.endEvidencePair = endEvidencePair;
        	this.refEvidencePair = refEvidencePair;
        	this.startAT = startAT;
        	this.startTP = startTP;
        	this.type = type;
        }
	}
}
