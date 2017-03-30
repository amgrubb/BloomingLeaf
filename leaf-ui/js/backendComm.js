function backendComm(js_object){
	var analysisResults = {
			  "timePoints": [
				    "TA0-0",
				    "TR4-23",
				    "TR3-57",
				    "TR5-70",
				    "TR2-84",
				    "TR1-94"
				  ],
				  "times": [
				    "0|0",
				    "1|23",
				    "2|57",
				    "3|70",
				    "4|84",
				    "5|94"
				  ],
				  "elementList": [
				    {
				      "id": 0,
				      "valueList": [
				        "1100",
				        "1111",
				        "1111",
				        "0111",
				        "0100",
				        "1100"
				      ]
				    },
				    {
				      "id": 0,
				      "valueList": [
				        "0011",
				        "1111",
				        "1111",
				        "0111",
				        "0100",
				        "1100"
				      ]
				    },
				    {
				      "id": 0,
				      "valueList": [
				        "1100",
				        "0111",
				        "1111",
				        "0111",
				        "0000",
				        "0110"
				      ]
				    }
				  ],
				  "epochPoints": []
				};
	loadAnalysis(analysisResults);
	
	/* Uncomment for server execution
	//Show in console just to see what is going to backend
	console.log(JSON.stringify(js_object));
	
	//backend script called
	var pathToCGI = "./cgi-bin/backendCom.cgi";

	$.ajax({
		url: pathToCGI,
		type: "post",
		contentType: "json",
		data:JSON.stringify(js_object),
		success: function(response){
			executeJava();
			console.log(response);
		}
	})	.fail(function(){
		msg = "Ops! Something went wrong.";
		alert(msg);
	});
	*/
}

function executeJava(){
	var pathToCGI = "./cgi-bin/executeJava.cgi";
	$.ajax({
		url: pathToCGI,
		type: "get",
		success: function(response){
			getFileResults();
		}
	})
	.fail(function(){
		msg = "Ops! Something went wrong. Executing java.";
		alert(msg);
	});
}

function getFileResults(){
	//backend script called
	var pathToCGI = "./cgi-bin/fileRead.cgi";

	//Executing action to send backend
	$.ajax({
		url: pathToCGI,
		type: "get",
		success: function(response){
			analysisResults = response;
			if (isNaN(parseInt(analysisResults[0]))){
				alert("Sorry Dave, We could not process your model")
				return
			}
			loadAnalysis(analysisResults);

			var currentValueLimit = parseInt(sliderObject.sliderElement.noUiSlider.get());
			var sliderMax = currentValueLimit + currentAnalysis.timeScale;
			sliderObject.sliderElement.noUiSlider.set(sliderMax);

		console.log(response);
		}
	})
	.fail(function(){
		msg = "Ops! Something went wrong getting file.";
		alert(msg);
	});
}

