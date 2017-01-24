var graph = new joint.dia.Graph;

var paper = new joint.dia.Paper({
    el: $('#myholder'),
    width: 2000,
    height: 1200,
    model: graph,
    gridSize: 1
});

graph.fromJSON(JSON.parse(graphtext));

var rect = new joint.shapes.basic.Rect({
	  position: { x: 1900, y:  1100},
  	  size: { width: 100, height: 30 },
   	  attrs: { rect: { fill: 'black', style: {'pointer-events': 'none'}}, text: { text: 't=0', fill: 'white' }}
});

graph.addCell(rect);

var all_elements = graph.getElements();
var elements = [];

//Collect all non-actor elements into elements array
for (var i = 0; i < all_elements.length; i++){
	if (!(all_elements[i] instanceof joint.shapes.basic.Actor)){
		elements.push(all_elements[i]);
	}
}


//Update the graph for time 'value'
function updateGraph(value){
	console.log('UpdateGraph simulator-view');
	elements[elements.length - 1].attr("text/text", "t = " + value);
	for (var i = 0; i < results.length; i++){
		var curr_results = results[i].split('\t');
		updateValues(i, curr_results[value]);
	}

}

//Properties for both core and simulator. See main.js for more info.
//var satvalues = {satisfied: 3, partiallysatisfied: 2, partiallydenied: 1, denied: 0, unknown: 5, conflict: 4, none: 6};
//var functions = {A: 'AI', O: 'OI', N: 'NT', M: 'MP', R: 'R', S: 'SP', MN: 'MN', SN: 'SN', U: 'UD'};

//datastring += satvalues[elements[e].attr(".satvalue/value")]

//Update the satisfaction value of a particular node in the graph
function updateValues(cell, value){
	console.log('Updatevalue simulator-view');
	var satvalues = ["denied", "partiallydenied", "partiallysatisfied", "satisfied", "conflict", "unknown", "none"];
	elements[cell].attr("satvalue/value", satvalues[value]);

  //Update images for properties
  // Navie: Isnt this the same as simulator_view.js and elementinspector.js?
if (satvalues[value] == "satisfied"){
elements[cell].attr({ '.satvalue': {'d': 'M 0 10 L 5 20 L 20 0 L 5 20 L 0 10', 'stroke': '#00FF00', 'stroke-width':4}});
}
else if(satvalues[value] == "partiallysatisfied") {
elements[cell].attr({ '.satvalue': {'d': 'M 0 8 L 5 18 L 20 0 L 5 18 L 0 8 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#00FF00', 'stroke-width':4, 'fill': 'transparent'}});
}
else if (satvalues[value] == "denied"){
elements[cell].attr({ '.satvalue': {'d': 'M 0 20 L 20 0 M 10 10 L 0 0 L 20 20', 'stroke': '#FF0000', 'stroke-width': 4}});
}
else if (satvalues[value] == "partiallydenied") {
elements[cell].attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 4, 'fill': 'transparent'}});
}
else if (satvalues[value] == "conflict") {
elements[cell].attr({ '.satvalue': {'d': 'M 0 0 L 20 8 M 20 7 L 5 15 M 5 14 L 25 23', 'stroke': '#222222', 'stroke-width': 4}});
}
else if (satvalues[value] == "unknown") {
      /*jshint multistr: true */
elements[cell].attr({ '.satvalue': {'d': 'M15.255,0c5.424,0,10.764,2.498,10.764,8.473c0,5.51-6.314,7.629-7.67,9.62c-1.018,1.481-0.678,3.562-3.475,3.562\
    c-1.822,0-2.712-1.482-2.712-2.838c0-5.046,7.414-6.188,7.414-10.343c0-2.287-1.522-3.643-4.066-3.643\
    c-5.424,0-3.306,5.592-7.414,5.592c-1.483,0-2.756-0.89-2.756-2.584C5.339,3.683,10.084,0,15.255,0z M15.044,24.406\
    c1.904,0,3.475,1.566,3.475,3.476c0,1.91-1.568,3.476-3.475,3.476c-1.907,0-3.476-1.564-3.476-3.476\
    C11.568,25.973,13.137,24.406,15.044,24.406z', 'stroke': '#222222', 'stroke-width': 1}});
}
else {
elements[cell].removeAttr(".satvalue/d");
//elements[cell].attr({ '.satvalue': {'d': '0', 'stroke': '#FFFF00', 'stroke-width': 4}});
}

/*
	if (value > 2){
		elements[cell].attr({ '.satvalue': {'d': 'M 0 10 L 5 20 L 20 0 L 5 20 L 0 10', 'stroke': '#00FF00', 'stroke-width':'4'}});
	}
	else if (value < 2){
		elements[cell].attr({ '.satvalue': {'d': 'M 0 20 L 20 0 M 10 10 L 0 0 L 20 20', 'stroke': '#FF0000', 'stroke-width': 4}})
	}
	else {
		elements[cell].attr({ '.satvalue': {'d': '0', 'stroke': '#FFFF00', 'stroke-width': 4}});
	}
*/


}
