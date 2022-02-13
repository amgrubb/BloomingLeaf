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

public class Traceability{
	public static void traceabilityOutput(ModelSpec mergedModel, String fileName) {
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
	
	public static void printDeletedToFile(ArrayList<ArrayList<? extends AbstractElement>> deletedElements) {
		try {
			System.out.println("Printing to file...");
			FileWriter fileWriter = new FileWriter("traceabilityOutput.txt");
			
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
	
	public static void printConflictMessagesToFile(ArrayList<String> conflicts) {
		try {
			FileWriter fileWriter = new FileWriter("traceabilityOutput.txt", true);
			
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
}