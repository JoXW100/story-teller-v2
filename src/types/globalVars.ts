import { MongoClient } from "mongodb"

export var globalVars = global as typeof globalThis & {
    _mongoClientPromise: Promise<MongoClient>
}