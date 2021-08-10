/**
 * New file for Next State Window.
 */

 { // LOCAL GLOBAL VARIABLES
    var analysis = {};
    // analysis.analysisResult;
    // analysis.elements = [];
    // analysis.currentState;
    
    var myInputJSObject;
    myInputJSObject.request;
    myInputJSObject.results;

    var satValueDict = {
        "unknown": "0000",
        "satisfied": "0011",
        "partiallysatisfied": "0010",
        "partiallydenied": "0100",
        "denied": "1100",
        "none": "0000"
    };
    
    //Executing scripts only when page is fully loaded
    window.onload = function(){
        analysis.page = jQuery.extend({}, window.opener.document);
        init();
    }
    
    function init(){
        //Page objects
        analysis.graph = new joint.dia.BloomingGraph();
        analysis.paper;
        analysis.paperScroller;

        // Create Paper object
        analysis.paper = new joint.dia.Paper({
            width: 1200,
            height: 600,
            gridSize: 10,
            perpendicularLinks: false,
            model: analysis.graph,
            defaultLink: new joint.shapes.basic.CellLink({ //new joint.dia.Link({
                'attrs': {
                    '.connection': {stroke: '#000000'},
                    '.marker-source': {'d': '0'},
                    '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
                },
                'labels': [{position: 0.5, attrs: {text: {text: "and"}}}]
            })
        });
    
        // Add scroll feature to the paper.
        analysis.paperScroller = new joint.ui.PaperScroller({
            autoResizePaper: true,
            paper: analysis.paper
        });
        $('#paper').append(analysis.paperScroller.render().el);
        analysis.paperScroller.center();

        // Make a copy of the graph and add it to the window.
        analysis.graph.fromJSON(JSON.parse(backendStringifyCirc(window.opener.graph.toJSON())));
        console.log("Request:" + JSON.stringify(myInputJSObject.request.toJSON()));
        console.log("Result:" + JSON.stringify(myInputJSObject.results.toJSON()));
        
    }

}