import simulation.*;
import merge.*;

import java.util.*;
import static java.lang.Math.*;

public class LayoutAlgorithm {
	// models
	ModelSpec model;
    int maxIter;

	/**
	 * Initialize LayoutAlgorithm and run layoutModels
	 */

	public MergeAlgorithm(ModelSpec model, String filename, int maxIter) {

		if (MMain.DEBUG) System.out.println("Starting: UCG Layout");
		// set up models
		this.model = model;

        // set up timeout
        this.maxIter = maxIter;

		// run merge algorithm
		layoutModel();

        // TODO: some logging object init with filename
	}

    /**
     * Calculate the force attraciton given by
     * the expression (d*d/Cn)
     * @return the force attraction between two elements
     */
    private double getAttraction(VisualInfo n1, VisualInfo n2) {
        if (n1 != n2) {
            double distX = n1.getX() - n2.getX();
            double distY = n1.getY() - n2.getY();
            double dist = Math.sqrt(distX * distX + distY * distY);
            double k; // default coefficient, set a value to it
            double area; // set a value to it
            double coef = k * Math.sqrt(area/nodePosition.size()); // area?
            double forceSum = dist * dist / coef;
        }
        return forceSum;
    }

    /**
     * Calculate the force repulsion given by
     * the expression (Cn*Cn/d)
     * @return the force repulsion between two elements
     */
    private double getRepulsion(VisualInfo n1, VisualInfo n2) {
        if (n1 != n2) {
            double distX = n1.getX() - n2.getX();
            double distY = n1.getY() - n2.getY();
            double dist = Math.sqrt(distX * distX + distY * distY);
            double k; /// default coefficient, set a value to it
            double area; // set a value to it
            double coef = k * Math.sqrt(area/nodePosition.size()); // area?
            double forceSum = coef * coef / dist;
        }
        return forceSum;
    }
    
    /*
     * Calculate the angle between two nodes
     * 
     */
    public double angleBetween(VisualInfo n1, VisualInfo n2) {
        if(n1 != n2){
            double distX = Math.abs(n1.getX() - n2.getX());
            double distY = Math.abs(n1.getY() - n2.getY());
            double theta = Math.atan(distY/distX);
        }
        return theta;
    }

    /*
        Main Layout method
     */ 
        
	public ModelSpec layoutModels(){
        VisualInfo[] nodePositions = initNodePositions();
        double c = .2; //constant for adjustment
        double a = .05; //constant for error
		for(int i = 0; i < maxIter; i++){
            //sum up forces for the X and Y directions
            Double[] forceX = new double[nodePositions.length];
            Double[] forceY = new double[nodePositions.length];
            for(int j = 0; j < nodePositions.length; j++){
                for(int k = 0; k < nodePositions.length; k++){
                    if j ==k: continue

                    double theta = angleBetween(nodePositions[j], nodePositions[k]);
                    double attraction = getAttraction(nodePositions[j], nodePositions[k]);
                    double repulsion = getRepulsion(nodePositions[j], nodePositions[k]);

                    forceX[j] += attraction*Math.cos(theta) + repulsion*Math.cos(theta);
                    forceY[j] += attraction*Math.sin(theta) + repulsion*Math.sin(theta);
                }
            }
            
            //adjust the positions
            for(int j = 0; j < nodePositions.length; j++){
                nodePosition[j].setX(nodePosition.getX() + c*forceX[j]);
                nodePosition[j].setY(nodePosition.getY() + c*forceY[j]);
            }

            //calculate error
            //TODO: figure out a good stopping condition
            if Math.abs(sum(forceX)) < a && Math.abs(sum(forceY)) < a: break;
        }

    /**
        Intialize the node position array
        Collect VisualInfo objects from modelSpec's Actors and Intentions
     */
    public VisualInfo[] initNodePositions(){
        VisualInfo[] nodePositions = new VisualInfo[ModelSpec.getActors().size() + ModelSpec.getIntentions().size()];
        int index = 0;

        //get Actor visual info
        for(Actor a: ModelSpec.getActors()){
            nodePositions[index] = a.getVisualInfo();
            index++;
        }
        //get Intention visual info
        for(Intention i: ModelSpec.getIntentions()){
            nodePositions[index] = i.getVisualInfo();
            index++;
        }

        return nodePositions;
    }

    /**
        Array Sum Helper
     */
     public int sum(Integer[] arr){
         int sum = 0;
         for(Integer i: arr){
             sum += i;
         }
         return sum;
     }

    
}

