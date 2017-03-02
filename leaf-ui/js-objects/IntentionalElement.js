function IntentionalElement(name = "NAME", id = "NO-ID", linksSrc, linksDest, 
							actor = null, type="G", dynamicType="NT", decompositionType="AND", 
							staticIntention = false, dynamicFunctionMarkedValue = "6", epochBoundary = "0", 
							userDefinedDynamicType = false, intUDFunct = null, cspUDFunct = null){
	this.name = name;
	this.id = id;
	this.linksSrc = linksSrc; //ElementLink
	this.linksDest = linksDest; //ElementLink
	this.actor = actor;
	this.type = type;
	this.dynamicType = dynamicType;
	this.decompositionType = decompositionType;
	this.staticIntention = staticIntention;
	this.dynamicFunctionMarkedValue = dynamicFunctionMarkedValue;
	this.epochBoundary = epochBoundary;
	this.userDefinedDynamicType = userDefinedDynamicType;
	this.intUDFunct = intUDFunct;
	this.cspUDFunct = cspUDFunct;
}

