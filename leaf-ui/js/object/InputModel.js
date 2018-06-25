/**
 * This class stores all information from the front end UI that the back end
 * needs for analysis
 */
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

/**
 * Returns FrontendModel object, which contains all the graph information
 * that the back end needs.
 *
 * @param {Boolean} isSinglePath
 * @returns {FrontendModel}
 */
function getFrontendModel(isSinglePath = true){

	// Verfy if the model is correct for analysis
	// In Single Path analysis, the initial values must not be conflictant
	if(isSinglePath && checkConflictValues) {
		alert("The initial values must not be conflictant");
	}


	// Get data from the ui
	var actors = getActors();
	var intentions = getIntentitonalElements();
	var links = getLinks();
	var dynamics = getDynamics();
	var constraints = getConstraints();
	var userEvaluations = getUserEvaluations();

	var frontendModel = new FrontendModel(
		actors,
		intentions,
		links,
		dynamics,
		constraints,
		userEvaluations
	);

	return frontendModel;
}


/**
 * Returns true iff any of the intentions has conflicting values
 *
 * @returns {Boolean}
 */
function checkConflictValues() {
	for (var i = 0; i < graph.getElements().length; i++){
		if (!(graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
			var initValue = graph.getElements()[i].attributes.attrs[".satvalue"].text;
			if ((initValue == "(PS, PD)") ||
				(initValue == "(PS, FD)") ||
				(initValue == "(FS, PD)") ||
				(initValue == "(FS, FD)") ){
					return true;
			}
		}
	}
	return false;
}
