
/**  
 * Prevents conflict in coloring modes. Refreshes when changes are made in the model.
 * EVO operates though IntentionColoring to allow for a deactivation mode
 */
class IntentionColoring {
    static colorMode = "none"; //none, EVO, cycle
    static isColorBlindMode = false; //color blind mode

    /**
     * Colors intentions by their mode
     */
    static refresh() {
        switch(IntentionColoring.colorMode) {
            case "EVO":
                EVO.refresh();
                break;
            case "cycle":
                break;
            // default: //do nothing
            //     console.log("nothing");
            //     break;
        }
    }

    /**
     * Change color mode
     * @param {*} newColorMode 
     */
    static setColorMode(newColorMode) {
        console.log("setColorMode");
        IntentionColoring.colorMode = newColorMode;
        if(newColorMode != "EVO") {
            EVO.deactivate();
        }
        IntentionColoring.refresh();
    }

    /**
     * Toggles color blind mode
     * @param {*} isTurningOnColorBlindMode 
     */
    static toggleColorBlindMode(isTurningOnColorBlindMode) {
        IntentionColoring.isColorBlindMode = isTurningOnColorBlindMode;
        IntentionColoring.refresh();
    }
        
}

class intentionColorVis{
    constructor()
    {
        this.id;
        this.evals; //list of percentages that each evaluation holds
        this.timePoints = []; //array of evals at each time point
        this.initializeEvalDict();
    }

    initializeEvalDict()
    {
        this.evals = {};

        this.evals = {
            "0000" : 0.0, 
            "0011" : 0.0, 
            "0010" : 0.0,
            "0100" : 0.0,
            "0110" : 0.0,
            "1111" : 0.0,
            "0111" : 0.0,
            "1100" : 0.0,
            "1110" : 0.0 };
    }
}

class EVO {
/**
 * TODO: docstring 
 * 
 */
    // static colorVisDict = {
    //     "0000" : "#FFFFFF",
    //     "0011" : "#001196",
    //     "0010" : "#8FB8DE",
    //     "0100" : "#DBAADD",
    //     "0110" : "#643A71",
    //     "0111" : "#8B5FBF", 
    //     "1100" : "#FF2600",
    //     "1110" : "#8D5A97", 
    //     "1111" : "#0D0221" };
//replaced white with grey for readability
    static colorVisDict = {
        "0000" : "#D3D3D3",
        "0011" : "#003fff",
        "0010" : "#8FB8DE",
        "0100" : "#fbaca8",
        "0110" : "#9400D3",
        "0111" : "#5946b2", 
        "1100" : "#FF2600",
        "1110" : "#ca2c92", 
        "1111" : "#0D0221" };
    /**
     * Defines order of evaluations for filling intentions by %
     */
    static colorVisOrder = {
            6: "0000" ,
            1: "0011" ,
            2: "0010" ,
            8: "0100" ,
            4: "0110" ,
            3: "0111" ,
            9: "1100" ,
            7: "1110" ,
            5: "1111" };

     //replaces all conflicting evals with dark grey
     static colorVisDictColorBlind = {
            "0000" : "#D3D3D3",
            "0011" : "#003fff",
            "0010" : "#8FB8DE",
            "0100" : "#fbaca8",
            "0110" : "#333333",
            "0111" : "#333333", 
            "1100" : "#FF2600",
            "1110" : "#333333", 
            "1111" : "#333333" };

    //number of evaluation types
    static numEvals = Object.keys(EVO.colorVisDict).length + 1;
    //current time point, defined by selection in lower time point slider after simulating a single path
    static curTimePoint = 0;
    //user selected slider option
    static sliderOption = 0;
    //whether color blind mode is activated
    //static isColorBlindMode = false;

    /**
     * Checks validity, sets sliderOption, and refreshes visualization
     * @param {*} newSliderOption 
     */
    static setSliderOption(newSliderOption) {
        if(newSliderOption >= 0 && newSliderOption <= 3) {
            EVO.sliderOption = newSliderOption;
        }
        else {
            console.log("ERROR: invalid sliderOption");
        }
        EVO.refresh();

        if(EVO.sliderOption > 0) { //not off
            IntentionColoring.setColorMode("EVO");
        }
    }

    /**
     * Set new time point and refresh
     * @param {*} newTimePoint 
     */
    static setCurTimePoint(newTimePoint) {
        EVO.curTimePoint = newTimePoint;
        IntentionColoring.refresh();
    }

    /**
     * Runs after any event that may change visualization, such as setting a sat value, changing slider option, or selecting a time point
     */
    static refresh() {
        switch(this.sliderOption) {
            case '1':
            case '2':
            case '3':
                if(!analysisResult.isPathSim ) {
                EVO.colorIntentionsModeling();
                }
                else {
                EVO.colorIntentionsAnalysis();
                }
                EVO.changeIntentionsText();
                break;
            default://colorVis off
                EVO.returnAllColors(graph.getElements(), paper);
                EVO.revertIntentionsText(graph.getElements(), paper);    
                    break;
        }
    }
        
    constructor(elementList) {
        this.numIntentions = elementList.length;
        this.numTimePoints = elementList[0].status.length;
        this.intentionListColorVis = [];  
        this.isColorBlind = IntentionColoring.isColorBlindMode; //assessable in next state window  
        this.initializeIntentionList();
    }  

    /**
     * Switches to analysis slider, uses the single path analysis results to calculate evaluation percentages, stores time point info, prints info to console
     * @param {*} elementList List of elements containing analysis results
     */
    singlePathResponse(elementList) {
        $('#modelingSlider').css("display", "none");
        $('#analysisSlider').css("display", "");
        document.getElementById("colorResetAnalysis").value = EVO.sliderOption;

        var percentPerEvaluation = 1.0 / this.numTimePoints;

        //calculate evaluation percentages and other data for ColorVis
        for(var i = 0; i < this.numIntentions; ++i) 
        {
            this.intentionListColorVis[i].id = elementList[i].id;
            for(var k = 0; k < this.numTimePoints; ++k) 
            { 
                    var currEval = elementList[i].status[k]; 
                    this.intentionListColorVis[i].timePoints.push(currEval); //for fill intention by timepoint
                    var newPercent = this.intentionListColorVis[i].evals[currEval];
                    newPercent += percentPerEvaluation;
                    this.intentionListColorVis[i].evals[currEval] = newPercent;
            }
        }
        this.generateConsoleReport();
        EVO.refresh();
    }    

    /**
     * Turn off EVO
     */
    static deactivate() {
        document.getElementById("colorResetAnalysis").value = 0;
        document.getElementById("colorReset").value = 0;
        EVO.sliderOption = 0;

        EVO.refresh();
    }

    /**
     * Initialize the list of intentions
     */
    initializeIntentionList()  {
        for(var i = 0; i < this.numIntentions; ++i) {
            this.intentionListColorVis[i] = new intentionColorVis();
        }
    }

    /**
     * Prints evaluation percentage information to console
     */
    generateConsoleReport() {
        console.log("");
        console.log("Color Visualization Output:");

        if(analysisResult.colorVis != null) {
        for(var i = 0; i < analysisResult.colorVis.numIntentions; ++i) {
            var intention = analysisResult.colorVis.intentionListColorVis[i];
            console.log("Intention " + intention.id+":");

            for(var j = 0; j < EVO.numEvals; ++j) {
                var evalType = EVO.colorVisOrder[j];
                if(intention.evals[evalType] > 0.0)  {
                    //output it to the console
                    console.log(evalType
                    + " -> "
                    + Math.floor(intention.evals[evalType] * 1000)/10
                    + "%");
                }
            }
        }
        }
        else {
            console.log("ERROR: colorVis is undefined.");
        }
    }

    /**
     * Used for filling intentions by time points or %. Creates a stripe visualization using gradients with a before and after buffer.
     * @param {*} element 
     * Returns gradientID 
     */
    static defineGradient(element) {
            var gradientStops = [];	
            var offsetTotal = 0.0;
            var currColor;
            //var gradientID;

            if(EVO.sliderOption == 2) { //fill by time
            var percentPerTimePoint = 1.0 / element.timePoints.length;
            //var timePointColor;
            for(var j = 0; j < element.timePoints.length; ++j) {
                currColor = EVO.getColor(element.timePoints[j]);

                //before buffer
                offsetTotal += 0.001;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: currColor})
                //element color
                offsetTotal += percentPerTimePoint - 0.002;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: currColor})
                //after buffer
                offsetTotal += 0.001;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: currColor})
            }

            }
            else if(EVO.sliderOption == 1) { //fill by %
            for(var j = 0; j < EVO.numEvals; ++j) {
            var intentionEval = EVO.colorVisOrder[j];
            if(element.evals[intentionEval] > 0) {
                currColor = EVO.getColor(intentionEval);
                //before buffer
                offsetTotal += 0.001;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: currColor})
                //element color
                offsetTotal += element.evals[intentionEval] - 0.002;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: currColor})
                //after buffer
                offsetTotal += 0.001;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: currColor})
            }
            } }

            var gradientId = paper.defineGradient({
            type: 'linearGradient',
            stops: gradientStops
            });

            return gradientId;
     }

     /**
      * Colors intentions by their evaluation information and slider option after simulating single path
      */
    static colorIntentionsAnalysis()
    {
        var count = 1;
        var elements = graph.getElements(); 
        var actorBuffer = 0;
    
        for (var i = 0; i < elements.length; i++) { 
            ++count;
            var cellView  = elements[i].findView(paper);
            var intention = model.getIntentionByID(cellView.model.attributes.nodeID);
    
            if(intention == null) { //is an actor or something went wrong
                actorBuffer += 1;
            }
    
            var element = analysisResult.colorVis.intentionListColorVis[i - actorBuffer];
                if(intention != null && element != null) {
                    if(EVO.sliderOption != 3) {
                    var gradientID = this.defineGradient(element);
                    cellView.model.attr({'.outer' : {'fill' : 'url(#' + gradientID + ')'}});
                    } //visualize model at user selected timepoint
                    else {
                        var timepoint = EVO.curTimePoint;
                        var intentionEval = element.timePoints[timepoint];
                        var color = EVO.getColor(intentionEval);
                        cellView.model.attr({'.outer' : {'fill' : color}})
                    }
                }
        }
    }

    /**
     * Makes text on intentions white when EVO is activated
     */
    static changeIntentionsText(){
        var elements = graph.getElements();
        var curr;
        var intention;
        var initSatVal;
        for (var i = 0; i < elements.length; i++) {
            curr = elements[i].findView(paper).model;

            if (curr.attributes.type !== 'basic.Goal' &&
                curr.attributes.type !== 'basic.Task' &&
                curr.attributes.type !== 'basic.Softgoal' &&
                curr.attributes.type !== 'basic.Resource') {
                continue;
            }
            intention = model.getIntentionByID(curr.attributes.nodeID);
            initSatVal = intention.getInitialSatValue();
            if(!analysisResult.isPathSim){   
                if (initSatVal === '(no value)') {
                    curr.attr('.satvalue/text', '');
                    curr.attr({text: {fill: 'black',stroke:'none','font-weight' : 'normal'}});

                }else{
                    curr = elements[i].findView(paper).model;
                    curr.attr({text: {fill: 'white',stroke:'none'}});
                }
            }else{
                curr = elements[i].findView(paper).model;
                curr.attr({text: {fill: 'white',stroke:'none'}});    
            }
        }
    }

    /**
     * returns text to black in modeling mode
     */
    static revertIntentionsText(elements, paper){
        var curr;
        for (var i = 0; i < elements.length; i++) {
            curr = elements[i].findView(paper).model;
            curr.attr({text: {fill: 'black',stroke:'none'}});
        }
    }

    /**
     * changes each intention by their initial user set satisfaction value in modeling mode
     */
    static colorIntentionsModeling(){
        var elements = graph.getElements();
        for (var i = 0; i < elements.length; i++){ 
            var cellView = elements[i].findView(paper); 
            var intention = model.getIntentionByID(cellView.model.attributes.nodeID); //aquires current intention
            if (intention != null){
            var initSatVal = intention.getInitialSatValue(); //user set initial sat value
            if (initSatVal == '(no value)') {
                cellView.model.changeToOriginalColour();
            }
           var colorChange = EVO.getColor(initSatVal);
            cellView.model.attr({'.outer': {'fill': colorChange}}); //change intention color to match sat value
        }else{
            cellView.model.changeToOriginalColour();
        }
        }
    }

    /**
     * Returns color that corresponds to an intention eval. Checks for color blind mode first.
     * @param {*} intentionEval four digit code that corresponds to evidence pair (ex. 0011)
     */
    static getColor(intentionEval) {
        if(IntentionColoring.isColorBlindMode) {
            return EVO.colorVisDictColorBlind[intentionEval];
        }
        return EVO.colorVisDict[intentionEval];
    }

    /**
     * Returns element color to based on element type
     */
    static returnAllColors(elements, paper){
        for (var i = 0; i < elements.length; i++){
            var cellView = elements[i].findView(paper);
            cellView.model.changeToOriginalColour();
        }
    }

    /**
     * Switch back to modeling slider, if EVO is on the visualization returns to filling by initial state.
     */
     static switchToModelingMode() {
        $('#modelingSlider').css("display", "");
        $('#analysisSlider').css("display", "none");
        // if EVO is on in analysis mode, keep it on
        if(EVO.sliderOption > 0) {
            EVO.sliderOption = '1';
        }
        document.getElementById("colorReset").value = EVO.sliderOption;
        IntentionColoring.refresh();
    }
}

class EVONextState  {
    //user selected slider option in the next state window
    static sliderOptionNextState = 0;

    /**
     * Next State window has new instance of EVO.
     * This passes the color blind mode option through the Next State window
     */
    static setColorBlindFromPrevWindow() {
        IntentionColoring.isColorBlindMode = window.opener.analysisResult.colorVis.isColorBlind;
    }

    /**
     * Sets new slider option and refreshes to make applicable changes
     * @param {*} newSliderOption 
     */
    static setSliderOption(newSliderOption) {
        if(newSliderOption >= 0 && newSliderOption <= 2) {
            EVONextState.sliderOptionNextState = newSliderOption;
        }
        else {
            console.log("ERROR: invalid sliderOption");
        }
        EVONextState.refresh();
    }

    /**
     * Changes visual layout depending on slider option.
     */
    static refresh() {
        switch(this.sliderOptionNextState) {
            case '1':
            EVONextState.colorIntentionsByState();
            this.changeIntentionsText(analysis.elements, analysis.paper);
                break;

            case '2':
            EVONextState.colorIntentionsByPercents();
            this.changeIntentionsText(analysis.elements, analysis.paper);
                break;

            default://colorVis off
               EVO.returnAllColors(analysis.elements, analysis.paper);
               EVO.revertIntentionsText(analysis.elements, analysis.paper);    
                break;
        }
    }

    /**
     * changes each intention by their satisfaction value for the displayed state
     */
    static colorIntentionsByState(){
        var cell;
        var value;
        var cellView;
        var colorChange;

        for(var i = 0; i < analysis.elements.length; i++){
            cell = analysis.elements[i];
            value = cell.attributes.attrs[".satvalue"].value;
            cellView = cell.findView(analysis.paper); 
            colorChange = EVO.getColor(value);
            cellView.model.attr({'.outer': {'fill': colorChange}}); 
        }
    }

    /**
     * Colors intentions by the percentages of possible next states that hold each evaluation.
     */
    static colorIntentionsByPercents(){
        var intentionPercents = [];
        //acquire all next state info
        var percentPerEvaluation = 1.0 / analysis.analysisResult.allSolution.length; //number of next states
        var step = 0;
        //store: ID + percents per eval
        for(var i = 0; i< analysis.elements.length; i++){ //for each elements
            //compile and calculate % for each node -> % must be updated every time a filter is applied
            intentionPercents.push(new intentionColorVis());
            for(var j = 0; j < analysis.analysisResult.allSolution.length; j++) { //for each next state
            var currEval = analysis.analysisResult.allSolution[j].intentionElements[i].status[step];
            var newPercent = intentionPercents[i].evals[currEval];
            newPercent += percentPerEvaluation;
            intentionPercents[i].evals[currEval] = newPercent;
            }
            var gradientID = this.defineGradient(intentionPercents[i]);
            var cell = analysis.elements[i];
            var cellView = cell.findView(analysis.paper); 
            cellView.model.attr({'.outer' : {'fill' : 'url(#' + gradientID + ')'}});
        }
    }

    /**
     * Creates a gradient for an intention in colorIntentionsByPercents()
     * @param {*} element 
     */
    static defineGradient(element) {
        var gradientStops = [];	
        var offsetTotal = 0.0;
        var currColor;
        //var gradientID;

        for(var j = 0; j < EVO.numEvals; ++j) {
            var intentionEval = EVO.colorVisOrder[j];
            if(element.evals[intentionEval] > 0) {
                currColor = EVO.getColor(intentionEval);
                //before buffer
                offsetTotal += 0.001;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: currColor})
                //element color
                offsetTotal += element.evals[intentionEval] - 0.002;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: currColor})
                //after buffer
                offsetTotal += 0.001;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: currColor})
            }
        }

        var gradientId = analysis.paper.defineGradient({
        type: 'linearGradient',
        stops: gradientStops
        });

        return gradientId;
    }

    /**
     * Changes text color to white when EVO is on.
     * @param {*} elements 
     * @param {*} paper 
     */
    static changeIntentionsText(elements, paper){
        var curr;
        var intention;
        for (var i = 0; i < elements.length; i++) {
            curr = elements[i].findView(paper).model;
            if(curr.attributes.type !== 'basic.Actor') {
                curr.attr({text: {fill: 'white',stroke:'none'}});
            }
        }
    }
}