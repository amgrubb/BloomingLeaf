package gson_classes;

public class BIFunctionSegment {
	private Attributes attributes;
	
	/*
	 * Standard function segment
	 */
	// added current
	public BIFunctionSegment(String refEvidencePair, Integer startAT, String startTP, String type, boolean current) {
		this.attributes = new Attributes(refEvidencePair, startAT, startTP, type, current);
	}
	
	/*
	 * Function segment with additional info (start evidence pair) from merge algorithm
	 */
	// added current
	public BIFunctionSegment(String startEvidencePair, String endEvidencePair, String refEvidencePair,
								Integer startAT, String startTP, String type, boolean current) {
		this.attributes = new Attributes(startEvidencePair, endEvidencePair, refEvidencePair, startAT, startTP, type, current);
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
        // added
        boolean current;
        
        
        // added current
        public Attributes(String refEvidencePair, Integer startAT, String startTP, String type, boolean current) {
        	this.refEvidencePair = refEvidencePair;
        	this.startAT = startAT;
        	this.startTP = startTP;
        	this.type = type;
        	this.current = current;
        }
        
        // added current
        public Attributes(String startEvidencePair, String endEvidencePair, String refEvidencePair,
        				Integer startAT, String startTP, String type, boolean current) {
        	this.startEvidencePair = startEvidencePair;
        	this.endEvidencePair = endEvidencePair;
        	this.refEvidencePair = refEvidencePair;
        	this.startAT = startAT;
        	this.startTP = startTP;
        	this.type = type;
        	this.current = current;
        }
        

	}
}
