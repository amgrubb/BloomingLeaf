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

class Node{
  constructor(name,x,y,connectionSet) {
    this.nodeName = name;
    this.nodeX = x; 
    this.nodeY = y; 
    this.connectedTo = connectionSet;
    this.forcesX = 0;
    this.forcesY = 0;
  }
  set xValue(newX){
  	this.nodeX = newX; 
  }
  set yValue(newY){
  	this.nodeY = newY; 
  }

  get xValue(){
  	return this.nodeX; 
  }

  get yValue(){
  	return this.nodeY;
  }

  get forcesX(){
  	return this.forceX;
  }

  get forcesY(){
  	return this.forceY;
  }

  isConnectdTo(anotherNode){
  	if(this.connectedTo.has(anotherNode)){
  		return true;
  	}
  	else{
  		return false;
  	}
  }

  set forceX(newForceX){
  	this.forceX = newForceX;
  }

  set forceY(newForceY){
  	this.forceY = newForceY;
  }

}

function initializeNodes(JSONInput, nodeSet){
	//TODO: construct node accordingly
	//construct clusterDictionary
	//constuct clusterDictionary
	//place each node evenly in the coordinate
	//var nodes = [node1, node2, node3...];
}


function coefficientValue(clusterDictionary, nodeNamePair){
	for(var key in clusterDictionary){
		if(key.has(nodeNamePair)){
			return clusterDictionary[key];
		}
	}
	return defaultCoefficientValue; 
}

function changeNodePos(node, newX, newY){
	node.nodeX = newX; 
	node.nodeY = newY;
}


function setAttractionSum(curNode){
	var curName = curNode.nodeName;
	for(var node in nodes){
		var nodeName = node.nodeName;
		if(curName != nodeName){
			var forceX, forceY = attraction(curNode, node);
			var curXForce = curNode.forcesX; 
			curXForce += forceX; 
			curNode.forcesX = curXForce;
			var curYForce = curNode.forcesY; 
			curYForce += forceY; 
			curNode.forcesY = curYForce; 
		}
	}
}

function setRepulsionSum(curNode){
	var curName = curNode.nodeName;
	for(var node in nodes){
		var nodeName = node.nodeName;
		if(curName != nodeName){
			var forceX, forceY = repulsion(curNode, node);
			var curXForce = curNode.forcesX; 
			curXForce += forceX; 
			curNode.forcesX = curXForce;
			var curYForce = curNode.forcesY; 
			curYForce += forceY; 
			curNode.forcesY = curYForce; 
		}

	}
}

function attraction(node1, node2){
	var d = Math.sqrt((node2.xValue - node1.xValue)^2 + (node1.yValue - node2.yValue)^2);
	var k = coefficientValue(clusterDictionary, [node1.nodeName, node2.nodeName]);
	var coefficient = k * Math.sqrt(area/numVertices); 
	var forceSum = d^2/(coefficient^2);
	var dx = Math.sqrt((node2.xValue - node1.xValue)^2); 
	var dy = Math.sqrt((node1.yValue - node2.yValue)^2);
	var cos = dx/d;
	var sin = dy/d;
	var forceX = cos*forceSum; 
	var forceY = sine*forceSum;
	//direction
	if(node2.xValue < node1.xValue){
		forceX = -forceX;
	}
	if(node2.yValue < node1.yValue){
		forceY = -forceY;
	}
	return forceX, forceY; 
}

function repulsion(node1, node2){
	var d = Math.sqrt((node2.xValue - node1.xValue)^2 + (node1.yValue - node2.yValue)^2);
	var k = coefficeintValue(clusterDictionary, [node1.nodeName, node2.nodeName]); 
	var coefficient = k * Math.sqrt(area/numVertices);
	var forceSum = -coefficient^2/d;
	var dx = Math.sqrt((node2.xValue - node1.xValue)^2); 
	var dy = Math.sqrt((node1.yValue - node2.yValue)^2);
	var cos = dx/d;
	var sin = dy/d;
	var forceX = cos*forceSum; 
	var forceY = sine*forceSum;
	//direction
	if(node2.xValue < node1.xValue){
		forceX = -forceX;
	}
	if(node2.yValue < node1.yValue){
		forceY = -forceY;
	}
	return forceX, forceY;
}

/*Should be called after initialization(initial position should be assigned in the
initializeNodes)*/
function adjustment(nodeSet,moveConstant){
	for(var node of nodeSet){
		setAttractionSum(node); 
		setRepulsionSum(node);
		var moveX = moveConstant * node.forceX; 
		var moveY = moveConstant * node.forceY;
		node.nodeX += moveX; 
		node.nodeY += moveY;
	}
}

function forceDirectedAlgorithm(JSONInput){
	var numIterations = 70;
	var numConstant = 5;
	var nodeSet = new Set();
	initializeNodes(JSONInput, nodeSet);
	for(var i = 0; i < numItertions; i++){
		adjustment(nodeSet);
	}
	/*print x, y here*/ 
	for(var node of nodeSet){
		console.log("x value: "node.nodeX + " ; y value: "+node.nodeY);
	}
}

