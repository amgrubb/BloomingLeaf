class ChartObj {

	/**
	 * Defines chart object for rendering element inspector
	 */

	constructor() {

		this.labels; // Labels on x-axis of chart 
		this.dataSets = []; // Contains information needed to graph line segments
		this.options = {
			scaleOverride: true, //Boolean - true b/c we want a hard coded scale
			scaleSteps: 4, // Number - The number of steps on the y-axis
			scaleStepWidth: 1, // Number - The value increment of the y-axis
			scaleStartValue: -2, // Number - The y-axis starting value
			scaleFontSize: 10, // Number - y-axis label font size in pixels
			// TODO: do we need this?? - the user shouldnt be able to click on the chart
			// pointHitDetectionRadius: 5, // Number - Extra amount to add to the radius to cater for hit detection outside the drawn point
			// TODO: do we need both of the tooltips??? - later they are set to false
			// tooltipTemplate: "", // Sets template string for single tooltips to empty
			// multiTooltipTemplate: "", // Sets template string for multi tooltips to empty
			scales: {
				yAxes: [{
					ticks: { // Sets the end of the y-axis slightly below denied and above satisfied
						min: -2.1,
						max: 2.1,
						callback: function (value) {
							if (value == 2) { return '(F, ⊥)' };
							if (value == 1) { return '(P, ⊥)' };
							if (value == 0) { return '(⊥, ⊥)' };
							if (value == -1) { return '(⊥, P)' };
							if (value == -2) { return '(⊥, F)' };
						}
					}
				}]
			},
			// Disables legend that displays data about the datasets that are appearing on the chart.
			legend: {
				display: false
			},
			// Disables tooltips - labels that appear when you hover over data points on the chart
			tooltips: {
				enabled: false,
			}
		};
	}

	/**
	 * Resets chart datapoints, labels, and destroys references to previous charts
	 */
	reset() {
		this.labels = null;
		this.dataSets = [];
		// If there was already a chart, destroy it so there is no reference to previous data
		if (this.chartObj) {
			this.chartObj.destroy();
		}
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