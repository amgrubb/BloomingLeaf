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
				newIntentionIDs.add(actor.intentionIDs[i]);
			}
		}
	}
	var newIntentionIDsList = [];
	for (var item of newIntentionIDs.values()){
		newIntentionIDsList.push(item);
	}
	actorToRetun["intentionIDs"] = newIntentionIDsList;
	return actorToReturn;
}

/*
This function make sure that there is no intention in the actor to be add to the merged actors
that has been had by other actors that have names different from current actor.
*/
function noRepetitionOnIntentions(visitedActorIDSet, theActorToAdd){
	var noRepetition = true; 
	for(var intentionId in theActorToAdd.intentionIDs){
		if(theActorToAdd.has(intentionId)){
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
        var id = newID.toString();
        while (id.length < 3){
                id = '0' + id;
        }
        id = 'a' + id;
        return id;
}

function updateActorId(){

}
/*
This function update the old ids into new ids and also update the intention id part in the following objects: 
1. Links: change linkDestID, change linkSrcID according to the new nodeID generated.
2. 
*/
function updateIDRelatedObject(newId, curId, model, curIndex){
	for(var i = 0; i < model1.links.length; i++){
		if(model.links[i].linkSrcID === curId){
			model.links[i].linkSrcID = newId;
		}
		if(model.links[i].linkDestID === curId){
			model.links[i].linkDestID = newId;
		}
	}

	for(var i=0 ; i < model.analysisRequest.userAssignmentsList.length; i++){
		if(model.analysisRequest.userAssignmentsList[i].intentionID === curId){
			model.analysisRequest.userAssignmentsList[i].intentionID = newId; 
		}
	}

	for(var i = 0 ; i < model.actors.length; i++){
		for(var j = 0; j < actor.intentionIDs.length; j++){
			if(model.actors[i].intentionIDs[j] === curId){
				model.actors[i].intentionIDs[j] = newId;
			}
		}
	}

	model.intentions[curIndex].nodeID = newID;
	model.intentions[curIndex].dynamicFunction.intentionID = newID;
}


/*deal with the cases which there is neither gap nor time conflict*/
//assume model1 happens first
function noGapNoConflict(model1, model2, delta){

	//TODO: Pack all part that are not function related to another function

	/*
	1. merge intentions in two models: 
	need to prevent the repetition of the node id
		1. if name different, then different id
		2. if name the same, then leave it alone
	*/
	var models = [model1, model2];
	var newIntentions = [];
	var curCountForID = 0;
	for(var i = 0; i < model1.intentions.length; i++){
		//intention1 in model1.intentions)
		var newID = createID(curCountForID);
		updateIDRelatedObject(newID, model1.intentions[i].nodeID, model1, i);
		newIntentions.push(intention1);
		curCountForID ++;
	}

	for(var i = 0; i < model2.intentions.length; i++){
		for(var intention in newIntentions){
			if(!(intention.nodeName === intention2.nodeName)){
				var newID = createID(curCountForID);
				updateIDRelatedObject(newID, model2.intentions[i].nodeID, model2, i)
				newIntentions.push(intention2);
				curCountForID ++;
			}
			else{
				/*
				Following updates Functions: 
				If there are intention in model2
				with the same name of another intention in model1,
				then the merged new intetion has a function type of "UD" and it 
				contains all of the function segments in model2 and the function segments 
				in model1
				*/
				//TODO: the function stop may need to be modified.
				if(!(intention2.funcSegList.length == 0)){
					intention.stringDynVis = "UD";
					for(var func in intention2.functionSegList){
						intention.functionSegList.push(func);
					}
				}
			}
		}
	}

	/*
	merge actors:
	1. Merge actors with the same name together
	2. Check whether same name , different actors? If so, raise errors
	3. Put missings in the actors into the merged actor
	*/
	var newActors = [];
	var actorsNameSet = new Set();
	/*the following is the set that contains the intention id of each 
	actor that has been visited in the algorithm
	*/
	var visitedActorIDSet = new Set();
	var actorCounter = 0;
	for(var actor1 in model1.actors){
		for(actor2 in model2.actors){
			if(actor1.nodeName === actor2.nodeName){
				//TODO: generate new nodeID for the actors
				var newActorId = newActorID(actorCounter);
				var mergedActor = mergeToOneActor(visitedActorIDSet, actor1, actor2, newActorId);
				newActors.push(mergedActor);
				actorCounter ++;
				//TODO: update all the objects in the model that contains the actor id. 
				//TODO: Maybe shouldn't be called here
				for(var intentionId in mergedActor.intentionIDs){
					visitedActorIDSet.add(intentionId);
				}
				actorsNameSet.add(actor1.nodeName);
			}
		}
	}

	//Add leftover actors in model1 and model2 into the merged actors
	models = [model1, model2];
	for(var i=0; i < models.length; i++){
		var model = models[i];
		for(var actor in model.actors){
			if(!actorNameSet.has(actor.nodeName)){
				if(noRepetitionOnIntentions(visitedActorIDSet, actor)){
					actorNameSet.add(actor.nodeName);
					for(var intentionId in actor.intentionIDs){
						visitedActorIDSet.add(intentionId);
					}
					newActors.push(actor);
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

	/*
	1) Update all of the constraints & absValues in model2 
	by adding (maxTime + delta) to all of the absValues
	2) Update the analysis request
	*/
	//TODO: check repetitions of the constriants?
	var maxTime1 = model1.maxAbsTime;
	var newConstraints = []
	for(var constraint in model1.constraints){
		newConstraints.push(constraint);
	}
	var newConstraints2= updateAbs(model2.constraints,delta,maxTime1);
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
	for(var model in [model1, model2]){
		for(var assingment in model.analysisRequest.userAssignmentsList){
			newAnalysisRequest["userAssignmentsList"].push(assignment);
		}
		for(var absTimePt in model.analysisRequest.absTimePtsArr){
			newAnalysisRequest["absTimePtsArr"].push(absTimePt);
		}
		absTimePts += model.analysisRequest.absTimePts + " ";
		modelNumRelTime += parseInt(model.analysisRequest.numRelTime);
	}
	newAnalysisRequest["numRelTime"] = modelNumRelTime.toString();
	newAnalysisRequest["absTimePts"] = absTimePts.substr(0, stringAbsTimePts.length - 1);

	return newIntentions, newLinks, newConstraints, newAnalysisRequest;
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
* Creates and returns a 4 digit ID for this intention
*
* @returns {String}
*/
function createID(newID) {
        var id = newID.toString();
        while (id.length < 4){
                id = '0' + id;
        }
        return id;
}

/*This function add the (delta + maxTime1) to all of the absolute values in the
constraints of the second model*/
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

/*
main function for merging models
*/
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

