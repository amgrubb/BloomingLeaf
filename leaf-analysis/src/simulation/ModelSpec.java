/**
 * 
 */
package simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import interface_objects.IOIntention;
import interface_objects.IOStateModel;
import interface_objects.OutputElement;
import interface_objects.OutputModel;


/**
 * @author A.M.Grubb
 *
 */
public class ModelSpec {
	
	private List<IntentionalElement> intElements = new ArrayList<IntentionalElement>();
	private List<Actor> actors = new ArrayList<Actor>();
	private List<NotBothLink> notBothLink = new ArrayList<NotBothLink>();
	private List<Contribution> contribution = new ArrayList<Contribution>();
	private List<Decomposition> decomposition = new ArrayList<Decomposition>();
	private List<EvolvingContribution> evolvingContribution = new ArrayList<EvolvingContribution>();
	private List<EvolvingDecomposition> evolvingDecomposition = new ArrayList<EvolvingDecomposition>();
	private List<EpochConstraint> constraintsBetweenEpochs = new ArrayList<EpochConstraint>();
	private int maxTime = 5;
	private int numActors = 0;
	private int numIntentions = 0;
	private String inputFilename = "";
    private int[][][] history;
    private int relativeTimePoints = 0;
    private int[] absoluteTimePoints = null;
    private boolean[][][] initialValues;	// Holds the initial values whether they are single or multiple.
    											//[this.numIntentions][this.numTimePoints][FD - index 0 / PD - index 1 / PS - index 2 / FS - index 3]
												// Note if model only has initial values then it will be [numintentions][1][4].
    private int[] initialValueTimePoints = new int[] {0};		// Hold the assigned times for each of the initial Values. Should be same length of second paramater of initialValues; 
    private HashMap<String, Integer> initialAssignedEpochs; //Hash map to hold the epochs with assigned values.
    private char conflictAvoidLevel = 'N'; 			// Should have the value S/M/W/N for Strong, Medium, Weak, None.
    
    private boolean[][][] finalValues = null;
    private int[] finalValueTimePoints = null;
    private HashMap<String, Integer> finalAssignedEpochs = null;
    private boolean solveSinglePath = false;
    private boolean solveNextState = false;
	private boolean[][][][] allSolutionsValues;

	public void setSolveSinglePath(boolean solveSinglePath) {
		this.solveSinglePath = solveSinglePath;
	}

	public void setSolveNextState(boolean solveNextState) {
		this.solveNextState = solveNextState;
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

	public List<IntentionalElement> getIntElements() {
		return intElements;
	}
	
	public int getMaxTime() {
		return maxTime;
	}

	public void setMaxTime(int maxTime) {
		this.maxTime = maxTime;
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
		
	public List<Actor> getActors() {
		return actors;
	}

	public void setActors(List<Actor> actors) {
		this.actors = actors;
	}

	public List<Contribution> getContribution() {
		return contribution;
	}

	public void setContribution(List<Contribution> contribution) {
		this.contribution = contribution;
	}

	public List<Decomposition> getDecomposition() {
		return decomposition;
	}

	public void setDecomposition(List<Decomposition> decomposition) {
		this.decomposition = decomposition;
	}

	public int getNumActors() {
		return numActors;
	}

	public void setNumActors(int numActors) {
		this.numActors = numActors;
	}

	public int[][][] getHistory() {
		return history;
	}

	public void setHistory(int[][][] history) {
		this.history = history;
	}

	public void setIntElements(List<IntentionalElement> intElements) {
		this.intElements = intElements;
	}

	public void setConstraintsBetweenEpochs(List<EpochConstraint> constraintsBetweenEpochs) {
		this.constraintsBetweenEpochs = constraintsBetweenEpochs;
	}

	public void setNumIntentions(int numIntentions) {
		this.numIntentions = numIntentions;
	}

	public void setInputFilename(String inputFilename) {
		this.inputFilename = inputFilename;
	}

	public void setRelativeTimePoints(int relativeTimePoints) {
		this.relativeTimePoints = relativeTimePoints;
	}

	public void setAbsoluteTimePoints(int[] absoluteTimePoints) {
		this.absoluteTimePoints = absoluteTimePoints;
	}

	public void setConflictAvoidLevel(char conflictAvoidLevel) {
		this.conflictAvoidLevel = conflictAvoidLevel;
	}

	public ModelSpec(){
		
	}

	public ModelSpec(String filename) {
	}

	public boolean[][][][] getAllSolutionsValues() {
		return allSolutionsValues;
	}

	public void setAllSolutionsValues(boolean[][][][] allSolutionsValues) {
		this.allSolutionsValues = allSolutionsValues;
	}

	public void setFinalAllSolutionsValues(boolean[][][][] finalValues2) {
		this.allSolutionsValues = finalValues2;
	}

	public boolean isSolveNextState() {
	    return this.solveNextState;
	}

	public boolean isSolveSingleSolutions() {
	    return this.solveSinglePath;
	}

	public OutputModel getOutputModel() {
		OutputModel output = new OutputModel();
		   	
    	// Print out Single Path Solotions.
		if(getFinalValues() != null){
	    	int i = -1;
	    	for (IntentionalElement element : getIntElements()){
	    		i++;
	    		OutputElement outputElement = new OutputElement();
	    		
	    		outputElement.setId(element.getId());
	    		for (int t = 0; t < getFinalValues()[i].length; t++){
	    			StringBuilder value = new StringBuilder();
	    			for (int v = 0; v < getFinalValues()[i][t].length; v++){
	        			if(getFinalValues()[i][t][v]){
	        				value.append("1");
	        			}else{
	        				value.append("0");
	        			}
	        		}
	        			outputElement.getStatus().add(value.toString());
	    		}
	    		output.getElementList().add(outputElement);
	    	} 			
		}

		//Print out All Next States
		if(getAllSolutionsValues() != null){
			for(int i_states = 0; i_states < getAllSolutionsValues().length; i_states++){
				IOStateModel statesModel = new IOStateModel();
				for(int i_elements = 0; i_elements < getAllSolutionsValues()[i_states].length; i_elements++){
					IOIntention ioIntention = new IOIntention();
					String[] values = new String[getAllSolutionsValues()[i_states][i_elements].length];
					for(int i_steps = 0; i_steps < getAllSolutionsValues()[i_states][i_elements].length; i_steps++){
						StringBuilder value = new StringBuilder();
						for (int v = 0; v < getAllSolutionsValues()[i_states][i_elements][i_steps].length; v++){
		        			if(getAllSolutionsValues()[i_states][i_elements][i_steps][v]){
		        				value.append("1");
		        			}else{
		        				value.append("0");
		        			}
		        		}
						values[i_steps] = value.toString();						
					}
					ioIntention.setId(Integer.toString(i_elements));
        			ioIntention.setStatus(values);
    				statesModel.getIntentionElements().add(ioIntention);
				}
				output.getAllSolution().add(statesModel);
			}
		}
		
    	
   		//Get final assigned epoch
		if(getFinalAssignedEpochs() != null){
			for (Map.Entry<String,Integer> entry : getFinalAssignedEpochs().entrySet()) {
				String key = entry.getKey();
				Integer value = entry.getValue();
				output.getFinalAssignedEpoch().add(key+"_"+value);
			}
		}

		if(getFinalValueTimePoints() != null){
			for(int a = 0; a < getFinalValueTimePoints().length; a++){
				output.getFinalValueTimePoints().add(Integer.toString(getFinalValueTimePoints()[a]));	   			
			}	
		}
		
		output.setRelativeTimePoints(getRelativeTimePoints());
		output.setAbsoluteTimePoints(getAbsoluteTimePoints());

		return output;

	}

	public List<NotBothLink> getNotBothLink() {
		return notBothLink;
	}

	public void setNotBothLink(List<NotBothLink> notBothLink) {
		this.notBothLink = notBothLink;
	}

	public List<EvolvingContribution> getEvolvingContribution() {
		return evolvingContribution;
	}

	public void setEvolvingContribution(List<EvolvingContribution> evolvingContribution) {
		this.evolvingContribution = evolvingContribution;
	}

	public List<EvolvingDecomposition> getEvolvingDecomposition() {
		return evolvingDecomposition;
	}

	public void setEvolvingDecomposition(List<EvolvingDecomposition> evolvingDecomposition) {
		this.evolvingDecomposition = evolvingDecomposition;
	}
	
	
}
