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

            //This section here is what I added.. Runs whenever the slider is moved

            const elList = []; //Empty array for elements id's ex: j_7, j_9, j_11
            const SatList = []; //Empty array for elements sat vals ex: 0111, 1100, 1110

            //Goes through each element in elementlist and runs checkSatVal method that prints out each sat val for each element
            currentAnalysis.get('elementList').forEach(element =>
                SliderObj.checkSatVal(element,parseInt(values[handle]),SatList)); //prints each sat val individually and pushes them into SatList array
            console.log("Sat Value array: " + SatList); //prints entire arrray of sat values


            var cells = paper.findViewsInArea(paper.getArea()); //cells is an array containing all intentions on graph
            cells.forEach(elements => //goes through each elements in "cells" array and pushes each element id into elList. "elements.id" gets access to the "j_7" ids
                elList.push(elements.id));
            console.log("Element id array: " + elList); //prints entire arrray of elements id

            // SliderObj.checkcheck(element,parseInt(values[handle]), SatList, elList); //Method that is not finished..

            //End of what I added

            var t = parseInt(values[handle])%2;
            // var intentions = ['#j_14','#j_15','#j_16','#j_17','#j_18','#j_19','#j_20','#j_21','#j_22','#j_23','#j_24','#j_25','#j_26'];
            // console.log(t); // t == 0 indicates EVEN, t == 1 indicates ODD

            var elementList = currentAnalysis.get('elementList');
            console.log(elementList);
            
            SliderObj.getActors();
            SliderObj.getIntentionsList();

            if (t == 0) {
                console.log("EVEN");
                SliderObj.disappearIntention(true,'#j_27');
            }
            else {
                console.log("ODD");
                SliderObj.disappearIntention(false,'#j_27');
            }
        });
        EVO.setCurTimePoint(isSwitch ? 0 : sliderMax, currentAnalysis);
        SliderObj.adjustSliderWidth(sliderMax);
        return true;
    }

    /**
     * get actors of the model
     */
    static getActors() {
        var elements = graph.getElements();
        var actors = elements.filter(element => element.get('type') == 'basic.Actor');
        console.log("List of actors: " + actors); // TODO: this isn't printing out helpful info 
    }

    /**
     * a method that prints out all the intentions of the model
     */
    static getIntentionsList() {
        var elements = graph.getElements();
        var intentionsList = [];
        for(var i = 0; i<elements.length; i++ ){
            if(!(elements[i] instanceof joint.shapes.basic.Actor)) {
                intentionsList.push(elements[i]);
            }
        }
        console.log("List of intentions: " + intentionsList); // TODO: this isn't printing out helpful info 
    }

    /**
     * 
     */
    static disappearIntention(bool,word) {
        var intentions = ['#j_14','#j_15','#j_16','#j_17','#j_18','#j_19','#j_20','#j_21','#j_22','#j_23','#j_24','#j_25','#j_26'];
        var links = ['#j_29','#j_30','#j_31','#j_32','#j_33','#j_34','#j_35','#j_36','#j_37','#j_38','#j_40','#j_44'];
        var intentionsLength = intentions.length;
        var linksLength = links.length;
        var removedIntentions = [];
        var removedLinks = [];
        if (bool) {
            
            for(var i = 0; i<intentionsLength; i++){
                $(intentions[i]).css("display", "none");
                removedIntentions.push(intentions[i])
                // console.log(intentions[i]);
            }
            for(var i = 0; i<linksLength; i++){
                $(links[i]).css("display", "none");
                removedLinks.push(links[i])
                // console.log(links[i]);
            }
            console.log("Removed intentions: " + removedIntentions);
            console.log("Removed links: " + removedLinks);
            $(word).css("display", "none");
            
        }
        else {
            for(var i = 0; i<intentionsLength; i++){
                $(intentions[i]).css("display", "");
            }
            for(var i = 0; i<linksLength; i++){
                $(links[i]).css("display", "");
            }
            console.log("Removed intentions: " + removedIntentions);
            console.log("Removed links: " + removedLinks);
            $(word).css("display", "");
            
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
            console.log("satVallll: "+ satValue);
            SatList.push(satValue);
        }
        
        /**
         * @param {map} element
         *  Map between element id and result data. 
         *   Satisfaction value in string form. ie: '0011' for satisfied
         *   Current value of the slider
         * @param {Number} sliderValue
         *   Current value of the slider
         */
        
        //  static checkcheck(element, sliderValue, SatList, elList) { //Deals with checking which satVal corresponds to which element.id currently being worked on
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
            
        console.log(currentAnalysis.get('elementList'));
        console.log(currentAnalysis.get('basic.Actor'));
        console.log(currentAnalysis.get('elementList').getElementById);    
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