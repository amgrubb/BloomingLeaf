/** This file contains backbone model representations of the original model objects - WIP */
var LinkCollection = Backbone.Collection.extend({
    
})
var LinkBB = Backbone.Model.extend({
    idAttribute: "uid",
    
    initialize: function(options){
        
        this.linkSrcID = options.linkSrcID;
        this.linkType =  'AND';
        this.absoluteValue =  -1;
        this.linkID = this.createID();
        this.numOfCreatedInstances = new LinkCollection([]);
    },
    
    defaults: {
        type: 'Intention',
        postType: null,
        linkDestID: null,
        numOfCreatedInstances: new LinkCollection([]),
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