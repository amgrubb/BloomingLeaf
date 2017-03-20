/**
 * 
 */
package simulation_objects;

/**
 * @author A.M.Grubb
 *
 */
public class Dependency extends ElementLink {

	/**
	 * @param s
	 * @param d
	 */
	public Dependency(LinkableElement s, LinkableElement d) {
		super(s, d);
		this.type = "DEPENDS";
	}

}
