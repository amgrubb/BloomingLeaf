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
	private HashMap<String, String> timeline;
	
	/**
	 * Builds timeline from segments + timing
	 * For input (Model A and Model B evolving functions)
	 */
	public MEvolvingFunction(List<MFunctionSegment> segments, List<String> timing) {
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
	public MEvolvingFunction(HashMap<String, String> timeline, List<String> timing) {
		this.timeline = timeline;
		this.timing = timing;
		
		// build evolving functions for merged intention
		buildSegments();
	}
	
	/******************************************************
	 * For input: turning function segments into a timeline
	 ******************************************************/
	
	private void buildTimeline() {
		// find evolving function's value at each point in the union of model timelines
		
		// to hold timeline values
		this.timeline = new HashMap<>();
		
		// add evidence pair for every time in given timeline
		for (String time: timing) {
			// model is stochastic (no value) outside its segments' domain
			if (!withinTimeline(time)) {
				timeline.put(time, "(no value)");
			}
			
			// within timeline, look up timelineA value at that time
			timeline.put(time, findTimelineValue(time));
		}
		
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
	
	private String findTimelineValue(String time) {
		// if time is maxTime, report end evidence pair
		MFunctionSegment lastSegment = segments.get(segments.size()-1);
		if (time.equals(lastSegment.getEndTime())) {
			return lastSegment.getRefEvidencePair();
		}
		
		// find function segment that starts with time, and return start evpair
		for (MFunctionSegment seg: segments) {
			if (seg.getStartTime().equals(time)) {
				return seg.getStartEvidencePair();
			}
		}
		
		// otherwise, return flag for mid-function segment time
		// NOTE: we should not reach this value from outside the timeline of A
		return "mid";
	}
	
	/******************************************************
	 * For output: turning timeline into function segments
	 ******************************************************/
	
	private void buildSegments() {
		this.segments = new ArrayList<>();
		// build function between each timepoint
		for (int i = 0; i < timing.size()-1; i++) {
			String startTime = timing.get(i);
			String endTime = timing.get(i+1);
			segments.add(new MFunctionSegment(startTime, timeline.get(startTime),
												 endTime, timeline.get(endTime)));
		}
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
	public String mid(String time, String otherVal) {
		String lowerBound = getIntervalLowerBound(time);
		String upperBound = getIntervalUpperBound(time);
		
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
		int i;
		for (i = timing.indexOf(time); timeline.get(timing.get(i)).equals("mid"); i--) {}
		
		// return evidence pair at that time
		return timeline.get(timing.get(i));
	}
	
	/**
	 * @param time - a time in the middle of a function segment (timeline value "mid")
	 * @return - find the evidence pair at the end of the segment
	 */
	private String getIntervalUpperBound(String time) {
		// increment i until we find a time w/ value not "mid"
		int i;
		for (i = timing.indexOf(time); timeline.get(timing.get(i)).equals("mid"); i++) {}
		
		// return evidence pair at that time
		return timeline.get(timing.get(i));
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
	
	public HashMap<String, String> getTimeline(){
		return timeline;
	}
	
	public String getEvidencePair(String time) {
		return timeline.get(time);
	}
}
