package simulation;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;

import com.google.gson.Gson;

import interface_objects.InputObject;
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
		//String filePath = "/u/marcel/public_html/BloomingLeaf/leaf-ui/cgi-bin/temp/";			
		String fileName = "default.json";
				
		try {
			//creating the backend model to be analysed
			ModelSpec modelSpec = convertModelFromFile(filePath+fileName);
			//Analyze the model
			
			TroposCSPAlgorithm solver = new TroposCSPAlgorithm(modelSpec);
			solver.solveModel();
			
			
			createOutputFile(modelSpec.getFinalValues(), "output");
			
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
	private static void createOutputFile(boolean[][][] bs, String fileName) {
		//Gson gson = new Gson();		
		//Need to create the file and folder if it doesn't exist
		String outputFile = "/home/marcel/UofT/" + fileName + ".out";
		//String outputFile = "/u/marcel/public_html/BloomingLeaf/leaf-ui/cgi-bin/temp/" + fileName + ".out";
		
		StringBuilder sb = new StringBuilder();
		sb.append(bs.length).append("\n"); //numElements - number of intent elements
		sb.append(bs[0].length).append("\n"); //timeScale - number of states

		for(int x = 0; x < bs.length; x++){
			for(int y = 0; y < bs[x].length; y++){
				String value = "";
				for(int z = 0; z < 4; z++){
					if(bs[x][y][z]){
						value += "1";
					}else{
						value +="0";
					}
				}
				
				if(value.equals("0000")){
					sb.append("5");
				}else if(value.equals("1000")){
					sb.append("3");
				}else if(value.equals("0100")){
					sb.append("2");
				}else if(value.equals("0010")){
					sb.append("1");
				}else if(value.equals("0001")){
					sb.append("0");
				}else{
					sb.append("4");
				}
				sb.append("\t");
			}
			sb.append("\n");
		}
		
		try {
			FileWriter file;
			file = new FileWriter(outputFile);
			PrintWriter printFile = new PrintWriter(file);
			printFile.printf(sb.toString());
			//printFile.printf(gson.toJson(bs));
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