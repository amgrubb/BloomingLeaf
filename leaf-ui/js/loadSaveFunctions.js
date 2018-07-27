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
			var obj = JSON.parse(reader.result);
 			var cells = obj.cells;
 			// Actors
			for (var i = 0; i < cells.length; i++) {
				if (cells[i].type == 'basic.Actor') {
					var actorName = cells[i].attrs['.name'].text;
					var newActor = new Actor(actorName);
					cells[i]["nodeID"]  = newActor.nodeID;
					model.actors.push(newActor);
				}
                if (cells[i].type == 'link') {
					var Type = cells[i]["link-type"].toUpperCase();
					var linkType = Type.replace(/\s/g, '').split("|")[0];
					var evolvRelationships = Type.replace(/\s/g, '').split("|")[1];
					
					var absoluteValue = cells[i].attrs[".assigned_time"]["0"]
					var sourceID = cells[i].source.id;
					var targetID = cells[i].target.id;
					
					var source = getNodeID(sourceID, cells);
					var target = getNodeID(targetID, cells);
					
					// add absoluteValue and postType
				    var newLink = new Link(linkType,source,absoluteValue);
					newLink.linkDestID = target;
					newLink.postType = evolvRelationships;
			
					// add linkID
					cells[i]["linkID"]  = newLink.linkID;
					model.links.push(newLink);
					}
					
   
   
               }

		
		
			}
			
			graph.fromJSON(obj);
			

		}
	}

function getNodeID(nodeID, cells) {
    for (var i = 0; i < cells.length; i++) {
        if (cells[i].id == nodeID) {
            return cells[i].nodeID;
        }
    }

    return "-";
}


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