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
		String inputFile1 = "sandwich.json";
		String inputFile2 = "sandwich-w-peach.json";
		String outputFile = "output-1-10.json";
				
		try {
			Gson gson = new Gson();
			// Creating the 1st back-end model to be merged
			System.out.println("M1:");
			ModelSpec modelSpec1 = convertBackboneModelFromFile(filePath + inputFile1);
			
			// print M1 for reference
			IMain m1IMain = IMainBuilder.buildIMain(modelSpec1);
			System.out.println(gson.toJson(m1IMain));
			
			// Creating the 2nd back-end model to be merged
			System.out.println("M2:");
			ModelSpec modelSpec2 = convertBackboneModelFromFile(filePath + inputFile2);
			
			// print M2 for reference
			IMain m2IMain = IMainBuilder.buildIMain(modelSpec2);
			System.out.println(gson.toJson(m2IMain));
			
			System.out.println("----------------------");
			
			// Take this in eventually
			Integer delta = 5;
			
			//TODO: MERGE-Y THINGS
			ModelSpec mergedModel = MergeAlgorithm.mergeModels(modelSpec1, modelSpec2, delta);
			
			System.out.println("merged models");
			
			// Create Output file that will be used by frontend
			// IMain mergedModelOut = IMainBuilder.buildIMain(mergedModel);
			
			// System.out.println("converted merged model to IMain");
			
			// createOutputFile(mergedModelOut, filePath + outputFile);
			createOutputFile(m1IMain, filePath + outputFile);
			
			System.out.println("created output file");
			
		
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
			// read model from JSON file (IMain is frontend compatible)
			IMain frontendObject = gson.fromJson(new FileReader(filePath), IMain.class);
			System.out.println("made IMain:");
			System.out.println(gson.toJson(frontendObject));
			
			// convert model to ModelSpec format (for backend use)
			ModelSpec modelSpec = BIModelSpecBuilder.buildModelSpec(frontendObject);
			return modelSpec;
			
		} catch(Exception e) {
			throw new RuntimeException("Error in convertBackboneModelFromFile() method: \n " + e.getMessage());
		}
	} 
}