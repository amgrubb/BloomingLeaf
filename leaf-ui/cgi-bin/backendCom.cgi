#!/usr/bin/python

import sys, json
import cgi, cgitb
cgitb.enable()

def executeCGI():

	#Object to be sent back to frontend
	result = {}
	result['success'] = True
	result['message'] = "This is a response from server"
	
	#Receive and process JSON into a file so backend app can be executed
	myjson = json.load(sys.stdin)
	#(!)THE FILE NAME SHOULD CHANGE EVERY EXECUTION
	filePath = 'temp/default.json'
	jsonToFile(myjson, filePath)

	#call JAVA app        
    #os.system("/u/marcel/java/jre1.8.0_66/bin/java -jar /u/marcel/bin/marcel.jar")    
    
 	print 'Content-Type: application/json\n\n'
	print json.dumps(result)
	
	return

#Receive as parameter a JSON and the path to create a file with the json
def jsonToFile(myjson, filePath):

	with open(filePath, 'w') as f:
		f.write(json.dumps(myjson, sort_keys = True, indent=4))

	return 

executeCGI()

