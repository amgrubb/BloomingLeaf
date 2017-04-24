package simulation;

import java.util.ArrayList;
import java.util.HashMap;

import interface_objects.IOIntention;
import interface_objects.IOStateModel;
import interface_objects.InputActor;
import interface_objects.InputAnalysis;
import interface_objects.InputConstraint;
import interface_objects.InputDynamic;
import interface_objects.InputIntention;
import interface_objects.InputLink;
import interface_objects.InputModel;
import interface_objects.InputObject;

/**
 * This class is responsible to get the frontend model and convert into the backend model filling the necessary attributes.
 *
 */
public class ModelSpecBuilder {
	
	
	public static ModelSpec buildModelSpec(InputObject frontendObject){
		
		//Frontend model and analysis information
		InputModel frontendModel = frontendObject.getModel();
		InputAnalysis analysis = frontendObject.getAnalysis();
		
		//Backend Model
		ModelSpec modelSpec = new ModelSpec();

		try{
			//ANALYSIS 			
			//Conflict level
			if(analysis.getConflictLevel()!=null){
				modelSpec.setConflictAvoidLevel(analysis.getConflictLevel().charAt(0));
			}
			
			//Absolute Time points
			if(analysis.getAbsTimePts()!=null){
				if(analysis.getAbsTimePts().length()>0){
					String[] absTimePts = analysis.getAbsTimePts().split(" ");
					int[] absTimePtsInt = new int[absTimePts.length];
					int i = 0;
					
					for(String absTimePt : absTimePts){
						absTimePtsInt[i] = Integer.parseInt(absTimePt);
						i++;
					}
					
					modelSpec.setAbsoluteTimePoints(absTimePtsInt);
				}
			}

			//Max Absolute Time
			if(analysis.getMaxAbsTime()!=null){
				modelSpec.setMaxTime(Integer.parseInt(analysis.getMaxAbsTime()));	
			}
			
			//Number of Relative time
			if(analysis.getNumRelTime()!=null){
				modelSpec.setRelativeTimePoints(Integer.parseInt(analysis.getNumRelTime()));
			}
			
			//Type of analysis - Solve Single Path
			if(analysis.getSolveSinglePath()!=null){
				modelSpec.setSolveSinglePath(Boolean.parseBoolean(analysis.getSolveSinglePath()));
			}
			
			//Type of analysis - all possible next State
			if(analysis.getGetNextState()!=null){
				modelSpec.setSolveNextState(Boolean.parseBoolean(analysis.getGetNextState()));
			}
	
			if(!analysis.getCurrentState().equals("0")){
				String[] absoluteTime = analysis.getCurrentState().split("|");
				int currentState = Integer.parseInt(absoluteTime[0]);
				
				String[] initialAssignedEpoch = analysis.getInitialAssignedEpoch().split(",");
				HashMap<String, Integer> initialAssignedEpochMap = new HashMap<>();
				for(int i = 0; i < initialAssignedEpoch.length; i++){
					String[] assignedEpoch = initialAssignedEpoch[i].split("_");
					String key = assignedEpoch[0].toString();
					Integer value = Integer.parseInt(assignedEpoch[1]);
					initialAssignedEpochMap.put(key, value);
				}
				modelSpec.setInitialAssignedEpochs(initialAssignedEpochMap);
				
				String[] initialValueTimePoints = analysis.getInitialValueTimePoints().split(",");
				int[] initialValueTimePointsArray = new int[currentState+1];
				for(int i = 0; i < currentState+1; i++){
					initialValueTimePointsArray[i] = Integer.parseInt(initialValueTimePoints[i]);
				}
				modelSpec.setInitialValueTimePoints(initialValueTimePointsArray);

			}
			
				
			
			//-----------------------------------------------------------------------------------
			//MODEL
			
			
			//Getting Actors
			if(!frontendModel.getActors().isEmpty()){
				modelSpec.setNumActors(frontendModel.getActors().size());

				for(InputActor dataActor: frontendModel.getActors()){
					modelSpec.getActors().add(new Actor(dataActor.getNodeId(), dataActor.getNodeName(), dataActor.getNodeType()));
				}
			}
			
			//Getting intentional elements
			if(!frontendModel.getIntentions().isEmpty()){
				modelSpec.setNumIntentions(frontendModel.getIntentions().size());
				for (InputIntention dataIntention : frontendModel.getIntentions()) {
					Actor nodeActor = null;
					if(!dataIntention.getNodeActorID().equals("-"))
						for(Actor actor : modelSpec.getActors()){
				        	if(dataIntention.getNodeActorID().equals(actor.getId())){
				        		 nodeActor = actor;
				        		 break;
				        	}	
				        }
					IntentionalElement element = new IntentionalElement(dataIntention.getNodeID(), dataIntention.getNodeName(), nodeActor, dataIntention.getNodeType());
					modelSpec.getIntElements().add(element);
				}
			}
	
			//Adding all dynamics to each intentional elements
			if(!frontendModel.getDynamics().isEmpty()){
				for(InputDynamic dataDynamic : frontendModel.getDynamics()){
					String intentionID = dataDynamic.getIntentionID();
					String dynamicType = dataDynamic.getDynamicType();
//					String markedValue = dataDynamic.getMarkedValue();
					String line = dataDynamic.getLine();
					
					for(IntentionalElement it : modelSpec.getIntElements()){
			        	if(intentionID.equals(it.getId())){
			        		it.setDynamicType(IntentionalElementDynamicType.getByCode(dataDynamic.getDynamicType()));
			        		if (dynamicType.equals("UD"))
			        			it.setUserDefinedDynamicType(line, Integer.parseInt(analysis.getMaxAbsTime()));				        			
//			        		else if (result.length > 3){
//								it.setDynamicFunctionMarkedValue(Integer.parseInt(markedValue));
//							}  
			        	}
			        }				
				}
			}
			
			//Getting links
			if(!frontendModel.getLinks().isEmpty()){
				for(InputLink dataLink : frontendModel.getLinks()){
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
	
			//Getting constraints
			if(!frontendModel.getConstraints().isEmpty()){
				for(InputConstraint dataConstraint : frontendModel.getConstraints()){
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
			
			//Getting initial Values
			ArrayList<IOStateModel> stateModels = (ArrayList<IOStateModel>) frontendModel.getAllStatesModel();
			
			boolean[][][] initialValues = new boolean[stateModels.get(0).getIntentionElements().size()][stateModels.size()][4];
			
			int num_time = -1;
			for(IOStateModel stateModel : stateModels){
				num_time++;
				for(IOIntention intElement : stateModel.getIntentionElements()){
					String[] values = intElement.getStatus();
					if(values[0]!=null){
						for(int i = 0; i < 4; i++){
							if(values[0].charAt(i)=='1'){
								initialValues[Integer.parseInt(intElement.getId())][num_time][i] = true;
							}else{
								initialValues[Integer.parseInt(intElement.getId())][num_time][i] = false;
							}						
						}						
					}else{
						initialValues[Integer.parseInt(intElement.getId())][num_time][0] = false;
						initialValues[Integer.parseInt(intElement.getId())][num_time][1] = false;
						initialValues[Integer.parseInt(intElement.getId())][num_time][2] = false;
						initialValues[Integer.parseInt(intElement.getId())][num_time][3] = false;						
					}

				}
			}
			
			modelSpec.setInitialValues(initialValues);
			
		}catch (Exception e) {
			throw new RuntimeException(e.getMessage()); 
		}
		
		return modelSpec;

	}
}
