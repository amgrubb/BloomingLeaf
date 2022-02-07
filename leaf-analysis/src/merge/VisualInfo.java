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
	
	public String toString() {
		return "width:" + String.valueOf(this.size.getWidth()) + " height:" + String.valueOf(this.size.getHeight()) + " x:" + String.valueOf(this.position.getX()) + " y:" + String.valueOf(this.position.getY());
	}
}