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
