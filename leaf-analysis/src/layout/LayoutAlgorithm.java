import simulation.*;

import java.util.*;
import static java.lang.Math.max;

public class LayoutAlgorithm {
	// models
	ModelSpec model;
    int maxIter = 20;

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
    private double[] getAttraction(Node<T> n1, Node<T> n2) {
        if (n1 != n2) {
            double distX = n1.getX() - n2.getX();
            double distY = n1.getY() - n2.getY();
            double dist = Math.sqrt(distX * distX + distY * distY);
            double k; /// default coefficient, set a value to it
            double coef = k * Math.sqrt(area/nodePositions.size()); // area?
            double forceSum = dist * dist / coef;
            //
            // double cos = distX / dist;
            // double sin = distY / dist;
            // double forceX = cos * forceSum;
            // double forceY = sin * forceSum;
            // if(n2.getX()<n1.getX()) forceX = -forceX;
            // if(n2.getY()<n1.getY()) forceY = -forceY;
            // double[] forces = new double[2];
            // forces[0] = forceX;
            // forces[1] = forceY;
        }
        return forceSum;
    }

    /**
     * Calculate the force repulsion given by
     * the expression (Cn*Cn/d)
     * @return the force repulsion between two elements
     */
    private double[] getRepulsion(Node<T> n1, Node<T> n2) {
        if (n1 != n2) {
            double distX = n1.getX() - n2.getX();
            double distY = n1.getY() - n2.getY();
            double dist = Math.sqrt(distX * distX + distY * distY);
            double k; /// default coefficient, set a value to it
            double coef = k * Math.sqrt(area/nodePositions.size()); // area?
            double forceSum = coef * coef / dist;
            //
            // double cos = distX / dist;
            // double sin = distY / dist;
            // double forceX = cos * forceSum;
            // double forceY = sin * forceSum;
            // if(n2.getX()<n1.getX()) forceX = -forceX;
            // if(n2.getY()<n1.getY()) forceY = -forceY;
            // double[] forces = new double[2];
            // forces[0] = forceX;
            // forces[1] = forceY;
        }
        return forceSum;
    }
    
    /*
     * Calculate the angle between two nodes
     * 
     */
    public double angleBetween(n1,n2) {
        if(n1 != n2){
            double distX = Math.abs(n1.getX() - n2.getX());
            double distY = Math.abs(n1.getY() - n2.getY());
            double theta = Math.atan(distY/distX);
        }
        return theta;
    }

    public ModelSpec layoutModels(){
        //list nodePositions = model.actorlistPositions + model.intentionlistPositions
        List<T> nodePositions = new ArrayList<T>(actorList);
        nodePositions.addAll(intentionList); //what's the type of the list
        for(int i = 0; i < maxIter; i ++){
            
        }
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

