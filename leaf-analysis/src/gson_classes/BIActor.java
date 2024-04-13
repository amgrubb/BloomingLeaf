package gson_classes;
import java.io.*;
import java.util.*;

public class BIActor {
	private Attributes attributes;
	
	public BIActor(String actorName, String type, boolean isHidden, ArrayList<Integer[]> intervals) {
		attributes = new Attributes(actorName, type, isHidden, intervals);
	}
	
	public String getActorName() {
		return attributes.actorName;
	}
	public String getType() {
		return attributes.type;
	}

	public boolean getIsHidden() {
		return attributes.isHidden;
	}

	public ArrayList<Integer[]> getIntervals() {
		return attributes.intervals;
	}

	private class Attributes {
		String actorName;
		String type;
		boolean isHidden;
		ArrayList<Integer[]> intervals;

		private Attributes(String actorName, String type, boolean isHidden, ArrayList<Integer[]> intervals) {
			this.actorName = actorName;
			this.type = type;
			this.isHidden = isHidden;
			this.intervals = intervals;
		}
	}
}
