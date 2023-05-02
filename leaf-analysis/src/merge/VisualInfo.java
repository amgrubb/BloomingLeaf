package merge;

import gson_classes.BISize;
import gson_classes.BIPosition;

public class VisualInfo {
	BISize size;
	BIPosition position; 
	
	//x, y values are taken in and use in visualization as the upper left corner
	//however it is much more useful in calculations to consider the x,y of the node at the center 
	//therefore when get/set is used, we translate the x,y value to the center
	//while understanding that the saved x,y value is at the upper left
	
	public VisualInfo(Integer width, Integer height, Double x, Double y) {
		this.size = new BISize(width, height);
		this.position = new BIPosition(x, y);
	}

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

	public Double getLeftX() {
		return position.getX();
	}

	public Double getUpperY() {
		return position.getY();
	}
	
	public Double getX() {
		return position.getX() + this.size.getWidth()/2; //Working on center
	}

	public Double getY() {
		return position.getY() + this.size.getHeight()/2; //Working on center
	}


	public Integer getWidth() {
		return size.getWidth();
	}

	public Integer getHeight() {
		return size.getHeight();
	}

	public void setX(Double x) {
		this.position.setX(x - this.size.getWidth()/2); //Working on center
	}
	
	public void setY(Double y) {
		this.position.setY(y - this.size.getHeight()/2); //Working on center
	}

	public void setSize(BISize size) {
		this.size = size; 
	}

	public void setWidth(Integer width) {
		this.size.setWidth(width);
	}

	public void setHeight(Integer height) {
		this.size.setHeight(height);
	}

	public String toString() {
		return "width:" + String.valueOf(this.size.getWidth()) + " height:" + String.valueOf(this.size.getHeight()) + " x:" + String.valueOf(this.position.getX()) + " y:" + String.valueOf(this.position.getY());
	}
}