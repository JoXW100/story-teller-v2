import { MongoClient } from "mongodb";
import FilesInterface from "./files";
import StoriesInterface from "./stories";
import { DBResponse } from "types/database";
import { globalVars } from "types/globalVars";

abstract class Database 
{
    private static connection: MongoClient = null;
    private static _isConnected: boolean = false;
    private static _stories: StoriesInterface;
    private static _files: FilesInterface;

    static get isConnected(): boolean { return this._isConnected }
    static get stories(): StoriesInterface { return this._stories }
    static get files(): FilesInterface { return this._files }

    static async connect(): Promise<DBResponse<boolean>> {
        if (!this.isConnected)
        {
            try {
                let client: Promise<MongoClient>;
                if (globalVars._mongoClientPromise) {
                    client = globalVars._mongoClientPromise
                } else {
                    client = MongoClient.connect(process.env.MONGODB_URI)
                    globalVars._mongoClientPromise = client;
                }

                this.connection = await client;
                let database = this.connection.db(process.env.MONGODB_DB)
                this._stories = new StoriesInterface(database);
                this._files = new FilesInterface(database);
                this._isConnected = true;
            } catch (error) {
                console.error(error)
                this.connection = null;
                this._isConnected = false;
                this._stories = null;
                this._files = null;
                return failure(error.message)
            }
        }
        return success(this.connection);
    }
}

export const success = (value: any): DBResponse<any> => {
    return { success: true, result: value }
}

export const failure = (value: any = null): DBResponse<any> => {
    return { success: false, result: value }
}

export default Database;