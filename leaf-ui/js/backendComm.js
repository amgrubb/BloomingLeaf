
var global_analysisResult = {};

function backendComm(js_object){
	//Set this variable to true if executing on localhost
	var localhost = false;

	if(localhost){
		//Show in console just to see what is going to backend
		console.log(JSON.stringify(js_object));
		analysisResults = {};

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
