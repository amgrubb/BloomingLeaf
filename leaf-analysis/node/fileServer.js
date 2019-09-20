//File name: fileServer.js
//Description: a module to read and send file a static file
//Last updated: 4/7/2019


var fs = require('fs'),
    path = require('path'),
    utils = require('./utils');



// Exported function- reads a static file given its path and sends it to the client
// fileName: path of the requested resource (file)
// res : response object   
exports.serve_static_file = function (fileName, res) {
    // read the requested resouce           
    fs.readFile(fileName,function(err,data) { 
        // readFile call back function
        if (err) { // in case of error send back a 404 error and error object
            var out = { error: "not_found",message: "'" + fileName + "' not found" };
            utils.sendJSONObj(res,404,out);
            res.end();
        }
        else {
            // send success code 200 and Content-type based on file extension 
            var ct = content_type_for_path(fileName);
            res.writeHead(200, { "Content-Type" : ct });
            // send data
            res.write(data);
            res.end();
        }
    });
}

// a function that returns the Content-type based on file extension
function content_type_for_path (file) {
    var ext = path.extname(file);
    switch (ext.toLowerCase()) {
        case '.html': return "text/html";
        case ".js": return "text/javascript";
        case ".css": return 'text/css';
        case '.jpg': case '.jpeg': return 'image/jpeg';
        default: return 'text/plain';
    }
}


