package merge;

import com.google.gson.Gson;

import simulation.*;

import java.util.*;

public class MergeAlgorithm {
	
	/**
	 * Merges two modelSpecs
	 * @param model1
	 * @param model2
	 * @param delta - how much longer model2 starts after model1 starts
	 * @return the merged model
	 */
	public static ModelSpec mergeModels(ModelSpec model1, ModelSpec model2, Integer delta){
		if (MMain.DEBUG) System.out.println("Starting: MergeAlgorithm");
		ModelSpec mergedModel = new ModelSpec();
		
		int originalMaxTime1 = model1.getMaxTime();
		
		// update the models' times
		updateTimeline(model1, model2, delta);
	
		// System.out.println("changed tps");
		// System.out.println(model2.getChangedTPNames());
		// System.out.println(model2.getAbsTimePoints());
		// System.out.println(model2.getModelTimePoints());  // private
		Intention intention1 = model1.getIntentions().get(2);
		Intention intention2 = model2.getIntentions().get(2);
		
		System.out.println(intention1.getName());
		System.out.println(intention2.getName());
		
		mergeEvolvingFunctions(intention1, intention2, 5, originalMaxTime1, model2.getMaxTime());
		
		return mergedModel;
	}
	
	/**
	 * Updates two modelSpecs' absolute and max time points
	 * @param model1
	 * @param model2
	 * @param delta
	 */
	public static void updateTimeline(ModelSpec model1, ModelSpec model2, Integer delta) {
		if (MMain.DEBUG) System.out.println("Starting: updateTimeline");
		
		// update max time for both models
		Integer oldMax = model2.getMaxTime();
		System.out.println(oldMax);
		model1.setMaxTime(oldMax + delta);
		model2.setMaxTime(oldMax + delta);
		
		// update absolute time points for model 2
		for(Integer absTP: model2.getAbsTP().values()) {
			absTP += delta;
		}
		
		// update absolute time points for model 2 stored in intentions
		for(Intention intention: model2.getIntentions()) {
			for(Integer absTP: intention.getUserEvals().keySet()) {
				absTP += delta;
			}
		}
		
		// TODO: update abs time points in evolving functions
	}
	
	public static void mergeIntentions(ModelSpec model1, ModelSpec model2, ModelSpec newModel) {
		ArrayList<Intention> mergedIntentions = new ArrayList<Intention>();
		
		for(Intention intention: model1.getIntentions()) {
			//update intention's ID and with some kind of tracking flag
			mergedIntentions.add(intention);
		}
		for(Intention intention: model2.getIntentions()) {
			//if mergedIntentions does not contain, add
			for(Intention mergedIntention: mergedIntentions) {
				if(intention.getName().equals(mergedIntention.getName())) {
					break;
				}
				
			}
		}
		
	}
	
	public static FunctionSegment[] mergeEvolvingFunctions(Intention intention1, Intention intention2, Integer delta, Integer maxTime1, Integer maxTime2) {
		// TODO: one intention is static - treat as constant function
		
		// contiguous function info
		if (maxTime1 == delta) {
			// append evolving functions
			FunctionSegment[] funcSeg1 = intention1.getEvolvingFunctions();
			FunctionSegment[] funcSeg2 = intention2.getEvolvingFunctions();
			FunctionSegment[] combined = new FunctionSegment[funcSeg1.length + funcSeg2.length]; // initialize array to hold info from both
			System.arraycopy(funcSeg1, 0, combined, 0, funcSeg1.length);  // copy first array into combined 
			System.arraycopy(funcSeg1, 0, combined, funcSeg1.length, funcSeg2.length);  // copy second array ""
			
			System.out.println("num func segments in combined:");
			System.out.println(combined.length);
			
			// TODO: edit repeat timeline names like two As
			// and rename initial in part 2
			// and update times in function segments of 2
			
			return combined;
		}
		
		// gap between function info
		if (maxTime1 < delta) {
			// create extra function segment for the gap, then copy rest of function segments over
			FunctionSegment fillGap = new FunctionSegment("R", "(no value)", "Max1", maxTime1);
			FunctionSegment[] funcSeg1 = intention1.getEvolvingFunctions();
			FunctionSegment[] funcSeg2 = intention2.getEvolvingFunctions();
			FunctionSegment[] combined = new FunctionSegment[funcSeg1.length + funcSeg2.length + 1]; // initialize array to hold info from both
			System.arraycopy(funcSeg1, 0, combined, 0, funcSeg1.length);  // copy first array into combined 
			combined[funcSeg1.length] = fillGap;  // add gap segment in the middle
			System.arraycopy(funcSeg1, 0, combined, funcSeg1.length+1, funcSeg2.length);  // copy second array ""
			
			System.out.println("num func segments in combined:");
			System.out.println(combined.length);
			
			// TODO: edit repeat timeline names like two As
			// and rename initial in part 2
			// and update times in function segments of 2
			
			return combined;
		}
		
		// else, overlapping timeline info
		int startOverlap = delta;
		int endOverlap = maxTime1;
		
		// unless delta is in timeline1 and maxtime1 is in timeline2, we're slicing intervals
		
		
		
		// find overlap
		// combine overlapping segments
		// insert into whole timeline
		
		// find timelines of intention 1 and 2
		List<String> tps1 = intention1.getEvolvingFunctionStartTPs();
		List<String> tps2 = intention2.getEvolvingFunctionStartTPs();
		tps1.add("Max");  // include max times
		tps2.add("Max");
		
		List<Integer> ats1 = intention1.getEvolvingFunctionStartATs();
		List<Integer> ats2 = intention2.getEvolvingFunctionStartATs();
		ats1.add(maxTime1);
		// increment second intention's timeline by delta
		// TODO: can remove when we increment all evolving functions in updateTimeline()
		for (int i = 0; i < ats2.size(); i++) {
			if (ats2.get(i) != null) {
				ats2.set(i, ats2.get(i) + delta);
			}
		}
		ats2.add(maxTime2);
		
		List<String> evPairs1 = intention1.getEvolvingFunctionRefEvidencePairs();
		List<String> evPairs2 = intention2.getEvolvingFunctionRefEvidencePairs();
		evPairs1.add(0, intention1.getInitialUserEval()); // also need initial sat value
		evPairs2.add(0, intention2.getInitialUserEval()); // in case first interval is increase/decrease
		
		System.out.println(tps1);
		System.out.println(tps2);
		System.out.println(ats1);
		System.out.println(ats2);
		System.out.println(evPairs1);
		System.out.println(evPairs2);	
		
		// convert function segments to format with
		// starttp (num or letter?)
		// stop tp
		// start eval
		// stop eval
		// type (not necessary?)
		
		List<MFunctionSegment> segs1 = completeFunctionInfo(intention1.getEvolvingFunctions(), intention1.getInitialUserEval(), maxTime1);
		List<MFunctionSegment> segs2 = completeFunctionInfo(intention2.getEvolvingFunctions(), intention2.getInitialUserEval(), maxTime2);
		String[] timing = {"0", "5", "A", "100", "105"};
		
		List<MFunctionSegment> mergedSegments = mergeFunctionSegments(segs1, segs2, timing, delta);
		
		System.out.println("int 1");
		
		for (MFunctionSegment seg: segs1) {
			System.out.println(seg.getStartTP());
			System.out.println(seg.getStartAT());
			System.out.println(seg.getStartEvidencePair());
			System.out.println(seg.getType());
			System.out.println(seg.getEndTP());
			System.out.println(seg.getEndAT());
			System.out.println(seg.getRefEvidencePair());
		}
		
		System.out.println("int 2");
		
		for (MFunctionSegment seg: segs2) {
			System.out.println(seg.getStartTP());
			System.out.println(seg.getStartAT());
			System.out.println(seg.getStartEvidencePair());
			System.out.println(seg.getType());
			System.out.println(seg.getEndTP());
			System.out.println(seg.getEndAT());
			System.out.println(seg.getRefEvidencePair());
		}
		
		/**
		for (FunctionSegment func: intention1.getEvolvingFunctions()) {
			System.out.println("intention1:");
			System.out.println(func.getStartTP());
			System.out.println(func.getStartAT());
			System.out.println(func.getType());
			System.out.println(func.getRefEvidencePair());
		}
		
		for (FunctionSegment func: intention2.getEvolvingFunctions()) {
			System.out.println("intention2:");
			System.out.println(func.getStartTP());
			System.out.println(func.getStartAT());
			System.out.println(func.getType());
			System.out.println(func.getRefEvidencePair());
		}
		
		System.out.println(intention1.getEvolvingFunctions());
		System.out.println(intention2.getEvolvingFunctions());
		*/
		
		// then convert back to functionSegment
		
		return new FunctionSegment[2];
	}
	
	private static String consensus(String evPair1, String evPair2) {
		// consensus of "(no value)" and evPair2 is evPair2
		if (evPair1.equals("(no value)")) {
			return evPair2;
		} else if (evPair2.equals("(no value)")) {
			return evPair1;
		}
		
		// consensus: for each 0/1 in evpairs (e.g. "0010"),
		// 1 if both 1, else 0
		String result = "";
		for(int i = 0; i < 4; i++) {
			// append 1 if both 1, else 0
		   if (evPair1.charAt(i) == '1' && evPair2.charAt(i) == '1') {
			   result += "1";
		   } else {
			   result += "0";  
		   }
		}
		
		return result;
	}
	
	/**
	 * Determines start evidence pairs and end times for function segments
	 */
	private static List<MFunctionSegment> completeFunctionInfo(FunctionSegment[] oldSegs, String initialEval, Integer maxTime){
		List<MFunctionSegment> newSegs = new ArrayList<>();
		
		// special cases: 0 or 1 oldSegs in list
		if (oldSegs.length == 0) {
			return newSegs;
		} else if (oldSegs.length == 1) {
			// if only segment, uses both initialEval and maxTime 
			MFunctionSegment onlySeg = new MFunctionSegment(oldSegs[0], maxTime, initialEval);
			newSegs.add(onlySeg);
			return newSegs;
		}
		
		// first segment uses initial user evaluation
		MFunctionSegment firstSeg = new MFunctionSegment(oldSegs[0], oldSegs[1], initialEval);
		newSegs.add(firstSeg);
		
		// add MFunctionSeg for each old segment
		// needs segment, next segment, and previous segment's evidence pair
		for (int i=1; i<oldSegs.length-1; i++) {
			MFunctionSegment newSeg = new MFunctionSegment(oldSegs[i], oldSegs[i+1], oldSegs[i-1].getRefEvidencePair());
			newSegs.add(newSeg);
		}
		
		// last segment uses maxTime
		MFunctionSegment lastSeg = new MFunctionSegment(oldSegs[oldSegs.length-1], maxTime, oldSegs[oldSegs.length-2].getRefEvidencePair());
		newSegs.add(lastSeg);
		
		return newSegs;
	}
	
	private static List<MFunctionSegment> mergeFunctionSegments(List<MFunctionSegment> segments1, List<MFunctionSegment> segments2, String[] timingInfo, Integer delta){
		List<MFunctionSegment> newSegs = new ArrayList<>();
		// String[] timing = {"0", "A", "95", "100", "195"};
		// just 1 overlapping segment for now
		
		// for segment in m1?
		// 
		
		// TODO: need comparison for sat values
		
		// find overlapping segments
		
		// add m1 before overlap
		// resolve overlap
		
		// a, b, endAB
		//MFunctionSegment seg1 = segments1.get(1);
		//MFunctionSegment seg2 = segments2.get(0);
		
		// first seg starts same
		// ends at [b or consensus b and closest part of interval]
		
		// second seg starts there
		// and ends at orig end
		
		
		
		// loop over m1 timelines
		// until reach overlap with start of m2
		
	
		// counters for looping over segments from mA and mB
		int segA = 0;
		int segB = 0;
		
		// keep track of start of segment B
		String startB = segments2.get(segB).getStartTime();
		
		// loop over A segments until reach overlap
		for (/*segA = 0*/; segA < segments1.size(); segA++) {
			MFunctionSegment seg = segments1.get(segA);
			// first check for no overlap w/ B
			String end = seg.getEndTime();
			if (timing.indexOf(end) > timing.indexOf(startB)) {
				break;
			}
			
			// add to final segments
			newSegs.add(seg);
		}
		
		// now overlap for mA begins w/ segment at segA
		// for now: assume end at same timepoint

		
		// three cases:
		// perfect match
		// overlap on right
		// overlap on both sides
		
		// fourth case of overlap on left if multiple overlapping segments?
		// for every pair of overlapping segments
		
		
		// take the L segment of the first one
		// and the overlapping segment
		// but leave the R segmment for the next iteration?
		
		// this doesn't work because mB then overlaps with the next mA
		
		while (segA < segments1.size() && segB < segments2.size()) {
			MFunctionSegment mA = segments1.get(segA);
			MFunctionSegment mB = segments2.get(segB);
			List<MFunctionSegment> resolvedOverlap = mergeOverlappingFunctionSegments(mA, mB);
			newSegs.addAll(resolvedOverlap);
		}
		
		
		MFunctionSegment segggg = new MFunctionSegment(startTP, startEvidencePair, endTP, endEvidencePair);
		
		
		// add m2 after overlap
		
		
		
		return newSegs;
	}
	
	public static int compareEvidencePairs(String start, String end) {
		/* is end > start (1 or above)
		 * end == start (0)
		 * or end < start (-1 and below)
		 * */
		
		// first, return equals for stochastic
		if (start.equals("(no value)") || end.equals("(no value)")) {
			return 0;
		}
		
		// hashmap for comparing evidence pairs
		HashMap<String, Integer> compareEP = new HashMap<>();
		compareEP.put("0011", 2);   // fully satisfied
		compareEP.put("0010", 1);   // partially satisfied
		compareEP.put("0000", 0);   // none
		compareEP.put("0100", -1);  // partially denied
		compareEP.put("1100", -2);  // fully denied
		
		// find difference between evidence pairs
		return compareEP.get(end) - compareEP.get(start);
	}
	
}
