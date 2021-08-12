#!/usr/bin/python

import sys, json
import os

numSimSteps = [5,10,25,50,75,100,150,200]
#scalabilityFiles = ["REJ-ORTree-25.json","REJ-ORTree-51.json","REJ-ORTree-75.json","REJ-ORTree-101.json","REJ-ORTree-125.json","REJ-ORTree-151.json","REJ-ORTree-175.json","REJ-ORTree-201.json"]
scalabilityFiles = ["REJ-ORTree-201.json"]

for x in scalabilityFiles:
    for y in numSimSteps:
        osCall = "java -Xss1024m -Xmx4096m -jar ScalabilityTest.jar " + x + " " + str(y)
        os.system(osCall)