package interface_objects;

public class InputConstraint{
	private String constraintType;
	private String constraintSrcID;
	private String constraintSrcEB;
	private String absoluteValue;
	private String constraintDestID;
	private String constraintDestEB;
	public String getConstraintType() {
		return constraintType;
	}
	public void setConstraintType(String constraintType) {
		this.constraintType = constraintType;
	}
	public String getConstraintSrcID() {
		return constraintSrcID;
	}
	public void setConstraintSrcID(String constraintSrcID) {
		this.constraintSrcID = constraintSrcID;
	}
	public String getConstraintSrcEB() {
		return constraintSrcEB;
	}
	public void setConstraintSrcEB(String constraintSrcEB) {
		this.constraintSrcEB = constraintSrcEB;
	}
	public String getAbsoluteValue() {
		return absoluteValue;
	}
	public void setAbsoluteValue(String absoluteValue) {
		this.absoluteValue = absoluteValue;
	}
	public String getConstraintDestID() {
		return constraintDestID;
	}
	public void setConstraintDestID(String constraintDestID) {
		this.constraintDestID = constraintDestID;
	}
	public String getConstraintDestEB() {
		return constraintDestEB;
	}
	public void setConstraintDestEB(String constraintDestEB) {
		this.constraintDestEB = constraintDestEB;
	}
}