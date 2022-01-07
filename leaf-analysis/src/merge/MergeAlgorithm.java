package merge;

import com.google.gson.Gson;

import simulation.ModelSpec;
import simulation.Intention;

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
		
		// update the models' times
		updateTimeline(model1, model2, delta);
		
		
		
		//Gson gson = new Gson();
		//System.out.println(gson.toJson(mergedModel));
		//System.out.println(gson.toJson(model2));
		
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
	
}
