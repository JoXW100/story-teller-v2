import { ObjectId, Collection, Db } from "mongodb";
import { failure, success } from "./database";
import Logger from 'utils/logger';
import { isEnum } from "utils/helpers";
import { FileType } from "types/database/files";
import type { DBData, DBFile, DBFolder, DBItem, DBItemData, DBResponse, DBRoot } from "types/database";
import type { IFileMetadata, IFileStorage, IFileStructure } from "types/database/files";
import type { FileAddCopyResult, FileAddResult, FileConvertResult, FileDeleteFromResult, FileDeleteResult, FileGetManyMetadataResult, FileGetMetadataResult, FileGetResult, FileGetStructureResult, FileMoveResult, FileRenameResult, FileSetPropertyResult } from "types/database/responses";

interface StructureCollection {
    root: IFileStructure
    files: Record<string, IFileStructure>
}

class FilesInterface
{
    private collection: Collection<DBItem>;

    /** Creates a new DBRequestInterface */
    constructor(database: Db) {
        this.collection = database.collection('files');
    }

    /** Adds a file to the database */
    async add(userId: string, storyId: string, holderId: string | null, data: DBItemData): Promise<DBResponse<FileAddResult>> {
        try {
            let date = Date.now();
            let file: DBItem
            if (data.type === FileType.Folder) {
                file = {
                    _userId: userId,
                    _storyId: new ObjectId(storyId),
                    _holderId: holderId && new ObjectId(holderId),
                    type: data.type,
                    content: data.content,
                    dateCreated: date,
                    dateUpdated: date,
                } satisfies DBFolder
            } else if (data.type === FileType.Root) {
                file = {
                    _userId: userId,
                    _storyId: new ObjectId(storyId),
                    _holderId: holderId && new ObjectId(holderId),
                    type: data.type,
                    dateCreated: date,
                    dateUpdated: date,
                } satisfies DBRoot
            } else {
                file = {
                    _userId: userId,
                    _storyId: new ObjectId(storyId),
                    _holderId: holderId && new ObjectId(holderId),
                    type: data.type,
                    content: data.content,
                    metadata: data.metadata,
                    storage: data.storage,
                    dateCreated: date,
                    dateUpdated: date,
                } satisfies DBFile
            }
            let result = await this.collection.insertOne(file)
            return success(result.insertedId);
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Adds a copy of a file to the database */
    async addCopy(userId: string, storyId: string, holderId: string | null, fileId: string, name: string): Promise<DBResponse<FileAddCopyResult>> {
        try {
            let date = Date.now();
            let result = (await this.collection.aggregate([
                { $match: {
                    _userId: userId,
                    _id: new ObjectId(fileId),
                    _storyId: new ObjectId(storyId)
                }},
                { $addFields: {
                    _holderId: new ObjectId(holderId),
                    'content.name': name,
                    dateCreated: date,
                    dateUpdated: date
                }},
                { $project: { _id: 0 }},
                { $merge: {
                    into: 'files',
                    whenMatched: 'fail',
                    whenNotMatched: 'insert'
                }}
            ]).toArray())[0];
            Logger.log("files.addCopy", result);
            return success(result != null && result != undefined);
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Gets a file from the database */
    async get(userId: string, fileId: string): Promise<DBResponse<FileGetResult>> {
        try {
            let result = (await this.collection.aggregate([
                { $match: {
                    $or: [{ _userId: userId }, { 'content.metadata.public': true }],
                    _id: new ObjectId(fileId)
                }},
                { $project: {
                    _id: 0,
                    id: '$_id',
                    name: '$content.name',
                    type: '$type',
                    isOwner: { $eq: ['$_userId', userId] },
                    content: '$content',
                    metadata: { $ifNull: ['$content.metadata', {}] },
                    storage: { $ifNull: ['$content.storage', {}] }
                }},
                { $limit: 1 },
                { $project: { 'content.metadata': 0 }},
            ]).toArray())[0] as FileGetResult;
            Logger.log('files.get', `${result?.content.name}${result ? '.' + result.type : ''}`);
            return result 
                ? success(result) 
                : failure("Could not find any matching file");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Gets the metadata from a file in the database */
    async getMetadata(userId: string, fileId: string): Promise<DBResponse<FileGetMetadataResult>> {
        try {
            let result = (await this.collection.aggregate([
                { $match: {
                    $or: [ { _userId: userId}, { 'content.metadata.public': true } ],
                    _id: new ObjectId(fileId)
                }},
                { $project: {
                    _id: 0,
                    id: '$_id',
                    type: '$type',
                    metadata: '$content.metadata'
                }},
                { $limit: 1 }
            ]).toArray())[0] as FileGetMetadataResult;
            Logger.log('files.getMetadata', fileId);
            return result ? success(result) : failure("Could not find any matching file");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Gets the metadata from a file in the database */
    async getManyMetadata(userId: string, fileIds: string): Promise<DBResponse<FileGetManyMetadataResult>> {
        try {
            let ids = fileIds?.split(',').map(x => new ObjectId(x)) ?? [];
            if (ids.length < 1)
                return failure("No fileId's provided");
            let result = await this.collection.aggregate([
                { $match: {
                    $or: [ { _userId: userId}, { 'content.metadata.public': true } ],
                    _id: { $in: ids }
                }},
                { $project: {
                    _id: 0,
                    id: '$_id',
                    type: '$type',
                    metadata: '$content.metadata'
                }}
            ]).toArray() as FileGetManyMetadataResult;
            Logger.log('files.getManyMetadata', result?.length ?? 0);
            return result
                ? success(result)
                : failure("Could not find any matching file");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Removes a file from the database */
    async delete(userId: string, storyId: string, fileId: string): Promise<DBResponse<FileDeleteResult>> {
        try {
            let result = await this.collection.deleteOne({
                _id: new ObjectId(fileId),
                _userId: userId,
                _storyId: new ObjectId(storyId)
            })
            let x = result.deletedCount === 1;
            Logger.log('files.delete', x ? fileId : 'Null');
            return x ? success(x) : failure("Could not find file to delete");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Removes matching files from the database */
    async deleteFrom(userId: string, storyId: string): Promise<DBResponse<FileDeleteFromResult>> {
        try {
            let result = await this.collection.deleteMany({
                _userId: userId,
                _storyId: new ObjectId(storyId)
            })
            return success(result.deletedCount > 0);
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Changes the filename of a file in the database */
    async convert(userId: string, storyId: string, fileId: string, type: FileType): Promise<DBResponse<FileConvertResult>> {
        try {
            if (!isEnum(type, FileType)) {
                Logger.error('files.convert', type);
                return failure(`${type} is not a valid type`);
            }
            let result = await this.collection.updateOne({
                _id: new ObjectId(fileId),
                _userId: userId,
                _storyId: new ObjectId(storyId)       
            }, { 
                $set: {
                    type: type,
                    dateUpdated: Date.now()
                }
            })
            let x = result.modifiedCount === 1;
            Logger.log('files.convert', x ? type : 'Null');
            return x ? success(x) : failure("Could not find file to rename");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Changes the filename of a file in the database */
    async rename(userId: string, storyId: string, fileId: string, name: string): Promise<DBResponse<FileRenameResult>> {
        try {
            let result = await this.collection.updateOne({
                _id: new ObjectId(fileId),
                _userId: userId,
                _storyId: new ObjectId(storyId)       
            }, { 
                $set: {
                    'content.name': name,
                    dateUpdated: Date.now()
                }
            })
            let x = result.modifiedCount === 1;
            Logger.log('files.rename', x ? name : 'Null');
            return x ? success(x) : failure("Could not find file to rename");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Moves a file in the database from one holder to another */
    async move(userId: string, storyId: string, fileId: string, targetId: string): Promise<DBResponse<FileMoveResult>> {
        try {
            await this.collection.aggregate([
                { $match: { 
                    _userId: userId, 
                    _storyId: new ObjectId(storyId),
                    _id: new ObjectId(fileId) 
                } as Partial<DBData>},
                { $lookup: {
                    from: 'files',
                    pipeline: [
                        { $match: { 
                            _userId: userId,
                            _storyId: new ObjectId(storyId),
                            _id: new ObjectId(targetId)
                        } as Partial<DBData>},
                        { $limit: 1 }
                    ],
                    as: 'holder' 
                }},
                { $addFields: {
                    _holderId: { $ifNull: [{ $first: '$holder._id' }, '$_holderId']}
                }},
                { $project: { holder: 0 }},
                { $merge: {
                    into: 'files',
                    whenMatched: 'replace',
                    whenNotMatched: 'discard'
                }}
            ]).toArray()
            Logger.log('files.move', `${fileId} -> ${targetId}`);
            return success(true);
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Changes a property of a folder in the database */
    private async setDataValue(userId: string, storyId: string, fileId: string, property: string, value: any, onFolders: boolean = false): Promise<DBResponse<FileSetPropertyResult>> {
        try {
            let result = await this.collection.updateOne({ 
                _userId: userId, 
                _storyId: new ObjectId(storyId),
                _id: new ObjectId(fileId),
                type: onFolders ? FileType.Folder : { $ne: FileType.Folder }
            }, { 
                $set: {
                    [property]: value,
                    dateUpdated: Date.now()
                } 
            })
            let x = result.modifiedCount === 1;
            Logger.log('files.setProperty', x ? `${property}: ${String(value).length > 20 ? '...' : value}` : 'Null');
            return x ? success(x) : failure("Could not find file to change state");
        } catch (error) {
            return failure(error.message);
        }
    }

    /** Changes the open state of a folder in the database */
    async setOpenState(userId: string, storyId: string, fileId: string, state: boolean): Promise<DBResponse<FileSetPropertyResult>> {
        return this.setDataValue(userId, storyId, fileId, 'content.open', Boolean(state), true);
    }

    /** Changes the text content of a file in the database */
    async setText(userId: string, storyId: string, fileId: string, text: string): Promise<DBResponse<FileSetPropertyResult>> {
        return this.setDataValue(userId, storyId, fileId, 'content.text', String(text));
    }

    /** Changes the metadata of a file in the database */
    async setMetadata(userId: string, storyId: string, fileId: string, metadata: IFileMetadata): Promise<DBResponse<FileSetPropertyResult>> {
        if (typeof metadata !== typeof {})
            return failure('Expected type of metadata, object');
        return this.setDataValue(userId, storyId, fileId, 'metadata', metadata);
    }

    /** Changes the metadata of a file in the database */
    async setStorage(userId: string, storyId: string, fileId: string, storage: IFileStorage): Promise<DBResponse<FileSetPropertyResult>> {
        if (typeof storage !== typeof {})
            return failure('Expected type of storage, object');
        return this.setDataValue(userId, storyId, fileId, 'storage', storage);
    }
    
    /** Gets the file structure of story in the database */
    async getStructure(userId: string, storyId: string): Promise<DBResponse<FileGetStructureResult>> {
        try {
            let result = (await this.collection.aggregate([
                { $match: { 
                    _userId: userId,
                    _storyId: new ObjectId(storyId) 
                }},
                { $project: {
                    _id: 0,
                    id: '$_id',
                    holderId: '$_holderId',
                    type: '$type',
                    name: '$content.name',
                    open: '$content.open'
                }}
            ]).toArray()) as IFileStructure[]

            let data = result.reduce((acc, value) => (
                value.type === FileType.Root
                    ? { root: value, files: acc.files }
                    : { root: acc.root, files: { [String(value.id)]: value, ...acc.files } }
            ), { root: null, files: {} }) as StructureCollection;

            Object.values(data.files).forEach((file) => {
                let holder = data.files[String(file.holderId)] ?? data.root;
                holder.children = [file, ...holder.children ?? []]
            })
            
            Logger.log("files.getStructure", result.length)
            return success(data.root.children ?? []);
        } catch (error) {
            Logger.throw("FilesInterface.getStructure", error)
            return failure(error.message);
        }
    }
}

export default FilesInterface