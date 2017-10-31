//Class for the Link properties tab that appears when link settings are clicked.

var LinkInspector = Backbone.View.extend({

  className: 'link-inspec',

  template: [
    '<label id="title">Constant Relationship</label>',
    '<br>',
    '<select id="constant-links" class="link-type">',
    '</select>',
    '<h5 id="repeat-error" class="inspector-error"></h5>',
      '<button id="switch-link-type" class="inspector-btn small-btn blue-btn">Evolving Relationships</button>',
    '<br>'
  ].join(''),

  evolvingtemplate : [
	  	'<label id="title">Evolving Relationship</label>',
	    '<br>',
	    '<h5 id="repeat-error" class="inspector-error"></h5>',
		  '<select id="link-type-begin" class="repeat-select">',
		  '</select>',
		  '<select id="link-type-end" class="repeat-select">',
		  '</select>',
		  '<button id="switch-link-type" class="inspector-btn small-btn blue-btn">Constant Relationships</button>',
	    '<br>'
  ].join(''),

  actortemplate: [
      '<label> Link Type </label> <br>',
      '<select id="actor-link" class="link-type">',
        '<option value="is-a">is-a</option>',
        '<option value="plays">plays</option>',
        '<option value="is-part-of">is-part-of</option>',
      '</select><br>'].join(''),

  events: {
	    'click #switch-link-type': 'switchMode',
	    'change #constant-links': 'updateConstantRelationship',
	    'change #actor-link': 'updateActorLink',
	    'change #link-type-begin': 'updateBeginEvolRelations',
	    'change #link-type-end': 'updateEndEvolRelations',
  },
  //Method to create the Link Inspector using the template.
  render: function(cellView) {
    this._cellView = cellView;
    var cell = this._cellView.model;
    var type = cellView.model.attributes.labels[0].attrs.text.text;
    var values = type.split("|");

    //Selecting which template to render ACTOR-LINK or INTENTIONS-LINK
    if(cell.prop("linktype")){
    	this.$el.html(_.template(this.actortemplate)());
    	$('#actor-link').val(cell.prop("link-type"));
    }else{
    	if((values.length > 1)){
    		this.$el.html(_.template(this.evolvingtemplate)());
    	    if(values.length > 1){
    	    	this.appendSelectValues($('#link-type-begin'), "All");
    	    	$('#link-type-begin').val(values[0].trim()).change();
    	    	this.updateBeginEvolRelations;
    	    	$('#link-type-end').val(values[1].trim());
    	    }else{
    	  	    $("#link-type-end").prop('disabled', 'disabled');
    	  	    $("#link-type-end").css("background-color","grey");
    		    this.appendSelectValues($('#link-type-begin'), "All");
    	    }
    	    $this.evolvingRelations = true;
    	}else{
    		this.$el.html(_.template(this.template)());
  	      	this.appendSelectValues($('#constant-links'), "Const");
			$('#constant-links').val(values[0]);
			this.evolvingRelations = false;
    	}
	}
    cell.on('remove', function() {
      this.$el.html('');
    }, this);

  },
  //EVENTS FUNCTIONS
  // Switch between evolving and constant relationships
  switchMode: function(){
	  var cell = this._cellView.model;
	  var type = cell.attributes.labels[0].attrs.text.text;
	  var values = type.split("|");
	  this.evolvingRelations = !this.evolvingRelations;
	  if(this.evolvingRelations){
		  this.$el.html(_.template(this.evolvingtemplate)());
		  if(values.length > 1){
  	    	this.appendSelectValues($('#link-type-begin'), "All");
  	    	$('#link-type-begin').val(values[0].trim()).change();
  	    	this.updateBeginEvolRelations;
  	    	$('#link-type-end').val(values[1].trim());
  	    }else{
  	  	    $("#link-type-end").prop('disabled', 'disabled');
  	  	    $("#link-type-end").css("background-color","grey");
  		    this.appendSelectValues($('#link-type-begin'), "All");
  	    }
	  }else{
  		this.$el.html(_.template(this.template)());
      	this.appendSelectValues($('#constant-links'), "Const");
		$('#constant-links').val(values[0].trim());
		this.evolvingRelations = false;
	  }
  },

  updateConstantRelationship: function(){
    var link = this._cellView.model;
    var source = link.getSourceElement();
	var target = link.getTargetElement();

      link.prop("link-type", $('.link-type').val());
      if (link.prop("link-type") == 'and' || link.prop("link-type") == 'or'){
        link.attr({
          '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
          '.marker-source': {'d': '0'},
          '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
        });
        link.label(0 ,{position: 0.5, attrs: {text: {text: link.prop("link-type")}}});

      }else if(link.prop("link-type") == 'NBT' || link.prop("link-type") == 'NBD'){
        link.attr({
          '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
          '.marker-source': {'d': '0'},
          '.marker-target': {stroke: '#000000', "d": '0'}
        });
        link.label(0 ,{position: 0.5, attrs: {text: {text: link.prop("link-type")}}});
      }else{
        link.attr({
          '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
          '.marker-source': {'d': '0'},
          '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
        });
        link.label(0 ,{position: 0.5, attrs: {text: {text: $('.link-type option:selected').text()}}});
      }

      //Adding or removing tags from node depending on type of link
      if (link.prop("link-type") == 'NBT' || link.prop("link-type") == 'NBD'){
        source.attr(".funcvalue/text", "NB");
        source.attr(".satvalue/text", "");
        source.attr(".satvalue/value", "");
        target.attr(".funcvalue/text", "NB");
        target.attr(".satvalue/text", "");
        target.attr(".satvalue/value", "");
      } else {

    	  //verify if node have any other link NBD or NBT
    	  var sourceNBLink = function(){
    		  var localLinks = graph.getLinks();
    		  for(var i = 0; i < localLinks.length; i++){
    			  if ((localLinks[i]!=link) && (localLinks[i].prop("link-type") == 'NBT' || localLinks[i].prop("link-type") == 'NBD')){
        			  if(localLinks[i].getSourceElement() == source || localLinks[i].getTargetElement() == source){
        				 return true;
        			  }
    			  }
    		  }
    		  return false;
    	  }

    	  //verify if target have any other link NBD or NBT
    	  var targetNBLink = function(){
    		  var localLinks = graph.getLinks();
    		  for(var i = 0; i < localLinks.length; i++){
    			  if ((localLinks[i]!=link) && (localLinks[i].prop("link-type") == 'NBT' || localLinks[i].prop("link-type") == 'NBD')){
        			  if(localLinks[i].getTargetElement() == target || localLinks[i].getSourceElement() == target){
        				 return true;
        			  }
    			  }
    		  }
    		  return false;
    	  }

    	  //Verify if it is possible to remove the NB tag from source and target
    	  if(!sourceNBLink()){
    		  //source.attr(".funcvalue/text", "");
    	  }
    	  if(!targetNBLink()){
	          target.attr(".funcvalue/text", "");
    	  }
      }

  },
  updateActorLink: function(){
	  var link = this._cellView.model;
	  var source = link.getSourceElement();
	  var target = link.getTargetElement();
	  link.prop("link-type", $("#actor-link").val());
	  link.label(0 ,{position: 0.5, attrs: {text: {text: link.prop("link-type")}}});
  },
  // Generates the select values based on begin value
  updateBeginEvolRelations: function(){
      $("#repeat-error").text("");
	  var begin = $("#link-type-begin").val();
	  //Enable the end select
	  if (begin == "no"){
        this.appendSelectValues($("#link-type-end"), "All");
        $("#link-type-end").prop('disabled', false);
        $("#link-type-end").css("background-color","gray");
        $("#repeat-error").text("");
      }else if(begin == "and" || begin == "or"){
        this.appendSelectValues($("#link-type-end"), "A");
        $("#link-type-end").prop('disabled', false);
        $("#link-type-end").css("background-color","");
        //Saving this option
        var begin = $("#link-type-begin").val();
        var end = $("#link-type-end").val();

        var link = this._cellView.model;
        link.prop("link-type", begin + "|" + end);
        link.attr({
  		  '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
  		  '.marker-source': {'d': '0'},
  		  '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
  		});
  		link.label(0 ,{position: 0.5, attrs: {text: {text: begin + " | " + end}}});

  		$("#repeat-error").text("Saved!");
  		$("#repeat-error").css("color", "lightgreen");

      }else{
        this.appendSelectValues($("#link-type-end"), "B");
        $("#link-type-end").prop('disabled', '');
        $("#link-type-end").css("background-color","");
      }


  },
  updateEndEvolRelations: function(){

      var link = this._cellView.model;

      // Save based on evolving relations
      var begin = $("#link-type-begin").val();
      var end = $("#link-type-end").val();

		this._cellView.model.prop("link-type", begin + "|" + end);
		link.attr({
		  '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
		  '.marker-source': {'d': '0'},
		  '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
		});
		link.label(0 ,{position: 0.5, attrs: {text: {text: begin + " | " + end}}});

		$("#repeat-error").text("Saved!");
		$("#repeat-error").css("color", "lightgreen");

  },
  // Restrict select options based on selection made in link-type begin
  appendSelectValues: function(select, type){

      var relationA = {
              "and": "And-Decomposition",
              "or": "Or-Decomposition"
          };
      var relationB = {
    		  "++": "++",
    		  "--": "--",
    		  "+": "+",
    		  "-": "-",
    		  "+S": "+S",
    		  "++S": "++S",
    		  "-S": "-S",
    		  "--S": "--S",
    		  "+D": "+D",
    		  "++D": "++D",
    		  "-D": "-D",
    		  "--D": "--D"
      	};
      var relationConst = {
    		  "NBT": "Noth Both (None)",
    		  "NBD": "Not Both (Denied)"
      };

    if (select.attr("id") == "link-type-begin"){
      select.html('<option class="select-placeholder" selected disabled value="">Begin</option>');
    }else if (select.attr("id") == "link-type-end"){
      select.html('<option class="select-placeholder" selected disabled value="">End</option>');
    }

    select.append($('<option></option>').val("no").html("No Relationship"));

    if(type == "Const"){
    	$.each(relationA, function (value, key) {
            select.append($("<option></option>")
               .attr("value", value).text(key));
        });
    	$.each(relationB, function (value, key) {
            select.append($("<option></option>")
               .attr("value", value).text(key));
        });
    	$.each(relationConst, function (value, key) {
            select.append($("<option></option>")
               .attr("value", value).text(key));
        });
    }
    else if(type == "All"){
    	$.each(relationA, function (value, key) {
            select.append($("<option></option>")
               .attr("value", value).text(key));
        });
    	$.each(relationB, function (value, key) {
            select.append($("<option></option>")
               .attr("value", value).text(key));
        });
    }else if (type == "A"){
      select.val("no");
      $("#repeat-error").text("Saved!");
      $("#repeat-error").css("color", "lightgreen");
      $("#link-type-end").prop('disabled', '');
      $("#link-type-end").css("background-color","");

    }else if (type == "B"){
    	$.each(relationB, function (value, key) {
            select.append($("<option></option>")
               .attr("value", value).text(key));
        });
    }

    // Remove duplicate options
    if (select.attr("id") == "link-type-end"){
      var dupVal = $('#link-type-begin').val();
      $("select#link-type-end option").filter("[value='" + dupVal + "']").remove();
    }
  },

  clear: function(){
    this.$el.html('');
  }

});
