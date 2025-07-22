# BloomingLeaf Setup Guide

BloomingLeaf can either be hosted (A) locally as a Node.js server or (B) online as an Express application. Follow the instructions below and carefully observe the differences. 

## (A) Local Setup (Recommended)

This section explains how to run the tool using a Node.js server.

1. Complete the initial setup.

	1. Clone / Download a copy of the [repository](https://github.com/amgrubb/BloomingLeaf). 
	2. You also need a copy of [Rappid](https://www.jointjs.com/), which we use as the basis for our tool. We are currently using Rappid Academic Version 2.3.1. A more recent version of Rappid will not work with BloomingLeaf. Put the Rappid library inplace of the `../BloomingLeaf/leaf-ui/rappid/` folder.
	3. Install the most recent Java JDK. Currently we are using OpenJDK 11 (OpenJ9)

2. Install the node server

	Download nodeJS from https://nodejs.org/en/download/ and run the installer appropriate for your operating system (most recently tested with `v22.15.0`). 
	
	To check the Node.js installation: Open a terminal window (Mac) or a command prompt window by running `cmd` (Windows).
	In the terminal/cmd window, type: 

	`node --version`
	
	A message (similar to the following) telling you the version number should appear.
	
	C:\Users\XXXX>node --version
	v10.15.0


3. Run Node Server

	a) You need to add the analysis file to the correct folder and set the absolute path of your local machine, to connect the analysis in BloomingLeaf.
	
	1. Open `../BloomingLeaf/app.js`. Update `line 6` to be the absolute path to the folder BloomingLeaf.
	
	2. The analysis is run via a java .jar file called `Blooming.jar`. Ensure that this file is located at the path `../BloomingLeaf/leaf-analysis/bin/.`.
	
	3. Ensure that the folder `../BloomingLeaf/leaf-analysis/temp` exists. This is where the `default.json` and 	       `output.out` files are written.  
	

	b) In terminal (or cmd on Windows) type the following command: 
	
	1. `cd` to the folder `../BloomingLeaf/.` (path of the directory containing `app.js`). This step is required, the tool will not work if Step 2 is executed outside the root BloomingLeaf folder.
	
	2. Type `node app.js` in terminal.
	
	3. If the server is running locally, open Chrome, and type `http://localhost:8080/index.html`.   
	
	4. To close app.js, press `control^ C` 


## (B) Online Setup

This section explains how to run the tool as an Express application. 
We are currently running BloomingLeaf on `Ubuntu 24.04.2 LTS (GNU/Linux 6.8.0-63-generic x86_64)` and assume a Debian-based distribution in these instructions. Complete the following step on the server you wish to use. It is recommended that you have `sudo` permissions on the server.

1. Install `git`.  
 `sudo apt install git-all`

2. Clone / Download a copy of the [repository](https://github.com/amgrubb/BloomingLeaf). You must use at least version 2.7 to host BloomingLeaf online.  
`git clone https://github.com/amgrubb/BloomingLeaf.git`

3. You also need a copy of [Rappid](https://www.jointjs.com/), which we use as the basis for our tool. We are currently using Rappid Academic Version 2.3.1. A more recent version of Rappid will not work with BloomingLeaf. Put the Rappid library inplace of the `../BloomingLeaf/leaf-ui/rappid/` folder.

4. Install Java.  
`sudo apt install openjdk-11-jre-headless`  

5. Check to make sure the backend runs (assumes valid `../BloomingLeaf/leaf-analysis/temp/default.json` file).  
`cd leaf-analysis`  
`java -jar <your path>/BloomingLeaf/leaf-analysis/bin/Blooming.jar`

6. Install the node package manager `npm`.  
`sudo apt install npm`

7. Set up initial express applicaiton. _You may want to make a backup of `index.js` before starting this step as it my be overwritten._  
Navigate to the root project directory `../BloomingLeaf/.` (path of the directory containing `index.js`). Run the following commands:  
	`npm init --y`  (Creates a default project.)  
	`npm install express`.  (Adds express.)  
If `index.js` was overwritten, compare and put back the correct contents.

8. Create and update the SSL certificate. This step is tricky and you may need your system administrator to help you. We recommend reviewing these two resources ([OpenSSL](https://docs.openiam.com/docs-4.2.1.3/appendix/2-openssl), [Node.js Certs](https://dev.to/devland/how-to-generate-and-use-an-ssl-certificate-in-nodejs-2996)).   
Once you have created the certifications, you need to update `index.js` with the correct information. Update `host` with the correct address and `port` with the server port you are hosting on (we assume port `8080`). Update the absolute path to the key/certificate files for `key`, `ca`, and `cert`. We show examples for a fake server called `gru`. In `index.js` update the following lines (approximately lines 9 through 17):  
	```
	const host = '0.0.0.0';
	const port = 8080;

	const child_process = require('node:child_process');

	const options = {
	key: fs.readFileSync('/etc/ssl/gru.key'),
	ca: fs.readFileSync('/etc/ssl/ca.crt'),
	cert: fs.readFileSync('/etc/ssl/certs/gru_smith_edu.pem'),
	}
	``` 

9. Start the server.   
`npm start`  
which should show the output:
	```
	> bloomingleaf@1.0.0 start
	> node index.js
	```
	Open Chrome, and type `https://<insert server name>:<insert port>/`. For example, for our fake server `gru`, we navigate to: `https://gru.smith.edu:8080/`.  
	To stop the server, press `control^ C` in your terminal.

## Additional Information

The server is run either through `app.js` or `index.js`. These files are very similar and contain most of the code for the server. It creates the server and listen to the port 8080. It handles incoming requests (GET and POST request). When the post request gets called, it execute the `Blooming.jar` file, and write the result to the response.

The server uses three additional files: `backendComm.js`, `fileServer.js`, and `index.html`. 

1. `../BloomingLeaf/leaf-ui/index.html` contains code that displays the blooming leaf website. 
2. `../BloomingLeaf/leaf-ui/js/backendComm.js` creates the XMLHttpRequest that sends a POST request with the 	    data. It gets the response from the server and sends it to the client. 
3. `../BloomingLeaf/leaf-analysis/node/fileServer.js` contains code that takes in the relative path of the html file and then hands the user the html file that is stored in that path. 