var ActorInspector = Backbone.View.extend({
    model: joint.shapes.basic.Actor,

    initialize: function () {
        this.actor = this.model.attributes.actor;
    },

    template: [
        '<script type="text/template" id="item-template">',
        '<div class="inspector-views" id="right-inspector">',
        '<label>Actor name</label>',
        '<textarea class="cell-attrs-text" maxlength=100> <%= actorName %> </textarea>',
        '<label> Actor type </label>',
        '<select id="actor-type-ID" class="actor-type">',
        '<option value=A <%if (type === "A")  { %> selected <%} %>> Actor </option>',
        '<option value=G <%if (type === "G")  { %> selected <%} %>> Agent </option>',
        '<option value=R <%if (type === "R")  { %> selected <%} %>> Role </option>',
        '</select>',
        '</div>',
        '</script>'
    ].join(''),

    events: {
        'keyup .cell-attrs-text': 'nameAction',
        'change #actor-type-ID': 'updateType',
        'clearInspector .inspector-views': 'removeView',
    },

    /**
     * Initializes the element inspector using previously defined templates
     */
    render: function () {
        // If the clicked node is an actor, render the actor inspector
        this.$el.html(_.template($(this.template).html())(this.actor));
        console.log(this.model);
        //Checks for the correct font size
        changeFont(current_font, paper);
    },

    /**
     * Updates the selected actor's name.
     * This function is called on keyup for .cell-attrs-text
     */
    nameAction: function (event) {
        // Prevent the ENTER key (mapped as 13) from being recorded when naming nodes.
        if (event.which === 13) {
            event.preventDefault();
        }

        // Do not allow special characters in names, replace them with spaces.
        var text = this.$('.cell-attrs-text').val().replace(/[^\w\n-]/g, ' ');
        this.model.attr({ '.name': { text: text } });
        this.model.attributes.actor.actorName = text;

    },
    /**
     * Removes the view so we don't have multiple ones in the sidebar
     */
    removeView: function () {
        this.remove();
    },
    /**
     * Changes the line that distinguishes the type of actor 
     */
    updateType: function () {
        var actorType = $('#actor-type-ID').val();
        this.model.attributes.actor.type = actorType;
        // console.log(type);
        console.log(this.actor.actorName);
        console.log(this.actor);
        console.log(this.model.attributes.actor.type);

        if (this.model.attributes.actor.type == 'G') {
            this.model.attr({
                '.line': {
                    'ref': '.label',
                    'ref-x': 0,
                    'ref-y': 0.08,
                    'd': 'M 5 10 L 55 10',
                    'stroke-width': 1,
                    'stroke': 'black'
                }
            });
        }
        else if (this.model.attributes.actor.type == 'R') {
            this.model.attr({
                '.line': {
                    'ref': '.label',
                    'ref-x': 0,
                    'ref-y': 0.6,
                    'd': 'M 5 10 Q 30 20 55 10 Q 30 20 5 10',
                    'stroke-width': 1,
                    'stroke': 'black'
                }
            });
        }
        else if (this.model.attributes.actor.type == 'A') {
            this.model.attr({ '.line': { 'stroke-width': 0 } });
        }
    },
});