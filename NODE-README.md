# Node Server Read Me

This file explains how to run the tool using a Node.js server.

## Project Setup
1. Set up the project according to the contribution guide (including acquiring Rappid).

2. Install the node server

	Download nodeJS from https://nodejs.org/en/download/ and run the installer appropriate for your operating system. 
	
	To check the Node.js installation: Open a terminal window (Mac) or a command prompt window by running `cmd` (Windows).
	In the terminal/cmd window, type: 

	`node --version`
	
	A message (similar to the following) telling you the version number should appear.
	
	C:\Users\XXXX>node --version
	v10.15.0


3. Run Node Server

	a) You need to add the analysis file to the correct folder and set the absolute path of your local machine, to connect the analysis in BloomingLeaf.
	
	1. Open `../BloomingLeaf/leaf-analysis/app.js`. Update `line 6` to be the absolute path to the folder BloomingLeaf.
	
	2. The analysis is run via a java .jar file called `Blooming.jar`. Ensure that this file is located at the path `../BloomingLeaf/leaf-analysis/bin/.`.
	
	3. Ensure that the folder `../BloomingLeaf/leaf-analysis/temp` exists. This is where the `default.json` and 	       `output.out` files are written.  
	

	b) In terminal (or cmd on Windows) type the following command: 
	
	1. `cd` to the folder `../BloomingLeaf/leaf-analysis/.` (path of the directory containing both app.js and temp folder).
	
	2. Type `node app.js` in terminal.
	
	3. If the server is running locally, open Chrome, and type `http://localhost:8080/index.html`. _(Note: If it is not run locally, then type `http://(IP address of the server):8080/index.html`.)_   
	
	4. To close app.js, press `control^ C` 



4. How the Node Server Works  

	The node server is consistent of four files: `app.js`, `backendComm.js`, `fileServer.js`, and `index.html`. 

 	1. `../BloomingLeaf/leaf-ui/index.html` contains code that displays the blooming leaf website. 
	
 	2. `../BloomingLeaf/leaf-ui/js/backendComm.js` creates the XMLHttpRequest that sends a POST request with the 	    data. It gets the response from the server and sends it to the client. 
	
 	3. `../BloomingLeaf/leaf-analysis/node/fileServer.js` contains code that takes in the relative path of the html file and then hands the user the html file that is stored in that path. 
	
 	4. `../BloomingLeaf/leaf-analysis/app.js` contains most of the code for the server. It creates the server and listen to the port 8080. It handles incoming requests (GET and POST request). When the post request gets called, it execute the `Blooming.jar` file, and write the result to the response. 

Thanks again for your contributions to BloomingLeaf.
