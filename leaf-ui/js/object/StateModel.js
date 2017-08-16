function StateModel(){
	this.intentionElements = [];
	this.time;
};

function getStateModel(){
	
	//INITIAL VALUES
	// [time][intentions][value]
	var time = 1;
	var values = [];
	
	var intentions = getIntentitonalElements();
		
	for(var i_time = 0; i_time < time; i_time++){
		var stateModel = new StateModel();
		stateModel.time = i_time;

		for(var i_intention = 0; i_intention < intentions.length; i_intention++){
			var intentionalElement = new IntentionElement();
			intentionalElement.id = intentions[i_intention].nodeID;
			intentionalElement.status.push(intentions[i_intention].initialValue);
			stateModel.intentionElements.push(intentionalElement);
		}
		values.push(stateModel);
	}
	
	return values;
}