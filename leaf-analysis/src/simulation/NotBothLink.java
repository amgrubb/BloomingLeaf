package simulation;

public class NotBothLink extends AbstractElement{
	private static int linkTPcounter = 1;
	private Intention element1;
	private Intention element2;
	private Integer absTime = null; 					//	Optional absolute time of transition.
	private String linkTP = null;
	private	boolean finalDenied;			// True for NBD and False for NBT links.
	
	public NotBothLink(Intention element1, Intention element2, boolean finalValueDenied, Integer absoluteTime, String uniqueID){
//		if (!(element1.getDynamicType() == IntentionalElementDynamicType.NB || element1.getDynamicType() == IntentionalElementDynamicType.NT))
//			System.err.println("Error: NotBothLink of " + element1.id + " and " + element2.id + " has intention with incorrect type (element 1).");
//		if (!(element2.getDynamicType() == IntentionalElementDynamicType.NB || element2.getDynamicType() == IntentionalElementDynamicType.NT))
//			System.err.println("Error: NotBothLink of " + element1.id + " and " + element2.id + " has intention with incorrect type (element 2).");
		super(uniqueID);
		this.element1 = element1;
		this.element2 = element2;
		this.absTime = absoluteTime;
		this.finalDenied = finalValueDenied;
		this.linkTP = getNewNBLinkTP();
		this.element1.assignNBFunction(this.linkTP, this.absTime);
		this.element2.assignNBFunction(this.linkTP, this.absTime);
	}
	private static String getNewNBLinkTP() {
		String tp = String.format("NBTP", linkTPcounter);
		linkTPcounter++;
		return tp;
	}
	public Intention getElement1() {
		return element1;
	}
	public Intention getElement2() {
		return element2;
	}
	public Integer getAbsTime() {
		return absTime;
	}
	public boolean isFinalDenied() {
		return finalDenied;
	}
	public String getLinkTP() {
		return linkTP;
	}
	public void updateLinkTP(String newLinkTP) {
		linkTP = newLinkTP;
	}
	
}