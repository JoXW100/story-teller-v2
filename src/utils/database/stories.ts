import { ObjectId, Collection, Db } from "mongodb";
import Database, { failure, success } from "./database";
import Logger from "utils/logger";
import { DBResponse, DBRoot } from "types/database";
import { DBStory, DBStoryUpdate, IStory, IStoryData } from "types/database/stories";
import { FileType, IRootData } from "types/database/files";
import { StoryAddResult, StoryGetResult, StoryDeleteResult, StoryUpdateResult, StoryGetAllResult } from "types/database/responses";
import { KeysOf, KeysOfTwo } from "types";

class StoriesInterface
{
    private collection: Collection;

    constructor(database: Db) {
        this.collection = database.collection('stories');
    }

    /** Adds a story to the database */
    async add(userId: string, name: string, desc: string): Promise<DBResponse<StoryAddResult>> {
        try {
            let request: Omit<DBStory, '_id'> = {
                _userId: userId,
                name: name,
                desc: desc,
                dateCreated: Date.now(),
                dateUpdated: Date.now()
            }

            let result = await this.collection.insertOne(request);
            try {
                let response = await Database.files.add(userId, String(result.insertedId), null, {
                    type: FileType.Root
                } satisfies IRootData)
                Logger.log('stories.add', response.success ? result.insertedId : 'Null');
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
            let result = (await this.collection.aggregate<StoryGetResult>([
                { $match: { _userId: userId, _id: new ObjectId(storyId) }},
                { $lookup: {
                    from: 'files',
                    pipeline: [
                        { $match: { 
                            _userId: userId,
                            _storyId: new ObjectId(storyId),
                            type: FileType.Root
                        } satisfies Partial<DBRoot>},
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
                } satisfies KeysOfTwo<IStoryData, DBStory> },
                { $limit: 1 }
            ]).toArray())[0]
            Logger.log('stories.get', result ? result.name : 'Null');
            return success(result);
        } catch (error) {
            Logger.log('stories.get', 'Null');
            return failure(error.message);
        }
    }

    /** Deletes a story from the database */
    async delete(userId: string, storyId: string): Promise<DBResponse<StoryDeleteResult>> {
        try {
            let filter = { 
                _userId: userId, 
                _id: new ObjectId(storyId) 
            } satisfies Partial<DBStory>
            let result = await this.collection.deleteOne(filter)
            let removed = result.deletedCount === 1
            Logger.log('stories.delete', removed ? storyId : 'Null');
            if (removed) {
                let res = await Database.files.deleteFrom(userId, storyId)
                if (!res.success)
                Logger.error('stories.delete', "Failed removing files of removed story: " + storyId)
            }
            return success(removed);
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Updates a story */
    async update(userId: string, storyId: string, update: DBStoryUpdate): Promise<DBResponse<StoryUpdateResult>> {
        try {
            let filter = { 
                _userId: userId, 
                _id: new ObjectId(storyId) 
            } satisfies Partial<DBStory>
            let value = { 
                $set: { 
                    name: update.name ?? "",
                    desc: update.desc ?? "",
                    dateUpdated: Date.now()
                } satisfies Partial<KeysOf<DBStory>>
            }
            let result = await this.collection.updateOne(filter, value)
            let updated = result.upsertedCount > 0
            Logger.log('stories.update', updated ? storyId : 'Null');
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
            let result = (await this.collection.aggregate<IStory>([
                { $match: { 
                    _userId: userId 
                } satisfies Partial<DBStory>},
                { $project: { 
                    _id: 0,
                    id: '$_id',
                    name: '$name',
                    desc: '$desc', 
                    dateCreated: '$dateCreated',
                    dateUpdated: '$dateUpdated'
                } satisfies KeysOfTwo<IStory, DBStory>}
            ]).toArray())
            Logger.log('stories.getAll', result.length);
            return success(result);
        } catch (error) {
            return failure(error.message);
        }
    }
}
export default StoriesInterface