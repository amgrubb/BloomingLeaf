# Node Server Read Me

This file explains how to run the tool using a Node.js server.

## Project Setup
1. Install the node server
Download nodeJS from https://nodejs.org/en/download/ and run the installer appropriate for your operating system. 
Check the Node.js installation. Open a terminal window on Mac or a command prompt window on Windows(by running cmd). In the terminal/cmd window, type: 
	node --version
The following message should be seen: 
C:\Users\XXXX>node --version
v10.15.0


2. Run Node Server
Navigate to your leaf-analysis folder.
.jar file goes in folder called bin.
On line 6, update use path to be the folder BloomingLeaf.
Note: The .jar file must be named `Blooming.jar’ and be at the path BloomingLeaf/leaf-analysis/bin
 
 
On the server side, the leaf-analysis folder should be structured in the following way: 

In terminal (or cmd on Windows) type the following command: 
cd  (path of the directory containing both app.js and temp folder)
node app.js
If the server is running locally, open Chrome, and type http://localhost:8080/index.html; (Lucy: What is this??) otherwise, type http://(server address):8080/index.html;
To close app.js, press control^ C 



3. How it Works  

The node server is consistent of four files: app.js, backendComm.js, fileServer.js, and index.html. 

 index.html This file is in life-ui, and it contains code that displays the blooming leaf website. 
 backendComm.js This file is in leaf-ui/js and it creates the XMLHttpRequest that sends the post request with the data. It gets the response from the server and sends it to the client. 
 fileServer.js This file contains code that takes in the relative path of the html file and then hand the user the html file that is stored in that path. 
 app.js This file is in leaf-analysis folder. This file contains most of the code for the server. It creates the server and listen to the port 8080. It handles incoming requests, GET and POST request. When the post request gets called, it execute the jar file, and write the result to the response. 




Thanks again for your contributions to BloomingLeaf.
