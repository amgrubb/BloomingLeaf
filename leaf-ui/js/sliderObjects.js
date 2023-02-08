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

            var ElList = []; //Empty array for elements id's ex: j_7, j_9, j_11
            var SatList = []; //Empty array for elements sat vals ex: 0111, 1100, 1110

            //Goes through each element in elementlist and runs checkSatVal method that prints out each sat val for each element
            currentAnalysis.get('elementList').forEach(element =>
                SliderObj.checkSatVal(element,parseInt(values[handle]),SatList)); //prints each sat val individually and pushes them into SatList array
            console.log("Sat value array: " + SatList); // prints array of sat values of all intentions

            //Goes through each element on the graph and pushes it into ElList array
            var cells = paper.findViewsInArea(paper.getArea()); //cells is an array containing all intentions on graph
            // cells.forEach(elements => //goes through each elements in "cells" array and pushes each element id into ElList. "elements.id" gets access to the "j_7" ids
            //     ElList.push(elements.id));
            // console.log("Element j_id array: " + ElList); // prints array of j_ids of actors + intentions

            ElList = SliderObj.getIntentionsList();
            console.log("Element List1:  ");
            console.log(ElList);
            // SliderObj.getIntentionsList(ElList);
            SliderObj.compareSatVal(SatList, ElList); //Method here is not finished but when calls the compareSatVal to compare  
            
            // Testing of disappearIntention()
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
    static getIntentionsAndActorsView() {
        var elements = graph.getElements();
        var cellsView = []
        for (var i = 0; i < elements.length; i++) {
            var cellView = elements[i].findView(paper);
            // console.log("Cell view: ");
            // console.log(cellView);
            cellsView.push(cellView);
        } 
        return cellsView;
    }

    /**
     * Returns the list of j_ids of intentions and actors in the current model
     */
    static getLinksView() {
        var links = graph.getLinks();
        var linksView = []
        for (var i = 0; i < links.length; i++) {
            var linkView = links[i].findView(paper);
            // console.log("Link view: ");
            // console.log(linkView);
            linksView.push(linkView);
        } 
        return linksView;
    }

    /**
     * Returns the list of embedded elements (intentions + internal links) model ids of an actor
     */
    static getEmbeddedElements() {
        var cells = SliderObj.getIntentionsAndActorsView();
        // Hard code to get the embeds of first actor (merge1: self) j_10
        // TODO: remove the hard code
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].id == "j_10" && cells[i].model.attributes.type == 'basic.Actor') {
                return cells[i].model.attributes.embeds;
            }
        }
    }


    /**
     * a method that prints out all the intentions of the model
     * TODO: This method doesn't seem to print out helpful info now
     */
    static getIntentionsList() {
        var cells = paper.findViewsInArea(paper.getArea());
        // var elements = graph.getElements();
        var intentionsList = [];
        for(var i = 0; i<cells.length; i++ ){
            console.log(cells[i].model.attributes.type);
            if(!(cells[i].model.attributes.type == "basic.Actor")) {
                intentionsList.push(cells[i].id);
            }
        }
        return intentionsList; 
    }


    /**
     * Hides/Displays the embedded elements of an actor
     */
    static removeEmbeddedElements(cells, embeds, bool) {
        var elementsToRemove = [];
        for (var i = 0; i < embeds.length; i++) {
            console.log(embeds[i]);

            for (var j = 0; j < cells.length; j ++) {
                if (embeds[i] == cells[j].model.id) {
                    console.log("Cell model i_d matched: " + cells[j].model.id);
                    console.log("Since matched, j_id is " + cells[j].id);
                    elementsToRemove.push(cells[j].id);
                }
            }
        }
        
        // Convert into valid j_ids
        for (var i = 0; i < elementsToRemove.length; i++) {
            elementsToRemove[i] = "#" + elementsToRemove[i];
        }
        console.log("Actor 1 elements to remove: " + elementsToRemove);

        if (bool) {
            for (var i = 0; i < elementsToRemove.length; i++) {
                $(elementsToRemove[i]).css("display", "none");
            }
        }
        else {
            for (var i = 0; i < elementsToRemove.length; i++) {
                $(elementsToRemove[i]).css("display", "");
            }
        }
    }


    /**
     * Hides/Displays the links associated with the actor to be hidden/displayed
     */
    static removeLinks(links, embeds, bool) {
        var linksToRemove = []
        outerloop:
        for (var i = 0; i < links.length; i++) {
            for (var j = 0; j < embeds.length; j++){
                // console.log("Link attribute source id: ");
                // console.log(links[j].attributes.source.id);
                if (links[i].model.attributes.source.id == embeds[j] || links[i].model.attributes.target.id == embeds[j]) {
                    console.log("Link model i_d matched: " + links[i].model.id);
                    console.log("Since matched, j_id is " + links[i].id);
                    linksToRemove.push(links[i].id)
                    continue outerloop;
                }
            }
        }
        
        // Convert into valid j_ids
        for (var i = 0; i < linksToRemove.length; i++) {
            linksToRemove[i] = "#" + linksToRemove[i];
        }
        console.log("Links to remove: " + linksToRemove);
        if (bool) {
            for (var i = 0; i < linksToRemove.length; i++) {
                $(linksToRemove[i]).css("display", "none");
            }
        }
        else {
            for (var i = 0; i < linksToRemove.length; i++) {
                $(linksToRemove[i]).css("display", "");
            }
        }
        
    }


    /**
     * Hides/Displays a specific actor
     */
    static removeActor(cells, bool) {
        // TODO: replace hard codes (j_10)
        var actor1_j_id = "#";
        for (var i = 0; i < cells.length; i++) {
            console.log(cells[i].model.attributes.type);
            if (cells[i].model.attributes.type == 'basic.Actor' && cells[i].id == "j_10") {
                // console.log(cells[i].id);
                actor1_j_id += cells[i].id;
                console.log(actor1_j_id);
            }
        }
        if (bool) {
            $(actor1_j_id).css("display", "none");
        }
        else {
            $(actor1_j_id).css("display", "");
        }
    }

    
    /**
     * Makes actors, intentions and links dissapear
     */
    static disappearIntention(bool) {
        // Testing merge1.json
        // links: j_12, j_13, j_14
        // actors: j_10 (self), j_11 (parents)
        // resource: j_9
        // tasks: j_7, j_8
        // goals: j_6

        var cells = SliderObj.getIntentionsAndActorsView();
        console.log("Cells: ");
        console.log(cells);

        var links = SliderObj.getLinksView();
        console.log("Model's links: ");
        console.log(links);
        
        var firstActorEmbeds = SliderObj.getEmbeddedElements();
        console.log("First actor's embeds: ");
        console.log(firstActorEmbeds);

        // Call helper functions to remove embedded elements, links, and the actor itself
        // Testing for j_10 (self)
        SliderObj.removeEmbeddedElements(cells, firstActorEmbeds, bool);
        SliderObj.removeLinks(links, firstActorEmbeds, bool);
        SliderObj.removeActor(cells, bool);
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
    
    static compareSatVal(SatList, ElList) { //Deals with checking which satVal corresponds to which element.id currently being worked on
        var intentionsList = SliderObj.getIntentionsList();
        console.log("List of intentions: ");
        console.log(intentionsList);
        console.log("ElList is: ");
        console.log(ElList);
        console.log("SatList is: ");
        console.log(SatList);
        for (var i = 0; i < SatList.length; i++) {
            $("#"+ElList[i]).css("display", "");
            if (SatList[i] == '1110' || SatList[i] == '1010' || SatList[i] == '0111'|| SatList == '0101' || SatList[i] == '0110'|| SatList[i] == '1111'|| SatList[i] == '1001' || SatList[i] == '1101' || SatList[i] == '1011') {
                console.log("Found");
                console.log(i);
                console.log("Element: " + ElList[i]);
                $("#"+ElList[i]).css("display", "none");
            }       
        }
    }    

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