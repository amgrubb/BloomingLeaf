/*The following part gives the merge result to the visual layout of the two models*/
//repulsion coefficient dictionary: {Set of vertices that should be grouped together}:{Value of repulsion}
//attraction coefficient dictionary: similar structure
//default attraction on each links
//default repulsion between two nodes
//default layout: evenly distributed on the coordinate
//E: repulsion coefficient
//k: attraction coefficient
var defaultCoefficientValue= 0.5; 
var numVertices = 10; 
var area = 1000*1000;
var gravityDict = new Object();
var resourcesGravity = 920; 
var taskGravity = 680; 
var softgoalGravity = 440;
var goalGravity = 0;
var IDNodeIDDict = new Object();
var imaginaryActorIdList = []
// var nodeIdNodePosDict = new Object();

class Node{
  constructor(name,x,y,connectionList,gravity,type, nodeId, actorId) {
    this.nodeName1 = name;
    this.nodeX1 = x; 
    this.nodeY1 = y; 
    this.connectedTo1 = connectionList;
    this.forcesX1 = 0;
    this.forcesY1 = 0;
    this.gravity1 = gravity;
    this.type1 = type;
    this.nodeId1 = nodeId;
    this.actorId = actorId;
  }
  set nodeX(newX){
  	this.nodeX1 = newX; 
  }
  set nodeY(newY){
  	this.nodeY1 = newY; 
  }

  // set nodeName(newName){
  // 	this.nodeName = newName;
  // }
  get parent(){
    return this.actorId; 
  }
  get nodeX(){
  	return this.nodeX1; 
  }

  get actorId1(){
  	return this.actorId;
  }

  get nodeY(){
  	return this.nodeY1;
  }

  get nodeName(){
  	return this.nodeName1;
  }

  get nodeId(){
  	return this.nodeId1;
  }

  get type(){
  	return this.type1; 
  }

  get forcesX(){
  	return this.forcesX1;
  }

  get forcesY(){
  	return this.forcesY1;
  }

  get connectedTo(){
  	return this.connectedTo1;
  }

  isConnectdTo(anotherNode){
  	if(this.connectedTo.has(anotherNode)){
  		return true;
  	}
  	else{
  		return false;
  	}
  }

  set setForcesX(newForceX){
  	this.forcesX1 = newForceX;
  }

  set setForcesY(newForceY){
  	this.forcesY1 = newForceY;
  }

  get gravity(){
  	return this.gravity1;
  }
  set gravity(gravity){
  	this.gravity1 = gravity;
  }

}

/*construct a dictionary that map id of the graph to id of the node;
id of the node to id of the graph;
node name to the node id; should be called*/
//NOTE: The model1 and model2 passed in should be the updated version
function makeDictIDToNodeID(model1, model2){
	var debugCtr = 0;
	for(var i = 0; i < model1["graph"]["cells"].length; i++){
		if(model1["graph"]["cells"][i]["type"] != "link"){
			var nodeId = model1["graph"]["cells"][i]["nodeID"];
			var graphId = model1["graph"]["cells"][i]["id"];
			var nodeName = model1["graph"]["cells"][i]["attrs"][".name"]["text"];
			IDNodeIDDict[nodeId] = graphId;
			IDNodeIDDict[graphId] = nodeId;
			IDNodeIDDict[nodeName] = nodeId;
		}
	}

	for(var j = 0; j < model2["graph"]["cells"].length; j++){
		if(model2["graph"]["cells"][j]["type"] != "link"){
			var nodeId = model2["graph"]["cells"][j]["nodeID"];
			var graphId = model2["graph"]["cells"][j]["id"];
			var nodeName = model2["graph"]["cells"][j]["attrs"][".name"]["text"];
			IDNodeIDDict[nodeId] = graphId;
			IDNodeIDDict[graphId] = nodeId;
			IDNodeIDDict[nodeName] = nodeId;
		}
	}
}
//TODO: change IDNodeIDDict


function initializaGravityDict(resultList){
	var listOfIntentions = resultList[1];
	for(var i=0; i < listOfIntentions.length; i++){
		var curIntention = listOfIntentions[i];
		if(curIntention["nodeType"] == "basic.Resource"){
			gravityDict[curIntention["nodeID"]] = resourcesGravity;
		}
		else if(curIntention["nodeType"] == "basic.Task"){
			gravityDict[curIntention["nodeID"]] = taskGravity;
		}
		else if(curIntention["nodeType"] == "basic.Goal"){
			gravityDict[curIntention["nodeID"]] = goalGravity;
		}
		else if(curIntention["nodeType"] == "basic.Softgoal"){
			gravityDict[curIntention["nodeID"]] = softgoalGravity;
		}
	}

}

//add model1 and model2 to the parameters of this function
function initializeNodes(resultList, nodeSet, model1, model2){
	//assume each node no more than 2 lines with a size of width: 150 height: 100
	initializaGravityDict(resultList);
	makeDictIDToNodeID(model1, model2)
	var width = 150; 
	var height = 100; 
	/*here construct a coordinate*/ 
	var listOfIntentions = resultList[1];
	var numIntentions = listOfIntentions.length; 
	var numXY = Math.ceil(Math.sqrt(numIntentions));
	var curXCount = 0;
	var curYCount = 0; 
	var listOfLinks = resultList[2];
	for(var i=0; i < listOfIntentions.length; i++){
		var intention = listOfIntentions[i];
		var nodeName = intention["nodeName"];
		var nodeType = intention["nodeType"];
		var connectionList = [];
		var nodeId = intention["nodeID"];
		//TODO: What to do if there is a node without actor
		var actorId = "****";
		if(typeof intention["nodeActorID"] !== 'undefined'){
			actorId = intention["nodeActorID"];
		}
		for(var k = 0; k < listOfLinks.length; k++){
			var link = listOfLinks[k];
			var src = link['linkSrcID'];
			var dest = link['linkDestID'];
			if(src == nodeId){
				var curConnection = new Object(); 
				curConnection["destId"] = dest; 
				curConnection["linkId"] = link["linkID"];
				curConnection["linkType"] = link["linkType"];
				connectionList.push(curConnection);
			}
			// else if(dest == nodeID){
			// 	connectionList.push(src);
			// }
		}
		//go to next y or stay in the same y
		if((curXCount + 1) <= numXY){
			curXCount += 1; 
			curYCount += 0; 
		}
		else{
			curXCount = 0;
			curYCount += 1;
		}
		var gravity = gravityDict[nodeId];
		var randomHeightCons = Math.random(); 
		var node = new Node(nodeName,(curXCount-1)*width,curYCount*height*randomHeightCons,connectionList,gravity, nodeType, nodeId, actorId);
		nodeSet.add(node);
	}
	//nodeName = nodeID
	//link
	//均匀分布
	//construct a coordinate system
	//TODO: construct node accordingly
	//construct clusterDictionary
	//constuct clusterDictionary
	//place each node evenly in the coordinate
	//var nodes = [node1, node2, node3...];
}


// function coefficientValue(clusterDictionary, nodeNamePair){
// 	for(var key in clusterDictionary){
// 		if(key.has(nodeNamePair)){
// 			return clusterDictionary[key];
// 		}
// 	}
// 	return defaultCoefficientValue; 
// }


/*following are actor-related code*/

class Actor{
  constructor(name,x,y,actorId, intentionList) {
    this.nodeName1 = name;
    this.nodeX1 = x; 
    this.nodeY1 = y;
    this.forcesX1 = 0;
    this.forcesY1 = 0;
    this.nodeId1 = actorId;
    this.connCtrDic = new Object(); 
    this.intentionList1 = intentionList;
    this.sizeX1 = 150;
    this.sizeY1 = 100;
    // this toAddX1 = 0; 
    // this toAddY1 = 0; 
  }
  get intentionList(){
  	return this.intentionList1;
  }
  set nodeX(newX){
  	this.nodeX1 = newX; 
  }
  // set toAddX(newToAddX){
  // 	this.toAddX1 = newToAddX;
  // }
  // set toAddY(newToAddY){
  // 	this.toAddY1 = newToAddY;
  // }
  set nodeY(newY){
  	this.nodeY1 = newY; 
  }
  get nodeX(){
  	return this.nodeX1; 
  }
  get nodeY(){
  	return this.nodeY1;
  }
  get nodeName(){
  	return this.nodeName1;
  }
  get nodeId(){
  	return this.nodeId1;
  }
  get forcesX(){
  	return this.forcesX1;
  }
  get forcesY(){
  	return this.forcesY1;
  }
  set setForcesX(newForceX){
  	this.forcesX1 = newForceX;
  }
  set setForcesY(newForceY){
  	this.forcesY1 = newForceY;
  }
  set sizeX(newX){
  	this.sizeX1 = newX;
  }
  set sizeY(newY){
  	this.sizeY1 = newY;
  }
  get sizeX(){
  	return this.sizeX1;
  }
  get sizeY(){
  	return this.sizeY1;
  }
  incCtr(actorId){
  	var curCount = this.connCtrDic[actorId]; 
  	curCount = curCount + 1; 
  	this.connCtrDic[actorId] = curCount; 
  }
  attrC(actorId){
  	var ctr = this.connCtrDic[actorId]; 
  	return ctr;
  }
}

function initializeActors(resultList,actorSet, model1, model2){
	var actors = resultList[0];
	var width = 150; 
	var height = 100; 
	/*here construct a coordinate*/ 
	var listOfActors = resultList[0];
	var numActors = listOfActors.length; 
	var numXY = Math.ceil(Math.sqrt(numActors));
	var curXCount = 0;
	var curYCount = 0; 
	var listOfLinks = resultList[2];
	var actorIntentionDic = new Object();
	for(var i=0; i < numActors; i++){
		var actor = listOfActors[i];
		var actorName = actor["nodeName"];
		var actorID = actor["nodeID"];

		var intentionList = [];
		for(var l = 0; l < actor["intentionIDs"].length; l++){
			if(! intentionList.includes(actor["intentionIDs"][l])){
				intentionList.push(actor["intentionIDs"][l])
			}
		}

		actorIntentionDic[actorID] = [];
		for(var j = 0; j < actor["intentionIDs"].length; j++){
			var intentions = actor["intentionIDs"];
			for(var k = 0; k < intentions.length; k++){
				actorIntentionDic[actorID].push(intentions[k]); 
			}
		}
		//go to next y or stay in the same y
		if((curXCount + 1) <= numXY){
			curXCount += 1; 
			curYCount += 0; 
		}
		else{
			curXCount = 0;
			curYCount += 1;
		}
		var randomHeightCons = Math.random(); 
		var actor = new Actor(actorName,(curXCount-1)*width, curYCount*height*randomHeightCons, actorID, intentionList);
		actorSet.add(actor);
	}
	for(var link in listOfLinks){
		var src = link['linkSrcID'];
		var dest = link['linkDestID'];
		var srcActor;
		var destActor;
		for(var key in actorIntentionDic){
			var curList = actorIntentionDic[key]; 
			for(var l = 0; l < curList.length; l++){
				if(curList[l] == src){
					srcActor = key;
				}
				if(curList[l] == dest){
					destActor = key;
				}
			}
		}
	}
	//initialize connectionCtrDic
	for(var actor of Array.from(actorSet).reverse()){
		//add 1 to src
		if(src == actor.nodeId){
			actor.incCtr(destActor);
		}
		//add 1 to dest
		if(dest == actor.nodeId){
			actor.incCtr(srcActor);
		}
	}
	return [curXCount,curYCount];
}

function calculateActorPosWithRec(actorSet){
	var actorsXSorted = sortActorX(actorSet);
	var actorsYSorted = sortActorY(actorSet);
	var curX = 0; 
	var curY = 0; 
	for(var i = 0; i < actorsXSorted.length; i++){
		var curNode = actorsXSorted[i];
		curNode.nodeX = curNode.nodeX + curX;
		curX += curNode.sizeX;
	}
	for(var i = 0; i < actorsYSorted.length; i++){
		var curNode = actorsYSorted[i];
		curNode.nodeY = curNode.nodeY + curY;
		curY += curNode.sizeY;
	}
}

function sortActorX(actorSet){
	var actorsXSorted = []; 
	for(var actor of actorSet){
		actorsXSorted.push(actor);
	}
	actorsXSorted.sort(function(a,b){return a.nodeX - b.nodeX});
	return actorsXSorted; 
}

function sortActorY(actorSet){
	var actorsYSorted = []; 
	for(var actor of actorSet){
		actorsYSorted.push(actor);
	}
	actorsYSorted.sort(function(a,b){return a.nodeY - b.nodeY});
	return actorsYSorted; 
}


/**************changed here****/
function moveNodesToAbsPos(nodeSet,actorSet){
	// if(withFreeNodeInfo == false){
		for(var actor of actorSet){
			var intentionList = actor.intentionList;
			for(var i = 0; i < intentionList.length; i++){
				var intentionId = intentionList[i];
				for(var node of nodeSet){
					if(node.nodeId == intentionId){
						var curX = node.nodeX; 
						var curY = node.nodeY; 
						node.nodeX = curX + actor.nodeX + 150; 
						node.nodeY = curY + actor.nodeY + 100;
					}
				}
			}
		}
}
/*end of the actor-related code*/

function changeNodePos(node, newX, newY){
	node.nodeX = newX; 
	node.nodeY = newY;
}


function setAttractionSum(curNode, nodeSet, actorSet, isActor){
	if(! isActor){
		var curName = curNode.nodeName;
		var elemSet = new Set(); 
		//clean up the value for attraction for each iteration
		// curNode.setForcesX = 0; 
		// curNode.setForcesY = 0;
		for(var node of nodeSet){
			if(node.actorId1 === curNode.actorId1){
				elemSet.add(node);
			}
		}
		for(var node of Array.from(elemSet).reverse()){
			var nodeName = node.nodeName;
			if(curName != nodeName){
				var forces = attraction(curNode, node, isActor);
				var forceX = forces[0]; 
				var forceY = forces[1];
				var curXForce = curNode.forcesX1; 
				curXForce += forceX; 
				curNode.setForcesX = curXForce;
				var curYForce = curNode.forcesY1; 
				curYForce += forceY; 
				curNode.setForcesY = curYForce; 
			}
		}
	}
	else{
		var curName = curNode.nodeName;
		//clean up the value for attraction for each iteration
		// curNode.setForcesX = 0; 
		// curNode.setForcesY = 0;
		for(var actor of Array.from(actorSet).reverse()){
			var actorName = actor.nodeName;
			if(curName != actorName){
				var forces = attraction(curNode, actor, isActor);
				var forceX = forces[0]; 
				var forceY = forces[1];
				var curXForce = curNode.forcesX; 
				curXForce += forceX; 
				curNode.setForcesX = curXForce;
				var curYForce = curNode.forcesY; 
				curYForce += forceY; 
				curNode.setForcesY = curYForce;
			}
		}
	}
}

function setRepulsionSum(curNode, nodeSet, actorSet, isActor){
	if(! isActor){
		var curName = curNode.nodeName;
		//clean up the value for attraction for each iteration
		var elemSet = new Set();
		// curNode.setForcesX = 0; 
		// curNode.setForcesY = 0; 
		for(var node of nodeSet){
			if(node.actorId1 === curNode.actorId1){
				elemSet.add(node);
			}
		}
		for(var node of Array.from(elemSet).reverse()){
			var nodeName = node.nodeName;
			if(curName !== nodeName){
				var forces = repulsion(curNode, node, isActor);
				var forceX = forces[0]; 
				var forceY = forces[1];
				var curXForce = curNode.forcesX; 
				curXForce += forceX; 
				curNode.setForcesX = curXForce;
				var curYForce = curNode.forcesY; 
				curYForce += forceY; 
				curNode.setForcesY = curYForce; 
			}
		}
	}
	else{
		var curName = curNode.nodeName;
		//clean up the value for attraction for each iteration
		// curNode.setForcesX = 0; 
		// curNode.setForcesY = 0; 
		for(var actor of Array.from(actorSet).reverse()){
			var nodeName = actor.nodeName;
			if(curName != nodeName){
				var forces = repulsion(curNode, actor, isActor);
				var forceX = forces[0]; 
				var forceY = forces[1];
				var curXForce = curNode.forcesX; 
				curXForce += forceX; 
				curNode.setForcesX = curXForce;
				var curYForce = curNode.forcesY; 
				curYForce += forceY; 
				curNode.setForcesY = curYForce; 
			}
		}
	}
}

function attraction(node1, node2, isActor){
	if(! isActor){
		var firstNumber = Math.pow((node2.nodeX - node1.nodeX),2); 
		var secondNumber = Math.pow((node1.nodeY - node2.nodeY),2);
		var d = Math.sqrt(firstNumber + secondNumber);
		var k = defaultCoefficientValue;
		var coefficient = k * Math.sqrt(area/numVertices); 
		var forceSum = 10 * Math.pow(d,2)/(100*coefficient);
		var dx = Math.sqrt(firstNumber); 
		var dy = Math.sqrt(secondNumber);
		var cos = dx/d;
		var sin = dy/d;
		var forceX = cos*forceSum; 
		var forceY = sin*forceSum;
		//direction
		if(node2.nodeX < node1.nodeX){
			forceX = -forceX;
		}
		if(node2.nodeY < node1.nodeY){
			forceY = -forceY;
		}
		var toReturn = [forceX, forceY];
		//console.log(toReturn)
		return toReturn; 
	}
	else{
		var firstNumber = Math.pow((node2.nodeX - node1.nodeX),2); 
		var secondNumber = Math.pow((node1.nodeY - node2.nodeY),2);
		var d = Math.sqrt(firstNumber + secondNumber);
		var cToMultiply = 2;
		var connectionCtr = node1.attrC(node2.nodeId);
		if(typeof connectionCtr === 'undefined'){
			connectionCtr = 0; 
		}
		var k = (1/(connectionCtr + 1)) * cToMultiply;
		var coefficient = k * Math.sqrt(area/numVertices); 
		var forceSum = Math.pow(d,2)/(Math.pow(coefficient,2));
		var dx = Math.sqrt(firstNumber); 
		var dy = Math.sqrt(secondNumber);
		var cos = dx/d;
		var sin = dy/d;
		var forceX = cos*forceSum; 
		var forceY = sin*forceSum;
		//direction
		if(node2.nodeX < node1.nodeX){
			forceX = -forceX;
		}
		if(node2.nodeY < node1.nodeY){
			forceY = -forceY;
		}
		var toReturn = [forceX, forceY];
		return toReturn; 
	}
}

function repulsion(node1, node2, isActor){
	if(! isActor){
		var firstNumber = Math.pow((node2.nodeX - node1.nodeX),2); 
		var secondNumber = Math.pow((node1.nodeY - node2.nodeY),2);
		var d = Math.sqrt(firstNumber + secondNumber);
		var k = defaultCoefficientValue;
		//coefficeintValue(clusterDictionary, [node1.nodeName, node2.nodeName]); 
		var coefficient = k* Math.sqrt(area/numVertices); 
		//* Math.sqrt(area/numVertices);
		//Think about the follwoing
		//TODOTODO: changed here
		var forceSum = 10*Math.pow(coefficient,2)/d;
		var dx = Math.sqrt(firstNumber); 
		var dy = Math.sqrt(secondNumber);
		var cos = dx/d;
		var sin = dy/d;
		var forceX = cos*forceSum; 
		var forceY = sin*forceSum;
		//direction
		if(node2.nodeX > node1.nodeX){
			forceX = -forceX;
		}
		if(node2.nodeY > node1.nodeY){
			forceY = -forceY;
		}
		var toReturn = [forceX, forceY];
		return toReturn;
	}
	else{
		var firstNumber = Math.pow((node2.nodeX - node1.nodeX),2); 
		var secondNumber = Math.pow((node1.nodeY - node2.nodeY),2);
		var d = Math.sqrt(firstNumber + secondNumber);
		var k = defaultCoefficientValue;
		//coefficeintValue(clusterDictionary, [node1.nodeName, node2.nodeName]); 
		var coefficient = k * Math.sqrt(area/numVertices);
		//TODOTODO: changed here
		var forceSum = Math.pow(coefficient,2)/(10*d);
		var dx = Math.sqrt(firstNumber); 
		var dy = Math.sqrt(secondNumber);
		var cos = dx/d;
		var sin = dy/d;
		var forceX = cos*forceSum; 
		var forceY = sin*forceSum;
		//direction
		if(node2.nodeX > node1.nodeX){
			forceX = -forceX;
		}
		if(node2.nodeY > node1.nodeY){
			forceY = -forceY;
		}
		var toReturn = [forceX, forceY];
		return toReturn;
	}
}

/*Should be called after initialization(initial position should be assigned in the
initializeNodes)*/
function adjustment(nodeSet, actorSet, moveConstant, isActor){
	if(! isActor){
		for(var node of Array.from(nodeSet).reverse()){
			node.setForcesX = 0; 
			node.setForcesY = 0;
			setAttractionSum(node,nodeSet, actorSet, isActor); 
			setRepulsionSum(node,nodeSet, actorSet, isActor);
			var moveX = moveConstant * node.forcesX1;
			var moveY = moveConstant * (node.forcesY1 + node.gravity);
			node.nodeX = node.nodeX + moveX;
			node.nodeY = node.nodeY + moveY;
		}
	}
	else{
		for(var actor of Array.from(actorSet).reverse()){
			actor.setForcesX = 0; 
			actor.setForcesY = 0;
			setAttractionSum(actor,nodeSet, actorSet, isActor); 
			setRepulsionSum(actor,nodeSet, actorSet, isActor);
			var moveX = moveConstant * actor.forcesX;
			var moveY = moveConstant * actor.forcesY;
			actor.nodeX = actor.nodeX1 + moveX; 
			actor.nodeY = actor.nodeY1 + moveY;
		}
	}
}

function listForGraphicalActors(actorSet, curZ){
  var nodes = [];
  var zCounter = curZ;
  for(var node of actorSet){
	var actorId = node.nodeId;
	if(! actorId.includes("-")){
	    var newNode = new Object();
	    newNode["type"] = "basic.Actor";
	    var newSize = new Object();
	    newSize["width"] = node.sizeX + 200; 
	    newSize["height"] = node.sizeY + 200; 
	    newNode["size"] = newSize;
	    var newPosition = new Object();
	    newPosition["x"] = node.nodeX;
	    newPosition["y"] = node.nodeY;
	    newNode["position"] = newPosition;
	    //how to deal with angle? 
	    //TODO: fix this later
	    newNode["angle"] = 0; 
	    //Changed the hash code for ids into the node ids
	    newNode["id"] = node.nodeId;
	    newNode["z"] = zCounter;
	    zCounter ++;
	    newNode["nodeID"] = node.nodeId;
	    newAttrs = new Object();
	    newName = new Object();
	    newName["text"] = node.nodeName;
	    newAttrs[".name"] = newName;
	    newLabel = new Object();
	    //TODO: The label for the actor is currently hard coded here
	    newLabel["cx"]= ((node.sizeX + 200)/4);
	    newLabel["cy"] = ((node.sizeY + 200)/10);
	    newAttrs[".label"] = newLabel;
	    newNode["attrs"] = newAttrs;

	    newNode["embeds"] = [];

	    for(var i = 0; i < node.intentionList.length; i++){
	    	if(! newNode["embeds"].includes(node.intentionList[i])){
	      		newNode["embeds"].push(node.intentionList[i]);
	      	}
	    }

	    nodes.push(newNode);
	}
  }
  return nodes;
}

function listForGraphicalNodes(nodeSet, curZ){
	var nodes = [];
	var zCounter = curZ;
	for(var node of nodeSet){
		var newNode = new Object();
		newNode["type"] = node.type;
		var newSize = new Object();
		newSize["width"] = 150; 
	    newSize["height"] = 100; 
		newNode["size"] = newSize;
		var newPosition = new Object();
		newPosition["x"] = node.nodeX;
		newPosition["y"] = node.nodeY;
		newNode["position"] = newPosition;
		//how to deal with angle? 
		//TODO: fix this later
		newNode["angle"] = 0; 
		//Changed the hash code for ids into the node ids
		newNode["id"] = node.nodeId;
		newNode["z"] = zCounter;
		zCounter ++;
		newNode["nodeID"] = node.nodeId;
		newAttrs = new Object();
		newSatValues = new Object();
		//TODO: fix the following later!
		//Incorrectly hard coded here!
		newSatValues["text"] = "";
		newAttrs[ ".satvalue"] = newSatValues; 
		newName = new Object();
		newName["text"] = node.nodeName;
		newAttrs[".name"] = newName;
		newLabel = new Object();
		//TODO: currently all cx and cy are hard coded; changes are needed here
		newLabel["cx"]= 32;
		newLabel["cy"] = 10;
		newAttrs[".label"] = newLabel;
		newNode["attrs"] = newAttrs;
		var isFreeNode = false; 
		for(var l = 0; l < imaginaryActorIdList.length; l ++){
			if(node.nodeId == imaginaryActorIdList[l]){
				isFreeNode = true;
			}
		}
		if((typeof node.parent !== 'undefined')&&(node.parent !== "****")){
			if(! isFreeNode){
				newNode["parent"] = node.parent;
			}
		}
		nodes.push(newNode);
	}
	return nodes; 
}

function setNodeIdNodePosDict(nodeIdNodePosDict,nodeSet){
	for(var node of nodeSet){
		var newPos = new Object(); 
		newPos["x"] = node.nodeX; 
		newPos["y"] = node.nodeY;
		nodeIdNodePosDict[node.nodeId] = newPos;
	}
	for(var node of nodeSet){
		nodeIdNodePosDict[node.nodeX, node.nodeY] = node.nodeId;
	}
}

function listForGraphicalLinks(nodeSet, zToStartFrom,nodeIdNodePosDict){
	var links = [];
	var linkList = [];
	for(var node of nodeSet){
		var connectionList = node.connectedTo;
		for(var k = 0; k < connectionList.length; k++){
			var connection = connectionList[k];
			var newTarget = new Object(); 
			newTarget["x"] = nodeIdNodePosDict[connection["destId"]]["x"];
			newTarget["y"] = nodeIdNodePosDict[connection["destId"]]["y"]; 
			newTarget["linkID"] = connection["linkId"];
			newTarget["linkType"] = connection["linkType"];
			//TODO: continue here
			newTarget["linkSrcID"]= node.nodeId;
			linkList.push(newTarget);
		}
	}

	for(var i = 0; i < linkList.length; i++){
		var link = linkList[i];
		var oneLinkGraphical = new Object(); 
		oneLinkGraphical["type"] = "link"; 
		var newSource = new Object(); 
		//TODO: Change here
		var sourceId = link["linkSrcID"];
		newSource["id"] = sourceId.toString(); 
		oneLinkGraphical["source"] = newSource; 
		var newTarget = new Object();
		var nodeId = nodeIdNodePosDict[link["x"],link["y"]];
		newTarget["id"] = nodeId.toString(10);
		oneLinkGraphical["target"] = newTarget;
		var newLabels = new Object(); 
		newLabels["position"] = 0.5;
		var newAttrs = new Object();
		var text = link["linkType"];
		var text1 = new Object();
		text1["text"] = text.toLowerCase();
		newAttrs["text"] = text1;
		newLabels["attrs"] = newAttrs;
		var labelList = [];
		labelList.push(newLabels);
		oneLinkGraphical["labels"] = labelList;
		oneLinkGraphical["linkID"] = link["linkID"];

		var newAttrs1 = new Object();
		var newConnection = new Object();
		newConnection["stroke"] = "#000000";
		newAttrs1[".connection"] = newConnection;
		var newMarkerSource = new Object();
		newMarkerSource["d"] = "0";
		newAttrs1[".marker-source"] = newMarkerSource;
		var newMarkerTarget = new Object();
		newMarkerTarget["stroke"] = "#000000";
		newMarkerTarget["d"] = "M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5";
		newAttrs1[".marker-target"] = newMarkerTarget;
		oneLinkGraphical["attrs"] = newAttrs1;
		oneLinkGraphical["z"] = zToStartFrom; 
		zToStartFrom ++;
		links.push(oneLinkGraphical);
	}
	return links;
}

function setCoordinatePositive(nodeSet){
	var maxNXDict = new Object();
	var maxNYDict = new Object();
	for(var node of nodeSet){
		var curX = node.nodeX;
		var curY = node.nodeY;
		var curActor = node.actorId1;
		if(typeof maxNXDict[curActor] === 'undefined'){
			maxNXDict[curActor] = 0;
		}
		if(typeof maxNYDict[curActor] === 'undefined'){
			maxNYDict[curActor] = 0;
		}

		if(curX < 0){
			if(maxNXDict[curActor] > curX){
				maxNXDict[curActor] = curX;
			}
		}
		if(curY < 0){
			if(maxNYDict[curActor] > curY){
				maxNYDict[curActor] = curY;
			}
		}
	}

	for(var node of nodeSet){
		var curId = node.actorId1;
		node.nodeX = node.nodeX - maxNXDict[curId];
		node.nodeY = node.nodeY - maxNYDict[curId];
	}
}

function getSizeOfActor(nodeSet, actorSet){
	var maxPXDict = new Object();
	var maxPYDict = new Object();
	for(var node of nodeSet){
		var curX = node.nodeX;
		var curY = node.nodeY;
		var curActor = node.parent;
		if(typeof maxPXDict[curActor] === 'undefined'){
			maxPXDict[curActor] = 150;
		}
		if(typeof maxPYDict[curActor] === 'undefined'){
			maxPYDict[curActor] = 100;
		}

		if(maxPXDict[curActor] < curX){
			maxPXDict[curActor] = curX;
		}
		if(maxPYDict[curActor] < curY){
			maxPYDict[curActor] = curY;
		}
	}
	for(var actor of actorSet){
		var actorId = actor.nodeId;
		if(typeof maxPXDict[actorId] === 'undefined'){
			maxPXDict[actorId] = 150;
		}
		if(typeof maxPYDict[actorId] === 'undefined'){
			 maxPYDict[actorId] = 100; 
		}
		var x = maxPXDict[actorId] - actor.nodeX + 300; 
		var y = maxPYDict[actorId] - actor.nodeY + 200;
		actor.sizeX = x;
		actor.sizeY = y;
	}
}

//Those fake actors have id begin with "-"
function initializeActorForFreeNodes(actorSet, nodeSet, model1, model2, curXCount, curYCount){
	var width = 150; 
	var height = 100;
	for(var node of nodeSet){
		if(node.parent == "-"){
			var i = 1; 
			if(curXCount == 0){
				i = 0;
			}
			var actorForCurFreeNode = new Actor(node.nodeName,(curXCount - i)*width, curYCount*height, "-"+node.nodeId, [node.nodeId]);
			actorSet.add(actorForCurFreeNode);
			imaginaryActorIdList.push(actorForCurFreeNode.nodeId);
			curXCount += 1; 
			curYCount += 1;
		}
	}
}


function forceDirectedAlgorithm(resultList, model1, model2){
	var numIterations = 170;
	var numConstant = 0.02;
	var nodeSet = new Set();
	var actorSet = new Set();
	var nodeIdNodePosDict = new Object();
	var xyCounts = initializeActors(resultList,actorSet, model1, model2);
	initializeNodes(resultList, nodeSet, model1, model2);
	var curXCount = xyCounts[0]; 
	var curYCount = xyCounts[1];
	if(resultList[0].length != 0){
		initializeActorForFreeNodes(actorSet,nodeSet,model1, model2, curXCount, curYCount);
	}
	for(var i = 0; i < numIterations; i++){
		adjustment(nodeSet, actorSet, numConstant,true);
		adjustment(nodeSet, actorSet, numConstant,false);
	}
	setCoordinatePositive(nodeSet);
	getSizeOfActor(nodeSet, actorSet);
	calculateActorPosWithRec(actorSet);
	moveNodesToAbsPos(nodeSet,actorSet);
	setNodeIdNodePosDict(nodeIdNodePosDict, nodeSet);
	var curZ = 1;
	var listForGraphicalActors1 = listForGraphicalActors(actorSet, curZ); 
	curZ = curZ + listForGraphicalActors1.length;
	var listForGraphicalNodes1 = listForGraphicalNodes(nodeSet, curZ);
	var curZ = curZ + listForGraphicalNodes1.length; 
	var listForGraphicalLinks1 = listForGraphicalLinks(nodeSet,curZ,nodeIdNodePosDict);
	return [listForGraphicalActors1, listForGraphicalNodes1, listForGraphicalLinks1];
}


//place all of the free nodes on the right of everything else
// function freeNodeX(nodeSet){
// 	var curMax = 0; 
// 	for(var node of nodeSet){
// 		if(!node.nodeId.includes("-")){
// 			var curX = node.nodeX;
// 			if(curX > curMax){
// 				curMax = curX;
// 			}
// 		}
// 	}
// 	return curMax;
// }

//TODO:graphical ids are important and it contains information about the graphical object!
//Need to find how they are generated to do the position modification
//inputModel1 = {"graph":{"cells":[{"type":"basic.Actor","size":{"width":240,"height":280},"position":{"x":390,"y":150},"angle":0,"id":"d42ab953-d3f8-4d4c-b223-1ccff3728a9b","z":1,"nodeID":"a001","embeds":["4053f761-5766-4bd6-9ba8-96489a5d1efd"],"attrs":{".label":{"cx":60,"cy":28.270615378918734},".name":{"text":"Actor_1"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":430,"y":260},"angle":0,"id":"4053f761-5766-4bd6-9ba8-96489a5d1efd","z":2,"nodeID":"0002","parent":"d42ab953-d3f8-4d4c-b223-1ccff3728a9b","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_2"}}}]},"model":{"actors":[{"nodeID":"a001","nodeName":"Actor_1","intentionIDs":["0002"]}],"intentions":[{"nodeActorID":"-","nodeID":"0000","nodeType":"basic.Task","nodeName":"Task_4","dynamicFunction":{"intentionID":"0000","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0001","nodeType":"basic.Task","nodeName":"Task_5","dynamicFunction":{"intentionID":"0001","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0002","nodeType":"basic.Goal","nodeName":"Goal_2","dynamicFunction":{"intentionID":"0002","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0000","linkType":"++","postType":null,"linkSrcID":"0000","linkDestID":"0001","absoluteValue":-1}],"constraints":[]},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0002","absTime":"0","evaluationValue":"(no value)"}],"previousAnalysis":null}};
//inputModel2 = {"graph":{"cells":[{"type":"basic.Actor","size":{"width":240,"height":280},"position":{"x":390,"y":150},"angle":0,"id":"d42ab953-d3f8-4d4c-b223-1ccff3728a9b","z":1,"nodeID":"a001","embeds":["4053f761-5766-4bd6-9ba8-96489a5d1efd"],"attrs":{".label":{"cx":60,"cy":28.270615378918734},".name":{"text":"Actor_1"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":430,"y":260},"angle":0,"id":"4053f761-5766-4bd6-9ba8-96489a5d1efd","z":2,"nodeID":"0002","parent":"d42ab953-d3f8-4d4c-b223-1ccff3728a9b","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_2"}}}]},"model":{"actors":[{"nodeID":"a001","nodeName":"Actor_1","intentionIDs":["0002"]}],"intentions":[{"nodeActorID":"-","nodeID":"0000","nodeType":"basic.Task","nodeName":"Task_4","dynamicFunction":{"intentionID":"0000","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0001","nodeType":"basic.Task","nodeName":"Task_5","dynamicFunction":{"intentionID":"0001","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0002","nodeType":"basic.Goal","nodeName":"Goal_2","dynamicFunction":{"intentionID":"0002","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0000","linkType":"++","postType":null,"linkSrcID":"0000","linkDestID":"0001","absoluteValue":-1}],"constraints":[]},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0002","absTime":"0","evaluationValue":"(no value)"}],"previousAnalysis":null}};
/*
1. get the name of the node
2. get the starting and the ending point of each function
3. merge those together and output a new json file that contains those merged information
cases: 
1. doesn't have intersection: 
	a. doesn't have gaps
	b. has gaps
2. have intersections: 
	left blank
*/
var nodeTimeDict1 = {};
var nodeTimeDict2 = {};
var mergedDictionary = {};

/*not finished, this function is for a way to promp the user to make selection for each segment of function*/
function createNodeTimeMap(model1, model2){
	for(var constraint in model1.constarints){
		var nodeId = constraint.constraintSrcID;
		if(!(nodeTimeDict1[nodeId] == null)){
			nodeTimeDict1[nodeId] = [constraint.absoluteValue];
		}
		else{
			nodeTimeDict1[nodeId].push(constraint.absoluteValue);
		}
	}

	for(var constraint in model2.constarints){
		var nodeId = constraint.constraintSrcID;
		if(!(nodeTimeDict2[nodeId]==null)){
			nodeTimeDict2[nodeId] = [constraint.absoluteValue];
		}
		else{
			nodeTimeDict2[nodeId].push(constraint.absoluteValue);
		}
	}

	//push maxtime to value of each node
	for(var key in nodeTimeDict1){
		nodeTimeDic1[key].push(model1.maxAbsTime);
	}
	for(var key in nodeTimeDict2){
		nodeTimeDic2[key].push(model2.maxAbsTime);
	}
}


/*this function merge two actors with the same name together*/
function mergeToOneActor(visitedActorIDSet, actor1, actor2, newNodeID){
	var actors = [actor1, actor2]; 
	var actorToReturn = new Object();
	actorToReturn["nodeID"] = newNodeID;
	actorToReturn["nodeName"] = actor1.nodeName; 
	var newIntentionIDs = new Set();
	for(var i = 0; i < actors.length; i++){
		var actor = actors[i];
		if(noRepetitionOnIntentions(visitedActorIDSet, actor)){
			for(var j = 0; j < actor.intentionIDs.length; j++){
				newIntentionIDs.add(actor.intentionIDs[j]);
			}
		}
	}
	var newIntentionIDsList = [];
	for (var item of newIntentionIDs.values()){
		if(typeof item !== 'undefined'){
			newIntentionIDsList.push(item);
		}
	}
	actorToReturn["intentionIDs"] = newIntentionIDsList;
	return actorToReturn;
}

/*
This function make sure that there is no intention in the actor to be add to the merged actors
that has been had by other actors that have names different from current actor.
*/
function noRepetitionOnIntentions(visitedActorIDSet, theActorToAdd){
	var noRepetition = true; 
	for(var i = 0; i < theActorToAdd.intentionIDs.length; i++){
		var intentionId = theActorToAdd.intentionIDs[i];
		if(visitedActorIDSet.has(intentionId)){
			noRepetition = false; 
			//TODO: will be changed into another way to handle this error
			throw "there exist an intention that is in 2 different actors";
		}
	}
	return noRepetition; 
}

/*
This function generates new nodeID for each of the actor in the new merged actors
*/
function newActorID(counter){
	var id = counter.toString();
	while (id.length < 3){
		id = '0' + id;
	}
	id = 'a' + id;
	id = id + "^^";
	return id;
}


/*This helper function updates all old actor ids into the new actor id*/
function updateActorId(model,curId, newId){
	//modify the id in the graph
	var cells = model["graph"]["cells"]; 
	for(var i = 0; i < cells.length; i++){
		if(model["graph"]["cells"][i]["type"]!= "link"){
			if(model["graph"]["cells"][i]["nodeID"] == curId){
				model["graph"]["cells"]["nodeID"] = newId;
			}
		}
	}
	//modify "nodeID" for var actor in actors
	//modify "nodeActorID" for var intention in intentions
	for(var i = 0; i < model.model.actors.length; i++){
		if(model.model.actors[i].nodeID === curId){
			model.model.actors[i].nodeID = newId;
		}
	}
	for(var i = 0; i < model.model.intentions.length; i++){
		if(model.model.intentions[i].nodeActorID === curId){
			model.model.intentions[i].nodeActorID = newId; 
		}
	}

}

/*
This function update the old ids into new ids and also update the intention id part in the following objects: 
1. Links: change linkDestID, change linkSrcID according to the new nodeID generated.
2. Change the intentionId in the dynamic function in intentions to the newId
3. Change the nodeId in the intentions into the newId
*/
function updateIntentionId(newId, curId, model, curIndex){
	for(var i = 0; i < model.model.links.length; i++){
		if(model.model.links[i].linkSrcID === curId){
			model.model.links[i].linkSrcID = newId;
		}
		if(model.model.links[i].linkDestID === curId){
			model.model.links[i].linkDestID = newId;
		}
	}
	for(var i=0 ; i < model.analysisRequest.userAssignmentsList.length; i++){
		if(model.analysisRequest.userAssignmentsList[i].intentionID === curId){
			model.analysisRequest.userAssignmentsList[i].intentionID = newId; 
		}
	}
	for(var i = 0 ; i < model.model.actors.length; i++){
		for(var j = 0; j < model.model.actors[i].intentionIDs.length; j++){
			if(model.model.actors[i].intentionIDs[j] === curId){
				model.model.actors[i].intentionIDs[j] = newId;
			}
		}
	}

	model.model.intentions[curIndex].nodeID = newId;
	model.model.intentions[curIndex].dynamicFunction.intentionID = newId;
}


/*
The follwing function merges links, actors, constraints, analysisRequest together in 2 models:
Note this should be called after intentions are merged.
*/
function mergeLinksActorsConstraintRequest(model1, model2, delta){
	/*
	merge actors:
	1. Merge actors with the same name together:
		Check whether same name , different actors? If so, raise errors, if not, add to merged actors
	3. Put leftover actors that do not have repetitive intentions into the merged actors. 
	*/
	var newActors = [];
	var actorsNameSet = new Set();
	/*
	the following is the set that contains the intention id of each 
	actor that has been visited in the algorithm
	*/
	var visitedActorIDSet = new Set();
	var actorCounter = 0;
	for(var actor1 in model1.model.actors){
		for(var actor2 in model2.model.actors){
			if(model1.model.actors[actor1].nodeName === model2.model.actors[actor2].nodeName){
				var newActorId = newActorID(actorCounter);
				var mergedActor = mergeToOneActor(visitedActorIDSet, model1.model.actors[actor1], model2.model.actors[actor2], newActorId);
				newActors.push(mergedActor);
				actorCounter ++;
				//Update all the objects in the model1 and model2 that has the old actor id into the newly generated id
				updateActorId(model1, model1.model.actors[actor1].nodeID, newActorId);
				updateActorId(model2, model2.model.actors[actor2].nodeID, newActorId);
				for(var intentionId in mergedActor.intentionIDs){
					visitedActorIDSet.add(mergedActor.intentionIDs[intentionId]);
				}
				actorsNameSet.add(model1.model.actors[actor1].nodeName);
			}
		}
	}

	//Add leftover actors in model1 and model2 into the merged actors
	models = [model1, model2];
	for(var i=0; i < models.length; i++){
		for(var actor in models[i].model.actors){
			if(!actorsNameSet.has(models[i].model.actors[actor].nodeName)){
				if(noRepetitionOnIntentions(visitedActorIDSet, models[i].model.actors[actor])){
					actorsNameSet.add(models[i].model.actors[actor].nodeName);
					for(var intentionId in models[i].model.actors[actor].intentionIDs){
						visitedActorIDSet.add(intentionId);
					}
					var newActorId = newActorID(actorCounter);
					actorCounter++;
					updateActorId(models[i], models[i].model.actors[actor].nodeID, newActorId);
					models[i].model.actors[actor].nodeID = newActorId;
					newActors.push(models[i].model.actors[actor]);
				}
			}
		}
	}

	/*
	modify links: 
	1. Add all links in model1 to the merged model's links
	2. Add all links in model2 that are not in model1 to the merged model's links
	*/
	var newLinks = [];
	var linkCount = 0
	for(var i = 0 ; i < model1.model.links.length; i++){
		var newID = createID(linkCount);
		model1.model.links[i].linkID = newID;
		linkCount ++;
		newLinks.push(model1.model.links[i]);
	}
	for(var i = 0; i < model2.model.links.length; i++){
		var isInNewLink = false;
		for(var newLink in newLinks){
			if(isSameLink(newLink,model2.model.links[i])){
				isInNewLink = true;
			}
		}
		if(!isInNewLink){
			var newID = createID(linkCount); 
			model2.model.links[i].linkID = newID; 
			linkCount ++;
			newLinks.push(model2.model.links[i]);
		}
	}

	/*
	1) Update all of the constraints & absValues in model2 
	by adding (maxTime + delta) to all of the absValues
	2) Update the analysis request
	*/
	//TODO: check repetitions of the constriants?
	var maxTime1 = model1.maxAbsTime;
	var newConstraints = []
	for(var constraint of model1.model.constraints){
		newConstraints.push(constraint);
	}
	var newConstraints2= updateAbs(model2.model.constraints,delta,maxTime1);
	for(var constraint of newConstraints2){
		newConstraints.push(constraint);
	}

	//TODO: What to do with conflict value? 
	//TODO: What is current state?
	//TODO: What to do with previous analysis?
	var newAnalysisRequest = {};
	newAnalysisRequest["userAssignmentsList"] = [];
	newAnalysisRequest["absTimePtsArr"] = [];

	/*The following block is the update to model2: ie adding delta + maxTime1 to each of the 
	absolute value*/
	for(var i = 0; i < model2.analysisRequest.userAssignmentsList.length; i++){
		var numAbs = parseInt(model2.analysisRequest.userAssignmentsList[i].absTime);
		numAbs += delta + maxTime1; 
		model2.analysisRequest.userAssignmentsList[i].absTime = numAbs.toString();
	}
	for(var i = 0; i < model2.analysisRequest.absTimePtsArr.length; i++){
		var absValNum = parseInt(model2.analysisRequest.absTimePtsArr[i]);
		absValNum += delta + maxTime;
		model2.analysisRequest.absTimePtsArr[i] = absValNum.toString();
	}

	var absTimePtsTemp = model2.analysisRequest.absTimePts.split(" ");
	var stringAbsTimePts = "";
	for(var num in absTimePtsTemp){
		var numVal = parseInt(num); 
		numVal += (delta + maxTime1); 
		stringAbsTimePts = stringAbsTimePts + numVal.toString() + " ";
	}
	stringAbsTimePts = stringAbsTimePts.substr(0, stringAbsTimePts.length - 1);
	model2.analysisRequest.absTimePts = stringAbsTimePts;
	/*The previous block is the update to model2 */

	var absTimePts = "";
	var modelNumRelTime = 0;
	var models = [model1, model2];
	for(var i = 0; i < 2; i++){
		var model = models[i];
		for(var j = 0; j < model.analysisRequest.userAssignmentsList.length; j++){
			newAnalysisRequest["userAssignmentsList"].push(model.analysisRequest.userAssignmentsList[j]);
		}
		for(var k = 0; k < model.analysisRequest.absTimePtsArr.length; k++){
			newAnalysisRequest["absTimePtsArr"].push(model.analysisRequest.absTimePtsArr[k]);
		}
		absTimePts += model.analysisRequest.absTimePts + " ";
		modelNumRelTime += parseInt(model.analysisRequest.numRelTime);
	}
	newAnalysisRequest["numRelTime"] = modelNumRelTime.toString();
	newAnalysisRequest["absTimePts"] = absTimePts.substr(0, stringAbsTimePts.length - 1);
	return [newActors, newLinks, newConstraints, newAnalysisRequest];
}


/*deal with the cases which there is neither gap nor time conflict*/
//assume model1 happens first
function noGapNoConflict(model1, model2, delta){
	/*
	Merge intentions in two models: 
	In order to prevent the repetition of the node id, whenever an intention
	with a different name is added into the newIntentions, a new node id will
	be assigned to that node. Then, all of the related object that contains
	that node id will be changed accordngly.
	*/
	var models = [model1.model, model2.model];
	var newIntentions = [];
	var newIntentionNameSet = new Set();
	var curCountForID = 0;
	for(var i = 0; i < model1.model.intentions.length; i++){
		var newID = createID(curCountForID);
		updateIntentionId(newID, model1.model.intentions[i].nodeID, model1, i);
		newIntentions.push(model1.model.intentions[i]);
		newIntentionNameSet.add(model1.model.intentions[i].nodeName);
		curCountForID ++;
	}

	for(var i = 0; i < model2.model.intentions.length; i++){
		if(!newIntentionNameSet.has(model2.model.intentions[i].nodeName)){
			var newID = createID(curCountForID);
			updateIntentionId(newID, model2.model.intentions[i].nodeID, model2, i)
			newIntentions.push(model2.model.intentions[i]);
			newIntentionNameSet.add(model2.model.intentions[i].nodeName);
			curCountForID ++;
		}
		else{
			/*
			Following updates Functions: 
			If there are intention in model2
			with the same name of another intention in model1,
			then the merged intetion will have a function type of "UD" and it 
			contains all of the function segments in model2 and the function segments 
			in model1. 
			*/
			//TODO: the function stop may need to be modified.
			for(var j=0; j < newIntentions.length; j++){
				if(newIntentions[j].nodeName === model2.model.intentions[i].nodeName){
					if(!(model2.model.intentions[i].dynamicFunction.functionSegList.length == 0)){
						if(!(newIntentions[j].dynamicFunction.functionSegList.length == 0)){
							newIntentions[j].dynamicFunction.stringDynVis = "UD";
							for(var func in model2.model.intentions[i].dynamicFunction.functionSegList){
								newIntentions[j].dynamicFunction.functionSegList.push(func);
							}
						}
						else{
							newIntentions[j].stringDynVis = model2.model.intentions[i].dynamicFunction.stringDynVis;
							for(var func in model2.model.intentions[i].dynamicFunction.functionSegList){
								newIntentions[j].dynamicFunction.functionSegList.push(func);
							}
						}
					}
				}
			}
		}
	}
	var newActors, newLinks, newConstraints, newAnalysisRequest;
	var resultArray = mergeLinksActorsConstraintRequest(model1, model2, delta);
	newActors = resultArray[0];
	newLinks = resultArray[1];
	newConstraints = resultArray[2];
	newAnalysisRequest = resultArray[3];
	//clean up "^^"s in the new ids
	newLinks = removeExtraNewLinks(newLinks);
	newConstaints = removeExtraNewConstraints(newConstraints);
	newAnalysisRequest = removeExtraNewAnalysisRequest(newAnalysisRequest);
	newIntention = removeExtraNewIntentions(newIntentions);
	newActors = removeExtraNewActors(newActors);
	return [newActors, newIntention, newLinks, newConstraints, newAnalysisRequest];
}

/*remove the extra "^^" that are put at the end of the newId generated*/
function removeExtraNewLinks(newLinks){
	for(var i = 0; i < newLinks.length; i++){
		if(newLinks[i].linkID.substr(-2) === '^^'){
			newLinks[i].linkID = newLinks[i].linkID.substr(0, newLinks[i].linkID.length - 2);
		}
		if(newLinks[i].linkSrcID.substr(-2) === '^^'){
			newLinks[i].linkSrcID = newLinks[i].linkSrcID.substr(0, newLinks[i].linkSrcID.length - 2);
		}
		if(newLinks[i].linkDestID.substr(-2) === "^^"){
			newLinks[i].linkDestID = newLinks[i].linkDestID.substr(0,newLinks[i].linkDestID.length - 2);
		}
	}
	return newLinks; 
}

/*remove the extra "^^" that are put at the end of the newId generated*/
function removeExtraNewConstraints(newConstraints){
	for(var i = 0; i < newConstraints.length; i++){
		if(newConstraints[i].constraintSrcID.substr(-2) === '^^'){
			newConstraints[i].constraintSrcID = newConstraints[i].constraintSrcID.substr(0, newConstraints[i].constraintSrcID.length - 2);
		}
	}
	return newConstraints;
}

/*remove the extra "^^" that are put at the end of the newId generated*/
function removeExtraNewAnalysisRequest(newAnalysisRequest){
	for(var i = 0; i < newAnalysisRequest.userAssignmentsList.length; i++){
		if(newAnalysisRequest.userAssignmentsList[i].intentionID.substr(-2) === '^^'){
			newAnalysisRequest.userAssignmentsList[i].intentionID = newAnalysisRequest.userAssignmentsList[i].intentionID.substr(0, newAnalysisRequest.userAssignmentsList[i].intentionID.length - 2);
		}
	}
	return newAnalysisRequest;
}

/*remove the extra "^^" that are put at the end of the newId generated*/
function removeExtraNewIntentions(newIntentions){
	for(var i = 0; i < newIntentions.length; i++){
		if(newIntentions[i].nodeActorID.substr(-2) === '^^'){
			newIntentions[i].nodeActorID = newIntentions[i].nodeActorID.substr(0, newIntentions[i].nodeActorID.length - 2);
		}
		if(newIntentions[i].nodeID.substr(-2) === '^^'){
			newIntentions[i].nodeID = newIntentions[i].nodeID.substr(0, newIntentions[i].nodeID.length - 2);
		}
		if(newIntentions[i].dynamicFunction.intentionID.substr(-2) === '^^'){
			newIntentions[i].dynamicFunction.intentionID = newIntentions[i].dynamicFunction.intentionID.substr(0, newIntentions[i].dynamicFunction.intentionID.length - 2);
		}
	}
	return newIntentions;
}

/*remove the extra "^^" that are put at the end of the newId generated*/
function removeExtraNewActors(newActors){
	for(var i = 0; i < newActors.length; i++){
		if(newActors[i].nodeID.substr(-2) === '^^'){
			newActors[i].nodeID = newActors[i].nodeID.substr(0, newActors[i].nodeID.length - 2);
		}
		for(var j = 0; j < newActors[i].intentionIDs.length; j++){
			if(newActors[i].intentionIDs[j].substr(-2) === '^^'){
				newActors[i].intentionIDs[j] = newActors[i].intentionIDs[j].substr(0, newActors[i].intentionIDs[j].length - 2);
			}
		}
	}
	return newActors;
}

/*Returns a boolean indicating whether the two inputs are the same link*/
function isSameLink(link1, link2){
	var isSame = true; 
	for(var attribute in link1){
		if(!link1[attribute] === link2[attribute]){
			isSame = false;
		}
	}
	return isSame;
}

/**
* Creates and returns a 4 digit ID for a intention
*
* @returns {String}
*/
function createID(newID) {
	var id = newID.toString();
	while (id.length < 4){
		id = '0' + id;
	}
	id = id + '^^';
	return id;
}

/*This function add the (delta + maxTime1) to all of the absolute values in the
constraints of the second model*/
function updateAbs(constraints2, delta, maxTime1){
	var updatedConstraint2 = [];
	var toAdd = maxTime1 + delta; 
	for(var constraint of constraints2){
		constraint.absoluteValue += toAdd;
		updatedConstraint2.push(constraint);
	}
	return updatedConstraint2;
}

/*deal with the cases which there is time conflict but there is gap*/
function withGapNoConflict(model1, model2){
	//TBD
	//not decided yet
}

/*deal with the cases which there is time conflict*/
function withConflict(model1, model2, delta){
	//TBD
	//not decided yet
}

/*
main function for merging models
*/
//var model1 , model2; 
function mergeModels(delta, model11, model21){
	var model1 = new Object(); 
	var model2 = new Object();
	model1 = model11;
	model2 = model21;
	delta = delta; 
	var toReturn; 
	if(delta > 0){
		toReturn = withGapNoConflict(model1, model2, delta);
	}
	else if(delta == 0){
		toReturn = noGapNoConflict(model1, model2);
	}
	else{
		toReturn = withConflict(model1, model2, delta);
	}
	return toReturn; 
}

// const fs = require('fs');
// if (process.argv.length !== 5) {
//     console.error('Invalid input');
//     process.exit(1);
// }
// else{
// 	var inputModel1;
// 	var inputModel2;
// 	var rawData1 = fs.readFileSync(process.argv[3]);
// 	inputModel1 = JSON.parse(rawData1);
// 	var rawData2 = fs.readFileSync(process.argv[4]);
// 	inputModel2 = JSON.parse(rawData2);
// 	var outPutString = ``;
// 	var resultList = mergeModels(process.argv[2], inputModel1, inputModel2);
// 	makeDictIDToNodeID(inputModel1, inputModel2);
// 	var graphicalResultList = forceDirectedAlgorithm(resultList,inputModel1, inputModel2);
// 	var resultList = mergeModels(0, inputModel1, inputModel2);
// 	makeDictIDToNodeID(inputModel1, inputModel2);
// 	var graphicalResultList = forceDirectedAlgorithm(resultList,inputModel1, inputModel2);
// 	var outPutString = "";
// 	var outPut = new Object();
// 	var graphicalCells = new Object();
// 	graphicalCells["cells"] = []; 
// 	for(var i = 0; i < graphicalResultList.length; i++){
// 		for(var j = 0; j < graphicalResultList[i].length; j++){
// 			graphicalCells["cells"].push(graphicalResultList[i][j]);
// 		}
// 	}
// 	outPut["graph"] = graphicalCells;
// 	var semanticElems = new Object();
// 	var actorsList = [];
// 	var intentionsList = [];
// 	var linksList = [];
// 	var constraintsList = [];
// 	var analysisRequestList = [];
// 	var listOfLists = [];
// 	listOfLists.push(actorsList);
// 	listOfLists.push(intentionsList);
// 	listOfLists.push(linksList);
// 	listOfLists.push(constraintsList);
// 	listOfLists.push(analysisRequestList);
// 	for(var i = 0; i < resultList.length; i++){
// 		for(var j = 0; j < resultList[i].length; j++){
// 			listOfLists[i].push(resultList[i][j]);
// 		}
// 	}
// 	semanticElems["actors"] = actorsList;
// 	semanticElems["intentions"] = intentionsList;
// 	semanticElems["links"] = linksList;
// 	semanticElems["constraints"] = constraintsList;
// 	semanticElems["analysisRequest"] = analysisRequestList;
// 	outPut["model"] = semanticElems;
// 	outPutString = JSON.stringify(outPut);
// 	//TODO: The check should end here
// 	fs.writeFile('OutputForMerge.txt', outPutString, (err) => { 
//     	// In case of a error throw err. 
//     	if (err) throw err; 
// 	});
// }
	var inputModel1 = '';
	var inputModel2 = '';
	inputModel1 = {"graph":{"cells":[{"type":"basic.Resource","size":{"width":100,"height":60},"position":{"x":290,"y":630},"angle":0,"id":"61acf411-0ff7-41a0-847a-fd6f96982a9a","z":1,"nodeID":"0000","attrs":{".satvalue":{"text":""},".name":{"text":"Yen rises"}}},{"type":"basic.Resource","size":{"width":100,"height":60},"position":{"x":180,"y":510},"angle":0,"id":"228ed439-9b86-4808-bdc9-5848aed39ce6","z":2,"nodeID":"0001","attrs":{".satvalue":{"text":""},".name":{"text":"Japanese gas price rises"}}},{"type":"basic.Resource","size":{"width":100,"height":60},"position":{"x":30,"y":510},"angle":0,"id":"cc8758c4-2504-478c-ade6-1ccade239cee","z":3,"nodeID":"0002","attrs":{".satvalue":{"text":""},".name":{"text":"US gas price rises"}}},{"type":"basic.Resource","size":{"width":100,"height":60},"position":{"x":320,"y":400},"angle":0,"id":"bc306c94-95e6-4c91-95f7-36b92a8d3f82","z":4,"nodeID":"0003","attrs":{".satvalue":{"text":""},".name":{"text":"japanese rates rise"}}},{"type":"basic.Resource","size":{"width":100,"height":60},"position":{"x":90,"y":330},"angle":0,"id":"e5e058cf-b015-489b-9c7c-4fbfd833984a","z":5,"nodeID":"0004","attrs":{".satvalue":{"text":""},".name":{"text":"gas price rises"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":340,"y":270},"angle":0,"id":"57721bf5-aab2-4865-95a5-28fb0d8a68c8","z":6,"nodeID":"0005","attrs":{".satvalue":{"text":""},".name":{"text":"lower jap  interest rates"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":50,"y":120},"angle":0,"id":"10f8fd5a-3c64-438e-99dc-8d0085cb31fe","z":7,"nodeID":"0006","attrs":{".satvalue":{"text":""},".name":{"text":"lower gas price"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":160,"y":120},"angle":0,"id":"0bc01485-514b-47f9-9ac1-6deba1997631","z":8,"nodeID":"0007","attrs":{".satvalue":{"text":""},".name":{"text":"improve mileage"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":320,"y":120},"angle":0,"id":"484c6083-edf0-45fe-a667-9c7e0d2122a0","z":9,"nodeID":"0008","attrs":{".satvalue":{"text":""},".name":{"text":"offer rebates"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":440,"y":120},"angle":0,"id":"6ef6f09b-5362-4b8b-8cc9-0d4f00666da1","z":10,"nodeID":"0009","attrs":{".satvalue":{"text":""},".name":{"text":"lower loan interest rates"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":550,"y":120},"angle":0,"id":"e77159ac-604f-44e8-b110-133208d30fc8","z":11,"nodeID":"0010","attrs":{".satvalue":{"text":""},".name":{"text":"lower sales price"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":120,"y":-20},"angle":0,"id":"09e49972-181b-4f02-af1e-703e0f9ab22d","z":12,"nodeID":"0011","attrs":{".satvalue":{"text":""},".name":{"text":"reduce operating costs"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":290,"y":-20},"angle":0,"id":"35f38416-44bc-4d5a-9464-89513f60721e","z":13,"nodeID":"0012","attrs":{".satvalue":{"text":""},".name":{"text":"lower environment\nimpact"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":450,"y":-20},"angle":0,"id":"8adfe1d5-3c88-4c4d-86d8-72d4a71f8dcc","z":14,"nodeID":"0013","attrs":{".satvalue":{"text":""},".name":{"text":"lower purchase costs"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":280,"y":-210},"angle":0,"id":"da42f582-7c3f-408d-8d63-adc1389070d5","z":15,"nodeID":"0014","attrs":{".satvalue":{"text":""},".name":{"text":"increase consumer \nappeal"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":440,"y":-210},"angle":0,"id":"cc21f5bf-4dc3-4e3b-b1e1-0d04052105cd","z":16,"nodeID":"0015","attrs":{".satvalue":{"text":""},".name":{"text":"expand markets"}}},{"type":"link","source":{"id":"61acf411-0ff7-41a0-847a-fd6f96982a9a"},"target":{"id":"228ed439-9b86-4808-bdc9-5848aed39ce6"},"labels":[{"position":0.5,"attrs":{"text":{"text":"-"}}}],"id":"db9aac46-4ed6-44d8-891f-39b8a433ab3e","z":17,"linkID":"0000","link-type":"-","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"cc8758c4-2504-478c-ade6-1ccade239cee"},"target":{"id":"e5e058cf-b015-489b-9c7c-4fbfd833984a"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"cbbc0e1f-2bc1-4aff-ab2e-a9c1cd4b9d88","z":18,"linkID":"0001","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"228ed439-9b86-4808-bdc9-5848aed39ce6"},"target":{"id":"e5e058cf-b015-489b-9c7c-4fbfd833984a"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"427e35ba-3e81-46a7-839d-90bf40bb34b0","z":19,"linkID":"0002","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"bc306c94-95e6-4c91-95f7-36b92a8d3f82"},"target":{"id":"61acf411-0ff7-41a0-847a-fd6f96982a9a"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"faf3e53d-fa33-411f-8fdb-480544394fb3","z":20,"linkID":"0003","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"bc306c94-95e6-4c91-95f7-36b92a8d3f82"},"target":{"id":"57721bf5-aab2-4865-95a5-28fb0d8a68c8"},"labels":[{"position":0.5,"attrs":{"text":{"text":"-"}}}],"id":"1c4c0328-e241-475e-9a37-c2da8ec74bdb","z":21,"linkID":"0004","link-type":"-","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"e5e058cf-b015-489b-9c7c-4fbfd833984a"},"target":{"id":"10f8fd5a-3c64-438e-99dc-8d0085cb31fe"},"labels":[{"position":0.5,"attrs":{"text":{"text":"-"}}}],"id":"3ada1ea9-61ac-4c93-9a81-bab8f826ab98","z":22,"linkID":"0005","link-type":"-","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"57721bf5-aab2-4865-95a5-28fb0d8a68c8"},"target":{"id":"e77159ac-604f-44e8-b110-133208d30fc8"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"4a5e8de6-07df-4532-9e69-dfbd86dae9ac","z":23,"linkID":"0006","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"484c6083-edf0-45fe-a667-9c7e0d2122a0"},"target":{"id":"8adfe1d5-3c88-4c4d-86d8-72d4a71f8dcc"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"bdd07a72-5706-498c-9870-127a4491ca74","z":24,"linkID":"0007","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"6ef6f09b-5362-4b8b-8cc9-0d4f00666da1"},"target":{"id":"8adfe1d5-3c88-4c4d-86d8-72d4a71f8dcc"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"ab496f6d-3b9e-4fd5-8047-5a9739233c76","z":25,"linkID":"0008","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"e77159ac-604f-44e8-b110-133208d30fc8"},"target":{"id":"8adfe1d5-3c88-4c4d-86d8-72d4a71f8dcc"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"3c072eb9-2c6f-46b0-ac96-bf37c08e09f2","z":26,"linkID":"0009","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"10f8fd5a-3c64-438e-99dc-8d0085cb31fe"},"target":{"id":"09e49972-181b-4f02-af1e-703e0f9ab22d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"50039a40-a86b-4485-bf93-46a995015a16","z":27,"linkID":"0010","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"0bc01485-514b-47f9-9ac1-6deba1997631"},"target":{"id":"09e49972-181b-4f02-af1e-703e0f9ab22d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"b4f5e26c-aa78-4b8c-80da-60dbdddbd02b","z":28,"linkID":"0011","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"09e49972-181b-4f02-af1e-703e0f9ab22d"},"target":{"id":"da42f582-7c3f-408d-8d63-adc1389070d5"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"cf8e89d8-0d38-4610-94ce-fdbd8b29e25a","z":29,"linkID":"0012","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"35f38416-44bc-4d5a-9464-89513f60721e"},"target":{"id":"da42f582-7c3f-408d-8d63-adc1389070d5"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"bea67c56-8df7-4d03-a31a-b08f8a419e51","z":30,"linkID":"0013","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"8adfe1d5-3c88-4c4d-86d8-72d4a71f8dcc"},"target":{"id":"da42f582-7c3f-408d-8d63-adc1389070d5"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"bb467359-f602-4a6f-b58a-d2607b60340b","z":31,"linkID":"0014","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":350,"y":-350},"angle":0,"id":"08c32063-b3e9-4241-85db-f56e1185817e","z":32,"nodeID":"0016","attrs":{".satvalue":{"text":""},".name":{"text":"Increase sales\nvolume"}}},{"type":"link","source":{"id":"da42f582-7c3f-408d-8d63-adc1389070d5"},"target":{"id":"08c32063-b3e9-4241-85db-f56e1185817e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"1df77fd8-2364-40e2-8eee-3d61c0743315","z":33,"linkID":"0015","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"cc21f5bf-4dc3-4e3b-b1e1-0d04052105cd"},"target":{"id":"08c32063-b3e9-4241-85db-f56e1185817e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"b4c08ff1-2537-4519-9bd7-b49ac189229c","z":34,"linkID":"0016","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":190,"y":-500},"angle":0,"id":"fff10fa0-c652-44d3-8441-7c694f442b92","z":35,"nodeID":"0017","attrs":{".satvalue":{"text":""},".name":{"text":"Increase\nToyota Sales"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":130,"y":-360},"angle":0,"id":"6d38953d-9a41-47fd-aaa4-4697a8aff603","z":36,"nodeID":"0018","attrs":{".satvalue":{"text":""},".name":{"text":"increase VW \nsales"}}},{"type":"link","source":{"id":"08c32063-b3e9-4241-85db-f56e1185817e"},"target":{"id":"fff10fa0-c652-44d3-8441-7c694f442b92"},"labels":[{"position":0.5,"attrs":{"text":{"text":"-S"}}}],"id":"45f1cbfd-0702-411c-9a7f-bbdfda678b5c","z":37,"linkID":"0017","link-type":"-S","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"fff10fa0-c652-44d3-8441-7c694f442b92"},"target":{"id":"6d38953d-9a41-47fd-aaa4-4697a8aff603"},"labels":[{"position":0.5,"attrs":{"text":{"text":"-S"}}}],"id":"d664be32-46bb-4fa2-a214-7f258ba96aed","z":38,"linkID":"0018","link-type":"-S","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"6d38953d-9a41-47fd-aaa4-4697a8aff603"},"target":{"id":"08c32063-b3e9-4241-85db-f56e1185817e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"-S"}}}],"id":"e473c704-d5cd-4266-b6e9-f57a1c3cc4fc","z":39,"linkID":"0019","link-type":"-S","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":550,"y":-500},"angle":0,"id":"cf548bf9-b748-4b30-a9d2-c99d88d20d1c","z":40,"nodeID":"0019","attrs":{".satvalue":{"text":""},".name":{"text":"Increase return\non investment -- GM"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":720,"y":-370},"angle":0,"id":"53800eee-4fb1-4795-ac63-8f26ac7aee11","z":41,"nodeID":"0020","attrs":{".satvalue":{"text":""},".name":{"text":"increase profit per\nvechile"}}},{"type":"link","source":{"id":"08c32063-b3e9-4241-85db-f56e1185817e"},"target":{"id":"cf548bf9-b748-4b30-a9d2-c99d88d20d1c"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"e0da3057-2682-47e4-95dd-da655228b296","z":42,"linkID":"0020","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"53800eee-4fb1-4795-ac63-8f26ac7aee11"},"target":{"id":"cf548bf9-b748-4b30-a9d2-c99d88d20d1c"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"27b49fee-282d-4f28-ae38-66aa508b948c","z":43,"linkID":"0021","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":580,"y":-210},"angle":0,"id":"cb5765fe-d925-4ae7-ae05-1a91a9336bb3","z":44,"nodeID":"0021","attrs":{".satvalue":{"text":""},".name":{"text":"increase sales prices"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":710,"y":-210},"angle":0,"id":"351f9dfb-41a8-454b-a189-8eeba03bfe17","z":45,"nodeID":"0022","attrs":{".satvalue":{"text":""},".name":{"text":"increase\nforeign earnings"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":840,"y":-210},"angle":0,"id":"6c20a154-6693-4faf-b34a-92db36e25f7a","z":46,"nodeID":"0023","attrs":{".satvalue":{"text":""},".name":{"text":"lower production\ncosts"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":960,"y":-210},"angle":0,"id":"89d35efc-b9e2-4f5f-a50c-04aa038c0dff","z":47,"nodeID":"0024","attrs":{".satvalue":{"text":""},".name":{"text":"increase high margin\nsales"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":720,"y":-40},"angle":0,"id":"deb7210f-47aa-458a-b76e-dd627cae458b","z":48,"nodeID":"0025","attrs":{".satvalue":{"text":""},".name":{"text":"keep labor costs\nlow"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":850,"y":-40},"angle":0,"id":"ffba5801-39b4-4b33-91c3-aea988b3bb43","z":49,"nodeID":"0026","attrs":{".satvalue":{"text":""},".name":{"text":"improve economies\nof production"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":780,"y":130},"angle":0,"id":"781e175c-61e0-48bf-80ad-7e2e4c05934d","z":50,"nodeID":"0027","attrs":{".satvalue":{"text":""},".name":{"text":"reduce raw materials\ncost"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":920,"y":130},"angle":0,"id":"64d0559f-7a85-4eef-8a26-1d83ccae509c","z":51,"nodeID":"0028","attrs":{".satvalue":{"text":""},".name":{"text":"outsource units of\nproduction"}}},{"type":"link","source":{"id":"cb5765fe-d925-4ae7-ae05-1a91a9336bb3"},"target":{"id":"53800eee-4fb1-4795-ac63-8f26ac7aee11"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"605c380c-2267-4088-9b32-4fc7fd19a50b","z":52,"linkID":"0022","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"351f9dfb-41a8-454b-a189-8eeba03bfe17"},"target":{"id":"53800eee-4fb1-4795-ac63-8f26ac7aee11"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"82124056-a375-4920-86c1-e786d36b24bd","z":53,"linkID":"0023","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"6c20a154-6693-4faf-b34a-92db36e25f7a"},"target":{"id":"53800eee-4fb1-4795-ac63-8f26ac7aee11"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"c8943812-af86-4e33-b9c0-b5f78d4293e8","z":54,"linkID":"0024","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"89d35efc-b9e2-4f5f-a50c-04aa038c0dff"},"target":{"id":"53800eee-4fb1-4795-ac63-8f26ac7aee11"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"2e5d6822-0855-44ca-a295-12dd750ae676","z":55,"linkID":"0025","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"deb7210f-47aa-458a-b76e-dd627cae458b"},"target":{"id":"6c20a154-6693-4faf-b34a-92db36e25f7a"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"90899121-a028-495b-ba3b-abd0c5b9c3a6","z":56,"linkID":"0026","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"ffba5801-39b4-4b33-91c3-aea988b3bb43"},"target":{"id":"6c20a154-6693-4faf-b34a-92db36e25f7a"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"2c096bd2-5933-49b8-80b2-0c42bf84e33f","z":57,"linkID":"0027","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"781e175c-61e0-48bf-80ad-7e2e4c05934d"},"target":{"id":"ffba5801-39b4-4b33-91c3-aea988b3bb43"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"31185b61-1c99-4c29-a1f6-e58e0857a336","z":58,"linkID":"0028","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"64d0559f-7a85-4eef-8a26-1d83ccae509c"},"target":{"id":"ffba5801-39b4-4b33-91c3-aea988b3bb43"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"569a0098-d706-4dee-9262-d4925c3ee52b","z":59,"linkID":"0029","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":840,"y":-490},"angle":0,"id":"00356b84-40dd-4f36-beda-42424c0ec5e4","z":60,"nodeID":"0029","attrs":{".satvalue":{"text":""},".name":{"text":"improve\ncar\nquality"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":1060,"y":-560},"angle":0,"id":"6999e0f7-8029-4407-bc3c-0bdcab1e3aaf","z":61,"nodeID":"0030","attrs":{".satvalue":{"text":""},".name":{"text":"improve\ncar services"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":620,"y":-710},"angle":0,"id":"377ee6e0-10a7-4fe4-91ee-9da3c0b5c6d2","z":62,"nodeID":"0031","attrs":{".satvalue":{"text":""},".name":{"text":"increase customer\nloyality"}}},{"type":"link","source":{"id":"00356b84-40dd-4f36-beda-42424c0ec5e4"},"target":{"id":"377ee6e0-10a7-4fe4-91ee-9da3c0b5c6d2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"51e98c50-f451-4eff-825b-51fa2ea27ff7","z":63,"linkID":"0030","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"6999e0f7-8029-4407-bc3c-0bdcab1e3aaf"},"target":{"id":"377ee6e0-10a7-4fe4-91ee-9da3c0b5c6d2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"8e8389f7-81cf-4771-8364-050e7ba7e8cb","z":64,"linkID":"0031","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"cb5765fe-d925-4ae7-ae05-1a91a9336bb3"},"target":{"id":"377ee6e0-10a7-4fe4-91ee-9da3c0b5c6d2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"-"}}}],"id":"359ec6ce-6852-42d6-a3d8-465f0faabdad","z":65,"linkID":"0032","link-type":"-","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"377ee6e0-10a7-4fe4-91ee-9da3c0b5c6d2"},"target":{"id":"08c32063-b3e9-4241-85db-f56e1185817e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"d8f1f2a9-258e-49a1-8d4b-fbc264ecb4e8","z":66,"linkID":"0033","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"35f38416-44bc-4d5a-9464-89513f60721e"},"target":{"id":"377ee6e0-10a7-4fe4-91ee-9da3c0b5c6d2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"4d435831-75b6-4c9e-a448-856955cba0c9","z":67,"linkID":"0035","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"e77159ac-604f-44e8-b110-133208d30fc8"},"target":{"id":"cb5765fe-d925-4ae7-ae05-1a91a9336bb3"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--"}}}],"id":"6f807004-edb5-4e53-85d5-08cfa37f7bba","z":68,"linkID":"0036","link-type":"--","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"cb5765fe-d925-4ae7-ae05-1a91a9336bb3"},"target":{"id":"e77159ac-604f-44e8-b110-133208d30fc8"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--"}}}],"id":"198bfebb-f6bd-47fa-a6de-15e745725e26","z":69,"linkID":"0037","link-type":"--","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"cb5765fe-d925-4ae7-ae05-1a91a9336bb3"},"target":{"id":"6999e0f7-8029-4407-bc3c-0bdcab1e3aaf"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"9fbc69cc-529d-4890-b02d-e3f0813f1331","z":70,"linkID":"0038","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"deb7210f-47aa-458a-b76e-dd627cae458b"},"target":{"id":"00356b84-40dd-4f36-beda-42424c0ec5e4"},"labels":[{"position":0.5,"attrs":{"text":{"text":"-"}}}],"id":"9249c975-68b9-4541-a600-ad765ed35f5c","z":71,"linkID":"0039","link-type":"-","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"61acf411-0ff7-41a0-847a-fd6f96982a9a"},"target":{"id":"351f9dfb-41a8-454b-a189-8eeba03bfe17"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"4d833723-241a-4b21-8806-3734fe83c848","z":72,"linkID":"0040","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}}]},"model":{"actors":[],"intentions":[{"nodeActorID":"-","nodeID":"0000","nodeType":"basic.Resource","nodeName":"Yen rises","dynamicFunction":{"intentionID":"0000","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0001","nodeType":"basic.Resource","nodeName":"Japanese gas price rises","dynamicFunction":{"intentionID":"0001","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0002","nodeType":"basic.Resource","nodeName":"US gas price rises","dynamicFunction":{"intentionID":"0002","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0003","nodeType":"basic.Resource","nodeName":"japanese rates rise","dynamicFunction":{"intentionID":"0003","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0004","nodeType":"basic.Resource","nodeName":"gas price rises","dynamicFunction":{"intentionID":"0004","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0005","nodeType":"basic.Goal","nodeName":"lower jap  interest rates","dynamicFunction":{"intentionID":"0005","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0006","nodeType":"basic.Goal","nodeName":"lower gas price","dynamicFunction":{"intentionID":"0006","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0007","nodeType":"basic.Goal","nodeName":"improve mileage","dynamicFunction":{"intentionID":"0007","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0008","nodeType":"basic.Goal","nodeName":"offer rebates","dynamicFunction":{"intentionID":"0008","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0009","nodeType":"basic.Goal","nodeName":"lower loan interest rates","dynamicFunction":{"intentionID":"0009","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0010","nodeType":"basic.Goal","nodeName":"lower sales price","dynamicFunction":{"intentionID":"0010","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0011","nodeType":"basic.Goal","nodeName":"reduce operating costs","dynamicFunction":{"intentionID":"0011","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0012","nodeType":"basic.Goal","nodeName":"lower environment\nimpact","dynamicFunction":{"intentionID":"0012","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0013","nodeType":"basic.Goal","nodeName":"lower purchase costs","dynamicFunction":{"intentionID":"0013","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0014","nodeType":"basic.Goal","nodeName":"increase consumer \nappeal","dynamicFunction":{"intentionID":"0014","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0015","nodeType":"basic.Goal","nodeName":"expand markets","dynamicFunction":{"intentionID":"0015","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0016","nodeType":"basic.Goal","nodeName":"Increase sales\nvolume","dynamicFunction":{"intentionID":"0016","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0017","nodeType":"basic.Goal","nodeName":"Increase\nToyota Sales","dynamicFunction":{"intentionID":"0017","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0018","nodeType":"basic.Goal","nodeName":"increase VW \nsales","dynamicFunction":{"intentionID":"0018","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0019","nodeType":"basic.Goal","nodeName":"Increase return\non investment -- GM","dynamicFunction":{"intentionID":"0019","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0020","nodeType":"basic.Goal","nodeName":"increase profit per\nvechile","dynamicFunction":{"intentionID":"0020","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0021","nodeType":"basic.Goal","nodeName":"increase sales prices","dynamicFunction":{"intentionID":"0021","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0022","nodeType":"basic.Goal","nodeName":"increase\nforeign earnings","dynamicFunction":{"intentionID":"0022","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0023","nodeType":"basic.Goal","nodeName":"lower production\ncosts","dynamicFunction":{"intentionID":"0023","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0024","nodeType":"basic.Goal","nodeName":"increase high margin\nsales","dynamicFunction":{"intentionID":"0024","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0025","nodeType":"basic.Goal","nodeName":"keep labor costs\nlow","dynamicFunction":{"intentionID":"0025","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0026","nodeType":"basic.Goal","nodeName":"improve economies\nof production","dynamicFunction":{"intentionID":"0026","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0027","nodeType":"basic.Goal","nodeName":"reduce raw materials\ncost","dynamicFunction":{"intentionID":"0027","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0028","nodeType":"basic.Goal","nodeName":"outsource units of\nproduction","dynamicFunction":{"intentionID":"0028","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0029","nodeType":"basic.Goal","nodeName":"improve\ncar\nquality","dynamicFunction":{"intentionID":"0029","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0030","nodeType":"basic.Goal","nodeName":"improve\ncar services","dynamicFunction":{"intentionID":"0030","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0031","nodeType":"basic.Goal","nodeName":"increase customer\nloyality","dynamicFunction":{"intentionID":"0031","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0000","linkType":"-","postType":null,"linkSrcID":"0000","linkDestID":"0001","absoluteValue":-1},{"linkID":"0001","linkType":"+","postType":null,"linkSrcID":"0002","linkDestID":"0004","absoluteValue":-1},{"linkID":"0002","linkType":"+","postType":null,"linkSrcID":"0001","linkDestID":"0004","absoluteValue":-1},{"linkID":"0003","linkType":"+","postType":null,"linkSrcID":"0003","linkDestID":"0000","absoluteValue":-1},{"linkID":"0004","linkType":"-","postType":null,"linkSrcID":"0003","linkDestID":"0005","absoluteValue":-1},{"linkID":"0005","linkType":"-","postType":null,"linkSrcID":"0004","linkDestID":"0006","absoluteValue":-1},{"linkID":"0006","linkType":"+","postType":null,"linkSrcID":"0005","linkDestID":"0010","absoluteValue":-1},{"linkID":"0007","linkType":"OR","postType":null,"linkSrcID":"0008","linkDestID":"0013","absoluteValue":-1},{"linkID":"0008","linkType":"OR","postType":null,"linkSrcID":"0009","linkDestID":"0013","absoluteValue":-1},{"linkID":"0009","linkType":"OR","postType":null,"linkSrcID":"0010","linkDestID":"0013","absoluteValue":-1},{"linkID":"0010","linkType":"OR","postType":null,"linkSrcID":"0006","linkDestID":"0011","absoluteValue":-1},{"linkID":"0011","linkType":"OR","postType":null,"linkSrcID":"0007","linkDestID":"0011","absoluteValue":-1},{"linkID":"0012","linkType":"OR","postType":null,"linkSrcID":"0011","linkDestID":"0014","absoluteValue":-1},{"linkID":"0013","linkType":"OR","postType":null,"linkSrcID":"0012","linkDestID":"0014","absoluteValue":-1},{"linkID":"0014","linkType":"OR","postType":null,"linkSrcID":"0013","linkDestID":"0014","absoluteValue":-1},{"linkID":"0015","linkType":"OR","postType":null,"linkSrcID":"0014","linkDestID":"0016","absoluteValue":-1},{"linkID":"0016","linkType":"OR","postType":null,"linkSrcID":"0015","linkDestID":"0016","absoluteValue":-1},{"linkID":"0017","linkType":"-S","postType":null,"linkSrcID":"0016","linkDestID":"0017","absoluteValue":-1},{"linkID":"0018","linkType":"-S","postType":null,"linkSrcID":"0017","linkDestID":"0018","absoluteValue":-1},{"linkID":"0019","linkType":"-S","postType":null,"linkSrcID":"0018","linkDestID":"0016","absoluteValue":-1},{"linkID":"0020","linkType":"AND","postType":null,"linkSrcID":"0016","linkDestID":"0019","absoluteValue":-1},{"linkID":"0021","linkType":"AND","postType":null,"linkSrcID":"0020","linkDestID":"0019","absoluteValue":-1},{"linkID":"0022","linkType":"OR","postType":null,"linkSrcID":"0021","linkDestID":"0020","absoluteValue":-1},{"linkID":"0023","linkType":"OR","postType":null,"linkSrcID":"0022","linkDestID":"0020","absoluteValue":-1},{"linkID":"0024","linkType":"OR","postType":null,"linkSrcID":"0023","linkDestID":"0020","absoluteValue":-1},{"linkID":"0025","linkType":"OR","postType":null,"linkSrcID":"0024","linkDestID":"0020","absoluteValue":-1},{"linkID":"0026","linkType":"AND","postType":null,"linkSrcID":"0025","linkDestID":"0023","absoluteValue":-1},{"linkID":"0027","linkType":"AND","postType":null,"linkSrcID":"0026","linkDestID":"0023","absoluteValue":-1},{"linkID":"0028","linkType":"OR","postType":null,"linkSrcID":"0027","linkDestID":"0026","absoluteValue":-1},{"linkID":"0029","linkType":"OR","postType":null,"linkSrcID":"0028","linkDestID":"0026","absoluteValue":-1},{"linkID":"0030","linkType":"+","postType":null,"linkSrcID":"0029","linkDestID":"0031","absoluteValue":-1},{"linkID":"0031","linkType":"+","postType":null,"linkSrcID":"0030","linkDestID":"0031","absoluteValue":-1},{"linkID":"0032","linkType":"-","postType":null,"linkSrcID":"0021","linkDestID":"0031","absoluteValue":-1},{"linkID":"0033","linkType":"+","postType":null,"linkSrcID":"0031","linkDestID":"0016","absoluteValue":-1},{"linkID":"0035","linkType":"+","postType":null,"linkSrcID":"0012","linkDestID":"0031","absoluteValue":-1},{"linkID":"0036","linkType":"--","postType":null,"linkSrcID":"0010","linkDestID":"0021","absoluteValue":-1},{"linkID":"0037","linkType":"--","postType":null,"linkSrcID":"0021","linkDestID":"0010","absoluteValue":-1},{"linkID":"0038","linkType":"+","postType":null,"linkSrcID":"0021","linkDestID":"0030","absoluteValue":-1},{"linkID":"0039","linkType":"-","postType":null,"linkSrcID":"0025","linkDestID":"0029","absoluteValue":-1},{"linkID":"0040","linkType":"+","postType":null,"linkSrcID":"0000","linkDestID":"0022","absoluteValue":-1}],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0000","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0001","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0002","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0003","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0004","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0005","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0006","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0007","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0008","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0009","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0010","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0011","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0012","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0013","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0014","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0015","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0016","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0017","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0018","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0019","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0020","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0021","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0022","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0023","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0024","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0025","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0026","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0027","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0028","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0029","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0030","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0031","absTime":"0","evaluationValue":"(no value)"}],"previousAnalysis":null}};
	//{"graph":{"cells":[{"type":"basic.Actor","size":{"width":330,"height":280},"position":{"x":310,"y":180},"angle":0,"id":"a4f91bd4-9259-4006-93b4-2da136b148cd","z":-1,"nodeID":"aNaN","embeds":["37a9312f-66d5-4305-a33e-b700865a046d","af433156-e2d5-4d98-a0b3-97d39d76f677","42e00225-ffd6-45d8-8774-1b5508153674","98bd1291-e5de-4e1f-ae94-6096275b7a27","61f4c814-56d5-4aaa-ad7c-5f98cf18f261","abc5f00c-eb04-4538-a0ad-468c23f37da2","72533443-52a6-44e1-89c7-0c81f3e45425"],"attrs":{".label":{"cx":82.5,"cy":28.270615378919},".name":{"text":"Spadina\nProject","font-size":13}}},{"type":"basic.Actor","size":{"width":130,"height":120},"position":{"x":220,"y":200},"angle":0,"id":"f2cf28b4-cf4a-4308-ae36-551b859c45b0","z":0,"nodeID":"a001","embeds":["0feb280b-d95d-470e-bea0-4901a69ebfd9"],"attrs":{".label":{"cx":32.5,"cy":12.353299855639},".name":{"text":"Metro","font-size":13}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":430,"y":190},"angle":0,"id":"af433156-e2d5-4d98-a0b3-97d39d76f677","z":2,"nodeID":"0000","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":""},".name":{"text":"Have Spadina\nExpressway","font-size":13}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":320,"y":300},"angle":0,"id":"42e00225-ffd6-45d8-8774-1b5508153674","z":3,"nodeID":"0001","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Plan Project","font-size":13},".label":{"cx":25,"cy":6.3833753244528}}},{"type":"basic.Goal","size":{"width":90,"height":60},"position":{"x":420,"y":290},"angle":0,"id":"98bd1291-e5de-4e1f-ae94-6096275b7a27","z":4,"nodeID":"0002","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding","font-size":13},".label":{"cx":22.5,"cy":6.3833753244527855}}},{"type":"basic.Goal","size":{"width":90,"height":60},"position":{"x":530,"y":280},"angle":0,"id":"61f4c814-56d5-4aaa-ad7c-5f98cf18f261","z":5,"nodeID":"0003","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":""},".name":{"text":"Build Spadina\nExpressway","font-size":13},".label":{"cx":22.5,"cy":6.3833753244527855}}},{"type":"basic.Goal","size":{"width":90,"height":60},"position":{"x":410,"y":390},"angle":0,"id":"72533443-52a6-44e1-89c7-0c81f3e45425","z":6,"nodeID":"0004","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":""},".name":{"text":"Connected\nExpressway","font-size":13},".label":{"cx":22.5,"cy":6.3833753244527855}}},{"type":"basic.Goal","size":{"width":90,"height":60},"position":{"x":500,"y":370},"angle":0,"id":"abc5f00c-eb04-4538-a0ad-468c23f37da2","z":7,"nodeID":"0005","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":""},".name":{"text":"Terminal\nExpressway","font-size":13},".label":{"cx":22.5,"cy":6.3833753244527855}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":240,"y":390},"angle":0,"id":"4972530a-4b6b-4a3b-b90c-73913b2e036c","z":8,"nodeID":"0006","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding\nFrom Metro","font-size":13}}},{"type":"basic.Task","size":{"width":110,"height":60},"position":{"x":220,"y":240},"angle":0,"id":"0feb280b-d95d-470e-bea0-4901a69ebfd9","z":9,"nodeID":"0007","parent":"f2cf28b4-cf4a-4308-ae36-551b859c45b0","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Approve Project\nFunding","font-size":13},".label":{"cx":27.5,"cy":6.3833753244528}}},{"type":"link","source":{"id":"42e00225-ffd6-45d8-8774-1b5508153674"},"target":{"id":"af433156-e2d5-4d98-a0b3-97d39d76f677"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"b9ac4786-3267-4405-90ed-8c70ce52211a","z":10,"linkID":"0000","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"98bd1291-e5de-4e1f-ae94-6096275b7a27"},"target":{"id":"af433156-e2d5-4d98-a0b3-97d39d76f677"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"022d7b89-5c92-4d25-bdab-4699d93de0fd","z":11,"linkID":"0001","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"61f4c814-56d5-4aaa-ad7c-5f98cf18f261"},"target":{"id":"af433156-e2d5-4d98-a0b3-97d39d76f677"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"0b39aa13-f3f3-434e-b2ba-2fda12b4e685","z":12,"linkID":"0002","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"72533443-52a6-44e1-89c7-0c81f3e45425"},"target":{"id":"61f4c814-56d5-4aaa-ad7c-5f98cf18f261"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"37a9312f-66d5-4305-a33e-b700865a046d","z":13,"linkID":"0003","link-type":"OR","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","vertices":[{"x":510,"y":350}],"attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"abc5f00c-eb04-4538-a0ad-468c23f37da2"},"target":{"id":"61f4c814-56d5-4aaa-ad7c-5f98cf18f261"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"1c91a5b8-d06f-4879-86ac-321effaf5b5e","z":14,"linkID":"0004","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"4972530a-4b6b-4a3b-b90c-73913b2e036c"},"target":{"id":"98bd1291-e5de-4e1f-ae94-6096275b7a27"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"dc5acb62-a5ce-4b2f-859a-9c42e5cb2431","z":15,"linkID":"0005","link-type":"++S","vertices":[{"x":390,"y":400}],"attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"0feb280b-d95d-470e-bea0-4901a69ebfd9"},"target":{"id":"4972530a-4b6b-4a3b-b90c-73913b2e036c"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"2b9e1d45-a542-4dac-9364-cd35fd969b01","z":16,"linkID":"0006","link-type":"++","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}}]},"model":{"actors":[{"nodeID":"a000","nodeName":"Spadina\nProject","intentionIDs":["0000","0001","0002","0001","0002","0003","0004","0005","0005","0006","0000","0001","0002","0003","0004","0005","0002","0001","0001","0002","0003","0003","0002","0002","0003","0003","0004","0005","0000","0001","0002","0003","0004","0005","0003","0004","0005","0003","0003","0005","0002"]},{"nodeID":"a001","nodeName":"Metro","intentionIDs":["0007","0007","0007","0007","0007","0007","0007"]},{"nodeID":"aNaN","nodeName":"Spadina\nProject","intentionIDs":["0000","0001","0003","0002","0001","0000","0003","0002","0004","0005","0003","0002","0002","0002","0001","0000","0003","0005","0004","0000","0003","0002","0005","0004","0001","0003","0005","0003","0002","0001","0001","0001","0002","0003","0005","0005","0005","0004","0004"]}],"intentions":[{"nodeActorID":"aNaN","nodeID":"0000","nodeType":"basic.Goal","nodeName":"Have Spadina\nExpressway","dynamicFunction":{"intentionID":"0000","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"aNaN","nodeID":"0001","nodeType":"basic.Task","nodeName":"Plan Project","dynamicFunction":{"intentionID":"0001","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"aNaN","nodeID":"0002","nodeType":"basic.Goal","nodeName":"Get Funding","dynamicFunction":{"intentionID":"0002","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"aNaN","nodeID":"0003","nodeType":"basic.Goal","nodeName":"Build Spadina\nExpressway","dynamicFunction":{"intentionID":"0003","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"aNaN","nodeID":"0004","nodeType":"basic.Goal","nodeName":"Connected\nExpressway","dynamicFunction":{"intentionID":"0004","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"aNaN","nodeID":"0005","nodeType":"basic.Goal","nodeName":"Terminal\nExpressway","dynamicFunction":{"intentionID":"0005","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0006","nodeType":"basic.Task","nodeName":"Get Funding\nFrom Metro","dynamicFunction":{"intentionID":"0006","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0007","nodeType":"basic.Task","nodeName":"Approve Project\nFunding","dynamicFunction":{"intentionID":"0007","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}}],"links":[{"linkID":"0000","linkType":"AND","postType":null,"linkSrcID":"0001","linkDestID":"0000","absoluteValue":-1},{"linkID":"0001","linkType":"AND","postType":null,"linkSrcID":"0002","linkDestID":"0000","absoluteValue":-1},{"linkID":"0002","linkType":"AND","postType":null,"linkSrcID":"0003","linkDestID":"0000","absoluteValue":-1},{"linkID":"0003","linkType":"OR","postType":null,"linkSrcID":"0004","linkDestID":"0003","absoluteValue":-1},{"linkID":"0004","linkType":"OR","postType":null,"linkSrcID":"0005","linkDestID":"0003","absoluteValue":-1},{"linkID":"0005","linkType":"++S","postType":null,"linkSrcID":"0006","linkDestID":"0002","absoluteValue":-1},{"linkID":"0006","linkType":"++","postType":null,"linkSrcID":"0007","linkDestID":"0006","absoluteValue":-1}],"constraints":[{"constraintType":"A","constraintSrcID":"0007","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":-1}],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0000","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0001","absTime":"0","evaluationValue":"0011"},{"intentionID":"0002","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0003","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0004","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0005","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0006","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0007","absTime":"0","evaluationValue":"1100"}],"previousAnalysis":null}};
	//{"graph":{"cells":[{"type":"basic.Actor","size":{"width":490,"height":310},"position":{"x":120,"y":70},"angle":0,"id":"e09e5b23-ef86-40c0-9760-7de8dcebfc44","z":0,"nodeID":"a003","embeds":["4f7ddad8-27b6-4fa7-b8e8-4d0afc231c5a","ce0f26d6-45d4-4f12-a3c4-0f9b6dff59f8"],"attrs":{".label":{"cx":122.5,"cy":31.255033489030836},".name":{"text":"Actor_3"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":210,"y":170},"angle":0,"id":"19392d55-e2f9-4c08-8b91-aee543d88fe3","z":1,"nodeID":"0005","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":430,"y":200},"angle":0,"id":"4f7ddad8-27b6-4fa7-b8e8-4d0afc231c5a","z":2,"nodeID":"0006","parent":"e09e5b23-ef86-40c0-9760-7de8dcebfc44","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_6"}}},{"type":"link","source":{"id":"4f7ddad8-27b6-4fa7-b8e8-4d0afc231c5a"},"target":{"id":"19392d55-e2f9-4c08-8b91-aee543d88fe3"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"6d39f2eb-e1eb-470f-80ed-3fbfb9250a9b","z":3,"linkID":"0000","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":210,"y":270},"angle":0,"id":"ce0f26d6-45d4-4f12-a3c4-0f9b6dff59f8","z":4,"nodeID":"0007","parent":"e09e5b23-ef86-40c0-9760-7de8dcebfc44","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_7"}}},{"type":"link","source":{"id":"ce0f26d6-45d4-4f12-a3c4-0f9b6dff59f8"},"target":{"id":"19392d55-e2f9-4c08-8b91-aee543d88fe3"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"083c794f-561a-468f-85ce-e55a1a8e0beb","z":5,"linkID":"0001","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}}]},"model":{"actors":[{"nodeID":"a003","nodeName":"Actor_3","intentionIDs":["0006","0007"]}],"intentions":[{"nodeActorID":"-","nodeID":"0005","nodeType":"basic.Goal","nodeName":"Goal_5","dynamicFunction":{"intentionID":"0005","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0006","nodeType":"basic.Goal","nodeName":"Goal_6","dynamicFunction":{"intentionID":"0006","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0007","nodeType":"basic.Goal","nodeName":"Goal_7","dynamicFunction":{"intentionID":"0007","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0000","linkType":"AND","postType":null,"linkSrcID":"0006","linkDestID":"0005","absoluteValue":-1},{"linkID":"0001","linkType":"AND","postType":null,"linkSrcID":"0007","linkDestID":"0005","absoluteValue":-1}],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0005","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0006","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0007","absTime":"0","evaluationValue":"(no value)"}],"previousAnalysis":null}};
	//{"graph":{"cells":[{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":140,"y":80},"angle":0,"id":"19392d55-e2f9-4c08-8b91-aee543d88fe3","z":1,"nodeID":"0005","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":560,"y":80},"angle":0,"id":"4f7ddad8-27b6-4fa7-b8e8-4d0afc231c5a","z":2,"nodeID":"0006","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_6"}}},{"type":"link","source":{"id":"4f7ddad8-27b6-4fa7-b8e8-4d0afc231c5a"},"target":{"id":"19392d55-e2f9-4c08-8b91-aee543d88fe3"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"6d39f2eb-e1eb-470f-80ed-3fbfb9250a9b","z":3,"linkID":"0000","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}}]},"model":{"actors":[],"intentions":[{"nodeActorID":"-","nodeID":"0005","nodeType":"basic.Goal","nodeName":"Goal_5","dynamicFunction":{"intentionID":"0005","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0006","nodeType":"basic.Goal","nodeName":"Goal_6","dynamicFunction":{"intentionID":"0006","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0000","linkType":"AND","postType":null,"linkSrcID":"0006","linkDestID":"0005","absoluteValue":-1}],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0005","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0006","absTime":"0","evaluationValue":"(no value)"}],"previousAnalysis":null}};
	inputModel2 = {"graph":{"cells":[]},"model":{"actors":[],"intentions":[],"links":[],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[],"previousAnalysis":null}};
	var resultList = mergeModels(0, inputModel1, inputModel2);
	makeDictIDToNodeID(inputModel1, inputModel2);
	var graphicalResultList = forceDirectedAlgorithm(resultList,inputModel1, inputModel2);
	var outPutString = "";
	var outPut = new Object();
	var graphicalCells = new Object();
	graphicalCells["cells"] = []; 
	for(var i = 0; i < graphicalResultList.length; i++){
		for(var j = 0; j < graphicalResultList[i].length; j++){
			graphicalCells["cells"].push(graphicalResultList[i][j]);
		}
	}
	outPut["graph"] = graphicalCells;
	var semanticElems = new Object();
	var actorsList = [];
	var intentionsList = [];
	var linksList = [];
	var constraintsList = [];
	var analysisRequestList = [];
	var listOfLists = [];
	listOfLists.push(actorsList);
	listOfLists.push(intentionsList);
	listOfLists.push(linksList);
	listOfLists.push(constraintsList);
	listOfLists.push(analysisRequestList);
	for(var i = 0; i < resultList.length; i++){
		for(var j = 0; j < resultList[i].length; j++){
			listOfLists[i].push(resultList[i][j]);
		}
	}
	semanticElems["actors"] = actorsList;
	semanticElems["intentions"] = intentionsList;
	semanticElems["links"] = linksList;
	semanticElems["constraints"] = constraintsList;
	semanticElems["analysisRequest"] = analysisRequestList;
	outPut["model"] = semanticElems;
	outPutString = JSON.stringify(outPut);
	console.log(outPutString);

