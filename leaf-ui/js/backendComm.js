
var global_analysisResult = {};

function backendComm(js_object){
	/**
	* Print the input to the console.
	*/
	console.log(JSON.stringify(js_object));

	//backend script called
	var pathToCGI = "./cgi-bin/backendCom.cgi";

 	$.ajax({
		url: pathToCGI,
		type: "post",
		contentType: "json",
		data:JSON.stringify(js_object),
		success: function(response){
			setTimeout(function(){
				if(js_object.analysis.action=="allNextStates"){
					executeJava(true);
				}else{
					executeJava(false);
				}
		    }, 500);  
		}
	})	.fail(function(){
		msg = "Ops! Something went wrong.";
		alert(msg);
	});

}

function executeJava(isGetNextSteps){
	var pathToCGI = "./cgi-bin/executeJava.cgi";
	$.ajax({
		url: pathToCGI,
		type: "get",
		success: function(response){
		    setTimeout(function(){
				getFileResults(isGetNextSteps);
		    }, 500);  
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
			var errorMsg = analysisResults.errorMessage;
			if(errorMsg){
				alert(errorMsg);
			}else{
				/**
					* Print the response data to the console.
				*/
					console.log(JSON.stringify(JSON.parse(response['data'])));

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
