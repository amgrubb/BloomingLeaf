package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;

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
				//Send the hole hashmap
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

				//Getting initial Values of all selected states
				List<IOIntention> elementList = analysis.getElementList();
				
				boolean[][][] initialValues = new boolean[elementList.size()][currentState+1][4];
				
				for(int i_state = 0; i_state <= currentState; i_state++){
					for(IOIntention intElement : elementList){
						String[] values = intElement.getStatus();
						if(values[0]!=null){
							for(int i = 0; i < 4; i++){
								if(values[0].charAt(i)=='1'){
									initialValues[Integer.parseInt(intElement.getId())][i_state][i] = true;
								}else{
									initialValues[Integer.parseInt(intElement.getId())][i_state][i] = false;
								}						
							}						
						}else{
							initialValues[Integer.parseInt(intElement.getId())][i_state][0] = false;
							initialValues[Integer.parseInt(intElement.getId())][i_state][1] = false;
							initialValues[Integer.parseInt(intElement.getId())][i_state][2] = false;
							initialValues[Integer.parseInt(intElement.getId())][i_state][3] = false;						
						}
					}
				}

				modelSpec.setInitialValues(initialValues);
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

					boolean[] dynamicFunctionMarkedValue = new boolean[4];
					char[] values = dataDynamic.getMarkedValue().toCharArray();
						for(int i = 0; i < 4; i++){
							if(values[i]=='1'){
								dynamicFunctionMarkedValue[i] = true;
							}else{
								dynamicFunctionMarkedValue[i] = false;
							}						
						}						

					String line = dataDynamic.getLine();
					
					for(IntentionalElement it : modelSpec.getIntElements()){
			        	if(intentionID.equals(it.getId())){
			        		it.setDynamicType(IntentionalElementDynamicType.getByCode(dataDynamic.getDynamicType()));
			        		if (dynamicType.equals("UD"))
			        			it.setUserDefinedDynamicType(line, Integer.parseInt(analysis.getMaxAbsTime()));				        			
			        		else 
								it.setDynamicFunctionMarkedValue(dynamicFunctionMarkedValue);
							
			        	}
			        }				
				}
			}
			
			//Getting links
			if(!frontendModel.getLinks().isEmpty()){
				ArrayList<InputLink> allInputLinks = (ArrayList<InputLink>)frontendModel.getLinks();
				
				ArrayList<InputLink> decompositionLinks = new ArrayList<>();	// Temporary Place Holder to Collect Decomposition Links.
				List<NotBothLink> notBothLink = new ArrayList<NotBothLink>();
				List<Contribution> contribution = new ArrayList<Contribution>();
				List<EvolvingContribution> evolvingContribution = new ArrayList<EvolvingContribution>();				
		    	
				for(ListIterator<InputLink> lk = allInputLinks.listIterator(); lk.hasNext(); ){		
		    		InputLink link = lk.next();
		    		String linkType = link.getLinkType();
		    		String linkSrcID = link.getLinkSrcID();
		    		String linkDestID = link.getLinkDestID();
		    		String postType = link.getPostType();
		    		IntentionalElement intentElementSrc = getIntentionalElementById(linkSrcID, modelSpec.getIntElements());
		    		IntentionalElement intentElementDest = getIntentionalElementById(linkDestID, modelSpec.getIntElements());
		    		if (postType == null){
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
		    			case "AND": case "OR":
		    				decompositionLinks.add(link);
		    				break;
		    			default:
		    				throw new IllegalArgumentException("Invalid relationship type: " + linkType);
		    			}
		    		}else{
		    			// Evolving Link
		    			switch (linkType) {
		    			case "++":  case "+":  case "-":  case "--":
		    			case "++S": case "+S": case "-S": case "--S":
		    			case "++D": case "+D": case "-D": case "--D":
			    			switch (postType) {
			    			case "NO":
			    				evolvingContribution.add(new EvolvingContribution(intentElementSrc, intentElementDest, ContributionType.getByCode(linkType), null));
			    				break;
			    			case "++":  case "+":  case "-":  case "--":
			    			case "++S": case "+S": case "-S": case "--S":
			    			case "++D": case "+D": case "-D": case "--D":
			    				evolvingContribution.add(new EvolvingContribution(intentElementSrc, intentElementDest, ContributionType.getByCode(linkType), ContributionType.getByCode(postType)));
			    				break;
			    			default:
			    				throw new IllegalArgumentException("Invalid relationship type: " + linkType);
			    			}		    				
		    				break;
		    			case "AND": case "OR":
		    				decompositionLinks.add(link);
		    				break;
		    			case "NO":
			    			switch (postType) {
			    			case "++":  case "+":  case "-":  case "--":
			    			case "++S": case "+S": case "-S": case "--S":
			    			case "++D": case "+D": case "-D": case "--D":
			    				evolvingContribution.add(new EvolvingContribution(intentElementSrc, intentElementDest, null, ContributionType.getByCode(postType)));
			    				break;
			    			case "AND": case "OR":
			    				decompositionLinks.add(link);
			    				break;
			    			default:
			    				throw new IllegalArgumentException("Invalid relationship type: " + linkType);
			    			}		    				
		    			default:
		    				throw new IllegalArgumentException("Invalid relationship type: " + linkType);
		    			}
		    		}
				}
				
				modelSpec.setContribution(contribution);
				modelSpec.setNotBothLink(notBothLink);
				modelSpec.setEvolvingContribution(evolvingContribution);
				
				// Converting Decomposition Links into singular decomposition links.
				//List<Decomposition> decomposition = new ArrayList<Decomposition>();
				//List<EvolvingDecomposition> evolvingDecomposition = new ArrayList<EvolvingDecomposition>();

		
				
				List<Decomposition> allDecomposition = new ArrayList<>();
				while(allInputLinks.size()>0){
					String linkDestId = allInputLinks.get(0).getLinkDestID();
					ArrayList<InputLink> elementsToBeRemoved = new ArrayList<>();
					ArrayList<IntentionalElement> intentElementSrc = new ArrayList<>();
					IntentionalElement intentElementDest = getIntentionalElementById(linkDestId, modelSpec.getIntElements());
					
					//TODO: Fix evolving links.
					//{"linkType":"AND","linkSrcID":"0000","linkDestID":"0002","postType":null},{"linkType":"NO","linkSrcID":"0001","linkDestID":"0002","postType":"AND"}
					
					DecompositionType decompType = DecompositionType.AND;
					if(allInputLinks.get(0).getLinkType().equals(DecompositionType.AND)){
						decompType = DecompositionType.AND;
					}else if(allInputLinks.get(0).getLinkType().equals(DecompositionType.OR)){
						decompType = DecompositionType.OR;
					}else
						System.err.println("Other Link Type found.");
					

					for(InputLink inputLink : allInputLinks){
						if(linkDestId.equals(inputLink.getLinkDestID())){
							intentElementSrc.add(getIntentionalElementById(inputLink.getLinkSrcID(), modelSpec.getIntElements()));
							elementsToBeRemoved.add(inputLink);
						}
					}
					
					LinkableElement[] linkElementsArray = new LinkableElement[intentElementSrc.size()];
					for(int i = 0; i < intentElementSrc.size(); i++){
						linkElementsArray[i] = intentElementSrc.get(i);
					}
					
					Decomposition decomposition1 = new Decomposition(linkElementsArray, intentElementDest, decompType);
					allDecomposition.add(decomposition1);
					
					for(InputLink inputLink : elementsToBeRemoved){
						allInputLinks.remove(inputLink);
					}
				}
				
				modelSpec.setDecomposition(allDecomposition);				
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
			
			if(modelSpec.isSolveSingleSolutions()){
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
			}
			
		}catch (Exception e) {
			throw new RuntimeException(e.getMessage()); 
		}
		
		return modelSpec;

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
