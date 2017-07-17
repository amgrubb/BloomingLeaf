function InputLink(linkType, linkSrcID, linkDestID, postType = null){
	this.linkType = linkType;
	this.linkSrcID = linkSrcID;
	this.linkDestID = linkDestID;
	this.postType = postType;
}

function getLinks(){
	
	var links = [];

	//Verifying if links are valid
	graph.getLinks().forEach(function(link){
	    if(isLinkInvalid(link)) 
	    		link.remove();
    });
	
	for (var i = 0; i < graph.getLinks().length; i++){
		
		var current = graph.getLinks()[i];
		var relationship = current.label(0).attrs.text.text.toUpperCase()
		var source = "-";
		var target = "-";

		if (current.get("source").id)
			source = graph.getCell(current.get("source").id).prop("elementid");
		if (current.get("target").id)
			target = graph.getCell(current.get("target").id).prop("elementid");

		var link;

		if (relationship.indexOf("|") > -1){
			evolvRelationships = relationship.replace(/\s/g, '').split("|");
			link = new InputLink(evolvRelationships[0], source, target, evolvRelationships[1]);
		}else{
			link = new InputLink(relationship, source, target);
		}

		links.push(link);
	}
	
	return links;
	
}

function isLinkInvalid(link){
	return (!link.prop('source/id') || !link.prop('target/id'));
}
