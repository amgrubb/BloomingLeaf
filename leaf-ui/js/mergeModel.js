/*
1. get the name of the node
2. get the starting and the ending point of each function
3. merge those together and output a new json file that contains those merged information



Functions: 
function getNode
function getTimePoints
function findMatchPoint?:
then go to cases: 
1. doesn't have intersection: 
	a. doesn't have gaps
	b. has gaps
2. have intersections: 
	left blank
*/
var nodeTimeDict1 = {};
var nodeTimeDict2 = {};

function createNodeTimeMap(model1, model2){
	for(var i = 0; i < model1.intentions.length; i++){
		var intention = model1.intentions[i];
		nodeTimeDict1[intention.nodeName]=constraints;
	}
	for(var i = 0; i < model2.intentions.length; i++){
		var intention = model2.intentions[i];
		nodeTimeDict2[intention.nodeName]=constraints;
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
				for(value in nodeTimeDict1[key1]){
					var timeTuple = [value, 1];
					time2DArray.push(timeTuple);
				}
				for(value in nodeTimeDict2[key2]){
					var timeTuple = [value,2];
					time2DArray.push(timeTuple);
				}
				//sort time2DArray according to the time value
				//enter cases accordinly
				time2DArray = sort(time2DArray);
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


