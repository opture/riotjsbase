/* exported StorageAdapter */
/* global riot, _ */
/* exported BaseStore */
var BaseStore = function(options) {
    'use strict';
    riot.observable(this);
    var adapter = this;

    //var adapter = {};
    //Tells if there has been a call to fetch a collection, either remotely or locally.
    adapter.collectionIsLoading = false;

    adapter.newStart = true;

    //Set for how long data is considered to be fresh, makes a new request after this time.
    adapter.validHours = options.validHours || 168;

    //Keeps the collection of items.
    adapter.collection = options.collection || [];

    //The type of the individual items in the collection.
    adapter.modelType = options.modelType || function() {};

    //Setts the name of the modelcollection, used internally to store in localstorage.
    adapter.modelName = options.modelName || 'NONAME';

    //Set the models id field to enable us to retreive items based on this property.
    adapter.modelIdField = options.modelIdField || 'id';

    //Sets the remote url to fetch a colleciton of item.
    adapter.remoteUrlCollection = options.remoteUrlCollection || '';

    //Set the remote url to fetch items by id
    adapter.remoteUrlById = options.remoteUrlById || '';

    //Override function for successful received data from remote.
    adapter.remoteFetchSuccess = options.remoteFetchSuccess || adapter.getItemsSuccess;

    //Function to execute if remotereceived failed.
    adapter.remoteFetchFail = options.remoteFetchFail || function() {};

    //Default function to sort received data.
    adapter.defaultSortFunction = options.defaultSortFunction || function(a, b) {
        if (a[adapter.modelIdField] < b[adapter.modelIdField]) {
            return 1;
        } else if (a[adapter.modelIdField] > b[adapter.modelIdField]) {
            return -1;
        }
        return 0;
    };

    //Default function to filter only wanted records
    adapter.defaultFilterFunction = options.defaultFilterFunction || function() {
        return true;
    };

    //Wrapper propertyname for collection received from remote.
    adapter.collectionWrapper = options.collectionWrapper || null;

    //wrapper propertyname for objects received from remote.
    adapter.objectWrapper = options.objectWrapper || null;

    //Options for remote call as object.
    adapter.remoteOptions = options.remoteOptions || {};

    //Append to url ie: webben7.se/api/lunch/[2015-02-27]
    adapter.remoteAppendUrl = options.remoteAppendUrl || null;

    //The last page fetched data from.
    adapter.lastPage = 0;

    adapter.noPaging = options.noPaging;

    adapter.noLocalStoring = options.noLocalStoring || false;

    //function for updated element.
    adapter.collectionItemUpdated = options.collectionItemUpdated || function(item) {
        app.dispatcher.trigger(adapter.modelName + '-collection-item-updated', item);
    };


    adapter.jsonP = options.jsonP || false;

    //Event to trigger when collection changes
    adapter.on(adapter.modelName + '-list-init', function(update) {
        adapter.getCollection(update);
    });

    adapter.on(adapter.modelName + '-hit-bottom', function() {
        //Get more content function.
        if (!adapter.fetchMoreFunction) {
            adapter.fetchMoreFunction = adapter.getCollectionRemote;
        }
        adapter.fetchMoreFunction(true);
    });


    //Returns the collection sorted based on the defaultSortFunction.
    adapter.sortedCollection = function(sortFunction, filterFunction) {
        sortFunction = sortFunction || adapter.defaultSortFunction;
        filterFunction = sortFunction || adapter.defaultFilterFunction;
        var sortedCopy = adapter.collection.slice();
        sortedCopy.sort(sortFunction);
        //sortedCopy = sortedCopy.filter(adapter.defaultFilterFunction);
        return sortedCopy;
    };
    adapter.getCurrentCollection = function() {
        return adapter.collection;
    };
    //Fetch multiple items from collection.
    //Inputs: idArray: array of ids to fetch
    adapter.getByIds = function(idArray, callback) {
        //Get single elements from an array of ids, and returns an array.
        var localCallback;
        var retval = [];
        //Callback function for each id in the array.
        //when we have got as many callbacks as there were ids in the array we are done.
        localCallback = function(data) {
            retval.push(data);
            //callback(retval);

            if (retval.length === idArray.length) {
                retval.sort(adapter.defaultSortFunction);
                callback(retval);
            }
        };
        for (var i = 0; i < idArray.length; i++) {
            adapter.getById(idArray[i], localCallback);
        }
    };

    //Return a single item by Id.
    //
    adapter.getById = function(id, callback) {
        callback = callback || function() {};
        //First load the collection..
        adapter.getCollection(function(coll, updated) {
            if (updated) {
                return;
            }
            if (adapter.collection[id]) {
                callback(adapter.collection[id]);
                return adapter.collection[id];
            } else {
                //get remotely.
                adapter.getByIdRemote(id, function(item) {
                    callback(item);
                    return item;
                });
            }
        }, false, true);

    };

    //Fetcha single item remotely by id
    adapter.getByIdRemote = function(id, callback) {
        // var query = {

        // };
        // query = $.extend(query, adapter.remoteOptions);
        $.ajax({
            dataType: 'json',
            data: adapter.remoteOptions,
            url: adapter.remoteUrlCollection + '/' + id,
            success: function(data) {
                callback(adapter.collection[data[adapter.modelIdField]]);
                adapter.storeCollectionLocal();
            }
        });

    };

    //Get a collection either, if there is something in localstorage get it then fetch remotely.
    adapter.getCollection = function(forceRemote) {
        //First check for a collection in memory.
        forceRemote = true;
        var collectionInMemory = false;
        var localCollection = false;

        //Is there already a colleciton in memory.
        if (adapter.collection.length > 0) {
            collectionInMemory = true;
        }

        //Does a local stored collection exist?

        if (window.localStorage.getItem(adapter.modelName)) {
            localCollection = true;
        }



        //Nothing in memory, load something.
        if (!collectionInMemory) {
            //There is a local collection.
            if (localCollection && !adapter.noLocalStoring) {

                adapter.getCollectionLocal();

                //Load from remote too?
                if (forceRemote) {
                    adapter.getCollectionRemote();
                }
            } else {
                //Nothing in memory and no local stored.
                adapter.getCollectionRemote();
            }
        } else {
            adapter.getCollectionRemote();
        }



    };

    //Get a local collection, if it fails fetch it remotely.
    adapter.loaderTimeOut = null;
    adapter.getCollectionLocal = function() {


        //Load a collection from localstorage.
        var localStoredCollection = window.localStorage.getItem(adapter.modelName);
        var parsedCollection;

        //If there are nothing stored local return false.
        if (!localStoredCollection) {

            return false;
        }

        //Check if its toooo old data, then make a remote call and update the old data.
        parsedCollection = JSON.parse(localStoredCollection);
        adapter.collection = [];
        adapter.getItemsSuccess(parsedCollection.collection);
        adapter.collection = adapter.sortedCollection();
        app.dispatcher.trigger(adapter.modelName + '-collection-changed', adapter.collection, []);
        //adapter.getCollectionRemote();
        return true;
    };

    //Call for remote data.
    adapter.getCollectionRemote = function(force) {

        var curCallCollection = [];
        if (adapter.collectionIsLoading) {
            return false;
        }
        adapter.collectionIsLoading = true;
        if (force) {
            adapter.remoteOptions = _.extend(adapter.remoteOptions, {
                page: 0
            });
        }
        adapter.remoteOptions = _.extend(adapter.remoteOptions, {
            page: adapter.lastPage
        });


        $.ajax({
            url: adapter.remoteUrlCollection + (adapter.remoteAppendUrl ? '/' + adapter.remoteAppendUrl[0] : ''),
            cache:false,
            dataType: adapter.jsonP ? 'jsonp' : 'json', //Sets to jsonp for thos kinds of requests.
            data: adapter.remoteOptions,
            success: function(data) {
                //If we got no data, tell the

                //Is there a wrapper for the collection.
                if (adapter.collectionWrapper && data[adapter.collectionWrapper] !== null) {
                    //IF the result is empty, tell that we received an empty collection, still supply the current collection.
                    if (!data[adapter.collectionWrapper].length) {

                        app.dispatcher.trigger(adapter.modelName + '-received-empty-collection', adapter.collection);
                        adapter.collectionIsLoading = false;
                        return;
                    }
                    curCallCollection = adapter.getItemsSuccess(data[adapter.collectionWrapper]);
                } else {
                    //IF the result is empty, tell that we received an empty collection, still supply the current collection.
                    if (!data.length) {

                        app.dispatcher.trigger(adapter.modelName + '-received-empty-collection', adapter.collection);
                        adapter.collectionIsLoading = false;
                        return;

                    }

                    curCallCollection = adapter.getItemsSuccess(data);
                }

                //We received data and we are happy.
                adapter.collectionIsLoading = false;
                adapter.collection = adapter.sortedCollection();
                app.dispatcher.trigger(adapter.modelName + '-collection-changed', adapter.collection, curCallCollection);
                //Store this to the local collection.
                if (adapter.lastPage === 0) {
                    adapter.storeCollectionLocal();
                }
                if (!adapter.noPaging && !force) {
                    adapter.lastPage++;
                }


                return;
            },
            error: function(xhr) {
                //adapter.remoteOptions = {};


                adapter.collectionIsLoading = false;
                app.dispatcher.trigger(adapter.modelName + '-collection-changed', adapter.collection);

                return false;
            }
        });
    };

    //Run this upon successful retreival of categories.
    adapter.getItemsSuccess = function(data) {
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
            if (adapter.objectWrapper && data[i][adapter.objectWrapper] !== undefined) {
                curNode = data[i][adapter.objectWrapper];
            } else {
                curNode = data[i];
            }
            if (curNode) {
                //does it exist in current array already-
                var newItem = new adapter.modelType(curNode);
                if (adapter.modelIdField.length <= 0) {

                    //Insert at position i in collection.
                    adapter.collection[i] = newItem;
                    curCallCollection.push(newItem);
                    //RiotControl.trigger(adapter.modelName + '-collection-changed', adapter.collection);

                } else if (!adapter.isInCollection(newItem)) {
                    //Add a item to the collection

                    adapter.collection.push(newItem);
                    curCallCollection.push(newItem);
                    app.dispatcher.trigger(adapter.modelName + '-item-added', newItem);
                } else {
                    //This updates an item in the collection.
                    var originalObj = _.find(adapter.collection, function(item) {
                        return item[adapter.modelIdField] == newItem[adapter.modelIdField];
                    
                    });
                    var idx;
                    var oldItem = adapter.collection.find(function(_i,_idx) {
                        if (_i[adapter.modelIdField] == newItem[adapter.modelIdField]){ idx=_idx;return true; }
                    });
                
                    adapter.collection[idx] = newItem;
                    //store.kvpCOllection[newItem[store.modelIdField]] = newItem;

                    curCallCollection.push(newItem);
                    app.dispatcher.trigger(adapter.modelName + '-item-updated', newItem);
                }
            }
        }
        return curCallCollection;
    };

    //Store the collection locally
    adapter.storeCollectionLocal = function() {
        if (adapter.noLocalStoring) { return; }
        window.localStorage.setItem(adapter.modelName, JSON.stringify({
            collection: adapter.collection,
            dateStored: new Date()
        }));
    };

    //adapter.isInCollection = function(obj){
    //    var self = this;
    //    var curObj = _.find(self.collection, function(item){
    //        console.log('comparing: ' + item[self.modelIdField] + ' to ' + obj[self.modelIdField]);
    //        return item[self.modelIdField] == obj[self.modelIdField];
    //    });
    //    if (!curObj) {
    //        return false;
    //    }
    //    return true;
    //};
    return adapter;
};

BaseStore.prototype.isInCollection = function(obj) {
    'use strict';
    var self = this;

    var curObj = _.find(self.collection, function(item) {
        return item[self.modelIdField] == obj[self.modelIdField];
    });
    if (!curObj) {
        return false;
    }
    return true;
};
