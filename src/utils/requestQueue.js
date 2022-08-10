
class RequestQueue {
    #waitTime = 1000;
    #requestWorkerTimeout = null;

    /**
     * @param {(params: [?]) => ?} action 
     */
    addRequest(action, ...params) {
        clearTimeout(this.#requestWorkerTimeout);
        this.#requestWorkerTimeout = setTimeout(
            this.#handleRequest, 
            this.#waitTime, 
            action, 
            ...params
        );
    }
    
    get requestIsQueued() {
        return this.#requestWorkerTimeout != null;
    } 

    #handleRequest = (action, ...params) => {
        var res = null;
        var success = false;
    
        try {
            res = action(...params)
            success = true;
        } 
        catch (error) {
            res = error.message;
        }
        
        if (!success) {
            console.warn(res);
        }

        this.#requestWorkerTimeout = null;
    }
}

export default RequestQueue;