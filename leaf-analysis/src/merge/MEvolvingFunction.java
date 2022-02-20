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
	
	/**
	 * Builds timeline from segments + timing
	 * For input (Model A and Model B evolving functions)
	 */
	public MEvolvingFunction(List<MFunctionSegment> segments, List<String> timing) {
		if (MMain.DEBUG) System.out.println("Starting: MEvolvingFunction");

		this.segments = segments;
		this.timing = timing;
		
		// find evidence pair (or lack thereof) for every timepoint in timing
		buildTimeline();
	}
	
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
		buildSegments();
	}
	
	/******************************************************
	 * For input: turning function segments into a timeline
	 ******************************************************/
	
	private void buildTimeline() {
		if (MMain.DEBUG) System.out.println("Starting: buildTimeline");
		// adjust timing list to contain numeric times
		cleanTiming();

		// find evolving function's value at each point in the union of model timelines
		
		// to hold timeline values
		this.startTimes = new HashMap<>();
		this.endTimes = new HashMap<>();
		
		// add evidence pair for every time in given timeline
		for (String time: timing) {
			// model is stochastic (no value) outside its segments' domain
			if (!withinTimeline(time)) {
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
	
	/*
	 * Convert numeric timepoint names to just the number
	 */
	private void cleanTiming() {
		System.out.println(timing);
		for (int i=0; i<timing.size(); i++) {
			String time = timing.get(i);
			// take timepoint name after "-"
			String post = time.substring(time.indexOf('-')+1);
			// numeric - replace with just numbers
			if (MEPOperators.isNumeric(post)) {
				timing.set(i, post);
			}
		}
		System.out.println(timing);
	}
	
	private Boolean withinTimeline(String time) {
		// whether a given time is within the timeline of model A
		Boolean afterStarts = timing.indexOf(getTimelineStart()) <= timing.indexOf(time);
		Boolean beforeEnds = timing.indexOf(getTimelineEnd()) >= timing.indexOf(time);

		return afterStarts && beforeEnds;
	}
	
	private String getTimelineStart() {
		// return first time in segments list
		return segments.get(0).getStartTime();
	}
	
	private String getTimelineEnd() {
		// return last time in segments list
		return segments.get(segments.size()-1).getEndTime();
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
	 * For output: turning timeline into function segments
	 ******************************************************/
	
	private void buildSegments() {
		if (MMain.DEBUG) System.out.println("Starting: buildSegments");

		this.segments = new ArrayList<>();
		// build function between each timepoint
		for (int i = 0; i < timing.size()-1; i++) {
			if (MMain.DEBUG) System.out.println(i);
			String startTime = timing.get(i);
			String endTime = timing.get(i+1);
			segments.add(new MFunctionSegment(startTime, startTimes.get(startTime),
												 endTime, endTimes.get(endTime)));
		}
		if (MMain.DEBUG) System.out.println("Finished: buildSegments");
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
		// if otherVal is (no value), use (no value)???
		if (otherVal.equals("(no value)")) {
			return "(no value)";
		}
		
		// get interval bounds
		String lowerBound = getIntervalLowerBound(midtime);
		String upperBound = getIntervalUpperBound(midtime);

		// if otherVal is within interval, keep otherVal
		if (MEPOperators.greater(otherVal, lowerBound) &&
				MEPOperators.lt(otherVal, upperBound)) {
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
	
	public List<String> getTiming(){
		return timing;
	}
	
	public HashMap<String, String> getStartTimeline(){
		return startTimes;
	}
	
	public HashMap<String, String> getEndTimeline(){
		return endTimes;
	}
	
	public String getStartingEvidencePair(String time) {
		return startTimes.get(time);
	}
	
	public String getEndingEvidencePair(String time) {
		return endTimes.get(time);
	}
	
	public void printMe() {
		System.out.println("Timeline:");
		String time;
		
		// print start time
		time = timing.get(0);
		System.out.printf("(%s)  %s<-", time, startTimes.get(time));
		
		// print middle times
		for (int i=1; i<timing.size()-1; i++) {
			time = timing.get(i);
			System.out.printf("->%s  (%s)  %s<-", endTimes.get(time), time, startTimes.get(time));
		}
		
		// print end time
		time = timing.get(timing.size()-1);
		System.out.printf("->%s  (%s)", endTimes.get(time), time);
		
		System.out.println("\nSegments:");
		System.out.println(segments);
	}
}
