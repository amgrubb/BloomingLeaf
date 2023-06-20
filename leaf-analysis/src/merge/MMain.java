package merge;

import java.io.File;

import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import gson_classes.IMain;
import simulation.ModelSpec;
import simulation.BIModelSpecBuilder;
import simulation.Intention;
import layout.LayoutAlgorithm;

import java.util.HashMap;

/**
 * MMain
 * This class is the main app class for the model merge
 * It is responsible to get two json model files produced in the frontend and process into the model used in the backend.
 * Then it executes all model merge creating an output file with the json of the merged model.
 * 
 * Arguments:
 * inputFile1.json  -  BloomingLeaf model
 * inputFile2.json  -  BloomingLeaf model
 * timingFile.json  -  generated from PreMerge.ava
 * outputFile.json  -  destination for output
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
		String inPath = "temp/";
		String tPath = "temp/";
		String outPath = "temp/";
		String tracePath = "temp/";
		String inputFile1 = "";
		String inputFile2 = "";
		String timingFile = "";
		String outputFile = "default.json";
		
		try {			
			if (args.length == 4) {
				inputFile1 = args[0];
				inputFile2 = args[1];
				timingFile = args[2];
				outputFile = args[3];
			} else throw new IOException("Tool: Command Line Inputs Incorrect.");
			
			if (DEBUG) System.out.println("Merging: \t" + inputFile1 + " and " + inputFile2);

			Gson gson = new Gson();
			
			// Loading in timing info
			TMain timings = convertTimingFromFile(tPath + timingFile);
			if (DEBUG) {
				System.out.printf("Timing offset: %d%n", timings.getTimingOffset());
			}
			
			//make hashmap to keep target and replacement time points
			HashMap<String, String> simTPs = new HashMap<>();
			
			//make a for loop that is going to go through all the new time orders in timings and look for $
			//can we print the new time order for each intention in this file
			for (int i = 0; i < timings.getTimingList().size() - 1; i++) {
				//System.out.println("NewTimeOrder: "+timings.getTimingList().get(i).getNewTimeOrder());
				for (int j = 0; j < timings.getTimingList().get(i).getNewTimeOrder().size(); j++) {
					if (timings.getTimingList().get(i).getNewTimeOrder().get(j).contains("$")) {
						//System.out.println(timings.getTimingList().get(i).getNewTimeOrder().get(j));
						//System.out.println("about to split");
						String[] temp = timings.getTimingList().get(i).getNewTimeOrder().get(j).split("\\$");
						if (temp[0].contains("TP") && temp[1].contains("TP")) {
							simTPs.put(temp[0], temp[1]);
						}
						else if (temp[0].contains("TP")) {
							simTPs.put(temp[0], temp[1]);
						}
						else {
							simTPs.put(temp[1], temp[0]);
						}
						//no absolute tp pairs!!!
						//System.out.println("adding " + temp[0] + " as the target and " + temp[1] + " as the replacement");
					}
				}	
			}			
			for (int i = 0; i < timings.getTimingList().size()-1; i++) {
				//System.out.println("NewTimeOrder: "+timings.getTimingList().get(i).getNewTimeOrder());
				for (int j = 0; j < timings.getTimingList().get(i).getNewTimeOrder().size(); j++) {
					for (String target : simTPs.keySet()) {
						if (timings.getTimingList().get(i).getNewTimeOrder().get(j).contains(target)) {
							System.out.println("before replacement: " + timings.getTimingList().get(i).getNewTimeOrder().get(j));
							timings.getTimingList().get(i).getNewTimeOrder().set(j, simTPs.get(target));
							System.out.println("after replacement: " + timings.getTimingList().get(i).getNewTimeOrder().get(j));
						}
					}
				}	
			}
			
			
			
			// Creating the 1st back-end model to be merged
			ModelSpec modelSpec1 = convertBackboneModelFromFile(inPath + inputFile1);

			// print M1 for reference
			if (DEBUG) {
				System.out.println("M1:");
				IMain m1IMain = IMainBuilder.buildIMain(modelSpec1);
				System.out.println(gson.toJson(m1IMain));
			}

			// Creating the 2nd back-end model to be merged
			ModelSpec modelSpec2 = convertBackboneModelFromFile(inPath + inputFile2);

			// print M2 for reference
			if (DEBUG) {
				System.out.println("M2:");
				IMain m2IMain = IMainBuilder.buildIMain(modelSpec2);
				System.out.println(gson.toJson(m2IMain));
			}

			// run merge
			MergeAlgorithm merge = new MergeAlgorithm(modelSpec1, modelSpec2, timings, tracePath + outputFile.replace(".json", "-Traceability.txt"));

			ModelSpec mergedModel = merge.getMergedModel();
			if (DEBUG) System.out.println("Completed Merging.");
			
			// When merge models don't store intentions properly
	        for(Intention i: mergedModel.getIntentions()) {
	        	if(i.hasActor()) i.getActor().addEmbed(i);
	        }
	        
	        //TODO: Decide if we want to automatically run layout. Can this be passed as a parameter?
//			// run auto-layout
//			LayoutAlgorithm layerOuter = new LayoutAlgorithm(mergedModel, "trace.txt", 5000);
//			ModelSpec layedOutModel = layerOuter.layout();
//			
//			// Create Output file that will be used by frontend
//			IMain mergedModelOut = IMainBuilder.buildIMain(layedOutModel);
	        IMain mergedModelOut = IMainBuilder.buildIMain(mergedModel);
			if (DEBUG) System.out.println(gson.toJson(mergedModelOut));

			createOutputFile(mergedModelOut, outPath + outputFile);
			if (DEBUG) System.out.println("created output file");


		} catch (RuntimeException e) {
			try {
				if (DEBUG) System.err.println(e.getMessage());
				File file;
				file = new File(outPath + outputFile);
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
				file = new File(outPath + outputFile);
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
	public static void createOutputFile(IMain outputModel, String filePath) {
		Gson gson = new Gson(); //new GsonBuilder().setPrettyPrinting().create();

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
	 * This method converts the model file sent by the front-end into the ModelSpec using BIModelSpecBuilder
	 * @param filePath
	 * Path to the file with the front-end model
	 * @return
	 * ModelSpec back-end model
	 */
	public static ModelSpec convertBackboneModelFromFile(String filePath) {
		GsonBuilder builder = new GsonBuilder();

		try {
			Gson gson = builder.create();
			// read model from JSON file (IMain is frontend compatible)
			IMain frontendObject = gson.fromJson(new FileReader(filePath), IMain.class);

			// convert model to ModelSpec format (for backend use)
			ModelSpec modelSpec = BIModelSpecBuilder.buildModelSpec(frontendObject);
			return modelSpec;

		} catch(Exception e) {
			throw new RuntimeException("Error in convertBackboneModelFromFile() method: \n " + e.getMessage());
		}
	}
	
	/**
	 * This method converts the timing file into a TMain object
	 * @param filePath
	 * Path to the timing file
	 * @return
	 * TMain - timing info as a TMain object
	 */

	public static TMain convertTimingFromFile(String filePath) {
		GsonBuilder builder = new GsonBuilder();

		try {
			Gson gson = builder.create();
			// read timing from JSON file (TimingMain holds list of Timing)
			TMain timingMain = gson.fromJson(new FileReader(filePath), TMain.class);
			if (DEBUG) {
				System.out.println("made timing:");
				System.out.println(gson.toJson(timingMain));
			}

			return timingMain;

		} catch(Exception e) {
			throw new RuntimeException("Error in convertTimingFromFile() method: \n " + e.getMessage());
		}
	}
}