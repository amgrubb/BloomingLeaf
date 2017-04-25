/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public class Decomposition extends ElementLink {
	private DecompositionType decomposition = DecompositionType.AND;
	
	public DecompositionType getDecomposition() {
		return decomposition;
	}
	/**
	 * @param s
	 * @param d
	 */
	public Decomposition(LinkableElement[] s, LinkableElement d, DecompositionType dT) {
		super(s, d);
		decomposition = dT;
	}

}
