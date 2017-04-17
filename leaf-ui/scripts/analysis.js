//Get necessary variables from the main page
document = window.opener.document;
graph = window.opener.graph;
console.log(JSON.stringify(window.opener.global_analysisResult));
graphObject = window.opener.graphObject;
var analysisResult = window.opener.global_analysisResult;

// Create a paper and wrap it in a PaperScroller.
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

renderNavigationSidebar();

function renderNavigationSidebar(currentPage){
	clear_pagination_values();
	
	var currentPageIn = document.getElementById("currentPage");
	var num_states_lbl = document.getElementById("num_states_lbl");
	num_states_lbl.innerHTML += analysisResult.elementList[0].valueList.length;
	
	if(!currentPage){
		currentPage = 0;
	}
	
	currentPageIn.value = currentPage.toString();
	
	updatePagination(currentPage);

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

window.onload = load_analysis_viewew();

function load_analysis_viewew(){
};