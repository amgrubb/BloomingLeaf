/**
 * This class groups links into one Decomposition.
 * Under construction as of 4 Nov 2020.
 */

 class Decomposition {

    /**
     * Attributes:
     * {Array.<Link>} links
     * {Array.<String>} linkSrcIDs
     * {String} linkDestID
     * {String} linkType
     * {String} postType
     * {Number} absoluteValue
     */

     /**
     * @param {Link} link
     *   First new link belonging in this Decomposition
     */
     
    constructor(link) {
        this.decompID = this.createID();
        this.links = [link];
        console.log(this.links);
        this.linkSrcIDs = [link.linkSrcID];
        console.log(this.linkSrcIDs);
        this.linkDestID = link.linkDestID;
        this.linkType = link.linkType; // start type
		this.postType = link.postType; // evolves to type
		this.absoluteValue = link.absoluteValue;
    }

    /**
     * Creates and returns a 4 digit ID for this Decomposition
     *
     * @returns {String}
     */
    createID() {
        var id = Decomposition.numOfCreatedInstances.toString();
        Decomposition.numOfCreatedInstances += 1;
        while (id.length < 4){
            id = '0' + id;
        }
        return id;
    }

    /**
     * Returns true iff this Decomposition object represents
     * an evolving relationship
     * @returns {Boolean}
     */
    isEvolvingRelationship() {
        return this.postType != null;
    }

    /**
     * Returns whether a Link is part of a Decomposition
     * @param {Link} link 
     * @returns {Boolean}
     */
    includes(link){
        return this.links.includes(link);
    }

    /**
     * Add a Link to a Decomposition
     * @param {Link} link 
     */
    addLink(link){
        this.links.push(link);
        this.linkSrcIDs.push(link.linkSrcID);

        //console.log(this.links);
        //console.log(this.linkSrcIDs);

        // link types must match rest of decomposition
        link.linkType = this.linkType;
        link.postType = this.postType;
        //link.label(0 , {position: 0.5, attrs: {text: {text: linkValText[this.linkType]}}});
        //link.label(0 , {position: 0.5, attrs: {text: {text: linkValText["hi"]}}});
    }

    /**
     * Remove a Link from a Decomposition
     * @param {Link} link 
     */
    removeLink(link) {
        for (var i = 0; i < this.links.length; i++) {
            if (this.links[i] == link) {
                this.links.splice(i, 1);
                this.linkSrcIDs.splice(i, 1); // lists are parallel
                console.log("removed link");
                return;
            }
        }
    }

    /**
     * Set link type for all Links in Decomposition
     * @param {String} linkType
     */
    updateConstantRelationship(linkType){
        this.linkType = linkType;
        for (let i = 0; i < this.links.length; i++){
            this.links[i].linkType = linkType;
        }
    }

    /**
     * Returns the Decomposition object associated w/ a link,
     * or null if none exists
     * @param {Link} link 
     * @returns {Decomposition}
     */

    static findLinkDecomposition(link) {
        for (let i = 0; i < Decomposition.all.length; i++) {
            if (Decomposition.all[i].linkDestID == link.linkDestID){
                //console.log("Found destID " + link.linkDestID);
                return Decomposition.all[i];
            }
        }
        return null;
    }

    /**
     * Returns array of all links in same Decomposition as a link
     * including original link
     * @param {Link} link
     * @returns {Array.<Link>}
     */

    static findSiblingLinks(link) {
        // assumes Decomposition must exist to contain Decomposition
        return Decomposition.findLinkDecomposition(link).links;
    }


    /**
     * Add new link to correct Decomposition in the model
     * @param {Link} link 
     */
    static addNewLink(link){
        // find corresponding Decomposition and add, or create new Decomposition
        let decomp = Decomposition.findLinkDecomposition(link);
        if (decomp != null){
            decomp.addLink(link); // add to existing Decomposition
            //console.log("Added to " + decomp.decompID + " w/ links " + decomp.linkSrcIDs);
            //console.log(decomp.linkSrcIDs);
            console.log("Added to existing decomposition:");
            console.log(decomp);
            for (let i = 0; i < decomp.linkSrcIDs.length; i++){
                console.log(decomp.linkSrcIDs[i]);
            }
        } else {
            Decomposition.all.push(new Decomposition(link)); // make new Decomposition for the link
            console.log("Added new decomposition.");
        }
    }

    /**
     * Remove link from Decomposition when removing from model
     * @param {Link} link 
     */
    static removeLink(link){
        let decomp = Decomposition.findLinkDecomposition(link);
        if (decomp != null){
            decomp.removeLink(link);
        }
    }

 }
Decomposition.numOfCreatedInstances = 0;
Decomposition.all = []; // all Decompositions in the model -> eventually make attribute of model object

 /**
  * TODO:
  * - change link source
  * - change text on links; interact with cell of link to change text
  * - evolving functions change from link inspector
  * - highlighting
  */