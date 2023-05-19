window.onload = function(){
    slideOne();
    slideTwo();
}

console.log("Slider script here")


// var sliderOne = document.getElementById("slider-1");
// var sliderTwo = document.getElementById("slider-2");
// var displayValOne = document.getElementById("range1");
// var displayValTwo = document.getElementById("range2");
// var minGap = 0;
// var sliderTrack = document.querySelector(".slider-track");
// var sliderMaxValue = document.getElementById("slider-1").max;
// var flipIntervalsCheckbox = document.getElementById("intervals-flip-btn");

var sliderOne;
var sliderTwo;
var displayValOne;
var displayValTwo;
var minGap = 0;
var sliderTrack;
var sliderMaxValue;
var flipIntervalsCheckbox;

function getValues() {
    sliderOne = document.getElementById("slider-1");
    sliderTwo = document.getElementById("slider-2");
    sliderTrack = document.querySelector(".slider-track");
    sliderMaxValue = document.getElementById("slider-1").max;
    flipIntervalsCheckbox = document.getElementById("intervals-flip-btn");
    
    if (flipIntervalsCheckbox.value == "true") {
        displayValOne = document.getElementById("range1-flipped");
        displayValTwo = document.getElementById("range2-flipped");
    } else {
        displayValOne = document.getElementById("range1");
        displayValTwo = document.getElementById("range2");
    }
}

function slideOne() {
    getValues();

    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderOne.value = parseInt(sliderTwo.value) - minGap;
    }
    displayValOne.textContent = sliderOne.value;
    document.getElementById("range1-flipped").textContent = sliderOne.value;
    document.getElementById("range1").textContent = sliderOne.value;

    if (flipIntervalsCheckbox.value == "true") {
        fillColor();
    } else {
        fillColorReverse();
    }
}

function slideTwo() {
    getValues();

    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
    }
    displayValTwo.textContent = sliderTwo.value;
    document.getElementById("range2-flipped").textContent = sliderTwo.value;
    document.getElementById("range2").textContent = sliderTwo.value;

    if (flipIntervalsCheckbox.value == "true") {
        fillColor();
    } else {
        fillColorReverse();
    }
}

function fillColor() {
    getValues();

    percent1 = (sliderOne.value / sliderMaxValue) * 100;
    percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #3264fe ${percent1}% , #3264fe ${percent2}%, #dadae5 ${percent2}%)`;

    document.getElementById("not-flipped").style.display = "block";
    document.getElementById("flipped").style.display = "none";
}

function fillColorReverse() {
    getValues();

    percent1 = (sliderOne.value / sliderMaxValue) * 100;
    percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #3264fe ${percent1}% , #dadae5 ${percent1}% , #dadae5 ${percent2}%, #3264fe ${percent2}%)`;

    document.getElementById("not-flipped").style.display = "none";
    document.getElementById("flipped").style.display = "block";
}

function flipIntervals() {
    getValues();

    if (flipIntervalsCheckbox.value == "true") {
        fillColorReverse();
        this.$('#intervals-flip-btn').val(false);
        console.log(flipIntervalsCheckbox.value);
    } else {
        fillColor();
        this.$('#intervals-flip-btn').val(true);
    }
}