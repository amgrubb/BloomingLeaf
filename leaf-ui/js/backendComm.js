var nodeServer = true;      						// Whether the tool is running locally on a Node Server.
var url = "http://localhost:8080/untitled.html";	// Hardcoded URL for Node calls. 

function backendComm(jsObject){	
	/**
	* Print the input to the console.
	*/
	console.log(JSON.stringify(jsObject));
	console.log(jsObject.analysisRequest.action);

	console.log(nodeServer);
    if(nodeServer){
        nodeBackendCommFunc(jsObject);
        return;
	}
	
	// Code for running the tool on University Servers with sandbox for webserver.
	// Need to use CGI to call java on a different server.
	var pathToCGI = "./cgi-bin/backendCom.cgi";
 	$.ajax({
		url: pathToCGI,
		type: "post",
		contentType: "json",
		data:JSON.stringify(jsObject),
		success: function(response){
			setTimeout(function(){
				if(jsObject.analysisRequest.action=="allNextStates"){
					executeJava(true);
				}else{
					executeJava(false);
				}
		    }, 500);
		}
	})	.fail(function(){
		msg = "Ops! Something went wrong.";
		alert(msg);
	});
}

// Code for calling the java function via Node.
function nodeBackendCommFunc(jsObject){
   console.log("Calling Backend via Node Server"); //JSON.stringify(jsObject));
   
   var xhr = new XMLHttpRequest();
   var isGetNextSteps ;
   xhr.open("POST", url, true);
   xhr.setRequestHeader("Content-Type", "application/json");

   var data = JSON.stringify(jsObject);
   xhr.onreadystatechange = function() {	
		// This function get caled when the response is received.
		console.log("Reading the response");
		if (xhr.readyState == XMLHttpRequest.DONE) {
           if(jsObject.analysisRequest.action=="allNextStates"){
               isGetNextSteps = true;
           }
           else{
               isGetNextSteps = false;
        	}
            
            var response = xhr.responseText;
   			responseFunc(isGetNextSteps,response);

       }
   }
   xhr.send(data);	// Why is this sent down here? What is this send function.

   // console.log(xhr.responseText);
   // response=xhr.responseText;
   // responseFunc(isGetNextSteps,response);
}


//deal with the response sent back by the server
function responseFunc(isGetNextSteps, response){
	var results = JSON.parse(response);
	if (errorExists(results)) { 
		 var msg = getErrorMessage(results.errorMessage);
		 alert(msg);
	 }
	else {
		if (results == ""){ 
			 alert("Error while reading the resonse file from server. This can be due an error in executing java application.");
			 return;
		 }
		else {
			if(isGetNextSteps){ 
					savedAnalysisData.allNextStatesResult = results;
					console.log("in backendcomm, saving all next state results");
					 open_analysis_viewer();
			} else {
				var resultsString = JSON.stringify(results);
				 console.log(JSON.stringify(results)); 
				 savedAnalysisData.singlePathResult = results;
				 analysisResult.assignedEpoch = results.assignedEpoch;
				 analysisResult.timePointPath = results.timePointPath;
				 analysisResult.timePointPathSize = results.timePointPathSize;
				 analysisResult.elementList = results.elementList;
				 analysisResult.allSolution = results.allSolution;
				 analysisRequest.previousAnalysis = analysisResult;
				 console.log("previousAnalysis");
				 console.log(analysisRequest.previousAnalysis);
				 displayAnalysis(results);
 
				 analysisResult.elementListPercentEvals = [];
				 var percentagePerEvaluation = 0.0;
 
				 for(var i = 0; i < results.elementList.length; ++i) //iterate through all the intentions
				 {

					 analysisResult.elementListPercentEvals[i] = new intentionPercentages();
					 analysisResult.elementListPercentEvals[i].id = results.elementList[i].id;
					 analysisResult.elementListPercentEvals[i].numEvals = analysisResult.elementList[i].status.length;
 
					 analysisResult.elementListPercentEvals[i].initializeIntentionEvaluations();
					 percentagePerEvaluation = 1.0 / analysisResult.elementListPercentEvals[i].numEvals;
 
					 for(var k = 0; k < analysisResult.elementListPercentEvals[i].numEvals; ++k) //iterate through the evaluation points and find the 
					 {
							 //determine type of evalutation and add it to corresponding num
							 switch(analysisResult.elementList[i].status[k]) //ASK: appears backwards?
							 {
								 case "0011": //FS
									 analysisResult.elementListPercentEvals[i].intentionEvaluations[0].percent += percentagePerEvaluation;
									 break;
								 case "0010": //PS
									 analysisResult.elementListPercentEvals[i].intentionEvaluations[1].percent += percentagePerEvaluation;
									 break;
								 case "0111": //FS PD
									 analysisResult.elementListPercentEvals[i].intentionEvaluations[2].percent += percentagePerEvaluation;
									 break;
								 case "1111": //FS FD ---> ask: should these be the same? 
								 case "0110": //PS PD ---> alternativy a lighter purple for 0110 and darker for 1111
									 analysisResult.elementListPercentEvals[i].intentionEvaluations[3].percent += percentagePerEvaluation;
									 break;
								 case "1110": //PS FD
									 analysisResult.elementListPercentEvals[i].intentionEvaluations[4].percent += percentagePerEvaluation;
									 break;
								 case "0100": //PD
									 analysisResult.elementListPercentEvals[i].intentionEvaluations[5].percent += percentagePerEvaluation;
									 break;
								 case "1100": //FD
									 analysisResult.elementListPercentEvals[i].intentionEvaluations[6].percent += percentagePerEvaluation;
									 break;
								 case "0000": //N aka nothing
									 analysisResult.elementListPercentEvals[i].intentionEvaluations[7].percent += percentagePerEvaluation;
									 break;
								 default:
									 console.log("Evaluation "+analysisResult.elementList[i].status[k]+" is not determined.");
									 break;
							 }
					 }
				 }
			 }
		 }
	 }

	 //changeIntentionsByPercentage();
	 generateConsoleReport();

	 analysisResult.isPathSim = true;
	 refreshColorVis();
 }
 
 function changeIntentionsByPercentage()
 {
	 var elements = graph.getElements(); //get list of all the elements in the graph (aka goal model)
	 for (var i = 0; i < elements.length; i++){ //cycle through the individual element, determine type (task, goal, etc) and adjust color accordingly
			 var cellView  = elements[i].findView(paper);
 
			 var offsetPercents = [];
			 var offsetColors = [];
			 var numOffsets = 0;
 
			 var offsetTotal = 0.0;
 
			 var lastIndex = 0;
			 console.log("element "+i+":");
			 for(var j = 0; j < 8; ++j) //look at all the percents
			 {
				 //the before and after buffer gradient into the other evaluations, which are so tiny you can't see them
				 //this creates the appearance of stripes instead of an actual gradient
				 if(analysisResult.elementListPercentEvals[i].intentionEvaluations[j].percent > 0)
				 {
					 //before buffer
					 offsetTotal += 0.001;
					 offsetPercents.push(offsetTotal)
					 offsetColors.push(analysisResult.elementListPercentEvals[i].intentionEvaluations[j].color);
 
					 //actual color chunk
					 offsetTotal += analysisResult.elementListPercentEvals[i].intentionEvaluations[j].percent - 0.002;
					 offsetPercents.push(offsetTotal);
					 offsetColors.push(analysisResult.elementListPercentEvals[i].intentionEvaluations[j].color);
					 
					 lastIndex = j;
 
					 //console.log("offset "+j+": "+offsetTotal);
 
					 //after buffer
					 offsetTotal += 0.001; //add a black "buffer" so the colors don't gradient with eachother
					 offsetPercents.push(offsetTotal);
					 offsetColors.push(analysisResult.elementListPercentEvals[i].intentionEvaluations[j].color);
					 
					 
					 numOffsets += 3;
				 }
			 }
 
			 while(numOffsets < 24)
			 {
				 offsetPercents.push(100);
				 offsetColors.push(analysisResult.elementListPercentEvals[i].intentionEvaluations[lastIndex].color);
				 ++numOffsets;
			 }
 
			 
			 cellView.model.attr({'.outer' : {'fill' :
			 {
			  type: 'linearGradient',
			 stops: [
				 { offset: offsetPercents[0], color: offsetColors[0]},
				 { offset: offsetPercents[1], color: offsetColors[1]},
				 { offset: offsetPercents[2], color: offsetColors[2]},
				 { offset: offsetPercents[3], color: offsetColors[3]},
				 { offset: offsetPercents[4], color: offsetColors[4]},
				 { offset: offsetPercents[5], color: offsetColors[5]},
				 { offset: offsetPercents[6], color: offsetColors[6]},
				 { offset: offsetPercents[7], color: offsetColors[7]},
				 { offset: offsetPercents[8], color: offsetColors[8]},
				 { offset: offsetPercents[9], color: offsetColors[9]},
				 { offset: offsetPercents[10], color: offsetColors[10]},
				 { offset: offsetPercents[11], color: offsetColors[11]},
				 { offset: offsetPercents[12], color: offsetColors[13]},
				 { offset: offsetPercents[14], color: offsetColors[14]},
				 { offset: offsetPercents[15], color: offsetColors[15]},
				 { offset: offsetPercents[16], color: offsetColors[16]},
				 { offset: offsetPercents[17], color: offsetColors[17]},
				 { offset: offsetPercents[18], color: offsetColors[18]},
				 { offset: offsetPercents[19], color: offsetColors[19]},
				 { offset: offsetPercents[20], color: offsetColors[20]},
				 { offset: offsetPercents[21], color: offsetColors[21]},
				 { offset: offsetPercents[22], color: offsetColors[22]},
				 { offset: offsetPercents[23], color: offsetColors[23]},
				 { offset: offsetPercents[24], color: offsetColors[24]},
			 ]
		  }
		  }});
	 }
 }
 
 function generateConsoleReport()
 {
	 console.log("");
	 console.log("Output:");
	 //iterate through intentions
	 for(var i = 0; i < analysisResult.elementList.length; ++i)
	 {
		 console.log("Goal " + analysisResult.elementList[i].id+":");
		 //iternate through the 8 different possible evalutions for each intention
		 for(var j = 0; j < 8; ++j)
		 {
			 if(analysisResult.elementListPercentEvals[i].intentionEvaluations[j].percent > 0.0)
			 {
				 //output it to the console
				 console.log(analysisResult.elementListPercentEvals[i].intentionEvaluations[j].type
				 + " -> "
				 + Math.floor(analysisResult.elementListPercentEvals[i].intentionEvaluations[j].percent * 1000)/10
				 + "%");
			 }
		 }
	 }
 }

function executeJava(isGetNextSteps){
	var pathToCGI = "./cgi-bin/executeJava.cgi";
	$.ajax({
		url: pathToCGI,
		type: "get",
		success: function(response){
		    setTimeout(function(){
				getFileResults(isGetNextSteps);
		    }, 500);
		}
	})
	.fail(function(){
		msg = "Ops! Something went wrong. Executing java.";
		alert(msg);
	});
}


function getFileResults(isGetNextSteps){
	var pathToCGI = "./cgi-bin/fileRead.cgi";

	//Executing action to send backend
	$.ajax({
		url: pathToCGI,
		type: "get",
		success: function(response){
			results = JSON.parse(response['data']);

			if (errorExists(results)) {
				var msg = getErrorMessage(results.errorMessage);
				alert(msg);
			} else {
				/**
					* Print the response data to the console.
				*/
					console.log(JSON.stringify(JSON.parse(response['data'])));

				//globalAnalysisResult = results;

				if (results == ""){
					alert("Error while reading the resonse file from server. This can be due an error in executing java application.")
					return
				}


				// do not need to store the past result for all next states
				if(isGetNextSteps){
                    savedAnalysisData.allNextStatesResult = results;
                    console.log("in backendcomm, saving all next state results");
					open_analysis_viewer();
				}else{
                    savedAnalysisData.singlePathResult = results;
                    analysisResult.assignedEpoch = results.assignedEpoch;
                    analysisResult.timePointPath = results.timePointPath;
                    analysisResult.timePointPathSize = results.timePointPathSize;
                    analysisResult.elementList = results.elementList;
                    analysisResult.allSolution = results.allSolution;
                    analysisRequest.previousAnalysis = analysisResult;
                    console.log("previousAnalysis");
                    console.log(analysisRequest.previousAnalysis);
					displayAnalysis(results);
				}
			}
		}
	})
	.fail(function(){
		msg = "Error while executing CGI file: fileRead. Please contact the system Admin.";
		alert(msg);
	});
}


function open_analysis_viewer(){
    var urlBase = document.URL.substring(0, document.URL.lastIndexOf('/')+1);
    var url = urlBase+"analysis.html";
    var w = window.open(url, Date.now(), "status=0,title=0,height=600,width=1200,scrollbars=1");

    if (!w) {
        alert('You must allow popups for this map to work.');
    }

}

/*
 * Returns true iff analysisResults indicates that there is
 * an error message.
 *
 * @param {Object} analysisResults
 *   results from backend java code
 * @returns {boolean}
 */
function errorExists(analysisResults) {
	return analysisResults.errorMessage != null;
}

/*
 * Returns a user-readable error message, containing
 * user-defined node names instead of node ids.
 *
 * Example message:
 * The model is not solvable because of conflicting constraints
 * involving nodes: mouse, keyboard, and pizza.
 *
 * @param {String} backendErrorMsg
 *   error message from backend
 * @returns {boolean}
 */
function getErrorMessage(backendErrorMsg) {

	// If node ids does not exist, just return the original error message for now
	if (!nodeIDsExists(backendErrorMsg)) {
		return backendErrorMsg;
	}

	var ids = getIDs(backendErrorMsg);
	var names = [];
	var actorNames = [];
	for (var i = 0; i < ids.length; i++) {
		names.push(getNodeName(ids[i]));
		actorNames.push(getParentActorNameById(ids[i]));
	}

	var s = 'The model is not solvable because of conflicting constraints involving nodes (with associated actors): ';
	var numOfNames = names.length;

	for (var i = 0; i < numOfNames - 1; i++) {
		s += names[i] + ' (' + actorNames[i] + ')';
		if (i < numOfNames - 2) {
			s += ', ';
		} else {
			s += ' ';
		}
	}

	s += 'and ' + names[numOfNames - 1] + ' (' + actorNames[numOfNames - 1] + ').';
	s += '\n\nOriginal Error: ' + backendErrorMsg;
	return s;
}

/*
 * Returns the actor name for an actor
 * that embeds an element with element id id.
 * If element with element id id is not embedded within an actor
 * returns 'no actor'.
 *
 * @param {String} id
 *   element id for the element of interest
 * @returns {String}
 */
function getParentActorNameById(id) {
	var actor = getParentActor(getElementById(id));
	if (actor) {
		return actor.attributes.attrs['.name'].text;
	}
	return 'no actor';
}

/*
 * Returns the actor which embeds the element of interest.
 * Returns null if there is no actor that embeds the element.
 * (If an actor embeds an element, the actor is the element's parent)
 *
 * @param {dia.Element} element
 * @returns {dia.Element | null}
 */
function getParentActor(element) {
	// get call the ancestors for the element
	var ancestors = element.getAncestors();
	if (ancestors.length == 0) {
		return null;
	}
	// if there is an ancestor, there would only be one
	return ancestors[0];
}

/*
 * Returns the element with element id id.
 * Returns null if no element with that element id exists.
 *
 * @param {String} id
 *   element id of the element of interest
 * @returns {dia.Element | null}
 */
function getElementById(id) {
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++) {
		if (id == elements[i].attributes.nodeID) {
			return elements[i];
		}
	}
}

/**
 * Returns true iff node ids exists in msg
 *
 * @param {String} msg
 * @returns {Boolean}
 */
function nodeIDsExists(msg) {
	var pattern = /N\d{4}/g;
	return msg.match(pattern) != null;
}

/*
 * Returns an array of all node ids that are mentioned in
 * the backendErrorMsg, in the order they appear.
 *
 * @param {String} backendErrorMsg
 *   error message from backend
 * @returns {Array of String}
 */
function getIDs(backendErrorMsg) {
	// this regex matches for an N, followed by 4 digits
	var pattern = /N\d{4}/g;
	var arr = backendErrorMsg.match(pattern);

	// remove the preceding N's to get each id
	for (var i = 0; i < arr.length; i++) {
		arr[i] = arr[i].substring(1);
	}

	return arr;
}
