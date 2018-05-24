
var global_analysisResult = {};

function backendComm(jsObject){
	/**
	* Print the input to the console.
	*/
	console.log(JSON.stringify(jsObject));

	//backend script called
	var pathToCGI = "./cgi-bin/backendCom.cgi";

 	$.ajax({
		url: pathToCGI,
		type: "post",
		contentType: "json",
		data:JSON.stringify(jsObject),
		success: function(response){
			setTimeout(function(){
				if(jsObject.analysis.action=="allNextStates"){
					executeJava(true, jsObject);
				}else{
					executeJava(false, jsObject);
				}
		    }, 500);  
		}
	})	.fail(function(){
		msg = "Ops! Something went wrong.";
		alert(msg);
	});

}

function executeJava(isGetNextSteps, jsObject){
	var pathToCGI = "./cgi-bin/executeJava.cgi";
	$.ajax({
		url: pathToCGI,
		type: "get",
		success: function(response){
		    setTimeout(function(){
				getFileResults(isGetNextSteps, jsObject);
		    }, 500);  
		}
	})
	.fail(function(){
		msg = "Ops! Something went wrong. Executing java.";
		alert(msg);
	});
}


function getFileResults(isGetNextSteps, jsObject){
	var pathToCGI = "./cgi-bin/fileRead.cgi";

	//Executing action to send backend
	$.ajax({
		url: pathToCGI,
		type: "get",
		success: function(response){
			analysisResults = JSON.parse(response['data']);
			
			if (constraintErrorExists(analysisResults)) {
				var msg = getErrorMessage(analysisResults.errorMessage, jsObject);	
				alert(msg);
			} else {
				/**
					* Print the response data to the console.
				*/
					console.log(JSON.stringify(JSON.parse(response['data'])));

				global_analysisResult = analysisResults;
				if (analysisResults == ""){
					alert("Error while reading the resonse file from server. This can be due an error in executing java application.")
					return
				}
				if(isGetNextSteps){
					open_analysis_viewer();
				}else{
					loadAnalysis(analysisResults);
					var currentValueLimit = parseInt(sliderObject.sliderElement.noUiSlider.get());
					var sliderMax = currentValueLimit + currentAnalysis.timeScale;
					sliderObject.sliderElement.noUiSlider.set(sliderMax);
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

	var w = window.open(url, "Analysis View", "status=0,title=0,height=600,width=1200,scrollbars=1");

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
function constraintErrorExists(analysisResults) {
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
 * @param {Object} jsObject
 *   object containing information that maps node ids with node names
 * @returns {boolean}
 */
function getErrorMessage(backendErrorMsg, jsObject) {
		
	var ids = getIDs(backendErrorMsg);
	var names = [];
	for (var i = 0; i < ids.length; i++) {
		 names.push(getNameFromID(ids[i], jsObject));
	}

	var s = 'The model is not solvable because of conflicting constraints  involving nodes: ';
	for (var i = 0; i < names.length - 1; i++) {
		s += names[i] + ', ';
	}
	s += 'and ' + names[names.length - 1] + '.';
	return s;
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

/*
 * Returns the node name of a node with id id.
 *
 * @param {String} id
 *   id of the node of interest
 * @param {Object} jsObject
 *   object containing information that maps node ids with node names
 * @returns {String} 
 */
function getNameFromID(id, jsObject) {

    // iterate through intentions/nodes
    var intentObjArr = jsObject.model.intentions;

    for (var i = 0; i < intentObjArr.length; i++) {
        if (id == intentObjArr[i].nodeID) {
            return intentObjArr[i].nodeName;
        }
    }
}
