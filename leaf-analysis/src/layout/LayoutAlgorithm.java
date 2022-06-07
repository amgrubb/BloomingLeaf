package layout;

import simulation.*;
import merge.*;

import java.util.*;
import static java.lang.Math.*;

public class LayoutAlgorithm {
	// models
	ModelSpec model;
    int maxIter;
    double constant;

	/**
	 * Initialize LayoutAlgorithm and run layoutModels
	 */

	public LayoutAlgorithm(ModelSpec model, String filename, int maxIter) {

		if (LMain.DEBUG) System.out.println("Starting: UCG Layout");
		// set up models
		this.model = model;

        // set up timeout
        this.maxIter = maxIter;
        
        // set up constant
        constant = .2 * Math.sqrt(6/(model.getActors().size() + model.getIntentions().size()));

		// run merge algorithm
		layoutModel();

        // TODO: some logging object init with filename
	}

    /**
     * Calculate the force attraction given by
     * the expression (d*d/Cn)
     * @return the force attraction between two elements
     */
    private double getAttraction(VisualInfo n1, VisualInfo n2) {
    	if (LMain.DEBUG) System.out.println("Starting: getAttraction");
// 		Attraction based on simplified spring force using area
//        if (n1 != n2) {
//            double distX = n1.getX() - n2.getX();
//            double distY = n1.getY() - n2.getY();
//            double dist = Math.sqrt(distX * distX + distY * distY);
//            //double k; // default coefficient, set a value to it
//            //ouble area; // set a value to it
//            //double coef = k * Math.sqrt(area/nodePosition.size()); // area?
//            double forceSum = dist * dist / constant;
//            return forceSum;
//        }
    	
    	//Spring force attraction
    	//TODO: figure out the values of these constants
    	if (n1 != n2) {
    		double idealLength = 20;
        	double elasticityConstant = 5; //increasing it means the spring is stiffer
        	
        	double dist = getDist(n1, n2);
        	double forceSum = (idealLength - dist)*(idealLength - dist)*dist/elasticityConstant;
        	return forceSum;
    	}
    
        return 0;
    }

    /**
     * Calculate the force repulsion given by
     * the expression (Cn*Cn/d)
     * @return the force repulsion between two elements
     */

    private double getRepulsion(VisualInfo n1, VisualInfo n2) {
    	if (LMain.DEBUG) System.out.println("Starting: getRepulsion");
        if (n1 != n2) {
            double distX = n1.getX() - n2.getX();
            double distY = n1.getY() - n2.getY();
            double dist = Math.sqrt(distX * distX + distY * distY);
            //double k; /// default coefficient, set a value to it
            //double area; // set a value to it
            //double coef = k * Math.sqrt(area/nodePosition.size()); // area?
            double forceSum = constant * constant / dist;
            return forceSum;
        }
        return 0;
    }
    
    /*
     * Calculate the angle between two nodes
     * 
     */
    public double angleBetween(VisualInfo n1, VisualInfo n2) {
    	if (LMain.DEBUG) System.out.println("Starting: angleBetween");
        if(n1 != n2){
            double distX = Math.abs(n1.getX() - n2.getX());
            double distY = Math.abs(n1.getY() - n2.getY());
            double theta = Math.atan(distY/distX);
            return theta;
        }
        return 0;
    }

    /*
        Main Layout method
     */ 
        
	public ModelSpec layoutModel(){
		if (LMain.DEBUG) System.out.println("Starting: layoutModel");
		
        VisualInfo[] nodePositions = initNodePositions();
        double c = .00000002; //constant for adjustment
        double a = .05; //constant for error
        
		for(int i = 0; i < maxIter; i++){
			if (LMain.DEBUG) System.out.println("\n" + i + "th Iteration");
			if (LMain.DEBUG) System.out.println(Arrays.toString(nodePositions));
            //sum up forces for the X and Y directions
            Double[] forceX = new Double[nodePositions.length];
            Arrays.fill(forceX, 0.0);
            Double[] forceY = new Double[nodePositions.length];
            Arrays.fill(forceY, 0.0);
            
            //fill out indicies of forceX and forceY
            for(int j = 0; j < nodePositions.length; j++){
            	if (LMain.DEBUG) System.out.println(j + "th Node\n");
            	if (LMain.DEBUG) System.out.println(Arrays.toString(forceX));
            	if (LMain.DEBUG) System.out.println(Arrays.toString(forceY));
            	
                for(int k = 0; k < nodePositions.length; k++){
                    if(j ==k) continue;
                    
                   //TODO: Force constants, sizes? How to know...
                    if (LMain.DEBUG) System.out.println("Starting: layoutModel Calculations");
                    double theta = angleBetween(nodePositions[j], nodePositions[k]);
                    double attraction = getAttraction(nodePositions[j], nodePositions[k]);
                    double repulsion = getRepulsion(nodePositions[j], nodePositions[k]);
                    if (LMain.DEBUG) System.out.println(theta);
                    if (LMain.DEBUG) System.out.println(attraction);
                    if (LMain.DEBUG) System.out.println(repulsion);
                    
                    if (LMain.DEBUG) System.out.println("Starting: layoutModel adding to sum");
                    forceX[j] += (attraction*Math.cos(theta) + repulsion*Math.cos(theta));
                    forceY[j] += (attraction*Math.sin(theta) + repulsion*Math.sin(theta));
                }
            }
            
            //adjust the positions
            if (LMain.DEBUG) System.out.println("Starting: layoutModel Adjustments");
            for(int j = 0; j < nodePositions.length; j++){
                nodePositions[j].setX(nodePositions[j].getX() + c*forceX[j]);
                nodePositions[j].setY(nodePositions[j].getY() + c*forceY[j]);
            }

            //calculate error
            //TODO: figure out a good stopping condition
            //if (LMain.DEBUG) System.out.println("Starting: layoutModel calculating error");
            //if (Math.abs(sum(forceX)) < a && Math.abs(sum(forceY)) < a) break;
        }
		
		if (LMain.DEBUG) System.out.println("Finished: layoutModel");
		return model;
	}

    /**
        Initialize the node position array
        Collect VisualInfo objects from modelSpec's Actors and Intentions
     */
    public VisualInfo[] initNodePositions(){
        VisualInfo[] nodePositions = new VisualInfo[model.getActors().size() + model.getIntentions().size()];
        int index = 0;

        //get Actor visual info
        for(Actor a: model.getActors()){
            nodePositions[index] = a.getVisualInfo();
            index++;
        }
        //get Intention visual info
        for(Intention i: model.getIntentions()){
            nodePositions[index] = i.getVisualInfo();
            index++;
        }

        return nodePositions;
    }

    /**
        Array Sum Helper
     */
     public double sum(Double[] arr){
         int sum = 0;
         for(Double i: arr){
             sum += i;
         }
         return sum;
     }

    
}

