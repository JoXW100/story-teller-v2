import { ObjectId } from "mongodb";
import { failure, success } from "./functions";
import { FileType } from "@types/database";
import "@types/database";

class FilesInterface
{
    /** @type {import('mongodb').Collection} @private */
    #collection;

    /**
     * Creates a new DBRequestInterface
     * @constructor
     * @param {import('mongodb').Db} database The database to use
     */
    constructor(database) {
        this.#collection = database.collection('files');
    }

    /**
     * Adds a file to the database
     * @param {string} userId The id of the user
     * @param {string} storyId The story that holds the file
     * @param {string} holderId The file that holds the file
     * @param {FileType} type The type of the file to add
     * @param {Object<string, *>} content The stating content of the file
     * @returns {Promise<import('@types/database').DBResponse<ObjectId>>}
     */
    async add(userId, storyId, holderId, type, content = {}) {
        try
        {
            let date = Date.now();
            let result = await this.#collection.insertOne({
                _userId: userId,
                _storyId: ObjectId(storyId),
                _holderId: holderId && ObjectId(holderId),
                type: type,
                content: content,
                dateCreated: date,
                dateUpdated: date
            })
            return success(result.insertedId);
        }
        catch (error)
        {
            return failure(error.message);
        }
    }

    /**
     * Adds a file to the database
     * @param {string} storyId The id of the story
     * @param {string} userId The id of the user
     * @param {string} fileId The story that holds the file
     * @returns {Promise<import('@types/database').DBResponse<import('@types/database').File<?>>>}
     */
    async get(userId, storyId, fileId) {
        console.log("GET", userId, storyId, fileId);
        try
        {
            let result = (await this.#collection.aggregate([
                { $match: {
                    _userId: userId,
                    _storyId: ObjectId(storyId),
                    _id: ObjectId(fileId)
                }},
                { $project: {
                    _id: 0,
                    id: '$_id',
                    name: '$content.name',
                    type: '$type',
                    content: '$content'
                }},
                { $limit: 1 }
            ]).toArray())[0];
            console.log(`Get File: => ${result?.name}.${result?.type}`);
            return result ? success(result) : failure("Could not find any matching file");
        }
        catch (error)
        {
            return failure(error.message);
        }
    }

    /**
     * Removes a file from the database
     * @param {string} userId The id of the user
     * @param {string} storyId The id of the story
     * @param {string} fileId The id of the file
     * @returns {Promise<import('@types/database').DBResponse<boolean>>}
     */
    async delete(userId, storyId, fileId) {
        try
        {
            let result = await this.#collection.deleteOne({
                _userId: userId,
                _storyId: ObjectId(storyId),
                _id: ObjectId(fileId)
            });
            var x = result.deletedCount === 1;
            console.log(`Delete File: => ${x}`);
            return x ? success(x) : failure("Could not find file to delete");
        }
        catch (error)
        {
            return failure(error.message);
        }
    }

    /**
     * Removes matching files from the database
     * @param {string} userId The id of the user
     * @param {string} storyId The id of the story
     * @returns {Promise<import('@types/database').DBResponse<boolean>>}
     */
    async deleteFrom(userId, storyId) {
        try
        {
            let result = await this.#collection.deleteMany({
                _userId: userId,
                _storyId: ObjectId(storyId)
            })
            return success(result.deletedCount > 0);
        }
        catch (error)
        {
            return failure(error.message);
        }
    }

    /**
     * Changes the filename of a file in the database
     * @param {string} userId The id of the user
     * @param {string} storyId The id of the story
     * @param {string} fileId The id of the file
     * @param {string} name The new name of the file
     * @returns {Promise<import('@types/database').DBResponse<boolean>>}
     */
    async rename(userId, storyId, fileId, name) {
        try
        {
            let result = await this.#collection.updateOne({
                _userId: userId,
                _storyId: ObjectId(storyId),
                _id: ObjectId(fileId)                
            }, { 
                $set: {
                    'content.name': name,
                    dateUpdated: Date.now()
                }
            })
            var x = result.modifiedCount === 1;
            console.log(`Rename File: => ${x && name}`);
            return x ? success(x) : failure("Could not find file to rename");
        }
        catch (error)
        {
            return failure(error.message);
        }
    }

    /**
     * Moves a file in the database from one holder to another
     * @param {string} userId The id of the user
     * @param {string} storyId The id of the story
     * @param {string} fileId The id of the file
     * @param {string} targetId The id of the new holder file
     * @returns {Promise<import('@types/database').DBResponse<boolean>>}
     */
    async move(userId, storyId, fileId, targetId) {
        try
        {
            console.log("move", storyId, fileId, targetId);
            await this.#collection.aggregate([
                { $match: { 
                    _userId: userId, 
                    _storyId: ObjectId(storyId),
                    _id: ObjectId(fileId) 
                }},
                { $lookup: {
                    from: 'files',
                    pipeline: [
                        { $match: { 
                            _userId: userId,
                            _storyId: ObjectId(storyId),
                            _id: ObjectId(targetId)
                        }},
                        { $limit: 1 }
                    ],
                    as: 'holder' 
                }},
                { $addFields: {
                    _holderId: { $ifNull: [{ $first: '$holder._id' }, '$_holderId']}
                }}, 
                { $merge: {
                    into: 'files',
                    whenMatched: 'replace',
                    whenNotMatched: 'discard'
                }}
            ]).toArray()
            return success(true);
        }
        catch (error)
        {
            return failure(error.message);
        }
    }

    /**
     * Changes the open state of a folder in the database
     * @param {string} userId The id of the user
     * @param {string} storyId The id of the story
     * @param {string} fileId The id of the folder
     * @param {bool} state The new state of the folder
     * @returns {Promise<import('@types/database').DBResponse<boolean>>}
     */
    async setOpenState(userId, storyId, fileId, state) {
        try
        {
            let result = await this.#collection.updateOne({
                _userId: userId,
                _storyId: ObjectId(storyId),
                _id: ObjectId(fileId),
                type: "folder"           
            }, { 
                $set: {
                    'content.open': Boolean(state)
                }
            })
            var x = result.modifiedCount === 1;
            return x ? success(x) : failure("Could not find file to change state");
        }
        catch (error)
        {
            return failure(error.message);
        }
    }

    /**
     * Changes the text content of a file in the database
     * @param {string} userId The id of the user
     * @param {string} storyId The id of the story
     * @param {string} fileId The id of the file
     * @param {string} text The new text
     * @returns {Promise<import('@types/database').DBResponse<boolean>>}
     */
     async setText(userId, storyId, fileId, text) {
        try
        {
            let result = await this.#collection.updateOne({
                _userId: userId,
                _storyId: ObjectId(storyId),
                _id: ObjectId(fileId),
                type: { $not: /folder/ }  
            }, { 
                $set: {
                    'content.text': String(text),
                    dateUpdated: Date.now()
                }
            })
            var x = result.modifiedCount === 1;
            return x ? success(x) : failure("Could not find file to set text");
        }
        catch (error)
        {
            return failure(error.message);
        }
    }
    

    /**
     * Gets the file structure of story in the database
     * @param {string} userId The id of the user
     * @param {string} storyId The story that holds the files
     * @returns {Promise<import('@types/database').DBResponse<import('@types/database').StructureFile>>} The id of the file
     */
    async getStructure(userId, storyId) {
        try
        {
            let result = (await this.#collection.aggregate([
                { $match: { 
                    _userId: userId,
                    _storyId: ObjectId(storyId) 
                }},
                { $project: {
                    _id: 0,
                    id: '$_id',
                    holderId: '$_holderId',
                    type: '$type',
                    name: '$content.name',
                    open: '$content.open'
                }}
            ]).toArray())

            let data = result.reduce((acc, value) => (
                { ...acc, [value.holderId]: acc[value.holderId] 
                    ? [...(acc[value.holderId]), value]
                    : [value] 
                }
            ), {})
            
            const build = (value, data) => {
                value.children = data[value.id]?.map((value) => build(value, data) )
                return value
            }

            return success(build(data.null[0], data).children);
        }
        catch (error)
        {
            return failure(error.message);
        }
    }
}
export default FilesInterface