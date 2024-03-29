package merge;

import simulation.*;

import java.util.*;
import static java.lang.Math.max;

public class MergeAlgorithm {
	// models
	ModelSpec model1, model2, mergedModel;

	// timing info
	Integer delta, maxTime1, maxTime2, maxTimeMerged;
	TMain timings;
	//Traceability obj
	Traceability trace;
	// tracks elements that are deleted in the merge
	ArrayList<ArrayList<? extends AbstractElement>> deletedElements;
	ArrayList<String> deletedTimings;
	// collects messages about conflicts in the merge process that the user must remedy
	ArrayList<String> conflictMessages;

	/**
	 * Initialize mergeAlgorithm and run mergeModels()
	 */

	public MergeAlgorithm(ModelSpec model1, ModelSpec model2, TMain timings, String filename) {

		if (MMain.DEBUG) System.out.println("Starting: MergeAlgorithm");
		// set up models
		this.model1 = model1;
		this.model2 = model2;
		this.mergedModel = new ModelSpec();

		// Tracks elements that are deleted in the merge
		this.deletedElements = new ArrayList<ArrayList<? extends AbstractElement>>();
		this.deletedTimings = new ArrayList<String>();

		// set up timing
		this.timings = timings;
		this.delta = timings.getTimingOffset();
		this.maxTime1 = model1.getMaxTime();
		this.maxTime2 = model2.getMaxTime() + delta;

		//collects messages about conflicts
		this.conflictMessages = new ArrayList<String>();

		// pre-process timing and rename maxTimes to ints
		this.timings.initializeTiming(maxTime1, maxTime2);

		//set up traceability obj
		trace = new Traceability(filename, model1, model2);

		// run merge algorithm
		mergeModels();
	}

	/**
	 * Merges two modelSpecs
	 * @param model1
	 * @param model2
	 * @param delta - how much longer model2 starts after model1 starts
	 * @param timings
	 * @return the merged model
	 */
	public ModelSpec mergeModels(){
		long startTime= System.currentTimeMillis();
		if (MMain.DEBUG) System.out.println("Starting: mergeModels");

		// update the models' times
		if (MMain.DEBUG) System.out.println("Starting: updateTimeline");
		updateTimeline();

		if (MMain.DEBUG) System.out.println("Starting: mergeIntentions");
		mergeIntentions();

		if (MMain.DEBUG) System.out.println("Starting: mergeActors");
		mergeActors();

		if (MMain.DEBUG) System.out.println("Starting: mergeActorsLinks");
		mergeActorLinks();

		if (MMain.DEBUG) System.out.println("Starting: mergeLinks");
		mergeLinks();

		// calculate runtime
		long runtime = System.currentTimeMillis() - startTime;

		// print traceability report
		if (MMain.DEBUG) System.out.println("Starting: printTraceability");
	    printTraceability(runtime);

	    if (MMain.DEBUG) System.out.println("Merge complete.");

		return mergedModel;
	}

	/**
	 * Print traceability merge results to file
	 */
	public void printTraceability(long runtime) {
		trace.printDeletedToFile(deletedElements, deletedTimings);
		trace.printConflictMessagesToFile(conflictMessages);
		trace.printOutput(mergedModel);
		trace.printElementCountsToFile(mergedModel);
		trace.addLine("\nThe merge took: " + Long.toString(runtime) + " milliseconds.");
	}


	/**
	 * Updates two modelSpecs' absolute and max time points
	 * @param model1
	 * @param model2
	 * @param delta
	 */
	public void updateTimeline() {
		// update max time for both models
		// greater of model1 and model2's new times
		Integer newMax = Math.max(model1.getMaxTime(), model2.getMaxTime() + delta);
		model1.setMaxTime(newMax);
		model2.setMaxTime(newMax);
		mergedModel.setMaxTime(newMax);

		// update absolute time points for model 2
		// future work: rename Initial in model B
		model2.incrementAbsTP(delta);

		// update absolute time points for model 2 stored in intentions' UAL
		for (Intention intention: model2.getIntentions()) {
			intention.incrementUserEvals(delta);
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
	public void mergeIntentions() {
		ArrayList<Intention> mergedIntentions = new ArrayList<Intention>();
		HashSet<String> mergedIntentionsNameSet = new HashSet<String>();
		int currIDCount = 0;

		//add all intentions from model1
		for(Intention intention: model1.getIntentions()) {
			updateIntentionID(createID(currIDCount, 1, intention.getId(), "intention"), intention.getId(), model1, intention);
			mergedIntentions.add(intention);
			mergedIntentionsNameSet.add(intention.getName());
			currIDCount++;
		}
		//add/merge intentions from model2 onto model1
		for(Intention intention: model2.getIntentions()) {
			//if the intention is new...
			if(!containsCleaned(intention.getName(), mergedIntentionsNameSet)){
				updateIntentionID(createID(currIDCount, 2, intention.getId(), "intention"), intention.getId(), model2, intention);
				intention.addUserEval(0, "(no value)"); // add eval at 0
				mergedIntentions.add(intention);
				mergedIntentionsNameSet.add(intention.getName());
				currIDCount++;

			}
			else{
			//else merge intentions from model1 and model2 that are considered the same because they have the same name.
				for(Intention mergedIntention: mergedIntentions){
					if(isEqualToCleaned(mergedIntention.getName(),intention.getName())){
						if (MMain.DEBUG) System.out.println("Merging intention: " + intention.getName());
						//update ID to show that intention also exists in model2

						mergedIntention.setId(mergedIntention.getId() + "2");

						//actor merging
						if((mergedIntention.hasActor() && intention.hasActor()) && !isEqualToCleaned(mergedIntention.getActor().getName(),intention.getActor().getName())){
							//UNRESOLVABLE CONFLICT
							if (MMain.DEBUG) System.out.println("!!!Intentions in different actors!!!");
							conflictMessages.add(mergedIntention.getName() + " has different actors in each model.");
						}

						if(!intention.hasActor()) {
							mergedIntention.removeActor();
						}

						//type merging
						if(mergedIntention.compareType(intention) < 0){
							mergedIntention.setType(intention.getType());
						}

						// merge evolving functions
						FunctionSegment[] mergeEF = mergeEvolvingFunctions(mergedIntention, intention);
						mergedIntention.setEvolvingFunctions(mergeEF);

						// user evaluation merging
						HashMap<Integer, String> userEvalsA = mergedIntention.getUserEvals();
						HashMap<Integer, String> userEvalsB = intention.getUserEvals();

						// add UALs from B to those from A
						for(int absTP:userEvalsB.keySet()) {
							if (!userEvalsA.containsKey(absTP)) {  // eval is just in B
								userEvalsA.put(absTP, userEvalsB.get(absTP));
							} else {                               // eval is in A and B, keep consensus
								String newEval = MEPOperators.consensus(userEvalsA.get(absTP), userEvalsB.get(absTP));
								userEvalsA.put(absTP, newEval);
							}
						}
						mergedIntention.setUserEvals(userEvalsA);

						//replace all mentions of intention with mergedIntention in Model2
						updateRepeatedIntention(mergedIntention, intention, model2);
					}
				}
			}
		}
		mergedModel.setIntentions(mergedIntentions);

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
     * Attach old links to new intentions
	 */
	public static void updateRepeatedIntention(Intention newIntention, Intention oldIntention, ModelSpec model2){

		//not both links
		for(NotBothLink nbl: model2.getNotBothLink()){
			//Check source intention
			if(nbl.getElement1() == oldIntention){
				nbl.setElement1(newIntention);
			}
			//check destination intention
			if(nbl.getElement2() == oldIntention){
				nbl.setElement2(newIntention);
			}
		}

		//contributionLinks
		for(ContributionLink cl: model2.getContributionLinks()){
			//Check all source intentions
			for(int i = 0; i < cl.getSrc().length; i++){
				if(cl.getSrc()[i] instanceof Intention && ((Intention)cl.getSrc()[i]) == oldIntention){
					cl.getSrc()[i] = newIntention;
				}
			}
			//check destination intention
			if(cl.getDest() == oldIntention){
				cl.setDest(newIntention);
			}
		}
		//DecompositionLinks
		for(DecompositionLink dl: model2.getDecompositionLinks()){
			for(int i = 0; i < dl.getSrc().length; i++){
				//Check all source intentions
				if(dl.getSrc()[i] instanceof Intention && ((Intention)dl.getSrc()[i]) == oldIntention){
					dl.getSrc()[i] = newIntention;
				}
			}
			//check destination intention
			if(dl.getDest() == oldIntention){
				dl.setDest(newIntention);
			}
		}

	}

	// ******* Actor merging methods begin ******** //
	public static Actor mergeToOneActor(Actor actorOne, Actor actorTwo, int actorNum, ModelSpec model1, ModelSpec model2) {
		// type G > R > A (agent > role > actor)

		// so use actorOne if >= type to actorTwo
		if(actorOne.getActorType().equals(actorTwo.getActorType()) || (actorOne.getActorType().equals("G")) || (actorOne.getActorType().equals("R") && !actorTwo.getActorType().equals("G"))) {
			String newId = createID(actorNum, 12, actorOne.getId(), "Actor");
			actorOne.setId(newId);

			//transfer all children/attachments to actor 1
			updateRepeatedActor(actorOne, actorTwo, model2);
			return actorOne;
		}

		// else use actorTwo if > type to actorOne
		String newId = createID(actorNum, 21, actorTwo.getId(), "Actor");
		actorTwo.setId(newId);

		//transfer all children/attachments to actor 1
		updateRepeatedActor(actorTwo, actorOne, model1);
		return actorTwo;

	}

	public void mergeActors() {
		//to keep track of all the actors
		HashSet<String> actorsNameSet = new HashSet<>();
		ArrayList<Actor> mergedActors = new ArrayList<>();

		//for id'ing
		int actorCounter = 0;

		//check for matches between actors based on name
		for(Actor actor1: model1.getActors()) {
			for(Actor actor2: model2.getActors()) {
				if(isEqualToCleaned(actor1.getName(),actor2.getName())) {
					//merge actors
					mergedActors.add(mergeToOneActor(actor1, actor2, actorCounter, model1, model2));

					//add actors
					actorsNameSet.add(actor1.getName());

					actorCounter += 1;

				}
			}
		}

		//add any unique actors from model 1
		for(Actor actor1: model1.getActors()) {
			if(!containsCleaned(actor1.getName(), actorsNameSet)) {
				//change id
				String newId = createID(actorCounter, 1, actor1.getId(), "Actor");
				actor1.setId(newId);

				//add actor
				mergedActors.add(actor1);
				actorsNameSet.add(actor1.getName());

				actorCounter += 1;

			}
		}

		//add any unique actors from model 2
		for(Actor actor2: model2.getActors()) {
			if(!containsCleaned(actor2.getName(), actorsNameSet)) {
				//change id
				String newId = createID(actorCounter, 2, actor2.getId(), "Actor");
				actor2.setId(newId);

				//add actor
				mergedActors.add(actor2);
				actorsNameSet.add(actor2.getName());

				actorCounter += 1;

			}
		}

		//add merged actors to model
		mergedModel.setActors(mergedActors);
	}
	/*when an actor from one model is accepted, the  instances of actors with the same names must be
	 * replaced in the other model.
	 */
	public static void updateRepeatedActor(Actor newActor, Actor oldActor, ModelSpec otherModel) {
		// replace oldActor with newActor for each intention + link in the other model
		// intentions
		for(Intention intention: otherModel.getIntentions()) {
			if(intention.getActor() == oldActor){
				intention.setActor(newActor);
				//add intention to new actor
				boolean added = newActor.addEmbed((AbstractElement)intention);

				if(MMain.DEBUG && added) System.out.println("intention " + intention.getName() + " added to newActor " + newActor.getName());

			}
		}

		// links
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

	public void mergeActorLinks() {
		ArrayList<ActorLink> mergedAL = new ArrayList<>(); //ALs that will be preserved
		ArrayList<ActorLink> deletedAL = new ArrayList<>(); //ALs that will be logged as deleted

		//for id'ing
		int linkCount = 0;

		//add all actorlinks from model 1
		for(ActorLink al: model1.getActorLinks()) {
			//check that types match up with actor + link
			if(isValidTypes((Actor)al.getZeroSrc(), (Actor)al.getDest(), al.getType())) {
				String newID = createID(linkCount, 1, al.getID(), "ActorLink");
				al.setID(newID);

				mergedAL.add(al);
				linkCount++;
			}
			deletedAL.add(al);

		}

		//begin merging actorLinks from model 2 on top of model 1
		for(ActorLink al: model2.getActorLinks()) {
			boolean isNewLink = true;

			//check if its a unique link or needs to be merged in
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
			//if its unique
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

		//log conflict messages for all deletions
		for(ActorLink al: deletedAL) {
			if(mergedAL.contains(al)) {
				mergedAL.remove(al);
				conflictMessages.add(al.getName() + " conflicted with actor types.");
			}
		}

		//add merged AL to merged model
		mergedModel.setActorLinks(mergedAL);

		//add deleted ALs to deleted elements list for logging
		deletedElements.add((ArrayList<? extends AbstractElement>) deletedAL);
	}

	public static void updateALTypes(ActorLink al1, ActorLink al2) {

		//convert the AL types to PI if they aren't the same
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
		//checking that source and destination of both actorlinks are the same
		return (isEqualToCleaned(al1.getZeroSrc().getName(),al2.getZeroSrc().getName()) && isEqualToCleaned(al1.getDest().getName(),al2.getDest().getName()));

	}

	// ******* Link merging methods begin ******** //

	public void mergeLinks(){
		//Question what if there are two different relationships connecting the same intentions

		ArrayList<NotBothLink> mergedNBL = new ArrayList<>();
		ArrayList<ContributionLink> mergedCL = new ArrayList<>();
		ArrayList<DecompositionLink> mergedDL = new ArrayList<>();
		int linkCount = 0;

		//add nbls from model1
		for(NotBothLink nbl: model1.getNotBothLink()){
			String newID = createID(linkCount, 1, nbl.getID(), "NotBothLink");

			nbl.setID(newID);
			linkCount++;
			mergedNBL.add(nbl);
		}
		//add CL from model1
		for(ContributionLink cl: model1.getContributionLinks()){
			String newID = createID(linkCount, 1, cl.getID(), "ContributionLink");

			cl.setID(newID);
			linkCount++;
			mergedCL.add(cl);
		}
		//add dl from model1
		for(DecompositionLink dl: model1.getDecompositionLinks()){
			String newID = createID(linkCount, 1, dl.getID(), "DecompositionLink");

			dl.setID(newID);
			linkCount++;
			mergedDL.add(dl);
		}

		//merged nbl from model2 onto model1
		for(NotBothLink nbl: model2.getNotBothLink()){
			boolean isNewLink = true;
			for(NotBothLink addednbl: mergedNBL){
				if(isSameLink(addednbl, nbl)){
					isNewLink = false;
					//merge these links
					if(addednbl.isFinalDenied() != nbl.isFinalDenied()) {
						addednbl.setFinalDenied(true);
					}

					//adjust ID for merged link
					addednbl.setID(addednbl.getID() + "2");
				}
			}
			if(isNewLink) {
				String newID = createID(linkCount, 2, nbl.getID(), "NotBothLink");
				nbl.setID(newID);
				linkCount++;
				mergedNBL.add(nbl);
				//add link to intentions that it touches
			}
		}

		//merge CLs from model2 onto model1
		for(ContributionLink cl: model2.getContributionLinks()){
			boolean isNewLink = true;
			for(ContributionLink  addedcl: mergedCL){
				if(isSameLink(addedcl, cl)){
					isNewLink = false;
					//merge these links

					//adjust ID for merged link
					addedcl.setID(addedcl.getID() + "2");

					addedcl.setPreContribution(mergeContributionTypesSemiGullible(addedcl.getPreContribution(), cl.getPreContribution()));
					//check if there was a problem in merging types
					if(addedcl.getPreContribution() == ContributionType.NONE){
						//Conflict alert user
						if (MMain.DEBUG) System.out.println("preContribution types were unresolvable");
						conflictMessages.add(addedcl.getName() + " had preContribution types that were unresolvable.");
					}

					//both are static
					if(!addedcl.isEvolving() && !cl.isEvolving()) {
						continue;
					}

					//just one is evolving
					if(addedcl.isEvolving() ^ cl.isEvolving()) {
						if(addedcl.isEvolving()) {
							//merge pre of static cl and post of evolving addedcl
							addedcl.setPostContribution(mergeContributionTypesSemiGullible(addedcl.getPostContribution(), cl.getPreContribution()));

						}
						else {
							//merge pre of static addedcl and post of evolving cl
							addedcl.setPostContribution(mergeContributionTypesSemiGullible(addedcl.getPreContribution(), cl.getPostContribution()));
							//add transition time point info if applicable
							if(cl.getAbsTime() != null) {
								addedcl.setAbsTime(cl.getAbsTime());
								addedcl.updateLinkTP(cl.getLinkTP());
								addedcl.nowEvolves();
							}
						}

					}
					//both are evolving
					else {
						addedcl.setPostContribution(mergeContributionTypesSemiGullible(addedcl.getPostContribution(), cl.getPostContribution()));
						//add tp info from cl if none already
						if(addedcl.getAbsTime() == null && cl.getAbsTime() != null) {
							addedcl.setAbsTime(cl.getAbsTime());
							addedcl.updateLinkTP(cl.getLinkTP());
						}
						//check for tp conflict
						else if(addedcl.getAbsTime() != cl.getAbsTime() && cl.getAbsTime() != null) {
							deletedTimings.add(addedcl.getLinkTP() + "=" + Integer.toString(addedcl.getAbsTime()) + ", "+ cl.getLinkTP() + "=" + Integer.toString(cl.getAbsTime()));
							conflictMessages.add(addedcl.getName() + " had link abs time points that were unresolvable.");
							addedcl.setAbsTime((Integer)null);
							cl.setAbsTime((Integer) null);
							addedcl.updateLinkTP(addedcl.getLinkTP() + cl.getLinkTP());
							cl.updateLinkTP(addedcl.getLinkTP());


						}
					}

					//check if conflict has occurred
					if(addedcl.getPostContribution() == ContributionType.NONE){
						//Conflict alert user
						if (MMain.DEBUG) System.out.println("postContribution types were unresolvable");
						conflictMessages.add(addedcl.getName() + " had contribution types that were unresolvable.");
					}
					//check if it is no longer evolving
					if(addedcl.getPostContribution() == addedcl.getPreContribution()) {
						addedcl.noLongerEvolves();
					}


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
			}
		}

		//merge dl from model2 onto model1
		for(DecompositionLink dl: model2.getDecompositionLinks()){
			boolean isNewLink = true;
			for(DecompositionLink addeddl: mergedDL){
				if(isSameLink(addeddl, dl)){
					isNewLink = false;
					//merge these links

					//add new sources to the dl
					for(AbstractLinkableElement source: dl.getSrc()) {
						boolean newSource = true;
						for(AbstractLinkableElement addedSource: addeddl.getSrc()) {
							if(isEqualToCleaned(addedSource.getName(),source.getName())) {
								newSource = false;
							}
						}
						if(newSource) {
							addeddl.addSrc(source);
							source.addLinksAsSrc(addeddl);
							addeddl.addNewSublinkID("");

						}
					}

					//adjust ID for merged link
					addeddl.setID(addeddl.getID() + "2");

					//check to make sure and/or types match
					if(addeddl.getPreDecomposition() != dl.getPreDecomposition()){
						addeddl.setPreDecomposition(DecompositionType.NONE);
						//Conflict alert user
						if (MMain.DEBUG) System.out.println("preDecomp types unresolvable");
						conflictMessages.add(addeddl.getName() + " had preDecomposition types that were unresolvable.");
					}

					//both are static
					if(!addeddl.isEvolving() && !dl.isEvolving()) {
						continue;
					}

					//just one is static
					if(addeddl.isEvolving() ^ dl.isEvolving()) {
						if(addeddl.isEvolving()) {
							if(addeddl.getPostDecomposition() != dl.getPreDecomposition()){
								addeddl.setPostDecomposition(DecompositionType.NONE);
								//Conflict alert user
								if (MMain.DEBUG) System.out.println("postdecomp types are different");
								conflictMessages.add(addeddl.getName() + " had postdecomposition types that were unresolvable.");
							}

						}else {
							if(addeddl.getPreDecomposition() != dl.getPostDecomposition()){
								addeddl.setPostDecomposition(DecompositionType.NONE);
								//Conflict alert user
								if (MMain.DEBUG) System.out.println("postdecomp types are different");
								conflictMessages.add(addeddl.getName() + " had postdecomposition types that were unresolvable.");
							}
							//add transition time point info if applicable
							if(dl.getAbsTime() != null) {
								addeddl.setAbsTime(dl.getAbsTime());
								addeddl.updateLinkTP(dl.getLinkTP());
								addeddl.nowEvolves();
							}

						}
					}
					//both are evolving
					else {
						if(addeddl.getPostDecomposition() != dl.getPostDecomposition()){
							addeddl.setPostDecomposition(DecompositionType.NONE);
							//Conflict alert user
							if (MMain.DEBUG) System.out.println("decomp types are different");
							conflictMessages.add(addeddl.getName() + " had decomposition types that were unresolvable.");
						}
						//if dl has any tp info need to add
						if(addeddl.getAbsTime() == null && dl.getAbsTime() != null) {
							addeddl.setAbsTime(dl.getAbsTime());
							addeddl.updateLinkTP(dl.getLinkTP());
						}
						//check for tp info conflict
						else if(addeddl.getAbsTime() != dl.getAbsTime() && dl.getAbsTime() != null) {
							deletedTimings.add(addeddl.getLinkTP() + "=" + Integer.toString(addeddl.getAbsTime()) + ", "+ dl.getLinkTP() + "=" + Integer.toString(dl.getAbsTime()));
							conflictMessages.add(addeddl.getName() + " had link abs time points that were unresolvable.");
							addeddl.setAbsTime((Integer)null);
							dl.setAbsTime((Integer) null);
							addeddl.updateLinkTP(addeddl.getLinkTP() + dl.getLinkTP());
							dl.updateLinkTP(addeddl.getLinkTP());
						}
					}

					//check if it is no longer evolving
					if(addeddl.getPostDecomposition() == addeddl.getPreDecomposition()) {
						addeddl.noLongerEvolves();
					}

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
			}
		}

		//check that NBL is not conflicting with intentions
		ArrayList<NotBothLink> deletedNBL = new ArrayList<NotBothLink>();
		for(int x = 0; x < mergedNBL.size(); x++) {
			NotBothLink nbl= mergedNBL.get(x);
			boolean deleted = false;
			//absTP 0's
			String eval1 = nbl.getElement1().getInitialUserEval();
			String eval2= nbl.getElement2().getUserEvalAt(delta);

			//conflict if mismatching absTP 0's
			if(!eval1.equals("0000") && !eval1.equals("(no value)") || !eval2.equals("0000") && !eval2.equals("(no value)")) {
				//Conflict!!
				deletedNBL.add(nbl);  // add to deletedNBL to delete outside loop
				conflictMessages.add(nbl.getName() + " conflicted with intentino absTP 0");
				deleted = true;
			}

			//conflict if any evolfuncs are stochastic
			for(FunctionSegment funcSeg: nbl.getElement1().getEvolvingFunctions()) {
				if(funcSeg.getType().equals("R") && !deleted) {
					deletedNBL.add(nbl);  // add to deletedNBL to delete outside loop
					conflictMessages.add(nbl.getName() + " connected intention with stochastic func.");
					deleted = true;
				}
			}
			for(FunctionSegment funcSeg: nbl.getElement2().getEvolvingFunctions()) {
				if(funcSeg.getType().equals("R") && !deleted) {
					deletedNBL.add(nbl);  // add to deletedNBL to delete outside loop
					conflictMessages.add(nbl.getName() + " connected intention with stochastic func.");
					deleted = true;
				}
			}
		}
		//add nbls to deleted elements
		mergedNBL.removeAll(deletedNBL);
		deletedElements.add((ArrayList<? extends AbstractElement>) deletedNBL);

		//add links to model
		mergedModel.setContributionLinks(mergedCL);
		mergedModel.setDecompositionLinks(mergedDL);
		mergedModel.setNotBothLinks(mergedNBL);
	}

	/**
	 * Merges contribution types using the semi-gullible approach to minimize "none" evaluations
	 * @param ct1
	 * @param ct2
	 * @return merged contribution type
	 */
	public static ContributionType mergeContributionTypesSemiGullible(ContributionType ct1, ContributionType ct2){
		//in case either types don't exist
		if(ct1 == null) {
			if(ct2 != null) {
				return ct2;
			}
			return null;
		} else if(ct2 == null) {
			return null;
		}

		//get string codes for types to compare easily
		String linkType1 = ct1.getCode();
		String linkType2 = ct2.getCode();

		//checks if link types are the same
		if(linkType1.equals(linkType2)){
			return ct1;
		}
		//checks if link types are opposing signs
		if(linkType1.contains("-") && linkType2.contains("+") || linkType1.contains("+") && linkType2.contains("-")){
			return ContributionType.NONE;
		}
		//if they are both positive...
		if(linkType1.contains("+")){
			//if link types are opposite
			if(linkType1.contains("S") && linkType2.contains("D") || linkType1.contains("D") && linkType2.contains("S")){
				if(linkType1.contains("++") && linkType2.contains("++")){
					return ContributionType.PP;
				}
				return ContributionType.P;
			}
			String newLinkType = "";
			//if the two are ++/+ then the new link is +
			if(linkType1.lastIndexOf("+") != linkType2.lastIndexOf("+")){
				newLinkType = "+";
			}
			//else the type is what they both are
			else{
				newLinkType = linkType1.substring(0, linkType1.lastIndexOf("+")+1);
			}

			//if either have an S add it
			if(linkType1.contains("S") || linkType2.contains("S")){
				return ContributionType.getByCode(newLinkType + "S");
			}
			//if either have a D add it
			if(linkType1.contains("D") || linkType2.contains("D")){
				return ContributionType.getByCode(newLinkType + "D");
			}
			return ContributionType.getByCode(newLinkType);

		}
		//if they are both negative...
		if(linkType1.contains("-")){
			//checks if link types are opposite
			if(linkType1.contains("S") && linkType2.contains("D") || linkType1.contains("D") && linkType2.contains("S")){
				if(linkType1.contains("--") && linkType2.contains("--")){
					return ContributionType.MM;
				}
				return ContributionType.M;
			}
			String newLinkType = "";
			//if they are different -- and - then it becomes a -
			if(linkType1.lastIndexOf("-") != linkType2.lastIndexOf("-")){
				newLinkType = "-";
			}
			else{
				newLinkType = linkType1.substring(0, linkType1.lastIndexOf("-")+1);
			}
			//if either have an S add it
			if(linkType1.contains("S") || linkType2.contains("S")){
				return ContributionType.getByCode(newLinkType + "S");
			}
			//if either have a D add it
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
			return isEqualToCleaned(linkOne.getElement1().getName(),linkTwo.getElement1().getName()) && isEqualToCleaned(linkOne.getElement2().getName(),linkTwo.getElement2().getName());
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

	/**
	 * Begin merging evolving functions
	 */

	public FunctionSegment[] mergeEvolvingFunctions(Intention intention1, Intention intention2) {
		if (MMain.DEBUG) System.out.println("Starting: mergeEvolvingFunctions");

		// get evolving functions for both intentions
		FunctionSegment[] funcSeg1 = intention1.getEvolvingFunctions();
		FunctionSegment[] funcSeg2 = intention2.getEvolvingFunctions();

		// no evolving functions
		if (funcSeg1.length == 0 && funcSeg2.length == 0) {
			return new FunctionSegment[0];
		}

		// one intention is static
		if (funcSeg1.length == 0) {
			// A is static, use B's function segments

			// gullibility: accept other intention's evolving functions;
			// stochastic outside range of other intention's functions
			if ((delta > 0) && (maxTime1 > maxTime2)) {
				// gaps at beginning and end
				// new array 2 larger
				FunctionSegment[] newSegs = new FunctionSegment[funcSeg2.length + 2];
				newSegs[0] = new FunctionSegment("R", "(no value)", "0", 0);
				System.arraycopy(funcSeg2, 0, newSegs, 1, funcSeg2.length);
				newSegs[funcSeg2.length+1] = new FunctionSegment("R", "(no value)", "B-MaxTime", maxTime2);
				return newSegs;
			} else if ((delta > 0) && (maxTime1 > maxTime2)) {
				// gap just at beginning
				// new array 1 larger
				FunctionSegment[] newSegs = new FunctionSegment[funcSeg2.length + 1];
				newSegs[0] = new FunctionSegment("R", "(no value)", "0", 0);
				System.arraycopy(funcSeg2, 0, newSegs, 1, funcSeg2.length);
				return newSegs;
			}
			else if ((delta > 0) && (maxTime1 > maxTime2)) {
				// gap just at end
				// new array 1 larger
				FunctionSegment[] newSegs = new FunctionSegment[funcSeg2.length + 1];
				System.arraycopy(funcSeg2, 0, newSegs, 0, funcSeg2.length);
				newSegs[funcSeg2.length] = new FunctionSegment("R", "(no value)", "B-MaxTime", maxTime2);
				return newSegs;
			} else {
				// no gaps
				return funcSeg2;
			}
		} else if (funcSeg2.length == 0) {
			// B is static, use A's function segments
			// gullibility: accept other intention's evolving functions;
			// stochastic outside range of other intention's functions
			if (maxTime1 < maxTime2) {
				// A can only have gap at end
				// new array 1 larger
				FunctionSegment[] newSegs = new FunctionSegment[funcSeg1.length + 1];
				System.arraycopy(funcSeg1, 0, newSegs, 0, funcSeg1.length);
				newSegs[funcSeg1.length] = new FunctionSegment("R", "(no value)", "A-MaxTime", maxTime1);

				return newSegs;
			} else {
				// no gaps
				return funcSeg1;
			}
		}

		// begin evolving intentions where both have evolving functions

		// for contiguous or gap timelines, save time by simply appending arrays
		// (delta >= maxTime1, aka model 2 starts after model1 ends)

		// merge evolving functions when model 2 starts where model 1 ends
		// (contiguous function info)
		if (maxTime1 == delta) {
			// append evolving functions
			FunctionSegment[] combined = new FunctionSegment[funcSeg1.length + funcSeg2.length]; // initialize array to hold info from both
			System.arraycopy(funcSeg1, 0, combined, 0, funcSeg1.length);  // copy first array into combined
			System.arraycopy(funcSeg2, 0, combined, funcSeg1.length, funcSeg2.length);  // copy second array ""

			// future work: give user the option to rename timepoints
			// when intention merge isn't automatically requested in timing.json

			return combined;
		}

		// merge evolving functions w/ gap between model 1 and model 2
		// (gap)
		if (maxTime1 < delta) {
			// create extra function segment for the gap, then copy rest of function segments over
			FunctionSegment fillGap = new FunctionSegment("R", "(no value)", "A-MaxTime", maxTime1);
			FunctionSegment[] combined = new FunctionSegment[funcSeg1.length + funcSeg2.length + 1]; // initialize array to hold info from both
			System.arraycopy(funcSeg1, 0, combined, 0, funcSeg1.length);  // copy first array into combined
			combined[funcSeg1.length] = fillGap;  // add gap segment in the middle
			System.arraycopy(funcSeg2, 0, combined, funcSeg1.length+1, funcSeg2.length);  // copy second array ""

			// future work: give user the option to rename timepoints
			// when intention merge isn't automatically requested in timing.json

			return combined;
		}

		// merge overlapping evolving functions

		// set maxtime names
		String maxTimeName1, maxTimeName2;
		Boolean modelMaxTimesMatch = (maxTime1.equals(maxTime2));
		// models end at same maxtime
		if (modelMaxTimesMatch) {
			maxTimeName1 = "AB-MaxTime";
			maxTimeName2 = "AB-MaxTime";
		} else {
			// models have diff maxtime names
			maxTimeName1 = "A-MaxTime";
			maxTimeName2 = "B-MaxTime";
		}

		// resolve timing order (create if not given by user)
		List<String> timeOrder = new ArrayList<>();
		if (timings.hasTiming(intention1.getName())){
			// get timing order from user input
			TIntention intentionTiming = timings.getTiming(intention1.getName());
			timeOrder = intentionTiming.getNewTimeOrder();
		} else {
			// doesn't have timing from user because simple merge
			// see PreMerge conditions to skip inputting timing

			// one intention was static, and the other is just one function
			if (funcSeg1.length == 1 && funcSeg2.length == 1) {
				// start A and B
				timeOrder.add("0");
				timeOrder.add(Integer.toString(delta));

				// ending maxtimes
				if (modelMaxTimesMatch) {
					timeOrder.add("AB-MaxTime"); // end at same time
				} else if (maxTime1 < maxTime2) {
					timeOrder.add("A-MaxTime");  // A ends first
					timeOrder.add("B-MaxTime");
				} else {
					timeOrder.add("B-MaxTime");  // B ends first
					timeOrder.add("A-MaxTime");
				}

			}
			// (A or B is only one function, in which the other is entirely contained)
			// B contained in A
			else if (funcSeg1.length == 1 && maxTime1 >= maxTime2) {
				// start A
				timeOrder.add("0");

				// add all of B's timepoints
				timeOrder.addAll(intention2.getEvolvingFunctionStartTimes());

				// ending maxtimes
				if (modelMaxTimesMatch) {
					timeOrder.add("AB-MaxTime");
				} else {
					timeOrder.add("B-MaxTime");
					timeOrder.add("A-MaxTime");
				}
			} // A contained in B
			else if ((delta == 0) && (funcSeg2.length == 1) && (maxTime1 <= maxTime2)) {
				// A and B start at 0
				// add all of A's timepoints
				timeOrder.addAll(intention1.getEvolvingFunctionStartTimes());

				// ending maxtimes
				if (modelMaxTimesMatch) {
					timeOrder.add("AB-MaxTime");
				} else {
					timeOrder.add("A-MaxTime");
					timeOrder.add("B-MaxTime");
				}
			} else {
				// if not simple merge, we should have had timing info in timing.json
				// throw error

				throw new RuntimeException("Error while merging " + intention1.getName() + ": ambiguous timeline. Please order timepoints for this intention in timing.json");

			}
		}

		// replace maxtime names with maxtime ints in timeOrder
		if (modelMaxTimesMatch) {
			if (timeOrder.contains("AB-MaxTime")) {
				timeOrder.set(timeOrder.indexOf("AB-MaxTime"), maxTime1.toString());
			}
		} else {
			if (timeOrder.contains("A-MaxTime")) {
				timeOrder.set(timeOrder.indexOf("A-MaxTime"), maxTime1.toString());
			}
			if (timeOrder.contains("B-MaxTime")) {
				timeOrder.set(timeOrder.indexOf("B-MaxTime"), maxTime2.toString());
			}
		}

		// obtain complete functions (w/ start and end times and evidence pairs)
		List<MFunctionSegment> segsA = completeFunctionInfo(intention1.getEvolvingFunctions(), intention1.getInitialUserEval(), maxTime1, maxTimeName1);
		List<MFunctionSegment> segsB = completeFunctionInfo(intention2.getEvolvingFunctions(), intention2.getUserEvalAt(delta), maxTime2, maxTimeName2);

		// merge functions
		MergeEvolvingFunction merge = new MergeEvolvingFunction(segsA, segsB, timeOrder);

		// intention1 stores merged intention info;
		// save MFunctionSegments for the additional info
		intention1.setMergedEvolvingFunctions(merge.outputMergedSegments());

		// output merged functions as FunctionSegment[]
		return merge.outputMergedSegmentsArr();
	}

	/**
	 * Determines start evidence pairs and end times for function segments
	 * For preparing MFunctionSegment lists with info from intention
	 * to send into MergeEvolvingFunction
	 */
	private static List<MFunctionSegment> completeFunctionInfo(FunctionSegment[] oldSegs, String initialEval, Integer maxTime, String maxTimeName){
		// create List<MFunctionSegment> from FunctionSegment[]
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

	public ModelSpec getMergedModel() {
		return mergedModel;
	}

	/**
	 *
	 * @param s1
	 * @param s2
	 * @return if the strings are equal when cleaned
	 */
	public static boolean isEqualToCleaned(String s1, String s2) {
		String cleanedS1 = s1.replace("\n", "").replace(" ", "").toUpperCase();
		String cleanedS2 = s2.replace("\n", "").replace(" ", "").toUpperCase();
		return cleanedS1.equals(cleanedS2);
	}

	/**
	 *
	 * @param s1
	 * @param stringSet
	 * @return if stringSet contains s1 when cleaned
	 */
	public static boolean containsCleaned(String s1, HashSet<String> stringSet) {
		String cleanedS1 = s1.replace("\n", "").replace(" ", "").toUpperCase();
		String cleanedS2;

		for (String s2: stringSet) {
			cleanedS2 = s2.replace("\n", "").replace(" ", "").toUpperCase();
			if (cleanedS1.equals(cleanedS2)) {
				return true;
			}
		}

		return false;
	}

}
