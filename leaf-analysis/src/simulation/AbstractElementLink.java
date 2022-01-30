/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public abstract class AbstractElementLink extends AbstractElement{
	protected String id = "NO-ID";	//Format that maps to array ordering.
	
	private static int linkTPcounter = 1;
	
	private AbstractLinkableElement[] src = null;
	private AbstractLinkableElement dest = null;
	private boolean isEvolving = false;			// 	Whether link has a post relationship type.
	private Integer absTime = null; 					//	Optional absolute time of transition.
	private String linkTP = null;
	
	public AbstractElementLink(AbstractLinkableElement[] s, AbstractLinkableElement d, String uniqueID) {
		super(uniqueID);
		src = s;
		dest = d;
		for(int i = 0; i < s.length; i++)
			s[i].addLinksAsSrc(this);
		d.addLinksAsDest(this);
	}
	public AbstractElementLink(AbstractLinkableElement[] s, AbstractLinkableElement d, Integer absoluteTime, String uniqueID) {
		this(s,d,uniqueID);
		isEvolving = true;
		absTime = absoluteTime;
		linkTP = getNewLinkTP();
	}
	private static String getNewLinkTP() {
		String tp = "LTP" + linkTPcounter;
		linkTPcounter++;
		return tp;
	}

	public boolean isEvolving() {
		return isEvolving;
	}
	public Integer getAbsTime() {
		return absTime;
	}
	public String getLinkTP() {
		return linkTP;
	}
	public void updateLinkTP(String newLinkTP) {
		linkTP = newLinkTP;
	}
	/**
	 * @return the src
	 */
	public AbstractLinkableElement[] getSrc() {
		return src;
	}
	public AbstractLinkableElement getZeroSrc() {
		return src[0];
	}
	
	/**
	 * @param src the src to set
	 */
	public void setSrc(AbstractLinkableElement[] src) {
		this.src = src;
	}

	/**
	 * @return the dest
	 */
	public AbstractLinkableElement getDest() {
		return dest;
	}

	/**
	 * @param dest the dest to set
	 */
	public void setDest(AbstractLinkableElement dest) {
		this.dest = dest;
	}
	
	public String getID() {
		return id;
	}
	public void setID(String id) {
		this.id = id;
	}

}
