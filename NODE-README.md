# Node Server Read Me

This file explains how to run the tool using a Node.js server.

## Project Setup
1. Install the node server

	To download nodeJS from https://nodejs.org/en/download/ and run the installer appropriate for your operating system. 
	
	To check the Node.js installation: Open a terminal window on Mac or a command prompt window on Windows(by running 	  cmd). In the terminal/cmd window, type: 
	node --version
	
	The following message should be seen: 
	
	C:\Users\XXXX>node --version
	v10.15.0


2. Run Node Server
	i) The leaf-analysis folder should be structured in the following way: 
	
	1. Place app.js file in the leaf-analysis folder. In the app.js file on line 6, update use path to be the absolte path 	       to the folder BloomingLeaf.
	
	2. There is a node file in leaf-analysis folder as while. That file contains three js files: fileServer.js, query.js  	      and utils.js.  
	
	3. There is a .jar file, and that file goes in folder called bin which is also in leaf-analysis folder. Note: The 	  .jar file must be named `Blooming.jar` and be at the path BloomingLeaf/leaf-analysis/bin.  
	
	4. There is one more folder in leaf-analysis, and it is called the temp. The temp folder is where the default.json and 	       output.out files are written.  
	

	ii) In terminal (or cmd on Windows) type the following command: 
	
	1. cd  in the leaf-analysis floder (path of the directory containing both app.js and temp folder)
	
	2. Type node app.js in terminal
	
	3. If the server is running locally, open Chrome, and type http://localhost:8080/index.html. 
	
	4. If it is not run locally, then type http://(IP address of the server):8080/index.html.   
	
	5. To close app.js, press control^ C 



3. How it Works  

	The node server is consistent of four files: app.js, backendComm.js, fileServer.js, and index.html. 

 	1. index.html This file is in life-ui, and it contains code that displays the blooming leaf website. 
	
 	2. backendComm.js This file is in leaf-ui/js and it creates the XMLHttpRequest that sends the post request with the 	    data. It gets the response from the server and sends it to the client. 
	
 	3. fileServer.js This file contains code that takes in the relative path of the html file and then hand the user the 	     html file that is stored in that path. 
	
 	4. app.js This file is in leaf-analysis folder. This file contains most of the code for the server. It creates the 	   server and listen to the port 8080. It handles incoming requests, GET and POST request. When the post request gets 		called, it execute the jar file, and write the result to the response. 




Thanks again for your contributions to BloomingLeaf.
