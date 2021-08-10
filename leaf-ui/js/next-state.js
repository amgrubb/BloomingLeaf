/**
 * New file for Next State Window.
 */

 { // LOCAL GLOBAL VARIABLES
    var analysis = {};
    analysis.analysisResult;
    analysis.elements = [];
    analysis.currentState;
    
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
        analysis.graph = new joint.dia.Graph(); //joint.dia.BloomingGraph();
        analysis.paper;
        analysis.paperScroller;
           
        analysis.paper = new joint.dia.Paper({
            width: 1200,
            height: 600,
            gridSize: 10,
            perpendicularLinks: false,
            model: analysis.graph,
            defaultLink: new joint.dia.Link({
                'attrs': {
                    '.connection': {stroke: '#000000'},
                    '.marker-source': {'d': '0'},
                    '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
                },
                'labels': [{position: 0.5, attrs: {text: {text: "and"}}}]
            })
        });
    
        analysis.paperScroller = new joint.ui.PaperScroller({
            autoResizePaper: true,
            paper: analysis.paper
        });
    
        $('#paper').append(analysis.paperScroller.render().el);
        analysis.paperScroller.center();
        
        //analysis.graph.fromJSON(JSON.parse(JSON.stringify(window.opener.graph.toJSON())));
        var newGraph2 = '{"cells":[{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":230,"y":280},"angle":0,"id":"3e525e62-3905-4a2c-ac89-6f5cb5b36002","z":1,"nodeID":"0000","elementid":"0000","attrs":{".satvalue":{"text":"(P, F)"},".name":{"text":"Goal_0"},"text":{"fill":"black","stroke":"none","font-weight":"normal","font-size":10}}},{"type":"basic.Goal","size":{"width":100,"height":60},"position":{"x":360,"y":520},"angle":0,"id":"32df79d5-52fd-400e-843c-1a09c0d69aea","z":2,"nodeID":"0001","elementid":"0001","attrs":{".satvalue":{"text":"(P, F)"},".name":{"text":"Goal_1"},"text":{"fill":"black","stroke":"none","font-weight":"normal","font-size":10}}},{"type":"link","source":{"id":"3e525e62-3905-4a2c-ac89-6f5cb5b36002"},"target":{"id":"32df79d5-52fd-400e-843c-1a09c0d69aea"},"labels":[{"position":0.5,"attrs":{"text":{"text":"+"}}}],"id":"9fcca4e7-bc89-4675-a4cb-2c94592a723b","z":3,"linkID":"0000","link-type":"+","attrs":{".connection":{"stroke":"black","stroke-width":1},".marker-source":{"d":"0"},".marker-target":{"stroke":"black","d":"M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5","stroke-width":1}}}]}';
        analysis.graph.fromJSON(JSON.parse(newGraph2));

    }

}