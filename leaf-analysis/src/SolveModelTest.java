
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import interface_objects.InputObject;
import interface_objects.OutputModel;
import simulation_objects.ModelSpec;

/**
 * SolveModelTest 
 * This class is the main app class called in the backend.
 * It is responsible to get the json model file produced in the frontend and process into the model used in the backend.
 * Then it executes all analysis creating a output file that has the json analysed file to be send back to the frontend.
 *
 */
public class SolveModelTest {

	/**
	 * This method is responsible to execute all steps to generate the analysis file.
	 * @param args
	 * As parameters it receives the name of the file to be created.
	 * TODO: create a parameter to decide if it will execute a new analysis or use an existent one.
	 */
	public static void main(String[] args) {

		//This is the default filePath to be executed if no file is pass through parameters
		String filePath = "/home/marcel/UofT/";
		//String filePath = "/u/marcel/public_html/leaf/cgi-bin/temp/";			
		String fileName = "default.json";
				
		try {
			//creating the backend model to be analysed
			ModelSpec modelSpec = convertModelFromFile(filePath+fileName);
			//Analyze the model
			
			TroposCSPAlgorithm2 solver = new TroposCSPAlgorithm2(modelSpec);
			solver.solveModel();
			
			
			createOutputFile(solver.getSpec(), "output");
	
		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		} 
	}

	/**
	 * This method converts the CommmOutput object into a jason object file to be sent to frontend.
	 * @param commOutput
	 * Object CommOutput with all data to be sent to frontend.
	 * @param filePath
	 * Name of the file to be read by CGI to be sent to frontend
	 */
	private static void createOutputFile(ModelSpec modelSpec, String fileName) {
		//Need to create the file and folder if it doesn't exist
		String outputFile = "/home/marcel/UofT/" + fileName + ".out";
		//String outputFile = "/u/marcel/public_html/leaf/cgi-bin/temp/" + fileName + ".out";
	
		//Gson gson = new Gson();		
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		OutputModel outputModel = new OutputModel();

		modelSpec.getActors();
		/*for(IntVar var : solver.getTimePoints()){
			outputModel.getTimePoints().add(var.toString().replaceAll(" = ", "_"));
		}

		for(IntVar var : solver.getUnsolvedTimePoints()){
			outputModel.getUnsolvedTimePoints().add(var.toString().replaceAll(" = ", "_"));
		}
		
		//Getting values
		BooleanVar[][][] booleanVars = solver.getValues();

		for(int x = 0; x < booleanVars.length; x++){
			OutputElement outputElement = new OutputElement();
			outputElement.setId(x);
			for(int y = 0; y < booleanVars[x].length; y++){
				outputElement.getStateList().add(y);
				StringBuilder value = new StringBuilder();
				for(int z = 0; z < 4; z++){
					String[] convertResults = booleanVars[x][y][z].toString().split("=");
					value.append(convertResults[1]);
				}
				outputElement.getValuesList().add(value.toString());
			}
			outputModel.getElementList().add(outputElement);
		}*/

		
		try {
			FileWriter file;
			file = new FileWriter(outputFile);
			PrintWriter printFile = new PrintWriter(file);
			//printFile.printf(sb.toString());
			printFile.printf(gson.toJson(outputModel));
			file.close();
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
		ModelSpec modelSpec = ModelSpecBuilder.buildModelSpec(frontendObject);
		return modelSpec;
		}catch(Exception e){
			throw new RuntimeException("Error in convertModelFromFile() method: /n" + e.getMessage());
		}
	}
}