

var ActorInspector = Backbone.View.extend({
    model: joint.shapes.basic.Actor,

    initialize: function () {
        this.actor = this.model.get('actor');
    },

    template: [
        '<script type="text/template" id="item-template">',
        //Actor name label and text field
        '<div class="inspector-views" id="right-inspector">',
        '<label>Actor name</label>',
        '<textarea class="cell-attrs-text" maxlength=100> <%= actorName %> </textarea>',
        //Actor type
        '<label> Actor type </label>',
        '<select id="actor-type-ID" class="actor-type">',
        '<option value=A <%if (type === "A")  { %> selected <%} %>> Actor </option>',
        '<option value=G <%if (type === "G")  { %> selected <%} %>> Agent </option>',
        '<option value=R <%if (type === "R")  { %> selected <%} %>> Role </option>',
        '</select>',
        //Hide Actor checkbox and label
        '<input type="checkbox" id="actor-hidden" name="hidden" value="true" style="float: left; margin-top: 25px; margin-left: 65px;"><label for="actor-hidden" style="float: left; margin-top: 25px; margin-left: 10px; margin-bottom:40px">Hide Actor</label>',
        '<br>',
        //Double slider
        '<div class="wrapper" style="margin-top: 40px">',
        '</div>',
        '<div id = max-time>',
        '</div>',
        // '<label for="interval"> Intervals </label><br>',
        // '<textarea readonly class="cell-attrs-intervals" maxlength=100> <%= intervals %> </textarea>',
        // '<br>',
        // '<button type="button" id="intervals-flip-btn" onclick="flipIntervals()" name="hidden" value="true">Flip Interval</button>',
        // '<script src="js/actorDoubleSlider.js"></script>',
        '</div>',
        '</script>'
    ].join(''),

    events: {
        'keyup .cell-attrs-text': 'nameAction',
        'change #actor-type-ID': 'updateType',
        'change #actor-hidden' : 'updateHidden',
        'change #max-time': 'updateTimePointsSet',
        //'change #num-rel-time': 'addRelTime',
        'clearInspector .inspector-views': 'removeView'
    },

    updateHidden: function (event){
        var isHidden = event.target.checked;
        if(isHidden){
            this.actor.set('isHidden', true);
            this.$('.cell-attrs-hidden').val(true);
        } else {
            this.actor.set('isHidden', false);
            this.$('.cell-attrs-hidden').val(false);
        }

        // Gets j_ids of all intentions and actors in the current model
        var elements = graph.getElements();
        var cellsView = []
        for (var i = 0; i < elements.length; i++) {
            var cellView = elements[i].findView(paper);
            cellsView.push(cellView);
        } 

        // Hide/Display the actor selected
        for (var i = 0; i < elements.length; i++) {
            if (cellsView[i].model.attributes.type == "basic.Actor" && cellsView[i].model.attributes.actor.cid == this.actor.cid) {
                // console.log(cellsView[i].id);
                // console.log(cellsView[i].model.attributes.actor.attributes.isHidden);
                if (cellsView[i].model.attributes.actor.attributes.isHidden) {
                    $("#"+cellsView[i].id).css("display", "none");
                } else {
                    $("#"+cellsView[i].id).css("display", "");
                }
            }
        } 

        console.log("cells!");
        console.log(cellsView);

    },



    /**
     * Initializes the element inspector using previously defined templates
     */
    render: function () {
        // If the clicked node is an actor, render the actor inspector
        this.$el.html(_.template($(this.template).html())(this.actor.toJSON()));
        this.displayAssignmentsListView();
        //Checks for the correct font size
        changeFont(current_font, paper);
        return this;
        
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
        this.actor.set('actorName', text);

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
        this.actor.set('type', actorType);

        if (actorType == 'G') {
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
        else if (actorType == 'R') {
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
        else if (actorType == 'A') {
            this.model.attr({ '.line': { 'stroke-width': 0 } });
        }
    },

    assignmentsListView: function(){
        var display = new AssignmentsListView({});
        return display;
    },
    displayAssignmentsListView: function(){
        var display = this.assignmentsListView();
        this.$('#max-time').append(display.el);
        display.render();


    },
    updateTimePointsSet: function () {
        var display = this.assignmentsListView();
        display.render();
        var timeInt = display.timePointsSet();
        var flipBool = document.getElementById('intervals-flip-btn').value;
        if (flipBool == 'true') {
            console.log(this.actor.get('intervals'));
            if (this.actor.get('intervals') == []){
                this.actor.get('intervals').push(timeInt);
                return this.actor.get('intervals');
            } else {
                this.actor.get('intervals').pop();
                this.actor.get('intervals').push(timeInt);
                return this.actor.get('intervals');
            }
        }else{
            console.log(this.actor.get('intervals'));
            if (this.actor.get('intervals') == []){
                this.actor.get('intervals').push(timeInt[0]);
                this.actor.get('intervals').push(timeInt[1]);
                return this.actor.get('intervals');
            } else {
                this.actor.get('intervals').pop();
                this.actor.get('intervals').pop();
                this.actor.get('intervals').push(timeInt[0]);
                this.actor.get('intervals').push(timeInt[1]);
                return this.actor.get('intervals');
            }

        }

    }
});
var AssignmentsListView = Backbone.View.extend({
    model: joint.dia.BloomingGraph,
    template: [
        '<script type="text/template" id="item-template">',
        '<div class="container">',
        '<div class="slider-track">',
        '</div>',
        '<input type="range" min="0" max=<%= graph.get("maxAbsTime") %> value="<%= Math.round(.3*graph.get("maxAbsTime")) %>", id="slider-1" oninput="slideOne()">',
        '<input type="range" min="0" max=<%= graph.get("maxAbsTime") %> value="<%= Math.round(.7*graph.get("maxAbsTime")) %>", id="slider-2" oninput="slideTwo()">',
        '</div>',
        '<label for="range1">Available: ',
        '<div id="not-flipped">',
        '<span id="range1">',
        '<%= Math.round(.3*graph.get("maxAbsTime")) %>',
        '</span>',
        '<span> &dash; </span>',
        '<span id="range2">',
        '<%= Math.round(.7*graph.get("maxAbsTime")) %>', 
        '</span><br>',
        '</div>',
        '<div id="flipped" style="display:none">',
            '0',
            '<span> &dash; </span>',
            '<span id="range1-flipped">',
            '<%= Math.round(.3*graph.get("maxAbsTime")) %>',
            '</span>',
            ', ',
            '<span id="range2-flipped">',
            '<%= Math.round(.7*graph.get("maxAbsTime")) %>', 
            '</span>',
            '<span> &dash; </span>',
            '<%= graph.get("maxAbsTime") %>',
        '</div>',
        '<br>',
        '<button type="button" id="intervals-flip-btn" onclick="flipIntervals()" name="hidden" value="true">Flip Interval</button>',
        '<script src="js/actorDoubleSlider.js"></script>',
        '</script>'
    ].join(''),
    events: {
        'change .container': 'timePointsSet',
    },
    render: function () {
        this.$el.html(_.template($(this.template).html())(graph.toJSON()));
        this.returnFlipVal();
        return this;
    },
    timePointsSet: function () {
        var timePointsArray = [];
        var timePoints = parseInt(this.$('#range1').text());
        var timePoints2 = parseInt(this.$('#range2').text());
        // console.log(this.$('#intervals-flip-btn').val());
        if (this.$('#intervals-flip-btn').val() == "true") {
            timePointsArray.push(timePoints, timePoints2);
            // console.log(timePointsArray);
            // console.log(graph.get('absTimePtsArr'));
            if (graph.get("absTimePtsArr") == []){
                graph.get("absTimePtsArr").push(timePointsArray);
                return graph.get('absTimePtsArr');
            } else {
                graph.get("absTimePtsArr").pop();
                graph.get("absTimePtsArr").push(timePointsArray);
                return graph.get('absTimePtsArr');
            }
        }else{
            // console.log(graph.get('absTimePtsArr'));
            var reverseTimePointArray1 = [];
            var reverseTimePointArray2 = [];
            var timePointMax = parseInt(this.$('#slider-1').attr('max'));
            reverseTimePointArray1.push(0, timePoints);
            reverseTimePointArray2.push(timePoints2, timePointMax);
            if (graph.get("absTimePtsArr") == []){
                graph.get('absTimePtsArr').push(reverseTimePointArray1, reverseTimePointArray2);
                return graph.get('absTimePtsArr');
            } else {
                graph.get("absTimePtsArr").pop();
                graph.get("absTimePtsArr").pop();
                graph.get('absTimePtsArr').push(reverseTimePointArray1, reverseTimePointArray2);
                return graph.get('absTimePtsArr');
            }

        }
        },
    returnFlipVal: function() {
        var FlipVal =this.$('#intervals-flip-btn').val();
        return FlipVal;
    },
})

