function backendComm(js_object){
	var analysisResults = {
			  "timePoints": [
				    "TA0_0",
				    "TA1_1",
				    "TA2_5",
				    "TA3_10",
				    "TR4_96",
				    "TR5_78"
				  ],
				  "unsolvedTimePoints": [
				    "TA1_1",
				    "TA2_5",
				    "TA3_10",
				    "TR4_96",
				    "TR5_78"
				  ],
				  "values": [],
				  "elementList": [
				    {
				      "id": 0,
				      "stateList": [
				        0,
				        1,
				        2,
				        3,
				        4,
				        5
				      ],
				      "valueList": [
				        "0000",
				        "1110",
				        "0110",
				        "0000",
				        "0000",
				        "0111"
				      ]
				    },
				    {
				      "id": 1,
				      "stateList": [
				        0,
				        1,
				        2,
				        3,
				        4,
				        5
				      ],
				      "valueList": [
				        "0000",
				        "0010",
				        "0110",
				        "0000",
				        "0000",
				        "0011"
				      ]
				    },
				    {
				      "id": 2,
				      "stateList": [
				        0,
				        1,
				        2,
				        3,
				        4,
				        5
				      ],
				      "valueList": [
				        "0000",
				        "1110",
				        "0110",
				        "0010",
				        "0010",
				        "0111"
				      ]
				    }
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

