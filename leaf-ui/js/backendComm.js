
var global_analysisResult = {};

function backendComm(js_object){
	console.log(JSON.stringify(js_object));
	
	//Add object here to test
	var singlePath = {
			  "elementList": [
				    {
				      "id": "0000",
				      "valueList": [
				        "1100",
				        "1100",
				        "1100",
				        "1110",
				        "1100",
				        "1110"
				      ]
				    },
				    {
				      "id": "0001",
				      "valueList": [
				        "1100",
				        "0100",
				        "1110",
				        "1110",
				        "1110",
				        "1110"
				      ]
				    },
				    {
				      "id": "0002",
				      "valueList": [
				        "1100",
				        "1100",
				        "0100",
				        "1110",
				        "0000",
				        "1110"
				      ]
				    }
				  ],
				  "finalAssignedEpoch": [
				    "TA0_0",
				    "TR1_56",
				    "TR3_54",
				    "TR2_31",
				    "TR5_16",
				    "TR4_39"
				  ],
				  "finalValueTimePoints": [
				    "0",
				    "16",
				    "31",
				    "39",
				    "54",
				    "56"
				  ]
				};
	var getNextStates = {
			  "elementList": [
				    {
				      "id": "0000",
				      "valueList": [
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100"
				      ]
				    },
				    {
				      "id": "0001",
				      "valueList": [
				        "0010",
				        "0010",
				        "0010",
				        "0011",
				        "0000",
				        "0000",
				        "0000",
				        "0000",
				        "0000",
				        "0111",
				        "0111",
				        "0111",
				        "0110",
				        "0110",
				        "0110",
				        "0110",
				        "0110",
				        "0110",
				        "0110",
				        "0110",
				        "0110",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "0100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1110",
				        "1110",
				        "1110",
				        "1110",
				        "1110",
				        "1110",
				        "1110",
				        "1110",
				        "1110"
				      ]
				    },
				    {
				      "id": "0002",
				      "valueList": [
				        "0010",
				        "0011",
				        "0010",
				        "0011",
				        "0000",
				        "0000",
				        "0011",
				        "0010",
				        "0000",
				        "0111",
				        "0111",
				        "0011",
				        "0111",
				        "0110",
				        "0110",
				        "0010",
				        "0110",
				        "0010",
				        "0011",
				        "0111",
				        "0110",
				        "0000",
				        "0100",
				        "0000",
				        "0100",
				        "0011",
				        "0010",
				        "0000",
				        "0100",
				        "0110",
				        "0111",
				        "0100",
				        "0110",
				        "0111",
				        "0100",
				        "0100",
				        "1100",
				        "1110",
				        "0111",
				        "0110",
				        "0100",
				        "0010",
				        "0011",
				        "0000",
				        "0000",
				        "0100",
				        "1100",
				        "1100",
				        "1110",
				        "1110",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1100",
				        "1110",
				        "1110",
				        "1110",
				        "1110",
				        "0111",
				        "0110",
				        "0011",
				        "0010",
				        "1110"
				      ]
				    }
				  ],
				  "finalAssignedEpoch": [],
				  "finalValueTimePoints": []
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
			analysisResults = JSON.parse(response.data);
			if (analysisResults == ""){
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

	var w = window.open(url, "Analysis View", "status=0,title=0,height=600,width=1200,scrollbars=1");
	
	if (!w) {
	    alert('You must allow popups for this map to work.');
	}

}


