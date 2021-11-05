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
 */
class EVO {
    static colorVisDict = {
        "0000": "#D3D3D3",
        "0011": "#003fff",
        "0010": "#8FB8DE",
        "0100": "#fbaca8",
        "0110": "#9400D3",
        "0111": "#5946b2",
        "1100": "#FF2600",
        "1110": "#ca2c92",
        "1111": "#0D0221"
    };

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

    // Replaces all conflicting evals with dark grey
    static colorVisDictColorBlind = {
        "0000": "#D3D3D3",
        "0011": "#003fff",
        "0010": "#8FB8DE",
        "0100": "#fbaca8",
        "0110": "#333333",
        "0111": "#333333",
        "1100": "#FF2600",
        "1110": "#333333",
        "1111": "#333333"
    };

    // Number of evaluation types
    static numEvals = Object.keys(EVO.colorVisDict).length + 1;
    // Current time point, defined by selection in lower time point slider after simulating a single path
    static curTimePoint = 0;
    // User selected slider option
    static sliderOption = 0;
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
            EVO.changeIntentionsText(analysisResult);
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
        this.isColorBlind = false;
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
        if (EVO.isColorBlindMode) {
            return EVO.colorVisDictColorBlind[intentionEval];
        }
        return EVO.colorVisDict[intentionEval];
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
}

class EVONextState {
    // User selected slider option in the next state window
    static sliderOptionNextState = 0;

    /**
     * Next State window has new instance of EVO.
     * This passes the color blind mode option through the Next State window
     */
    static setColorBlindFromPrevWindow() {
        EVO.isColorBlindMode = window.opener.analysisResult.colorVis.isColorBlind;
    }

    /**
     * Sets new slider option and refreshes to make applicable changes
     * @param {String} newSliderOption 
     */
    static setSliderOption(newSliderOption) {
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
                EVONextState.colorIntentionsByState();
                this.changeIntentionsText(analysis.elements, analysis.paper);
                break;

            case '2':
                EVONextState.colorIntentionsByPercents();
                this.changeIntentionsText(analysis.elements, analysis.paper);
                break;

            default: // ColorVis off
                EVO.returnAllColors(analysis.elements, analysis.paper);
                EVO.revertIntentionsText(analysis.elements, analysis.paper);
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

        for (var i = 0; i < analysis.elements.length; i++) {
            cell = analysis.elements[i];
            value = cell.attributes.attrs[".satvalue"].value;
            cellView = cell.findView(analysis.paper);
            colorChange = EVO.getColor(value);
            cellView.model.attr({ '.outer': { 'fill': colorChange } });
        }
    }

    /**
     * Colors intentions by the percentages of possible next states that hold each evaluation.
     */
    static colorIntentionsByPercents() {
        var intentionPercents = [];
        // Acquire all next state info
        var percentPerEvaluation = 1.0 / analysis.analysisResult.allSolution.length; // Number of next states
        var step = 0;
        // Store: ID + percents per eval
        for (var i = 0; i < analysis.elements.length; i++) { // For each elements
            // Compile and calculate % for each node -> % must be updated every time a filter is applied
            intentionPercents.push(new IntentionColorVis());
            for (var j = 0; j < analysis.analysisResult.allSolution.length; j++) { // For each next state
                var currEval = analysis.analysisResult.allSolution[j].intentionElements[i].status[step];
                var newPercent = intentionPercents[i].evals[currEval];
                newPercent += percentPerEvaluation;
                intentionPercents[i].evals[currEval] = newPercent;
            }
            var gradientID = this.defineGradient(intentionPercents[i]);
            var cell = analysis.elements[i];
            var cellView = cell.findView(analysis.paper);
            cellView.model.attr({ '.outer': { 'fill': 'url(#' + gradientID + ')' } });
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

    /**
     * Changes text color to white when EVO is on
     */
    static changeIntentionsText(elements, paper) {
        var curr;
        for (var i = 0; i < elements.length; i++) {
            curr = elements[i].findView(paper).model;
            if (curr.attributes.type !== 'basic.Actor') {
                curr.attr({ text: { fill: 'white', stroke: 'none' } });
            }
        }
    }
}