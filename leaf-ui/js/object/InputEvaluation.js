/**
 * This class contains information about the values
 * in the intermediate values table in the analysisInspector
 */
class InputEvaluation {
	constructor(goal, absTime, evaluationValue) {
		this.goal = goal;
		this.absTime = absTime;
		this.evaluationValue = evaluationValue;
	}
}

/**
 * Returns an array of all current element's ids
 *
 * @returns {Array.<String>}
 */
function returnElementIds(){
	var elements = graph.getElements();
	var elementLst = [];
	for (var i = 0; i < elements.length; i++){
		//var cellView = elements[i].findView(paper);
		//var cell = cellView.model;

		elementLst.push(elements[i].attributes.elementid);
	}
	return elementLst;
}


/**
 * Returns an array of InputEvaluations, each containing information
 * about user evaluations stored in the intermediate values table
 *
 * @returns {Array.<InputEvaluation>}
 */
function getUserEvaluations(){
	var evaluations = [];
	var elementList = returnElementIds();
	var saveIVT = {};
	var i;
	for (i = 0; i < elementList.length; i++) {
		saveIVT[elementList[i]] = {};
		saveIVT[elementList[i]]["absTimePoints"] = absoluteTimeValues;
	}
	var rows = $('#interm-list > tbody > tr');
	var assignedTime = $('#intentionRows > th');
	var elements = graph.getElements();
	if(assignedTime.length > 2){
		var selected_eval = [];
		$("select#evalID option:selected" ).each(function(){
			if($( this ).val().replace(";","") == "empty"){
				selected_eval.push(null);
			}
			else{
				selected_eval.push($( this ).val().replace(";",""));
			}
		});
		var subLen = selected_eval.length/elementList.length;
		var sub = subLen;
		var kj = 0;
		var kk = 1;
		for (var key = 0; key < Object.keys(saveIVT).length; key++){
			saveIVT[Object.keys(saveIVT)[key]]["evalList"] = selected_eval.slice(kj,sub);
			kj = sub;
			sub=sub*(kk+1);
		}
	}
	for(var k in saveIVT){
		var goal = k;
		if(saveIVT[k]["absTimePoints"]){
			for(var i = 0; i < saveIVT[k]["absTimePoints"].length; i++){
				var absTime = saveIVT[k]["absTimePoints"][i];
				var evaluationValue = satValueDict[saveIVT[k]["evalList"][i]];
				if(evaluationValue){
					var evaluation = new InputEvaluation(
							goal,
							absTime,
							evaluationValue);
					evaluations.push(evaluation);
				}
			}
		}
	}
	return evaluations;
}
