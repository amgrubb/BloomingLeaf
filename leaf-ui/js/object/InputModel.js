//This is the object that contains all model information to be sent to backend
// function FrontendModel(
// 		actors,
// 		intentions,
// 		links,
// 		dynamics,
// 		constraints,
// 		userEvaluations
// 	){
// 	this.actors = actors;// = [];
// 	this.intentions = intentions;// = [];
// 	this.links = links;// = [];
// 	this.dynamics = dynamics;// = [];
// 	this.constraints = constraints;// = [];
// 	this.userEvaluations = userEvaluations;
// }

class FrontendModel {
	constructor(actors, intentions, links, dynamics, constraints, userEvaluations) {
		this.actors = actors;
		this.intentions = intentions;
		this.links = links;
		this.dynamics = dynamics;
		this.constraints = constraints;
		this.userEvaluations = userEvaluations;
	}
}

//This method is responsible to get all data from the UI and add in to a object to be sent to backend
function getFrontendModel(isSinglePath = true){

	// Verfy if the model is correct for analysis
	// In SINGLE PATH analysis, the initial values must not be conflictant
	if(isSinglePath){
		checkConflictValues();
	}


	//GETTING DATA FROM UI

	/** ACTORS
	 * Calls InputActors.getActorsList();
	 * returns InputActor[] actors;
	 */
	var actors = getActors();

	/** INTENTIONAL ELEMENTS
	 * Calls InputIntentions.getIntentionsList();
	 * returns InputIntention[] intentions
	 */
	var intentions = getIntentitonalElements();

	/**
	 * LINKS
	 * Calls InputLink.getLinks()
	 * returns InputLink[] links
	 */
	var links = getLinks();

	/**
	 * DYNAMICS
	 * Calls InputDynamic.getDynamics()
	 * returns InputDynamic[] dynamics
	 */
	var dynamics = getDynamics();

	/**
	 * CONSTRAINT
	 * calls InputConstraint
	 * returns InputConstraint[] constraints
	 */
	var constraints = getConstraints();

	var userEvaluations = getUserEvaluations();

	var frontendModel = new FrontendModel(
			actors,
			intentions,
			links,
			dynamics,
			constraints,
			userEvaluations
			)

	return frontendModel;
}


function checkConflictValues(){
	for (var i = 0; i < graph.getElements().length; i++){
		if (!(graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
			var initValue = graph.getElements()[i].attributes.attrs[".satvalue"].text;
			if ((initValue == "(PS, PD)") ||
				(initValue == "(PS, FD)") ||
				(initValue == "(FS, PD)") ||
				(initValue == "(FS, FD)") ){
					alert("The initial values must not be conflictant");
				return null;
			}
		}
	}
}
