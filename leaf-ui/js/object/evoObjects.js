class IntentionColorVis {
    constructor() {
        this.id;
        this.evals; // List of percentages that each evaluation holds
        this.timePoints = []; // Array of evals at each time point
        this.initializeEvalDict();
    }

    initializeEvalDict() {
        this.evals = {};

        this.evals = {
            "0000": 0.0,
            "0011": 0.0,
            "0010": 0.0,
            "0100": 0.0,
            "0110": 0.0,
            "1111": 0.0,
            "0111": 0.0,
            "1100": 0.0,
            "1110": 0.0
        };
    }
}

/**
 * Colors the nodes based on the different EVO types 
 * This order is created intentionally for the frontend. Please DO NOT change the order
 */
class EVO {
    
    // Gives the numerical representation of a given satisfaction value
    static charSatValueToNum = {
        "FS" : "0011",
        "FP" : "0111",
        "PS" : "0010",
        "FF" : "1111",
        "PP" : "0110",
        "nn" : "0000",
        "PF" : "1110",
        "PD" : "0100",
        "FD" : "1100"
    
    }
    
    //Red-blue palette
    static colorVisDict1= {
        "0000": "#b5b5b5", // None (⊥, ⊥)
        "0011": "#003fff", // Satisfied (F, ⊥)
        "0010": "#8FB8DE", // Partially satisfied (P, ⊥)
        "0100": "#fbaca8", // Partially denied (⊥, P)
        "0110": "#9400D3", // Conflict (P, P)
        "0111": "#5946b2", // Conflict (F, P)
        "1100": "#FF2600", // Fully denied (⊥, F)
        "1110": "#ca2c92", // Conflict (P, F)
        "1111": "#0D0221"  // Conflict (F, F)
    };

    // The Red-Green Palette
    static colorVisDict2 = {
        "0000": "#a77f7f",
        "0011": "#c12a38",
        "0010": "#e05c8a",
        "0100": "#54705a",
        "0110": "#d4c400",
        "0111": "#704e43",
        "1100": "#13644e",
        "1110": "#775f1e",
        "1111": "#2a2a2a"
    };

    // The Green-Black Palette
    static colorVisDict3 = {
        "0000": "#d3d3d3",
        "0011": "#39ff14",
        "0010": "#b3f2f0",
        "0100": "#035096",
        "0110": "#008ecc",
        "0111": "#ba0098",
        "1100": "#616161",
        "1110": "#900091",
        "1111": "#a35604"
    };

    // The Yellow-Purple Palette
    static colorVisDict4 = {
        "0000": "#D3D3D3",
        "0011": "#FFFF00",
        "0010": "#fcf5bb",
        "0100": "#e0bfff",
        "0110": "#c56700",
        "0111": "#d9a000",
        "1100": "#9c1fdf",
        "1110": "#5946b2",
        "1111": "#0D0221"
    };

     // The Traffic-Light Palette
     static colorVisDict5 = {
        "0000": "#b5b5b5", // None (⊥, ⊥)
        "0011": "#549C30",// Satisfied (F, ⊥)
        "0010": "#F7DF00",// Partially satisfied
        "0100": "#FF8C11",// Partially denied 
        "0110": "#9DE3E3",// Conflict (P, P)
        "0111": "#083D77",// Conflict (F, P)
        "1100": "#DD1806",// Fully denied (⊥, 
        "1110": "#465974",// Conflict (P, F)
        "1111": "#3A3F3F"// Conflict (F, F)
 
    };

     // The Pastel Palette
     static colorVisDict6 = {
        "0000": "#7E9679",
        "0011": "#5F798C",
        "0010": "#6D94B0",
        "0100": "#D1757E",
        "0110": "#A784B3",
        "0111": "#8F89A4",
        "1100": "#C0595A",
        "1110": "#BC7BA6",
        "1111": "#5A5471"
    };

    // Color Blind palette
    static colorVisDict7 = {
     
        "0000": "#CCCCCC", // None (⊥, ⊥)
        "0011": "#0000FF", // Satisfied (F, ⊥)
        "0010": "#0000FF", // Partially satisfied (P, ⊥)
        "0100": "#FF0000", // Partially denied (⊥, P)
        "0110": "#FFFF00", // Conflict (P, P)
        "0111": "#FFFF00", // Conflict (F, P)
        "1100": "#FF0000", // Fully denied (⊥, F)
        "1110": "#FFFF00", // Conflict (P, F)
        "1111": "#FFFF00"  // Conflict (F, F)

    };

    //Initialize user-created-palette as Red-Blue
    static selfColorVisDict = {
        "0000": "#D3D3D3", // None (⊥, ⊥)
        "0011": "#003fff", // Satisfied (F, ⊥)
        "0010": "#8FB8DE", // Partially satisfied (P, ⊥)
        "0100": "#fbaca8", // Partially denied (⊥, P)
        "0110": "#9400D3", // Conflict (P, P)
        "0111": "#5946b2", // Conflict (F, P)
        "1100": "#FF2600", // Fully denied (⊥, F)
        "1110": "#ca2c92", // Conflict (P, F)
        "1111": "#0D0221"  // Conflict (F, F)
    };


    
    /**
     * List of color visualization dictionaries
     */
    static colorVisDictCollection = [
        EVO.colorVisDict1,  // red-blue palette
        EVO.colorVisDict2, // red-green palette 
        EVO.colorVisDict3, // green-black palette
        EVO.colorVisDict4, // yellow-purple palette
        EVO.colorVisDict5, // traffic-light palette
        EVO.colorVisDict6, // pastel palette
        EVO.colorVisDict7  // color-blind palette
    ];

    /**
     * Defines order of evaluations for filling intentions by %
     */
    static colorVisOrder = {
        6: "0000",
        1: "0011",
        2: "0010",
        8: "0100",
        4: "0110",
        3: "0111",
        9: "1100",
        7: "1110",
        5: "1111"
    };

    

    // Number of evaluation types
    static numEvals = Object.keys(EVO.colorVisDict1).length + 1;
    // Current time point, defined by selection in lower time point slider after simulating a single path
    static curTimePoint = 0;
    // User selected slider option
    static sliderOption = 0;
    // User selected color palette
    static paletteOption = 1;
    // Whether color blind mode is activated
    static isColorBlindMode = false;

    /**
     * Checks validity, sets sliderOption, and refreshes visualization
     * @param {String} newSliderOption 
     * @param {ResultBBM} analysisResult 
     */
    static setSliderOption(newSliderOption, analysisResult) {
        if (newSliderOption >= 0 && newSliderOption <= 3) {
            EVO.sliderOption = newSliderOption;
        }
        else {
            console.log("ERROR: invalid sliderOption");
        }
        EVO.refresh(analysisResult);
    }

    /**
     * Set new time point and refresh
     * @param {Number} newTimePoint 
     * @param {ResultBBM} analysisResult
     */
    static setCurTimePoint(newTimePoint, analysisResult) {
        EVO.curTimePoint = newTimePoint;
        EVO.refresh(analysisResult);
    }

    /**
     * Runs after any event that may change visualization, such as setting a sat value, changing slider option, or selecting a time point
     * @param {ResultBBM} analysisResult
    */
    static refresh(analysisResult) {
        var isAnalysis;
        // If EVO is on
        if (EVO.sliderOption > 0) {
            if (analysisResult !== undefined && analysisResult.get('selected')) { // If a result is selected
                EVO.colorIntentionsAnalysis(analysisResult);
            } else {
                EVO.colorIntentionsModeling();
            }
        }
        // If EVO is off
        else {
            if (analysisResult !== undefined && analysisResult.get('selected')) { // If a result is selected
                isAnalysis = true;
            } else {
                isAnalysis = false;
            }
            EVO.returnAllColors(graph.getElements(), paper);
            EVO.displaySlider(isAnalysis);
            EVO.revertIntentionsText(graph.getElements(), paper, isAnalysis);
        }
    }

    constructor(elementList) {
        this.numIntentions = elementList.length;
        this.numTimePoints = elementList[0].status.length;
        this.intentionListColorVis = [];
        // Assessable in next state window 
        this.isColorBlind = EVO.isColorBlindMode;
        this.paletteOption = EVO.paletteOption;
        this.selfColorVisDict = EVO.selfColorVisDict;
        this.initializeIntentionList();
    }

    /**
     * Switches to analysis slider, uses the single path analysis results to calculate evaluation percentages, stores time point info, prints info to console
     * @param {Object} elementList Array of the elements that contains the element's ID and analysis results
     * @param {ResultBBM} analysisResult
     */
    singlePathResponse(elementList, analysisResult) {
        $('#modelingSlider').css("display", "none");
        $('#analysisSlider').css("display", "");
        document.getElementById("colorResetAnalysis").value = EVO.sliderOption;
        var percentPerEvaluation = 1.0 / this.numTimePoints;

        // Calculate evaluation percentages and other data for ColorVis
        for (var i = 0; i < this.numIntentions; ++i) {
            this.intentionListColorVis[i].id = elementList[i].id;
            for (var k = 0; k < this.numTimePoints; ++k) {
                var currEval = elementList[i].status[k];
                // For fill intention by timepoint
                this.intentionListColorVis[i].timePoints.push(currEval);
                var newPercent = this.intentionListColorVis[i].evals[currEval];
                newPercent += percentPerEvaluation;
                this.intentionListColorVis[i].evals[currEval] = newPercent;
            }
        }
        this.generateConsoleReport();
        EVO.refresh(analysisResult);
    }


    /**
     * Turn off EVO
     * @param {ResultBBM} analysisResult
     */
    static deactivate(analysisResult) {
        document.getElementById("colorResetAnalysis").value = 0;
        document.getElementById("colorReset").value = 0;
        EVO.sliderOption = 0;
        EVO.refresh(analysisResult);
    }

    /**
     * Initialize the list of intentions
     */
    initializeIntentionList() {
        for (var i = 0; i < this.numIntentions; ++i) {
            this.intentionListColorVis[i] = new IntentionColorVis();
        }
    }

    /**
     * Prints evaluation percentage information to console
     */
    generateConsoleReport() {
        console.log("");
        console.log("Color Visualization Output:");

        for (var i = 0; i < this.numIntentions; ++i) {
            var intention = this.intentionListColorVis[i];
            console.log("Intention " + intention.id + ":");
            for (var j = 0; j < EVO.numEvals; ++j) {
                var evalType = EVO.colorVisOrder[j];
                if (intention.evals[evalType] > 0.0) {
                    // Output it to the console
                    console.log(evalType
                        + " -> "
                        + Math.floor(intention.evals[evalType] * 1000) / 10
                        + "%");
                }
            }
        }
    }

    /**
     * Used for filling intentions by time points or %. Creates a stripe visualization using gradients with a before and after buffer.
     * @param {Object} element 
     * Returns gradientID 
     */
    static defineGradient(element) {
        var gradientStops = [];
        var offsetTotal = 0.0;
        var currColor;

        if (EVO.sliderOption == 2) {
            // Fill by time
            var percentPerTimePoint = 1.0 / element.timePoints.length;
            for (var j = 0; j < element.timePoints.length; ++j) {
                currColor = EVO.getColor(element.timePoints[j]);
                // Before buffer
                offsetTotal += 0.001;
                gradientStops.push({
                    offset: String(offsetTotal * 100) + '%',
                    color: currColor
                });
                // Element color
                offsetTotal += percentPerTimePoint - 0.002;
                gradientStops.push({
                    offset: String(offsetTotal * 100) + '%',
                    color: currColor
                });
                // After buffer
                offsetTotal += 0.001;
                gradientStops.push({
                    offset: String(offsetTotal * 100) + '%',
                    color: currColor
                });
            }
        }
        else if (EVO.sliderOption == 1) {
            // Fill by %
            for (var j = 0; j < EVO.numEvals; ++j) {
                var intentionEval = EVO.colorVisOrder[j];
                if (element.evals[intentionEval] > 0) {
                    currColor = EVO.getColor(intentionEval);
                    // Before buffer
                    offsetTotal += 0.001;
                    gradientStops.push({
                        offset: String(offsetTotal * 100) + '%',
                        color: currColor
                    });
                    // Element color
                    offsetTotal += element.evals[intentionEval] - 0.002;
                    gradientStops.push({
                        offset: String(offsetTotal * 100) + '%',
                        color: currColor
                    });
                    // After buffer
                    offsetTotal += 0.001;
                    gradientStops.push({
                        offset: String(offsetTotal * 100) + '%',
                        color: currColor
                    });
                }
            }
        }
        var gradientId = paper.defineGradient({
            type: 'linearGradient',
            stops: gradientStops
        });
        return gradientId;
    }

    /**
     * Colors intentions by their evaluation information and slider option after simulating single path
     * @param {ResultBBM} analysisResult 
     */
    static colorIntentionsAnalysis(analysisResult) {
        var elements = graph.getElements();
        var actorBuffer = 0;

        for (var i = 0; i < elements.length; i++) {
            var cellView = elements[i].findView(paper);
            var intention = elements[i].get('intention');
            // If it is an actor or something went wrong
            if (intention == null) {
                actorBuffer += 1;
            }
            if (analysisResult.get('colorVis') !== undefined) {
                var element = analysisResult.get('colorVis').intentionListColorVis[i - actorBuffer];
                if (intention != null && element != null) {
                    if (EVO.sliderOption != 3) {
                        var gradientID = this.defineGradient(element);
                        // Visualize model at user selected timepoint
                        cellView.model.attr({ '.outer': { 'fill': 'url(#' + gradientID + ')' } });
                    }
                    else {
                        var timepoint = EVO.curTimePoint;
                        var intentionEval = element.timePoints[timepoint];
                        var color = EVO.getColor(intentionEval);
                        cellView.model.attr({ '.outer': { 'fill': color } });

                        //update text font to white if the chosen color is dark 
                        if (color != undefined){
                            if (isDark(color)) {
                                cellView.model.attr({ 'text': { 'fill': "white", stroke:"none" } });
                            }else {
                                cellView.model.attr({ 'text': { 'fill': "black", stroke:"none" } });
                            }
                        }
                        
                    }
                }
            }
        }
    }

    /**
     * Makes text on intentions white when EVO is activated
     * @param {ResultBBM} analysisResult 
     */
    static changeIntentionsText(analysisResult) {
        var elements = graph.getElements();
        var curr;
        var colorVis;
        var satVal;
        var intention;
        var initSatVal;
        var actor = 0; // Counts the number of actor 

        // Shows .satvalue automatically
        $('.satvalue').css("display", "");

        for (var i = 0; i < elements.length; i++) {
            curr = elements[i].findView(paper).model;
            if (curr.get('type') == 'basic.Actor') {
                actor++;
                continue;
            }
            
            // Sets satvalue/text to the initSatVal
            intention = curr.get('intention');
            initSatVal = intention.getUserEvaluationBBM(0).get('assignedEvidencePair');
            // If there is no initSatVal
            if (initSatVal === '(no value)') {
                curr.attr('.satvalue/text', '');
            } else {
                curr.attr('.satvalue/text', satisfactionValuesDict[initSatVal].satValue);
            }

            // The slider automatic setting
            EVO.displaySlider(false);

            if (analysisResult !== undefined) {
                // The EVO mode fill color
                curr.attr({ text: { fill: 'white', stroke: 'none' } });
                // If the result is selected 
                if (analysisResult.get('selected')) {
                    // If the option is states
                    if (EVO.sliderOption == 3) {
                        // Resets the satvalue back
                        colorVis = analysisResult.get('colorVis');
                        satVal = colorVis.intentionListColorVis[i-actor].timePoints[EVO.curTimePoint]; // Subtract actor from i to find intentionListColorVis for elements only
                        curr.attr('.satvalue/text', satisfactionValuesDict[satVal].satValue);
                        EVO.displaySlider(true);
                    }
                    // If it is % or time
                    else {
                        $('.satvalue').css("display", "none");
                    }
                }
                // If result is unselected
                else {
                    curr.attr({ text: { fill: 'black', stroke: 'none' } });
                }
            }
            // If a config without results is selected
            else {
                curr.attr({ text: { fill: 'black', stroke: 'none' } });
            }
        }
    }

    /** 
     * Makes slider dis/appear 
     * @param {Boolean} isOn 
     */
    static displaySlider(isOn) {
        // If the sliderOption is set at state or off
        if (isOn) {
            $('#slider').css("display", "");
            $('#sliderValue').css("display", "");
        }
        // If the sliderOption is at % and time and when no result is selected
        else {
            $('#slider').css("display", "none");
            $('#sliderValue').css("display", "none");
        }
    }

    /**
     * Returns text to black in modeling mode
     * @param {Boolean} isAnalysis
     */
    static revertIntentionsText(elements, paper, isAnalysis) {
        var curr;
        var intention;
        var initSatVal;
        // Displays .satvalue
        $('.satvalue').css("display", "");
        for (var i = 0; i < elements.length; i++) {
            curr = elements[i].findView(paper).model;

            if (curr instanceof joint.shapes.basic.Intention) {
                intention = curr.get('intention');
                // If the intention is defined set initSatVal to the intention's initSatVal
                if (intention != null) {
                    initSatVal = intention.getUserEvaluationBBM(0).get('assignedEvidencePair');
                } else { // If the intention is not defined, set initSatVal to null
                    initSatVal = null;
                }

                // Sets satvalue/text to the initial sat value
                if (!isAnalysis) {
                    if (initSatVal === '(no value)' || initSatVal === null) {
                        curr.attr('.satvalue/text', '');
                    } else {
                        curr.attr('.satvalue/text', satisfactionValuesDict[initSatVal].satValue);
                    }
                }
                curr.attr({ text: { fill: 'black', stroke: 'none' } });
            }
        }
    }

    /**
     * Changes each intention by their initial user set satisfaction value in modeling mode
     */
    static colorIntentionsModeling() {
        var initSatVal;
        var elements = graph.getElements();
        for (var i = 0; i < elements.length; i++) {
            var cellView = elements[i].findView(paper);
            // Aquires current intention
            var intention = elements[i].get('intention');
            if (intention != null) {
                // User set initial sat value
                var initSatVal = intention.getUserEvaluationBBM(0).get('assignedEvidencePair');
                if (initSatVal == '(no value)') {
                    cellView.model.changeToOriginalColour();
                }
                var colorChange = EVO.getColor(initSatVal);

                // Change intention color to match sat value
                cellView.model.attr({ '.outer': { 'fill': colorChange } });

                //update text font to white if the chosen color is dark 
                if (colorChange != undefined){
                    if (isDark(colorChange)) {
                        cellView.model.attr({ text: { fill: 'white', stroke: 'none' }})
                    }else {
                        cellView.model.attr({ text: { fill: 'black', stroke: 'none' }});
                    }
                }
                
                
            } else {
                cellView.model.changeToOriginalColour();
            }
        }
    }

    /**
     * Returns color that corresponds to an intention eval. Checks for color blind mode first.
     * @param {String} intentionEval four digit code that corresponds to evidence pair (ex. 0011)
     */
    static getColor(intentionEval) {

        if (EVO.paletteOption <= 7) {
            return EVO.colorVisDictCollection[EVO.paletteOption - 1][intentionEval];
        }

        if (EVO.paletteOption >= 8) {
            return EVO.selfColorVisDict[intentionEval];
        }
    }

    /**
     * Returns element color to based on element type
     */
    static returnAllColors(elements, paper) {
        for (var i = 0; i < elements.length; i++) {
            var cellView = elements[i].findView(paper);
            cellView.model.changeToOriginalColour();
        }
    }

    /**
     * Switch back to modeling slider, if EVO is on the visualization returns to filling by initial state.
     * @param {ResultBBM} analysisResult
     */
    static switchToModelingMode(analysisResult) {
        $('#modelingSlider').css("display", "");
        $('#analysisSlider').css("display", "none");

        if (EVO.sliderOption > 0) {
            EVO.sliderOption = '1';
        }
        document.getElementById("colorReset").value = EVO.sliderOption;
        EVO.refresh(analysisResult);

    }
    /**
     * Refresh the slider for when switching between configs and results
     * @param {ResultBBM} analysisResult
     */
    static refreshSlider(analysisResult) {
        // If switching to configs
        if (analysisResult == undefined) {
            $('#modelingSlider').css("display", "");
            $('#analysisSlider').css("display", "none");
            if (EVO.sliderOption > 0) {
                EVO.sliderOption = '1';
            }
            document.getElementById("colorReset").value = EVO.sliderOption;
        }
        // If switching to result
        else {
            $('#modelingSlider').css("display", "none");
            $('#analysisSlider').css("display", "");
            document.getElementById("colorResetAnalysis").value = EVO.sliderOption;
        }
        EVO.refresh(analysisResult);
    }

    /**
     * Toggles color blind mode
     * @param {Boolean} isTurningOnColorBlindMode 
     * @param {ResultBBM} analysisResult
     */
    static toggleColorBlindMode(isTurningOnColorBlindMode, analysisResult) {
        EVO.isColorBlindMode = isTurningOnColorBlindMode;
        EVO.refresh(analysisResult);
    }

    /**
     * Fill in self-dictionary
     */
    static fillInDictionary() {
        if (EVO.paletteOption == 9 & document.getElementById("my-Satisfied").value!= document.getElementById("my-Denied").value & document.getElementById("my-Satisfied").value!= document.getElementById("my-None").value & document.getElementById("my-Satisfied").value!= document.getElementById("my-FF").value & document.getElementById("my-Denied").value!= document.getElementById("my-None").value & document.getElementById("my-FF").value!= document.getElementById("my-Denied").value & document.getElementById("my-None").value!= document.getElementById("my-FF").value ){
            EVO.selfColorVisDict = {
                "0000": document.getElementById("my-None").value,
                "0011": document.getElementById("my-Satisfied").value,
                "0010": document.getElementById("my-PS").value,
                "0100": document.getElementById("my-PD").value,
                "0110": document.getElementById("my-PP").value,
                "0111": document.getElementById("my-FP").value,
                "1100": document.getElementById("my-Denied").value,
                "1110": document.getElementById("my-PF").value,
                "1111": document.getElementById("my-FF").value
            };
            return true
        } else{
            return false  
        }
        
    }
}

class EVONextState {
    // User selected slider option in the next state window
    static sliderOptionNextState = 0;

    /**
     * This sets the color blind mode option to whatever it was in the previous window
     */
    static setColorBlindFromPrevWindow() {     
        EVONextState.isColorBlindMode = myInputJSObject.results.get('colorVis').isColorBlind;
    }
    /**
     * This sets the color palette option to whatever it was in the previous window
     */
    static setColorPaletteFromPrevWindow() {
        EVONextState.paletteOption = myInputJSObject.results.get('colorVis').paletteOption;
    }
    /**
     * Sets new slider option and refreshes to make applicable changes
     * @param {String} newSliderOption 
     */
    static setSliderOptionNextState() {
        var newSliderOption = $('#colorResetAnalysis').val();
        if (newSliderOption >= 0 && newSliderOption <= 2) {
            EVONextState.sliderOptionNextState = newSliderOption;
        } else {
            console.log("ERROR: invalid sliderOption");
        }
        EVONextState.refresh();
    }

    /**
     * Changes visual layout depending on slider option.
     */
    static refresh() {
        switch (this.sliderOptionNextState) {
            case '1':
                EVONextState.colorIntentionsByPercents();
                this.changeIntentionsText(analysis);
                break;

            case '2':
                EVONextState.colorIntentionsByState();
                this.changeIntentionsText(analysis);
                break;

            default: // ColorVis off
                EVONextState.returnAllColors(analysis);
                this.changeIntentionsText(analysis);
                break;
        }
    }

    /**
     * Changes each intention by their satisfaction value for the displayed state
     */
    static colorIntentionsByState() {
        var value;
        var cellView;
        var colorChange;

        for (var i = 0; i < analysis.intentions.length; i++) {
            var element = analysis.intentions[i];
            value = element.attr(".satvalue").value;
            cellView = element.findView(analysis.paper);
            colorChange = EVONextState.getColor(value);
            cellView.model.attr({ '.outer': { 'fill': colorChange } });
        }
    }

    /**
     * Colors intentions by the percentages of possible next states that hold each evaluation.
     */
    static colorIntentionsByPercents() {
        var intentionPercents = [];

        allSolutionArray = [];      
        // Iterates over the hashmap allSolutions and combines all of the solutions into one array
        for (var key in myInputJSObject.results.get('allSolutions')) {
            // Adds every element (which are arrays) in the old array to the new array
            myInputJSObject.results.get('allSolutions')[key].forEach(
                solution => {
                    allSolutionArray.push(solution);
                });
        }
        var percentPerEvaluation = 1.0 / allSolutionArray.length; // Total number of solutions
        // Store: ID + percents per eval
        for (var i = 0; i < analysis.intentions.length; i++) { // For each elements
            // Compile and calculate % for each node -> % must be updated every time a filter is applied
            intentionPercents.push(new IntentionColorVis());
            for (var j = 0; j < allSolutionArray.length; j++) { // For each next state
                // tempResults.get('allSolutions')[solutionArray][solution_index][element_index];
                var currEval = allSolutionArray[j][i];
                var newPercent = intentionPercents[i].evals[currEval];
                newPercent += percentPerEvaluation;
                intentionPercents[i].evals[currEval] = newPercent;
            }
            var gradientID = this.defineGradient(intentionPercents[i]);
            var element = analysis.intentions[i];
            var cellView = element.findView(analysis.paper);
            cellView.model.attr({ '.outer': { 'fill': 'url(#' + gradientID + ')' } });
        }
    }

    /**
     * Returns color that corresponds to an intention eval. Checks for color blind mode first.
     * @param {String} intentionEval four digit code that corresponds to evidence pair (ex. 0011)
     */
    static getColor(intentionEval) {
        if (EVONextState.isColorBlindMode) {
            return EVO.colorVisDictColorBlind[intentionEval];
        }

        if (EVONextState.paletteOption < 8) {

            return EVO.colorVisDictCollection[EVONextState.paletteOption - 1][intentionEval];
        }
        if (EVONextState.paletteOption == 8) {
            var selfVis = myInputJSObject.results.get('colorVis').selfColorVisDict;

            return selfVis[intentionEval];
        }

    }



    /**
     * Creates a gradient for an intention in colorIntentionsByPercents()
     * @param {Object} element 
     */
    static defineGradient(element) {
        var gradientStops = [];
        var offsetTotal = 0.0;
        var currColor;

        for (var j = 0; j < EVO.numEvals; ++j) {
            var intentionEval = EVO.colorVisOrder[j];
            if (element.evals[intentionEval] > 0) {
                currColor = EVONextState.getColor(intentionEval);
                // Before buffer
                offsetTotal += 0.001;
                gradientStops.push({
                    offset: String(offsetTotal * 100) + '%',
                    color: currColor
                });
                // Element color
                offsetTotal += element.evals[intentionEval] - 0.002;
                gradientStops.push({
                    offset: String(offsetTotal * 100) + '%',
                    color: currColor
                });
                // After buffer
                offsetTotal += 0.001;
                gradientStops.push({
                    offset: String(offsetTotal * 100) + '%',
                    color: currColor
                });
            }
        }
        var gradientId = analysis.paper.defineGradient({
            type: 'linearGradient',
            stops: gradientStops
        });
        return gradientId;        
    }

    /**
    * Returns element color to based on element type
    */
        static returnAllColors(analysis) {
        for (var i = 0; i < analysis.intentions.length; i++) {
            var cellView = analysis.intentions[i].findView(analysis.paper);
            cellView.model.changeToOriginalColour();
        }
    }

    /**
     * Changes text color to white when EVO is on
     */
    static changeIntentionsText(analysis) {
        
        if (EVONextState.sliderOptionNextState != '0') {
            for (let element of analysis.intentions) {
                element.attr({ text: { fill: 'white' } });
            }
        } else {
            for (let element of analysis.intentions) {
                var satValue = element.attr(".satvalue").value;
                if ( (satValue == "0000") || (satValue == "0100") || (satValue == "1000") || (satValue == "1100") || (satValue == "0001") || (satValue == "0011") || (satValue == "0010")) {
                    element.attr({ text: { fill: 'black' } });
                } else {
                    element.attr({ text: { fill: 'red' } });
                }
            }
        }
    }


}