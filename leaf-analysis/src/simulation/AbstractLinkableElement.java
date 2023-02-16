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
 
    List<AbstractElementLink> linksSrc = new ArrayList<AbstractElementLink>(); //links where this is the src
    List<AbstractElementLink> linksDest = new ArrayList<AbstractElementLink>(); //links where this is the dest
    
    VisualInfo visual = null;
	
	public int getIdNum() {
		return Integer.parseInt(id);
	}
	public AbstractLinkableElement(String nodeID, String nodeName) {
		super(null);
		this.id = nodeID;
		this.name = nodeName.trim();
	}
	public AbstractLinkableElement(String nodeID, String nodeName, String uniqueID) {
		super(uniqueID);
		this.id = nodeID;
		this.name = nodeName.trim();
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
	
	public List<AbstractLinkableElement> getConnectedElems(){
		List<AbstractLinkableElement> myConnections = new ArrayList<AbstractLinkableElement>();
		
		//get the dest for the links where this is the src
		for(AbstractElementLink link: this.linksSrc) {
			myConnections.add(link.getDest());
		}
		
		//get the src's for the links where this is the dest
		for(AbstractElementLink link: this.linksDest) {
			for(AbstractLinkableElement srcElem: link.getSrc()) {
				myConnections.add(srcElem);
			}
		}
		
		return myConnections;
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
	
	public Double getX() {
		return visual.getX();
	}

	public Double getY() {
		return visual.getY();
	}

	public void setX(Double x) {
		this.visual.setX(x);
	}
	
	public void setY(Double y) {
		this.visual.setY(y);
	}
	
	public Integer getWidth() {
		return visual.getWidth();
	}

	public Integer getHeight() {
		return visual.getHeight();
	}
	
	public void setSize(BISize size) {
		this.visual.setSize(size);
	}
	
	public void setWidth(Integer width) {
		this.visual.setWidth(width);
	}

	public void setHeight(Integer height) {
		this.visual.setHeight(height);
	}
	
	public BIPosition getPosition() {
		// return if visualInfo exists
		if (this.visual != null) {
			return this.visual.getPosition();
		} else {
			return null;
		}
	}
	
	public String toString() {
		return name;
	}
	
}
