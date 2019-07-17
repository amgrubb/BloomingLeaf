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



function createNodeTimeMap(model1, model2){
	for(var constraint in model1.constarints){
		var nodeId = constraint.constraintSrcID;
		if(!(nodeTimeDict1[nodeId]==null)){
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

function findToMergePairs(){
	for(var key1 in nodeTimeDict1){
		for(var key2 in nodeTimeDict2){
			if(key1 === key2){
				/*
				element in this array is a tuple which the first element in the tuple is the time value
				second element in the tuple is a number. That number can be either 1 or 2, indicating
				whether that time value belongs to the first model
				or that time value belongs to the second model
				*/
				var time2DArray = [];
				for(var value in nodeTimeDict1[key1]){
					var timeTuple = [value, 1];
					time2DArray.push(timeTuple);
				}
				for(var value in nodeTimeDict2[key2]){
					var timeTuple = [value,2];
					time2DArray.push(timeTuple);
				}
				//sort time2DArray according to the time value
				//enter cases accordinly
				time2DArray = sort(time2DArray);
				mergedDictionary[key1] = time2DArray;
			}
		}
	}
}

/*
Without losing ngenerality, denote the second element of the first tuple to be 1.
In this way, there are two possible patterns in mergedDictionary[key]:
1) 1..2..1..2
2) 1..1..2..2
*/
function switchCases(mergedDictionary){
	for(var key in mergedDictionary){
		if(mergedDictionary[key].length < 2){
			//this case is only possible when only model1 or model 2 contains this node
			//so no gap no time conflict
			return noGapNoConflict(model1,mergedDictionary[key]);
		}
		else{
			for(var i = 0; i < mergedDictionary[key].length - 1 ; i=i+2){
				if((mergedDictionary[key][i][1] === mergedDictionary[key][i+1][1])
					&& (!(mergedDictionary[key][i][0] === mergedDictionary[key][i+1][0])))
				{
					//cases that there is no conflict and there is a gap between two intervals
					noGapNoConflict(model1,mergedDictionary[key][i]);
				}
				else if(mergedDictionary[key][i][0] === mergedDictionary[key][i+1][0])
				{
					//cases that there is neither time conflict nor gap
					noGapNoConflict(model1,mergedDictionary[key][i]);
				}
				else{
					//cases that there are time conflicts
					withConflict(model,mergedDictionary[key][i]);
				}
			}
		} 
	}
}

/*
Using merge sort to sort the time2DArray 
*/
function sort(twoDArray){
	if(twoDArray.length < 2){
		return twoDArray;
	}
	var middle = Math.floor(twoDArray.length/2);
	var rightArray = twoDArray.slice(middle);
	var leftArray = twoDArray.slice(0,middle);
	return merge(sort(leftArray), sort(rightArray));
}

function merge(leftList, rightList){
	var i = 0; 
	var j = 0; 
	var lenLeft = leftList.length; 
	var lenRight = rightList.length;
	var toReturn; 
	while(i < lenLeft && j < lenRight){
		if(leftList[i][0] < rightList[j][0]){
			toReturn.push(leftList[i]);
			i++; 
		}
		else
		{
			toReturn.push(rightList[j]);
			j++;
		}
	}
	//glue the rest part of the list into the result
	if((lenRight - j) > 1 ){
		toReturn.concat(rightList.slice(j));
	}
	if((lenLeft - i) > 1){
		toReturn.concat(leftList.slice(i)); 
	}
	return toReturn;
}






/*deal with the cases which there is neither gap nor time conflict*/
//assume model1 happens first
function noGapNoConflict(model1, model2, delta){
	//add intentions
	//need to prevent the repetition of the node id
		//if name different, then different id
		//if name the same, then leave it alone
	//change linkDestID, change linkSrcID accordingly
	var newIntentions = [];
	var curCountForID = 0;
	for(var intention1 in model1.intentions){
		var newID = createID(curCountForID);
		for(var i = 0; i < model1.links.length; i++){
			if(model1.links[i].linkSrcID === intention1.nodeID){
				model1.links[i].linkSrcID = newID;
			}
			if(model1.links[i].linkDestID === intention1.nodeID){
				model1.links[i].linkDestID = newID;
			}
		}
		intention1.nodeID = newID; 
		intention1.dynamicFunction.intentionID = newID; 
		newIntentions.push(intention1);
		curCountForID ++;
	}

	for(var intention2 in model2.intentions){
		for(var intention in newIntentions){
			if(!((intention.nodeName === intention2.nodeName)
				&&(intention.nodeType === intention2.nodeType))){
				var newID = createID(curCountForID);
				for(var i = 0; i < model2.links.length; i++){
					if(model2.links[i].linkSrcID === intention2.nodeID){
						model2.links[i].linkSrcID = newID;
					}
					if(model2.links[i].linkDestID === intention2.nodeID){
						model2.links[i].linkDestID = newID;
					}
				}

				intention2.nodeID = newID; 
				intention2.dynamicFunction.intentionID = newID; 
				newIntentions.push(intention2);
				curCountForID ++;
			}
		}
	}

	//modify links
	var newLinks = [];
	var linkCount = 0
	for(var link in model1.links){
		var newID = createID(linkCount);
		link.linkID = newID;
		linkCount ++;
		newLinks.push(link);
	}


	for(var link in model2.links){
		var isInNewLink = false;
		for(var newLink in newLinks){
			if(isSameLink(newLink,link)){
				isInNewLink = true;
			}
		}
		if(!isInNewLink){
			var newID = createID(linkCount); 
			link.linkID = newID; 
			linkCount ++;
			newLinks.push(link);
		}
	}


	//update link source ID
	//1. update all of the constraints & absValues
	//prevent name conflict?
	var maxTime1 = model1.maxAbsTime;
	var newConstraints1 = model1.constraints;
	var newConstraints2= updateAbs(model2.constraints,delta,maxTime1);
	for(var constriant in newConstraints2){
		newConstraints1.push(constraint);
	}
	model1.constraints = newConstaints1;

	//3. update functions
	//if same node, put what are in the funcSegList into that of the other node


	//3. deal with conflict value? 



}


function isSameLink(link1, link2){
	var isSame = true; 
	for(var attribute in link1){
		if(!(link1[attribute] === link2[attribute]){
			isSame = false;
		}
	}
	return isSame;
}


/**
* Creates and returns a 4 digit ID for this node
*
* @returns {String}
*/
function createID(curCountForID) {
        var id = newID.toString();
        while (id.length < 4){
                id = '0' + id;
        }
        return id;
}

function updateAbs(constraints2, delta, maxTime1){
	var updatedConstraint2 = [];
	var toAdd = maxTime1 + delta; 
	for(var constraint in constarints2){
		constraint.absoluteValue += toAdd;
		updateConstraint2.push(constraint);
	}
	return updateConstraint2;

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






function mergeModels(delta, model1, model2){
	if(delta > 0){
		withGapNoConflict(model1, model2, delta);
	}
	else if(delta == 0){
		noGapNoConflict(model1, model2);
	}
	else{
		withConflict(model1, model2, delta);
	}
}

