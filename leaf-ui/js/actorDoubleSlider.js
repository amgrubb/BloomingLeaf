window.onload = function(){
    slideOne();
    slideTwo();
}

var sliderOne;
var sliderTwo;
var displayValOne;
var displayValTwo;
var displayValOneFlipped;
var displayValTwoFlipped;
var minGap = 1;
var sliderTrack;
var sliderMaxValue;
var sliderMinValue;
var flipIntervalsCheckbox;


/**
 * This function gets the value for the slider element.
 */
function getValues() {
    sliderOne = document.getElementById("slider-1");
    sliderTwo = document.getElementById("slider-2");
    sliderTrack = document.querySelector(".slider-track");
    sliderMaxValue = document.getElementById("slider-1").max;
    sliderMinValue = document.getElementById("slider-1").min;
    flipIntervalsCheckbox = document.getElementById("intervals-flip-btn");
    
    displayValOne = document.getElementById("range1");
    displayValTwo = document.getElementById("range2");
    displayValOneFlipped = document.getElementById("range1-flipped");
    displayValTwoFlipped = document.getElementById("range2-flipped");
}

/**
 * This function defines the values of the first slider.
 */
function slideOne() {
    getValues();
    if (document.getElementById("limit2")) {
        var limit = document.getElementById("limit1").value;
    }

    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderOne.value = parseInt(sliderTwo.value) - minGap;
    }

    if (parseInt(sliderOne.value) > limit){
        sliderOne.value = limit;
    }

    displayValOne.textContent = sliderOne.value;
    displayValOneFlipped.textContent = sliderOne.value;

    if (flipIntervalsCheckbox.value == "true") {
        fillColor();
    } else {
        fillColorReverse();
    }
}

/**
 * This function defines the values of the second slider.
 */
function slideTwo(limit = null) {
    getValues();
    if (document.getElementById("limit2")) {
        var limit = document.getElementById("limit2").value;
    }

    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
    }

    if (parseInt(sliderTwo.value) < limit){
        sliderTwo.value = limit;
    }

    displayValTwo.textContent = sliderTwo.value;
    displayValTwoFlipped.textContent = sliderTwo.value;
    document.getElementById("range2-flipped").textContent = sliderTwo.value;
    document.getElementById("range2").textContent = sliderTwo.value;

    if (flipIntervalsCheckbox.value == "true") {
        fillColor();
    } else {
        fillColorReverse();
    }
}

/**
 * This function fills the color or the slider bar in function of where the sliders are, when it is not flipped.
 */
function fillColor() {
    getValues();

    percent1 = ((sliderOne.value - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100;
    percent2 = ((sliderTwo.value - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #3264fe ${percent1}% , #3264fe ${percent2}%, #dadae5 ${percent2}%)`;

    document.getElementById("not-flipped").style.display = "block";
    document.getElementById("flipped").style.display = "none";
}

/**
 * This function fills the color or the slider bar in function of where the sliders are, when it is flipped.
 */
function fillColorReverse() {
    getValues();

    percent1 = ((sliderOne.value - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100;
    percent2 = ((sliderTwo.value - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #3264fe ${percent1}% , #dadae5 ${percent1}% , #dadae5 ${percent2}%, #3264fe ${percent2}%)`;

    document.getElementById("not-flipped").style.display = "none";
    document.getElementById("flipped").style.display = "block";
}

/**
 * This function flips the slider.
 */
function flipIntervals() {
    getValues();

    if (flipIntervalsCheckbox.value == "true") {
        fillColorReverse();
        this.$('#intervals-flip-btn').val(false);
    } else {
        fillColor();
        this.$('#intervals-flip-btn').val(true);
    }
}