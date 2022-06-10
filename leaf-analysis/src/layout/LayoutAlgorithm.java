package layout;

import simulation.*;
import merge.*;

import java.util.*;

import gson_classes.BIPosition;
import gson_classes.BISize;

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
        // TODO: some logging object init with filename
	}
	
	
	/*public model layout(){
		//nested level
		for(Actor a: model.getActors()) {
			VisualInfo[] a_intentions = initNodePositions(a.getEmbedObjects(model));
			layoutModel(a_intentions);
			resizeActor(a, a_intentions);
		}
		//	//level 0
		//  VisualInfo[] level_zero = model.getActors + model.IntentionsWithoutActors
        //	run layout on level_zero // if a node is an actor, propagate changes, visualize elements as actors
		//
		//
		//
	} */
	
    /**
     * a boolean method to determine whether the node is a child of an actor
     * @param nodePositions the list of nodes
     * @param node the potential child of an actor
     * 
     */
    public boolean isChild(VisualInfo[] nodePositions) { 
        for(VisualInfo nodePosition: nodePositions) {
            if(isOutside(nodePosition, node) == false)
                return true;
        }
    }

    public VisualInfo theChildOf(VisualInfo[] nodePositions) {
        if(node.isChild(nodePositions)) {
            return nodePositions;
        }
    }

    // get a list of children nodes 

    /**
     * Propagate all the adjustment of actor to its embedded intentions
     * @param actor
     * @param adjust_x
     * @param adjust_y
     */
	public void propogateAdjust (VisualInfo actor, double adjust_x, double adjust_y) {
        actor.findCenter()
        for(Intention intent : model.getIntentions()) {

        }
        // for all children of an actor 
        //     children update (adjustment)
    }

    public VisualInfo resizeActor (VisualInfo actor) {

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
    	//Spring force attraction
    	//TODO: figure out the values of these constants
    	if (n1 != n2) {
    		double idealLength = 200;
        	double elasticityConstant = 5000; //increasing it means the spring is stiffer
        	
        	double dist = getDist(n1, n2);
        	double forceSum = (idealLength - dist)*(idealLength - dist)/elasticityConstant; //cubing distance too big, but this is the wrong formula
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
            double alpha = 20000;
            double forceSum = alpha / (dist * dist) * dist; 
            if (LMain.DEBUG) System.out.println("Repulsion " + forceSum);
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
            double distX = n1.getX() - n2.getX();
            double distY = n1.getY() - n2.getY();
            double theta = Math.atan(distY/distX);
            //if they are at the same position:
            if(Double.isNaN(theta)) return Math.random();
            if(n1.getX() == 50 && n1.getY() == 50) {
	            if (LMain.DEBUG) System.out.println("distX"+distX);
	            if (LMain.DEBUG) System.out.println("distY"+distY);
            }
            if(theta < 0 && distY > 0 || distX < 0 && distY < 0) return theta + Math.PI;
            return theta;
        }
        return 0;
    }
    
    /*
     * Find center of the model
     * using the formula which finds the intersection of two lines 
     */
    public VisualInfo findCenter(VisualInfo[] nodePositions) {
        VisualInfo mostLeft = nodePositions[0];
        VisualInfo mostRight = nodePositions[0];
        VisualInfo mostUpper = nodePositions[0];
        VisualInfo mostBottom = nodePositions[0];
        for(VisualInfo nodePosition: nodePositions) {
            if(nodePosition.getX() < mostLeft.getX()){
            	mostLeft = nodePosition;
            }
            if(nodePosition.getX() > mostRight.getX()){
            	mostRight = nodePosition;
            }
            if(nodePosition.getY() < mostUpper.getY()){
            	mostUpper = nodePosition;
            }
            if(nodePosition.getY() > mostBottom.getY()){
            	mostBottom = nodePosition;
            }
            
        }
        
        double x_left = mostLeft.getX() - mostLeft.getSize().getWidth()/2;
        double x_right = mostRight.getX() + mostRight.getSize().getWidth()/2;
        double y_upper = mostUpper.getY() + mostLeft.getSize().getHeight()/2; 
        double y_bottom = mostLeft.getY() - mostLeft.getSize().getHeight()/2;
        
        double x = (x_left + x_right) / 2;
        double y = (y_upper + y_bottom) / 2;
        
        VisualInfo center = new VisualInfo((int)(2*Math.abs(x_left + x_right)), (int)(2*Math.abs(y_upper + y_bottom)), x, y);
        return center;
    }


    /*
        Main Layout method
     */ 
        
	public ModelSpec layoutModel(){
		if (LMain.DEBUG) System.out.println("Starting: layoutModel");
		
        VisualInfo[] nodePositions = initNodePositions();
        VisualInfo center = findCenter(nodePositions);
        LayoutVisualizer lV = new LayoutVisualizer(nodePositions, center);
        
        //constants
        double c = .2; //adjustment
        double a = .05; //error
        double gravitation = .1; //gravitation forces
        
		for(int i = 0; i < maxIter; i++){
			if (LMain.DEBUG) System.out.println("\n" + i + "th Iteration");
			if (LMain.DEBUG) System.out.println(Arrays.toString(nodePositions));
            
            
            for(int j = 0; j < nodePositions.length; j++){
            	if (LMain.DEBUG) System.out.println(j + "th Node\n");
            	//if (LMain.DEBUG) System.out.println(Arrays.toString(forceX));
            	//if (LMain.DEBUG) System.out.println(Arrays.toString(forceY));
            	//if (LMain.DEBUG) System.out.println("\n" + j + "th Node\n");

                for(int k = 0; k < nodePositions.length; k++){
                    if(j ==k) continue;  
                    //TODO: Force constants, sizes? How to know...
                    //if (LMain.DEBUG) System.out.println("Starting: layoutModel Calculations");
                    double dist = getDist(nodePositions[j], nodePositions[k]);
                    double theta = angleBetween(nodePositions[k], nodePositions[j]);
                    double attraction = (getAttraction(nodePositions[j], nodePositions[k]));
                    double repulsion = (getRepulsion(nodePositions[j], nodePositions[k]));
                    if (LMain.DEBUG) System.out.println("Distance: " + dist);
                    //if (LMain.DEBUG) System.out.println("Adjust Attraction: " + attraction);
                    //if (LMain.DEBUG) System.out.println(repulsion);
                    if(Double.isNaN(theta) ||Double.isNaN(attraction) || Double.isNaN(repulsion)) {
                    	//TODO: Throw error
                    	return model;
                    }
                    
                    //if (LMain.DEBUG) System.out.println("Starting: layoutModel adding to sum");
                    
                    double x_shift = c*(attraction*Math.cos(theta) - repulsion*Math.cos(theta));
                    double y_shift = c*(attraction*Math.sin(theta) - repulsion*Math.sin(theta));
                    
                    if (LMain.DEBUG) System.out.println("x_shift" + x_shift);
                    if (LMain.DEBUG) System.out.println("y_shift" + y_shift);
                    
                    nodePositions[j].setX(nodePositions[j].getX() + x_shift);
                    nodePositions[j].setY(nodePositions[j].getY() + y_shift);
                    
                    nodePositions[k].setX(nodePositions[k].getX() - x_shift);
                    nodePositions[k].setY(nodePositions[k].getY() - y_shift);
                    
                    //if (LMain.DEBUG) System.out.println(Arrays.toString(nodePositions));
                    
                }
                
                //adjust positions based on gravity from the center
                double phi = angleBetween(center, nodePositions[j]); 
                if (LMain.DEBUG) System.out.println("phi: " + phi);
                nodePositions[j].setX(nodePositions[j].getX() + gravitation*Math.cos(phi));
                nodePositions[j].setY(nodePositions[j].getY() + gravitation*Math.sin(phi));

            }
            //calculate error
            //TODO: figure out a good stopping condition
            //if (LMain.DEBUG) System.out.println("Starting: layoutModel calculating error");
            //if (Math.abs(sum(forceX)) < a && Math.abs(sum(forceY)) < a) break;
            
            if(checkConds(nodePositions, center)) {
            	if (LMain.DEBUG) System.out.println("Conditions Met");
            	return model;
            }
            
            lV.update();
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
    	 //TODO: limits for heuristic for distance between nodes
    	 double edgeLength_max = 200/(1 + 1000*Math.pow(Math.E, nodePositions.length * -1)) + 100;
    	 
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
     
     /**
      * TODO: what's a good way to do this?
      * @param num
      * @param distance?
      * @return
      */
     public double makeSmall(Double num) {
    	 while(num > 10000) {
    		 num = num / 10;
    	 }
    	 return num;
     }

    
}

