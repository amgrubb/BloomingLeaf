package layout;

import simulation.*;
import merge.*;


import java.util.*;

import org.jacop.constraints.Constraint;

public class LayoutAlgorithm {
	public final static int ACTOR_BOUNDARY_MARGIN = 50; //The space between the edge of intentions and the actor on one side.
	public static double speedConstant;
	public static double gravitation;
	public static double antiConstant;
//	public static double theta;
	public static double attraction;
	public static double repulsion;
//	public static double phi;
	private ModelSpec model;
	private int maxIter;

	/**
	 * Initialize LayoutAlgorithm
	 * @param model - model to be layed out
	 * @param maxIter - limit for iterating over changes
	 */
	public LayoutAlgorithm(ModelSpec model, int maxIter) {

		if (LMain.DEBUG) System.out.println("Creating Layout Object");
		// set up models
		this.model = model;

		// set up timeout
		this.maxIter = maxIter;

	}

	/**
	 * Method for laying out the entire model
	 * @return model
	 */
	public ModelSpec layout(){
		
		if (LMain.DEBUG) System.out.println("Starting Full Layout");
		
		List<Actor> invisibleActorsList = createInvisibleActors();
		
		moveXYCoordsToCenter(model);

		//nested levels (intention level)
		if (LMain.DEBUG) System.out.println("Starting Nested Level");

		for(Actor a: model.getActors()) {

			if (LMain.DEBUG) System.out.println(a.getName());

			// get nodes in this actor
			Intention[] a_intentions = a.getEmbedIntentions(model);
			if(a_intentions.length == 0) continue;

			//Cast all objects to abstractlinkableelement for initnodepositions method
			ArrayList<AbstractLinkableElement> temp_arrayList = new ArrayList<>();
			for(Intention i: a_intentions) {
				temp_arrayList.add((AbstractLinkableElement)i);
			}

			//Get VisualInfo objects for layout
			VisualInfo[] intention_nodePos = initNodePositions(temp_arrayList);
			if (LMain.DEBUG) System.out.println(Arrays.toString(intention_nodePos));

			//layout intentions
			layoutModel(intention_nodePos, false);

			//resize actor
			resizeActor(a, intention_nodePos); 
			
			if (a.getName().equals("temp-actor")) {
				if (LMain.DEBUG) System.out.println(a.getVisualInfo());
			}
			
		}

		//  level 0
		if (LMain.DEBUG) System.out.println("Starting 0th Level");

		if(model.getActors().size() == 0) 
			return model;

		//  get nodes (actors) on the zeroth level
		ArrayList<AbstractLinkableElement> temp_arrayList = new ArrayList<>();
		HashMap<Actor, VisualInfo> actorMap = new HashMap<Actor, VisualInfo>(); 
		for(Actor a: model.getActors()) {
			temp_arrayList.add((AbstractLinkableElement)a);
			if (LMain.DEBUG) System.out.println(a.getEmbedIntentions(model).length);
			VisualInfo curInfo = a.getVisualInfo();
			VisualInfo storeInfo = new VisualInfo(curInfo.getWidth(), curInfo.getHeight(), curInfo.getX(), curInfo.getY());
			actorMap.put(a, storeInfo);
		}
		VisualInfo[] lvl0_nodePos = initNodePositions(temp_arrayList);

		layoutModel(lvl0_nodePos, true);

		for (Actor a: actorMap.keySet()) {
			VisualInfo cur = a.getVisualInfo();
			VisualInfo org = actorMap.get(a);
			propagateAdjustments(a, cur.getX() - org.getX(), cur.getY() - org.getY());
		}

		moveXYCoordsToTopLeft(model);
		removeInvisibleActors(invisibleActorsList);
		
		return model;
	}


	/**
	 * Lays out nodePositions, all nodePositions apply forces on each other
	 * @param nodePositions
	 * @param hasActors - will change constants and conditions
	 * @return
	 */
	private void layoutModel(VisualInfo[] nodePositions, boolean hasActors){
		if (LMain.DEBUG) System.out.println("Starting: layoutModel");
		
		//center is where gravity force comes from 
		VisualInfo center = findCenter(nodePositions); //Used by angleBetween and checkConds.
		
		LayoutVisualizer lV = null;
		if(LMain.VISUALIZE) {
			int numActors = model.getActors().size();
			if(!hasActors) numActors = 0;
			lV = new LayoutVisualizer(nodePositions, center, numActors);
		}
     
		//constants
		speedConstant = .0002; //adjustment -- the speed at which actors move
		//TODO: solid piece wise function for speedConstant (scalable for big model)
		if(nodePositions.length < 7 && nodePositions.length > 3) speedConstant = .0006;
		else if(nodePositions.length < 4) speedConstant = .0015;
		antiConstant = Math.pow(nodePositions.length, .5); // increasing the constant decreases attraction and gravitation, but increases repulsion
		if(hasActors) {
			speedConstant = .01;
		}
		if (LMain.DEBUG) System.out.println(antiConstant);
		gravitation = 9.8/Math.sqrt(antiConstant); //gravitation forces

		ArrayList<ArrayList<VisualInfo>> nodePositionsRecord = new ArrayList<ArrayList<VisualInfo>>();

		ArrayList<Double[]> adjustments = new ArrayList<Double[]>();
		for (int k = 0; k < nodePositions.length; k++) {
			adjustments.add(new Double[]{nodePositions[k].getX(), nodePositions[k].getY()});
		} // initial positions stored

		//Layout forces applied maxIter times
		for(int i = 0; i < maxIter; i++){
			if (LMain.DEBUG) System.out.println("\n" + i + "th Iteration");
			if (LMain.DEBUG) System.out.println(Arrays.toString(nodePositions));


			for(int j = 0; j < nodePositions.length; j++){
				if (LMain.DEBUG) System.out.println(j + "th Node\n");
				for(int k = 0; k < nodePositions.length; k++){
					if(j == k) continue;
					//TODO: Force constants, sizes? How to know...
					if (LMain.DEBUG) System.out.println("Starting: layoutModel Calculations");

					double theta = angleBetween(nodePositions[k], nodePositions[j]);

					//calculate attraction and repulsion force
					attraction = makeSmall(getAttraction(nodePositions[j], nodePositions[k], antiConstant));
					repulsion = getRepulsion(nodePositions[j], nodePositions[k], antiConstant);

					//decompose attraction and repulsion, scale forces
					double x_shift = speedConstant * (attraction*Math.cos(theta) - repulsion*Math.cos(theta));
					double y_shift = speedConstant * (attraction*Math.sin(theta) - repulsion*Math.sin(theta));

					if (LMain.DEBUG) System.out.println("x_shift" + x_shift);
					if (LMain.DEBUG) System.out.println("y_shift" + y_shift);

					//apply forces to node j
					nodePositions[j].setX(nodePositions[j].getX() + x_shift);
					nodePositions[j].setY(nodePositions[j].getY() + y_shift);

					//apply forces to node k in opposite direction
					nodePositions[k].setX(nodePositions[k].getX() - x_shift);
					nodePositions[k].setY(nodePositions[k].getY() - y_shift);

				}


				//adjust positions based on gravity from the center
				double phi = angleBetween(center, nodePositions[j]);
				if (LMain.DEBUG) System.out.println("phi: " + phi);
				nodePositions[j].setX(nodePositions[j].getX() + gravitation*Math.cos(phi));
				nodePositions[j].setY(nodePositions[j].getY() + gravitation*Math.sin(phi));

			}

			if (i % 100 == 0) {
				ArrayList<VisualInfo> positions = new ArrayList<VisualInfo>();
				for(int k = 0; k < nodePositions.length; k++){
					positions.add(new VisualInfo(nodePositions[k].getWidth(), nodePositions[k].getHeight(),nodePositions[k].getX(), nodePositions[k].getY()));
				}
				nodePositionsRecord.add(positions);
			}

			//check if the layout is looking good --> if if it is, return model
			//TODO: This doesn't work as intended. 
			int numActors = model.getActors().size();
			if(!hasActors) 
				numActors = 0;
			if(checkConds(nodePositions, center, numActors)) {
				if (LMain.DEBUG) System.out.println("Conditions Met");
				//            	return model;
				break;
			}

			//update the visualizer
			if(LMain.VISUALIZE) lV.update();
			
			if (LMain.DEBUG) System.out.println(antiConstant);
		}

		ArrayList<ArrayList<Double>> diffXByNodes = new ArrayList<ArrayList<Double>>();
		ArrayList<ArrayList<Double>> diffYByNodes = new ArrayList<ArrayList<Double>>();

		for (int k = 0; k < nodePositions.length; k++) {
			ArrayList<Double> nodeDiffX = new ArrayList<Double>();
			ArrayList<Double> nodeDiffY = new ArrayList<Double>();
			for (int i = 0; i < nodePositionsRecord.size()-1; i++) {
				ArrayList<VisualInfo> intervalNodePositions = nodePositionsRecord.get(i);
				ArrayList<VisualInfo> nextIntervalNodePositions = nodePositionsRecord.get(i + 1);
				nodeDiffX.add(nextIntervalNodePositions.get(k).getX() - intervalNodePositions.get(k).getX());
				nodeDiffY.add(nextIntervalNodePositions.get(k).getY() - intervalNodePositions.get(k).getY());
			}
			diffXByNodes.add(nodeDiffX);
			diffYByNodes.add(nodeDiffY);
		}

		ArrayList<ArrayList<Double>> diffDistanceByNodes = new ArrayList<ArrayList<Double>>();

		for (int i = 0; i < diffXByNodes.size(); i++) {
			ArrayList<Double> nodeDiffDistance = new ArrayList<Double>();
			for (int j = 0; j < diffXByNodes.get(i).size(); j++) {
				double diffX = diffXByNodes.get(i).get(j);
				double diffY = diffYByNodes.get(i).get(j);
				double diffDistance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
				nodeDiffDistance.add(diffDistance);
			}
			diffDistanceByNodes.add(nodeDiffDistance);
		}

    // print out diffDistanceByNodes
	if (LMain.DEBUG) {
		System.out.println("Diff Distance by Nodes:");
		for (ArrayList<Double> nodeDiffDistance : diffDistanceByNodes) {
			for (Double diffDistance : nodeDiffDistance) {
				String formattedDiffDistance = String.format("%.3f", diffDistance);
				System.out.print(formattedDiffDistance + " ");
			}
			System.out.println();
		}
		System.out.println(Arrays.toString(nodePositions));
		System.out.println("Finished: layoutModel");
	}
}

	/*************** start of helper methods *******************/
	
	/**
	 * Find the center of the VisualInfo objects
	 * @param nodePositions
	 * @return VisualInfo object at the center who's height and width is the height and width of all the nodes
	 */
	private VisualInfo findCenter(VisualInfo[] nodePositions) { 

		VisualInfo mostLeft = nodePositions[0];
		VisualInfo mostRight = nodePositions[0];
		VisualInfo mostUpper = nodePositions[0];
		VisualInfo mostBottom = nodePositions[0];

		//find the most {left, right, upper, bottom} nodes
		for(VisualInfo nodePosition: nodePositions) {
			if((nodePosition.getX() - nodePosition.getWidth()/2) < (mostLeft.getX() - mostLeft.getWidth()/2)){
				mostLeft = nodePosition;
			}
			if((nodePosition.getX() + nodePosition.getWidth()/2) > (mostRight.getX() + mostRight.getWidth()/2)){
				mostRight = nodePosition;
			}
			if((nodePosition.getY() - nodePosition.getHeight()/2) < (mostUpper.getY() - mostUpper.getHeight()/2)){
				mostUpper = nodePosition;
			}
			if((nodePosition.getY() + nodePosition.getHeight()/2) > (mostBottom.getY() + mostBottom.getHeight()/2)){
				mostBottom = nodePosition;
			}
		}
		
		double x_left = mostLeft.getX() - mostLeft.getWidth()/2;
		double x_right = mostRight.getX() + mostRight.getWidth()/2;
		double y_upper = mostUpper.getY() - mostUpper.getHeight()/2;
		double y_bottom = mostBottom.getY() + mostBottom.getHeight()/2;

		double newX = (x_left + x_right) / 2;
		double newY = (y_upper + y_bottom) / 2;
		int newWidth = (int)(Math.abs(x_left - x_right));
		int newHeight = (int)(Math.abs(y_upper - y_bottom));

		//Create a new visualInfo object that encompasses all the nodes and has its center in the center of the nodes.
		VisualInfo center = new VisualInfo(newWidth, newHeight, newX, newY);
		
		return center;
	}
	
	/**
	 * Propagate changes from actor to its children nodes
	 * @param actor
	 * @param x_shift
	 * @param y_shift
	 */
	private void propagateAdjustments(Actor actor, double x_shift, double y_shift) {
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
	private Actor resizeActor (Actor actor, VisualInfo[] intentions) { 
		VisualInfo center = findCenter(intentions); 
		actor.setX(center.getX());
		actor.setY(center.getY());
		actor.setWidth(center.getWidth() + (2 * ACTOR_BOUNDARY_MARGIN));
		actor.setHeight(center.getHeight() + (2 * ACTOR_BOUNDARY_MARGIN));
		return actor;
	}

	/****************** mathy methods ***************/

	/**
	 * Calculate the distance between two elements
	 * @param n1
	 * @param n2
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
		if (LMain.DEBUG) System.out.println("Starting: getRepulsion");
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
	private double angleBetween(VisualInfo n1, VisualInfo n2) {
		if (LMain.DEBUG) System.out.println("Starting: angleBetween");
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

	/******************** Methods to create and remove temporary actors. *****************/
	/** Create an invisible temporary actor for each intention without an actor.
	 * @return The list of temporary actors.
	 */
	private List<Actor> createInvisibleActors(){
		if (LMain.DEBUG) System.out.println("Creating Invisible Actors");
		List<Actor> invisibleActorsList = new ArrayList<Actor>();	
		
		//Add each intention without an actor to a temporary actor.
		for(Intention i: model.getActorlessIntentions()) {
			String nodeID = "IA-" + i.getId();
			String nodeName = "IA-" + i.getName();
			String uniqueID = "IA-" + i.getUniqueID();
			Actor tempActor = new Actor(nodeID, nodeName, "basic.Actor", new String[0], uniqueID);
			tempActor.addEmbed((AbstractElement)i);
			Integer tempWidth = i.getVisualInfo().getWidth() + (2 * ACTOR_BOUNDARY_MARGIN);
			Integer tempHeight = i.getVisualInfo().getHeight() + (2 * ACTOR_BOUNDARY_MARGIN);
			tempActor.setVisualInfo(new VisualInfo(tempWidth, tempHeight, i.getVisualInfo().getX(), i.getVisualInfo().getY()));
			if (LMain.DEBUG) System.out.println(tempActor.getEmbedIntentions(model).length);
			
			model.getActors().add(tempActor);
			invisibleActorsList.add(tempActor);
		}
		return invisibleActorsList;
	}
	/** Removes all invisible temporary actor from the model and the intention embedding.
	 * @param invisibleActorsList - The list to remove elements from.
	 */
	private void removeInvisibleActors(List<Actor> invisibleActorsList){
		for(Actor tempActor: invisibleActorsList) {
			Intention[] intentionList = tempActor.getEmbedIntentions(model);
			for (Intention i : intentionList) {
				i.removeActor();
			}
			model.getActors().remove(tempActor);
		}
	}
	
	/******************** Methods for moving the XY coordinates to center and then back *****************/
	private void moveXYCoordsToCenter(ModelSpec model){
		for(Actor a: model.getActors()) {
			Intention[] a_intentions = a.getEmbedIntentions(model);
			// Updating the intentions of each actor
			for (Intention node: a_intentions){
				moveXYCoordsToCenterOfElement(node.getVisualInfo());
			}
			moveXYCoordsToCenterOfElement(a.getVisualInfo());
		}
	}
	private void moveXYCoordsToCenterOfElement(VisualInfo node){
		node.setX(node.getX() + (node.getWidth()/2));
		node.setY(node.getY() + (node.getHeight()/2));
	}
	private void moveXYCoordsToTopLeft(ModelSpec model){
		for(Actor a: model.getActors()) {
			Intention[] a_intentions = a.getEmbedIntentions(model);
			// Updating the intentions of each actor
			for (Intention node: a_intentions){
				moveXYCoordsToTopLeftOfElement(node.getVisualInfo());
			}
			moveXYCoordsToTopLeftOfElement(a.getVisualInfo());
		}
	}
	private void moveXYCoordsToTopLeftOfElement(VisualInfo node){
		node.setX(node.getX() - (node.getWidth()/2));
		node.setY(node.getY() - (node.getHeight()/2));
	}
	
	/******************** Methods for checking conditions *****************/

	/**
	 * boolean method for the overlap of two nodes
	 * @param n1
	 * @param n2
	 * @return
	 */
	private boolean isOverlapped(VisualInfo n1, VisualInfo n2) {
		double n1_xmin = n1.getX() - (n1.getSize().getWidth()/2);
		double n1_xmax = n1.getX() + (n1.getSize().getWidth()/2);
		double n1_ymin = n1.getY() - (n1.getSize().getHeight()/2);
		double n1_ymax = n1.getY() + (n1.getSize().getHeight()/2);

		double n2_xmin = n2.getX() - (n2.getSize().getWidth()/2);
		double n2_xmax = n2.getX() + (n2.getSize().getWidth()/2);
		double n2_ymin = n2.getY() - (n2.getSize().getHeight()/2);
		double n2_ymax = n2.getY() + (n2.getSize().getHeight()/2);

		//asking: is it NOT completely outside?
		return !(n1_xmin >= n2_xmax || n1_xmax <= n2_xmin || n1_ymin >= n2_ymax || n1_ymax <= n2_ymin);
	}

	/**
	 * This method determines if the nodes are close enough to each other.
	 * We construct a graph from the nodes, and if the graph is connected then it is close enough.
	 * @param nodePositions
	 * @param numActors - to know which nodes are actors
	 * @return
	 */
	private boolean isCloseEnough(VisualInfo[] nodePositions, int numActors) {
		//TODO: limits for heuristic for distance between nodes
		double edgeLength_max = 20000/(1 + 1000*Math.pow(Math.E, nodePositions.length * -1)) + 100;

		//Make a graph
		HashSet<Integer[]> edgeSet = new HashSet<Integer[]>();

		for(int i = 0; i < nodePositions.length; i++) {
			for(int j = 0; j < nodePositions.length; j++) {
				if(i == j) continue;
				double adjust_ELM = 0;
				//if either i or j are actors, increase the edgeLengthMax
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
				//if they are close enough, then add an edge between the nodes
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
	private HashSet<Integer> DFS(HashSet<Integer[]> edgeSet, HashSet<Integer> visitedSet, Integer currentVertex) {
		//label the current node as visited
		visitedSet.add(currentVertex);
		if (LMain.DEBUG) System.out.println("visitedSet: " + visitedSet);

		//get the neighbors of the currentVertex
		HashSet<Integer> neighborSet = new HashSet<>();
		for(Integer[] edge: edgeSet) {
			if(edge[0] == currentVertex) neighborSet.add(edge[1]);
		}
		//do DFS on all the non-visited neighbors
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
	private boolean checkConds(VisualInfo[] nodePositions, VisualInfo border, int numActors) {	//TODO border variable not used.
		if (LMain.DEBUG) System.out.println("Checking Conditions");
		//check that no nodes are overlapped
		for(VisualInfo n1: nodePositions) {
			for(VisualInfo n2: nodePositions) {
				if(n1 == n2) continue;
				if(isOverlapped(n1, n2))return false;
			}
		}
		//check that nodes aren't too far away
		return isCloseEnough(nodePositions, numActors);
	}

	/********* Start of other methods ******************/

	/**
	 * TODO: what's a good way to do this?
	 * @param num
	 * @param distance?
	 * @return
	 */
	private double makeSmall(Double num) {
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
	private double getHypotenuse(double base, double height) {
		return Math.sqrt(base*base + height*height);
	}

	/**
	 * Initialize the node position array, collect VisualInfo objects
	 * @param nodes - elements that will be arranged, like actors and intentions
	 * @return
	 */
	private VisualInfo[] initNodePositions(ArrayList<AbstractLinkableElement> nodes){
		if (LMain.DEBUG) System.out.println(nodes);
		VisualInfo[] nodePositions = new VisualInfo[nodes.size()];

		for(int i = 0; i < nodes.size(); i++) {
			nodePositions[i] = nodes.get(i).getVisualInfo();
		}

		return nodePositions;
	}

}	// End of Class

	/*methods not being used but may be helpful to play with later */

///**
//* Array Sum helper
//* @param arr
//* @return
//*/
//private double sum(Double[] arr){
//	int sum = 0;
//	for(Double i: arr){
//		sum += i;
//	}
//	return sum;
//}
//
//	/**
//	 * boolean method to determine if the node is outside of a border
//	 * @param n1 the node
//	 * @param n2 the border
//	 * @return
//	 */
//	private boolean isOutside(VisualInfo n1, VisualInfo n2) {
//		double n1_xmin = n1.getX();
//		double n1_xmax = n1.getX() + n1.getSize().getWidth();
//		double n1_ymin = n1.getY();
//		double n1_ymax = n1.getY() + n1.getSize().getHeight();
//
//		double n2_xmin = n2.getX();
//		double n2_xmax = n2.getX() + n2.getSize().getWidth();
//		double n2_ymin = n2.getY();
//		double n2_ymax = n2.getY() + n2.getSize().getHeight();
//
//		return (n1_xmin < n2_xmin || n1_ymin < n2_ymin || n1_xmax > n2_xmax || n1_ymax > n2_ymax);
//
//	}
//	/********* Start of methods not being used currently ******************/
//
//	/*These are methods trying to improve the layout
//	 *according to the heurstic of setting hierarchy for elements
//	 *(e.g. tasks lower than goals)
//	 */
//
//	/**
//	 * Sort Intentions types TODO: invisible actor children need to set this.actor to invisible actor!!!
//	 * @param nodePos
//	 * @param actor
//	 */
//	private void organizeIntentionTypes(VisualInfo[] nodePos, Actor actor) {
//
//		//sort nodePos
//		quicksort(nodePos, 0, nodePos.length - 1);
//
//		int i = 0;
//		//assign nodePos to goals in actor
//		for(Intention goal: model.getGoals()) {
//			if(goal.getActor() == actor) {
//				goal.setVisualInfo(nodePos[i]);
//				i++;
//			}
//		}
//
//		//tasks
//		for(Intention task: model.getTasks()) {
//			if(task.getActor() == actor) {
//				task.setVisualInfo(nodePos[i]);
//				i++;
//			}
//		}
//
//		//soft goals
//		for(Intention softgoal: model.getSoftGoals()) {
//			if(softgoal.getActor() == actor) {
//				softgoal.setVisualInfo(nodePos[i]);
//				i++;
//			}
//		}
//
//		//resources
//		for(Intention resource: model.getResources()) {
//			if(resource.getActor() == actor) {
//				resource.setVisualInfo(nodePos[i]);
//				i++;
//			}
//		}
//
//	}
//
//	/**
//	 * Sort nodePos by the Y coordinates using the quicksort algorithm
//	 * @param nodePos
//	 * @param lo
//	 * @param hi
//	 */
//	private void quicksort(VisualInfo[] nodePos, int lo, int hi) {
//		if (lo >= hi || lo < 0) return;
//
//		int p = partition(nodePos, lo, hi);
//
//		quicksort(nodePos, lo, p - 1);
//		quicksort(nodePos, p + 1, hi);
//	}
//
//	/**
//	 * Divides nodePos into two parts
//	 * @param nodePos
//	 * @param lo
//	 * @param hi
//	 * @return
//	 */
//	private int partition(VisualInfo[] nodePos, int lo, int hi) {
//		VisualInfo pivot = nodePos[hi];
//
//		int i = lo - 1;
//
//		for(int j = lo; j < hi - 1; j++) {
//			if(nodePos[j].getY() <= pivot.getY()) {
//				i += 1;
//				//swap i and j
//				VisualInfo temp = nodePos[i];
//				nodePos[i] = nodePos[j];
//				nodePos[j] = temp;
//			}
//		}
//
//		i += 1;
//		//swap i and hi
//		VisualInfo temp = nodePos[i];
//		nodePos[i] = nodePos[hi];
//		nodePos[hi] = temp;
//
//		return i;
//	}