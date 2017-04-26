package simulation;

public class EvolvingContribution extends ElementLink {
	// If either the pre or post is "NA" or "No" set this link equal to null.
	private ContributionType preContribution = null;
	private ContributionType postContribution = null;
	int absTime; 					//Optional absolute time of transition.

	public EvolvingContribution(LinkableElement s, LinkableElement d, ContributionType r1, ContributionType r2) {
		this(s, d, r1, r2, -1);
	}
	public EvolvingContribution(LinkableElement s, LinkableElement d, ContributionType r1, ContributionType r2, int absoluteTime) {
		super(new LinkableElement[]{s}, d);
		this.preContribution = r1;
		this.postContribution = r2;
		this.absTime = absoluteTime;
	}

	public ContributionType getPreContribution() {
		return preContribution;
	}

	public void setPreContribution(ContributionType preContribution) {
		this.preContribution = preContribution;
	}

	public ContributionType getPostContribution() {
		return postContribution;
	}

	public void setPostContribution(ContributionType postContribution) {
		this.postContribution = postContribution;
	}

	public int getAbsTime() {
		return absTime;
	}

	
}