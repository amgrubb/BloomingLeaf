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
var resourcesGravity = 360; 
var taskGravity = 240; 
var softgoalGravity = 120;
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
		var forceSum = Math.pow(d,2)/(100*coefficient);
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
			var actorForCurFreeNode = new Actor(node.nodeName,(curXCount-1)*width, curYCount*height, "-"+node.nodeId, [node.nodeId]);
			actorSet.add(actorForCurFreeNode);
			imaginaryActorIdList.push(actorForCurFreeNode.nodeId);
		}
	}
}


function forceDirectedAlgorithm(resultList, model1, model2){
	var numIterations = 20;
	var numConstant = 0.002;
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
	inputModel1 = {"graph":{"cells":[{"type":"basic.Actor","size":{"width":450,"height":590},"position":{"x":10,"y":430},"angle":0,"id":"912a3828-24be-421e-a986-baf03c286b2f","z":-4,"nodeID":"a005","embeds":["740309e8-88bf-45f3-8065-3ecbedc67c7e","72f6681d-d002-44a8-9813-d688af1ac427","426f6828-d8c8-4eec-b5b2-735275376d46","22136816-ab3f-4859-b22e-e2b1986dc4f5","8001a812-7731-412b-8d57-183e962d611b","f36e7308-758e-4dc9-8a6a-cb138a205484","c5cae241-1caf-4c5e-9a16-55924a67cdb9","6d7c2eeb-5f72-43a6-a3c2-608a9bc13762","0899d8e6-b2a7-4473-a8d6-63697a3fd393","21d7d06d-9537-43b8-a7e8-1b3ea8b83fa0","ea67024d-7662-4e6a-a7df-b2b2992ef652"],"attrs":{".label":{"cx":112.5,"cy":59.109358108480365},".name":{"text":"Spadina\nProject","font-size":13}}},{"type":"basic.Actor","size":{"width":260,"height":380},"position":{"x":60,"y":40},"angle":0,"id":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","z":-3,"nodeID":"a004","embeds":["fb091735-76d4-430d-9857-6f2908c9eb97","1ea51df1-6757-48f7-b4c3-aba9e8774ddc","6cc0c94b-f63c-4822-8228-aa04ec590f91","bba3c6b7-6a5e-41bb-b341-bf9a4b062f9d","e4e6ec1f-bd06-437e-addc-4809e03fe7e0","db17d396-0fef-460b-bb62-8d3aa09a2859","c4ebfb17-9650-4615-b6ff-3105f773ab59","4865c670-18e6-45b5-8d04-af45955f3c9a","c41ff1d3-562b-42dc-8d72-9d0d963eb00b","8814b538-48c7-41b7-9cf8-a384e215b2b2","87aebb27-e4fd-4f44-8c10-d60f8068b049"],"attrs":{".label":{"cx":65,"cy":38.218645162922655},".name":{"text":"Metro","font-size":13}}},{"type":"basic.Actor","size":{"width":360,"height":210},"position":{"x":300,"y":30},"angle":0,"id":"e64a31fd-466b-4b33-82fc-af1eca740593","z":-2,"nodeID":"a003","embeds":["8b726569-715f-4457-9e94-3337ad0e3ea9","32cb79b4-4fb2-426c-81e7-053e5a45d52a","679668f0-eb12-4c0f-957c-db2e10d48552","59eb1c5f-cd66-4103-84db-4b597ca959f2","7539e1ea-011e-4cec-85e2-51cae8216a17","cd6d81b3-b4ae-4e8c-bc4a-c41022efabed","bab14f60-e9a8-4782-9d71-e1ad03c478a6","15ce6166-9f2b-4aa6-8279-0b7e604cbe58"],"attrs":{".label":{"cx":90,"cy":21.30691786279958},".name":{"text":"Toronto","font-size":13}}},{"type":"basic.Actor","size":{"width":250,"height":240},"position":{"x":440,"y":240},"angle":0,"id":"72f4390e-c415-4a3c-b792-cf65ba009b6b","z":-1,"nodeID":"a002","embeds":["4742ab5d-cd16-4a3d-ab15-fee1247bfdaf","bc663f4b-1db7-4bd3-935a-2b0785684ca2","b1cf3544-23b8-4378-92d0-be15e7ee795d","9eaa63bc-b2b2-49fe-b7ef-ecffad94eb13","08a90fa1-d817-4a8c-864f-607ff9e12e82","51ed1abc-66b3-4f33-bcf2-f281cd50d4a0"],"attrs":{".label":{"cx":62.5,"cy":24.291371883422045},".name":{"text":"Opposition","font-size":13}}},{"type":"basic.Actor","size":{"width":130,"height":190},"position":{"x":300,"y":270},"angle":0,"id":"457589c9-9d53-477a-bf24-2c6760b72c31","z":0,"nodeID":"a001","embeds":["9debd49c-ce1d-4d92-ac96-7c1409471c58","c909f069-d2da-44a8-a5eb-8a7b9666598c"],"attrs":{".label":{"cx":32.5,"cy":19.317266849763342},".name":{"text":"OMG","font-size":13}}},{"type":"basic.Actor","size":{"width":260,"height":270},"position":{"x":440,"y":480},"angle":0,"id":"f4bf789a-bedc-48df-a4d7-28fdbef2e166","z":1,"nodeID":"a000","embeds":["b6e78238-5399-44a2-b62c-022f4ac8ad95","477a4787-cbb0-490f-b274-ae3f062d0190","6a097aca-d2fa-4354-89b1-25ab7a6bc1d9","4e8f885f-57fd-4d83-a512-2e9c85aaa1e9","feb18b6e-9980-48ab-bc88-728f6e18d38d","5552f694-9cd8-4e65-9860-839d05c4ff1b","8b10ffb3-d7d2-4e9c-a2ef-9c39e0baacd0","91382ef7-153a-4f7d-a1ad-69715c1c1712"],"attrs":{".label":{"cx":65,"cy":27.275806884452123},".name":{"text":"Province","font-size":13}}},{"type":"basic.Goal","size":{"width":140,"height":60},"position":{"x":150,"y":60},"angle":0,"id":"4865c670-18e6-45b5-8d04-af45955f3c9a","z":2,"nodeID":"0000","elementid":"0000","parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","attrs":{".satvalue":{"text":"(⊥, F)"},".name":{"text":"Have a Unified Arterial\nRoad System","font-size":13},".funcvalue":{"text":"C"},".label":{"cx":35,"cy":6.3833753244527855},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":80,"y":120},"angle":0,"id":"bba3c6b7-6a5e-41bb-b341-bf9a4b062f9d","z":3,"nodeID":"0001","elementid":"0001","parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","attrs":{".satvalue":{"text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Consult with\nCitizens","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":110,"height":60},"position":{"x":60,"y":190},"angle":0,"id":"e4e6ec1f-bd06-437e-addc-4809e03fe7e0","z":4,"nodeID":"0002","elementid":"0002","parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","attrs":{".satvalue":{"text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":" Expand Suburbs\n Vacant Land Use","font-size":13},".label":{"cx":27.5,"cy":6.3833753244527855},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":70,"y":260},"angle":0,"id":"db17d396-0fef-460b-bb62-8d3aa09a2859","z":5,"nodeID":"0003","elementid":"0003","parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","attrs":{".satvalue":{"text":""},".name":{"text":"Support\nInfrastructure\nProjects","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":190,"y":150},"angle":0,"id":"8814b538-48c7-41b7-9cf8-a384e215b2b2","z":6,"nodeID":"0004","elementid":"0004","parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","attrs":{".satvalue":{"text":""},".name":{"text":"Economic\nGrowth","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":210,"y":220},"angle":0,"id":"c41ff1d3-562b-42dc-8d72-9d0d963eb00b","z":7,"nodeID":"0005","elementid":"0005","parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"C"},".name":{"text":"Listen to\nOpposition","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":180,"y":290},"angle":0,"id":"87aebb27-e4fd-4f44-8c10-d60f8068b049","z":8,"nodeID":"0006","elementid":"0006","parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","attrs":{".satvalue":{"text":"(⊥, F)"},".name":{"text":"Adopt\nCentres Policy","font-size":13},".funcvalue":{"text":"DS"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":130,"y":350},"angle":0,"id":"c4ebfb17-9650-4615-b6ff-3105f773ab59","z":9,"nodeID":"0007","elementid":"0007","parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","attrs":{".satvalue":{"text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Approve\nProject Funding","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":320,"y":310},"angle":0,"id":"c909f069-d2da-44a8-a5eb-8a7b9666598c","z":10,"nodeID":"0008","elementid":"0008","parent":"457589c9-9d53-477a-bf24-2c6760b72c31","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"C"},".name":{"text":"Support\nOpposition","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":310,"y":380},"angle":0,"id":"9debd49c-ce1d-4d92-ac96-7c1409471c58","z":11,"nodeID":"0009","elementid":"0009","parent":"457589c9-9d53-477a-bf24-2c6760b72c31","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Approve Metro\n 2nd Loan","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":140,"height":60},"position":{"x":420,"y":40},"angle":0,"id":"7539e1ea-011e-4cec-85e2-51cae8216a17","z":12,"nodeID":"0010","elementid":"0010","parent":"e64a31fd-466b-4b33-82fc-af1eca740593","attrs":{".satvalue":{"text":""},".name":{"text":"Prevent Highway\nConstruction Downtown","font-size":13},".label":{"cx":35,"cy":6.3833753244527855},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":420,"y":110},"angle":0,"id":"15ce6166-9f2b-4aa6-8279-0b7e604cbe58","z":13,"nodeID":"0011","elementid":"0011","parent":"e64a31fd-466b-4b33-82fc-af1eca740593","attrs":{".satvalue":{"text":""},".name":{"text":"Support\nMetro","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":430,"y":170},"angle":0,"id":"59eb1c5f-cd66-4103-84db-4b597ca959f2","z":14,"nodeID":"0012","parent":"e64a31fd-466b-4b33-82fc-af1eca740593","elementid":"0012","attrs":{".satvalue":{"text":""},".name":{"text":"Protect\nNeighbourhoods","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":310,"y":110},"angle":0,"id":"cd6d81b3-b4ae-4e8c-bc4a-c41022efabed","z":15,"nodeID":"0013","elementid":"0013","parent":"e64a31fd-466b-4b33-82fc-af1eca740593","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Create Central\nArea Plan","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":560,"y":110},"angle":0,"id":"bab14f60-e9a8-4782-9d71-e1ad03c478a6","z":16,"nodeID":"0014","elementid":"0014","parent":"e64a31fd-466b-4b33-82fc-af1eca740593","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Elect\nReformer\nCouncil","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":450,"y":300},"angle":0,"id":"bc663f4b-1db7-4bd3-935a-2b0785684ca2","z":17,"nodeID":"0015","parent":"72f4390e-c415-4a3c-b792-cf65ba009b6b","elementid":"0015","attrs":{".satvalue":{"text":""},".name":{"text":"Lobby\nMetro","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":450,"y":370},"angle":0,"id":"9eaa63bc-b2b2-49fe-b7ef-ecffad94eb13","z":18,"nodeID":"0016","elementid":"0016","parent":"72f4390e-c415-4a3c-b792-cf65ba009b6b","attrs":{".satvalue":{"text":""},".name":{"text":"Litigate\nSpadina","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":540,"y":250},"angle":0,"id":"b1cf3544-23b8-4378-92d0-be15e7ee795d","z":19,"nodeID":"0017","elementid":"0017","parent":"72f4390e-c415-4a3c-b792-cf65ba009b6b","attrs":{".satvalue":{"text":""},".name":{"text":"Save Old\nNeighbourhoods","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":580,"y":320},"angle":0,"id":"08a90fa1-d817-4a8c-864f-607ff9e12e82","z":20,"nodeID":"0018","elementid":"0018","parent":"72f4390e-c415-4a3c-b792-cf65ba009b6b","attrs":{".satvalue":{"text":""},".name":{"text":"Stop Spadina\nExpressway","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":540,"y":410},"angle":0,"id":"51ed1abc-66b3-4f33-bcf2-f281cd50d4a0","z":21,"nodeID":"0019","elementid":"0019","parent":"72f4390e-c415-4a3c-b792-cf65ba009b6b","attrs":{".satvalue":{"text":""},".name":{"text":"Lobby\nProvince","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":540,"y":490},"angle":0,"id":"91382ef7-153a-4f7d-a1ad-69715c1c1712","z":22,"nodeID":"0020","elementid":"0020","parent":"f4bf789a-bedc-48df-a4d7-28fdbef2e166","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Listen to\nOpposition","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":570,"y":550},"angle":0,"id":"6a097aca-d2fa-4354-89b1-25ab7a6bc1d9","z":23,"nodeID":"0021","elementid":"0021","parent":"f4bf789a-bedc-48df-a4d7-28fdbef2e166","attrs":{".satvalue":{"text":""},".name":{"text":"Economic\nDevelopment","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":590,"y":610},"angle":0,"id":"5552f694-9cd8-4e65-9860-839d05c4ff1b","z":24,"nodeID":"0022","elementid":"0022","parent":"f4bf789a-bedc-48df-a4d7-28fdbef2e166","attrs":{".satvalue":{"text":""},".name":{"text":"Fund\nInfrastructure\nProjects","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":550,"y":670},"angle":0,"id":"4e8f885f-57fd-4d83-a512-2e9c85aaa1e9","z":25,"nodeID":"0023","elementid":"0023","parent":"f4bf789a-bedc-48df-a4d7-28fdbef2e166","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Lease Toronto\nBlocking Land","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":450,"y":560},"angle":0,"id":"8b10ffb3-d7d2-4e9c-a2ef-9c39e0baacd0","z":26,"nodeID":"0024","elementid":"0024","parent":"f4bf789a-bedc-48df-a4d7-28fdbef2e166","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Block Spadina","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":460,"y":650},"angle":0,"id":"feb18b6e-9980-48ab-bc88-728f6e18d38d","z":27,"nodeID":"0025","elementid":"0025","parent":"f4bf789a-bedc-48df-a4d7-28fdbef2e166","attrs":{".satvalue":{"text":""},".name":{"text":"Approve\nFunds","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":110,"height":60},"position":{"x":150,"y":450},"angle":0,"id":"740309e8-88bf-45f3-8065-3ecbedc67c7e","z":28,"nodeID":"0026","elementid":"0026","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":""},".name":{"text":"Metro Approves\nFunding","font-size":13},".label":{"cx":27.5,"cy":6.3833753244527855},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":250,"y":470},"angle":0,"id":"22136816-ab3f-4859-b22e-e2b1986dc4f5","z":29,"nodeID":"0027","elementid":"0027","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":""},".name":{"text":"OMB\nApproval","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":60,"y":610},"angle":0,"id":"8001a812-7731-412b-8d57-183e962d611b","z":30,"nodeID":"0028","elementid":"0028","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":""},".name":{"text":"Have Spadina\nExpressway","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":200,"y":670},"angle":0,"id":"f36e7308-758e-4dc9-8a6a-cb138a205484","z":31,"nodeID":"0029","elementid":"0029","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":80,"y":540},"angle":0,"id":"72f6681d-d002-44a8-9813-d688af1ac427","z":32,"nodeID":"0030","elementid":"0030","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding\nFrom Metro","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":190,"y":550},"angle":0,"id":"426f6828-d8c8-4eec-b5b2-735275376d46","z":33,"nodeID":"0031","elementid":"0031","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding\nFrom Province","font-size":13},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":110,"height":60},"position":{"x":310,"y":530},"angle":0,"id":"ea67024d-7662-4e6a-a7df-b2b2992ef652","z":34,"nodeID":"0032","elementid":"0032","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":""},".name":{"text":"     Province\n  Approves Funding","font-size":13},".label":{"cx":27.5,"cy":6.3833753244527855},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":110,"height":60},"position":{"x":270,"y":600},"angle":0,"id":"c5cae241-1caf-4c5e-9a16-55924a67cdb9","z":35,"nodeID":"0033","elementid":"0033","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Build Wilson-401\nto Lawrence","font-size":13},".label":{"cx":27.5,"cy":6.3833753244527855},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":110,"height":60},"position":{"x":330,"y":670},"angle":0,"id":"6d7c2eeb-5f72-43a6-a3c2-608a9bc13762","z":36,"nodeID":"0034","elementid":"0034","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":"(P, ⊥)"},".funcvalue":{"text":"UD"},".name":{"text":"Build Lawrence\nto Eglington","font-size":13},".label":{"cx":27.5,"cy":6.3833753244527855},"text":{"fill":"black"}}},{"type":"link","source":{"id":"4865c670-18e6-45b5-8d04-af45955f3c9a"},"target":{"id":"8814b538-48c7-41b7-9cf8-a384e215b2b2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"1ea51df1-6757-48f7-b4c3-aba9e8774ddc","z":37,"linkID":"0000","link-type":"++S","vertices":[],"parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"e4e6ec1f-bd06-437e-addc-4809e03fe7e0"},"target":{"id":"8814b538-48c7-41b7-9cf8-a384e215b2b2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"a2060cf1-37cd-433d-8f5c-a3e5cd6747b5","z":38,"linkID":"0001","link-type":"+","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"db17d396-0fef-460b-bb62-8d3aa09a2859"},"target":{"id":"8814b538-48c7-41b7-9cf8-a384e215b2b2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+S"}}}],"id":"39f6785b-a821-49f1-bcba-12f5004ac37e","z":39,"linkID":"0002","link-type":"+S","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"87aebb27-e4fd-4f44-8c10-d60f8068b049"},"target":{"id":"8814b538-48c7-41b7-9cf8-a384e215b2b2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"fb091735-76d4-430d-9857-6f2908c9eb97","z":40,"linkID":"0003","link-type":"++S","parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","vertices":[{"x":190,"y":260}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"c4ebfb17-9650-4615-b6ff-3105f773ab59"},"target":{"id":"db17d396-0fef-460b-bb62-8d3aa09a2859"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"6cc0c94b-f63c-4822-8228-aa04ec590f91","z":41,"linkID":"0004","vertices":[{"x":140,"y":340}],"link-type":"++","parent":"211d39d3-6deb-4bbe-9a5a-bfa87a98deb0","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"c4ebfb17-9650-4615-b6ff-3105f773ab59"},"target":{"id":"740309e8-88bf-45f3-8065-3ecbedc67c7e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"f82a6edf-5cae-4bc7-bae0-021d6d83ee24","z":42,"linkID":"0005","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"cd6d81b3-b4ae-4e8c-bc4a-c41022efabed"},"target":{"id":"7539e1ea-011e-4cec-85e2-51cae8216a17"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"32cb79b4-4fb2-426c-81e7-053e5a45d52a","z":43,"linkID":"0006","vertices":[{"x":380,"y":100}],"parent":"e64a31fd-466b-4b33-82fc-af1eca740593","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"bab14f60-e9a8-4782-9d71-e1ad03c478a6"},"target":{"id":"7539e1ea-011e-4cec-85e2-51cae8216a17"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"8b726569-715f-4457-9e94-3337ad0e3ea9","z":44,"linkID":"0007","vertices":[{"x":590,"y":80}],"parent":"e64a31fd-466b-4b33-82fc-af1eca740593","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"bab14f60-e9a8-4782-9d71-e1ad03c478a6"},"target":{"id":"15ce6166-9f2b-4aa6-8279-0b7e604cbe58"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--"}}}],"id":"c8898204-8349-44a8-bed0-1cc5b39b29e8","z":45,"linkID":"0008","link-type":"--","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"bab14f60-e9a8-4782-9d71-e1ad03c478a6"},"target":{"id":"59eb1c5f-cd66-4103-84db-4b597ca959f2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"1e0c98bb-74ca-4a99-864a-7da8974be442","z":46,"linkID":"0009","link-type":"+","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"59eb1c5f-cd66-4103-84db-4b597ca959f2"},"target":{"id":"b1cf3544-23b8-4378-92d0-be15e7ee795d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"91328535-7d39-4969-9bb4-a748bd60d6c4","z":47,"linkID":"0010","vertices":[{"x":590,"y":210}],"link-type":"+","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"cd6d81b3-b4ae-4e8c-bc4a-c41022efabed"},"target":{"id":"59eb1c5f-cd66-4103-84db-4b597ca959f2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"679668f0-eb12-4c0f-957c-db2e10d48552","z":48,"linkID":"0011","link-type":"+","vertices":[{"x":390,"y":200}],"parent":"e64a31fd-466b-4b33-82fc-af1eca740593","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"c41ff1d3-562b-42dc-8d72-9d0d963eb00b"},"target":{"id":"bc663f4b-1db7-4bd3-935a-2b0785684ca2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"89139626-b119-4335-97f6-6de1acdcc599","z":49,"linkID":"0012","link-type":"++","vertices":[{"x":430,"y":260}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"9debd49c-ce1d-4d92-ac96-7c1409471c58"},"target":{"id":"22136816-ab3f-4859-b22e-e2b1986dc4f5"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"817f47dd-1860-484e-8137-124d3db01905","z":50,"linkID":"0013","link-type":"++","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"8814b538-48c7-41b7-9cf8-a384e215b2b2"},"target":{"id":"6a097aca-d2fa-4354-89b1-25ab7a6bc1d9"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+S"}}}],"id":"704887ca-3f72-45f7-adf1-da21e45e82a7","z":52,"linkID":"0015","link-type":"+S","vertices":[{"x":410,"y":230},{"x":690,"y":230},{"x":680,"y":500}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"08a90fa1-d817-4a8c-864f-607ff9e12e82"},"target":{"id":"b1cf3544-23b8-4378-92d0-be15e7ee795d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"4742ab5d-cd16-4a3d-ab15-fee1247bfdaf","z":53,"linkID":"0016","vertices":[{"x":670,"y":270}],"link-type":"++","parent":"72f4390e-c415-4a3c-b792-cf65ba009b6b","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"bc663f4b-1db7-4bd3-935a-2b0785684ca2"},"target":{"id":"08a90fa1-d817-4a8c-864f-607ff9e12e82"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"a2fdb0f1-629f-484b-8bc2-835adcdff4e3","z":54,"linkID":"0017","link-type":"OR","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"9eaa63bc-b2b2-49fe-b7ef-ecffad94eb13"},"target":{"id":"08a90fa1-d817-4a8c-864f-607ff9e12e82"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"2fec177f-d78e-491d-8067-b7a56cf11fdc","z":55,"linkID":"0018","link-type":"OR","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"51ed1abc-66b3-4f33-bcf2-f281cd50d4a0"},"target":{"id":"08a90fa1-d817-4a8c-864f-607ff9e12e82"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"622e2bdc-1940-4924-b918-ba41bd555132","z":56,"linkID":"0019","link-type":"OR","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"c909f069-d2da-44a8-a5eb-8a7b9666598c"},"target":{"id":"9eaa63bc-b2b2-49fe-b7ef-ecffad94eb13"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"b39ba80f-aece-4c1b-adc9-d9eccaeec5f6","z":57,"linkID":"0020","link-type":"++","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"91382ef7-153a-4f7d-a1ad-69715c1c1712"},"target":{"id":"51ed1abc-66b3-4f33-bcf2-f281cd50d4a0"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"af8a8e00-871f-4253-b84d-3c416cc3b44d","z":58,"linkID":"0021","link-type":"++","vertices":[{"x":510,"y":450}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"91382ef7-153a-4f7d-a1ad-69715c1c1712"},"target":{"id":"8b10ffb3-d7d2-4e9c-a2ef-9c39e0baacd0"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"b6e78238-5399-44a2-b62c-022f4ac8ad95","z":59,"linkID":"0022","link-type":"++","parent":"f4bf789a-bedc-48df-a4d7-28fdbef2e166","vertices":[{"x":530,"y":530}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"8b10ffb3-d7d2-4e9c-a2ef-9c39e0baacd0"},"target":{"id":"feb18b6e-9980-48ab-bc88-728f6e18d38d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--S"}}}],"id":"87eabab0-0376-498f-aa66-7c3ea2962bfc","z":60,"linkID":"0023","link-type":"--S","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"feb18b6e-9980-48ab-bc88-728f6e18d38d"},"target":{"id":"5552f694-9cd8-4e65-9860-839d05c4ff1b"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"477a4787-cbb0-490f-b274-ae3f062d0190","z":61,"linkID":"0024","parent":"f4bf789a-bedc-48df-a4d7-28fdbef2e166","vertices":[{"x":560,"y":630}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"8b10ffb3-d7d2-4e9c-a2ef-9c39e0baacd0"},"target":{"id":"ea67024d-7662-4e6a-a7df-b2b2992ef652"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--S"}}}],"id":"3e4d16a2-b0f3-4cb8-ae73-2b329cf6af51","z":62,"linkID":"0025","link-type":"--S","vertices":[{"x":460,"y":550}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"feb18b6e-9980-48ab-bc88-728f6e18d38d"},"target":{"id":"ea67024d-7662-4e6a-a7df-b2b2992ef652"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"5d668a38-a548-407f-bf84-1475b6fece2a","z":63,"linkID":"0026","link-type":"++S","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"740309e8-88bf-45f3-8065-3ecbedc67c7e"},"target":{"id":"72f6681d-d002-44a8-9813-d688af1ac427"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"a4c446fb-9cc6-421c-9bbc-8180bceba509","z":64,"linkID":"0027","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"22136816-ab3f-4859-b22e-e2b1986dc4f5"},"target":{"id":"72f6681d-d002-44a8-9813-d688af1ac427"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"89951cb6-99a3-4242-9228-1f4de43251b7","z":65,"linkID":"0028","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"426f6828-d8c8-4eec-b5b2-735275376d46"},"target":{"id":"f36e7308-758e-4dc9-8a6a-cb138a205484"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"a3981768-2224-46a0-b806-4d587ea9eaf5","z":66,"linkID":"0029","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"72f6681d-d002-44a8-9813-d688af1ac427"},"target":{"id":"f36e7308-758e-4dc9-8a6a-cb138a205484"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"324a7ca3-eea1-49d3-8d9c-4b9331a72550","z":67,"linkID":"0030","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"f36e7308-758e-4dc9-8a6a-cb138a205484"},"target":{"id":"8001a812-7731-412b-8d57-183e962d611b"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"74c84fe7-4a8b-4bcf-8c77-da01f7e4607a","z":68,"linkID":"0031","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"ea67024d-7662-4e6a-a7df-b2b2992ef652"},"target":{"id":"426f6828-d8c8-4eec-b5b2-735275376d46"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"45ac372a-fa46-4a2c-a245-acb578ab4c05","z":69,"linkID":"0032","link-type":"++","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":240,"y":930},"angle":0,"id":"0899d8e6-b2a7-4473-a8d6-63697a3fd393","z":70,"nodeID":"0035","elementid":"0035","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":""},".name":{"text":"Build\nExpressway","font-size":13},"text":{"fill":"black"}}},{"type":"link","source":{"id":"c5cae241-1caf-4c5e-9a16-55924a67cdb9"},"target":{"id":"0899d8e6-b2a7-4473-a8d6-63697a3fd393"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"15baf0b4-218e-40ef-9ba0-bc76024a772e","z":71,"linkID":"0033","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"6d7c2eeb-5f72-43a6-a3c2-608a9bc13762"},"target":{"id":"0899d8e6-b2a7-4473-a8d6-63697a3fd393"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"1a69aa53-4609-4a9d-836b-a11e2aa74ce7","z":72,"linkID":"0034","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"0899d8e6-b2a7-4473-a8d6-63697a3fd393"},"target":{"id":"8001a812-7731-412b-8d57-183e962d611b"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"fd07cb32-ff0d-46a2-a83a-d3696f73f47f","z":73,"linkID":"0035","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":130,"y":930},"angle":0,"id":"21d7d06d-9537-43b8-a7e8-1b3ea8b83fa0","z":75,"nodeID":"0037","elementid":"0036","parent":"912a3828-24be-421e-a986-baf03c286b2f","attrs":{".satvalue":{"text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Plan Project","font-size":13},"text":{"fill":"black"}}},{"type":"link","source":{"id":"21d7d06d-9537-43b8-a7e8-1b3ea8b83fa0"},"target":{"id":"8001a812-7731-412b-8d57-183e962d611b"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"725c8013-b5e8-4b82-8ba5-10cbba60f849","z":76,"linkID":"0036","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}}]},"model":{"actors":[{"nodeID":"a000","nodeName":"Province","intentionIDs":["0020","0021","0022","0023","0024","0025","0020","0021","0022","0023","0024","0025","0020","0020","0024","0025","0024","0025","0020","0024","0023","0020","0024","0025","0021","0022","0023","0020","0024","0021","0022","0023","0025","0022","0022","0024","0020","0020"]},{"nodeID":"a001","nodeName":"OMG","intentionIDs":["0008","0009","0009","0008","0008","0009","0009","0009","0009","0009","0008","0008","0009","0009","0008","0009","0008","0009","0009","0008","0009","0009","0008","0009","0009","0008","0008","0008","0008","0008"]},{"nodeID":"a002","nodeName":"Opposition","intentionIDs":["0015","0016","0017","0017","0015","0016","0016","0018","0019","0017","0015","0016","0018","0019","0018","0018","0015","0016","0019","0017","0018","0019","0016","0018","0019","0019","0019"]},{"nodeID":"a003","nodeName":"Toronto","intentionIDs":["0010","0011","0012","0013","0014","0010","0013","0011","0012","0014","0010","0013","0014","0014","0014","0012","0013","0013","0014","0010","0014","0013","0010","0011","0014","0014","0011","0013","0013","0014","0011","0011"]},{"nodeID":"a004","nodeName":"Metro","intentionIDs":["0000","0001","0002","0003","0003","0004","0005","0006","0007","0001","0004","0002","0003","0007","0005","0006","0000","0002","0002","0000","0000","0002","0003","0006","0007","0007","0007","0005","0004","0000","0001","0002","0007","0005","0006","0006","0000","0007","0000","0004","0006","0003","0001","0002","0003","0007","0007","0006","0005","0004","0000","0000","0000","0006","0005","0004","0006"]},{"nodeID":"a005","nodeName":"Spadina\nProject","intentionIDs":["0026","0026","0027","0027","0028","0029","0029","0028","0026","0027","0029","0028","0030","0031","0032","0033","0034","0033","0030","0031","0033","0032","0033","0034","0026","0027","0032","0033","0034","0026","0027","0031","0030","0029","0032","0034","0035","0033","0034","0035","0036","0037","0036","0037","0036","0033","0034","0034","0037","0036","0036","0037","0026","0027","0026","0026","0030","0027","0028","0031","0029","0032","0033","0034","0027","0032","0028","0029","0033","0034","0035","0037","0037","0035","0037","0032","0032","0032"]}],"intentions":[{"nodeActorID":"a004","nodeID":"0000","nodeType":"basic.Goal","nodeName":"Have a Unified Arterial\nRoad System","dynamicFunction":{"intentionID":"0000","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a004","nodeID":"0001","nodeType":"basic.Task","nodeName":"Consult with\nCitizens","dynamicFunction":{"intentionID":"0001","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a004","nodeID":"0002","nodeType":"basic.Task","nodeName":" Expand Suburbs\n Vacant Land Use","dynamicFunction":{"intentionID":"0002","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a004","nodeID":"0003","nodeType":"basic.Goal","nodeName":"Support\nInfrastructure\nProjects","dynamicFunction":{"intentionID":"0003","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a004","nodeID":"0004","nodeType":"basic.Goal","nodeName":"Economic\nGrowth","dynamicFunction":{"intentionID":"0004","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a004","nodeID":"0005","nodeType":"basic.Task","nodeName":"Listen to\nOpposition","dynamicFunction":{"intentionID":"0005","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a004","nodeID":"0006","nodeType":"basic.Goal","nodeName":"Adopt\nCentres Policy","dynamicFunction":{"intentionID":"0006","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a004","nodeID":"0007","nodeType":"basic.Task","nodeName":"Approve\nProject Funding","dynamicFunction":{"intentionID":"0007","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0008","nodeType":"basic.Task","nodeName":"Support\nOpposition","dynamicFunction":{"intentionID":"0008","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0009","nodeType":"basic.Task","nodeName":"Approve Metro\n 2nd Loan","dynamicFunction":{"intentionID":"0009","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a003","nodeID":"0010","nodeType":"basic.Goal","nodeName":"Prevent Highway\nConstruction Downtown","dynamicFunction":{"intentionID":"0010","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0011","nodeType":"basic.Goal","nodeName":"Support\nMetro","dynamicFunction":{"intentionID":"0011","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0012","nodeType":"basic.Softgoal","nodeName":"Protect\nNeighbourhoods","dynamicFunction":{"intentionID":"0012","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0013","nodeType":"basic.Task","nodeName":"Create Central\nArea Plan","dynamicFunction":{"intentionID":"0013","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a003","nodeID":"0014","nodeType":"basic.Task","nodeName":"Elect\nReformer\nCouncil","dynamicFunction":{"intentionID":"0014","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a002","nodeID":"0015","nodeType":"basic.Task","nodeName":"Lobby\nMetro","dynamicFunction":{"intentionID":"0015","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0016","nodeType":"basic.Task","nodeName":"Litigate\nSpadina","dynamicFunction":{"intentionID":"0016","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0017","nodeType":"basic.Softgoal","nodeName":"Save Old\nNeighbourhoods","dynamicFunction":{"intentionID":"0017","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0018","nodeType":"basic.Goal","nodeName":"Stop Spadina\nExpressway","dynamicFunction":{"intentionID":"0018","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0019","nodeType":"basic.Task","nodeName":"Lobby\nProvince","dynamicFunction":{"intentionID":"0019","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0020","nodeType":"basic.Task","nodeName":"Listen to\nOpposition","dynamicFunction":{"intentionID":"0020","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a000","nodeID":"0021","nodeType":"basic.Softgoal","nodeName":"Economic\nDevelopment","dynamicFunction":{"intentionID":"0021","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0022","nodeType":"basic.Goal","nodeName":"Fund\nInfrastructure\nProjects","dynamicFunction":{"intentionID":"0022","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0023","nodeType":"basic.Task","nodeName":"Lease Toronto\nBlocking Land","dynamicFunction":{"intentionID":"0023","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a000","nodeID":"0024","nodeType":"basic.Task","nodeName":"Block Spadina","dynamicFunction":{"intentionID":"0024","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a000","nodeID":"0025","nodeType":"basic.Task","nodeName":"Approve\nFunds","dynamicFunction":{"intentionID":"0025","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0026","nodeType":"basic.Task","nodeName":"Metro Approves\nFunding","dynamicFunction":{"intentionID":"0026","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0027","nodeType":"basic.Task","nodeName":"OMB\nApproval","dynamicFunction":{"intentionID":"0027","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0028","nodeType":"basic.Goal","nodeName":"Have Spadina\nExpressway","dynamicFunction":{"intentionID":"0028","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0029","nodeType":"basic.Goal","nodeName":"Get Funding","dynamicFunction":{"intentionID":"0029","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0030","nodeType":"basic.Task","nodeName":"Get Funding\nFrom Metro","dynamicFunction":{"intentionID":"0030","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0031","nodeType":"basic.Task","nodeName":"Get Funding\nFrom Province","dynamicFunction":{"intentionID":"0031","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0032","nodeType":"basic.Task","nodeName":"     Province\n  Approves Funding","dynamicFunction":{"intentionID":"0032","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0033","nodeType":"basic.Task","nodeName":"Build Wilson-401\nto Lawrence","dynamicFunction":{"intentionID":"0033","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a005","nodeID":"0034","nodeType":"basic.Task","nodeName":"Build Lawrence\nto Eglington","dynamicFunction":{"intentionID":"0034","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"0010","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"B"}]}},{"nodeActorID":"a005","nodeID":"0035","nodeType":"basic.Goal","nodeName":"Build\nExpressway","dynamicFunction":{"intentionID":"0035","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0036","nodeType":"basic.Task","nodeName":"Expropriate\nLand","dynamicFunction":{"intentionID":"0036","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0037","nodeType":"basic.Task","nodeName":"Plan Project","dynamicFunction":{"intentionID":"0037","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}}],"links":[{"linkID":"0000","linkType":"++S","postType":null,"linkSrcID":"0000","linkDestID":"0004","absoluteValue":-1},{"linkID":"0001","linkType":"+","postType":null,"linkSrcID":"0002","linkDestID":"0004","absoluteValue":-1},{"linkID":"0002","linkType":"+S","postType":null,"linkSrcID":"0003","linkDestID":"0004","absoluteValue":-1},{"linkID":"0003","linkType":"++S","postType":null,"linkSrcID":"0006","linkDestID":"0004","absoluteValue":-1},{"linkID":"0004","linkType":"++","postType":null,"linkSrcID":"0007","linkDestID":"0003","absoluteValue":-1},{"linkID":"0005","linkType":"AND","postType":null,"linkSrcID":"0007","linkDestID":"0026","absoluteValue":-1},{"linkID":"0006","linkType":"AND","postType":null,"linkSrcID":"0013","linkDestID":"0010","absoluteValue":-1},{"linkID":"0007","linkType":"AND","postType":null,"linkSrcID":"0014","linkDestID":"0010","absoluteValue":-1},{"linkID":"0008","linkType":"--","postType":null,"linkSrcID":"0014","linkDestID":"0011","absoluteValue":-1},{"linkID":"0009","linkType":"+","postType":null,"linkSrcID":"0014","linkDestID":"0012","absoluteValue":-1},{"linkID":"0010","linkType":"+","postType":null,"linkSrcID":"0012","linkDestID":"0017","absoluteValue":-1},{"linkID":"0011","linkType":"+","postType":null,"linkSrcID":"0013","linkDestID":"0012","absoluteValue":-1},{"linkID":"0012","linkType":"++","postType":null,"linkSrcID":"0005","linkDestID":"0015","absoluteValue":-1},{"linkID":"0013","linkType":"++","postType":null,"linkSrcID":"0009","linkDestID":"0027","absoluteValue":-1},{"linkID":"0015","linkType":"+S","postType":null,"linkSrcID":"0004","linkDestID":"0021","absoluteValue":-1},{"linkID":"0016","linkType":"++","postType":null,"linkSrcID":"0018","linkDestID":"0017","absoluteValue":-1},{"linkID":"0017","linkType":"OR","postType":null,"linkSrcID":"0015","linkDestID":"0018","absoluteValue":-1},{"linkID":"0018","linkType":"OR","postType":null,"linkSrcID":"0016","linkDestID":"0018","absoluteValue":-1},{"linkID":"0019","linkType":"OR","postType":null,"linkSrcID":"0019","linkDestID":"0018","absoluteValue":-1},{"linkID":"0020","linkType":"++","postType":null,"linkSrcID":"0008","linkDestID":"0016","absoluteValue":-1},{"linkID":"0021","linkType":"++","postType":null,"linkSrcID":"0020","linkDestID":"0019","absoluteValue":-1},{"linkID":"0022","linkType":"++","postType":null,"linkSrcID":"0020","linkDestID":"0024","absoluteValue":-1},{"linkID":"0023","linkType":"--S","postType":null,"linkSrcID":"0024","linkDestID":"0025","absoluteValue":-1},{"linkID":"0024","linkType":"AND","postType":null,"linkSrcID":"0025","linkDestID":"0022","absoluteValue":-1},{"linkID":"0025","linkType":"--S","postType":null,"linkSrcID":"0024","linkDestID":"0032","absoluteValue":-1},{"linkID":"0026","linkType":"++S","postType":null,"linkSrcID":"0025","linkDestID":"0032","absoluteValue":-1},{"linkID":"0027","linkType":"AND","postType":null,"linkSrcID":"0026","linkDestID":"0030","absoluteValue":-1},{"linkID":"0028","linkType":"AND","postType":null,"linkSrcID":"0027","linkDestID":"0030","absoluteValue":-1},{"linkID":"0029","linkType":"AND","postType":null,"linkSrcID":"0031","linkDestID":"0029","absoluteValue":-1},{"linkID":"0030","linkType":"AND","postType":null,"linkSrcID":"0030","linkDestID":"0029","absoluteValue":-1},{"linkID":"0031","linkType":"AND","postType":null,"linkSrcID":"0029","linkDestID":"0028","absoluteValue":-1},{"linkID":"0032","linkType":"++","postType":null,"linkSrcID":"0032","linkDestID":"0031","absoluteValue":-1},{"linkID":"0033","linkType":"AND","postType":null,"linkSrcID":"0033","linkDestID":"0035","absoluteValue":-1},{"linkID":"0034","linkType":"AND","postType":null,"linkSrcID":"0034","linkDestID":"0035","absoluteValue":-1},{"linkID":"0035","linkType":"AND","postType":null,"linkSrcID":"0035","linkDestID":"0028","absoluteValue":-1},{"linkID":"0036","linkType":"AND","postType":null,"linkSrcID":"0037","linkDestID":"0028","absoluteValue":-1},{"linkID":"0037","linkType":"AND","postType":null,"linkSrcID":"0036","linkDestID":"0028","absoluteValue":-1}],"constraints":[{"constraintType":"A","constraintSrcID":"0013","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":12},{"constraintType":"A","constraintSrcID":"0014","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":5},{"constraintType":"A","constraintSrcID":"0009","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":2},{"constraintType":"A","constraintSrcID":"0020","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":3},{"constraintType":"A","constraintSrcID":"0024","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":3},{"constraintType":"A","constraintSrcID":"0023","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":30},{"constraintType":"A","constraintSrcID":"0034","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":13},{"constraintType":"A","constraintSrcID":"0006","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":20}],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0000","absTime":"0","evaluationValue":"1100"},{"intentionID":"0001","absTime":"0","evaluationValue":"0011"},{"intentionID":"0002","absTime":"0","evaluationValue":"0011"},{"intentionID":"0003","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0004","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0005","absTime":"0","evaluationValue":"1100"},{"intentionID":"0006","absTime":"0","evaluationValue":"1100"},{"intentionID":"0007","absTime":"0","evaluationValue":"0011"},{"intentionID":"0008","absTime":"0","evaluationValue":"1100"},{"intentionID":"0009","absTime":"0","evaluationValue":"1100"},{"intentionID":"0010","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0011","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0012","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0013","absTime":"0","evaluationValue":"1100"},{"intentionID":"0014","absTime":"0","evaluationValue":"1100"},{"intentionID":"0015","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0016","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0017","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0018","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0019","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0020","absTime":"0","evaluationValue":"1100"},{"intentionID":"0021","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0022","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0023","absTime":"0","evaluationValue":"1100"},{"intentionID":"0024","absTime":"0","evaluationValue":"1100"},{"intentionID":"0025","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0026","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0027","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0028","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0029","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0030","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0031","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0032","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0033","absTime":"0","evaluationValue":"0011"},{"intentionID":"0034","absTime":"0","evaluationValue":"0010"},{"intentionID":"0035","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0036","absTime":"0","evaluationValue":"0011"},{"intentionID":"0037","absTime":"0","evaluationValue":"0011"}],"previousAnalysis":null}};
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

