package simulation;

import java.util.ArrayList;
import java.util.List;

import gson_classes.ICell;

public class DecompositionLink extends ElementLink {
	private DecompositionType preDecomposition = null;
	private DecompositionType postDecomposition = null;
	private int absTime = -1; 					//Optional absolute time of transition.

	public DecompositionLink(LinkableElement[] s, LinkableElement d, DecompositionType r1, DecompositionType r2, int absoluteTime) {
		super(s, d);
		this.preDecomposition = r1;
		this.postDecomposition = r2;
		this.absTime = absoluteTime;
	}

	public DecompositionType getPreDecomposition() {
		return preDecomposition;
	}

//	public void setPreDecomposition(DecompositionType preDecomposition) {
//		this.preDecomposition = preDecomposition;
//	}

	public DecompositionType getPostDecomposition() {
		return postDecomposition;
	}

//	public void setPostDecomposition(DecompositionType postDecomposition) {
//		this.postDecomposition = postDecomposition;
//	}

	public int getAbsTime() {
		return absTime;
	}
	public static List<DecompositionLink> createDecompositionLinks(ArrayList<ICell> allDecompositionLinks, List<IntentionalElement> elementList) {
		List<DecompositionLink> decompositionList = new ArrayList<DecompositionLink>();

		while (allDecompositionLinks.size() > 0) {				
			String destID = allDecompositionLinks.get(0).getTargetID();
			int absTime;
			if (allDecompositionLinks.get(0).getLink().getAbsTime() == null)
				absTime = -1;
			else
				absTime = allDecompositionLinks.get(0).getLink().getAbsTime();
			IntentionalElement intentElementDest = getIntentionalElementByUniqueID(destID, elementList);
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

			LinkableElement[] linkElementsSrc = new LinkableElement[curDestLinks.size()];
			for (int i = 0; i < curDestLinks.size(); i++) {
				ICell link = curDestLinks.get(i);
				linkElementsSrc[i] = getIntentionalElementByUniqueID(link.getSourceID(), elementList);
			}

			if (!evolve) {
				DecompositionType dType = null;
				if (andLink)
					dType = DecompositionType.AND;
				if (orLink)
					dType = DecompositionType.OR;
				decompositionList.add(new DecompositionLink(linkElementsSrc, intentElementDest, dType, null, -1));
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
				decompositionList.add(new DecompositionLink(linkElementsSrc, intentElementDest, pre, post, absTime));
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
	
	
	
	
	
	/** **** Duplicated from BIModelSpecBuilder.java and ModelSpecBuilder.java
	 * Return the first IntentionalElement by its ID
	 * @param elementId
	 * The id of the required element
	 * @param list
	 * The model specification containing a list of all intentional elements
	 * @return
	 * returns the intentional element if exist or null
	 */
	private static IntentionalElement getIntentionalElementByUniqueID(String elementId, List<IntentionalElement> list) {
		for(IntentionalElement iElement : list){
			if(iElement.getUniqueID().equals(elementId))
				return iElement;
		}
		return null;
	}
}
