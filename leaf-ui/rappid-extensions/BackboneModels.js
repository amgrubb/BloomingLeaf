/** This file contains backbone model representations of the original model objects - WIP */
var LinkCollection = Backbone.Collection.extend({
    defaults: {
        numOfCreatedInstances: 0,
    },
    createID: function(){
        var id = this.collection.numOfCreatedInstances.toString();
        while (id.length < 4){
            id = '0' + id;
        }
        this.collection.numOfCreatedInstances += 1;
        return id;
    },
})
var LinkBB = Backbone.Model.extend({
    collection: LinkCollection,
    initialize: function(){
        this.listenTo(this, 'change:type', this.checkType);
    },
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
    defaults: {
        type: 'Intention',
        linkID: creatID(),
        linkType: 'AND',
        postType: null,
        //these are for the other branch 
        //evolving: false,
        //selected: false,
        //relationship: 'Constant',
    },
    absoluteValue: -1,
    linkSrcID: null,//isn't the same ID as the source? Maybe there is a way
    linkDestID: null,
    checkType: function(){
        if (this.get('type') == 'Actor'){
            this.set('evolving', false);
            this.set('selected', false);
        }
    },
    isEvolvingRelationship: function() {
        return this.postType != null;
    },
})