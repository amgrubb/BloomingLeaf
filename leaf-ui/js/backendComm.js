function backendComm(js_object){
	//Show in console just to see what is going to backend
	console.log(JSON.stringify(js_object));
	
	//backend script called
	var pathToCGI = "./cgi-bin/backendCom.cgi";

	//Executing action to send backend
	$.ajax({
		url: pathToCGI,
		type: "post",
		datatype: "json",
		data: JSON.stringify(js_object),
		success: function(response){
		//ADD HERE WHAT TO DO WITH THE RESPONSE OBJECT
			
			analysisResults = response['data'].split("\n");
			if (isNaN(parseInt(analysisResults[0]))){
				alert("Sorry Dave, We could not process your model")
				return
			}
			loadAnalysis(analysisResults, simulationType, queryNum);

			var currentValueLimit = parseInt(sliderObject.sliderElement.noUiSlider.get());
			var sliderMax = currentValueLimit + currentAnalysis.timeScale;
			sliderObject.sliderElement.noUiSlider.set(sliderMax);

			if ((queryNum != -1) && (queryNum < queryLines.length))
				postData(simulationType, leafLines, queryLines, cspHistoryLines, queryNum)
			
		//alert(response);
		console.log(response['data']);
		}
	})
	.fail(function(){
		msg = "Ops! Something went wrong";
		alert(msg);
	});
}

function loadAnalysis_marcel(analysisResults){
	currentAnalysis = new analysisObject.initFromBackEnd(analysisResults);
	updateSlider(currentAnalysis, false);
}

function backendResponseTest(){
	
	//BEGIN: Creating a Test Object	
	var foundSolution = true;
	var absoluteTime = [0, 1, 10, 20, 27];
	var relativeTime = [0, 1, 2, 3, 4]; 
	var nodes = [];

	var states01 = ["0010", "0010", "0010", "0010", "0010"];	
	var node01 = IONode("0001", states01);
	nodes.push(node01);
	
	var states02 = ["0100", "1100", "0010", "1100", "1100"];
	var node02 = IONode("0002", states02);
	nodes.push(node02);

	var states03 = ["0010", "0010", "0100", "0010", "0010"];
	var node03 = IONode("0003", states03);
	nodes.push(node03);

	var output = new IOOutput(foundSolution, relativeTime, absoluteTime, nodes);
	//END: Creating a Test Object
	
}

analysisObject.initFromObject = function(output){
	this.elements = [];
	this.timeScale = output.relativeTime.length - 1;
	
	for(var i = 0; i < output.nodes.length; i++){
		this.elements.push(output.nodes[i].states)
	}
	
	return this;
}



