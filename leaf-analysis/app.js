//File name: app.js
//Description: the entry point to the chat app server
//Last updated: 4/28/2019

// Name of .jar file for BloomingLeaf project must be Blooming.jar
//var userPath = "/Users/<your user path here>/BloomingLeaf"
// var userPath = "/Users/judySmith/git/BloomingLeaf"
var userPath = "/Users/stardess/Desktop/BloomingLeaf"
// var userPath = "/Users/meganvarnum/GitHub/BloomingLeaf"


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
    
    obj = JSON.parse(body);

    if(obj.analysisRequest == "premerge") {
        var model1_json = JSON.stringify(obj.model1);
        var model2_json = JSON.stringify(obj.model2);

        fs.writeFileSync(userPath+"/leaf-analysis/temp/merge_model1.json",model1_json);
        fs.writeFileSync(userPath+"/leaf-analysis/temp/merge_model2.json",model2_json);

        passIntoPreMergeJar(res, obj.timingOffset);
    }
    if(obj.analysisRequest == "merge") {
        // Save timing file to temp
        var timing_json = JSON.stringify(obj.timing);
        fs.writeFileSync(userPath+"/leaf-analysis/temp/timing.json",timing_json);

        passIntoMergeJar(res);
    }
    else if(obj.analysisRequest == "layout") {
        var model_json = JSON.stringify(obj.model);
        fs.writeFileSync(userPath+"/leaf-analysis/temp/default.json",model_json);

        passIntoLayoutJar(res);
    }
    else {
        fs.writeFileSync(userPath+"/leaf-analysis/temp/default.json",body);
        passIntoJar(res);
    }
    
    // if(body.includes("{\"analysisRequest\":")) {
    //     passIntoJar(res);
    // }
    // else {
    //     passIntoLayoutJar(res);
    // }

    // console.log(queryObj.message.model1);



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

function passIntoLayoutJar(res) {
    child = exec('java -jar '+userPath+'/leaf-analysis/src/layout/Layout.jar ', {maxBuffer: 20480 * 20480} ,
        function (error, stdout, stderr){
            if(error !== null){
                console.log('exec error: ' + error);
            }
            else{
                analysisFile = fs.readFileSync(userPath+"/leaf-analysis/temp/default-output.json");
                analysisFileString = String(analysisFile);
                console.log(analysisFileString);

                res.writeHead(200, { "Content-Type" : 'text/plain'});
                res.write(analysisFileString);
                res.end();
            
                return stdout;
            }
        });
    return child;
}

function passIntoPreMergeJar(res, timingOffset) { 
    child = exec('java -jar '+userPath+'/leaf-analysis/src/premerge/PreMerge.jar '+'merge_model1.json merge_model2.json timing.json '+timingOffset, 
    {maxBuffer: 20480 * 20480} ,
        function (error, stdout, stderr){
            if(error !== null){
                console.log('exec error: ' + error);
            }
            else {
                analysisFile = fs.readFileSync(userPath+"/leaf-analysis/temp/timing.json");
                analysisFileString = String(analysisFile);
                console.log(analysisFileString);

                res.writeHead(200, { "Content-Type" : 'text/plain'});
                res.write(analysisFileString);
                res.end();
            
                return stdout;
                // passIntoMergeJar(res)
            }
        });
    return child;
}

function passIntoMergeJar(res) { // TODO
    child = exec('java -jar '+userPath+'/leaf-analysis/src/merge/Merge.jar '+'merge_model1.json merge_model2.json timing.json default.json', 
    {maxBuffer: 20480 * 20480} ,
        function (error, stdout, stderr){
            if(error !== null){
                console.log('exec error: ' + error);
            }
            else{               
                passIntoLayoutJar(res)
            }
        });
    return child;
}

var server = http.createServer(handle_incoming_request);

server.listen(8080);
