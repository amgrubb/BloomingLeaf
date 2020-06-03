/*
This file contains all the jQuery functions that are associated with buttons and elements.
It also contains the setup for Rappid elements.
*/

/**
 * Switches to Analysis view iff there are no cycles and no syntax errors.
 */
$('#analysis-btn').on('click', function() {
    var jsLinks;
    var cycle;
    jsLinks = getLinks();
    cycle = cycleCheck(jsLinks, getElementList());

    syntaxCheck();
    // If there are no cycles then switch view to Analysis
    if (!cycle[0]) {
        switchToAnalysisMode(); 
    }

    // If there are cycles, then display error message. Otherwise, remove any "red" elements.
    cycleCheckForLinks(cycle);
});

$('#load-sample').on('click', function() {

    $.getJSON('http://www.cs.toronto.edu/~amgrubb/archive/REJ-Supplement/S1Frag.json', function(myData){		
        var response = JSON.stringify(myData);
        var newModel = new Blob([response], {type : 'application/json'});
        reader.readAsText(newModel);  	
    });
});

/**
 * Reassigned IDs if required.
 * If there are currently n intentions, and the nodeIDs of the intentions
 * are not exactly between 0000 and n - 1 inclusive, this function reassigns IDs 
 * so that the nodeIDs are all exactly between 0000 and n - 1 inclusive.
 *
 * For example: 
 * There are 2 intentions. The first intention has nodeID 0000 and the
 * second intention has nodeID 0002. This function will cause the 
 * the first intention to keep nodeID 0000 and the 
 * second intention to be assigned assigned nodeID 0001.
 */
function reassignIntentionIDs() {
	var elements = graph.getElements();
	var intentions = model.intentions;
 	var currID = 0;
	var currIDStr;
	for (var i = 0; i < intentions.length; i++) {
		var intention = intentions[i];
 		if (parseInt(intention.nodeID) !== currID) {
 			// The current intention's ID must be reassigned
		
			// Find the intention's cell
			var cell;
			for (var j = 0; j < elements.length; j++) {
				if (elements[j].attributes.nodeID === intention.nodeID) {
					cell = elements[j];
				}
            }

 			currIDStr = currID.toString();
 			while (currIDStr.length < 4){
	                currIDStr = '0' + currIDStr;
	        }
			cell.attributes.nodeID = currIDStr;
			intention.setNewID(currIDStr);
		}
 		currID += 1;
	}
 	Intention.numOfCreatedInstances = currID;
	Link.numOfCreatedInstances = currID;
}


/**
 * Helper function for switching to Analysis view.
 */
function switchToAnalysisMode() {

	reassignIntentionIDs();
	
	// Clear the right panel
	clearInspector();
	
	removeHighlight();

	analysisInspector.render();
	console.log("after render");
	$('.inspector').append(analysisInspector.el);
	$('#stencil').css("display", "none");
	$('#history').css("display", "");

	$('#analysis-btn').css("display", "none");
	$('#symbolic-btn').css("display", "none");
	$('#cycledetect-btn').css("display", "none");
	$('#dropdown-model').css("display", "");

	$('#model-toolbar').css("display", "none");

	$('#modeText').text("Analysis");

	// Disable link settings
	$('.link-tools .tool-remove').css("display", "none");
	$('.link-tools .tool-options').css("display", "none");

	if (currentHalo) {
		currentHalo.remove();
	}
	mode = "Analysis";
}

// Switches to modeling mode
$('#model-cur-btn').on('click', function() {
	switchToModellingMode();

	// Cleaning the previous analysis data for new execution
	//globalAnalysisResult.elementList = "";
	savedAnalysisData.finalAssignedEpoch="";
	savedAnalysisData.finalValueTimePoints="";
});


/**
 * Sets each node/cellview in the paper to its initial 
 * satisfaction value and colours all text to black
 */
function revertNodeValuesToInitial() {
	var elements = graph.getElements();
	var curr;
	for (var i = 0; i < elements.length; i++) {
		curr = elements[i].findView(paper).model;

		if (curr.attributes.type !== 'basic.Goal' &&
			curr.attributes.type !== 'basic.Task' &&
			curr.attributes.type !== 'basic.Softgoal' &&
			curr.attributes.type !== 'basic.Resource') {
			continue;
		}

		var intention = model.getIntentionByID(curr.attributes.nodeID);

		var initSatVal = intention.getInitialSatValue();
		if (initSatVal === '(no value)') {
			curr.attr('.satvalue/text', '');
		} else {
			curr.attr('.satvalue/text', satisfactionValuesDict[initSatVal].satValue);
		}
		curr.attr({text: {fill: 'black'}});
	}
}

/**
 * Switches back to Modelling Mode from Analysis Mode
 * and resets the Nodes' satValues to the values prior to analysis
 * Display the modeling mode page
 */
function switchToModellingMode() {
	analysisRequest.previousAnalysis = null;
	clearInspector();

	// Reset to initial graph prior to analysis
	for (var i = 0; i < graph.elementsBeforeAnalysis.length; i++) {
		var value = graph.elementsBeforeAnalysis[i]
		updateNodeValues(i, value, "toInitModel");
	}

	// Reset to initial graph prior to analysis
	revertNodeValuesToInitial();

	graph.elementsBeforeAnalysis = [];

	$('#stencil').css("display","");
	$('#history').css("display","none");

	$('#analysis-btn').css("display","");
	$('#symbolic-btn').css("display","");
	$('#cycledetect-btn').css("display","");
	$('#dropdown-model').css("display","none");

	$('#model-toolbar').css("display","");

	$('#sliderValue').text("");

	// Reinstantiate link settings
	$('.link-tools .tool-remove').css("display","");
	$('.link-tools .tool-options').css("display","");

	graph.allElements = null;

	// Clear previous slider setup
	clearHistoryLog();

	mode = "Modelling";
}

/**
 * Set up tool bar button on click functions
 */
$('#btn-undo').on('click', _.bind(commandManager.undo, commandManager));
$('#btn-redo').on('click', _.bind(commandManager.redo, commandManager));
$('#btn-clear-all').on('click', function(){
    graph.clear();
    model.removeAnalysis();
	// Delete cookie by setting expiry to past date
	document.cookie='graph={}; expires=Thu, 18 Dec 2013 12:00:00 UTC';
});

$('#btn-clear-elabel').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		elements[i].removeAttr(".satvalue/d");
		elements[i].attr(".constraints/lastval", "none");
		elements[i].attr(".funcvalue/text", " ");
		var cellView  = elements[i].findView(paper);
		elementInspector.render(cellView.model);
		elementInspector.$('#init-sat-value').val("none");
		elementInspector.updateHTML(null);

	}

});
$('#btn-clear-flabel').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".constraints/lastval") != "none"){
			elements[i].attr(".funcvalue/text", "C");
		}
	}
});

/**
 * This is an option under clear button to clear red-highlight from
 * cycle detection function
 */
$('#btn-clear-cycle').on('click',function(){
	var cycleElements = graph.getElements();

	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
			var cellView  = elements[i].findView(paper);
			if(cellView.model.attributes.type == "basic.Task"){
				cellView.model.attr({'.outer': {'fill': '#92E3B1'}});
			}
			if(cellView.model.attributes.type == "basic.Goal"){
				cellView.model.attr({'.outer': {'fill': '#FFCC66'}});
			}
			if(cellView.model.attributes.type == "basic.Resource"){
				cellView.model.attr({'.outer': {'fill': '#92C2FE'}});
			}
			if(cellView.model.attributes.type == "basic.Softgoal"){
				cellView.model.attr({'.outer': {'fill': '#FF984F'}});
			}
	}
});

// Open as SVG
$('#btn-svg').on('click', function() {
	paper.openAsSVG();
});

// Zoom in
$('#btn-zoom-in').on('click', function() {
	paperScroller.zoom(0.2, { max: 3 });
});

// Zoom out
$('#btn-zoom-out').on('click', function() {
	paperScroller.zoom(-0.2, { min: 0.2 });
});

// Save the current graph to json file
$('#btn-save').on('click', function() {
	var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
	if (name){
		var fileName = name + ".json";
		var obj = getFullJson();
		download(fileName, JSON.stringify(obj));
	}
});

// Workaround for load, activates a hidden input element
$('#btn-load').on('click', function(){
	$('#loader').click();
});

// Increase font size
$('#btn-fnt-up').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".name/font-size") < max_font){
			elements[i].attr(".name/font-size", elements[i].attr(".name/font-size") + 1);
		}
	}
});

// Decrease font size
$('#btn-fnt-down').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".name/font-size") > min_font){
			elements[i].attr(".name/font-size", elements[i].attr(".name/font-size") - 1);
		}
	}
});

// Default font size
$('#btn-fnt').on('click', function(){
	var elements = graph.getElements();
	for (var i = 0; i < elements.length; i++){
		elements[i].attr(".name/font-size", 10);
	}
});

/**
 * Creates an instance of a Link object and saves it in the global model
 * variable
 *
 * @param {joint.dia.Cell} cell
 */
function createLink(cell) {
	var link = new Link('AND', cell.getSourceElement().attributes.nodeID,  -1);
	cell.attributes.linkID = link.linkID;
    cell.on("change:target", function () {
    	var target = cell.getTargetElement();
    	if (target === null) {
    		link.linkDestID = null;
    	} else {
    		link.linkDestID = target.attributes.nodeID;
    	}
    });
    cell.on("change:source", function () {
		var source = cell.getSourceElement();
		if (source === null) {
			link.linkSrcID = null;
		} else {
			link.linkSrcID = source.attributes.nodeID;
		}
    });

    // when the link is removed, remove the link from the global model
    // variable as well
    cell.on("remove", function () {
    	clearInspector();
		model.removeLink(link.linkID);
    });
    model.links.push(link);
}

/**
 * Creates an instance of a Intention object and saves it in the
 * global model variable
 *
 * @param {joint.dia.Cell} cell
 */
function createIntention(cell) {

    var name = cell.attr(".name/text") + "_" + Intention.numOfCreatedInstances;
    cell.attr(".name/text", name);

    // create intention object
    var type = cell.attributes.type;
    var intention = new Intention('-', type, name);
    model.intentions.push(intention);

    // create intention evaluation object
    var intentionEval = new UserEvaluation(intention.nodeID, '0', '(no value)');
    analysisRequest.userAssignmentsList.push(intentionEval);

    cell.attributes.nodeID = intention.nodeID;

    // when the intention is removed, remove the intention from the global
    // model variable as well
    cell.on("remove", function () {
    	clearInspector();
    	var userIntention = model.getIntentionByID(cell.attributes.nodeID);
    	// remove this intention from the model
        
        // remove all intention evaluations associated with this intention
        analysisRequest.removeIntention(userIntention.nodeID);

        // if this intention has an actor, remove this intention's ID
        // from the actor
        if (userIntention.nodeActorID !== '-') {
        	var actor = model.getActorByID(userIntention.nodeActorID);
        	actor.removeIntentionID(userIntention.nodeID, analysisRequest.userAssignmentsList);
        }

    });

}

/**
 * Creates an instance of an Actor object and saves it in the
 * global model variable
 * 
 * @param {joint.dia.Cell} cell
 */
function createActor(cell) {
	var name = cell.attr('.name/text') + "_" + Actor.numOfCreatedInstances;
	var actor = new Actor(name);
    cell.attr(".name/text", name);
	cell.attributes.nodeID = actor.nodeID;
	model.actors.push(actor);

	// when the actor is removed, remove the actor from the
	// global modekl variable as well
	cell.on('remove', function() {
		model.removeActor(actor.nodeID);
	});
}

/**
 * Set up on events for Rappid/JointJS objets
 */
var element_counter = 0;
var max_font = 20;
var min_font = 6;
var current_font = 10;

// Whenever an element is added to the graph
graph.on("add", function(cell) {

	if (cell instanceof joint.dia.Link){
        if (graph.getCell(cell.get("source").id) instanceof joint.shapes.basic.Actor){
            cell.prop("linktype", "actorlink");
            cell.label(0,{attrs:{text:{text:"is-a"}}});
		}
        createLink(cell);
    } else if (cell instanceof joint.shapes.basic.Intention){
		createIntention(cell);
		cell.attr('.funcvalue/text', ' ');
	} else if (cell instanceof joint.shapes.basic.Actor) {
		createActor(cell);

		// Send actors to background so elements are placed on top
		cell.toBack();
	}

	paper.trigger("cell:pointerup", cell.findView(paper));
});


// used when reading form the database is needed
function accessDatabaseWithRead(insert_query, read_query, type){
    var queryString = "insert_query=" +  encodeURIComponent(insert_query) + "&type=" + type + "&read_query=" +  encodeURIComponent(read_query);
    $.ajax({
        type: "POST",
        url: "./js/ajaxjs.php",
        data: queryString,
        cache: false,
        success: function(html) {
            //console.log(html);
        },
    });
}

function accessDatabase(sql_query, type) {
    var queryString = "insert_query=" +  encodeURIComponent(sql_query) + "&type=" + type;
    $.ajax({
        type: "POST",
        url: "./js/ajaxjs.php",
        data: queryString,
        cache: false,
        success: function(html) {
            //console.log(html);

        },
    });


}

// Generates file needed for backend analysis
function updateDataBase(graph, timestamp){

    //Step 0: Get elements from graph.
    var all_elements = graph.getElements();
    var savedLinks = [];
    var savedConstraints = [];

    if (linkMode == "View"){
        savedConstraints = graph.intensionConstraints;
        var links = graph.getLinks();
        links.forEach(function(link){
            if(!isLinkInvalid(link)){
                if (link.attr('./display') != "none")
                    savedLinks.push(link);
            }
            //else{link.remove();}
        });
    }else if (linkMode == "Constraints"){
        savedLinks = graph.links;
        var betweenIntensionConstraints = graph.getLinks();
        betweenIntensionConstraints.forEach(function(link){
            var linkStatus = link.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
            if(!isLinkInvalid(link) && (linkStatus != "constraint") && (linkStatus != "error")){
                if (link.attr('./display') != "none")
                    savedConstraints.push(link);
            }
            //else{link.remove();}
        });
    }

    //Step 1: Filter out Actors
    var elements = [];
    var actors = [];
    for (var e1 = 0; e1 < all_elements.length; e1++){
        if (!(all_elements[e1] instanceof joint.shapes.basic.Actor)){
            elements.push(all_elements[e1]);
        }
        else{
            actors.push(all_elements[e1]);
        }
    }

    //save elements in global variable for slider, used for toBackEnd funciton only
    graph.allElements = elements;
    graph.elementsBeforeAnalysis = elements;

    //print each actor in the model
    for (var a = 0; a < actors.length; a++){
        var insert_query = "insert ignore into actors(session_id,id,name,action,timestamp) values " +
            "(\'"+ session_id +"\',\'"+actors[a].id +"\',\'"+ actors[a].attr(".name/text") +"\', \'EDIT\',\'"+
            timestamp + "\')";
        var read_query = "select * from (select * from actors where id=\'" + actors[a].id +
            "\' order by timestamp DESC limit 1) as temp where name=\'" +
            actors[a].attr(".name/text") + "\'";
        accessDatabaseWithRead(insert_query, read_query, 0);
        accessDatabase("UPDATE ignore actors SET action=\'CREATE\' WHERE id=" + "\'" + actors[a].id + "\' ORDER BY timestamp ASC LIMIT 1",1);
    }


    // Step 2: Print each element in the model

    // conversion between values used in Element Inspector with values used in backend
    var satValueDict = {
        "unknown": 5,
        "satisfied": 3,
        "partiallysatisfied": 2,
        "partiallydenied": 1,
        "denied": 0,
        "conflict": 4,
        "none": 6
    }
    for (var e = 0; e < elements.length; e++){

        var actorid = '-';

        if (elements[e].get("parent")){
            actorid = elements[e].get("parent");
        }

        var type;
        if (elements[e] instanceof joint.shapes.basic.Goal)
            type = "G";
        else if (elements[e] instanceof joint.shapes.basic.Task)
            type = "T";
        else if (elements[e] instanceof joint.shapes.basic.Softgoal)
            type = "S";
        else if (elements[e] instanceof joint.shapes.basic.Resource)
            type = "R";
        else
            type = "I";

        var v = elements[e].attr(".satvalue/value")

        // treat satvalue as unknown if it is not yet defined
        if((!v) || (v == "none"))
            v = "none";
        var insert_query = "insert ignore into intentions(session_id, id, actor_id,type,satValue,text,action,timestamp) values " +
            "(\'"+ session_id +"\',\'"+elements[e].id +"\',\'"+ actorid + "\',\'" + type + "\',\'" + satValueDict[v] + "\',\'" +  elements[e].attr(".name/text").replace(/\n/g, " ") + "\', \'EDIT\',\'"+
            timestamp + "\')";
        var read_query = "select * from (select * from intentions where id=\'" + elements[e].id + "\' order by timestamp DESC limit 1) as temp where actor_id=\'"
            + actorid + "\' and type=\'" + type + "\' and satValue=\'" + satValueDict[v] + "\' and text=\'" + elements[e].attr(".name/text").replace(/\n/g, " ") + "\'";
        accessDatabaseWithRead(insert_query, read_query, 0);
        accessDatabase("UPDATE intentions SET action=\'CREATE\' WHERE id=" + "\'" + elements[e].id + "\' ORDER BY timestamp ASC LIMIT 1",1);

    }


    //Step 3: Print each link in the model
    for (var l = 0; l < savedLinks.length; l++){
        var current = savedLinks[l];
        var relationship = current.label(0).attrs.text.text.toUpperCase();

        if (relationship.indexOf("|") > -1){
            evolvRelationships = relationship.replace(/\s/g, '').split("|");

            var insert_query = "insert ignore into links(session_id, id, type,source_id,target_id,evolvRelationships,action,timestamp) values " +
                "(\'"+ session_id +"\',\'"+current.id +"\',\'"+ evolvRelationships[0] + "\',\'" + current.get("source").id + "\',\'" + current.get("target").id + "\',\'" +  evolvRelationships[1] + "\', \'EDIT\',\'"+
                timestamp + "\') ";
            var read_query = "select * from (select * from links where id=\'" + current.id+ "\' order by timestamp DESC limit 1) as temp where type=\'"
                + evolvRelationships[0] + "\' and source_id=\'" + current.get("source").id + "\' and target_id=\'" + current.get("target").id + "\' and evolvRelationships=\'" + evolvRelationships[1] + "\'";
            accessDatabaseWithRead(insert_query, read_query, 0);

        }else{
            var insert_query = "insert ignore into links(session_id,id,type,source_id,target_id,action,timestamp) values " +
                "(\'"+ session_id +"\',\'"+current.id +"\',\'"+ relationship + "\',\'" + current.get("source").id + "\',\'" + current.get("target").id  + "\', \'EDIT\',\'"+
                timestamp + "\')";
            var read_query = "select * from (select * from links where id=\'" + current.id + "\' order by timestamp DESC limit 1) as temp where type=\'"
                + relationship + "\' and source_id=\'" + current.get("source").id + "\' and target_id=\'" + current.get("target").id + "\' and evolvRelationships is NULL";
            accessDatabaseWithRead(insert_query, read_query, 0);
        }
        accessDatabase("UPDATE links SET action=\'CREATE\' WHERE id=" + "\'" + current.id + "\' ORDER BY timestamp ASC LIMIT 1",1);

    }

    //Step 4: Print the dynamics of the intentions.
    for (var e = 0; e < elements.length; e++){

        var f = elements[e].attr(".funcvalue/text");
        var init_value = elements[e].attr(".constraints/markedvalue");
        var funcType = elements[e].attr(".constraints/function");
        var funcTypeVal = elements[e].attr(".constraints/lastval");
        var sat_value;
        var function_string;
        if  (f == " " || f == ""){
            f = "NT";
            sat_value = satValueDict[funcTypeVal];
        }else if (f != "UD"){
            sat_value = satValueDict[funcTypeVal];

            // user defined constraints
        }else{
            var begin = elements[e].attr(".constraints/beginLetter");
            var end = elements[e].attr(".constraints/endLetter");
            var rBegin = elements[e].attr(".constraints/beginRepeat");
            var rEnd = elements[e].attr(".constraints/endRepeat");
            function_string = "";
            sat_value = String(funcTypeVal.length);
            for (var l = 0; l < funcTypeVal.length; l++){
                if(l == funcTypeVal.length - 1){
                    function_string += "\t" + begin[l] + "\t1\t" + funcType[l] + "\t" + satValueDict[funcTypeVal[l]];
                }else{
                    function_string += "\t" + begin[l] + "\t" + end[l] + "\t" + funcType[l] + "\t" + satValueDict[funcTypeVal[l]];
                }
            }

            // repeating
            if (elements[e].attr(".constraints/beginRepeat") && elements[e].attr(".constraints/endRepeat")){
                // to infinity
                if (rEnd == end[end.length - 1]){
                    function_string += "\tR\t" + rBegin + "\t1";
                }else{
                    function_string += "\tR\t" + rBegin + "\t" + rEnd;
                }
            }else{
                function_string += "\tN";
            }

        }
        if (( typeof init_value !== 'undefined' ) && ( typeof sat_value !== 'undefined' )){
            var insert_query;
            var read_query;
            if (typeof(function_string) !== 'undefined'){
                insert_query = "insert ignore into dynamics(session_id,intention_id,function_type,init_value,sat_value,function_string,action,timestamp) values " +
                    "(\'"+ session_id +"\',\'"+elements[e].id +"\',\'"+ f + "\',\'" + init_value + "\',\'" + sat_value + "\',\'" + function_string  + "\', \'EDIT\',\'"+
                    timestamp + "\') ";
                read_query = "select * from (select * from dynamics where intention_id=\'" + elements[e].id + "\' order by timestamp DESC limit 1) as temp where function_type=\'"
                    + f + "\' and init_value=\'" + init_value + "\' and sat_value=\'" + sat_value + "\' and function_string=\'" + function_string + "\'";

            } else{
                insert_query = "insert ignore into dynamics(session_id,intention_id,function_type,init_value,sat_value,function_string,action,timestamp) values " +
                    "(\'"+ session_id +"\',\'"+elements[e].id +"\',\'"+ f + "\',\'" + init_value + "\',\'" + sat_value + "\',\'NULL\', \'EDIT\',\'"+
                    timestamp + "\') ";
                read_query = "select * from (select * from dynamics where intention_id=\'" + elements[e].id + "\' order by timestamp DESC limit 1) as temp where function_type=\'"
                    + f + "\' and init_value=\'" + init_value + "\' and sat_value=\'" + sat_value + "\' and function_string=\'NULL\'";
            }
            accessDatabaseWithRead(insert_query, read_query, 0);
            accessDatabase("UPDATE dynamics SET action=\'CREATE\' WHERE intention_id=" + "\'" + elements[e].id + "\' ORDER BY timestamp ASC LIMIT 1",1);

        }
    }

    //Step 5: Print constraints between intensions.
    for (var e = 0; e < savedConstraints.length; e++){
        var c = savedConstraints[e];
        var type = c.attributes.labels[0].attrs.text.text.replace(/\s/g, '');
        var source = c.getSourceElement().id;
        var target = c.getTargetElement().id;
        var sourceVar = c.attr('.constraintvar/src');
        var targetVar = c.attr('.constraintvar/tar');

        var insert_query = "insert ignore into constraints(session_id,type,source,sourceVar,target,targetVar,action,timestamp) values " +
            "(\'"+ session_id +"\',\'"+type +"\',\'"+ source + "\',\'" + sourceVar + "\',\'" + target + "\',\'" + targetVar  + "\', \'EDIT\',\'"+
            timestamp + "\') ";
        var read_query = "select * from (select * from constraints where session_id=\'" + session_id + "\' and source=\'" + source+ "\' and target=\'" + target +"\' order by timestamp DESC limit 1) as temp where sourceVar=\'"
            + sourceVar + "\' and targetVar=\'" + targetVar + "\'";
        accessDatabaseWithRead(insert_query, read_query, 0);

        accessDatabase("UPDATE constraints SET action=\'CREATE\' WHERE session_id=\'" + session_id + "\' and source=\'" + source+ "\' and target=\'" + target +"\'  ORDER BY timestamp ASC LIMIT 1",1);
    }

}

// Auto-save the cookie whenever the graph is changed.
graph.on("change", function(){
	var graphtext = JSON.stringify(graph.toJSON());
	document.cookie = "graph=" + graphtext;
    if (Tracking){
    	console.log("User Tracking - Recorded");
        var timestamp = new Date().toUTCString();
        updateDataBase(graph, timestamp);
        accessDatabase("insert ignore into graphs(session_id,content,timestamp) values " +
            "(\'"+ session_id +"\',\'"+graphtext +"\',\'"+ timestamp + "\') ",1);

    }
});

var selection = new Backbone.Collection();

var selectionView = new joint.ui.SelectionView({
	paper: paper,
	graph: graph,
	model: selection
});

/**
 * Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
 * Otherwise, initiate paper pan.
 */
paper.on('blank:pointerdown', function(evt, x, y) {
	paperScroller.startPanning(evt, x, y);
});

/**
 * 
 */
paper.on('cell:pointerdown', function(cellView, evt, x, y) {
	
	if(mode == "Analysis"){
		return;
	}

	var cell = cellView.model;
	if (cell instanceof joint.dia.Link){
		cell.reparent();
	}

	// Unembed cell so you can move it out of actor
	if (cell.get('parent') && !(cell instanceof joint.dia.Link)) {
		graph.getCell(cell.get('parent')).unembed(cell);
	}
});

// Unhighlight everything when blank is being clicked
paper.on('blank:pointerclick', function(){
	removeHighlight();
});

// Link equivalent of the element editor
paper.on("link:options", function(cell, evt){
	if(mode == "Analysis") {
		return;
	}

	clearInspector();
	linkInspector.render(cell.model);

});

/**
 * Check the relationship in the link. If the relationship is between
 * an Actor and anything other than an Actor then display the label as
 * "error". Otherwise, display it as "is-a" and prop "is-a" in the link-type
 * dropdown menu.
 *
 * @param {joint.dia.Link} link
 */
function basicActorLink(link){
    if (link.getSourceElement() != null) {
        var sourceCell = link.getSourceElement().attributes.type;

    }
    // Check if link is valid or not
    if (link.getTargetElement()) {
        var targetCell = link.getTargetElement().attributes.type;

        // Links of actors must be paired with other actors
        if (((sourceCell == "basic.Actor") && (targetCell != "basic.Actor")) ||
            ((sourceCell != "basic.Actor") && (targetCell == "basic.Actor"))) {
            link.label(0, {position: 0.5, attrs: {text: {text: 'error'}}});
        } else if ((sourceCell == "basic.Actor") && (targetCell == "basic.Actor")) {
            if (!link.prop("link-type")) {
                link.label(0 ,{position: 0.5, attrs: {text: {text: 'is-a'}}});
                link.prop("link-type", "is-a");
            } else {
                link.label(0, {position: 0.5, attrs: {text: {text: link.prop("link-type")}}});
            }
        }
    }
}


/**
 * Create a halo around the element that was just created
 *
 * @param {joint.shapes} cellView
 * @returns {joint.ui.Halo} halo
 */
function createHalo(cellView){
	// var halo = new joint.ui.Halo({
 //        graph: graph,
 //        paper: paper,
 //        cellView: cellView,
 //    });

    var halo = new joint.ui.Halo({
    	type: 'toolbar',
    	boxContent: false,
        cellView: cellView
    });

    halo.removeHandle('unlink');
    halo.removeHandle('clone');
    halo.removeHandle('fork');
    halo.removeHandle('rotate');


    halo.on('action:resize:pointermove', function(cell) {
    	cellView.unhighlight();
		cellView.highlight();
    });

    halo.render();
    return halo;
}

/**
 * Remove the highlight around all elements
 *
 * @param  {Array.<joint.dia.shapes>} elements
 */
function removeHighlight(){
	var cell;
	var elements = graph.getElements();
    // Unhighlight everything
    for (var i = 0; i < elements.length; i++) {
        cell = elements[i].findView(paper);
        cell.unhighlight();
    }
}

/**
 * Function for single click on cell
 * 
 */
paper.on('cell:pointerup', function(cellView, evt) {
	if(mode == "Modelling") {
        // Link
        if (cellView.model instanceof joint.dia.Link) {
            var link = cellView.model;
            basicActorLink(link);
            // Element is selected
        } else {

            selection.reset();
            selection.add(cellView.model);

            // Remove highlight of other elements
            removeHighlight();

            // Highlight when cell is clicked
            cellView.highlight();

            currentHalo = createHalo(cellView);

            embedBasicActor(cellView.model);

            clearInspector();

            if (cellView.model instanceof joint.shapes.basic.Actor) {
            	actorInspector.render(cellView.model);
			} else {
                elementInspector.render(cellView.model);
			}

        }
    }
});

/**
 * Embeds an element into an actor boundary
 *
 * @param {joint.dia.cell} cell
 */
function embedBasicActor(cell) {
	if (!(cell instanceof joint.shapes.basic.Actor)) {
		var ActorsBelow = paper.findViewsFromPoint(cell.getBBox().center());

		if (ActorsBelow.length) {
			for (var i = 0; i < ActorsBelow.length; i++) {
				var actorCell = ActorsBelow[i].model;
				if (actorCell instanceof joint.shapes.basic.Actor) {
					actorCell.embed(cell);
					var nodeID = cell.attributes.nodeID;
					var actorID = actorCell.attributes.nodeID
					model.getIntentionByID(nodeID).nodeActorID = actorID;
					model.getActorByID(actorID).intentionIDs.push(nodeID);
				}
			}
		}
	}

}


graph.on('change:size', function(cell, size) {
	cell.attr(".label/cx", 0.25 * size.width);

	// Calculate point on actor boundary for label (to always remain on boundary)
	var b = size.height;
	var c = -(size.height/2 + (size.height/2) * (size.height/2) * (1 - (-0.75 * size.width/2) * (-0.75 * size.width/2)  / ((size.width/2) * (size.width/2)) ));
	var y_cord = (-b + Math.sqrt(b*b - 4*c)) / 2;

	cell.attr(".label/cy", y_cord);
});


graph.on('remove', function(cell) {
    //TODO: What I have changed
    if(cell.isLink() && !(cell.prop("link-type") == 'NBT' || cell.prop("link-type") == 'NBD')){
        //To remove link
        var link = cell;
        clearInspector();
        model.removeLink(link.linkID);
    }

    else if((!cell.isLink()) && (!(cell["attributes"]["type"]=="basic.Actor"))){
        //To remove intentions
        clearInspector();
        var userIntention = model.getIntentionByID(cell.attributes.nodeID);
        // remove this intention from the model
        //model.removeIntention(userIntention.nodeID);
        model.removedynamicFunction(userIntention.nodeID);
        model.removeIntentionLinks(userIntention.nodeID);
        // remove all intention evaluations associated with this intention
        analysisRequest.removeIntention(userIntention.nodeID);
        // if this intention has an actor, remove this intention's ID
        // from the actor
        if (userIntention.nodeActorID !== '-') {
            var actor = model.getActorByID(userIntention.nodeActorID);
            actor.removeIntentionID(userIntention.nodeID,analysisRequest.userAssignmentsList);
        }
        model.removeIntention(userIntention.nodeID);
       
    }
    else if((!cell.isLink()) && (cell["attributes"]["type"]=="basic.Actor")){
        //To remove actor
        model.removeActor(cell['attributes']['nodeID']);


    }
    

    //TODO: What I have changed finished
	else if (cell.isLink() && (cell.prop("link-type") == 'NBT' || cell.prop("link-type") == 'NBD')) {
		// Verify if is a Not both type. If it is remove labels from source and target node
		var link = cell;
		var source = link.prop("source");
		var target = link.prop("target");
		var sourceId;
		var targetId;

	    for (var i = 0; i < graph.getElements().length; i++ ) {
			if (graph.getElements()[i].prop("id") == source["id"]) {
				 source = graph.getElements()[i];
		   	}
		  	if (graph.getElements()[i].prop("id") == target["id"]) {
			   target = graph.getElements()[i];
		   	}
	   	}

		//Verify if it is possible to remove the NB tag from source and target
		if (source !== null && !checkForMultipleNB(source)) {
			source.attrs(".funcvalue/text", "");
		}
		if (target !== null && !checkForMultipleNB(target)) {
			target.attrs(".funcvalue/text", "");
		}
	}
});


/**
 * Clear the .inspector div
 */
function clearInspector() {
	elementInspector.clear();
	linkInspector.clear();
	analysisInspector.clear();
	actorInspector.clear();
}


/**
 * Returns true iff node has 1 or more NBT or NBD relationship
 *
 * @param {joint.dia.element} node
 * @returns {Boolean}
 */
function checkForMultipleNB(node) {
	var num = 0;
	var localLinks = graph.getLinks();

	for (var i = 0; i < localLinks.length; i++){
        if (localLinks[i].prop("link-type")   == 'NBT' || localLinks[i].prop("link-type") == 'NBD'){
            if (localLinks[i].getSourceElement().prop("id") == node["id"] || localLinks[i].getTargetElement().prop("id") == node["id"]){
                num += 1;            
            }
        }
	}

	return num >= 1;
}

