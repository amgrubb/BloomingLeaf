/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public class ElementLink {
	private static int linkTPcounter = 1;
	
	private LinkableElement[] src = null;
	private LinkableElement dest = null;
	private boolean isEvolving = false;			// 	Whether link has a post relationship type.
	private Integer absTime = null; 					//	Optional absolute time of transition.
	private String linkTP = null;
	
	public ElementLink(LinkableElement[] s, LinkableElement d) {
		src = s;
		dest = d;
		for(int i = 0; i < s.length; i++)
			s[i].addLinksAsSrc(this);
		d.addLinksAsDest(this);
	}
	public ElementLink(LinkableElement[] s, LinkableElement d, Integer absoluteTime) {
		this(s,d);
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
	/**
	 * @return the src
	 */
	public LinkableElement[] getSrc() {
		return src;
	}
	public LinkableElement getZeroSrc() {
		return src[0];
	}
	
	/**
	 * @param src the src to set
	 */
	public void setSrc(LinkableElement[] src) {
		this.src = src;
	}

	/**
	 * @return the dest
	 */
	public LinkableElement getDest() {
		return dest;
	}

	/**
	 * @param dest the dest to set
	 */
	public void setDest(LinkableElement dest) {
		this.dest = dest;
	}

}
