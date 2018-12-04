#!/usr/bin/python
numAbsPoint = [25, 50, 75, 100, 125]
orgFileSize = "175"
sourceFileName = "../scalability-tests/REJ-ORTree-" + orgFileSize + ".json"
sourceFile = open(sourceFileName, "r") 
lines = sourceFile.readlines()

for abs in numAbsPoint:
    newFileName = "../scalability-tests/REJ-ORTree-" + orgFileSize + "-Abs" + repr(abs) + ".json"
    newFile = open(newFileName, "w")

    newFile.write("{\"analysisRequest\":{\"action\":\"singlePath\",\"conflictLevel\":\"N\",\"numRelTime\":\"1\",\"absTimePts\":\"")
    #Write first set of absTimePts.
    newFile.write("1")
    for c1 in range(2, abs+1):
        newFile.write(" " + repr(c1))
    newFile.write("\",\"absTimePtsArr\":[")
    #Write second set of absTimePts as array.
    newFile.write("\"1\"")
    for c2 in range(2, abs+1):
        newFile.write(",\"" + repr(c2) + "\"")
    newFile.write("],\"currentState\":\"0|0\",\"userAssignmentsList\":[\n")
    for x in range(1, len(lines)):
        newFile.write(lines[x])

    newFile.close()

sourceFile.close()