/**
 * 
 */
package simulation;

import java.util.ArrayList;
import java.util.List;

/**
 * @author A.M.Grubb
 *
 */
public abstract class LinkableElement{
    public String name = "NAME";
    public String id = "NO-ID";
    private String uniqueID = "null"; 
    List<ElementLink> linksSrc = new ArrayList<ElementLink>();
    List<ElementLink> linksDest = new ArrayList<ElementLink>();
	
	public int getIdNum() {
		return Integer.parseInt(id);
	}
	public LinkableElement(String nodeID, String nodeName) {
		this.id = nodeID;
		this.name = nodeName;
	}
	public LinkableElement(String nodeID, String nodeName, String uniqueID) {
		this.id = nodeID;
		this.name = nodeName;
		this.uniqueID = uniqueID;
	}
	public String getUniqueID() {
		return this.uniqueID;
	}
    public void addLinksAsSrc(ElementLink iLink){
        linksSrc.add(iLink);
    }
    public void addLinksAsDest(ElementLink iLink){
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
	public void setLinksSrc(List<ElementLink> linksSrc) {
		this.linksSrc = linksSrc;
	}

	public List<ElementLink> getLinksSrc() {
		return linksSrc;
	}
	public List<ElementLink> getLinksDest() {
		return linksDest;
	}

	/**
	 * @param linksDest the linksDest to set
	 */
	public void setLinksDest(List<ElementLink> linksDest) {
		this.linksDest = linksDest;
	}
	
}
