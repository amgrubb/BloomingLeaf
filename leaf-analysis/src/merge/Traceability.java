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
	private Integer countUserResolve;  // number deleted + conflicting elements
	
	public Traceability(String fileName, ModelSpec modelA, ModelSpec modelB) {
		this.fileName = fileName;
		
		// count model elements
		this.eCountA = countElements(modelA);
		this.eCountB = countElements(modelB);
		
		// count elements that match between the models
		this.eCountMatched = countMatchedElements(modelA, modelB);
		
		// initialize user resolve counter to 0
		this.countUserResolve = 0;
	}
	
	public void printOutput(ModelSpec mergedModel) {
		ArrayList<String> fromModel1 = new ArrayList<>();
		ArrayList<String> fromModel2 = new ArrayList<>();
		ArrayList<String> mergedElements = new ArrayList<>();
		
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
		//add intentions
		for(Intention intention: mergedModel.getIntentions()) {
			
			if(intention.getId().indexOf("model") != intention.getId().length() - 6) {
		    	mergedElements.add(intention.getName()+ "\t\tID: " + intention.getId());
		    	
		    } else if(intention.getId().contains("model1")) {
				fromModel1.add(intention.getName()+ "\t\tID: " + intention.getId());
			}
			else {
				fromModel2.add(intention.getName()+ "\t\tID: " + intention.getId());
			}
		}
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
			
			fileWriter.close();
			
		}catch(IOException e) {
			System.out.println("There was a problem in providing the traceability chart.");
		}
		
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

	public void printDeletedToFile(ArrayList<ArrayList<? extends AbstractElement>> deletedElements, ArrayList<String> deletedTimings) {
		try {
			if (MMain.DEBUG) System.out.println("Printing to file...");
			FileWriter fileWriter = new FileWriter(fileName);
			fileWriter.write("Deleted Elements: "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			
			// print deleted timings
			if(deletedTimings.size() != 0) {
				fileWriter.write("\tDeleted Time Points" + deletedTimings);
			}
			this.countUserResolve += deletedTimings.size();  // add # deleted timings to user resolve counter
			
			// print deleted elements
			for(ArrayList<? extends AbstractElement> deletedElemList: deletedElements) {
				if(deletedElemList.size() == 0) {
					continue;
				}
				fileWriter.write("\t" + deletedElemList.get(0).getClass().getName() + ":"+ "\n");
				fileWriter.write("\t" + "--------------------------"+ "\n");
				for(AbstractElement deletedElem: deletedElemList) {
					fileWriter.write("\t" + deletedElem.getName()+ "\n");
	
				}
				this.countUserResolve += deletedElemList.size();  // add # deleted elements to user resolve counter
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
			
			// add # conflicts to user resolve counter
			this.countUserResolve += conflicts.size();
			
		}catch(IOException e) {
			System.out.println("There was a problem in providing the traceability chart.");
		}
		
	}
	
	// call after printDeletedToFile and printConflictMessagesToFile
	public void printElementCountsToFile(ModelSpec mergedModel) {
		this.eCountMerged = countElements(mergedModel);
		
		try {
			if (MMain.DEBUG) System.out.println("Printing to file...");
			FileWriter fileWriter = new FileWriter(fileName, true);
			
			fileWriter.write("\nAttribute Counter Chart"+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			fileWriter.write("Model A\t\t\t\tModel B\t\t\t\tMatched\t\tMerged\t\t\t\tUserResolve\n");
			fileWriter.write("A\tG\tR\tEF\tA\tG\tR\tEF\tA\tG\tA\tG\tR\tEF\tUR\n");
			fileWriter.write(eCountA.get("A") + "\t" + eCountA.get("G") + "\t" + eCountA.get("R") + "\t" + eCountA.get("EF") + "\t");
			fileWriter.write(eCountB.get("A") + "\t" + eCountB.get("G") + "\t" + eCountB.get("R") + "\t" + eCountB.get("EF") + "\t");
			fileWriter.write(eCountMatched.get("A") + "\t" + eCountMatched.get("G") + "\t");
			fileWriter.write(eCountMerged.get("A") + "\t" + eCountMerged.get("G") + "\t" + eCountMerged.get("R") + "\t" + eCountMerged.get("EF") + "\t");
			fileWriter.write(countUserResolve + "\n");
						
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