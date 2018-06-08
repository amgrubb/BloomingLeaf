/**
 * Set up Ctrl+c and Ctrl+v shortcut for macOS
 *  
 */
var clipboard = new joint.ui.Clipboard();
// Check if the browser is on Mac
var macOS = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)?true:false;
if(macOS){
	KeyboardJS.on('command + c, ctrl + c', function() {
		// Copy all selected elements and their associatedf links.
		clipboard.copyElements(selection, graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
	});
	KeyboardJS.on('command + v, ctrl + v', function() {
		clipboard.pasteCells(graph);

		selectionView.cancelSelection();

		clipboard.pasteCells(graph, { link: { z: -1 }, useLocalStorage: true });

		// Make sure pasted elements get selected immediately. This makes the UX better as
		// the user can immediately manipulate the pasted elements.
		clipboard.each(function(cell) {
			if (cell.get('type') === 'link') return;

			// Push to the selection not to the model from the clipboard but put the model into the graph.
			// Note that they are different models. There is no views associated with the models
			// in clipboard.
			selection.add(graph.get('cells').get(cell.id));
		});

		selection.each(function(cell) {
		selectionView.createSelectionBox(paper.findViewByModel(cell));
		});
	});

}
else{
	KeyboardJS.on('ctrl + c', function() {
		// Copy all selected elements and their associatedf links.
		clipboard.copyElements(selection, graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
	});
	KeyboardJS.on('ctrl + v', function() {
		clipboard.pasteCells(graph);

		selectionView.cancelSelection();

		clipboard.pasteCells(graph, { link: { z: -1 }, useLocalStorage: true });

		// Make sure pasted elements get selected immediately. This makes the UX better as
		// the user can immediately manipulate the pasted elements.
		clipboard.each(function(cell) {
			if (cell.get('type') === 'link') return;

			// Push to the selection not to the model from the clipboard but put the model into the graph.
			// Note that they are different models. There is no views associated with the models
			// in clipboard.
			selection.add(graph.get('cells').get(cell.id));
		});

		selection.each(function(cell) {
		selectionView.createSelectionBox(paper.findViewByModel(cell));
		});
	});

}


/**
 * Read and load a saved JSON file
 *
 */
// Simulator
loader = document.getElementById("loader");
reader = new FileReader();

// Whenever the input is changed, read the file.
loader.onchange = function(){
	reader.readAsText(loader.files.item(0));
};

// When read is performed, if successful, load that file.
reader.onload = function(){

	if (reader.result) {
		if (mode == "Modelling") {
			graph.fromJSON(JSON.parse(reader.result));

			// Load different links and intension constraints
			var allLinks = graph.getLinks();
			graph.links = [];
			graph.intensionConstraints = [];
			allLinks.forEach(function(link){
				if (link.attr('./display') == "none") {
					graph.intensionConstraints.push(link);
				} else {
					graph.links.push(link);
				}
			});
		}
	}
};



/**
 * Helper function to download saved graph in JSON format
 *
 */
function download(filename, text) {
	var dl = document.createElement('a');
	dl.setAttribute('href', 'data:application/force-download;charset=utf-8,' + encodeURIComponent(text));
	dl.setAttribute('download', filename);

	dl.style.display = 'none';
	document.body.appendChild(dl);

	dl.click();
	document.body.removeChild(dl);
}


/**
 * General javascript for user interaction
 * When the user clicks anywhere outside of the a pop up, close it
 *
 */
window.onclick = function(event) {
	var modal = document.getElementById('myModal');
	var intermT = document.getElementById('intermediateTable');
  if (event.target == modal) {
  	modal.style.display = "none";
  }
	if(event.target == intermT){
		intermT.style.display = "none";
	}
}