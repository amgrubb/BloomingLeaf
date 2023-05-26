package simulation;

import java.io.File;
import java.io.FileReader;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import gson_classes.IMain;
import gson_classes.IOSolution;

/**
 * SolveModelTest 
 * This class is the main app class called in the backend.
 * It is responsible to get the json model file produced in the frontend and process into the model used in the backend.
 * Then it executes all analysis creating a output file that has the json analysed file to be send back to the frontend.
 *
 */
public class Main {
	public final static boolean DEBUG = false;

	/**
	 * This method is responsible to execute all steps to generate the analysis file.
	 * @param args Default command line arguments.
	 */
	public static void main(String[] args) {
		//This is the default filePath to be executed if no file is pass through parameters
		String filePath = "temp/"; 			
		String inputFile = "default.json";
		String outputFile = "output.out";
				
		try {
			// Creating the back-end model to be analyzed
			ModelSpec modelSpec = convertBackboneModelFromFile(filePath + inputFile);
			
			
	    	switch (modelSpec.getAnalysisType()) {	
	    	case "singlePath":
	    	case "updatePath":
				// Creates the store and constraint problem to be solved.
	    		BICSPPath solver = new BICSPPath(modelSpec);
				//long startTime = System.currentTimeMillis();                            //Scaleability Testing
				IOSolution outputModel = solver.solveModel();
	            //long endTime = System.currentTimeMillis();                              //Scalability Testing
	            //System.out.print("Time:" + (endTime - startTime));					  //Scalability Testing
				createOutputFile(outputModel, filePath + outputFile);	
	    		break;
	    	case "allNextStates":
	    		IOSolution outputModelNext = BICSPState.solveModel(modelSpec);
				createOutputFile(outputModelNext, filePath + outputFile);	
	    		break;    		
	    	default:
	    		throw new Exception("User Error: User requested \'" + modelSpec.getAnalysisType() + "\', no such scenario exists. ");
	    	}
			
		
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
	 * This method converts the Output object with the analyzed data into a json object file to be sent to frontend.
	 * @param solver
	 * The solver object that contains all necessary data.
	 * @param filePath
	 * Name of the file to be read by CGI to be sent to frontend
	 */
	private static void createOutputFile(IOSolution outputModel, String filePath) {
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
	 * This method converts the model file sent by the front-end into the ModelSpec
	 * @param filePath
	 * Path to the file with the front-end model
	 * @return
	 * ModelSpec back-end model
	 */
	private static ModelSpec convertBackboneModelFromFile(String filePath) {
		GsonBuilder builder = new GsonBuilder();

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