package simulation;

public class TPConstraint {
	private String type;
	//private AbstractElement refEle1;
	private String refTP1;
	//private AbstractElement refEle2;
	private String refTP2;
	//TODO: Do we need refElements?
	
	public TPConstraint(String type, AbstractElement refEle1, String refTP1, AbstractElement refEle2, String refTP2) {
		this.type = type;
	//	this.refEle1 = refEle1;
		this.refTP1 = refTP1;
	//	this.refEle2 = refEle2;
		this.refTP2 = refTP2;
	}
	public String getType() {
		return type;
	}
	public String getRefTP1() {
		return refTP1;
	}
	public String getRefTP2() {
		return refTP2;
	}
}
