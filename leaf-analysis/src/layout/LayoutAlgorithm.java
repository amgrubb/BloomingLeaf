package layout;

import simulation.*;
import merge.*;

import java.util.*;

public class LayoutAlgorithm {
	// models
	ModelSpec model;
    int maxIter;

    /**
     * Initialize LayoutAlgorithm
     * @param model - model to be layed out
     * @param filename - file for tracking changes
     * @param maxIter - limit for iterating over changes
     */
	public LayoutAlgorithm(ModelSpec model, String filename, int maxIter) {

		if (LMain.DEBUG) System.out.println("Creating Layout Object");
		// set up models
		this.model = model;

        // set up timeout
        this.maxIter = maxIter;
        
        // TODO: some logging object init with filename
	}
	
	/**
	 * Method for laying out the entire model
	 * @return model
	 */
	public ModelSpec layout(){

		if (LMain.DEBUG) System.out.println("Starting Full Layout");
		
		//trying the actor around actorless intention method
		Actor temp_actor = new Actor("temp-actor", "temp-actor", "basic.Actor", new String[0], "temp-actor");
		
		for(Intention i: model.getActorlessIntentions()) {
			temp_actor.addEmbed((AbstractElement)i);
		}
		temp_actor.setVisualInfo(new VisualInfo(5,5,5.0,5.0));
		model.getActors().add(temp_actor);
		
		if (LMain.DEBUG) System.out.println(temp_actor.getEmbedIntentions(model).length);
		//if (LMain.DEBUG) return model;
		
		//nested level
		if (LMain.DEBUG) System.out.println("Starting Nested Level");
		
		for(Actor a: model.getActors()) { 

			System.out.println(a.getName());
			
			// get nodes in this actor (this is so ugly i'm so sorry)
			Intention[] a_intentions = a.getEmbedIntentions(model);
			if(a_intentions.length == 0) continue;
			ArrayList<AbstractLinkableElement> temp_arrayList = new ArrayList<>();
			for(Intention i: a_intentions) {
				temp_arrayList.add((AbstractLinkableElement)i);
			}
			VisualInfo[] intention_nodePos = initNodePositions(temp_arrayList);
			if (LMain.DEBUG) System.out.println(Arrays.toString(intention_nodePos));
			
			//sort intentions
			// organizeIntentionTypes(intention_nodePos, a);
			
			//layout intentions
			layoutModel(intention_nodePos, false);
			
			//resize actor
			resizeActor(a, intention_nodePos);
			if (a.getName().equals("temp-actor")) {
				if (LMain.DEBUG) System.out.println(a.getVisualInfo());
				//return model;
			}
		}
		
		//  level 0
		if (LMain.DEBUG) System.out.println("Starting 0th Level");	

		//  get nodes on the zeroth level
		ArrayList<AbstractLinkableElement> temp_arrayList = new ArrayList<>();
		for(Actor a: model.getActors()) { // note that actors are first in the list 
			temp_arrayList.add((AbstractLinkableElement)a);
			if (LMain.DEBUG) System.out.println(a.getEmbedIntentions(model).length);
		}
		VisualInfo[] lvl0_nodePos = initNodePositions(temp_arrayList);
		
		//	run layout on level_zero (if a node is an actor, propagate changes to its children)
		if(model.getActors().size() == 0) layoutModel(lvl0_nodePos, false);
		else layoutModel(lvl0_nodePos, true);
		
		//delete the temp actor
		model.getActors().remove(temp_actor);
		//TODO: delete temp actor from intentions
		
		return model;
	}
	
	
    /**
     * Lays out nodePositions, all nodePositions apply forces on each other
     * @param nodePositions
     * @param hasActors - will change constants and conditions
     * @return
     */
	public ModelSpec layoutModel(VisualInfo[] nodePositions, boolean hasActors){
		if (LMain.DEBUG) System.out.println("Starting: layoutModel");
		
        VisualInfo center = findCenter(nodePositions);
        int numActors = model.getActors().size();
        if(!hasActors) numActors = 0;
        LayoutVisualizer lV = new LayoutVisualizer(nodePositions, center, numActors);
        
        //constants
        double c = .0002; //adjustment -- the speed at which actors move
        //TODO: solid piece wise function for c
        if(nodePositions.length < 7 && nodePositions.length > 3) c = .0006;
        else if(nodePositions.length < 4) c = .001;
        double a = .05; //error
        double constant = Math.pow(nodePositions.length, .5); // increasing the constant decreases attraction and gravitation, but increases repulsion
        
        if(hasActors) {
        	c = .02;
        }
        
        if (LMain.DEBUG) System.out.println(constant);
        //if (LMain.DEBUG) return model;
        
        double gravitation = 9.8/Math.sqrt(constant); //gravitation forces
        
		for(int i = 0; i < maxIter; i++){
			if (LMain.DEBUG) System.out.println("\n" + i + "th Iteration");
			if (LMain.DEBUG) System.out.println(Arrays.toString(nodePositions));
            
            
            for(int j = 0; j < nodePositions.length; j++){
            	if (LMain.DEBUG) System.out.println(j + "th Node\n");

                for(int k = 0; k < nodePositions.length; k++){
                    if(j ==k) continue;  
                    //TODO: Force constants, sizes? How to know...
                    //if (LMain.DEBUG) System.out.println("Starting: layoutModel Calculations");
                    double dist = getDist(nodePositions[j], nodePositions[k]);
                    double theta = angleBetween(nodePositions[k], nodePositions[j]);
                    double attraction = makeSmall(getAttraction(nodePositions[j], nodePositions[k], constant));
                    double repulsion = (getRepulsion(nodePositions[j], nodePositions[k], constant));
                    if (LMain.DEBUG) System.out.println("Distance: " + dist);
                    //if (LMain.DEBUG) System.out.println("Adjust Attraction: " + attraction);
                    //if (LMain.DEBUG) System.out.println(repulsion);
                    if(Double.isNaN(theta) ||Double.isNaN(attraction) || Double.isNaN(repulsion)) {
                    	//TODO: Throw error
                    	return model;
                    }
                    
                    //if (LMain.DEBUG) System.out.println("Starting: layoutModel adding to sum");
                    
                    double x_shift = c * (attraction*Math.cos(theta) - repulsion*Math.cos(theta));
                    double y_shift = c * (attraction*Math.sin(theta) - repulsion*Math.sin(theta));
                    
                    if (LMain.DEBUG) System.out.println("x_shift" + x_shift);
                    if (LMain.DEBUG) System.out.println("y_shift" + y_shift);
                    
                    nodePositions[j].setX(nodePositions[j].getX() + x_shift);
                    nodePositions[j].setY(nodePositions[j].getY() + y_shift);
                    
                    nodePositions[k].setX(nodePositions[k].getX() - x_shift);
                    nodePositions[k].setY(nodePositions[k].getY() - y_shift);
                    
                    //if (LMain.DEBUG) System.out.println(Arrays.toString(nodePositions));
                    
                    if(j < numActors) {
                    	propagateAdjustments(model.getActors().get(j), x_shift, y_shift);
                    }
                    
                    if(k < numActors) {
                    	propagateAdjustments(model.getActors().get(k), -x_shift, -y_shift);
                    }
                    
                }
                
                //adjust positions based on gravity from the center
                double phi = angleBetween(center, nodePositions[j]); 
                if (LMain.DEBUG) System.out.println("phi: " + phi);
                nodePositions[j].setX(nodePositions[j].getX() + gravitation*Math.cos(phi));
                nodePositions[j].setY(nodePositions[j].getY() + gravitation*Math.sin(phi));
                
                //gravitation = getDist(nodePositions[j], center) * .2;
                
                if(j < numActors) {
                	propagateAdjustments(model.getActors().get(j), gravitation*Math.cos(phi), gravitation*Math.sin(phi));
                }

            }
            //calculate error
            //TODO: figure out a good stopping condition
            //if (LMain.DEBUG) System.out.println("Starting: layoutModel calculating error");
            //if (Math.abs(sum(forceX)) < a && Math.abs(sum(forceY)) < a) break;
            
            if(checkConds(nodePositions, center, numActors)) {
            	if (LMain.DEBUG) System.out.println("Conditions Met");
            	return model;
            }
            
            lV.update();
            if (LMain.DEBUG) System.out.println(constant);
        }
		if (LMain.DEBUG) System.out.println(Arrays.toString(nodePositions));
		if (LMain.DEBUG) System.out.println("Finished: layoutModel");
		return model;
	}
	
	/*************** start of helper methods *******************/
	
	/**
	 * Propagate changes from actor to its children nodes
	 * @param actor
	 * @param x_shift
	 * @param y_shift
	 */
	public void propagateAdjustments (Actor actor, double x_shift, double y_shift) { 
        for(Intention intent : actor.getEmbedIntentions(model)) {
            intent.setX(intent.getX() + x_shift);
            intent.setY(intent.getY() + y_shift);
        }
    }

	/**
	 * Adjust the size of the actor to fit intentions 
	 * @param actor
	 * @param intentions
	 * @return
	 */
    public Actor resizeActor (Actor actor, VisualInfo[] intentions) {
        VisualInfo center = findCenter(intentions); 
        Integer margin = 100; //space between the edge of intentions and the actor 
        actor.setX(center.getX() - center.getWidth()/2 - margin);
        actor.setY(center.getY() - center.getHeight()/2 - margin);
        actor.setWidth(center.getWidth() + 2*margin);
        actor.setHeight(center.getHeight() + 2*margin);
        return actor;
    }
    
    /****************** mathy methods ***************/

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
    private double getAttraction(VisualInfo n1, VisualInfo n2, double constant) {
    	//Spring force attraction
    	//TODO: figure out the values of these constants
    	if (n1 != n2) {
    		double idealLength = 200;
        	double elasticityConstant = 50000000 * constant; //increasing it means the spring is stiffer
        	
        	double dist = getDist(n1, n2);
        	double forceSum = (idealLength - dist)*(idealLength - dist)*dist/elasticityConstant; //cubing distance too big, but this is the wrong formula
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

    private double getRepulsion(VisualInfo n1, VisualInfo n2, double constant) {
    	//if (LMain.DEBUG) System.out.println("Starting: getRepulsion");
        if (n1 != n2) {
            double dist = getDist(n1,n2);
            if(dist == 0) return 99;
            double alpha = 200000 * constant; 
            double forceSum = alpha / (dist * dist) * dist; 
            if (LMain.DEBUG) System.out.println("Repulsion " + forceSum);
            return forceSum;
        }
        return 0;
    }
    

    /**
     * Calculate the angle between two VisualInfo objects
     * @param n1
     * @param n2 - from the perspective of n2
     * @return
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
    
 
    /**
     * Find the center of the VisualInfo objects
     * @param nodePositions
     * @return VisualInfo object at the center who's height and width is the height and width of all the nodes
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
            if(nodePosition.getX() + nodePosition.getWidth() > mostRight.getX() + mostRight.getWidth()){
            	mostRight = nodePosition;
            }
            if(nodePosition.getY() < mostUpper.getY()){
            	mostUpper = nodePosition;
            }
            if(nodePosition.getY() + nodePosition.getHeight() > mostBottom.getY() + nodePosition.getHeight()){
            	mostBottom = nodePosition;
            }
            
        }
        
        double x_left = mostLeft.getX();
        double x_right = mostRight.getX() + mostRight.getSize().getWidth();
        double y_upper = mostUpper.getY(); 
        double y_bottom = mostBottom.getY() + mostBottom.getSize().getHeight();
        
        double x = (x_left + x_right) / 2;
        double y = (y_upper + y_bottom) / 2;
        
        
        VisualInfo center = new VisualInfo((int)(Math.abs(x_left - x_right)), (int)(Math.abs(y_upper - y_bottom)), x, y);
        //width, height, x, y
        return center;
    }

     
    /******************** Methods for checking conditions *****************/

     /**
      * boolean method for the overlap of two nodes
      * @param n1
      * @param n2
      * @return
      */
     public boolean isOverlapped(VisualInfo n1, VisualInfo n2) {
    	 double n1_xmin = n1.getX();
    	 double n1_xmax = n1.getX() + n1.getSize().getWidth();
    	 double n1_ymin = n1.getY();
    	 double n1_ymax = n1.getY() + n1.getSize().getHeight();
    	 
    	 double n2_xmin = n2.getX();
    	 double n2_xmax = n2.getX() + n2.getSize().getWidth();
    	 double n2_ymin = n2.getY();
    	 double n2_ymax = n2.getY() + n2.getSize().getHeight();
    	 
    	 return !(n1_xmin >= n2_xmax || n1_xmax <= n2_xmin || n1_ymin >= n2_ymax || n1_ymax <= n2_ymin);
     }
     
     /**
      * boolean method to determine if the node is outside of a border
      * @param n1 the node
      * @param n2 the border
      * @return
      */
     public boolean isOutside(VisualInfo n1, VisualInfo n2) {
    	 double n1_xmin = n1.getX();
    	 double n1_xmax = n1.getX() + n1.getSize().getWidth();
    	 double n1_ymin = n1.getY();
    	 double n1_ymax = n1.getY() + n1.getSize().getHeight();
    	 
    	 double n2_xmin = n2.getX();
    	 double n2_xmax = n2.getX() + n2.getSize().getWidth();
    	 double n2_ymin = n2.getY();
    	 double n2_ymax = n2.getY() + n2.getSize().getHeight();
    	 
    	 return (n1_xmin < n2_xmin || n1_ymin < n2_ymin || n1_xmax > n2_xmax || n1_ymax > n2_ymax);
    	 
     }
     
     /**
      * This method determines if the nodes are close enough to each other. 
      * We construct a graph from the nodes, and if the graph is connected then it is close enough.
      * @param nodePositions
      * @param numActors - to know which nodes are actors
      * @return
      */
     public boolean isCloseEnough(VisualInfo[] nodePositions, int numActors) {
    	 //TODO: limits for heuristic for distance between nodes
    	 double edgeLength_max = 200/(1 + 1000*Math.pow(Math.E, nodePositions.length * -1)) + 100;
    	 
    	//Make a graph 
    	 HashSet<Integer[]> edgeSet = new HashSet<Integer[]>();
    	 
    	 for(int i = 0; i < nodePositions.length; i++) {
    		 for(int j = 0; j < nodePositions.length; j++) {
    			 if(i == j) continue;
    			 double adjust_ELM = 0;
    			 //if either i or j are actors
    			 if(i < numActors && j < numActors) {
    				 double dist1 = getHypotenuse(nodePositions[i].getWidth(), nodePositions[i].getHeight());
    				 double dist2 = getHypotenuse(nodePositions[j].getWidth(), nodePositions[j].getHeight());
    				 adjust_ELM += dist1 + dist2;
    			 }
    			 else if(i < numActors) {
    				 adjust_ELM += getHypotenuse(nodePositions[i].getWidth(), nodePositions[i].getHeight());
    			 }
    			 else if(j < numActors) {
    				 adjust_ELM = getHypotenuse(nodePositions[j].getWidth(), nodePositions[j].getHeight());
    			 }
    			 if(getDist(nodePositions[i], nodePositions[j]) <= (edgeLength_max + adjust_ELM)) {
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
     public boolean checkConds(VisualInfo[] nodePositions, VisualInfo border, int numActors) {
    	 if (LMain.DEBUG) System.out.println("Checking COnditions");
    	 for(VisualInfo n1: nodePositions) {
    		 for(VisualInfo n2: nodePositions) {
    			 if(n1 == n2) continue;
    			 if(isOverlapped(n1, n2)) return false;
    		 }
    	 }
    	 return isCloseEnough(nodePositions, numActors);
     }
     
     /********* Start of other methods ******************/
     
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
     
     /**
      * find the hypotenuse of a right triangle using the pythagorean theorem
      * @param base
      * @param height
      * @return
      */
     public double getHypotenuse(double base, double height) {
    	 return Math.sqrt(base*base + height*height);
     }
     
     
     /**
      * Array Sum helper
      * @param arr
      * @return
      */
      public double sum(Double[] arr){
          int sum = 0;
          for(Double i: arr){
              sum += i;
          }
          return sum;
      }
      
  	/**
  	 * Initialize the node position array, collect VisualInfo objects
  	 * @param nodes - elements that will be arranged, like actors and intentions
  	 * @return
  	 */
      public VisualInfo[] initNodePositions(ArrayList<AbstractLinkableElement> nodes){
        if (LMain.DEBUG) System.out.println(nodes);
          VisualInfo[] nodePositions = new VisualInfo[nodes.size()];
          
          for(int i = 0; i < nodes.size(); i++) {
          	nodePositions[i] = nodes.get(i).getVisualInfo();
          }
          
          return nodePositions;
      }
      
      /**
       * Sort Intentions types TODO: invisible actor children need to set this.actor to invisible actor!!!
       * @param nodePos
       * @param actor
       */
      public void organizeIntentionTypes(VisualInfo[] nodePos, Actor actor) {
    	  
    	  //sort nodePos
    	  quicksort(nodePos, 0, nodePos.length - 1);
    	  
    	  int i = 0;
    	  //assign nodePos to goals in actor
    	  for(Intention goal: model.getGoals()) {
    		  if(goal.getActor() == actor) {
    			  goal.setVisualInfo(nodePos[i]);
    			  i++;
    		  }
    	  }
    	  
    	  //tasks
    	  for(Intention task: model.getTasks()) {
    		  if(task.getActor() == actor) {
    			  task.setVisualInfo(nodePos[i]);
    			  i++;
    		  }
    	  }
    	  
    	  //soft goals
    	  for(Intention softgoal: model.getSoftGoals()) {
    		  if(softgoal.getActor() == actor) {
    			  softgoal.setVisualInfo(nodePos[i]);
    			  i++;
    		  }
    	  }
    	  
    	  //resources
    	  for(Intention resource: model.getResources()) {
    		  if(resource.getActor() == actor) {
    			  resource.setVisualInfo(nodePos[i]);
    			  i++;
    		  }
    	  }
    	  
      }
      
      /**
       * Sort nodePos by the Y coordinates using the quicksort algorithm
       * @param nodePos
       * @param lo
       * @param hi
       */
      public void quicksort(VisualInfo[] nodePos, int lo, int hi) {
    	  if (lo >= hi || lo < 0) return;
    	  
    	  int p = partition(nodePos, lo, hi);
    	  
    	  quicksort(nodePos, lo, p - 1);
    	  quicksort(nodePos, p + 1, hi);
      }
      
      /**
       * Divides nodePos into two parts
       * @param nodePos
       * @param lo
       * @param hi
       * @return
       */
      public int partition(VisualInfo[] nodePos, int lo, int hi) {
    	  VisualInfo pivot = nodePos[hi];
    	  
    	  int i = lo - 1;
    	  
    	  for(int j = lo; j < hi - 1; j++) {
    		  if(nodePos[j].getY() <= pivot.getY()) {
    			  i += 1;
    			  //swap i and j 
    			  VisualInfo temp = nodePos[i];
    			  nodePos[i] = nodePos[j];
    			  nodePos[j] = temp;
    		  }
    	  }
    	  
    	  i += 1;
    	  //swap i and hi
    	  VisualInfo temp = nodePos[i];
		  nodePos[i] = nodePos[hi];
		  nodePos[hi] = temp;
		  
    	  return i;
      }

    
}

