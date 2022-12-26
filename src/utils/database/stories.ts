import { ObjectId, Collection, Db } from "mongodb";
import Database, { failure, success } from "./database";
import { DBResponse } from "types/database";
import { DBStory, DBStoryUpdate, StoryAddResult, StoryDeleteResult, StoryGetAllResult, StoryGetResult, StoryUpdateResult } from "types/database/stories";
import { FileType } from "types/database/files";


class StoriesInterface
{
    private collection: Collection;

    constructor(database: Db) {
        this.collection = database.collection('stories');
    }

    /**
     * Adds a story to the database
     * @param {string} userId The id of the user
     * @param {string} name The name of the story to add
     * @param {string} desc The description of the story to add
     * @returns {Promise<DBResponse<ObjectId>>} The id of the story inside the database
     */
    async add(userId: string, name: string, desc: string): Promise<DBResponse<StoryAddResult>> {
        try {
            let request: DBStory = {
                _userId: userId,
                name: name,
                desc: desc,
                dateCreated: Date.now(),
                dateUpdated: Date.now()
            }

            let result = await this.collection.insertOne(request);
            try {
                let response = await Database.files.add(userId, String(result.insertedId), null, FileType.Root, {
                    name: "",
                    metadata: {}
                })
                Database.log('stories.add', response.success ? result.insertedId : 'Null');
                if (response.success)
                    return success(result.insertedId)
                throw new Error("Failed inserting root file")
            } catch (error) {
                this.collection.deleteOne({_id: result.insertedId })
                return failure(error.message)
            }
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Gets a story from the database */
    async get(userId: string, storyId: string): Promise<DBResponse<StoryGetResult>> {
        try {
            let result = (await this.collection.aggregate([
                { $match: { _userId: userId, _id: new ObjectId(storyId) }},
                { $lookup: {
                    from: 'files',
                    pipeline: [
                        { $match: { 
                            _userId: userId,
                            _storyId: new ObjectId(storyId),
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
            ]).toArray())[0] as StoryGetResult
            Database.log('stories.get', result ? result.name : 'Null');
            return success(result);
        } catch (error) {
            Database.log('stories.get', 'Null');
            return failure(error.message);
        }
    }

    /** Deletes a story from the database */
    async delete(userId: string, storyId: string): Promise<DBResponse<StoryDeleteResult>> {
        try {
            let filter = { _userId: userId, _id: new ObjectId(storyId) }
            let result = await this.collection.deleteOne(filter)
            let removed = result.deletedCount === 1
            Database.log('stories.delete', removed ? storyId : 'Null');
            if (removed) {
                let res = await Database.files.deleteFrom(userId, storyId)
                if (!res.success)
                    Database.log('stories.delete', "Failed removing files of removed story: " + storyId)
            }
            return success(removed as StoryDeleteResult);
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Updates a story */
    async update(userId: string, storyId: string, update: DBStoryUpdate): Promise<DBResponse<StoryUpdateResult>> {
        try {
            let filter = { _userId: userId, _id: new ObjectId(storyId) }
            let values: any = { $set: { dateUpdated: Date.now()} }
            if (update.name)
                values.$set.name = update.name
            if (update.desc)
                values.$set.desc = update.desc
            let result = await this.collection.updateOne(filter, values)
            let updated = result.upsertedCount > 0
            Database.log('stories.update', updated ? storyId : 'Null');
            return updated
                ? success(updated)
                : failure(updated)
        } catch (error) {
            return failure(error.message);
        }
    }
    
    /** Gets all stories from the database */
    async getAll(userId: string): Promise<DBResponse<StoryGetAllResult>> {
        try {
            let result = await this.collection.find({ _userId: userId }).toArray() as StoryGetAllResult;
            Database.log('stories.getAll', result.length);
            return success(result);
        } catch (error) {
            return failure(error.message);
        }
    }
}
export default StoriesInterface