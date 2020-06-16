class Model {

    /**
     * Attributes:
     * {Array.<Actor>} actors
     * {Array.<Intention>} intentions
     * {Array.<Link>} links
     * {Array.<Constraint>} constraints
     * {String} maxAbsTime
     */
    constructor() {
        this.actors = [];
        this.intentions = [];
        this.links = [];
        this.constraints = [];
        this.maxAbsTime = "100";
    }

    /**
     * Returns the Intention with node ID
     * nodeID
     *
     * @param {String} nodeID
     * @returns {Intention}
     */
    getIntentionByID(nodeID) {
        for (var i = 0; i < this.intentions.length; i++) {
            if (this.intentions[i].nodeID == nodeID) {
                return this.intentions[i];
            }
        }
    }

    /**
     * Returns the Actor with nodeID nodeID
     *
     * @param {String} nodeID
     * @returns {Actor}
     */
    getActorByID(nodeID) {
        for (var i = 0; i < this.actors.length; i++) {
            if (this.actors[i].nodeID == nodeID) {
                return this.actors[i];
            }
        }
    }

    /**
     * Returns the Links with linkID linkID
     *
     * @param {String} linkID
     * @returns {Link}
     */
    getLinkByID(linkID) {
        for (var i = 0; i < this.links.length; i++) {
            if (this.links[i].linkID == linkID) {
                return this.links[i];
            }
        }
    }

    /**
     * Returns the absolute Constraint object with
     * constraintSrcID srcID and source epoch boundary
     * srcEB
     *
     * @param {String} srcID
     * @param {String} source
     * @returns {Number}
     */
    getAbsConstBySrcID(srcID, srcEB) {
        for (var i = 0; i < this.constraints.length; i++) {
            if (this.constraints[i].constraintType === 'A' &&
                this.constraints[i].constraintSrcID === srcID &&
                this.constraints[i].constraintSrcEB === srcEB) {
                return this.constraints[i];
            }
        }
    }

    /**
     * Sets the absolute value for the absolute Constraint object
     * with constraintSrcID srcID
     *
     * @param {String} srcID
     * @param {String} srcEB
     * @param {Number} absVal
     */
    setAbsConstBySrcID(srcID, srcEB, absVal) {
        var constraint = this.getAbsConstBySrcID(srcID, srcEB);
        if (constraint) {
            constraint.absoluteValue = absVal;
        }
    }

    /**
     * Saves the relative intention assignment provided by 
     * the parameters, into this object's constraints array
     */
    saveRelIntAssignment(type, id1, epoch1, id2, epoch2) {
        var constraint = null;
        for (var i = 0; i < this.constraints.length; i++) {
            var currConst = this.constraints[i];
            if (currConst.constraintSrcID === id1 && 
                currConst.constraintDestID === id2 &&
                currConst.constraintSrcEB === epoch1 &&
                currConst.constraintDestEB === epoch2) {
                constraint = currConst;
                break;
            }
        }

        if (constraint != null) {
            constraint.constraintType = type;
        } else {
            this.constraints.push(new Constraint(type, id1, epoch1, id2, epoch2));
        }
    }

    /**
     * Remove the Constraint constraint from
     * the constraints array
     *
     * @param {Constraint} constraint
     */
    removeConstraint(constraint) {
        for (var i = 0; i < this.constraints.length; i++) {
            var c = this.constraints[i];
            if (JSON.stringify(c) === JSON.stringify(constraint)) {
                this.constraints.splice(i, 1);
                return;
            }
        }
    }

    /**
     * Remove the intention with node ID nodeID
     * from the intentions array and remove all constraints
     * associated with that node
     *
     * @param {String} nodeID
     */
    removeIntention(nodeID) {

        // remove the intention from the intentions array
        for (var i = 0; i < this.intentions.length; i++) {
            if (this.intentions[i].nodeID == nodeID) {
                this.intentions.splice(i, 1);
                break;
            }
        }

        // remove all constraints associated with the intention
        var i = 0;
        while (i < this.constraints.length) {
            if (this.constraints[i].constraintSrcID === nodeID ||
                this.constraints[i].constraintDestID === nodeID) {
                this.constraints.splice(i, 1);
            } else {
                i++;
            }

        }




    }

    removedynamicFunction(nodeID){
       for (var i = 0; i < this.intentions.length; i++) {
           if (this.intentions[i].nodeID == nodeID) {
               //if (this.intentions[i].dynamicFunction.stringDynVis !== "NT"){
                   this.intentions[i].dynamicFunction.stringDynVis = "DT";
                   this.intentions[i].dynamicFunction.functionSegList = [];
               //}
           }
       }
   }

   removeIntentionLinks(nodeID){
       for (var i = 0; i < this.links.length; i++) {
           if (this.links[i].linkSrcID == nodeID || this.links[i].linkDestID == nodeID) {
               this.links.splice(i, 1);

               return;

           }

       }
   }

    /**
     * Remove the intention with link ID linkID
     * from the links array
     *
     * @param {String} linkID
     */
    removeLink(linkID) {
        for (var i = 0; i < this.links.length; i++) {
        }
        for (var i = 0; i < this.links.length; i++) {
            if (this.links[i].linkID == linkID) {
                this.links.splice(i, 1);
                return;
            }
        }
    }

    /**
     * Remove the Actor with node ID nodeID
     * from the actors array and update all intentions
     * that was embedded within the embedded actor
     *
     * @param {String} nodeID
     */
    removeActor(nodeID) {
        for (var i = 0; i < this.actors.length; i++) {
            if (this.actors[i].nodeID == nodeID) {
                this.actors.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Returns true iff constraint already exists in
     * this.constraints
     *
     * @param {Constraint} constraint
     * @returns {Boolean}
     */
    existsConstraint(constraint) {
        for (var i = 0; i < this.constraints.length; i++) {
            var c = this.constraints[i];

            if (JSON.stringify(c) === JSON.stringify(constraint)) {
                return true;
            }
        }
        return false;
    }


}

class Actor {

    /**
     * @param {String} nodeID
     *   ID of this node. ex: ('a000')
     * @param {String} nodeName
     *   Name of this node. ex: ('Actor_0')
     * @param {Array.<String>} intentionsIDs
     *   Array of intention IDs, for the intentions
     *   embedded inside this actor
     */
    constructor(nodeName) {
        this.nodeID = this.createID();
        this.nodeName = nodeName;
        this.intentionIDs = [];
    }

    /**
     * Creates and returns a 4 digit ID for this Actor
     *
     * @returns {String}
     */
    createID() {
        var id = Actor.numOfCreatedInstances.toString();
        Actor.numOfCreatedInstances += 1;
        while (id.length < 3){
            id = '0' + id;
        }
        return 'a' + id;
    }

    /**
     * Removes intention ID nodeID from the
     * intentionIDs array
     *
     * @param{String} nodeID
     */
    removeIntentionID(nodeID) {
        for (var i = 0; i < this.intentionIDs.length; i++) {
            if (this.intentionIDs[i] == nodeID) {
                this.intentionIDs.splice(i, 1);
                return ;
            }
        }
        while (i < this.userAssignmentsList.length) {
            if (this.userAssignmentsList[i].intentionID == nodeID) {
                this.userAssignmentsList.splice(i, 1);
            } else {
                i++;
            }
        }

    }
}
Actor.numOfCreatedInstances = 0;


class AnalysisResult {
    /**
     * @param {Array.<String>} assignedEpoch
     * @param {Array.<String>} timePointPath
     *   Each element represents a time point in the analysis
     *   ex: ['0', '7']
     * @param {Number} timePointPathSize
     *   Size of the time point path. ex: 2
     * @param {Object} values
     *   Maps an intention ID and time point to a string which
     *   represents the evaluation for that intention
     *   ex: {'0000': {'0': '0000', '7': 'DNE'}}
     *   (for nodeID 0000, time point 0, its satisfaction value is none)
     */

    constructor() {
        this.assignedEpoch;
        this.timePointPath ;
        this.timePointPathSize;
        this.elementList; 
        this.allSolution;
        this.elementListPercentEvals;
        this.isPathSim = false; //used for slider visualization
        this.colorVis; //color visualization for analysis mode  
    }
}

class intentionColorVis{
    constructor()
    {
        this.id;
        //this.numEvals;
        this.evals;
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

class ColorVisual {
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

    static numEvals = Object.keys(ColorVisual.colorVisDict).length + 1;
    static curTimePoint = 0;
    static sliderOption = 0;

    static setSliderOption(newSliderOption) {
        if(newSliderOption >= 0 && newSliderOption <= 3) {
            ColorVisual.sliderOption = newSliderOption;
        }
        else {
            console.log("ERROR: invalid sliderOption");
        }
        ColorVisual.refresh();
    }

    static setCurTimePoint(newTimePoint) {
        ColorVisual.curTimePoint = newTimePoint;
        ColorVisual.refresh();
    }

    static refresh() {
        console.log("inside ColorVisualSlider static method refresh()");
        switch(this.sliderOption) {
            case '1':
            case '2':
            case '3':
                if(!analysisResult.isPathSim ) {
               // console.log("changing intentions by initial state");
                ColorVisual.changeIntentions();
                }
                else {
               // console.log("filling intentions by: "+sliderOption);
                ColorVisual.changeIntentionsColorVis();
                }
                ColorVisual.changeIntentionsText();
                break;
            default://colorVis off
                ColorVisual.returnAllColors();
                ColorVisual.revertIntentionsText();    
                    break;
        }
    }
        
    constructor(elementList) {
        this.numIntentions = elementList.length;
        this.numTimePoints = elementList[0].status.length;
        this.intentionListColorVis = [];        
        this.initializeIntentionListColorVis();
        //this.singlePathResponse(elementList);
    }  

    singlePathResponse(elementList) {
        console.log("inside singlePathResponse");
        $('#modelingSlider').css("display", "none");
        $('#analysisSlider').css("display", "");
        document.getElementById("colorResetAnalysis").value = ColorVisual.sliderOption;

        var percentPerEvaluation = 1.0 / this.numTimePoints;
        console.log("percentagePerEvaluation = "+percentPerEvaluation);
       
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
        ColorVisual.refresh();
    }    

    initializeIntentionListColorVis()  {
        for(var i = 0; i < this.numIntentions; ++i) {
            this.intentionListColorVis[i] = new intentionColorVis();
        }
    }

    //prints colorVis information
    generateConsoleReport() {
        console.log("");
        console.log("Color Visualization Output:");

        if(analysisResult.colorVis != null) {
        for(var i = 0; i < analysisResult.colorVis.numIntentions; ++i) {
            var intention = analysisResult.colorVis.intentionListColorVis[i];
            console.log("Intention " + intention.id+":");

            for(var j = 0; j < ColorVisual.numEvals; ++j) {
                var evalType = ColorVisual.colorVisOrder[j];
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


    static defineGradient(element) {
            var gradientStops = [];	
            var offsetTotal = 0.0;
            //var gradientID;

            if(ColorVisual.sliderOption == 2) { //fill by time
            var percentPerTimePoint = 1.0 / element.timePoints.length;
            var timePointColor;
            for(var j = 0; j < element.timePoints.length; ++j) {
                timePointColor = ColorVisual.colorVisDict[element.timePoints[j]];
                //before buffer
                offsetTotal += 0.001;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: ColorVisual.colorVisDict[element.timePoints[j]]})
                //element color
                offsetTotal += percentPerTimePoint - 0.002;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: ColorVisual.colorVisDict[element.timePoints[j]]})
                //after buffer
                offsetTotal += 0.001;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: ColorVisual.colorVisDict[element.timePoints[j]]})
            }

            }
            else if(ColorVisual.sliderOption == 1) { //fill by %
            for(var j = 0; j < ColorVisual.numEvals; ++j) {
            var intentionEval = ColorVisual.colorVisOrder[j];
            if(element.evals[intentionEval] > 0) {
                //before buffer
                offsetTotal += 0.001;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: ColorVisual.colorVisDict[intentionEval]})
                //element color
                offsetTotal += element.evals[intentionEval] - 0.002;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: ColorVisual.colorVisDict[intentionEval]})
                //after buffer
                offsetTotal += 0.001;
                gradientStops.push({offset: String(offsetTotal*100) + '%',
                color: ColorVisual.colorVisDict[intentionEval]})
            }
            } }

            var gradientId = paper.defineGradient({
            type: 'linearGradient',
            stops: gradientStops
            });
            

            return gradientId;
     }

    //color intentions by their evaluation information from simulate single path
    // previously changeIntentionsByPercentage
    static changeIntentionsColorVis()
    {
        var count = 1;
        var elements = graph.getElements(); 
        var actorBuffer = 0;
    
        for (var i = 0; i < elements.length; i++){  //iterate through elements
            ++count;
    
            var cellView  = elements[i].findView(paper);
            var intention = model.getIntentionByID(cellView.model.attributes.nodeID);
    
            if(intention == null) //is an actor or something went wrong
            {
                actorBuffer += 1;
            }
    
            var element = analysisResult.colorVis.intentionListColorVis[i - actorBuffer];
                if(intention != null && element != null) {
                    if(ColorVisual.sliderOption != 3) {
                    var gradientID = this.defineGradient(element);
                    cellView.model.attr({'.outer' : {'fill' : 'url(#' + gradientID + ')'}});
                    } //visualize model at user selected timepoint
                    else {
                        var timepoint = ColorVisual.curTimePoint;
                        //TODO: delete instance of ColorVisual when switching to modeling mode
                        var intentionEval = element.timePoints[timepoint];
                        var color = ColorVisual.colorVisDict[intentionEval];
                        cellView.model.attr({'.outer' : {'fill' : color}})
                    }
                }
        }
    }

    //makes text on intentions white when EVO is activated
    static changeIntentionsText(inAnalysis){
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
                    curr.attr({text: {fill: 'black',stroke:'none','font-weight' : 'normal','font-size': 10}});

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

    //returns text to black in modeling mode
    static revertIntentionsText(){
        var elements = graph.getElements();
        var curr;
        for (var i = 0; i < elements.length; i++) {
            curr = elements[i].findView(paper).model;
            curr.attr({text: {fill: 'black',stroke:'none'}});
        }
    }

    //changes each intention by their initial user set satisfaction value in modeling mode
    static changeIntentions(){
        var elements = graph.getElements();
        for (var i = 0; i < elements.length; i++){ 
            var cellView = elements[i].findView(paper); 
            var intention = model.getIntentionByID(cellView.model.attributes.nodeID); //aquires current intention
            if (intention != null){
            var initSatVal = intention.getInitialSatValue(); //user set initial sat value
            console.log(initSatVal);
            if (initSatVal == '(no value)')
            {
                cellView.model.changeToOriginalColour();
            }
            var colorChange = ColorVisual.colorVisDict[initSatVal]; //get color for cooresponding sat value
            cellView.model.attr({'.outer': {'fill': colorChange}}); //change intention color to match sat value
        }else{
            cellView.model.changeToOriginalColour();
        }
        }
    }

    //returns element color to based on element type
    static returnAllColors(){
            var elements = graph.getElements();
            for (var i = 0; i < elements.length; i++){
                var cellView = elements[i].findView(paper);
                cellView.model.changeToOriginalColour();
            }
        }

     static switchToModelingMode() {
            $('#modelingSlider').css("display", "");
            $('#analysisSlider').css("display", "none");
        if(ColorVisual.sliderOption > 0) {
            ColorVisual.sliderOption = '1';
        }
        document.getElementById("colorReset").value = ColorVisual.sliderOption;
        ColorVisual.refresh();
        }

}

class Link {

    /**
     * @param {String} linkType
     *   Type of the link. ex: 'AND', 'OR', 'NO', etc.
     * @param {String} linkSrcID
     *   ID for the source of the link. ex: '0000'
     * @param {String} linkDestID
     *   ID for the destination of the link. ex: '0001'
     * @param {Number} absoluteValue
     *   TODO ex. -1, 0,...,n
     */
    constructor(linkType, linkSrcID, absoluteValue) {
        this.linkID = this.createID();
        this.linkType = linkType;
        this.postType = null;
        this.linkSrcID = linkSrcID;
        this.linkDestID = null;
        this.absoluteValue = absoluteValue;
    }

    /**
     * Creates and returns a 4 digit ID for this link
     *
     * @returns {String}
     */
    createID() {
        var id = Link.numOfCreatedInstances.toString();
        Link.numOfCreatedInstances += 1;
        while (id.length < 4){
            id = '0' + id;
        }
        return id;
    }

    /**
     * Returns true iff this Link object represents
     * an evolving relationship
     * @returns {Boolean}
     */
    isEvolvingRelationship() {
        return this.postType != null;
    }
}
Link.numOfCreatedInstances = 0;

class EvolvingFunction {

    /**
     * @param {String} intentionID
     * @param {String} stringDynVis
     * @param {Array.<FuncSegment|RepFuncSegment>} functionSegList
     */
    constructor(intentionID) {
        this.intentionID = intentionID;
        this.stringDynVis = 'NT';
        this.functionSegList = [];
    }

    /**
     * Returns the 4 digit representation for this
     * EvolvingFunction's ith function segment's 
     * satisfaction value
     *
     * @param {Number} i
     * @returns {String}
     */
    getMarkedVal(i) {
        return this.functionSegList[i].funcX;
    }

    /**
     * Returns the 4 digit representation for this
     * EvolvingFunction's last function segment's
     * marked value value
     */
    getLastMarkedVal() {
        var len = this.functionSegList.length;
        if (len > 0) {
            return this.functionSegList[len - 1].funcX;
        }
    }

    /**
     * Returns the 4 digit representation for this
     * EvolvingFunction's second last function segment's
     * marked value value. If there is no second last function
     * segment, this function returns the 4 digit representation of 
     * the only ffunction segment's marked value
     */
    getSecondLastMarkedVal() {
        var len = this.functionSegList.length;
        if (len > 1) {
            return this.functionSegList[len - 2].funcX;
        } else {
            return this.getLastMarkedVal();
        }
    }

    /**
     * Returns the funcStop value for the last
     * function segment for this EvolvingFunction
     * Returns null if functionSegList is empty
     *
     * returns {String | null}
     */
    getLastStopValue() {
        len = this.functionSegList.length
        if (len > 0) {
            return this.functionSegList[len - 1].funcStop;
        }
    }

    /**
     * Creates a new RepFuncSegment object containing function
     * segments in the relative time interval [time1, time2], and add it to this
     * EvolvingFunction's functionSegList, in place of the function
     * segements in the time interval [time1, time2]
     *
     * @param {String} time1
     *   first relative time point
     * @param {String} time2
     *   second relative time point
     */
    setRepeatingFunction(time1, time2) {

        this.removeRepFuncSegments();

        // find the index of the FuncSegment with start time time 1
        var startIndex = 0;
        while (this.functionSegList[startIndex].funcStart !== time1) {
            startIndex++;
        }

        var repFuncSegments = [];

        // push and remove, until we see a segment with our desired FuncEnd time
        while (this.functionSegList[startIndex].funcStop !== time2) {
            repFuncSegments.push(this.functionSegList[startIndex]);
            this.functionSegList.splice(startIndex, 1);
        }

        // push and remove the last segment
        repFuncSegments.push(this.functionSegList[startIndex]);
        this.functionSegList.splice(startIndex, 1);


        // create and add a new RepFuncSegment
        var repFuncSegment = new RepFuncSegment(repFuncSegments);
        this.functionSegList.splice(startIndex, 0, repFuncSegment);
    }

    /**
     * Returns the FuncSegment in this EvolvingFunction's
     * functionSegList, with the relative start time time
     *
     * @param {String} time
     * @returns {FuncSegment}
     */
    findSegmentByStartTime(time) {
        for (var i = 0; i < this.functionSegList; i++) {
            if (this.functionSegList[i].funcStart === time) {
                return this.functionSegList[i];
            }
        }
    }

    /**
     * If a RepFuncSegment exists in this EvolvingFunction's
     * functionSegList, retrieve the FuncSegments in the RepFuncSegment,
     * remove the RepFuncSEgment and add the retrieved FuncSegments back
     * into their correct positions in functionSegList
     *
     * Id a RepFuncSegment does not exist in functionSegList, this function
     * does nothing
     */
    removeRepFuncSegments() {

        var repIndex = this.getRepFuncSegmentIndex();
        if (repIndex === -1) {
            return;
        }

        var repFuncSegment = this.functionSegList[repIndex];
        // remove RepFuncSegment object from array
        this.functionSegList.splice(repIndex, 1);

        // add the FuncSegments back into the array
        var j = repIndex;
        for (var i = 0; i < repFuncSegment.functionSegList.length; i++) {
            this.functionSegList.splice(j, 0, repFuncSegment.functionSegList[i]);
            j++;
        }
    }

    /**
     * Sets the repNum for the RepFuncSegment inside of this
     * EvolvingFunction's functionSegList, to count
     *
     * If there is no RepFuncSegment object in functionSegList
     * this function does nothing
     *
     * @param {Number} count
     */
    setRepNum(num) {
        var repIndex = this.getRepFuncSegmentIndex();
        if (repIndex === -1) {
            return;
        }
        this.functionSegList[repIndex].repNum = num;
    }


    /**
     * Sets the absTime for the RepFuncSegment inside of this
     * EvolvingFunction's functionSegList, to time
     *
     * If there is no RepFuncSegment object in functionSegList
     * this function does nothing
     *
     * @param {Number} time
     */
    setAbsoluteTime(time) {
        var repIndex = this.getRepFuncSegmentIndex();
        if (repIndex === -1) {
            return;
        }
        this.functionSegList[repIndex].absTime = time;
    }



    /**
     * Returns the index of the RepFuncSegment object
     * in this EvolvingFunction's functionSegList
     *
     * Returns -1 if there is no RepFunccSegment object
     * in functionSegList
     *
     * @returns {Number}
     */
    getRepFuncSegmentIndex() {
        // Find the index where the RepFuncSegment is located
        var repIndex = 0;
        while (repIndex < this.functionSegList.length && (!(this.functionSegList[repIndex] instanceof RepFuncSegment))) {
            repIndex++;
        }

        // RepFuncSegment did not exist in functionSegList
        if (repIndex >= this.functionSegList.length) {
            return - 1;
        }

        return repIndex;
    }

    /**
     * Returns an array containing FuncSegment objects, for the
     * purpose of easy iteration. This function is useful when
     * the functionSegList contains both FuncSegments and
     * repFuncSegments.
     *
     * For example, if functionSegList contains a FuncSegment
     * and a repFuncSegment containing three FuncSegments inside of it,
     * this function returns an array of size 4, containing all the
     * function segments in chronological order.
     *
     * Every FuncSegment in the returned array will be a deep copy of the
     * origin FuncSegments.
     *
     * Each FuncSegment in the returned array will have a inRepeat attribute
     * which evaluates to true iff the FuncSegment was part of a
     * repFunctionSegment
     *
     * @returns {Array.<FuncSegment>}
     */
    getFuncSegmentIterable() {
        var res = [];
        for (var i = 0; i < this.functionSegList.length; i++) {
            var obj = this.functionSegList[i];
            if (obj instanceof FuncSegment) {
                var clone = Object.assign(new FuncSegment, obj); // deep copy
                clone.isRepeat = false;
                res.push(obj);
            } else {
                var segList = obj.functionSegList;
                for (var j = 0; j < segList.length; j++) {
                    var clone = Object.assign(new FuncSegment, segList[j]);
                    clone.isRepeat = true;
                    res.push(clone);
                }
            }
        }
        return res;
    }

    /**
     * Returns true iff this EvolvingFunction contains
     * a repeating segment (ie, contains a RepFuncSegment)
     *
     * @returns {Boolean}
     */
    hasRepeat() {
        for (var i = 0; i < this.functionSegList.length; i++) {
            if (this.functionSegList[i] instanceof RepFuncSegment) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the epoch boundary where the repeat segment
     * starts
     *
     * Precondition: This EvolvingFunction must contain a RepFuncSegment
     *
     * @returns {String}
     *   ex: 'A'
     */
    getStartRepeatEpoch() {
        for (var i = 0; i < this.functionSegList.length; i++) {
            if (this.functionSegList[i] instanceof RepFuncSegment) {
                return this.functionSegList[i].functionSegList[0].funcStart;
            }
        }
    }

    /**
     * Returns the epoch boundary where the repeat segment
     * ends
     *
     * Precondition: This EvolvingFunction must contain a RepFuncSegment
     *
     * @returns {String}
     *   ex: 'C'
     */
    getEndRepeatEpoch() {
        for (var i = 0; i < this.functionSegList.length; i++) {
            if (this.functionSegList[i] instanceof RepFuncSegment) {
                var len = this.functionSegList[i].functionSegList.length;
                return this.functionSegList[i].functionSegList[len - 1].funcStop;
            }
        }
    }

    /**
     * Returns the repNum attribute for this EvolvingFunction's
     * RepFuncSegment
     *
     * Precondition: This EvolvingFunction must contain a RepFuncSegment
     *
     * @returns {Number}
     */
    getRepeatRepNum() {
        for (var i = 0; i < this.functionSegList.length; i++) {
            if (this.functionSegList[i] instanceof RepFuncSegment) {
                return this.functionSegList[i].repNum;
            }
        }
    }

    /**
     * Returns the absTime attribute for this EvolvingFunction's
     * RepFuncSegment
     *
     * Precondition: This EvolvingFunction must contain a RepFuncSegment
     *
     * @returns {Number}
     */
    getRepeatAbsTime() {
        for (var i = 0; i < this.functionSegList.length; i++) {
            if (this.functionSegList[i] instanceof RepFuncSegment) {
                return this.functionSegList[i].absTime;
            }
        }
    }
}

class FuncSegment {

    /**
     *
     * @param {String} funcType
     * @param {String} funcX
     * @param {String} funcStart
     * @param {String} funcStop
     */
    constructor(funcType, funcX, funcStart, funcStop) {
        this.funcType = funcType;
        this.funcX = funcX;
        this.funcStart = funcStart;
        this.funcStop = funcStop;
    }
}

class RepFuncSegment {

    /**
     *
     * @param {Array.<FuncSegment>} functionSegList
     * @param {Number} repNum
     * @param {Number} absTime
     */
    constructor(functionSegList) {
        this.functionSegList = functionSegList;
        this.repNum = $("#repeat-end2").val();
        this.absTime = $("#repeat-end3").val();
    }
}

class Constraint {

    /**
     *
     * @param {String} constraintType
     * @param {String} constraintSrcID
     * @param {String} constraintSrcEB
     * @param {String} constraintDestID
     * @param {String} constraintDestEB
     * @param {Number} absoluteValue
     */
    constructor(constraintType, constraintSrcID, constraintSrcEB, constraintDestID, constraintDestEB) {
        this.constraintType = constraintType;
        this.constraintSrcID = constraintSrcID;
        this.constraintSrcEB = constraintSrcEB;
        this.constraintDestID = constraintDestID;
        this.constraintDestEB = constraintDestEB;
        this.absoluteValue = -1;
    }
}

class UserEvaluation {

    /**
     *
     * @param {String} intentionID
     * @param {String} absTime
     * @param {String} evaluationValue
     */
    constructor(intentionID, absTime, evaluationValue) {
        this.intentionID = intentionID;
        this.absTime = absTime;
        this.evaluationValue = evaluationValue;
    }
}

class Intention {

    /**
     * @param {String} nodeActorID
     *   The ID of the actor that this intention is embedded in
     *   ex: 'a0000' (actor ID), '-' (if there is no actor)
     * @param {String} nodeType
     *   Type of the intention.
     *   Will be one of these four: 'G', 'T', 'S', 'R'
     *   which stands for Goal, Task, Soft Goal and Resource
     *   respectively
     * @param {String} nodeName
     */
    constructor(nodeActorID, nodeType, nodeName) {
        this.nodeActorID = nodeActorID;
        this.nodeID = this.createID();
        this.nodeType = nodeType;
        this.nodeName = nodeName;
        this.dynamicFunction = new EvolvingFunction(this.nodeID);
    }

    /**
     * Changes the initial satisfaction value for this Intention
     * to initValue and clears the this Intention's EvolvingFunction's
     * functionSegmentList
     *
     * @param {String} initValue
     */
    changeInitialSatValue(initValue) {
        var intentionEval = analysisRequest.getUserEvaluationByID(this.nodeID, '0');
        intentionEval.evaluationValue = initValue;

        // if there is only one function segment, and its constant, then we need to
        // change the function segment's marked value

        var funcSegList = this.dynamicFunction.functionSegList;

        // if (this.dynamicFunction.stringDynVis == 'C' ||
        //     (this.dynamicFunction.stringDynVis == 'UD' && funcSegList[0].funcType == 'C')) {
        //     funcSegList[0].funcX = initValue;
        // }
        this.dynamicFunction.stringDynVis = 'NT';
        this.dynamicFunction.functionSegList = [];
    }

    /**
     * Creates and returns a 4 digit ID for this node
     *
     * @returns {String}
     */
    createID() {
        var id = Intention.numOfCreatedInstances.toString();
        Intention.numOfCreatedInstances += 1;
        while (id.length < 4){
                id = '0' + id;
        }
        return id;
    }

    /**
     * Sets newID as the new nodeID for this intention
     */
    setNewID(newID) {
        var oldID = this.nodeID;
        this.nodeID = newID;
        this.dynamicFunction.intentionID = newID;

        // UserAssignementsList
        var userAssignList = analysisRequest.userAssignmentsList;
        for (var i = 0; i < userAssignList.length; i++) {
            if (userAssignList[i].intentionID === oldID) {
                userAssignList[i].intentionID = newID;
            }
        }

        // Links
        var links = model.links;
        for (var i = 0; i < links.length; i++) {
            if (links[i].linkSrcID === oldID) {
                links[i].linkSrcID = newID;
            }
            if (links[i].linkDestID === oldID) {
                links[i].linkDestID = newID;
            }
        }
        
        // Constraints
        var consts = model.constraints;
        for (var i = 0; i < consts.length; i++) {
            if (consts[i].constraintSrcID === oldID) {
                consts[i].constraintSrcID = newID;
            }
            if (consts[i].constraintDestID === oldID) {
                consts[i].constraintDestID = newID;
            }
        }

    }

    /**
     * Returns the 4 digit representation for this
     * Intention's initial satisfaction value
     *
     * @returns {String}
     */
    getInitialSatValue() {
        var intentionEval = analysisRequest.getUserEvaluationByID(this.nodeID, '0');
        if (typeof intentionEval == 'undefined'){
            return "(no value)";
        } else {
            return intentionEval.evaluationValue;
        }
    }


    /**
     * Returns the number of function segments for this
     * Intention
     *
     * @returns {Number}
     */
    getNumOfFuncSegements() {
        return this.dynamicFunction.getFuncSegmentIterable().length;
    }

    /**
     * Clears all FuncSegments for this Intention's
     * EvolvingFunction and adds new FuncSegments according to the current
     * function type.
     */
    setEvolvingFunction(funcType) {
        this.dynamicFunction.stringDynVis = funcType;
        this.dynamicFunction.functionSegList = [];

        // Since function changed, remove all current absolute constraints related to this intention
        this.removeAbsCosnt();

        // Add new absolute constraints if required
        this.addAbsConst(funcType);

        var initValue = analysisRequest.getUserEvaluationByID(this.nodeID, '0').evaluationValue;

        if (funcType == 'C' || funcType == 'R' || funcType == 'I' || funcType == 'D' || funcType == 'UD') {
            if (funcType == 'C') {
                var seg = new FuncSegment(funcType, initValue, '0', 'Infinity');
            } else if (funcType == 'R') {
                // the marked value for a Stochastic function is always 0000
                var seg = new FuncSegment(funcType, '0000', '0', 'Infinity');
            } else if (funcType == 'I' || funcType == 'D') {
                var seg = new FuncSegment(funcType, null, '0', 'Infinity');
            } else if (funcType == 'UD') {
                var seg = new FuncSegment('C', initValue, '0', 'A');
            }
            this.dynamicFunction.functionSegList.push(seg);
        } else if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' || funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            if (funcType == 'RC') {
                // Stochastic and Constant
                var seg1 = new FuncSegment('R', '0000', '0', 'A');
                var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
            } else if (funcType == 'CR') {
                // Constant and Stochastic
                var seg1 = new FuncSegment('C', initValue, '0', 'A');
                var seg2 = new FuncSegment('R', '0000', 'A', 'Infinity');
            } else if (funcType == 'MP') {
                // Increase and Constant
                var seg1 = new FuncSegment('I', null, '0', 'A');
                var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
            } else if (funcType == 'MN') {
                // Decrease and Constant
                var seg1 = new FuncSegment('D', null, '0', 'A');
                var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
            } else if (funcType == 'SD') {
                // Constant and Constant
                var seg1 = new FuncSegment('C', '0011', '0', 'A');
                var seg2 = new FuncSegment('C', '1100', 'A', 'Infinity');
                analysisRequest.getUserEvaluationByID(this.nodeID, "0").evaluationValue = '0011';
            } else if (funcType == 'DS') {
                // Constant and Constant
                var seg1 = new FuncSegment('C', '1100', '0', 'A');
                var seg2 = new FuncSegment('C', '0011', 'A', 'Infinity');
                analysisRequest.getUserEvaluationByID(this.nodeID, "0").evaluationValue = '1100';
            }
            this.dynamicFunction.functionSegList.push(seg1, seg2);
        }
    }

    /**
     * Adds a new Constraint object int the global model variable,
     * representing an absolute constraint, if requried.
     *
     * If funcType is RC, CR, MP, MN, SD, DS  a Constraint object
     * representin an absolute constraint will be added. If not, this
     * function does not do anything
     *
     * @param {String} funcType
     *   ex: 'RC'
     */
    addAbsConst(funcType) {
        if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' ||
            funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            model.constraints.push(new Constraint('A', this.nodeID, 'A', null, null));
        }
    }


    /**
     * Returns the absolute time for this Intention's absolute constraint at
     * the starting epoch boundary start
     *
     * @param {String} source
     *  ex. 'A'
     */
    getAbsConstTime(source) {
        return model.getAbsConstBySrcID(this.nodeID, source).absoluteValue;
    }

    /**
     * Removes the absolute Constraint object(s) for this Intention from
     * the global model variable, if such absolute Constraint object(s) exists
     */
    removeAbsCosnt() {
        var i = 0;
        while (i < model.constraints.length) {
            var constraint = model.constraints[i];
            if (constraint.constraintType == 'A' && constraint.constraintSrcID === this.nodeID) {
                model.constraints.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    /**
     * Adds a new FuncSeg to the end of this Intention's EvolvingFunction's
     * function list.

     * Also adds a corresponding Constraint object reprenting an absolute constraint
     * into the global model variable.
     *
     *This function should only be used to add new function
     * segments for user defined functions
     *
     * @param {String} funcType
     *   ex: 'C'
     * @param {String} satValue
     *   ex: '0000'
     */
    addUserDefinedSeg(funcType, satValue){

        var len = this.dynamicFunction.functionSegList.length;
        var start = this.dynamicFunction.functionSegList[len - 1].funcStop;
        var code = start.charCodeAt(0) + 1;
        var stop = String.fromCharCode(code);
        this.dynamicFunction.functionSegList.push(new FuncSegment(funcType, satValue, start, stop));
        model.constraints.push(new Constraint('A', this.nodeID, start, null, null));

    }
    /**
     * Sets the marked value for the FuncSegments in the
     * EvolvingFunction for this Intention
     *
     * This function will only be called for I, D, RC, MP, MN functions
     */
    setMarkedValueToFunction(satValue) {
        var funcType = this.dynamicFunction.stringDynVis;

        var len = this.dynamicFunction.functionSegList.length;
        this.dynamicFunction.functionSegList[len - 1].funcX = satValue;

        if (funcType == 'MP' || funcType == 'MN') {
            this.dynamicFunction.functionSegList[0].funcX = satValue;
        }
    }

    /**
     * Sets the function type and marked value for the
     * last FuncSegment for this Intention's EvolvingFunction
     *
     * @param {String} funcValue
     */
    setUserDefinedSegment(funcValue) {
        var funcSegLen = this.dynamicFunction.functionSegList.length;
        var funcSeg = this.dynamicFunction.functionSegList[funcSegLen - 1];
        funcSeg.funcType = funcValue;
        if (funcValue == 'C') {
            funcSeg.funcX == '0000';
        } else if (funcValue == 'R') {
            // the marked value for a Stochastic function is always 0000
            funcSeg.funcX = '0000';
        } else if (funcValue == 'I') {
            funcSeg.funcX = '0011';
        } else if (funcValue == 'D') {
            funcSeg.funcX ='1100';
        }
    }

    /**
     * Sets the satisfaction value for the last function segment
     * in this Intention's evolving function, to satVal
     *
     * @param {String} satVal
     *   ex: '0000'
     */
    updateLastFuncSegSatVal(satVal) {
        var funcSegList = this.dynamicFunction.functionSegList;
        var funcSegLen = this.dynamicFunction.functionSegList.length;

        var lastObj = funcSegList[funcSegLen - 1];

        if (lastObj instanceof FuncSegment) {
            lastObj.funcX = satVal;

        } else {
            // the last segment is inside of the repeat range and is
            // stored inside of the RepFuncSegment object
            var repSegList = lastObj.functionSegList;
            var repSegLen = repSegList.length;
            repSegList[repSegLen - 1].funcX = satVal;
        }
    }
}
Intention.numOfCreatedInstances = 0; // static variable to keep track of number of instances

class AnalysisRequest {

    /**
     *
     * @param {String} action
     * @param {String} conflictLevel
     * @param {String} numRelTime
     * @param {String} absTimePts
     * @param {String} currentState
     * @param {Array.<UserEvaluation>} userAssignmentsList
     * @param {AnalysisResult} previousAnalysis
     */
    constructor() {
        this.action = null;
        this.conflictLevel = "S";
        this.numRelTime = "1";
        this.absTimePts = "";
        this.absTimePtsArr = [];
        this.currentState = "0";
        this.userAssignmentsList = [];
        this.previousAnalysis = null;
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
     * Removes all UserEvaluation objects in
     * userAssignmentsList, with an intentionID equal to
     * nodeID
     *
     * @param {String}
     */


    removeIntention(nodeID) {
        var i = 0;

        while (i < this.userAssignmentsList.length) {
            if (this.userAssignmentsList[i].intentionID == nodeID) {
                this.userAssignmentsList.splice(i, 1);
            } else {
                i++;
            }
        }
    }



}
