//File name: app.js
//Description: the entry point to the chat app server
//Last updated: 4/28/2019

// Name of .jar file for BloomingLeaf project must be Blooming.jar
//var userPath = "/Users/<your user path here>/BloomingLeaf"
var userPath = "/Users/irene/Desktop/BloomingLeaf"

var http = require('http'),
    url = require('url'),
    fileServer = require('./node/fileServer.js'),
    fs = require('fs');
    qs = require('./node/query.js'),
    utils = require('./node/utils.js');
    exec = require('child_process').exec;

//TODO: If wait is not longer needed, this function can be removed.
function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

function processGet(path,queryObj,res) {
    // if URL includes a path to a file, call file server method
    if (path && path.length > 1) {
        // precede the given path with name of the subdirectory in which
        // the client files are stored

        fileServer.serve_static_file(userPath+"/leaf-ui"+path,res);
    } 
    // check if there is a query. The query object will always be created
    // even if there is no quesry string. So check using a property that you
    // know will be part of any query sent by the client. This is application 
    // specific - depends on our knowledge of what the client will serve
    // alternatively - you can check if (url.parse(req.url).search) 
    // search is the query string
    /*else if (queryObj.request) {
        qs.processQuery(queryObj,res);
    } else {
        // if not file path or query were sent - read and serve default html file
        fileServer.serve_static_file("public_html/index.html",res);
        fileServed = true;
    }*/

}

function processPost(queryObj,req,res) {
    var body = '';
    req.on('data', data => {body += data;}); // get the request data
    req.on('end', () => {          // request fully received - process it
        if (body || queryObj.name) { 
            queryObj.message = body; // specific to the chat application
            qs.processQuery(queryObj,res);
        }
    fs.writeFileSync(userPath+"/leaf-analysis/temp/default.json",body);
    passIntoJar(res);

    // //TODO: Can this function be written in an asynchronous call?
    // wait(1000);         
    
    // //TODO: Can this be made asynchronous by moving the follow code down to to "HERE"
    // //read from output.out and pass the data as a string with the response 
    // analysisFile = fs.readFileSync(userPath+"/leaf-analysis/temp/output.out");
    // analysisFileString = String(analysisFile);
    // res.writeHead(200, { "Content-Type" : 'text/plain'});
    // // send data
    // res.write(analysisFileString);
    // res.end();
    });
    
}


// server call back function
function handle_incoming_request(req, res) {
    // get the path of the file to served
    var path = url.parse(req.url).pathname;
    // get a query (true makes sure the query string is parsed into an object)
    var queryObj = url.parse(req.url,"true").query;
    if (req.method.toLowerCase() == "get") 
        processGet(path,queryObj,res);
    else if (req.method.toLowerCase() == "post") 
        processPost(queryObj,req,res);
    else
        utils.sendText(res,400,"Server accepts only GET ans POST requests");  
}

/*
*This function executed the jar file 
*/
function passIntoJar(res) {
    child = exec('java -jar '+userPath+'/leaf-analysis/bin/Blooming.jar ',
        function (error, stdout, stderr){
            if(error !== null){
                console.log('exec error: ' + error);
            }
            else{
                //Analysis return code.
                analysisFile = fs.readFileSync(userPath+"/leaf-analysis/temp/output.out");
                analysisFileString = String(analysisFile);
                res.writeHead(200, { "Content-Type" : 'text/plain'});
                // send data
                res.write(analysisFileString);
                res.end();
            
                return stdout;
            }
        });
    return child;
}

var server = http.createServer(handle_incoming_request);

server.listen(8080);