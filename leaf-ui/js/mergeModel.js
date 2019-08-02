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
				newIntentionIDs.add(actor.intentionIDs[i]);
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
	for(var link in model1.model.links){
		var newID = createID(linkCount);
		link.linkID = newID;
		linkCount ++;
		newLinks.push(link);
	}
	for(var link in model2.model.links){
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
var model1 , model2; 
function mergeModels(delta, model1, model2){
	model1 = model1;
	model2 = model2;
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
	var outPutString = ``;
	var resultList = mergeModels(process.argv[2], inputModel1, inputModel2);
	var commentList = ["newActors","newIntentions","newLinks","newConstraints","newAnalysisRequest"];
	for(var i = 0; i < resultList.length; i++){
		outPutString += commentList[i];
		outPutString += '\n';
		outPutString += JSON.stringify(resultList[i]);
		outPutString += '\n';
	}
	fs.writeFile('OutputForMerge.txt', outPutString, (err) => { 
    	// In case of a error throw err. 
    	if (err) throw err; 
	});

}


