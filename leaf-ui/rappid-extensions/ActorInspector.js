

var ActorInspector = Backbone.View.extend({
    model: joint.shapes.basic.Actor,

    initialize: function () {
        this.actor = this.model.get('actor');
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

    /**
     * Updates if the element is hidden or not, displays it, or not, accordingly.
     */
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
     * Removes the view so we don't have multiple ones in the sidebar.
     */
    removeView: function () {
        this.remove();
    },

    /**
     * Changes the line that distinguishes the type of actor .
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
     * This function displays the tyemplate opf timePointListView.
     */
    displayTimePointListView: function(){
        var display = this.timePointListView();
        this.$('#max-time').append(display.el);
        display.render();
    },
    /**
     * This function updates the actor's intervals attribute.
     */
    updateTimePointsSet: function () {
        var minRange = parseInt(document.getElementById('slider-1').min);
        var maxRange = parseInt(document.getElementById('slider-1').max);  
        var timePoints = parseInt(document.getElementById('slider-1').value);
        var timePoints2 = parseInt(document.getElementById('slider-2').value);
        var flipBool = document.getElementById('intervals-flip-btn').value;

        var timePointsArray = [];
        if (flipBool == "true") { // not flipped
            if (timePoints != minRange) { // first slider is moved
                timePointsArray.push([minRange, timePoints - 1]);
            }
            if (timePoints2 != maxRange) { // second slider is moved
                timePointsArray.push([timePoints2 + 1, maxRange]);
            }
        } else { // flipped
            if (timePoints != minRange) { 
                timePoints += 1;
            }
            if (timePoints2 != maxRange) {
                timePoints2 -= 1;
            }
            timePointsArray.push([timePoints, timePoints2]);
        }

        this.actor.set('intervals', timePointsArray);
    },


    /**
     * This function flips the elements embedded in the actor.
     */
    flipEmbeds: function() {
        this.updateTimePointsSet();
        var intentions = []
        if (this.model.attributes.embeds) {
            var elements = graph.getElements();
            for (var i = 0; i < elements.length; i++) {
                var cell = elements[i].findView(paper);
                if (cell.model.attributes.type != "basic.Actor") {
                    intentions.push(cell);
                }
            }
        }
        for (var i = 0; i < intentions.length; i++) {
            intentions[i].model.attributes.intention.attributes.intervals = [];
        }
    },

    /**
     * This function updates the embedded elements' intervals based on the actor's interval.
     */
    updateEmbeds: function () {
        this.updateTimePointsSet();
        if (this.model.attributes.embeds) {
            var elements = graph.getElements();
            var intentions = []
            for (var i = 0; i < elements.length; i++) {
                var cell = elements[i].findView(paper);
                if (cell.model.attributes.type != "basic.Actor") {
                    intentions.push(cell);
                }
            }
            for (var i = 0; i < intentions.length; i++) {
                for (var j = 0; j < this.model.attributes.embeds.length; j++) {
                    if (this.model.attributes.embeds[j] == intentions[i].model.id) {
                        if (this.actor.attributes.intervals[0] && this.actor.attributes.intervals[0][0] == 0){ // slider1 has been moved in
                            if (intentions[i].model.attributes.intention.attributes.intervals[0] && intentions[i].model.attributes.intention.attributes.intervals[0][0] < this.actor.attributes.intervals[0][1]) {
                                intentions[i].model.attributes.intention.attributes.intervals.shift();
                            }
                        } else if (this.actor.attributes.intervals[0] && this.actor.attributes.intervals[0][1] == graph.get('maxAbsTime')){ // slider2 has been moved in
                            if (intentions[i].model.attributes.intention.attributes.intervals[0] && intentions[i].model.attributes.intention.attributes.intervals[0][1] > this.actor.attributes.intervals[0][0]) {
                                intentions[i].model.attributes.intention.attributes.intervals.pop();
                            }
                        } else if (this.actor.attributes.intervals[0] && !this.actor.attributes.intervals[1] && this.actor.attributes.intervals[0][0] != 0 && this.actor.attributes.intervals[0][1] != graph.get('maxAbsTime')) { // interval is flipped
                            if (intentions[i].model.attributes.intention.attributes.intervals[0] && intentions[i].model.attributes.intention.attributes.intervals[0][0] > this.actor.attributes.intervals[0][0]) {
                                intentions[i].model.attributes.intention.attributes.intervals.pop();
                            } else if (intentions[i].model.attributes.intention.attributes.intervals[0] && intentions[i].model.attributes.intention.attributes.intervals[0][1] < this.actor.attributes.intervals[0][1]) {
                                intentions[i].model.attributes.intention.attributes.intervals.pop();
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
            '<input type="range" min="0" max=<%= graph.get("maxAbsTime") %> value="0", id="slider-1" oninput="slideOne()">',
            '<input type="range" min="0" max=<%= graph.get("maxAbsTime") %> value="<%= Math.round(graph.get("maxAbsTime"))%>", id="slider-2" oninput="slideTwo()">',
        '</div>',
        '<label for="range1">Available: ',
        '<div id="not-flipped">',
            '<span id="range1">',
                '0',
            '</span>',
            '<span> &dash; </span>',
            '<span id="range2">',
                '<%= Math.round(graph.get("maxAbsTime")) %>', 
            '</span><br>',
        '</div>',
        '<div id="flipped" style="display:none">',
        '<span id="int1">',
            '<span id="flipped-min">',
            '0',
            '</span>',
            '<span> &dash; </span>',
            '<span id="range1-flipped">',
            '0',
            '</span>',
        '</span>',
        '<span id="actor_comma">',
            ', ',
        '</span>',
        '<span id="int2">',
            '<span id="range2-flipped">',
            '<%= graph.get("maxAbsTime") %>',
            '</span>',
            '<span> &dash; </span>',
            '<span id="flipped-max">',
                '<%= graph.get("maxAbsTime") %>',
            '</span>',
        '</span>',
    '</div>',
        '<br>',
        '</script>'
    ].join(''),
    
    render: function () {
        this.$el.html(_.template($(this.template).html())(graph.toJSON()));

        var intervals = this.actor.attributes.intervals;
        var slider1 = document.getElementById('slider-1'); // left slider
        var slider2 = document.getElementById('slider-2'); // right slider
        var rangeMin = slider1.min;
        var rangeMax = slider1.max;

        for (var i = 0; i < intervals.length; i++) {
            if (intervals[i][0] > rangeMax) {
                intervals.pop();
            } else if (intervals[i][1] > rangeMax) {
                intervals[i][1] = parseInt(rangeMax);
            }
        }

        if(this.actor.attributes.intervals.length != 0){ // if the interval is not empty (for which it will default to the values set in the html)

            if(intervals[1]){ // [[rangeMin, slider1],[slider2, rangeMax]] (two exclusion intervals)
                slider1.value = intervals[0][1] + 1;
                slider2.value = intervals[1][0] - 1;
            } else { // [slider1, slider2] (one exclusion interval)
                 if (intervals[0][0] == 0){ // [0-#]
                    if (intervals [0][1] == graph.get('maxAbsTime')) { // special case [0-100]
                        document.getElementById('intervals-flip-btn').value = "false";
                        slider1.value = intervals[0][0] - 1;
                        slider2.value = intervals[0][1] + 1;
                        document.getElementById('flipped').style.display = "";
                        document.getElementById('not-flipped').style.display = "none";
                    } else {
                        rangeMin = intervals[0][1] + 1;
                        slider1.value = rangeMin;
                    }
                 } else if(intervals[0][1] == graph.get('maxAbsTime')){ // slider2 is equal to rangeMax
                    rangeMax = intervals[0][0] - 1;
                    slider2.value = rangeMax;
                 } else{ // from slider1 to slider2 is excluded
                    document.getElementById('intervals-flip-btn').value = "false";
                    document.getElementById('intervals-flip-btn').style.display = "none";
                    slider1.value = intervals[0][0] - 1;
                    slider2.value = intervals[0][1] + 1;
                    document.getElementById('flipped').style.display = "";
                    document.getElementById('not-flipped').style.display = "none";
                 }
            }
            document.getElementById('range1').textContent = slider1.value;
            document.getElementById('range2').textContent = slider2.value;
            document.getElementById('range1-flipped').textContent = slider1.value;
            document.getElementById('range2-flipped').textContent = slider2.value;
            
        }
        return this;
    },
})

