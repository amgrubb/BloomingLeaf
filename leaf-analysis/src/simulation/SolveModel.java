package simulation;

import java.io.File;
import java.io.FileReader;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import interface_objects.FuncWrapper;
import interface_objects.FuncWrapperDeserializer;
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
			//long startTime = System.currentTimeMillis();                            //Scaleability Testing
			solver.solveModel();
            //long endTime = System.currentTimeMillis();                              //Scalability Testing
            //System.out.print("Time:" + (endTime - startTime));					  //Scalability Testing
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
	 * @param solver
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

		GsonBuilder builder = new GsonBuilder();
		builder.registerTypeAdapter(FuncWrapper.class, new FuncWrapperDeserializer());

		try {
			Gson gson = builder.create();
			//Gson gson = new Gson();
			/*String js = "{\"analysisRequest\":{\"action\":\"singlePath\",\"conflictLevel\":\"S\",\"numRelTime\":\"1\",\"absTimePts\":\"\",\"absTimePtsArr\":[],\"currentState\":\"0\",\"userAssignmentsList\":[{\"intentionID\":\"0000\",\"absTime\":\"0\",\"evaluationValue\":\"0100\"}],\"previousAnalysis\":null},\"model\":{\"actors\":[],\"intentions\":[{\"nodeActorID\":\"-\",\"nodeID\":\"0000\",\"nodeType\":\"G\",\"nodeName\":\"Goal_0\",\"dynamicFunction\":{\"intentionID\":\"0000\",\"stringDynVis\":\"UD\",\"functionSegList\":[{\"funcType\":\"C\",\"funcX\":\"0100\",\"funcStart\":\"0\",\"funcStop\":\"A\"},{\"functionSegList\":[{\"funcType\":\"I\",\"funcX\":\"0011\",\"funcStart\":\"A\",\"funcStop\":\"B\"},{\"funcType\":\"D\",\"funcX\":\"1100\",\"funcStart\":\"B\",\"funcStop\":\"C\"},{\"funcType\":\"I\",\"funcX\":\"0011\",\"funcStart\":\"C\",\"funcStop\":\"D\"}],\"repNum\":\"2\",\"absTime\":\"0\"}]}}],\"links\":[],\"constraints\":[{\"constraintType\":\"A\",\"constraintSrcID\":\"0000\",\"constraintSrcEB\":\"A\",\"constraintDestID\":null,\"constraintDestEB\":null,\"absoluteValue\":-1},{\"constraintType\":\"A\",\"constraintSrcID\":\"0000\",\"constraintSrcEB\":\"B\",\"constraintDestID\":null,\"constraintDestEB\":null,\"absoluteValue\":-1},{\"constraintType\":\"A\",\"constraintSrcID\":\"0000\",\"constraintSrcEB\":\"C\",\"constraintDestID\":null,\"constraintDestEB\":null,\"absoluteValue\":-1}],\"maxAbsTime\":\"100\"}}";
			String x1 = "{\"analysisRequest\":{\"action\":\"singlePath\",\"conflictLevel\":\"S\",\"numRelTime\":\"1\",\"absTimePts\":\"\",\"absTimePtsArr\":[],\"currentState\":\"0\",\"userAssignmentsList\":[{\"intentionID\":\"0000\",\"absTime\":\"0\",\"evaluationValue\":\"(no value)\"},{\"intentionID\":\"0001\",\"absTime\":\"0\",\"evaluationValue\":\"(no value)\"}],\"previousAnalysis\":null},\"model\":{\"actors\":[],\"intentions\":[{\"nodeActorID\":\"-\",\"nodeID\":\"0000\",\"nodeType\":\"G\",\"nodeName\":\"Goal_0\",\"dynamicFunction\":{\"intentionID\":\"0000\",\"stringDynVis\":\"UD\",\"functionSegList\":[{\"funcType\":\"C\",\"funcX\":\"(no value)\",\"funcStart\":\"0\",\"funcStop\":\"A\"},{\"funcType\":\"R\",\"funcX\":\"0000\",\"funcStart\":\"A\",\"funcStop\":\"B\"}]}},{\"nodeActorID\":\"-\",\"nodeID\":\"0001\",\"nodeType\":\"G\",\"nodeName\":\"Goal_1\",\"dynamicFunction\":{\"intentionID\":\"0001\",\"stringDynVis\":\"NT\",\"functionSegList\":[]}}],\"links\":[],\"constraints\":[{\"constraintType\":\"A\",\"constraintSrcID\":\"0000\",\"constraintSrcEB\":\"A\",\"constraintDestID\":null,\"constraintDestEB\":null,\"absoluteValue\":-1}],\"maxAbsTime\":\"100\"}}";
			String x2 = "{\"analysisRequest\":{\"action\":\"singlePath\",\"conflictLevel\":\"S\",\"numRelTime\":\"1\",\"absTimePts\":\"\",\"absTimePtsArr\":[],\"currentState\":\"0\",\"userAssignmentsList\":[{\"intentionID\":\"0000\",\"absTime\":\"0\",\"evaluationValue\":\"(no value)\"},{\"intentionID\":\"0001\",\"absTime\":\"0\",\"evaluationValue\":\"(no value)\"}],\"previousAnalysis\":null},\"model\":{\"actors\":[{\"nodeID\":\"a000\",\"nodeName\":\"Actor_0\",\"intentionIDs\":[\"0000\"]}],\"intentions\":[{\"nodeActorID\":\"a000\",\"nodeID\":\"0000\",\"nodeType\":\"G\",\"nodeName\":\"Goal_0\",\"dynamicFunction\":{\"intentionID\":\"0000\",\"stringDynVis\":\"UD\",\"functionSegList\":[{\"funcType\":\"C\",\"funcX\":\"(no value)\",\"funcStart\":\"0\",\"funcStop\":\"A\"},{\"funcType\":\"R\",\"funcX\":\"0000\",\"funcStart\":\"A\",\"funcStop\":\"B\"}]}},{\"nodeActorID\":\"-\",\"nodeID\":\"0001\",\"nodeType\":\"G\",\"nodeName\":\"Goal_1\",\"dynamicFunction\":{\"intentionID\":\"0001\",\"stringDynVis\":\"NT\",\"functionSegList\":[]}}],\"links\":[],\"constraints\":[{\"constraintType\":\"A\",\"constraintSrcID\":\"0000\",\"constraintSrcEB\":\"A\",\"constraintDestID\":null,\"constraintDestEB\":null,\"absoluteValue\":-1}],\"maxAbsTime\":\"100\"}}";
			//			InputObject frontendObject = gson.fromJson(new FileReader(filePath), InputObject.class);
			InputObject frontendObject = gson.fromJson(x1, InputObject.class);
			InputObject frontendObject = gson.fromJson(new FileReader(filePath), InputObject.class);
			System.out.println(frontendObject.toString());*/
			InputObject frontendObject = gson.fromJson(new FileReader(filePath), InputObject.class);
			
			ModelSpec modelSpec =  ModelSpecBuilder.buildModelSpec(frontendObject);
			return modelSpec;
			
		} catch(Exception e) {
			throw new RuntimeException("Error in convertModelFromFile() method: \n " + e.getMessage());
		}
	}
}