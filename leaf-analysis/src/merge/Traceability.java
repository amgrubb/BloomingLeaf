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
		
		for(Actor actor: mergedModel.getActors()) {
			
		    if(actor.getId().indexOf("model") != actor.getId().length() - 6) {
		    	mergedElements.add(actor.getName());
		    	
		    }else if(actor.getId().contains("model1")) {
				fromModel1.add(actor.getName());
			}
			else {
				fromModel2.add(actor.getName());
			}
		}
		for(Intention intention: mergedModel.getIntentions()) {
			
			if(intention.getId().indexOf("model") != intention.getId().length() - 6) {
		    	mergedElements.add(intention.getName());
		    	
		    } else if(intention.getId().contains("model1")) {
				fromModel1.add(intention.getName());
			}
			else {
				fromModel2.add(intention.getName());
			}
		}
		for(ContributionLink cl: mergedModel.getContributionLinks()) {
			if(cl.getID().indexOf("model") != cl.getID().length() - 6) {
		    	mergedElements.add(cl.getName());
		    	
		    }else if(cl.getID().contains("model1")) {
				fromModel1.add(cl.getName());
			}
			else {
				fromModel2.add(cl.getName());
			}
		}
		for(DecompositionLink dl: mergedModel.getDecompositionLinks()) {
			if(dl.getID().indexOf("model") != dl.getID().length() - 6) {
		    	mergedElements.add(dl.getName());
		    	
		    }else if(dl.getID().contains("model1")) {
				fromModel1.add(dl.getName());
			}
			else {
				fromModel2.add(dl.getName());
			}
		}
		for(NotBothLink nbl: mergedModel.getNotBothLinks()) {
			if(nbl.getID().indexOf("model") != nbl.getID().length() - 6) {
		    	mergedElements.add(nbl.getName());
		    	
		    }else if(nbl.getID().contains("model1")) {
				fromModel1.add(nbl.getName());
			}
			else {
				fromModel2.add(nbl.getName());
			}
		}
		
		for(NotBothLink nbl: mergedModel.getNotBothLinks()) {
			if(nbl.getID().indexOf("model") != nbl.getID().length() - 6) {
		    	mergedElements.add(nbl.getName());
		    	
		    }else if(nbl.getID().contains("model1")) {
				fromModel1.add(nbl.getName());
			}
			else {
				fromModel2.add(nbl.getName());
			}
		}
		
		for(ActorLink al: mergedModel.getActorLinks()) {
			if(al.getID().indexOf("model") != al.getID().length() - 6) {
		    	mergedElements.add(al.getName());
		    	
		    }else if(al.getID().contains("model1")) {
				fromModel1.add(al.getName());
			}
			else {
				fromModel2.add(al.getName());
			}
		}
		
		//System.out.println(fromModel1);
		//System.out.println(fromModel2);
		//System.out.println(mergedElements);
		try {
			System.out.println("Printing to file...");
			FileWriter fileWriter = new FileWriter(fileName, true);
			
			fileWriter.write("From Model 1: "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			for(String name: fromModel1) {
				fileWriter.write(name + "\n");
			}
			
			fileWriter.write("From Model 2: "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			for(String name: fromModel2) {
				fileWriter.write(name+ "\n");
			}
			
			fileWriter.write("From Both Modeels: "+ "\n");
			fileWriter.write("--------------------------"+ "\n");
			for(String name: mergedElements) {
				fileWriter.write(name+ "\n");
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
				fileWriter.write("--------------------------"+ "\n");
				for(AbstractElement deletedElem: deletedElemList) {
					fileWriter.write("\t" + deletedElem.getName()+ "\n");
	
				}
				
			}
			
			fileWriter.close();
			
		}catch(IOException e) {
			System.out.println("There was a problem in providing the traceability chart.");
		}
		
	}
}