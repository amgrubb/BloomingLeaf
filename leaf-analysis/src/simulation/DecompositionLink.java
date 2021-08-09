package simulation;

import java.util.ArrayList;
import java.util.List;

import gson_classes.ICell;

public class DecompositionLink extends AbstractElementLink {
	private DecompositionType preDecomposition = null;
	private DecompositionType postDecomposition = null;
	private List<String> subLinkUniqueIDList = null;

	public DecompositionLink(AbstractLinkableElement[] s, AbstractLinkableElement d, DecompositionType r1, 
			List<String> uniqueIDList) {
		super(s, d, null);
		this.preDecomposition = r1;
		this.subLinkUniqueIDList = uniqueIDList;
	}
	public DecompositionLink(AbstractLinkableElement[] s, AbstractLinkableElement d, DecompositionType r1, 
			DecompositionType r2, Integer absoluteTime, List<String> uniqueIDList) {
		super(s, d, absoluteTime, null);
		this.preDecomposition = r1;
		this.postDecomposition = r2;
		this.subLinkUniqueIDList = uniqueIDList;
	}
	
	public DecompositionType getPreDecomposition() {
		return preDecomposition;
	}

	public DecompositionType getPostDecomposition() {
		return postDecomposition;
	}
	
	public String getUniqueID() {
		return "DECOMP";
	}
	public boolean isIDInDecompositionLink(String uID) {
		for (String id : subLinkUniqueIDList)
			if (id.equals(uID))
				return true;
		return false;
	}

	public static List<DecompositionLink> createDecompositionLinks(ArrayList<ICell> allDecompositionLinks, ModelSpec modelSpec) {
		List<DecompositionLink> decompositionList = new ArrayList<DecompositionLink>();

		while (allDecompositionLinks.size() > 0) {				
			String destID = allDecompositionLinks.get(0).getTargetID();
			Integer absTime = allDecompositionLinks.get(0).getLink().getAbsTime();		
				//TODO: Add check to make sure all AbsTime values are the same.
			Intention intentElementDest = modelSpec.getIntentionByUniqueID(destID);
			ArrayList<ICell> curDestLinks = new ArrayList<ICell>();
			boolean evolve = false;
			boolean andLink = false;
			boolean orLink = false;
			boolean andPost = false;
			boolean orPost = false;
			for (ICell inputLink : allDecompositionLinks) {
				if (destID.equals(inputLink.getTargetID())) {
					curDestLinks.add(inputLink);				
					if (inputLink.getLink().getPostType() != null) {
						evolve = true;
						if (inputLink.getLink().getPostType().equals("and"))
							andPost = true;
						if (inputLink.getLink().getPostType().equals("or"))
							orPost = true;

					}
					if (inputLink.getLink().getLinkType().equals("and"))
						andLink = true;
					if (inputLink.getLink().getLinkType().equals("or"))
						orLink = true;
				}
			}
			if (andLink && orLink)
				throw new IllegalArgumentException("Invalid decomposition relationship type.");

			AbstractLinkableElement[] linkElementsSrc = new AbstractLinkableElement[curDestLinks.size()];
			List<String> linkUniqueIDList = new ArrayList<String>();
			for (int i = 0; i < curDestLinks.size(); i++) {
				ICell link = curDestLinks.get(i);
				linkElementsSrc[i] = modelSpec.getIntentionByUniqueID(link.getSourceID());
				linkUniqueIDList.add(link.getId());
			}

			if (!evolve) {
				DecompositionType dType = null;
				if (andLink)
					dType = DecompositionType.AND;
				if (orLink)
					dType = DecompositionType.OR;
				decompositionList.add(new DecompositionLink(linkElementsSrc, intentElementDest, dType, linkUniqueIDList));
			} else {
				if (andPost && orPost)
					throw new IllegalArgumentException("Invalid evolving decomposition relationship type.");

				DecompositionType pre = null;
				DecompositionType post = null;
				if (andLink)
					pre = DecompositionType.AND;
				if (orLink)
					pre = DecompositionType.OR;
				if (andPost)
					post = DecompositionType.AND;
				if (orPost)
					post = DecompositionType.OR;
				decompositionList.add(new DecompositionLink(linkElementsSrc, intentElementDest, pre, post, absTime, linkUniqueIDList));
				for (ICell iLink : curDestLinks) {
					if (pre != null && !iLink.getLink().getLinkType().equals(pre.getCode()))
						throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
					if (pre == null && !iLink.getLink().getLinkType().equals("NO"))
						throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
					if (iLink.getLink().getPostType() == null)
						throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
					if (post != null && !iLink.getLink().getPostType().equals(post.getCode()))
						throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
					if (post == null && !iLink.getLink().getPostType().equals("NO"))
						throw new IllegalArgumentException("Relationships for ID: " + destID + " must be all the same types.");
				}
			}
			for (ICell inputLink : curDestLinks) {
				allDecompositionLinks.remove(inputLink);
			}
		}
		return decompositionList;
	}
	
}
