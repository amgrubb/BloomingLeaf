/** This file contains backbone model representations of the original model objects - WIP */
var LinkCollection = Backbone.Collection.extend({
    
})
var LinkBB = Backbone.Model.extend({
    idAttribute: "uid",
    /**
     * {String} linkType
     *   Type of the link. ex: 'AND', 'OR', 'NO', etc.
     * {String} linkSrcID
     *   ID for the source of the link. ex: '0000'
     * {String} linkDestID
     *   ID for the destination of the link. ex: '0001'
     * {Number} absoluteValue
     *   TODO ex. -1, 0,...,n
     */
     initialize: function(options){
        
        this.linkSrcID = options.linkSrcID;//isn't the same ID as the source? Maybe there is a way
        this.linkType =  'AND';
        this.absoluteValue =  -1;
        this.linkID = this.createID();
        this.numOfCreatedInstances = new LinkCollection([]);
     },
    
    defaults: {
        type: 'Intention',
        postType: null,
        linkDestID: null,
        //linkID: createID(),
        numOfCreatedInstances: new LinkCollection([]),
        //these are for the other branch 
        //evolving: false,
        //selected: false,
        //relationship: 'Constant',
    },
    checkType: function(){
        if (this.get('type') == 'Actor'){
            this.set('evolving', false);
            this.set('selected', false);
        }
    },
    isEvolvingRelationship: function() {
        return this.postType != null;
    },
    createID: function(){
        var id = this.get('numOfCreatedInstances').length.toString();
        while (id.length < 4){
            id = '0' + id;
        }
        this.get('numOfCreatedInstances').length ++;
        return id;
    },
})