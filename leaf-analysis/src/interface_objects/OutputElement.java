package interface_objects;

import java.util.ArrayList;
import java.util.List;

public class OutputElement {

	private int id;
	private List<String> valueList = new ArrayList<>();
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public List<String> getValueList() {
		return valueList;
	}

	public void setValueList(List<String> valueList) {
		this.valueList = valueList;
	}

	public List<String> getValuesList() {
		return this.valueList;
	}

}
