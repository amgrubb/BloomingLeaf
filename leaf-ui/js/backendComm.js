
var global_analysisResult = {};

function backendComm(js_object){
	//Set this variable to true if executing on localhost
	var localhost = true;
	
	if(localhost){
		//Show in console just to see what is going to backend
		console.log(JSON.stringify(js_object));
		analysisResults = {
		  "elementList": [
		    {
		      "id": "0000",
		      "status": [
		        "0111",
		        "1110",
		        "0111",
		        "1110",
		        "0100",
		        "1100"
		      ]
		    },
		    {
		      "id": "0001",
		      "status": [
		        "0011",
		        "0011",
		        "0011",
		        "0110",
		        "0111",
		        "0100"
		      ]
		    },
		    {
		      "id": "0002",
		      "status": [
		        "0111",
		        "1110",
		        "0111",
		        "1110",
		        "0100",
		        "1110"
		      ]
		    }
		  ],
		  "allSolution": [
		    
		  ],
		  "finalAssignedEpoch": [
		    "TA0_0",
		    "TR1_62",
		    "TR3_83",
		    "TR2_18",
		    "TR5_71",
		    "TR4_33"
		  ],
		  "finalValueTimePoints": [
		    "0",
		    "18",
		    "33",
		    "62",
		    "71",
		    "83"
		  ],
		  "relativeTimePoints": 5
		};
		
		loadAnalysis(analysisResults);
		var currentValueLimit = parseInt(sliderObject.sliderElement.noUiSlider.get());
		var sliderMax = currentValueLimit + currentAnalysis.timeScale;
		sliderObject.sliderElement.noUiSlider.set(sliderMax);
	
	}else{
		//backend script called
		var pathToCGI = "./cgi-bin/backendCom.cgi";
		/**
		 * UNCOMMENT THE CODE BELLOW TO EXECUTE ON SERVER
		 */

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
		
	}

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
			analysisResults = JSON.parse(response);
			if (analysisResults == ""){
				alert("Ops! We couldn't read output.out file.")
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
