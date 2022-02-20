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
	private ArrayList<String> deletedTimings;
	
	public MergeEvolvingFunction(List<MFunctionSegment> segsA, List<MFunctionSegment> segsB, List<String> timing) {
		this.funcA = new MEvolvingFunction(segsA, timing);
		//if (MMain.DEBUG) System.out.println(timing);
		//if (MMain.DEBUG) System.out.println(segsA);
		this.funcB = new MEvolvingFunction(segsB, timing);
		//if (MMain.DEBUG) System.out.println(timing);
		//if (MMain.DEBUG) System.out.println(segsB);
		this.timing = timing;
		this.deletedTimings = new ArrayList<String>();
		
		System.out.println("--------------------");
		System.out.println("Merging:");
		funcA.printMe();
		funcB.printMe();
		System.out.println("--------------------");
		
		doEvolvingFunctionMerge();
		
		System.out.println("--------------------");
		System.out.println("Result:");
		if (MMain.DEBUG) funcMerged.printMe();
		if (MMain.DEBUG) System.out.println("--------------------");
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
		ArrayList<String> timingsToDelete = new ArrayList<>();
		String mergedEnd, mergedStart;
		
		// create new timeline
		for (String time: timing) {
			// find merged value at time
			mergedEnd = getMergedValueAtTime(time, funcA.getEndingEvidencePair(time), funcB.getEndingEvidencePair(time));
			mergedStart = getMergedValueAtTime(time, funcA.getStartingEvidencePair(time), funcB.getStartingEvidencePair(time));
			System.out.println(mergedEnd);
			System.out.println(mergedStart);
			
			// insert into new timeline
			newEndingTimeline.put(time, mergedEnd);
			newStartingTimeline.put(time, mergedStart);
			
			// old skip value compatibility
			/*if (!valueM.equals("skip")){
				newStartingTimeline.put(time, valueM);
			}else {
				timingsToDelete.add(time);  // removed skip values for now
			}*/
		}
		
		this.timing.removeAll(timingsToDelete);
		this.deletedTimings = timingsToDelete;
		
		// construct MEvolvingFunction from new timeline
		this.funcMerged = new MEvolvingFunction(newStartingTimeline, newEndingTimeline, timing);
	}
	
	/**
	 * merge values for A and B at specific time
	 */
	private String getMergedValueAtTime(String time, String valueA, String valueB) {
		if (MMain.DEBUG) System.out.println("Starting: getMergedValueAtTime: " + time);
		System.out.println(time);
		
		System.out.println(valueA);
		System.out.println(valueB);
		
		// note: should never have "mid" for both values
		// (middle of function for both models)
		if (valueA.equals("mid") && valueB.equals("mid")) {
			System.out.println("warning: merging two mids");
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
	
	public ArrayList<String> getDeletedTimings(){
		return deletedTimings;
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
