package gson_classes;

import java.util.List;

public class BIEvolvingFunction {
	private Attributes attributes;
	
	private class Attributes {  
		List<BIFunctionSegment> functionSegList; 
        Boolean hasRepeat;
        Integer repAbsTime;
        Integer repCount;
        String repStart;
        String repStop;
        String type;
	}
}
