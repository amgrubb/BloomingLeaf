/**
 * 
 */
package simulation;

import merge.VisualInfo;
import gson_classes.BISize;
import gson_classes.BIPosition;

import java.util.ArrayList;
import java.util.List;

/**
 * @author A.M.Grubb
 *
 */
public abstract class AbstractLinkableElement extends AbstractElement{
	protected String name = "NAME";
    protected String id = "NO-ID";	//Format that maps to array ordering.
 
    List<AbstractElementLink> linksSrc = new ArrayList<AbstractElementLink>();
    List<AbstractElementLink> linksDest = new ArrayList<AbstractElementLink>();
    
    VisualInfo visual = null;
	
	public int getIdNum() {
		return Integer.parseInt(id);
	}
	/**
	 * @param nodeID - backend ID
	 * @param nodeName - name in words
	 * @param uniqueID - frontend ID, unique among all cell-types (actor, intention, link)
	 */
	public AbstractLinkableElement(String nodeID, String nodeName) {
		super(null);
		this.id = nodeID;				// backend ID, created in BIModelSpecBuilder (actors) or Intention.getNewBackendID() (during Intention.createIntention())
		this.name = nodeName.trim();  	// name in words, as set by the user (e.g. 'actor1' or 'go to grad school')
	}
	public AbstractLinkableElement(String nodeID, String nodeName, String uniqueID) {
		super(uniqueID);
		this.id = nodeID;				// backend ID, created in BIModelSpecBuilder (actors) or Intention.getNewBackendID() (during Intention.createIntention())
		this.name = nodeName.trim();  	// name in words, as set by the user (e.g. 'actor1' or 'go to grad school')
	}
    public void addLinksAsSrc(AbstractElementLink iLink){
        linksSrc.add(iLink);
    }
    public void addLinksAsDest(AbstractElementLink iLink){
        linksDest.add(iLink);
    }

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the id
	 */
	public String getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(String id) {
		this.id = id;
	}

	/**
	 * @param linksSrc the linksSrc to set
	 */
	public void setLinksSrc(List<AbstractElementLink> linksSrc) {
		this.linksSrc = linksSrc;
	}

	public List<AbstractElementLink> getLinksSrc() {
		return linksSrc;
	}
	public List<AbstractElementLink> getLinksDest() {
		return linksDest;
	}

	/**
	 * @param linksDest the linksDest to set
	 */
	public void setLinksDest(List<AbstractElementLink> linksDest) {
		this.linksDest = linksDest;
	}
	
	/**
	 * @param width the width on the paper
	 * @param height the height on the paper
	 * @param x the x position on the paper
	 * @param y the y position on the paper
	 */
	public void setVisualInfo(VisualInfo visualInfo) {
		this.visual = visualInfo;
	}
	
	public VisualInfo getVisualInfo() {
		return this.visual;
	}
	
	public BISize getSize() {
		// return if visualInfo exists
		if (this.visual != null) {
			return this.visual.getSize();
		} else {
			return null;
		}
	}
	
	public BIPosition getPosition() {
		// return if visualInfo exists
		if (this.visual != null) {
			return this.visual.getPosition();
		} else {
			return null;
		}
	}
	
}
