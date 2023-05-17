/* *** Code Inconsistent with Rappid Distribution ***
 * J.Fear - Aug. 2015
 * The following functions differs from the Rappid release. These functions did not exist in the Rappid Library.
 * 		joint.shapes.basic.Intention: Is the superclass for all added nodes (goals, subgoals, tasks, resources).
 * 		joint.shapes.basic.Goal: Goal node.
 * 		joint.shapes.basic.Task: Task node.
 * 		joint.shapes.basic.Softgoal: Softgoal node.
 * 		joint.shapes.basic.Resource: Resource node.
 * 		joint.dia.Actorlink: Link between actors.
 * 		joint.shapes.basic.Actor: Actor node.
 *
 */

joint.dia.BloomingGraph = joint.dia.Graph.extend({
    defaults: joint.util.deepSupplement({
        type: 'goalmodel.Graph',
        maxAbsTime: 100,
        absTimePtsArr: [],
        // TODO: Name with correct type of constraints
        constraints: new ConstraintCollection([]),
    }, joint.dia.Graph.prototype.defaults),

    /**
     * @returns Array of all IntentionBBMs in the graph
     */
    getIntentions: function () {
        return this.getElements().filter(element => element instanceof joint.shapes.basic.Intention)
            .map(intentionCell => intentionCell.get('intention'));
    },

    /**
     * Returns the cell associated with the id parameter
     * There should be a 1 to 1 mapping of ids to cells
     * 
     * @param {String} id 
     * @returns Cell
     */
    getCellById: function (id) {
        var cell = this.getCells().filter(cell => cell.get('id') == id);
        if (cell.length == 1) {
            return cell[0]
        }
        return null;
    },

})

joint.shapes.basic.Intention = joint.shapes.basic.Generic.extend({
    // Changed satvalue to text
    markup: '<g class="rotatable"><g class="scalable"><rect class="outer"/></g><text class="satvalue"/><text class="funcvalue"/><text class="name"/></g>',
    defaults: joint.util.deepSupplement({
        type: "basic.Intention",
        size: {
            width: 100,
            height: 60
        },
        attrs: {
            ".outer": {
                width: 100,
                height: 60
            },
            // Navie: Changed the initial value of satvalue
            ".satvalue": {
                'stroke': '#000000',
                'stroke-width': 0.5,
                'font-size': 12,
                'text-anchor': 'middle',
                'value': 'none'
            },
            ".funcvalue": {
                'text': "",
                'ref-y': '0.75',
                'ref-x': '0.08',
                'fill': 'black',
                'font-size': 16
            },
            ".name": {
                'fill': 'black',
                'ref-y': '0.5',
                'ref-x': '0.5',
                'font-size': 12,
                'x-alignment': 'middle',
                'y-alignment': 'middle'
            },
        },
        intention: null,
    }, joint.dia.Element.prototype.defaults)
});

joint.shapes.basic.Goal = joint.shapes.basic.Intention.extend({
    defaults: joint.util.deepSupplement({
        type: "basic.Goal",
        attrs: {
            ".outer": {
                rx: 20,
                ry: 20,
                stroke: 'black',
                fill: '#FFCC66',
            },
            ".satvalue": {
                'ref-x': '0.75',
                'ref-y': '0.75'
            },
            ".name": {
                'text': 'Goal',
            }
        }
    }, joint.shapes.basic.Intention.prototype.defaults),
    changeToOriginalColour: function () {
        this.attr({ '.outer': { 'fill': '#FFCC66' } });
    }
});

joint.shapes.basic.Task = joint.shapes.basic.Intention.extend({
    markup: '<g class="rotatable"><g class="scalable"><path class="outer"/></g><text class="satvalue"/><text class="funcvalue"/><text class="name"/></g>',
    defaults: joint.util.deepSupplement({
        type: "basic.Task",
        attrs: {
            ".outer": {

                refD: 'M 0 30 L 20 0 L 80 0 L 100 30 L 80 60 L 20 60 z',
                fill: '#92E3B1',
                stroke: 'black',
                'stroke-width': 1
            },
            ".satvalue": {
                'ref-y': '0.75',
                'ref-x': '0.8',
            },
            ".funcvalue": {
                'ref-y': '0.75',
                'ref-x': '0.2',
            },
            ".name": {
                'text': 'Task',
            }
        }
    }, joint.shapes.basic.Intention.prototype.defaults),
    changeToOriginalColour: function () {
        this.attr({ '.outer': { 'fill': '#92E3B1' } });
    }
});

joint.shapes.basic.Softgoal = joint.shapes.basic.Intention.extend({
    markup: '<g class="rotatable"><g class="scalable"><path class="outer"/></g><text class="satvalue"/><text class="funcvalue"/><text class="name"/></g>',
    defaults: joint.util.deepSupplement({
        type: "basic.Softgoal",
        attrs: {
            ".outer": {
                refD: 'M113.447 101.566 C 77.274 104.408,54.279 137.289,54.279 186.169 C 54.279 255.277,75.723 284.606,122.983 280.136 C 133.561 279.135,140.929 276.657,154.063 269.682 C 177.358 257.311,191.303 256.031,212.469 264.323 C 226.654 269.879,253.330 276.729,272.478 279.733 C 276.925 280.430,298.167 280.099,303.178 279.254 C 332.287 274.345,347.591 254.688,350.106 218.979 C 350.384 215.029,350.611 199.115,350.611 183.616 L 350.611 155.434 349.373 150.547 C 338.978 109.541,306.910 97.327,256.479 115.166 C 237.996 121.704,234.295 122.664,223.350 123.753 C 209.690 125.113,197.527 122.720,178.549 114.940 C 152.968 104.453,131.870 100.119,113.447 101.566',
                stroke: 'black',
                fill: '#FF984F',
            },
            ".satvalue": {
                'ref-y': '0.75',
                'ref-x': '0.76'
            },
            ".funcvalue": {
                'ref-y': '0.75',
                'ref-x': '0.2',
            },
            ".name": {
                'text': 'Soft Goal',
            }
        }
    }, joint.shapes.basic.Intention.prototype.defaults),
    changeToOriginalColour: function () {
        this.attr({ '.outer': { 'fill': '#FF984F' } });
    }
});

joint.shapes.basic.Resource = joint.shapes.basic.Intention.extend({
    defaults: joint.util.deepSupplement({
        type: "basic.Resource",
        attrs: {
            ".outer": {
                stroke: 'black',
                fill: '#92C2FE',
            },
            ".satvalue": {
                transform: "translate(80, 45)",
            },
            ".name": {
                'text': 'Resource',
            }
        }
    }, joint.shapes.basic.Intention.prototype.defaults),
    changeToOriginalColour: function () {
        this.attr({ '.outer': { 'fill': '#92C2FE' } });
    }
});

joint.shapes.basic.CellLink = joint.dia.Link.extend({
    // In initialize, everytime the target is changed, the code updates it
    initialize: function () {
        this.on('change:target', this.updateLinkPointers, this);
        this.on('change:source', this.updateLinkPointers, this);
    },
    defaults: joint.util.deepSupplement({
        type: 'basic.CellLink',
        link: null,
    }),

    /**
     * This function checks the updated target/source to determine if the link is still valid
     * And updates the CellLink type and LinkBBM linkType accordingly
     */
    updateLinkPointers: function () {
        var target = this.getTargetElement();
        var source = this.getSourceElement();
        if ((target !== null && source !== null)) {
            if (((source.get('type') === 'basic.Actor') && (target.get('type') !== 'basic.Actor')) || ((source.get('type') !== 'basic.Actor') && (target.get('type') === 'basic.Actor'))) {
                this.get('link').set('displayType', 'error');
                this.label(0, { position: 0.5, attrs: { text: { text: 'error' } } });
            } else if (source.get('type') === "basic.Actor") {
                this.get('link').set('displayType', 'Actor');
                this.get('link').set('linkType', 'is-a');
                this.label(0, { position: 0.5, attrs: { text: { text: this.get('link').get('linkType') } } });
            }
            else {
                this.get('link').set('displayType', 'element'); //TODO: Should this be set to 'link'?
                this.get('link').set('linkType', 'and');
                this.label(0, { position: 0.5, attrs: { text: { text: this.get('link').get('linkType') } } });
            }
        }
    },

    /**
     * Checks if LinkBBM can have a valid absolute relationship
     * 
     * @returns Boolean
     */
    isValidAbsoluteRelationship: function () {
        // If relationship is of type evolving and has a target and source, return true
        if (this.get('link').get('linkType') == 'NBD' || this.get('link').get('linkType') == 'NBT' || this.get('link').get('postType') != null) {
            return (this.get('source') != null && this.get('target') != null);
        }
        return false;
    },
});


joint.shapes.basic.Actor = joint.shapes.basic.Generic.extend({
    markup: '<g class="scalable"><rect class = "outer"/></g><circle class="label"/><path class="line"/><text class = "name"/>',

    defaults: joint.util.deepSupplement({
        type: "basic.Actor",
        size: {
            width: 120,
            height: 120
        },
        attrs: {
            ".label": {
                r: 30,
                cx: 20,
                cy: 20,
                fill: '#FFFFA4',
                stroke: '#000000'
            },
            ".outer": {
                width: 100,
                height: 60,
                rx: 10,
                ry: 10,
                fill: '#EBFFEA', //'#CCFFCC',
                stroke: '#000000',
                'stroke-dasharray': '5 2'
            },

            ".name": {
                'text': 'Actor',
                'fill': 'black',
                'ref-y': '0.5',
                'ref-x': '0.5',
                'ref': '.label',
                'font-size': 12,
                'x-alignment': 'middle',
                'y-alignment': 'middle'
            },
            ".line": {
            }
        },
        actor: null,
    }, joint.dia.Element.prototype.defaults),
    changeToOriginalColour: function () {
        this.attr({ '.outer': { 'fill': '#EBFFEA' } });
    },
});