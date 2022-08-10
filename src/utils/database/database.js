import { MongoClient } from "mongodb";
import FilesInterface from "./files";
import { success, failure } from "./functions";
import StoriesInterface from "./stories";

class Database 
{
    /** @type {MongoClient} @private */
    static #connection = null;
    /** @type {boolean} @private */
    static #isConnected = false;
    /** @type {StoriesInterface} @private */
    static #stories;
    /** @type {FilesInterface} @private */
    static #files;

    /** @returns {boolean} */
    static get isConnected() { return this.#isConnected }
    /** @returns {StoriesInterface} */
    static get stories() { return this.#stories }
    /** @returns {FilesInterface} */
    static get files() { return this.#files }

    /**
     * @returns {Promise<DBResponse<boolean>>}
     */
    static async connect() {
        if (!this.isConnected)
        {
            try
            {
                /** @type {Promise<MongoClient>} */
                let client;
                if (global._mongoClientPromise) {
                    client = global._mongoClientPromise
                }
                else {
                    client = MongoClient.connect(process.env.MONGODB_URI)
                    global._mongoClientPromise = client;
                }

                this.#connection = await client;
                let database = this.#connection.db(process.env.MONGODB_DB)
                this.#stories = new StoriesInterface(database);
                this.#files = new FilesInterface(database);
                this.#isConnected = true;
            }
            catch (error)
            {
                console.error(error)
                this.#connection = null;
                this.#isConnected = false;
                this.#stories = null;
                return failure(error.message)
            }
        }
        return success(this.#connection);
    }
}

export default Database;