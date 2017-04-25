package interface_objects;

import java.util.ArrayList;
import java.util.List;

public class OutputElement {

	private String id;
	private List<String> status = new ArrayList<>();
	
	public String getId() {
		return id;
	}

	public void setId(String string) {
		this.id = string;
	}

	public List<String> getStatus() {
		return status;
	}

	public void setStatus(List<String> valueList) {
		this.status = valueList;
	}

}
