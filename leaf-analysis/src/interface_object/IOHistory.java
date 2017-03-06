package interface_object;

public class IOHistory {
	private String numHistory;
	private String numIntentions;
	private String numTimePoints;
	private int[] history_array;
	public String getNumHistory() {
		return numHistory;
	}
	public void setNumHistory(String numHistory) {
		this.numHistory = numHistory;
	}
	public String getNumIntentions() {
		return numIntentions;
	}
	public void setNumIntentions(String numIntentions) {
		this.numIntentions = numIntentions;
	}
	public String getNumTimePoints() {
		return numTimePoints;
	}
	public void setNumTimePoints(String numTimePoints) {
		this.numTimePoints = numTimePoints;
	}
	public int[] getHistory_array() {
		return history_array;
	}
	public void setHistory_array(int[] history_array) {
		this.history_array = history_array;
	}
}