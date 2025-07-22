const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const url = require('url');

const host = '0.0.0.0';
const port = 8080;

const child_process = require('node:child_process');

const options = {
  key: fs.readFileSync('/etc/ssl/gru.key'),
  ca: fs.readFileSync('/etc/ssl/ca.crt'),
  cert: fs.readFileSync('/etc/ssl/certs/gru_smith_edu.pem'),
}

const requestListener = function (req, res) {
  fs.readFile(__dirname + "/index.html")
    .then(contents => {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(contents);
    })
    .catch(err => {
      res.writeHead(500);
      res.end(err);
      return;
    });
};

app.use('/', express.static(path.join(__dirname, 'leaf-ui'), { index: 'index.html' }));

app.get('/{*any}', (req, res) => {
  const urlPath = req.path;

  if (urlPath && urlPath.length > 1) {
    fs.readFile(path.join(__dirname, 'leaf-ui', urlPath), function (err, data) {
      // readFile call back function
      if (err) { // in case of error send back a 404 error and error object
        var out = { error: "not_found", message: "'" + path.join(__dirname, 'leaf-ui', urlPath) + "' not found" };
        res.writeHead(404, { "Content-Type": "application/json" });
        console.log(JSON.stringify(out));
        res.write(JSON.stringify(out));
        res.end();
      }
      else {
        // send success code 200 and Content-type based on file extension 
        var ct = content_type_for_path(path.join(__dirname, 'leaf-ui', urlPath));
        res.writeHead(200, { "Content-Type": ct });
        res.write(data);
        res.end();
      }
    });
    return;
  }
});

var jsonParser = bodyParser.json()

app.post('/{*any}', jsonParser, (req, res) => {
  let body = req.body;

  var messages = [];
  var currentId = 0;
  let queryObj = req.query || {};
  if (body || queryObj.name) {
    queryObj.message = body;
  }
  fs.writeFileSync(path.join(__dirname, "leaf-analysis/temp/default.json"), JSON.stringify(body));
  passIntoJar(res);
});

function passIntoJar(res) {
  child = child_process.exec('java -jar ' + __dirname + '/leaf-analysis/bin/Blooming.jar ',
    function (error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      else {
        //Analysis return code.
        analysisFile = fs.readFileSync(__dirname + "/leaf-analysis/temp/output.out");
        analysisFileString = String(analysisFile);
        res.writeHead(200, { "Content-Type": 'text/plain' });
        res.write(analysisFileString);
        res.end();
        return stdout;
      }
    });
  return child;
}

const httpsServer = https.createServer(options, app);
httpsServer.listen(port, host);