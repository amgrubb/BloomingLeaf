package merge;

import gson_classes.BISize;
import gson_classes.BIPosition;

public class VisualInfo {
	BISize size;
	BIPosition position;

	public VisualInfo(BISize size, BIPosition position) {
		this.size = size;
		this.position = position;
	}
	
	public BISize getSize() {
		return size;
	}
	
	public BIPosition getPosition() {
		return position;
	}

	public Integer getX() {
		return position.getX();
	}

	public Integer getY() {
		return position.getY();
	}

	public void setX(Integer x) {
		this.position.setX();
	}
	
	public void setY(Integer y) {
		this.position.setY();
	}

	public String toString() {
		return "width:" + String.valueOf(this.size.getWidth()) + " height:" + String.valueOf(this.size.getHeight()) + " x:" + String.valueOf(this.position.getX()) + " y:" + String.valueOf(this.position.getY());
	}
}