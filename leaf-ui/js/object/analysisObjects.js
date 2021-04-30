class AnalysisResult {

    /**
     * @param {Array.<String>} assignedEpoch
     *   Each element represents an epoch with its assigned value
     *   ex: ["TE2_2","TE1_32"]
     * @param {Array.<String>} timePointPath
     *   Each element represents a time point in the analysis
     *   ex: ['0', '7']
     * @param {Number} timePointPathSize
     *   Size of the time point path. ex: 2
     * @param {Array.<Object>} elementList
     *   List of elements containing analysis results
     *   ex: [{id: "0001", status:["0010","0100"]}]
     *   (for nodeID 0001, time point 0, its satisfaction value is "0010", timd point 1, its satisfaction value is "0100")
     * @param {Boolean} isPathSim
     *   Used for slider visualization
     *   true if single path simulated
     * @param {Array.<Object>} colorVis
     *   Color visualization for analysis mode
     *   ex: {numIntentions: 21, numTimePoints: 2, intentionListColorVis: Array(21), isColorBlind: false}
     * @param {Number} selectedTimePoint
     *   Finds where slider is initialized and sets timepoint in here
     *   Also place it in update function
     *   ex: 1
     * @param {Number} timeScale
     *   Number of time point in the analysis (except 0)
     *   Replaces maxTimePoint for clarity
     *   ex: 10
     */

    constructor(analysisResult) {
        if (arguments.length == 1){
            // construct from object in shape of analysisRequest
            // for loading from saved file
            this.assignedEpoch = analysisResult.assignedEpoch;
            this.timePointPath = analysisResult.timePointPath;
            this.timePointPathSize = analysisResult.timePointPathSize;
            this.elementList = analysisResult.elementList; 
            this.allSolution = analysisResult.allSolution; //potentially deprecated
            this.elementListPercentEvals = analysisResult.elementListPercentEvals;
            this.isPathSim = analysisResult.isPathSim ; //used for slider visualization
            this.colorVis = analysisResult.colorVis; //color visualization for analysis mode  
            this.selectedTimePoint = analysisResult.selectedTimePoint; //find where slider is initialized and set timepoint in here. Also place it in update function
            this.timeScale = analysisResult.timeScale;
        } else {
            // new default analysisResult
            this.assignedEpoch;
            this.timePointPath ;
            this.timePointPathSize;
            this.elementList; 
            this.allSolution; //potentially deprecated
            this.elementListPercentEvals;
            this.isPathSim = false; //used for slider visualization
            this.colorVis; //color visualization for analysis mode  
            this.selectedTimePoint; //find where slider is initialized and set timepoint in here. Also place it in update function
            this.timeScale;
        }
    }

    setTimeScale() {
        this.timeScale = Number(this.timePointPath.length) - 1;
    }
}

class AnalysisRequest {

    /**
     *
     * @param {String} action
     * @param {String} conflictLevel
     * @param {String} numRelTime
     * @param {String} absTimePts
     * @param {String} absTimePtsArr
     * @param {String} currentState
     * @param {Array.<UserEvaluation>} userAssignmentsList
     * @param {AnalysisResult} previousAnalysis
     */
    constructor(analysisRequest) {
        if (arguments.length == 1){
            // construct from object in shape of analysisRequest
            // for loading from saved file
            this.action = analysisRequest.action;
            this.conflictLevel = analysisRequest.conflictLevel;
            this.numRelTime = analysisRequest.numRelTime;
            this.absTimePts = analysisRequest.absTimePts;
            this.absTimePtsArr = analysisRequest.absTimePtsArr;
            this.currentState = analysisRequest.currentState;
            this.userAssignmentsList = analysisRequest.userAssignmentsList;
            this.previousAnalysis = analysisRequest.previousAnalysis;
        } else {
            // new default analysisRequest
            this.action = null;
            this.conflictLevel = "S";
            this.numRelTime = "1";
            this.absTimePts = "";
            this.absTimePtsArr = [];
            this.currentState = "0";
            this.userAssignmentsList = [];
            this.previousAnalysis = null;
        }
    }

    /**
     * Returns the UserEvaluation object
     * with node id nodeID with absolute time point
     * absTime. If the desired UserEvaluation does
     * not exist, returns null.
     *
     * @param {String} nodeID
     *  ID of the intention
     * @param {String} absTime
     *  The desired absolute time
     * @returns {UserEvaluation | null}
     */
    getUserEvaluationByID(nodeID, absTime) {
        for (var i = 0; i < this.userAssignmentsList.length; i++) {
            if (this.userAssignmentsList[i].intentionID == nodeID &&
                this.userAssignmentsList[i].absTime == absTime) {
                return this.userAssignmentsList[i];
            }
        }
    }


    /**
     * Deletes all the absTimePts that are not in the intersection
     * of the old and new absTimePits in this.userAssignmentsList
     */
    changeTimePoints(newTimePts){
        console.log("changeTimePoints in analysisRequest");
        console.log(newTimePts);
         var intersection = this.absTimePtsArr.filter(x => newTimePts.includes(x));
         if (intersection.length == 0){
             this.clearUserEvaluations();
             this.absTimePtsArr = newTimePts;
             return
         }
         var i = 0;
         console.log(this.userAssignmentsList);
         while (i < this.userAssignmentsList.length){
             if (!intersection.includes(this.userAssignmentsList[i].absTime) && this.userAssignmentsList[i].absTime != 0){
                 this.userAssignmentsList.splice(i, 1);
             }
             else{
                 i++;
             }
         }

        console.log(this.userAssignmentsList);

         this.absTimePtsArr = newTimePts;

         console.log(newTimePts);


    }

    /**
     * Deletes all UserEvaluations in this.userAssignmentsList
     * with the exception of the initial UserEvaluations
     */
    clearUserEvaluations() {
        var i = 0;
        while (i < this.userAssignmentsList.length) {
            if (this.userAssignmentsList[i].absTime !== '0') {
                this.userAssignmentsList.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    /**
     * Removes the UserEvaluation object in
     * userAssignmentsList that corresponds with nodeID
     *
     * @param {String}
     */
    removeIntention(nodeID) {
        for (var i = 0; i < this.userAssignmentsList.length; i++) {
            if (this.userAssignmentsList[i].intentionID == nodeID) {
                this.userAssignmentsList.splice(i, 1);
                break;
            }
        }
    }

}

class AnalysisConfiguration {

	/**
	 * This class is used to hold analysis configuration specifications and results 
	 * for view in the analysis configuration & results sidebar. 
	 * The object is initialized by passing in an AnalysisRequest object into the constructor.
	 * 
	 * @param {String} id
	 * @param {AnalysisRequest} analysisRequest
	 * @param {Int} initialPosition
     * @param {Array.<UserEvaluation>} userAssignmentsList
     * @param {Array.<AnalysisResult>} analysisResults
	 */

	constructor(id, analysisRequest, initialPosition) {
		this.id = id;
		this.analysisRequest = analysisRequest;
        this.userAssignmentsList = analysisRequest.userAssignmentsList;
        this.analysisResults = [];
		this.initialPosition = initialPosition;
	}

	/**
	 * Add a new AnalysisResult to the analysisResults array.
	 * @param {AnalysisResult} analysisResult 
	 */
	addResult(analysisResult) {
		this.analysisResults.push(analysisResult);
	}

	/**
	 * Set the AnalysisResults param
	 * @param {Array.<AnalysisResult>} analysisResults 
	 */
	setResults(analysisResults) {
		// if results not AnalysisResult class yet, convert to AnalysisResult
		for (var i = 0; i < analysisResults.length; i++){
			if (! (analysisResults[i] instanceof AnalysisResult)) {
				analysisResults[i] = new AnalysisResult(analysisResults[i])
			}
		}

		this.analysisResults = analysisResults;
	}

	/**
	 * Delete all analysisResults
	 * @param {AnalysisResult} analysisResult 
	 */
	deleteResults() {
		this.analysisResults = [];
	}

	/**
	 * Updates Config Values from AnalysisRequest
	 */
	updateAnalysis(analysisRequest){
		this.analysisRequest = analysisRequest;
		this.userAssignmentsList = analysisRequest.userAssignmentsList;
	}

	updateId(id){
		this.id = id;
	}

	/**
	 * Updates user assignments list param for config and for config's analysisRequest
	 */
	updateUAL(userAssignmentsList){
		this.userAssignmentsList = userAssignmentsList;
		this.analysisRequest.userAssignmentsList = userAssignmentsList;
	}

	/**
	 * Returns AnalysisRequest object associated with this Config
	 * This is currently used to streamline getting request from currentAnalysisConfig
	 * TODO: Consider/switch to a more efficient way to return 
	 * since this is duplicate data being held in the Config 
	 */
	getAnalysisRequest(){
		return this.analysisRequest;
	}

	/**
	 * Returns a JSON representation of the AnalysisConfig object
	 */
	stringify(){
		return JSON.stringify(this);
	}
}
