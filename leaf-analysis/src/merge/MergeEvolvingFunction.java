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
		
		System.out.println("--------------------");
		funcA.printMe();
		funcB.printMe();
		System.out.println("--------------------");
		
		doEvolvingFunctionMerge();
		
		System.out.println("--------------------");
		funcMerged.printMe();
		System.out.println("--------------------");
	}
	
	/***************************
	 * Building merged timeline
	 ***************************/
	
	/**
	 * merge funcA and funcB into merged timeline
	 */
	private void doEvolvingFunctionMerge() {
		if (MMain.DEBUG) System.out.println("Starting: doEvolvingFunctionMerge");

		HashMap<String, String> newTimeline = new HashMap<>();
		String valueM;
		
		// create new timeline
		for (String time: timing) {
			// find merged value at time
			valueM = getMergedValueAtTime(time);
			
			// insert into new timeline
			if (!valueM.equals("skip")){
				newTimeline.put(time, valueM);
			}
		}
		
		// construct MEvolvingFunction from new timeline
		this.funcMerged = new MEvolvingFunction(newTimeline, timing);
	}
	
	/**
	 * merge values for A and B at specific time
	 */
	private String getMergedValueAtTime(String time) {
		if (MMain.DEBUG) System.out.println("Starting: getMergedValueAtTime: " + time);

		// get model A + B values at time
		String valueA = funcA.getEvidencePair(time);
		String valueB = funcB.getEvidencePair(time);
		
		// one value is mid and other is (no value), skip this timepoint
		// (no info in middle of segment)
		if ((valueA.equals("mid") && valueB.equals("(no value)")) ||
			(valueB.equals("mid") && valueA.equals("(no value)")) ||
			(valueA.equals("mid") && valueB.equals("mid"))) {
			return "skip";
		}
		
		// note: should never have "mid" for both values
		
		// if valueA or valueB is a mid value, use mid operator
		// note: from above, we never need to mid() with (no value)
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
	
	/**
	 * format evolving function segments for output	
	 * @return segmentsArr - FunctionSegment[] to store in merged intention
	 */
	public FunctionSegment[] outputMergedSegments() {
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
