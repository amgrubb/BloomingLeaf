function showAnalysis(analysisObject){
	var urlBase = document.URL.substring(0, document.URL.lastIndexOf('/')+1);
	var url = urlBase+"analysis.html";	
	
	//BEGIN: CREATING A TEST OBJECT
	var foundSolution = true;
	var relativeTime = [0, 1, 2, 3, 4];
	var absoluteTime = [0, 1, 27, 50, 92];

	//CREATING NODES
	var states_1 = ["0010", "0100", "1000", "0010", "0010"];
	var states_2 = ["0001", "0010", "0010", "1000", "0010"];
	var states_3 = ["0010", "0010", "1000", "1000", "1000"];

	var node1 = new IONode("1", states_1);
	var node2 = new IONode("2", states_2);
	var node3 = new IONode("3", states_3);

	var nodes = [];
	nodes.push(node1);
	nodes.push(node2);
	nodes.push(node3);

	//CREATING LINKS
	linkType_1 = "OR";
	linkSrcID_1 = "1";
	linkDestID_1 = "2";

	linkType_2 = "AND";
	linkSrcID_2 = "1";
	linkDestID_2 = "3";

	var link1 = new IOLink(linkType_1, linkSrcID_1, linkDestID_1);
	var link2 = new IOLink(linkType_2, linkSrcID_2, linkDestID_2);

	var links = [];
	links.push(link1);
	links.push(link2);

	var testOutput = new IOAnalysis(foundSolution, relativeTime, absoluteTime, nodes, links);
	//END: CREATING A TEST OBJECT
	
	//var thisIsAnObject = {"foo":"bar"};
	var w = window.open(url, "Analysis View", "status=0,title=0,height=600,width=1200,scrollbars=1");
	w.analysisObject = testOutput;
	
	
	if (!w) {
	    alert('You must allow popups for this map to work.');
	}

}


