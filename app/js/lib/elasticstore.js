/* jshint camelcase: false, eqeqeq: false */
/* global riot, fetch */
/* exported elasticStore */
var ElasticStore = function(options) {
    'use strict';
    var store = this;
    riot.observable(store);
    RiotControl.addStore(store);
    //store name
    store.storeName = options.storeName || 'elasticStore';

    //Url to fetch items.
    store.url = options.url || null;

    //Init object to this type.
    store.objectType = options.objectType || null;

    //The models id, used for unique checking. (default id)
    store.modelIdField = options.modelIdField || 'id';

    //objectWrapper tells if there is a property that contains the item.
    store.objectWrapper = options.objectWrapper || null;

    //Items to get on each request. (default: 20)
    store.size = options.size || 20;

    //Items to get on each request. (default: 20)
    store.sort = options.sort || null;

    //lastPageFetched  (default 0.)
    store.lastPageFetched = options.lastPageFetched || 0;

    //Which item to take from (for paging the result.)
    store.from = function() {
        return store.lastPageFetched * store.size;
    };

    store.noCache = options.noCache || false;
    store.query = options.query || null;
    store.filter = options.filter || null;
    store.sortDef = options.sortDef || null;
    store.sourceMap = options.sourceMap || null;



    //Default function to sort received data.
    store.defaultSortFunction = options.defaultSortFunction || function(a, b) {
        if (a[store.modelIdField] < b[store.modelIdField]) {
            return 1;
        } else if (a[store.modelIdField] > b[store.modelIdField]) {
            return -1;
        }
        return 0;
    };


    //Holds the current collection.
    store.collection = [];
    store.kvpCOllection = {};
    store.remoteIsBusy = false;

    store.on(store.storeName + '-reached-end', function() {
        store.fetchNextPage();
    });

    store.on(store.storeName + '-check-for-new', function() {
        //If we are already fetching then dont fetch more.
        console.log('Check for new');
        if (this.remoteIsBusy) {
            return false;
        }
        console.log('Not busy');
        this.getCollectionRemote({firstPage:true});
    });

    //Event to trigger when collection changes
    store.on(store.storeName + '-list-init', function() {
        console.log('list-init on ' + store.storeName);
        store.collection = [];
        store.kvpCOllection = {};
        store.getCollection();
    });

    return this;

};

ElasticStore.prototype.fetchNextPage = function() {
    'use strict';
    var store = this;

    if (store.remoteIsBusy) {
        return false;
    }
    store.lastPageFetched++;
    store.getCollectionRemote();
};


ElasticStore.prototype.getItemById = function(id) {
    'use strict';
    var self = this;
    var retval = self.kvpCOllection[id];


    return retval

    // for (var x = 0; x < self.collection.length; x++) {
    //     if (self.collection[x][self.modelIdField] == id) {
    //         retval = self.collection[x];
    //         break;
    //     }
    // }
    // return retval;
};

ElasticStore.prototype.isInCollection = function(obj) {
    'use strict';
    var self = this;
    var collObj = self.kvpCOllection[obj[self.modelIdField]];
    if (collObj ) {
        return true;
    }else{
        return false;
    }

    // for (var x = 0; x < self.collection.length; x++) {
    //     if (self.collection[x][self.modelIdField] == obj[self.modelIdField]) {
    //         retval = true;
    //         break;
    //     }
    // }
    // return retval;
};

/** Fetch the collection from remote endpoint, and updates the collection.
  * @param {Object} - options Object with options.
  *   - firstPage makes it fetch page zero to add any new items from the remote store to the collection.
 */
ElasticStore.prototype.getCollectionRemote = function(options) {
    'use strict';
    var store = this;

    options = options || {};
    if (store.remoteIsBusy) {
        return false;
    }
    store.remoteIsBusy = true;
    var theBody = store.createElasticQuery();
    if (options.firstPage){
        theBody.from = 0;
    }
    if (store.storeName == 'FavArticles'){
        console.log('fetching favarticles');
    }
    fetch(store.url + '?_=' + new Date().getTime(), {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(theBody)
    }).then(function(response) {

        return response.json();
    }).then(function(json) {
        var hits = json.hits.hits;
        var curColl = store.getItemsSuccess(hits);
        console.log('It worked');
        RiotControl.trigger(store.storeName + '-collection-changed', store.collection, curColl);
        store.remoteIsBusy = false;

        //Store this to the local collection.
        //if (store.lastPageFetched === 0) {
            store.storeCollectionLocal();
        //}

    }).catch(function(ex) {
        console.log('It didnt work');
        store.remoteIsBusy = false;
    });
};

/** Fetch as localstore collection, and updates the collection.
 */
ElasticStore.prototype.getCollectionLocal = function() {
    'use strict';
    var store = this;

    //Load a collection from localstorage.
    var localStoredCollection = window.localStorage.getItem(store.storeName);
    var parsedCollection;

    //If there are nothing stored local return false.
    if (!localStoredCollection) {

        return false;
    }

    //Check if its toooo old data, then make a remote call and update the old data.
    parsedCollection = JSON.parse(localStoredCollection);
    store.collection = [];
    store.getItemsSuccess(parsedCollection.collection);
    localStorage.removeItem(store.storeName);
    //store.collection = store.sortedCollection();
    RiotControl.trigger(store.storeName + '-collection-changed', store.collection, []);
    //store.getCollectionRemote();
    return true;
};




//Returns the collection sorted based on the defaultSortFunction.
ElasticStore.prototype.sortedCollection = function(sortFunction, filterFunction) {
    'use strict';
    var store = this;
    sortFunction = sortFunction || store.defaultSortFunction;
    filterFunction = sortFunction || store.defaultFilterFunction;
    var sortedCopy = store.collection.slice();
    sortedCopy.sort(sortFunction);
    //sortedCopy = sortedCopy.filter(adapter.defaultFilterFunction);
    return sortedCopy;
};



/** Handles a collection and adds item to the store collection.
 * @param {Array} data - The array holding the raw objects to convert to a model.
 */
ElasticStore.prototype.getItemsSuccess = function(data) {
    'use strict';
    var store = this;
    var curNode = {};
    var curCallCollection = [];
    //Check that there is data coming.
    if (!Array.isArray(data)) {
        data = [].concat(data);
    }
    if (!data) {
        return;
    }

    for (var i = 0; i < data.length; i++) {
        if (store.objectWrapper && data[i][store.objectWrapper] !== undefined) {
            curNode = data[i][store.objectWrapper];
        } else {
            curNode = data[i];
        }
        if (curNode) {
            //does it exist in current array already-
            //instantiate the propert type for the item.
            var newItem = new store.objectType(curNode);

            if (store.modelIdField.length <= 0) {

                //Insert at position i in collection.
                store.collection[i] = newItem;
                store.kvpCOllection[newItem[store.modelIdField]] = newItem;
                curCallCollection.push(newItem);

            } else if (!store.isInCollection(newItem)) {
                //Add a item to the collection
                if (store.storeName == 'LgOrganisations'){
                    console.log('LgOrganisations add');
                    console.log(newItem);
                }
                store.collection.push(newItem);
                curCallCollection.push(newItem);
                store.kvpCOllection[newItem[store.modelIdField]] = newItem;
                RiotControl.trigger(store.storeName + '-item-added', newItem);
            } else {
                //This updates an item in the collection.

                curCallCollection.push(newItem);
                
                var idx;
                var oldItem = store.collection.find(function(_i,_idx) {
                    if (_i[store.modelIdField] == newItem[store.modelIdField]){ idx=_idx;return true; }
                });
                
                store.collection[idx] = newItem;
                console.log('updating item');
                store.kvpCOllection[newItem[store.modelIdField]] = newItem;

                RiotControl.trigger(store.storeName + '-item-updated', newItem);
            }
        }
    }
    curCallCollection.sort(store.defaultSortFunction);
    store.collection = store.sortedCollection();

    return curCallCollection;
};

/** Creates a elasticsearch query from the settings of the store.
 * @returns {Object} - Returns a basic elasticsearch formatted search query.
 */
ElasticStore.prototype.createElasticQuery = function() {
    'use strict';
    var store = this;
    var retval = {};

    if (store.query) {
        retval.query = store.query;
    }
    if (store.filter) {
        retval.filter = store.filter;
    }
    if (store.size) {
        retval.size = store.size;
    }
    if (store.from) {
        retval.from = store.from();
    }
    if (store.sort) {
        retval.sort = store.sort || store.sortDef || null;
    }

    // if (store.sortDef) {
    //     retval.sort = store.sortDef;
    // }
    if (store.sourceMap) {
        retval._source = store.sourceMap;
    }

    return retval;
};

//Store the collection locally
ElasticStore.prototype.storeCollectionLocal = function() {
    'use strict';
    var store = this;
    if (store.noCache) return;

    window.localStorage.setItem(store.storeName, JSON.stringify({
        collection: store.collection.slice(0,19),
        dateStored: new Date()
    }));
};

if (typeof(module) !== 'undefined') {
    module.exports = ElasticStore;
}

//Get a collection either, if there is something in localstorage get it then fetch remotely.
ElasticStore.prototype.getCollection = function(forceRemote) {

        'use strict';

        var store = this;
        //First check for a collection in memory.
        forceRemote = true;
        var collectionInMemory = false;
        var localCollection = false;

        //Is there already a colleciton in memory.
        if (store.collection.length > 0) {
            collectionInMemory = true;

        }

        //Does a local stored collection exist?
        if (window.localStorage.getItem(store.storeName)) {
            localCollection = true;
        }

        //Nothing in memory, load something.
        if (!collectionInMemory) {
            //There is a local collection.
            if (localCollection) {

                store.getCollectionLocal();

                //Load from remote too?
                //if (forceRemote) {
                    store.getCollectionRemote();
                //}
            } else {
                //Nothing in memory and no local stored.
                store.getCollectionRemote();
            }
        } else {
            store.getCollectionRemote();
        }
};
