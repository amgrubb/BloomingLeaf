package merge;

import com.google.gson.Gson;

import gson_classes.IMain;
import simulation.*;

import java.util.*;

public class MergeAlgorithm {

	/**
	 * Merges two modelSpecs
	 * @param model1
	 * @param model2
	 * @param delta - how much longer model2 starts after model1 starts
	 * @param timings
	 * @return the merged model
	 */
	public static ModelSpec mergeModels(ModelSpec model1, ModelSpec model2, Integer delta, TMain timings){
		if (MMain.DEBUG) System.out.println("Starting: MergeAlgorithm");

		// Tracks elements that are deleted in the merge
		ArrayList<ArrayList<? extends AbstractElement>> deletedElements = new ArrayList<ArrayList<? extends AbstractElement>>();
		int originalMaxTime1 = model1.getMaxTime();

		// initialize merged model
		ModelSpec mergedModel = new ModelSpec();

		Gson gson = new Gson();
		System.out.println(gson.toJson(mergedModel));

		// pre-process timing and rename maxTimes to ints
		timings.initializeTiming(originalMaxTime1, model2.getMaxTime() + delta);

		// update the models' times
		if (MMain.DEBUG) System.out.println("Starting: updateTimeline");
		updateTimeline(model1, model2, delta, timings);
		if (MMain.DEBUG) System.out.println(gson.toJson(mergedModel));

		if (MMain.DEBUG) System.out.println("Starting: mergeIntentions");
		mergeIntentions(model1, model2, mergedModel, delta, timings, originalMaxTime1);
		if (MMain.DEBUG) System.out.println("Finished: mergeIntentions");
		IMain modelOut = IMainBuilder.buildIMain(mergedModel);
		System.out.println(gson.toJson(modelOut));
		//if (MMain.DEBUG) System.out.println(gson.toJson(mergedModel));

		if (MMain.DEBUG) System.out.println("Starting: mergeActors");
		mergeActors(model1, model2, mergedModel);
		//if (MMain.DEBUG) System.out.println(gson.toJson(mergedModel));
		modelOut = IMainBuilder.buildIMain(mergedModel);
		System.out.println(gson.toJson(modelOut));

		if (MMain.DEBUG) System.out.println("Starting: mergeActorsLinks");
		mergeActorLinks(model1, model2, mergedModel, deletedElements);
		//if (MMain.DEBUG) System.out.println(gson.toJson(mergedModel));
		modelOut = IMainBuilder.buildIMain(mergedModel);
		System.out.println(gson.toJson(modelOut));

		if (MMain.DEBUG) System.out.println("Starting: mergeLinks");
		mergeLinks(model1, model2, mergedModel, deletedElements);
		//if (MMain.DEBUG) System.out.println(gson.toJson(mergedModel));*/
		modelOut = IMainBuilder.buildIMain(mergedModel);
		System.out.println(gson.toJson(modelOut));

		Traceability.printDeletedToFile(deletedElements);

		return mergedModel;
	}

	/**
	 * Updates two modelSpecs' absolute and max time points
	 * @param model1
	 * @param model2
	 * @param delta
	 */
	public static void updateTimeline(ModelSpec model1, ModelSpec model2, Integer delta, TMain timings) {
		if (MMain.DEBUG) System.out.println("Starting: updateTimeline");

		// update max time for both models
		Integer oldMax = model2.getMaxTime();
		System.out.println(oldMax);
		model1.setMaxTime(oldMax + delta);
		model2.setMaxTime(oldMax + delta);

		// update absolute time points for model 2
		for (Integer absTP: model2.getAbsTP().values()) {
			absTP += delta;
		}

		// update absolute time points for model 2 stored in intentions' UAL
		for (Intention intention: model2.getIntentions()) {
			for(Integer absTP: intention.getUserEvals().keySet()) {
				absTP += delta;
			}
		}

		// update absolute time points for model 2 stored in intentions' evolving functions
		// and update timepoint names if available in timing file
		for (Intention intention: model2.getIntentions()) {
			FunctionSegment[] evFunctions = intention.getEvolvingFunctions();

			// update each function's absolute time
			for(FunctionSegment func: evFunctions) {
				// if abs time exists, update it
				func.incrementStartAT(delta);
			}

			// rename startTP names if info available in timing
			if (timings.hasTiming(intention.getName())) {
				TIntention timeIntention = timings.getTiming(intention.getName());
				for (int i=0; i<evFunctions.length; i++) {
					// rename start TPs as user suggested
					String newTime = timeIntention.getNewNameB(evFunctions[i].getStartTime());
					evFunctions[i].setStartTP(newTime);
				}
			}
		}

		// and update timepoint names for model 1 if available in timing file
		for (Intention intention: model1.getIntentions()) {
			FunctionSegment[] evFunctions = intention.getEvolvingFunctions();

			// rename startTP names if info available in timing
			if (timings.hasTiming(intention.getName())) {
				TIntention timeIntention = timings.getTiming(intention.getName());
				for (int i=0; i<evFunctions.length; i++) {
					// rename start TPs as user suggested
					String newTime = timeIntention.getNewNameA(evFunctions[i].getStartTime());
					evFunctions[i].setStartTP(newTime);
				}
			}
		}
	}

	public static String createID(int x, int model, String oldID, String type){
		return type + Integer.toString(x) + "model" + Integer.toString(model);
	}

	// ******* Intention merging methods begin ******** //
	public static void mergeIntentions(ModelSpec model1, ModelSpec model2, ModelSpec newModel, Integer delta, TMain timings, Integer originalMaxTime1) {
		ArrayList<Intention> mergedIntentions = new ArrayList<Intention>();
		HashSet<String> mergedIntentionsNameSet = new HashSet<String>();
		int currIDCount = 0;

		for(Intention intention: model1.getIntentions()) {
			updateIntentionID(createID(currIDCount, 1, intention.getId(), "intention"), intention.getId(), model1, intention);
			mergedIntentions.add(intention);
			mergedIntentionsNameSet.add(intention.getName());
			currIDCount++;
		}
		for(Intention intention: model2.getIntentions()) {
			if(!mergedIntentionsNameSet.contains(intention.getName())){
				if (MMain.DEBUG) System.out.println("Adding a new intention from model 2");
				updateIntentionID(createID(currIDCount, 2, intention.getId(), "intention"), intention.getId(), model2, intention);
				mergedIntentions.add(intention);
				mergedIntentionsNameSet.add(intention.getName());
				currIDCount++;

			}
			else{
				//This section merges intentions from model1 and model2 that are considered the same because they have the same name.
				for(Intention mergedIntention: mergedIntentions){
					if(mergedIntention.getName().equals(intention.getName())){
						if (MMain.DEBUG) System.out.println("merging an intention");
						mergedIntention.setId(mergedIntention.getId() + "2");
						//actor
						if(!mergedIntention.getActor().getName().equals(intention.getActor().getName())){
							//UNRESOLVABLE CONFLICT
							if (MMain.DEBUG) System.out.println("Intentions in different actors");
						}
						//type
						if (MMain.DEBUG) System.out.println("merging type");
						if(mergedIntention.compareType(intention) < 0){
							mergedIntention.setType(intention.getType());
						}
						//valuation
						if (MMain.DEBUG) System.out.println("merging valuations");
						HashMap<Integer, String> userEvalsA = mergedIntention.getUserEvals();
						HashMap<Integer, String> userEvalsB = intention.getUserEvals();


						for(int absTP: userEvalsA.keySet()){
							if(userEvalsB.containsKey(absTP)){
								String newEval = mergeValuationConsensus(userEvalsA.get(absTP), userEvalsB.get(absTP));
								if (MMain.DEBUG) System.out.println(newEval);
								userEvalsA.put(absTP, newEval);
							}
						}
						for(int absTP:userEvalsB.keySet()) {
							if(!userEvalsA.containsKey(absTP)) {
								userEvalsA.put(absTP, userEvalsB.get(absTP));
							}
						}

						TIntention intentionTiming = timings.getTiming(mergedIntention.getName());
						FunctionSegment[] mergedEF = mergeEvolvingFunctions(mergedIntention, intention, delta,
																			intentionTiming.getNewTimeOrder(), // new time order
																			originalMaxTime1, model2.getMaxTime(),
																			intentionTiming.getMaxTimeNameA(), intentionTiming.getMaxTimeNameB());

						//evolvingfunction
						/*if(mergedIntention.getEvolvingFunctions().length != 0 || intention.getEvolvingFunctions().length != 0){
							//TODO: GUllibility so don't need anything??? but mb Add an "evolving function" that represents the staticness of intention to mergedIntention??? d
						}*/
						mergedIntention.setEvolvingFunctions(mergedEF);
							//check absTP
						//replace all mentions of intention with mergedIntention in Model2
						if (MMain.DEBUG) System.out.println("updating repeated intentions");
						updateRepeatedIntention(mergedIntention, intention, model2);



					}
				}
			}
		}
		newModel.setIntentions(mergedIntentions);

	}

	public static void updateIntentionID(String newID, String curID, ModelSpec model, Intention intention){
		//don't need to update links because they contain direct references to the intentions, not their IDs
		//actors have no reference to intention IDs so don't have anything to update
		intention.setId(newID);
		for(FunctionSegment func: intention.getEvolvingFunctions()){
			if(func.getStartTP().contains(curID)){
				func.getStartTP().replace(curID, newID);
			}
		}
	}

	/**
     * Add old links to new intentions and vice versa
	 */
	public static void updateRepeatedIntention(Intention newIntention, Intention oldIntention, ModelSpec model2){

		for(NotBothLink nbl: model2.getNotBothLink()){
			if(nbl.getElement1() == oldIntention){
				nbl.setElement1(newIntention);
			}
			if(nbl.getElement2() == oldIntention){
				nbl.setElement2(newIntention);
			}
		}
		for(ContributionLink cl: model2.getContributionLinks()){
			for(int i = 0; i < cl.getSrc().length; i++){
				if(cl.getSrc()[i] instanceof Intention && ((Intention)cl.getSrc()[i]) == oldIntention){
					cl.getSrc()[i] = newIntention;
				}
			}
			if(cl.getDest() == oldIntention){
				cl.setDest(newIntention);
			}
		}
		for(DecompositionLink dl: model2.getDecompositionLinks()){
			for(int i = 0; i < dl.getSrc().length; i++){
				if(dl.getSrc()[i] instanceof Intention && ((Intention)dl.getSrc()[i]) == oldIntention){
					dl.getSrc()[i] = newIntention;
				}
			}
			if(dl.getDest() == oldIntention){
				dl.setDest(newIntention);
			}
		}

	}

	public static String mergeValuationConsensus(String value1, String value2){
		//dealing with no value:
		//System.out.println(value1 + value2);
		if(value1.equals("(no value)")){
			//System.out.println("no value");
			return value2;
		}
		if(value2.equals("(no value)")){
			//System.out.println("no value");
			return value1;
		}

		//actual valuations:
		String sat1 = value1.substring(0,2);
		String den1 = value1.substring(2,4);
		String sat2 = value2.substring(0,2);
		String den2 = value2.substring(2,4);
		//System.out.println(sat1 + den1);

		HashMap<String, Integer> valueRanks = new HashMap<>();
		valueRanks.put("00", 0);
		valueRanks.put("11", 2);
		valueRanks.put("10", 1);

		String newSat = "";
		String newDen = "";

		if(valueRanks.get(sat1) < valueRanks.get(sat2)){
			newSat = sat1;
		} else{
			newSat = sat2;
		}

		if(valueRanks.get(den1) < valueRanks.get(den2)){
			newDen = den1;
		} else{
			newDen = den2;
		}
		return newSat + newDen;
	}


	// ******* Actor merging methods begin ******** //
	public static Actor mergeToOneActor(Actor actorOne, Actor actorTwo, int actorNum, ModelSpec model1, ModelSpec model2) {
		if(actorOne.getActorType().equals(actorTwo.getActorType()) || (actorOne.getActorType().equals("Agent")) || (actorOne.getActorType().equals("Role") && !actorTwo.getActorType().equals("Agent"))) {
			String newId = createID(actorNum, 12, actorOne.getId(), "Actor");
			actorOne.setId(newId);
			//actorTwo.setId(newId);
			updateRepeatedActor(actorOne, actorTwo, model2);
			return actorOne;
		}
		String newId = createID(actorNum, 21, actorTwo.getId(), "Actor");
		actorTwo.setId(newId);
		//actorOne.setId(newId);
		updateRepeatedActor(actorTwo, actorOne, model1);
		return actorTwo;

	}

	public static void mergeActors(ModelSpec model1, ModelSpec model2, ModelSpec newModel) {
		ArrayList<String> actorsNameSet = new ArrayList<>();
		ArrayList<Actor> mergedActors = new ArrayList<>();
		int actorCounter = 0;
		for(Actor actor1: model1.getActors()) {
			for(Actor actor2: model2.getActors()) {
				if(actor1.getName().equals(actor2.getName())) {
					//merge actors
					mergedActors.add(mergeToOneActor(actor1, actor2, actorCounter, model1, model2));
					actorsNameSet.add(actor1.getName());
					actorCounter += 1;

				}
			}
		}
		for(Actor actor1: model1.getActors()) {
			if(!actorsNameSet.contains(actor1.getName())) {
				String newId = createID(actorCounter, 1, actor1.getId(), "Actor");
				actor1.setId(newId);
				mergedActors.add(actor1);
				actorsNameSet.add(actor1.getName());
				actorCounter += 1;

			}
		}
		for(Actor actor2: model2.getActors()) {
			if(!actorsNameSet.contains(actor2.getName())) {
				String newId = createID(actorCounter, 2, actor2.getId(), "Actor");
				actor2.setId(newId);
				mergedActors.add(actor2);
				actorsNameSet.add(actor2.getName());
				actorCounter += 1;

			}
		}
		newModel.setActors(mergedActors);
	}
	/*when an actor from one model is accepted, the  instances of actors with the same names must be
	 * replaced in the other model.
	 */
	public static void updateRepeatedActor(Actor newActor, Actor oldActor, ModelSpec otherModel) {
		//intentions
		for(Intention intention: otherModel.getIntentions()) {
			if(intention.getActor() == oldActor){
				intention.setActor(newActor);
			}
		}

		//links
		for(ActorLink al: otherModel.getActorLinks()) {
			if(al.getZeroSrc() == oldActor) {
				al.setZeroSrc(newActor);
			}
			else if(al.getDest() == oldActor) {
				al.setDest(newActor);
			}

		}
	}
	// ******* Actor Link merging methods begin ******** //

	public static void mergeActorLinks(ModelSpec model1, ModelSpec model2, ModelSpec newModel, ArrayList<ArrayList<? extends AbstractElement>> deletedElements) {
		ArrayList<ActorLink> mergedAL = new ArrayList<>();
		ArrayList<ActorLink> deletedAL = new ArrayList<>();
		int linkCount = 0;
		for(ActorLink al: model1.getActorLinks()) {
			if(isValidTypes((Actor)al.getZeroSrc(), (Actor)al.getDest(), al.getType())) {
				String newID = createID(linkCount, 1, al.getID(), "ActorLink");
				al.setID(newID);

				mergedAL.add(al);
				linkCount++;
			}
			deletedAL.add(al);

		}
		for(ActorLink al: model2.getActorLinks()) {
			boolean isNewLink = true;
			for(ActorLink addedal: mergedAL) {
				if(isSameActorLink(al, addedal)) {
					isNewLink = false;
					updateALTypes(al, addedal);
					addedal.setID(addedal.getID() + "2");
					if(isValidTypes((Actor)addedal.getZeroSrc(), (Actor)addedal.getDest(), addedal.getType())) {
						deletedAL.add(addedal);
					}else if(deletedAL.contains(addedal)) {
						deletedAL.remove(addedal);
					}


				}
			}
			if(isNewLink) {
				if(isValidTypes((Actor)al.getZeroSrc(), (Actor)al.getDest(), al.getType())) {
					String newID = createID(linkCount, 2, al.getID(), "ActorLink");
					al.setID(newID);
					mergedAL.add(al);
					linkCount++;
					//add link to the actor it touches
					al.getZeroSrc().addLinksAsSrc(al);
					al.getDest().addLinksAsDest(al);
				}
				deletedAL.add(al);
			}
		}

		for(ActorLink al: deletedAL) {
			if(mergedAL.contains(al)) {
				mergedAL.remove(al);
			}
		}

		newModel.setActorLinks(mergedAL);
		deletedElements.add((ArrayList<? extends AbstractElement>) deletedAL);
	}

	public static void updateALTypes(ActorLink al1, ActorLink al2) {
		if(!al1.getType().getCode().equals(al2.getType().getCode())) {
			al1.setType(ActorLinkType.PI);
			al2.setType(ActorLinkType.PI);
		}
	}

	/**
	 * Checks if the source and destination actor types conflict with themselves and the link type.
	 */

	public static boolean isValidTypes(Actor source, Actor destination, ActorLinkType type) {
		if(type.getCode().equals("is-a")) {
			return !(source.getActorType().equals("basic.Agent") || destination.getActorType().equals("basic.Agent") ||
			(source.getActorType().equals("basic.Role") && destination.getActorType().equals("basic.Actor"))||
			(source.getActorType().equals("basic.Actor") && destination.getActorType().equals("basic.Role")));
		}
		if(type.getCode().equals("participates-in")) {
			return !((source.getActorType().equals("basic.Actor") && destination.getActorType().equals("basic.Agent"))||
			(source.getActorType().equals("basic.Role") && destination.getActorType().equals("basic.Agent")));
		}
		return false;
	}


	/** returns true if links connect the same actor */

	public static boolean isSameActorLink(ActorLink al1, ActorLink al2) {
		return (al1.getZeroSrc().getName().equals(al2.getZeroSrc().getName()) && al1.getDest().getName().equals(al2.getDest().getName()));

	}

	// ******* Link merging methods begin ******** //

	public static void mergeLinks(ModelSpec model1, ModelSpec model2, ModelSpec newModel, ArrayList<ArrayList<? extends AbstractElement>> deletedElements){
		//Question what if there are two different relationships connecting the same intentions

		ArrayList<NotBothLink> mergedNBL = new ArrayList<>();
		ArrayList<ContributionLink> mergedCL = new ArrayList<>();
		ArrayList<DecompositionLink> mergedDL = new ArrayList<>();
		int linkCount = 0;

		for(NotBothLink nbl: model1.getNotBothLink()){
			String newID = createID(linkCount, 1, nbl.getID(), "NotBothLink");

			nbl.setID(newID);
			linkCount++;
			mergedNBL.add(nbl);
		}
		for(ContributionLink cl: model1.getContributionLinks()){
			String newID = createID(linkCount, 1, cl.getID(), "ContributionLink");

			cl.setID(newID);
			linkCount++;
			mergedCL.add(cl);
		}
		for(DecompositionLink dl: model1.getDecompositionLinks()){
			String newID = createID(linkCount, 1, dl.getID(), "DecompositionLink");

			dl.setID(newID);
			linkCount++;
			mergedDL.add(dl);
		}

		for(NotBothLink nbl: model2.getNotBothLink()){
			boolean isNewLink = true;
			for(NotBothLink addednbl: mergedNBL){
				if(isSameLink(addednbl, nbl)){
					isNewLink = false;
					//merge these links
					if(addednbl.isFinalDenied() != nbl.isFinalDenied()) {
						addednbl.setFinalDenied(true);
					}
					addednbl.setID(addednbl.getID() + "2");
				}
			}
			if(isNewLink) {
				String newID = createID(linkCount, 2, nbl.getID(), "NotBothLink");
				nbl.setID(newID);
				linkCount++;
				mergedNBL.add(nbl);
				//add link to intentions that it touches?
			}
		}
		for(ContributionLink cl: model2.getContributionLinks()){
			boolean isNewLink = true; //changing it....
			for(ContributionLink  addedcl: mergedCL){
				if(isSameLink(addedcl, cl)){
					isNewLink = false;
					//merge these links
					addedcl.setPreContribution(mergeContributionTypesSemiGullible(addedcl.getPreContribution(), cl.getPreContribution()));
					addedcl.setPostContribution(mergeContributionTypesSemiGullible(addedcl.getPostContribution(), cl.getPostContribution()));
					if(addedcl.getPostContribution() == ContributionType.NONE || addedcl.getPreContribution() == ContributionType.NONE){
						//Conflict alert user
						if (MMain.DEBUG) System.out.println("Contribution types were unresolvable");
					}

					addedcl.setID(addedcl.getID() + "2");
				}
			}
			if(isNewLink) {
				String newID = createID(linkCount, 2, cl.getID(), "ContributionLink");
				cl.setID(newID);
				linkCount++;
				mergedCL.add(cl);
				//add link to intentions that it touches
				cl.getZeroSrc().addLinksAsSrc(cl);
				cl.getDest().addLinksAsDest(cl);
				//check that it's the only intention in the destination intention list?
			}
		}
		for(DecompositionLink dl: model2.getDecompositionLinks()){
			boolean isNewLink = true;
			for(DecompositionLink addeddl: mergedDL){
				if(isSameLink(addeddl, dl)){
					isNewLink = false;
					//merge these links
					if(addeddl.getPreDecomposition() != dl.getPreDecomposition()){
						addeddl.setPreDecomposition(DecompositionType.NONE);
						//Conflict alert user
						if (MMain.DEBUG) System.out.println("Decomp types unresolvable");
					}
					if(addeddl.getPostDecomposition() != dl.getPostDecomposition()){
						addeddl.setPostDecomposition(DecompositionType.NONE);
						//Conflict alert user
						if (MMain.DEBUG) System.out.println("decomp types are different");
					}


					for(AbstractLinkableElement source: dl.getSrc()) {
						boolean newSource = true;
						for(AbstractLinkableElement addedSource: addeddl.getSrc()) {
							if(addedSource.getName().equals(source.getName())) {
								newSource = false;
							}
						}

						if(newSource) {
							addeddl.addSrc(source);
							source.addLinksAsSrc(addeddl);
						}
					}
					addeddl.setID(addeddl.getID() + "2");
				}
			}
			if(isNewLink) {
				String newID = createID(linkCount, 2, dl.getID(), "DecompositionLink");
				dl.setID(newID);
				linkCount++;
				mergedDL.add(dl);
				//add link to intentions that it touches
				for(AbstractLinkableElement src: dl.getSrc()){
					src.addLinksAsSrc(dl);
				}
				dl.getDest().addLinksAsDest(dl);
				//check that it's the only intention in the destination intention list?
			}
		}
		//check that NBL is not conflicting with intentions
		ArrayList<NotBothLink> deletedNBL = new ArrayList<NotBothLink>();
		for(NotBothLink nbl: mergedNBL) {
			String eval1 = nbl.getElement1().getUserEvals().get(0);
			String eval2= nbl.getElement2().getUserEvals().get(0);
			if(!eval1.equals("0000") && !eval1.equals("(no value)") || !eval2.equals("0000") && !eval2.equals("(no value)")) {
				//Conflict!!
				System.out.println("removed NBL");
				mergedNBL.remove(nbl);
				deletedNBL.add(nbl);
			}
			for(FunctionSegment funcSeg: nbl.getElement1().getEvolvingFunctions()) {
				if(!funcSeg.getType().equals("R")) {
					System.out.println("removed NBL");
					mergedNBL.remove(nbl);
					deletedNBL.add(nbl);
				}
			}
			for(FunctionSegment funcSeg: nbl.getElement2().getEvolvingFunctions()) {
				if(!funcSeg.getType().equals("R")) {
					System.out.println("removed NBL");
					mergedNBL.remove(nbl);
					deletedNBL.add(nbl);
				}
			}
		}

		//TODO: check to make sure no other links exist for contribution links
		//TODO: check to make sure no other links exist for decomposition links
		deletedElements.add((ArrayList<? extends AbstractElement>) deletedNBL);



		newModel.setContributionLinks(mergedCL);
		newModel.setDecompositionLinks(mergedDL);
		newModel.setNotBothLinks(mergedNBL);
	}

	public static ContributionType mergeContributionTypesSemiGullible(ContributionType ct1, ContributionType ct2){
		String linkType1 = ct1.getCode();
		String linkType2 = ct2.getCode();
		if(linkType1.equals(linkType2)){
			return ct1;
		}
		if(linkType1.contains("-") && linkType2.contains("+") || linkType2.contains("+") && linkType1.contains("-")){
			return ContributionType.NONE;
		}
		if(linkType1.contains("+")){
			if(linkType1.contains("S") && linkType2.contains("D") || linkType2.contains("D") && linkType1.contains("S")){
				if(linkType1.contains("++") && linkType2.contains("++")){
					return ContributionType.PP;
				}
				return ContributionType.P;
			}
			String newLinkType = "";
			if(linkType1.lastIndexOf("+") != linkType1.lastIndexOf("+")){
				newLinkType = "+";
			}
			else{
				newLinkType = linkType1.substring(linkType1.lastIndexOf("+"));
			}

			if(linkType1.contains("S") || linkType2.contains("S")){
				return ContributionType.getByCode(newLinkType + "S");
			}
			if(linkType1.contains("D") || linkType2.contains("D")){
				return ContributionType.getByCode(newLinkType + "D");
			}
			return ContributionType.getByCode(newLinkType);

		}
		if(linkType1.contains("-")){
			if(linkType1.contains("S") && linkType2.contains("D") || linkType2.contains("D") && linkType1.contains("S")){
				if(linkType1.contains("--") && linkType2.contains("--")){
					return ContributionType.PP;
				}
				return ContributionType.P;
			}
			String newLinkType = "";
			if(linkType1.lastIndexOf("-") != linkType1.lastIndexOf("-")){
				newLinkType = "-";
			}
			else{
				newLinkType = linkType1.substring(linkType1.lastIndexOf("-"));
			}

			if(linkType1.contains("S") || linkType2.contains("S")){
				return ContributionType.getByCode(newLinkType + "S");
			}
			if(linkType1.contains("D") || linkType2.contains("D")){
				return ContributionType.getByCode(newLinkType + "D");
			}
			return ContributionType.getByCode(newLinkType);

		}
		return ContributionType.NONE;

	}

	/**
	 * Checks if two links of the same type connect the same intentions
	 *
	 */
	public static boolean isSameLink(AbstractElement link1, AbstractElement link2){
		if(link1 instanceof NotBothLink){
			NotBothLink linkOne = (NotBothLink)link1;
			NotBothLink linkTwo = (NotBothLink)link2;
			return linkOne.getElement1().getName().equals(linkTwo.getElement1().getName()) && linkOne.getElement2().getName().equals(linkTwo.getElement2().getName());
		}
		if(link1 instanceof DecompositionLink){
			DecompositionLink linkOne = (DecompositionLink)link1;
			DecompositionLink linkTwo = (DecompositionLink)link2;
			return linkOne.getDest() == linkTwo.getDest();
		}
		ContributionLink linkOne = (ContributionLink)link1;
		ContributionLink linkTwo = (ContributionLink)link2;
		return linkOne.getDest() == linkTwo.getDest() && linkOne.getZeroSrc() == linkTwo.getZeroSrc();
	}

	public static FunctionSegment[] mergeEvolvingFunctions(Intention intention1, Intention intention2, Integer delta, List<String> newTimeOrder,
														   Integer maxTime1, Integer maxTime2, String maxTimeName1, String maxTimeName2) {
		if (MMain.DEBUG) System.out.println("Starting: mergeEvolvingFunctions");

		// TODO: one intention is static - treat as constant function
		// TODO: make sure same system works for contigous and gap info
		/*
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
		 * # e.g.: [A-Initial, ... , B-MaxTime]
		 * []
		 */
		/*List<String> timing = new ArrayList<>();

		timing.add("A-Initial");
		timing.add("A-A");
		timing.add("B-Initial");
		timing.add("A-100");
		timing.add("B-A");
		timing.add("B-195");

		timing.add("A-Initial");
		timing.add("B-Initial");
		timing.add("AB-A");
		timing.add("A-100");
		timing.add("B-105");

		List<String> timingShort = new ArrayList<>();
		timingShort.add("0");
		timingShort.add("5");
		timingShort.add("E002TPA");
		timingShort.add("E005TPA");
		timingShort.add("100");
		timingShort.add("105");

		System.out.println("timing:");
		System.out.println(timingShort);
		*/
		List<MFunctionSegment> segsA = completeFunctionInfo(intention1.getEvolvingFunctions(), intention1.getInitialUserEval(), maxTime1, maxTimeName1);
		List<MFunctionSegment> segsB = completeFunctionInfo(intention2.getEvolvingFunctions(), intention2.getInitialUserEval(), maxTime2, maxTimeName2);

		// merge functions
		MergeEvolvingFunction merge = new MergeEvolvingFunction(segsA, segsB, newTimeOrder);
		return merge.outputMergedSegments();
	}


	/******************************************************************
	 * For preparing MFunctionSegment lists with info from intention
	 * to send into MergeEvolvingFunction
	 ******************************************************************/

	/**
	 * Determines start evidence pairs and end times for function segments
	 */
	private static List<MFunctionSegment> completeFunctionInfo(FunctionSegment[] oldSegs, String initialEval, Integer maxTime, String maxTimeName){
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
			MFunctionSegment onlySeg = new MFunctionSegment(oldSegs[0], maxTime, maxTimeName, initialEval);
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
		MFunctionSegment lastSeg = new MFunctionSegment(oldSegs[oldSegs.length-1], maxTime, maxTimeName, oldSegs[oldSegs.length-2].getRefEvidencePair());
		newSegs.add(lastSeg);

		return newSegs;
	}

}
