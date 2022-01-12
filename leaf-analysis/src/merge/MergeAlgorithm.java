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
		mergeIntentions(model1, model2, mergedModel);
		
		
		
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
	
	public static String createID(int x){
		//is this method for every kind of element? is there a new ID generator for each?
		return "";
	}

	// ******* Intention merging methods begin ******** //
	public static void mergeIntentions(ModelSpec model1, ModelSpec model2, ModelSpec newModel) {
		ArrayList<Intention> mergedIntentions = new ArrayList<Intention>();
		HashSet<String> mergedIntentionsNameSet = new HashSet<String>();
		int currIDCount = 0;
		
		for(Intention intention: model1.getIntentions()) {
			//TODO: update intention with some kind of tracking flag
			updateIntentionID(createID(currIDCount), intention.getID(), model1, intention);
			mergedIntentions.add(intention);
			mergedIntentionsNameSet.add(intention.getName());
			currIDCount++;
		}
		for(Intention intention: model2.getIntentions()) {
			if(!mergedIntentionsNameSet.contains(intention.getName)){
				//TODO: update this intention with some kind of tracking flag
				updateIntentionID(createID(currIDCount), intention.getID(), model2, intention);
				mergedIntentions.add(intention);
				mergedIntentionsNameSet.add(intention.getName());
				currIDCount++;
			}
			else{
				for(Intention mergedIntention: mergedIntentions){
					if(mergedIntention.getName().equals(intention.getname())){
						/*if(mergedIntention.getEvolvingFunctions().length != 0){
							//TODO: alter the evolving functions list StringDynVis???
							mergedIntention.setEvolvingFunctions(Array.concat(mergedIntention.getEvolvingFunctions(), intention.getEvolvingFunctions()));
						}
						else{
							//TODO: StringDynVIs???
							mergedIntention.setEvolvingFunctions(Array.concat(mergedIntention.getEvolvingFunctions(), intention.getEvolvingFunctions()));
						}*/
						mergedIntention.setEvolvingFunctions(Array.concat(mergedIntention.getEvolvingFunctions(), intention.getEvolvingFunctions()));
					}
				}
			}
		}
		newModel.setIntentions(mergedIntentions);
		
	}

	public static void updateIntentionID(String newID, int curID, ModelSpec model, Intention intention){
		//Also update IDs with tracking flags here?
		//don't need to update links because they contain direct references to the intentions, not their IDs
		//actors have no reference to intention IDs so don't have anything to update
		//ElementData is a private class so this obvioslyyy doesn't work
		for(ElementData elem: model.getPrevResult().getElementList()){
			//The following methods don't exist but...
			//if(elem.getID().equals(currID)){
			//	elem.setID(newID);
			//}
		}
		intention.setID(newID);
		for(FunctionSegment func: intentions.getEvolvingFunctions()){
			if(func.getStartTP().contains(curID)){
				func.replace(curID, newID);
			}
		}
	}

	// ******* Actor merging methods begin ******** //

	// ******* Link merging methods begin ******** //

	public static void mergeLinks(model1, model2, newModel){
		ArrayList<NotBothLink> mergedNBL = new ArrayList<>();
		ArrayList<ContributionLink> mergedCL = new ArrayList<>();
		ArrayList<DecompositionLink> mergedDL = new ArrayList<>();
		int linkCount = 0;

		for(NotBothLink nbl: model1.getNotBothLink()){
			newID = createID(linkCount);
			//NotBothLink doesn't have a unique id...
			linkCount++;
			mergedNBL.add(nbl);
		}
		for(ContributionLink cl: model1.getContributionLinks()){
			newID = createID(linkCount);
			cl.setID(newID);
			linkCount++;
			mergedCL.add(cl);
		}
		for(DecompositionLink dl: model1.getDecompositionLinks()){
			newID = createID(linkCount);
			dl.setID(newID);
			linkCount++;
			mergedDL.add(dl);
		}

		for(NotBothLink nbl: model2.getNotBothLink()){
			boolean isNewLink = true; //changing it....
			for(NotBothLink addednbl: mergedNBL){
				if(addednbl == nbl){ //TODO: isSameLink
					isNewLink = false;
				}
			if(isNewLink)
				newID = createID(linkCount);
				//NotBothLink doesn't have a unique id...
				linkCount++;
				mergedNBL.add(nbl);
			}
		}
		for(ContributionLink cl: model2.getContributionLinks()){
			boolean isNewLink = true; //changing it....
			for(ContributionLink  addedcl: mergedCL){
				if(addedcl == cl){ //TODO: isSameLink
					isNewLink = false;
				}
			if(isNewLink)
				newID = createID(linkCount);
				cl.setID(newID);
				linkCount++;
				mergedCL.add(cl);
			}
		}
		for(DecompositionLink dl: model2.getDecompositionLinks()){
			boolean isNewLink = true; //changing it....
			for(DecompositionLink addeddl: mergedDL){
				if(addeddl == dl){ //TODO: isSameLink
					isNewLink = false;
				}
			if(isNewLink)
				newID = createID(linkCount);
				dl.setID(newID);
				linkCount++;
				mergedDL.add(dl);
			}
		}

	}

	
	// ******* Evolving Functions merging methods begin ******** //


	
}
