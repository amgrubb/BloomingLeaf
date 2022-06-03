import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;

import gson_classes.IMain;

import merge.MMain;

import simulation.ModelSpec;
import simulation.BIModelSpecBuilder;
import simulation.Intention;
import simulation.ModelSpec;

public static void main(String[] args) {
    String inPath = "";
    String outPath = "";
    String tracePath = "";
    String inputFile = "input.json";
    String outputFile = "output.json";

    try {			
        if (args.length == 6) {
            String inPath = args[1];
            String outPath = args[2];
            String tracePath = args[3];
            String inputFile = args[4];
            String outputFile = args[5];
        } else throw new IOException("Tool: Command Line Inputs Incorrect.");
        
        if (DEBUG) System.out.println("AutoLayout for: " + inputFile);

        Gson gson = new Gson();
        
        // Creating the back-end model
        ModelSpec modelSpec = MMain.convertBackboneModelFromFile(inPath + inputFile);

        // print model for reference
        if (DEBUG) {
            System.out.println("M1:");
            IMain mIMain = IMainBuilder.buildIMain(modelSpec);
            System.out.println(gson.toJson(mIMain));
        } System.out.printf("Timing offset: %d%n", timings.getTimingOffset());

        // run auto-layout


        // Create output file that will be used by frontend
        IMain modelOut = IMainBuilder.buildIMain(modelSpec);
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