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
var resourcesGravity = 60; 
var taskGravity = 40; 
var softgoalGravity = 20;
var goalGravity = 0;
var IDNodeIDDict = new Object();
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
		var node = new Node(nodeName,(curXCount-1)*width,curYCount*height,connectionList,gravity, nodeType, nodeId, actorId);
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
	for(var i=0; i < listOfActors.length; i++){
		var actor = listOfActors[i];
		var actorName = actor["nodeName"];
		var actorID = actor["nodeID"];
		var intentionList = actor["intentionIDs"];
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
		var actor = new Actor(actorName,(curXCount-1)*width, curYCount*height, actorID, intentionList);
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
	console.log(actorSet);
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
		var curNode = actorYSorted[i];
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
						node.nodeX = curX + actor.nodeX + 30; 
						node.nodeY = curY + actor.nodeY + 30;
					}
				}
			}
		}
	// }
	// else{
	// 	for(var node of nodeSet){
	// 		//cases that curNode doesn't belong to any actor
	// 		if(node.nodeId === "-"){
	// 			var curX = node.nodeX; 
	// 			var curY = node.nodeY; 
	// 			node.nodeX = curX + freeNodeXInfo + 230; 
	// 			node.nodeY = curY + freeNodeXInfo + 230;
	// 		}
	// 	}
	// }
}
/*end of the actor-related code*/

function changeNodePos(node, newX, newY){
	node.nodeX = newX; 
	node.nodeY = newY;
}


function setAttractionSum(curNode, nodeSet, actorSet, isActor){
	if(! isActor){
		var curName = curNode.nodeName;
		//clean up the value for attraction for each iteration
		curNode.setForcesX = 0; 
		curNode.setForcesY = 0;
		for(var node of Array.from(nodeSet).reverse()){
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
		curNode.setForcesX = 0; 
		curNode.setForcesY = 0;
		for(var actor of Array.from(actorSet).reverse()){
			var actorName = actor.nodeName;
			if(curName != actorName){
				var forces = attraction(curNode, actor, isActor);
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
}

function setRepulsionSum(curNode, nodeSet, actorSet, isActor){
	if(! isActor){
		var curName = curNode.nodeName;
		//clean up the value for attraction for each iteration
		curNode.setForcesX = 0; 
		curNode.setForcesY = 0; 
		for(var node of Array.from(nodeSet).reverse()){
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
		curNode.setForcesX = 0; 
		curNode.setForcesY = 0; 
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
	else{
		var firstNumber = Math.pow((node2.nodeX - node1.nodeX),2); 
		var secondNumber = Math.pow((node1.nodeY - node2.nodeY),2);
		var d = Math.sqrt(firstNumber + secondNumber);
		var cToMultiply = 2000;
		var k = (1/node1.attrC(node2.nodeId)) * cToMultiply;
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
		var coefficient = k * Math.sqrt(area/numVertices);
		//Think about the follwoing
		var forceSum = -Math.pow(coefficient,2)/d;
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
	else{
		var firstNumber = Math.pow((node2.nodeX - node1.nodeX),2); 
		var secondNumber = Math.pow((node1.nodeY - node2.nodeY),2);
		var d = Math.sqrt(firstNumber + secondNumber);
		var k = defaultCoefficientValue;
		//coefficeintValue(clusterDictionary, [node1.nodeName, node2.nodeName]); 
		var coefficient = k * Math.sqrt(area/numVertices);
		var forceSum = -Math.pow(coefficient,2)/d;
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

/*Should be called after initialization(initial position should be assigned in the
initializeNodes)*/
function adjustment(nodeSet, actorSet, moveConstant, isActor){
	if(! isActor){
		for(var node of Array.from(nodeSet).reverse()){
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
			setAttractionSum(actor,nodeSet, actorSet, isActor); 
			setRepulsionSum(actor,nodeSet, actorSet, isActor);
			var moveX = moveConstant * actor.forcesX1;
			var moveY = moveConstant * actor.forcesY1;
			actor.nodeX = actor.nodeX + moveX; 
			actor.nodeY = actor.nodeY + moveY;
		}
	}
}

function listForGraphicalActors(actorSet, curZ){
  var nodes = [];
  var zCounter = curZ;
  for(var node of actorSet){
	var actorId = node.nodeId;
	if(!actorId.contains("-")){
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
	    newLabel["cx"]= node.nodeX + ((node.sizeX + 200)/4);
	    newLabel["cy"] = node.nodeY + ((node.sizeY + 200)/10);
	    newAttrs[".label"] = newLabel;
	    newNode["attrs"] = newAttrs;

	    newNode["embeds"] = [];
	    for(var i = 0; i < node.intentionList.length; i++){
	      newNode["embeds"].push(node.intentionList[i]);
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
		if((typeof node.parent !== 'undefined')&&(node.parent !== "****")){
			newNode["parent"] = node.parent;
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
		var curActor = node.actorId1;
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
		actor.sizeX = maxPXDict[actorId] - actor.nodeX;
		actor.sizeY = maxPYDict[actorId] - actor.nodeY;
	}
}

//Those fake actors have id begin with "-"
function initializeActorForFreeNodes(actorSet, nodeSet, model1, model2, curXCount, curYCount){
	var width = 150; 
	var height = 100; 
	for(var node of nodeSet){
		if(node.nodeId == "-"){
			var actorForCurFreeNode = new Actor(node.nodeName,(curXCount-1)*width, curYCount*height, "-"+node.nodeId, [node.nodeId]);
			actorSet.add(actorForCurFreeNode);
		}
	}
}


function forceDirectedAlgorithm(resultList, model1, model2){
	var numIterations = 20;
	var numConstant = 0.2;
	var nodeSet = new Set();
	var actorSet = new Set();
	var nodeIdNodePosDict = new Object();
	var xyCounts = initializeActors(resultList,actorSet, model1, model2);
	initializeNodes(resultList, nodeSet, model1, model2);
	var curXCount = xyCounts[0]; 
	var curYCount = xyCounts[1];
	initializeActorForFreeNodes(actorSet,nodeSet,model1, model2, curXCount, curYCount);
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
inputModel1 = {"graph":{"cells":[{"type":"basic.Actor","size":{"width":700,"height":660},"position":{"x":610,"y":-40},"angle":0,"id":"efa04acb-d47a-4a21-83e3-b47fdd44b678","z":0,"nodeID":"a001","embeds":["5dab723e-919e-435d-ab88-f5cbf8afe8a4","fa87d72b-085c-4f4a-a0c5-94e1bf820932","c651b21f-314f-440a-8a94-c9aaa6c121b0","197c7d1e-7e79-43ad-8a11-4171f8531d37","ef20a43c-59c5-472d-b245-e6538edfae75","5f0a754b-edc8-4946-9c16-ee882d9e1721","1b64043d-75ee-4031-9a50-586e7ca28fe1","bdb7b9aa-a315-4833-a28e-8674e1d93fac"],"attrs":{".label":{"cx":175,"cy":66.07290995472033},".name":{"text":"System"}}},{"type":"basic.Actor","size":{"width":650,"height":620},"position":{"x":-320,"y":-20},"angle":0,"id":"aafda867-bef8-477b-b527-587f929222da","z":1,"nodeID":"a000","embeds":["23696026-dec8-4bb2-9af4-202ddd11a629","c4d426d5-08f7-4504-bd5a-9ebec1ad3e73","6b0535b1-d0d8-4e86-af56-9bba92ec73d0","745ad573-dfdd-4713-9c1b-292fd4ab5a4f","366ffc71-3732-4a8a-9c82-a793b5b70e01","b256e450-e102-4240-aed3-1d2acc6daf06","c7ae33b3-835c-4631-b493-3a9a33ef023c","de5d6267-abcb-4499-b42e-1fcbee44dd75","3e774876-2ec5-4450-91ae-9829ca6df7db","082b0aaf-5b6c-4ceb-9b81-b8103453511a","39527a0d-c01a-4c95-8128-b52d4b9bebfa"],"attrs":{".label":{"cx":162.5,"cy":62.09373818972017},".name":{"text":"Gate Control\n"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-50,"y":10},"angle":0,"id":"23696026-dec8-4bb2-9af4-202ddd11a629","z":2,"nodeID":"0000","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Register Passage"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":180,"y":270},"angle":0,"id":"082b0aaf-5b6c-4ceb-9b81-b8103453511a","z":3,"nodeID":"0001","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Active ID"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":150,"y":100},"angle":0,"id":"39527a0d-c01a-4c95-8128-b52d4b9bebfa","z":4,"nodeID":"0002","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Valid ID"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-50,"y":150},"angle":0,"id":"3e774876-2ec5-4450-91ae-9829ca6df7db","z":5,"nodeID":"0003","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Register Exit"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-210,"y":160},"angle":0,"id":"de5d6267-abcb-4499-b42e-1fcbee44dd75","z":6,"nodeID":"0004","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Register Entry"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":60,"y":270},"angle":0,"id":"c7ae33b3-835c-4631-b493-3a9a33ef023c","z":7,"nodeID":"0005","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Show Display"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-50,"y":270},"angle":0,"id":"b256e450-e102-4240-aed3-1d2acc6daf06","z":8,"nodeID":"0006","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Detect Sensor"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-180,"y":270},"angle":0,"id":"366ffc71-3732-4a8a-9c82-a793b5b70e01","z":9,"nodeID":"0007","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Open Gate"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-300,"y":270},"angle":0,"id":"745ad573-dfdd-4713-9c1b-292fd4ab5a4f","z":10,"nodeID":"0008","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Turn on LIght"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":-150,"y":420},"angle":0,"id":"c4d426d5-08f7-4504-bd5a-9ebec1ad3e73","z":11,"nodeID":"0009","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Response Time"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":60,"y":420},"angle":0,"id":"6b0535b1-d0d8-4e86-af56-9bba92ec73d0","z":12,"nodeID":"0010","parent":"aafda867-bef8-477b-b527-587f929222da","attrs":{".satvalue":{"text":""},".name":{"text":"Accuracy"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":870,"y":50},"angle":0,"id":"fa87d72b-085c-4f4a-a0c5-94e1bf820932","z":13,"nodeID":"0011","parent":"efa04acb-d47a-4a21-83e3-b47fdd44b678","attrs":{".satvalue":{"text":""},".name":{"text":"Validate ID"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":440,"y":130},"angle":0,"id":"4ed05f99-fbaa-4212-94fe-7390ac22d24c","z":14,"nodeID":"0012","attrs":{".satvalue":{"text":""},".name":{"text":"Validate ID"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":440,"y":300},"angle":0,"id":"673c2e3a-771c-414c-9a99-f84353bc723d","z":15,"nodeID":"0013","attrs":{".satvalue":{"text":""},".name":{"text":"Integrity"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":1030,"y":160},"angle":0,"id":"1b64043d-75ee-4031-9a50-586e7ca28fe1","z":16,"nodeID":"0014","parent":"efa04acb-d47a-4a21-83e3-b47fdd44b678","attrs":{".satvalue":{"text":""},".name":{"text":"Receive ID to Validate"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":880,"y":180},"angle":0,"id":"c651b21f-314f-440a-8a94-c9aaa6c121b0","z":17,"nodeID":"0015","parent":"efa04acb-d47a-4a21-83e3-b47fdd44b678","attrs":{".satvalue":{"text":""},".name":{"text":"Verify ID"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":730,"y":300},"angle":0,"id":"5dab723e-919e-435d-ab88-f5cbf8afe8a4","z":18,"nodeID":"0016","parent":"efa04acb-d47a-4a21-83e3-b47fdd44b678","attrs":{".satvalue":{"text":""},".name":{"text":"Integry -- Data"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":920,"y":300},"angle":0,"id":"197c7d1e-7e79-43ad-8a11-4171f8531d37","z":19,"nodeID":"0017","parent":"efa04acb-d47a-4a21-83e3-b47fdd44b678","attrs":{".satvalue":{"text":""},".name":{"text":"Register Client"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":820,"y":420},"angle":0,"id":"ef20a43c-59c5-472d-b245-e6538edfae75","z":20,"nodeID":"0018","parent":"efa04acb-d47a-4a21-83e3-b47fdd44b678","attrs":{".satvalue":{"text":""},".name":{"text":"Create New Client"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":990,"y":410},"angle":0,"id":"5f0a754b-edc8-4946-9c16-ee882d9e1721","z":21,"nodeID":"0019","parent":"efa04acb-d47a-4a21-83e3-b47fdd44b678","attrs":{".satvalue":{"text":""},".name":{"text":"Generate ID Number"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":1090,"y":300},"angle":0,"id":"bdb7b9aa-a315-4833-a28e-8674e1d93fac","z":22,"nodeID":"0020","parent":"efa04acb-d47a-4a21-83e3-b47fdd44b678","attrs":{".satvalue":{"text":""},".name":{"text":"Accuracy"}}},{"type":"link","source":{"id":"c4d426d5-08f7-4504-bd5a-9ebec1ad3e73"},"target":{"id":"745ad573-dfdd-4713-9c1b-292fd4ab5a4f"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"93dc71bd-6738-4c2b-9eb8-a2c5e47705a8","z":23,"linkID":"0003","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"c4d426d5-08f7-4504-bd5a-9ebec1ad3e73"},"target":{"id":"366ffc71-3732-4a8a-9c82-a793b5b70e01"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"ce55c075-0706-4603-adbf-fc30442d4f9e","z":24,"linkID":"0004","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"c4d426d5-08f7-4504-bd5a-9ebec1ad3e73"},"target":{"id":"c7ae33b3-835c-4631-b493-3a9a33ef023c"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"99223e3c-565e-46ea-aaad-df8656a90f14","z":25,"linkID":"0005","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"6b0535b1-d0d8-4e86-af56-9bba92ec73d0"},"target":{"id":"c7ae33b3-835c-4631-b493-3a9a33ef023c"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"3678e2b8-0af2-4a6a-8310-bf339856a99d","z":26,"linkID":"0006","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"6b0535b1-d0d8-4e86-af56-9bba92ec73d0"},"target":{"id":"673c2e3a-771c-414c-9a99-f84353bc723d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"93358e9c-ca80-44f8-a9b4-a796f32dbb50","z":27,"linkID":"0007","link-type":"++","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"745ad573-dfdd-4713-9c1b-292fd4ab5a4f"},"target":{"id":"de5d6267-abcb-4499-b42e-1fcbee44dd75"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"46b021de-9e94-49aa-bceb-2fa710a3c98e","z":28,"linkID":"0008","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"366ffc71-3732-4a8a-9c82-a793b5b70e01"},"target":{"id":"de5d6267-abcb-4499-b42e-1fcbee44dd75"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"1963e3e9-492a-41a6-96a5-e992514407f4","z":29,"linkID":"0009","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"366ffc71-3732-4a8a-9c82-a793b5b70e01"},"target":{"id":"3e774876-2ec5-4450-91ae-9829ca6df7db"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"4e3059b4-51b9-40d0-9bc1-076de29b750f","z":30,"linkID":"0010","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"b256e450-e102-4240-aed3-1d2acc6daf06"},"target":{"id":"3e774876-2ec5-4450-91ae-9829ca6df7db"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"6950a714-a473-4401-99ed-59e65631ec45","z":31,"linkID":"0011","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"c7ae33b3-835c-4631-b493-3a9a33ef023c"},"target":{"id":"3e774876-2ec5-4450-91ae-9829ca6df7db"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"01e009f8-6fdd-411d-abab-1f1409438143","z":32,"linkID":"0012","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"de5d6267-abcb-4499-b42e-1fcbee44dd75"},"target":{"id":"23696026-dec8-4bb2-9af4-202ddd11a629"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"4b5914fb-2f27-40b5-94a0-1a642fa97169","z":33,"linkID":"0013","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"3e774876-2ec5-4450-91ae-9829ca6df7db"},"target":{"id":"23696026-dec8-4bb2-9af4-202ddd11a629"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"7180a2c4-02d8-48ee-9f45-8c35dc95e10b","z":34,"linkID":"0014","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"39527a0d-c01a-4c95-8128-b52d4b9bebfa"},"target":{"id":"23696026-dec8-4bb2-9af4-202ddd11a629"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"f049e707-e915-44a8-8d1b-581bbbefeccd","z":35,"linkID":"0015","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"082b0aaf-5b6c-4ceb-9b81-b8103453511a"},"target":{"id":"39527a0d-c01a-4c95-8128-b52d4b9bebfa"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"551e006a-2169-4e39-9c6c-0bc022e00dbb","z":36,"linkID":"0016","link-type":"++","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"39527a0d-c01a-4c95-8128-b52d4b9bebfa"},"target":{"id":"4ed05f99-fbaa-4212-94fe-7390ac22d24c"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"26e4a25b-b3e5-4078-82c5-ed88f666ffe3","z":37,"linkID":"0017","link-type":"++","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"4ed05f99-fbaa-4212-94fe-7390ac22d24c"},"target":{"id":"fa87d72b-085c-4f4a-a0c5-94e1bf820932"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"b0d3ed71-0048-4c2f-8f3d-c4ef08335351","z":38,"linkID":"0018","link-type":"++","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"673c2e3a-771c-414c-9a99-f84353bc723d"},"target":{"id":"5dab723e-919e-435d-ab88-f5cbf8afe8a4"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"847277df-bf5f-4da7-a610-9b89f95df26c","z":39,"linkID":"0019","link-type":"++","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"fa87d72b-085c-4f4a-a0c5-94e1bf820932"},"target":{"id":"5dab723e-919e-435d-ab88-f5cbf8afe8a4"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"d55e6fd1-55bf-4a3a-879d-93460ff2979f","z":40,"linkID":"0020","link-type":"++","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"c651b21f-314f-440a-8a94-c9aaa6c121b0"},"target":{"id":"fa87d72b-085c-4f4a-a0c5-94e1bf820932"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"2544eb88-32ca-4f91-a1c2-66218f7eaaae","z":41,"linkID":"0021","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"1b64043d-75ee-4031-9a50-586e7ca28fe1"},"target":{"id":"fa87d72b-085c-4f4a-a0c5-94e1bf820932"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"6e212057-7c70-425d-98fe-96fd41619286","z":42,"linkID":"0022","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"197c7d1e-7e79-43ad-8a11-4171f8531d37"},"target":{"id":"5dab723e-919e-435d-ab88-f5cbf8afe8a4"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"617a0a29-41c8-4c42-831d-e37648dd2ee3","z":43,"linkID":"0023","link-type":"++","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"ef20a43c-59c5-472d-b245-e6538edfae75"},"target":{"id":"197c7d1e-7e79-43ad-8a11-4171f8531d37"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"71563219-02b7-4ca7-a779-47177fc116c5","z":44,"linkID":"0024","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"5f0a754b-edc8-4946-9c16-ee882d9e1721"},"target":{"id":"197c7d1e-7e79-43ad-8a11-4171f8531d37"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"1f09adca-8394-4cb8-aa67-6763de60e9f4","z":45,"linkID":"0025","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"bdb7b9aa-a315-4833-a28e-8674e1d93fac"},"target":{"id":"5f0a754b-edc8-4946-9c16-ee882d9e1721"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"13442eca-9b97-459c-922c-ed7fde7da9f2","z":46,"linkID":"0026","link-type":"+","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}}]},"model":{"actors":[{"nodeID":"a000","nodeName":"Gate Control\n","intentionIDs":["0000","0001","0000","0001","0002","0002","0003","0000","0001","0000","0002","0002","0000","0002","0001","0002","0001","0003","0004","0005","0001","0006","0007","0008","0001","0005","0001","0009","0010","0009","0005","0006","0006","0007","0007","0008","0004","0006","0000","0009","0010","0008","0007","0007","0007","0006","0005","0004","0003","0002","0002","0001","0002"]},{"nodeID":"a001","nodeName":"System","intentionIDs":["0011","0011","0011","0014","0015","0016","0017","0018","0019","0020","0014","0015","0017","0019","0018","0020","0016","0017","0011","0016","0011","0015","0014","0017","0018","0019","0014","0020"]}],"intentions":[{"nodeActorID":"a000","nodeID":"0000","nodeType":"basic.Task","nodeName":"Register Passage","dynamicFunction":{"intentionID":"0000","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0001","nodeType":"basic.Task","nodeName":"Active ID","dynamicFunction":{"intentionID":"0001","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0002","nodeType":"basic.Task","nodeName":"Valid ID","dynamicFunction":{"intentionID":"0002","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0003","nodeType":"basic.Task","nodeName":"Register Exit","dynamicFunction":{"intentionID":"0003","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0004","nodeType":"basic.Task","nodeName":"Register Entry","dynamicFunction":{"intentionID":"0004","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0005","nodeType":"basic.Task","nodeName":"Show Display","dynamicFunction":{"intentionID":"0005","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0006","nodeType":"basic.Task","nodeName":"Detect Sensor","dynamicFunction":{"intentionID":"0006","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0007","nodeType":"basic.Task","nodeName":"Open Gate","dynamicFunction":{"intentionID":"0007","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0008","nodeType":"basic.Task","nodeName":"Turn on LIght","dynamicFunction":{"intentionID":"0008","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0009","nodeType":"basic.Softgoal","nodeName":"Response Time","dynamicFunction":{"intentionID":"0009","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0010","nodeType":"basic.Softgoal","nodeName":"Accuracy","dynamicFunction":{"intentionID":"0010","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0011","nodeType":"basic.Task","nodeName":"Validate ID","dynamicFunction":{"intentionID":"0011","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0012","nodeType":"basic.Task","nodeName":"Validate ID","dynamicFunction":{"intentionID":"0012","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0013","nodeType":"basic.Softgoal","nodeName":"Integrity","dynamicFunction":{"intentionID":"0013","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0014","nodeType":"basic.Task","nodeName":"Receive ID to Validate","dynamicFunction":{"intentionID":"0014","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0015","nodeType":"basic.Task","nodeName":"Verify ID","dynamicFunction":{"intentionID":"0015","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0016","nodeType":"basic.Softgoal","nodeName":"Integry -- Data","dynamicFunction":{"intentionID":"0016","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0017","nodeType":"basic.Task","nodeName":"Register Client","dynamicFunction":{"intentionID":"0017","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0018","nodeType":"basic.Task","nodeName":"Create New Client","dynamicFunction":{"intentionID":"0018","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0019","nodeType":"basic.Task","nodeName":"Generate ID Number","dynamicFunction":{"intentionID":"0019","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0020","nodeType":"basic.Softgoal","nodeName":"Accuracy","dynamicFunction":{"intentionID":"0020","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0003","linkType":"+","postType":null,"linkSrcID":"0009","linkDestID":"0008","absoluteValue":-1},{"linkID":"0004","linkType":"+","postType":null,"linkSrcID":"0009","linkDestID":"0007","absoluteValue":-1},{"linkID":"0005","linkType":"+","postType":null,"linkSrcID":"0009","linkDestID":"0005","absoluteValue":-1},{"linkID":"0006","linkType":"+","postType":null,"linkSrcID":"0010","linkDestID":"0005","absoluteValue":-1},{"linkID":"0007","linkType":"++","postType":null,"linkSrcID":"0010","linkDestID":"0013","absoluteValue":-1},{"linkID":"0008","linkType":"AND","postType":null,"linkSrcID":"0008","linkDestID":"0004","absoluteValue":-1},{"linkID":"0009","linkType":"AND","postType":null,"linkSrcID":"0007","linkDestID":"0004","absoluteValue":-1},{"linkID":"0010","linkType":"AND","postType":null,"linkSrcID":"0007","linkDestID":"0003","absoluteValue":-1},{"linkID":"0011","linkType":"AND","postType":null,"linkSrcID":"0006","linkDestID":"0003","absoluteValue":-1},{"linkID":"0012","linkType":"AND","postType":null,"linkSrcID":"0005","linkDestID":"0003","absoluteValue":-1},{"linkID":"0013","linkType":"AND","postType":null,"linkSrcID":"0004","linkDestID":"0000","absoluteValue":-1},{"linkID":"0014","linkType":"AND","postType":null,"linkSrcID":"0003","linkDestID":"0000","absoluteValue":-1},{"linkID":"0015","linkType":"AND","postType":null,"linkSrcID":"0002","linkDestID":"0000","absoluteValue":-1},{"linkID":"0016","linkType":"++","postType":null,"linkSrcID":"0001","linkDestID":"0002","absoluteValue":-1},{"linkID":"0017","linkType":"++","postType":null,"linkSrcID":"0002","linkDestID":"0012","absoluteValue":-1},{"linkID":"0018","linkType":"++","postType":null,"linkSrcID":"0012","linkDestID":"0011","absoluteValue":-1},{"linkID":"0019","linkType":"++","postType":null,"linkSrcID":"0013","linkDestID":"0016","absoluteValue":-1},{"linkID":"0020","linkType":"++","postType":null,"linkSrcID":"0011","linkDestID":"0016","absoluteValue":-1},{"linkID":"0021","linkType":"AND","postType":null,"linkSrcID":"0015","linkDestID":"0011","absoluteValue":-1},{"linkID":"0022","linkType":"AND","postType":null,"linkSrcID":"0014","linkDestID":"0011","absoluteValue":-1},{"linkID":"0023","linkType":"++","postType":null,"linkSrcID":"0017","linkDestID":"0016","absoluteValue":-1},{"linkID":"0024","linkType":"AND","postType":null,"linkSrcID":"0018","linkDestID":"0017","absoluteValue":-1},{"linkID":"0025","linkType":"AND","postType":null,"linkSrcID":"0019","linkDestID":"0017","absoluteValue":-1},{"linkID":"0026","linkType":"+","postType":null,"linkSrcID":"0020","linkDestID":"0019","absoluteValue":-1}],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0000","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0001","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0002","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0003","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0004","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0005","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0006","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0007","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0008","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0009","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0010","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0011","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0012","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0013","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0014","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0015","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0016","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0017","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0018","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0019","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0020","absTime":"0","evaluationValue":"(no value)"}],"previousAnalysis":null}};

inputModel2 = {"graph":{"cells":[]},"model":{"actors":[],"intentions":[],"links":[],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[],"previousAnalysis":null}};
/*s
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
	for(var intentionId in theActorToAdd.intentionIDs){
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
	for(var constraint in model1.model.constraints){
		newConstraints.push(constraint);
	}
	var newConstraints2= updateAbs(model2.model.constraints,delta,maxTime1);
	for(var constriant in newConstraints2){
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
	newConstaints = removeExtraNewConstrains(newConstraints);
	newAnalysisRequest = removeExtraNewAnalysisRequest(newAnalysisRequest);
	newIntention = removeExtraNewIntentions(newIntentions);
	newActors = removeExtraNewActors(newActors);
	return [newActors, newIntentions, newLinks, newConstraints, newAnalysisRequest];
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
function removeExtraNewConstrains(newConstraints){
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
	for(var constraint in constraints2){
		constraint.absoluteValue += toAdd;
		updateConstraint2.push(constraint);
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
	inputModel1 = {"graph":{"cells":[{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":100,"y":350},"angle":0,"id":"d161dfda-9b23-4908-bf31-6eb5b3ba5de4","z":1,"nodeID":"0000","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_0"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":360,"y":340},"angle":0,"id":"fe02b259-5364-46ab-9a45-987d013d0437","z":2,"nodeID":"0001","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_1"}}},{"type":"link","source":{"id":"d161dfda-9b23-4908-bf31-6eb5b3ba5de4"},"target":{"id":"fe02b259-5364-46ab-9a45-987d013d0437"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"f63919c2-da41-46a5-9ff6-d33376da28b6","z":3,"linkID":"0000","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}}]},"model":{"actors":[],"intentions":[{"nodeActorID":"-","nodeID":"0000","nodeType":"basic.Goal","nodeName":"Goal_0","dynamicFunction":{"intentionID":"0000","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0001","nodeType":"basic.Goal","nodeName":"Goal_1","dynamicFunction":{"intentionID":"0001","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0000","linkType":"AND","postType":null,"linkSrcID":"0000","linkDestID":"0001","absoluteValue":-1}],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0000","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0001","absTime":"0","evaluationValue":"(no value)"}],"previousAnalysis":null}};
	inputModel2 = {"graph":{"cells":[{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":100,"y":350},"angle":0,"id":"d161dfda-9b23-4908-bf31-6eb5b3ba5de4","z":1,"nodeID":"0000","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_0"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":360,"y":340},"angle":0,"id":"fe02b259-5364-46ab-9a45-987d013d0437","z":2,"nodeID":"0001","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_1"}}},{"type":"link","source":{"id":"d161dfda-9b23-4908-bf31-6eb5b3ba5de4"},"target":{"id":"fe02b259-5364-46ab-9a45-987d013d0437"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"f63919c2-da41-46a5-9ff6-d33376da28b6","z":3,"linkID":"0000","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}}]},"model":{"actors":[],"intentions":[{"nodeActorID":"-","nodeID":"0000","nodeType":"basic.Goal","nodeName":"Goal_0","dynamicFunction":{"intentionID":"0000","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0001","nodeType":"basic.Goal","nodeName":"Goal_1","dynamicFunction":{"intentionID":"0001","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0000","linkType":"AND","postType":null,"linkSrcID":"0000","linkDestID":"0001","absoluteValue":-1}],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0000","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0001","absTime":"0","evaluationValue":"(no value)"}],"previousAnalysis":null}};

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

