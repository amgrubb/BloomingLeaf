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
	public void setDecomposition(DecompositionType decomposition) {
		this.decomposition = decomposition;
	}
	/**
	 * @param s
	 * @param d
	 */
	public Decomposition(LinkableElement s, LinkableElement d, DecompositionType dT) {
		super(s, d);
		decomposition = dT;
		this.type = dT.getCode();
	}

}
