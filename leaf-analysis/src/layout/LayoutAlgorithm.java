import simulation.*;

import java.util.*;
import static java.lang.Math.max;

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

	public ModelSpec layoutModels(){
        //list nodePositions = model.actorlistPositions + model.intentionlistPositions

		//for i < maxIter:

            //sum up forces for the X and Y directions
            //list forceX = new int list[nodePositions.size()]
            //list forceY = new int list[nodePositions.size()]
            //for j < len nodePosition:
                //for k < len nodePosition:
                    //if j ==k: continue

                    //int theta = angleBetween(nodeposition[j], nodePosition[k])
                    //int attraction = getAttraction(nodeposition[j], nodePosition[k])
                    //int repulsion = getRepulsion(nodeposition[j], nodePosition[k])

                    //forceX[i] += attraction*cos(theta) + repulsion*cos(theta)
                    //forceY[i] += attraction*sin(theta) + repulsion*sin(theta)
            
            //Adjust the positions
            //for j < len nodePosition:
                //nodePosition[j].getX += .2forceX[j]
                //nodePosition[j].getY += .2forceY[j]

            //calculate error 
	}
}

