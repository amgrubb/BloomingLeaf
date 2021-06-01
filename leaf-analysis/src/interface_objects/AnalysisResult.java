package interface_objects;

//import java.util.HashMap;
import java.util.List;

/**
 * Created by davidkwon on 2018-07-23.
 */
public class AnalysisResult {

    private String[] assignedEpoch;
    private String[] timePointPath;
    private int timePointPathSize;
    private List<OutputElement> elementList;

    public String[] getAssignedEpoch() {
        return assignedEpoch;
    }

    public String[] getTimePointPath() {
        return timePointPath;
    }

    public int getTimePointPathSize() {
        return timePointPathSize;
    }

    public List<OutputElement> getElementList() {
        return elementList;
    }

}
