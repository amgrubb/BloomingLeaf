// Class for the Link properties tab that appears when link settings are clicked.

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

        // Selecting which template to render ACTOR-LINK or INTENTIONS-LINK
        if (cell.prop('linktype')) {
            this.$el.html(_.template(this.actortemplate)());
            $('#actor-link').val(cell.prop("link-type"));
        } else {
            // If there is more than one value for a link, it must be an 
            // evolving relationship. Display the evolving relationship template
            if ((values.length > 1)) {
                this.evolvingRelations = true;
                this.$el.html(_.template(this.evolvingtemplate)());
                this.setSelectValues('#link-type-begin', 'Evolving');
                $('#link-type-begin').val(values[0]).change();
                this.updateBeginEvolRelations;
                $('#link-type-end').val(values[1]);

            // Else, display the constant relationship template
            } else {
                this.evolvingRelations = false;
                this.$el.html(_.template(this.template)());
                this.setSelectValues('#constant-links', 'Constant');
                $('#constant-links').val(values[0]);
            }
        }

        cell.on('remove', function() {
            this.$el.html('');
        }, this);

    },

    /**
     * Switches from Constant Relationship to Evoloving Relationship
     * and vice-versa.
     *
     * This function is called on click for #switch-link-type
     */
    switchMode: function() {
        var cell = this._cellView.model;
        var type = cell.attributes.labels[0].attrs.text.text;

        // array of link values
        var values = type.split("|");

        this.evolvingRelations = !this.evolvingRelations;

        if (this.evolvingRelations) {
            this.$el.html(_.template(this.evolvingtemplate)());
            if(values.length > 1) {
                this.setSelectValues('#link-type-begin', 'Evolving');
                $('#link-type-begin').val(values[0].trim()).change();
                this.updateBeginEvolRelations();
                $('#link-type-end').val(values[1].trim());
            } else {
                $("#link-type-end").prop('disabled', true);
                $("#link-type-end").css("background-color", "grey");
                this.setSelectValues('#link-type-begin', 'Evolving');
            }
        } else {
            this.$el.html(_.template(this.template)());
            this.setSelectValues('#constant-links', 'Constant');
            $('#constant-links').val(values[0].trim());
            this.evolvingRelations = false;
        }
    },

    /**
     * Saves the new constant relationship value to the link model.
     * This function is called on change for #constant-links.
     */
    updateConstantRelationship: function() {
        var link = this._cellView.model;
        var source = link.getSourceElement();
        var target = link.getTargetElement();

        var relationshipVal = $('.link-type option:selected').val();
        var relationshipText = $('.link-type option:selected').text();

        // store the new value into the link
        link.prop("link-type", relationshipVal);

        // store the new text into the link
        if (link.prop("link-type") == 'NBT' || link.prop("link-type") == 'NBD') {
            link.label(0 ,{position: 0.5, attrs: {text: {text: relationshipVal}}});
        } else {
            link.label(0 ,{position: 0.5, attrs: {text: {text: $('.link-type option:selected').text()}}});
        }

        // Adding or removing tags from node depending on type of link
        if (link.prop("link-type") == 'NBT' || link.prop("link-type") == 'NBD'){
            source.attr(".funcvalue/text", "NB");
            source.attr(".satvalue/text", "");
            source.attr(".satvalue/value", "");
            target.attr(".funcvalue/text", "NB");
            target.attr(".satvalue/text", "");
            target.attr(".satvalue/value", "");

        } else {
            //Verify if it is possible to remove the NB tag from source and target
            if (!this.hasNBLink(source, link) && this.hasNBTag(source)){
                source.attr(".funcvalue/text", "");
            }
            if (!this.hasNBLink(target, link) && this.hasNBTag(target)){
                target.attr(".funcvalue/text", "");
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
        var link = this._cellView.model;
        var source = link.getSourceElement();
        var target = link.getTargetElement();
        link.prop("link-type", $("#actor-link").val());
        link.label(0 ,{position: 0.5, attrs: {text: {text: link.prop("link-type")}}});
    },
    // Generates the select values based on begin value
    updateBeginEvolRelations: function() {
        $("#repeat-error").text("");
        var begin = $("#link-type-begin").val();
        //Enable the end select
        if (begin == "no") {
            this.setSelectValues('#link-type-end', 'Evolving');
            $("#link-type-end").prop('disabled', false);
            $("#link-type-end").css("background-color","gray");
            $("#repeat-error").text("");
        }else if(begin == "and" || begin == "or") {
            this.setSelectValues('#link-type-end', 'A');
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

        } else {
            this.setSelectValues('#link-type-end', "B");
            $("#link-type-end").prop('disabled', '');
            $("#link-type-end").css("background-color","");
        }
    },

    /**
     * This function is called on change for #link-type-end
     */
    updateEndEvolRelations: function() {

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
    setSelectValues: function(selector, type){

        var element = $(selector);

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
        if (type == 'Constant') {
            $.each(relationA, function (value, key) {
                element.append($("<option></option>").attr('value', value).text(key));
            });

            $.each(relationB, function (value, key) {
                    element.append($("<option></option>").attr("value", value).text(key));
            });
            $.each(relationConst, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
        } else if(type == 'Evolving') {
            $.each(relationA, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
            $.each(relationB, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
        } else if (type == "A") {
            element.val("no");
            $("#repeat-error").text("Saved!");
            $("#repeat-error").css("color", "lightgreen");
            $("#link-type-end").prop('disabled', '');
            $("#link-type-end").css("background-color","");
        } else if (type == "B") {
            $.each(relationB, function (value, key) {
                element.append($("<option></option>").attr("value", value).text(key));
            });
        }

        // Remove duplicate options
        if (selector == "link-type-end") {
            var dupVal = $('#link-type-begin').val();
            $("select#link-type-end option").filter("[value='" + dupVal + "']").remove();
        }
    },

    clear: function(){
        this.$el.html('');
    }

});
