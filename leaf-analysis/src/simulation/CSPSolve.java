package simulation;

import java.util.ArrayList;
import java.util.List;

import org.jacop.constraints.Constraint;
import org.jacop.core.IntVar;
import org.jacop.core.Store;
import org.jacop.core.Var;
import org.jacop.search.DepthFirstSearch;
import org.jacop.search.IndomainSimpleRandom;
import org.jacop.search.MostConstrainedDynamic;
import org.jacop.search.Search;
import org.jacop.search.SelectChoicePoint;
import org.jacop.search.SimpleSelect;
import org.jacop.search.SimpleTimeOut;

public class CSPSolve {

	public static Search<IntVar> findSolution(Store store, IntVar[] varList, boolean searchAll){
		Search<IntVar> label = new DepthFirstSearch<IntVar>();
		label.getSolutionListener().recordSolutions(true);	// Record steps in search.
        label.setPrintInfo(false); 							// Set to false if you don't want the CSP to print the solution as you go.
        
        // Sets the timeout for colony to ensure long processes do not kill the server.
        SimpleTimeOut timeOutList = new SimpleTimeOut();
        label.setTimeOutListener(timeOutList);
        int timeOutValueInSeconds = 120;
        label.setTimeOut(timeOutValueInSeconds);
		
        // Create selection and find solution.
        SelectChoicePoint <IntVar> select = new SimpleSelect<IntVar>(varList, new MostConstrainedDynamic<IntVar>(), new IndomainSimpleRandom<IntVar>());//new MostConstrainedStatic<IntVar>(), new IndomainSimpleRandom<IntVar>()); 
        //label.setSolutionListener(new PrintOutListener<IntVar>());         
        label.getSolutionListener().searchAll(searchAll);  
        if(Main.DEBUG)	System.out.println("\nRunning Solver\n");
        boolean solutionFound = label.labeling(store, select);
        
        if (timeOutList.timeOutOccurred)
        	throw new RuntimeException("The solver timed out; thus, no solution was found. Current timeout is " + timeOutValueInSeconds + " seconds.");
        
        // Return Solution
        if(!solutionFound){
        	if (Main.DEBUG) System.out.println("Found Solution = False");
        	throw new RuntimeException("There is no solution to this model. The solver may have reached a timeout.");
		} else {
	    	if (Main.DEBUG) System.out.println("Found Solution = True");
	    	return label;
		}
	}
	
	public static void addConstraints(Store store, List<Constraint> constraints) {
        // Test and Add Constraints
        if(Main.DEBUG)	
        	System.out.println("Constraints List:");
        for (int i = 0; i < constraints.size(); i++) {
            if(Main.DEBUG)	System.out.println(constraints.get(i).toString());
            store.impose(constraints.get(i));
            if(!store.consistency()) {
            	Constraint errorConst = constraints.get(i);
            	ArrayList<Var> errorVarList = errorConst.arguments();
            	if(Main.DEBUG){
            		for (Var temp : errorVarList) {
            			System.out.println(temp.id + "::" + temp.dom().toString());
            		}
            		System.out.println("Constraint: " + constraints.get(i).toString());
            		System.out.println("have conflicting constraints, not solvable");
            	}
            	throw new RuntimeException("ERROR: Model not solvable because of conflicting constraints.\n Constraint: " + constraints.get(i).toString());
            }
        }
	}
}
