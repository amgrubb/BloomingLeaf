//Class for the element properties tab that appears when an element is clicked
var ENTER_KEY = 13;

var ActorInspector = Backbone.View.extend({
        model: joint.shapes.basic.Actor,
        
        initialize: function() {
            this.model.on('change:actorType', this.changeLine, this);
        },
        template: [
            '<script type="text/template" id="item-template">',
            '<div class="inspector-views">',
            '<label>Actor name</label>',
            '<textarea class="cell-attrs-text" maxlength=100> <%= actorName %> </textarea>',
            '<label> Actor type </label>',
            '<select id="actor-type-ID" class="actor-type">',
            '<option value=A <%if (actorType === "A")  { %> selected <%} %>> Actor </option>',
            '<option value=G <%if (actorType === "G")  { %> selected <%} %>> Agent </option>',
            '<option value=R <%if (actorType === "R")  { %> selected <%} %>> Role </option>',
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
        render: function() {
            // If the clicked node is an actor, render the actor inspector
            this.$el.html(_.template($(this.template).html())(this.model.toJSON()));
        },


        /**
         * Updates the selected actor's name.
         * This function is called on keyup for .cell-attrs-text
         */
        nameAction: function(event) {
            // Prevent the ENTER key from being recorded when naming nodes.
            if (event.which === ENTER_KEY) {
                event.preventDefault();
            }

            var text = this.$('.cell-attrs-text').val();
            // Do not allow special characters in names, replace them with spaces.
            text = text.replace(/[^\w\n-]/g, ' ');

            this.model.attr({ '.name': {text: text }});
            this.model.set('actorName', text);

        },
        /**
         * Removes the view so we don't have multiple ones in the sidebar
         */
        removeView: function(){
            this.remove();
        },
        /**
         * Changes the line that distinguishes the type of actor 
         */
        updateType: function(){
            this.model.set('actorType', this.$('#actor-type-ID').val());
        },
        /**
         * Changes the line that distinguishes the type of actor 
         */
        changeLine: function() {
            if (this.model.get('actorType') == 'G') {
                this.model.attr({'.line': {'ref': '.label',
                'ref-x': 0,
                'ref-y': 0.08,
                'd': 'M 5 10 L 55 10',
                'stroke-width': 1,
                'stroke': 'black'}});
            }
            else if (this.model.get('actorType') == 'R'){
                this.model.attr({'.line': {'ref': '.label',
                'ref-x': 0,
                'ref-y': 0.6,
                'd': 'M 5 10 Q 30 20 55 10 Q 30 20 5 10' ,
                'stroke-width': 1,
                'stroke': 'black'}});
            }
            else if (this.model.get('actorType') == 'A'){
                this.model.attr({'.line': {'stroke-width': 0}});
            }

        }
}

);
