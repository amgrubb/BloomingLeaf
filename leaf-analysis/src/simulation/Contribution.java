package simulation;

public class Contribution extends ElementLink {
	private ContributionType contribution;
	
	public ContributionType getContribution() {
		return contribution;
	}
	public void setContribution(ContributionType contribution) {
		this.contribution = contribution;
	}
	private Contribution(LinkableElement s, LinkableElement d, ContributionType cT) {
		super(new LinkableElement[]{s}, d);
		this.contribution = cT;
	}
	

}
