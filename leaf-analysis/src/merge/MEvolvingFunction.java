package merge;

import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;

public class MEvolvingFunction {
	// evolving function segments from the intention in the model
	private List<MFunctionSegment> segments;
	
	// ordered timing info for all models involved in merge
	private List<String> timing;
	
	// calculated timeline info
	// end of one segment may != start of next, so keep separate start and end times
	private HashMap<String, String> startTimes;  // <time, evidence pair>
	private HashMap<String, String> endTimes;    // <time, evidence pair>
	
	/******************************************************
	 * For output: turning timeline into function segments
	 ******************************************************/
	/**
	 * Builds segments from timeline + timing
	 * For output (Merged evolving function)
	 * Need timing list for order of times, and timeline for values at times
	 */
	public MEvolvingFunction(HashMap<String, String> startTimes, HashMap<String, String> endTimes, List<String> timing) {
		this.startTimes = startTimes;
		this.endTimes = endTimes;
		this.timing = timing;
		
		// build evolving functions for merged intention
		if (MMain.DEBUG) System.out.println("Starting: buildSegments");

		this.segments = new ArrayList<>();

		char letter = '0';
		for (int i = 0; i < timing.size()-1; i++) {
			char startTP = letter;
			if (i == 0) 
				letter = 'A';
			else
				letter += 1;
			char endTP = letter;
			
			String startTime = timing.get(i);
			String endTime = timing.get(i+1);
			Integer startAT = null;
			Integer endAT = null;
			try {
				startAT = Integer.parseUnsignedInt(startTime);
			} catch (NumberFormatException nfe) {
				
			}
			try {
				endAT = Integer.parseUnsignedInt(endTime);
			} catch (NumberFormatException nfe) {
				
			}
			
			segments.add(new MFunctionSegment(String.valueOf(startTP), startAT, startTimes.get(startTime),
											  String.valueOf(endTP), endAT, endTimes.get(endTime)));
		}
	}
	

	/******************************************************
	 * For input: turning function segments into a timeline
	 ******************************************************/
	/**
	 * Builds timeline from segments + timing
	 * For input (Model A and Model B evolving functions)
	 */
	public MEvolvingFunction(List<MFunctionSegment> segments, List<String> timing) {
		if (MMain.DEBUG) System.out.println("Starting: MEvolvingFunction");

		this.segments = segments;
		this.timing = timing;
		
		// to hold timeline values
		this.startTimes = new HashMap<>();
		this.endTimes = new HashMap<>();
		
		if (MMain.DEBUG) System.out.println("Starting: buildTimeline");

		// find evolving function's value at each point in the union of model timelines
		System.out.println(timing.toString());
		// add evidence pair for every time in given timeline
		for (String time: timing) {
			// model is stochastic (no value) outside its segments' domain
			if (!withinTimeline(time)) {		//TODO: Redo this part!!
				startTimes.put(time, "(no value)");
				endTimes.put(time, "(no value)");
				
			} else if (time.equals(getTimelineStart())) {
				startTimes.put(time,  findTimelineStartValue(time));  // we have the start of this segment
				endTimes.put(time, "(no value)");
			
			} else if (time.equals(getTimelineEnd())) {
				endTimes.put(time,  findTimelineEndValue(time));  // we have the end of this segment
				startTimes.put(time, "(no value)");  // but not the start of the next segment
			
			} else {
				// within timeline, look up timelineA value at that time
				startTimes.put(time, findTimelineStartValue(time));
				endTimes.put(time, findTimelineEndValue(time));
			}
			
			
		}
	}
	
//	/*
//	 * Convert numeric timepoint names to just the number
//	 */
//	private void cleanTiming() {
//		for (int i=0; i<timing.size(); i++) {
//			String time = timing.get(i);
//			// take timepoint name after "-"
//			String post = time.substring(time.indexOf('-')+1);
//			// numeric - replace with just numbers
//			if (MEPOperators.isNumeric(post)) {
//				timing.set(i, post);
//			}
//		}
//	}
	
	private Boolean withinTimeline(String time) {
		// whether a given time is within the timeline of model A
		Boolean afterStarts = timing.indexOf(getTimelineStart()) <= timing.indexOf(time);
		Boolean beforeEnds = timing.indexOf(getTimelineEnd()) >= timing.indexOf(time);

		return afterStarts && beforeEnds;
	}
	
	private String getTimelineStart() {
		// return first time in segments list
		return this.segments.get(0).getStartTime();
	}
	
	private String getTimelineEnd() {			//TODO: What about Max time.
		// return last time in segments list
		System.out.println(this.segments.get(this.segments.size()-1).getEndTime());
		return this.segments.get(this.segments.size()-1).getEndTime();
	}
	
	private String findTimelineStartValue(String time) {
		/*// if time is maxTime, report end evidence pair
		MFunctionSegment lastSegment = segments.get(segments.size()-1);
		if (time.equals(lastSegment.getEndTime())) {
			return lastSegment.getRefEvidencePair();
		}*/
		
		// find function segment that starts with time, and return start evpair
		for (MFunctionSegment seg: segments) {
			if (seg.getStartTime().equals(time)) {
				return seg.getStartEvidencePair();
			}
		}
		
		// otherwise, return flag for mid-function segment time
		// NOTE: we should not reach this value from outside the timeline of model
		return "mid";
	}
	
	private String findTimelineEndValue(String time) {
		// if time is startTime, report initial evidence pair
		MFunctionSegment firstSegment = segments.get(0);
		if (time.equals(firstSegment.getStartTime())) {
			return firstSegment.getStartEvidencePair();
		}
		
		// find function segment that ends with time, and return end evpair
		for (MFunctionSegment seg: segments) {
			if (seg.getEndTime().equals(time)) {
				return seg.getRefEvidencePair();
			}
		}
		
		// otherwise, return flag for mid-function segment time
		// NOTE: we should not reach this value from outside the timeline of model
		return "mid";
	}
		
	/******************************************************
	 * Assists MergeEvolvingFunction
	 ******************************************************/
	
	/**
	 * @param time - a time in the middle of a known interval (timeline value "mid")
	 * @param otherVal - the value (evidence pair) of the other model at this point
	 * in the timeline
	 * 
	 * @return - merged value at that time
	 */
	public String mid(String midtime, String otherVal) {		
		// get interval bounds
		String lowerBound = getIntervalLowerBound(midtime);
		String upperBound = getIntervalUpperBound(midtime);

		// if otherVal is within interval, keep otherVal
		if (MEPOperators.inbounds(otherVal, lowerBound, upperBound)) {
			return otherVal;
		}
		
		// else if otherVal conflicts with interval, take consensus
		// with closest bound of interval
		// (closest in terms of evidence value)
		if (MEPOperators.dist(otherVal, lowerBound) <= MEPOperators.dist(otherVal, upperBound)) {
			// closer to lowerBound
			return MEPOperators.consensus(otherVal, lowerBound);
		} else {
			// closer to upperBound
			return MEPOperators.consensus(otherVal, upperBound);
		}
		
	}
	
	/**
	 * @param time - a time in the middle of a function segment (timeline value "mid")
	 * @return - find the evidence pair at the beginning of the segment
	 */
	private String getIntervalLowerBound(String time) {
		// decrement i until we find a time w/ value not "mid"
		int i = timing.indexOf(time);
		for (; startTimes.get(timing.get(i)).equals("mid"); i--) {}
		
		// return evidence pair at that time
		return startTimes.get(timing.get(i));
	}
	
	/**
	 * @param time - a time in the middle of a function segment (timeline value "mid")
	 * @return - find the evidence pair at the end of the segment
	 */
	private String getIntervalUpperBound(String time) {
		// increment i until we find a time w/ value not "mid"
		int i = timing.indexOf(time);
		for (; endTimes.get(timing.get(i)).equals("mid"); i++) {}
		
		// return evidence pair at that time
		return endTimes.get(timing.get(i));
	}
	
	/******************************************************
	 * Getters
	 ******************************************************/
	public List<MFunctionSegment> getSegments(){
		return segments;
	}
	
	public String getStartingEvidencePair(String time) {
		return startTimes.get(time);
	}
	
	public String getEndingEvidencePair(String time) {
		return endTimes.get(time);
	}
	
	public String toString() {
		String out = "Timeline:\n";
		String time;
		
		// print start time
		time = timing.get(0);
		out += String.format("(%s)  %s<-", time, startTimes.get(time));
		
		// print middle times
		for (int i=1; i<timing.size()-1; i++) {
			time = timing.get(i);
			out += String.format("->%s  (%s)  %s<-", endTimes.get(time), time, startTimes.get(time));
		}
		
		// print end time
		time = timing.get(timing.size()-1);
		out += String.format("->%s  (%s)", endTimes.get(time), time);
		
		out += "\nSegments:\n";
		out += segments.toString();
		
		return out;
	}
}
