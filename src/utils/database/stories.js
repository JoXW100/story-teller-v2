import { ObjectId } from "mongodb";
import { failure, success } from "./functions";
import { FileType } from "@enums/database";
import Database from "./database";
import '@types/database'


class StoriesInterface
{
    /** @type {import('mongodb').Collection} @private */
    #collection;

    /**
     * Creates a new DBRequestInterface
     * @constructor
     * @param {import('mongodb').Db} database The database to use
     */
    constructor(database) {
        this.#collection = database.collection('stories');
    }

    /**
     * Adds a story to the database
     * @param {string} userId The id of the user
     * @param {string} name The name of the story to add
     * @param {string} desc The description of the story to add
     * @returns {Promise<DBResponse<ObjectId>>} The id of the story inside the database
     */
    async add(userId, name, desc) {
        try
        {
            let request = {
                _userId: userId,
                name: name,
                desc: desc,
                dateCreated: Date.now(),
                dateUpdated: Date.now()
            }

            let result = await this.#collection.insertOne(request);
            try {
                let response = await Database.files.add(userId, result.insertedId, null, FileType.Root)
                if (response.success) {
                    console.log(`Add Story: (${name}) => ${result.insertedId}`);
                    return success(result.insertedId)
                }   
                throw new Error("Failed inserting root file")
            } catch (error) {
                this.#collection.deleteOne({_id: ObjectId(result.insertedId)})
                return failure(error.message)
            }
        }
        catch (error)
        {
            return failure(error.message);
        }
    }

    /**
     * Gets all stories from the database
     * @param {string} userId The id of the user
     * @param {import('@types/database').ObjectId} storyId
     * @returns {Promise<DBResponse<[DBStory]>>} The story
     */
    async get(userId, storyId) {
        try
        {
            let result = (await this.#collection.aggregate([
                { $match: { _userId: userId, _id: ObjectId(storyId) }},
                { $lookup: {
                    from: 'files',
                    pipeline: [
                        { $match: { 
                            _userId: userId,
                            _storyId: ObjectId(storyId),
                            type: FileType.Root
                        }},
                        { $limit: 1 }
                    ],
                    as: 'root' 
                }},
                { $project: { 
                    _id: 0, 
                    id: '$_id', 
                    root: { $first: '$root._id' },
                    name: '$name',
                    desc: '$desc', 
                    dateCreated: '$dateCreated',
                    dateUpdated: '$dateUpdated'
                }},
                { $limit: 1 }
            ]).toArray())[0]
            console.log(`Get: => ${result?.name}`);
            return success(result);
        }
        catch (error)
        {
            return failure(error.message);
        }
    }

    /**
     * Deletes a story from the database
     * @param {string} userId The id of the user
     * @param {import('@types/database').ObjectId} storyId The id of the story
     * @returns {Promise<import('@types/database').DBResponse<boolean>>}
     */
    async delete(userId, storyId) {
        try
        {
            let filter = { _userId: userId, _id: ObjectId(storyId) }
            let result = await this.#collection.deleteOne(filter)
            console.log(`Delete: => ${storyId} (${result.deletedCount})`);
            if (result.deletedCount === 1) {
                await Database.files.deleteFrom(storyId)
            }
            return success(result.deletedCount === 1);
        }
        catch (error)
        {
            return failure(error.message);
        }
    }

    /**
     * Updates a story
     * @param {string} userId The id of the user
     * @param {import('@types/database').ObjectId} storyId 
     * @param {import('@types/database').DBStoryUpdate} update 
     */
    async update(userId, storyId, update) {
        try
        {
            let filter = { _userId: userId, _id: ObjectId(storyId) }
            let values = { $set: { dateUpdated: Date.now()} }
            update.name && (values.$set.name = update.name)
            update.desc && (values.$set.desc = update.desc)
            let result = await this.#collection.updateOne(filter, values)
            console.log(`GetAll: => ${result.upsertedCount > 0}`);
            return result.upsertedCount > 0 
                ? success(result)
                : failure(result)
        }
        catch (error)
        {
            return failure(error.message);
        }
    }
    
    /**
     * Gets all stories from the database
     * @param {string} userId The id of the user
     * @returns {Promise<DBResponse<[DBStory]>>} The story
     */
    async getAll(userId) {
        try
        {
            let result = await this.#collection.find({ _userId: userId }).toArray();
            console.log(`GetAll: => ${result.length}`);
            return success(result);
        }
        catch (error)
        {
            return failure(error.message);
        }
    }
}
export default StoriesInterface