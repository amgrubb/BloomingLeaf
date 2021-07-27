package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import gson_classes.*;

/**
 * This class is responsible to get the frontend model and convert into the backend model filling the necessary attributes.
 *
 */
public class BIModelSpecBuilder {
    private final static boolean DEBUG = true;	
   
    
    /** Read the elements that were passed as analysis request.
     * @param modelSpec - the spec to be generated
     * 	Note: this function depends on modelSpec.getNumIntentions() being set prior to being called.
     * @param aRequest - the request passed from the front end
     */
    private static void readAnalysisParameters(ModelSpec modelSpec, IAnalysisRequest aRequest) {
    	try {
			// Type of analysis
			modelSpec.setAnalysisType(aRequest.getAction());	
			if (DEBUG) System.out.println("Read Type of Analysis");

			// Conflict level
			if (aRequest.getConflictLevel() != null) {
				modelSpec.setConflictAvoidLevel(aRequest.getConflictLevel().charAt(0));
			}
			if (DEBUG) System.out.println("Read Conflict Level");

			//Number of Relative time
			if(aRequest.getNumRelTime() != null){
				modelSpec.setRelativeTimePoints(Integer.parseInt(aRequest.getNumRelTime()));
			}
			if (DEBUG) System.out.println("Read Relative Time");   		

			IPreviousAnalysis prevResult = aRequest.getPreviousAnalysis();
			if(prevResult != null) {
				// Get the list of assigned Time Points
				modelSpec.setInitialAssignedEpochs(prevResult.getInitialAssignedEpochs());
				
				// Create the list of assigned values. Size is currentState + 1 (to include zero).
				modelSpec.setInitialValueTimePoints(prevResult.getSelectedTimePointPath());
				
				// Assign the previous values as initial values.
				modelSpec.setInitialValuesMap(prevResult.getSelectedPreviousValues());
				if (DEBUG) System.out.println("Handled Previous Result into Hash Map");
				
				
				//TODO: This code should be removed once a mapping between intentions and timepoints is created.
				boolean[][][] initialValues = new boolean[modelSpec.getNumIntentions()][prevResult.getSelectedTimePoint()+1][4];
				HashMap<String, boolean[][]> temp = prevResult.getSelectedPreviousValues(); //TODO REMOVE
				int k = 0;
				for (boolean[][] tempVals : temp.values()) {
					for (int j = 0; j < tempVals.length; j++){
						for (int i = 0; i < 4; i ++){
							initialValues[k][j][i] = tempVals[j][i];
						}
					}
					k++;
				}
				modelSpec.setInitialValues(initialValues);	
				if (DEBUG) System.out.println("TEMP: Handled (Next State) Previous Result into Array");
				
			} else {
				//TODO: Update with appropriate initial values.
				boolean[][][] initialValues = new boolean[modelSpec.getNumIntentions()][1][4];
				for (int j = 0; j < modelSpec.getNumIntentions(); j++){
					for (int i = 0; i < 4; i ++){
						initialValues[j][0][i] = false;
					}
				}
				modelSpec.setInitialValues(initialValues);	
				
				// initial states need initial time points -> 0|0   getInitialValueTimePoints()
				int[] initialValueTimePointsArray = new int[1];
				initialValueTimePointsArray[0] = 0;
				modelSpec.setInitialValueTimePoints(initialValueTimePointsArray);
				if (DEBUG) System.out.println("TEMP: Handled (Single Path) Previous Result into Array");
				
			}			
    	} catch (Exception e) {
    		throw new RuntimeException(e.getMessage());
    	}      	
    }
    
    
    /** Assigned the high-level items for the model.
     * @param modelSpec
     * @param frontendModel
     * Note: Model constraints are assigned after intentions are established.
     */
    private static void readOverallGraphParameters(ModelSpec modelSpec, IGraph frontendModel) {
    	try {	
			//Max Absolute Time
			if(frontendModel.getMaxAbsTime() != null){
				modelSpec.setMaxTime(Integer.parseInt(frontendModel.getMaxAbsTime()));
			}
			if (DEBUG) System.out.println("Read Max Absolute Time");

			if(frontendModel.getAbsTimePtsArr() != null)
				modelSpec.setAbsoluteTimePoints(frontendModel.getAbsTimePtsArr());
			else
				modelSpec.setAbsoluteTimePoints(null);
			if (DEBUG) System.out.println("Read Absolute Time Points");
    		
    	} catch (Exception e) {
    		throw new RuntimeException(e.getMessage());
    	}  
    	
    	
    }    
	
    
	/** Main function that generates the model spec.
	 * @param inObject
	 * @return A complete model of type ModelSpec
	 */
	public static ModelSpec buildModelSpec(IMain inObject){
		try {
			// Back-end Model
			ModelSpec modelSpec = new ModelSpec();	
			
			IGraph frontendModel = inObject.getGraph();
			
			// Collection of Cells
			List<ICell> allCells = frontendModel.getCells();
			
			// Divide cells into actors, intentions, and links.
			List<ICell> actors = new ArrayList<ICell>();
			List<ICell> intentions = new ArrayList<ICell>();
			List<ICell> links = new ArrayList<ICell>();
			if (!allCells.isEmpty()) {
				for(ICell cell: allCells){
					if (cell.getType().equals("basic.Actor") && cell.getActor() != null) 
						actors.add(cell);
					else if (cell.getIntention() != null && (cell.getType().equals("basic.Task") ||
							cell.getType().equals("basic.Goal") || cell.getType().equals("basic.Softgoal") ||
							cell.getType().equals("basic.Resource")))
						intentions.add(cell);
					else if (cell.getLink() != null && 
							((cell.getType().equals("element")) ||(cell.getType().equals("basic.CellLink"))))
						links.add(cell);
					else
						throw new IllegalArgumentException("Cell with unknown type: " + cell.getType());	
				}
			}
			
			if(!intentions.isEmpty())
				modelSpec.setNumIntentions(intentions.size());
			
			// Read the parameters associated with the model.
			readAnalysisParameters(modelSpec, inObject.getAnalysisRequest()); 
			readOverallGraphParameters(modelSpec, frontendModel);	
			
			
			// **** ACTORS **** 
			// Getting Actor Data
			if (!actors.isEmpty()) {
				modelSpec.setNumActors(actors.size());
				int actorID = 0;
				for(ICell dataActor: actors){
					String backID = "A" + String.format("%03d", actorID);
					actorID ++;
					modelSpec.getActors().add(new Actor(backID, 
							dataActor.getActor().getActorName(), 
							dataActor.getActor().getType(),
							dataActor.getId()));
				}
			}
			if (DEBUG) System.out.println("Read Actors");
			
			
			// **** INTENTIONS **** 
			// Getting intentional elements
			if(!intentions.isEmpty()){
				//modelSpec.setNumIntentions(intentions.size());
				int intentionID = 0;
				for (ICell dataIntention : intentions){
					// Get Data for one Intention
					Actor nodeActor = null;
					if (dataIntention.getParent() != null) {
						for(Actor actor : modelSpec.getActors()){
							if(dataIntention.getParent().equals(actor.getUniqueID())){
								nodeActor = actor;
								break;
							}
						}
					}

					String backID = String.format("%04d", intentionID);
					intentionID++;

					IntentionalElement element = new IntentionalElement(backID, 
							dataIntention.getIntention().getNodeName(), nodeActor, 
							dataIntention.getType(), dataIntention.getId());

					// Now that the IntentionElement has been created. assign a dynamic to it
					//TODO Add evolving functions.
//					EvolvingFunction dynamic = dataIntention.getDynamicFunction();
//					String dynamicType = dynamic.getStringDynVis();
//
//					element.setDynamicType(IntentionalElementDynamicType.getByCode(dynamicType));
//
//					if (dynamicType.equals("UD")) {
//						element.setUserDefinedDynamicType(dataIntention);
//					} else {
//
//						boolean[] dynamicFuncMarkedVal;
//
//						String evalValue = dynamic.getMarkedValue();
//						dynamicFuncMarkedVal = getEvaluationArray(evalValue);
//						element.setDynamicFunctionMarkedValue(dynamicFuncMarkedVal);
//					}

					modelSpec.getIntElements().add(element);
				}
			}
			if (DEBUG) System.out.println("Read Elements");
			
			if (DEBUG) System.out.println("TODO: Handle userAssignmentList");
			if (DEBUG) System.out.println("TODO: handle constraints");
			// TODO List<BIConstraint> getConstraints() 
			

			//Getting links
			if(!links.isEmpty()) {
				// Temporary Place Holder to Collect Decomposition Links.
				ArrayList<ICell> allDecompositionLinks = new ArrayList<ICell>();
				
				// List to hold newly created links.
				List<NotBothLink> notBothLink = new ArrayList<NotBothLink>();
				List<Contribution> contribution = new ArrayList<Contribution>();
				List<EvolvingContribution> evolvingContribution = new ArrayList<EvolvingContribution>();

//START HERE - Convert to one class and move syntax checking to constructor.				
				//for (ListIterator<InputLink> lk = links.listIterator(); lk.hasNext(); ) {
				for (ICell link : links){
					String linkType = link.getLink().getLinkType();
					String linkSrcID = link.getSourceID();
					String linkDestID = link.getTargetID();
					IntentionalElement intentElementSrc = getIntentionalElementByUniqueID(linkSrcID, modelSpec.getIntElements());
					IntentionalElement intentElementDest = getIntentionalElementByUniqueID(linkDestID, modelSpec.getIntElements());
					if (link.getLink().getPostType() == null) {
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
							case "and":
							case "or":
								allDecompositionLinks.add(link);
								break;
							default:
								throw new IllegalArgumentException("(Simple) Invalid relationship type: " + linkType);
						}
					} else {
						// Evolving Link
						String postType = link.getLink().getPostType();
						int absTime;
						if (link.getLink().getAbsTime() == null)
							absTime = -1;
						else
							absTime = link.getLink().getAbsTime();
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
							case "and":
							case "or":
								allDecompositionLinks.add(link);
								break;
							case "NO":
								switch (postType) {
									case "++":  case "+":  case "-":  case "--":
									case "++S": case "+S": case "-S": case "--S":
									case "++D": case "+D": case "-D": case "--D":
										evolvingContribution.add(new EvolvingContribution(intentElementSrc, intentElementDest, null, ContributionType.getByCode(postType), absTime));
										break;
									case "and":
									case "or":
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

				// Add all links, except decomposition links to the model.
				modelSpec.setContribution(contribution);
				modelSpec.setNotBothLink(notBothLink);
				modelSpec.setEvolvingContribution(evolvingContribution);
				
				if (DEBUG) System.out.println("Read (Contribution) Links");
				
				// Converting Decomposition Links into singular decomposition links.
				List<Decomposition> decomposition = new ArrayList<Decomposition>();
				List<EvolvingDecomposition> evolvingDecomposition = new ArrayList<EvolvingDecomposition>();

				while (allDecompositionLinks.size() > 0) {				
					
					String destID = allDecompositionLinks.get(0).getTargetID();
					//String postType = link.getLink().getPostType();
					int absTime;
					if (allDecompositionLinks.get(0).getLink().getAbsTime() == null)
						absTime = -1;
					else
						absTime = allDecompositionLinks.get(0).getLink().getAbsTime();
					IntentionalElement intentElementDest = getIntentionalElementByUniqueID(destID, modelSpec.getIntElements());
					ArrayList<ICell> curDestLinks = new ArrayList<ICell>();
					boolean evolve = false;
					boolean andLink = false;
					boolean orLink = false;
					boolean andPost = false;
					boolean orPost = false;
					for (ICell inputLink : allDecompositionLinks) {
						if (destID.equals(inputLink.getTargetID())) {
							curDestLinks.add(inputLink);
							if (inputLink.getLink().getPostType() != null) {
								evolve = true;
								if (inputLink.getLink().getPostType().equals("and"))
									andPost = true;
								if (inputLink.getLink().getPostType().equals("or"))
									orPost = true;

							}
							if (inputLink.getLink().getLinkType().equals("and"))
								andLink = true;
							if (inputLink.getLink().getLinkType().equals("or"))
								orLink = true;
						}
					}
					if (andLink && orLink)
						throw new IllegalArgumentException("Invalid decomposition relationship type.");

					LinkableElement[] linkElementsSrc = new LinkableElement[curDestLinks.size()];
					for (int i = 0; i < curDestLinks.size(); i++) {
						ICell link = curDestLinks.get(i);
						linkElementsSrc[i] = getIntentionalElementByUniqueID(link.getSourceID(), modelSpec.getIntElements());
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
						for (ICell iLink : curDestLinks) {
							if (pre != null && !iLink.getLink().getLinkType().equals(pre.getCode()))
								throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
							if (pre == null && !iLink.getLink().getLinkType().equals("NO"))
								throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
							if (iLink.getLink().getPostType() == null)
								throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
							if (post != null && !iLink.getLink().getPostType().equals(post.getCode()))
								throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
							if (post == null && !iLink.getLink().getPostType().equals("NO"))
								throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
						}

					}
					for (ICell inputLink : curDestLinks) {
						allDecompositionLinks.remove(inputLink);
					}

				}
				modelSpec.setDecomposition(decomposition);
				modelSpec.setEvolvingDecomposition(evolvingDecomposition);
			}
			if (DEBUG) System.out.println("Read Links");

			BIConstraint[] newConstraints = frontendModel.getConstraints();
			/* 
			 * TODO: Readd Constraints and user evaluations.
			
			
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
			ArrayList<IntentionEvaluation> nonInitialEvals = aRequest.getNonInitialIntentionEvaluations();
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
			*/
			
			
			if (DEBUG) System.out.println("Returning Model Spec!!!!");
			return modelSpec;

		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		}
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
	private static IntentionalElement getIntentionalElementByUniqueID(String elementId, List<IntentionalElement> list) {
		for(IntentionalElement iElement : list){
			if(iElement.getUniqueID().equals(elementId))
				return iElement;
		}
		return null;
	}
}
