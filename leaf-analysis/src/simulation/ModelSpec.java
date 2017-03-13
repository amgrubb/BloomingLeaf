/**
 * 
 */
package simulation;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;


/**
 * @author A.M.Grubb
 *
 */
public class ModelSpec {
	
	private List<IntentionalElement> intElements = new ArrayList<IntentionalElement>();
	private List<Actor> actors = new ArrayList<Actor>();
	private List<EvolutionLink> evolutionLink = new ArrayList<EvolutionLink>(); 
	private List<Contribution> contribution = new ArrayList<Contribution>();
	private List<Decomposition> decomposition = new ArrayList<Decomposition>();
	private List<Dependency> dependency = new ArrayList<Dependency>();
	//private List<EvaluationStrategy> strategyCollection = new ArrayList<EvaluationStrategy>(); //Collection
	private List<EpochConstraint> constraintsBetweenEpochs = new ArrayList<EpochConstraint>();
	private int maxTime = 5;
	private int maxEpoch = 5;
	private int numActors = 0;
	private int numIntentions = 0;
	private String inputFilename = "";
    private int[][][] history;
    private int relativeTimePoints = 4;
    private int[] absoluteTimePoints = new int[] {5, 10, 15, 20};
    private boolean[][][] initialValues;		// Holds the initial values whether they are single or multiple.
    											//[this.numIntentions][this.numTimePoints][FD - index 0 / PD - index 1 / PS - index 2 / FS - index 3]
												// Note if model only has initial values then it will be [numintentions][1][4].
    private int[] initialValueTimePoints = new int[] {0};		// Hold the assigned times for each of the initial Values. Should be same length of second paramater of initialValues; 
    private HashMap<String, Integer> initialAssignedEpochs; //Hash map to hold the epochs with assigned values.
    private char conflictAvoidLevel = 'S'; 			// Should have the value S/M/W/N for Strong, Medium, Weak, None.
    
    private boolean[][][] finalValues = null;
    private int[] finalValueTimePoints = null;
    private HashMap<String, Integer> finalAssignedEpochs = null;
    private boolean solveAllSolutions = false;
    private boolean solveSingleState = false;
   
    public boolean isSolveAllSolutions() {
		return solveAllSolutions;
	}

	public void setSolveAllSolutions(boolean solveAllSolutions) {
		this.solveAllSolutions = solveAllSolutions;
	}

	public boolean isSolveSingleState() {
		return solveSingleState;
	}

	public void setSolveSingleState(boolean solveSingleState) {
		this.solveSingleState = solveSingleState;
	}

	public boolean[][][] getFinalValues() {
		return finalValues;
	}

	public int[] getFinalValueTimePoints() {
		return finalValueTimePoints;
	}

	public HashMap<String, Integer> getFinalAssignedEpochs() {
		return finalAssignedEpochs;
	}

	/*	Set Final Methods 
	*/
	public void setFinalValues(boolean[][][] finalValues) {
		this.finalValues = finalValues;
	}

	public void setFinalValueTimePoints(int[] finalValueTimePoints) {
		this.finalValueTimePoints = finalValueTimePoints;
	}

	public void setFinalAssignedEpochs(HashMap<String, Integer> finalAssignedEpochs) {
		this.finalAssignedEpochs = finalAssignedEpochs;
	}
    /*	END OF Set Final Methods 
	*/

	public int[] getInitialValueTimePoints() {
		return initialValueTimePoints;
	}

	public HashMap<String, Integer> getInitialAssignedEpochs() {
		return initialAssignedEpochs;
	}

	public void setInitialAssignedEpochs(HashMap<String, Integer> initialAssignedEpochs) {
		this.initialAssignedEpochs = initialAssignedEpochs;
	}

	public void setInitialValues(boolean[][][] initialValues) {
		this.initialValues = initialValues;
	}

	public void setInitialValueTimePoints(int[] initialValueTimePoints) {
		this.initialValueTimePoints = initialValueTimePoints;
	}

	public char getConflictAvoidLevel() {
		return conflictAvoidLevel;
	}

	public int getNumIntentions() {
		return numIntentions;
	}

	public boolean[][][] getInitialValues() {
		return initialValues;
	}

	public List<EvolutionLink> getEvolutionLink() {
		return evolutionLink;
	}

	public List<IntentionalElement> getIntElements() {
		return intElements;
	}
	
	public int getMaxTime() {
		return maxTime;
	}

	public int getMaxEpoch() {
		return maxEpoch;
	}

	public void setMaxTime(int maxTime) {
		this.maxTime = maxTime;
	}

	public void setMaxEpoch(int maxEpoch) {
		this.maxEpoch = maxEpoch;
	}

	public List<EpochConstraint> getConstraintsBetweenEpochs() {
		return constraintsBetweenEpochs;
	}

	public String getInputFilename() {
		return inputFilename;
	}

	public int getRelativeTimePoints() {
		return relativeTimePoints;
	}

	public int[] getAbsoluteTimePoints() {
		return absoluteTimePoints;
	}
	
//	public void addStrategyToCollection(EvaluationStrategy strategy) {
//		this.strategyCollection.add(strategy);
//	}	
//	
//	public List<EvaluationStrategy> getStrategyCollection() {
//		return strategyCollection;
//	}

	/**
	 * Initializes the model specification from a file.
	 */
	public ModelSpec(String fileName){
		inputFilename = fileName;
		//EvaluationStrategy strategyRead = new EvaluationStrategy(this);

		File file = new File(fileName);
		try {
			//use buffering, reading one line at a time
			//FileReader always assumes default encoding is OK!
			BufferedReader input =  new BufferedReader(new FileReader(file));
			try {        	
				String sNInt = null;
				sNInt = input.readLine();
				String[] simVals = sNInt.split("\\t");
				int simulationType = Integer.parseInt(simVals[0]);	//Not used yet.
				if (simVals.length > 1)
					maxTime = Integer.parseInt(simVals[1]);
				if (simVals.length > 2)
					maxEpoch = Integer.parseInt(simVals[2]);
				if (simVals.length > 3)
					relativeTimePoints = Integer.parseInt(simVals[3]);
				if (simVals.length > 4){
					absoluteTimePoints = new int[Integer.parseInt(simVals[4])];
					for (int z = 0; z < absoluteTimePoints.length; z++)
						absoluteTimePoints[z] = Integer.parseInt(simVals[5 + z]);					
				}
				
				sNInt = input.readLine();
				numActors = Integer.parseInt(sNInt);
				if (numActors > 0){
					//Case: Actor Element
					String line = null;
					for (int i = 0; i < numActors; i++){
						line = input.readLine();
						String[] result = line.split("\\t");
						if (!result[0].equals("A")){
							;//System.err.println("Actor not found: " + line);
						}else{
							String nodeID = result[1];
							String nodeName = result[2];
							String nodeType = result[3]; //Actor / Agent / Role
							actors.add(new Actor(nodeID, nodeName, nodeType));
						}
					}						
				}
				sNInt = input.readLine();
				numIntentions = Integer.parseInt(sNInt);
				initialValues = new boolean[numIntentions][1][4];
				String line = null; 
				// Reads both the intentions and the links.
				while (( line = input.readLine()) != null){
					String[] result = line.split("\\t");
					if (result[0].equals("I")){
						//Case: Intention Element
						String nodeActorID = result[1];
						String nodeID = result[2];
						//String nodeDynamicType = result[3];
						String nodeType = result[3];
						int initialValue = Integer.parseInt(result[4]);
						String nodeName = result[5];
						Actor nodeActor = null;
						if(!nodeActorID.equals("-"))
					        for(ListIterator<Actor> it = actors.listIterator(); it.hasNext(); ){
					        	Actor tmp = it.next();
					        	if(nodeActorID.equals(tmp.getId())){
					        		 nodeActor = tmp;
					        		 break;
					        	}	
					        } 
						IntentionalElement element = new IntentionalElement(nodeID, nodeName, nodeActor, nodeType);
						intElements.add(element);
						int numID = Integer.parseInt(nodeID);
						switch (initialValue) {
						case 0:	
							initialValues[numID][0] = new boolean[] {true, true, false, false};
							break;
						case 1:	
							initialValues[numID][0] = new boolean[] {false, true, false, false};
							break;
						case 2:	
							initialValues[numID][0] = new boolean[] {false, false, true, false};
							break;
						case 3:	
							initialValues[numID][0] = new boolean[] {false, false, true, true};
							break;
						default:
							initialValues[numID][0] = new boolean[] {false, false, false, false};
						}
										
						//strategyRead.addEvaluation(element, new Evaluation(element, QualitativeLabel.get(initialValue)));
						
						//Evaluation e = new Evaluation(element, QualitativeLabel.get(initialValue));
						//strategyRead.addEvaluation(element, e);
					}else if (result[0].equals("L")){
						//Case: Link Element
						String linkType = result[1];
						String linkSrcID = result[2];
						String linkDestID = result[3];
						LinkableElement src = null;
						LinkableElement dest = null;
				        for(ListIterator<IntentionalElement> it = intElements.listIterator(); it.hasNext(); ){
				        	IntentionalElement tmp = it.next();
				        	if(linkSrcID.equals(tmp.getId()))
				        		 src = tmp;
						    if(linkDestID.equals(tmp.getId()))
						         dest = tmp;				 
				        }
				        if ((src==null) || (dest==null)){		//Check Actor links TODO Test Actor Links.
					        for(ListIterator<Actor> it = actors.listIterator(); it.hasNext(); ){
					        	Actor tmp = it.next();
					        	if(linkSrcID.equals(tmp.getId()))
					        		 src = tmp;
							    if(linkDestID.equals(tmp.getId()))
							         dest = tmp;	
					        }
					    }
				        if ((src==null) || (dest==null)){
							System.err.println("Error Reading Links: Link is null.");
							break;
				        }
				        
				        if (result.length > 4) 	// Has evolving relationship.
				        	evolutionLink.add(new EvolutionLink(src, dest, linkType, result[4], maxEpoch));
				        else if (DecompositionType.getByCode(linkType) != null)
				        	decomposition.add(new Decomposition(src, dest, DecompositionType.getByCode(linkType)));
				        else if (ContributionType.getByCode(linkType) != null)
				        	contribution.add(new Contribution(src, dest, ContributionType.getByCode(linkType)));
				        else if (linkType.equals("DEP") || linkType.equalsIgnoreCase("DEPENDS"))
				        	dependency.add(new Dependency(dest, src));		//TODO: Figure out if these should be flipped.
//				        else if (linkType.equals("PRE"))
//				        	precondition.add(new Precondition(src, dest));
				        else if ((linkType.equals("PLAYS")) || (linkType.equals("IS-A")) || (linkType.equals("IS-PART-OF")))
				        	;//System.out.println("Note: " + linkType + " relationship between " + src.getName() + " and " + dest.getName() + " ignored.");
				        else
				        	System.err.println("Error: Link type unknown.");
					}else if (result[0].equals("D")){
						//Case: Dynamic Type Element
						String intentionID = result[1];
						String dynamicType = result[2];
				        for(ListIterator<IntentionalElement> it = intElements.listIterator(); it.hasNext(); ){
				        	IntentionalElement tmp = it.next();
				        	if(intentionID.equals(tmp.getId())){
				        		tmp.setDynamicType(IntentionalElementDynamicType.getByCode(dynamicType), maxEpoch);
				        		if (dynamicType.equals("UD"))
				        			tmp.setUserDefinedDynamicType(line, this.maxEpoch);				        			
				        		else if (result.length > 3){
									tmp.oldSetDynamicFunctionMarkedValue(Integer.parseInt(result[3]));
								}
				        	}
				        }						
					}else if (result[0].equals("C")){
						//Case: Constraint Between Intentions
						String constraintType = result[1];
						String constraintSrcID = result[2];
						String constraintSrcEB = result[3];
						if (constraintType.equals("A")){
							String absoluteValue = result[4];
							IntentionalElement src = null;
							for(ListIterator<IntentionalElement> it = intElements.listIterator(); it.hasNext(); ){
								IntentionalElement tmp = it.next();
								if(constraintSrcID.equals(tmp.getId()))
									src = tmp;
							}
							if (src==null){
								System.err.println("Error Reading Constraint: Intention is null.");
								break;
							}
							constraintsBetweenEpochs.add(new EpochConstraint(constraintType, src, constraintSrcEB, absoluteValue));
						}else{
							String constraintDestID = result[4];
							String constraintDestEB = result[5];
							IntentionalElement src = null;
							IntentionalElement dest = null;
							for(ListIterator<IntentionalElement> it = intElements.listIterator(); it.hasNext(); ){
								IntentionalElement tmp = it.next();
								if(constraintSrcID.equals(tmp.getId()))
									src = tmp;
								if(constraintDestID.equals(tmp.getId()))
									dest = tmp;				 
							}
							if ((src==null) || (dest==null)){
								System.err.println("Error Reading Constraint: Intention is null.");
								break;
							}
							constraintsBetweenEpochs.add(new EpochConstraint(constraintType, src, dest, constraintSrcEB, constraintDestEB));
						}
					}else if (result[0].equals("Q")){
						//C	<	0015	A	0008	A
						//Q	0007	A	=	0002	A
						String constraintSrcID = result[1];
						String constraintSrcEB = result[2];
						String constraintType = result[3];
						String constraintDestID = result[4];
						String constraintDestEB = result[5];
						IntentionalElement src = null;
						IntentionalElement dest = null;
				        for(ListIterator<IntentionalElement> it = intElements.listIterator(); it.hasNext(); ){
				        	IntentionalElement tmp = it.next();
				        	if(constraintSrcID.equals(tmp.getId()))
				        		 src = tmp;
						    if(constraintDestID.equals(tmp.getId()))
						         dest = tmp;				 
				        }
				        if ((src==null) || (dest==null)){
							System.err.println("Error Reading Query: Intention is null.");
							break;
				        }
				        constraintsBetweenEpochs.add(new EpochConstraint(constraintType, src, dest, constraintSrcEB, constraintDestEB));

					}else if (result[0].equals("H")){		
						// Read History from file.
						int numHistory = Integer.parseInt(result[1]);
						int numIntentions = Integer.parseInt(result[2]);
						int numTimePoints = Integer.parseInt(result[3]);
						history = new int[numHistory][numIntentions][numTimePoints];
						if (numTimePoints != (this.maxTime + 2))//strategy.getiStarSpec().getMaxTime())
							System.err.println("CSP History: has the wrong number of time points." + numTimePoints + " != " + this.maxTime); 
						for (int i = 0; i < numHistory; i ++)
							for (int j = 0; j < numIntentions; j++){
								line = input.readLine();
								result = line.split("\\t");
								if (result.length != numTimePoints)
									System.err.println("History: " + numHistory + " Line: " + numIntentions + " has the wrong number of time points."); 
								for (int k = 0; k < numTimePoints; k++)
									history[i][j][k] = Integer.parseInt(result[k]);
							}
						break;
					}else
						System.err.println("Error: neither node nor link.");
				}
			}
			finally {
				input.close();
			}
		}
		catch (IOException ex){
			ex.printStackTrace();
		} 
		//TODO: Figure out how to store the values.
		//this.addStrategyToCollection(strategyRead);
	}


//	@SuppressWarnings("unused")
//	private void printRootsAndLeaves() {
//		System.out.println("\nModels Roots are:");
//		for(ListIterator<IntentionalElement> it = intElements.listIterator(); it.hasNext(); ){
//			IntentionalElement tmp = it.next();
//			if (tmp.getLinksSrc().size() == 0)
//				System.out.println(tmp.getId() + "\t" + tmp.getName());
//		}
//		System.out.println("\nModels Leaves are:");
//		for(ListIterator<IntentionalElement> it = intElements.listIterator(); it.hasNext(); ){
//			IntentionalElement tmp = it.next();
//			if (tmp.getLinksDest().size() == 0)
//				System.out.println(tmp.getId() + "\t" + tmp.getName());
//		}
//		System.out.println();
//		
//	}
//	public void exportIStarModel(String fileName){
//		try {
//			File file = new File(fileName);//"/Users/Alicia/Dropbox/Eclipse-Workbench-Luna/Epoch-Simulator/model/test.txt");
//			// if file doesn't exists, then create it
//			if (!file.exists()) {
//				file.createNewFile();
//			}
//			FileWriter fw = new FileWriter(file.getAbsoluteFile());
//			BufferedWriter bw = new BufferedWriter(fw);
//
//			//Print Actors
//			bw.write(this.numActors + "\n"); 
//			for(ListIterator<Actor> it = this.actors.listIterator(); it.hasNext(); ){
//				Actor tmp = it.next();
//				bw.write("A" + "\t" + tmp.getId() + "\t" + tmp.getName() + "\t" + tmp.getActorType());
//				bw.newLine();
//			}
//
//			// Print Intentions
//			bw.write(this.numIntentions + "\n");
//			for(ListIterator<IntentionalElement> it = intElements.listIterator(); it.hasNext(); ){
//				IntentionalElement tmp = it.next();
//				if (tmp.getActor()==null)
//					bw.write("I" + "\t" + "-" + "\t" + tmp.getId() + "\t" + tmp.getDynamicType().getCode() + "\t" + tmp.getType().getCode() + "\t2\t" + tmp.getName());
//				else
//					bw.write("I" + "\t" + tmp.getActor().getId() + "\t" + tmp.getId() + "\t" + tmp.getDynamicType().getCode() + "\t" + tmp.getType().getCode() + "\t2\t" + tmp.getName());
//				bw.newLine();
//			}
//
//			// Print evolution links and deactivate them.
//			for(ListIterator<EvolutionLink> it = evolutionLink.listIterator(); it.hasNext(); ){
//				EvolutionLink eLink = it.next();
//				String link1 = "NA";
//				String link2 = "NA";
//				if (eLink.getPreLink() != null)
//					link1 = eLink.getPreLink().getType();
//				if (eLink.getPostLink() != null)
//					link2 = eLink.getPostLink().getType();
//				if (link1.equals("DEPENDS") || link2.equals("DEPENDS"))
//					bw.write("L" + "\t" + "-" + "\t" + link1 + "\t" + eLink.getDest().getId() + "\t" + eLink.getSrc().getId() + "\t" + link2);
//				else
//					bw.write("L" + "\t" + "-" + "\t" + link1 + "\t" + eLink.getSrc().getId() + "\t" + eLink.getDest().getId() + "\t" + link2);
//				bw.newLine();
//				eLink.deactivateLinks();
//			}
//			
//			// Print Intentions Links - TODO: Add links between actors.			
//			for(ListIterator<IntentionalElement> it = intElements.listIterator(); it.hasNext(); ){
//				IntentionalElement node = it.next();
//				List<ElementLink> links = node.getLinksSrc();
//				for(ListIterator<ElementLink> li = links.listIterator(); li.hasNext(); ){
//					ElementLink link = li.next();
//					if (link.isActiveLink()){
//						if (link.getType().equals("DEPENDS"))
//							bw.write("L" + "\t" + "-" + "\t" + link.getType() + "\t" + link.getDest().getId() + "\t" + link.getSrc().getId());
//						else
//							bw.write("L" + "\t" + "-" + "\t" + link.getType() + "\t" + link.getSrc().getId() + "\t" + link.getDest().getId());
//						bw.newLine();
//					}
//				}
//			}
//
//			bw.close();
//		} catch (IOException e) {
//			e.printStackTrace();
//		}    	
//    }
	
//	public void analyzeModel(){		
//		// Update Dynamic Links
//		for(ListIterator<EvolutionLink> it = evolutionLink.listIterator(); it.hasNext(); ){
//			EvolutionLink eLink = it.next();
//			eLink.activateCurrentLink(0);
//		}
//		//System.out.println("Strategy Size: " + this.strategyCollection.size());
//		switch (simulationType){
//		case 13: //Static Analysis using CSPAlgorithm with history.
//			EvaluationStrategy inputStrategy13 = this.strategyCollection.get(0);
//			CSPAlgorithm algo13 = new CSPAlgorithm(inputStrategy13, this.history);
//			if(algo13.findSolution()){
//				EvaluationStrategy[] newStrategies13 = algo13.populateSolution();
//				for (int i = 0; i < newStrategies13.length; i++)
//					this.addStrategyToCollection(newStrategies13[i]);							
//			}else{
//				System.exit(1);
//			}
//			break;
//		default:
//			System.err.println("Exception: Simulation Type " +  simulationType + " undefined.");
//		}
//
//	}
//	public void exportSimulationResults(String fileName){
//		try {
//			File file = new File(fileName);
//			if (!file.exists()) {		// if file doesn't exists, then create it
//				file.createNewFile();
//			}
//			FileWriter fw = new FileWriter(file.getAbsoluteFile());
//			BufferedWriter bw = new BufferedWriter(fw);
//
//			// Print Simulation Results
//			bw.write(this.numIntentions + "\n"); // if we don't previously print the intention number we need to print it here.			
//			bw.write(this.strategyCollection.size() + "\n");
//			IntentionalElement[] ordIntentions = new IntentionalElement[this.numIntentions];
//			for(ListIterator<IntentionalElement> it = intElements.listIterator(); it.hasNext(); ){
//				IntentionalElement tmp = it.next();
//				int id = Integer.parseInt(tmp.getId()); 
//				ordIntentions[id] = tmp;
//			}
//			for (int i = 0; i < ordIntentions.length; i++){
//				for(ListIterator<EvaluationStrategy> sIt = this.strategyCollection.listIterator(); sIt.hasNext(); ){
//					EvaluationStrategy str = sIt.next();
//					if (str.getEvaluation(ordIntentions[i]) != null)
//						bw.write(str.getEvaluation(ordIntentions[i]).getQualitativeEvaluation().getValue() + "\t"); 
//					else
//						bw.write("-" + "\t");
//				}
//				bw.newLine();
//			}
//			bw.close();
//		} catch (IOException e) {
//			e.printStackTrace();
//		}    	
//    }


	public static void main(String[] args) {
		try {
			String filename = "";
			ModelSpec model = null;
				if (args.length > 0) {
					filename = args[0];
					model = new ModelSpec(filename);
				} else
					throw new IOException("Tool: Command Line Inputs Incorrect."); 			
		} catch (Exception e) {
			try{
    			System.err.println("Unknown Exception: " + e.getMessage());
    			System.err.println("Stack trace: ");
    			e.printStackTrace(System.err);

    			Date d = new Date();
    			String formatted = new SimpleDateFormat ("yyyy-MM-dd:HH-mm-ss").format (d);
    			File file = new File("Simulation-Error"+formatted+".out");
    			if (!file.exists()) {
    				file.createNewFile();
    			}
    			PrintWriter pw = new PrintWriter(file);
    			pw.println(e.getMessage());
    			e.printStackTrace(pw);
    			pw.close();			
    			System.exit(1);
    		}  catch (Exception e1) {
    			System.err.println("Unknown Exception: " + e1.getMessage());
    			System.err.println("Stack trace: ");
    			e1.printStackTrace(System.err);
    		}

    	}

	}

}
