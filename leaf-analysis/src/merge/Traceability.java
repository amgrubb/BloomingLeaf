package merge;

import simulation.AbstractElement;
import simulation.Actor;
import simulation.Intention;
import simulation.ContributionLink;
import simulation.DecompositionLink;
import simulation.NotBothLink;
import simulation.ActorLink;

import simulation.ModelSpec;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class Traceability{
	String fileName = "traceabilityOutput.txt";
	public Traceability(String fileName) {
		this.fileName = fileName;
	}
	
	public void traceabilityOutput(ModelSpec mergedModel) {
		ArrayList<String> fromModel1 = new ArrayList<>();
		int fromModel1Size = 0;
		ArrayList<String> fromModel2 = new ArrayList<>();
		int fromModel2Size = 0;
		ArrayList<String> mergedElements = new ArrayList<>();
		int mergedElemsSize = 0;
		//Counts up numbers of elements from [both models, model1, model2]
		HashMap<String, ArrayList<Integer>> attributeCounter = new HashMap<String, ArrayList<Integer>>();
		
		//add actors
		for(Actor actor: mergedModel.getActors()) {
			
		    if(actor.getId().indexOf("model") != actor.getId().length() - 6) {
		    	mergedElements.add(actor.getName()+ "\t\tID: " + actor.getId());
		    	
		    }else if(actor.getId().contains("model1")) {
				fromModel1.add(actor.getName() + "\t\tID: " + actor.getId());
			}
			else {
				fromModel2.add(actor.getName()+ "\t\tID: " + actor.getId());
			}
		}
		//actor counting
		attributeCounter.put("Actor", new ArrayList<Integer>(Arrays.asList(mergedElements.size() - mergedElemsSize, fromModel1.size() - fromModel1Size, fromModel2.size() - fromModel2Size)));
		fromModel1Size = fromModel1.size();
		fromModel2Size = fromModel2.size();
		mergedElemsSize = mergedElements.size();
		
		
		//add intentions
		int numEvolFuncBoth = 0, numEvolFuncM2 = 0, numEvolFuncM1 = 0;
		for(Intention intention: mergedModel.getIntentions()) {
			
			if(intention.getId().indexOf("model") != intention.getId().length() - 6) {
		    	mergedElements.add(intention.getName()+ "\t\tID: " + intention.getId());
		    	if(intention.getEvolvingFunctions().length > 0) {
		    		numEvolFuncBoth += 1;
		    	}
		    	
		    } else if(intention.getId().contains("model1")) {
				fromModel1.add(intention.getName()+ "\t\tID: " + intention.getId());
				if(intention.getEvolvingFunctions().length > 0) {
		    		numEvolFuncM1 += 1;
		    	}
			}
			else {
				fromModel2.add(intention.getName()+ "\t\tID: " + intention.getId());
				if(intention.getEvolvingFunctions().length > 0) {
		    		numEvolFuncM2 += 1;
		    	}
			}
		}
		
		//intention counting
		attributeCounter.put("Intention", new ArrayList<Integer>(Arrays.asList(mergedElements.size() - mergedElemsSize, fromModel1.size() - fromModel1Size, fromModel2.size() - fromModel2Size)));
		fromModel1Size = fromModel1.size();
		fromModel2Size = fromModel2.size();
		mergedElemsSize = mergedElements.size();
		
		//Evolving Function counting (Counts intentions with evolving functions)
		attributeCounter.put("Evolving Function", new ArrayList<Integer>(Arrays.asList(numEvolFuncBoth, numEvolFuncM1, numEvolFuncM2)));
		
				
		//add contribution links
		for(ContributionLink cl: mergedModel.getContributionLinks()) {
			if(cl.getID().indexOf("model") != cl.getID().length() - 6) {
		    	mergedElements.add(cl.getName() + "\t\tID: " + cl.getID());
		    	
		    }else if(cl.getID().contains("model1")) {
				fromModel1.add(cl.getName()+ "\t\tID: " + cl.getID());
			}
			else {
				fromModel2.add(cl.getName()+ "\t\tID: " + cl.getID());
			}
		}
		//Contribution Link Counting
		attributeCounter.put("ContributionLink", new ArrayList<Integer>(Arrays.asList(mergedElements.size() - mergedElemsSize, fromModel1.size() - fromModel1Size, fromModel2.size() - fromModel2Size)));
		fromModel1Size = fromModel1.size();
		fromModel2Size = fromModel2.size();
		mergedElemsSize = mergedElements.size();
		
		//add decomposition links
		for(DecompositionLink dl: mergedModel.getDecompositionLinks()) {
			if(dl.getID().indexOf("model") != dl.getID().length() - 6) {
		    	mergedElements.add(dl.getName()+ "\t\tID: " + dl.getID());
		    	
		    }else if(dl.getID().contains("model1")) {
				fromModel1.add(dl.getName()+ "\t\tID: " + dl.getID());
			}
			else {
				fromModel2.add(dl.getName()+ "\t\tID: " + dl.getID());
			}
		}
		
		//Decomposition Link Counting
		attributeCounter.put("DecompositionLink", new ArrayList<Integer>(Arrays.asList(mergedElements.size() - mergedElemsSize, fromModel1.size() - fromModel1Size, fromModel2.size() - fromModel2Size)));
		fromModel1Size = fromModel1.size();
		fromModel2Size = fromModel2.size();
		mergedElemsSize = mergedElements.size();
		
		//add notbothlinks
		for(NotBothLink nbl: mergedModel.getNotBothLinks()) {
			if(nbl.getID().indexOf("model") != nbl.getID().length() - 6) {
		    	mergedElements.add(nbl.getName()+ "\t\tID: " + nbl.getID());
		    	
		    }else if(nbl.getID().contains("model1")) {
				fromModel1.add(nbl.getName()+ "\t\tID: " + nbl.getID());
			}
			else {
				fromModel2.add(nbl.getName()+ "\t\tID: " + nbl.getID());
			}
		}
		//NotBoth Link Counting
		attributeCounter.put("NotBothLink", new ArrayList<Integer>(Arrays.asList(mergedElements.size() - mergedElemsSize, fromModel1.size() - fromModel1Size, fromModel2.size() - fromModel2Size)));
		fromModel1Size = fromModel1.size();
		fromModel2Size = fromModel2.size();
		mergedElemsSize = mergedElements.size();
		
		//add actorlinks
		for(ActorLink al: mergedModel.getActorLinks()) {
			if(al.getID().indexOf("model") != al.getID().length() - 6) {
		    	mergedElements.add(al.getName() + "\t\tID: " + al.getID());
		    	
		    }else if(al.getID().contains("model1")) {
				fromModel1.add(al.getName() + "\t\tID: " + al.getID());
			}
			else {
				fromModel2.add(al.getName() + "\t\tID: " + al.getID());
			}
		}
		//ActorLink Counting
		attributeCounter.put("ActorLink", new ArrayList<Integer>(Arrays.asList(mergedElements.size() - mergedElemsSize, fromModel1.size() - fromModel1Size, fromModel2.size() - fromModel2Size)));
		fromModel1Size = fromModel1.size();
		fromModel2Size = fromModel2.size();
		mergedElemsSize = mergedElements.size();
		
		//System.out.println(fromModel1);
		//System.out.println(fromModel2);
		//System.out.println(mergedElements);
		//print to file
		try {
			System.out.println("Printing to file...");
			FileWriter fileWriter = new FileWriter(fileName, true);
			
			fileWriter.write("From Model 1: "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			for(String name: fromModel1) {
				fileWriter.write("\t" + name + "\n");
			}
			
			fileWriter.write("\\nFrom Model 2: "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			for(String name: fromModel2) {
				fileWriter.write("\t" + name+ "\n");
			}
			
			fileWriter.write("\nFrom Both Models: "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			for(String name: mergedElements) {
				fileWriter.write("\t" + name+ "\n");
			}
			
			fileWriter.write("\nAttribute Counter Chart "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			fileWriter.write("\t|Both | M1 | M2 |"+ "\n");
			for(String attribute: attributeCounter.keySet()) {
				fileWriter.write(attribute + "|" + attributeCounter.get(attribute) + "\n");
			}
			
			fileWriter.close();
			
		}catch(IOException e) {
			System.out.println("There was a problem in providing the traceability chart.");
		}
		
	}
	
	public void printDeletedToFile(ArrayList<ArrayList<? extends AbstractElement>> deletedElements) {
		try {
			System.out.println("Printing to file...");
			FileWriter fileWriter = new FileWriter(fileName);
			
			fileWriter.write("Deleted Elements: "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			for(ArrayList<? extends AbstractElement> deletedElemList: deletedElements) {
				if(deletedElemList.size() == 0) {
					continue;
				}
				fileWriter.write("\t" + deletedElemList.get(0).getClass().getName() + ":"+ "\n");
				fileWriter.write("\t" + "--------------------------"+ "\n");
				for(AbstractElement deletedElem: deletedElemList) {
					fileWriter.write("\t" + deletedElem.getName()+ "\n");
	
				}
				
			}
			
			fileWriter.close();
			
		}catch(IOException e) {
			System.out.println("There was a problem in providing the traceability chart.");
		}
		
	}
	
	public void printConflictMessagesToFile(ArrayList<String> conflicts) {
		try {
			FileWriter fileWriter = new FileWriter(fileName, true);
			
			fileWriter.write("\nConflicts: "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			for(String message: conflicts) {
				fileWriter.write("\t" + message + "\n");
				
			}
			
			fileWriter.close();
			
		}catch(IOException e) {
			System.out.println("There was a problem in providing the traceability chart.");
		}
		
	}
	
	public void addLine(String string) {
		try {
			FileWriter fileWriter = new FileWriter(fileName, true);
			
			fileWriter.write(string+"\n");
			
			fileWriter.close();
			
		}catch(IOException e) {
			System.out.println("There was a problem in providing the traceability chart.");
		}
		
	}
}