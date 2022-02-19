class ChartObj {
	/**
	 * Defines chart object for rendering element inspector
	 */
	constructor() {

		this.labels; // Labels on x-axis of chart 
		this.dataSets = []; // Contains information needed to graph line segments
		this.options = {
			scaleOverride: true, // True b/c we want a hard coded scale
			scaleSteps: 4, // The number of steps on the y-axis
			scaleStepWidth: 1, // The value increment of the y-axis
			scaleStartValue: -2, // The y-axis starting value
			scaleFontSize: 10, // The y-axis label font size
			pointHitDetectionRadius: 5, // Extra amount to add to the radius to cater for hit detection outside the drawn point
			tooltipTemplate: "", // Sets template string for single tooltips to empty
			multiTooltipTemplate: "", // Sets template string for multi tooltips to empty
			scales: {
				yAxes: [{
					ticks: { // Sets the end of the y-axis slightly below denied and above satisfied
						min: -2.1,
						max: 2.1,
						// Returns the correct satisfaction value for the y-axis
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

	/**
	 * Adds the information needed to draw one function segment onto the graph to the array this.dataSets
	 * @param {Number} xValue
	 * The starting point of the function segment on the x-axis 
	 * @param {Object} yValues 
	 * The starting and ending points of the function segment on the y-axis
	 * @param {Boolean} dashed 
	 * Whether or not the line should be dashed
	 * @param {Boolean} coloured
	 * Whether or not the line should be colored
	 */
	addDataSet(xValue, yValues, dashed, coloured = false) {
		var data = Array(xValue).fill(null).concat(yValues);
		var dataSet = {
			label: "Source",
			fill: false, // No colouring underneath the line
			borderColor: coloured ? "rgba(255, 110, 80, 1)" : "rgba(220,220,220,1)",
			borderDash: dashed ? [5, 5] : null, // Sets stochastic line segments to dashed
			pointBackgroundColor: coloured ? "rgba(255, 110, 80, 1)" : "rgba(220,220,220,1)",
			pointRadius: 4, // Point size
			pointBorderColor: "rgba(220,220,220,1)",
			lineTension: 0, // Set to 0 for straight lines
			data: data
		};
		// Push dataSet object to dataSets array
		this.dataSets.push(dataSet);
	}

	/**
	 * Displays the dataSets onto the chart. Called whenever a function segment in element inspector changes.
	 * @param {Object} context 
	 * Object containing all of the display information needed for the graph
	 */
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