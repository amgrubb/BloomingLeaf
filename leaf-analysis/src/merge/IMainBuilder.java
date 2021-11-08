package merge;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import gson_classes.*;
import simulation.*;

/*
 * Converts from ModelSpec back to IMain
 */

public class IMainBuilder {
	
	/** Main function that generates the IMain
	 * @param inSpec - a ModelSpec
	 * @return 
	 */
	public static IMain buildIMain(ModelSpec inSpec) {
		
		List<ICell> cells = new ArrayList<ICell>();
		Integer z = 0; // unique counter for cells
		
		// actors
		List<Actor> actors = inSpec.getActors();
		
		// add actors to cells list
		if (!actors.isEmpty()) {
			for (Actor specActor: actors) {
				// inputs for ICell
				String id = specActor.getUniqueID();
				String type = "basic.Actor";
				BIActor newActor = new BIActor(specActor.getName(), specActor.getActorType());
				
				// add actor as ICell
				ICell newCell = new ICell(type, id, z, newActor);
				cells.add(newCell);
				
				z++;
			}
		}
		
		// intentions
		List<Intention> intentions = inSpec.getIntentions();
		
		// add intentions to cells list
		if (!intentions.isEmpty()) {
			for (Intention specIntention: intentions) {
				// inputs for ICell
				String id = specIntention.getUniqueID();
				String type = specIntention.getType();
				BIIntention newIntention = buildBIIntention(specIntention);
				
				// add intention as ICell
				ICell newCell = new ICell(type, id, z, newIntention);
				cells.add(newCell);
				
				z++;
			}
		}
		
		System.out.println("cells:");
		System.out.println(cells);
		
		// overall model variables
		String maxAbsTime = String.valueOf(inSpec.getMaxTime());
		int[] absTimePtsArr = convertAbsTimePtsArr(inSpec.getAbsTP());
		
		// create model to return
		IGraph graph = new IGraph(maxAbsTime, absTimePtsArr, cells); // TODO: add constraints
		IMain model = new IMain(graph);
		
		return model;
		
	}
	
	private static BIIntention buildBIIntention(Intention specIntention) {
		// create evolving function
		BIEvolvingFunction evolvingFunction = rerollEvolvingFunctions(specIntention.getEvolvingFunctions());
		
		
		// create user assignments list
		List<BIUserEvaluation> userEvaluationList = new ArrayList<BIUserEvaluation>();
		// make each user evaluation and add to list
		for (Map.Entry<Integer, String> userEval : specIntention.getUserEvals().entrySet()) {
			// add assignedEvidencePair, absTime to BIUserEvalutation
			BIUserEvaluation newEval = new BIUserEvaluation(userEval.getValue(), userEval.getKey());
			userEvaluationList.add(newEval);
		}
		
		BIIntention newIntention = new BIIntention(evolvingFunction, specIntention.getName(), userEvaluationList);
		
		return newIntention;
	}
	
	private static BIEvolvingFunction rerollEvolvingFunctions(FunctionSegment[] evolvingFunctions) {
		// convert FunctionSegment[] into BIFunctionSegment[]
		ArrayList<BIFunctionSegment> funcSegList = new ArrayList<BIFunctionSegment>();
		for (FunctionSegment func : evolvingFunctions) {
			BIFunctionSegment funcSeg = new BIFunctionSegment(func.getRefEvidencePair(), func.getStartAT(),
															  func.getStartTP(), func.getType());
			funcSegList.add(funcSeg);
		}
		// convert to array
		BIFunctionSegment[] functionSegList = new BIFunctionSegment[funcSegList.size()];
		functionSegList = funcSegList.toArray(functionSegList);
		//BIFunctionSegment[] functionSegList = (BIFunctionSegment[]) funcSegList.toArray();
		
		// create evolving function - detect repeats?
		
		// no function segments is type NT
		
		// one function segment - C, stochastic, increase, decrease

		// then convert to []
		
		// two function segments - ..., else user defined
		
		// 3+ function segments - user defined
		
		
		BIEvolvingFunction evolvingFunction = new BIEvolvingFunction(functionSegList);

		return evolvingFunction;
	}
	
	/**
	 * extracts integer time points from the absTP HashMap
	 * @param absTP
	 * @return absTimePtsArr
	 */
	private static int[] convertAbsTimePtsArr(HashMap<String, Integer> absTP) {
		// only keep integer timepoints
		ArrayList<Integer> absTimePtsList = new ArrayList<>(absTP.values());
		
		// convert to int[]
		int[] absTimePtsArrW0 = absTimePtsList.stream().mapToInt(i -> i).toArray();
		
		// remove the 0 we added in when loading from frontend
		Arrays.sort(absTimePtsArrW0);
		int[] absTimePtsArr = Arrays.copyOfRange(absTimePtsArrW0, 1, absTimePtsArrW0.length);
		
		return absTimePtsArr;
	}

}
