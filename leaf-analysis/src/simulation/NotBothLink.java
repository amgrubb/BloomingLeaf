package simulation;

public class NotBothLink {
	IntentionalElement element1;
	IntentionalElement element2;
	int absTime; 					//Optional absolute time of transition.
	boolean finalDenied;			// True for NBD and False for NBT links.
	
	public NotBothLink(IntentionalElement element1, IntentionalElement element2, boolean finalValueDenied){
		this(element1, element2, finalValueDenied, -1);
	}
	public NotBothLink(IntentionalElement element1, IntentionalElement element2, boolean finalValueDenied, int absoluteTime){
		if (!(element1.getDynamicType() == IntentionalElementDynamicType.NB || element1.getDynamicType() == IntentionalElementDynamicType.NT))
			System.err.println("Error: NotBothLink of " + element1.id + " and " + element2.id + " has intention with incorrect type (element 1).");
		if (!(element2.getDynamicType() == IntentionalElementDynamicType.NB || element2.getDynamicType() == IntentionalElementDynamicType.NT))
			System.err.println("Error: NotBothLink of " + element1.id + " and " + element2.id + " has intention with incorrect type (element 2).");
		this.element1 = element1;
		this.element2 = element2;
		this.absTime = absoluteTime;
		this.finalDenied = finalValueDenied;
	}
	public IntentionalElement getElement1() {
		return element1;
	}
	public IntentionalElement getElement2() {
		return element2;
	}
	public int getAbsTime() {
		return absTime;
	}
	public boolean isFinalDenied() {
		return finalDenied;
	}
}