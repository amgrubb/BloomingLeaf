
var global_analysisResult = {};

function backendComm(js_object){
	if(develop){
		//This var is created to add the JSON produced in backend for executing local testing.
		var analysisResults = {};
		global_analysisResult = analysisResults;
    	if(js_object.analysis.action == "allNextStates"){
			//Testing Explore Possible Next States
			open_analysis_viewer();
		}else{
			//Testing Simulate Single Path
			console.log(JSON.stringify(js_object));
			loadAnalysis(analysisResults);
			var currentValueLimit = parseInt(sliderObject.sliderElement.noUiSlider.get());
			var sliderMax = currentValueLimit + currentAnalysis.timeScale;
			sliderObject.sliderElement.noUiSlider.set(sliderMax);	
		}
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
				if(js_object.analysis.action=="allNextStates"){
					executeJava(true);					
				}else{
					executeJava(false);
				}
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
	var pathToCGI = "./cgi-bin/fileRead.cgi";

	//Executing action to send backend
	$.ajax({
		url: pathToCGI,
		type: "get",
		success: function(response){
			analysisResults = JSON.parse(response['data']);
			global_analysisResult = analysisResults;
			if (analysisResults == ""){
				alert("Error while reading the resonse file from server. This can be due an error in executing java application.")
				return
			}
			if(isGetNextSteps){
				open_analysis_viewer();
			}else{
				loadAnalysis(analysisResults);
				var currentValueLimit = parseInt(sliderObject.sliderElement.noUiSlider.get());
				var sliderMax = currentValueLimit + currentAnalysis.timeScale;
				sliderObject.sliderElement.noUiSlider.set(sliderMax);
			}

		}
	})
	.fail(function(){
		msg = "Error while executing CGI file: fileRead. Please contact the system Admin.";
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
