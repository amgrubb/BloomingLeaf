//Class for the element properties tab that appears when an element is clicked
var ENTER_KEY = 13;

/*
Note:
Updating variables and render preexisting values often uses the same functions.
Functions like updateChart, and updateCell are always called whenever changes are made
on the inspector panel.

This approach is necessary because Chart.js is built on top HTML5 Canvas. The entire
canvas needs to be redrawn every time a variable is changed.

When evaluating the functions calls of a particular action, use a top-down approach in
file naviagation. That is, the first function called is always near the top. The last
function called, will always be near the bottom.
*/

var ActorInspector = Backbone.View.extend({

        className: 'element-inspector',

        template: [
            '<label>Actor name</label>',
            '<textarea class="cell-attrs-text" maxlength=100></textarea>',
            '<label> Actor type </label>',
            '<select class="actor-type">',
            '<option value=A> Actor </option>',
            '<option value=G> Agent </option>',
            '<option value=R> Role </option>',
            '</select>'
        ].join(''),

        events: {
            'keyup .cell-attrs-text': 'nameAction',
        },

        /**
         * Initializes the element inspector using previously defined templates
         */
        render: function(cell) {

            this.cell = cell;

            // Save actor here
            this.element = model.getActorByID(cell.attributes.nodeID);

            // If the clicked node is an actor, render the actor inspector
            this.$el.html(_.template(this.template)());
            this.$('.cell-attrs-text').val(this.element.nodeName);
        },


        /**
         * Updates the selected cell's name.
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

            this.cell.attr({ '.name': { text: text } });
            this.element.nodeName = text;

        },
      clear: function(){
            this.$el.html('');
        }
}

);
