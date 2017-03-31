function backendComm(js_object){
	var analysisResults = {
			  "timePoints": [
				    "TA0-0",
				    "TA1-2",
				    "TA2-3",
				    "TA3-4",
				    "TR5-12",
				    "TR4-19",
				    "TR6-39",
				    "TR7-75",
				    "TR8-77"
				  ],
				  "times": [
				    "0|0",
				    "1|2",
				    "2|3",
				    "3|4",
				    "4|12",
				    "5|19",
				    "6|39",
				    "7|75",
				    "8|77"
				  ],
				  "elementList": [
				    {
				      "id": "0000",
				      "valueList": [
				        "1100",
				        "0110",
				        "1110",
				        "1100",
				        "1111",
				        "0011",
				        "1111",
				        "1100",
				        "0000"
				      ]
				    },
				    {
				      "id": "0001",
				      "valueList": [
				        "0011",
				        "0010",
				        "1110",
				        "0100",
				        "0111",
				        "0011",
				        "0111",
				        "1111",
				        "0010"
				      ]
				    },
				    {
				      "id": "0002",
				      "valueList": [
				        "1100",
				        "0111",
				        "0110",
				        "1100",
				        "1111",
				        "0011",
				        "1111",
				        "1100",
				        "0000"
				      ]
				    }
				  ],
				  "epochPoints": [],
				  "finalAssignedEpoch": [
				    "TA0_0",
				    "TA2_3",
				    "TA1_2",
				    "TR5_12",
				    "TA3_4",
				    "TR4_19",
				    "TR7_75",
				    "TR6_39",
				    "TR8_77"
				  ],
				  "finalValueTimePoints": [
				    "0",
				    "2",
				    "3",
				    "4",
				    "12",
				    "19",
				    "39",
				    "75",
				    "77"
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

