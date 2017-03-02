package simulation;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;

import com.google.gson.Gson;

/* SolveModelTest 
 * This class gets called from the backend and instantiates the model spec.
 * 
 */
public class SolveModelTest {

	public static void main(String[] args) {

		Gson gson = new Gson();
		String filePath = "/home/marcel/UofT/default.json";
		
		try {
			//Need to create the file and folder if doesn't exist
			String outputFile = "/home/marcel/UofT/output.out";
			FileWriter file = new FileWriter(outputFile);
			PrintWriter printFile = new PrintWriter(file);
			IStarSpec iStarSpec = gson.fromJson(new FileReader(filePath), IStarSpec.class);				
			printFile.printf(gson.toJson(iStarSpec));
			file.close();
			
		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		} 
	}

}
