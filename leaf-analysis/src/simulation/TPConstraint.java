package simulation;

public class TPConstraint {
	private String refTP1;
	private String refTP2;

	// Holds only Less Than Constraints between time points.
	public TPConstraint(String refTP1, String refTP2) {
		this.refTP1 = refTP1;
		this.refTP2 = refTP2;
	}
	public String getRefTP1() {
		return refTP1;
	}
	public String getRefTP2() {
		return refTP2;
	}
}
