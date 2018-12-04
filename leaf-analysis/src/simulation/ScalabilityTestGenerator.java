package simulation;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Random;

public class ScalabilityTestGenerator {
	//Generates a tree structure, for the BloomingLeaf tool.
	public static void main(String[] args) {
		try {
			int[] modelSize = new int[]{25,51,75,101,125,151,175,201};

			for (int a = 0; a < modelSize.length; a++){
				int numIntentions = modelSize[a];
				// Determine Evolving Functions for Intentions
				String func[] = new String[numIntentions];				
				String funcSegList[] = new String[numIntentions];
				String initVal[] = new String[numIntentions];
				for (int i = 0; i < numIntentions; i ++){
					//if (i%15==4){
					if (i>numIntentions*2/3){
						Random random = new Random();
						int newRandom = random.nextInt(9);
						switch (newRandom){ 
						case 0: 
							func[i] = "C";
							funcSegList[i] = "{\"funcType\":\"C\",\"funcX\":\"0011\",\"funcStart\":\"0\",\"funcStop\":\"Infinity\"}";		
							initVal[i] = "0011";
						break;
						case 1: 
							func[i] = "C";
							funcSegList[i] = "{\"funcType\":\"C\",\"funcX\":\"1100\",\"funcStart\":\"0\",\"funcStop\":\"Infinity\"}";		
							initVal[i] = "1100";
						break;
//						case 2: 
//							func[i] = "I";
//							funcSegList[i] = "{\"funcType\":\"I\",\"funcX\":\"0011\",\"funcStart\":\"0\",\"funcStop\":\"Infinity\"}";		
//							initVal[i] = "1100";
//						break;
//						case 3: 
//							func[i] = "D";
//							funcSegList[i] = "{\"funcType\":\"D\",\"funcX\":\"1100\",\"funcStart\":\"0\",\"funcStop\":\"Infinity\"}";		
//							initVal[i] = "0011";
//						break;
						case 4: 
							func[i] = "SD";
							funcSegList[i] = "{\"funcType\":\"C\",\"funcX\":\"0011\",\"funcStart\":\"0\",\"funcStop\":\"A\"},{\"funcType\":\"C\",\"funcX\":\"1100\",\"funcStart\":\"A\",\"funcStop\":\"Infinity\"}";		
							initVal[i] = "0011";
						break;
						case 5: 
							func[i] = "DS";
							funcSegList[i] = "{\"funcType\":\"C\",\"funcX\":\"1100\",\"funcStart\":\"0\",\"funcStop\":\"A\"},{\"funcType\":\"C\",\"funcX\":\"0011\",\"funcStart\":\"A\",\"funcStop\":\"Infinity\"}";		
							initVal[i] = "1100";
						break;
						case 6: 
							func[i] = "RC";
							funcSegList[i] = "{\"funcType\":\"R\",\"funcX\":\"0000\",\"funcStart\":\"0\",\"funcStop\":\"A\"},{\"funcType\":\"C\",\"funcX\":\"0011\",\"funcStart\":\"A\",\"funcStop\":\"Infinity\"}";		
							initVal[i] = "0000";
						break;
						case 7: 
							func[i] = "CR";
							funcSegList[i] = "{\"funcType\":\"C\",\"funcX\":\"0011\",\"funcStart\":\"0\",\"funcStop\":\"A\"},{\"funcType\":\"R\",\"funcX\":\"0000\",\"funcStart\":\"A\",\"funcStop\":\"Infinity\"}";		
							initVal[i] = "0011";
						break;
//						case 8: 
//							func[i] = "MP";
//							funcSegList[i] = "{\"funcType\":\"I\",\"funcX\":\"0011\",\"funcStart\":\"0\",\"funcStop\":\"A\"},{\"funcType\":\"C\",\"funcX\":\"0011\",\"funcStart\":\"A\",\"funcStop\":\"Infinity\"}";		
//							initVal[i] = "1100";
//						break;
//						case 9: 
//							func[i] = "MN";
//							funcSegList[i] = "{\"funcType\":\"D\",\"funcX\":\"1100\",\"funcStart\":\"0\",\"funcStop\":\"A\"},{\"funcType\":\"C\",\"funcX\":\"1100\",\"funcStart\":\"A\",\"funcStop\":\"Infinity\"}";		
//							initVal[i] = "0011";
//						break;
						default: 
							func[i] = "R";
							funcSegList[i] = "{\"funcType\":\"R\",\"funcX\":\"0000\",\"funcStart\":\"0\",\"funcStop\":\"Infinity\"}";		
							initVal[i] = "1100";
						}
					}else{	// Default No Time Nodes
						func[i] = "NT";
						funcSegList[i] = "";		
						initVal[i] = "(no value)";
					}

				}

				
				// Create Files
				String fileName = "REJ-ORTree-" + modelSize[a] + ".json";
				System.out.print("\"" + fileName + "\",");
				File file = new File("scalability-tests/" + fileName);
				if (!file.exists()) {		// if file doesn't exists, then create it
					file.createNewFile();
				}
				FileWriter fw = new FileWriter(file.getAbsoluteFile());
				BufferedWriter bw = new BufferedWriter(fw);
				
				//Add analysisRequest
				bw.write("{\"analysisRequest\":{\"action\":\"singlePath\",\"conflictLevel\":\"N\",");
				bw.write("\"numRelTime\":\"" + 1 + "\",");	//Number relative time points.
				bw.write("\"absTimePts\":\"\",\"absTimePtsArr\":[],\"currentState\":\"0|0\",\"userAssignmentsList\":[\n");
				for (int i = 0; i < numIntentions; i ++){
					String id = "0000".substring((""+i).length()) + i;
					bw.write("{\"intentionID\":\"" + id + "\",\"absTime\":\"0\",\"evaluationValue\":\"" + initVal[i] + "\"}");
					if(i < numIntentions-1)
						bw.write(",");
					bw.write("\n");
				}				
				bw.write(" ],\"previousAnalysis\":null},");
				
				//Add Model
				bw.write("\n");
				bw.write("\"model\":{\"actors\":[],\"intentions\":[");
				bw.write("\n");
				//Add Intentions		
				for (int i = 0; i < numIntentions; i ++){
					String id = "0000".substring((""+i).length()) + i;
					bw.write("{\"nodeActorID\":\"-\",\"nodeID\":\"" 
							+ id + "\",\"nodeType\":\"basic.Goal\",\"nodeName\":\"Int" 
							+ id + "\",\"dynamicFunction\":{\"intentionID\":\"" 
							+ id + "\",\"stringDynVis\":\"" + func[i] + "\",\"functionSegList\":["
							+ funcSegList[i] + "]}}");
					if(i < numIntentions-1)
						bw.write(",");
					bw.write("\n");
				}
				
				//Adding Links.
				bw.write("],\"links\":[");
				bw.write("\n");
				int row = 1;
				int d = 0;	
				int count = 0;
				for (int l = 1; l < numIntentions; l = l + 2){
					int s1 = l;
					int s2 = l+1;
					String ids1 = "0000".substring((""+s1).length()) + s1;
					String ids2 = "0000".substring((""+s2).length()) + s2;
					String idd = "0000".substring((""+d).length()) + d;
					String lid1 = "0000".substring((""+count).length()) + count; count ++;
					String lid2 = "0000".substring((""+count).length()) + count; count ++;
					bw.write("{\"linkID\":\""+ lid1 + "\",\"linkType\":\"OR\",\"postType\":null,\""
							+ "linkSrcID\":\""+ ids1 + "\",\"linkDestID\":\""+ idd + "\",\"absoluteValue\":-1},");
					bw.write("\n");
					bw.write("{\"linkID\":\""+ lid2 + "\",\"linkType\":\"OR\",\"postType\":null,\""
							+ "linkSrcID\":\""+ ids2 + "\",\"linkDestID\":\""+ idd + "\",\"absoluteValue\":-1}");
					if(l < numIntentions-2)
						bw.write(",");
					bw.write("\n");					
					if (s2 == Math.pow(2, row)){
						d = s2 - (int)(Math.pow(2, row - 1));
						row ++;
					}else{
						d ++;
					}
				}		

				//Finishing the File.
				bw.write("],\"constraints\":[],\"maxAbsTime\":\"5000\"}}");
				bw.close();
			}
		} catch (IOException e) {
			e.printStackTrace();
		}    	

	}

}

























