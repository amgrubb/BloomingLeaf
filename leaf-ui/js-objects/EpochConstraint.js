function EpochConstraint(src, dest, type, srcUD = false, destUD = false, srcEB, destEB, absoluteTime){
	this.src = src;
	this.dest = dest;
	this.type = type;
	this.srcUD = srcUD;
	this.destUD = destUD;
	this.srcEB = srcEB;
	this.destEB = destEB;
	this.absoluteTime = absoluteTime;	
}
