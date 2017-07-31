function InputEvolving(source, destination, preCond, posCond, absoluteTime, isDecomposition = false){
	this.isDecomposition = isDecomposition;
	this.source = source;
	this.destination = destination;
	this.preCond = preCond;
	this.posCond = posCond;
	this.absoliteTime = absoluteTime;
}

function getEvolvings(){
	var links = graph.getLinks();
	
	var evolvings = [];
	
	for (var i = 0; i < links.length; i ++){
		var link = links[i];
		var link_type = link.get('labels')[0].attrs.text.text;
		if (link_type == 'NBD' || link_type == 'NBT' || link_type.indexOf('|') > -1){
			var constraintType = link_type;
			var source = null;
			var destination = null;
			if (link.get("source").id){
				var elementSrc = graph.getCell(link.get("source").id);
				source = elementSrc.attributes.elementid;
			}
			if (link.get("target").id){
				var elementTgt = graph.getCell(link.get("target").id);
				destination = elementTgt.attributes.elementid;
			}
			
			var absoluteTime;
			if (source && destination){
				var absoluteTime = link.attr('.assigned_time')[0];
			}
			
			
			//TODO: preCondition values and posCondition values?
			var preCond = "UNK";
			var posCond = "UNK";
			
			var evolving = new InputEvolving(source, destination, preCond, posCond, absoluteTime, isDecomposition = false);
			evolvings.push(evolving);
		}

	}	
	
	return evolvings;
}
