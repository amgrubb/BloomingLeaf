package merge;

import java.io.File;
import java.io.FileReader;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import gson_classes.IMain;

import simulation.ModelSpec;
import simulation.BIModelSpecBuilder;
import simulation.Intention;
import simulation.ContributionLink;
import simulation.DecompositionLink;

import java.util.ArrayList;
import java.util.List;

/**
 * MMain
 * This class is the main app class for the model merge
 * It is responsible to get two json model files produced in the frontend and process into the model used in the backend.
 * Then it executes all model merge creating an output file with the json of the merged model.
 *
 */
public class MMain {
	public final static boolean DEBUG = true;

	/**
	 * This method is responsible to execute all steps to generate the merged model
	 * @param args Default command line arguments.
	 */
	public static void main(String[] args) {
		//This is the default filePath to be executed if no file is passed through parameters
		String filePath = "temp/";
		String inputFile1 = "default1.json";
		String inputFile2 = "default2.json";
		String outputFile = "output.json";
				
		try {
			Gson gson = new Gson();
			// Creating the 1st back-end model to be merged
			ModelSpec modelSpec1 = convertBackboneModelFromFile(filePath + inputFile1);
			
			System.out.println(modelSpec1);
			
			// Creating the 2nd back-end model to be merged
			ModelSpec modelSpec2 = convertBackboneModelFromFile(filePath + inputFile2);
			
			System.out.println("----------------------");
			System.out.println("Here we try building IMain");
			IMain modelOut = IMainBuilder.buildIMain(modelSpec2);
			System.out.println(gson.toJson(modelOut));
			System.out.println("----------------------");
			
			// Take this in eventually
			Integer delta = 5;
			
	    	//TODO: MERGE-Y THINGS
			System.out.println("m1:");
			System.out.println(modelSpec2);
			
			System.out.println("intentions:");
			System.out.println(modelSpec2.getIntentions().get(0).getVisualInfo().toString());
			
			System.out.println("m2:");
			System.out.println(modelSpec2);
			
			ModelSpec mergedModel = MergeAlgorithm.mergeModels(modelSpec1, modelSpec2, delta);
			System.out.println("Completed Merging.");
			
			//Create Output file that will be used by frontend
			// can i output modelspec2 w/o intentions and links?\
			List<Intention> intentions = new ArrayList<Intention>();
			//Intention intent1 = new Intention()
			List<ContributionLink> contributions = new ArrayList<ContributionLink>();
			List<DecompositionLink> decompositions = new ArrayList<DecompositionLink>();
			modelSpec2.setIntentions(intentions);
			modelSpec2.setContributionLinks(contributions);
			modelSpec2.setDecompositionLinks(decompositions);
			System.out.println(gson.toJson(modelSpec2));
			
			System.out.println("----------------");
			System.out.println(gson.toJson(mergedModel));
			// add items to empty modelspec until error
			// actors
			mergedModel.setActors(modelSpec1.getActors());
			System.out.println(gson.toJson(mergedModel));
			// intentions
			//mergedModel.setIntentions(modelSpec1.getIntentions());
			//System.out.println(gson.toJson(mergedModel));
			// contribution links
			//mergedModel.setContributionLinks(modelSpec1.getContributionLinks());
			//System.out.println(gson.toJson(mergedModel));
			// decomposition links
			//mergedModel.setDecompositionLinks(modelSpec1.getDecompositionLinks());
			//System.out.println(gson.toJson(mergedModel));
			//not both links
			mergedModel.setNotBothLinks(modelSpec1.getNotBothLinks());
			System.out.println(gson.toJson(mergedModel));
			// max time
			mergedModel.setMaxTime(101);
			// abs time points
			int[] test = {1, 2, 3};
			mergedModel.setAbsoluteTimePoints(test);
			System.out.println(gson.toJson(mergedModel));
			// lttimepoint constraints
			// mergedModel.setLtTPconstraints(modelSpec2.getLtTPconstraints());
			// System.out.println(gson.toJson(mergedModel));
			
			//changed tp names
			mergedModel.setChangedTPNames(modelSpec2.getChangedTPNames());
			System.out.println(gson.toJson(mergedModel));
			
			//changed tp elements
			
			//System.out.println(gson.toJson(modelSpec2));
			createOutputFile(modelOut, filePath + outputFile);
			
		
		} catch (RuntimeException e) {
			try {
				if (DEBUG) System.err.println(e.getMessage());	
				File file;
				file = new File(filePath + outputFile);
				if (!file.exists()) {
					file.createNewFile();
				}
				PrintWriter printFile = new PrintWriter(file);
				String message = "{ \"errorMessage\" : \"RuntimeException: " + e.getMessage() + "\" }";
				message = message.replaceAll("\\r\\n|\\r|\\n", " ");
				printFile.printf(message);
				printFile.close();
			} catch (Exception f) {
				throw new RuntimeException("Error while writing ErrorMessage: " + f.getMessage());
			}
		} catch (Exception e) {
			try {
				if (DEBUG) System.err.println(e.getMessage());	
				File file;
				file = new File(filePath + outputFile);
				if (!file.exists()) {
					file.createNewFile();
				}
				PrintWriter printFile = new PrintWriter(file);
				String message = "{ \"errorMessage\" : \"Exception: " + e.getMessage() + "\" }";
				message = message.replaceAll("\\r\\n|\\r|\\n", " ");
				printFile.printf(message);
				printFile.close();
			} catch (Exception f) {
				throw new RuntimeException("Error while writing ErrorMessage: " + f.getMessage());
			}
		} 
	}
	
	/**
	 * This method converts the ModelSpec object with the merged model into a json object file to be sent to frontend.
	 * @param outputModel
	 * The merged model that contains all necessary data.
	 * @param filePath
	 * Name of the file to be read by CGI to be sent to frontend
	 */
	private static void createOutputFile(IMain outputModel, String filePath) {
		Gson gson = new Gson(); //new GsonBuilder().setPrettyPrinting().create();
	
		try {
			File file;
			file = new File(filePath);
			if (!file.exists()) {
				file.createNewFile();
			}
			PrintWriter printFile = new PrintWriter(file);
			System.out.println("made writer");
			//printFile.printf("{1:'A'}");
			System.out.println(gson.toJson(outputModel));
			printFile.printf(gson.toJson(outputModel));
			printFile.close();
		} catch (Exception e) {
			throw new RuntimeException("Error in createOutputFile: " + e.getMessage());
		}
		
	}

	/**
	 * This method converts the model file sent by the front-end into the ModelSpec using VisualModelSpecBuilder
	 * @param filePath
	 * Path to the file with the front-end model
	 * @return
	 * ModelSpec back-end model
	 */
	private static ModelSpec convertBackboneModelFromFile(String filePath) {
		GsonBuilder builder = new GsonBuilder();
		//builder.registerTypeAdapter(FuncWrapper.class, new FuncWrapperDeserializer());

		try {
			Gson gson = builder.create();
			IMain frontendObject = gson.fromJson(new FileReader(filePath), IMain.class);
			
			System.out.println("---------");
			System.out.println("IMain back to JSON:");
			System.out.println(gson.toJson(frontendObject));
			System.out.println("---------");

			ModelSpec modelSpec = BIModelSpecBuilder.buildModelSpec(frontendObject);
			return modelSpec;
			
		} catch(Exception e) {
			throw new RuntimeException("Error in convertModelFromFile() method: \n " + e.getMessage());
		}
	} 
}