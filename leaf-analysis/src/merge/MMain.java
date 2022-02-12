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
		String inputFile1 = "Spadina opp before_3.json";
		String inputFile2 = "Spadina plan before_3.json";
		String outputFile = "output-2-11.json";
		String timingFile = "timing.json";
		Integer delta = 0;  // new start B

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

			/*System.out.println("----------------------");
			System.out.println("Here we try building IMain");
			IMain modelOut = IMainBuilder.buildIMain(modelSpec2);
			System.out.println(gson.toJson(modelOut));
			System.out.println("----------------------");

	    	//TODO: MERGE-Y THINGS
			System.out.println("m1:");
			System.out.println(modelSpec2);

			System.out.println("intentions:");
			System.out.println(modelSpec2.getIntentions().get(0).getVisualInfo().toString());

			System.out.println("m2:");
			System.out.println(modelSpec2);*/
			// print M2 for reference
			IMain m2IMain = IMainBuilder.buildIMain(modelSpec2);
			System.out.println(gson.toJson(m2IMain));

			// Loading in timing info
			TMain timings = convertTimingFromFile(filePath + timingFile);

			System.out.println("----------------------");

			ModelSpec mergedModel = MergeAlgorithm.mergeModels(modelSpec1, modelSpec2, delta, timings);
			System.out.println("Completed Merging.");
			System.out.println("merged models");

			// Create Output file that will be used by frontend
			IMain mergedModelOut = IMainBuilder.buildIMain(mergedModel);
			System.out.println(gson.toJson(mergedModelOut));
			System.out.println("converted merged model to IMain");

			createOutputFile(mergedModelOut, filePath + outputFile);
			//createOutputFile(m1IMain, filePath + outputFile);

			System.out.println("created output file");

			Traceability.traceabilityOutput(mergedModel, "traceabilityOutput.txt");
			System.out.println("created Traceability doc");

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
	 * This method converts the model file sent by the front-end into the ModelSpec using BIModelSpecBuilder
	 * @param filePath
	 * Path to the file with the front-end model
	 * @return
	 * ModelSpec back-end model
	 */
	public static ModelSpec convertBackboneModelFromFile(String filePath) {
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

	public static TMain convertTimingFromFile(String filePath) {
		GsonBuilder builder = new GsonBuilder();

		try {
			Gson gson = builder.create();
			// read timing from JSON file (TimingMain holds list of Timing)
			TMain timingMain = gson.fromJson(new FileReader(filePath), TMain.class);
			System.out.println("made timing:");
			System.out.println(gson.toJson(timingMain));

			return timingMain;

		} catch(Exception e) {
			throw new RuntimeException("Error in convertTimingFromFile() method: \n " + e.getMessage());
		}
	}
}
