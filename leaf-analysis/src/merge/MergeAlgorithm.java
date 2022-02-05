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
	
		Intention intention1 = model1.getIntentions().get(2);
		Intention intention2 = model2.getIntentions().get(2);
		
		System.out.println(intention1.getName());
		System.out.println(intention2.getName());
		System.out.println(intention1.getEvolvingFunctionStartTPsFull());
		System.out.println(intention2.getEvolvingFunctionStartTPsFull());

		
		FunctionSegment[] mergedEF = mergeEvolvingFunctions(intention1, intention2, 5, originalMaxTime1, model2.getMaxTime());
		
		model1.getIntentions().get(2).setEvolvingFunctions(mergedEF);
		return model1;
		//return mergedModel;
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
		if (MMain.DEBUG) System.out.println("Starting: mergeEvolvingFunctions");

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
		
		// TODO: timing (incl. changes in update timelines)
		// overlapping timeline info
		// have timing AB-time
		// either: have parallel timing w/ old names
		// or better: rename times on intentions
		/*
		 * Do two options: generate all times as A-  (B-)
		 * or leave blank for user to enter
		 * 
		 * Print for every intention?
		 * 
		 * Intention: {name}
		 * A current times: [~, ~, ~]
		 * A new times:     []  # user enter here
		 * 
		 * B current times: [~, ~, ~]
		 * B new times:     []  # user enter here
		 * 
		 * ordering of new times:
		 * # [A-Initial, ... , B-MaxTime]
		 * []
		 */
		List<String> timing = new ArrayList<>();
		/*
		timing.add("A-Initial");
		timing.add("A-A");
		timing.add("B-Initial");
		timing.add("A-100");
		timing.add("B-A");
		timing.add("B-195");*/
		
		timing.add("A-Initial");
		timing.add("B-Initial");
		timing.add("AB-A");
		timing.add("A-100");
		timing.add("B-105");
		
		List<String> timingShort = new ArrayList<>();
		timingShort.add("0");
		//timingShort.add("0"); "5"
		timingShort.add("E002TPA");
		timingShort.add("E005TPA");
		timingShort.add("100");
		timingShort.add("105");
		
		System.out.println("timing:");
		System.out.println(timingShort);
		
		List<MFunctionSegment> segsA = completeFunctionInfo(intention1.getEvolvingFunctions(), intention1.getInitialUserEval(), maxTime1);
		List<MFunctionSegment> segsB = completeFunctionInfo(intention2.getEvolvingFunctions(), intention2.getInitialUserEval(), maxTime2);
		
		// merge functions
		MergeEvolvingFunction merge = new MergeEvolvingFunction(segsA, segsB, timingShort);
		return merge.outputMergedSegments();
	}
	
	
	/******************************************************************
	 * For preparing MFunctionSegment lists with info from intention
	 * to send into MergeEvolvingFunction
	 ******************************************************************/
	
	/**
	 * Determines start evidence pairs and end times for function segments
	 */
	private static List<MFunctionSegment> completeFunctionInfo(FunctionSegment[] oldSegs, String initialEval, Integer maxTime){
		if (MMain.DEBUG) System.out.println("Starting: completeFunctionInfo");
		System.out.println(oldSegs.length);
		System.out.println(initialEval);
		System.out.println(maxTime);

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

}
