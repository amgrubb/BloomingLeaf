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
					time2DArray.append(timeTuple);
				}
				for(value in nodeTimeDict2[key2]){
					var timeTuple = [value,2];
					time2DArray.append(timeTuple);
				}
				//sort time2DArray according to the time value
				//enter cases accordinly
				
			}
		}
	}
}


