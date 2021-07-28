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
    private static void readAnalysisParameters(ModelSpec modelSpec, IAnalysisRequest aRequest,
    		int numIntentions) {
    	try {
			// Type of analysis
			modelSpec.setAnalysisType(aRequest.getAction());	

			// Conflict level
			if (aRequest.getConflictLevel() != null) {
				modelSpec.setConflictAvoidLevel(aRequest.getConflictLevel().charAt(0));
			}

			//Number of Relative time
			if(aRequest.getNumRelTime() != null){
				modelSpec.setRelativeTimePoints(Integer.parseInt(aRequest.getNumRelTime()));
			} 
			if (DEBUG) System.out.println("Read Simple Analysis Parameters");

			IPreviousAnalysis prevResult = aRequest.getPreviousAnalysis();
			if(prevResult != null) {
				// Get the list of assigned Time Points
				modelSpec.setInitialAssignedEpochs(prevResult.getInitialAssignedEpochs());
				
				// Create the list of assigned values. Size is currentState + 1 (to include zero).
				modelSpec.setInitialValueTimePoints(prevResult.getSelectedTimePointPath());
				
				// Assign the previous values as initial values.
				modelSpec.setInitialValuesMap(prevResult.getSelectedPreviousValues());
				if (DEBUG) System.out.println("Handled Previous Result into Hash Map");
				
				
				//TODO: This code should be moved once a mapping between intentions and timepoints is created.
				boolean[][][] initialValues = new boolean[numIntentions][prevResult.getSelectedTimePoint()+1][4];
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
				boolean[][][] initialValues = new boolean[numIntentions][1][4];
				for (int j = 0; j < numIntentions; j++){
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

			if(frontendModel.getAbsTimePtsArr() != null)
				modelSpec.setAbsoluteTimePoints(frontendModel.getAbsTimePtsArr());
			else
				modelSpec.setAbsoluteTimePoints(new int[0]);
			if (DEBUG) System.out.println("Read MaxTime & Absolute TPs");
    		
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
			
			
			// Read the parameters associated with the model.
			readAnalysisParameters(modelSpec, inObject.getAnalysisRequest(),
					intentions.size()); 
			readOverallGraphParameters(modelSpec, frontendModel);	
			if (frontendModel.getConstraints() != null)
				modelSpec.setConstraintsBetweenTPs(frontendModel.getConstraints());

			
			// **** ACTORS **** - Getting Actor Data
			if (!actors.isEmpty()) {
				int actorID = 0;
				for(ICell dataActor: actors){
					String backID = "A" + String.format("%03d", actorID);
					actorID ++;
					modelSpec.getActors().add(new Actor(backID,	dataActor.getActor().getActorName(), 
							dataActor.getActor().getType(),	dataActor.getId()));
				}
			}
			if (DEBUG) System.out.println("Read Actors");
			
			
			// **** INTENTIONS **** - Getting intentional elements
			if(!intentions.isEmpty()){			
				for (ICell dataIntention : intentions){
					Intention newInt = Intention.createIntention(dataIntention, modelSpec);
					System.out.print(newInt.getUniqueID());
					modelSpec.getIntentions().add(newInt); 
				}
			}
			if (DEBUG) System.out.println("Read Elements");
			
			//Getting links
			if(!links.isEmpty()) {
				// Temporary Place Holder to Collect Decomposition Links.
				ArrayList<ICell> allDecompositionLinks = new ArrayList<ICell>();
				
				// List to hold newly created links.
				List<NotBothLink> notBothLink = new ArrayList<NotBothLink>();
				
				/* Start to new contribution code. To replace both contribution and evolving contribution. */
				List<ContributionLink> contributionLinks = new ArrayList<ContributionLink>();

				for (ICell link : links){
					String linkType = link.getLink().getLinkType();
					String linkSrcID = link.getSourceID();
					String linkDestID = link.getTargetID();
					Intention intentElementSrc = getIntentionByUniqueID(linkSrcID, modelSpec.getIntentionList());
					Intention intentElementDest = getIntentionByUniqueID(linkDestID, modelSpec.getIntentionList());
					
					
					if (linkType.equals("NBT"))
						notBothLink.add(new NotBothLink(intentElementSrc, intentElementDest, false, 
								link.getLink().getAbsTime()));
					else if (linkType.equals("NBD"))	
						notBothLink.add(new NotBothLink(intentElementSrc, intentElementDest, true, 
								link.getLink().getAbsTime()));
					else {
						ContributionLink tempCont = ContributionLink.createConstributionLink(intentElementSrc, 
								intentElementDest, link.getLink());
						if (tempCont != null)
							contributionLinks.add(tempCont);
						else
							allDecompositionLinks.add(link);
					}
				}
				modelSpec.setNotBothLink(notBothLink);
				modelSpec.setContributionLinks(contributionLinks); 
				modelSpec.setDecompositionLinks(DecompositionLink.createDecompositionLinks(allDecompositionLinks, 
						modelSpec.getIntentionList()));
			}

			
			if (DEBUG) System.out.println("Returning Model Spec!!!!");
			return modelSpec;

		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		}
	}

//	/**
//	 * Returns the evaluation array which is an array of length 4 which represents
//	 * the evalValue
//	 * @param evalValue
//	 * evalValue of interest
//	 * @return
//	 * returns the evaluation array
//	 */
//	private static boolean[] getEvaluationArray(String evalValue) {
//		// This function was created as a temporary fix to issue #155
//		// The evalValue variable is an evaluation label for an intention.
//		// If the evaluation label is not a 4 digit binary string, for now, this will be
//		// considered to be equivalent to the evaluation label: "0000".
//		// ie, evaluation array will be an array of length 4, containing all false values.
//
//		if (evalValue.matches("[01]+") && evalValue.length() == 4) {
//			boolean[] res = new boolean[4];
//			for (int i = 0; i < 4; i++) {
//				res[i] = (evalValue.charAt(i) == '1');
//			}
//			return res;
//		} else {
//			return new boolean[] {false, false, false, false};
//		}
//
//	}

	/**
	 * Return the first Intention by its ID
	 * @param elementId
	 * The id of the required element
	 * @param list
	 * The model specification containing a list of all intentional elements
	 * @return
	 * returns the intentional element if exist or null
	 */
	private static Intention getIntentionByUniqueID(String elementId, List<Intention> list) {
		for(Intention iElement : list){
			if(iElement.getUniqueID().equals(elementId))
				return iElement;
		}
		return null;
	}
}
