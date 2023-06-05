package merge;

import simulation.FunctionSegment;
/**
 * Merge function segment
 * Adds end timepoints
 * And starting evidence pairs
 * @author krh
 *
 */
public class MFunctionSegment extends FunctionSegment{
	/**
	 * Inherits:
	 * String startTP;
	 * Integer startAT;
	 * String type;
	 * String refEvidencePair;
	 */
	private String endTP;
	private Integer endAT;
	private String startEvidencePair;
	
	/**
	 * For initial + middle segments: Build from the segment, following segment, and starting evidence pair
	 */
	public MFunctionSegment(FunctionSegment fSeg, FunctionSegment fSegNext, String startEvidencePair) {
		super(fSeg.getType(), fSeg.getRefEvidencePair(), fSeg.getStartTP(), fSeg.getStartAT());
		this.endTP = fSegNext.getStartTP();
		this.endAT = fSegNext.getStartAT();
		this.startEvidencePair = assignStartValue(startEvidencePair); // assign based on type and previous type
	}
	
	/**
	 * For final segments: build from segment, maxTime, and starting evidence pair
	 */
	public MFunctionSegment(FunctionSegment fSeg, Integer maxTime, String maxTimeName, String startEvidencePair) {
		super(fSeg.getType(), fSeg.getRefEvidencePair(), fSeg.getStartTP(), fSeg.getStartAT());
		this.endTP = maxTimeName;
		this.endAT = maxTime;
		if (this.getType().equals("I") || this.getType().equals("D")) {
			this.startEvidencePair = startEvidencePair;  // for I or D functions, start != end
		} else {
			this.startEvidencePair = this.getRefEvidencePair();  // for C or stochastic functions, start == end
		}
	}
	
	/**
	 * For segments we build: assign start and endpoints and detect type
	 */
	public MFunctionSegment(String startTP, Integer startAT, String startEvidencePair, 
			String endTP, Integer endAT, String endEvidencePair) {
		super("", endEvidencePair, startTP, startAT);
		this.setType(this.assignType(startEvidencePair, endEvidencePair));
		this.endTP = endTP;
		this.endAT = endAT;
		this.startEvidencePair = startEvidencePair;
		
	}	
	
	
	/**
	 * Get Start Satisfaction Value
	 * assign a start value if type is I/D and previous function is stochastic
	 * *returns the start value*
	 */
	private String assignStartValue(String startValue) {
		String endValue = this.getRefEvidencePair();		
		if ((this.getType().equals("I") || this.getType().equals("D")) && !startValue.equals("(no value)")) {
			// function is I/D and previous function != stochastic
			return startValue;
		} else if (this.getType().equals("I")) {
			// function is I and previous function == stochastic
			if (endValue.equals("0011") || endValue.equals("0010")) {  // (part) satisfied increase from none
				return "0000";
			} else {
				return "1100";  // none and part denied increase from denied
			}
		} else if (this.getType().equals("D")) {
			// function is D and previous function == stochastic
			if (endValue.equals("0010") || endValue.equals("0000")) {  // none and part satisfied decrease from satisfied
				return "0011";
			} else {
				return "0000";  // (part) denied decrease from none
			}
		} else {
			return endValue;  // constant and stochastic start == end
		}
	}
	
	/*
	 * Calculates type of function based on starting and ending evidence pair
	 * *returns the type*
	 */
	private String assignType(String startEvidencePair, String endEvidencePair) {
		// first remove stochastic
		if (startEvidencePair.equals("(no value)") || endEvidencePair.equals("(no value)")) {
			return "R";
		}
		
		// assign type based on comparison end ?= start
		int compare = MEPOperators.compare(endEvidencePair, startEvidencePair);
		if (compare > 0) {
			return "I";  // end > start
		} else if (compare < 0) {
			return "D";  // end < start
		} else {  // compare == 0
			return "C";
		}
	}
	
	/**
	 * Returns abs time if available
	 * If not then name of timepoint
	 * @return String
	 */
	public String getEndTime() {
		if (this.getEndAT() != null) {
			return Integer.toString(this.getEndAT());  // return string of abs time if exists
		} else {
			return this.getEndTP();  // else just name of relative time
		}
	}
	
	public String getEndTP() {
		return endTP;
	}
	public Integer getEndAT() {
		return endAT;
	}
	public String getStartEvidencePair() {
		return startEvidencePair;
	}
	
	public String toString() {
		this.startEvidencePair = assignStartValue(startEvidencePair);
		String out = "--MFunctionSegment:--\n";
		out += "Start: " + this.startEvidencePair + " " + this.getStartTP();
		if (this.getStartAT() != null) {
			out += " (" + Integer.toString(this.getStartAT()) + ")";
		}
		out += "\nEnd: " + this.getRefEvidencePair() + " " + endTP;
		if (endAT != null) {
			out += " (" + Integer.toString(endAT) + ")";
		}
		out += "\nType: " + this.getType();
		return out;
	}

}
