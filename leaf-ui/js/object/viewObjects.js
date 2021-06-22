class ChartObj {

	/**
	 * Defines chart object for rendering element inspector
	 */

	constructor() {
		
		this.labels;
		this.dataSets = [];
		this.options = {
			// animation: false,
			scaleOverride : true,
			scaleSteps : 4,
			scaleStepWidth : 1,
			scaleStartValue : -2,
			scaleFontSize: 10,
			pointHitDetectionRadius : 5,
			tooltipTemplate: "",
			multiTooltipTemplate: "",
			scales: {
				yAxes: [{
					ticks: {
						min: -2.1,
						max: 2.1,
						callback: function(value, index, values) {
							if (value == 2){return '(F, ⊥)'};
							if (value == 1){return '(P, ⊥)'};
							if (value == 0){return '(⊥, ⊥)'};
							if (value == -1){return '(⊥, P)'};
							if (value == -2){return '(⊥, F)'};
						}
					}
				}]
			},
			legend: {
				display: false
			},

			tooltips: {
				enabled: false,
			}
		};
	}

	reset() {
		this.labels = null;
		this.dataSets = [];
	}

	addDataSet(xValue, yValues, dashed, coloured = false) {
		var data = Array(xValue).fill(null).concat(yValues);
		var dataSet = {
			label: "Source",
			fill: false, // no colouring underneath the line
			borderColor: coloured ? "rgba(255, 110, 80, 1)" : "rgba(220,220,220,1)",
			borderDash: dashed ? [5, 5] : null,
			pointBackgroundColor: coloured ? "rgba(255, 110, 80, 1)" : "rgba(220,220,220,1)",
			pointRadius: 4,
			pointBorderColor: "rgba(220,220,220,1)",
			lineTension: 0, // set to 0 for straight lines
			data: data
		};

		this.dataSets.push(dataSet);
	}

	display(context) {
		this.chartObj = new Chart(context, {
			type: 'line',
			data: {
				labels: this.labels,
				datasets: this.dataSets
			},
			options: this.options
		});
	}
}

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
}
