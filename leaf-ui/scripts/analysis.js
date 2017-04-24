//Get necessary variables from the main page
var document = jQuery.extend({}, window.opener.document);
//var graph = jQuery.extend({}, window.opener.graph);
var graph = new joint.dia.Graph();
console.log(JSON.stringify(window.opener.global_analysisResult));
var paper;
var paperScroller;
var originalResults = jQuery.extend({}, window.opener.global_analysisResult);
var analysisResult;
var elements = [];

window.onload = function(){
	paper = new joint.dia.Paper({
	    width: 1200,
	    height: 600,
	    gridSize: 10,
	    perpendicularLinks: false,
	    model: graph,
	    defaultLink: new joint.dia.Link({
			'attrs': {
				'.connection': {stroke: '#000000'},
				'.marker-source': {'d': '0'},
				'.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
				},
			'labels': [{position: 0.5, attrs: {text: {text: "and"}}}]
		})
	});

	var paperScroller = new joint.ui.PaperScroller({
		autoResizePaper: true,
		paper: paper
	});

	$('#paper').append(paperScroller.render().el);
	paperScroller.center();

	//Load graph by the cookie
	if (document.cookie){
		var cookies = document.cookie.split(";");
		var prevgraph = "";

		//Loop through the cookies to find the one representing the graph, if it exists
		for (var i = 0; i < cookies.length; i++){
			if (cookies[i].indexOf("graph=") >= 0){
				prevgraph = cookies[i].substr(6);
				break;
			}
		}

		if (prevgraph){
			graph.fromJSON(JSON.parse(prevgraph));
		}
	}
	
	//Filter out Actors
	for (var e = 0; e < graph.getElements().length; e++){
		if (!(graph.getElements()[e] instanceof joint.shapes.basic.Actor))
			elements.push(graph.getElements()[e]);
	}

	if(!analysisResult)
		analysisResult = originalResults;

	renderNavigationSidebar();	
}

function renderNavigationSidebar(currentPage = 0){
	clear_pagination_values();
	
	var currentPageIn = document.getElementById("currentPage");
	var num_states_lbl = document.getElementById("num_states_lbl");
	num_states_lbl.innerHTML += (analysisResult.elementList[0].valueList.length - 1);
	
	currentPageIn.value = currentPage.toString();
	
	updatePagination(currentPage);
	updateNodesValues(currentPage);

}

function updateNodesValues(currentPage){
	var cell;
	var value;
	for(var i = 0; i < elements.length; i++){
		cell = elements[i];
		value = analysisResult.elementList[i].valueList[currentPage];
		cell.attributes.attrs[".satvalue"].value = value;
		
		//Change backend value to user friendly view
		if ((value == "1000") || (value == "1100")) {
		  cell.attr(".satvalue/text", "(FS, T)");
		  cell.attr({text:{fill:'black'}});
		}else if(value == "0100") {
		  cell.attr(".satvalue/text", "(PS, T)");
		  cell.attr({text:{fill:'black'}});
		}else if ((value == "0001") || (value == "0011")){
		  cell.attr(".satvalue/text", "(T, FD)");
		  cell.attr({text:{fill:'black'}});
		}else if (value == "0010") {
		  cell.attr(".satvalue/text", "(T, PD)");
		  cell.attr({text:{fill:'black'}});
		}else if (value == "0110") {
		  cell.attr(".satvalue/text", "(PS, PD)");
		  cell.attr({text:{fill:'red'}});
		}else if ((value == "0111") || (value == "0101")){
		  cell.attr(".satvalue/text", "(PS, FD)");
		  cell.attr({text:{fill:'red'}});
		}else if ((value == "1110") || (value == "1010")){
		  cell.attr(".satvalue/text", "(FS, PD)");
		  cell.attr({text:{fill:'red'}});
		}else if ((value == "1111") || (value == "1001") || (value == "1101") || (value == "1011") ){
		  cell.attr(".satvalue/text", "(FS, FD)"); 
		  cell.attr({text:{fill:'red'}});
		}else if (value == "0000") {
	      cell.attr(".satvalue/text", "(T,T)");
	      cell.attr({text:{fill:'black'}});
		}else {
		  cell.removeAttr(".satvalue/d");
		}
	}
	
}

function updatePagination(currentPage){
	var pagination = document.getElementById("pagination");
	var nextSteps_array_size = analysisResult.elementList[0].valueList.length - 1;
	if(nextSteps_array_size > 6){
		renderPreviousBtn(pagination, currentPage);
		if(currentPage - 3 < 0){
			for(var i = 0; i < 6; i++){
				render_pagination_values(currentPage, i);
			}
		}else{
			if(currentPage + 3 < nextSteps_array_size){
				for(i = currentPage - 3; i < currentPage + 3; i++){
					render_pagination_values(currentPage, i);
				}				
			}else{
				for(i = currentPage - 3; i < nextSteps_array_size; i++){
					render_pagination_values(currentPage, i);
				}
			}
		}
		renderForwardBtn(pagination, currentPage)
	}else{
		renderPreviousBtn(pagination, currentPage);
		for(var i = 0; i < nextSteps_array_size; i++){
			render_pagination_values(currentPage, i);
		}
		renderForwardBtn(pagination, currentPage)
	}
}

function renderPreviousBtn(pagination, currentPage){
	var value;
	if(currentPage == 0){
		value = 0;
	}else{
		value = currentPage - 1;
	}
	pagination.innerHTML += '<a href="#" onclick="renderNavigationSidebar('+value.toString()+')">&laquo;</a>';
}

function renderForwardBtn(pagination, currentPage){
	var value;
	var nextSteps_array_size = analysisResult.elementList[0].valueList.length - 1;

	if(currentPage == nextSteps_array_size-1){
		value = currentPage;
	}else{
		value = currentPage + 1;
	}
	pagination.innerHTML += '<a href="#" onclick="renderNavigationSidebar(' + value.toString() + ')">&raquo;</a>';
}

function render_pagination_values(currentPage, i){
	var pagination = document.getElementById("pagination");
	if(currentPage == i){
		pagination.innerHTML += '<a href="#" class="active" onclick="renderNavigationSidebar(' + i.toString() + ')">' + i.toString() + '</a>';					
	}else{
		pagination.innerHTML += '<a href="#" onclick="renderNavigationSidebar(' + i.toString() + ')">' + i.toString() + '</a>';					
	}
}

function clear_pagination_values(){
	var pagination = document.getElementById("pagination");
	var num_states_lbl = document.getElementById("num_states_lbl");
	var currentPageIn = document.getElementById("currentPage");
	
	pagination.innerHTML = "";
	num_states_lbl.innerHTML = "";
	currentPageIn.value = "";
}

function goToState(){ 
	var requiredState = parseInt(document.getElementById("requiredState").value);
	var nextSteps_array_size = analysisResult.elementList[0].valueList.length - 1;

	if((requiredState != "NaN") && (requiredState > 0)){
		if(requiredState > nextSteps_array_size){
			renderNavigationSidebar(nextSteps_array_size);
		}else{
			renderNavigationSidebar(requiredState);
		}
	}
}

var tempResults;

function add_filter(){
	tempResults = $.extend(true,{}, originalResults);

	for(var i_element = 0; i_element < document.getElementsByClassName("filter_checkbox").length; i_element++){
		checkbox = document.getElementsByClassName("filter_checkbox")[i_element]

		if((checkbox.id == "conflictFl") && (checkbox.checked)){
			for(var i_states = 0 ; i_states < tempResults.elementList[0].valueList.length; i_states++){
				var remove = false;
				for(var i = 0; i < elements.length; i++){
					value = tempResults.elementList[i].valueList[i_states];
					if (	(value == "0110") || 
							(value == "0111") || 
							(value == "0101") || 
							(value == "1110") || 
							(value == "1010") ||
							(value == "1111") || 
							(value == "1001") || 
							(value == "1101") || 
							(value == "1011") ){
						remove = true;
						break;
					}
				}
				if(remove){
					for(var i = 0; i < elements.length; i++){
						tempResults.elementList[i].valueList.splice(i_states,1);
					}
					i_states--;
				}
			}
		}
		
		if((checkbox.id == "ttFl") && (checkbox.checked)){
			for(var i_states = 0 ; i_states < tempResults.elementList[0].valueList.length; i_states++){
				var remove = false;
				for(var i = 0; i < elements.length; i++){
					value = tempResults.elementList[i].valueList[i_states];
					if (value == "0000"){
						remove = true;
						break;
					}
				}
				if(remove){
					for(var i = 0; i < elements.length; i++){
						tempResults.elementList[i].valueList.splice(i_states,1);
					}
					i_states--;
				}
			}
		}

	}

	this.analysisResult = tempResults;

	renderNavigationSidebar();
}

