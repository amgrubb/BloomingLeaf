package merge;

import java.util.HashMap;
import java.util.List;

/**
 * This class stores timing information as imported from PreMerge's output json
 * @author krh
 *
 */

public class TMain {
	private Integer timingOffset;
	private List<TIntention> timingList;
	private HashMap<String, TIntention> timingsMap;
	
	public void initializeTiming(Integer maxTimeA, Integer maxTimeB) {
		// remove empty timing at end
		timingList.remove(timingList.size()-1);
		// create map of intention name to timing, for ease of access
		timingsMap = new HashMap<>();
		for (TIntention timing: timingList) {
			// update newTimeOrder with integers for maxTimes
			timing.setMaxTimesNumeric(maxTimeA, maxTimeB);
			
			// also initialize rename maps for renaming times
			timing.setRenameMaps();
			timingsMap.put(timing.getIntention(), timing);
		}
	}
	public Integer getTimingOffset() {
		return timingOffset;
	}
	public List<TIntention> getTimingList() {
		return timingList;
	}
	public HashMap<String, TIntention> getTimingsMap(){
		return timingsMap;
	}
	public TIntention getTiming(String intentionName) {
		return timingsMap.get(intentionName);
	}
	/* Whether timing exists to be renamed for this intention */
	public Boolean hasTiming(String intentionName) {
		return timingsMap.containsKey(intentionName);
	}
}
