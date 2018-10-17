package simulation;

import java.io.File;
import java.io.FileReader;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import interface_objects.FuncWrapper;
import interface_objects.FuncWrapperDeserializer;
import interface_objects.InputObject;
import interface_objects.OutputModel;

public class ScalabilityTesting {

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
			InputObject frontendObject = gson.fromJson(new FileReader(filePath), InputObject.class);
			ModelSpec modelSpec =  ModelSpecBuilder.buildModelSpec(frontendObject);
			return modelSpec;
		} catch(Exception e) {
			throw new RuntimeException("Error in convertModelFromFile() method: /n" + e.getMessage());
		}
	}
	
	public static void main(String[] args) {
		// Main to hold all Scalability Test
		try{
			String path = "scalability-tests/";
			String fileName = "";

			int[] numSimSteps = new int[]{15}; //{1,5,10,25,50,75,100,150,200,300,400,500,600,700,800,900,1000};
			String[] scalabilityFiles = new String[]{"WME.json"};

			for (int f = 0; f < scalabilityFiles.length; f++){
				fileName = scalabilityFiles[f];
				System.out.println("For Analysis Type:\t" + fileName);
				ModelSpec modelSpec = convertModelFromFile(path + fileName);
				TroposCSPAlgorithm model;
				
				for (int i = 0; i < numSimSteps.length; i++){
					System.out.print(numSimSteps[i]);
					for (int w = 0; w < 10; w++){
						model = new TroposCSPAlgorithm(modelSpec);
						//model.setMaxEpoch(numSimSteps[i]);		// Can I still change this with the Tropos Models?
						//model.setMaxTime(numSimSteps[i]);					
				        long startTime = System.currentTimeMillis();
				        boolean foundSolution = model.solveModel();
				        long endTime = System.currentTimeMillis();
			        	System.out.print("\t" + (endTime - startTime));
						if(!foundSolution)
							throw new Exception("Solution not found.");
						model = null;
					}
					System.out.println();
				}
				System.out.println();
			}
		} catch (Exception e) {
			System.err.println("Unknown Exception: " + e.getMessage());
			System.err.println("Stack trace: ");
			e.printStackTrace(System.err);
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
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		OutputModel outputModel = solver.getSpec().getOutputModel();
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
}
