#!/usr/bin/python

import sys, json
import cgi, cgitb
import os
cgitb.enable()

#call JAVA app
#os.system("/u/marcel/java/jre1.8.0_66/bin/java -jar /u/marcel/bin/marcel.jar")
#os.system("/u/boyue/java/jre1.8.0_66/bin/java -jar /u/boyue/bin/Blooming_merge.jar")
#os.system("/u/amgrubb/java/jre1.8.0_66/bin/java -jar /u/amgrubb/bin/DevBlooming.jar")
os.system("/u/amgrubb/java/jre1.8.0_66/bin/java -jar /u/amgrubb/bin/Blooming_merge.jar")

#Object to be sent back to frontend
result = {}
result['success'] = True
result['message'] = "This is a response from server"

print 'Content-Type: application/json\n\n'
print json.dumps(result)
