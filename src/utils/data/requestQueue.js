
class RequestQueue {
    #waitTime = 1000;
    #requestWorkerTimeout = {};

    /**
     * @param {(params: [?]) => ?} action 
     * @param {string} id
     */
    addRequest(action, id, ...params) {
        clearTimeout(this.#requestWorkerTimeout[id]);
        this.#requestWorkerTimeout[id] = setTimeout(
            this.#handleRequest, 
            this.#waitTime, 
            action, 
            id,
            ...params
        );
    }
    
    get requestIsQueued() {
        return Object.values(this.#requestWorkerTimeout).some(x => x !== null);
    } 

    #handleRequest = (action, id, ...params) => {
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

        this.#requestWorkerTimeout[id] = null;
    }
}

export default RequestQueue;