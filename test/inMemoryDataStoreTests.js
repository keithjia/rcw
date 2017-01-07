let InMemoryDataStore = require("../src/InMemoryDataStore");

module.exports = {
    setUp: function (callback) {
        this.store = new InMemoryDataStore();
        callback();
    },
    tearDown: function (callback) {
        console.log(this.store.toString());
        callback();
    },
    
    testPut: function (test) {
        this.store.put("keith", 99);
        this.store.put("bob", 100);
        this.store.put("george", 101);

        this.store.get("keith").then(function(val){
            test.strictEqual(val, 99);
        });

        this.store.get("bob").then(function(val){
            test.strictEqual(val, 100);
        });

        this.store.get("george").then(function(val){
            test.strictEqual(val, 101);
            test.done();
        });
    },

    testRemove: function(test) {
        this.store.put("keith", 99);
        this.store.put("bob", 100);

        this.store.remove("keith");
        
        this.store.get("keith").then(function(val){
            test.strictEqual(val, undefined);
            test.done();
        });
    },

    testParseOData: function(test) {
        let key = this.store.parseOData("/authors('keith')");
        console.log(key);
        test.strictEqual(key, "keith");

        key = this.store.parseOData("/authors('bob')");
        console.log(key);
        test.strictEqual(key, "bob");

        test.done();
    },

    testExecuteQuery: function(test) {
        this.store.put("/authors('keith')", 99);
        this.store.put("/authors('bob')", 100);
        this.store.put("/authors('george')", 101);
        this.store.put("/authors('random')", -1);
        this.store.put("/books('theOne')", 2);
        

        this.store.executeDataQuery("/authors('bob')").then(function(val){
            test.strictEqual(val, 100);
        });

        this.store.executeDataQuery("/authors").then(function(val){
            test.deepEqual(val, [99, 100, 101, -1]);
            test.done();
        });

    }
};