// /*The following part gives the merge result to the visual layout of the two models*/
// //repulsion coefficient dictionary: {Set of vertices that should be grouped together}:{Value of repulsion}
// //attraction coefficient dictionary: similar structure
// //default attraction on each links
// //default repulsion between two nodes
// //default layout: evenly distributed on the coordinate
// //E: repulsion coefficient
// //k: attraction coefficient
// var defaultCoefficientValue= 0.5; 
// var numVertices = 10; 
// var area = 1000*1000;
// var gravityDict = new Object();
// var resourcesGravity = 920; 
// var taskGravity = 680; 
// var softgoalGravity = 440;
// var goalGravity = 0;
 var IDNodeIDDict = new Object();
 var userPath = "/Users/wangyilin/Documents/GitHub/BloomingLeaf/leaf-ui/js/"
// var imaginaryActorIdList = []
// // var nodeIdNodePosDict = new Object();

// class Node{
//   constructor(name,x,y,connectionList,gravity,type, nodeId, actorId) {
//     this.nodeName1 = name;
//     this.nodeX1 = x; 
//     this.nodeY1 = y; 
//     this.connectedTo1 = connectionList;
//     this.forcesX1 = 0;
//     this.forcesY1 = 0;
//     this.gravity1 = gravity;
//     this.type1 = type;
//     this.nodeId1 = nodeId;
//     this.actorId = actorId;
//   }
//   set nodeX(newX){
//   	this.nodeX1 = newX; 
//   }
//   set nodeY(newY){
//   	this.nodeY1 = newY; 
//   }

//   // set nodeName(newName){
//   // 	this.nodeName = newName;
//   // }
//   get parent(){
//     return this.actorId; 
//   }
//   get nodeX(){
//   	return this.nodeX1; 
//   }

//   get actorId1(){
//   	return this.actorId;
//   }

//   get nodeY(){
//   	return this.nodeY1;
//   }

//   get nodeName(){
//   	return this.nodeName1;
//   }

//   get nodeId(){
//   	return this.nodeId1;
//   }

//   get type(){
//   	return this.type1; 
//   }

//   get forcesX(){
//   	return this.forcesX1;
//   }

//   get forcesY(){
//   	return this.forcesY1;
//   }

//   get connectedTo(){
//   	return this.connectedTo1;
//   }

//   isConnectdTo(anotherNode){
//   	if(this.connectedTo1.includes(anotherNode)){
//   		return true;
//   	}
//   	else{
//   		return false;
//   	}
//   }

//   set setForcesX(newForceX){
//   	this.forcesX1 = newForceX;
//   }

//   set setForcesY(newForceY){
//   	this.forcesY1 = newForceY;
//   }

//   get gravity(){
//   	return this.gravity1;
//   }
//   set gravity(gravity){
//   	this.gravity1 = gravity;
//   }

// }

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
// //TODO: change IDNodeIDDict


// function initializaGravityDict(resultList){
// 	var listOfIntentions = resultList[1];
// 	for(var i=0; i < listOfIntentions.length; i++){
// 		var curIntention = listOfIntentions[i];
// 		if(curIntention["nodeType"] == "basic.Resource"){
// 			gravityDict[curIntention["nodeID"]] = resourcesGravity;
// 		}
// 		else if(curIntention["nodeType"] == "basic.Task"){
// 			gravityDict[curIntention["nodeID"]] = taskGravity;
// 		}
// 		else if(curIntention["nodeType"] == "basic.Goal"){
// 			gravityDict[curIntention["nodeID"]] = goalGravity;
// 		}
// 		else if(curIntention["nodeType"] == "basic.Softgoal"){
// 			gravityDict[curIntention["nodeID"]] = softgoalGravity;
// 		}
// 	}

// }

// //add model1 and model2 to the parameters of this function
// function initializeNodes(resultList, nodeSet, model1, model2){
// 	//assume each node no more than 2 lines with a size of width: 150 height: 100
// 	initializaGravityDict(resultList);
// 	makeDictIDToNodeID(model1, model2)
// 	var width = 150; 
// 	var height = 100; 
// 	/*here construct a coordinate*/ 
// 	var listOfIntentions = resultList[1];
// 	var numIntentions = listOfIntentions.length; 
// 	var numXY = Math.ceil(Math.sqrt(numIntentions));
// 	var curXCount = 0;
// 	var curYCount = 0; 
// 	var listOfLinks = resultList[2];
// 	for(var i=0; i < listOfIntentions.length; i++){
// 		var intention = listOfIntentions[i];
// 		var nodeName = intention["nodeName"];
// 		var nodeType = intention["nodeType"];
// 		var connectionList = [];
// 		var nodeId = intention["nodeID"];
// 		//TODO: What to do if there is a node without actor
// 		var actorId = "****";
// 		if(typeof intention["nodeActorID"] !== 'undefined'){
// 			actorId = intention["nodeActorID"];
// 		}
// 		for(var k = 0; k < listOfLinks.length; k++){
// 			var link = listOfLinks[k];
// 			var src = link['linkSrcID'];
// 			var dest = link['linkDestID'];
// 			if(src == nodeId){
// 				var curConnection = new Object(); 
// 				curConnection["destId"] = dest; 
// 				curConnection["linkId"] = link["linkID"];
// 				curConnection["linkType"] = link["linkType"];
// 				connectionList.push(curConnection);
// 			}
// 			// else if(dest == nodeID){
// 			// 	connectionList.push(src);
// 			// }
// 		}
// 		//go to next y or stay in the same y
// 		if((curXCount + 1) <= numXY){
// 			curXCount += 1; 
// 			curYCount += 0; 
// 		}
// 		else{
// 			curXCount = 0;
// 			curYCount += 1;
// 		}
// 		var gravity = gravityDict[nodeId];
// 		var randomHeightCons = Math.random(); 
// 		var node = new Node(nodeName,(curXCount-1)*width,curYCount*height*randomHeightCons,connectionList,gravity, nodeType, nodeId, actorId);
// 		nodeSet.add(node);
// 	}
// 	//nodeName = nodeID
// 	//link
// 	//均匀分布
// 	//construct a coordinate system
// 	//TODO: construct node accordingly
// 	//construct clusterDictionary
// 	//constuct clusterDictionary
// 	//place each node evenly in the coordinate
// 	//var nodes = [node1, node2, node3...];
// }


// // function coefficientValue(clusterDictionary, nodeNamePair){
// // 	for(var key in clusterDictionary){
// // 		if(key.has(nodeNamePair)){
// // 			return clusterDictionary[key];
// // 		}
// // 	}
// // 	return defaultCoefficientValue; 
// // }


// /*following are actor-related code*/

// class Actor{
//   constructor(name,x,y,actorId, intentionList) {
//     this.nodeName1 = name;
//     this.nodeX1 = x; 
//     this.nodeY1 = y;
//     this.forcesX1 = 0;
//     this.forcesY1 = 0;
//     this.nodeId1 = actorId;
//     this.connCtrDic = new Object(); 
//     this.intentionList1 = intentionList;
//     this.sizeX1 = 150;
//     this.sizeY1 = 100;
//     // this toAddX1 = 0; 
//     // this toAddY1 = 0; 
//     this.acotrSum = 0; 
//   }
//   get sum(){
//   	return this.actorSum; 
//   }
//   set sum(newSum){
//   	this.actorSum = newSum;
//   }
//   get intentionList(){
//   	return this.intentionList1;
//   }
//   set nodeX(newX){
//   	this.nodeX1 = newX; 
//   }
//   // set toAddX(newToAddX){
//   // 	this.toAddX1 = newToAddX;
//   // }
//   // set toAddY(newToAddY){
//   // 	this.toAddY1 = newToAddY;
//   // }
//   set nodeY(newY){
//   	this.nodeY1 = newY; 
//   }
//   get nodeX(){
//   	return this.nodeX1; 
//   }
//   get nodeY(){
//   	return this.nodeY1;
//   }
//   get nodeName(){
//   	return this.nodeName1;
//   }
//   get nodeId(){
//   	return this.nodeId1;
//   }
//   get forcesX(){
//   	return this.forcesX1;
//   }
//   get forcesY(){
//   	return this.forcesY1;
//   }
//   set setForcesX(newForceX){
//   	this.forcesX1 = newForceX;
//   }
//   set setForcesY(newForceY){
//   	this.forcesY1 = newForceY;
//   }
//   set sizeX(newX){
//   	this.sizeX1 = newX;
//   }
//   set sizeY(newY){
//   	this.sizeY1 = newY;
//   }
//   get sizeX(){
//   	return this.sizeX1;
//   }
//   get sizeY(){
//   	return this.sizeY1;
//   }
//   incCtr(actorId){
//   	var curCount = this.connCtrDic[actorId]; 
//   	curCount = curCount + 1; 
//   	this.connCtrDic[actorId] = curCount; 
//   }
//   attrC(actorId){
//   	var ctr = this.connCtrDic[actorId]; 
//   	return ctr;
//   }
// }

// function initializeActors(resultList,actorSet, model1, model2){
// 	var actors = resultList[0];
// 	var width = 150; 
// 	var height = 100; 
// 	/*here construct a coordinate*/ 
// 	var listOfActors = resultList[0];
// 	var numActors = listOfActors.length; 
// 	var numXY = Math.ceil(Math.sqrt(numActors));
// 	var curXCount = 0;
// 	var curYCount = 0; 
// 	var listOfLinks = resultList[2];
// 	var actorIntentionDic = new Object();
// 	for(var i=0; i < numActors; i++){
// 		var actor = listOfActors[i];
// 		var actorName = actor["nodeName"];
// 		var actorID = actor["nodeID"];

// 		var intentionList = [];
// 		for(var l = 0; l < actor["intentionIDs"].length; l++){
// 			if(! intentionList.includes(actor["intentionIDs"][l])){
// 				intentionList.push(actor["intentionIDs"][l])
// 			}
// 		}

// 		actorIntentionDic[actorID] = [];
// 		for(var j = 0; j < actor["intentionIDs"].length; j++){
// 			var intentions = actor["intentionIDs"];
// 			for(var k = 0; k < intentions.length; k++){
// 				actorIntentionDic[actorID].push(intentions[k]); 
// 			}
// 		}
// 		//go to next y or stay in the same y
// 		if((curXCount + 1) <= numXY){
// 			curXCount += 1; 
// 			curYCount += 0; 
// 		}
// 		else{
// 			curXCount = 0;
// 			curYCount += 1;
// 		}
// 		var randomHeightCons = Math.random(); 
// 		var actor = new Actor(actorName,(curXCount-1)*width, curYCount*height*randomHeightCons, actorID, intentionList);
// 		actorSet.add(actor);
// 	}
// 	for(var link in listOfLinks){
// 		var src = link['linkSrcID'];
// 		var dest = link['linkDestID'];
// 		var srcActor;
// 		var destActor;
// 		for(var key in actorIntentionDic){
// 			var curList = actorIntentionDic[key]; 
// 			for(var l = 0; l < curList.length; l++){
// 				if(curList[l] == src){
// 					srcActor = key;
// 				}
// 				if(curList[l] == dest){
// 					destActor = key;
// 				}
// 			}
// 		}
// 	}
// 	//initialize connectionCtrDic
// 	for(var actor of Array.from(actorSet).reverse()){
// 		//add 1 to src
// 		if(src == actor.nodeId){
// 			actor.incCtr(destActor);
// 		}
// 		//add 1 to dest
// 		if(dest == actor.nodeId){
// 			actor.incCtr(srcActor);
// 		}
// 	}
// 	return [curXCount,curYCount];
// }

// // //Continue on here!!!!!
// // function avoidCollision(curActor, actorList){
// // 	for(var actor of actorList){
// // 		if(actor.nodeName != curActor.nodeName){
// // 			var cCur = [curActor.nodeX + 0.5 * curActor.sizeX, curActor.nodeY + 0.5 * curActor.sizeY]; 
// // 			var cAct = [actor.nodeX + 0.5 * actor.sizeX, actor.nodeY + 0.5 * actor.sizeY]
// // 			var maxXLength = Math.max(actor.sizeX, curActor.sizeX);
// // 			var maxYLength = Math.max(actor.sizeY, curActor.sizeY);
// // 			var maxLength = Math.max(maxXLength, maxYLength);
// // 			//console.log(maxLength);
// // 			var distance = Math.sqrt((cCur[0] - cAct[0])**2 + (cCur[1] - cAct[1])**2)
// // 			if(distance < maxLength){
// // 				var xDiff = cCur[0] - cAct[0];
// // 				var yDiff = cCur[1] - cAct[1];
// // 				//console.log("xDiff: " + xDiff);
// // 				//console.log("yDiff: " + yDiff);
// // 				var ratio = maxLength/distance; 
// // 				var scaledXDiff = ratio * xDiff; 
// // 				var scaledYDiff = ratio * yDiff; 
// // 				//console.log("To move");
// // 				//console.log(scaledXDiff - xDiff);
// // 				//console.log(scaledYDiff - yDiff);
// // 				curActor.nodeX += scaledXDiff - xDiff; 
// // 				curActor.nodeY += scaledYDiff - yDiff;
// // 			}
// // 		}
// // 	}
// // }

// //TODO: change here!!!!!!
// function calculateActorPosWithRec(actorSet){
// 	var actorsXSorted = sortActorX(actorSet);
// 	var actorsYSorted = sortActorY(actorSet);
// 	var curX = 0; 
// 	var curY = 0; 
// 	for(var i = 0; i < actorsXSorted.length; i++){
// 		var curNode = actorsXSorted[i];
// 		curNode.nodeX = curNode.nodeX + curX;
// 		curX += curNode.sizeX;
// 	}
// 	for(var i = 0; i < actorsYSorted.length; i++){
// 		var curNode = actorsYSorted[i];
// 		curNode.nodeY = curNode.nodeY + curY;
// 		curY += curNode.sizeY;
// 	}

// }

// function sortActorX(actorSet){
// 	var actorsXSorted = []; 
// 	for(var actor of actorSet){
// 		actorsXSorted.push(actor);
// 	}
// 	actorsXSorted.sort(function(a,b){return a.nodeX - b.nodeX});
// 	return actorsXSorted; 
// }

// function sortActorY(actorSet){
// 	var actorsYSorted = []; 
// 	for(var actor of actorSet){
// 		actorsYSorted.push(actor);
// 	}
// 	actorsYSorted.sort(function(a,b){return a.nodeY - b.nodeY});
// 	return actorsYSorted; 
// }


// /**************changed here****/
// function moveNodesToAbsPos(nodeSet,actorSet){
// 		// for(var actor of actorSet){
// 		// 	var intentionList = actor.intentionList;
// 		// 	for(var i = 0; i < intentionList.length; i++){
// 		// 		var intentionId = intentionList[i];
// 		// 		for(var node of nodeSet){
// 		// 			if(node.nodeId == intentionId){
// 		// 				console.log("?");
// 		// 				console.log(node.nodeName);
// 		// 				console.log(actor.nodeId);
// 		// 				console.log("1");
// 		// 				console.log(node.nodeY);
// 		// 				var curX = node.nodeX; 
// 		// 				var curY = node.nodeY; 
// 		// 				node.nodeX = curX + actor.nodeX + 150; 
// 		// 				node.nodeY = curY + actor.nodeY + 100;
// 		// 				console.log("2");
// 		// 				console.log(node.nodeY);
// 		// 			}
// 		// 		}
// 		// 	}
// 		// }

// 		for(var node of nodeSet){
// 			var actorId = node.parent; 
// 			for(var actor of actorSet){
// 				if(actor.nodeId === actorId){
// 					var curX = node.nodeX; 
// 					var curY = node.nodeY; 
// 					node.nodeX = curX + actor.nodeX + 150; 
// 					node.nodeY = curY + actor.nodeY + 100; 
// 				}
// 			}
// 		}
// }
// /*end of the actor-related code*/

// function changeNodePos(node, newX, newY){
// 	node.nodeX = newX; 
// 	node.nodeY = newY;
// }


// function setAttractionSum(curNode, nodeSet, actorSet, isActor){
// 	if(! isActor){
// 		var curName = curNode.nodeName;
// 		var elemSet = new Set(); 
// 		var tempElemSet = new Set();
// 		//clean up the value for attraction for each iteration
// 		// curNode.setForcesX = 0; 
// 		// curNode.setForcesY = 0;
// 		for(var node of nodeSet){
// 			if(node.actorId1 === curNode.actorId1){
// 				tempElemSet.add(node);
// 			}
// 		}
// 		for(var node of tempElemSet){
// 			if(curNode.isConnectdTo(node)){
// 				elemSet.add(node);
// 			}
// 		}
// 		for(var node of Array.from(elemSet).reverse()){
// 			var nodeName = node.nodeName;
// 			if(curName != nodeName){
// 				var forces = attraction(curNode, node, isActor);
// 				var forceX = 5 * forces[0]; 
// 				var forceY = 5 * forces[1];
// 				var curXForce = curNode.forcesX1; 
// 				curXForce += forceX; 
// 				curNode.setForcesX = curXForce;
// 				var curYForce = curNode.forcesY1; 
// 				curYForce += forceY; 
// 				curNode.setForcesY = curYForce; 
// 			}
// 		}
// 		for(var node of Array.from(tempElemSet).reverse()){
// 			var nodeName = node.nodeName;
// 			if(curName != nodeName){
// 				var forces = attraction(curNode, node, isActor);
// 				var forceX = forces[0]; 
// 				var forceY = forces[1];
// 				var curXForce = curNode.forcesX1; 
// 				curXForce += forceX; 
// 				curNode.setForcesX = curXForce;
// 				var curYForce = curNode.forcesY1; 
// 				curYForce += forceY; 
// 				curNode.setForcesY = curYForce; 
// 			}
// 		}
// 	}
// 	else{
// 		var curName = curNode.nodeName;
// 		//clean up the value for attraction for each iteration
// 		// curNode.setForcesX = 0; 
// 		// curNode.setForcesY = 0;
// 		for(var actor of Array.from(actorSet).reverse()){
// 			var actorName = actor.nodeName;
// 			if(curName != actorName){
// 				var forces = attraction(curNode, actor, isActor);
// 				var forceX = forces[0]; 
// 				var forceY = forces[1];
// 				var curXForce = curNode.forcesX; 
// 				curXForce += forceX; 
// 				curNode.setForcesX = curXForce;
// 				var curYForce = curNode.forcesY; 
// 				curYForce += forceY; 
// 				curNode.setForcesY = curYForce;
// 			}
// 		}
// 	}
// }

// function setRepulsionSum(curNode, nodeSet, actorSet, isActor){
// 	if(! isActor){
// 		var curName = curNode.nodeName;
// 		//clean up the value for attraction for each iteration
// 		var elemSet = new Set();
// 		// curNode.setForcesX = 0; 
// 		// curNode.setForcesY = 0; 
// 		for(var node of nodeSet){
// 			if(node.actorId1 === curNode.actorId1){
// 				elemSet.add(node);
// 			}
// 		}
// 		for(var node of Array.from(elemSet).reverse()){
// 			var nodeName = node.nodeName;
// 			if(curName !== nodeName){
// 				var forces = repulsion(curNode, node, isActor);
// 				var forceX = forces[0]; 
// 				var forceY = forces[1];
// 				var curXForce = curNode.forcesX; 
// 				curXForce += forceX; 
// 				curNode.setForcesX = curXForce;
// 				var curYForce = curNode.forcesY; 
// 				curYForce += forceY; 
// 				curNode.setForcesY = curYForce; 
// 			}
// 		}
// 	}
// 	else{
// 		var curName = curNode.nodeName;
// 		//clean up the value for attraction for each iteration
// 		// curNode.setForcesX = 0; 
// 		// curNode.setForcesY = 0; 
// 		for(var actor of Array.from(actorSet).reverse()){
// 			var nodeName = actor.nodeName;
// 			if(curName != nodeName){
// 				var forces = repulsion(curNode, actor, isActor);
// 				var forceX = forces[0]; 
// 				var forceY = forces[1];
// 				var curXForce = curNode.forcesX; 
// 				curXForce += forceX; 
// 				curNode.setForcesX = curXForce;
// 				var curYForce = curNode.forcesY; 
// 				curYForce += forceY; 
// 				curNode.setForcesY = curYForce; 
// 			}
// 		}
// 	}
// }

// function attraction(node1, node2, isActor){
// 	if(! isActor){
// 		var firstNumber = Math.pow((node2.nodeX - node1.nodeX),2); 
// 		var secondNumber = Math.pow((node1.nodeY - node2.nodeY),2);
// 		var d = Math.sqrt(firstNumber + secondNumber);
// 		var k = defaultCoefficientValue;
// 		var coefficient = k * Math.sqrt(area/numVertices); 
// 		var forceSum = 6 * Math.pow(d,2)/(100*coefficient);
// 		var dx = Math.sqrt(firstNumber); 
// 		var dy = Math.sqrt(secondNumber);
// 		var cos = dx/d;
// 		var sin = dy/d;
// 		var forceX = cos*forceSum; 
// 		var forceY = sin*forceSum;
// 		//direction
// 		if(node2.nodeX < node1.nodeX){
// 			forceX = -forceX;
// 		}
// 		if(node2.nodeY < node1.nodeY){
// 			forceY = -forceY;
// 		}
// 		var toReturn = [forceX, forceY];
// 		return toReturn; 
// 	}
// 	else{
// 		var firstNumber = Math.pow((node2.nodeX - node1.nodeX),2); 
// 		var secondNumber = Math.pow((node1.nodeY - node2.nodeY),2);
// 		var d = Math.sqrt(firstNumber + secondNumber);
// 		var cToMultiply = 2;
// 		var connectionCtr = node1.attrC(node2.nodeId);
// 		if(typeof connectionCtr === 'undefined'){
// 			connectionCtr = 0; 
// 		}
// 		var k = (1/(connectionCtr + 1)) * cToMultiply;
// 		var coefficient = k * Math.sqrt(area/numVertices); 
// 		var forceSum = Math.pow(d,2)/(Math.pow(coefficient,2));
// 		var dx = Math.sqrt(firstNumber); 
// 		var dy = Math.sqrt(secondNumber);
// 		var cos = dx/d;
// 		var sin = dy/d;
// 		var forceX = cos*forceSum; 
// 		var forceY = sin*forceSum;
// 		//direction
// 		if(node2.nodeX < node1.nodeX){
// 			forceX = -forceX;
// 		}
// 		if(node2.nodeY < node1.nodeY){
// 			forceY = -forceY;
// 		}
// 		var toReturn = [forceX, forceY];
// 		return toReturn; 
// 	}
// }

// function repulsion(node1, node2, isActor){
// 	if(! isActor){
// 		var firstNumber = Math.pow((node2.nodeX - node1.nodeX),2); 
// 		var secondNumber = Math.pow((node1.nodeY - node2.nodeY),2);
// 		var d = Math.sqrt(firstNumber + secondNumber);
// 		var k = defaultCoefficientValue;
// 		//coefficeintValue(clusterDictionary, [node1.nodeName, node2.nodeName]); 
// 		var coefficient = k* Math.sqrt(area/numVertices); 
// 		//* Math.sqrt(area/numVertices);
// 		//Think about the follwoing
// 		//TODOTODO: changed here
// 		var forceSum = 3*Math.pow(coefficient,2)/d;
// 		var dx = Math.sqrt(firstNumber); 
// 		var dy = Math.sqrt(secondNumber);
// 		var cos = dx/d;
// 		var sin = dy/d;
// 		var forceX = cos*forceSum; 
// 		var forceY = sin*forceSum;
// 		//direction
// 		if(node2.nodeX > node1.nodeX){
// 			forceX = -forceX;
// 		}
// 		if(node2.nodeY > node1.nodeY){
// 			forceY = -forceY;
// 		}
// 		var toReturn = [forceX, forceY];
// 		return toReturn;
// 	}
// 	else{
// 		var firstNumber = Math.pow((node2.nodeX - node1.nodeX),2); 
// 		var secondNumber = Math.pow((node1.nodeY - node2.nodeY),2);
// 		var d = Math.sqrt(firstNumber + secondNumber);
// 		var k = defaultCoefficientValue;
// 		//coefficeintValue(clusterDictionary, [node1.nodeName, node2.nodeName]); 
// 		var coefficient = k * Math.sqrt(area/numVertices);
// 		//TODOTODO: changed here
// 		var forceSum = Math.pow(coefficient,2)/(10*d);
// 		var dx = Math.sqrt(firstNumber); 
// 		var dy = Math.sqrt(secondNumber);
// 		var cos = dx/d;
// 		var sin = dy/d;
// 		var forceX = cos*forceSum; 
// 		var forceY = sin*forceSum;
// 		//direction
// 		if(node2.nodeX > node1.nodeX){
// 			forceX = -forceX;
// 		}
// 		if(node2.nodeY > node1.nodeY){
// 			forceY = -forceY;
// 		}
// 		var toReturn = [forceX, forceY];
// 		return toReturn;
// 	}
// }

// /*Should be called after initialization(initial position should be assigned in the
// initializeNodes)*/
// function adjustment(nodeSet, actorSet, moveConstant, isActor){
// 	if(! isActor){
// 		for(var node of Array.from(nodeSet).reverse()){
// 			node.setForcesX = 0; 
// 			node.setForcesY = 0;
// 			setAttractionSum(node,nodeSet, actorSet, isActor); 
// 			setRepulsionSum(node,nodeSet, actorSet, isActor);
// 			var moveX = moveConstant * node.forcesX1;
// 			var moveY = moveConstant * (node.forcesY1 + node.gravity);
// 			node.nodeX = node.nodeX + moveX;
// 			node.nodeY = node.nodeY + moveY;
// 		}
// 	}
// 	else{
// 		for(var actor of Array.from(actorSet).reverse()){
// 			actor.setForcesX = 0; 
// 			actor.setForcesY = 0;
// 			setAttractionSum(actor,nodeSet, actorSet, isActor); 
// 			setRepulsionSum(actor,nodeSet, actorSet, isActor);
// 			var moveX = moveConstant * actor.forcesX;
// 			var moveY = moveConstant * actor.forcesY;
// 			actor.nodeX = actor.nodeX1 + moveX; 
// 			actor.nodeY = actor.nodeY1 + moveY;
// 		}
// 	}
// }

// function listForGraphicalActors(actorSet, curZ){
//   var nodes = [];
//   var zCounter = curZ;
//   for(var node of actorSet){
// 	var actorId = node.nodeId;
// 	if(! actorId.includes("-")){
// 	    var newNode = new Object();
// 	    newNode["type"] = "basic.Actor";
// 	    var newSize = new Object();
// 	    newSize["width"] = node.sizeX + 200; 
// 	    newSize["height"] = node.sizeY + 200; 
// 	    newNode["size"] = newSize;
// 	    var newPosition = new Object();
// 	    newPosition["x"] = node.nodeX;
// 	    newPosition["y"] = node.nodeY;
// 	    newNode["position"] = newPosition;
// 	    //how to deal with angle? 
// 	    //TODO: fix this later
// 	    newNode["angle"] = 0; 
// 	    //Changed the hash code for ids into the node ids
// 	    newNode["id"] = node.nodeId;
// 	    newNode["z"] = zCounter;
// 	    zCounter ++;
// 	    newNode["nodeID"] = node.nodeId;
// 	    newAttrs = new Object();
// 	    newName = new Object();
// 	    newName["text"] = node.nodeName;
// 	    newAttrs[".name"] = newName;
// 	    newLabel = new Object();
// 	    //TODO: The label for the actor is currently hard coded here
// 	    newLabel["cx"]= ((node.sizeX + 200)/4);
// 	    newLabel["cy"] = ((node.sizeY + 200)/10);
// 	    newAttrs[".label"] = newLabel;
// 	    newNode["attrs"] = newAttrs;

// 	    newNode["embeds"] = [];

// 	    for(var i = 0; i < node.intentionList.length; i++){
// 	    	if(! newNode["embeds"].includes(node.intentionList[i])){
// 	      		newNode["embeds"].push(node.intentionList[i]);
// 	      	}
// 	    }

// 	    nodes.push(newNode);
// 	}
//   }
//   return nodes;
// }

// function listForGraphicalNodes(nodeSet, curZ){
// 	var nodes = [];
// 	var zCounter = curZ;
// 	for(var node of nodeSet){
// 		var newNode = new Object();
// 		newNode["type"] = node.type;
// 		var newSize = new Object();
// 		newSize["width"] = 150; 
// 	    newSize["height"] = 100; 
// 		newNode["size"] = newSize;
// 		var newPosition = new Object();
// 		newPosition["x"] = node.nodeX;
// 		newPosition["y"] = node.nodeY;
// 		newNode["position"] = newPosition;
// 		//how to deal with angle? 
// 		//TODO: fix this later
// 		newNode["angle"] = 0; 
// 		//Changed the hash code for ids into the node ids
// 		newNode["id"] = node.nodeId;
// 		newNode["z"] = zCounter;
// 		zCounter ++;
// 		newNode["nodeID"] = node.nodeId;
// 		newAttrs = new Object();
// 		newSatValues = new Object();
// 		//TODO: fix the following later!
// 		//Incorrectly hard coded here!
// 		newSatValues["text"] = "";
// 		newAttrs[ ".satvalue"] = newSatValues; 
// 		newName = new Object();
// 		newName["text"] = node.nodeName;
// 		newAttrs[".name"] = newName;
// 		newLabel = new Object();
// 		//TODO: currently all cx and cy are hard coded; changes are needed here
// 		newLabel["cx"]= 32;
// 		newLabel["cy"] = 10;
// 		newAttrs[".label"] = newLabel;
// 		newNode["attrs"] = newAttrs;
// 		var isFreeNode = false; 
// 		for(var l = 0; l < imaginaryActorIdList.length; l ++){
// 			if(node.nodeId == imaginaryActorIdList[l]){
// 				isFreeNode = true;
// 			}
// 		}
// 		if((typeof node.parent !== 'undefined')&&(node.parent !== "****")){
// 			if(! isFreeNode){
// 				newNode["parent"] = node.parent;
// 			}
// 		}
// 		nodes.push(newNode);
// 	}
// 	return nodes; 
// }

// function setNodeIdNodePosDict(nodeIdNodePosDict,nodeSet){
// 	for(var node of nodeSet){
// 		var newPos = new Object(); 
// 		newPos["x"] = node.nodeX; 
// 		newPos["y"] = node.nodeY;
// 		nodeIdNodePosDict[node.nodeId] = newPos;
// 	}
// 	for(var node of nodeSet){
// 		nodeIdNodePosDict[node.nodeX, node.nodeY] = node.nodeId;
// 	}
// }

// function listForGraphicalLinks(nodeSet, zToStartFrom,nodeIdNodePosDict){
// 	var links = [];
// 	var linkList = [];
// 	for(var node of nodeSet){
// 		var connectionList = node.connectedTo;
// 		for(var k = 0; k < connectionList.length; k++){
// 			var connection = connectionList[k];
// 			var newTarget = new Object();
// 			if(!(typeof nodeIdNodePosDict[connection["destId"]] === "undefined")){
// 				newTarget["x"] = nodeIdNodePosDict[connection["destId"]]["x"];
// 				newTarget["y"] = nodeIdNodePosDict[connection["destId"]]["y"]; 
// 				newTarget["linkID"] = connection["linkId"];
// 				newTarget["linkType"] = connection["linkType"];
// 			//TODO: continue here
// 				newTarget["linkSrcID"]= node.nodeId;
// 				linkList.push(newTarget);
// 			}
// 		}
// 	}

// 	for(var i = 0; i < linkList.length; i++){
// 		var link = linkList[i];
// 		var oneLinkGraphical = new Object(); 
// 		oneLinkGraphical["type"] = "link"; 
// 		var newSource = new Object(); 
// 		//TODO: Change here
// 		var sourceId = link["linkSrcID"];
// 		newSource["id"] = sourceId.toString(); 
// 		oneLinkGraphical["source"] = newSource; 
// 		var newTarget = new Object();
// 		var nodeId = nodeIdNodePosDict[link["x"],link["y"]];
// 		newTarget["id"] = nodeId.toString(10);
// 		oneLinkGraphical["target"] = newTarget;
// 		var newLabels = new Object(); 
// 		newLabels["position"] = 0.5;
// 		var newAttrs = new Object();
// 		var text = link["linkType"];
// 		var text1 = new Object();
// 		text1["text"] = text.toLowerCase();
// 		newAttrs["text"] = text1;
// 		newLabels["attrs"] = newAttrs;
// 		var labelList = [];
// 		labelList.push(newLabels);
// 		oneLinkGraphical["labels"] = labelList;
// 		oneLinkGraphical["linkID"] = link["linkID"];

// 		var newAttrs1 = new Object();
// 		var newConnection = new Object();
// 		newConnection["stroke"] = "#000000";
// 		newAttrs1[".connection"] = newConnection;
// 		var newMarkerSource = new Object();
// 		newMarkerSource["d"] = "0";
// 		newAttrs1[".marker-source"] = newMarkerSource;
// 		var newMarkerTarget = new Object();
// 		newMarkerTarget["stroke"] = "#000000";
// 		newMarkerTarget["d"] = "M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5";
// 		newAttrs1[".marker-target"] = newMarkerTarget;
// 		oneLinkGraphical["attrs"] = newAttrs1;
// 		oneLinkGraphical["z"] = zToStartFrom; 
// 		zToStartFrom ++;
// 		links.push(oneLinkGraphical);
// 	}
// 	return links;
// }

// function setCoordinatePositive(nodeSet){
// 	var maxNXDict = new Object();
// 	var maxNYDict = new Object();
// 	for(var node of nodeSet){
// 		var curX = node.nodeX;
// 		var curY = node.nodeY;
// 		var curActor = node.actorId1;
// 		if(typeof maxNXDict[curActor] === 'undefined'){
// 			maxNXDict[curActor] = 0;
// 		}
// 		if(typeof maxNYDict[curActor] === 'undefined'){
// 			maxNYDict[curActor] = 0;
// 		}

// 		if(curX < 0){
// 			if(maxNXDict[curActor] > curX){
// 				maxNXDict[curActor] = curX;
// 			}
// 		}
// 		if(curY < 0){
// 			if(maxNYDict[curActor] > curY){
// 				maxNYDict[curActor] = curY;
// 			}
// 		}
// 	}

// 	for(var node of nodeSet){
// 		var curId = node.actorId1;
// 		node.nodeX = node.nodeX - maxNXDict[curId];
// 		node.nodeY = node.nodeY - maxNYDict[curId];
// 	}

// }

// function minimizeCoordinate(nodeSet){
// 	var minXDict = new Object();
// 	var minYDict = new Object();
// 	for(var node of nodeSet){
// 		var curX = node.nodeX;
// 		var curY = node.nodeY;
// 		var curActor = node.actorId1;
// 		if(typeof minXDict[curActor] === 'undefined'){
// 			minXDict[curActor] = curX;
// 		}
// 		if(typeof minYDict[curActor] === 'undefined'){
// 			minYDict[curActor] = curY;
// 		}

// 		if(minXDict[curActor] > curX){
// 			minXDict[curActor] = curX;
// 		}
// 		if(minYDict[curActor] > curY){
// 			minYDict[curActor] = curY;
// 		}
// 	}


// 	for(var node of nodeSet){
// 		var curId = node.actorId1;
// 		if(minXDict[curId] > 0){
// 			node.nodeX = node.nodeX - minXDict[curId];
// 		}
// 		if(minYDict[curId] > 0){
// 			node.nodeY = node.nodeY - minYDict[curId];
// 		}
// 	}
// }

// function getSizeOfActor(nodeSet, actorSet){
// 	var maxPXDict = new Object();
// 	var maxPYDict = new Object();
// 	var minPXDict = new Object(); 
// 	var minPYDict = new Object();
// 	for(var node of nodeSet){
// 		var curX = node.nodeX;
// 		var curY = node.nodeY;
// 		var curActor = node.parent;
// 		if(typeof maxPXDict[curActor] === 'undefined'){
// 			maxPXDict[curActor] = 150;
// 		}
// 		if(typeof maxPYDict[curActor] === 'undefined'){
// 			maxPYDict[curActor] = 100;
// 		}
// 		if(typeof minPXDict[curActor] === 'undefined'){
// 			minPXDict[curActor] = 0;
// 		}
// 		if(typeof minPYDict[curActor] === 'undefined'){
// 			minPYDict[curActor] = 0;
// 		}

// 		if(maxPXDict[curActor] < curX){
// 			maxPXDict[curActor] = curX;
// 		}
// 		if(maxPYDict[curActor] < curY){
// 			maxPYDict[curActor] = curY;
// 		}
// 		if(minPXDict[curActor] > curX){
// 			minPXDict[curActor] = curX;
// 		}
// 		if(minPYDict[curActor] > curY){
// 			minPYDict[curActor] = curY;
// 		}
// 	}
// 	for(var actor of actorSet){
// 		var actorId = actor.nodeId;
// 		if(typeof maxPXDict[actorId] === 'undefined'){
// 			maxPXDict[actorId] = 150;
// 		}
// 		if(typeof maxPYDict[actorId] === 'undefined'){
// 			 maxPYDict[actorId] = 100; 
// 		}
// 		if(typeof minPXDict[actorId] === 'undefined'){
// 			minPXDict[actorId] = 0;
// 		}
// 		if(typeof minPYDict[actorId] === 'undefined'){
// 			 minPYDict[actorId] = 0; 
// 		}
// 		var x = maxPXDict[actorId] - minPXDict[actorId] + 300; 
// 		var y = maxPYDict[actorId] - minPYDict[actorId] + 200;
// 		actor.sizeX = x;
// 		actor.sizeY = y;
// 	}
// }

// //Those fake actors have id begin with "-"
// function initializeActorForFreeNodes(actorSet, nodeSet, model1, model2, curXCount, curYCount){
// 	var width = 150; 
// 	var height = 100;
// 	for(var node of nodeSet){
// 		if(node.parent == "-"){
// 			var i = 1; 
// 			if(curXCount == 0){
// 				i = 0;
// 			}
// 			var actorForCurFreeNode = new Actor(node.nodeName,(curXCount - i)*width, curYCount*height, "-"+node.nodeId, [node.nodeId]);
// 			actorSet.add(actorForCurFreeNode);
// 			imaginaryActorIdList.push(actorForCurFreeNode.nodeId);
// 			curXCount += 1; 
// 			curYCount += 1;
// 		}
// 	}
// }


// function forceDirectedAlgorithm(resultList, model1, model2){
// 	var numIterations = 120;
// 	var numConstant = 0.02;
// 	var nodeSet = new Set();
// 	var actorSet = new Set();
// 	var nodeIdNodePosDict = new Object();
// 	var xyCounts = initializeActors(resultList,actorSet, model1, model2);
// 	initializeNodes(resultList, nodeSet, model1, model2);
// 	var curXCount = xyCounts[0]; 
// 	var curYCount = xyCounts[1];
// 	if(resultList[0].length != 0){
// 		initializeActorForFreeNodes(actorSet,nodeSet,model1, model2, curXCount, curYCount);
// 	}
// 	for(var i = 0; i < numIterations; i++){
// 		adjustment(nodeSet, actorSet, numConstant,true);
// 		adjustment(nodeSet, actorSet, numConstant,false);
// 	}
// 	setCoordinatePositive(nodeSet);
// 	minimizeCoordinate(nodeSet);
// 	getSizeOfActor(nodeSet, actorSet);
// 	calculateActorPosWithRec(actorSet);
// 	moveNodesToAbsPos(nodeSet,actorSet);
// 	setNodeIdNodePosDict(nodeIdNodePosDict, nodeSet);
// 	var curZ = 1;
// 	var listForGraphicalActors1 = listForGraphicalActors(actorSet, curZ); 
// 	curZ = curZ + listForGraphicalActors1.length;
// 	var listForGraphicalNodes1 = listForGraphicalNodes(nodeSet, curZ);
// 	var curZ = curZ + listForGraphicalNodes1.length; 
// 	var listForGraphicalLinks1 = listForGraphicalLinks(nodeSet,curZ,nodeIdNodePosDict);
// 	return [listForGraphicalActors1, listForGraphicalNodes1, listForGraphicalLinks1];
// }


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
//	var outPutString = ``;
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
const fs = require('fs');
if (process.argv.length !== 5) {
    console.error('Invalid input');
    process.exit(1);
}
else{
	var inputModel1;
	var inputModel2;
	var rawData1 = fs.readFileSync(process.argv[3]);
	inputModel1 = JSON.parse(rawData1);
	var rawData2 = fs.readFileSync(process.argv[4]);
	inputModel2 = JSON.parse(rawData2);
	var outPutString = "";
	var output = new Object();
	//{"graph":{"cells":[{"type":"basic.Actor","size":{"width":330,"height":280},"position":{"x":310,"y":180},"angle":0,"id":"a4f91bd4-9259-4006-93b4-2da136b148cd","z":-1,"nodeID":"aNaN","embeds":["37a9312f-66d5-4305-a33e-b700865a046d","af433156-e2d5-4d98-a0b3-97d39d76f677","42e00225-ffd6-45d8-8774-1b5508153674","98bd1291-e5de-4e1f-ae94-6096275b7a27","61f4c814-56d5-4aaa-ad7c-5f98cf18f261","abc5f00c-eb04-4538-a0ad-468c23f37da2","72533443-52a6-44e1-89c7-0c81f3e45425"],"attrs":{".label":{"cx":82.5,"cy":28.270615378919},".name":{"text":"Spadina\nProject","font-size":13}}},{"type":"basic.Actor","size":{"width":130,"height":120},"position":{"x":220,"y":200},"angle":0,"id":"f2cf28b4-cf4a-4308-ae36-551b859c45b0","z":0,"nodeID":"a001","embeds":["0feb280b-d95d-470e-bea0-4901a69ebfd9"],"attrs":{".label":{"cx":32.5,"cy":12.353299855639},".name":{"text":"Metro","font-size":13}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":430,"y":190},"angle":0,"id":"af433156-e2d5-4d98-a0b3-97d39d76f677","z":2,"nodeID":"0000","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":""},".name":{"text":"Have Spadina\nExpressway","font-size":13}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":320,"y":300},"angle":0,"id":"42e00225-ffd6-45d8-8774-1b5508153674","z":3,"nodeID":"0001","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":"(F, ⊥)"},".funcvalue":{"text":"C"},".name":{"text":"Plan Project","font-size":13},".label":{"cx":25,"cy":6.3833753244528}}},{"type":"basic.Goal","size":{"width":90,"height":60},"position":{"x":420,"y":290},"angle":0,"id":"98bd1291-e5de-4e1f-ae94-6096275b7a27","z":4,"nodeID":"0002","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding","font-size":13},".label":{"cx":22.5,"cy":6.3833753244527855}}},{"type":"basic.Goal","size":{"width":90,"height":60},"position":{"x":530,"y":280},"angle":0,"id":"61f4c814-56d5-4aaa-ad7c-5f98cf18f261","z":5,"nodeID":"0003","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":""},".name":{"text":"Build Spadina\nExpressway","font-size":13},".label":{"cx":22.5,"cy":6.3833753244527855}}},{"type":"basic.Goal","size":{"width":90,"height":60},"position":{"x":410,"y":390},"angle":0,"id":"72533443-52a6-44e1-89c7-0c81f3e45425","z":6,"nodeID":"0004","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":""},".name":{"text":"Connected\nExpressway","font-size":13},".label":{"cx":22.5,"cy":6.3833753244527855}}},{"type":"basic.Goal","size":{"width":90,"height":60},"position":{"x":500,"y":370},"angle":0,"id":"abc5f00c-eb04-4538-a0ad-468c23f37da2","z":7,"nodeID":"0005","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","attrs":{".satvalue":{"text":""},".name":{"text":"Terminal\nExpressway","font-size":13},".label":{"cx":22.5,"cy":6.3833753244527855}}},{"type":"basic.Task","size":{"width":100,"height":60},"position":{"x":240,"y":390},"angle":0,"id":"4972530a-4b6b-4a3b-b90c-73913b2e036c","z":8,"nodeID":"0006","attrs":{".satvalue":{"text":""},".name":{"text":"Get Funding\nFrom Metro","font-size":13}}},{"type":"basic.Task","size":{"width":110,"height":60},"position":{"x":220,"y":240},"angle":0,"id":"0feb280b-d95d-470e-bea0-4901a69ebfd9","z":9,"nodeID":"0007","parent":"f2cf28b4-cf4a-4308-ae36-551b859c45b0","attrs":{".satvalue":{"text":"(⊥, F)"},".funcvalue":{"text":"DS"},".name":{"text":"Approve Project\nFunding","font-size":13},".label":{"cx":27.5,"cy":6.3833753244528}}},{"type":"link","source":{"id":"42e00225-ffd6-45d8-8774-1b5508153674"},"target":{"id":"af433156-e2d5-4d98-a0b3-97d39d76f677"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"b9ac4786-3267-4405-90ed-8c70ce52211a","z":10,"linkID":"0000","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"98bd1291-e5de-4e1f-ae94-6096275b7a27"},"target":{"id":"af433156-e2d5-4d98-a0b3-97d39d76f677"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"022d7b89-5c92-4d25-bdab-4699d93de0fd","z":11,"linkID":"0001","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"61f4c814-56d5-4aaa-ad7c-5f98cf18f261"},"target":{"id":"af433156-e2d5-4d98-a0b3-97d39d76f677"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"0b39aa13-f3f3-434e-b2ba-2fda12b4e685","z":12,"linkID":"0002","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"72533443-52a6-44e1-89c7-0c81f3e45425"},"target":{"id":"61f4c814-56d5-4aaa-ad7c-5f98cf18f261"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"37a9312f-66d5-4305-a33e-b700865a046d","z":13,"linkID":"0003","link-type":"OR","parent":"a4f91bd4-9259-4006-93b4-2da136b148cd","vertices":[{"x":510,"y":350}],"attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"abc5f00c-eb04-4538-a0ad-468c23f37da2"},"target":{"id":"61f4c814-56d5-4aaa-ad7c-5f98cf18f261"},"labels":[{"position":0.5,"attrs":{"text":{"text":"or"}}}],"id":"1c91a5b8-d06f-4879-86ac-321effaf5b5e","z":14,"linkID":"0004","link-type":"OR","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"4972530a-4b6b-4a3b-b90c-73913b2e036c"},"target":{"id":"98bd1291-e5de-4e1f-ae94-6096275b7a27"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++S"}}}],"id":"dc5acb62-a5ce-4b2f-859a-9c42e5cb2431","z":15,"linkID":"0005","link-type":"++S","vertices":[{"x":390,"y":400}],"attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"link","source":{"id":"0feb280b-d95d-470e-bea0-4901a69ebfd9"},"target":{"id":"4972530a-4b6b-4a3b-b90c-73913b2e036c"},"labels":[{"position":0.5,"attrs":{"text":{"text":"++"}}}],"id":"2b9e1d45-a542-4dac-9364-cd35fd969b01","z":16,"linkID":"0006","link-type":"++","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}}]},"model":{"actors":[{"nodeID":"a000","nodeName":"Spadina\nProject","intentionIDs":["0000","0001","0002","0001","0002","0003","0004","0005","0005","0006","0000","0001","0002","0003","0004","0005","0002","0001","0001","0002","0003","0003","0002","0002","0003","0003","0004","0005","0000","0001","0002","0003","0004","0005","0003","0004","0005","0003","0003","0005","0002"]},{"nodeID":"a001","nodeName":"Metro","intentionIDs":["0007","0007","0007","0007","0007","0007","0007"]},{"nodeID":"aNaN","nodeName":"Spadina\nProject","intentionIDs":["0000","0001","0003","0002","0001","0000","0003","0002","0004","0005","0003","0002","0002","0002","0001","0000","0003","0005","0004","0000","0003","0002","0005","0004","0001","0003","0005","0003","0002","0001","0001","0001","0002","0003","0005","0005","0005","0004","0004"]}],"intentions":[{"nodeActorID":"aNaN","nodeID":"0000","nodeType":"basic.Goal","nodeName":"Have Spadina\nExpressway","dynamicFunction":{"intentionID":"0000","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"aNaN","nodeID":"0001","nodeType":"basic.Task","nodeName":"Plan Project","dynamicFunction":{"intentionID":"0001","stringDynVis":"C","functionSegList":[{"funcType":"C","funcX":"0011","funcStart":"0","funcStop":"Infinity"}]}},{"nodeActorID":"aNaN","nodeID":"0002","nodeType":"basic.Goal","nodeName":"Get Funding","dynamicFunction":{"intentionID":"0002","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"aNaN","nodeID":"0003","nodeType":"basic.Goal","nodeName":"Build Spadina\nExpressway","dynamicFunction":{"intentionID":"0003","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"aNaN","nodeID":"0004","nodeType":"basic.Goal","nodeName":"Connected\nExpressway","dynamicFunction":{"intentionID":"0004","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"aNaN","nodeID":"0005","nodeType":"basic.Goal","nodeName":"Terminal\nExpressway","dynamicFunction":{"intentionID":"0005","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a000","nodeID":"0006","nodeType":"basic.Task","nodeName":"Get Funding\nFrom Metro","dynamicFunction":{"intentionID":"0006","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a001","nodeID":"0007","nodeType":"basic.Task","nodeName":"Approve Project\nFunding","dynamicFunction":{"intentionID":"0007","stringDynVis":"DS","functionSegList":[{"funcType":"C","funcX":"1100","funcStart":"0","funcStop":"A"},{"funcType":"C","funcX":"0011","funcStart":"A","funcStop":"Infinity"}]}}],"links":[{"linkID":"0000","linkType":"AND","postType":null,"linkSrcID":"0001","linkDestID":"0000","absoluteValue":-1},{"linkID":"0001","linkType":"AND","postType":null,"linkSrcID":"0002","linkDestID":"0000","absoluteValue":-1},{"linkID":"0002","linkType":"AND","postType":null,"linkSrcID":"0003","linkDestID":"0000","absoluteValue":-1},{"linkID":"0003","linkType":"OR","postType":null,"linkSrcID":"0004","linkDestID":"0003","absoluteValue":-1},{"linkID":"0004","linkType":"OR","postType":null,"linkSrcID":"0005","linkDestID":"0003","absoluteValue":-1},{"linkID":"0005","linkType":"++S","postType":null,"linkSrcID":"0006","linkDestID":"0002","absoluteValue":-1},{"linkID":"0006","linkType":"++","postType":null,"linkSrcID":"0007","linkDestID":"0006","absoluteValue":-1}],"constraints":[{"constraintType":"A","constraintSrcID":"0007","constraintSrcEB":"A","constraintDestID":null,"constraintDestEB":null,"absoluteValue":-1}],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0000","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0001","absTime":"0","evaluationValue":"0011"},{"intentionID":"0002","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0003","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0004","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0005","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0006","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0007","absTime":"0","evaluationValue":"1100"}],"previousAnalysis":null}};
	//{"graph":{"cells":[{"type":"basic.Actor","size":{"width":490,"height":310},"position":{"x":120,"y":70},"angle":0,"id":"e09e5b23-ef86-40c0-9760-7de8dcebfc44","z":0,"nodeID":"a003","embeds":["4f7ddad8-27b6-4fa7-b8e8-4d0afc231c5a","ce0f26d6-45d4-4f12-a3c4-0f9b6dff59f8"],"attrs":{".label":{"cx":122.5,"cy":31.255033489030836},".name":{"text":"Actor_3"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":210,"y":170},"angle":0,"id":"19392d55-e2f9-4c08-8b91-aee543d88fe3","z":1,"nodeID":"0005","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":430,"y":200},"angle":0,"id":"4f7ddad8-27b6-4fa7-b8e8-4d0afc231c5a","z":2,"nodeID":"0006","parent":"e09e5b23-ef86-40c0-9760-7de8dcebfc44","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_6"}}},{"type":"link","source":{"id":"4f7ddad8-27b6-4fa7-b8e8-4d0afc231c5a"},"target":{"id":"19392d55-e2f9-4c08-8b91-aee543d88fe3"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"6d39f2eb-e1eb-470f-80ed-3fbfb9250a9b","z":3,"linkID":"0000","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":210,"y":270},"angle":0,"id":"ce0f26d6-45d4-4f12-a3c4-0f9b6dff59f8","z":4,"nodeID":"0007","parent":"e09e5b23-ef86-40c0-9760-7de8dcebfc44","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_7"}}},{"type":"link","source":{"id":"ce0f26d6-45d4-4f12-a3c4-0f9b6dff59f8"},"target":{"id":"19392d55-e2f9-4c08-8b91-aee543d88fe3"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"083c794f-561a-468f-85ce-e55a1a8e0beb","z":5,"linkID":"0001","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}}]},"model":{"actors":[{"nodeID":"a003","nodeName":"Actor_3","intentionIDs":["0006","0007"]}],"intentions":[{"nodeActorID":"-","nodeID":"0005","nodeType":"basic.Goal","nodeName":"Goal_5","dynamicFunction":{"intentionID":"0005","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0006","nodeType":"basic.Goal","nodeName":"Goal_6","dynamicFunction":{"intentionID":"0006","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"a003","nodeID":"0007","nodeType":"basic.Goal","nodeName":"Goal_7","dynamicFunction":{"intentionID":"0007","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0000","linkType":"AND","postType":null,"linkSrcID":"0006","linkDestID":"0005","absoluteValue":-1},{"linkID":"0001","linkType":"AND","postType":null,"linkSrcID":"0007","linkDestID":"0005","absoluteValue":-1}],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0005","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0006","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0007","absTime":"0","evaluationValue":"(no value)"}],"previousAnalysis":null}};
	//{"graph":{"cells":[{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":140,"y":80},"angle":0,"id":"19392d55-e2f9-4c08-8b91-aee543d88fe3","z":1,"nodeID":"0005","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_5"}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":560,"y":80},"angle":0,"id":"4f7ddad8-27b6-4fa7-b8e8-4d0afc231c5a","z":2,"nodeID":"0006","attrs":{".satvalue":{"text":""},".name":{"text":"Goal_6"}}},{"type":"link","source":{"id":"4f7ddad8-27b6-4fa7-b8e8-4d0afc231c5a"},"target":{"id":"19392d55-e2f9-4c08-8b91-aee543d88fe3"},"labels":[{"position":0.5,"attrs":{"text":{"text":"and"}}}],"id":"6d39f2eb-e1eb-470f-80ed-3fbfb9250a9b","z":3,"linkID":"0000","attrs":{".connection":{"stroke":"#000000"},".marker-source":{"d":"0"},".marker-target":{"stroke":"#000000","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5"}}}]},"model":{"actors":[],"intentions":[{"nodeActorID":"-","nodeID":"0005","nodeType":"basic.Goal","nodeName":"Goal_5","dynamicFunction":{"intentionID":"0005","stringDynVis":"NT","functionSegList":[]}},{"nodeActorID":"-","nodeID":"0006","nodeType":"basic.Goal","nodeName":"Goal_6","dynamicFunction":{"intentionID":"0006","stringDynVis":"NT","functionSegList":[]}}],"links":[{"linkID":"0000","linkType":"AND","postType":null,"linkSrcID":"0006","linkDestID":"0005","absoluteValue":-1}],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[{"intentionID":"0005","absTime":"0","evaluationValue":"(no value)"},{"intentionID":"0006","absTime":"0","evaluationValue":"(no value)"}],"previousAnalysis":null}};
	// inputModel2 = {"graph":{"cells":[]},"model":{"actors":[],"intentions":[],"links":[],"constraints":[],"maxAbsTime":"100"},"analysisRequest":{"action":null,"conflictLevel":"S","numRelTime":"1","absTimePts":"","absTimePtsArr":[],"currentState":"0","userAssignmentsList":[],"previousAnalysis":null}};
	var resultList = mergeModels(0, inputModel1, inputModel2);
	makeDictIDToNodeID(inputModel1, inputModel2);
	var semanticElems = new Object();
	var actorsList = [];
	var intentionsList = [];
	var linksList = [];
	var constraintsList = [];
	var analysisRequestList = [];
	var listOfLists = [];
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
	output["model"] = semanticElems;
	outPutString = JSON.stringify(output);
	fs.writeFile(userPath+'OutputForMerge.txt', outPutString, (err) => { 
	//In case of a error throw err. 
		if (err) throw err; 
 	});
}