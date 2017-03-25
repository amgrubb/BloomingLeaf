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
			loadAnalysis(analysisResults, null, null);

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



