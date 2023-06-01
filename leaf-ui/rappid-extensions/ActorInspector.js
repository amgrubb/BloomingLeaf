

var ActorInspector = Backbone.View.extend({
    model: joint.shapes.basic.Actor,

    initialize: function () {
        this.actor = this.model.get('actor');
        if (this.actor.get('intervals').length == 0) {
            console.log("resetting");
            this.actor.set('intervals', [0,graph.get("maxAbsTime"),"true"]);
        }
        console.log(this.actor);
    },

    template: [
        '<script type="text/template" id="item-template">',
        // Actor name label and text field
            '<div class="inspector-views" id="right-inspector">',
                '<label>Actor name</label>',
                '<textarea class="cell-attrs-text" maxlength=100> <%= actorName %> </textarea>',
        // Actor type
                '<label> Actor type </label>',
                '<select id="actor-type-ID" class="actor-type">',
                    '<option value=A <%if (type === "A")  { %> selected <%} %>> Actor </option>',
                    '<option value=G <%if (type === "G")  { %> selected <%} %>> Agent </option>',
                    '<option value=R <%if (type === "R")  { %> selected <%} %>> Role </option>',
                '</select>',
        // Hide Actor checkbox and label
                '<input type="checkbox" id="actor-hidden" name="hidden" value="true" style="float: left; margin-top: 25px; margin-left: 65px;"><label for="actor-hidden" style="float: left; margin-top: 25px; margin-left: 10px; margin-bottom:40px">Hide Actor</label>',
                '<br>',
        // Double slider
                '<div class="wrapper" style="margin-top: 40px">',
                '</div>',
                '<div id = max-time>',
                '</div>',
                '<button type="button" id="intervals-flip-btn" onclick="flipIntervals()" name="hidden" value="true">Flip Interval</button>',
                '<script src="js/actorDoubleSlider.js"></script>',
            '</div>',
        '</script>'
    ].join(''),

    events: {
        'keyup .cell-attrs-text': 'nameAction',
        'change #actor-type-ID': 'updateType',
        'change #actor-hidden' : 'updateHidden',
        'change #max-time': 'updateEmbeds',
        'click #intervals-flip-btn': 'flipEmbeds',
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
        this.displayTimePointListView();
        // Checks for the correct font size
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

    /**
     * This function creates a new variable, display, as a new TimePointListView.
     * @returns display
     */
    timePointListView: function(){
        var display = new TimePointListView({actor: this.actor});
        return display;
    },

    /**
     * This function displays the tyemplate opf timePointListView
     */
    displayTimePointListView: function(){
        var display = this.timePointListView();
        this.$('#max-time').append(display.el);
        display.render();
    },
    /**
     * This function updates the actor's intervals attribute.
     * @returns the intervals attribute from BIActor
     */
    updateTimePointsSet: function () {
        var timePoints = parseInt(document.getElementById('slider-1').value);
        var timePoints2 = parseInt(document.getElementById('slider-2').value);
        var flipBool = document.getElementById('intervals-flip-btn').value;

        var timePointsArray = [];
        timePointsArray.push(timePoints, timePoints2, flipBool);

        this.actor.set('intervals', timePointsArray);
        
        console.log(this.actor.get('intervals'));
    },

    flipEmbeds: function() {
        this.updateTimePointsSet();
        if (this.model.attributes.embeds) {
            var elements = graph.getElements();
            console.log(elements);
            var intentions = []
            for (var i = 0; i < elements.length; i++) {
                var cell = elements[i].findView(paper);
                if (cell.model.attributes.type == "basic.Goal" || cell.model.attributes.type == "basic.Task" || cell.model.attributes.type == "basic.Resource" || cell.model.attributes.type == "basic.Softgoal") {
                    intentions.push(cell);
                }
            }
            console.log(intentions);
            for (var i = 0; i < intentions.length; i++) {
                for (var j = 0; j < this.model.attributes.embeds.length; j++) {
                    if (this.model.attributes.embeds[j] == intentions[i].model.id) {
                        intentions[i].model.attributes.intention.attributes.intervals = this.actor.attributes.intervals;
                    }
                }
            }
        }
    },

    updateEmbeds: function () {
        this.updateTimePointsSet();
        if (this.model.attributes.embeds) {
            var elements = graph.getElements();
            console.log(elements);
            var intentions = []
            for (var i = 0; i < elements.length; i++) {
                var cell = elements[i].findView(paper);
                if (cell.model.attributes.type == "basic.Goal" || cell.model.attributes.type == "basic.Task" || cell.model.attributes.type == "basic.Resource" || cell.model.attributes.type == "basic.Softgoal") {
                    intentions.push(cell);
                }
            }
            for (var i = 0; i < intentions.length; i++) {
                for (var j = 0; j < this.model.attributes.embeds.length; j++) {
                    if (this.model.attributes.embeds[j] == intentions[i].model.id) {
                        if (intentions[i].model.attributes.intention.attributes.intervals[0][0] < this.actor.attributes.intervals[0][0]) {
                            intentions[i].model.attributes.intention.attributes.intervals[0][0] = this.actor.attributes.intervals[0][0];
                        }
                        if (this.actor.attributes.intervals[1] && intentions[i].model.attributes.intention.attributes.intervals[1]) { // both are flipped
                            if (intentions[i].model.attributes.intention.attributes.intervals[0][1] > this.actor.attributes.intervals[0][1]) {
                                intentions[i].model.attributes.intention.attributes.intervals[0][1] = this.actor.attributes.intervals[0][1];
                            }
                            if (intentions[i].model.attributes.intention.attributes.intervals[1][0] < this.actor.attributes.intervals[1][0]) {
                                intentions[i].model.attributes.intention.attributes.intervals[1][0] = this.actor.attributes.intervals[1][0];
                            }
                            console.log("actor",this.actor.attributes.intervals);
                            console.log("intentions",intentions[i].model.attributes.intention.attributes.intervals);
                        } else if (intentions[i].model.attributes.intention.attributes.intervals[1]) { // intention is flipped
                            if (intentions[i].model.attributes.intention.attributes.intervals[1][1] > this.actor.attributes.intervals[0][1]) {
                                intentions[i].model.attributes.intention.attributes.intervals[1][1] = this.actor.attributes.intervals[0][1];
                            }
                        } else { // neither are flipped
                            if (intentions[i].model.attributes.intention.attributes.intervals[0][1] > this.actor.attributes.intervals[0][1]) {
                                intentions[i].model.attributes.intention.attributes.intervals[0][1] = this.actor.attributes.intervals[0][1];
                            }
                        }
                    }
                }
            }
        }
    }
});

var TimePointListView = Backbone.View.extend({
    model: joint.dia.BloomingGraph,

    initialize: function (options) {
        this.actor = options.actor;
    },
    template: [
        '<script type="text/template" id="item-template">',
        '<div class="container">',
            '<div class="slider-track">',
            '</div>',
            '<input type="range" min="0" max=<%= graph.get("maxAbsTime") %> value="<%= Math.round(0*graph.get("maxAbsTime")) %>", id="slider-1" oninput="slideOne()">',
            '<input type="range" min="0" max=<%= graph.get("maxAbsTime") %> value="<%= Math.round(graph.get("maxAbsTime")) %>", id="slider-2" oninput="slideTwo()">',
        '</div>',
        '<label for="range1">Available: ',
        '<div id="not-flipped">',
            '<span id="range1">',
                '<%= Math.round(0*graph.get("maxAbsTime")) %>',
            '</span>',
            '<span> &dash; </span>',
            '<span id="range2">',
                '<%= Math.round(graph.get("maxAbsTime")) %>', 
            '</span><br>',
        '</div>',
        '<div id="flipped" style="display:none">',
            '0',
            '<span> &dash; </span>',
            '<span id="range1-flipped">',
                '<%= Math.round(0*graph.get("maxAbsTime")) %>',
            '</span>',
            ', ',
            '<span id="range2-flipped">',
                '<%= Math.round(graph.get("maxAbsTime")) %>', 
            '</span>',
            '<span> &dash; </span>',
            '<%= graph.get("maxAbsTime") %>',
        '</div>',
        '<br>',
        '</script>'
    ].join(''),
    render: function () {
        console.log("abt to render",this.actor.attributes.intervals);
        this.$el.html(_.template($(this.template).html())(graph.toJSON()));
        if (this.actor.attributes.intervals[2] == "false") { // flipped
            document.getElementById("intervals-flip-btn").value = "false";
            document.getElementById("range1").textContent = this.actor.attributes.intervals[0];
            console.log("here")
            document.getElementById("range1-flipped").textContent = this.actor.attributes.intervals[0];
            document.getElementById("slider-1").value = this.actor.attributes.intervals[0];
            document.getElementById("range2").textContent = this.actor.attributes.intervals[1];
            document.getElementById("range2-flipped").textContent = this.actor.attributes.intervals[1];
            document.getElementById("slider-2").value = this.actor.attributes.intervals[1];
            document.getElementById("not-flipped").style.display = "none";
            document.getElementById("flipped").style.display = "block";
        } else { // not flipped
            console.log("here2");
            document.getElementById("range1").textContent = this.actor.attributes.intervals[0];
            document.getElementById("range1-flipped").textContent = this.actor.attributes.intervals[0];
            document.getElementById("slider-1").value = this.actor.attributes.intervals[0];
            document.getElementById("range2").textContent = this.actor.attributes.intervals[1];
            document.getElementById("range2-flipped").textContent = this.actor.attributes.intervals[1];
            document.getElementById("slider-2").value = this.actor.attributes.intervals[1];
        }
        return this;
    },
})

