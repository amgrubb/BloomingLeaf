package simulation;

import java.util.ArrayList;
import java.util.List;

// import com.google.gson.Gson;

import gson_classes.*;
import merge.VisualInfo;

/**
 * This class is responsible to get the front-end model and convert into the back-end model filling the necessary attributes.
 *
 */
public class BIModelSpecBuilder {
    
    /** Read the elements that were passed as analysis request.
     * @param modelSpec - the spec to be generated
     * 	Note: this function depends on modelSpec.getNumIntentions() being set prior to being called.
     * @param aRequest - the request passed from the front end
     */
    protected static void readAnalysisParameters(ModelSpec modelSpec, IAnalysisRequest aRequest,
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
				modelSpec.setNumRelativeTimePoints(Integer.parseInt(aRequest.getNumRelTime()));
			} 
			if (Main.DEBUG) System.out.println("Read Simple Analysis Parameters");
			modelSpec.setPrevResult(aRequest.getPreviousAnalysis());
			if (Main.DEBUG) System.out.println("Read Previous Results");

    	} catch (Exception e) {
    		throw new RuntimeException(e.getMessage());
    	}      	
    }
    
    
    /** Assigned the high-level items for the model.
     * @param modelSpec
     * @param frontendModel
     * Note: Model constraints are assigned after intentions are established.
     */
    protected static void readOverallGraphParameters(ModelSpec modelSpec, IGraph frontendModel) {
    	try {	
			//Max Absolute Time
			if(frontendModel.getMaxAbsTime() != null){
				modelSpec.setMaxTime(frontendModel.getMaxAbsTime());
			}

			if(frontendModel.getAbsTimePtsArr() != null)
				modelSpec.setAbsoluteTimePoints(frontendModel.getAbsTimePtsArr());
			else
				modelSpec.setAbsoluteTimePoints(new int[0]);
			if (Main.DEBUG) System.out.println("Read MaxTime & Absolute TPs");
    		
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
			
			// Gson gson = new Gson();
			// System.out.println("icell version:");
			// System.out.println(gson.toJson(inObject));
			
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
			// analysisRequest may be null
			IAnalysisRequest analysisRequest = inObject.getAnalysisRequest();
			if (analysisRequest != null) {
				readAnalysisParameters(modelSpec, analysisRequest,
						intentions.size()); 
			}
			readOverallGraphParameters(modelSpec, frontendModel);	
			
			// **** ACTORS **** - Getting Actor Data
			if (!actors.isEmpty()) {
				int actorID = 0;
				for(ICell dataActor: actors){
					String backID = "A" + String.format("%03d", actorID);
					actorID ++;
					Actor newActor = new Actor(backID,	dataActor.getActor().getActorName(), 
							dataActor.getActor().getType(),	dataActor.getEmbeds(), dataActor.getId());
					if (dataActor.isVisual()) { // actor contains visual information
						VisualInfo visual = new VisualInfo(dataActor.getSize(), dataActor.getPosition());
						newActor.setVisualInfo(visual);
					}
					modelSpec.getActors().add(newActor);
				}
			}
			if (Main.DEBUG) System.out.println("Read Actors");
			
			
			// **** INTENTIONS **** - Getting intentional elements
			if(!intentions.isEmpty()){			
				for (ICell dataIntention : intentions){
					Intention newInt = Intention.createIntention(dataIntention, modelSpec);
					if (dataIntention.isVisual()) { // intention contains visual information
						VisualInfo visual = new VisualInfo(dataIntention.getSize(), dataIntention.getPosition());
						newInt.setVisualInfo(visual);
					}
					modelSpec.getIntentions().add(newInt); 
				}
			}
			if (Main.DEBUG) System.out.println("Read Elements");
			
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
					Intention intentElementSrc = modelSpec.getIntentionByUniqueID(linkSrcID);
					Intention intentElementDest = modelSpec.getIntentionByUniqueID(linkDestID);
					
					
					if (linkType.equals("NBT"))
						notBothLink.add(new NotBothLink(intentElementSrc, intentElementDest, false, 
								link.getLink().getAbsTime(), link.getId()));
					else if (linkType.equals("NBD"))	
						notBothLink.add(new NotBothLink(intentElementSrc, intentElementDest, true, 
								link.getLink().getAbsTime(), link.getId()));
					// else if linkType is-a 
					else {
						ContributionLink tempCont = ContributionLink.createConstributionLink(intentElementSrc, 
								intentElementDest, link.getLink(), link.getId());
						if (tempCont != null)
							contributionLinks.add(tempCont);
						else
							allDecompositionLinks.add(link);
					}
				}
				modelSpec.setNotBothLink(notBothLink);
				modelSpec.setContributionLinks(contributionLinks); 
				modelSpec.setDecompositionLinks(DecompositionLink.createDecompositionLinks(allDecompositionLinks, 
						modelSpec));
			}

			// After all intentions, relationship, and function have been establish, then apply constraints.
			if (frontendModel.getConstraints() != null)
				modelSpec.applyConstraints(frontendModel.getConstraints());
			if (Main.DEBUG) System.out.println("Added model constraints.");

			if (Main.DEBUG) System.out.println("Returning Model Spec!!!!");
			return modelSpec;

		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		}
	}
}
