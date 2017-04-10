#!/usr/bin/python

import sys, json
import cgi, cgitb
cgitb.enable()

def executeCGI():
   
   	result = {};
   	result['success'] = True
   	result['message'] = "This is a response from server"
   	result['data'] = ""
   	
	processedFilePath = 'temp/output.out'

	with open(processedFilePath) as data:
		result['data'] = data.read()

	#Send data back to frontend
	sendToFrontEnd(result)

	return

#Receives as parameter the object to be sent to frontend and builds the response for the request
def sendToFrontEnd(result):

	#Sending message back to frontend as Json
	print 'Content-Type: application/json\n\n'
	print json.dumps(result)

	return

executeCGI()

