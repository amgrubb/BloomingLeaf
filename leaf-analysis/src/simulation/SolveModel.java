package simulation;

import java.io.File;
import java.io.FileReader;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import interface_objects.InputObject;
import interface_objects.OutputModel;

/**
 * SolveModelTest 
 * This class is the main app class called in the backend.
 * It is responsible to get the json model file produced in the frontend and process into the model used in the backend.
 * Then it executes all analysis creating a output file that has the json analysed file to be send back to the frontend.
 *
 */
public class SolveModel {

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
			//creating the backend model to be analysed
			ModelSpec modelSpec = convertModelFromFile(filePath + inputFile);
			
			//Analyse the model
			TroposCSPAlgorithm solver = new TroposCSPAlgorithm(modelSpec);
			solver.solveModel();
			createOutputFile(solver, filePath + outputFile);
	
		} catch (RuntimeException e) {
			try {
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
//			throw new RuntimeException(e.getMessage());
		} catch (Exception e) {
			try {
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
	 * @param TroposCSPAlgorithm
	 * The solver object that contains all necessary data.
	 * @param filePath
	 * Name of the file to be read by CGI to be sent to frontend
	 */
	private static void createOutputFile(TroposCSPAlgorithm solver, String filePath) {
		//Gson gson = new Gson();		
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		OutputModel outputModel = solver.getSpec().getOutputModel();
		
		try {
			File file;
			file = new File(filePath);
			if (!file.exists()) {
				file.createNewFile();
			}
			PrintWriter printFile = new PrintWriter(file);
			//printFile.printf(sb.toString());
			printFile.printf(gson.toJson(outputModel));
			printFile.close();
		} catch (Exception e) {
			throw new RuntimeException("Error in createOutputFile: " + e.getMessage());
		}
		
	}

	/**
	 * This method converts the model file sent by the frontend into the ModelSpecPojo in order to be analysed
	 * @param filePath
	 * Path to the file with the frontend model
	 * @return
	 * ModelSpecPojo backend model
	 */
	private static ModelSpec convertModelFromFile(String filePath) {
		try{
		Gson gson = new Gson();		
		InputObject frontendObject = gson.fromJson(new FileReader(filePath), InputObject.class);
		ModelSpec modelSpec =  ModelSpecBuilder.buildModelSpec(frontendObject);
		return modelSpec;
		}catch(Exception e){
			throw new RuntimeException("Error in convertModelFromFile() method: /n" + e.getMessage());
		}
	}
}