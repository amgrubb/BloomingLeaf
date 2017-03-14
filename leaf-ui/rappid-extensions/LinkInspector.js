//Class for the Link properties tab that appears when link settings are clicked.

var LinkInspector = Backbone.View.extend({

  className: 'link-inspector',

  template: [
    '<label id="title">Constant Relationship</label>',
    '<br>',
    '<select class="link-type">',
      '<option value=and>And-Decomposition</option>',
      '<option value=or>Or-Decomposition (Means-end)</option>',
      '<option value=PP>++</option>',
      '<option value=NN>--</option>',
      '<option value=P>+</option>',
      '<option value=N>-</option>',
      '<option value=PS>+S</option>',
      '<option value=PPS>++S</option>',
      '<option value=NS>-S</option>',
      '<option value=NNS>--S</option>',
      '<option value=PD>+D</option>',
      '<option value=PPD>++D</option>',
      '<option value=ND>-D</option>',
      '<option value=NND>--D</option>',
      '<option value=NBT>Noth Both (None)</option>',
      '<option value=NBD>Not Both (Denied)</option>',

    '</select>',
    '<div id="link-div">',
      '<h5 id="repeat-error" class="inspector-error"></h5>',
      '<select id="link-type-begin" class="repeat-select">',
        '<option class="select-placeholder" selected disabled value="">Begin</option>',
      '</select>',
      '<select id="link-type-end" class="repeat-select">',
        '<option class="select-placeholder" selected disabled value="">End</option>',
      '</select>',
      '<button id="switch-link-type" class="inspector-btn small-btn blue-btn">Evolving Relationships</button>',
    '</div>',
    '<br>'
  ].join(''),

  actortemplate: [
      '<label> Link Type </label> <br>',
      '<select class="link-type">',
        '<option value="is-a">is-a</option>',
        '<option value="plays">plays</option>',
        '<option value="is-part-of">is-part-of</option>',
      '</select><br>'].join(''),

  events: {
    'change .link-type': 'updateCell',
    'change #link-type-begin': 'updateEvolvingRelations',
    'change #link-type-end': 'updateEvolvingRelations',

    'click #switch-link-type': 'switchMode',
  },


  //Method to create the Link Inspector using the template.
  render: function(cellView) {
    this._cellView = cellView;
    var cell = this._cellView.model;
    var type = cellView.model.attributes.labels[0].attrs.text.text

    this.relationTextA = ["And-Decomposition", "Or-Decomposition"];
    this.relationTextB = ["++", "--", "+", "-", "+S", "++S", "-S", "--S", "+D", "++D", "-D", "--D"];
    this.relationValA = ["and", "or"];
    this.relationValB = ["PP", "NN", "P", "N", "PS", "PPS", "NS", "NNS", "PD", "PPD", "ND", "NND"];

    // select template
    if (cell.prop("linktype")){
      this.$el.html(_.template(this.actortemplate)());
    }else{
      this.$el.html(_.template(this.template)());
    }

    // already intialized previously
    if (cell.prop("link-type")){
      var val = cell.prop("link-type").split("|");

      // normal relation
      if (val.length == 1){
        this.$('.link-type').val(val[0]);
        this.$('#link-type-begin').hide();
        this.$('#link-type-end').hide();
        this.evolvingRelations = false;

      // evolving relation
      }else{
        this.evolvingRelations = true;
        
        $(".link-type").hide();
        this.appendSelectValues($('#link-type-begin'), "All");
        $('#link-type-begin').val(val[0]);
        this.updateEvolvingRelations(null, true);
        $('#link-type-end').val(val[1]);

        $("#repeat-error").text("");
      }
    // unitialzed relations
    }else{
      this.$('#link-type-begin').hide();
      this.$('#link-type-end').hide();
      this.evolvingRelations = false;
    }

    cell.on('remove', function() {
      this.$el.html('');
    }, this);

  },

  // Switch between evolving and constant relationships
  switchMode: function(){
    // Turn on
    if (!this.evolvingRelations){
      $(".link-type").hide();
      $('#link-type-begin').show("fast");
      $('#link-type-end').show("fast");

      $("#link-type-end").prop('disabled', 'disabled');
      $("#link-type-end").css("background-color","grey");

      $("#title").text("Evolving Relationship");
      $("#switch-link-type").text("Constant Relationship");


      this.appendSelectValues($('#link-type-begin'), "All");

    // Turn off
    }else{
      $('.link-type').show("fast");
      $('#link-type-begin').hide();
      $('#link-type-end').hide();
      $("#repeat-error").hide();

      $("#title").text("Constant Relationship");
      $("#switch-link-type").text("Evolving Relationship");
    }

    this.evolvingRelations = !this.evolvingRelations;
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

      if (value == "NA"){
        this.appendSelectValues($("#link-type-end"), "All");
      }else if(this.relationValA.indexOf(value) != -1){
        this.appendSelectValues($("#link-type-end"), "A");
      }else if(this.relationValB.indexOf(value) != -1){
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
    if (select.attr("id") == "link-type-begin"){
      select.html('<option class="select-placeholder" selected disabled value="">Begin</option>');
    }else if (select.attr("id") == "link-type-end"){
      select.html('<option class="select-placeholder" selected disabled value="">End</option>');
    }

    select.append($('<option></option>').val("NA").html("No Relationship"));
    if(type == "All"){
      for (var i = 0; i < this.relationTextA.length; i++)
        select.append($('<option></option>').val(this.relationValA[i]).html(this.relationTextA[i]));
      for (var i = 0; i < this.relationTextB.length; i++)
        select.append($('<option></option>').val(this.relationValB[i]).html(this.relationTextB[i]));

    }else if (type == "A"){
      select.val("NA");
      $("#repeat-error").text("Saved!");
      $("#repeat-error").css("color", "lightgreen");
      $("#link-type-end").prop('disabled', '');
      $("#link-type-end").css("background-color","");
      this.updateCell();

    }else if (type == "B"){
      for (var i = 0; i < this.relationTextB.length; i++)
        select.append($('<option></option>').val(this.relationValB[i]).html(this.relationTextB[i]));
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

    // Save based on normal relations
    }else{
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
        console.log(this.$('.link-type'));
        link.label(0 ,{position: 0.5, attrs: {text: {text: this.$('.link-type option:selected').text()}}});
      }
      // If link-type = NBD or NBT, set  NB to both nodes
      if (link.prop("link-type") == 'NBT' || link.prop("link-type") == 'NBD'){
        source.attr(".funcvalue/text", "NB");
        source.attr(".satvalue/text", "");
        target.attr(".funcvalue/text", "NB");
        target.attr(".satvalue/text", "");
      }
      // Else, set funcvalue to none
      else {
       source.attr(".funcvalue/text", "");
       target.attr(".funcvalue/text", ""); 
      }
    }
  },

  //Displays the additional options when delayed propagation is checked.
  checkboxHandler: function(e){
    if (e.currentTarget.checked){
      document.getElementById("hidden").removeAttribute("style");
    }
    else{
      document.getElementById("hidden").setAttribute("style", "display:none");
    }
  },

  clear: function(){
    this.$el.html('');
  }
});
