package merge;

import java.io.File;
import java.io.FileReader;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import gson_classes.IMain;

import simulation.ModelSpec;
import simulation.BIModelSpecBuilder;

/**
 * MMain
 * This class is the main app class for the model merge
 * It is responsible to get two json model files produced in the frontend and process into the model used in the backend.
 * Then it executes all model merge creating an output file with the json of the merged model.
 *
 */
public class MMain {
	public final static boolean DEBUG = false;

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
			// Creating the 1st back-end model to be merged
			ModelSpec modelSpec1 = convertBackboneModelFromFile(filePath + inputFile1);
			
			// Creating the 2nd back-end model to be merged
			ModelSpec modelSpec2 = convertBackboneModelFromFile(filePath + inputFile2);
			
			
	    	//TODO: MERGE-Y THINGS
			//ModelSpec mergedModel = things;
			// test outputs
			System.out.println("m1:");
			System.out.println(modelSpec1);
			
			System.out.println("intentions:");
			System.out.println(modelSpec1.getIntentions().get(0).getVisualInfo().toString());
			
			System.out.println("m2:");
			System.out.println(modelSpec2);
			
			ModelSpec mergedModel = modelSpec1;
			
			//Create Output file that will be used by frontend
			// createOutputFile(mergedModel, filePath + outputFile);
			
		
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
	private static void createOutputFile(ModelSpec outputModel, String filePath) {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
	
		try {
			File file;
			file = new File(filePath);
			if (!file.exists()) {
				file.createNewFile();
			}
			PrintWriter printFile = new PrintWriter(file);
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

			ModelSpec modelSpec = BIModelSpecBuilder.buildModelSpec(frontendObject);
			return modelSpec;
			
		} catch(Exception e) {
			throw new RuntimeException("Error in convertModelFromFile() method: \n " + e.getMessage());
		}
	} 
}