// Class for the Link properties tab that appears when link settings are clicked.

var LinkInspector = Backbone.View.extend({
    model: joint.dia.CellLink,

    initialize:function(){
        this.link = this.model.get('link');
    },

    constanttemplate: [
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
            '<button id="switch-to-evolving" class="inspector-btn small-btn blue-btn">Evolving Relationships</button>',
        '<br>',
        '</div>',
    ].join(''),

    evolvingtemplate : [
            '<label id="title">Evolving Relationship</label>',
            '<br>',
            '<div class="inspector-views">',
            '<select id="link-type-begin" class="repeat-select">',
                '<option value="" disabled selected hidden>Begin</option>',
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
                '<option value="" disabled selected hidden>End</option>',
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
            '<button id="switch-to-constant" class="inspector-btn small-btn blue-btn">Constant Relationships</button>',
            '<br>',
            '</div>',
    ].join(''),

    actortemplate: [
            '<label> Link Type </label> <br>',
            '<div class="inspector-views">',
            '<select id="actor-link" class="link-type">',
                '<option value="is-a">is-a</option>',
                '<option value="plays">plays</option>',
                '<option value="is-part-of">is-part-of</option>',
            '</select><br>',
            '</div>',
        ].join(''),

    events: {
            'click #switch-to-constant': 'renderConstant',
            'click #switch-to-evolving': 'renderEvolving',
            'change #constant-links': 'updateConstantRelationship',
            'change #link-type-begin': 'updateBeginEvolRelations',
            'change #link-type-end': 'updateEndEvolRelations',
            'change #actor-link': 'updateActorLink',
            'clearInspector .inspector-views': 'removeView',
    },

    /** Chooses and sets correct template for link */
    render: function() {
        // Intention Link template
        if(this.model.get('type') == 'element') {
            // Constant Link
            if (!this.link.get('evolving')) {
                this.$el.html(_.template(this.constanttemplate)());
                $('#constant-links').val(this.link.get('linkType'));  
            // Evolving Link
            } else {
                this.$el.html(_.template(this.evolvingtemplate)());
                $('#link-type-begin').val(this.link.get('linkType'));
                $('#link-type-end').val(this.link.get('postType'));
                this.updateBeginEvolRelations();
            }
        // Actor Link template
        } else {
            this.$el.html(_.template(this.actortemplate)());
            $('#actor-link').val(this.link.get('linkType'));
        }  
    },

    /**
     * Switches from Evolving Relationship to Constant Relationship
     */
    renderConstant: function() {
        this.link.set('evolving', false);
        this.$el.html(_.template(this.constanttemplate)());
        $('#constant-links').val(this.link.get('linkType'));
        this.setValues($('#constant-links').val(), null, false);
        this.checkCellText();
    },

    /**
     * Switches from Constant Relationship to Evolving Relationship
     */
    renderEvolving: function(){
        this.link.set('linkType', 'and')
        this.checkCellText();
        this.link.set('evolving', true);
        this.$el.html(_.template(this.evolvingtemplate)());
        $('#link-type-end').prop('disabled', true);
    },

    updateConstantRelationship: function(){
        this.setValues($('#constant-links').val(), null, false);
        this.checkCellText()
    },

    /**
     * Checks if source/target cells need NBT/NBD text added or removed after link value update
     */
    checkCellText: function() {
        // Get link source and target cells
        var source = this.model.getSourceElement();
        var target = this.model.getTargetElement();

        if (this.link.get('linkType') =='NBT' || this.link.get('linkType') == 'NBD') {
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
            // Check if cells have any other NBT/NBD links
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
     * Updates linkType value based on selected value
     * And generates the allowed select values for postType based on that linkType value
     */ 
    updateBeginEvolRelations: function() {
        $('#link-type-end').prop('disabled', false);
        var begin = $('#link-type-begin').val();

        this.setValues(begin, this.link.get('postType'), true)

        // Set correct dropdown options for postType relationship values
        $('option').show(); // Clear the previous selection
        if (begin == 'and' || begin == 'or'){
            $('option.B').hide(); // Hide options incompatible with and/or selection such as +,-,++S, etc
            if($('#link-type-end :selected').attr('class') == 'B'){ // If already-selected end is incompatible with new begin selection, clear end
                this.setValues(begin, null, true) 
                $('#link-type-end').val(null); 
            }
        } else if (begin != 'no') {
            $('option.A').hide(); // Hide options incompatible with +,-,++S, etc selection such as and/or
            if($('#link-type-end :selected').attr('class') == 'A'){
                this.setValues(begin, null, true)
                $('#link-type-end').val(null);
            }
        }
        $('#link-type-end option[value= \'' + begin + '\']').hide(); // Hide already selected linkType value
        
    },

    /**
     * Updates postType based on selected value
     */
    updateEndEvolRelations: function() {
        // Save based on evolving relations
        this.setValues(this.link.get('linkType'), $('#link-type-end').val(), true)

        if(this.link.get('postType')!=null){
            $('#link-type-begin option[value= \'' + this.link.get('postType') + '\']').hide(); // Hide the selected postType value in begin
        }
    },

    /**
     * Updates linkType for the actor based on updated select value
     */
    updateActorLink: function() {
        this.setValues($('#actor-link').val(), null, false)
    },

    /**
     * Remove the view to avoid having multiple LinkInspector views at a time
     */
    removeView: function(){
        this.remove();
    },

    /**
     * Returns true iff the node is a source or target to an NBT or NBD
     * link, other than the link provided as a parameter.
     *
     * @param {joint.dia.Element} cell
     *   node of interest
     * @param {joint.dia.Link} link
     *   link to 'ignore', when searching for a NBT or NBD
     *   link connected to node
     */
    hasNBLink: function(cell, link) {
        var localLinks = graph.getLinks();
        for(var i = 0; i < localLinks.length; i++) {
            if ((localLinks[i]!=link) && (localLinks[i].prop('link-type') == 'NBT' || localLinks[i].prop('link-type') == 'NBD')){
                if(localLinks[i].getTargetElement() == cell || localLinks[i].getSourceElement() == cell){
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Returns true iff the node has NB as its function value
     *
     * @param {joint.dia.Element} cell
     */
    hasNBTag: function(cell) {
        return cell.prop('.funcvalue/text') == 'NB';
    },

    /**
     * Helper function to set link values and text
     * 
     * @param {String} linkType 
     * @param {String} postType 
     * @param {Boolean} evolving 
     */
    setValues: function(linkType, postType, evolving){
        if(evolving){
            this.link.set('linkType', linkType);
            this.link.set('postType', postType);
            this.model.label(0, {position: 0.5, attrs: {text: {text: linkType + " | " + postType}}});
        } else{
            this.link.set('linkType', linkType);
            this.link.set('postType', null);
            this.model.label(0 , {position: 0.5, attrs: {text: {text: linkType}}});
        } 
    }
});
