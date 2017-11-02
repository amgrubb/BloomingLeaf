package simulation;

public class EvolvingDecomposition extends ElementLink {
	// If either the pre or post is "NA" or "No" set this link equal to null.
	private DecompositionType preDecomposition = null;
	private DecompositionType postDecomposition = null;
	int absTime; 					//Optional absolute time of transition.

	public EvolvingDecomposition(LinkableElement[] s, LinkableElement d, DecompositionType r1, DecompositionType r2, int absoluteTime) {
		super(s, d);
		this.preDecomposition = r1;
		this.postDecomposition = r2;
		this.absTime = absoluteTime;
	}

	public DecompositionType getPreDecomposition() {
		return preDecomposition;
	}

	public void setPreDecomposition(DecompositionType preDecomposition) {
		this.preDecomposition = preDecomposition;
	}

	public DecompositionType getPostDecomposition() {
		return postDecomposition;
	}

	public void setPostDecomposition(DecompositionType postDecomposition) {
		this.postDecomposition = postDecomposition;
	}

	public int getAbsTime() {
		return absTime;
	}

	
}