package simulation;

import java.io.FileReader;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import interface_objects.FuncWrapper;
import interface_objects.FuncWrapperDeserializer;
import interface_objects.InputObject;

public class TestGson {

	public static void main(String[] args) {
		String filePath = "temp/default.json"; 			
		
		GsonBuilder builder = new GsonBuilder();
		builder.registerTypeAdapter(FuncWrapper.class, new FuncWrapperDeserializer());

		try {
			Gson gson = builder.create();
			InputObject frontendObject = gson.fromJson(new FileReader(filePath), InputObject.class);

			System.out.println("Finished");
			System.out.println(frontendObject);
			
		} catch(Exception e) {
			throw new RuntimeException("Error in convertModelFromFile() method: \n " + e.getMessage());
		}

	}

}
