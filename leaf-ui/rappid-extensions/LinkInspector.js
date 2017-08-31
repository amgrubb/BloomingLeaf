//Class for the Link properties tab that appears when link settings are clicked.

var LinkInspector = Backbone.View.extend({

  className: 'link-inspector',

  template: [
    '<label id="title">Constant Relationship</label>',
    '<br>',
    '<select id="constant-links" class="link-type">',
    '</select>',
    '<h5 id="repeat-error" class="inspector-error"></h5>',
      '<button id="switch-link-type" class="inspector-btn small-btn blue-btn">Evolving Relationships</button>',
    '<br>'
  ].join(''),

  evolving_template : [
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
	    //REFACTORING	  
	    
	    'change #link-type-begin': 'updateEvolvingRelations',
	    'change #link-type-end': 'updateEvolvingRelations',

  },
  //Method to create the Link Inspector using the template.
  render: function(cellView) {
    this._cellView = cellView;
    var cell = this._cellView.model;
    var type = cellView.model.attributes.labels[0].attrs.text.text;

    // select template
    if (cell.prop("linktype")){
      this.$el.html(_.template(this.actortemplate)());
      this.$('#actor-link').val(cell.prop("link-type"));
      console.log(cellView.model.attributes.labels[0].attrs.text.text);
    }else{
    	var val = type.split("|");
    	if(val.length > 1){
    	      this.$el.html(_.template(this.evolving_template)());
    	        this.appendSelectValues($('#link-type-begin'), "All");
    	        $('#link-type-begin').val(val[0]);
    	        this.updateEvolvingRelations(null, true);
    	        $('#link-type-end').val(val[1]);

    	        $("#repeat-error").text("");
    	        this.evolvingRelations = true;

    	}else{
    	      this.$el.html(_.template(this.template)());  
  	        	this.appendSelectValues($('#constant-links'), "Const");

    	      this.$('#constant-links').val(val[0]);
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
    if (!this.evolvingRelations){
	      this.$el.html(_.template(this.evolving_template)());
	      $("#link-type-end").prop('disabled', 'disabled');
	      $("#link-type-end").css("background-color","grey");
	      this.appendSelectValues($('#link-type-begin'), "All");
    }else{
	      this.$el.html(_.template(this.template)());    
	      this.appendSelectValues($('#constant-links'), "Const");
    }
    this.evolvingRelations = !this.evolvingRelations;
  },
  updateConstantRelationship: function(){
    var link = this._cellView.model;
    var source = link.getSourceElement();
	var target = link.getTargetElement();
	    
      link.prop("link-type", this.$('.link-type').val());
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
        link.label(0 ,{position: 0.5, attrs: {text: {text: this.$('.link-type option:selected').text()}}});
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
    		  source.attr(".funcvalue/text", "");
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
  // Generates the drop values based on connected intentions
  updateEvolvingRelations: function(e, intialize){
    var target;
    var value;

    // used to render from initialization
    if (intialize){
      target = "link-type-begin";
      value = $('#link-type-begin').val();

    // used to render from click
    }else{
      target = e.target.id;
      value = e.target.value;
    }

    // update selects for link-type-end
    if (target == "link-type-begin"){

      $("#link-type-end").prop('disabled', '');
      $("#link-type-end").css("background-color","");

      $("#repeat-error").text("Please select End Relationship");
      $("#repeat-error").css("color", "");
      $("#repeat-error").show("fast");

      
      if (value == "no"){
        this.appendSelectValues($("#link-type-end"), "All");
      }else if(value == "and" || value == "or"){
        this.appendSelectValues($("#link-type-end"), "A");
      }else{
        this.appendSelectValues($("#link-type-end"), "B");
      }

    // save value
    }else if(target == "link-type-end"){
      $("#repeat-error").text("Saved!");
      $("#repeat-error").css("color", "lightgreen");

      this.updateCell();
    }
  },

  // Restrict select options based on selection made in link-type begin
  appendSelectValues: function(select, type){

    var relationTextA = ["And-Decomposition", "Or-Decomposition"];
    var relationTextB = ["++", "--", "+", "-", "+S", "++S", "-S", "--S", "+D", "++D", "-D", "--D"];
    var relationValA = ["and", "or"];
    var relationValB = ["++", "--", "+", "-", "+S", "++S", "-S", "--S", "+D", "++D", "-D", "--D"];
    var relationTextConst = ["Noth Both (None)","Not Both (Denied)"];
    var relationValConst = ["NBT","NBD"];
	    
    if (select.attr("id") == "link-type-begin"){
      select.html('<option class="select-placeholder" selected disabled value="">Begin</option>');
    }else if (select.attr("id") == "link-type-end"){
      select.html('<option class="select-placeholder" selected disabled value="">End</option>');
    }

    select.append($('<option></option>').val("no").html("No Relationship"));
  
    if(type == "Const"){
    	for (var i = 0; i < relationTextA.length; i++)
            select.append($('<option></option>').val(relationValA[i]).html(relationTextA[i]));
    	for (var i = 0; i < relationTextB.length; i++)
            select.append($('<option></option>').val(relationValB[i]).html(relationTextB[i]));
    	for (var i = 0; i < relationTextConst.length; i++)
            select.append($('<option></option>').val(relationValConst[i]).html(relationTextConst[i]));
    }
    else if(type == "All"){
      for (var i = 0; i < relationTextA.length; i++)
        select.append($('<option></option>').val(relationValA[i]).html(relationTextA[i]));
      for (var i = 0; i < relationTextB.length; i++)
        select.append($('<option></option>').val(relationValB[i]).html(relationTextB[i]));

    }else if (type == "A"){
      select.val("no");
      $("#repeat-error").text("Saved!");
      $("#repeat-error").css("color", "lightgreen");
      $("#link-type-end").prop('disabled', '');
      $("#link-type-end").css("background-color","");
      this.updateCell();

    }else if (type == "B"){
      for (var i = 0; i < relationTextB.length; i++)
        select.append($('<option></option>').val(relationValB[i]).html(relationTextB[i]));
    }

    // Remove duplicate options
    if (select.attr("id") == "link-type-end"){
      var dupVal = this.$('#link-type-begin').val();
      $("select#link-type-end option").filter("[value='" + dupVal + "']").remove();
    }
  },

  //Whenever something is changed in the inspector, make the corresponding change to the link in the model.
  updateCell: function() {
    var link = this._cellView.model;
    var source = link.getSourceElement();
    var target = link.getTargetElement();
    // Save based on evolving relations
    if(this.evolvingRelations){
      var begin = $("#link-type-begin").val();
      var end = $("#link-type-end").val();

      this._cellView.model.prop("link-type", begin + "|" + end);
      link.attr({
        '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
        '.marker-source': {'d': '0'},
        '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
      });
      link.label(0 ,{position: 0.5, attrs: {text: {text: begin + " | " + end}}});
      source.attr(".funcvalue/text", "");
      target.attr(".funcvalue/text", "");
    }
  },

  clear: function(){
    this.$el.html('');
  }
});
