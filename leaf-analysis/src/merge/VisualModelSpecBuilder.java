package merge;

import java.util.ArrayList;
import java.util.List;
import gson_classes.*;
import simulation.*;


/**
 * This class is responsible to get the front-end model and convert into the back-end model filling the necessary attributes.
*
*/
public class VisualModelSpecBuilder extends BIModelSpecBuilder{
	public static ModelSpec buildVisualModelSpec(IMain inObject) {
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
			
			// **** ACTORS **** - Getting Actor Data
			if (!actors.isEmpty()) {
				int actorID = 0;
				for(ICell dataActor: actors){
					String backID = "A" + String.format("%03d", actorID);
					actorID ++;
					// changes here
					Actor newActor = new Actor(backID,	dataActor.getActor().getActorName(), 
							dataActor.getActor().getType(),	dataActor.getId());
					if (dataActor.isVisual()) {
						VisualInfo visual = new VisualInfo(dataActor.getWidth(), dataActor.getHeight(),
														   dataActor.getX(), dataActor.getY());
						newActor.setVisualInfo(visual);
					}
					modelSpec.getActors().add(newActor);
					// changes end here
				}
			}
			if (Main.DEBUG) System.out.println("Read Actors");
			
			
			// **** INTENTIONS **** - Getting intentional elements
			if(!intentions.isEmpty()){			
				for (ICell dataIntention : intentions){
					Intention newInt = Intention.createIntention(dataIntention, modelSpec);
					// changes here
					if (dataIntention.isVisual()) {
						VisualInfo visual = new VisualInfo(dataIntention.getWidth(), dataIntention.getHeight(),
														   dataIntention.getX(), dataIntention.getY());
						newInt.setVisualInfo(visual);
					}
					// changes end here
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
