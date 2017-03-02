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
	
	
	public EpochConstraint(String constraintType, IntentionalElement src, IntentionalElement dest, String constraintSrcEB, String constraintDestEB) {
		// TODO Auto-generated constructor stub
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
	
	public EpochConstraint(String constraintType, IntentionalElement src, String constraintSrcEB, String absoluteValue) {
		this.src = src;
		this.dest = src;
		this.type = constraintType;
		this.srcEB = constraintSrcEB;
		this.destEB = constraintSrcEB;
		if (src.isUserDefinedDynamicType())
			srcUD = true;
		destUD = false;
		this.absoluteTime = Integer.parseInt(absoluteValue);
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
