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
    public addRequest(action: (...params: any[]) => void, id: string, ...params: any[]) {
        clearTimeout(this.requestWorkerTimeout[id]);
        this.requestWorkerTimeout[id] = setTimeout(
            this.handleRequest, 
            this.waitTime, 
            action, id, ...params
        );
    }

    private handleRequest = (action: (...params: any[]) => void, id: string, ...params: any[]) => {
        try {
            action(...params)
        } catch (error: unknown) {
            Logger.throw("RequestQueue.handleRequest", error);
        }
        this.requestWorkerTimeout[id] = null;
        delete this.requestWorkerTimeout[id]
    }
}

export default RequestQueue;