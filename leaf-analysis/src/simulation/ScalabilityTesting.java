package simulation;

import java.io.FileReader;
import java.io.IOException;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import interface_objects.FuncWrapper;
import interface_objects.FuncWrapperDeserializer;
import interface_objects.InputObject;

public class ScalabilityTesting {

	/**
	 * This method converts the model file sent by the frontend into the
	 * ModelSpecPojo in order to be analysed
	 * 
	 * @param filePath Path to the file with the frontend model
	 * @return ModelSpecPojo backend model
	 */
	private static ModelSpec convertModelFromFile(String filePath) {
		GsonBuilder builder = new GsonBuilder();
		builder.registerTypeAdapter(FuncWrapper.class, new FuncWrapperDeserializer());
		try {
			Gson gson = builder.create();
			InputObject frontendObject = gson.fromJson(new FileReader(filePath), InputObject.class);
			ModelSpec modelSpec = ModelSpecBuilder.buildModelSpec(frontendObject);
			return modelSpec;
		} catch (Exception e) {
			throw new RuntimeException("Error in convertModelFromFile() method: /n" + e.getMessage());
		}
	}

	public static void main(String[] args) {
		// Main to hold all Scalability Test
		try {
			int numSamples = 10; // Was 10 in RE'16 paper.
			String path = "scalability-tests/";
			String fileName = "";

			int numSimSteps = 0;
			if (args.length > 0) {
				fileName = args[0];
				numSimSteps = Integer.parseInt(args[1]);
			} else
				throw new IOException("Tool: Command Line Inputs Incorrect.");
			System.out.println("For Analysis Type:\t" + fileName);
			ModelSpec modelSpec = convertModelFromFile(path + fileName);
			TroposCSPAlgorithm model;

			System.out.print(numSimSteps);
			for (int w = 0; w < numSamples; w++) {
				modelSpec.setRelativeTimePoints(numSimSteps);
				model = new TroposCSPAlgorithm(modelSpec);
				long startTime = System.currentTimeMillis();
				boolean foundSolution = model.solveModel();
				long endTime = System.currentTimeMillis();
				System.out.print("\t" + (endTime - startTime));
				if (!foundSolution)
					throw new Exception("Solution not found.");
				model = null;
			}
			System.out.println();
			System.out.println();
		} catch (Exception e) {
			System.err.println("Unknown Exception: " + e.getMessage());
			System.err.println("Stack trace: ");
			e.printStackTrace(System.err);
		}
	}
}
