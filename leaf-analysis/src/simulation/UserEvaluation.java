package simulation;

public class UserEvaluation {
	IntentionalElement goal;
	int absTime; 
	boolean[] evaluationValue;
	public UserEvaluation(IntentionalElement goal, int absTime, boolean[] evaluationValue) {
		this.goal = goal;
		this.absTime = absTime;
		this.evaluationValue = evaluationValue;
	}
	public IntentionalElement getGoal() {
		return goal;
	}
	public int getAbsTime() {
		return absTime;
	}
	public boolean[] getEvaluationValue() {
		return evaluationValue;
	}
}
