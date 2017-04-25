/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public class ElementLink {
	LinkableElement[] src = null;
	LinkableElement dest = null;

	/**
	 * 
	 */
	public ElementLink(LinkableElement[] s, LinkableElement d) {
		src = s;
		dest = d;
		for(int i = 0; i < s.length; i++)
			s[i].addLinksAsSrc(this);
		d.addLinksAsDest(this);
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
