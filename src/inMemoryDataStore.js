const URL = require('url');

class InMemoryDataStore {
    constructor(){
        this.data = {};
    }

    executeDataQuery(oDataQuery){
        var theData = this.data;
        var primaryKey = this.parseOData(oDataQuery);

        return new Promise(
            function(resolve, reject) {
                // This is only an example to create asynchronism
                setTimeout(function() {
                    if (primaryKey) {
                        for (let itemKey in theData){
                            if (itemKey === oDataQuery) {
                                resolve(theData[itemKey]);
                            }
                        }

                        resolve({});
                    }
                    else {
                        let result = [];
                        for (let itemKey in theData) {
                            if (itemKey.startsWith(oDataQuery)){
                                result.push(theData[itemKey]);
                            }
                        }

                        resolve(result);
                    }
                }, 100);
            }
        );
    }

    parseOData(oDataQuery) {
        const regex =  /\/.+\(\'(.+)\'\)/g;
        let matches = regex.exec(oDataQuery);

        if (matches && matches.length > 0){
            return matches[1];
        }
    }

    get(key) {
        var theData = this.data;

        return new Promise(function(resolve, reject) {
            resolve(theData[key]);
        });
    }

    put(key, val) {
        var theData = this.data;

        return new Promise(function(resolve, reject) {
            theData[key] = val;
            resolve(val);
        });
    }

    remove(key) {
        var theData = this.data;

        return new Promise(function(resolve, reject) {
            let obj = theData[key];
            delete theData[key];
            resolve(obj);
        });
    }

    toString() {
        var result = "\n===Data Store===\n";
        
        for (var ind in this.data){
            result += ind + " : " + this.data[ind] + "\n";
        }
        return result;
    }
}

module.exports = InMemoryDataStore;