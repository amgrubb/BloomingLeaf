import simulation.Actor;
import simulation.Intention;
import simulation.ContributionLink;
import simulation.DecompositionLink;
import simulation.NotBothLink;

import simulation.ModelSpec;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;

public class Traceability{
	public static void traceabilityOutput(ModelSpec mergedModel, String fileName) {
		ArrayList<String> fromModel1 = new ArrayList<>();
		ArrayList<String> fromModel2 = new ArrayList<>();
				
		for(Actor actor: mergedModel.getActors()) {
			if(actor.getId().contains("model1")) {
				fromModel1.add(actor.getName());
			}
			else {
				fromModel2.add(actor.getName());
			}
		}
		for(Intention intention: mergedModel.getIntentions()) {
			if(intention.getId().contains("model1")) {
				fromModel1.add(intention.getName());
			}
			else {
				fromModel2.add(intention.getName());
			}
		}
		for(ContributionLink cl: mergedModel.getContributionLinks()) {
			if(cl.getID().contains("model1")) {
				fromModel1.add(cl.getName());
			}
			else {
				fromModel2.add(cl.getName());
			}
		}
		for(DecompositionLink dl: mergedModel.getDecompositionLinks()) {
			if(dl.getID().contains("model1")) {
				fromModel1.add(dl.getName());
			}
			else {
				fromModel2.add(dl.getName());
			}
		}
		for(NotBothLink nbl: mergedModel.getNotBothLinks()) {
			if(nbl.getID().contains("model1")) {
				fromModel1.add(nbl.getName());
			}
			else {
				fromModel2.add(nbl.getName());
			}
		}
		try {
			FileWriter fileWriter = new FileWriter(fileName);
			
			fileWriter.write("From Model 1: ");
			fileWriter.write("--------------------------");
			for(String name: fromModel1) {
				fileWriter.write(name);
			}
			
			fileWriter.write("From Model 2: ");
			fileWriter.write("--------------------------");
			for(String name: fromModel2) {
				fileWriter.write(name);
			}
				
			
		}catch(IOException e) {
			System.out.println("There was a problem in providing the traceability chart.")
		}
		
	}
}