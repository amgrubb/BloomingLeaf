utils = require("./utils.js");
var currentId = 0;
var messages = [];

// process the first request from the client
function processInit(res) {
    var answer = {};
    // add an empty array in messages to messages to be sent to the client when it polls
    messages[currentId] = [];
    // send back clientID to the client for future communications
    // increment client - in preperation to init request from the next client  
    answer.id = currentId++; 
    utils.sendJSONObj(res,200,answer);
}

// process the first poll request from the client
// client periodically send this request to request
// messages stored for it on the server
function processPoll(query,res) {
    var answer = {};  // initialize the answer object that will be send back
    // use the client ID to retriece the client messages and store them
    // in answer
    answer.data = messages[query.id];
    // send answer back 
    utils.sendJSONObj(res,200,answer);
    // clear the messages that were sent - so they don't get resent with next poll
    messages[query.id] = [];
}

// process text request. This request is sent when the client is sending
// a text message the user entered in the chat.
function processText(query,res) {
    // prepare the object to be pushed in messages
    var msgObj = {};
    msgObj.sender = query.id;
    msgObj.message = query.message;
    // for every client registered with the server
    for (client in messages) {
        if (client != query.id) { // except for the client that sent the message
            messages[client].push(msgObj);  // store the message and its sender
        }
    }
    res.writeHead(200);  // nothing to send back except success status
    res.end();
}

// the only method to be exported
exports.processQuery = function(query,res) {
// check request and process quert accordingly 
    if (query.request == 'init') 
        processInit(res);
    if (query.request == 'text') 
        processText(query,res);
    if (query.request == 'poll') 
        processPoll(query,res);
}

