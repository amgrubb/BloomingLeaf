/**
 * This file contains functions that help display the analysis
 * that the web application would receive from the back end.
 * It also contains functions for the analysis configuration sidebar
 */
// TODO: Update these functions to take in a ResultBBM instead of an AnalysisResult
//{
class SliderObj {
    /**
     * TODO finish docstring by figuring out what type of var params are
     * TODO see if we can move createSlider, removeSlider, updateSliderValues, etc. to the class definition
     * TODO integrate with the HTML implementation of the noUISlider lib in a Backbone template?
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
    }


    //let sliderObject = new SliderObj();

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

            const ElList = []; //Empty array for elements id's ex: j_7, j_9, j_11
            const SatList = []; //Empty array for elements sat vals ex: 0111, 1100, 1110

            //Goes through each element in elementlist and runs checkSatVal method that prints out each sat val for each element
            currentAnalysis.get('elementList').forEach(element =>
                SliderObj.checkSatVal(element,parseInt(values[handle]),SatList)); //prints each sat val individually and pushes them into SatList array
            console.log("Sat value array: " + SatList); // prints array of sat values of all intentions

            //Goes through each element on the graph and pushes it into ElList array
            var cells = paper.findViewsInArea(paper.getArea()); //cells is an array containing all intentions on graph
            cells.forEach(elements => //goes through each elements in "cells" array and pushes each element id into ElList. "elements.id" gets access to the "j_7" ids
                ElList.push(elements.id));
            console.log("Element j_id array: " + ElList); // prints array of j_ids of actors + intentions

            // SliderObj.compareSatVal(element,parseInt(values[handle]), SatList, ElList); //Method here is not finished but when calls the compareSatVal to compare  
        
            SliderObj.getActors();
            SliderObj.getEmbeddedElements();
            SliderObj.getLinkModelIds();
            
            // Testing of disappearIntention() for j_id of #j_27. 
            // IMPORTANT: Comment out later, do not delete for now.
            var t = parseInt(values[handle])%2;

            if (t == 0) {
                console.log("EVEN");
                SliderObj.disappearIntention(true);
            }
            else {
                console.log("ODD");
                SliderObj.disappearIntention(false);
            }


        });
        EVO.setCurTimePoint(isSwitch ? 0 : sliderMax, currentAnalysis);
        SliderObj.adjustSliderWidth(sliderMax);
        return true;
    }

    /**
     * Returns the list of j_ids of intentions and actors in the current model
     */
    static getIntentionsAndActors() {
        var jIdList = []
        var cells = paper.findViewsInArea(paper.getArea()); 
        cells.forEach(cell => 
            jIdList.push(cell.id)
        );
        console.log("j_ids of actors and intentions: " + jIdList); // prints array of j_ids of actors + intentions
        // cells.forEach(cell => 
        //     console.log("Cell j_id? " + cell.id)
        // );
        // cells.forEach(cell => 
        //     console.log("Cell model_id? " + cell.model.id)
        // );
        return cells;

    }

    /**
     * Returns the list of embedded elements (intentions + internal links) of an actor
     */
    static getEmbeddedElements() {
        var cells = SliderObj.getIntentionsAndActors();
        // Hard code to get the embeds of first actor (merge1: self) j_10
        // TODO: remove the hard code
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].id == "j_10" && cells[i].model.attributes.type == 'basic.Actor') {
                return cells[i].model.attributes.embeds;
            }
        }

        // var elements = graph.getElements(); // intentions + actors only, no links
        // var actors = elements.filter(element => element.get('type') == 'basic.Actor');

        // // Hard code to get the embeds of first actor (merge1: self)
        // // TODO: remove the hard code
        // var embeds = actors[1].attributes.embeds;
        // // console.log("The embeds are:"); // embeds == intentions + internal links within that actor
        // // console.log(embeds);
        // return embeds;
    }

    /**
     * Returns model ids of links (embedded + cross-actor links) of the current model
     * TODO: needs to get j_id of links!
     */
    static getLinkModelIds() { // both embedded and cross-actor links?
        var links = graph.getLinks();
        console.log('List of links'); // both internal and cross-actor links
        return links;
    }

    /**
     * Returns actors of the model
     */
    static getActors() {
        
        var elements = graph.getElements(); // intentions + actors only, no links
        // console.log('List of elements');
        // console.log(elements);
        var actors = elements.filter(element => element.get('type') == 'basic.Actor');
        console.log("List of actors");
        console.log(actors); 
        

        var links = graph.getLinks();
        console.log('List of links'); // both internal and cross-actor links
        console.log(links);

        var intentionsList = [];
        for(var i = 0; i<elements.length; i++ ){
            if(!(elements[i] instanceof joint.shapes.basic.Actor)) {
                var j_id = joint.util.guid(elements[i]);
                console.log(j_id); // testing
                intentionsList.push(elements[i]);
            }
        }

        //hard codes to get the embeds of first actor
        var embeds = actors[1].attributes.embeds;
        // console.log("The embeds are:"); // embeds == intentions + internal links within that actor
        // console.log(embeds);
        console.log("The types of embeds are:");
        for(var i = 0; i < embeds.length; i++){
            for(var j = 0; j < intentionsList.length; j++){
                if(embeds[i] === intentionsList[j].id){
                    console.log(intentionsList[j].attributes.type);
                }
            }
        }
        console.log("Embedded links");
        for(var i = 0; i < embeds.length; i++){
            for(var j = 0; j < links.length; j++){
                console.log(links[j].attributes.source.id);
                if(embeds[i] === links[j].attributes.source.id || embeds[i] === links[j].attributes.target.id ){
                    links[j].remove();
                }
            }
        }
        //todo: make internal links and source/target links disappear

        // //get the embedded intentions of the second actor disappear
        // console.log("Cell matched j_id:");
        // for(var i = 0; i < cells.length; i++){
        //     for(var j = 0; j<embeds.length; j++ ){
        //         if(cells[i].model.id === embeds[j]){
        //             console.log(cells[i].id);
        //             $("#"+cells[i].id).css("display", "none");
        //         }
        //     }
        // };

        // return actors;

    }

    /**
     * a method that prints out all the intentions of the model
     * TODO: This method doesn't seem to print out helpful info now
     */
    static getIntentionsList() {
        var elements = graph.getElements();
        var intentionsList = [];
        for(var i = 0; i<elements.length; i++ ){
            if(!(elements[i] instanceof joint.shapes.basic.Actor)) {
                intentionsList.push(elements[i]);
            }
        }
        console.log('List of intentions');
        console.log(intentionsList); 
    }
    
    /**
     * Makes actors, intentions and links dissapear
     */
    static disappearIntention(bool) {
        SliderObj.getActors();

        // Testing merge1.json
        // links: j_12, j_13, j_14
        // actors: j_10 (self), j_11 (parents)
        // resource: j_9
        // tasks: j_7, j_8
        // goals: j_6

        var cells = SliderObj.getIntentionsAndActors();
        console.log("Cells: ");
        console.log(cells);
        
        var firstActorEmbeds = SliderObj.getEmbeddedElements();
        console.log("First actor's embeds: ");
        console.log(firstActorEmbeds);

        var links = SliderObj.getLinkModelIds();
        console.log("Model's links: ");
        console.log(links);

        if (bool) {
            // // Works for links -- hardcoded
            // // TODO: replace hardcoded part
            // $("#j_12").css("display", "none");
            // $("#j_13").css("display", "none");
            // $("#j_14").css("display", "none");

            var actor1_j_id = "#";

            // Works for actor 1 embedded intentions (self j_10 in merge1) expected j_6, j_7, j_8
            var elementsToRemove = [];
            for (var i = 0; i < firstActorEmbeds.length; i++) {
                console.log(firstActorEmbeds[i]);

                for (var j = 0; j < cells.length; j ++) {
                    if (firstActorEmbeds[i] == cells[j].model.id) {
                        console.log("Cell model i_d matched: " + cells[j].model.id);
                        console.log("Since matched, j_id is " + cells[j].id);
                        elementsToRemove.push(cells[j].id);
                    }
                }
            }

            // TODO: Does it work for actor 1's embedded links???
            
            console.log("Actor 1 elements to remove: " + elementsToRemove);
            // Convert into valid j_ids
            for (var i = 0; i < elementsToRemove.length; i++) {
                elementsToRemove[i] = "#" + elementsToRemove[i];
            }
            console.log("Modified actor 1 elements to remove: " + elementsToRemove);
            for (var i = 0; i < elementsToRemove.length; i++) {
                $(elementsToRemove[i]).css("display", "none");
            }

            // Works for actor 1
            // TODO: replace hard codes
            for (var i = 0; i < cells.length; i++) {
                console.log(cells[i].model.attributes.type);
                if (cells[i].model.attributes.type == 'basic.Actor' && cells[i].id == "j_10") {
                    // console.log(cells[i].id);
                    actor1_j_id += cells[i].id;
                    console.log(actor1_j_id);
                }
            }
            $(actor1_j_id).css("display", "none");
        }
        else {
            // // Works for links -- hardcoded
            // // TODO: replace hardcoded part
            // $("#j_12").css("display", "");
            // $("#j_13").css("display", "");
            // $("#j_14").css("display", "");

            // Works for actor 1 embedded intentions (self j_10 in merge1) expected j_6, j_7, j_8
            var elementsToRemove = [];
            for (var i = 0; i < firstActorEmbeds.length; i++) {
                console.log(firstActorEmbeds[i]);

                for (var j = 0; j < cells.length; j ++) {
                    if (firstActorEmbeds[i] == cells[j].model.id) {
                        console.log("Cell model i_d matched: " + cells[j].model.id);
                        console.log("Since matched, j_id is " + cells[j].id);
                        elementsToRemove.push(cells[j].id);
                    }
                }
            }

            // TODO: Does it work for actor 1's embedded links???

            console.log("Actor 1 elements to remove: " + elementsToRemove);
            // Convert into valid j_ids
            for (var i = 0; i < elementsToRemove.length; i++) {
                elementsToRemove[i] = "#" + elementsToRemove[i];
            }
            console.log("Modified actor 1 elements to remove: " + elementsToRemove);
            for (var i = 0; i < elementsToRemove.length; i++) {
                $(elementsToRemove[i]).css("display", "");
            }

            // Works for Actor 1
            // TODO: replace hard codes
            var actor1_j_id = "#";
            for (var i = 0; i < cells.length; i++) {
                console.log(cells[i].model.attributes.type);
                if (cells[i].model.attributes.type == 'basic.Actor' && cells[i].id == "j_10") {
                    // console.log(cells[i].id);
                    actor1_j_id += cells[i].id;
                    console.log(actor1_j_id);
                }
            }
            $(actor1_j_id).css("display", "");

            
        }
    }

    /**
     * @param {map} element
     *  Map between element id and result data. 
     *   Satisfaction value in string form. ie: '0011' for satisfied
     *   Current value of the slider
     * @param {Number} sliderValue
     *   Current value of the slider
     * @param {Array} SatList
     *   Array of Sat values
     */
    static checkSatVal(element, sliderValue, SatList) { //Deals with finding satVal for each individual intention
        var satValue = element.status[sliderValue]; //accesses sat value of current intention
        console.log(element); // to view details of the current intention
        console.log("Current satValue: "+ satValue);
        SatList.push(satValue);
    }
    
    /**
     * Method that will look through both SatList and ElList arrays and based on if an intention matches with a satVal then make those intentions dissapear
     * WIP
     */
    
    //  static compareSatVal(element, sliderValue, SatList, ElList) { //Deals with checking which satVal corresponds to which element.id currently being worked on
    //     // var satValue = element.status[sliderValue];
    //     // console.log("satVallll: "+ satValue);
    //     // SatList.push(satValue);
    //     for (var i = 0; i < SatList.length; i++) {
    //         var cellz = SatList[i];
    //         console.log(cellz.id);
    //     }
    //     // if (satValue == '0000') {
    //     //     SliderObj.disappearIntention(true,'#j_7');
    //     // }
    //     // else {
    //     //     SliderObj.disappearIntention(false,'#j_7');
    //     // }
    // }    

    /**
     * Reset display to default, before result is displayed
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
        currentAnalysis.get('slider').sliderValueElement.innerHTML = sliderValue + "|" + tpPath[sliderValue];
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
}
// End of sliderObj scope