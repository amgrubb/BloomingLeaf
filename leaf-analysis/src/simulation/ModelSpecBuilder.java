package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;

import interface_objects.*;

/**
 * This class is responsible to get the frontend model and convert into the backend model filling the necessary attributes.
 *
 */
public class ModelSpecBuilder {
    private final static boolean DEBUG = true;	

	
	public static ModelSpec buildModelSpec(InputObject frontendObject){
		//Frontend model and analysis information
		InputModel frontendModel = frontendObject.getModel();
		
		InputAnalysis analysis = frontendObject.getAnalysis();

		//Backend Model
		ModelSpec modelSpec = new ModelSpec();

		try {

			// Type of analysis
			if (analysis.getAction().equals("allNextStates") && analysis.getCurrentState().equals("0")) {
				modelSpec.setAnalysisType("allCurrentState");    //Convert to next analysis type.
			} else {
				modelSpec.setAnalysisType(analysis.getAction());
			}
			if (DEBUG) System.out.println("Read Type of Analysis");

			// Conflict level
			if (analysis.getConflictLevel() != null) {
				modelSpec.setConflictAvoidLevel(analysis.getConflictLevel().charAt(0));
			}
			if (DEBUG) System.out.println("Read Conflict Level");

			// Absolute time points

			if (analysis.getAbsTimePtsArr().length > 0) {
				modelSpec.setAbsoluteTimePoints(analysis.getAbsTimePtsArr());
			}
			if (DEBUG) System.out.println("Read Absolute Time Points");

			//Max Absolute Time
			if(frontendModel.getMaxAbsTime() != null){
				modelSpec.setMaxTime(Integer.parseInt(frontendModel.getMaxAbsTime()));
			}
			if (DEBUG) System.out.println("Read Max Absolute Time");

			//Number of Relative time
			if(analysis.getNumRelTime() != null){
				modelSpec.setRelativeTimePoints(Integer.parseInt(analysis.getNumRelTime()));
			}

			if (DEBUG) System.out.println("Read Relative Time");

			AnalysisResult prevResult = analysis.getPreviousAnalysis();

			if(prevResult != null) {
				// If there was an analysis before the current analysis, do the following:				
				String[] absoluteTime = analysis.getCurrentState().split("\\|");
				int currentState = Integer.parseInt(absoluteTime[0]);
				System.out.println("current state: " + currentState);
				// Creates initial Assigned Epoch Map.
				String[] initialAssignedEpoch = prevResult.getAssignedEpoch();
				HashMap<String, Integer> initialAssignedEpochMap = new HashMap<>();
				//Send the whole hashmap
				for(int i = 0; i < initialAssignedEpoch.length; i++){
					String[] assignedEpoch = initialAssignedEpoch[i].split("_");
					String key = assignedEpoch[0].toString();
					Integer value = Integer.parseInt(assignedEpoch[1]);
					initialAssignedEpochMap.put(key, value);
					System.out.println("initialAssignedEpoch, key: " + key + ", value: " + value);
				}
				modelSpec.setInitialAssignedEpochs(initialAssignedEpochMap);

				// Creates array of size currentState + 1.
				// TODO: Should this be currentState + 2???
				String[] initialValueTimePoints = prevResult.getTimePointPath();
				int[] initialValueTimePointsArray = new int[currentState+1];
				for(int i = 0; i < currentState+1; i++){
					initialValueTimePointsArray[i] = Integer.parseInt(initialValueTimePoints[i]);
					System.out.println("parsing state #" + i + ", " + Integer.parseInt(initialValueTimePoints[i]));
				}
				modelSpec.setInitialValueTimePoints(initialValueTimePointsArray);
				
				// Set initial satisfaction values
				// If previous analysis does not matter
				
				System.out.println("getting initial satisfaction values");
				List<OutputElement> elementlist = prevResult.getElementList();
				boolean[][][] initialValues = new boolean[elementlist.size()][currentState+1][4];
				//System.out.println("parsing previous analysis result");
				for (int i_state = 0; i_state <  currentState+1; i_state ++){
					System.out.println("parsing state: " + i_state);
					for (OutputElement e: elementlist){
						String value = e.getStatus().get(i_state);
						System.out.println("element: " + e.getId() + "  status: " + value);
						if (value != null){
							for (int i = 0; i < 4; i++){
								if (value.charAt(i) == '1'){
									initialValues[Integer.parseInt(e.getId())][i_state][i] = true;
								} else {
									initialValues[Integer.parseInt(e.getId())][i_state][i] = false;
								}
							}
						} else {
							initialValues[Integer.parseInt(e.getId())][i_state][0] = false;
							initialValues[Integer.parseInt(e.getId())][i_state][1] = false;
							initialValues[Integer.parseInt(e.getId())][i_state][2] = false;
							initialValues[Integer.parseInt(e.getId())][i_state][3] = false;
						}
						
					}
				}
				modelSpec.setInitialValues(initialValues);
				if (DEBUG) System.out.println("Handled Previous Result");
				/*ArrayList<IntentionEvaluation> initUserAssign;
				if (currentState > 0){
					initUserAssign = new ArrayList<IntentionEvaluation>();
					List<OutputElement> elementlist = prevResult.getElementList();
					for (OutputElement e: elementlist){
						
						for(int i = 0; i < currentState+1; i++){
							IntentionEvaluation eval = new IntentionEvaluation();
							eval.setIntentionID(e.getId());
							eval.setAbsTime(initialValueTimePoints[i]);
							eval.setEvaluationValue(e.getStatus().get(i));
							initUserAssign.add(eval);
						}
					}					
					
				} else {
					initUserAssign = analysis.getInitialIntentionEvaluations();	
				}
				boolean[][][] initialValues = new boolean[initUserAssign.size()][currentState+1][4];
				for (int i_state = 0; i_state < currentState+1; i_state ++) {
					String evalValue = initUserAssign.get(i_state).getEvaluationValue();
					if (evalValue != null){
						for (int i = 0; i < 4; i ++){
							if (evalValue.charAt(i) == '1'){
								initialValues[i_state]
							}
						}
					}
					// The line below is an example of issue #156
					// If intitialValues.length is 1 and Integer.parseInt(curr.getIntentionID()) is 3, this raises an error
					////initialValues[Integer.parseInt(curr.getIntentionID())][0] = getEvaluationArray(evalValue);
				}
				modelSpec.setInitialValues(initialValues);
				if (DEBUG) System.out.println("Handled Previous Result");*/

			} /*else {
				ArrayList<IntentionEvaluation> initUserAssign = analysis.getInitialIntentionEvaluations();
				boolean[][][] initialValues = new boolean[initUserAssign.size()][1][4];
				for (IntentionEvaluation curr: initUserAssign) {

					String evalValue = curr.getEvaluationValue();

					// The line below is an example of issue #156
					// If intitialValues.length is 1 and Integer.parseInt(curr.getIntentionID()) is 3, this raises an error
					initialValues[Integer.parseInt(curr.getIntentionID())][0] = getEvaluationArray(evalValue);
				}
				modelSpec.setInitialValues(initialValues);
				if (DEBUG) System.out.println("Handled Previous Result");
			}*/
			
			else {
				// deal with no previous analysis but initial states
				System.out.println("no previous analysis result");
				ArrayList<IntentionEvaluation> initUserAssign = analysis.getInitialIntentionEvaluations();
				boolean[][][] initialValues = new boolean[frontendModel.getIntentions().size()][1][4];
				if (!(initUserAssign == null) && !(initUserAssign.size() == 0)){
					for (IntentionEvaluation curr: initUserAssign){
						String evalValue = curr.getEvaluationValue();
						System.out.println("element: " +  curr.getIntentionID() + " status: " + curr.getEvaluationValue());
						for (int i = 0; i < 4; i ++){
							if (evalValue.charAt(i) == '1'){
								initialValues[Integer.parseInt(curr.getIntentionID())][0][i] = true;
							} else {
								initialValues[Integer.parseInt(curr.getIntentionID())][0][i] = false;
							}
						}
					}
					modelSpec.setInitialValues(initialValues);
					// initial states need initial time points -> 0|0   getInitialValueTimePoints()
					int[] initialValueTimePointsArray = new int[1];
					initialValueTimePointsArray[0] = 0;
					System.out.println("setting initial time point 0");
					modelSpec.setInitialValueTimePoints(initialValueTimePointsArray);
				}
				
				
				
			}
			


			//Getting Actors
			if (!frontendModel.getActors().isEmpty()) {
				modelSpec.setNumActors(frontendModel.getActors().size());

				for(InputActor dataActor: frontendModel.getActors()){
					modelSpec.getActors().add(new Actor(dataActor.getNodeId(), dataActor.getNodeName(), dataActor.getNodeType()));
				}
			}
			if (DEBUG) System.out.println("Read Actors");

			//Getting intentional elements
			if(!frontendModel.getIntentions().isEmpty()){
				modelSpec.setNumIntentions(frontendModel.getIntentions().size());
				for (InputIntention intention : frontendModel.getIntentions()) {
					Actor nodeActor = null;
					if (!intention.getNodeActorID().equals("-")) {
						for(Actor actor : modelSpec.getActors()){
							if(intention.getNodeActorID().equals(actor.getId())){
								nodeActor = actor;
								break;
							}
						}
					}

					IntentionalElement element = new IntentionalElement(intention.getNodeID(), intention.getNodeName(), nodeActor, intention.getNodeType());

					// Now that the IntentionElement has been created. assign a dynamic to it
					EvolvingFunction dynamic = intention.getDynamicFunction();
					String dynamicType = dynamic.getStringDynVis();

					element.setDynamicType(IntentionalElementDynamicType.getByCode(dynamicType));

					if (dynamicType.equals("UD")) {
						element.setUserDefinedDynamicType(intention);
					} else {

						boolean[] dynamicFuncMarkedVal;

						String evalValue = dynamic.getMarkedValue();
						dynamicFuncMarkedVal = getEvaluationArray(evalValue);
						element.setDynamicFunctionMarkedValue(dynamicFuncMarkedVal);
					}

					modelSpec.getIntElements().add(element);
				}
			}
			if (DEBUG) System.out.println("Read Elements");

			//Getting links
			if(!frontendModel.getLinks().isEmpty()) {
				ArrayList<InputLink> allInputLinks = (ArrayList<InputLink>) frontendModel.getLinks();

				ArrayList<InputLink> allDecompositionLinks = new ArrayList<InputLink>();    // Temporary Place Holder to Collect Decomposition Links.
				List<NotBothLink> notBothLink = new ArrayList<NotBothLink>();
				List<Contribution> contribution = new ArrayList<Contribution>();
				List<EvolvingContribution> evolvingContribution = new ArrayList<EvolvingContribution>();

				for (ListIterator<InputLink> lk = allInputLinks.listIterator(); lk.hasNext(); ) {
					InputLink link = lk.next();
					String linkType = link.getLinkType();
					String linkSrcID = link.getLinkSrcID();
					String linkDestID = link.getLinkDestID();
					String postType = link.getPostType();
					int absTime = link.getAbsoluteValue();
					IntentionalElement intentElementSrc = getIntentionalElementById(linkSrcID, modelSpec.getIntElements());
					IntentionalElement intentElementDest = getIntentionalElementById(linkDestID, modelSpec.getIntElements());
					if (postType == null) {
						// Not Evolving Link
						switch (linkType) {
							case "NBT":
								notBothLink.add(new NotBothLink(intentElementSrc, intentElementDest, false));
								break;
							case "NBD":
								notBothLink.add(new NotBothLink(intentElementSrc, intentElementDest, true));
								break;
							case "++":  case "+":  case "-":  case "--":
							case "++S": case "+S": case "-S": case "--S":
							case "++D": case "+D": case "-D": case "--D":
								contribution.add(new Contribution(intentElementSrc, intentElementDest, ContributionType.getByCode(linkType)));
								break;
							case "AND":
							case "OR":
								allDecompositionLinks.add(link);
								break;
							default:
								throw new IllegalArgumentException("(Simple) Invalid relationship type: " + linkType);
						}
					} else {
						// Evolving Link
						switch (linkType) {
							case "++":  case "+":  case "-":  case "--":
							case "++S": case "+S": case "-S": case "--S":
							case "++D": case "+D": case "-D": case "--D":
								switch (postType) {
									case "NO":
										evolvingContribution.add(new EvolvingContribution(intentElementSrc, intentElementDest, ContributionType.getByCode(linkType), null, absTime));
										break;
									case "++":  case "+":  case "-":  case "--":
									case "++S": case "+S": case "-S": case "--S":
									case "++D": case "+D": case "-D": case "--D":
										evolvingContribution.add(new EvolvingContribution(intentElementSrc, intentElementDest, ContributionType.getByCode(linkType), ContributionType.getByCode(postType), absTime));
										break;
									default:
										throw new IllegalArgumentException("Invalid relationship type (type 1): " + linkType);
								}
								break;
							case "AND":
							case "OR":
								allDecompositionLinks.add(link);
								break;
							case "NO":
								switch (postType) {
									case "++":  case "+":  case "-":  case "--":
									case "++S": case "+S": case "-S": case "--S":
									case "++D": case "+D": case "-D": case "--D":
										evolvingContribution.add(new EvolvingContribution(intentElementSrc, intentElementDest, null, ContributionType.getByCode(postType), absTime));
										break;
									case "AND":
									case "OR":
										allDecompositionLinks.add(link);
										break;
									default:
										throw new IllegalArgumentException("Invalid relationship type (type 2): " + linkType);
								}
								break;
							default:
								throw new IllegalArgumentException("Invalid relationship type (type 3): " + linkType);
						}
					}
				}

				modelSpec.setContribution(contribution);
				modelSpec.setNotBothLink(notBothLink);
				modelSpec.setEvolvingContribution(evolvingContribution);

				// Converting Decomposition Links into singular decomposition links.
				List<Decomposition> decomposition = new ArrayList<Decomposition>();
				List<EvolvingDecomposition> evolvingDecomposition = new ArrayList<EvolvingDecomposition>();

				while (allDecompositionLinks.size() > 0) {
					String destID = allDecompositionLinks.get(0).getLinkDestID();
					int absTime = allDecompositionLinks.get(0).getAbsoluteValue();
					IntentionalElement intentElementDest = getIntentionalElementById(destID, modelSpec.getIntElements());
					ArrayList<InputLink> curDestLinks = new ArrayList<InputLink>();
					boolean evolve = false;
					boolean andLink = false;
					boolean orLink = false;
					boolean andPost = false;
					boolean orPost = false;
					for (InputLink inputLink : allDecompositionLinks) {
						if (destID.equals(inputLink.getLinkDestID())) {
							curDestLinks.add(inputLink);
							if (inputLink.getPostType() != null) {
								evolve = true;
								if (inputLink.getPostType().equals("AND"))
									andPost = true;
								if (inputLink.getPostType().equals("OR"))
									orPost = true;

							}
							if (inputLink.getLinkType().equals("AND"))
								andLink = true;
							if (inputLink.getLinkType().equals("OR"))
								orLink = true;
						}
					}
					if (andLink && orLink)
						throw new IllegalArgumentException("Invalid decomposition relationship type.");

					LinkableElement[] linkElementsSrc = new LinkableElement[curDestLinks.size()];
					for (int i = 0; i < curDestLinks.size(); i++) {
						InputLink link = curDestLinks.get(i);
						linkElementsSrc[i] = getIntentionalElementById(link.getLinkSrcID(), modelSpec.getIntElements());
					}

					if (!evolve) {
						DecompositionType dType = null;
						if (andLink)
							dType = DecompositionType.AND;
						if (orLink)
							dType = DecompositionType.OR;
						decomposition.add(new Decomposition(linkElementsSrc, intentElementDest, dType));
					} else {
						if (andPost && orPost)
							throw new IllegalArgumentException("Invalid evolving decomposition relationship type.");

						DecompositionType pre = null;
						DecompositionType post = null;
						if (andLink)
							pre = DecompositionType.AND;
						if (orLink)
							pre = DecompositionType.OR;
						if (andPost)
							post = DecompositionType.AND;
						if (orPost)
							post = DecompositionType.OR;
						evolvingDecomposition.add(new EvolvingDecomposition(linkElementsSrc, intentElementDest, pre, post, absTime));
						for (InputLink iLink : curDestLinks) {
							if (pre != null && !iLink.getLinkType().equals(pre.getCode()))
								throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
							if (pre == null && !iLink.getLinkType().equals("NO"))
								throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
							if (iLink.getPostType() == null)
								throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
							if (post != null && !iLink.getPostType().equals(post.getCode()))
								throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
							if (post == null && !iLink.getPostType().equals("NO"))
								throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
						}

					}
					for (InputLink inputLink : curDestLinks) {
						allDecompositionLinks.remove(inputLink);
					}

				}
				modelSpec.setDecomposition(decomposition);
				modelSpec.setEvolvingDecomposition(evolvingDecomposition);
			}
			if (DEBUG) System.out.println("Read Links");

			//Getting constraints
			if(!frontendModel.getConstraints().isEmpty()){
				for(InputConstraint dataConstraint : frontendModel.getConstraints()){
					String constraintType = dataConstraint.getConstraintType();
					String constraintSrcID = dataConstraint.getConstraintSrcID();
					String constraintSrcEB = dataConstraint.getConstraintSrcEB();
					if (constraintType.equals("A")){
						int absoluteValue = dataConstraint.getAbsoluteValue();
						IntentionalElement src = null;
						for(IntentionalElement tmp : modelSpec.getIntElements()){
							if(constraintSrcID.equals(tmp.getId()))
								src = tmp;
						}
						if (absoluteValue >= 0) {
							modelSpec.getConstraintsBetweenEpochs().add(new EpochConstraint(src, constraintSrcEB, absoluteValue));
						}
					}else{
						String constraintDestID = dataConstraint.getConstraintDestID();
						String constraintDestEB = dataConstraint.getConstraintDestEB();
						IntentionalElement src = null;
						IntentionalElement dest = null;
						for(IntentionalElement tmp : modelSpec.getIntElements()){
							if(constraintSrcID.equals(tmp.getId()))
								src = tmp;
							if(constraintDestID.equals(tmp.getId()))
								dest = tmp;
						}
						modelSpec.getConstraintsBetweenEpochs().add(new EpochConstraint(constraintType, src, dest, constraintSrcEB, constraintDestEB));
					}
				}
			}
			if (DEBUG) System.out.println("Read Constraints");


			// Getting user evaluations a.k.a. non initial user assignments
			ArrayList<IntentionEvaluation> nonInitialEvals = analysis.getNonInitialIntentionEvaluations();
			if (!nonInitialEvals.isEmpty()) {
				for (IntentionEvaluation curr: nonInitialEvals) {
					String intentionID = curr.getIntentionID();
					int absTime = Integer.parseInt(curr.getAbsTime());
					String evalValue = curr.getEvaluationValue();

					IntentionalElement src = null;
					for(IntentionalElement tmp : modelSpec.getIntElements()){
						if(intentionID.equals(tmp.getId()))
							src = tmp;
					}

					boolean[] values = getEvaluationArray(evalValue);

					modelSpec.getUserEvaluations().add(new UserEvaluation(src, absTime, values));
				}

			}
			if (DEBUG) System.out.println("Read User Evaluations");

		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		}

		return modelSpec;

	}

	/**
	 * Returns the evaluation array which is an array of length 4 which represents
	 * the evalValue
	 * @param evalValue
	 * evalValue of interest
	 * @return
	 * returns the evaluation array
	 */
	public static boolean[] getEvaluationArray(String evalValue) {
		// This function was created as a temporary fix to issue #155
		// The evalValue variable is an evaluation label for an intention.
		// If the evaluation label is not a 4 digit binary string, for now, this will be
		// considered to be equivalent to the evaluation label: "0000".
		// ie, evaluation array will be an array of length 4, containing all false values.

		if (evalValue.matches("[01]+") && evalValue.length() == 4) {
			boolean[] res = new boolean[4];
			for (int i = 0; i < 4; i++) {
				res[i] = (evalValue.charAt(i) == '1');
			}
			return res;
		} else {
			return new boolean[] {false, false, false, false};
		}

	}

	/**
	 * Return the first IntentionalElement by its ID
	 * @param elementId
	 * The id of the required element
	 * @param list
	 * The model specification containing a list of all intentional elements
	 * @return
	 * returns the intentional element if exist or null
	 */
	private static IntentionalElement getIntentionalElementById(String elementId, List<IntentionalElement> list) {
		for(IntentionalElement iElement : list){
			if(iElement.getId().equals(elementId))
				return iElement;
		}
		return null;
	}
}
