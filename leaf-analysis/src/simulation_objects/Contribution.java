/**
 * 
 */
package simulation_objects;

/**
 * @author A.M.Grubb
 *
 */
public class Contribution extends ElementLink {
	private ContributionType contribution;
	
	public ContributionType getContribution() {
		return contribution;
	}
	public void setContribution(ContributionType contribution) {
		this.contribution = contribution;
	}

	public Contribution(LinkableElement s, LinkableElement d, ContributionType cT) {
		super(s, d);
		this.contribution = cT;
		this.type = cT.getCode();
	}

}
