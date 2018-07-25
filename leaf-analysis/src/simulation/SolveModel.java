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
			String json1 = "{\"analysis\":{\"action\":\"singlePath\",\"maxAbsTime\":\"100\",\"conflictLevel\":\"S\",\"numRelTime\":\"1\",\"absTimePts\":null,\"currentState\":\"0\",\"initialAssignedEpoch\":[\"0\"],\"initialValueTimePoints\":[\"0\"],\"elementList\":[{\"id\":\"0000\",\"status\":[\"0000\"]},{\"id\":\"0001\",\"status\":[\"0000\"]},{\"id\":\"0002\",\"status\":[\"0000\"]},{\"id\":\"0003\",\"status\":[\"0000\"]}]},\"model\":{\"actors\":[],\"intentions\":[{\"nodeActorID\":\"-\",\"nodeID\":\"0000\",\"nodeType\":\"G\",\"nodeName\":\"Goal_1\"},{\"nodeActorID\":\"-\",\"nodeID\":\"0001\",\"nodeType\":\"G\",\"nodeName\":\"Goal_0\"},{\"nodeActorID\":\"-\",\"nodeID\":\"0002\",\"nodeType\":\"G\",\"nodeName\":\"Goal_1\"},{\"nodeActorID\":\"-\",\"nodeID\":\"0003\",\"nodeType\":\"G\",\"nodeName\":\"Goal_3\"}],\"links\":[{\"linkType\":\"AND\",\"linkSrcID\":\"0001\",\"linkDestID\":\"0002\",\"postType\":null,\"absoluteValue\":-1},{\"linkType\":\"AND\",\"linkSrcID\":\"0003\",\"linkDestID\":\"0002\",\"postType\":null,\"absoluteValue\":-1}],\"dynamics\":[{\"intentionID\":\"0000\",\"dynamicType\":\"NT\",\"markedValue\":\"0000\",\"line\":null},{\"intentionID\":\"0001\",\"dynamicType\":\"NT\",\"markedValue\":\"0000\",\"line\":null},{\"intentionID\":\"0002\",\"dynamicType\":\"NT\",\"markedValue\":\"0000\",\"line\":null},{\"intentionID\":\"0003\",\"dynamicType\":\"NT\",\"markedValue\":\"0000\",\"line\":null}],\"constraints\":[],\"userEvaluations\":[]}}";
			String json2 = "{\"analysisRequest\":{\"action\":\"singlePath\",\"conflictLevel\":\"S\",\"numRelTime\":\"1\",\"absTimePts\":\"\",\"absTimePtsArr\":[],\"currentState\":\"0\",\"userAssignmentsList\":[{\"intentionID\":\"0000\",\"absTime\":\"0\",\"evaluationValue\":\"(no value)\"},{\"intentionID\":\"0001\",\"absTime\":\"0\",\"evaluationValue\":\"(no value)\"},{\"intentionID\":\"0002\",\"absTime\":\"0\",\"evaluationValue\":\"(no value)\"}],\"previousAnalysis\":null},\"model\":{\"actors\":[],\"intentions\":[{\"nodeActorID\":\"-\",\"nodeID\":\"0000\",\"nodeType\":\"G\",\"nodeName\":\"Goal_0\",\"dynamicFunction\":{\"intentionID\":\"0000\",\"stringDynVis\":\"NF\",\"functionSegList\":[]}},{\"nodeActorID\":\"-\",\"nodeID\":\"0001\",\"nodeType\":\"G\",\"nodeName\":\"Goal_1\",\"dynamicFunction\":{\"intentionID\":\"0001\",\"stringDynVis\":\"NF\",\"functionSegList\":[]}},{\"nodeActorID\":\"-\",\"nodeID\":\"0002\",\"nodeType\":\"G\",\"nodeName\":\"Goal_2\",\"dynamicFunction\":{\"intentionID\":\"0002\",\"stringDynVis\":\"NF\",\"functionSegList\":[]}}],\"links\":[{\"linkID\":\"0000\",\"linkType\":\"and\",\"postType\":null,\"linkSrcID\":\"0001\",\"linkDestID\":\"0000\",\"absoluteValue\":-1},{\"linkID\":\"0001\",\"linkType\":\"and\",\"postType\":null,\"linkSrcID\":\"0002\",\"linkDestID\":\"0000\",\"absoluteValue\":-1}],\"constraints\":[],\"maxAbsTime\":\"100\"}}";
			String json3 = "{\"analysisRequest\":{\"action\":\"singlePath\",\"conflictLevel\":\"S\",\"numRelTime\":\"1\",\"absTimePts\":\"\",\"absTimePtsArr\":[],\"currentState\":\"0\",\"userAssignmentsList\":[{\"intentionID\":\"0000\",\"absTime\":\"0\",\"evaluationValue\":\"0011\"}],\"previousAnalysis\":null},\"model\":{\"actors\":[],\"intentions\":[{\"nodeActorID\":\"-\",\"nodeID\":\"0000\",\"nodeType\":\"G\",\"nodeName\":\"Neil\",\"dynamicFunction\":{\"intentionID\":\"0000\",\"stringDynVis\":\"UD\",\"functionSegList\":[{\"functionSegList\":[{\"funcType\":\"C\",\"funcX\":\"0011\",\"funcStart\":\"0\",\"funcStop\":\"A\"},{\"funcType\":\"D\",\"funcX\":\"1100\",\"funcStart\":\"A\",\"funcStop\":\"B\"},{\"funcType\":\"C\",\"funcX\":\"1100\",\"funcStart\":\"B\",\"funcStop\":\"C\"}],\"repNum\":\"5\",\"absTime\":\"3\"},{\"funcType\":\"C\",\"funcX\":\"0100\",\"funcStart\":\"C\",\"funcStop\":\"D\"}]}}],\"links\":[],\"constraints\":[{\"constraintType\":\"A\",\"constraintSrcID\":\"0000\",\"constraintSrcEB\":\"A\",\"constraintDestID\":null,\"constraintDestEB\":null,\"absoluteValue\":-1},{\"constraintType\":\"A\",\"constraintSrcID\":\"0000\",\"constraintSrcEB\":\"B\",\"constraintDestID\":null,\"constraintDestEB\":null,\"absoluteValue\":-1},{\"constraintType\":\"A\",\"constraintSrcID\":\"0000\",\"constraintSrcEB\":\"C\",\"constraintDestID\":null,\"constraintDestEB\":null,\"absoluteValue\":-1}],\"maxAbsTime\":\"100\"}}";

			String j3 = "{\"analysisRequest\":{\"action\":\"singlePath\",\"conflictLevel\":\"S\",\"numRelTime\":\"1\",\"absTimePts\":\"\",\"absTimePtsArr\":[],\"currentState\":\"0\",\"userAssignmentsList\":[{\"intentionID\":\"0000\",\"absTime\":\"0\",\"evaluationValue\":\"1100\"}],\"previousAnalysis\":null},\"model\":{\"actors\":[],\"intentions\":[{\"nodeActorID\":\"-\",\"nodeID\":\"0000\",\"nodeType\":\"G\",\"nodeName\":\"Goal_0\",\"dynamicFunction\":{\"intentionID\":\"0000\",\"stringDynVis\":\"I\",\"functionSegList\":[{\"funcType\":\"I\",\"funcX\":\"0011\",\"funcStart\":\"0\",\"funcStop\":\"Infinity\"}]}}],\"links\":[],\"constraints\":[],\"maxAbsTime\":\"100\"}}";
			String j4 = "{\"analysisRequest\":{\"action\":\"singlePath\",\"conflictLevel\":\"S\",\"numRelTime\":\"1\",\"absTimePts\":\"\",\"absTimePtsArr\":[],\"currentState\":\"0\",\"userAssignmentsList\":[{\"intentionID\":\"0000\",\"absTime\":\"0\",\"evaluationValue\":\"0011\"},{\"intentionID\":\"0001\",\"absTime\":\"0\",\"evaluationValue\":\"0011\"},{\"intentionID\":\"0002\",\"absTime\":\"0\",\"evaluationValue\":\"0011\"}],\"previousAnalysis\":null},\"model\":{\"actors\":[],\"intentions\":[{\"nodeActorID\":\"-\",\"nodeID\":\"0000\",\"nodeType\":\"G\",\"nodeName\":\"Goal_0\",\"dynamicFunction\":{\"intentionID\":\"0000\",\"stringDynVis\":\"NF\",\"functionSegList\":[]}},{\"nodeActorID\":\"-\",\"nodeID\":\"0001\",\"nodeType\":\"G\",\"nodeName\":\"Goal_1\",\"dynamicFunction\":{\"intentionID\":\"0001\",\"stringDynVis\":\"NF\",\"functionSegList\":[]}},{\"nodeActorID\":\"-\",\"nodeID\":\"0002\",\"nodeType\":\"G\",\"nodeName\":\"Goal_2\",\"dynamicFunction\":{\"intentionID\":\"0002\",\"stringDynVis\":\"NF\",\"functionSegList\":[]}}],\"links\":[{\"linkID\":\"0000\",\"linkType\":\"and\",\"postType\":null,\"linkSrcID\":\"0001\",\"linkDestID\":\"0000\",\"absoluteValue\":-1},{\"linkID\":\"0001\",\"linkType\":\"and\",\"postType\":null,\"linkSrcID\":\"0002\",\"linkDestID\":\"0000\",\"absoluteValue\":-1}],\"constraints\":[],\"maxAbsTime\":\"100\"}}";
			// uncomment the below line for when generating the jar file to use with the frontend
			//		InputObject frontendObject = gson.fromJson(new FileReader(filePath), InputObject.class);
			InputObject frontendObject = gson.fromJson(j4, InputObject.class);
			ModelSpec modelSpec =  ModelSpecBuilder.buildModelSpec(frontendObject);
			return modelSpec;
		} catch(Exception e) {
			throw new RuntimeException("Error in convertModelFromFile() method: /n" + e.getMessage());
		}
	}
}