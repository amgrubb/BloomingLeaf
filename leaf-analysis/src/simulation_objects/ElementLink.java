/**
 * 
 */
package simulation_objects;

/**
 * @author A.M.Grubb
 *
 */
public class ElementLink {
	LinkableElement src = null;
	LinkableElement dest = null;
	String type = "link";
	boolean activeLink = true;
	
	public String getType() {
		return type;
	}

	/**
	 * 
	 */
	public ElementLink(LinkableElement s, LinkableElement d) {
		src = s;
		dest = d;
		s.addLinksAsSrc(this);
		d.addLinksAsDest(this);
		activeLink = true;
	}

	/**
	 * @return the src
	 */
	public LinkableElement getSrc() {
		return src;
	}

	/**
	 * @param src the src to set
	 */
	public void setSrc(LinkableElement src) {
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

	public boolean isActiveLink() {
		return activeLink;
	}
	

}
