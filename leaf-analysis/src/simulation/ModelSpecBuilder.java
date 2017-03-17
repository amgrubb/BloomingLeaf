package simulation;


import interface_object.Analysis;
import interface_object.FrontendObject;
import interface_object.IOActor;
import interface_object.IOConstraint;
import interface_object.IODynamic;
import interface_object.IOHistory;
import interface_object.IOIntention;
import interface_object.IOLink;
import interface_object.Model;

/**ass a
 * This class is responsible to get the frontend model and convert into the backend model filling some necessary attributes.
 * See also ModelSpecPojo class.
 *
 */
public class ModelSpecBuilder {
	public static FrontendModel buildModelSpec(FrontendObject frontendObject){
		
		Model frontendModel = frontendObject.getModel();
		Analysis analysis = frontendObject.getAnalysis();
		FrontendModel modelSpec = new FrontendModel();

		try{
			
		
		if(!frontendModel.getActors().isEmpty()){
			for(IOActor dataActor: frontendModel.getActors()){
				modelSpec.getActors().add(new Actor(dataActor.getNodeId(), dataActor.getNodeName(), dataActor.getNodeType()));
			}
		}
		
	
		if(!frontendModel.getIntentions().isEmpty()){
			for (IOIntention dataIntention : frontendModel.getIntentions()) {
				Actor nodeActor = null;
				if(!dataIntention.getNodeActorID().equals("-"))
					for(Actor tmp : modelSpec.getActors()){
			        	if(dataIntention.getNodeActorID().equals(tmp.getId())){
			        		 nodeActor = tmp;
			        		 break;
			        	}	
			        }
				IntentionalElement element = new IntentionalElement(dataIntention.getNodeID(), dataIntention.getNodeName(), nodeActor, dataIntention.getNodeType());
				modelSpec.getIntElements().add(element);
			}
		}
		
		if(!frontendModel.getLinks().isEmpty()){
			for(IOLink dataLink : frontendModel.getLinks()){
				LinkableElement src = null;
				LinkableElement dest = null;
		        for(IntentionalElement tmp : modelSpec.getIntElements()){
		        	if(dataLink.getLinkSrcID().equals(tmp.getId()))
		        		 src = tmp;
				    if(dataLink.getLinkDestID().equals(tmp.getId()))
				         dest = tmp;				 
		        }
		        
		        if (DecompositionType.getByCode(dataLink.getLinkType()) != null)
		        	modelSpec.getDecomposition().add(new Decomposition(src, dest, DecompositionType.getByCode(dataLink.getLinkType())));
		        else if (ContributionType.getByCode(dataLink.getLinkType()) != null)
		        	modelSpec.getContribution().add(new Contribution(src, dest, ContributionType.getByCode(dataLink.getLinkType())));
		        else if (dataLink.getLinkType().equals("DEP") || dataLink.getLinkType().equalsIgnoreCase("DEPENDS"))
		        	modelSpec.getDependency().add(new Dependency(dest, src));		//TODO: Figure out if these should be flipped.
			}
		}

		if(!frontendModel.getDynamics().isEmpty()){
			for(IODynamic dataDynamic : frontendModel.getDynamics()){
				String intentionID = dataDynamic.getIntentionID();
				String dynamicType = dataDynamic.getDynamicType();
				String markedValue = dataDynamic.getMarkedValue();
				
				for(IntentionalElement it : modelSpec.getIntElements()){
		        	if(intentionID.equals(it.getId())){
		        		it.setDynamicType(IntentionalElementDynamicType.getByCode(dataDynamic.getDynamicType()), Integer.parseInt(analysis.getMaxAbsTime()));
		        		//if (dynamicType.equals("UD"))
		        		//	it.setUserDefinedDynamicType(line, this.maxEpoch);				        			
		        		//else if (result.length > 3){
						//	it.setDynamicFunctionMarkedValue(Integer.parseInt(markedValue));
						//}  
		        	}
		        }				
			}

		}

		if(!frontendModel.getConstraints().isEmpty()){
			for(IOConstraint dataConstraint : frontendModel.getConstraints()){
				String constraintType = dataConstraint.getConstraintType();
				String constraintSrcID = dataConstraint.getConstraintSrcID();
				String constraintSrcEB = dataConstraint.getConstraintSrcEB();
				if (constraintType.equals("A")){
					String absoluteValue = dataConstraint.getAbsoluteValue();
					IntentionalElement src = null;
					for(IntentionalElement tmp : modelSpec.getIntElements()){
						if(constraintSrcID.equals(tmp.getId()))
							src = tmp;
					}
					modelSpec.getConstraintsBetweenEpochs().add(new EpochConstraint(constraintType, src, constraintSrcEB, absoluteValue));
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
		
/*		if(!frontendModel.getHistories().isEmpty()){
			for(IOHistory dataHistory : frontendModel.getHistories()){
				int numHistory = Integer.parseInt(dataHistory.getNumHistory());
				int numIntentions = Integer.parseInt(dataHistory.getNumIntentions());
				int numTimePoints = Integer.parseInt(dataHistory.getNumTimePoints());
				modelSpec.setHistory(new int[numHistory][numIntentions][numTimePoints]);

				for (int i = 0; i < numHistory; i ++)
					for (int j = 0; j < numIntentions; j++){
						for (int k = 0; k < numTimePoints; k++)
							modelSpec.getHistory()[i][j][k] = dataHistory.getHistory_array()[k];
					}
				break;			
	
			}		
		}*/
		
		}catch (Exception e) {
			System.out.println(e.getMessage());
		}
		
		return modelSpec;

	}
}
