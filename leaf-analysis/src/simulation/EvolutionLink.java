package simulation;

public class EvolutionLink extends ElementLink {
	private ElementLink preLink;
	private ElementLink postLink;
	int absTime; 					//Optional absolute time of transition.

	public EvolutionLink(LinkableElement s, LinkableElement d, String preType, String postType) {
		this(s, d, preType, postType, -1);
	}
	public EvolutionLink(LinkableElement s, LinkableElement d, String preType, String postType, int absoluteTime) {
		super(s, d);
		
		if (preType.equals("NA"))
        	preLink = null;
		else if (DecompositionType.getByCode(preType) != null)
        	preLink = new Decomposition(s, d, DecompositionType.getByCode(preType));
        else if (ContributionType.getByCode(preType) != null)
        	preLink = new Contribution(src, dest, ContributionType.getByCode(preType));
		
		if (postType.equals("NA"))
        	postLink = null;
		else if (DecompositionType.getByCode(postType) != null)
        	postLink = new Decomposition(s, d, DecompositionType.getByCode(postType));
        else if (ContributionType.getByCode(postType) != null)
        	postLink = new Contribution(src, dest, ContributionType.getByCode(postType));
		
		if (((preLink instanceof Contribution) || (postLink instanceof Contribution)) &&
			((preLink instanceof Decomposition) || (postLink instanceof Decomposition)))
			System.err.println("Contribution Links cannot be paired with Decomposition");
		
		if (((preLink instanceof Decomposition) || (postLink instanceof Decomposition)) &&
			((preLink instanceof Contribution) || (postLink instanceof Contribution)))
			System.err.println("Decomposition Links cannot be paired with Contribution");
	}
	public ElementLink getPreLink() {
		return preLink;
	}
	public ElementLink getPostLink() {
		return postLink;
	}
	public int getAbsTime() {
		return absTime;
	}
}
