import { MongoClient } from "mongodb";
import FilesInterface from "./files";
import StoriesInterface from "./stories";
import { DBResponse } from "types/database";
import { globalVars } from "types/globalVars";

class Database 
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

    static log (name: string, data: any) {
        if (process.env.NODE_ENV != "development")
            return
        var date = new Date()
        var year = date.getFullYear()
        var month = date.getMonth()
        var m = (month < 10 ? '0' : '') + String(month)
        var day = date.getDay()
        var d = (day < 10 ? '0' : '') + String(day)
        var hour = date.getHours()
        var h = (hour < 10 ? '0' : '') + String(hour)
        var minute = date.getMinutes()
        var i = (minute < 10 ? '0' : '') + String(minute)
        var second = date.getSeconds()
        var s = (second < 10 ? '0' : '') + String(second)
        var millisecond = date.getMilliseconds()
        var l = (millisecond < 100 ? '0' : '') + String(Math.floor(millisecond / 10))
        var dateText = `${year}-${m}-${d} ${h}:${i}:${s}.${l}`
        console.log(`[${dateText}] ${name} → ${data}`)
    }
}

export const success = (value: any): DBResponse<any> => {
    return { success: true, result: value }
}

export const failure = (value: any = null): DBResponse<any> => {
    return { success: false, result: value }
}

export default Database;