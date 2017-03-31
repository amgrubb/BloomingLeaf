function backendComm(js_object){
	var analysisResults = {
			  "timePoints": [
				    "TA0-0",
				    "TR3-2",
				    "TR4-13",
				    "TR1-30",
				    "TR5-63",
				    "TR2-83"
				  ],
				  "times": [
				    "0|0",
				    "1|2",
				    "2|13",
				    "3|30",
				    "4|63",
				    "5|83"
				  ],
				  "elementList": [
				    {
				      "id": "0000",
				      "valueList": [
				        "1100",
				        "1111",
				        "0110",
				        "1110",
				        "0000",
				        "0000"
				      ]
				    },
				    {
				      "id": "0001",
				      "valueList": [
				        "0011",
				        "0011",
				        "0011",
				        "0010",
				        "0000",
				        "0010"
				      ]
				    },
				    {
				      "id": "0002",
				      "valueList": [
				        "1100",
				        "1111",
				        "0110",
				        "1110",
				        "0000",
				        "0000"
				      ]
				    }
				  ],
				  "epochPoints": [],
				  "finalAssignedEpoch": [
				    "TA0_0",
				    "TR1_30",
				    "TR3_2",
				    "TR2_83",
				    "TR5_63",
				    "TR4_13"
				  ],
				  "finalValueTimePoints": [
				    "0",
				    "2",
				    "13",
				    "30",
				    "63",
				    "83"
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

