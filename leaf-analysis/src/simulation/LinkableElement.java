/**
 * 
 */
package simulation;

import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;

/**
 * @author A.M.Grubb
 *
 */
public abstract class LinkableElement extends ModelElement {
    String name = "NAME";
    String id = "NO-ID";
    List<ElementLink> linksSrc = new ArrayList<ElementLink>();
    List<ElementLink> linksDest = new ArrayList<ElementLink>();


	public LinkableElement(String nodeID, String nodeName) {
		id = nodeID;
		name = nodeName;
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

	public boolean isActiveRoot() { //getLinksSrcSize() == 0
		if (linksSrc.size() == 0)
			return true;
		else {
			for(ListIterator<ElementLink> li = linksSrc.listIterator(); li.hasNext(); ){
				ElementLink link = li.next();
				if (link.isActiveLink())
					return false;
			}
		}
		return true; //linksSrc.size() == 0;
	}
	public boolean isActiveLeaf() { //getLinksDestSize() == 0 
		if (linksDest.size() == 0)
			return true;
		else {
			for(ListIterator<ElementLink> li = linksDest.listIterator(); li.hasNext(); ){
				ElementLink link = li.next();
				if (link.isActiveLink())
					return false;
			}
		}
		return true; //linksDest.size() == 0;
	}
	public int getActiveLinksSrcSize() {
		int count = 0;
		for(ListIterator<ElementLink> li = linksSrc.listIterator(); li.hasNext(); ){
			ElementLink link = li.next();
			if (link.isActiveLink())
				count ++;
		}
		return count;
	}
	public int getActiveLinksDestSize() {
		int count = 0;
		for(ListIterator<ElementLink> li = linksDest.listIterator(); li.hasNext(); ){
			ElementLink link = li.next();
			if (link.isActiveLink())
				count ++;
		}
		return count;
	}

	public List<ElementLink> getLinksSrc() {
		return linksSrc;
	}
	public List<ElementLink> getLinksDest() {
		return linksDest;
	}
//	public int getLinksSrcSize() {
//		return linksSrc.size();
//	}
//	public int getLinksDestSize() {
//		return linksDest.size();
//	}

	/**
	 * @param linksDest the linksDest to set
	 */
	public void setLinksDest(List<ElementLink> linksDest) {
		this.linksDest = linksDest;
	}
	
}
