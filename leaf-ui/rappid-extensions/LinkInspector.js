// Class for the Link properties tab that appears when link settings are clicked.

var LinkInspector = Backbone.View.extend({
    model: joint.dia.Celllink,

    initialize:function(){
        this.listenTo(this.model,'change:evolving', this.render);
        this.listenTo(this.model,'change:relationship', this.setSelectValues);
        this.listenTo(this.model,'change:selected', this.setSelectValues);
    },

    template: [
        '<label id="title">Constant Relationship</label>',
        '<br>',
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
    render: function() {
        console.log(this.model.get('absoluteValue'));
        // Selecting which template to render ACTOR-LINK or INTENTIONS-LINK
        if (this.model.prop('type') == "Actor") {
            this.$el.html(_.template(this.actortemplate)());
            $('#actor-link').val(this.model.get('linkType'));
        } else {

            if (this.model.get('evolving')) {
                this.$el.html(_.template(this.evolvingtemplate)());
                this.model.set('selected', false);
                this.model.set('relationship', 'Evolving');


                $('#link-type-begin').val(this.model.get("linkType")).change();

                
                this.updateBeginEvolRelations();

                if (['AND', 'OR', 'NO'].includes(this.model.get("linkType"))) {
                    $('#link-type-end').val(this.model.get("postType").toLowerCase());
                } else {
                    $('#link-type-end').val(this.model.get("postType"));
                }
                //Understand what this chunk is doing
                if (this.model.get(postType) == null) {
                    this.model.set('selected', false);
                    this.model.set('relationship', 'Evolving');
                    $('#link-type-begin').val(values[0].trim()).change(); //what does change do???
                    this.updateBeginEvolRelations();
                    $('#link-type-end').val(values[1].trim());
                } else {
                    $("#link-type-end").prop('disabled', true);
                    $("#link-type-end").css("background-color", "grey");
                    this.model.set('selected', false);
                    this.model.set('relationship', 'Evolving');
                }
                //
            } else {
                this.$el.html(_.template(this.template)());
                $('#constant-links').val(this.model.get("linkType"));            
            }
        }

    },

    /**
     * Switches from Constant Relationship to Evolving Relationship
     * and vice-versa.
     *
     * This function is called on click for #switch-link-type
     */
    switchMode: function() {

        this.evolvingRelations = !this.evolvingRelations;

        if (this.evolvingRelations) {
            this.$el.html(_.template(this.evolvingtemplate)());
            
        } else {
            this.$el.html(_.template(this.template)());
            $('#constant-links').val(values[0].trim());
            this.evolvingRelations = false; 
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
        this.model.set('selected', true);
        $("#repeat-error").text("");
        var begin = $("#link-type-begin").val();
        //Enable the end select
        if (begin == "no") {
            this.model.set('relationship', 'Evolving');
        } else if(begin == "and" || begin == "or") {
            this.model.set('relationship', 'A');
            var end = this.model.get('postType');
            
            //Saving this option
            this.model.set("linkType", begin);
            this.model.attr({
                '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
                '.marker-source': {'d': '0'},
                '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
            });
            this.model.label(0 ,{position: 0.5, attrs: {text: {text: begin + " | " + end}}});

            $("#repeat-error").text("Saved!");
            $("#repeat-error").css("color", "lightgreen");

        } else {
            this.model.set('relationship', 'B');
        }
        $("#link-type-end").prop('disabled', false);
        $("#link-type-end").css("background-color","");
    },

    /**
     * This function is called on change for #link-type-end
     */
    updateEndEvolRelations: function() {

        // Save based on evolving relations
        var begin = this.model.get('linkType');
        var end = $("#link-type-end").val();

        this.model.set("postType", end);
        this.model.attr({
            '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
            '.marker-source': {'d': '0'},
            '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
        });
        this.model.label(0, {position: 0.5, attrs: {text: {text: begin + " | " + end}}});

        $("#repeat-error").text("Saved!");
        $("#repeat-error").css("color", "lightgreen");

    },

    /**
     * Set initial values for the select tags and populate the select
     * tags with their default options, depending on their type.
     *
     * @param {String} selector
     *   CSS selector for the select tag of interest
     * @param {String} type
     *   typestring indicating which options to append to the select tag
     *
     * Valid types: 'Constant', 'Evolving', 'A', 'B'
     */
    setSelectValues: function(){
        if(this.model.get('selected')){
            var element = $("#link-type-end");  
        }
        else{
            var element = $("#link-type-begin");
        }

        var relationA = {"and": "And-Decomposition",
                         "or": "Or-Decomposition"};

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
                "NBT": "Not Both (None)",
                "NBD": "Not Both (Denied)"
        };

        // set initial placeholder values

        if (selector ==  '#link-type-begin') {
            element.html('<option class="select-placeholder" selected disabled value="">Begin</option>');
        } else if (selector == '#link-type-end') {
            element.html('<option class="select-placeholder" selected disabled value="">End</option>');
        }

        element.append($('<option></option>').val("no").html("No Relationship"));

        // the select options for Constant Relationship
        if (this.model.get('relationship') == 'Constant') {
            $.each(relationA, function (value, key) {
                element.append($("<option></option>").attr('value', value).text(key));
            });

            $.each(relationB, function (value, key) {
                    element.append($("<option></option>").attr("value", value).text(key));
            });
            $.each(relationConst, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
        } else if(this.model.get('relationship') == 'Evolving') {
            $.each(relationA, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
            $.each(relationB, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
        } else if (this.model.get('relationship') == "A") {
            element.val("no");
            $("#repeat-error").text("Saved!");
            $("#repeat-error").css("color", "lightgreen");
        } else if (this.model.get('relationship') == "B") {
            $.each(relationB, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
        }

        // Remove duplicate options
        if (this.model.get('selected')) {
            var dupVal = $('#link-type-begin').val();
            $("select#link-type-end option").filter("[value='" + dupVal + "']").remove();
        }
    },

    clear: function(){
        this.$el.html('');
    },
});
