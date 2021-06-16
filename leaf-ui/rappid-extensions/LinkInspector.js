// Class for the Link properties tab that appears when link settings are clicked.

var LinkInspector = Backbone.View.extend({
    model: joint.dia.Celllink,

    initialize:function(){
        this.listenTo(this.model,'change:evolving', this.render);
        this.listenTo(this.model,'change:relationship', this.setSelectValues);
        this.listenTo(this.model,'change:selected', this.endSwitchOff);
    },

    template: [
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
    ].join(''),

    evolvingtemplate : [
            '<label id="title">Evolving Relationship</label>',
            '<br>',
            '<div class="inspector-views">',
            '<h5 id="repeat-error" class="inspector-error"></h5>',
            '<select id="link-type-begin" class="repeat-select">',
            '</select>',
            '<select id="link-type-end" class="repeat-select">',
            '</select>',
            '<button id="switch-link-type" class="inspector-btn small-btn blue-btn">Constant Relationships</button>',
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
            this.$el.html(_.template(this.actortemplate)());
            $('#actor-link').val(this.model.get('linkType'));
        } else {

            if (this.model.get('evolving')) {
                //this.model.set('evolving', true);
               // console.log(this.model);
                this.$el.html(_.template(this.evolvingtemplate)());
                //this.model.set('selected', false);//these two = setlectValues
                this.model.set('relationship', 'Evolving');

                if (['AND', 'OR', 'NO'].includes(this.model.get('linkType'))){
                    $('#link-type-end').val(this.model.get('linkType').toLowerCase());
                }else{
                    $('#link-type-begin').val(this.model.get("linkType"));
                }
                
                $('#link-type-end').val(this.model.get('postType'));
                
                //this.updateBeginEvolRelations();

                this.endSwitchOff();
                
            } else {
                this.$el.html(_.template(this.template)());
                $('#constant-links').val(this.model.get('linkType'));            
            }
        }

    },

    removeView: function(){
        this.remove();
    },

    endSwitchOff: function (){
        console.log(this.model.get('selected'))
        if (this.model.get('selected') || this.model.get('postType') !== null){
           // console.log("hello?")
            $("#link-type-end").prop('disabled', false);
            $("#link-type-end").css("background-color", "");
        } else if (!this.model.get('selected') && this.model.get('postType') == null) {
            //console.log("hello")
            $("#link-type-end").prop('disabled', true);
            $("#link-type-end").css("background-color", "gray");
        }
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
        console.log("selected: " + this.model.get('selected'))
        this.model.set('evolving', !current);
        if(!current){
            if (postType !== null) {
                //console.log(type + " " + postType)
                $('#link-type-begin').val(type); 
                $('#link-type-end').val(postType);
            }
            this.model.set('relationship', 'Evolving');
        }else {
            this.$el.html(_.template(this.template)());
            $('#constant-links').val(type);
            this.model.set('relationship', 'Constant');
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
        //this.model.set('selected', true);
        $("#repeat-error").text("");
        var begin = $("#link-type-begin").val();
        var end = this.model.get('postType');
        this.model.set("linkType", begin);
        //Enable the end select
        if (begin == "no") {
            this.model.set('relationship', 'Evolving');
        } else if(begin == "and" || begin == "or") {
            this.model.set('relationship', 'A');
        } else {
            this.model.set('relationship', 'B');
        }
        this.model.attr({
            '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
            '.marker-source': {'d': '0'},
            '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
        });
        this.model.label(0 ,{position: 0.5, attrs: {text: {text: begin + " | " + end}}});
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
        var selected = this.model.get('selected');
        var element; 

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
        if (selected) {
            element =  $("#link-type-end");
            element.html('<option class="select-placeholder" selected disabled value="">End</option>');
        }else {
            element =  $("#link-type-begin");
            element.html('<option class="select-placeholder" selected disabled value="">Begin</option>'); 
        }

        element.append($('<option></option>').val("no").html("No Relationship"));
        var relation = this.model.get('relationship');

        // the select options for Constant Relationship
        if (relation == 'Constant') {
           // console.log("constant")
            $.each(relationA, function (value, key) {
                element.append($("<option></option>").attr('value', value).text(key));
            });

            $.each(relationB, function (value, key) {
                    element.append($("<option></option>").attr("value", value).text(key));
            });
            $.each(relationConst, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
        } else if(relation == 'Evolving') {
           // console.log("evolving")
            $.each(relationA, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
            $.each(relationB, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
        } else if (relation == "A") {
           // console.log("A")
            $.each(relationA, function (value, key) {
                element.append($("<option></option>").attr('value', value).text(key));
            });
        } else if (relation == "B") {
            //console.log("B")
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
});
