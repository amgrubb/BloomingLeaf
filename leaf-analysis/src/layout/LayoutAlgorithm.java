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
    double smallDistConstant;
    double largeDistConstant;

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
        
        smallDistConstant = .0000000002;
        largeDistConstant = 200000;

        // TODO: some logging object init with filename
	}

    /**
     * Calculate the distance between two elements
     * @param x
     * @param y
     * @return distance
     */
    private double getDist(VisualInfo n1, VisualInfo n2){
        double distX = n1.getX() - n2.getX();
        double distY = n1.getY() - n2.getY();
        double dist = Math.sqrt(distX * distX + distY * distY);
        return dist;
    }

    /**
     * Calculate the force attraction given by
     * the expression (d*d/Cn)
     * @return the force attraction between two elements
     */
    private double getAttraction(VisualInfo n1, VisualInfo n2) {
    	//if (LMain.DEBUG) System.out.println("Starting: getAttraction");
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
        	double elasticityConstant = 5000; //increasing it means the spring is stiffer
        	
        	double dist = getDist(n1, n2);
        	if (dist > 100) {
        		elasticityConstant = largeDistConstant;
        	}
        	//if (LMain.DEBUG) System.out.println(dist);
        	double forceSum = (idealLength - dist)*(idealLength - dist) * dist/elasticityConstant; //cubing distance too big, but this is the wrong formula
        	if (LMain.DEBUG) System.out.println("Attraction " + forceSum);
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
    	//if (LMain.DEBUG) System.out.println("Starting: getRepulsion");
        if (n1 != n2) {
            double dist = getDist(n1,n2);
            if(dist == 0) return 99;
            //double k; /// default coefficient, set a value to it
            //double area; // set a value to it
            //double coef = k * Math.sqrt(area/nodePosition.size()); // area?
            double alpha = 2;
            if (dist < 50) {
                alpha = smallDistConstant;
            }
            //double alpha = 20000; // repulsion constant
            double forceSum = alpha / (dist * dist) * dist; 
            //double forceSum = constant * constant / dist;
            return forceSum;

        }
        return 0;
    }
    
    /*
     * Calculate the angle between two nodes
     * 
     */
    public double angleBetween(VisualInfo n1, VisualInfo n2) {
    	//if (LMain.DEBUG) System.out.println("Starting: angleBetween");
        if(n1 != n2){
            double distX = Math.abs(n1.getX() - n2.getX());
            double distY = Math.abs(n1.getY() - n2.getY());
            double theta = Math.atan(distY/distX);
            if(Double.isNaN(theta)) return Math.random();
            return theta;
        }
        return 0;
    }
    
    /**
     * Find the upper left node
     */
    public VisualInfo findUpperLeftNode(VisualInfo[] nodePositions) {
    	VisualInfo mostUpperLeft = null;
    	for(VisualInfo nodePosition: nodePositions) {
    		if(mostUpperLeft == null) {
    			mostUpperLeft = nodePosition;
    		} else {
    			double diffX = mostUpperLeft.getX() - nodePosition.getX();
    			double diffY = nodePosition.getY() - mostUpperLeft.getY();
    			if(diffX + diffY > 0) {
    				mostUpperLeft = nodePosition;
    			}
    		}
    	}
    	return mostUpperLeft;
    }
    
    
    /**
     * Find the upper right node
     */
    public VisualInfo findUpperRightNode(VisualInfo[] nodePositions) {
    	VisualInfo mostUpperRight = null;
    	for(VisualInfo nodePosition: nodePositions) {
    		if(mostUpperRight == null) {
    			mostUpperRight = nodePosition;               
    		} else {
                double diffX = nodePosition.getX() - mostUpperRight.getX();
                double diffY = nodePosition.getY() - mostUpperRight.getY();
                if(diffX + diffY > 0) {
                    mostUpperRight = nodePosition;
                }
                // if(nodePosition.getX() > mostUpperRight.getX() && nodePosition.getY() > mostUpperRight.getY()){
                //     mostUpperRight.setX(nodePosition.getX());
                //     mostUpperRight.setY(nodePosition.getY());
                // }
    		}
    	}
    	return mostUpperRight;
    }

    /**
     * Find the bottom left node
     */
    public VisualInfo findBottomLeftNode(VisualInfo[] nodePositions) {
    	VisualInfo mostBottomLeft = null;
    	for(VisualInfo nodePosition: nodePositions) {
    		if(mostBottomLeft == null) {
    			mostBottomLeft = nodePosition;               
    		} else {
                // if(nodePosition.getX() < mostBottomLeft.getX() && nodePosition.getY() < mostBottomLeft.getY()){
                //     mostBottomLeft.setX(nodePosition.getX());
                //     mostBottomLeft.setY(nodePosition.getY());
                // }
                double diffX = mostBottomLeft.getX() - nodePosition.getX();
                double diffY = mostBottomLeft.getY() - nodePosition.getY();
    			if(diffX + diffY > 0) {
    				mostBottomLeft = nodePosition;
    			}
    		}
    	}
    	return mostBottomLeft;
    }
    
    /**
     * Find the bottom left node
     */
    public VisualInfo findBottomRightNode(VisualInfo[] nodePositions) {
    	VisualInfo mostBottomRight = null;
    	for(VisualInfo nodePosition: nodePositions) {
    		if(mostBottomRight == null) {
    			mostBottomRight = nodePosition;               
    		} else {
                // if(nodePosition.getX() > mostBottomRight.getX() && nodePosition.getY() < mostBottomRight.getY()){
                //     mostBottomRight.setX(nodePosition.getX());
                //     mostBottomRight.setY(nodePosition.getY());
                // }
                double diffX = nodePosition.getX() - mostBottomRight.getX();
                double diffY = mostBottomRight.getY() - nodePosition.getY();
                if(diffX + diffY > 0) {
                    mostBottomRight = nodePosition;
                }
    		}
    	}
    	return mostBottomRight;
    }

    /*
     * Find center of the model
     * using the formula which finds the intersection of two lines 
     */
    public VisualInfo findCenter(VisualInfo[] nodePositions) {
        VisualInfo center = new VisualInfo();
        double x1 = findBottomLeftNode(nodePositions).getX();
        double x2 = findUpperRightNode(nodePositions).getX();
        double x3 = findUpperLeftNode(nodePositions).getX();
        double x4 = findBottomRightNode(nodePositions).getX();
        double y1 = findBottomLeftNode(nodePositions).getY();
        double y2 = findUpperRightNode(nodePositions).getY();
        double y3 = findUpperLeftNode(nodePositions).getY();
        double y4 = findBottomRightNode(nodePositions).getY();
        if ((x1 == x2 && y1 == y2) || (x3 == x4 && y3 == y4)) {
            return false ;
        }
        double denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        double ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator ;
        double ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator ;
      // Return a object with the x and y coordinates of the intersection
        double x = x1 + ua * (x2 - x1);
        double y = y1 + ua * (y2 - y1);
        center.setX(x);
        center.setY(y);
        //set the size of the canvas
        center.setWidth(2*Math.abs(x1-x2));
        center.setHeight(2*Math.abs(y1-y2));
        return center;
    }


    /*
        Main Layout method
     */ 
        
	public ModelSpec layoutModel(){
		if (LMain.DEBUG) System.out.println("Starting: layoutModel");
		
        VisualInfo[] nodePositions = initNodePositions();
        double c = .2; //constant for adjustment
        double a = .05; //constant for error
        double gravitation = 3; // fixed gravitation forces
		for(int i = 0; i < maxIter; i++){
			if (LMain.DEBUG) System.out.println("\n" + i + "th Iteration");
			if (LMain.DEBUG) System.out.println(Arrays.toString(nodePositions));
			
            //sum up forces for the X and Y directions
            Double[] forceX = new Double[nodePositions.length];
            Arrays.fill(forceX, 0.0);
            Double[] forceY = new Double[nodePositions.length];
            Arrays.fill(forceY, 0.0);
            
            //fill out indices of forceX and forceY
            for(int j = 0; j < nodePositions.length; j++){
            	if (LMain.DEBUG) System.out.println(j + "th Node\n");
            	if (LMain.DEBUG) System.out.println(Arrays.toString(forceX));
            	if (LMain.DEBUG) System.out.println(Arrays.toString(forceY));

            	double phi = angleBetween(findCenter(nodePositions),nodePositions[j]); 
                
            	//if (LMain.DEBUG) System.out.println("\n" + j + "th Node\n");

                for(int k = 0; k < nodePositions.length; k++){
                    if(j ==k) continue;  
                   //TODO: Force constants, sizes? How to know...
                    //if (LMain.DEBUG) System.out.println("Starting: layoutModel Calculations");
                    double theta = angleBetween(nodePositions[j], nodePositions[k]);
                    double attraction = makeSmall(getAttraction(nodePositions[j], nodePositions[k]));
                    double repulsion = makeSmall(getRepulsion(nodePositions[j], nodePositions[k]));
                    //if (LMain.DEBUG) System.out.println(theta);
                    //if (LMain.DEBUG) System.out.println(attraction);
                    //if (LMain.DEBUG) System.out.println(repulsion);
                    
                    if(Double.isNaN(theta) ||Double.isNaN(attraction) || Double.isNaN(repulsion)) {
                    	return model;
                    }
                    
                    //if (LMain.DEBUG) System.out.println("Starting: layoutModel adding to sum");
                    forceX[j] += (attraction*Math.cos(theta) - repulsion*Math.cos(theta));
                    forceY[j] += (attraction*Math.sin(theta) - repulsion*Math.sin(theta));
                    
                    forceX[k] -= (attraction*Math.cos(theta) - repulsion*Math.cos(theta));
                    forceY[k] -= (attraction*Math.sin(theta) - repulsion*Math.sin(theta));
                    
                    double x_shift = c*(attraction*Math.cos(theta) - repulsion*Math.cos(theta));
                    double y_shift = c*(attraction*Math.sin(theta) - repulsion*Math.sin(theta));
                    
                    //if (LMain.DEBUG) System.out.println(x_shift);
                    //if (LMain.DEBUG) System.out.println(y_shift);
                    
                    nodePositions[j].setX(nodePositions[j].getX() + c*(attraction*Math.cos(theta) - repulsion*Math.cos(theta)));
                    nodePositions[j].setY(nodePositions[j].getY() + c*(attraction*Math.sin(theta) - repulsion*Math.sin(theta)));
                    
                    nodePositions[k].setX(nodePositions[k].getX() - c*(attraction*Math.cos(theta) - repulsion*Math.cos(theta)));
                    nodePositions[k].setY(nodePositions[k].getY() - c*(attraction*Math.sin(theta) - repulsion*Math.sin(theta)));
                    
                    //if (LMain.DEBUG) System.out.println(Arrays.toString(nodePositions));
                    
                }
                
            }
            
            //adjust the positions
//            if (LMain.DEBUG) System.out.println("Starting: layoutModel Adjustments");
//            for(int j = 0; j < nodePositions.length; j++){
//                nodePositions[j].setX(nodePositions[j].getX() + c/forceX[j]);
//                nodePositions[j].setY(nodePositions[j].getY() + c*forceY[j]);
//            }

            //calculate error
            //TODO: figure out a good stopping condition
            //if (LMain.DEBUG) System.out.println("Starting: layoutModel calculating error");
            //if (Math.abs(sum(forceX)) < a && Math.abs(sum(forceY)) < a) break;
            
            if(checkConds(nodePositions, nodePositions[0])) {
            	if (LMain.DEBUG) System.out.println("Conditions Met");
            	return model;
            }
        }
		if (LMain.DEBUG) System.out.println(Arrays.toString(nodePositions));
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
     
     /**
      * boolean method for the overlap of two nodes
      */
     public boolean isOverlapped(VisualInfo n1, VisualInfo n2) {
    	 double n1_xmin = n1.getX() - n1.getSize().getWidth()/2;
    	 double n1_xmax = n1.getX() + n1.getSize().getWidth()/2;
    	 double n1_ymin = n1.getY() - n1.getSize().getHeight()/2;
    	 double n1_ymax = n1.getY() + n1.getSize().getHeight()/2;
    	 
    	 double n2_xmin = n2.getX() - n2.getSize().getWidth()/2;
    	 double n2_xmax = n2.getX() + n2.getSize().getWidth()/2;
    	 double n2_ymin = n2.getY() - n2.getSize().getHeight()/2;
    	 double n2_ymax = n2.getY() + n2.getSize().getHeight()/2;
    	 
    	 return !(n1_xmin >= n2_xmax || n1_xmax <= n2_xmin || n1_ymin >= n2_ymax || n1_ymax <= n2_ymin);
     }
     
     /**
      * boolean method to determine if the node is outside of a border
      * @param n1 the node
      * @param n2 the border
      * @return
      */
     public boolean isOutside(VisualInfo n1, VisualInfo n2) {
    	 double n1_xmin = n1.getX() - n1.getSize().getWidth()/2;
    	 double n1_xmax = n1.getX() + n1.getSize().getWidth()/2;
    	 double n1_ymin = n1.getY() - n1.getSize().getHeight()/2;
    	 double n1_ymax = n1.getY() + n1.getSize().getHeight()/2;
    	 
    	 double n2_xmin = n2.getX() - n2.getSize().getWidth()/2;
    	 double n2_xmax = n2.getX() + n2.getSize().getWidth()/2;
    	 double n2_ymin = n2.getY() - n2.getSize().getHeight()/2;
    	 double n2_ymax = n2.getY() + n2.getSize().getHeight()/2;
    	 
    	 return (n1_xmin < n2_xmin || n1_ymin < n2_ymin || n1_xmax > n2_xmax || n1_ymax > n2_ymax);
    	 
     }
     
     /**
      * This method determines if the nodes are close enough to each other. 
      * We construct a graph from the nodes, and if the graph is connected then it is close enough.
      * @param nodePositions
      * @return
      */
     public boolean isCloseEnough(VisualInfo[] nodePositions) {
    	 //heuristic for distance between nodes
    	 double edgeLength_max = 500/(1 + 1000*Math.pow(Math.E, nodePositions.length * -1)) + 200;
    	 
    	//Make a graph 
    	 HashSet<Integer[]> edgeSet = new HashSet<Integer[]>();
    	 
    	 for(int i = 0; i < nodePositions.length; i++) {
    		 for(int j = 0; j < nodePositions.length; j++) {
    			 if(i == j) continue;
    			 if(getDist(nodePositions[i], nodePositions[j]) <= edgeLength_max) {
    				edgeSet.add(new Integer[]{i,j});
    			 }
    		 }
    	 }
    	 if (LMain.DEBUG) {
    		 System.out.println("Edge Heuristic: "+ edgeLength_max);
    		 System.out.println("Number of Nodes: "+ nodePositions.length);
    		 System.out.print("EdgeSet: {");
    		 for(Integer[] edge: edgeSet) System.out.print(Arrays.toString(edge) + ", ");
    	 }
    	 
    	 //traverse the graph; if all the nodes are visited, the graph is connected.
    	 return DFS(edgeSet, new HashSet<Integer>(), 0).size() == nodePositions.length;
     }
     
     /**
      * Traverse the graph
      * @param edgeSet
      * @param visitedSet
      * @param currentVertex
      * @return visitedSet
      */
     public HashSet<Integer> DFS(HashSet<Integer[]> edgeSet, HashSet<Integer> visitedSet, Integer currentVertex) {
    	 //label the current node as visited
    	 visitedSet.add(currentVertex);
    	 if (LMain.DEBUG) System.out.println("visitedSet: " + visitedSet);
    	 HashSet<Integer> neighborSet = new HashSet<>();
    	 for(Integer[] edge: edgeSet) {
    		 if(edge[0] == currentVertex) neighborSet.add(edge[1]);
    	 }
    	 
    	 for(Integer neighbor: neighborSet) {
    		 if(visitedSet.contains(neighbor)) continue;
    		 visitedSet = DFS(edgeSet, visitedSet, neighbor);
    	 }
    	
    	 return visitedSet;
     }
     
     /**
      * TODO: How to check for correctness? and how to correct for incorrectness
      * Checks conditions and if goal model positions satisfies them;
      * @param nodePositions
      * @param border
      * @return
      */
     public boolean checkConds(VisualInfo[] nodePositions, VisualInfo border) {
    	 if (LMain.DEBUG) System.out.println("Checking COnditions");
    	 for(VisualInfo n1: nodePositions) {
    		 for(VisualInfo n2: nodePositions) {
    			 if(n1 == n2) continue;
    			 if(isOverlapped(n1, n2)) return false;
    		 }
    	 }
    	 return isCloseEnough(nodePositions);
     }
     
     public double makeSmall(Double num) {
    	 while(Math.abs(num) > 500) {
    		 if(num < 0) return -100;
    		 return 100;
    	 }
    	 return num;
     }

    
}

