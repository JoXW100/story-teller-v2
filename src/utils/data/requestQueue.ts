import Logger from "utils/logger";

class RequestQueue {
    private waitTime = 1000;
    private requestWorkerTimeout: Record<string, NodeJS.Timeout> = {};

    public get requestIsQueued() {
        return Object.values(this.requestWorkerTimeout).some(x => x !== null);
    }

    public constructor(waitTime: number = 1000){
        this.waitTime = waitTime
    }

    /** Adds a request to the queue */
    public addRequest(action: (...params: any[]) => any, id: string, ...params: any[]) {
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
            Logger.warn("RequestQueue.handleRequest", res);
        }

        this.requestWorkerTimeout[id] = null;
        delete this.requestWorkerTimeout[id]
    }
}

export default RequestQueue;