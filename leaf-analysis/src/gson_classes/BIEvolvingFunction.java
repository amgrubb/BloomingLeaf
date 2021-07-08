package gson_classes;

public class BIEvolvingFunction {
	private Attributes attributes;
	
	private class Attributes {
        String functionSegList; //The type is array .<FunctionSegmentBBM>
        Boolean hasRepeat;
        Integer repAbsTime;
        Integer repCount;
        String repStart;
        String repStop;
        String type;
	}
}
