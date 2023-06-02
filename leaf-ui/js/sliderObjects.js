/**
 * This file contains functions that help display the analysis
 * that the web application would receive from the back end.
 * It also contains functions for the analysis configuration sidebar
 */
// TODO: Update these functions to take in a ResultBBM instead of an AnalysisResult
//{
class SliderObj {
    /**
     * TODO: finish docstring by figuring out what type of var params are
     * TODO: see if we can move createSlider, removeSlider, updateSliderValues, etc. to the class definition
     * TODO: integrate with the HTML implementation of the noUISlider lib in a Backbone template?
     * 
     * Used for displaying, updating, and removing slider in analysis view.
     * Holds the information displayed in the slider on the UI
     * JavaScript range slider library [noUISlider]
     * 
     * @param {} sliderElement
     * @param {} sliderValueElement
     */
    constructor() {
        this.sliderElement = document.getElementById('slider');
        this.sliderValueElement = document.getElementById('sliderValue');
        this.storedValue = null;
    }


    // let sliderObject = new SliderObj();

    /**
     * Displays the analysis to the web app, by creating the slider display
     *
     * @param {ResultBBM} analysisResult
     *   AnalysisResult object returned from backend
     * @param {Boolean} isSwitch
     *   True if we are switching analysis results,
     *   false if new result from the back end
     */
    static displayAnalysis(analysisResult, isSwitch) {
        // Check if slider has already been initialized
        if (analysisResult.get('slider').sliderElement.hasOwnProperty('noUiSlider')) {
            analysisResult.get('slider').sliderElement.noUiSlider.destroy();
        }
        return SliderObj.createSlider(analysisResult, isSwitch);
    }

    /**
     * Creates a slider and displays it in the web app
     *
     * @param {ResultBBM} currentAnalysis
     *  an AnalysisResult object that contains data about the analysis that the back end performed
     * @param {number} currentValueLimit
     * @param {Boolean} isSwitch
     *   True if the slider is being created when we are switching analysis results,
     *   false if new result from the back end
     */
    static createSlider(currentAnalysis, isSwitch) {
        var sliderMax = currentAnalysis.get('timePointPath').length - 1; // .timeScale;
        var density = (sliderMax < 25) ? (100 / sliderMax) : 4;
        if (sliderMax == 0) {
            swal("Error: There are no timepoints to simulate.", "", "error");
            return false;
        }

        noUiSlider.create(currentAnalysis.get('slider').sliderElement, {
            start: 0,
            step: 1,
            behaviour: 'tap',
            connect: 'lower',
            direction: 'ltr',
            range: {
                'min': 0,
                'max': sliderMax
            },
            pips: {
                mode: 'values',
                values: [],
                density: density
            }
        });


        
        // Set initial value of the slider
        // 0 if switching between existing results; sliderMax if new result
        currentAnalysis.get('slider').sliderElement.noUiSlider.set(isSwitch ? 0 : sliderMax);
        currentAnalysis.get('slider').sliderElement.noUiSlider.on('update', function (values, handle) {
            SliderObj.updateSliderValues(parseInt(values[handle]), currentAnalysis);
            
            // Initialize an empty array for elements sat vals ex: 0111, 1100, 1110, 0110
            var SatList = [];

            // Loops through each intention on the paper and pushes each sat val into the array
            currentAnalysis.get('elementList').forEach(element =>
                SliderObj.storeSatVals(element,parseInt(values[handle]),SatList)); 
    
            // Presence conditions behavior: Based on whether the timepoint is odd or even, 
            // a selected actor should disappear or appear
           
            // var cells = SliderObj.getIntentionsAndActorsView();
            // console.log("print out intentions and actors");
            // console.log(cells);
            // for (var i = 0; i < cells.length; i++) {
            //     if (cells[i].model.attributes.type == 'basic.Actor' && cells[i].model.attributes.actor.attributes.isHidden == true) {
            //         console.log(cells[i].model.attributes.actor.attributes.isHidden);
            //         SliderObj.hideElements(true, SatList);
            //     } else {
            //         console.log(cells[i].model.attributes.actor.attributes.isHidden);
            //         SliderObj.hideElements(false, SatList);
            //     }
            // }
            
            console.log("stored value",SliderObj.storedValue);
            
            
            //var t = parseInt(values[handle])%2;
            //if (t == 0) {
            const intervals = SliderObj.hideElements(false, SatList);
            console.log("intervals",intervals);
            // }
            // else {
            //     const intervals = SliderObj.hideElements(false, SatList);
            //     console.log(intervals);
            // }   
            
            for(var i=0; i<intervals.length;i++){ // for each actor
                if (intervals[i][2]=="false") { // flipped
                    if(intervals[i][0] < SliderObj.storedValue && intervals[i][1] > SliderObj.storedValue) {
                        SliderObj.hideElements(false, SatList);
                    }
                } else { // not flipped
                    if(intervals[i][0] > SliderObj.storedValue || intervals[i][1] < SliderObj.storedValue) {
                        SliderObj.hideElements(false, SatList);
                    }
                }
            }
        });
        
        EVO.setCurTimePoint(isSwitch ? 0 : sliderMax, currentAnalysis);
        SliderObj.adjustSliderWidth(sliderMax);
        return true;
    }

    /**
     * Resets display to default, before result is displayed
     */
    static hideAnalysis(analysisResult) {
        revertNodeValuesToInitial();
        EVO.switchToModelingMode(analysisResult);
        // show modeling mode EVO slider
        $('#modelingSlider').css("display", "");
        $('#analysisSlider').css("display", "none");
    }

    /**
     * Removes the slider from the UI
     */
    static removeSlider(analysisResult) {
        // if there's a slider, remove it
        if (analysisResult.get('slider').sliderElement.hasOwnProperty('noUiSlider')) {
            analysisResult.get('slider').sliderElement.noUiSlider.destroy();
        }
        $('#sliderValue').text("");
    }

    /**
     * Adjusts the width of the slider depending on the width of the paper
     *
     * @param {Number} maxValue
     *   The maximum value for the current slider
     */
    static adjustSliderWidth(maxValue) {
        // Min width of slider is 15% of paper's width
        var min = $('#paper').width() * 0.1;
        // Max width of slider is 90% of paper's width
        var max = $('#paper').width() * 0.9;
        // This is the width based on maxvalue
        var new_width = $('#paper').width() * maxValue / 65;
        // new_width is too small or too large, adjust
        if (new_width < min) {
            new_width = min;
        }
        if (new_width > max) {
            new_width = max;
        }
        $('#slider').width(new_width);
    }

    // let sliderValue;
    // console.log(sliderValue);

    /**
     * Updates the slider values at the bottom left hand side of the paper,
     * to represent the current slider's position.
     *
     * @param {Number} sliderValue
     *   Current value of the slider
     * @param {Number} currentValueLimit
     * @param {ResultBBM} currentAnalysis
     *  a ResultBBM object that contains data about the analysis that the back end performed
     */
    static updateSliderValues(sliderValue, currentAnalysis) {
        currentAnalysis.set('selectedTimePoint', sliderValue);
        $('#sliderValue').text(sliderValue);
        var tpPath = currentAnalysis.get('timePointPath');
        console.log(tpPath);
        currentAnalysis.get('slider').sliderValueElement.innerHTML = sliderValue + "|" + tpPath[sliderValue];
        console.log(tpPath[sliderValue]);
        this.storedValue = tpPath[sliderValue];
        // Update the analysisRequest current state.
        //analysisRequest.currentState = sliderObject.sliderValueElement.innerHTML;   //TODO: Perhalps this should be part of the call to simulate.

        currentAnalysis.get('elementList').forEach(element =>
            SliderObj.updateNodeValues(element, sliderValue));   
        EVO.setCurTimePoint(sliderValue, currentAnalysis);
    
    }

    /**
     * @param {map} element
     *  Map between element id and result data. 
     *   Satisfaction value in string form. ie: '0011' for satisfied
     * @param {Number} sliderValue
     *   Current value of the slider
     */
    static updateNodeValues(element, sliderValue) {
        var satValue = element.status[sliderValue];
        var cell = graph.getCell(element.id);
        if ((cell != null) && (satValue in satisfactionValuesDict)) {
            cell.attr(".satvalue/text", satisfactionValuesDict[satValue].satValue);
            cell.attr({ text: { fill: 'white' } }); //satisfactionValuesDict[satValue].color        // TODO: Does this need updating?
        }
    }

    /**
     * Returns the list of j_ids of all intentions and actors in the current model
     */
    static getIntentionsAndActorsView() {
        var elements = graph.getElements();
        var cellsView = []
        for (var i = 0; i < elements.length; i++) {
            var cellView = elements[i].findView(paper);
            cellsView.push(cellView);
        } 
        return cellsView;
    }

    /**
     * Returns the list of j_ids of all actors in the current model
     */
    static getActorsView(){
        var actorsView = [];
        var cells = SliderObj.getIntentionsAndActorsView();
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].model.attributes.type == 'basic.Actor') {
                actorsView.push(cells[i]);//.model.attributes.embeds
            }
        }
        return actorsView;
    }

    /**
     * Returns the list of j_ids of all intentions in the current model
     */
    static getIntentionsView(){
        var intentionsView = [];
        var cells = SliderObj.getIntentionsAndActorsView();
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].model.attributes.type != 'basic.Actor') {
                intentionsView.push(cells[i]);
            }
        }
        return intentionsView;
    }

    /**
     * Returns the list of j_ids of all links in the current model
     */
    static getLinksView() {
        var links = graph.getLinks();
        var linksView = []
        for (var i = 0; i < links.length; i++) {
            var linkView = links[i].findView(paper);
            linksView.push(linkView);
        } 
        return linksView;
    }

    /**
     * Returns the list of embedded elements (intentions + internal links) model_ids
     * of an actor
     * @param {String} actor_j_id
     *  j_id of the target actor, without the "#"
     */
    static getEmbeddedElements(actor_j_id) {
        var cells = SliderObj.getIntentionsAndActorsView();
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].id == actor_j_id && cells[i].model.attributes.type == 'basic.Actor') {
                return cells[i].model.attributes.embeds;
            }
            // if (cells[i].id == actor_j_id && cells[i].model.attributes.type == 'basic.Goal') {
            //     return cells[i].model.attributes.embeds;
            // }
        }
    }

    /**
     * Returns the list of j_ids and the list of model_ids of all intentions of the model,
     * respectively
     */
    static getIntentionsList() {
        var cells = paper.findViewsInArea(paper.getArea());
        var intentionsJIds = [];
        var intentionsModelIds = [];
        for(var i = 0; i < cells.length; i++ ){
            if(!(cells[i].model.attributes.type == "basic.Actor")) {
                intentionsJIds.push(cells[i].id);
                intentionsModelIds.push(cells[i].model.id)
            }
        }
        return [intentionsJIds, intentionsModelIds]; 
    }

    /**
     * Hides/Displays the embedded elements of an actor
     * @param {} cells
     *  List of all cells (intentions and actors) in the current model
     * @param {} embeds
     *  List of all embeds inside the target actor
     * @param {Boolean} bool
     *  A boolean value indicating whether the current timestamp is even (true) or odd (false)
     */
    static hideEmbeddedElements(cells, embeds, bool) {
        var elementsToHide = [];
        for (var i = 0; i < embeds.length; i++) {

            for (var j = 0; j < cells.length; j ++) {
                if (embeds[i] == cells[j].model.id) {
                    elementsToHide.push(cells[j].id);
                }
            }
        }
        
        // Convert into valid j_ids
        for (var i = 0; i < elementsToHide.length; i++) {
            elementsToHide[i] = "#" + elementsToHide[i];
        }
        if (bool) {
            for (var i = 0; i < elementsToHide.length; i++) {
                $(elementsToHide[i]).css("display", "none");
            }
        }
        else {
            for (var i = 0; i < elementsToHide.length; i++) {
                $(elementsToHide[i]).css("display", "");
            }
        }
    }

    /**
     * Hides/Displays the links associated with the actor to be hidden/displayed
     * @param {} links
     *  List of all links in the current model
     * @param {} embeds
     *  List of all embeds inside the target actor
     * @param {Boolean} bool
     *  A boolean value indicating whether the current timestamp is even (true) or odd (false)
     */
    static hideLinks(links, embeds, bool) {

        // var linksToHide = embeds;
        var linksToHide = []
        for (var i = 0; i < links.length; i++) {
            if (embeds.includes(links[i].model.attributes.source.id) || embeds.includes(links[i].model.attributes.target.id))  {
                linksToHide.push(links[i].id);
            }
        }

        // Convert into valid j_ids
        for (var i = 0; i < linksToHide.length; i++) {
            linksToHide[i] = "#" + linksToHide[i];
        }

        if (bool) {
            for (var i = 0; i < linksToHide.length; i++) {
                $(linksToHide[i]).css("display", "none");
            }
        }
        else {
            for (var i = 0; i < linksToHide.length; i++) {
                $(linksToHide[i]).css("display", "");
            }
        }
        
    }

    static hideIntentionLinks(links, embeds, bool) {
        
        var linksToHide = embeds;
        // var linksToHide = []
        // for (var i = 0; i < links.length; i++) {
        //     if (embeds.includes(links[i].model.attributes.source.id) || embeds.includes(links[i].model.attributes.target.id))  {
        //         linksToHide.push(links[i].id);
        //     }
        // }

        // Convert into valid j_ids
        for (var i = 0; i < linksToHide.length; i++) {
            linksToHide[i] = "#" + linksToHide[i];
        }

        if (bool) {
            for (var i = 0; i < linksToHide.length; i++) {
                $(linksToHide[i]).css("display", "none");
            }
        } else {
            for (var i = 0; i < linksToHide.length; i++) {
                $(linksToHide[i]).css("display", "");
            }
        }
        
    }

    /**
     * Hides/Displays a specific actor
     * @param {} cells
     *  List of all cells (intentions and actors) in the current model
     * @param {Boolean} bool
     *  A boolean value indicating whether the current timestamp is even (true) or odd (false)
     * @param {String} actor_j_id
     *  j_id of the target actor, without the "#"
     */
    static hideActor(cells, bool, actor_j_id) {
        //console.log(actor_j_id);
        var actor_full_j_id = "#"+ actor_j_id.id;
        var intervals;
        
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].model.attributes.type == 'basic.Actor' && cells[i].id == actor_j_id.id) {
                //actor_full_j_id += cells[i].id;
                //console.log(actor_full_j_id);
                intervals = cells[i].model.attributes.actor.attributes.intervals;
                // console.log(intervals);
            }
        }
        // console.log(actor_full_j_id);

        if (intervals[2]=="false") { // flipped
            if(intervals[0] < SliderObj.storedValue && intervals[1] > SliderObj.storedValue) {
                bool = true;
            }
        } else { // not flipped
            if(intervals[0] > SliderObj.storedValue || intervals[1] < SliderObj.storedValue) {
                bool = true;
            }
        }

        if (bool) {
            $(actor_full_j_id).css("display", "none");
        }
        else {
            $(actor_full_j_id).css("display", "");
        }
        return intervals;
    }

    /**
     * Hides/Displays a specific intention
     * @param {} cells
     *  List of all cells (intentions and actors) in the current model
     * @param {Boolean} bool
     *  A boolean value indicating whether the current timestamp is even (true) or odd (false)
     * @param {String} intention_j_id
     *  j_id of the target intention, without the "#"
     */
    static hideIntention(cells, bool, intention_j_id, links) {
        var intention_full_j_id = "#"+ intention_j_id.id;
        var intervals;

        for (var i = 0; i < cells.length; i++) {
            if (cells[i].model.attributes.type != 'basic.Actor' && cells[i].id == intention_j_id.id) {
                intervals = cells[i].model.attributes.intention.attributes.intervals;
                // console.log(intervals);
            }
        }
        // console.log(intention_full_j_id);

        if (intervals[2]=="false") { // flipped
            if(intervals[0] < SliderObj.storedValue && intervals[1] > SliderObj.storedValue) {
                bool = true;
            }
        } else { // not flipped
            if(intervals[0] > SliderObj.storedValue || intervals[1] < SliderObj.storedValue) {
                bool = true;
            }
        }

        if (bool) {
            $(intention_full_j_id).css("display", "none");
        }
        else {
            $(intention_full_j_id).css("display", "");
        }

        //TODO: cleanup hide links inside this function
        // var linksToHide = [];
      
        // for (var i = 0; i < links.length; i++) {
        //     if(intention_id == links[i].model.attributes.source.id || intention_id == links[i].model.attributes.target.id){
        //         linksToHide.push(links[i].id);
        //     }
        // }

        // console.log(linksToHide);

        return intervals;
    }

    /**
     * Makes actors, intentions and links dissapear
     * @param {Boolean} bool
     *  A boolean value indicating whether the current timestamp is even (true) or odd (false)
     * @param {} SatList
     *  List of all intentions' satisfaction values 
     */
    static hideElements(bool, SatList) {
        // Testing merge1.json
        // links: j_10, j_13, j_14
        // actors: j_10 (self), j_11 (parents)
        // resource: j_9
        // tasks: j_7, j_8
        // goals: j_6

        // TODO: target_actor is hardcoded as j_10 in merge1.json model for now. 
        // Will need to replce the hard code later.
        // start with targeting first actor, replace j_11
        //var target_actor_j_id = "j_11"
        // var target_intention_j_id = "j_6"

        var cells = SliderObj.getIntentionsAndActorsView();
        // console.log("Cells: ");
        // console.log(cells);
        var actors = SliderObj.getActorsView();
        // console.log("Model's actors id: ");
        // console.log(actors);

        var target_actor_j_id = [];
        for (var i = 0; i < actors.length; i++) {
            target_actor_j_id.push(actors[i]);
        }
        // console.log("Model's actors id: ");
        // console.log(actors);

        for (var i = 0; i < actors.length; i++) {
            // console.log((i+1) +"th actor's embeds: ");
            // console.log(SliderObj.getEmbeddedElements(actors[i].id));
        }
        
        var intentions = SliderObj.getIntentionsView();
        // console.log("Model's intenions: ");
        // console.log(intentions);

        var target_intention_j_id = [];
        for (var i = 0; i < intentions.length; i++) {
            target_intention_j_id.push(intentions[i]);
        }
        // console.log("Model's intentions id: ");
        // console.log(target_intention_j_id);
        
        var links = SliderObj.getLinksView();
        // console.log("Model's links: ");
        // console.log(links);
        
        var actorEmbeds = [];
        for(var i = 0; i < actors.length; i++){
            actorEmbeds.push(SliderObj.getEmbeddedElements(actors[i].id));
            // console.log((i+1)+ "th actor's embeds: ");
            // console.log(actorEmbeds[i]);
        }
        
        // var firstActorEmbeds = SliderObj.getEmbeddedElements(target_actor_j_id);
        // console.log("First actor's embeds: ");
        // console.log(firstActorEmbeds);

        // var firstIntentionLinks = SliderObj.getIntentionLinks(target_intention_j_id);
        // console.log("First intention's embeds: ");
        // console.log(firstIntentionLinks);

        //TODO: replace hardcoded target_actor_j_id with actors list
        // Call helper functions to hide embedded elements, links, and the actor itself

        var intentionLinks = [];
        for(var i = 0; i < intentions.length; i++){
            console.log("id",intentions[i].id);
            intentionLinks.push(SliderObj.getIntentionLinks(intentions[i].id));
            // console.log((i+1)+ "th intention's links: ");
            // console.log(intentionLinks[i]);
        }

        var intentionIntervals = [];
        for(var i = 0; i < intentions.length; i++){
            intentionIntervals.push(SliderObj.hideIntention(cells, bool, target_intention_j_id[i]));
        }

        var intervals = [];
        for(var i = 0; i < actors.length; i++){//newly added
            //if (actors[i].id === target_actor_j_id) {
                intervals.push(SliderObj.hideActor(cells, bool, target_actor_j_id[i]));
            //}
            //intervals.push(SliderObj.hideActor(cells, bool, target_actor_j_id[i]));
        }
        // console.log(intervals);

        //TODO: replace hardcoded target_intention_j_id with intentions list
        // Call helper functions to hide embedded elements, links, and the actor itself
        //const intervals = SliderObj.hideIntention(cells, bool, target_intention_j_id, links);
        // console.log(intervals);

        //SliderObj.hideConflictingSatVals(SatList);
        for(var i = 0; i < actors.length; i++){//newly added
            if ($("#" + target_actor_j_id[i].id).css("display") == "none") {
                SliderObj.hideEmbeddedElements(cells, actorEmbeds[i], true); //assuming the order of embeds is the same with actors array
                SliderObj.hideLinks(links, actorEmbeds[i], true);
            } else { 
                SliderObj.hideLinks(links, actorEmbeds[i], false);
                // SliderObj.hideEmbeddedElements(cells, actorEmbeds[i], false);
                //SliderObj.hideConflictingSatVals(SatList);
            }
        }

        for(var i = 0; i < intentions.length; i++){
            if ($("#" + target_intention_j_id[i].id).css("display") == "none") {
                SliderObj.hideIntentionLinks(links, intentionLinks[i], true);
            }
        }

        return intervals;
    }

    /**
     * Given an intention push the sat val into the given SatList array
     * @param {map} element
     *  Map between element id and result data. 
     *  Satisfaction value in string form. ie: '0011' for satisfied
     * @param {Number} sliderValue
     *  Current value of the slider
     * @param {Array} SatList
     *  Array of Sat values
     */
    static storeSatVals(element, sliderValue, SatList) { //Deals with finding satVal for each individual intention
        var satValue = element.status[sliderValue]; //accesses sat value of current intention
        SatList.push(satValue);
    }
    
    /**
     * Makes intentions with conflicting satisfaction values, along with all the links related to the intentions 
     * with conflicting satisfaction values, disappear
     * @param {} SatList
     *  List of all intentions' satisfaction values
     */
    static hideConflictingSatVals(SatList) {
        var intentionsJIdList = SliderObj.getIntentionsList()[0];
        var intentionsModelIdList = SliderObj.getIntentionsList()[1];
        var links = SliderObj.getLinksView();

        // Make all links reappear
        for (var k = 0; k < links.length; k++) {
            
            $("#"+links[k].id).css("display", "");
        }

        for (var i = 0; i < SatList.length; i++) {
            // Make intention reappear
            $("#"+intentionsJIdList[i]).css("display", "");

            // Make elements with conflicting values disappear
            if (SatList[i] == '1110' || SatList[i] == '1111' || SatList[i] == '0111'|| SatList[i] == '0110') {
                // Make intention with conflicting values disappear
                $("#"+intentionsJIdList[i]).css("display", "none");

                // Make links connecting conflicting values disappear
                for (var j = 0; j < links.length; j++) {      
                    if (links[j].model.attributes.source.id == intentionsModelIdList[i] || links[j].model.attributes.target.id == intentionsModelIdList[i]) {
                        var linksId = "#" + links[j].id;
                        $(linksId).css("display", "none");
                    }
                }
            }    
        }
    }    

    static getIntentionLinks(intention_j_id) {
        var cells = SliderObj.getIntentionsAndActorsView();
        var links = SliderObj.getLinksView();
        var intention_id = null;
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].model.attributes.type != 'basic.Actor' && cells[i].id == intention_j_id) {
                intention_id = cells[i].model.attributes.id; //model id
            }
        }

        var linksToHide = [];
      
        for (var i = 0; i < links.length; i++) {
            if(intention_id == links[i].model.attributes.source.id || intention_id == links[i].model.attributes.target.id){
                linksToHide.push(links[i].id);
            }
        }

        console.log(linksToHide);
        return linksToHide;
    }
}
// End of sliderObj scope