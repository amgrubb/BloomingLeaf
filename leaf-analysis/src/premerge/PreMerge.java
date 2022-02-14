package premerge;

import java.io.File;
import java.io.FileWriter;
import java.io.BufferedWriter;
import java.io.PrintWriter;
import java.util.List;

import com.google.gson.Gson;

import merge.MMain;
import simulation.Intention;
import simulation.ModelSpec;

/***********
 * Precompute which intentions will merge and output their timing info to timing.json
 * When the user needs to input manually merged or renamed timelines for evolving functions
 ***********/

public class PreMerge {

	public static void main(String[] args) {
		String filePath = "temp/";
		String inputFile1 = "testModel1.json";
		String inputFile2 = "testModel2.json";
		String timingFile = "timings.json";
		Integer delta = 5;  // new start B

		ModelSpec modelSpec1 = MMain.convertBackboneModelFromFile(filePath + inputFile1);
		ModelSpec modelSpec2 = MMain.convertBackboneModelFromFile(filePath + inputFile2);

		// pre-merge timing output
		detectIntentionMerge(modelSpec1, modelSpec2, delta, filePath + timingFile);
	}


	public static void detectIntentionMerge(ModelSpec modelA, ModelSpec modelB, Integer delta, String timingFilePath) {
		startTimingFile(timingFilePath);
		// don't output timing if no overlap between A and B
		if (modelA.getMaxTime() <= delta) {
			endTimingFile(timingFilePath);
			return;
		}

		// compare every intention name in m1 to names in m2
		for(Intention intentionA: modelA.getIntentions()) {
			for(Intention intentionB: modelB.getIntentions()) {
				// if intention names match, intentions will merge

				if(intentionA.getName().equals(intentionB.getName())) {
					System.out.println("matched intentions: " + intentionA.getName());
					System.out.println(intentionA.getEvolvingFunctions().length);
					System.out.println(intentionB.getEvolvingFunctions().length);
					Integer evolFuncLenA = intentionA.getEvolvingFunctions().length;
					Integer evolFuncLenB = intentionB.getEvolvingFunctions().length;
					// don't output timing if 0 function segments in both intention
					if ((evolFuncLenA == 0) || (evolFuncLenB == 0)) {
						continue;
					}

					// don't output timing if A has 1 function segment and A ends after B
					// (B is entirely contained within A)
					if ((evolFuncLenA == 1) && (modelA.getMaxTime() >= modelB.getMaxTime() + delta)) {
						continue;
					}

					// don't output timing if B has 1 function segment and A ends before B
					// (A is entirely contained within B)
					if ((delta == 0) && (evolFuncLenB == 1) && (modelA.getMaxTime() <= modelB.getMaxTime() + delta)) {
						continue;
					}
					
					// don't output timing if both have 1 function segment in the merge
					if ((evolFuncLenA == 1) && (evolFuncLenB == 1)) {
						continue;
					}

					// otherwise, output timing info to timing file for user to resolve
					printTiming(intentionA, intentionB, delta, timingFilePath);
				}

			}
		}
		endTimingFile(timingFilePath);
	}

	private static void printTiming(Intention intentionA, Intention intentionB, Integer delta, String timingFilePath) {
		Gson gson = new Gson(); //new GsonBuilder().setPrettyPrinting().create();

		try {
			// set up printwriter in append mode
			File file;
			file = new File(timingFilePath);
			FileWriter fw = new FileWriter(file, true);
			BufferedWriter bw = new BufferedWriter(fw);
			PrintWriter printFile = new PrintWriter(bw);


			// first, print intention name
			printFile.printf("{%n\t\"intention\": \"%s\",%n", intentionA.getName());

			// TODO: only output if A or B has more than 1 evolving function
			// timing for intention A
			List<String> startTimesA = intentionA.getEvolvingFunctionStartTimes();
			printTimingIntention(startTimesA, "A", printFile);

			// timing for intention B
			List<String> startTimesB = intentionB.getEvolvingFunctionStartTimesIncremented(delta);
			printTimingIntention(startTimesB, "B", printFile);

			// space for user to order the times
			printFile.printf("\t\"newTimeOrder\": [\"A-0\", ..., \"A-MaxTime\", ..., \"B-MaxTime\"]%n");
			printFile.printf("},%n");

			printFile.close();
		} catch (Exception e) {
			throw new RuntimeException("Error in printTiming: " + e.getMessage());
		}
	}

	private static void printTimingIntention(List<String> startTimes, String modelChar, PrintWriter printFile) {
		// print current times separated by ", "
		printFile.printf("\t\"currentTimes%s\":  [", modelChar);
		for (String start: startTimes) {
			printFile.printf("\"%s\", ", start);
		}
		printFile.printf("\"MaxTime\"],%n");

		// print times again, starting with A- or B-
		printFile.printf("\t\"newTimes%s\": [", modelChar);
		for (String start: startTimes) {
			printFile.printf("\"%s-%s\", ", modelChar, start);
		}
		printFile.printf("\"%s-MaxTime\"],%n", modelChar);

	}

	private static void startTimingFile(String timingFilePath) {
		try {
			// create new file if doesn't already exist
			File file;
			file = new File(timingFilePath);
			if (!file.exists()) {
				file.createNewFile();
			}

			// set up printwriter NOT in append mode
			// (clears file from last output)
			PrintWriter printFile = new PrintWriter(file);
			printFile.println("{\"timingList\": [");

			printFile.close();
		} catch (Exception e) {
			throw new RuntimeException("Error in printTimingHeader: " + e.getMessage());
		}
	}

	private static void endTimingFile(String timingFilePath) {
		try {
			// set up printwriter in append mode
			File file;
			file = new File(timingFilePath);
			FileWriter fw = new FileWriter(file, true);
			BufferedWriter bw = new BufferedWriter(fw);
			PrintWriter printFile = new PrintWriter(bw);

			printFile.println("{}]}");  // extra timing object at end so last , doesn't create problems


			printFile.close();
		} catch (Exception e) {
			throw new RuntimeException("Error in printTimingHeader: " + e.getMessage());
		}
	}

}
