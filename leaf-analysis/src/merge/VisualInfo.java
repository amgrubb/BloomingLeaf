package merge;

public class VisualInfo {
	Integer width;
	Integer height;
	Integer x;
	Integer y;

	public VisualInfo(Integer width, Integer height, Integer x, Integer y) {
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
	}
	
	public String toString() {
		return "width:" + String.valueOf(this.width) + " height:" + String.valueOf(this.height) + " x:" + String.valueOf(this.x) + " y:" + String.valueOf(this.y);
	}
}