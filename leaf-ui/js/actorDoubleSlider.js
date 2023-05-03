window.onload = function(){
    slideOne();
    slideTwo();
}

console.log("Slider script here")


var sliderOne = document.getElementById("slider-1");
var sliderTwo = document.getElementById("slider-2");
var displayValOne = document.getElementById("range1");
var displayValTwo = document.getElementById("range2");
var minGap = 0;
var sliderTrack = document.querySelector(".slider-track");
var sliderMaxValue = document.getElementById("slider-1").max;
var flipIntervalsCheckbox = document.getElementById("intervals-flip-btn");


function slideOne() {
    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderOne.value = parseInt(sliderTwo.value) - minGap;
    }
    displayValOne.textContent = sliderOne.value;
    fillColor();
}

function slideTwo() {
    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
    }
    displayValTwo.textContent = sliderTwo.value;
    fillColor();
}

function fillColor() {
    percent1 = (sliderOne.value / sliderMaxValue) * 100;
    percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #3264fe ${percent1}% , #3264fe ${percent2}%, #dadae5 ${percent2}%)`;
}

function fillColorReverse() {
    percent1 = (sliderOne.value / sliderMaxValue) * 100;
    percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #3264fe ${percent1}% , #dadae5 ${percent1}% , #dadae5 ${percent2}%, #3264fe ${percent2}%)`;
}

function flipIntervals() {
    if (flipIntervalsCheckbox.value == "true") {
        fillColorReverse();
        this.$('#intervals-flip-btn').val(false);
        console.log(flipIntervalsCheckbox.value);
    } else {
        fillColor();
        this.$('#intervals-flip-btn').val(true);
    }
}