package simulation;

public class FunctionSegment {
	private String startTP;
	private Integer startAT;
	private String type;
	private String refEvidencePair;
	
	public FunctionSegment(String type, String refEvidencePair, String startTimePoint, Integer startAbsTime, String intentionID) {
		if (startAbsTime != null && startAbsTime == 0)
			this.startTP = "Initial";
		else
			this.startTP = "E" + intentionID + "TP" + startTimePoint.charAt(0);
		this.startAT = startAbsTime;
		this.type = type;
		this.refEvidencePair = refEvidencePair;
	} 
	public FunctionSegment(String type, String refEvidencePair, String startTimePoint, Integer startAbsTime) {
		this.startTP = startTimePoint;
		this.startAT = startAbsTime;
		this.type = type;
		this.refEvidencePair = refEvidencePair;
	}
	public String getStartTP() {
		return startTP;
	}
	public Integer getStartAT() {
		return startAT;
	}
	public String getType() {
		return type;
	}
	public String getRefEvidencePair() {
		return refEvidencePair;
	}
	public void updateStartTP(String startTP) {
		this.startTP = startTP;
	} 
	
	
}
