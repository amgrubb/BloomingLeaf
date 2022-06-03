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

	public LayoutAlgorithm(ModelSpec model, String filename, int maxIter) {

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
        Main Layout method
     */
	public ModelSpec layoutModel(){
        VisualInfo[] nodePositions = initNodePositions();
        double c = .2; //constant for adjustment
        double a = .05; //constant for error

		for(int i = 0; i < maxIter; i++){
            //sum up forces for the X and Y directions
            Double[] forceX = new Double[nodePositions.length];
            Double[] forceY = new Double[nodePositions.length];
            for(int j = 0; j < nodePositions.length; j++){
                for(int k = 0; k < nodePositions.length; k++){
                    if(j ==k) continue;

                    int theta = angleBetween(nodePositions[j], nodePositions[k]);
                    int attraction = getAttraction(nodePositions[j], nodePositions[k]);
                    int repulsion = getRepulsion(nodePositions[j], nodePositions[k]);

                    forceX[j] += attraction*Math.cos(theta) + repulsion*Math.cos(theta);
                    forceY[j] += attraction*Math.sin(theta) + repulsion*Math.sin(theta);
                }
            }
            
            //adjust the positions
            for(int j = 0; j < nodePositions.length; j++){
                nodePositions[j].setX(nodePositions[j].getX() + c*forceX[j]);
                nodePositions[j].setY(nodePositions[j].getY() + c*forceY[j]);
            }

            //calculate error
            //TODO: figure out a good stopping condition
            if (Math.abs(sum(forceX)) < a && Math.abs(sum(forceY)) < a) break;
        }
            
	}
    /**
        Intialize the node position array
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

