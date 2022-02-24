package merge;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

import simulation.FunctionSegment;

public class MergeEvolvingFunction {
	
	// make A and B MEvolvingFunctions and merge
	private MEvolvingFunction funcA;
	private MEvolvingFunction funcB;
	private MEvolvingFunction funcMerged;
	
	private List<String> timing;
	
	public MergeEvolvingFunction(List<MFunctionSegment> segsA, List<MFunctionSegment> segsB, List<String> timing) {
		this.funcA = new MEvolvingFunction(segsA, timing);
		this.funcB = new MEvolvingFunction(segsB, timing);
		this.timing = timing;
		
		if (MMain.DEBUG) System.out.println("------------------------------------------------------------");
		if (MMain.DEBUG) System.out.println("Merging Evolving Functions:");
		if (MMain.DEBUG) System.out.println(funcA.toString());
		if (MMain.DEBUG) System.out.println(funcB.toString());
		
		doEvolvingFunctionMerge();
		
		if (MMain.DEBUG) System.out.println("--------------------");
		if (MMain.DEBUG) System.out.println("Result:");
		if (MMain.DEBUG) System.out.println(funcMerged.toString());
		if (MMain.DEBUG) System.out.println("------------------------------------------------------------");
	}
	
	/***************************
	 * Building merged timeline
	 ***************************/
	
	/**
	 * merge funcA and funcB into merged timeline
	 */
	private void doEvolvingFunctionMerge() {
		if (MMain.DEBUG) System.out.println("Starting: doEvolvingFunctionMerge");

		HashMap<String, String> newStartingTimeline = new HashMap<>();
		HashMap<String, String> newEndingTimeline = new HashMap<>();
		String mergedEnd, mergedStart;
		
		// create new timeline
		for (String time: timing) {
			// find merged value at time
			mergedEnd = getMergedValueAtTime(time, funcA.getEndingEvidencePair(time), funcB.getEndingEvidencePair(time));
			mergedStart = getMergedValueAtTime(time, funcA.getStartingEvidencePair(time), funcB.getStartingEvidencePair(time));
			
			// logic for using other value @ timepoint when calculating mid of stochastic value
			if (mergedEnd == "other" && mergedStart == "other") {
				mergedEnd = "no value";
				mergedStart = "no value";
			} else if (mergedEnd == "other") {
				mergedEnd = mergedStart;
			} else if (mergedStart == "other") {
				mergedStart = mergedEnd;
			}
			
			// insert into new timeline
			newEndingTimeline.put(time, mergedEnd);
			newStartingTimeline.put(time, mergedStart);
		}
		
		// construct MEvolvingFunction from new timeline
		this.funcMerged = new MEvolvingFunction(newStartingTimeline, newEndingTimeline, timing);
	}
	
	/**
	 * merge values for A and B at specific time
	 */
	private String getMergedValueAtTime(String time, String valueA, String valueB) {
		if (MMain.DEBUG) System.out.println("Starting: getMergedValueAtTime: " + time);
		// note: should never have "mid" for both values
		// (middle of function for both models)
		if (valueA.equals("mid") && valueB.equals("mid")) {
			if (MMain.DEBUG) System.out.println("Warning: merging two mids");
		}
		
		// if stochastic with mid, use other value at point
		if ((valueA.equals("(no value)") && valueB.equals("mid")) || (valueA.equals("mid") && valueB.equals("(no value)"))) {
			return "other";  // other flag
		}
		
		// if valueA or valueB is a mid value, use mid operator
		// note: from above, we don't need to calculate mid() with (no value)
		if (valueA.equals("mid")) {
			return funcA.mid(time, valueB);
		} else if (valueB.equals("mid")) {
			return funcB.mid(time, valueA);
		}
		
		// otherwise, if we have values for both,
		// use consensus operator
		else {
			return MEPOperators.consensus(valueA, valueB);
		}
	}
	
	/****************************
	 * Outputting merged timeline
	 ****************************/
	public List<MFunctionSegment> outputMergedSegments(){
		return funcMerged.getSegments();
	}
	
	/**
	 * convert evolving function segments to FunctionSegment[]
	 * @return segmentsArr - FunctionSegment[] to store in merged intention
	 */
	public FunctionSegment[] outputMergedSegmentsArr() {
		// upcast the MFunctionSegments to FunctionSegment
		List<FunctionSegment> segments = new ArrayList<>();
		segments.addAll(funcMerged.getSegments());
		
		// now convert List to Array
		FunctionSegment[] segmentsArr = new FunctionSegment[segments.size()];
        segmentsArr = segments.toArray(segmentsArr);
		return segmentsArr;
	}
	
	/**********
	 * Getters
	 **********/
	
	public MEvolvingFunction getFuncA() {
		return funcA;
	}
	
	public MEvolvingFunction getFuncB() {
		return funcB;
	}
	
	public MEvolvingFunction getFuncMerged() {
		return funcMerged;
	}

}
