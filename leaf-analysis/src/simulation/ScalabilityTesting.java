package simulation;

//import java.io.File;
import java.io.FileReader;
import java.io.IOException;
//import java.io.PrintWriter;
//import java.text.SimpleDateFormat;
//import java.util.Date;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import interface_objects.FuncWrapper;
import interface_objects.FuncWrapperDeserializer;
import interface_objects.InputObject;
//import interface_objects.OutputModel;

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
			int numSamples = 10;	// Was 10 in RE'16 paper.
			String path = "scalability-tests/";
			String fileName = "";	
			
			int numSimSteps = 0;
			if (args.length > 0) {
				fileName = args[0];
				numSimSteps = Integer.parseInt(args[1]);
			} else
				throw new IOException("Tool: Command Line Inputs Incorrect.");
			
//			int[] numSimSteps = new int[]{75};//{5,10,25,50,75,100,150,200};
//					//{5,10,25,50,75,100,150,200,300,400,500,600,700,800,900,1000};
//			String[] scalabilityFiles = new String[]{"REJ-ORTree-25.json","REJ-ORTree-51.json","REJ-ORTree-75.json",
//													"REJ-ORTree-101.json","REJ-ORTree-125.json","REJ-ORTree-151.json",
//													"REJ-ORTree-175.json","REJ-ORTree-201.json"};//"WME.json"

			//for (int f = 0; f < scalabilityFiles.length; f++){
			//	fileName = scalabilityFiles[f];
				System.out.println("For Analysis Type:\t" + fileName);
				ModelSpec modelSpec = convertModelFromFile(path + fileName);
				TroposCSPAlgorithm model;
				
				//for (int i = 0; i < numSimSteps.length; i++){
				//	System.out.print(numSimSteps[i]);
					System.out.print(numSimSteps);
					for (int w = 0; w < numSamples; w++){
						//modelSpec.setRelativeTimePoints(numSimSteps[i]);
						modelSpec.setRelativeTimePoints(numSimSteps);
						model = new TroposCSPAlgorithm(modelSpec);
				        long startTime = System.currentTimeMillis();
				        boolean foundSolution = model.solveModel();
				        long endTime = System.currentTimeMillis();
			        	System.out.print("\t" + (endTime - startTime));
						if(!foundSolution)
							throw new Exception("Solution not found.");
						model = null;
					}
					System.out.println();
				//}
				System.out.println();
			//}
		} catch (Exception e) {
			System.err.println("Unknown Exception: " + e.getMessage());
			System.err.println("Stack trace: ");
			e.printStackTrace(System.err);
		} 
	}
}
