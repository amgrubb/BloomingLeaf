//Class for the element properties tab that appears when an element is clicked
var ENTER_KEY = 13;

var ActorInspector = Backbone.View.extend({
        model: joint.shapes.basic.Actor,
        
        template: [
            '<script type="text/template" id="item-template">',
            '<div class="inspector-views">',
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
        render: function() {
            // If the clicked node is an actor, render the actor inspector
            this.$el.html(_.template($(this.template).html())(this.model.get('actor').toJSON()));
            console.log(this.model.get('actor'))
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

            // Do not allow special characters in names, replace them with spaces.
            var text = this.$('.cell-attrs-text').val().replace(/[^\w\n-]/g, ' ');

            this.model.attr({ '.name': {text: text }});
            this.model.get('actor').set('actorName', text);

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
            var actorType = $('#actor-type-ID').val();
            //TODO use the following code and find a method to directly listen to the model instead of taking the information from the interface, 
            //current problem is that actorType is within the actor parameter (actorBBM) but is dealing with attributes from the basic.Actor model
            this.model.get('actor').set('type', actorType);
            if (actorType== 'G') {
                this.model.attr({'.line': {'ref': '.label',
                'ref-x': 0,
                'ref-y': 0.08,
                'd': 'M 5 10 L 55 10',
                'stroke-width': 1,
                'stroke': 'black'}});
            }
            else if (actorType == 'R'){
                this.model.attr({'.line': {'ref': '.label',
                'ref-x': 0,
                'ref-y': 0.6,
                'd': 'M 5 10 Q 30 20 55 10 Q 30 20 5 10' ,
                'stroke-width': 1,
                'stroke': 'black'}});
            }
            else if (actorType == 'A'){
                this.model.attr({'.line': {'stroke-width': 0}});
            }
        },
}

);
