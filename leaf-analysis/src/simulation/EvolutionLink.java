package simulation;

import java.util.Random;

public class EvolutionLink extends ElementLink {
	private ElementLink preLink;
	private ElementLink postLink;
	private static Random rand = new Random();
	int EB;
	
	public ElementLink getPreLink() {
		return preLink;
	}
	public ElementLink getPostLink() {
		return postLink;
	}
	
	public void activateCurrentLink(int time) {
		if (preLink != null)
			if (time < EB)
				preLink.activeLink = true;
			else
				preLink.activeLink = false;			
		if (postLink != null)
			if (time < EB)
				postLink.activeLink = false;
			else
				postLink.activeLink = true;			

	}
	public void deactivateLinks(){
		if (preLink != null)
				preLink.activeLink = false;			
		if (postLink != null)
				postLink.activeLink = false;	
	}


	public EvolutionLink(LinkableElement s, LinkableElement d, String preType, String postType, int maxEB) {
		super(s, d);
		this.activeLink = false;
		EB = rand.nextInt(maxEB) + 1;
		
		if (preType.equals("NA"))
        	preLink = null;
		else if (DecompositionType.getByCode(preType) != null)
        	preLink = new Decomposition(s, d, DecompositionType.getByCode(preType));
        else if (ContributionType.getByCode(preType) != null)
        	preLink = new Contribution(src, dest, ContributionType.getByCode(preType));
        else if (preType.equals("DEP") || preType.equalsIgnoreCase("DEPENDS"))
        	preLink = new Dependency(dest, src);

		
		if (postType.equals("NA"))
        	postLink = null;
		else if (DecompositionType.getByCode(postType) != null)
        	postLink = new Decomposition(s, d, DecompositionType.getByCode(postType));
        else if (ContributionType.getByCode(postType) != null)
        	postLink = new Contribution(src, dest, ContributionType.getByCode(postType));
        else if (postType.equals("DEP") || postType.equalsIgnoreCase("DEPENDS"))
        	postLink = new Dependency(dest, src);
		
		if (((preLink instanceof Contribution) || (postLink instanceof Contribution)) &&
			((preLink instanceof Decomposition) || (postLink instanceof Decomposition) ||
			 (preLink instanceof Dependency) || (postLink instanceof Dependency)))
			System.err.println("Contribution Links cannot be paired with Dependency/Decomposition");
		
		if (((preLink instanceof Decomposition) || (postLink instanceof Decomposition)) &&
			((preLink instanceof Contribution) || (postLink instanceof Contribution) ||
			 (preLink instanceof Dependency) || (postLink instanceof Dependency)))
			System.err.println("Decomposition Links cannot be paired with Dependency/Contribution");

		if (((preLink instanceof Dependency) || (postLink instanceof Dependency)) &&
			((preLink instanceof Decomposition) || (postLink instanceof Decomposition) ||
			 (preLink instanceof Contribution) || (postLink instanceof Contribution)))
			System.err.println("Dependency Links cannot be paired with Contribution/Decomposition");
		
		if (postLink != null)
			postLink.activeLink = false;
	}

	
	
	/*
	public ContributionType getContribution() {
		return contribution;
	}
	public void setContribution(ContributionType contribution) {
		this.contribution = contribution;
	}
 */
	
}
