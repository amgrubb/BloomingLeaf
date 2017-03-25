#!/usr/bin/python

import sys, json
import cgi, cgitb
cgitb.enable()

def executeCGI():

	#Object to be sent back to frontend
	result = {}
	result['success'] = True
	result['message'] = "This is a response from server"
	result['data'] = {}
	
	#Receive and process JSON into a file so backend app can be executed
	myjson = json.load(sys.stdin)
	#(!)THE FILE NAME SHOULD CHANGE EVERY EXECUTION
	filePath = 'temp/default.json'
	jsonToFile(myjson, filePath)

	#call JAVA app        
    os.system("/u/marcel/java/jre1.8.0_66/bin/java -jar /u/marcel/bin/marcel.jar")    
        
	#Addind the data to result from a json file
	#(!)THE FILE OUTPUT SHOULD CHANGE EVERY EXECUTION
	processedFilePath = 'temp/output.out'
	fillResultData(result, processedFilePath)

	#Send data back to frontend
	sendToFrontEnd(result)

	return

#Receive as parameter a JSON and the path to create a file with the json
def jsonToFile(myjson, filePath):

	with open(filePath, 'w') as f:
		f.write(json.dumps(myjson, sort_keys = True, indent=4))

	return 

#Receive as parameter the result to be sent to frontend and gets a json from a file to add into the result['data'] attribute
def fillResultData(result, processedFilePath):

	with open(processedFilePath) as data:
		result['data'] = data.readlines()

	return

#Receives as parameter the object to be sent to frontend and builds the response for the request
def sendToFrontEnd(result):

	#Sending message back to frontend as Json
	print 'Content-Type: application/json\n\n'
	print json.dumps(result)

	return

executeCGI()

