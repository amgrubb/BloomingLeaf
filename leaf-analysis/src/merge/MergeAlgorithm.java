package merge;

import com.google.gson.Gson;

import simulation.ModelSpec;

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
		
		// update model2's times to oldTime + delta
		updateTimeline(model2, delta);
		
		Gson gson = new Gson();
		//System.out.println(gson.toJson(mergedModel));
		//System.out.println(gson.toJson(model2));
		
		return mergedModel;
	}
	
	public static void updateTimeline(ModelSpec model, Integer delta) {
		if (MMain.DEBUG) System.out.println("Starting: updateTimeline");
		
		// update max time
		Integer oldMax = model.getMaxTime();
		System.out.println(oldMax);
		model.setMaxTime(oldMax + delta);
		
		// update absolute timepoints
		
		// where else is absolute time stored?
		
		System.out.println(model.getMaxTime());
	}
	
}
