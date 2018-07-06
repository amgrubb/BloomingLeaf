//Defining a scope to store all data being executed
var storage = {};
//Store the information sent to backend for single path analysis
storage.singlePathAnalysis = {};
//Store the results from backend analysis for single path
storage.singlePathResults = {};
//Store the information sent to backend for next states analysis
storage.nextStatesAnalysis = {};
//Store the results from backend analysis for next states
storage.nextStatesResults = {};

var global_originalAnalysis = {};
var exploreAnalysisCurrentState = 0;
var global_analysisResult = {};

function backendComm(js_object){
    /**
     * Print the input to the console.
     */
    //console.log(JSON.stringify(js_object));
    global_analysisResult.currentState = js_object.analysis.currentState;
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
                    storage.nextStatesAnalysis = js_object;
                    exploreAnalysisCurrentState = js_object.analysis.currentState.split("|")[0];
                    executeJava(true);
                }else{
                    storage.singlePathAnalysis = js_object;
                    //TODO: remove global_originalAnalysis and replace with singlePathAnalysis
                    global_originalAnalysis = js_object;
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
                //console.log(JSON.stringify(JSON.parse(response['data'])));
                //TODO: remove the global_analysisResult it should be deprecated
                global_analysisResult = analysisResults;
                if (analysisResults == ""){
                    alert("Error while reading the response file from server. This can be due an error in executing java application.")
                    return
                }
                if(isGetNextSteps){
                    storage.nextStatesResults = analysisResults;
                    open_analysis_viewer();
                }else{
                    storage.singlePathResults = analysisResults;
                    displayAnalysis(analysisResults);
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
    var w = window.open(url, Date.now(), "status=0,title=0,height=600,width=1200,scrollbars=1");

    if (!w) {
        alert('You must allow popups for this map to work.');
    }

}

