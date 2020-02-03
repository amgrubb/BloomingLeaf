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
function makeDictIDToNodeID(mergedModel){
	var debugCtr = 0;
	for(var i = 0; i < mergedModel["graph"]["model1"]["cells"].length; i++){
		if(mergedModel["graph"]["model1"]["cells"][i]["type"] != "link"){
			var nodeId = mergedModel["graph"]["model1"]["cells"][i]["nodeID"];
			var graphId = mergedModel["graph"]["model1"]["cells"][i]["id"];
			var nodeName = mergedModel["graph"]["model1"]["cells"][i]["attrs"][".name"]["text"];
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
function initializeNodes(resultList, nodeSet, mergedModel){
	//assume each node no more than 2 lines with a size of width: 150 height: 100
	initializaGravityDict(resultList);
	makeDictIDToNodeID(mergedModel)
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

function initializeActors(resultList,actorSet, mergedModel){
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
}

function moveNodesToAbsPos(nodeSet,actorSet){
	for(var actor of actorSet){
		var intentionList = actor.intentionList; 
		for(var i = 0; i < intentionList.length; i++){
			var intentionId = intentionList[i];
			for(var node of nodeSet){
				if(node.nodeId == intentionId){
					var curX = node.nodeX; 
					var curY = node.nodeY; 
					node.nodeX = curX + actor.nodeX; 
					node.nodeY = curY + actor.nodeY;
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

function forceDirectedAlgorithm(resultList, mergedModel){
	var numIterations = 20;
	var numConstant = 0.2;
	var nodeSet = new Set();
	var actorSet = new Set();
	var nodeIdNodePosDict = new Object();
	initializeActors(resultList,actorSet, mergedModel);
	initializeNodes(resultList, nodeSet, mergedModel);
	for(var i = 0; i < numIterations; i++){
		adjustment(nodeSet, actorSet, numConstant,true);
		adjustment(nodeSet, actorSet, numConstant,false);
	}
	setCoordinatePositive(nodeSet);
	getSizeOfActor(nodeSet, actorSet);
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



	makeDictIDToNodeID(mergedModel);
	var graphicalResultList = forceDirectedAlgorithm(resultList,mergedModel);
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




