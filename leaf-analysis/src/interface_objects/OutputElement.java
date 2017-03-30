package interface_objects;

import java.util.ArrayList;
import java.util.List;

public class OutputElement {

	private String id;
	private List<String> valueList = new ArrayList<>();
	
	public String getId() {
		return id;
	}

	public void setId(String string) {
		this.id = string;
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
