

var ActorInspector = Backbone.View.extend({
    model: joint.shapes.basic.Actor,

    initialize: function () {
        this.actor = this.model.get('actor');
    },

    template: [
        //'<link rel="stylesheet" type="text/css" href="../css/actor.css">',
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
        '<input type="checkbox" id="actor-hidden" name="hidden" value="true" style="float: left; margin-top: 25px; margin-left: 75px;"><label for="actor-hidden" style="float: left; margin-top: 25px; margin-left: 10px; margin-bottom:20px">Hide Actor</label>',
        '<br>',
        // '<label for="hidden"> Actor is hidden? </label><br>',
        // '<textarea readonly class="cell-attrs-hidden" maxlength=100> <%= isHidden %> </textarea>',
        // '<label for="interval"> Intervals </label><br>',
        // '<textarea readonly class="cell-attrs-intervals" maxlength=100> <%= intervals %> </textarea>',
        '<div class="wrapper">',
        // '<div class="values">',
        // '</div>',
        '<div class="container">',
        '<div class="slider-track">',
        '</div>',
        '<input type="range" min="0" max="maxtime"  value="30", id="slider-1" oninput="slideOne()">',
        '<input type="range" min="0" max="maxtime"  value="70", id="slider-2" oninput="slideTwo()">',
        '</div>',
        // '<span id="range1">',
        // '0',
        // '</span>',
        // '<span> &dash; </span>',
        // '<span id="range2">',
        // 'maxTime',
        // '</span>',
        // '</label>',
        '</div>',
        '<div id = max-time>',
        '</div>',
        '<br>',
        // '<label for="hidden">Flip intervals</label>',
        // '<div class="legend-box legend-box-blue">Hide</div>',
        // '<div class="legend-box legend-box-white">Display</div>',
        '<script src="js/actorDoubleSlider.js"></script>',
        //'<label class="sub-label">Num Relative Time Points</label>',
		//'<input id="num-rel-time" class="analysis-input" type="number" min="0" max="20" step="1" value="<%= numRelTime %>"> </input>',
        '</div>',
        '</script>'
    ].join(''),

    events: {
        'keyup .cell-attrs-text': 'nameAction',
        'click .slider-1': 'maxTime',
        'change #actor-type-ID': 'updateType',
        'change #actor-hidden' : 'updateHidden',
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
        console.log("waaaaaaa");

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
    displayAssignmentsListView: function(){
        var assignmentsListView = new AssignmentsListView({});
        $('#max-time').append(assignmentsListView.el);
        assignmentsListView.render();
        // console.log("waaaaaa");
        
    },
    maxTime: function(){
        var assignmentsListView = new AssignmentsListView({});
        var x = document.getElementById("slider-1").max;
        var absMaxTime = assignmentsListView.getMaxTime();
        absMaxTime.innerHTML = x;
        console.log("waaaaaaa");
        // var cellsView = []
        // var cellView = absMaxTime.findView(paper);
        // cellsView.push(cellView);

        // console.log("cells!");
        // console.log(cellView);
    },
});
var AssignmentsListView = Backbone.View.extend({
    model: joint.dia.BloomingGraph,
    // initialize: function (options) {
    //     this.nodeActorID = options.nodeActorID;
    // },
    template: ['<script type="text/template" id="assignments-template">',
    '<label for="range1" style="float: left; margin-left: 40px; margin-top:10px;">Available: ',
    '<span id="range1" style="margin-left:5px; margin-top:13px;">',
    '0',
    '</span>',
    '<span style="margin-left:5px; margin-top:13px;"> &dash; </span>',
    '<span id="range2" style="margin-left:5px; margin-top:13px;">',
    '<%= graph.get(\'maxAbsTime\') %>',
    '</span><br>',
    '<br>',
    '<button type="button" id="intervals-flip-btn" onclick="flipIntervals()" name="hidden" value="true" style:"float: left; margin-top:10px; text-align: left;">Invert Slider</button>',
    '</label>',
    '</script>'
    ].join(''),
    events: {
        'change #max-abs-time': 'updateMaxAbsTime',
    },
    render: function () {
        this.$el.html(_.template($(this.template).html())(graph.toJSON()));
        this.$('#max-abs-time').text(graph.get('maxAbsTime'));
        return this;
    },
    updateMaxAbsTime: function () {
        var maxTimeElement = this.$('#max-abs-time');
        if (maxTimeElement.val() !== "") {
            graph.set('maxAbsTime', maxTimeElement.val());
        } else {
            maxTimeElement.val(graph.prop('maxAbsTime'));
        }
    },

    getMaxTime: function () {
        return graph.get('maxAbsTime');
    },
})

