package interface_objects;

import java.util.ArrayList;

/**
 * Created by davidkwon on 2018-07-24.
 */
public class RepFuncSegment implements FuncWrapper {

    private ArrayList<FuncSegment> functionSegList;
    private int repNum;
    private int absTime;

    public ArrayList<FuncSegment> getFunctionSegList() {
        return functionSegList;
    }

    public int getRepNum() {
        return repNum;
    }

    public int getAbsTime() {
        return absTime;
    }

    public char getRepStart() {
        return functionSegList.get(0).getFuncStart().charAt(0);
    }

    public char getRepEnd() {
        int len = functionSegList.size();
        return functionSegList.get(len - 1).getFuncStop().charAt(0);
    }

}
