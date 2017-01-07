let CollectionRequestHandler = require("../src/collectionRequestHandler");
let InMemoryDataStore =  require("../src/inMemoryDataStore");
let ODataFormatter =  require("../src/oDataFormatter");

// mock restOperation
class RestOperation {
    constructor() {}

    getMethod() {
        return this.method;
    }

    setMethod(m) {
        this.method = m;
        return this;
    }

    getODataQuery() {
        return this.oDataQuery;
    }

    setODataQuery(q) {
        this.oDataQuery = q;
        return this;
    }

    setBody(b) {
        this.body = b;
    }

    completeOperation() {

    }
}

// example mock collection worker
class AuthorWorker {
    constructor() {}

    onGet(dataItem) {
        return ++dataItem;
    }
}

module.exports = {
    setUp: function (callback) {
        this.collectionWorker = new AuthorWorker();
        this.dataStore = new InMemoryDataStore();
        this.formatter = new ODataFormatter();

        // mock out method to simply return without formatting
        this.formatter.formatMultipleItemResponse = function(dataList){
            return dataList;
        };

        this.formatter.formatSingleItemResponse = function(dataList){
            return dataList;
        }

        //populate data store
        this.dataStore.put("/authors('keith')", 99);
        this.dataStore.put("/authors('bob')", 100);
        this.dataStore.put("/authors('george')", 101);
        this.dataStore.put("/authors('random')", -1);
        this.dataStore.put("/books('theOne')", 2);

        this.collectionWorker.isPersisted = true;

        this.collectionHandler = new CollectionRequestHandler({
            "collectionWorker" : this.collectionWorker,
            "dataSource" : this.dataStore,
            "oDataFormatter" : this.formatter
        });

        callback();
    },

    tearDown: function (callback) {
        callback();
    },
    
    testHandleGetAllRequest: function (test) {
        let restRequest = new RestOperation().setMethod("Get").setODataQuery("/authors");

        //expect restRequest.completeOperation() to eventually be called and that the data 
        //should have all been incremented by 1 per logic in AuthorWorker.onGet()
        restRequest.completeOperation = function() {
            test.deepEqual(this.body,  [100, 101, 102, 0]);
            test.done();
        };

        this.collectionHandler.handleRequest(restRequest);
    },

    testHandleGetSingleAuthorRequest: function (test) {
        let restRequest = new RestOperation().setMethod("Get").setODataQuery("/authors('keith')");

        //expect restRequest.completeOperation() to eventually be called and that the data 
        //should have all been incremented by 1 per logic in AuthorWorker.onGet()
        restRequest.completeOperation = function() {
            test.deepEqual(this.body, 100);
            test.done();
        };

        this.collectionHandler.handleRequest(restRequest);
    }
};