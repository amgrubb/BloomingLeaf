//Class for the Link properties tab that appears when link settings are clicked.

var ConstraintsInspector = Backbone.View.extend({

  className: 'constraint-inspector',

  template: [
    '<label>Intension Relationship</label>',
    '<h5 id="repeat-error" class="inspector-error"></h5>',
    '<div id="intension-div">',
      '<br>',
      '<select class="relationship-type function-type">',
        '<option class="select-placeholder" selected disabled value=none> Relationship </option>',
        '<option value=eq> = </option>',
        '<option value=lt> < </option>',
      '</select>',
      '<select id="relationship-src" class="relationship-select">',
        '<option class="select-placeholder" selected disabled value="">Source</option>',
      '</select>',
      '<select id="relationship-tar" class="relationship-select">',
        '<option class="select-placeholder" selected disabled value="">Target</option>',
      '</select>',
      '<br>',
    '</div>',
  ].join(''),

  actortemplate: [
    '<label>Intension Relationship</label>',
    '<h5 class="inspector-error">Error: Cannot model actor constraints</h5>',
    '<br>'
  ].join(''),

  events: {
    'change .relationship-type': 'updateCell',
    'change .relationship-select': 'updateCell',
    'click input.delayedprop': 'checkboxHandler'
  },


  //Method to create the Link Inspector using the template.
  render: function(cellView) {
    this._cellView = cellView;
    var cell = this._cellView.model;
    var type = cellView.model.attributes.labels[0].attrs.text.text

    if (cell.prop("linktype")){
      this.$el.html(_.template(this.actortemplate)());
      cell.label(0 ,{position: 0.5, attrs: {text: {text: ' error '}}});
      return
    }else{
      this.$el.html(_.template(this.template)());
    }

    cell.on('remove', function() {
      this.$el.html('');
    }, this);

    this.$('.link-type').val(cell.prop("link-type") || 'none');
    this.sourceElement = cell.getSourceElement();
    this.targetElement = cell.getTargetElement();

    var sInitVal = cell.getSourceElement().attr(".satvalue/value");
    var tInitVal = cell.getTargetElement().attr(".satvalue/value");
    var sFunc = cell.getSourceElement().attr(".funcvalue/text");
    var tFunc = cell.getTargetElement().attr(".funcvalue/text");
    var sRepeatB = cell.getSourceElement().attr(".constraints/beginRepeat");
    var tRepeatB = cell.getTargetElement().attr(".constraints/beginRepeat");
    var sRepeatE = cell.getSourceElement().attr(".constraints/endRepeat");
    var tRepeatE = cell.getTargetElement().attr(".constraints/endRepeat");
    var noTimeVariabled = ["R", "C", "I", "D", "NB"];

    // source or target node have no time function
    if ((sInitVal == "none") || (tInitVal == "none")){
      $("#repeat-error").text("Values are not initialized");
      $("#repeat-error").show("fast");
      this.$('#intension-div').hide();
      this.$('.function-type').val('');

    // source or target node time function can not be mode
    }else if ((noTimeVariabled.indexOf(sFunc) != -1) || (noTimeVariabled.indexOf(tFunc) != -1) || !sFunc || !tFunc){
      $("#repeat-error").text("The constraint type can not be modelled");
      $("#repeat-error").show("fast");
      this.$('#intension-div').hide();
      this.$('.function-type').val('');

    // source or target node have repeating values
    }else if (((sRepeatB) && (sRepeatE)) || ((tRepeatB) && (tRepeatE))){
      $("#repeat-error").text("Cannot model repeating constraints");
      $("#repeat-error").show("fast");
      this.$('#intension-div').hide();
      this.$('.function-type').val('');

    // intension constraint is allowed
    }else{
      this.$('#intension-div').show();

      // Render select options for drop down
      this.renderSelectOptions(cell.getSourceElement(), $("#relationship-src"));
      this.renderSelectOptions(cell.getTargetElement(), $("#relationship-tar"));

      var relationship = this._cellView.model.prop("link-type");
      var srcVar = this._cellView.model.attr(".constraintvar/src");
      var tarVar = this._cellView.model.attr(".constraintvar/tar");

      // Initialize values if it is already defined, else generate predefined values
      if(relationship){
        this.$('.relationship-type').val(relationship);
      }else {
        this.$('.relationship-type').val("eq");
      }

      if (srcVar && tarVar){
        $("#relationship-src").val(srcVar);
        $("#relationship-tar").val(tarVar);
      }else{
        $("#relationship-src").val("A");
        $("#relationship-tar").val("A");
      }
    }
    
    this.updateCell();
  },

  // Fills HTML drop down based on node function type
  renderSelectOptions: function(cell, select){
    var f = cell.attr(".funcvalue/text");
    var singleVarFuncs = ["RC", "CR", "SD", "DS", "MP", "MN"];

    if(singleVarFuncs.indexOf(f) != -1){
      select.append($('<option></option>').val("A").html("A"));
    }else if (f == "UD"){
      var begin = cell.attr(".constraints/beginLetter");
      for (var i = 1; i < begin.length; i++)
        select.append($('<option></option>').val(begin[i]).html(begin[i]));
    }
  },

  // Note: Updating cell is called both when updating variables, and rendering inspector from preexisting values
  updateCell: function() {
    var link = this._cellView.model;
    this._cellView.model.prop("link-type", this.$('.relationship-type').val());

    // Update display on graph
    if (this._cellView.model.prop("link-type") == 'eq'){
      link.label(0 ,{position: 0.5, attrs: {text: {text: ' = '}}});
    }else if (this._cellView.model.prop("link-type") == 'ne'){
      link.label(0 ,{position: 0.5, attrs: {text: {text: ' <> '}}});
    }else if (this._cellView.model.prop("link-type") == 'le'){
      link.label(0 ,{position: 0.5, attrs: {text: {text: ' <= '}}});
    }else if (this._cellView.model.prop("link-type") == 'lt'){
      link.label(0 ,{position: 0.5, attrs: {text: {text: ' < '}}});
    }else{
      link.label(0 ,{position: 0.5, attrs: {text: {text: ' error '}}});
    }

    if ($("#relationship-src").val() &&  $("#relationship-tar").val()){
      link.attr('.constraintvar/src', $("#relationship-src").val());
      link.attr('.constraintvar/tar', $("#relationship-tar").val());
    }

    link.attr({
      '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
      '.marker-source': {'d': '0'},
      '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
    });
  },

  clear: function(){
    this.$el.html('');
  }
});
