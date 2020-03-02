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
  	if(this.connectedTo1.includes(anotherNode)){
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
    this.acotrSum = 0; 
  }
  get sum(){
  	return this.actorSum; 
  }
  set sum(newSum){
  	this.actorSum = newSum;
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

// //Continue on here!!!!!
// function avoidCollision(curActor, actorList){
// 	for(var actor of actorList){
// 		if(actor.nodeName != curActor.nodeName){
// 			var cCur = [curActor.nodeX + 0.5 * curActor.sizeX, curActor.nodeY + 0.5 * curActor.sizeY]; 
// 			var cAct = [actor.nodeX + 0.5 * actor.sizeX, actor.nodeY + 0.5 * actor.sizeY]
// 			var maxXLength = Math.max(actor.sizeX, curActor.sizeX);
// 			var maxYLength = Math.max(actor.sizeY, curActor.sizeY);
// 			var maxLength = Math.max(maxXLength, maxYLength);
// 			//console.log(maxLength);
// 			var distance = Math.sqrt((cCur[0] - cAct[0])**2 + (cCur[1] - cAct[1])**2)
// 			if(distance < maxLength){
// 				var xDiff = cCur[0] - cAct[0];
// 				var yDiff = cCur[1] - cAct[1];
// 				//console.log("xDiff: " + xDiff);
// 				//console.log("yDiff: " + yDiff);
// 				var ratio = maxLength/distance; 
// 				var scaledXDiff = ratio * xDiff; 
// 				var scaledYDiff = ratio * yDiff; 
// 				//console.log("To move");
// 				//console.log(scaledXDiff - xDiff);
// 				//console.log(scaledYDiff - yDiff);
// 				curActor.nodeX += scaledXDiff - xDiff; 
// 				curActor.nodeY += scaledYDiff - yDiff;
// 			}
// 		}
// 	}
// }

//TODO: change here!!!!!!
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
		// for(var actor of actorSet){
		// 	var intentionList = actor.intentionList;
		// 	for(var i = 0; i < intentionList.length; i++){
		// 		var intentionId = intentionList[i];
		// 		for(var node of nodeSet){
		// 			if(node.nodeId == intentionId){
		// 				console.log("?");
		// 				console.log(node.nodeName);
		// 				console.log(actor.nodeId);
		// 				console.log("1");
		// 				console.log(node.nodeY);
		// 				var curX = node.nodeX; 
		// 				var curY = node.nodeY; 
		// 				node.nodeX = curX + actor.nodeX + 150; 
		// 				node.nodeY = curY + actor.nodeY + 100;
		// 				console.log("2");
		// 				console.log(node.nodeY);
		// 			}
		// 		}
		// 	}
		// }

		for(var node of nodeSet){
			var actorId = node.parent; 
			for(var actor of actorSet){
				if(actor.nodeId === actorId){
					var curX = node.nodeX; 
					var curY = node.nodeY; 
					node.nodeX = curX + actor.nodeX + 150; 
					node.nodeY = curY + actor.nodeY + 100; 
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
		var tempElemSet = new Set();
		//clean up the value for attraction for each iteration
		// curNode.setForcesX = 0; 
		// curNode.setForcesY = 0;
		for(var node of nodeSet){
			if(node.actorId1 === curNode.actorId1){
				tempElemSet.add(node);
			}
		}
		for(var node of tempElemSet){
			if(curNode.isConnectdTo(node)){
				elemSet.add(node);
			}
		}
		for(var node of Array.from(elemSet).reverse()){
			var nodeName = node.nodeName;
			if(curName != nodeName){
				var forces = attraction(curNode, node, isActor);
				var forceX = 5 * forces[0]; 
				var forceY = 5 * forces[1];
				var curXForce = curNode.forcesX1; 
				curXForce += forceX; 
				curNode.setForcesX = curXForce;
				var curYForce = curNode.forcesY1; 
				curYForce += forceY; 
				curNode.setForcesY = curYForce; 
			}
		}
		for(var node of Array.from(tempElemSet).reverse()){
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
		var forceSum = 6 * Math.pow(d,2)/(100*coefficient);
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
		var forceSum = 3*Math.pow(coefficient,2)/d;
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
			if(!(typeof nodeIdNodePosDict[connection["destId"]] === "undefined")){
				newTarget["x"] = nodeIdNodePosDict[connection["destId"]]["x"];
				newTarget["y"] = nodeIdNodePosDict[connection["destId"]]["y"]; 
				newTarget["linkID"] = connection["linkId"];
				newTarget["linkType"] = connection["linkType"];
			//TODO: continue here
				newTarget["linkSrcID"]= node.nodeId;
				linkList.push(newTarget);
			}
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

function minimizeCoordinate(nodeSet){
	var minXDict = new Object();
	var minYDict = new Object();
	for(var node of nodeSet){
		var curX = node.nodeX;
		var curY = node.nodeY;
		var curActor = node.actorId1;
		if(typeof minXDict[curActor] === 'undefined'){
			minXDict[curActor] = curX;
		}
		if(typeof minYDict[curActor] === 'undefined'){
			minYDict[curActor] = curY;
		}

		if(minXDict[curActor] > curX){
			minXDict[curActor] = curX;
		}
		if(minYDict[curActor] > curY){
			minYDict[curActor] = curY;
		}
	}


	for(var node of nodeSet){
		var curId = node.actorId1;
		if(minXDict[curId] > 0){
			node.nodeX = node.nodeX - minXDict[curId];
		}
		if(minYDict[curId] > 0){
			node.nodeY = node.nodeY - minYDict[curId];
		}
	}
}

function getSizeOfActor(nodeSet, actorSet){
	var maxPXDict = new Object();
	var maxPYDict = new Object();
	var minPXDict = new Object(); 
	var minPYDict = new Object();
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
		if(typeof minPXDict[curActor] === 'undefined'){
			minPXDict[curActor] = 0;
		}
		if(typeof minPYDict[curActor] === 'undefined'){
			minPYDict[curActor] = 0;
		}

		if(maxPXDict[curActor] < curX){
			maxPXDict[curActor] = curX;
		}
		if(maxPYDict[curActor] < curY){
			maxPYDict[curActor] = curY;
		}
		if(minPXDict[curActor] > curX){
			minPXDict[curActor] = curX;
		}
		if(minPYDict[curActor] > curY){
			minPYDict[curActor] = curY;
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
		if(typeof minPXDict[actorId] === 'undefined'){
			minPXDict[actorId] = 0;
		}
		if(typeof minPYDict[actorId] === 'undefined'){
			 minPYDict[actorId] = 0; 
		}
		var x = maxPXDict[actorId] - minPXDict[actorId] + 300; 
		var y = maxPYDict[actorId] - minPYDict[actorId] + 200;
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
	var numIterations = 120;
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
	minimizeCoordinate(nodeSet);
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
	inputModel1 = {"graph":{"cells":[{"type":"basic.Actor","size":{"width":150,"height":120},"position":{"x":-1730,"y":1180},"angle":0,"id":"6943d272-896b-450a-a07b-afe55c3e3900","z":-13,"nodeID":"aNaN","embeds":["0eeecde1-af29-4ab7-b5a1-0cbd52e186f5"],"attrs":{".label":{"cx":37.5,"cy":12.353299855639},".name":{"text":"County\nof York"}}},{"type":"basic.Actor","size":{"width":290,"height":290},"position":{"x":-1860,"y":1320},"angle":0,"id":"ae04554b-19f9-4a53-b0c2-67d657e600e1","embeds":["bafe9184-4d2e-4e8d-98c7-a860da7d4ced","b677c9a9-df38-4d5e-9816-1a7a3075b73c","692374ec-ad5c-4005-a7ea-882760da0f49","0ec02ad6-740b-4758-82ed-08d9fdad410d","95630f7e-086a-4eb7-bc6c-fe0c9253ae07"],"z":-12,"elementid":"0096","nodeID":"a000","attrs":{".label":{"cx":72.5,"cy":29.265422559956},".name":{"text":"Planning\nBoard","font-size":13}}},{"type":"basic.Actor","size":{"width":910,"height":700},"position":{"x":-960,"y":1530},"angle":0,"id":"d5f03f99-6c26-47be-84a3-2aa0460055a3","embeds":["7f5cc9ff-98a9-4860-af7c-a00bf296c01e","bc735870-8a17-4f91-970f-c0330e71891c","1d255909-6bb0-4fd4-9d03-2daef483532e","935320cd-b59e-46b7-8750-8ac9950ab60b","221495ae-9501-4124-8d95-e097b696426d","2858a0f2-9be9-4903-ac5c-dce6d5efcc06","f5bcc817-8336-4f01-9999-564a8c0e5580","d1a08fd7-4483-4875-9c04-2a3b1c4547c6","91425622-ef5c-487d-be9f-da3209adaf0c","c88412f2-d190-4385-85bd-d448b82bb93f","aa67ac5f-b32a-452f-a420-b913c6a64be8","866bdcc9-a83b-45ca-b316-5e9c0ba0f138","1f746210-7d70-431a-8210-ce92e13ef393","b62ecd24-2792-4f4f-b38f-dc478c137485","3132677d-9e72-46ef-9138-0614553f6d81","5d10d5fd-a05d-47ca-9d0a-1788ef4d4160","8eb9ffd1-7777-409e-aa5a-10cec529f380","74a77268-6388-43c6-afbd-da4f15512608","0c46a019-ca27-4ed3-8017-6acfe1aba142","ceaf9047-b006-434c-8d64-2c36736e0e7d","18306b31-6d32-4f5b-aff8-29214864e167","2b52a72e-5f80-43b6-bcf4-e5453687e51f","44f1e97e-5ab2-438f-a3f5-9631e53a6285","bb93c20c-cc20-4d35-8b6b-0c291bff4dbb","0e4a1250-4ec8-4668-befa-c0ead76f25ec","febd9408-ad34-43c9-a9fd-ec38e1a4ae9c","2dbc5b3f-f164-402e-8d57-feec63c538b1","8666b762-5a83-485b-a613-67e6db7f3a28","e54a9806-4695-416b-a829-483a7b1364e8","1bc1dcd2-830f-4e19-a4e4-c22e037e9fee","2f5b50d8-b726-4eac-b127-d4b37c6d4718","b96c6ca4-8c8b-4629-98c5-f59ce8ce24cb","baaaea0f-c6a7-4100-867a-c56ef7a83f78","1ae08063-268a-446c-81ae-36295b6b8776","1f9f8ad6-4687-466f-8b43-81bed6ea32a8","6d3ce5b6-30d6-427d-9a96-2857872b5822","f0a3dace-354b-4f7c-99f4-839ce5e915f0","6f6311db-15d0-4f23-9ec7-c1993550cf44","165f17c7-38ab-42a2-86af-58c171b98c37","396340ac-3443-47e9-95e4-2a0c6b3abffd","7677cb2a-8f78-4f52-aeb8-ca15364ff7eb","5fc38208-d0c9-454c-a76e-02090de66786","31d5ab29-98d7-44de-a606-8bf17860e312","11131039-33e4-44e3-bf47-c5bc36b7d872","f0e85889-1510-4da0-9a4e-9513b86a8bf4","854ba957-830b-4a4d-81c4-f9787dd7b258","9fd3b423-1498-47e5-be08-71115d874634","9b85e7c7-843d-42b4-9cf7-086b67cc830b","dc31c959-48fd-4f4f-ae73-0f0a1b45898a","15650952-0a43-45f7-b06a-77ddd3fa080b","07bb1bb9-9aea-4307-ada7-f450fe20498f","f8bfb19a-a7da-4020-bfe3-9822b69d0d9b"],"z":-11,"elementid":"0095","nodeID":"a001","attrs":{".label":{"cx":227.5,"cy":70.05208010436},".name":{"text":"Spadina\nProject","font-size":13}}},{"type":"basic.Actor","size":{"width":870,"height":680},"position":{"x":-1840,"y":1570},"angle":0,"id":"054a647a-8da8-4a4f-a70f-f08ff0835f02","embeds":["f9b93d57-142a-45a2-ac4d-0dfa28c5f72d","c5d15c9f-bb6c-4e0e-b86b-3870d671bdcc","daecc947-a379-48eb-b61d-66a6e773f540","9e091360-eb4d-4a7e-abb4-0a7cc1128665","1871a06d-3e1a-41aa-bd49-adafcbd8543b","fb1a1dc2-3b5f-4ab8-9056-7090b02431e5","d6b610ac-3001-4ca8-9b80-db9b56342085","2234de0b-efc0-4790-a8b7-20caa56bd1cf","b0748fd2-8d08-4e08-ba66-552dcfb4434a","2fdf3aeb-3b3a-463e-a353-3a826c67e61a","60ca137c-5937-4b09-9c18-0fbc034ed122","91b42913-545f-48a6-b9ef-84ec589e2b69","33c485e9-37ea-4aae-92a3-796b3851426a","8b56e5b2-a5cb-4002-a420-7e3b2100b005","64548d39-924b-4c91-904c-e6215daf0a95","093cd997-cd23-424e-9b03-b373265e3223","c176e3e5-bc04-4e7f-845c-b7dffe2eb988","8c9711c4-6e4c-4ab8-85d2-4e23d9813de9","17f3f1bb-23d4-4793-a7c3-5af51ad059b5","2ea394ea-94d2-40af-9223-a91bff0e8717","0289e003-1aa1-44be-b190-d44a895bbad5","7501e6fc-d604-46e4-9a40-f40187f7578d","1bbce722-6946-43d2-be8c-9eb46b16effe","135244df-eef7-45c0-a672-94c03851de80","fada155b-6166-4651-88f9-d36748f43942","feba3526-bed2-4c2b-ad49-54731ac5f7f2","9daed8b4-83a5-4085-81e7-b545fd807cd6","90d7b148-5a38-476e-b5b4-3536418e59e2","96443bde-57f9-411b-a688-e11340d2d63e","49f7337c-2618-4576-b86c-bad7e4dce188","45defa07-1e5f-4e47-977e-fb697f48a865","21588abc-21f3-46f5-9d8f-1918589d7f38","86c5ba80-8d35-4c34-bc03-e9dac2f2bd56","9b30c53f-abee-4942-af6f-8589fbe24266","59a35f6a-cc1d-4475-a4d4-710ce9ae2993","5be36a87-a58a-4b85-881a-044c3cc0a799","b2e91675-80c4-4a03-95b9-184124297690","265f9842-f525-4748-9ace-df7841a7fbff","b31eddce-7964-4031-8aa2-52a4e9bc39ca","3c36e8a7-36cb-464c-8386-b19c412514a9","5a0432c2-4d46-441f-9e4b-ceed2fbb537e","a19574ec-230e-4296-b7c5-3bd1cb73e9e3","c33bcd31-726f-46ff-a5c0-91e96b6f409a"],"z":-10,"elementid":"0079","nodeID":"a002","attrs":{".label":{"cx":217.5,"cy":68.062495213662},".name":{"text":"Network\nProject","font-size":13}}},{"type":"basic.Actor","size":{"width":660,"height":410},"position":{"x":-1580,"y":1130},"angle":0,"id":"0db9d390-7428-4459-a240-296670458093","embeds":["e3c1dd21-3629-4964-8c8a-547c6c6cec1e","4f27f729-637b-4acf-813f-b43805177c56","2e6163c1-a12b-41ff-8c94-0acb7a0d8d0e","213c74b0-1c71-4af6-beb8-039cb2c8ce9f","344628e6-0efd-4cb5-bb3d-71517581c3fa","36d48ade-5caa-4b46-8804-810735c41968","c10dd155-5146-4335-8dd7-0d03aeb065e4","b4c27e9c-3afd-445f-b7a4-9ba56d6ff00f","5c5e72ff-c5d0-4ce6-a301-d6058b77fb44","8fe414b6-ebcd-4dff-9e69-26a97f38c554","133ef20d-5e2f-49c2-91ec-24b8be87cc2a","e8408f60-d40b-48e4-a18c-2c4d16447a1a","bc94c40b-cf02-414e-81c2-cc1464f2a8a9","7e077e6f-b1e5-4b6b-8114-1d92a24a0708","522df3cb-a7f8-4209-a4a9-0df743b303f9","679308ff-3f54-4dc9-b9a9-881f67c9120d","52014aef-a6d9-44b2-b17b-200df8722e08","986171b1-648b-4a92-adda-0a37df92e07e","c64904d0-c624-4590-8e97-0ed3ed5a81b5","6a4b08ba-40dd-4d11-994b-bcc1c6f5eafb","3ba7b994-115f-4718-b42f-d2261ee158ee"],"z":-9,"elementid":"0070","nodeID":"a003","attrs":{".label":{"cx":165,"cy":41.203041207862},".name":{"text":"Toronto","font-size":13}}},{"type":"basic.Actor","size":{"width":310,"height":200},"position":{"x":-40,"y":1200},"angle":0,"id":"85f98d0e-ba54-4253-9283-0a14b78ebf92","embeds":["4af49377-3280-42d9-9525-b63899cbcc2d","a4b00966-9130-4681-9423-dc3608f2bb7b","e00a530a-213d-4f4e-a9d7-6cd6751be53e","3cc80045-3646-4df9-ba18-0717116adc25","de4f92aa-2f00-4d4a-b1c7-626f09f1d0bd","167cef33-4a05-4650-ac6f-26e8f6f78c0a"],"z":-7,"elementid":"0001","nodeID":"a004","attrs":{".label":{"cx":77.5,"cy":20.31209415516},".name":{"text":"OMB","font-size":13}}},{"type":"basic.Actor","size":{"width":420,"height":380},"position":{"x":-460,"y":1160},"angle":0,"id":"5b296860-9f72-42d6-b1c8-616f944edea2","embeds":["0e008f24-401b-4d3f-9384-939cb86a44ab","bd2e1954-344e-426a-868d-47bf907ba05a","9eea5d4a-636f-4816-860f-ca507d24a507","a3476b52-f382-48ad-a290-ee2f6a0a17b6","8337be20-4be9-45bb-bf20-974e8ca08f47","c8cab262-08ee-48bf-80f1-1eb8da2fbc0e","21aaae7e-90b9-4b32-b2fa-1f28bc96000f","cf9132ff-b223-460a-98a5-013b3354cf0c","60dbb961-9153-4453-a177-e62f60b00e45","dbe666fd-9f42-48e3-9ab5-6eae97c8783f","1c3b1bd8-a6f1-4afa-ba51-56c0050c250e","14640633-9325-4549-b1af-e3b28a2b058b","349d2961-d25e-4ccb-9500-55199cdd9950","564bf0e7-0478-4646-87de-6bb363083707","4364f88c-f5ab-4b1c-ab65-8bddae47558d","c59adb51-153a-4bbd-a4f5-024761cbd75c","9412d8be-e160-4298-8609-fe2692c1aede","83deb3b0-d197-45ea-8c99-9101fd0e64e8","7946602d-fb09-49a3-96c3-bb88ec8223a7","41746342-6a5c-49e4-b70b-0421b9b7f925"],"z":-6,"elementid":"0002","nodeID":"a005","attrs":{".label":{"cx":105,"cy":38.218645162923},".name":{"text":"Opposition","font-size":13}}},{"type":"basic.Actor","size":{"width":450,"height":430},"position":{"x":-890,"y":1120},"angle":0,"id":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","embeds":["b5e68c12-b0ad-4ed3-93f9-2b8fb2767273","66d920bc-ae25-4e43-9162-13d207965412","c9b41dcb-f559-4ce9-a53b-5b926d4cd08c","caeeff5c-8033-4a7f-a30f-86a67a032c0a","537f1d2b-9479-4c40-b516-5a65d060ddb0","1474392d-9d2b-416b-9911-e8dbc368efa9","c738df70-be3d-4704-9b74-4a4f59b44bcc","2e442c45-94ad-440d-9713-e02330304daf","3401d0ea-e54b-4f6f-90bd-ecb184e8f706","879d4087-ef72-47a4-bc2d-4863263744c4","68f7e988-1846-439d-bf58-a71720c04829","5e4b4c65-9a56-48a7-9fff-3fac4f78f30e","6ff83494-5905-4dff-9866-b3ec0b778c43","a8b6cbe7-2edd-4d46-b47f-ef00adcffb37","49bcd71b-0baa-45cc-a355-3eb4da1907f5","20b50c2b-51d3-45d3-93f3-5966415a32ed","f21441ca-abc7-45dc-95d2-d399cb55ca1b","7ef4dd33-5c63-411e-831a-e2f007573249","e08d1541-2e49-4f20-8b1b-494f4a081e73","083727bb-f412-4e37-9e7f-1fbb5cc236f6"],"z":-4,"elementid":"0004","nodeID":"a006","attrs":{".label":{"cx":112.5,"cy":43.192636417075},".name":{"text":"Metro","font-size":13}}},{"type":"basic.Actor","size":{"width":370,"height":320},"position":{"x":-110,"y":1420},"angle":0,"id":"175624ec-ffba-4f89-a94f-5a8104623f60","embeds":["b07503c6-aea6-467a-b2d6-f8e07467e207","bcbabca4-7f71-4de6-9e6a-d4225be11f03","21c540e5-dbcc-4cfa-9803-6728c25c82f3","8eb9ffd1-7777-409e-aa5a-10cec529f380","07d5b32d-936e-4a1a-91c4-8e9594b9e115","3715ad11-5834-4a07-b0bc-7eb46f69f2d8","d9361977-1af0-442b-9fe2-b88133b4a192","ef0bb0a0-9d97-4aa9-b284-6333dc182c29","bd7f7179-8e6b-419b-993e-1a12f44d3ca8","219d17d9-1970-4e23-a733-35bd2ec28809"],"z":-3,"elementid":"0005","nodeID":"a007","attrs":{".label":{"cx":92.5,"cy":32.249837451167},".name":{"text":"Province","font-size":13}}},{"type":"basic.Actor","size":{"width":310,"height":270},"position":{"x":-120,"y":1990},"angle":0,"id":"0d877ac0-8261-45fd-8fd7-3e6806c75342","embeds":["e210946f-c935-4dd6-9f38-218b55932bc2","66738920-25d2-4f6b-ba21-c969a2c8e74f","5422f1d6-6525-4009-895e-839a8a4e0440","44d3689b-1a48-4b6d-91a6-c93a0f39f20d","7e1d9bec-7b02-45d2-b2ee-5edede72fde6","6119cca5-5d59-40c3-bb93-e4dd3de3f7b4","69dcc7d0-410d-4c36-8bf2-670f1a751579","92d24c51-8a5c-43d3-b622-286e4fad1140"],"z":-2,"elementid":"0006","nodeID":"a008","attrs":{".label":{"cx":77.5,"cy":27.275806884452},".name":{"text":"York","font-size":13}}},{"type":"basic.Actor","size":{"width":360,"height":240},"position":{"x":-50,"y":1750},"angle":0,"id":"707ab4cb-0f53-40e7-903b-98334bbf221c","embeds":["e7e32f06-0dbe-4db4-b0d6-b69e924e40d7","64c45778-2193-4e39-a847-85e261d39a58","7b80e3a4-b87b-42ec-9978-145cb33ffaaa","eed3b36e-2751-4ef5-88e0-5fda38cbc518","2e79b82e-9dc1-4756-a77f-34f5bec0bfd9","f0aa1001-c3ae-457b-8d81-8f3b6067b758"],"z":0,"elementid":"0007","nodeID":"a009","attrs":{".label":{"cx":90,"cy":24.291371883422},".name":{"text":"Yorkdale\nProject","font-size":13}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":-1520,"y":1220},"angle":0,"id":"b4c27e9c-3afd-445f-b7a4-9ba56d6ff00f","embeds":"","z":1,"elementid":"0000","nodeID":"0000","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"text":""},".name":{"text":"Promote\nGrowth","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":70},"position":{"x":90,"y":1760},"angle":0,"id":"7b80e3a4-b87b-42ec-9978-145cb33ffaaa","embeds":"","z":1,"elementid":"0001","nodeID":"0001","parent":"707ab4cb-0f53-40e7-903b-98334bbf221c","attrs":{".satvalue":{"text":""},".name":{"text":"Have Yorkdale\nShopping Plaza\n","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":25,"cy":7.378502805078},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":80,"height":60},"position":{"x":-1060,"y":1400},"angle":0,"id":"e8408f60-d40b-48e4-a18c-2c4d16447a1a","embeds":"","z":2,"elementid":"0002","nodeID":"0002","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"text":""},".name":{"text":"Support\nMetro","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":20,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":120,"height":60},"position":{"x":-1570,"y":1320},"angle":0,"id":"5c5e72ff-c5d0-4ce6-a301-d6058b77fb44","embeds":"","z":3,"elementid":"0003","nodeID":"0003","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"value":"satisfied","text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Expand Suburbs\nVacant Land Use ","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".label":{"cx":30,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":180,"height":60},"position":{"x":-1480,"y":1580},"angle":0,"id":"8c9711c4-6e4c-4ab8-85d2-4e23d9813de9","embeds":"","z":9,"elementid":"0004","nodeID":"0004","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Have a Unified Arterial\nRoad System","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":45,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-820,"y":1920},"angle":0,"id":"1bc1dcd2-830f-4e19-a4e4-c22e037e9fee","embeds":"","z":13,"elementid":"0005","nodeID":"0005","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Have Spadina \nExpressway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":40,"y":2170},"angle":0,"id":"92d24c51-8a5c-43d3-b622-286e4fad1140","embeds":"","z":13,"elementid":"0006","nodeID":"0006","parent":"0d877ac0-8261-45fd-8fd7-3e6806c75342","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Approve Land\nRelease","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"37"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":180,"height":60},"position":{"x":-940,"y":1780},"angle":0,"id":"74a77268-6388-43c6-afbd-da4f15512608","embeds":"","z":14,"elementid":"0007","nodeID":"0007","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"satisfied","text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Complete Initial\nDowntown Widening","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".label":{"cx":45,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-100,"y":1560},"angle":0,"id":"8eb9ffd1-7777-409e-aa5a-10cec529f380","embeds":"","z":14,"elementid":"0008","nodeID":"0008","parent":"175624ec-ffba-4f89-a94f-5a8104623f60","attrs":{".satvalue":{"text":""},".name":{"text":"Approve Funds","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-770,"y":2020},"angle":0,"id":"baaaea0f-c6a7-4100-867a-c56ef7a83f78","embeds":"","z":15,"elementid":"0009","nodeID":"0009","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Plan Project","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-750,"y":1830},"angle":0,"id":"b96c6ca4-8c8b-4629-98c5-f59ce8ce24cb","embeds":"","z":16,"elementid":"0010","nodeID":"0010","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":50,"y":1560},"angle":0,"id":"d9361977-1af0-442b-9fe2-b88133b4a192","embeds":"","z":16,"elementid":"0011","nodeID":"0011","parent":"175624ec-ffba-4f89-a94f-5a8104623f60","attrs":{".satvalue":{"text":""},".name":{"text":"Fund \nInfrastructure ","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":25,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-650,"y":1910},"angle":0,"id":"2b52a72e-5f80-43b6-bcf4-e5453687e51f","embeds":"","z":17,"elementid":"0012","nodeID":"0012","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Build Spadina\nExpressway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Softgoal","size":{"width":140,"height":60},"position":{"x":-1750,"y":1350},"angle":0,"id":"95630f7e-086a-4eb7-bc6c-fe0c9253ae07","embeds":"","z":18,"elementid":"0013","nodeID":"0013","parent":"ae04554b-19f9-4a53-b0c2-67d657e600e1","attrs":{".satvalue":{"text":""},".name":{"text":"Support Cooperation","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":35,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"link","source":{"id":"8eb9ffd1-7777-409e-aa5a-10cec529f380"},"target":{"id":"d9361977-1af0-442b-9fe2-b88133b4a192"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"b6e46a63-fa39-4bf7-ab8c-8305da265cf7","embeds":"","z":18,"linkID":"0000","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_25"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":130,"height":60},"position":{"x":-1370,"y":1370},"angle":0,"id":"986171b1-648b-4a92-adda-0a37df92e07e","embeds":"","z":19,"elementid":"0014","nodeID":"0014","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"text":""},".name":{"text":"Have Physical \nConnection between \nYork and downtown","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":32.5,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-810,"y":1640},"angle":0,"id":"15650952-0a43-45f7-b06a-77ddd3fa080b","embeds":"","z":22,"elementid":"0015","nodeID":"0015","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding \nFrom York","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-900,"y":1700},"angle":0,"id":"07bb1bb9-9aea-4307-ada7-f450fe20498f","embeds":"","z":23,"elementid":"0016","nodeID":"0016","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding \nFrom Toronto","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1270,"y":1930},"angle":0,"id":"b2e91675-80c4-4a03-95b9-184124297690","embeds":"","z":23,"elementid":"0017","nodeID":"0017","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Have\nCrosstown\nExpressway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-950,"y":1520},"angle":0,"id":"dc31c959-48fd-4f4f-ae73-0f0a1b45898a","embeds":"","z":24,"elementid":"0018","nodeID":"0018","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"York Approves\nInitial Funding","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1230,"y":1640},"angle":0,"id":"1bbce722-6946-43d2-be8c-9eb46b16effe","embeds":"","z":24,"elementid":"0019","nodeID":"0019","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Have\nDon Valley\nParkway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":130,"height":60},"position":{"x":-1050,"y":1610},"angle":0,"id":"a19574ec-230e-4296-b7c5-3bd1cb73e9e3","embeds":"","z":25,"elementid":"0020","nodeID":"0020","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Toronto Approves\nInitial Funding","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":32.5,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1310,"y":2150},"angle":0,"id":"5be36a87-a58a-4b85-881a-044c3cc0a799","embeds":"","z":25,"elementid":"0021","nodeID":"0021","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Have\nLakeshore\nExpressway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"15650952-0a43-45f7-b06a-77ddd3fa080b"},"target":{"id":"2f5b50d8-b726-4eac-b127-d4b37c6d4718"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"12a27134-2fa3-4673-9014-8518b8434531","embeds":"","z":26,"linkID":"0001","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_31"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"07bb1bb9-9aea-4307-ada7-f450fe20498f"},"target":{"id":"2f5b50d8-b726-4eac-b127-d4b37c6d4718"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"ada59bb1-5a1b-4238-96ec-ef4ffc206033","embeds":"","z":27,"linkID":"0002","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_32"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"dc31c959-48fd-4f4f-ae73-0f0a1b45898a"},"target":{"id":"15650952-0a43-45f7-b06a-77ddd3fa080b"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"87f26913-e90d-4b7f-8e8a-eb76f26f7bb2","embeds":"","z":28,"link-type":"PP","linkID":"0003","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_33"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"a19574ec-230e-4296-b7c5-3bd1cb73e9e3"},"target":{"id":"07bb1bb9-9aea-4307-ada7-f450fe20498f"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"8c80f6f9-a779-4397-b25f-8afdb19ecaa8","embeds":"","z":29,"link-type":"PP","linkID":"0004","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_34"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"74a77268-6388-43c6-afbd-da4f15512608"},"target":{"id":"1bc1dcd2-830f-4e19-a4e4-c22e037e9fee"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"1973bfab-d036-4cc7-8074-91fd8baffe62","embeds":"","z":31,"linkID":"0005","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_36"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"baaaea0f-c6a7-4100-867a-c56ef7a83f78"},"target":{"id":"1bc1dcd2-830f-4e19-a4e4-c22e037e9fee"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"028e09a5-469e-48d3-8d64-6f58f64a24cc","embeds":"","z":32,"linkID":"0006","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_37"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"b96c6ca4-8c8b-4629-98c5-f59ce8ce24cb"},"target":{"id":"1bc1dcd2-830f-4e19-a4e4-c22e037e9fee"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"48134c59-9730-4ff3-8299-43165d0497ce","embeds":"","z":33,"linkID":"0007","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_38"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"2b52a72e-5f80-43b6-bcf4-e5453687e51f"},"target":{"id":"1bc1dcd2-830f-4e19-a4e4-c22e037e9fee"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"3b32418d-9b11-4e59-a0ae-e3c97e949454","embeds":"","z":34,"linkID":"0008","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_39"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"5be36a87-a58a-4b85-881a-044c3cc0a799"},"target":{"id":"b31eddce-7964-4031-8aa2-52a4e9bc39ca"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"1871a06d-3e1a-41aa-bd49-adafcbd8543b","embeds":"","z":34,"linkID":"0009","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","vertices":[{"x":-1200,"y":2140},{"x":-1210,"y":2020},{"x":-1270,"y":2010}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_41"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"49f7337c-2618-4576-b86c-bad7e4dce188"},"target":{"id":"b31eddce-7964-4031-8aa2-52a4e9bc39ca"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"daecc947-a379-48eb-b61d-66a6e773f540","embeds":"","z":35,"parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","vertices":[{"x":-1240,"y":1840}],"linkID":"0010","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_40"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"1bbce722-6946-43d2-be8c-9eb46b16effe"},"target":{"id":"b31eddce-7964-4031-8aa2-52a4e9bc39ca"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"09f1fcb1-1fef-408a-b7aa-3e3da5253622","embeds":"","z":35,"linkID":"0011","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_42_11"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"b2e91675-80c4-4a03-95b9-184124297690"},"target":{"id":"b31eddce-7964-4031-8aa2-52a4e9bc39ca"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"2234de0b-efc0-4790-a8b7-20caa56bd1cf","embeds":"","z":36,"link-type":"and","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","linkID":"0012","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_43"},".assigned_time":{"0":""}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":-1130,"y":1970},"angle":0,"id":"3c36e8a7-36cb-464c-8386-b19c412514a9","embeds":"","z":37,"elementid":"0022","nodeID":"0022","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Ease\nCongestion","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"5c5e72ff-c5d0-4ce6-a301-d6058b77fb44"},"target":{"id":"b4c27e9c-3afd-445f-b7a4-9ba56d6ff00f"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"9a4c2cd1-bb70-40bc-ba6a-71910946e915","embeds":"","z":39,"link-type":"P","linkID":"0013","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_44"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"986171b1-648b-4a92-adda-0a37df92e07e"},"target":{"id":"679308ff-3f54-4dc9-b9a9-881f67c9120d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"213c74b0-1c71-4af6-beb8-039cb2c8ce9f","embeds":"","z":45,"link-type":"P","parent":"0db9d390-7428-4459-a240-296670458093","linkID":"0015","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_50"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":160,"height":60},"position":{"x":-1600,"y":1670},"angle":0,"id":"2ea394ea-94d2-40af-9223-a91bff0e8717","embeds":"","z":48,"elementid":"0023","nodeID":"0023","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Build Road Network \n- Single Project","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":40,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":170,"height":60},"position":{"x":-1440,"y":1700},"angle":0,"id":"b31eddce-7964-4031-8aa2-52a4e9bc39ca","embeds":"","z":49,"elementid":"0024","nodeID":"0024","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Build Road Network\n- Multiple Projects","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":42.5,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"link","source":{"id":"2ea394ea-94d2-40af-9223-a91bff0e8717"},"target":{"id":"8c9711c4-6e4c-4ab8-85d2-4e23d9813de9"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"5337f1c4-f1d7-47a5-bd95-244dac17f51d","embeds":"","z":50,"link-type":"or","linkID":"0016","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_55"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"b31eddce-7964-4031-8aa2-52a4e9bc39ca"},"target":{"id":"8c9711c4-6e4c-4ab8-85d2-4e23d9813de9"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"25f2a39f-028b-49e6-8ffe-54b24844b9b5","embeds":"","z":51,"link-type":"or","linkID":"0017","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_56"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1560,"y":1890},"angle":0,"id":"9daed8b4-83a5-4085-81e7-b545fd807cd6","embeds":"","z":52,"elementid":"0025","nodeID":"0025","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Approve\nNetwork","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1620,"y":1820},"angle":0,"id":"fada155b-6166-4651-88f9-d36748f43942","embeds":"","z":53,"elementid":"0026","nodeID":"0026","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Get Network \nFunding","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1690,"y":1760},"angle":0,"id":"0289e003-1aa1-44be-b190-d44a895bbad5","embeds":"","z":54,"elementid":"0027","nodeID":"0027","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"value":"satisfied","text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Plan\nNetwork","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"0289e003-1aa1-44be-b190-d44a895bbad5"},"target":{"id":"2ea394ea-94d2-40af-9223-a91bff0e8717"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"330ed8a4-a587-4d45-ba2e-bcf26910c786","embeds":"","z":55,"linkID":"0018","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_60"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"9daed8b4-83a5-4085-81e7-b545fd807cd6"},"target":{"id":"2ea394ea-94d2-40af-9223-a91bff0e8717"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"41e04566-e82b-4be8-9c35-1872dd3b23a6","embeds":"","z":56,"linkID":"0019","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_61"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"fada155b-6166-4651-88f9-d36748f43942"},"target":{"id":"2ea394ea-94d2-40af-9223-a91bff0e8717"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"76f0e316-d2fb-4ad3-9a5b-547dd212e077","embeds":"","z":57,"linkID":"0020","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_62"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1450,"y":1800},"angle":0,"id":"265f9842-f525-4748-9ace-df7841a7fbff","embeds":"","z":58,"elementid":"0028","nodeID":"0028","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Build Network","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"265f9842-f525-4748-9ace-df7841a7fbff"},"target":{"id":"2ea394ea-94d2-40af-9223-a91bff0e8717"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"51b8d0ea-c98a-44fb-b709-4fd2a9c3e9b8","embeds":"","z":59,"linkID":"0021","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_64"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"fada155b-6166-4651-88f9-d36748f43942"},"target":{"id":"265f9842-f525-4748-9ace-df7841a7fbff"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++D"}}}],"id":"f7e2da30-71e2-48ee-a5c4-e155e5284d9b","embeds":"","z":60,"link-type":"PPD","linkID":"0022","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_65"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"9daed8b4-83a5-4085-81e7-b545fd807cd6"},"target":{"id":"265f9842-f525-4748-9ace-df7841a7fbff"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++D"}}}],"id":"cb1adaf0-0bdb-4149-b959-8e611269527c","embeds":"","z":61,"link-type":"PPD","linkID":"0023","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_66"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"0289e003-1aa1-44be-b190-d44a895bbad5"},"target":{"id":"265f9842-f525-4748-9ace-df7841a7fbff"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++D"}}}],"id":"f9b93d57-142a-45a2-ac4d-0dfa28c5f72d","embeds":"","z":62,"link-type":"PPD","linkID":"0024","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","vertices":[{"x":-1490,"y":1790}],"attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_67"},".assigned_time":{"0":""}}},{"type":"basic.Softgoal","size":{"width":110,"height":70},"position":{"x":-1130,"y":1170},"angle":0,"id":"8fe414b6-ebcd-4dff-9e69-26a97f38c554","embeds":"","z":62,"elementid":"0029","nodeID":"0029","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"text":""},".name":{"text":"Improve Public\nTransit","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":27.5,"cy":7.378502805078},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-280,"y":2050},"angle":0,"id":"31d5ab29-98d7-44de-a606-8bf17860e312","embeds":"","z":63,"elementid":"0030","nodeID":"0030","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Get Land\nFrom York","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-930,"y":1940},"angle":0,"id":"8666b762-5a83-485b-a613-67e6db7f3a28","embeds":"","z":73,"elementid":"0031","nodeID":"0031","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"UD"},".name":{"text":"Approve\nConnected\nPlan","font-size":13},".constraints":{"lastval":["denied","partiallydenied","partiallysatisfied","satisfied"],"function":["C","C","C","C"],"markedvalue":4,"beginLetter":["0","A","B","C"],"endLetter":["A","B","C","D"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".assigned_time":{"0":"25","1":"28","2":"29"},"text":{"fill":"black"}}},{"type":"link","source":{"id":"8eb9ffd1-7777-409e-aa5a-10cec529f380"},"target":{"id":"6d3ce5b6-30d6-427d-9a96-2857872b5822"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"bbdd8f89-4341-40c8-822b-65e501092b25","embeds":"","z":74,"vertices":[],"link-type":"++S","linkID":"0025","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_84"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"8666b762-5a83-485b-a613-67e6db7f3a28"},"target":{"id":"baaaea0f-c6a7-4100-867a-c56ef7a83f78"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"27ecd8be-3653-44bb-b444-cce338e19061","embeds":"","z":75,"link-type":"or","linkID":"0026","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_80"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-750,"y":1730},"angle":0,"id":"2f5b50d8-b726-4eac-b127-d4b37c6d4718","embeds":"","z":81,"elementid":"0032","nodeID":"0032","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding\nToronto-York\nOnly","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"2f5b50d8-b726-4eac-b127-d4b37c6d4718"},"target":{"id":"b96c6ca4-8c8b-4629-98c5-f59ce8ce24cb"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"282f004a-ef0b-44c6-915c-906c667247e8","embeds":"","z":82,"link-type":"or","linkID":"0027","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_4"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-320,"y":1310},"angle":0,"id":"14640633-9325-4549-b1af-e3b28a2b058b","embeds":"","z":82,"elementid":"0033","nodeID":"0033","parent":"5b296860-9f72-42d6-b1c8-616f944edea2","attrs":{".satvalue":{"text":""},".name":{"text":"Stop Spadina\nExpressway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":-310,"y":1170},"angle":0,"id":"9412d8be-e160-4298-8609-fe2692c1aede","embeds":"","z":85,"elementid":"0034","nodeID":"0034","parent":"5b296860-9f72-42d6-b1c8-616f944edea2","attrs":{".satvalue":{"text":""},".name":{"text":"Anti-\nAutomobilism\n","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":-210,"y":1200},"angle":0,"id":"349d2961-d25e-4ccb-9500-55199cdd9950","embeds":"","z":86,"elementid":"0035","nodeID":"0035","parent":"5b296860-9f72-42d6-b1c8-616f944edea2","attrs":{".satvalue":{"text":""},".name":{"text":"Maintain \nProperty\nValue","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-360,"y":1450},"angle":0,"id":"41746342-6a5c-49e4-b70b-0421b9b7f925","embeds":"","z":87,"elementid":"0036","nodeID":"0036","parent":"5b296860-9f72-42d6-b1c8-616f944edea2","attrs":{".satvalue":{"text":""},".name":{"text":"Lobby\nProvince","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-440,"y":1370},"angle":0,"id":"7946602d-fb09-49a3-96c3-bb88ec8223a7","embeds":"","z":88,"elementid":"0037","nodeID":"0037","parent":"5b296860-9f72-42d6-b1c8-616f944edea2","attrs":{".satvalue":{"text":""},".name":{"text":"Lobby\nMetro","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-100,"y":2150},"angle":0,"id":"44d3689b-1a48-4b6d-91a6-c93a0f39f20d","embeds":"","z":93,"elementid":"0038","nodeID":"0038","parent":"0d877ac0-8261-45fd-8fd7-3e6806c75342","attrs":{".satvalue":{"text":""},".name":{"text":"Require\nTunnel","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4,"beginLetter":["0","A"],"endLetter":["A","B"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},"text":{"fill":"black"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":30,"y":2100},"angle":0,"id":"69dcc7d0-410d-4c36-8bf2-670f1a751579","embeds":"","z":94,"elementid":"0039","nodeID":"0039","parent":"0d877ac0-8261-45fd-8fd7-3e6806c75342","attrs":{".satvalue":{"text":""},".name":{"text":"Protect\nCedarvale","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"44d3689b-1a48-4b6d-91a6-c93a0f39f20d"},"target":{"id":"69dcc7d0-410d-4c36-8bf2-670f1a751579"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"5422f1d6-6525-4009-895e-839a8a4e0440","embeds":"","z":95,"parent":"0d877ac0-8261-45fd-8fd7-3e6806c75342","link-type":"+","linkID":"0028","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_17"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1390,"y":1180},"angle":0,"id":"679308ff-3f54-4dc9-b9a9-881f67c9120d","embeds":"","z":96,"elementid":"0040","nodeID":"0040","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"text":""},".name":{"text":"Be World\nClass City","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":150,"height":60},"position":{"x":-1270,"y":1240},"angle":0,"id":"522df3cb-a7f8-4209-a4a9-0df743b303f9","embeds":"","z":97,"elementid":"0041","nodeID":"0041","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"text":""},".name":{"text":"Prevent Highway\nConstruction Downtown","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":37.5,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":130,"height":60},"position":{"x":-1480,"y":2070},"angle":0,"id":"9b30c53f-abee-4942-af6f-8589fbe24266","embeds":"","z":117,"elementid":"0042","nodeID":"0042","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"UD"},".name":{"text":"Build\nLakeshore\nExpressway","font-size":13},".constraints":{"lastval":["denied","partiallydenied","partiallysatisfied","satisfied"],"function":["C","C","C","C"],"markedvalue":4,"beginLetter":["0","A","B","C"],"endLetter":["A","B","C","D"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".label":{"cx":32.5,"cy":6.3833753244528},".assigned_time":{"0":"15","1":"21","2":"37"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1310,"y":2070},"angle":0,"id":"96443bde-57f9-411b-a688-e11340d2d63e","embeds":"","z":118,"elementid":"0043","nodeID":"0043","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"C"},".name":{"text":"Build\nCrosstown\nExpressway","font-size":13},".constraints":{"lastval":"denied","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1260,"y":1740},"angle":0,"id":"135244df-eef7-45c0-a672-94c03851de80","embeds":"","z":119,"elementid":"0044","nodeID":"0044","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"UD"},".name":{"text":"Build\nDon Valley\nParkway","font-size":13},".constraints":{"lastval":["denied","partiallydenied","denied","partiallydenied","partiallysatisfied","satisfied"],"function":["C","C","C","C","C","C"],"markedvalue":4,"beginLetter":["0","A","B","C","D","E"],"endLetter":["A","B","C","D","E","F"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".assigned_time":{"0":"3","1":"7","2":"21","3":"28","4":"38"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-670,"y":1990},"angle":0,"id":"44f1e97e-5ab2-438f-a3f5-9631e53a6285","embeds":"","z":135,"elementid":"0045","nodeID":"0045","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Expropriate\nToronto\nLand","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"44f1e97e-5ab2-438f-a3f5-9631e53a6285"},"target":{"id":"1bc1dcd2-830f-4e19-a4e4-c22e037e9fee"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"31958e50-d51f-47f8-90d9-7c195a960a78","embeds":"","z":136,"linkID":"0029","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_60"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-590,"y":2070},"angle":0,"id":"0e4a1250-4ec8-4668-befa-c0ead76f25ec","embeds":"","z":137,"elementid":"0046","nodeID":"0046","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"","text":"(⊥, ⊥)"},".funcvalue":{"text":"NB"},".name":{"text":"Expropriate All\nLand Segments","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"0e4a1250-4ec8-4668-befa-c0ead76f25ec"},"target":{"id":"44f1e97e-5ab2-438f-a3f5-9631e53a6285"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"582c63db-1b99-40d9-b40e-fd6a7c6021c6","embeds":"","z":138,"link-type":"or","linkID":"0030","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_63"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-660,"y":2150},"angle":0,"id":"bb93c20c-cc20-4d35-8b6b-0c291bff4dbb","embeds":"","z":139,"elementid":"0047","nodeID":"0047","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"","text":"(⊥, ⊥)"},".funcvalue":{"text":"NB"},".name":{"text":"Expropriate\nLand as Required","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"bb93c20c-cc20-4d35-8b6b-0c291bff4dbb"},"target":{"id":"44f1e97e-5ab2-438f-a3f5-9631e53a6285"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"4b83d36e-ff98-4291-90cc-001a469ff40a","embeds":"","z":140,"link-type":"or","linkID":"0031","attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_65"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1690,"y":1430},"angle":0,"id":"b677c9a9-df38-4d5e-9816-1a7a3075b73c","embeds":"","z":155,"elementid":"0048","nodeID":"0048","parent":"ae04554b-19f9-4a53-b0c2-67d657e600e1","attrs":{".satvalue":{"text":""},".name":{"text":"Have a Unified\nArterial\nRoad System","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1170,"y":1870},"angle":0,"id":"49f7337c-2618-4576-b86c-bad7e4dce188","embeds":"","z":156,"elementid":"0049","nodeID":"0049","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Have\nSpadina\nExpressway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":120,"height":60},"position":{"x":-1690,"y":2040},"angle":0,"id":"86c5ba80-8d35-4c34-bc03-e9dac2f2bd56","embeds":"","z":163,"elementid":"0050","nodeID":"0050","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Build\nSpadina\nExpressway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":30,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"link","source":{"id":"8c9711c4-6e4c-4ab8-85d2-4e23d9813de9"},"target":{"id":"b677c9a9-df38-4d5e-9816-1a7a3075b73c"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"4540a402-0d77-4410-96ed-dd36ae96be48","embeds":"","z":164,"link-type":"++","vertices":[],"linkID":"0032","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_16"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"1bbce722-6946-43d2-be8c-9eb46b16effe"},"target":{"id":"3c36e8a7-36cb-464c-8386-b19c412514a9"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"9e091360-eb4d-4a7e-abb4-0a7cc1128665","embeds":"","z":166,"link-type":"+","linkID":"0033","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","vertices":[{"x":-980,"y":1780}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_18"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"b2e91675-80c4-4a03-95b9-184124297690"},"target":{"id":"3c36e8a7-36cb-464c-8386-b19c412514a9"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"b0e9a99a-5569-4816-a6bf-ef1c77f011f2","embeds":"","z":167,"link-type":"+","linkID":"0034","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_19"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"5be36a87-a58a-4b85-881a-044c3cc0a799"},"target":{"id":"3c36e8a7-36cb-464c-8386-b19c412514a9"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"fb1a1dc2-3b5f-4ab8-9056-7090b02431e5","embeds":"","z":168,"link-type":"+","linkID":"0035","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","vertices":[{"x":-1030,"y":2120}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_20"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"49f7337c-2618-4576-b86c-bad7e4dce188"},"target":{"id":"3c36e8a7-36cb-464c-8386-b19c412514a9"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"067989f9-ed85-4a89-868f-ee5cb3a25e98","embeds":"","z":169,"link-type":"+","linkID":"0036","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_21"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"9b30c53f-abee-4942-af6f-8589fbe24266"},"target":{"id":"90d7b148-5a38-476e-b5b4-3536418e59e2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"33c485e9-37ea-4aae-92a3-796b3851426a","embeds":"","z":170,"parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","linkID":"0037","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_23"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"96443bde-57f9-411b-a688-e11340d2d63e"},"target":{"id":"5a0432c2-4d46-441f-9e4b-ceed2fbb537e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"60ca137c-5937-4b09-9c18-0fbc034ed122","embeds":"","z":171,"parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","linkID":"0038","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_24"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"86c5ba80-8d35-4c34-bc03-e9dac2f2bd56"},"target":{"id":"90d7b148-5a38-476e-b5b4-3536418e59e2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"8b56e5b2-a5cb-4002-a420-7e3b2100b005","embeds":"","z":172,"parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","vertices":[],"linkID":"0039","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_25"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"135244df-eef7-45c0-a672-94c03851de80"},"target":{"id":"5a0432c2-4d46-441f-9e4b-ceed2fbb537e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"91b42913-545f-48a6-b9ef-84ec589e2b69","embeds":"","z":173,"parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","linkID":"0040","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_26"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"96443bde-57f9-411b-a688-e11340d2d63e"},"target":{"id":"b2e91675-80c4-4a03-95b9-184124297690"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"093cd997-cd23-424e-9b03-b373265e3223","embeds":"","z":175,"link-type":"and","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","linkID":"0041","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_28"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"9b30c53f-abee-4942-af6f-8589fbe24266"},"target":{"id":"5be36a87-a58a-4b85-881a-044c3cc0a799"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"64548d39-924b-4c91-904c-e6215daf0a95","embeds":"","z":176,"link-type":"and","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","linkID":"0042","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_29"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-500,"y":2140},"angle":0,"id":"febd9408-ad34-43c9-a9fd-ec38e1a4ae9c","embeds":"","z":179,"elementid":"0051","nodeID":"0051","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"C"},".name":{"text":"Build Bloor\nTo Lakeshore","font-size":13},".constraints":{"lastval":"denied","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":150,"height":60},"position":{"x":-430,"y":2060},"angle":0,"id":"2dbc5b3f-f164-402e-8d57-feec63c538b1","embeds":"","z":180,"elementid":"0052","nodeID":"0052","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"C"},".name":{"text":"Build Davenport\nTo Bloor","font-size":13},".constraints":{"lastval":"denied","function":"none","markedvalue":4},".label":{"cx":37.5,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":110,"height":60},"position":{"x":-380,"y":1970},"angle":0,"id":"5fc38208-d0c9-454c-a76e-02090de66786","embeds":"","z":181,"elementid":"0053","nodeID":"0053","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"C"},".name":{"text":"Build\nCrosstown\nInterchange\n","font-size":13},".constraints":{"lastval":"denied","function":"none","markedvalue":4},".label":{"cx":27.5,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":130,"height":60},"position":{"x":-220,"y":1730},"angle":0,"id":"11131039-33e4-44e3-bf47-c5bc36b7d872","embeds":"","z":182,"elementid":"0054","nodeID":"0054","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"UD"},".name":{"text":"Build Eglinton \nto Davenport","font-size":13},".constraints":{"lastval":["denied","partiallydenied","denied"],"function":["C","C","C"],"markedvalue":4,"beginLetter":["0","A","B"],"endLetter":["A","B","C"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".label":{"cx":32.5,"cy":6.3833753244528},".assigned_time":{"0":"38","1":"48"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-320,"y":1740},"angle":0,"id":"f0e85889-1510-4da0-9a4e-9513b86a8bf4","embeds":"","z":183,"elementid":"0055","nodeID":"0055","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"UD"},".name":{"text":"Build\nLawrence to\nEglinton","font-size":13},".constraints":{"lastval":["denied","partiallydenied","partiallysatisfied","satisfied"],"function":["C","C","C","C"],"markedvalue":4,"beginLetter":["0","A","B","C"],"endLetter":["A","B","C","D"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".assigned_time":{"0":"32","1":"37","2":"58"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-300,"y":1640},"angle":0,"id":"f8bfb19a-a7da-4020-bfe3-9822b69d0d9b","embeds":"","z":184,"elementid":"0056","nodeID":"0056","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"UD"},".name":{"text":"Build \nWilson-401 to\nLawrence","font-size":13},".constraints":{"lastval":["denied","satisfied","satisfied"],"function":["C","I","C"],"markedvalue":4,"beginLetter":["0","A","B"],"endLetter":["A","B","C"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".assigned_time":{"0":"33","1":"38"},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-510,"y":1930},"angle":0,"id":"7677cb2a-8f78-4f52-aeb8-ca15364ff7eb","embeds":"","z":186,"elementid":"0057","nodeID":"0057","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Connected\nExpressway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"febd9408-ad34-43c9-a9fd-ec38e1a4ae9c"},"target":{"id":"7677cb2a-8f78-4f52-aeb8-ca15364ff7eb"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"274b2761-a195-4bc8-9b2c-b7f295b34635","embeds":"","z":187,"linkID":"0043","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_41"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"2dbc5b3f-f164-402e-8d57-feec63c538b1"},"target":{"id":"7677cb2a-8f78-4f52-aeb8-ca15364ff7eb"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"79bafa35-5226-48f3-b7e3-eef557cc00e3","embeds":"","z":188,"linkID":"0044","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_42"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"5fc38208-d0c9-454c-a76e-02090de66786"},"target":{"id":"7677cb2a-8f78-4f52-aeb8-ca15364ff7eb"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"12463b70-ea39-4a06-be80-15f9a1a9e549","embeds":"","z":189,"linkID":"0045","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_43"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"f0e85889-1510-4da0-9a4e-9513b86a8bf4"},"target":{"id":"7677cb2a-8f78-4f52-aeb8-ca15364ff7eb"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"0cf23425-7c8c-4ce5-a2ff-db2d002a96fd","embeds":"","z":191,"linkID":"0046","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_45"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"f8bfb19a-a7da-4020-bfe3-9822b69d0d9b"},"target":{"id":"7677cb2a-8f78-4f52-aeb8-ca15364ff7eb"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"7f5cc9ff-98a9-4860-af7c-a00bf296c01e","embeds":"","z":192,"linkID":"0047","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","vertices":[{"x":-330,"y":1750}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_46"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-640,"y":1680},"angle":0,"id":"ceaf9047-b006-434c-8d64-2c36736e0e7d","embeds":"","z":195,"elementid":"0058","nodeID":"0058","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding\nFrom Metro","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-470,"y":1580},"angle":0,"id":"6d3ce5b6-30d6-427d-9a96-2857872b5822","embeds":"","z":197,"elementid":"0059","nodeID":"0059","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Province\nApproves\nFunding","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-680,"y":1570},"angle":0,"id":"0c46a019-ca27-4ed3-8017-6acfe1aba142","embeds":"","z":199,"elementid":"0060","nodeID":"0060","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Metro\nApproves\nFunding","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"0c46a019-ca27-4ed3-8017-6acfe1aba142"},"target":{"id":"ceaf9047-b006-434c-8d64-2c36736e0e7d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"47693f8a-8397-496c-a2b4-70872aaeb0d5","embeds":"","z":200,"link-type":"and","linkID":"0048","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_55"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-620,"y":1800},"angle":0,"id":"18306b31-6d32-4f5b-aff8-29214864e167","embeds":"","z":203,"elementid":"0061","nodeID":"0061","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding\nMetro-Province","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"18306b31-6d32-4f5b-aff8-29214864e167"},"target":{"id":"b96c6ca4-8c8b-4629-98c5-f59ce8ce24cb"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"96f0158e-12e8-4838-873d-9a61f3a1aa2e","embeds":"","z":204,"link-type":"or","linkID":"0049","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_59"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"ceaf9047-b006-434c-8d64-2c36736e0e7d"},"target":{"id":"18306b31-6d32-4f5b-aff8-29214864e167"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"ffb22bcc-b2c0-4504-a254-05ce5db03615","embeds":"","z":206,"linkID":"0050","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_61"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"1bc1dcd2-830f-4e19-a4e4-c22e037e9fee"},"target":{"id":"49f7337c-2618-4576-b86c-bad7e4dce188"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"ea9eea20-6994-4743-88ea-20d9cfbabb87","embeds":"","z":208,"link-type":"++","vertices":[],"linkID":"0051","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_64"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"1bbce722-6946-43d2-be8c-9eb46b16effe"},"target":{"id":"986171b1-648b-4a92-adda-0a37df92e07e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"55799723-c609-4142-ac07-686f4744b9ec","embeds":"","z":213,"link-type":"++S","linkID":"0052","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_74"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"49f7337c-2618-4576-b86c-bad7e4dce188"},"target":{"id":"986171b1-648b-4a92-adda-0a37df92e07e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"fb238cdb-5034-40a3-b109-6a6e7da0fe51","embeds":"","z":214,"link-type":"++S","vertices":[{"x":-1000,"y":1810}],"linkID":"0053","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_75"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"2b52a72e-5f80-43b6-bcf4-e5453687e51f"},"target":{"id":"86c5ba80-8d35-4c34-bc03-e9dac2f2bd56"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"d042216e-db83-4af4-82fe-1e1167591e64","embeds":"","z":215,"vertices":[{"x":-480,"y":2090},{"x":-540,"y":2230},{"x":-1510,"y":2220}],"linkID":"0054","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_76"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":120,"height":60},"position":{"x":-1520,"y":1400},"angle":0,"id":"3ba7b994-115f-4718-b42f-d2261ee158ee","embeds":"","z":216,"elementid":"0062","nodeID":"0062","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"text":"(⊥, ⊥)"},".funcvalue":{"text":"UD"},".name":{"text":"Approve Planning\nBoard Funding T","font-size":13},".constraints":{"lastval":["none","satisfied"],"function":["C","C"],"markedvalue":4,"beginLetter":["0","A"],"endLetter":["A","B"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".assigned_time":{"0":"1"},"text":{"fill":"black"},".label":{"cx":30,"cy":6.3833753244528}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1840,"y":1430},"angle":0,"id":"0ec02ad6-740b-4758-82ed-08d9fdad410d","embeds":"","z":217,"elementid":"0063","nodeID":"0063","parent":"ae04554b-19f9-4a53-b0c2-67d657e600e1","attrs":{".satvalue":{"text":""},".name":{"text":"Have Project\nFunding","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"3ba7b994-115f-4718-b42f-d2261ee158ee"},"target":{"id":"0ec02ad6-740b-4758-82ed-08d9fdad410d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"c0c67aa4-cabd-49e8-89ba-d98fcbe07949","embeds":"","z":218,"link-type":"++","linkID":"0055","vertices":[{"x":-1570,"y":1550}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_79"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"3ba7b994-115f-4718-b42f-d2261ee158ee"},"target":{"id":"17f3f1bb-23d4-4793-a7c3-5af51ad059b5"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"0a531ab7-0691-4b71-ab5d-48202730da4a","embeds":"","z":219,"vertices":[{"x":-1470,"y":1560},{"x":-1570,"y":1650}],"link-type":"++","linkID":"0056","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_80"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1190,"y":1340},"angle":0,"id":"7e077e6f-b1e5-4b6b-8114-1d92a24a0708","embeds":"","z":220,"elementid":"0064","nodeID":"0064","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"value":"satisfied","text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Oppose\nCrosstown","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"7e077e6f-b1e5-4b6b-8114-1d92a24a0708"},"target":{"id":"522df3cb-a7f8-4209-a4a9-0df743b303f9"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"f3a0f808-c3e6-41d8-bfe3-b711b1c2a6e9","embeds":"","z":221,"linkID":"0057","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_82"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1200,"y":1440},"angle":0,"id":"c64904d0-c624-4590-8e97-0ed3ed5a81b5","embeds":"","z":222,"elementid":"0065","nodeID":"0065","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"value":"satisfied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Elect\nReformer\nCouncil","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-250,"y":1950},"angle":0,"id":"9b85e7c7-843d-42b4-9cf7-086b67cc830b","embeds":"","z":224,"elementid":"0066","nodeID":"0066","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Tunnel though \nCedarvale","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"37"},"text":{"fill":"black"}}},{"type":"link","source":{"id":"44d3689b-1a48-4b6d-91a6-c93a0f39f20d"},"target":{"id":"92d24c51-8a5c-43d3-b622-286e4fad1140"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"e210946f-c935-4dd6-9f38-218b55932bc2","embeds":"","z":225,"parent":"0d877ac0-8261-45fd-8fd7-3e6806c75342","vertices":[],"link-type":"++S","linkID":"0059","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_86"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"9b85e7c7-843d-42b4-9cf7-086b67cc830b"},"target":{"id":"44d3689b-1a48-4b6d-91a6-c93a0f39f20d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"d89c5e11-f409-4ed2-9c35-a72af1508760","embeds":"","z":227,"link-type":"++S","linkID":"0060","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_88"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":50,"y":1310},"angle":0,"id":"3cc80045-3646-4df9-ba18-0717116adc25","embeds":"","z":228,"elementid":"0067","nodeID":"0067","parent":"85f98d0e-ba54-4253-9283-0a14b78ebf92","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Approve\nMetro\nLoan","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"30"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":120,"height":60},"position":{"x":-860,"y":1200},"angle":0,"id":"5e4b4c65-9a56-48a7-9fff-3fac4f78f30e","embeds":"","elementid":"0068","z":232,"nodeID":"0068","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"value":"satisfied","text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Expand Suburbs\nVacant Land Use","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".label":{"cx":30,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":150,"height":60},"position":{"x":-880,"y":1290},"angle":0,"id":"7ef4dd33-5c63-411e-831a-e2f007573249","embeds":"","elementid":"0069","z":245,"nodeID":"0069","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"text":""},".name":{"text":"Have a Unified Arterial\nRoad System","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":37.5,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-730,"y":1130},"angle":0,"id":"2e442c45-94ad-440d-9713-e02330304daf","embeds":"","z":246,"elementid":"0070","nodeID":"0070","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"text":""},".name":{"text":"Economic\nGrowth","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"5e4b4c65-9a56-48a7-9fff-3fac4f78f30e"},"target":{"id":"2e442c45-94ad-440d-9713-e02330304daf"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"c738df70-be3d-4704-9b74-4a4f59b44bcc","embeds":"","z":248,"parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","link-type":"+","linkID":"0061","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_110"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-660,"y":1310},"angle":0,"id":"879d4087-ef72-47a4-bc2d-4863263744c4","embeds":"","z":250,"elementid":"0071","nodeID":"0071","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"text":""},".name":{"text":"Support\nInfrastructure\nProjects","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-830,"y":1430},"angle":0,"id":"6ff83494-5905-4dff-9866-b3ec0b778c43","embeds":"","z":251,"elementid":"0072","nodeID":"0072","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Approve\nProject\nFunding","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"28"},"text":{"fill":"black"}}},{"type":"link","source":{"id":"a8b6cbe7-2edd-4d46-b47f-ef00adcffb37"},"target":{"id":"879d4087-ef72-47a4-bc2d-4863263744c4"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"caeeff5c-8033-4a7f-a30f-86a67a032c0a","embeds":"","z":252,"parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","linkID":"0062","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_114"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"8c9711c4-6e4c-4ab8-85d2-4e23d9813de9"},"target":{"id":"7ef4dd33-5c63-411e-831a-e2f007573249"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"b1521384-5d1d-4160-b378-5aacbcdc8863","embeds":"","z":253,"link-type":"++","vertices":[{"x":-1070,"y":1580}],"linkID":"0063","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_115"},".assigned_time":{"0":""}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":-170,"y":1360},"angle":0,"id":"4364f88c-f5ab-4b1c-ab65-8bddae47558d","embeds":"","z":254,"elementid":"0073","nodeID":"0073","parent":"5b296860-9f72-42d6-b1c8-616f944edea2","attrs":{".satvalue":{"text":""},".name":{"text":"Protect\nCedarvale","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"14640633-9325-4549-b1af-e3b28a2b058b"},"target":{"id":"4364f88c-f5ab-4b1c-ab65-8bddae47558d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"1c3b1bd8-a6f1-4afa-ba51-56c0050c250e","embeds":"","z":255,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"+","linkID":"0064","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_117"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"14640633-9325-4549-b1af-e3b28a2b058b"},"target":{"id":"9412d8be-e160-4298-8609-fe2692c1aede"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"dbe666fd-9f42-48e3-9ab5-6eae97c8783f","embeds":"","z":257,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"+","linkID":"0065","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_119"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"14640633-9325-4549-b1af-e3b28a2b058b"},"target":{"id":"349d2961-d25e-4ccb-9500-55199cdd9950"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"60dbb961-9153-4453-a177-e62f60b00e45","embeds":"","z":258,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"+","linkID":"0066","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_120"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"7946602d-fb09-49a3-96c3-bb88ec8223a7"},"target":{"id":"14640633-9325-4549-b1af-e3b28a2b058b"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"c8cab262-08ee-48bf-80f1-1eb8da2fbc0e","embeds":"","z":259,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"or","linkID":"0067","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_121"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"41746342-6a5c-49e4-b70b-0421b9b7f925"},"target":{"id":"14640633-9325-4549-b1af-e3b28a2b058b"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"21aaae7e-90b9-4b32-b2fa-1f28bc96000f","embeds":"","z":260,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"or","linkID":"0068","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_122"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"6ff83494-5905-4dff-9866-b3ec0b778c43"},"target":{"id":"0c46a019-ca27-4ed3-8017-6acfe1aba142"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"b59800a5-0e93-473b-964d-affafdc2da39","embeds":"","z":263,"vertices":[],"link-type":"++","linkID":"0069","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_125"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1710,"y":1670},"angle":0,"id":"17f3f1bb-23d4-4793-a7c3-5af51ad059b5","embeds":"","z":264,"elementid":"0074","nodeID":"0074","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Get Startup\nfrom Toronto","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1790,"y":1800},"angle":0,"id":"7501e6fc-d604-46e4-9a40-f40187f7578d","embeds":"","z":265,"elementid":"0075","nodeID":"0075","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Get Startup\nFunding","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1660,"y":1920},"angle":0,"id":"feba3526-bed2-4c2b-ad49-54731ac5f7f2","embeds":"","z":266,"elementid":"0076","nodeID":"0076","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"C"},".name":{"text":"Get Road\nFunding","font-size":13},".constraints":{"lastval":"denied","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"feba3526-bed2-4c2b-ad49-54731ac5f7f2"},"target":{"id":"fada155b-6166-4651-88f9-d36748f43942"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"762bfb17-db03-4c0c-b2bc-ca52183a217b","embeds":"","z":267,"linkID":"0070","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_3"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"7501e6fc-d604-46e4-9a40-f40187f7578d"},"target":{"id":"fada155b-6166-4651-88f9-d36748f43942"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"db2ff8db-9b77-497c-9def-c53d62edbd0c","embeds":"","z":268,"linkID":"0071","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_4"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1800,"y":1910},"angle":0,"id":"21588abc-21f3-46f5-9d8f-1918589d7f38","embeds":"","z":269,"elementid":"0077","nodeID":"0077","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Get Startup\nfrom York","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"21588abc-21f3-46f5-9d8f-1918589d7f38"},"target":{"id":"7501e6fc-d604-46e4-9a40-f40187f7578d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"9ad5ad1f-77a1-4df2-ab7d-9642e5bb1022","embeds":"","z":270,"linkID":"0072","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_6"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"17f3f1bb-23d4-4793-a7c3-5af51ad059b5"},"target":{"id":"7501e6fc-d604-46e4-9a40-f40187f7578d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"c176e3e5-bc04-4e7f-845c-b7dffe2eb988","embeds":"","z":271,"parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","linkID":"0073","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_8"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":110,"height":60},"position":{"x":-1700,"y":1220},"angle":0,"id":"0eeecde1-af29-4ab7-b5a1-0cbd52e186f5","embeds":"","z":274,"elementid":"0078","nodeID":"0078","parent":"6943d272-896b-450a-a07b-afe55c3e3900","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"C"},".name":{"text":"Approve Planning\nBoard Funding Y","font-size":13},".constraints":{"lastval":["none","denied"],"function":["C","C"],"markedvalue":4,"beginLetter":["0","A"],"endLetter":["A","B"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".assigned_time":{"0":"1"},"text":{"fill":"black"},".label":{"cx":27.5,"cy":6.3833753244528}}},{"type":"link","source":{"id":"0eeecde1-af29-4ab7-b5a1-0cbd52e186f5"},"target":{"id":"21588abc-21f3-46f5-9d8f-1918589d7f38"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"d5d19909-750e-4748-ae68-9da7ff658013","embeds":"","z":275,"link-type":"++","vertices":[{"x":-1870,"y":1320},{"x":-1890,"y":1840}],"linkID":"0074","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_12"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":140,"height":60},"position":{"x":-1160,"y":1770},"angle":0,"id":"45defa07-1e5f-4e47-977e-fb697f48a865","embeds":"","z":277,"elementid":"0079","nodeID":"0079","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"value":"satisfied","text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Get Don Valley\nParkway Design\nApproved","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".label":{"cx":35,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"link","source":{"id":"45defa07-1e5f-4e47-977e-fb697f48a865"},"target":{"id":"1bbce722-6946-43d2-be8c-9eb46b16effe"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"689c98b2-3c48-4ac4-a3e8-1430b65cffce","embeds":"","z":278,"linkID":"0075","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_15"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":140,"height":60},"position":{"x":-1200,"y":2060},"angle":0,"id":"c33bcd31-726f-46ff-a5c0-91e96b6f409a","embeds":"","z":280,"elementid":"0080","nodeID":"0080","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":"(⊥, ⊥)"},".funcvalue":{"text":"UD"},".name":{"text":"Get Crosstown\nDesign Approved","font-size":13},".constraints":{"lastval":["none","partiallysatisfied","denied","none","denied","partiallysatisfied","denied"],"function":["C","C","C","C","C","C","C"],"markedvalue":4,"beginLetter":["0","A","B","C","D","E","F"],"endLetter":["A","B","C","D","E","F","G"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".label":{"cx":35,"cy":6.3833753244528},".assigned_time":{"0":"3","1":"15","2":"23","3":"27","4":"34","5":"48"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":140,"height":60},"position":{"x":-1530,"y":2150},"angle":0,"id":"59a35f6a-cc1d-4475-a4d4-710ce9ae2993","embeds":"","z":281,"elementid":"0081","nodeID":"0081","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"UD"},".name":{"text":"Get Lakeshore\nDesign Approved","font-size":13},".constraints":{"lastval":["denied","none","denied","none","partiallysatisfied","satisfied"],"function":["C","C","C","C","C","C"],"markedvalue":4,"beginLetter":["0","A","B","C","D","E"],"endLetter":["A","B","C","D","E","F"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".label":{"cx":35,"cy":6.3833753244528},".assigned_time":{"0":"5","1":"9","2":"12","3":"14","4":"16"},"text":{"fill":"black"}}},{"type":"link","source":{"id":"135244df-eef7-45c0-a672-94c03851de80"},"target":{"id":"1bbce722-6946-43d2-be8c-9eb46b16effe"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"3d430eaf-9e73-4f30-89e0-42c6ce3589f1","embeds":"","z":282,"linkID":"0076","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_19"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"c33bcd31-726f-46ff-a5c0-91e96b6f409a"},"target":{"id":"b2e91675-80c4-4a03-95b9-184124297690"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"f040246f-07aa-4ab3-a1ad-ed4e2585e92e","embeds":"","z":283,"linkID":"0077","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_20"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"59a35f6a-cc1d-4475-a4d4-710ce9ae2993"},"target":{"id":"5be36a87-a58a-4b85-881a-044c3cc0a799"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"c41c45d8-e2e1-47ed-bc0e-5726c9401bcd","embeds":"","z":284,"linkID":"0078","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_21"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-240,"y":1420},"angle":0,"id":"c59adb51-153a-4bbd-a4f5-024761cbd75c","embeds":"","z":287,"elementid":"0082","nodeID":"0082","parent":"5b296860-9f72-42d6-b1c8-616f944edea2","attrs":{".satvalue":{"text":""},".name":{"text":"Litigate\nSpadina","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":-180,"y":1270},"angle":0,"id":"564bf0e7-0478-4646-87de-6bb363083707","embeds":"","z":288,"elementid":"0083","nodeID":"0083","parent":"5b296860-9f72-42d6-b1c8-616f944edea2","attrs":{".satvalue":{"text":""},".name":{"text":"Save Older\nNeighbourhoods","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"4364f88c-f5ab-4b1c-ab65-8bddae47558d"},"target":{"id":"564bf0e7-0478-4646-87de-6bb363083707"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"cf9132ff-b223-460a-98a5-013b3354cf0c","embeds":"","z":291,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"+","linkID":"0079","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_28"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"c59adb51-153a-4bbd-a4f5-024761cbd75c"},"target":{"id":"14640633-9325-4549-b1af-e3b28a2b058b"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"8337be20-4be9-45bb-bf20-974e8ca08f47","embeds":"","z":293,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"or","linkID":"0080","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_30"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-440,"y":1250},"angle":0,"id":"83deb3b0-d197-45ea-8c99-9101fd0e64e8","embeds":"","z":294,"elementid":"0084","nodeID":"0084","parent":"5b296860-9f72-42d6-b1c8-616f944edea2","attrs":{".satvalue":{"text":""},".name":{"text":"Stop Crosstown\nExpressway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"14640633-9325-4549-b1af-e3b28a2b058b"},"target":{"id":"83deb3b0-d197-45ea-8c99-9101fd0e64e8"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"a3476b52-f382-48ad-a290-ee2f6a0a17b6","embeds":"","z":295,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"++S","linkID":"0081","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_32"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"83deb3b0-d197-45ea-8c99-9101fd0e64e8"},"target":{"id":"9412d8be-e160-4298-8609-fe2692c1aede"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"9eea5d4a-636f-4816-860f-ca507d24a507","embeds":"","z":296,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"+","linkID":"0082","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_33"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"83deb3b0-d197-45ea-8c99-9101fd0e64e8"},"target":{"id":"349d2961-d25e-4ccb-9500-55199cdd9950"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"bd2e1954-344e-426a-868d-47bf907ba05a","embeds":"","z":297,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"+","linkID":"0083","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_34"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"14640633-9325-4549-b1af-e3b28a2b058b"},"target":{"id":"564bf0e7-0478-4646-87de-6bb363083707"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"0e008f24-401b-4d3f-9384-939cb86a44ab","embeds":"","z":298,"parent":"5b296860-9f72-42d6-b1c8-616f944edea2","link-type":"++","linkID":"0084","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_35"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":110,"height":60},"position":{"x":-700,"y":1480},"angle":0,"id":"49bcd71b-0baa-45cc-a355-3eb4da1907f5","embeds":"","z":299,"elementid":"0085","nodeID":"0085","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"text":""},".name":{"text":"Honour\nInterchange\nAgreement\n","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"},".label":{"cx":27.5,"cy":6.3833753244528}}},{"type":"link","source":{"id":"133ef20d-5e2f-49c2-91ec-24b8be87cc2a"},"target":{"id":"564bf0e7-0478-4646-87de-6bb363083707"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"dec0f5d5-48dc-4a15-acd2-11f5798665db","embeds":"","z":301,"vertices":[{"x":-820,"y":1120},{"x":-70,"y":1120}],"link-type":"+","linkID":"0086","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_38"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-560,"y":1250},"angle":0,"id":"e08d1541-2e49-4f20-8b1b-494f4a081e73","embeds":"","z":302,"elementid":"0086","nodeID":"0086","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"C"},".name":{"text":"Listen to\nOpposition","font-size":13},".constraints":{"lastval":"denied","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"e08d1541-2e49-4f20-8b1b-494f4a081e73"},"target":{"id":"7946602d-fb09-49a3-96c3-bb88ec8223a7"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"eaee52e7-b9c8-4420-936a-b799230f2972","embeds":"","z":303,"link-type":"++","vertices":[],"linkID":"0087","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_41"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-30,"y":1260},"angle":0,"id":"167cef33-4a05-4650-ac6f-26e8f6f78c0a","embeds":"","z":305,"elementid":"0087","nodeID":"0087","parent":"85f98d0e-ba54-4253-9283-0a14b78ebf92","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"C"},".name":{"text":"Support\nLitigation","font-size":13},".constraints":{"lastval":"denied","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"bd7f7179-8e6b-419b-993e-1a12f44d3ca8"},"target":{"id":"41746342-6a5c-49e4-b70b-0421b9b7f925"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"7be0b010-e6a8-46f9-8d0d-4bc4606c1c7b","embeds":"","z":306,"vertices":[],"link-type":"++","linkID":"0088","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_44"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"167cef33-4a05-4650-ac6f-26e8f6f78c0a"},"target":{"id":"c59adb51-153a-4bbd-a4f5-024761cbd75c"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"a16995bd-f90f-47f0-8ec6-f10f093e39e5","embeds":"","z":307,"vertices":[{"x":-70,"y":1420}],"link-type":"++","linkID":"0089","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_45"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1270,"y":1140},"angle":0,"id":"6a4b08ba-40dd-4d11-994b-bcc1c6f5eafb","embeds":"","z":308,"elementid":"0088","nodeID":"0088","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Build First\nSubway","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"13"},"text":{"fill":"black"}}},{"type":"basic.Resource","size":{"width":100,"height":60},"position":{"x":100,"y":1490},"angle":0,"id":"219d17d9-1970-4e23-a733-35bd2ec28809","embeds":"","z":310,"elementid":"0089","nodeID":"0089","parent":"175624ec-ffba-4f89-a94f-5a8104623f60","attrs":{".satvalue":{"text":"(⊥, ⊥)"},".name":{"text":"Support\nTransit\nProjects","font-size":13},".funcvalue":{"text":"UD"},".constraints":{"lastval":["none","denied","satisfied"],"function":["C","C","C"],"markedvalue":4,"beginLetter":["0","A","B"],"endLetter":["A","B","C"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".assigned_time":{"0":"27","1":"31"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-420,"y":1660},"angle":0,"id":"165f17c7-38ab-42a2-86af-58c171b98c37","embeds":"","z":311,"elementid":"0090","nodeID":"0090","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Build Spadina\nTransit\nLine","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"61"},"text":{"fill":"black"}}},{"type":"basic.Resource","size":{"width":90,"height":60},"position":{"x":200,"y":1810},"angle":0,"id":"2e79b82e-9dc1-4756-a77f-34f5bec0bfd9","embeds":"","z":313,"elementid":"0091","nodeID":"0091","parent":"707ab4cb-0f53-40e7-903b-98334bbf221c","attrs":{".satvalue":{"text":""},".name":{"text":"Parking\nSpaces","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":22.5,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":40,"y":2020},"angle":0,"id":"6119cca5-5d59-40c3-bb93-e4dd3de3f7b4","embeds":"","z":319,"elementid":"0092","nodeID":"0092","parent":"0d877ac0-8261-45fd-8fd7-3e6806c75342","attrs":{".satvalue":{"value":"satisfied","text":"(F, ⊥)"},".name":{"text":"Maintain\nProperty\nValues","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"11131039-33e4-44e3-bf47-c5bc36b7d872"},"target":{"id":"6119cca5-5d59-40c3-bb93-e4dd3de3f7b4"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--S"}}}],"id":"4aa4d8f2-9b96-4261-b67a-19ca212547e1","embeds":"","z":320,"vertices":[{"x":-80,"y":1810},{"x":-70,"y":1870}],"link-type":"--S","linkID":"0091","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_60"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"f0e85889-1510-4da0-9a4e-9513b86a8bf4"},"target":{"id":"6119cca5-5d59-40c3-bb93-e4dd3de3f7b4"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--S"}}}],"id":"01ea7c93-6cc4-4017-acaf-d1b734815e14","embeds":"","z":321,"vertices":[{"x":-210,"y":1810},{"x":-110,"y":1810},{"x":-70,"y":1900}],"link-type":"--S","linkID":"0092","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_61"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-610,"y":1170},"angle":0,"id":"68f7e988-1846-439d-bf58-a71720c04829","embeds":"","z":324,"elementid":"0093","nodeID":"0093","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Consult with\nCitizens","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"45"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-10,"y":1660},"angle":0,"id":"07d5b32d-936e-4a1a-91c4-8e9594b9e115","embeds":"","z":325,"elementid":"0094","nodeID":"0094","parent":"175624ec-ffba-4f89-a94f-5a8104623f60","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Block Spadina","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"48"},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":120,"height":60},"position":{"x":-530,"y":1780},"angle":0,"id":"6f6311db-15d0-4f23-9ec7-c1993550cf44","embeds":"","z":326,"elementid":"0095","nodeID":"0095","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Terminal\nExpressway","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":30,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"link","source":{"id":"2dbc5b3f-f164-402e-8d57-feec63c538b1"},"target":{"id":"6f6311db-15d0-4f23-9ec7-c1993550cf44"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"935320cd-b59e-46b7-8750-8ac9950ab60b","embeds":"","z":327,"linkID":"0093","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","vertices":[{"x":-390,"y":1960}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_69"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"165f17c7-38ab-42a2-86af-58c171b98c37"},"target":{"id":"6f6311db-15d0-4f23-9ec7-c1993550cf44"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"0d3ac55f-fd41-4cb3-a2f9-1e3b090e6d7e","embeds":"","z":328,"linkID":"0094","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_70"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1530,"y":1960},"angle":0,"id":"90d7b148-5a38-476e-b5b4-3536418e59e2","embeds":"","z":329,"elementid":"0096","nodeID":"0096","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Build Network\nWithout Crosstown","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1400,"y":1970},"angle":0,"id":"5a0432c2-4d46-441f-9e4b-ceed2fbb537e","embeds":"","z":330,"elementid":"0097","nodeID":"0097","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","attrs":{".satvalue":{"text":""},".name":{"text":"Build Network\nWith Crosstown","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"5a0432c2-4d46-441f-9e4b-ceed2fbb537e"},"target":{"id":"265f9842-f525-4748-9ace-df7841a7fbff"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"b0748fd2-8d08-4e08-ba66-552dcfb4434a","embeds":"","z":331,"parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","link-type":"++S","linkID":"0095","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_74"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"90d7b148-5a38-476e-b5b4-3536418e59e2"},"target":{"id":"265f9842-f525-4748-9ace-df7841a7fbff"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"2fdf3aeb-3b3a-463e-a353-3a826c67e61a","embeds":"","z":332,"parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","link-type":"++S","linkID":"0096","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_75"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"135244df-eef7-45c0-a672-94c03851de80"},"target":{"id":"90d7b148-5a38-476e-b5b4-3536418e59e2"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"d6b610ac-3001-4ca8-9b80-db9b56342085","embeds":"","z":333,"parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","vertices":[{"x":-1190,"y":1890}],"linkID":"0097","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_76"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"9b30c53f-abee-4942-af6f-8589fbe24266"},"target":{"id":"5a0432c2-4d46-441f-9e4b-ceed2fbb537e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"e49b9ecb-a5c1-4403-b562-7a0482b0273c","embeds":"","z":334,"linkID":"0098","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_77"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"86c5ba80-8d35-4c34-bc03-e9dac2f2bd56"},"target":{"id":"5a0432c2-4d46-441f-9e4b-ceed2fbb537e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"c5d15c9f-bb6c-4e0e-b86b-3870d671bdcc","embeds":"","z":335,"linkID":"0099","parent":"054a647a-8da8-4a4f-a70f-f08ff0835f02","vertices":[{"x":-1440,"y":2060}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_78"},".assigned_time":{"0":""}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":-90,"y":2050},"angle":0,"id":"7e1d9bec-7b02-45d2-b2ee-5edede72fde6","embeds":"","z":336,"elementid":"0098","nodeID":"0098","parent":"0d877ac0-8261-45fd-8fd7-3e6806c75342","attrs":{".satvalue":{"text":""},".name":{"text":"Protect Forest\nHill Village","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"44d3689b-1a48-4b6d-91a6-c93a0f39f20d"},"target":{"id":"7e1d9bec-7b02-45d2-b2ee-5edede72fde6"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"66738920-25d2-4f6b-ba21-c969a2c8e74f","embeds":"","z":337,"parent":"0d877ac0-8261-45fd-8fd7-3e6806c75342","link-type":"+","linkID":"0100","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_82"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"165f17c7-38ab-42a2-86af-58c171b98c37"},"target":{"id":"7677cb2a-8f78-4f52-aeb8-ca15364ff7eb"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"bc735870-8a17-4f91-970f-c0330e71891c","embeds":"","z":340,"parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","linkID":"0101","vertices":[{"x":-400,"y":1860}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_85"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"396340ac-3443-47e9-95e4-2a0c6b3abffd"},"target":{"id":"6f6311db-15d0-4f23-9ec7-c1993550cf44"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"1d255909-6bb0-4fd4-9d03-2daef483532e","embeds":"","z":345,"linkID":"0102","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","vertices":[{"x":-370,"y":1830}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_90"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"f0e85889-1510-4da0-9a4e-9513b86a8bf4"},"target":{"id":"6f6311db-15d0-4f23-9ec7-c1993550cf44"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"aa67ac5f-b32a-452f-a420-b913c6a64be8","embeds":"","z":346,"parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","linkID":"0103","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_91"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"f8bfb19a-a7da-4020-bfe3-9822b69d0d9b"},"target":{"id":"6f6311db-15d0-4f23-9ec7-c1993550cf44"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"7b6d1328-7002-4526-b837-56033f4e7357","embeds":"","z":347,"linkID":"0104","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_92"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"396340ac-3443-47e9-95e4-2a0c6b3abffd"},"target":{"id":"7677cb2a-8f78-4f52-aeb8-ca15364ff7eb"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"91425622-ef5c-487d-be9f-da3209adaf0c","embeds":"","z":350,"vertices":[],"parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","linkID":"0105","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_95"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":80,"y":1210},"angle":0,"id":"e00a530a-213d-4f4e-a9d7-6cd6751be53e","embeds":"","z":352,"elementid":"0099","nodeID":"0099","parent":"85f98d0e-ba54-4253-9283-0a14b78ebf92","attrs":{".satvalue":{"text":""},".name":{"text":"Hold Hearings","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":-1090,"y":1240},"angle":0,"id":"133ef20d-5e2f-49c2-91ec-24b8be87cc2a","embeds":"","z":353,"elementid":"0100","nodeID":"0100","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"text":""},".name":{"text":"Protect\nNeighbourhoods","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-1020,"y":1330},"angle":0,"id":"bc94c40b-cf02-414e-81c2-cc1464f2a8a9","embeds":"","z":354,"elementid":"0101","nodeID":"0101","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Create Central\nArea Plan","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"57"},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-700,"y":1400},"angle":0,"id":"a8b6cbe7-2edd-4d46-b47f-ef00adcffb37","embeds":"","z":356,"elementid":"0102","nodeID":"0102","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"text":""},".name":{"text":"Support\nRoads","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":130,"height":60},"position":{"x":-720,"y":1240},"angle":0,"id":"3401d0ea-e54b-4f6f-90bd-ecb184e8f706","embeds":"","z":357,"elementid":"0103","nodeID":"0103","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"text":""},".name":{"text":"Adopt Centres Policy","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},".label":{"cx":32.5,"cy":6.3833753244528},"text":{"fill":"black"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":90,"y":1640},"angle":0,"id":"ef0bb0a0-9d97-4aa9-b284-6333dc182c29","embeds":"","z":358,"elementid":"0104","nodeID":"0104","parent":"175624ec-ffba-4f89-a94f-5a8104623f60","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".name":{"text":"Have 401\nInterchange","font-size":13},".funcvalue":{"text":"DS"},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"23"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-820,"y":1360},"angle":0,"id":"083727bb-f412-4e37-9e7f-1fbb5cc236f6","embeds":"","z":359,"elementid":"0105","nodeID":"0105","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"UD"},".name":{"text":"Official Plan for the\nUrban Structure 1980","font-size":13},".constraints":{"lastval":["none","denied","satisfied"],"function":["C","C","C"],"markedvalue":4,"beginLetter":["0","A","B"],"endLetter":["A","B","C"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".assigned_time":{"0":"49","1":"67"},"text":{"fill":"black"}}},{"type":"link","source":{"id":"083727bb-f412-4e37-9e7f-1fbb5cc236f6"},"target":{"id":"3401d0ea-e54b-4f6f-90bd-ecb184e8f706"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"ba246484-c2dc-472d-9de5-5564ff7a4143","embeds":"","z":360,"linkID":"0106","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_105"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-880,"y":2030},"angle":0,"id":"e54a9806-4695-416b-a829-483a7b1364e8","embeds":"","z":361,"elementid":"0106","nodeID":"0106","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Approve\nConstruction to \nLawrence 1962-1","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"28"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-540,"y":1670},"angle":0,"id":"f0a3dace-354b-4f7c-99f4-839ce5e915f0","embeds":"","z":362,"elementid":"0107","nodeID":"0107","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding\nFrom Province","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"f0a3dace-354b-4f7c-99f4-839ce5e915f0"},"target":{"id":"18306b31-6d32-4f5b-aff8-29214864e167"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"b71dc2ae-8a60-454e-814d-ecc0e81833d5","embeds":"","z":363,"linkID":"0107","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_1"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"6d3ce5b6-30d6-427d-9a96-2857872b5822"},"target":{"id":"f0a3dace-354b-4f7c-99f4-839ce5e915f0"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"c88412f2-d190-4385-85bd-d448b82bb93f","embeds":"","z":364,"link-type":"++","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","vertices":[],"linkID":"0108","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_2"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":110,"height":60},"position":{"x":-1780,"y":1530},"angle":0,"id":"692374ec-ad5c-4005-a7ea-882760da0f49","embeds":"","z":365,"elementid":"0108","nodeID":"0108","parent":"ae04554b-19f9-4a53-b0c2-67d657e600e1","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Lobby for\nRegional\nPlanning\n","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"12"},"text":{"fill":"black"},".label":{"cx":27.5,"cy":6.3833753244528}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-560,"y":1340},"angle":0,"id":"20b50c2b-51d3-45d3-93f3-5966415a32ed","embeds":"","z":366,"elementid":"0109","nodeID":"0109","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Build Subway\nLine 2","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"37"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":10,"y":1890},"angle":0,"id":"f0aa1001-c3ae-457b-8d81-8f3b6067b758","embeds":"","z":367,"elementid":"0110","nodeID":"0110","parent":"707ab4cb-0f53-40e7-903b-98334bbf221c","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Plan for\nShopping Plaza","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"21"},"text":{"fill":"black"}}},{"type":"link","source":{"id":"f0aa1001-c3ae-457b-8d81-8f3b6067b758"},"target":{"id":"7b80e3a4-b87b-42ec-9978-145cb33ffaaa"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"101d7ad4-448d-43e4-94f0-22fe48a1a1a4","embeds":"","z":368,"linkID":"0109","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_3"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":20,"y":1430},"angle":0,"id":"21c540e5-dbcc-4cfa-9803-6728c25c82f3","embeds":"","z":369,"elementid":"0111","nodeID":"0111","parent":"175624ec-ffba-4f89-a94f-5a8104623f60","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Lease Toronto\nBlocking Land","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"75"},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":150,"y":1300},"angle":0,"id":"de4f92aa-2f00-4d4a-b1c7-626f09f1d0bd","embeds":"","z":370,"elementid":"0112","nodeID":"0112","parent":"85f98d0e-ba54-4253-9283-0a14b78ebf92","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Approve\nMetro 2nd\nLoan","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"47"},"text":{"fill":"black"}}},{"type":"link","source":{"id":"b4c27e9c-3afd-445f-b7a4-9ba56d6ff00f"},"target":{"id":"679308ff-3f54-4dc9-b9a9-881f67c9120d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"344628e6-0efd-4cb5-bb3d-71517581c3fa","embeds":"","z":372,"parent":"0db9d390-7428-4459-a240-296670458093","link-type":"+","linkID":"0110","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_1"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-1440,"y":1290},"angle":0,"id":"52014aef-a6d9-44b2-b17b-200df8722e08","embeds":"","z":373,"elementid":"0113","nodeID":"0113","parent":"0db9d390-7428-4459-a240-296670458093","attrs":{".satvalue":{"text":""},".name":{"text":"Have a Unified\nRoad System","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"8c9711c4-6e4c-4ab8-85d2-4e23d9813de9"},"target":{"id":"52014aef-a6d9-44b2-b17b-200df8722e08"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"c61f91ad-501d-42e1-93b2-61fc86596f9c","embeds":"","z":374,"link-type":"++","vertices":[],"linkID":"0111","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_3"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"52014aef-a6d9-44b2-b17b-200df8722e08"},"target":{"id":"679308ff-3f54-4dc9-b9a9-881f67c9120d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"2e6163c1-a12b-41ff-8c94-0acb7a0d8d0e","embeds":"","z":375,"parent":"0db9d390-7428-4459-a240-296670458093","link-type":"++","linkID":"0112","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_4"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"6a4b08ba-40dd-4d11-994b-bcc1c6f5eafb"},"target":{"id":"8fe414b6-ebcd-4dff-9e69-26a97f38c554"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+S"}}}],"id":"51f0af8f-5f2a-4741-a4fd-31cc17ed7987","embeds":"","z":376,"link-type":"+S","linkID":"0113","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_5"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"3ba7b994-115f-4718-b42f-d2261ee158ee"},"target":{"id":"a19574ec-230e-4296-b7c5-3bd1cb73e9e3"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"b7f6ded9-b03a-4fda-addf-de7a8a0df145","embeds":"","z":378,"vertices":[{"x":-1310,"y":1550}],"link-type":"++","linkID":"0115","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_7"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"bc94c40b-cf02-414e-81c2-cc1464f2a8a9"},"target":{"id":"133ef20d-5e2f-49c2-91ec-24b8be87cc2a"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"4f27f729-637b-4acf-813f-b43805177c56","embeds":"","z":379,"parent":"0db9d390-7428-4459-a240-296670458093","link-type":"+","linkID":"0116","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_8"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"bc94c40b-cf02-414e-81c2-cc1464f2a8a9"},"target":{"id":"522df3cb-a7f8-4209-a4a9-0df743b303f9"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"8143b17d-e163-4fc9-978b-e9e97bfabee8","embeds":"","z":380,"linkID":"0117","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_9"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"7e077e6f-b1e5-4b6b-8114-1d92a24a0708"},"target":{"id":"133ef20d-5e2f-49c2-91ec-24b8be87cc2a"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"e3c1dd21-3629-4964-8c8a-547c6c6cec1e","embeds":"","z":381,"parent":"0db9d390-7428-4459-a240-296670458093","link-type":"+","linkID":"0118","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_10"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"21588abc-21f3-46f5-9d8f-1918589d7f38"},"target":{"id":"0ec02ad6-740b-4758-82ed-08d9fdad410d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"53b5f9f8-06c6-4cfa-ad8b-87043fa727ad","embeds":"","z":384,"link-type":"+","vertices":[{"x":-1800,"y":1830}],"linkID":"0120","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_13"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"692374ec-ad5c-4005-a7ea-882760da0f49"},"target":{"id":"0ec02ad6-740b-4758-82ed-08d9fdad410d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"bafe9184-4d2e-4e8d-98c7-a860da7d4ced","embeds":"","z":385,"link-type":"++","linkID":"0121","parent":"ae04554b-19f9-4a53-b0c2-67d657e600e1","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_14"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"3401d0ea-e54b-4f6f-90bd-ecb184e8f706"},"target":{"id":"2e442c45-94ad-440d-9713-e02330304daf"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"1474392d-9d2b-416b-9911-e8dbc368efa9","embeds":"","z":386,"parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","link-type":"++S","linkID":"0122","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_15"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"20b50c2b-51d3-45d3-93f3-5966415a32ed"},"target":{"id":"f21441ca-abc7-45dc-95d2-d399cb55ca1b"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"c9b41dcb-f559-4ce9-a53b-5b926d4cd08c","embeds":"","z":387,"parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","link-type":"+","vertices":[],"linkID":"0123","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_16"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"6ff83494-5905-4dff-9866-b3ec0b778c43"},"target":{"id":"a8b6cbe7-2edd-4d46-b47f-ef00adcffb37"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"537f1d2b-9479-4c40-b516-5a65d060ddb0","embeds":"","z":388,"parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","link-type":"++","linkID":"0124","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_17"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-590,"y":1440},"angle":0,"id":"f21441ca-abc7-45dc-95d2-d399cb55ca1b","embeds":"","z":389,"elementid":"0114","nodeID":"0114","parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".satvalue":{"text":""},".name":{"text":"Support\nTransit","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"f21441ca-abc7-45dc-95d2-d399cb55ca1b"},"target":{"id":"879d4087-ef72-47a4-bc2d-4863263744c4"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"d3eee109-333b-40fe-a083-61de6979727c","embeds":"","z":390,"linkID":"0125","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_19"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-70,"y":1490},"angle":0,"id":"bd7f7179-8e6b-419b-993e-1a12f44d3ca8","embeds":"","z":391,"elementid":"0115","nodeID":"0115","parent":"175624ec-ffba-4f89-a94f-5a8104623f60","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Listen to\nOpposition","font-size":13},".constraints":{"lastval":"satisfied","function":"none","markedvalue":4},".assigned_time":{"0":"48"},"text":{"fill":"black"}}},{"type":"link","source":{"id":"3cc80045-3646-4df9-ba18-0717116adc25"},"target":{"id":"e00a530a-213d-4f4e-a9d7-6cd6751be53e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++D"}}}],"id":"a4b00966-9130-4681-9423-dc3608f2bb7b","embeds":"","z":392,"parent":"85f98d0e-ba54-4253-9283-0a14b78ebf92","link-type":"++D","linkID":"0126","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_21"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"de4f92aa-2f00-4d4a-b1c7-626f09f1d0bd"},"target":{"id":"e00a530a-213d-4f4e-a9d7-6cd6751be53e"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++D"}}}],"id":"4af49377-3280-42d9-9525-b63899cbcc2d","embeds":"","z":393,"parent":"85f98d0e-ba54-4253-9283-0a14b78ebf92","link-type":"++D","linkID":"0127","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_22"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-570,"y":1560},"angle":0,"id":"1f9f8ad6-4687-466f-8b43-81bed6ea32a8","embeds":"","z":394,"elementid":"0116","nodeID":"0116","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"OMB\nApproval","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"1f9f8ad6-4687-466f-8b43-81bed6ea32a8"},"target":{"id":"ceaf9047-b006-434c-8d64-2c36736e0e7d"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"221495ae-9501-4124-8d95-e097b696426d","embeds":"","z":395,"parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","vertices":[],"linkID":"0128","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_24"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"3cc80045-3646-4df9-ba18-0717116adc25"},"target":{"id":"1f9f8ad6-4687-466f-8b43-81bed6ea32a8"},"labels":[{"position":0.5,"attrs":{"text":{"text":"no | ++"}}}],"id":"846136b0-8539-4824-ad48-1648e034258b","embeds":"","z":397,"link-type":"no|++","linkID":"0129","vertices":[{"x":-30,"y":1390},{"x":-80,"y":1470},{"x":-240,"y":1560},{"x":-420,"y":1540}],"attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_26"},".assigned_time":{"0":"29"}}},{"type":"link","source":{"id":"de4f92aa-2f00-4d4a-b1c7-626f09f1d0bd"},"target":{"id":"1f9f8ad6-4687-466f-8b43-81bed6ea32a8"},"labels":[{"position":0.5,"attrs":{"text":{"text":"no | ++"}}}],"id":"b0aefa89-ca51-47d7-94a0-f9bc230a5940","embeds":"","z":398,"link-type":"no|++","linkID":"0130","vertices":[{"x":160,"y":1410},{"x":-20,"y":1400},{"x":-150,"y":1570},{"x":-410,"y":1560}],"attrs":{".connection":{"stroke":"black","stroke-dasharray":"0 0","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_27"},".assigned_time":{"0":"47"}}},{"type":"link","source":{"id":"07d5b32d-936e-4a1a-91c4-8e9594b9e115"},"target":{"id":"8eb9ffd1-7777-409e-aa5a-10cec529f380"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--S"}}}],"id":"bcbabca4-7f71-4de6-9e6a-d4225be11f03","embeds":"","z":399,"parent":"175624ec-ffba-4f89-a94f-5a8104623f60","link-type":"--S","vertices":[],"linkID":"0131","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_28"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"07d5b32d-936e-4a1a-91c4-8e9594b9e115"},"target":{"id":"6d3ce5b6-30d6-427d-9a96-2857872b5822"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--S"}}}],"id":"4464af82-be27-4092-9b93-14b87f6117e7","embeds":"","z":400,"link-type":"--S","linkID":"0132","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_29"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-160,"y":1910},"angle":0,"id":"9fd3b423-1498-47e5-be08-71115d874634","embeds":"","z":401,"elementid":"0117","nodeID":"0117","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"value":"satisfied","text":"(F, ⊥)"},".funcvalue":{"text":"SD"},".name":{"text":"Pit through\nCedarvale","font-size":13},".constraints":{"lastval":"denied","function":"none","markedvalue":4},".assigned_time":{"0":"37"},"text":{"fill":"black"}}},{"type":"link","source":{"id":"9fd3b423-1498-47e5-be08-71115d874634"},"target":{"id":"7e1d9bec-7b02-45d2-b2ee-5edede72fde6"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--"}}}],"id":"506aacd2-b6f6-4744-8e01-8105d81b7f27","embeds":"","z":402,"link-type":"--","linkID":"0133","vertices":[{"x":-120,"y":2010}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_32"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"9fd3b423-1498-47e5-be08-71115d874634"},"target":{"id":"69dcc7d0-410d-4c36-8bf2-670f1a751579"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--"}}}],"id":"635d292e-cca1-44b6-beee-237eab16328e","embeds":"","z":403,"link-type":"--","vertices":[{"x":0,"y":1990},{"x":10,"y":2050}],"linkID":"0134","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_33"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"0eeecde1-af29-4ab7-b5a1-0cbd52e186f5"},"target":{"id":"dc31c959-48fd-4f4f-ae73-0f0a1b45898a"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"7f2da4f1-cbc9-4610-b542-d963faae91d1","embeds":"","z":404,"link-type":"++","vertices":[{"x":-1480,"y":1140},{"x":-910,"y":1130}],"linkID":"0135","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_34"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"92d24c51-8a5c-43d3-b622-286e4fad1140"},"target":{"id":"31d5ab29-98d7-44de-a606-8bf17860e312"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"7bb614aa-3be2-4e47-abe2-84c4acb4b700","embeds":"","z":405,"vertices":[{"x":-80,"y":2230}],"link-type":"++","linkID":"0136","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_35"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-770,"y":2110},"angle":0,"id":"1ae08063-268a-446c-81ae-36295b6b8776","embeds":"","z":407,"elementid":"0118","nodeID":"0118","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Approve\nTerminal\nPlan","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"1ae08063-268a-446c-81ae-36295b6b8776"},"target":{"id":"baaaea0f-c6a7-4100-867a-c56ef7a83f78"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"74a63adf-21e6-4bd1-af31-8705432b50de","embeds":"","z":408,"link-type":"or","linkID":"0137","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_38"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"6f6311db-15d0-4f23-9ec7-c1993550cf44"},"target":{"id":"2b52a72e-5f80-43b6-bcf4-e5453687e51f"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"b996ebf6-5257-4d97-a8dd-9efcf4706e3f","embeds":"","z":410,"link-type":"or","linkID":"0138","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_41"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"7677cb2a-8f78-4f52-aeb8-ca15364ff7eb"},"target":{"id":"2b52a72e-5f80-43b6-bcf4-e5453687e51f"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"77d477b8-0b6c-46e6-afd4-24e3ccb90f94","embeds":"","z":411,"link-type":"or","linkID":"0139","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_42"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-340,"y":1870},"angle":0,"id":"396340ac-3443-47e9-95e4-2a0c6b3abffd","embeds":"","z":412,"elementid":"0119","nodeID":"0119","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Eglinton to\nDavenport","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":-200,"y":1820},"angle":0,"id":"854ba957-830b-4a4d-81c4-f9787dd7b258","embeds":"","z":413,"elementid":"0120","nodeID":"0120","parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","attrs":{".satvalue":{"text":""},".name":{"text":"Construction\nPlan","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"9b85e7c7-843d-42b4-9cf7-086b67cc830b"},"target":{"id":"854ba957-830b-4a4d-81c4-f9787dd7b258"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"f5bcc817-8336-4f01-9999-564a8c0e5580","embeds":"","z":414,"parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","link-type":"or","linkID":"0140","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_45"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"9fd3b423-1498-47e5-be08-71115d874634"},"target":{"id":"854ba957-830b-4a4d-81c4-f9787dd7b258"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"d1a08fd7-4483-4875-9c04-2a3b1c4547c6","embeds":"","z":415,"parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","link-type":"or","linkID":"0141","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_46"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"31d5ab29-98d7-44de-a606-8bf17860e312"},"target":{"id":"396340ac-3443-47e9-95e4-2a0c6b3abffd"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"c056d7d3-ed38-49a0-a5ab-3ec8de9f99e8","embeds":"","z":416,"linkID":"0142","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_47"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"854ba957-830b-4a4d-81c4-f9787dd7b258"},"target":{"id":"396340ac-3443-47e9-95e4-2a0c6b3abffd"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"ad62ea6a-b2bf-4226-b62b-58e61068cf49","embeds":"","z":417,"linkID":"0143","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_48"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"11131039-33e4-44e3-bf47-c5bc36b7d872"},"target":{"id":"396340ac-3443-47e9-95e4-2a0c6b3abffd"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"cfa752a5-f9d3-4e94-b3e4-0c43ab22ea55","embeds":"","z":418,"linkID":"0144","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_49"},".assigned_time":{"0":""}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":-40,"y":1820},"angle":0,"id":"64c45778-2193-4e39-a847-85e261d39a58","embeds":"","z":419,"elementid":"0121","nodeID":"0121","parent":"707ab4cb-0f53-40e7-903b-98334bbf221c","attrs":{".satvalue":{"text":""},".name":{"text":"Have access\nto 401","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"f8bfb19a-a7da-4020-bfe3-9822b69d0d9b"},"target":{"id":"64c45778-2193-4e39-a847-85e261d39a58"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"c9f0b098-f833-4def-87cd-a8c4d0c1ca4d","embeds":"","z":420,"link-type":"AND","linkID":"0145","vertices":[{"x":-80,"y":1720}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_51"},".assigned_time":{"0":""}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":110,"y":1900},"angle":0,"id":"eed3b36e-2751-4ef5-88e0-5fda38cbc518","embeds":"","z":422,"elementid":"0122","nodeID":"0122","parent":"707ab4cb-0f53-40e7-903b-98334bbf221c","attrs":{".satvalue":{"value":"denied","text":"(⊥, F)"},".funcvalue":{"text":"UD"},".name":{"text":"Build Mall","font-size":13},".constraints":{"lastval":["denied","partiallysatisfied","satisfied"],"function":["C","I","C"],"markedvalue":4,"beginLetter":["0","A","B"],"endLetter":["A","B","C"],"repeat_count":null,"beginRepeat":null,"endRepeat":null,"repeatCount":null,"absoluteLen":null},".assigned_time":{"0":"29","1":"33"},"text":{"fill":"black"}}},{"type":"link","source":{"id":"64c45778-2193-4e39-a847-85e261d39a58"},"target":{"id":"7b80e3a4-b87b-42ec-9978-145cb33ffaaa"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"87a323ce-70ca-402f-9d2b-14a4db6007be","embeds":"","z":423,"linkID":"0146","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_54"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"eed3b36e-2751-4ef5-88e0-5fda38cbc518"},"target":{"id":"7b80e3a4-b87b-42ec-9978-145cb33ffaaa"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"0c1e2c46-de23-46f0-acd3-5c7b42495420","embeds":"","z":424,"linkID":"0147","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_55"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"eed3b36e-2751-4ef5-88e0-5fda38cbc518"},"target":{"id":"2e79b82e-9dc1-4756-a77f-34f5bec0bfd9"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"e7e32f06-0dbe-4db4-b0d6-b69e924e40d7","embeds":"","z":425,"parent":"707ab4cb-0f53-40e7-903b-98334bbf221c","link-type":"++","linkID":"0148","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_56"},".assigned_time":{"0":""}}},{"type":"basic.Softgoal","size":{"width":100,"height":60},"position":{"x":150,"y":1560},"angle":0,"id":"3715ad11-5834-4a07-b0bc-7eb46f69f2d8","embeds":"","z":427,"elementid":"0123","nodeID":"0123","parent":"175624ec-ffba-4f89-a94f-5a8104623f60","attrs":{".satvalue":{"text":""},".name":{"text":"Economic\nDevelopment","font-size":13},".constraints":{"lastval":"unknown","function":"none","markedvalue":4},"text":{"fill":"black"}}},{"type":"link","source":{"id":"7b80e3a4-b87b-42ec-9978-145cb33ffaaa"},"target":{"id":"3715ad11-5834-4a07-b0bc-7eb46f69f2d8"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+S"}}}],"id":"21c0d71b-a929-4a2a-945e-183e87d3126a","embeds":"","z":428,"vertices":[{"x":210,"y":1670}],"link-type":"+S","linkID":"0149","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_8"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"2e442c45-94ad-440d-9713-e02330304daf"},"target":{"id":"3715ad11-5834-4a07-b0bc-7eb46f69f2d8"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+S"}}}],"id":"ba6153b0-0d0e-4efd-b785-66ed8a45d2b9","embeds":"","z":429,"link-type":"+S","vertices":[{"x":-600,"y":1120},{"x":260,"y":1200},{"x":280,"y":1310}],"linkID":"0150","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_9"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"879d4087-ef72-47a4-bc2d-4863263744c4"},"target":{"id":"2e442c45-94ad-440d-9713-e02330304daf"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+S"}}}],"id":"66d920bc-ae25-4e43-9162-13d207965412","embeds":"","z":430,"parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","link-type":"+S","vertices":[{"x":-580,"y":1280},{"x":-590,"y":1240}],"linkID":"0151","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_0"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"bd7f7179-8e6b-419b-993e-1a12f44d3ca8"},"target":{"id":"07d5b32d-936e-4a1a-91c4-8e9594b9e115"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"b07503c6-aea6-467a-b2d6-f8e07467e207","embeds":"","z":431,"parent":"175624ec-ffba-4f89-a94f-5a8104623f60","link-type":"++","vertices":[{"x":40,"y":1580},{"x":40,"y":1630},{"x":20,"y":1630}],"linkID":"0152","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_1"},".assigned_time":{"0":""}}},{"type":"link","source":{"id":"bb93c20c-cc20-4d35-8b6b-0c291bff4dbb"},"target":{"id":"0e4a1250-4ec8-4668-befa-c0ead76f25ec"},"labels":[{"position":0.5,"attrs":{"text":{"text":"NBD"}}}],"id":"2858a0f2-9be9-4903-ac5c-dce6d5efcc06","embeds":"","z":432,"parent":"d5f03f99-6c26-47be-84a3-2aa0460055a3","link-type":"NBD","linkID":"0153","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1},".name":{"text":"undefined_0"}}},{"type":"link","source":{"id":"7ef4dd33-5c63-411e-831a-e2f007573249"},"target":{"id":"2e442c45-94ad-440d-9713-e02330304daf"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"b5e68c12-b0ad-4ed3-93f9-2b8fb2767273","z":433,"linkID":"0155","link-type":"++S","vertices":[{"x":-720,"y":1230}],"parent":"dd5c8491-86d1-4f4e-a65c-7460bc83c720","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"c64904d0-c624-4590-8e97-0ed3ed5a81b5"},"target":{"id":"e8408f60-d40b-48e4-a18c-2c4d16447a1a"},"labels":[{"position":0.5,"attrs":{"text":{"text":"--"}}}],"id":"227bed58-a859-4f4f-bf9d-6e9999c329b3","z":434,"linkID":"0156","link-type":"--","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"7e077e6f-b1e5-4b6b-8114-1d92a24a0708"},"target":{"id":"e8408f60-d40b-48e4-a18c-2c4d16447a1a"},"labels":[{"position":0.5,"attrs":{"text":{"text":"-"}}}],"id":"378575d3-b253-454a-af76-a188e3d3b30e","z":435,"linkID":"0157","link-type":"-","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"6ff83494-5905-4dff-9866-b3ec0b778c43"},"target":{"id":"49bcd71b-0baa-45cc-a355-3eb4da1907f5"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"74e622e8-d613-4ed0-b39f-18ddce0dbe86","z":436,"linkID":"0158","link-type":"+","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"f8bfb19a-a7da-4020-bfe3-9822b69d0d9b"},"target":{"id":"49bcd71b-0baa-45cc-a355-3eb4da1907f5"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"05f66b88-38e3-4648-a41d-bc4bbc5fd2ce","z":437,"linkID":"0159","vertices":[{"x":-310,"y":1530}],"link-type":"++","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}},{"type":"link","source":{"id":"ef0bb0a0-9d97-4aa9-b284-6333dc182c29"},"target":{"id":"64c45778-2193-4e39-a847-85e261d39a58"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"01e6d44c-a925-4ed9-a53e-c13a14f752f7","z":438,"linkID":"0160","vertices":[{"x":70,"y":1790}],"attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}}]},"model":{"actors":[{"nodeID":"a000","nodeName":"Planning\nBoard","intentionIDs":["0013","0108","0108","0013","0048","0013","0108","0108","0108","0108","0013","0048","0013","0048","0108","0013","0108","0013","0048","0108","0063","0063","0013"]},{"nodeID":"a001","nodeName":"Spadina\nProject","intentionIDs":["0005","0007","0009","0010","0012","0015","0016","0020","0030","0031","0032","0045","0046","0047","0051","0052","0053","0054","0055","0056","0057","0058","0059","0060","0061","0066","0090","0095","0106","0107","0116","0117","0118","0119","0120","0020","0018","0007","0031","0015","0032","0016","0060","0058","0010","0005","0031","0106","0009","0118","0047","0045","0012","0061","0107","0116","0095","0012","0045","0047","0046","0057","0051","0052","0053","0030","0066","0117","0119","0120","0054","0055","0056","0090","0116","0059","0060","0016","0015","0032","0007","0060","0015","0016","0058","0010","0061","0005","0031","0106","0009","0010","0005","0118","0012","0045","0095","0116","0107","0046","0047","0046","0047","0046","0046","0059","0095","0057","0116","0059","0090","0095","0057","0051","0052","0116","0116","0107","0059","0095","0090","0056","0055","0054","0119","0120","0053","0052","0030","0066","0117","0031","0106","0005","0032","0010","0009","0118","0116","0059","0059","0107","0090","0095","0090","0056","0055","0054","0119","0057","0053","0030","0120","0066","0056","0054","0055","0120","0117","0066","0020","0018","0020","0018","0018","0016","0015","0016","0056"]},{"nodeID":"a002","nodeName":"Network\nProject","intentionIDs":["0004","0017","0018","0019","0021","0022","0023","0024","0025","0026","0027","0028","0042","0043","0044","0048","0049","0050","0074","0075","0076","0077","0079","0080","0081","0096","0097","0048","0004","0074","0027","0023","0024","0019","0044","0079","0049","0022","0028","0027","0075","0077","0076","0026","0025","0096","0097","0028","0043","0017","0080","0021","0081","0042","0050","0018","0048","0004","0004","0074","0023","0024","0027","0075","0077","0019","0024","0044","0028","0026","0076","0025","0096","0096","0096","0025","0096","0050","0042","0043","0080","0081","0021","0022","0079","0049","0049","0079","0077","0050","0042","0081","0021","0017","0080","0080","0080","0080","0028","0024","0022","0018","0097","0020","0080"]},{"nodeID":"a003","nodeName":"Toronto","intentionIDs":["0000","0002","0003","0014","0029","0040","0041","0062","0063","0064","0065","0088","0100","0101","0113","0003","0000","0002","0063","0062","0014","0113","0040","0088","0029","0041","0064","0101","0065","0100","0029","0040","0113","0014","0088","0029","0041","0065","0064","0014","0064","0101","0100","0040","0000","0003","0002","0113","0014","0041","0065","0064","0101","0002","0063","0062","0100","0088","0029","0088","0062","0003","0100","0029","0014","0014","0100","0088","0029","0062","0100","0101","0064","0002","0101","0002","0002","0065","0065","0064","0029","0100","0101","0065","0065","0002","0065","0002","0101","0064","0014","0041","0040","0113","0062","0014","0014","0062","0014","0065","0065","0088","0062"]},{"nodeID":"a004","nodeName":"OMB","intentionIDs":["0067","0087","0099","0112","0099","0112","0067","0087","0099","0087","0067","0112","0067","0112","0087","0087"]},{"nodeID":"a005","nodeName":"Opposition","intentionIDs":["0033","0034","0035","0036","0037","0073","0082","0083","0084","0085","0034","0035","0083","0073","0082","0036","0033","0037","0084","0085","0034","0084","0035","0033","0085","0037","0036","0082","0073","0083","0035","0034","0035","0083","0073","0037","0034","0034","0084","0036","0037","0082","0034","0084","0037","0036"]},{"nodeID":"a006","nodeName":"Metro","intentionIDs":["0068","0069","0070","0071","0072","0086","0093","0102","0103","0105","0109","0114","0070","0093","0086","0071","0103","0114","0109","0102","0068","0069","0105","0072","0093","0086","0071","0114","0103","0070","0068","0069","0105","0072","0109","0070","0070","0068","0069","0103","0069","0103","0069","0105","0093","0071","0086","0071","0102","0114","0072","0109","0069","0069","0105","0072","0071","0086","0086","0102","0114","0109","0114","0109","0086","0093","0068","0069","0105","0072","0102","0109","0018","0085","0086","0114","0109","0114","0085","0114","0109","0085","0085","0072","0085","0085","0085","0114","0114","0102","0085","0109","0114","0069","0069","0069","0069","0069","0086","0105","0105"]},{"nodeID":"a007","nodeName":"Province","intentionIDs":["0008","0011","0089","0094","0104","0111","0115","0123","0094","0104","0111","0115","0089","0123","0011","0008","0094","0104","0111","0115","0008","0089","0011","0094","0104","0123","0011","0089","0123","0123","0089","0011","0104","0115","0089"]},{"nodeID":"a008","nodeName":"York","intentionIDs":["0006","0038","0039","0078","0092","0098","0092","0098","0038","0039","0078","0006","0092","0098","0039","0078","0039","0006","0038","0078","0078","0078","0078","0078","0078","0039","0098","0039","0078","0006","0039","0098","0039","0006","0092","0039","0006","0006"]},{"nodeID":"a009","nodeName":"Yorkdale\nProject","intentionIDs":["0001","0091","0110","0121","0122","0001","0121","0110","0122","0091","0121","0001","0110","0122","0091","0110"]},{"nodeID":"aNaN","nodeName":"County\nof York","intentionIDs":["0078","0078","0078"]}],"intentions":[{"nodeActorID":"a003","nodeID":"0000","nodeType":"basic.Softgoal","nodeName":"Promote\nGrowth","dynamicFunction":{"intentionID":"0000","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a009","nodeID":"0001","nodeType":"basic.Goal","nodeName":"Have Yorkdale\nShopping Plaza\n","dynamicFunction":{"intentionID":"0001","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0002","nodeType":"basic.Goal","nodeName":"Support\nMetro","dynamicFunction":{"intentionID":"0002","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0003","nodeType":"basic.Task","nodeName":"Expand Suburbs\nVacant Land Use ","dynamicFunction":{"intentionID":"0003","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a002","nodeID":"0004","nodeType":"basic.Goal","nodeName":"Have a Unified Arterial\nRoad System","dynamicFunction":{"intentionID":"0004","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0005","nodeType":"basic.Goal","nodeName":"Have Spadina \nExpressway","dynamicFunction":{"intentionID":"0005","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a008","nodeID":"0006","nodeType":"basic.Task","nodeName":"Approve Land\nRelease","dynamicFunction":{"intentionID":"0006","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0007","nodeType":"basic.Task","nodeName":"Complete Initial\nDowntown Widening","dynamicFunction":{"intentionID":"0007","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a007","nodeID":"0008","nodeType":"basic.Task","nodeName":"Approve Funds","dynamicFunction":{"intentionID":"0008","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0009","nodeType":"basic.Task","nodeName":"Plan Project","dynamicFunction":{"intentionID":"0009","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0010","nodeType":"basic.Goal","nodeName":"Get Funding","dynamicFunction":{"intentionID":"0010","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a007","nodeID":"0011","nodeType":"basic.Goal","nodeName":"Fund \nInfrastructure ","dynamicFunction":{"intentionID":"0011","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0012","nodeType":"basic.Goal","nodeName":"Build Spadina\nExpressway","dynamicFunction":{"intentionID":"0012","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0013","nodeType":"basic.Softgoal","nodeName":"Support Cooperation","dynamicFunction":{"intentionID":"0013","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0014","nodeType":"basic.Goal","nodeName":"Have Physical \nConnection between \nYork and downtown","dynamicFunction":{"intentionID":"0014","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0015","nodeType":"basic.Task","nodeName":"Get Funding \nFrom York","dynamicFunction":{"intentionID":"0015","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0016","nodeType":"basic.Task","nodeName":"Get Funding \nFrom Toronto","dynamicFunction":{"intentionID":"0016","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0017","nodeType":"basic.Goal","nodeName":"Have\nCrosstown\nExpressway","dynamicFunction":{"intentionID":"0017","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0018","nodeType":"basic.Task","nodeName":"York Approves\nInitial Funding","dynamicFunction":{"intentionID":"0018","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0019","nodeType":"basic.Goal","nodeName":"Have\nDon Valley\nParkway","dynamicFunction":{"intentionID":"0019","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0020","nodeType":"basic.Task","nodeName":"Toronto Approves\nInitial Funding","dynamicFunction":{"intentionID":"0020","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0021","nodeType":"basic.Goal","nodeName":"Have\nLakeshore\nExpressway","dynamicFunction":{"intentionID":"0021","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0022","nodeType":"basic.Softgoal","nodeName":"Ease\nCongestion","dynamicFunction":{"intentionID":"0022","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0023","nodeType":"basic.Goal","nodeName":"Build Road Network \n- Single Project","dynamicFunction":{"intentionID":"0023","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0024","nodeType":"basic.Goal","nodeName":"Build Road Network\n- Multiple Projects","dynamicFunction":{"intentionID":"0024","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0025","nodeType":"basic.Task","nodeName":"Approve\nNetwork","dynamicFunction":{"intentionID":"0025","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0026","nodeType":"basic.Goal","nodeName":"Get Network \nFunding","dynamicFunction":{"intentionID":"0026","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0027","nodeType":"basic.Task","nodeName":"Plan\nNetwork","dynamicFunction":{"intentionID":"0027","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a002","nodeID":"0028","nodeType":"basic.Goal","nodeName":"Build Network","dynamicFunction":{"intentionID":"0028","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0029","nodeType":"basic.Softgoal","nodeName":"Improve Public\nTransit","dynamicFunction":{"intentionID":"0029","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0030","nodeType":"basic.Task","nodeName":"Get Land\nFrom York","dynamicFunction":{"intentionID":"0030","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0031","nodeType":"basic.Task","nodeName":"Approve\nConnected\nPlan","dynamicFunction":{"intentionID":"0031","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0100","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"0010","funcStart":"B","funcStop":"C"},{"funcType":"C","funcX":"0011","funcStart":"C","funcStop":"D"}]}},{"nodeActorID":"a001","nodeID":"0032","nodeType":"basic.Task","nodeName":"Get Funding\nToronto-York\nOnly","dynamicFunction":{"intentionID":"0032","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0033","nodeType":"basic.Goal","nodeName":"Stop Spadina\nExpressway","dynamicFunction":{"intentionID":"0033","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0034","nodeType":"basic.Softgoal","nodeName":"Anti-\nAutomobilism\n","dynamicFunction":{"intentionID":"0034","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0035","nodeType":"basic.Softgoal","nodeName":"Maintain \nProperty\nValue","dynamicFunction":{"intentionID":"0035","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0036","nodeType":"basic.Task","nodeName":"Lobby\nProvince","dynamicFunction":{"intentionID":"0036","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0037","nodeType":"basic.Task","nodeName":"Lobby\nMetro","dynamicFunction":{"intentionID":"0037","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a008","nodeID":"0038","nodeType":"basic.Task","nodeName":"Require\nTunnel","dynamicFunction":{"intentionID":"0038","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a008","nodeID":"0039","nodeType":"basic.Softgoal","nodeName":"Protect\nCedarvale","dynamicFunction":{"intentionID":"0039","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0040","nodeType":"basic.Goal","nodeName":"Be World\nClass City","dynamicFunction":{"intentionID":"0040","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0041","nodeType":"basic.Goal","nodeName":"Prevent Highway\nConstruction Downtown","dynamicFunction":{"intentionID":"0041","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0042","nodeType":"basic.Task","nodeName":"Build\nLakeshore\nExpressway","dynamicFunction":{"intentionID":"0042","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0100","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"0010","funcStart":"B","funcStop":"C"},{"funcType":"C","funcX":"0011","funcStart":"C","funcStop":"D"}]}},{"nodeActorID":"a002","nodeID":"0043","nodeType":"basic.Task","nodeName":"Build\nCrosstown\nExpressway","dynamicFunction":{"intentionID":"0043","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a002","nodeID":"0044","nodeType":"basic.Task","nodeName":"Build\nDon Valley\nParkway","dynamicFunction":{"intentionID":"0044","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0100","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"1100","funcStart":"B","funcStop":"C"},{"funcType":"C","funcX":"0100","funcStart":"C","funcStop":"D"},{"funcType":"C","funcX":"0010","funcStart":"D","funcStop":"E"},{"funcType":"C","funcX":"0011","funcStart":"E","funcStop":"F"}]}},{"nodeActorID":"a001","nodeID":"0045","nodeType":"basic.Task","nodeName":"Expropriate\nToronto\nLand","dynamicFunction":{"intentionID":"0045","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0046","nodeType":"basic.Task","nodeName":"Expropriate All\nLand Segments","dynamicFunction":{"intentionID":"0046","stringDynVis":"NB","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0047","nodeType":"basic.Task","nodeName":"Expropriate\nLand as Required","dynamicFunction":{"intentionID":"0047","stringDynVis":"NB","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a000","nodeID":"0048","nodeType":"basic.Goal","nodeName":"Have a Unified\nArterial\nRoad System","dynamicFunction":{"intentionID":"0048","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0049","nodeType":"basic.Goal","nodeName":"Have\nSpadina\nExpressway","dynamicFunction":{"intentionID":"0049","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0050","nodeType":"basic.Goal","nodeName":"Build\nSpadina\nExpressway","dynamicFunction":{"intentionID":"0050","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0051","nodeType":"basic.Task","nodeName":"Build Bloor\nTo Lakeshore","dynamicFunction":{"intentionID":"0051","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0052","nodeType":"basic.Task","nodeName":"Build Davenport\nTo Bloor","dynamicFunction":{"intentionID":"0052","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0053","nodeType":"basic.Task","nodeName":"Build\nCrosstown\nInterchange\n","dynamicFunction":{"intentionID":"0053","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0054","nodeType":"basic.Task","nodeName":"Build Eglinton \nto Davenport","dynamicFunction":{"intentionID":"0054","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0100","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"1100","funcStart":"B","funcStop":"C"}]}},{"nodeActorID":"a001","nodeID":"0055","nodeType":"basic.Task","nodeName":"Build\nLawrence to\nEglinton","dynamicFunction":{"intentionID":"0055","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0100","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"0010","funcStart":"B","funcStop":"C"},{"funcType":"C","funcX":"0011","funcStart":"C","funcStop":"D"}]}},{"nodeActorID":"a001","nodeID":"0056","nodeType":"basic.Task","nodeName":"Build \nWilson-401 to\nLawrence","dynamicFunction":{"intentionID":"0056","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"I","funcX":"0011","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"0011","funcStart":"B","funcStop":"C"}]}},{"nodeActorID":"a001","nodeID":"0057","nodeType":"basic.Goal","nodeName":"Connected\nExpressway","dynamicFunction":{"intentionID":"0057","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0058","nodeType":"basic.Task","nodeName":"Get Funding\nFrom Metro","dynamicFunction":{"intentionID":"0058","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0059","nodeType":"basic.Task","nodeName":"Province\nApproves\nFunding","dynamicFunction":{"intentionID":"0059","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0060","nodeType":"basic.Task","nodeName":"Metro\nApproves\nFunding","dynamicFunction":{"intentionID":"0060","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0061","nodeType":"basic.Task","nodeName":"Get Funding\nMetro-Province","dynamicFunction":{"intentionID":"0061","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0062","nodeType":"basic.Task","nodeName":"Approve Planning\nBoard Funding T","dynamicFunction":{"intentionID":"0062","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"0000","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"B"}]}},{"nodeActorID":"a000","nodeID":"0063","nodeType":"basic.Goal","nodeName":"Have Project\nFunding","dynamicFunction":{"intentionID":"0063","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0064","nodeType":"basic.Task","nodeName":"Oppose\nCrosstown","dynamicFunction":{"intentionID":"0064","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a003","nodeID":"0065","nodeType":"basic.Task","nodeName":"Elect\nReformer\nCouncil","dynamicFunction":{"intentionID":"0065","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0066","nodeType":"basic.Task","nodeName":"Tunnel though \nCedarvale","dynamicFunction":{"intentionID":"0066","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a004","nodeID":"0067","nodeType":"basic.Task","nodeName":"Approve\nMetro\nLoan","dynamicFunction":{"intentionID":"0067","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a006","nodeID":"0068","nodeType":"basic.Task","nodeName":"Expand Suburbs\nVacant Land Use","dynamicFunction":{"intentionID":"0068","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a006","nodeID":"0069","nodeType":"basic.Goal","nodeName":"Have a Unified Arterial\nRoad System","dynamicFunction":{"intentionID":"0069","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a006","nodeID":"0070","nodeType":"basic.Goal","nodeName":"Economic\nGrowth","dynamicFunction":{"intentionID":"0070","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a006","nodeID":"0071","nodeType":"basic.Goal","nodeName":"Support\nInfrastructure\nProjects","dynamicFunction":{"intentionID":"0071","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a006","nodeID":"0072","nodeType":"basic.Task","nodeName":"Approve\nProject\nFunding","dynamicFunction":{"intentionID":"0072","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a005","nodeID":"0073","nodeType":"basic.Softgoal","nodeName":"Protect\nCedarvale","dynamicFunction":{"intentionID":"0073","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0074","nodeType":"basic.Task","nodeName":"Get Startup\nfrom Toronto","dynamicFunction":{"intentionID":"0074","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0075","nodeType":"basic.Task","nodeName":"Get Startup\nFunding","dynamicFunction":{"intentionID":"0075","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0076","nodeType":"basic.Task","nodeName":"Get Road\nFunding","dynamicFunction":{"intentionID":"0076","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a002","nodeID":"0077","nodeType":"basic.Task","nodeName":"Get Startup\nfrom York","dynamicFunction":{"intentionID":"0077","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"aNaN","nodeID":"0078","nodeType":"basic.Task","nodeName":"Approve Planning\nBoard Funding Y","dynamicFunction":{"intentionID":"0078","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a002","nodeID":"0079","nodeType":"basic.Task","nodeName":"Get Don Valley\nParkway Design\nApproved","dynamicFunction":{"intentionID":"0079","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a002","nodeID":"0080","nodeType":"basic.Task","nodeName":"Get Crosstown\nDesign Approved","dynamicFunction":{"intentionID":"0080","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"0000","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0010","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"1100","funcStart":"B","funcStop":"C"},{"funcType":"C","funcX":"0000","funcStart":"C","funcStop":"D"},{"funcType":"C","funcX":"1100","funcStart":"D","funcStop":"E"},{"funcType":"C","funcX":"0010","funcStart":"E","funcStop":"F"},{"funcType":"C","funcX":"1100","funcStart":"F","funcStop":"G"}]}},{"nodeActorID":"a002","nodeID":"0081","nodeType":"basic.Task","nodeName":"Get Lakeshore\nDesign Approved","dynamicFunction":{"intentionID":"0081","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0000","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"1100","funcStart":"B","funcStop":"C"},{"funcType":"C","funcX":"0000","funcStart":"C","funcStop":"D"},{"funcType":"C","funcX":"0010","funcStart":"D","funcStop":"E"},{"funcType":"C","funcX":"0011","funcStart":"E","funcStop":"F"}]}},{"nodeActorID":"a005","nodeID":"0082","nodeType":"basic.Task","nodeName":"Litigate\nSpadina","dynamicFunction":{"intentionID":"0082","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0083","nodeType":"basic.Softgoal","nodeName":"Save Older\nNeighbourhoods","dynamicFunction":{"intentionID":"0083","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a005","nodeID":"0084","nodeType":"basic.Goal","nodeName":"Stop Crosstown\nExpressway","dynamicFunction":{"intentionID":"0084","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a006","nodeID":"0085","nodeType":"basic.Goal","nodeName":"Honour\nInterchange\nAgreement\n","dynamicFunction":{"intentionID":"0085","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a006","nodeID":"0086","nodeType":"basic.Task","nodeName":"Listen to\nOpposition","dynamicFunction":{"intentionID":"0086","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a004","nodeID":"0087","nodeType":"basic.Task","nodeName":"Support\nLitigation","dynamicFunction":{"intentionID":"0087","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"a003","nodeID":"0088","nodeType":"basic.Task","nodeName":"Build First\nSubway","dynamicFunction":{"intentionID":"0088","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a007","nodeID":"0089","nodeType":"basic.Resource","nodeName":"Support\nTransit\nProjects","dynamicFunction":{"intentionID":"0089","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"0000","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"1100","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"0011","funcStart":"B","funcStop":"C"}]}},{"nodeActorID":"a001","nodeID":"0090","nodeType":"basic.Task","nodeName":"Build Spadina\nTransit\nLine","dynamicFunction":{"intentionID":"0090","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a009","nodeID":"0091","nodeType":"basic.Resource","nodeName":"Parking\nSpaces","dynamicFunction":{"intentionID":"0091","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a008","nodeID":"0092","nodeType":"basic.Goal","nodeName":"Maintain\nProperty\nValues","dynamicFunction":{"intentionID":"0092","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a006","nodeID":"0093","nodeType":"basic.Task","nodeName":"Consult with\nCitizens","dynamicFunction":{"intentionID":"0093","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a007","nodeID":"0094","nodeType":"basic.Task","nodeName":"Block Spadina","dynamicFunction":{"intentionID":"0094","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0095","nodeType":"basic.Goal","nodeName":"Terminal\nExpressway","dynamicFunction":{"intentionID":"0095","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0096","nodeType":"basic.Goal","nodeName":"Build Network\nWithout Crosstown","dynamicFunction":{"intentionID":"0096","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a002","nodeID":"0097","nodeType":"basic.Goal","nodeName":"Build Network\nWith Crosstown","dynamicFunction":{"intentionID":"0097","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a008","nodeID":"0098","nodeType":"basic.Softgoal","nodeName":"Protect Forest\nHill Village","dynamicFunction":{"intentionID":"0098","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a004","nodeID":"0099","nodeType":"basic.Task","nodeName":"Hold Hearings","dynamicFunction":{"intentionID":"0099","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0100","nodeType":"basic.Softgoal","nodeName":"Protect\nNeighbourhoods","dynamicFunction":{"intentionID":"0100","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0101","nodeType":"basic.Task","nodeName":"Create Central\nArea Plan","dynamicFunction":{"intentionID":"0101","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a006","nodeID":"0102","nodeType":"basic.Goal","nodeName":"Support\nRoads","dynamicFunction":{"intentionID":"0102","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a006","nodeID":"0103","nodeType":"basic.Goal","nodeName":"Adopt Centres Policy","dynamicFunction":{"intentionID":"0103","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a007","nodeID":"0104","nodeType":"basic.Goal","nodeName":"Have 401\nInterchange","dynamicFunction":{"intentionID":"0104","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a006","nodeID":"0105","nodeType":"basic.Task","nodeName":"Official Plan for the\nUrban Structure 1980","dynamicFunction":{"intentionID":"0105","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"1100","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"0011","funcStart":"B","funcStop":"C"}]}},{"nodeActorID":"a001","nodeID":"0106","nodeType":"basic.Task","nodeName":"Approve\nConstruction to \nLawrence 1962-1","dynamicFunction":{"intentionID":"0106","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0107","nodeType":"basic.Task","nodeName":"Get Funding\nFrom Province","dynamicFunction":{"intentionID":"0107","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0108","nodeType":"basic.Task","nodeName":"Lobby for\nRegional\nPlanning\n","dynamicFunction":{"intentionID":"0108","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a006","nodeID":"0109","nodeType":"basic.Task","nodeName":"Build Subway\nLine 2","dynamicFunction":{"intentionID":"0109","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a009","nodeID":"0110","nodeType":"basic.Task","nodeName":"Plan for\nShopping Plaza","dynamicFunction":{"intentionID":"0110","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a007","nodeID":"0111","nodeType":"basic.Task","nodeName":"Lease Toronto\nBlocking Land","dynamicFunction":{"intentionID":"0111","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a004","nodeID":"0112","nodeType":"basic.Task","nodeName":"Approve\nMetro 2nd\nLoan","dynamicFunction":{"intentionID":"0112","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a003","nodeID":"0113","nodeType":"basic.Goal","nodeName":"Have a Unified\nRoad System","dynamicFunction":{"intentionID":"0113","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a006","nodeID":"0114","nodeType":"basic.Goal","nodeName":"Support\nTransit","dynamicFunction":{"intentionID":"0114","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a007","nodeID":"0115","nodeType":"basic.Task","nodeName":"Listen to\nOpposition","dynamicFunction":{"intentionID":"0115","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0116","nodeType":"basic.Task","nodeName":"OMB\nApproval","dynamicFunction":{"intentionID":"0116","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0117","nodeType":"basic.Task","nodeName":"Pit through\nCedarvale","dynamicFunction":{"intentionID":"0117","stringDynVis":"SD","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"1100","funcStart":"A","funcStop":"Infinity"}]}},{"nodeActorID":"a001","nodeID":"0118","nodeType":"basic.Task","nodeName":"Approve\nTerminal\nPlan","dynamicFunction":{"intentionID":"0118","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0119","nodeType":"basic.Task","nodeName":"Eglinton to\nDavenport","dynamicFunction":{"intentionID":"0119","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0120","nodeType":"basic.Task","nodeName":"Construction\nPlan","dynamicFunction":{"intentionID":"0120","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a009","nodeID":"0121","nodeType":"basic.Goal","nodeName":"Have access\nto 401","dynamicFunction":{"intentionID":"0121","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a009","nodeID":"0122","nodeType":"basic.Task","nodeName":"Build Mall","dynamicFunction":{"intentionID":"0122","stringDynVis":"UD","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"I","funcX":"0010","funcStart":"A","funcStop":"B"},{"funcType":"C","funcX":"0011","funcStart":"B","funcStop":"C"}]}},{"nodeActorID":"a007","nodeID":"0123","nodeType":"basic.Softgoal","nodeName":"Economic\nDevelopment","dynamicFunction":{"intentionID":"0123","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0000","linkType":"AND","postType":null,"linkSrcID":"0008","linkDestID":"0011","absoluteValue":-1},{"linkID":"0001","linkType":"AND","postType":null,"linkSrcID":"0015","linkDestID":"0032","absoluteValue":-1},{"linkID":"0002","linkType":"AND","postType":null,"linkSrcID":"0016","linkDestID":"0032","absoluteValue":-1},{"linkID":"0003","linkType":"++","postType":null,"linkSrcID":"0018","linkDestID":"0015","absoluteValue":-1},{"linkID":"0004","linkType":"++","postType":null,"linkSrcID":"0020","linkDestID":"0016","absoluteValue":-1},{"linkID":"0005","linkType":"AND","postType":null,"linkSrcID":"0007","linkDestID":"0005","absoluteValue":-1},{"linkID":"0006","linkType":"AND","postType":null,"linkSrcID":"0009","linkDestID":"0005","absoluteValue":-1},{"linkID":"0007","linkType":"AND","postType":null,"linkSrcID":"0010","linkDestID":"0005","absoluteValue":-1},{"linkID":"0008","linkType":"AND","postType":null,"linkSrcID":"0012","linkDestID":"0005","absoluteValue":-1},{"linkID":"0009","linkType":"AND","postType":null,"linkSrcID":"0021","linkDestID":"0024","absoluteValue":-1},{"linkID":"0010","linkType":"AND","postType":null,"linkSrcID":"0049","linkDestID":"0024","absoluteValue":-1},{"linkID":"0011","linkType":"AND","postType":null,"linkSrcID":"0019","linkDestID":"0024","absoluteValue":-1},{"linkID":"0012","linkType":"AND","postType":null,"linkSrcID":"0017","linkDestID":"0024","absoluteValue":-1},{"linkID":"0013","linkType":"+","postType":null,"linkSrcID":"0003","linkDestID":"0000","absoluteValue":-1},{"linkID":"0014","linkType":"+","postType":null,"linkSrcID":"0002","linkDestID":"0000","absoluteValue":-1},{"linkID":"0015","linkType":"+","postType":null,"linkSrcID":"0014","linkDestID":"0040","absoluteValue":-1},{"linkID":"0016","linkType":"OR","postType":null,"linkSrcID":"0023","linkDestID":"0004","absoluteValue":-1},{"linkID":"0017","linkType":"OR","postType":null,"linkSrcID":"0024","linkDestID":"0004","absoluteValue":-1},{"linkID":"0018","linkType":"AND","postType":null,"linkSrcID":"0027","linkDestID":"0023","absoluteValue":-1},{"linkID":"0019","linkType":"AND","postType":null,"linkSrcID":"0025","linkDestID":"0023","absoluteValue":-1},{"linkID":"0020","linkType":"AND","postType":null,"linkSrcID":"0026","linkDestID":"0023","absoluteValue":-1},{"linkID":"0021","linkType":"AND","postType":null,"linkSrcID":"0028","linkDestID":"0023","absoluteValue":-1},{"linkID":"0022","linkType":"++D","postType":null,"linkSrcID":"0026","linkDestID":"0028","absoluteValue":-1},{"linkID":"0023","linkType":"++D","postType":null,"linkSrcID":"0025","linkDestID":"0028","absoluteValue":-1},{"linkID":"0024","linkType":"++D","postType":null,"linkSrcID":"0027","linkDestID":"0028","absoluteValue":-1},{"linkID":"0025","linkType":"++S","postType":null,"linkSrcID":"0008","linkDestID":"0059","absoluteValue":-1},{"linkID":"0026","linkType":"OR","postType":null,"linkSrcID":"0031","linkDestID":"0009","absoluteValue":-1},{"linkID":"0027","linkType":"OR","postType":null,"linkSrcID":"0032","linkDestID":"0010","absoluteValue":-1},{"linkID":"0028","linkType":"+","postType":null,"linkSrcID":"0038","linkDestID":"0039","absoluteValue":-1},{"linkID":"0029","linkType":"AND","postType":null,"linkSrcID":"0045","linkDestID":"0005","absoluteValue":-1},{"linkID":"0030","linkType":"OR","postType":null,"linkSrcID":"0046","linkDestID":"0045","absoluteValue":-1},{"linkID":"0031","linkType":"OR","postType":null,"linkSrcID":"0047","linkDestID":"0045","absoluteValue":-1},{"linkID":"0032","linkType":"++","postType":null,"linkSrcID":"0004","linkDestID":"0048","absoluteValue":-1},{"linkID":"0033","linkType":"+","postType":null,"linkSrcID":"0019","linkDestID":"0022","absoluteValue":-1},{"linkID":"0034","linkType":"+","postType":null,"linkSrcID":"0017","linkDestID":"0022","absoluteValue":-1},{"linkID":"0035","linkType":"+","postType":null,"linkSrcID":"0021","linkDestID":"0022","absoluteValue":-1},{"linkID":"0036","linkType":"+","postType":null,"linkSrcID":"0049","linkDestID":"0022","absoluteValue":-1},{"linkID":"0037","linkType":"AND","postType":null,"linkSrcID":"0042","linkDestID":"0096","absoluteValue":-1},{"linkID":"0038","linkType":"AND","postType":null,"linkSrcID":"0043","linkDestID":"0097","absoluteValue":-1},{"linkID":"0039","linkType":"AND","postType":null,"linkSrcID":"0050","linkDestID":"0096","absoluteValue":-1},{"linkID":"0040","linkType":"AND","postType":null,"linkSrcID":"0044","linkDestID":"0097","absoluteValue":-1},{"linkID":"0041","linkType":"AND","postType":null,"linkSrcID":"0043","linkDestID":"0017","absoluteValue":-1},{"linkID":"0042","linkType":"AND","postType":null,"linkSrcID":"0042","linkDestID":"0021","absoluteValue":-1},{"linkID":"0043","linkType":"AND","postType":null,"linkSrcID":"0051","linkDestID":"0057","absoluteValue":-1},{"linkID":"0044","linkType":"AND","postType":null,"linkSrcID":"0052","linkDestID":"0057","absoluteValue":-1},{"linkID":"0045","linkType":"AND","postType":null,"linkSrcID":"0053","linkDestID":"0057","absoluteValue":-1},{"linkID":"0046","linkType":"AND","postType":null,"linkSrcID":"0055","linkDestID":"0057","absoluteValue":-1},{"linkID":"0047","linkType":"AND","postType":null,"linkSrcID":"0056","linkDestID":"0057","absoluteValue":-1},{"linkID":"0048","linkType":"AND","postType":null,"linkSrcID":"0060","linkDestID":"0058","absoluteValue":-1},{"linkID":"0049","linkType":"OR","postType":null,"linkSrcID":"0061","linkDestID":"0010","absoluteValue":-1},{"linkID":"0050","linkType":"AND","postType":null,"linkSrcID":"0058","linkDestID":"0061","absoluteValue":-1},{"linkID":"0051","linkType":"++","postType":null,"linkSrcID":"0005","linkDestID":"0049","absoluteValue":-1},{"linkID":"0052","linkType":"++S","postType":null,"linkSrcID":"0019","linkDestID":"0014","absoluteValue":-1},{"linkID":"0053","linkType":"++S","postType":null,"linkSrcID":"0049","linkDestID":"0014","absoluteValue":-1},{"linkID":"0054","linkType":"AND","postType":null,"linkSrcID":"0012","linkDestID":"0050","absoluteValue":-1},{"linkID":"0055","linkType":"++","postType":null,"linkSrcID":"0062","linkDestID":"0063","absoluteValue":-1},{"linkID":"0056","linkType":"++","postType":null,"linkSrcID":"0062","linkDestID":"0074","absoluteValue":-1},{"linkID":"0057","linkType":"AND","postType":null,"linkSrcID":"0064","linkDestID":"0041","absoluteValue":-1},{"linkID":"0058","linkType":"AND","postType":null,"linkSrcID":"0065","linkDestID":"0041","absoluteValue":-1},{"linkID":"0059","linkType":"++S","postType":null,"linkSrcID":"0038","linkDestID":"0006","absoluteValue":-1},{"linkID":"0060","linkType":"++S","postType":null,"linkSrcID":"0066","linkDestID":"0038","absoluteValue":-1},{"linkID":"0061","linkType":"+","postType":null,"linkSrcID":"0068","linkDestID":"0070","absoluteValue":-1},{"linkID":"0062","linkType":"AND","postType":null,"linkSrcID":"0102","linkDestID":"0071","absoluteValue":-1},{"linkID":"0063","linkType":"++","postType":null,"linkSrcID":"0004","linkDestID":"0069","absoluteValue":-1},{"linkID":"0064","linkType":"+","postType":null,"linkSrcID":"0033","linkDestID":"0073","absoluteValue":-1},{"linkID":"0065","linkType":"+","postType":null,"linkSrcID":"0033","linkDestID":"0034","absoluteValue":-1},{"linkID":"0066","linkType":"+","postType":null,"linkSrcID":"0033","linkDestID":"0035","absoluteValue":-1},{"linkID":"0067","linkType":"OR","postType":null,"linkSrcID":"0037","linkDestID":"0033","absoluteValue":-1},{"linkID":"0068","linkType":"OR","postType":null,"linkSrcID":"0036","linkDestID":"0033","absoluteValue":-1},{"linkID":"0069","linkType":"++","postType":null,"linkSrcID":"0072","linkDestID":"0060","absoluteValue":-1},{"linkID":"0070","linkType":"AND","postType":null,"linkSrcID":"0076","linkDestID":"0026","absoluteValue":-1},{"linkID":"0071","linkType":"AND","postType":null,"linkSrcID":"0075","linkDestID":"0026","absoluteValue":-1},{"linkID":"0072","linkType":"AND","postType":null,"linkSrcID":"0077","linkDestID":"0075","absoluteValue":-1},{"linkID":"0073","linkType":"AND","postType":null,"linkSrcID":"0074","linkDestID":"0075","absoluteValue":-1},{"linkID":"0074","linkType":"++","postType":null,"linkSrcID":"0078","linkDestID":"0077","absoluteValue":-1},{"linkID":"0075","linkType":"AND","postType":null,"linkSrcID":"0079","linkDestID":"0019","absoluteValue":-1},{"linkID":"0076","linkType":"AND","postType":null,"linkSrcID":"0044","linkDestID":"0019","absoluteValue":-1},{"linkID":"0077","linkType":"AND","postType":null,"linkSrcID":"0080","linkDestID":"0017","absoluteValue":-1},{"linkID":"0078","linkType":"AND","postType":null,"linkSrcID":"0081","linkDestID":"0021","absoluteValue":-1},{"linkID":"0079","linkType":"+","postType":null,"linkSrcID":"0073","linkDestID":"0083","absoluteValue":-1},{"linkID":"0080","linkType":"OR","postType":null,"linkSrcID":"0082","linkDestID":"0033","absoluteValue":-1},{"linkID":"0081","linkType":"++S","postType":null,"linkSrcID":"0033","linkDestID":"0084","absoluteValue":-1},{"linkID":"0082","linkType":"+","postType":null,"linkSrcID":"0084","linkDestID":"0034","absoluteValue":-1},{"linkID":"0083","linkType":"+","postType":null,"linkSrcID":"0084","linkDestID":"0035","absoluteValue":-1},{"linkID":"0084","linkType":"++","postType":null,"linkSrcID":"0033","linkDestID":"0083","absoluteValue":-1},{"linkID":"0085","linkType":"+","postType":null,"linkSrcID":"0085","linkDestID":"0037","absoluteValue":-1},{"linkID":"0086","linkType":"+","postType":null,"linkSrcID":"0065","linkDestID":"0085","absoluteValue":-1},{"linkID":"0087","linkType":"++","postType":null,"linkSrcID":"0086","linkDestID":"0037","absoluteValue":-1},{"linkID":"0088","linkType":"++","postType":null,"linkSrcID":"0115","linkDestID":"0036","absoluteValue":-1},{"linkID":"0089","linkType":"++","postType":null,"linkSrcID":"0087","linkDestID":"0082","absoluteValue":-1},{"linkID":"0090","linkType":"++S","postType":null,"linkSrcID":"0069","linkDestID":"0070","absoluteValue":-1},{"linkID":"0091","linkType":"--S","postType":null,"linkSrcID":"0054","linkDestID":"0092","absoluteValue":-1},{"linkID":"0092","linkType":"--S","postType":null,"linkSrcID":"0055","linkDestID":"0092","absoluteValue":-1},{"linkID":"0093","linkType":"AND","postType":null,"linkSrcID":"0052","linkDestID":"0095","absoluteValue":-1},{"linkID":"0094","linkType":"AND","postType":null,"linkSrcID":"0090","linkDestID":"0095","absoluteValue":-1},{"linkID":"0095","linkType":"++S","postType":null,"linkSrcID":"0097","linkDestID":"0028","absoluteValue":-1},{"linkID":"0096","linkType":"++S","postType":null,"linkSrcID":"0096","linkDestID":"0028","absoluteValue":-1},{"linkID":"0097","linkType":"AND","postType":null,"linkSrcID":"0044","linkDestID":"0096","absoluteValue":-1},{"linkID":"0098","linkType":"AND","postType":null,"linkSrcID":"0042","linkDestID":"0097","absoluteValue":-1},{"linkID":"0099","linkType":"AND","postType":null,"linkSrcID":"0050","linkDestID":"0097","absoluteValue":-1},{"linkID":"0100","linkType":"+","postType":null,"linkSrcID":"0038","linkDestID":"0098","absoluteValue":-1},{"linkID":"0101","linkType":"AND","postType":null,"linkSrcID":"0090","linkDestID":"0057","absoluteValue":-1},{"linkID":"0102","linkType":"AND","postType":null,"linkSrcID":"0119","linkDestID":"0095","absoluteValue":-1},{"linkID":"0103","linkType":"AND","postType":null,"linkSrcID":"0055","linkDestID":"0095","absoluteValue":-1},{"linkID":"0104","linkType":"AND","postType":null,"linkSrcID":"0056","linkDestID":"0095","absoluteValue":-1},{"linkID":"0105","linkType":"AND","postType":null,"linkSrcID":"0119","linkDestID":"0057","absoluteValue":-1},{"linkID":"0106","linkType":"AND","postType":null,"linkSrcID":"0105","linkDestID":"0103","absoluteValue":-1},{"linkID":"0107","linkType":"AND","postType":null,"linkSrcID":"0107","linkDestID":"0061","absoluteValue":-1},{"linkID":"0108","linkType":"++","postType":null,"linkSrcID":"0059","linkDestID":"0107","absoluteValue":-1},{"linkID":"0109","linkType":"AND","postType":null,"linkSrcID":"0110","linkDestID":"0001","absoluteValue":-1},{"linkID":"0110","linkType":"+","postType":null,"linkSrcID":"0000","linkDestID":"0040","absoluteValue":-1},{"linkID":"0111","linkType":"++","postType":null,"linkSrcID":"0004","linkDestID":"0113","absoluteValue":-1},{"linkID":"0112","linkType":"++","postType":null,"linkSrcID":"0113","linkDestID":"0040","absoluteValue":-1},{"linkID":"0113","linkType":"+S","postType":null,"linkSrcID":"0088","linkDestID":"0029","absoluteValue":-1},{"linkID":"0114","linkType":"+","postType":null,"linkSrcID":"0062","linkDestID":"0013","absoluteValue":-1},{"linkID":"0115","linkType":"++","postType":null,"linkSrcID":"0062","linkDestID":"0020","absoluteValue":-1},{"linkID":"0116","linkType":"+","postType":null,"linkSrcID":"0101","linkDestID":"0100","absoluteValue":-1},{"linkID":"0117","linkType":"AND","postType":null,"linkSrcID":"0101","linkDestID":"0041","absoluteValue":-1},{"linkID":"0118","linkType":"+","postType":null,"linkSrcID":"0064","linkDestID":"0100","absoluteValue":-1},{"linkID":"0119","linkType":"+","postType":null,"linkSrcID":"0065","linkDestID":"0100","absoluteValue":-1},{"linkID":"0120","linkType":"+","postType":null,"linkSrcID":"0077","linkDestID":"0013","absoluteValue":-1},{"linkID":"0121","linkType":"++","postType":null,"linkSrcID":"0108","linkDestID":"0013","absoluteValue":-1},{"linkID":"0122","linkType":"++S","postType":null,"linkSrcID":"0103","linkDestID":"0070","absoluteValue":-1},{"linkID":"0123","linkType":"+","postType":null,"linkSrcID":"0109","linkDestID":"0114","absoluteValue":-1},{"linkID":"0124","linkType":"++","postType":null,"linkSrcID":"0072","linkDestID":"0102","absoluteValue":-1},{"linkID":"0125","linkType":"AND","postType":null,"linkSrcID":"0114","linkDestID":"0071","absoluteValue":-1},{"linkID":"0126","linkType":"++D","postType":null,"linkSrcID":"0067","linkDestID":"0099","absoluteValue":-1},{"linkID":"0127","linkType":"++D","postType":null,"linkSrcID":"0112","linkDestID":"0099","absoluteValue":-1},{"linkID":"0128","linkType":"AND","postType":null,"linkSrcID":"0116","linkDestID":"0058","absoluteValue":-1},{"linkID":"0129","linkType":"NO","postType":"++","linkSrcID":"0067","linkDestID":"0116","absoluteValue":29},{"linkID":"0130","linkType":"NO","postType":"++","linkSrcID":"0112","linkDestID":"0116","absoluteValue":47},{"linkID":"0131","linkType":"--S","postType":null,"linkSrcID":"0094","linkDestID":"0008","absoluteValue":-1},{"linkID":"0132","linkType":"--S","postType":null,"linkSrcID":"0094","linkDestID":"0059","absoluteValue":-1},{"linkID":"0133","linkType":"--","postType":null,"linkSrcID":"0117","linkDestID":"0098","absoluteValue":-1},{"linkID":"0134","linkType":"--","postType":null,"linkSrcID":"0117","linkDestID":"0039","absoluteValue":-1},{"linkID":"0135","linkType":"++","postType":null,"linkSrcID":"0078","linkDestID":"0018","absoluteValue":-1},{"linkID":"0136","linkType":"++","postType":null,"linkSrcID":"0006","linkDestID":"0030","absoluteValue":-1},{"linkID":"0137","linkType":"OR","postType":null,"linkSrcID":"0118","linkDestID":"0009","absoluteValue":-1},{"linkID":"0138","linkType":"OR","postType":null,"linkSrcID":"0095","linkDestID":"0012","absoluteValue":-1},{"linkID":"0139","linkType":"OR","postType":null,"linkSrcID":"0057","linkDestID":"0012","absoluteValue":-1},{"linkID":"0140","linkType":"OR","postType":null,"linkSrcID":"0066","linkDestID":"0120","absoluteValue":-1},{"linkID":"0141","linkType":"OR","postType":null,"linkSrcID":"0117","linkDestID":"0120","absoluteValue":-1},{"linkID":"0142","linkType":"AND","postType":null,"linkSrcID":"0030","linkDestID":"0119","absoluteValue":-1},{"linkID":"0143","linkType":"AND","postType":null,"linkSrcID":"0120","linkDestID":"0119","absoluteValue":-1},{"linkID":"0144","linkType":"AND","postType":null,"linkSrcID":"0054","linkDestID":"0119","absoluteValue":-1},{"linkID":"0145","linkType":"AND","postType":null,"linkSrcID":"0056","linkDestID":"0121","absoluteValue":-1},{"linkID":"0146","linkType":"AND","postType":null,"linkSrcID":"0121","linkDestID":"0001","absoluteValue":-1},{"linkID":"0147","linkType":"AND","postType":null,"linkSrcID":"0122","linkDestID":"0001","absoluteValue":-1},{"linkID":"0148","linkType":"++","postType":null,"linkSrcID":"0122","linkDestID":"0091","absoluteValue":-1},{"linkID":"0149","linkType":"+S","postType":null,"linkSrcID":"0001","linkDestID":"0123","absoluteValue":-1},{"linkID":"0150","linkType":"+S","postType":null,"linkSrcID":"0070","linkDestID":"0123","absoluteValue":-1},{"linkID":"0151","linkType":"+S","postType":null,"linkSrcID":"0071","linkDestID":"0070","absoluteValue":-1},{"linkID":"0152","linkType":"++","postType":null,"linkSrcID":"0115","linkDestID":"0094","absoluteValue":-1},{"linkID":"0153","linkType":"NBD","postType":null,"linkSrcID":"0047","linkDestID":"0046","absoluteValue":39},{"linkID":"0155","linkType":"++S","postType":null,"linkSrcID":"0069","linkDestID":"0070","absoluteValue":-1},{"linkID":"0156","linkType":"--","postType":null,"linkSrcID":"0065","linkDestID":"0002","absoluteValue":-1},{"linkID":"0157","linkType":"-","postType":null,"linkSrcID":"0064","linkDestID":"0002","absoluteValue":-1},{"linkID":"0158","linkType":"+","postType":null,"linkSrcID":"0072","linkDestID":"0085","absoluteValue":-1},{"linkID":"0159","linkType":"++","postType":null,"linkSrcID":"0056","linkDestID":"0085","absoluteValue":-1},{"linkID":"0160","linkType":"AND","postType":null,"linkSrcID":"0104","linkDestID":"0121","absoluteValue":-1}],"constraints":[{"constraintType":"A","constraintSrcID":"0006","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":37},{"constraintType":"A","constraintSrcID":"0031","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":25},{"constraintType":"A","constraintSrcID":"0031","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":28},{"constraintType":"A","constraintSrcID":"0031","constraintSrcEB":"C","constraintDestID":null,"constraintDestEB":null,"absoluteValue":29},{"constraintType":"A","constraintSrcID":"0042","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":15},{"constraintType":"A","constraintSrcID":"0042","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":21},{"constraintType":"A","constraintSrcID":"0042","constraintSrcEB":"C","constraintDestID":null,"constraintDestEB":null,"absoluteValue":37},{"constraintType":"A","constraintSrcID":"0044","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":3},{"constraintType":"A","constraintSrcID":"0044","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":7},{"constraintType":"A","constraintSrcID":"0044","constraintSrcEB":"C","constraintDestID":null,"constraintDestEB":null,"absoluteValue":21},{"constraintType":"A","constraintSrcID":"0044","constraintSrcEB":"D","constraintDestID":null,"constraintDestEB":null,"absoluteValue":28},{"constraintType":"A","constraintSrcID":"0044","constraintSrcEB":"E","constraintDestID":null,"constraintDestEB":null,"absoluteValue":38},{"constraintType":"A","constraintSrcID":"0046","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":-1},{"constraintType":"A","constraintSrcID":"0047","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":-1},{"constraintType":"A","constraintSrcID":"0054","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":38},{"constraintType":"A","constraintSrcID":"0054","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":48},{"constraintType":"A","constraintSrcID":"0055","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":32},{"constraintType":"A","constraintSrcID":"0055","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":37},{"constraintType":"A","constraintSrcID":"0055","constraintSrcEB":"C","constraintDestID":null,"constraintDestEB":null,"absoluteValue":58},{"constraintType":"A","constraintSrcID":"0056","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":33},{"constraintType":"A","constraintSrcID":"0056","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":38},{"constraintType":"A","constraintSrcID":"0062","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":1},{"constraintType":"A","constraintSrcID":"0066","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":37},{"constraintType":"A","constraintSrcID":"0067","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":30},{"constraintType":"A","constraintSrcID":"0072","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":28},{"constraintType":"A","constraintSrcID":"0080","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":3},{"constraintType":"A","constraintSrcID":"0080","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":15},{"constraintType":"A","constraintSrcID":"0080","constraintSrcEB":"C","constraintDestID":null,"constraintDestEB":null,"absoluteValue":23},{"constraintType":"A","constraintSrcID":"0080","constraintSrcEB":"D","constraintDestID":null,"constraintDestEB":null,"absoluteValue":27},{"constraintType":"A","constraintSrcID":"0080","constraintSrcEB":"E","constraintDestID":null,"constraintDestEB":null,"absoluteValue":34},{"constraintType":"A","constraintSrcID":"0080","constraintSrcEB":"F","constraintDestID":null,"constraintDestEB":null,"absoluteValue":48},{"constraintType":"A","constraintSrcID":"0081","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":5},{"constraintType":"A","constraintSrcID":"0081","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":9},{"constraintType":"A","constraintSrcID":"0081","constraintSrcEB":"C","constraintDestID":null,"constraintDestEB":null,"absoluteValue":12},{"constraintType":"A","constraintSrcID":"0081","constraintSrcEB":"D","constraintDestID":null,"constraintDestEB":null,"absoluteValue":14},{"constraintType":"A","constraintSrcID":"0081","constraintSrcEB":"E","constraintDestID":null,"constraintDestEB":null,"absoluteValue":16},{"constraintType":"A","constraintSrcID":"0088","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":13},{"constraintType":"A","constraintSrcID":"0089","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":27},{"constraintType":"A","constraintSrcID":"0089","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":31},{"constraintType":"A","constraintSrcID":"0090","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":61},{"constraintType":"A","constraintSrcID":"0093","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":45},{"constraintType":"A","constraintSrcID":"0094","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":48},{"constraintType":"A","constraintSrcID":"0101","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":57},{"constraintType":"A","constraintSrcID":"0104","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":23},{"constraintType":"A","constraintSrcID":"0106","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":28},{"constraintType":"A","constraintSrcID":"0108","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":12},{"constraintType":"A","constraintSrcID":"0109","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":37},{"constraintType":"A","constraintSrcID":"0110","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":21},{"constraintType":"A","constraintSrcID":"0111","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":75},{"constraintType":"A","constraintSrcID":"0112","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":47},{"constraintType":"A","constraintSrcID":"0115","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":48},{"constraintType":"A","constraintSrcID":"0117","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":37},{"constraintType":"A","constraintSrcID":"0122","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":29},{"constraintType":"A","constraintSrcID":"0122","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":33},{"constraintType":"A","constraintSrcID":"0065","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":50},{"constraintType":"A","constraintSrcID":"0105","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":49},{"constraintType":"A","constraintSrcID":"0105","constraintSrcEB":"B","constraintDestID":null,"constraintDestEB":null,"absoluteValue":65}],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0000","absTime":"0","evaluationValue":"0000"},{"intentionID":"0001","absTime":"0","evaluationValue":"0000"},{"intentionID":"0002","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0003","absTime":"0","evaluationValue":"0011"},{"intentionID":"0004","absTime":"0","evaluationValue":"0000"},{"intentionID":"0005","absTime":"0","evaluationValue":"0000"},{"intentionID":"0006","absTime":"0","evaluationValue":"1100"},{"intentionID":"0007","absTime":"0","evaluationValue":"0011"},{"intentionID":"0008","absTime":"0","evaluationValue":"0000"},{"intentionID":"0009","absTime":"0","evaluationValue":"0000"},{"intentionID":"0010","absTime":"0","evaluationValue":"0000"},{"intentionID":"0011","absTime":"0","evaluationValue":"0000"},{"intentionID":"0012","absTime":"0","evaluationValue":"0000"},{"intentionID":"0013","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0014","absTime":"0","evaluationValue":"0000"},{"intentionID":"0015","absTime":"0","evaluationValue":"0000"},{"intentionID":"0016","absTime":"0","evaluationValue":"0000"},{"intentionID":"0017","absTime":"0","evaluationValue":"0000"},{"intentionID":"0018","absTime":"0","evaluationValue":"0000"},{"intentionID":"0019","absTime":"0","evaluationValue":"0000"},{"intentionID":"0020","absTime":"0","evaluationValue":"0000"},{"intentionID":"0021","absTime":"0","evaluationValue":"0000"},{"intentionID":"0022","absTime":"0","evaluationValue":"0000"},{"intentionID":"0023","absTime":"0","evaluationValue":"0000"},{"intentionID":"0024","absTime":"0","evaluationValue":"0000"},{"intentionID":"0025","absTime":"0","evaluationValue":"0000"},{"intentionID":"0026","absTime":"0","evaluationValue":"0000"},{"intentionID":"0027","absTime":"0","evaluationValue":"0011"},{"intentionID":"0028","absTime":"0","evaluationValue":"0000"},{"intentionID":"0029","absTime":"0","evaluationValue":"0000"},{"intentionID":"0030","absTime":"0","evaluationValue":"0000"},{"intentionID":"0031","absTime":"0","evaluationValue":"1100"},{"intentionID":"0032","absTime":"0","evaluationValue":"0000"},{"intentionID":"0033","absTime":"0","evaluationValue":"0000"},{"intentionID":"0034","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0035","absTime":"0","evaluationValue":"0000"},{"intentionID":"0036","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0037","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0038","absTime":"0","evaluationValue":"0000"},{"intentionID":"0039","absTime":"0","evaluationValue":"0000"},{"intentionID":"0040","absTime":"0","evaluationValue":"0000"},{"intentionID":"0041","absTime":"0","evaluationValue":"0000"},{"intentionID":"0042","absTime":"0","evaluationValue":"1100"},{"intentionID":"0043","absTime":"0","evaluationValue":"1100"},{"intentionID":"0044","absTime":"0","evaluationValue":"1100"},{"intentionID":"0045","absTime":"0","evaluationValue":"0000"},{"intentionID":"0046","absTime":"0","evaluationValue":"0000"},{"intentionID":"0047","absTime":"0","evaluationValue":"0000"},{"intentionID":"0048","absTime":"0","evaluationValue":"0000"},{"intentionID":"0049","absTime":"0","evaluationValue":"0000"},{"intentionID":"0050","absTime":"0","evaluationValue":"0000"},{"intentionID":"0051","absTime":"0","evaluationValue":"1100"},{"intentionID":"0052","absTime":"0","evaluationValue":"1100"},{"intentionID":"0053","absTime":"0","evaluationValue":"1100"},{"intentionID":"0054","absTime":"0","evaluationValue":"1100"},{"intentionID":"0055","absTime":"0","evaluationValue":"1100"},{"intentionID":"0056","absTime":"0","evaluationValue":"1100"},{"intentionID":"0057","absTime":"0","evaluationValue":"0000"},{"intentionID":"0058","absTime":"0","evaluationValue":"0000"},{"intentionID":"0059","absTime":"0","evaluationValue":"0000"},{"intentionID":"0060","absTime":"0","evaluationValue":"0000"},{"intentionID":"0061","absTime":"0","evaluationValue":"0000"},{"intentionID":"0062","absTime":"0","evaluationValue":"0000"},{"intentionID":"0063","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0064","absTime":"0","evaluationValue":"0011"},{"intentionID":"0065","absTime":"0","evaluationValue":"1100"},{"intentionID":"0066","absTime":"0","evaluationValue":"1100"},{"intentionID":"0067","absTime":"0","evaluationValue":"1100"},{"intentionID":"0068","absTime":"0","evaluationValue":"0011"},{"intentionID":"0069","absTime":"0","evaluationValue":"0000"},{"intentionID":"0070","absTime":"0","evaluationValue":"0000"},{"intentionID":"0071","absTime":"0","evaluationValue":"0000"},{"intentionID":"0072","absTime":"0","evaluationValue":"1100"},{"intentionID":"0073","absTime":"0","evaluationValue":"0000"},{"intentionID":"0074","absTime":"0","evaluationValue":"0000"},{"intentionID":"0075","absTime":"0","evaluationValue":"0000"},{"intentionID":"0076","absTime":"0","evaluationValue":"1100"},{"intentionID":"0077","absTime":"0","evaluationValue":"0000"},{"intentionID":"0078","absTime":"0","evaluationValue":"1100"},{"intentionID":"0079","absTime":"0","evaluationValue":"0011"},{"intentionID":"0080","absTime":"0","evaluationValue":"0000"},{"intentionID":"0081","absTime":"0","evaluationValue":"1100"},{"intentionID":"0082","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0083","absTime":"0","evaluationValue":"0000"},{"intentionID":"0084","absTime":"0","evaluationValue":"0000"},{"intentionID":"0085","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0086","absTime":"0","evaluationValue":"1100"},{"intentionID":"0087","absTime":"0","evaluationValue":"1100"},{"intentionID":"0088","absTime":"0","evaluationValue":"1100"},{"intentionID":"0089","absTime":"0","evaluationValue":"0000"},{"intentionID":"0090","absTime":"0","evaluationValue":"1100"},{"intentionID":"0091","absTime":"0","evaluationValue":"0000"},{"intentionID":"0092","absTime":"0","evaluationValue":"0011"},{"intentionID":"0093","absTime":"0","evaluationValue":"1100"},{"intentionID":"0094","absTime":"0","evaluationValue":"1100"},{"intentionID":"0095","absTime":"0","evaluationValue":"0000"},{"intentionID":"0096","absTime":"0","evaluationValue":"0000"},{"intentionID":"0097","absTime":"0","evaluationValue":"0000"},{"intentionID":"0098","absTime":"0","evaluationValue":"0000"},{"intentionID":"0099","absTime":"0","evaluationValue":"0000"},{"intentionID":"0100","absTime":"0","evaluationValue":"0000"},{"intentionID":"0101","absTime":"0","evaluationValue":"1100"},{"intentionID":"0102","absTime":"0","evaluationValue":"0000"},{"intentionID":"0103","absTime":"0","evaluationValue":"0000"},{"intentionID":"0104","absTime":"0","evaluationValue":"1100"},{"intentionID":"0105","absTime":"0","evaluationValue":"1100"},{"intentionID":"0106","absTime":"0","evaluationValue":"1100"},{"intentionID":"0107","absTime":"0","evaluationValue":"0000"},{"intentionID":"0108","absTime":"0","evaluationValue":"1100"},{"intentionID":"0109","absTime":"0","evaluationValue":"1100"},{"intentionID":"0110","absTime":"0","evaluationValue":"1100"},{"intentionID":"0111","absTime":"0","evaluationValue":"1100"},{"intentionID":"0112","absTime":"0","evaluationValue":"1100"},{"intentionID":"0113","absTime":"0","evaluationValue":"0000"},{"intentionID":"0114","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0115","absTime":"0","evaluationValue":"1100"},{"intentionID":"0116","absTime":"0","evaluationValue":"0000"},{"intentionID":"0117","absTime":"0","evaluationValue":"0011"},{"intentionID":"0118","absTime":"0","evaluationValue":"0000"},{"intentionID":"0119","absTime":"0","evaluationValue":"0000"},{"intentionID":"0120","absTime":"0","evaluationValue":"0000"},{"intentionID":"0121","absTime":"0","evaluationValue":"0000"},{"intentionID":"0122","absTime":"0","evaluationValue":"1100"},{"intentionID":"0123","absTime":"0","evaluationValue":"0000"}],"previousAnalysis":null}};
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

