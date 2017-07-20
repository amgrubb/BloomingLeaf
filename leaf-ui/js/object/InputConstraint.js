function InputConstraint(constraintType, constraintSrcID, constraintSrcEB, absoluteValue, constraintDestID, constraintDestEB){
	this.constraintType = constraintType;  	// "<" "=" "A"
	this.constraintSrcID = constraintSrcID;
	this.constraintSrcEB = constraintSrcEB;		// "REL" for relationships
	this.absoluteValue = absoluteValue;			// If "A" integer value
	this.constraintDestID = constraintDestID;
	this.constraintDestEB = constraintDestEB;		// "REL" for relationships
}

function getConstraints(){
	var constraints = [];
	//Getting constrainst from Analysis:View List of Assignments
	//NODES
	var elements = graph.getElements();
	
	//TODO Ask about constraintSrcEB and constraintDestEB also who is the Src and Trg.
	/*for (var i = 0; i < elements.length; i ++){
		
		var cellView = elements[i].findView(paper);
		var cell = cellView.model;
		var func = cell.attr('.funcvalue').text;
		
		if(func != 'UD' && func != 'D' && func != 'I' && func != 'C' && func != 'R'){
			var name = cell.attr('.name').text;
			var assigned_time = cell.attr('.assigned_time')[0];

			//TODO Aks about the other types
			var constraintType = "A";
			var constraintSrcID = 
			
			var constraint = new InputConstraint(constraintType, constraintSrcID, "REL", assigned_time, constraintDestID, "REL");
			constraints.push(constraint);
			
			$('#node-list').append('<tr><td>' + 'A' + '</td><td>' + func + '</td><td>' + name +
				'</td><td><input type="text" name="sth" value="' + assigned_time + '"></td>' + btn_html +
				'<input type="hidden" name="id" value="' + cell.id + '"> </td> </tr>');

		}
	}*/
	
	
	
	//RELATIONSHIPS
	var links = graph.getLinks();
	
	for (var i = 0; i < links.length; i ++){
		var link = links[i];
		var link_type = link.get('labels')[0].attrs.text.text;
		if (link_type == 'NBD' || link_type == 'NBT' || link_type.indexOf('|') > -1){
			var constraintType = link_type;
			var constraintSrcID = null;
			var constraintDestID = null;
			if (link.get("source").id){
				var source = graph.getCell(link.get("source").id);
				constraintSrcID = source.attributes.elementid;
			}
			if (link.get("target").id){
				var target = graph.getCell(link.get("target").id);
				constraintDestID = target.attributes.elementid;
			}
			
			var assigned_time;
			if (source && target){
				var assigned_time = link.attr('.assigned_time')[0];
			}			
			
			var constraint = new InputConstraint(constraintType, constraintSrcID, "REL", assigned_time, constraintDestID, "REL");
			constraints.push(constraint);
		}

	}
	
	/***
	//TODO: get relationships constrains from Model Constraints view (BUG:Constraints in this view are not being saved)

	var savedConstraints = [];
	for (var e = 0; e < savedConstraints.length; e++){
		var c = savedConstraints[e];
		var type = c.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
		var source = c.getSourceElement().attributes.elementid;
		var target = c.getTargetElement().attributes.elementid;
		var sourceVar = c.attr('.constraintvar/src');
		var targetVar = c.attr('.constraintvar/tar');

		var constraint = new InputConstraint(
				type,
				source,
				sourceVar,
				null,
				target,
				targetVar);

		constraints.push(constraint);
	}
	**/
	
	return constraints;
	
}