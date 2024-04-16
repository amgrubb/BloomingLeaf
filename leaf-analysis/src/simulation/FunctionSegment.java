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
	public void setStartTP(String startTP) {
		this.startTP = startTP;
	}
	public Integer getStartAT() {
		return startAT;
	}
	/**
	 * Increment abs timepoint by delta if abs timepoint is known
	 * @param delta
	 */
	public void incrementStartAT(Integer delta) {
		if (startAT != null) {
			startAT += delta;
		}
	}
	/**
	 * Returns abs time if available
	 * If not then name of timepoint
	 * @return String
	 */
	public String getStartTime() {
		if (this.getStartAT() != null) {
			return Integer.toString(this.getStartAT());  // return string of abs time if exists
		} else {
			return this.getStartTP();  // else just name of relative time
		}
	}
	public String getStartTimeIncremented(Integer delta) {
		if (this.getStartAT() != null) {
			return Integer.toString(this.getStartAT() + delta);  // return string of abs time if exists
		} else {
			return this.getStartTP();  // else just name of relative time
		}
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getRefEvidencePair() {
		return refEvidencePair;
	}
	public void updateStartTP(String startTP) {
		this.startTP = startTP;
	} 
	
	
}
