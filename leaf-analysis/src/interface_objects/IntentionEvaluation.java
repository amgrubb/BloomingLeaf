package interface_objects;

/**
 * Created by davidkwon on 2018-07-23.
 */
public class IntentionEvaluation {

    private String intentionID;
    private String absTime;
    private String evaluationValue;

    public String getIntentionID() {
        return intentionID;
    }

    public String getAbsTime() {
        return absTime;
    }

    public String getEvaluationValue() {
        return evaluationValue;
    }

	public void setIntentionID(String intentionID) {
		this.intentionID = intentionID;
	}

	public void setAbsTime(String absTime) {
		this.absTime = absTime;
	}

	public void setEvaluationValue(String evaluationValue) {
		this.evaluationValue = evaluationValue;
	}
    

}
