package merge;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import gson_classes.*;
import simulation.Actor;
import simulation.ModelSpec;

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
