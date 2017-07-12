#!/usr/bin/python

import sys, json
import cgi, cgitb
cgitb.enable()

def executeCGI():

	processedFilePath = 'temp/output.out'

	with open(processedFilePath) as data:
		result = data.readlines()

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
