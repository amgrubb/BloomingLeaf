package layout;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;

import gson_classes.IMain;

import merge.IMainBuilder;
import merge.MMain;

import simulation.ModelSpec;
import simulation.BIModelSpecBuilder;

public class LMain {
	public final static boolean DEBUG = true;

	public static void main(String[] args) {
//	    String inPath = "temp/";
//	    String outPath = "temp/";
	    String inPath = "temp/";
	    String outPath = "temp/";
	    String tracePath = "";
<<<<<<< HEAD
	    String inputFile = "game before.json";
//	    String inputFile = "Bike-lanes-out.json";
=======
	    String inputFile = "only_lvl0.json";
>>>>>>> 20083ac592ee2c47ff8f1cf82e40bc9433b851f1
	    String outputFile = "output.json";
	
	    try {			
	        /*if (args.length == 6) {
	            //inPath = args[1];
	            //outPath = args[2];
	            //tracePath = args[1];
	            inputFile = args[1];
	            outputFile = args[2];
	        } else throw new IOException("Tool: Command Line Inputs Incorrect.");*/
	        
	        if (DEBUG) System.out.println("AutoLayout for: " + inputFile);
	
	        Gson gson = new Gson();
	        
	        // Creating the back-end model
	        ModelSpec modelSpec = MMain.convertBackboneModelFromFile(inPath + inputFile);
	
	        // print model for reference
	        if (DEBUG) {
	            System.out.println("M1:");
	            IMain mIMain = IMainBuilder.buildIMain(modelSpec);
	            System.out.println(gson.toJson(mIMain));
	        }
	
	        // run auto-layout
	        LayoutAlgorithm layerOuter = new LayoutAlgorithm(modelSpec, "trace.txt", 10000);
	        ModelSpec layedOutModel = layerOuter.layout();
	
	        // Create output file that will be used by frontend
	        IMain modelOut = IMainBuilder.buildIMain(layedOutModel);
	        if (DEBUG) System.out.println(gson.toJson(modelOut));
	
	        MMain.createOutputFile(modelOut, outPath + outputFile);
	        if (DEBUG) System.out.println("created output file");
	
	        // Traceability
	
	
	    } catch (RuntimeException e) {
	        try {
	            if (DEBUG) System.err.println(e.getMessage());
	            File file;
	            file = new File(outPath + outputFile);
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
	    } catch (Exception e) {
	        try {
	            if (DEBUG) System.err.println(e.getMessage());
	            File file;
	            file = new File(outPath + outputFile);
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
}