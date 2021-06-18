// Class for the Link properties tab that appears when link settings are clicked.

var LinkInspector = Backbone.View.extend({
    model: joint.dia.Celllink,

    initialize:function(){
        this.listenTo(this.model,'change:selected', this.rerender);
    },

    template: [
        '<script type="text/template" id="item-template">',
        '<label id="title">Constant Relationship</label>',
        '<br>',
        '<div class="inspector-views">',
        '<select id="constant-links" class="link-type">',
            '<option value="NO">No Relationship</option>',
            '<option value="AND">And-Decomposition</option>',
            '<option value="OR">Or-Decomposition</option>',
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
                '<option value="NO">No Relationship</option>',
                '<option value="AND">And-Decomposition</option>',
                '<option value="OR">Or-Decomposition</option>',
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
            '<select id="link-type-end" class="repeat-select" <% if (!selected) {%> disabled= true style = "background-color:gray"<%} %>>',
                '<option value="NO">No Relationship</option>',
                '<option value="AND" class = "A">And-Decomposition</option>', //class works with function in line 294 and 296
                '<option value="OR" class = "A">Or-Decomposition</option>',
                '<option value="++" class = "B">++</option>',
                '<option value="--" class = "B">--</option>',
                '<option value="+" class = "B">+</option>',
                '<option value="-" class = "B">-</option>',
                '<option value="+S" class = "B">+S</option>',
                '<option value="++S" class = "B">++S</option>',
                '<option value="-S" class = "B">-S</option>',
                '<option value="--S" class = "B">--S</option>',
                '<option value="+D" class = "B">+D</option>',
                '<option value="++D" class = "B">++D</option>',
                '<option value="-D" class = "B">-D</option>',
                '<option value="--D" class = "B">--D</option>',
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
            'click #switch-link-type': 'switchMode',
            'change #constant-links': 'updateConstantRelationship',
            'change #actor-link': 'updateActorLink',
            'change #link-type-begin': 'updateBeginEvolRelations',
            'change #link-type-end': 'updateEndEvolRelations',
            'clearInspector .inspector-views': 'removeView',
    },

    //Method to create the Link Inspector using the template.
    render: function() {
        // Selecting which template to render ACTOR-LINK or INTENTIONS-LINK
        if (this.model.get('type') == "Actor") {
            this.$el.html(_.template($(this.actortemplate).html())(this.model.toJSON()));;
            $('#actor-link').val(this.model.get('linkType'));
        } else {
            //choose between constant or evolving template based on evolving parameter from model
            if (this.model.get('evolving')) {
                this.$el.html(_.template($(this.evolvingtemplate).html())(this.model.toJSON()));;
                if (this.model.get('postType') !== null) {
                    if (['AND', 'OR', 'NO'].includes(this.model.get('linkType'))){
                        $('#link-type-begin').val(this.model.get('linkType').toLowerCase());
                    }else{
                        $('#link-type-begin').val(this.model.get("linkType"));
                    }
                    $('#link-type-end').val(this.model.get('postType'));
                    this.updateBeginEvolRelations();
                }
            } else {
                this.model.set('evolving', false); //makes sure the rerender doesn't activate
                this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
                $('#constant-links').val(this.model.get('linkType'));
                //didn't put updateConstantRelationship here because if it was rendered everything will be the same as previous and if previous was already constant it would not need new update until begin is changed       
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
        if (this.model.get('evolving')) {
            this.$el.html(_.template($(this.evolvingtemplate).html())(this.model.toJSON()));;
            $('#link-type-begin').val(this.model.get("linkType"));
            this.updateBeginEvolRelations();
            $('#link-type-end').val(this.model.get('postType'));
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
    switchMode: function() {
        var type = this.model.get('linkType');
        var postType = this.model.get('postType');
        var current = this.model.get('evolving');
        this.model.set('evolving', !current);
        if(this.model.get('evolving')){
            this.$el.html(_.template($(this.evolvingtemplate).html())(this.model.toJSON()));
            //if the postType is already chosen, meaning not the first time visiting LinkInspector, take the previous values
            if (postType !== null) { 
                $('#link-type-begin').val(type); 
                this.updateBeginEvolRelations(); //makes sure that the available options in the end are consistant with what is allowed if the begin is not changed
                $('#link-type-end').val(postType);
            }
        }else {
            this.model.set('evolving', false);
            this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
            $('#constant-links').val(type);
            this.updateConstantRelationship(); //makes sure that the effects for both intentions occur, can check by not connecting the link to anything else. 
            //If a constant relationship is chosen then an error occurs, but when this function is not there, if we switch back from evolving to constant the error doesn't occur
            //aslo reupdates what the relation in the middle of the link looks like (no "|")
        }
    },

    /**
     * Saves the new constant relationship value to the link model.
     * This function is called on change for #constant-links.
     */
    updateConstantRelationship: function() {

        var source = this.model.getSourceElement();
        var target = this.model.getTargetElement();

        var relationshipVal = $('.link-type option:selected').val();

        // store the new value into the link
        this.model.set("linkType", relationshipVal);
        this.model.label(0 , {position: 0.5, attrs: {text: {text: linkValText[relationshipVal]}}});

        // Adding or removing tags from node depending on type of link
        if (this.model.get("linkType") =='NBT' || this.model.get("linkType") == 'NBD') {
            source.attr('.funcvalue/text', 'NB');
            source.attr('.satvalue/text', '(⊥, ⊥)');
            source.attr('.satvalue/value', '');
            target.attr('.funcvalue/text', 'NB');
            target.attr('.satvalue/text', '(⊥, ⊥)');
            target.attr('.satvalue/value', '');

            var sourceIntention = model.getIntentionByID(source.attributes.nodeID);
            var targetIntention = model.getIntentionByID(target.attributes.nodeID);

            sourceIntention.changeInitialSatValue('0000');
            sourceIntention.dynamicFunction.stringDynVis = 'NB';
            
            targetIntention.changeInitialSatValue('0000');
            targetIntention.dynamicFunction.stringDynVis = 'NB';
            
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
        this.model.set("linkType", $("#actor-link").val());
        this.model.label(0 , {position: 0.5, attrs: {text: {text: this.model.get("linkType")}}});
    },
    // Generates the select values based on begin value
    updateBeginEvolRelations: function() {
        //Enable the end select by changing the selected into true, because it doesn't change back to false, then end select will always be enabled from now on
        this.model.set('selected', true);

        $("#repeat-error").text("");
        var begin = $("#link-type-begin").val();
        var end = this.model.get('postType');
        this.model.set("linkType", begin); //modify the model
        var option = "#link-type-end option[value= \"" + begin + "\"]"; //for hiding the already chosen value at the beginning later on in line 294
        
        //makes the words on the links into lower case
        if (['AND', 'OR', 'NO'].includes(begin)){
            begin = begin.toLowerCase();
        }
        if (['AND', 'OR', 'NO'].includes(end)){
            end = end.toLowerCase();
        }

        //set the options
        $('option').show(); //clear the previous selection
        if(begin == "no"){ //need to specify case for "no" otherwise will be characterized as the else condition
            $('option').show();
        }else if (begin == "and" || begin == "or"){
            $('option.B').hide(); //hide options based on class assigned from line 69-83
        } else {
            $('option.A').hide();
        }
        $(option).hide();
        this.model.label(0 ,{position: 0.5, attrs: {text: {text: begin + " | " + end}}}); //set the words on the link so user can see change
    },

    /**
     * This function is called on change for #link-type-end, ot updates the end evolving relationship
     */
    updateEndEvolRelations: function() {

        // Save based on evolving relations
        var begin = this.model.get('linkType');
        var end = $("#link-type-end").val();

        this.model.set("postType", end);
        if (['AND', 'OR', 'NO'].includes(begin)){
            begin = begin.toLowerCase();
        }
        if (['AND', 'OR', 'NO'].includes(end)){
            end = end.toLowerCase();
        }
        this.model.label(0, {position: 0.5, attrs: {text: {text: begin + " | " + end}}});

        $("#repeat-error").text("Saved!");
        $("#repeat-error").css("color", "lightgreen");
    },
});
