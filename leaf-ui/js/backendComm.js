function backendComm(js_object){
	var analysisResults = {
			  "elementList": [
				    {
				      "id": "0000",
				      "valueList": [
				        "1100",
				        "0100",
				        "1110",
				        "1111"
				      ]
				    },
				    {
				      "id": "0001",
				      "valueList": [
				        "0011",
				        "0100",
				        "0010",
				        "1111"
				      ]
				    },
				    {
				      "id": "0002",
				      "valueList": [
				        "1100",
				        "0100",
				        "1111",
				        "0111"
				      ]
				    }
				  ],
				  "finalAssignedEpoch": [
				    "TA0_0",
				    "TR1_26",
				    "TR3_64",
				    "TR2_74"
				  ],
				  "finalValueTimePoints": [
				    "0",
				    "26",
				    "64",
				    "74"
				  ]
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

