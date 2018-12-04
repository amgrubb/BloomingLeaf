#!/usr/bin/python

import sys, json
import os

#Note: numSimSteps and number of absolute values should add to 75
numSimSteps = [150, 125, 100, 75, 50, 25]
scalabilityFiles = ["REJ-ORTree-101.json","REJ-ORTree-101-Abs25.json","REJ-ORTree-101-Abs50.json","REJ-ORTree-101-Abs75.json","REJ-ORTree-101-Abs100.json","REJ-ORTree-101-Abs125.json"]
#scalabilityFiles = ["REJ-ORTree-175.json","REJ-ORTree-175-Abs25.json","REJ-ORTree-175-Abs50.json","REJ-ORTree-175-Abs75.json","REJ-ORTree-175-Abs100.json","REJ-ORTree-175-Abs125.json"]

for x in numSimSteps:
    #print x
    #print scalabilityFiles[numSimSteps.index(x)]
    osCall = "java -Xss1024m -Xmx4096m -jar ScalabilityTest.jar " + scalabilityFiles[numSimSteps.index(x)] + " " + str(x)
    os.system(osCall)