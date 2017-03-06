package simulation;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;

import com.google.gson.Gson;

import interface_object.IOOutput;
import interface_object.FrontendModel;

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
		String filePath = "/home/marcel/UofT/default.json";			
		String fileName = "";
		
		//Verify if there is any parameter sent otherwise run as test mode
		//TODO: I did this because it will have to create a new file for each frontend user, so this program will execute an specific file
		if(args.length > 0){
			for(int i = 0; i < args.length; i++){
				if(args[i].contains("-f")){
					fileName = args[i+1];
					filePath = "../public_html/BloomingLeaf/cgi-bin/temp/" + fileName + ".json";
				}else{
					printHelp();
				}
			}
		}
		
		try {
			
			//creating the backend model to be analysed
			ModelSpecPojo modelSpec = convertModelFromFile(filePath);
			
			//TODO: analyse the model
			IOOutput commOutput = analyseModel(modelSpec);
			
			//TODO: get the object created in the analysis and add into a file to be sent to frontend
			createOutputFile(commOutput, fileName);
			
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
	private static void createOutputFile(IOOutput commOutput, String fileName) {
		Gson gson = new Gson();		
		//Need to create the file and folder if doesn't exist
		String outputFile = "../public_html/BloomingLeaf/cgi-bin/temp/" + fileName + ".out";
		try {
			FileWriter file;
			file = new FileWriter(outputFile);
			PrintWriter printFile = new PrintWriter(file);
			printFile.printf(gson.toJson(commOutput));
			file.close();
		} catch (Exception e) {
			throw new RuntimeException("Error in createOutputFile: " + e.getMessage());
		}
		//System.out.println(modelSpec.getActors().get(0).name.toString());
		//System.out.println(modelSpec.getDecomposition().get(0).type.toString());
		
	}

	/**
	 * This method call the analysis classes
	 * @param modelSpec
	 * @return
	 */
	private static IOOutput analyseModel(ModelSpecPojo modelSpec) {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * This method converts the model file sent by the frontend into the ModelSpecPojo in order to be analysed
	 * @param filePath
	 * Path to the file with the frontend model
	 * @return
	 * ModelSpecPojo backend model
	 */
	private static ModelSpecPojo convertModelFromFile(String filePath) {
		try{
		Gson gson = new Gson();		
		FrontendModel frontendModel = gson.fromJson(new FileReader(filePath), FrontendModel.class);
		ModelSpecPojo modelSpec = ModelSpecBuilder.buildModelSpec(frontendModel);
		return modelSpec;
		}catch(Exception e){
			throw new RuntimeException("Error in convertModelFromFile method: /n" + e.getMessage());
		}
	}

	/**
	 * Print the a help for input arguments
	 */
	private static void printHelp() {
		System.out.println("Arguments:");
		System.out.println("[-f] input filename.");
		System.out.println("Example: java -jar modelsolver.jar -f name_of_file_withou_extension");
	}

}