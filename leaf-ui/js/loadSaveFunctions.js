/**
 * Read and load a saved JSON file
 *
 */
// Simulator
loader = document.getElementById("loader");
reader = new FileReader();

// Whenever the input is changed, read the file.
loader.onchange = function() {
	reader.readAsText(loader.files.item(0));
};

// When read is performed, if successful, load that file.
reader.onload = function() {

	if (reader.result) {
		if (mode == "Modelling") {
			graph.fromJSON(JSON.parse(reader.result));

			// Load different links and intension constraints
			var allLinks = graph.getLinks();
			graph.links = [];
			graph.intensionConstraints = [];
			allLinks.forEach(function(link) {
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