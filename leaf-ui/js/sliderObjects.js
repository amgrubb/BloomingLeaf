/**
 * This file contains functions that help display the analysis
 * that the web application would receive from the back end.
 * It also contains functions for the analysis configuration sidebar
 */

class SliderObj {
    /**
     * TODO: see if we can move createSlider, removeSlider, updateSliderValues, etc. to the class definition
     * TODO: integrate with the HTML implementation of the noUISlider lib in a Backbone template?
     * 
     * Used for displaying, updating, and removing slider in analysis view.
     * Holds the information displayed in the slider on the UI
     * JavaScript range slider library [noUISlider]
     * 
     * @param {HTMLElement} sliderElement
     * @param {HTMLElement} sliderValueElement
     */
    constructor() {
        this.sliderElement = document.getElementById('slider');
        this.sliderValueElement = document.getElementById('sliderValue');
        this.storedValue = null;
    }

    /**
     * Displays the analysis to the web app, by creating the slider display
     *
     * @param {ResultBBM} analysisResult
     *   AnalysisResult object returned from backend
     * @param {Boolean} isSwitch
     *   True if we are switching analysis results,
     *   false if new result from the back end
     * 
     * @return {Boolean} SliderObj.createSlider(analysisResult, isSwitch);
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
     * @param {Boolean} isSwitch
     *   True if the slider is being created when we are switching analysis results,
     *   false if new result from the back end
     * 
     * @return {Boolean} 
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
    
             SliderObj.hideElements(false);
        });
        
        EVO.setCurTimePoint(isSwitch ? 0 : sliderMax, currentAnalysis);
        SliderObj.adjustSliderWidth(sliderMax);
        return true;
    }

    /**
     * Resets display to default, before result is displayed
     * 
     * @param {ResultBBM} analysisResult 
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
     * 
     * @param {ResultBBM} analysisResult 
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

    /**
     * Updates the slider values at the bottom left hand side of the paper,
     * to represent the current slider's position.
     *
     * @param {Number} sliderValue
     *  Current value of the slider
     * @param {ResultBBM} currentAnalysis
     *  a ResultBBM object that contains data about the analysis that the back end performed
     */
    static updateSliderValues(sliderValue, currentAnalysis) {
        currentAnalysis.set('selectedTimePoint', sliderValue);
        $('#sliderValue').text(sliderValue);
        var tpPath = currentAnalysis.get('timePointPath');
        currentAnalysis.get('slider').sliderValueElement.innerHTML = sliderValue + "|" + tpPath[sliderValue];
        this.storedValue = tpPath[sliderValue];

       currentAnalysis.get('elementList').forEach(element =>
            SliderObj.updateNodeValues(element, sliderValue));   
        EVO.setCurTimePoint(sliderValue, currentAnalysis);
    
    }

    /**
     * Updates the satValue of the node.
     * 
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
            cell.attr({ text: { fill: 'white' } }); 
        }
    }

    /**
     * Returns the list of j_ids of all intentions and actors in the current model
     * 
     * @return {Array.<String>}
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
     * 
     * @return {Array.<String>}
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
     * 
     * @return {Array.<String>} intentionsView
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
     * 
     * @return {Array.<String>} linksView
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
     * @return {Array.<IntentionBBM>} cells[i].model.attributes.embeds
     */
    static getEmbeddedElements(actor_j_id) {
        var cells = SliderObj.getIntentionsAndActorsView();
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].id == actor_j_id && cells[i].model.attributes.type == 'basic.Actor') {
                return cells[i].model.attributes.embeds;
            }
        }
    }

    /**
     * Returns the list of j_ids and the list of model_ids of all intentions of the model,
     * respectively
     * @return {Array.<Array.<String>, Array.<String>>} [intentionsJIds, intentionsModelIds]
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
     * @param {Array.<IntentionBBM, ActorBBM>} cells
     *  List of all cells (intentions and actors) in the current model
     * @param {Array.<IntentionBBM>} embeds
     *  List of all embeds inside the target actor
     */
    static hideEmbeddedElements(cells, embeds) {
        var elementsToHide = [];
        for (var i = 0; i < embeds.length; i++) {
            for (var j = 0; j < cells.length; j ++) {
                if (embeds[i] == cells[j].model.id) {
                    elementsToHide.push(cells[j].id);
                }
            }
        }
        
        for (var i = 0; i < elementsToHide.length; i++) {
            $("#" + elementsToHide[i]).css("display", "none");
        }
    }

    /**
     * Hides/Displays the links associated with the actor to be hidden/displayed
     * @param {Array.<LinkBBM>} links
     *  List of all links in the current model
     * @param {array.<IntentionBBM>} embeds
     *  List of all embeds inside the target actor
     */
    static hideLinks(links, embeds) {

        var linksToHide = []
        for (var i = 0; i < links.length; i++) {
            if (embeds.includes(links[i].model.attributes.source.id) || embeds.includes(links[i].model.attributes.target.id))  {
                linksToHide.push(links[i].id);
            }
        }

        for (var i = 0; i < linksToHide.length; i++) {
            $("#" + linksToHide[i]).css("display", "none");
        }
    }

    /**
     * Hides/Displays a specific actor
     * @param {Array<IntentionBBM, ActorBBM>} cells
     *  List of all cells (intentions and actors) in the current model
     * @param {String} actor_j_id
     *  j_id of the target actor, without the "#"
     */
    static hideActor(cells, actor_j_id) {
        var actor_full_j_id = "#"+ actor_j_id.id;
        var intervals;
        
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].model.attributes.type == 'basic.Actor' && cells[i].id == actor_j_id.id) {
                intervals = cells[i].model.attributes.actor.attributes.intervals;
            }
        }

        for (var i = 0; i < intervals.length; i++) {
            if (intervals[i][0] <= SliderObj.storedValue && intervals[i][1] >= SliderObj.storedValue) {
                $(actor_full_j_id).css("display", "none");
            }
        }
    }

    /**
     * Hides/Displays a specific intention
     * @param {Array.<IntentionBBM, ActorBBM>} cells
     *  List of all cells (intentions and actors) in the current model
     * @param {String} intention_j_id
     *  j_id of the target intention, without the "#"
     */
    static hideIntention(cells, intention_j_id, links) {
        var intention_full_j_id = "#"+ intention_j_id.id;
        var intervals;

        for (var i = 0; i < cells.length; i++) {
            if (cells[i].model.attributes.type != 'basic.Actor' && cells[i].id == intention_j_id.id) {
                intervals = cells[i].model.attributes.intention.attributes.intervals;
            }
        }

        for (var i = 0; i < intervals.length; i++) {
            if (intervals[i][0] <= SliderObj.storedValue && intervals[i][1] >= SliderObj.storedValue) {
                $(intention_full_j_id).css("display", "none");

            }
        }
    }

    /**
     * Makes actors, intentions and links disappear
     */
    static hideElements() {

        var cells = SliderObj.getIntentionsAndActorsView();
        var actors = SliderObj.getActorsView();
        var intentions = SliderObj.getIntentionsView();
        var links = SliderObj.getLinksView();

        SliderObj.defaultToAppear(actors, intentions, links);
        
        var actorEmbeds = [];
        for(var i = 0; i < actors.length; i++){
            actorEmbeds.push(SliderObj.getEmbeddedElements(actors[i].id));
        }

        for(var i = 0; i < actors.length; i++){
            SliderObj.hideActor(cells, actors[i]);
        }

        for (var i = 0; i < intentions.length; i++){
            SliderObj.hideIntention(cells, intentions[i]);
        }

        for (var i = 0; i < actors.length; i++){
            if ($("#" + actors[i].id).css("display") == "none") {
                SliderObj.hideEmbeddedElements(cells, actorEmbeds[i]); //assuming the order of embeds is the same with actors array
                SliderObj.hideLinks(links, actorEmbeds[i]);
            }
        }

        for (var i = 0; i < intentions.length; i++){
            if ($("#" + intentions[i].id).css("display") == "none") {
                SliderObj.hideLinks(links, intentions[i].model.id);
            }
        }
    }

    /**
     * Resets the style of all elements
     * @param {Array.<ActorBBM>} actors
     *  List of all actors in the current model
     * @param {Array.<IntentionBBM>} intentions
     *  List of all actors in the current model
     * @param {Array.<LinkBBM>} links
     *  List of all links in the current model
     */
    static defaultToAppear(actors, intentions,links){
        for (var i = 0; i < actors.length; i++) {
            $("#"+actors[i].id).css("display", "");
        }
        for (var i = 0; i < intentions.length; i++) {
            $("#"+intentions[i].id).css("display", "");
        }
        for (var i = 0; i < links.length; i++) {
            $("#"+links[i].id).css("display", "");
        }
    }
}
// End of sliderObj scope