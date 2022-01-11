package merge;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import gson_classes.*;
import simulation.*;

/*
 * Converts from ModelSpec back to IMain for output
 */

public class IMainBuilder {
	
	/** Main function that generates the IMain
	 * @param outSpec - a ModelSpec
	 * @return 
	 */
	public static IMain buildIMain(ModelSpec outSpec) {
		
		List<ICell> cells = new ArrayList<ICell>();
		Integer z = 0; // unique counter for cells
		
		// actors
		List<Actor> actors = outSpec.getActors();
		
		// add actors to cells list
		if (!actors.isEmpty()) {
			for (Actor specActor: actors) {
				// inputs for ICell
				String id = specActor.getUniqueID();
				String type = "basic.Actor";
				BISize size = specActor.getSize();
				BIPosition position = specActor.getPosition();
				String[] embeds = specActor.getEmbeds();
				
				BIActor newActor = new BIActor(specActor.getName(), specActor.getActorType());
				String name = newActor.getActorName();
				
				// add actor as ICell
				ICell newCell = new ICell(newActor, type, id, z, size, position, embeds, name);
				cells.add(newCell);
				
				z++;
			}
		}
		
		// intentions
		List<Intention> intentions = outSpec.getIntentions();
		
		// add intentions to cells list
		if (!intentions.isEmpty()) {
			for (Intention specIntention: intentions) {
				// inputs for ICell
				String id = specIntention.getUniqueID();
				String type = specIntention.getType();
				String parent = specIntention.getParentID();
				BISize size = specIntention.getSize();
				BIPosition position = specIntention.getPosition();
				
				BIIntention newIntention = buildBIIntention(specIntention);
				String name = newIntention.getNodeName();
				
				// add intention as ICell
				ICell newCell = new ICell(newIntention, type, id, z, size, position, parent, name);
				cells.add(newCell);
				
				z++;
			}
		}
		
		// System.out.println("cells:");
		// System.out.println(cells);
		
		// overall model variables
		Integer maxAbsTime = outSpec.getMaxTime();
		//System.out.println(maxAbsTime);
		int[] absTimePtsArr = convertAbsTimePtsArr(outSpec.getAbsTP());
		
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
		
		// type if none of the named cases below
		String type = "UD";
		
		// detect type in named cases
		if (functionSegList.length == 0) {
			// no type w/ no segments
			type = "NT";
		} else if (functionSegList.length == 1) {
			// segment is C, I, D, or R (stochastic)
			type = functionSegList[0].getType();
		} else if (functionSegList.length == 2) {
			// potentially a 2-segment type
			String type0 = functionSegList[0].getType();
			String type1 = functionSegList[1].getType();
			if (type0.equals("R") && type1.equals("C")) {
				// stochastic-constant
				type = "RC";
			} else if (type0.equals("C") && type1.equals("R")) {
				// constant-stochastic
				type = "CR";
			} else if (type0.equals("I") && type1.equals("C")) {
				// monotonic positive
				type = "MP";
			} else if (type0.equals("D") && type1.equals("C")) {
				// monotonic negative
				System.out.println("ran");
				type = "MN";
			} else if (type0.equals("C") && type1.equals("C")) {
				// SD or DS
				String satValue0 = functionSegList[0].getRefEvidencePair();
				String satValue1 = functionSegList[1].getRefEvidencePair();
				if (satValue0.equals("0011") && satValue1.equals("1100")) {
					// satisfied denied
					type = "SD";
				} else if (satValue0.equals("1100") && satValue1.equals("0011")) {
					// denied satisfied
					type = "DS";
				}
			}
		}
				
		BIEvolvingFunction evolvingFunction = new BIEvolvingFunction(functionSegList, type);

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
