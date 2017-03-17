package simulation;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;

import com.google.gson.Gson;

import interface_object.FrontendObject;
import interface_object.IONode;
import interface_object.IOOutput;

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
		String fileName = "default.json";
		
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
			FrontendModel modelSpec = convertModelFromFile(filePath+fileName);
			//Creating a file to see what was received
			//createOutputFile(modelSpec, "output.out");
			//TODO: analyse the model
			//IOOutput commOutput = analyseModel(modelSpec);
			
			//TODO: get the object created in the analysis and add into a file to be sent to frontend
			//createOutputFile(commOutput, fileName);
			
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
	private static void createOutputFile(FrontendModel commOutput, String fileName) {
		Gson gson = new Gson();		
		//Need to create the file and folder if doesn't exist
		String outputFile = "/home/marcel/UofT/" + fileName + ".out";
		
		try {
			FileWriter file;
			file = new FileWriter(outputFile);
			PrintWriter printFile = new PrintWriter(file);
			printFile.printf(gson.toJson(commOutput));
			file.close();
		} catch (Exception e) {
			throw new RuntimeException("Error in createOutputFile: " + e.getMessage());
		}
		
	}

	/**
	 * This method call the analysis classes
	 * @param modelSpec
	 * @return
	 */
	private static IOOutput analyseModel(FrontendModel modelSpec) {
		//TEST Here I created a simple output as a test
		IOOutput ioOutput = new IOOutput();
		int[] absoluteTime = {0, 1, 10, 20, 27};
		int[] relativeTime = {0, 1, 2, 3, 4}; 
		
		IONode node01 = new IONode();
		node01.setId(0);
		node01.getStates().add("0010");
		node01.getStates().add("0010");
		node01.getStates().add("0010");
		node01.getStates().add("0010");
		node01.getStates().add("0010");
		
		ioOutput.getNodes().add(node01);

		IONode node02 = new IONode();
		node02.setId(1);
		node02.getStates().add("0100");
		node02.getStates().add("1100");
		node02.getStates().add("0010");
		node02.getStates().add("1100");
		node02.getStates().add("1100");

		ioOutput.getNodes().add(node02);

		IONode node03 = new IONode();
		node03.setId(2);
		node03.getStates().add("0010");
		node03.getStates().add("0010");
		node03.getStates().add("0100");
		node03.getStates().add("0010");
		node03.getStates().add("0010");

		ioOutput.getNodes().add(node03);
		
		ioOutput.setAbsoluteTime(absoluteTime);
		ioOutput.setRelativeTime(relativeTime);
		
		// TODO Auto-generated method stub
		return ioOutput;
	}


	/**
	 * This method converts the model file sent by the frontend into the ModelSpecPojo in order to be analysed
	 * @param filePath
	 * Path to the file with the frontend model
	 * @return
	 * ModelSpecPojo backend model
	 */
	private static FrontendModel convertModelFromFile(String filePath) {
		try{
		Gson gson = new Gson();		
		FrontendObject frontendObject = gson.fromJson(new FileReader(filePath), FrontendObject.class);
		FrontendModel modelSpec = ModelSpecBuilder.buildModelSpec(frontendObject);
		return modelSpec;
		}catch(Exception e){
			throw new RuntimeException("Error in convertModelFromFile() method: /n" + e.getMessage());
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