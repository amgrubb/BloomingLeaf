package simulation;

import java.io.FileReader;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import interface_objects.FuncWrapper;
import interface_objects.FuncWrapperDeserializer;
import gson_classes.IMain;

public class TestGson {

	public static void main(String[] args) {
		String filePath = "temp/default.json"; 			
		
		GsonBuilder builder = new GsonBuilder();
		builder.registerTypeAdapter(FuncWrapper.class, new FuncWrapperDeserializer());

		try {
			Gson gson = builder.create();
			IMain frontendObject = gson.fromJson(new FileReader(filePath), IMain.class);

			@SuppressWarnings("unused")
			ModelSpec modelSpec =  BIModelSpecBuilder.buildModelSpec(frontendObject);
			System.out.println("Finished");
			
		} catch(Exception e) {
			throw new RuntimeException("Error in convertModelFromFile() method: \n " + e.getMessage());
		}

	}

}
