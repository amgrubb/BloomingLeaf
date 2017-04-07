
var global_analysisResult = {};

function backendComm(js_object){
	console.log(JSON.stringify(js_object));
	
	var singlePath = {
			  "elementList": [
				    {
				      "id": "0000",
				      "valueList": [
				        "0011",
				        "0000",
				        "0100",
				        "0011",
				        "0110",
				        "0011"
				      ]
				    },
				    {
				      "id": "0001",
				      "valueList": [
				        "0010",
				        "0000",
				        "1100",
				        "0000",
				        "0110",
				        "1110"
				      ]
				    },
				    {
				      "id": "0002",
				      "valueList": [
				        "0011",
				        "1100",
				        "0100",
				        "0011",
				        "1110",
				        "0011"
				      ]
				    },
				    {
				      "id": "0003",
				      "valueList": [
				        "0010",
				        "0000",
				        "1100",
				        "0000",
				        "0010",
				        "1110"
				      ]
				    },
				    {
				      "id": "0004",
				      "valueList": [
				        "0011",
				        "0010",
				        "0100",
				        "0000",
				        "0111",
				        "1110"
				      ]
				    },
				    {
				      "id": "0005",
				      "valueList": [
				        "0011",
				        "1100",
				        "0000",
				        "0011",
				        "1110",
				        "0011"
				      ]
				    },
				    {
				      "id": "0006",
				      "valueList": [
				        "0011",
				        "1100",
				        "0100",
				        "0011",
				        "0111",
				        "0011"
				      ]
				    }
				  ],
				  "finalAssignedEpoch": [
				    "TA0_0",
				    "TR1_84",
				    "TR3_56",
				    "TR2_99",
				    "TR5_41",
				    "TR4_14"
				  ],
				  "finalValueTimePoints": [
				    "0",
				    "14",
				    "41",
				    "56",
				    "84",
				    "99"
				  ]
				};
	
	var getNextStates = {
			  "elementList": [
				    {
				      "id": "0000",
				      "valueList": [
				        "0011",
				        "0000",
				        "0100",
				        "0011",
				        "0110",
				        "0011"
				      ]
				    },
				    {
				      "id": "0001",
				      "valueList": [
				        "0010",
				        "0000",
				        "1100",
				        "0000",
				        "0110",
				        "1110"
				      ]
				    },
				    {
				      "id": "0002",
				      "valueList": [
				        "0011",
				        "1100",
				        "0100",
				        "0011",
				        "1110",
				        "0011"
				      ]
				    },
				    {
				      "id": "0003",
				      "valueList": [
				        "0010",
				        "0000",
				        "1100",
				        "0000",
				        "0010",
				        "1110"
				      ]
				    },
				    {
				      "id": "0004",
				      "valueList": [
				        "0011",
				        "0010",
				        "0100",
				        "0000",
				        "0111",
				        "1110"
				      ]
				    },
				    {
				      "id": "0005",
				      "valueList": [
				        "0011",
				        "1100",
				        "0000",
				        "0011",
				        "1110",
				        "0011"
				      ]
				    },
				    {
				      "id": "0006",
				      "valueList": [
				        "0011",
				        "1100",
				        "0100",
				        "0011",
				        "0111",
				        "0011"
				      ]
				    }
				  ],
				  "finalAssignedEpoch": [
				    "TA0_0",
				    "TR1_84",
				    "TR3_56",
				    "TR2_99",
				    "TR5_41",
				    "TR4_14"
				  ],
				  "finalValueTimePoints": [
				    "0",
				    "14",
				    "41",
				    "56",
				    "84",
				    "99"
				  ]
				};
	
	if(js_object.analysis.getNextState){
		global_analysisResult = getNextStates;
		open_analysis_viewer();
	}else{
		loadAnalysis(singlePath);		
	}
	
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
			executeJava(js_object.analysis.getNextState);
			console.log(response);
		}
	})	.fail(function(){
		msg = "Ops! Something went wrong.";
		alert(msg);
	});
	*/
}

function executeJava(isGetNextSteps){
	var pathToCGI = "./cgi-bin/executeJava.cgi";
	$.ajax({
		url: pathToCGI,
		type: "get",
		success: function(response){
			getFileResults(isGetNextSteps);
		}
	})
	.fail(function(){
		msg = "Ops! Something went wrong. Executing java.";
		alert(msg);
	});
}


function getFileResults(isGetNextSteps){
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
			
			if(isGetNextSteps){
				global_analysisResult = analysisResults;
				open_analysis_viewer();
			}else{
				loadAnalysis(analysisResults);				
				var currentValueLimit = parseInt(sliderObject.sliderElement.noUiSlider.get());
				var sliderMax = currentValueLimit + currentAnalysis.timeScale;
				sliderObject.sliderElement.noUiSlider.set(sliderMax);
			}
		console.log(JSON.stringify(response));
		}
	})
	.fail(function(){
		msg = "Ops! Something went wrong getting file.";
		alert(msg);
	});
}


function open_analysis_viewer(){
	var urlBase = document.URL.substring(0, document.URL.lastIndexOf('/')+1);
	var url = urlBase+"analysis.html";	

	//var thisIsAnObject = {"foo":"bar"};
	var w = window.open(url, "Analysis View", "status=0,title=0,height=600,width=1200,scrollbars=1");
	
	if (!w) {
	    alert('You must allow popups for this map to work.');
	}

}


