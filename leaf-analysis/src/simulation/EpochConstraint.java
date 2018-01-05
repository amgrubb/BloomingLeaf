package simulation;

public class EpochConstraint {
	IntentionalElement src;
	IntentionalElement dest;
	String type;
	boolean srcUD = false;
	boolean destUD = false;
	String srcEB;
	String destEB;
	int absoluteTime;
	
	// Used for Relative Intention Constraints
	public EpochConstraint(String constraintType, IntentionalElement src, IntentionalElement dest, String constraintSrcEB, String constraintDestEB) {
		this.src = src;
		this.dest = dest;
		this.type = constraintType;
		this.srcEB = constraintSrcEB;
		this.destEB = constraintDestEB;
		if (src.isUserDefinedDynamicType())
			srcUD = true;
		if (dest.isUserDefinedDynamicType())
			destUD = true;
		this.absoluteTime = 0;
	}
	
	// Used only for Absolute Intention Constraints
	public EpochConstraint(IntentionalElement src, String constraintSrcEB, int absoluteValue) {
		this.src = src;
		this.dest = src;
		this.type = "A";
		this.srcEB = constraintSrcEB;
		this.destEB = constraintSrcEB;
		if (src.isUserDefinedDynamicType())
			srcUD = true;
		destUD = false;
		this.absoluteTime = absoluteValue;
	}

	public int getAbsoluteTime() {
		return absoluteTime;
	}

	public IntentionalElement getSrc() {
		return src;
	}
	public IntentionalElement getDest() {
		return dest;
	}
	public String getType() {
		return type;
	}
	public boolean isSrcUD() {
		return srcUD;
	}
	public boolean isDestUD() {
		return destUD;
	}
	public String getSrcEB() {
		return srcEB;
	}
	public String getDestEB() {
		return destEB;
	}
	

}
