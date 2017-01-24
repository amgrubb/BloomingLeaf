#!/usr/bin/python

#import cgi modules
import cgi, cgitb
import subprocess
import os

cgitb.enable() 	#Enables error handling to explain cgi errors.

form = cgi.FieldStorage()

modeltext = form["toUpload"]
graph = form["simgraph"]

f = open("temp/tempfile", "w")
f.write(modeltext.value)
f.close()

#Calls the java file.
#os.system("/u/gary/java/jre1.8.0_66/bin/java -jar /u/gary/bin/Sim.jar /u/gary/public_html/leaf-ui/cgi-bin/temp/tempfile")
os.system("/u/naviechan/java/jre1.8.0_66/bin/java -jar /u/naviechan/bin/Sim.jar /u/naviechan/public_html/leaf/leaf-ui/cgi-bin/temp/tempfile")
# os.system("/u/marcel/java/jre1.8.0_66/bin/java -jar /u/marcel/bin/Sim.jar /u/marcel/public_html/leaf-ui/cgi-bin/temp/tempfile")
#os.system("/u/amgrubb/java/jre1.8.0_66/bin/java -jar /u/amgrubb/bin/Sim.jar /u/amgrubb/public_html/leaf-ui/cgi-bin/temp/tempfile")

#Opens are parses the output file.
f = open("temp/tempfile.out", "r")

#Results are send back to main.js
lines = f.readlines()

numElements = int(lines[0]);
timeScale = int(lines[1]);
offset = 2;
print "Content-type:text/plain\r\n"
print numElements
print str(timeScale)
for i in range(offset, offset + numElements):
	lines[i] = lines[i].replace("\n", "")
	print lines[i]

#if (lines[0]).isdigit():
#	numElements = int(lines[0]);
#	timeScale = int(lines[1]);
#	offset = 2;
#	print "Content-type:text/plain\r\n"
#	print numElements
#	print str(timeScale)
#	for i in range(offset, offset + numElements):
#		lines[i] = lines[i].replace("\n", "")
#		print lines[i]
#else:
#	print "Content-type:text/plain\r\n"
#	print lines
