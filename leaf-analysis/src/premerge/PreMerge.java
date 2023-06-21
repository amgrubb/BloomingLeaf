package premerge;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
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
	public final static boolean DEBUG = false;

	public static void main(String[] args) {
		String inPath = "temp/";
		String tPath = "temp/";
		String inputFile1 = ""; 
		String inputFile2 = "";  
		String timingFile = "timing.json"; 
		Integer delta = 0;  // new start B
		
		try { 
			if (args.length == 4) {
				inputFile1 = args[0];
				inputFile2 = args[1];
				timingFile = args[2];
				delta = Integer.valueOf(args[3]);
			} else throw new IOException("Tool: Command Line Inputs Incorrect.");
	
			ModelSpec modelSpec1 = MMain.convertBackboneModelFromFile(inPath + inputFile1);
			ModelSpec modelSpec2 = MMain.convertBackboneModelFromFile(inPath + inputFile2);
	
			// pre-merge timing output
			detectIntentionMerge(modelSpec1, modelSpec2, delta, tPath + timingFile);
			
		// exception handling
		} catch (RuntimeException e) {
			try {
				if (DEBUG) System.err.println(e.getMessage());
				File file;
				file = new File(tPath + timingFile);
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
				file = new File(tPath + timingFile);
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


	public static void detectIntentionMerge(ModelSpec modelA, ModelSpec modelB, Integer delta, String timingFilePath) {
		
		startTimingFile(timingFilePath, delta, modelA.getMaxTime(), modelB.getMaxTime());
		// don't output timing if no overlap between A and B
		if (modelA.getMaxTime() <= delta) {
			endTimingFile(timingFilePath);
			return;
		}

		// compare every intention name in m1 to names in m2
		for(Intention intentionA: modelA.getIntentions()) {
			for(Intention intentionB: modelB.getIntentions()) {
				// if intention names match, intentions will merge
				if(isEqualToCleaned(intentionA.getName(),intentionB.getName())) {
					if (PreMerge.DEBUG) System.out.println("matched intentions: " + intentionA.getName());
					if (PreMerge.DEBUG) System.out.println(intentionA.getEvolvingFunctions().length);
					if (PreMerge.DEBUG) System.out.println(intentionB.getEvolvingFunctions().length);
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
					printTiming(intentionA, intentionB, delta, timingFilePath, modelA.getMaxTime(), modelB.getMaxTime());
				}

			}
		}
		endTimingFile(timingFilePath);
	}

	private static void printTiming(Intention intentionA, Intention intentionB, Integer delta, String timingFilePath, Integer modelAMaxTime, Integer modelBMaxTime) {
		Gson gson = new Gson(); 

		try {
			// set up printwriter in append mode
			File file;
			file = new File(timingFilePath);
			FileWriter fw = new FileWriter(file, true);
			BufferedWriter bw = new BufferedWriter(fw);
			PrintWriter printFile = new PrintWriter(bw);

			// first, print intention name
			printFile.printf("{%n\t\"intention\": \"%s\",%n", intentionA.getName().trim());

			Integer modelBNewMaxTime = modelBMaxTime + delta;
			boolean equalMax = modelAMaxTime == modelBNewMaxTime;
			// timing for intention A
			List<String> startTimesA = intentionA.getEvolvingFunctionStartTimes();
			printTimingIntention(startTimesA, "A", printFile, equalMax);

			// timing for intention B
			List<String> startTimesB = intentionB.getEvolvingFunctionStartTimesIncremented(delta);
			printTimingIntention(startTimesB, "B", printFile, equalMax);

			// Create new list of time points and list of unassigned time points.
			//HashMap<Integer, String> combinedTimes = new HashMap<>();
			HashMap<Integer, ArrayList<String>> combinedTimes = new HashMap<>();
			List<Integer> justTimes = new ArrayList();
			List<String> unassignedTimesPoints = new ArrayList();
			for(String item : startTimesA) {
				try {
					Integer numToAdd = Integer.parseUnsignedInt(item);
					if (!combinedTimes.containsKey(numToAdd)){
						ArrayList<String> values = new ArrayList<>();
						values.add("A-" + item);
			            combinedTimes.put(numToAdd, values);
//						combinedTimes.put(numToAdd, "A-"+item);
						justTimes.add(numToAdd);
					} else {
						ArrayList<String> values = combinedTimes.get(numToAdd);
			            values.add("A-" + item);
					}
				} catch (NumberFormatException nfe) {
					unassignedTimesPoints.add("A-"+item);
				}
			}
			
			for(String item : startTimesB) {
				try {
					Integer numToAdd = Integer.parseUnsignedInt(item);
					if (!combinedTimes.containsKey(numToAdd)){
						ArrayList<String> values = new ArrayList<>();
						values.add("B-" + item);
			            combinedTimes.put(numToAdd, values);
//					combinedTimes.put(numToAdd, "B-"+item);
			            justTimes.add(numToAdd);
					} else {
						ArrayList<String> values = combinedTimes.get(numToAdd);
			            values.add("B-" + item);
					}
				} catch (NumberFormatException nfe) {
					unassignedTimesPoints.add("B-"+item);
				}
			}
			Collections.sort(justTimes);
			String outString = "";
			boolean maxAFirst = (modelAMaxTime < modelBNewMaxTime);
			boolean maxAAdded = false;
			boolean maxBAdded = false;
			for (Integer numTime : justTimes) {	
				if ((maxAFirst && !maxAAdded && (numTime < modelAMaxTime)) ||
					(!maxAFirst && !maxBAdded && (numTime < modelBNewMaxTime))) {
					List<String> numTimeList = combinedTimes.get(numTime);
					if(numTimeList.size() == 1) {
						outString += "\"" + numTimeList.get(0) + "\", ";
					} else {
						for(int i = 0; i<numTimeList.size(); i++) {
							outString += "\"" + numTimeList.get(i) + "\", ";
						}
					}
					
				} else if ((maxAFirst && !maxAAdded && numTime > modelAMaxTime) ||
						 	(!maxAFirst && maxBAdded && !maxAAdded && numTime > modelAMaxTime))  {
					outString += "\"A-MaxTime\", ";
					maxAAdded = true;
					if (!maxBAdded && (numTime > modelBNewMaxTime)) {
						outString += "\"B-MaxTime\", ";
						maxBAdded = true;
					}
					outString += "\"" + combinedTimes.get(numTime) + "\", ";
				} else if ((!maxAFirst && !maxBAdded && (numTime > modelBNewMaxTime)) ||
							(maxAFirst && maxAAdded && !maxBAdded && (numTime > modelBNewMaxTime))) {
					outString += "\"B-MaxTime\", ";
					maxBAdded = true;
					if (!maxAAdded && (numTime > modelAMaxTime)) {
						outString += "\"A-MaxTime\", ";
						maxAAdded = true;
					}
					outString += "\"" + combinedTimes.get(numTime) + "\", ";
				} else
					outString += "\"" + combinedTimes.get(numTime) + "\", ";					
			}
			if (equalMax && !maxAAdded && !maxBAdded) {
				outString += "\"AB-MaxTime\", ";
				maxAAdded = true;
				maxBAdded = true;
			}
			if (maxAFirst && !maxAAdded) {
				outString += "\"A-MaxTime\", ";
				maxAAdded = true;
			}
			if (!maxBAdded) {
				outString += "\"B-MaxTime\", ";
				maxBAdded = true;
			}
			if (!maxAAdded) {
				outString += "\"A-MaxTime\", ";
				maxAAdded = true;
			}
			
			// Remove last ',' from string.
			outString = outString.substring(0, outString.length() - 2);
			
			// space for user to order the times
			printFile.printf("\t\"newTimeOrder\": [" + outString + "],%n");
			//printFile.printf("\t\"newTimeOrder\": [\"A-0\", ..., \"A-MaxTime\", ..., \"B-MaxTime\"],%n");
			
			printFile.printf("\t\"itemsToAdd\":  [");
			if (!unassignedTimesPoints.isEmpty()) {			
				String itemsOut = "";
				for (String uTP : unassignedTimesPoints) 
					itemsOut += "\"" + uTP + "\", ";
				itemsOut = itemsOut.substring(0, itemsOut.length() - 2);	
			
				printFile.printf(itemsOut);
			}
			printFile.printf("]%n");
			
			printFile.printf("},%n");

			printFile.close();
		} catch (Exception e) {
			throw new RuntimeException("Error in printTiming: " + e.getMessage());
		}
	}

	private static void printTimingIntention(List<String> startTimes, String modelChar, PrintWriter printFile, boolean equalMax) {
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
		if (equalMax)
			printFile.printf("\"AB-MaxTime\"],%n");
		else
			printFile.printf("\"%s-MaxTime\"],%n", modelChar);

	}

	private static void startTimingFile(String timingFilePath, Integer delta, Integer modelAMaxTime, Integer modelBMaxTime) {
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
			printFile.printf("{\"timingOffset\": \"%d\", %n", delta);
			printFile.printf("\"A-MaxTime\": \"%d\", %n", modelAMaxTime);
			printFile.printf("\"B-MaxTime\": \"%d\", %n", modelBMaxTime);
			printFile.printf("\"New-B-MaxTime\": \"%d\", %n", modelBMaxTime + delta);
			printFile.println("\"timingList\": [");

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
	
	/**
	 * 
	 * @param s1
	 * @param s2
	 * @return if the strings are equal when cleaned
	 */
	public static boolean isEqualToCleaned(String s1, String s2) {
		String cleanedS1 = s1.trim().replace("\n", "").replace(" ", "").toUpperCase();
		String cleanedS2 = s2.trim().replace("\n", "").replace(" ", "").toUpperCase();
		return cleanedS1.equals(cleanedS2);
	}

}
