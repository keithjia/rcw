/**
 * Responsible for getting the list of translated data and applying the approproiate 
 * item level collection work method to this data
 */
class CollectionRequestHandler {
    constructor(options){
        this.collectionWorker = options.collectionWorker;
        this.dataSource = options.dataSource;
        this.oDataFormatter = options.oDataFormatter;
    }

    /**
     * The method which will be called by the router to handle all HTTP methods. This method 
     * will decide wether to retrieve data from dataStore first or to pass the data to item level
     * CollectionWorker first.
     */
    handleRequest(restRequest) {
        let worker = this.collectionWorker;
        let formatter = this.oDataFormatter;
        let verb = restRequest.getMethod();

        if (this.isRoutableODataQuery(verb)){
            if (!worker.isPersisted) {
                restRequest.fail(new Error("Cannot query worker with no persisted data"));
                return;
            }

             let dataPromise = this.dataSource.executeDataQuery(restRequest.getODataQuery());

             dataPromise.then(function(dataList){

                if (Array.isArray(dataList)) {
                    restRequest.setBody(
                        formatter.formatMultipleItemResponse(
                            dataList.map(item => worker["on"+verb](item))));
                 }
                 else {
                     // this is a single item query by primary key, so there is a single
                     // result which we pass to the worker method directly
                     restRequest.setBody(
                        formatter.formatSingleItemResponse(worker["on"+verb](dataList)));
                 }

                //we need to let the CollectionRequestHandler send the response back instead of the item CollecitonWorker. 
                //Otherwise, we will be sending response multiple times when we apply the item level Handler to the data list.
                //In the future, if demand exists, we can allow client to extend this class so they can tweak the response to their liking.
                restRequest.completeOperation();
             })
             .catch(function(error){
                 //TODO: use real logger
                 console.log(error);
                 //TODO: need to update proper Error status code in ErrorHandlerModule
                 restRequest.fail(error);
             });
        }
        else {
            //It is either a POST or a DELETE, we call the collectionWorker to handle these
            worker[verb](restRequest.getBody());

            //for consistency, we need to handle sending the response here.
            restRequest.completeOperation();
        }
    }

    /**
     * Decides whether to send the oData query to data layer 
     * to retrieve a normalized list of data based on HTTP Verb
     */
    isRoutableODataQuery(verb){
        var val;

        //todo: real logic  
        switch(verb){
            case "Get":
                val = true;
            break;
            case "Post":
                val = false;
            break;
            case "Patch":
                val = true;
            break;
            case "Put":
                val = true;
            break;
            case "Delete":
                val = false;
            break;
            default:
                throw new Error(val + " not supported");
        }
        return val;
    }
}

module.exports = CollectionRequestHandler;