package simulation;

import gson_classes.BILink;

public class ContributionLink extends ElementLink {
	private ContributionType preContribution = null;
	private ContributionType postContribution = null;
	private int absTime = -1; 					//Optional absolute time of transition.

	public ContributionLink(LinkableElement s, LinkableElement d, ContributionType r1, ContributionType r2, int absoluteTime) {
		super(new LinkableElement[]{s}, d);
		this.preContribution = r1;
		this.postContribution = r2;
		this.absTime = absoluteTime;
	}

	public ContributionType getPreContribution() {
		return preContribution;
	}

//	public void setPreContribution(ContributionType preContribution) {
//		this.preContribution = preContribution;
//	}

	public ContributionType getPostContribution() {
		return postContribution;
	}

//	public void setPostContribution(ContributionType postContribution) {
//		this.postContribution = postContribution;
//	}

	public int getAbsTime() {
		return absTime;
	}

	/** Check if the relationship types are correct, then constructs a contribution link. 
	 * Note: Assume that N
	 * @param s	Source Intention
	 * @param d Destination Intention
	 * @param link Input link properties.
	 * @return creates a contribution link, but null if decomposition link, error if incorrect link.
	 */
	public static ContributionLink createConstributionLink(LinkableElement s, LinkableElement d, BILink link) {
		String linkType = link.getLinkType();
		if (linkType.equals("NBT") || linkType.equals("NBD"))
			throw new IllegalArgumentException("NBT/NBD relation not filtered prior to contriubtion links.");
		
		if (link.getPostType() == null) {
			// Not Evolving Link
			switch (linkType) {
				case "++":  case "+":  case "-":  case "--":
				case "++S": case "+S": case "-S": case "--S":
				case "++D": case "+D": case "-D": case "--D":
					return new ContributionLink(s, d, ContributionType.getByCode(linkType), null, -1);
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
			int absTime;
			if (link.getAbsTime() == null)
				absTime = -1;
			else
				absTime = link.getAbsTime();
			switch (linkType) {
				case "++":  case "+":  case "-":  case "--":
				case "++S": case "+S": case "-S": case "--S":
				case "++D": case "+D": case "-D": case "--D":
					switch (postType) {
						case "no": case "NO":
							return new ContributionLink(s, d, ContributionType.getByCode(linkType), ContributionType.getByCode("no"), absTime);
						case "++":  case "+":  case "-":  case "--":
						case "++S": case "+S": case "-S": case "--S":
						case "++D": case "+D": case "-D": case "--D":
							return new ContributionLink(s, d, ContributionType.getByCode(linkType), ContributionType.getByCode(postType), absTime);
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
							return new ContributionLink(s, d, ContributionType.getByCode("no"), ContributionType.getByCode(postType), absTime);
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




