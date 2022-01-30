package simulation;

import gson_classes.BILink;

public class ContributionLink extends AbstractElementLink {
	private ContributionType preContribution = null;
	private ContributionType postContribution = null;

	public ContributionLink(AbstractLinkableElement s, AbstractLinkableElement d, ContributionType r1, String uniqueID) {
		super(new AbstractLinkableElement[]{s}, d, uniqueID);
		this.preContribution = r1;
	}

	public ContributionLink(AbstractLinkableElement s, AbstractLinkableElement d, ContributionType r1, ContributionType r2, Integer absoluteTime, String uniqueID) {
		super(new AbstractLinkableElement[]{s}, d, absoluteTime, uniqueID);
		this.preContribution = r1;
		this.postContribution = r2;
	}
	public ContributionType getPreContribution() {
		return preContribution;
	}
	public void setPreContribution(ContributionType ct){
		preContribution = ct;
	}

	public ContributionType getPostContribution() {
		return postContribution;
	}
	public void setPostContribution(ContributionType ct){
		postContribution = ct;
	}

	/** Check if the relationship types are correct, then constructs a contribution link. 
	 * Note: Assume that N
	 * @param s	Source Intention
	 * @param d Destination Intention
	 * @param link Input link properties.
	 * @return creates a contribution link, but null if decomposition link, error if incorrect link.
	 */
	public static ContributionLink createConstributionLink(AbstractLinkableElement s, AbstractLinkableElement d, BILink link, String uniqueID) {
		String linkType = link.getLinkType();
		if (linkType.equals("NBT") || linkType.equals("NBD"))
			throw new IllegalArgumentException("NBT/NBD relation not filtered prior to contriubtion links.");
		
		if (link.getPostType() == null) {
			// Not Evolving Link
			switch (linkType) {
				case "++":  case "+":  case "-":  case "--":
				case "++S": case "+S": case "-S": case "--S":
				case "++D": case "+D": case "-D": case "--D":
					return new ContributionLink(s, d, ContributionType.getByCode(linkType), uniqueID);
				case "and":
				case "or":
				case "AND":
				case "OR":
					return null;
				default:
					throw new IllegalArgumentException("(Simple) Invalid relationship type: " + linkType);
			}
		} else {
			// Evolving Link
			String postType = link.getPostType();
			switch (linkType) {
				case "++":  case "+":  case "-":  case "--":
				case "++S": case "+S": case "-S": case "--S":
				case "++D": case "+D": case "-D": case "--D":
					switch (postType) {
						case "no": case "NO":
							return new ContributionLink(s, d, ContributionType.getByCode(linkType), ContributionType.getByCode("no"), link.getAbsTime(), uniqueID);
						case "++":  case "+":  case "-":  case "--":
						case "++S": case "+S": case "-S": case "--S":
						case "++D": case "+D": case "-D": case "--D":
							return new ContributionLink(s, d, ContributionType.getByCode(linkType), ContributionType.getByCode(postType), link.getAbsTime(), uniqueID);
						default:
							throw new IllegalArgumentException("Invalid relationship type (type 1): " + linkType);
					}
				case "and": case "or": case "AND": case "OR":
					return null;
				case "no": case "NO":
					switch (postType) {
						case "++":  case "+":  case "-":  case "--":
						case "++S": case "+S": case "-S": case "--S":
						case "++D": case "+D": case "-D": case "--D":
							return new ContributionLink(s, d, ContributionType.getByCode("no"), ContributionType.getByCode(postType), link.getAbsTime(), uniqueID);
						case "and": case "or": case "AND": case "OR":
							return null;
						default:
							throw new IllegalArgumentException("Invalid relationship type (type 2): " + linkType);
					}
				default:
					throw new IllegalArgumentException("Invalid relationship type (type 3): " + linkType);
			}
		}
	}		
}




