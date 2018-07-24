package interface_objects;

import java.util.HashMap;

/**
 * Created by davidkwon on 2018-07-23.
 */
public class AnalysisResult {

    private String[] assignedEpoch;
    private String[] timePointPath;
    private int timePointPathSize;
    private HashMap<String, HashMap<String, String>> values;

    public String[] getAssignedEpoch() {
        return assignedEpoch;
    }

    public String[] getTimePointPath() {
        return timePointPath;
    }

    public int getTimePointPathSize() {
        return timePointPathSize;
    }

    public HashMap<String, HashMap<String, String>> getValues() {
        return values;
    }

}
