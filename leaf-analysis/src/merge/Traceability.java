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
	private String fileName = "traceabilityOutput.txt";
	
	// element counts
	private HashMap<String, Integer> eCountA;
	private HashMap<String, Integer> eCountB;
	private HashMap<String, Integer> eCountMatched;
	private HashMap<String, Integer> eCountMerged;
	
	public Traceability(String fileName, ModelSpec modelA, ModelSpec modelB) {
		this.fileName = fileName;
		
		// count model elements
		this.eCountA = countElements(modelA);
		this.eCountB = countElements(modelB);
		
		// count elements that match between the models
		this.eCountMatched = countMatchedElements(modelA, modelB);
	}
	
	public HashMap<String, Integer> countElements(ModelSpec model) {
		/* count actors, intentions, relationships, and evolving functions in model */
		HashMap<String, Integer> counts = new HashMap<>();
		
		counts.put("A", model.getActors().size());
		counts.put("G", model.getIntentions().size());

		// count relationships
		// contribution + decomposition + not both + actor links
		Integer relationships = model.getContributionLinks().size() + model.getDecompositionLinks().size() + model.getNotBothLinks().size();
		counts.put("R", relationships + model.getActorLinks().size());
		
		// count intentions w/ evolving functions
		Integer evolving = 0;
		for (Intention intention: model.getIntentions()) {
			if (intention.getEvolvingFunctions().length > 0) {
				evolving++;
			}
		}
		counts.put("EF", evolving);
		
		return counts;
	}
	
	public HashMap<String, Integer> countMatchedElements(ModelSpec modelA, ModelSpec modelB) {
		/* count actors and intentions which overlap between the models */
		HashMap<String, Integer> counts = new HashMap<>();
		
		// count matched actors
		Integer actors = 0;
		for (Actor actorA: modelA.getActors()) {
			for (Actor actorB: modelB.getActors()) {
				// count actors w/ matching names
				if (MergeAlgorithm.isEqualToCleaned(actorA.getName(), actorB.getName())) {
					actors++;
				}
			}
		}
		counts.put("A", actors);
		
		// count matched intentions
		Integer intentions = 0;
		for (Intention intentionA: modelA.getIntentions()) {
			for (Intention intentionB: modelB.getIntentions()) {
				// count actors w/ matching names
				if (MergeAlgorithm.isEqualToCleaned(intentionA.getName(), intentionB.getName())) {
					intentions++;
				}
			}
		}
		counts.put("G", intentions);
		
		return counts;
	}
	
	public void printElementCountsToFile(ModelSpec mergedModel) {
		this.eCountMerged = countElements(mergedModel);
		
		try {
			if (MMain.DEBUG) System.out.println("Printing to file...");
			FileWriter fileWriter = new FileWriter(fileName, true);
			
			fileWriter.write("\nAttribute Counter Chart"+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			fileWriter.write("Model A\t\t\t\tModel B\t\t\t\tMatched\t\tMerged\n");
			fileWriter.write("A\tG\tR\tEF\tA\tG\tR\tEF\tA\tG\tA\tG\tR\tEF\n");
			fileWriter.write(eCountA.get("A") + "\t" + eCountA.get("G") + "\t" + eCountA.get("R") + "\t" + eCountA.get("EF") + "\t");
			fileWriter.write(eCountB.get("A") + "\t" + eCountB.get("G") + "\t" + eCountB.get("R") + "\t" + eCountB.get("EF") + "\t");
			fileWriter.write(eCountMatched.get("A") + "\t" + eCountMatched.get("G") + "\t");
			fileWriter.write(eCountMerged.get("A") + "\t" + eCountMerged.get("G") + "\t" + eCountMerged.get("R") + "\t" + eCountMerged.get("EF") + "\n");
						
			fileWriter.close();
			
		}catch(IOException e) {
			System.out.println("There was a problem in providing the traceability chart.");
		}
	}
	
	public void printElementCountsOld(ModelSpec mergedModel) {
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
		
		//print to file
		try {
			if (MMain.DEBUG) System.out.println("Printing to file...");
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
			fileWriter.write(" ".repeat(19) + "|Both | M1 | M2 |"+ "\n");
			for(String attribute: attributeCounter.keySet()) {
				fileWriter.write(" ".repeat(19 - attribute.length()));  // padding such that right side of table aligns
				fileWriter.write(attribute + "|" + attributeCounter.get(attribute) + "\n");
			}
			
			fileWriter.write("\nAttribute Counter Chart V2"+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			fileWriter.write("Model A\t\t\t\tModel B\t\t\t\tMerged\n");
			fileWriter.write("A\tG\tR\tEF\tA\tG\tR\tEF\tA\tG\tR\tEF\n");
			Integer actors, intentions, links, evolvingFunctions;
			
			// Model A
			// MA + Both
			actors = attributeCounter.get("Actor").get(1) + attributeCounter.get("Actor").get(0);
			intentions = attributeCounter.get("Intention").get(1) + attributeCounter.get("Intention").get(0);
			// add all four types of relationships
			links = attributeCounter.get("ContributionLink").get(1) + attributeCounter.get("ContributionLink").get(0);
			links += attributeCounter.get("DecompositionLink").get(1) + attributeCounter.get("DecompositionLink").get(0);
			links += attributeCounter.get("NotBothLink").get(1) + attributeCounter.get("NotBothLink").get(0);
			links += attributeCounter.get("ActorLink").get(1) + attributeCounter.get("ActorLink").get(0);
			evolvingFunctions = attributeCounter.get("Intention").get(1) + attributeCounter.get("Intention").get(0);
			fileWriter.write(actors + "\t" + intentions + "\t" + links + "\t" + evolvingFunctions + "\t");
			
			// Model B
			// MB + Both
			actors = attributeCounter.get("Actor").get(2) + attributeCounter.get("Actor").get(0);
			intentions = attributeCounter.get("Intention").get(2) + attributeCounter.get("Intention").get(0);
			// add all four types of relationships
			links = attributeCounter.get("ContributionLink").get(2) + attributeCounter.get("ContributionLink").get(0);
			links += attributeCounter.get("DecompositionLink").get(2) + attributeCounter.get("DecompositionLink").get(0);
			links += attributeCounter.get("NotBothLink").get(2) + attributeCounter.get("NotBothLink").get(0);
			links += attributeCounter.get("ActorLink").get(2) + attributeCounter.get("ActorLink").get(0);
			evolvingFunctions = attributeCounter.get("Intention").get(2) + attributeCounter.get("Intention").get(0);
			fileWriter.write(actors + "\t" + intentions + "\t" + links + "\t" + evolvingFunctions + "\t");
			
			// Merged
			// Both
			actors = attributeCounter.get("Actor").get(0);
			intentions = attributeCounter.get("Intention").get(0);
			// add all four types of relationships
			links = attributeCounter.get("ContributionLink").get(0);
			links += attributeCounter.get("DecompositionLink").get(0);
			links += attributeCounter.get("NotBothLink").get(0);
			links += attributeCounter.get("ActorLink").get(0);
			evolvingFunctions = attributeCounter.get("Intention").get(0);
			fileWriter.write(actors + "\t" + intentions + "\t" + links + "\t" + evolvingFunctions + "\n");
						
			fileWriter.close();
			
		}catch(IOException e) {
			System.out.println("There was a problem in providing the traceability chart.");
		}
		
	}
	

	public void printDeletedToFile(ArrayList<ArrayList<? extends AbstractElement>> deletedElements, ArrayList<String> deletedTimings) {
		try {
			if (MMain.DEBUG) System.out.println("Printing to file...");
			FileWriter fileWriter = new FileWriter(fileName);
			
			fileWriter.write("Deleted Elements: "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			if(deletedTimings.size() != 0) {
				fileWriter.write("\tDeleted Time Points" + deletedTimings);
			}
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