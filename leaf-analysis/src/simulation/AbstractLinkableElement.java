/**
 * 
 */
package simulation;

import merge.VisualInfo;

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
    
    VisualInfo visual;
	
	public int getIdNum() {
		return Integer.parseInt(id);
	}
	public AbstractLinkableElement(String nodeID, String nodeName) {
		super(null);
		this.id = nodeID;
		this.name = nodeName;
	}
	public AbstractLinkableElement(String nodeID, String nodeName, String uniqueID) {
		super(uniqueID);
		this.id = nodeID;
		this.name = nodeName;
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
	
}
