function InputEvaluation(goal, absTime, evaluationValue) {
	this.goal = goal;
	this.absTime = absTime;
	this.evaluationValue = evaluationValue;
}
function getUserEvaluations(){
	var evaluations = [];

	//TODO, complete this function.
	//var value =  //get the values from the "Intermediate Values Table"
	//if(values != null){
		//for each value entered into the "Intermediate Values Table" {
			var goal = null;  //TODO
			var absTime = null; //TOOD
			var evaluationValue = null; //TODO
			var evaluation = new InputEvaluation(
					goal,
					absTime,
					evaluationValue);

			evaluations.push(evaluation);
	//	};
	//}

	return evaluations;
}
