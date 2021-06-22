// Class for the Link properties tab that appears when link settings are clicked.

var LinkInspector = Backbone.View.extend({
    model: joint.dia.Celllink,

    initialize:function(){
        this.listenTo(this.model,'change:selected', this.rerender);
        this.link = this.model.get('link');
    },

    constanttemplate: [
        '<script type="text/template" id="item-template">',
        '<label id="title">Constant Relationship</label>',
        '<br>',
        '<div class="inspector-views">',
        '<select id="constant-links" class="link-type">',
            '<option value="no">No Relationship</option>',
            '<option value="and">And-Decomposition</option>',
            '<option value="or">Or-Decomposition</option>',
            '<option value="++">++</option>',
            '<option value="--">--</option>',
            '<option value="+">+</option>',
            '<option value="-">-</option>',
            '<option value="+S">+S</option>',
            '<option value="++S">++S</option>',
            '<option value="-S">-S</option>',
            '<option value="--S">--S</option>',
            '<option value="+D">+D</option>',
            '<option value="++D">++D</option>',
            '<option value="-D">-D</option>',
            '<option value="--D">--D</option>',
            '<option value="NBT">Not Both (None)</option>',
            '<option value="NBD">Not Both (Denied)</option>',
        '</select>',
        '<h5 id="repeat-error" class="inspector-error"></h5>',
            '<button id="switch-link-type" class="inspector-btn small-btn blue-btn">Evolving Relationships</button>',
        '<br>',
        '</div>',
		'</script>'
    ].join(''),

    evolvingtemplate : [
        '<script type="text/template" id="item-template">',
            '<label id="title">Evolving Relationship</label>',
            '<br>',
            '<div class="inspector-views">',
            '<h5 id="repeat-error" class="inspector-error"></h5>',
            '<select id="link-type-begin" class="repeat-select">',
                '<option value="no">No Relationship</option>',
                '<option value="and">And-Decomposition</option>',
                '<option value="or">Or-Decomposition</option>',
                '<option value="++">++</option>',
                '<option value="--">--</option>',
                '<option value="+">+</option>',
                '<option value="-">-</option>',
                '<option value="+S">+S</option>',
                '<option value="++S">++S</option>',
                '<option value="-S">-S</option>',
                '<option value="--S">--S</option>',
                '<option value="+D">+D</option>',
                '<option value="++D">++D</option>',
                '<option value="-D">-D</option>',
                '<option value="--D">--D</option>',
            '</select>',
            '<select id="link-type-end" class="repeat-select">',
                '<option value="no">No Relationship</option>',
                '<option value="and" class="A">And-Decomposition</option>',
                '<option value="or" class="A">Or-Decomposition</option>',
                '<option value="++" class="B">++</option>',
                '<option value="--" class="B">--</option>',
                '<option value="+" class="B">+</option>',
                '<option value="-" class="B">-</option>',
                '<option value="+S" class="B">+S</option>',
                '<option value="++S" class="B">++S</option>',
                '<option value="-S" class="B">-S</option>',
                '<option value="--S" class="B">--S</option>',
                '<option value="+D" class="B">+D</option>',
                '<option value="++D" class="B">++D</option>',
                '<option value="-D" class="B">-D</option>',
                '<option value="--D" class="B">--D</option>',
            '</select>',
            '<button id="switch-link-type" class="inspector-btn small-btn blue-btn">Constant Relationships</button>',
            '<br>',
            '</div>',
            '</script>'
    ].join(''),

    actortemplate: [
        '<script type="text/template" id="item-template">',
            '<label> Link Type </label> <br>',
            '<div class="inspector-views">',
            '<select id="actor-link" class="link-type">',
                '<option value="is-a">is-a</option>',
                '<option value="plays">plays</option>',
                '<option value="is-part-of">is-part-of</option>',
            '</select><br>',
            '</div>',
            '</script>'
        ].join(''),

    events: {
            'click #switch-link-type': 'renderNewMode',
            'change #constant-links': 'updateConstantRelationship',
            'change #actor-link': 'updateActorLink',
            'change #link-type-begin': 'updateBeginEvolRelations',
            'change #link-type-end': 'updateEndEvolRelations',
            'clearInspector .inspector-views': 'removeView',
    },

    //Method to create the Link Inspector using the template.
    render: function() {
        if(this.link.get('postType') == null){
            this.link.set('evolving', false);
            this.model.set('selected', false);
        }
        // Selecting which template to render ACTOR-LINK or ERROR or INTENTIONS-LINK
        if (this.model.get('type') == 'Actor') {
            this.$el.html(_.template($(this.actortemplate).html())(this.model.toJSON()));
            $('#actor-link').val(this.link.get('linkType'));
        }
        else {
            //choose between constant or evolving template based on evolving parameter from model
            if (this.link.get('evolving')) {
                this.$el.html(_.template($(this.evolvingtemplate).html())(this.model.toJSON()));;
                if (this.link.get('postType') !== null) {
                    $('#link-type-begin').val(this.link.get('linkType'));
                    $('#link-type-end').val(this.link.get('postType'));
                    this.updateBeginEvolRelations();
                }else{
                    $('#link-type-begin').placeholder = "Begin";
                    $('#link-type-end').placeholder = "End";
                }
            } else {
                this.link.set('evolving', false); //makes sure the rerender doesn't activate
                this.$el.html(_.template($(this.constanttemplate).html())(this.model.toJSON()));
                $('#constant-links').val(this.link.get('linkType'));       
            }
        }
    },

    /**
     * rerender to update the html so that appropriate options are hidden/shown or disabled for evolving relations
     * Only for evolving template as that is the only one that needs constant update for options
     * 
     * This function is called on when selected is changed
     */
    rerender: function(){
        if (this.link.get('evolving')) {
            this.$el.html(_.template($(this.evolvingtemplate).html())(this.model.toJSON()));;
            $('#link-type-begin').val(this.link.get('linkType'));
            this.updateBeginEvolRelations();
            $('#link-type-end').val(this.link.get('postType'));
        }
    },

    /**
     * remove the previous view so that we don't have multiple LinkInspector showing up
     *
     * This function is called when clearInspector is called
     */
    removeView: function(){
        this.remove();
    },

    /**
     * Switches from Constant Relationship to Evolving Relationship
     * and vice-versa.
     *
     * This function is called on click for #switch-link-type
     */
    renderNewMode: function() {
        this.link.set('evolving', !this.link.get('evolving'));
        if(this.link.get('evolving')){
            this.$el.html(_.template($(this.evolvingtemplate).html())(this.model.toJSON()));
            $('#link-type-end').prop('disabled', true);
            $('#link-type-begin').placeholder= "Begin";
            $('#link-type-end').placeholder = "End";
        }else {
            this.$el.html(_.template($(this.constanttemplate).html())(this.model.toJSON()));
            this.updateConstantRelationship();
        }
    },

    /**
     * Saves the new constant relationship value to the link model.
     * This function is called on change for #constant-links.
     */
    updateConstantRelationship: function() {
        var type = this.link.get('linkType');
        $('#constant-links').val(type);
        this.link.set('postType', null);

        this.model.label(0 , {position: 0.5, attrs: {text: {text: type}}});

        // Adding or removing tags from node depending on type of link
        if (this.link.get('linkType') =='NBT' || this.link.get('linkType') == 'NBD') {
            var source = this.model.getSourceElement();
            var target = this.model.getTargetElement();
            source.attr('.funcvalue/text', 'NB');
            source.attr('.satvalue/text', '(⊥, ⊥)');
            source.attr('.satvalue/value', '');
            target.attr('.funcvalue/text', 'NB');
            target.attr('.satvalue/text', '(⊥, ⊥)');
            target.attr('.satvalue/value', '');

            // TODO: Re-implement this logic
            // var sourceIntention = model.getIntentionByID(source.attributes.nodeID);
            // var targetIntention = model.getIntentionByID(target.attributes.nodeID);

            // sourceIntention.changeInitialSatValue('0000');
            // sourceIntention.dynamicFunction.stringDynVis = 'NB';
            
            // targetIntention.changeInitialSatValue('0000');
            // targetIntention.dynamicFunction.stringDynVis = 'NB';
            
        } else {
            //Verify if it is possible to remove the NB tag from source and target
            if (!this.hasNBLink(source, this.model) && !this.hasNBTag(source)){
                source.attr('.funcvalue/text', '');
                source.attr('.satvalue/text', '');
            }
            if (!this.hasNBLink(target, this.model) && !this.hasNBTag(target)){
                target.attr('.funcvalue/text', '');
                target.attr('.satvalue/text', '');
            }
        }
    },

    /**
     * Returns true iff the node is a source or target to an NBT or NBD
     * link, other than the link provided as a parameter.
     *
     * @param {joint.dia.Element} node
     *   node of interest
     * @param {joint.dia.Link} link
     *   link to 'ignore', when searching for a NBT or NBD
     *   link connected to node
     */
    hasNBLink: function(node, link) {
        var localLinks = graph.getLinks();
        for(var i = 0; i < localLinks.length; i++) {
            if ((localLinks[i]!=link) && (localLinks[i].prop("link-type") == 'NBT' || localLinks[i].prop("link-type") == 'NBD')){
                if(localLinks[i].getTargetElement() == node || localLinks[i].getSourceElement() == node){
                    return true;
                }
            }
        }

        return false;
    },

    /**
     * Returns true iff the node has NB as its function value
     *
     * @param {joint.dia.Element} node
     */
    hasNBTag: function(node) {
        return node.prop('.funcvalue/text') == 'NB';
    },
    updateActorLink: function() {
        var linktype = $("#actor-link").val();
        this.link.set("linkType", linktype);
        this.model.label(0 , {position: 0.5, attrs: {text: {text: linktype}}});
    },

    // Generates the select values based on begin value
    updateBeginEvolRelations: function() {
        //Enable the end select by changing the selected into true, because it doesn't change back to false, then end select will always be enabled from now on
        this.model.set('selected', true);

        $("#repeat-error").text("");
        var begin = $("#link-type-begin").val();
        var end = this.link.get('postType');
        this.link.set("linkType", begin); //modify the model
        
        this.model.label(0 ,{position: 0.5, attrs: {text: {text: begin + " | " + end}}}); //set the words on the link so user can see change

        // Set correct dropdown options for postType relationship values
        $('option').show(); // Clear the previous selection
        if (begin == "and" || begin == "or"){
            $('option.B').hide(); // Hide options incompatible with and/or selection such as +,-,++S, etc
        } else if (begin != 'no') {
            $('option.A').hide(); // Hide options incompatible with +,-,++S, etc selection such as and/or
        }
        $("#link-type-end option[value= \"" + begin + "\"]").hide(); // Hide already selected linkType value
    },

    /**
     * This function is called on change for #link-type-end, ot updates the end evolving relationship
     */
    updateEndEvolRelations: function() {
        // Save based on evolving relations
        var begin = this.link.get('linkType');
        var end = $("#link-type-end").val();
        this.link.set("postType", end);
        this.model.label(0, {position: 0.5, attrs: {text: {text: begin + " | " + end}}});

        this.showSaved();
    },

    showSaved: function(){
        $("#repeat-error").text("Saved!");
        $("#repeat-error").css("color", "lightgreen");
    }
});
