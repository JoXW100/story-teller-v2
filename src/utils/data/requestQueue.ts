
class RequestQueue {
    private waitTime = 1000;
    private requestWorkerTimeout: { [id: string]: NodeJS.Timeout } = {};

    get requestIsQueued() {
        return Object.values(this.requestWorkerTimeout).some(x => x !== null);
    }

    /** Adds a request to the queue */
    addRequest(action: (...params: any[]) => any, id: string, ...params: any[]) {
        clearTimeout(this.requestWorkerTimeout[id]);
        this.requestWorkerTimeout[id] = setTimeout(
            this.handleRequest, 
            this.waitTime, 
            action, id, ...params
        );
    }

    private handleRequest = (action: (...params: any[]) => any, id: string, ...params: any[]) => {
        var res = null;
        var success = false;
    
        try {
            res = action(...params)
            success = true;
        } catch (error) {
            res = error.message;
        }
        
        if (!success) {
            console.warn(res);
        }

        this.requestWorkerTimeout[id] = null;
        delete this.requestWorkerTimeout[id]
    }
}

export default RequestQueue;