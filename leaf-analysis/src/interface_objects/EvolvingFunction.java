package interface_objects;

import java.util.ArrayList;

/**
 * Created by davidkwon on 2018-07-23.
 */
public class EvolvingFunction {

    private String intentionID;
    private String stringDynVis;
    private ArrayList<FuncWrapper> functionSegList;

    public String getIntentionID() {
        return intentionID;
    }

    public String getStringDynVis() {
        return stringDynVis;
    }

    public ArrayList<FuncWrapper> getFunctionSegList() {
        return functionSegList;
    }

    /**
     * Should only be called for non UD functions
     */
    public String getMarkedValue() {
        if (functionSegList.size() == 0) {
            return "0000";
        }

        if (stringDynVis.equals("CR")) {
            return ((FuncSegment)functionSegList.get(0)).getFuncX();
        }
        int len = functionSegList.size();
        return ((FuncSegment)functionSegList.get(len - 1)).getFuncX();
    }


    public ArrayList<FuncSegment> getUnwrappedSegList() {
        ArrayList<FuncSegment> res = new ArrayList<FuncSegment>();

        for (int i = 0; i < functionSegList.size(); i++) {
            if (functionSegList.get(i) instanceof FuncSegment) {
                res.add((FuncSegment)functionSegList.get(i));
            } else {
                ArrayList<FuncSegment> repList = ((RepFuncSegment)functionSegList.get(i)).getFunctionSegList();
                for (FuncSegment seg: repList) {
                    res.add(seg);
                }
            }
        }

        return res;
    }

    public int getNumOfSegments() {
        return getUnwrappedSegList().size();
    }

    public boolean containsRepeat() {
        for (int i  = 0; i < functionSegList.size(); i++) {
            if (functionSegList.get(i) instanceof RepFuncSegment) {
                return true;
            }
        }
        return false;
    }

    public RepFuncSegment getRepFuncSegment() {
        for (int i  = 0; i < functionSegList.size(); i++) {
            if (functionSegList.get(i) instanceof RepFuncSegment) {
                return ((RepFuncSegment) functionSegList.get(i));
            }
        }
        return null;
    }

}
