// function InputLink(linkType, linkSrcID, linkDestID, postType = null, absVal = -1){
// 	this.linkType = linkType;
// 	this.linkSrcID = linkSrcID;
// 	this.linkDestID = linkDestID;
// 	this.postType = postType;
// 	this.absoluteValue = absVal;
// }

class InputLink {
	constructor(linkType, linkSrcID, linkDestID, postType = null, absVal = -1) {
		this.linkType = linkType;
		this.linkSrcID = linkSrcID;
		this.linkDestID = linkDestID;
		this.postType = postType;
		this.absoluteValue = absVal;
	}
}

function getLinks(){

	var links = [];
	getIntentitonalElements();
	//Verifying if links are valid
	graph.getLinks().forEach(function(link){
	    if(isLinkInvalid(link))
	    		link.remove();
    });

	for (var i = 0; i < graph.getLinks().length; i++){

		var current = graph.getLinks()[i];
		var linkType = current.label(0).attrs.text.text.toUpperCase()
		var source = "-";
		var target = "-";
		var absValue = 0;
		if(graph.getLinks()[i].attr('.assigned_time') != undefined){
			absValue = parseInt(graph.getLinks()[i].attr('.assigned_time')[0]);
		}
		if (current.get("source").id)
			source = graph.getCell(current.get("source").id).prop("elementid");
		if (current.get("target").id)
			target = graph.getCell(current.get("target").id).prop("elementid");

		var link;

		//Remove constraints links
		if(!(linkType.indexOf("=") > -1 || linkType.indexOf("<") > -1)){
			//Adding links links
			if (linkType.indexOf("|") > -1){

				evolvRelationships = linkType.replace(/\s/g, '').split("|");
				link = new InputLink(evolvRelationships[0], source, target, evolvRelationships[1], absValue);
			}else if(linkType == "NBT"){
				link = new InputLink(linkType, source, target, null, absValue);
			}else if(linkType == "NBD"){
				link = new InputLink(linkType, source, target, null, absValue);
			}else{
				link = new InputLink(linkType, source, target);
			}

			links.push(link);
		}

	}

	return links;

}

function isLinkInvalid(link){
	return (!link.prop('source/id') || !link.prop('target/id'));
}
