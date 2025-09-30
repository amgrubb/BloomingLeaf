/**
 * This file contains functions that help display the analysis
 * that the web application would receive from the back end.
 * It also contains functions for the analysis configuration sidebar
 * 
 * When functions in this class are called, they are called statically. 
 * An alternative implementation would be to move functions into the class definition to be able to create an instance of sliderObj when needed.
 * In the current state of the class, this is not necessary as there is only one SliderObj.
 * 
 */

class SliderObj {
    /**
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
        document.getElementById('colorResetAnalysis').addEventListener('change', this.displayAll);
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